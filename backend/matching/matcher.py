from typing import List, Optional
from datetime import datetime
from backend.core.config import settings
from backend.database.models import (
    InvoiceDocument, 
    PurchaseOrder, 
    GoodsReceivedNote, 
    ThreeWayMatchResult, 
    ThreeWayMatchDiscrepancy,
    ComplianceStatus
)
from backend.database.vector_store import vector_store

class ThreeWayMatchingEngine:
    """
    Real-Time 3-Way Matching & Anomaly Detection Engine.
    Cross-references PO, GRN, and Vendor Tax Invoice / GSTR-2B filings.
    """

    def match(
        self,
        invoice: InvoiceDocument,
        po: PurchaseOrder,
        grn: GoodsReceivedNote,
        gstr2b_present: bool = True
    ) -> ThreeWayMatchResult:
        discrepancies: List[ThreeWayMatchDiscrepancy] = []
        confidence_points = 100.0

        # 1. Vendor Identity Verification
        if invoice.vendor_gstin.upper() != po.vendor_gstin.upper():
            discrepancies.append(ThreeWayMatchDiscrepancy(
                field_name="vendor_gstin",
                expected_value=po.vendor_gstin,
                actual_value=invoice.vendor_gstin,
                severity="CRITICAL",
                impact_description="Vendor GSTIN mismatch between Invoice and Purchase Order."
            ))
            confidence_points -= 40.0

        # 2. Total Taxable / Invoice Amount Verification
        po_total = po.total_po_amount
        inv_total = invoice.total_invoice_amount
        price_diff = abs(inv_total - po_total)
        price_diff_percent = (price_diff / po_total) if po_total > 0 else 1.0

        if price_diff_percent > 0.01:  # Greater than 1% variance
            discrepancies.append(ThreeWayMatchDiscrepancy(
                field_name="total_invoice_amount",
                expected_value=po_total,
                actual_value=inv_total,
                severity="MAJOR" if price_diff_percent < 0.10 else "CRITICAL",
                impact_description=f"Invoice total ₹{inv_total:,.2f} exceeds PO agreed value ₹{po_total:,.2f} by {price_diff_percent*100:.1f}%."
            ))
            confidence_points -= min(30.0, price_diff_percent * 100)

        # 3. Goods Received Note (GRN) Quantity Cross-Check
        total_po_qty = sum(item.quantity for item in po.line_items)
        total_grn_received_qty = sum(item.get("quantity_received", 0.0) for item in grn.line_items_received)
        total_grn_rejected_qty = sum(item.get("quantity_rejected", 0.0) for item in grn.line_items_received)
        total_inv_qty = sum(item.quantity for item in invoice.line_items)

        accepted_qty = total_grn_received_qty - total_grn_rejected_qty

        if total_inv_qty > accepted_qty + (total_po_qty * settings.MATCHING_QUANTITY_TOLERANCE):
            discrepancies.append(ThreeWayMatchDiscrepancy(
                field_name="billed_quantity",
                expected_value=accepted_qty,
                actual_value=total_inv_qty,
                severity="MAJOR",
                impact_description=f"Invoiced quantity ({total_inv_qty}) exceeds physically accepted GRN quantity ({accepted_qty})."
            ))
            confidence_points -= 25.0

        # 4. GSTR-2B Statutory Match (Section 16(2)(aa) CGST Act)
        if not gstr2b_present:
            discrepancies.append(ThreeWayMatchDiscrepancy(
                field_name="gstr_2b_filing",
                expected_value="Filed & Reflected in GSTR-2B",
                actual_value="Missing in GSTR-2B",
                severity="CRITICAL",
                impact_description="ITC blocked under Section 16(2)(aa). Vendor has not uploaded invoice in GSTR-1."
            ))
            confidence_points -= 35.0

        # 5. Historical Vendor Profile Risk Lookup
        vendor_profile = vector_store.get_profile(invoice.vendor_gstin)
        vendor_risk = vendor_profile.risk_score if vendor_profile else 20.0
        if vendor_profile and vendor_profile.is_circular_loop_suspect:
            discrepancies.append(ThreeWayMatchDiscrepancy(
                field_name="fraud_network_flag",
                expected_value="Clean Graph",
                actual_value="Circular Loop Suspect",
                severity="CRITICAL",
                impact_description="High-risk circular trading pattern detected by graph vector classifier."
            ))
            confidence_points -= 50.0

        is_matched = len(discrepancies) == 0
        final_confidence = max(0.0, min(100.0, confidence_points))
        risk_score = round(100.0 - final_confidence, 1)

        # Determine Recommendation
        if is_matched and gstr2b_present:
            recommended_action = "AUTO_APPROVE_PAYOUT: 3-way match verified with 100% GSTR-2B ITC reflection."
        elif not gstr2b_present:
            recommended_action = "WITHHOLD_GST_BUFFER: Hold 18% GST portion until vendor files GSTR-1."
        elif any(d.severity == "CRITICAL" for d in discrepancies):
            recommended_action = "HARD_BLOCK_PAYOUT: Severe PO/GRN mismatch or shell syndicate flag detected."
        else:
            recommended_action = "ROUTE_TO_DISPUTE_AGENT: Send automated line-item discrepancy notice to vendor."

        return ThreeWayMatchResult(
            match_id=f"M3W-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            invoice_number=invoice.invoice_number,
            po_number=po.po_number,
            grn_number=grn.grn_number,
            vendor_gstin=invoice.vendor_gstin,
            is_matched=is_matched,
            confidence_score=final_confidence,
            discrepancies=discrepancies,
            gstr2b_verified=gstr2b_present,
            itc_eligible=gstr2b_present and is_matched,
            risk_score=risk_score,
            recommended_action=recommended_action
        )

matching_engine = ThreeWayMatchingEngine()
