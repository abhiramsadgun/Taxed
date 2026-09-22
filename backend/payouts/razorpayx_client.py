import uuid
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional
import httpx
from backend.core.config import settings
from backend.database.models import (
    InvoiceDocument,
    RazorpayXPayoutRecord,
    PayoutStatus,
    ComplianceStatus,
    MSMEClassification
)
from backend.database.vector_store import vector_store

class RazorpayXClient:
    """
    RazorpayX FinOps & Payout Gateway Client.
    Implements compliance-gated 'Verify-Before-Pay' escrow & automated disbursements.
    """

    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.account_number = settings.RAZORPAY_ACCOUNT_NUMBER
        self.is_sandbox = settings.IS_SANDBOX_MODE

    def evaluate_and_gate_payout(
        self,
        invoice: InvoiceDocument,
        is_gstr2b_matched: bool = True,
        override_hold: bool = False
    ) -> RazorpayXPayoutRecord:
        """
        Compliance gate evaluation:
        1. Deducts Section 194Q TDS (0.1% of taxable base)
        2. Withholds GST portion if missing in GSTR-2B (Rule 36(4))
        3. Enforces Section 43B(h) MSME 45-day deadline
        4. Freezes disbursement if vendor is flagged as high-risk shell syndicate
        """
        vendor_profile = vector_store.get_profile(invoice.vendor_gstin)

        # 1. Section 194Q TDS Calculation (0.1% TDS on taxable value)
        tds_amount = round(invoice.subtotal_taxable * settings.SECTION_194Q_TDS_RATE, 2)

        # 2. GST Withholding Buffer (if GSTR-2B missing, hold tax portion)
        gst_withholding = 0.0
        hold_reason = None
        status = PayoutStatus.QUEUED

        if not is_gstr2b_matched and not override_hold:
            gst_withholding = invoice.total_tax
            status = PayoutStatus.COMPLIANCE_HOLD
            hold_reason = "GST_WITHHELD_GSTR2B_PENDING: Section 16(2)(aa) ITC buffer held until GSTR-1 reflection."

        # 3. Fraud / Circular Trading Hard Block Check
        if vendor_profile and vendor_profile.compliance_status == ComplianceStatus.HARD_BLOCKED and not override_hold:
            status = PayoutStatus.REJECTED
            hold_reason = "FRAUD_HARD_BLOCK: Suspected Circular Trading / Shell syndicate detected under Section 132."

        # 4. Net Vendor Disbursement
        net_disbursement = round(invoice.total_invoice_amount - tds_amount - gst_withholding, 2)

        # 5. MSME SLA calculation
        sla_days = settings.MSME_PAYMENT_SLA_DAYS if (vendor_profile and vendor_profile.msme_type != MSMEClassification.NON_MSME) else 30
        msme_deadline = invoice.invoice_date + timedelta(days=sla_days)

        payout_id = f"pout_{uuid.uuid4().hex[:10]}"

        return RazorpayXPayoutRecord(
            payout_id=payout_id,
            invoice_number=invoice.invoice_number,
            vendor_name=invoice.vendor_name,
            vendor_gstin=invoice.vendor_gstin,
            gross_invoice_amount=invoice.total_invoice_amount,
            section_194q_tds_amount=tds_amount,
            gst_withholding_buffer=gst_withholding,
            net_disbursement_amount=net_disbursement,
            payout_status=status,
            razorpay_account_number=self.account_number,
            compliance_hold_reason=hold_reason,
            msme_sla_deadline=msme_deadline
        )

    async def execute_payout(self, payout: RazorpayXPayoutRecord) -> Dict[str, Any]:
        """
        Executes real disbursement via RazorpayX Payout API or simulated sandbox.
        """
        if payout.payout_status == PayoutStatus.COMPLIANCE_HOLD or payout.payout_status == PayoutStatus.REJECTED:
            return {
                "success": False,
                "payout_id": payout.payout_id,
                "status": payout.payout_status.value,
                "message": f"Disbursement blocked by GSTShield: {payout.compliance_hold_reason}"
            }

        # Simulated Sandbox Execution
        if self.is_sandbox or not self.key_id.startswith("rzp_live"):
            utr = f"RZPX{datetime.now().strftime('%Y%m%d%H%M')}{uuid.uuid4().hex[:4].upper()}"
            payout.payout_status = PayoutStatus.PROCESSED
            payout.utr_number = utr
            payout.processed_at = datetime.utcnow()
            return {
                "success": True,
                "payout_id": payout.payout_id,
                "utr": utr,
                "status": "PROCESSED",
                "net_amount": payout.net_disbursement_amount,
                "tds_deducted": payout.section_194q_tds_amount,
                "message": f"Successfully disbursed ₹{payout.net_disbursement_amount:,.2f} via RazorpayX. UTR: {utr}"
            }

        # Live RazorpayX API Execution via httpx
        try:
            async with httpx.AsyncClient() as client:
                url = f"{settings.RAZORPAY_BASE_URL}/payouts"
                payload = {
                    "account_number": self.account_number,
                    "amount": int(payout.net_disbursement_amount * 100),  # in paise
                    "currency": "INR",
                    "mode": "NEFT",
                    "purpose": "vendor_payout",
                    "fund_account": {
                        "account_type": "bank_account",
                        "bank_account": {
                            "name": payout.vendor_name,
                            "ifsc": "HDFC0000001",
                            "account_number": "9876543210123"
                        },
                        "contact": {
                            "name": payout.vendor_name,
                            "type": "vendor",
                            "reference_id": payout.vendor_gstin
                        }
                    },
                    "reference_id": payout.invoice_number,
                    "narration": f"GSTShield Net Payout {payout.invoice_number}"
                }
                response = await client.post(
                    url,
                    json=payload,
                    auth=(self.key_id, self.key_secret),
                    timeout=10.0
                )
                if response.status_code in [200, 201]:
                    res_data = response.json()
                    utr = res_data.get("utr", f"RZP{uuid.uuid4().hex[:8].upper()}")
                    payout.payout_status = PayoutStatus.PROCESSED
                    payout.utr_number = utr
                    payout.processed_at = datetime.utcnow()
                    return {
                        "success": True,
                        "payout_id": res_data.get("id", payout.payout_id),
                        "utr": utr,
                        "status": "PROCESSED",
                        "net_amount": payout.net_disbursement_amount,
                        "message": f"Live RazorpayX payout executed with UTR: {utr}"
                    }
                else:
                    return {
                        "success": False,
                        "status": "FAILED",
                        "message": f"RazorpayX API error: {response.text}"
                    }
        except Exception as e:
            return {
                "success": False,
                "status": "ERROR",
                "message": f"Failed to execute RazorpayX payout: {str(e)}"
            }

    def generate_smart_collect_qr(self, invoice_number: str, amount: float, vendor_gstin: str) -> Dict[str, Any]:
        """
        Generates Razorpay Smart Collect dynamic UPI QR & virtual account parameters.
        """
        qr_string = f"upi://pay?pa=gstshield.smartcollect@razorpay&pn=TechSolutions&am={amount:.2f}&tr={invoice_number}&gstin={vendor_gstin}"
        virtual_account_id = f"va_{uuid.uuid4().hex[:8]}"
        return {
            "virtual_account_id": virtual_account_id,
            "invoice_number": invoice_number,
            "amount": amount,
            "qr_payload": qr_string,
            "status": "ACTIVE",
            "auto_reconcile_enabled": True
        }

razorpayx_client = RazorpayXClient()
