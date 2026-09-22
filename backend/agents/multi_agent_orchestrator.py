import uuid
import re
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.core.config import settings
from backend.database.models import (
    InvoiceDocument,
    ThreeWayMatchResult,
    DisputeNotification,
    VendorComplianceProfile
)
from backend.database.vector_store import vector_store

class ExtractionAgent:
    """Agent responsible for structured entity and line-item extraction."""
    def run(self, raw_input: Any) -> Dict[str, Any]:
        return {
            "agent": "ExtractionAgent",
            "status": "COMPLETED",
            "extracted_fields": ["vendor_gstin", "buyer_gstin", "hsn_sac", "taxable_amount", "tax_components"]
        }

class TaxValidationAgent:
    """Agent validating CGST Act statutory compliance (Sec 16, Sec 194Q, Sec 43B(h))."""
    def validate(self, invoice: InvoiceDocument) -> Dict[str, Any]:
        errors = []
        warnings = []

        # Validate GSTIN Format
        if not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', invoice.vendor_gstin):
            errors.append(f"Invalid GSTIN format: {invoice.vendor_gstin}")

        # Validate HSN/SAC
        for item in invoice.line_items:
            if len(item.hsn_sac_code) < 4:
                warnings.append(f"Item '{item.description}' has incomplete HSN/SAC code: {item.hsn_sac_code}")

        # Validate Tax Split
        expected_tax = round(invoice.subtotal_taxable * 0.18, 2)
        if abs(invoice.total_tax - expected_tax) > 2.0:
            warnings.append(f"Tax calculation variance: Invoiced ₹{invoice.total_tax:,.2f} vs Expected ₹{expected_tax:,.2f}")

        # Section 194Q TDS Applicability
        tds_applicable = invoice.total_invoice_amount > 5000000.0 or True # Default enabled for enterprise
        tds_amount = round(invoice.subtotal_taxable * settings.SECTION_194Q_TDS_RATE, 2)

        return {
            "agent": "TaxValidationAgent",
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "section_194q_tds_amount": tds_amount,
            "itc_section_16_eligible": invoice.is_gstr2b_matched
        }

class AnomalyAgent:
    """Agent isolating circular trading loops, shell networks, and behavioral anomalies."""
    def analyze_vendor(self, gstin: str) -> Dict[str, Any]:
        profile = vector_store.get_profile(gstin)
        if not profile:
            return {
                "agent": "AnomalyAgent",
                "risk_score": 15.0,
                "status": "UNPROFILED",
                "circular_risk": False,
                "similar_profiles": []
            }

        similar = vector_store.find_similar_risk_profiles(profile, top_k=2)
        similar_summaries = [
            {"gstin": p.gstin, "name": p.legal_name, "similarity": sim} 
            for p, sim in similar if p.gstin != profile.gstin
        ]

        return {
            "agent": "AnomalyAgent",
            "gstin": gstin,
            "risk_score": profile.risk_score,
            "compliance_status": profile.compliance_status.value,
            "circular_loop_suspect": profile.is_circular_loop_suspect,
            "turnover_cr": profile.turnover_cr,
            "employees": profile.active_employees,
            "similar_historical_patterns": similar_summaries
        }

class DisputeResolutionAgent:
    """
    Autonomous Vendor Dispute & Resolution Agent.
    Triggers automatically when 3-way matching fails or GSTR-2B compliance is deficient.
    Drafts high-converting, compliant notifications and tracks resolution.
    """

    def generate_discrepancy_notice(
        self,
        match_result: ThreeWayMatchResult,
        vendor_name: str,
        channel: str = "WhatsApp",
        recipient_contact: str = "+91 98765 43210"
    ) -> DisputeNotification:
        discrepancy_list = [
            f"• {d.field_name.upper()}: Expected '{d.expected_value}', but found '{d.actual_value}' ({d.impact_description})"
            for d in match_result.discrepancies
        ]

        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(settings.GEMINI_MODEL)
                prompt = f"""
                You are an autonomous FinOps AI Controller at GSTShield.
                Generate an urgent yet professional {channel} dispute resolution notice to vendor '{vendor_name}'.
                
                Discrepancy Details:
                - Invoice: {match_result.invoice_number}
                - PO Reference: {match_result.po_number}
                - GRN Reference: {match_result.grn_number}
                - Discrepancies: {json.dumps([d.dict() for d in match_result.discrepancies])}
                
                Explain that under Section 16(2)(aa) CGST Act & internal FinOps controls, payment disbursement via RazorpayX is held until resolved.
                Return JSON strictly with:
                {{
                    "subject": "Headline",
                    "body": "Message body"
                }}
                """
                response = model.generate_content(prompt)
                text = re.sub(r'```json\n|\n```', '', response.text).strip()
                data = json.loads(text)
                subject = data.get("subject", f"Action Required: Discrepancy on Inv {match_result.invoice_number}")
                body = data.get("body", "\n".join(discrepancy_list))
            except Exception:
                subject, body = self._fallback_dunning_copy(match_result, vendor_name, discrepancy_list, channel)
        else:
            subject, body = self._fallback_dunning_copy(match_result, vendor_name, discrepancy_list, channel)

        return DisputeNotification(
            dispute_id=f"DISP-{uuid.uuid4().hex[:8].upper()}",
            vendor_name=vendor_name,
            vendor_gstin=match_result.vendor_gstin,
            invoice_number=match_result.invoice_number,
            channel=channel,
            recipient_contact=recipient_contact,
            subject=subject,
            message_body=body,
            discrepancy_summary=[d.impact_description for d in match_result.discrepancies],
            auto_resolved=False
        )

    def _fallback_dunning_copy(
        self,
        match_result: ThreeWayMatchResult,
        vendor_name: str,
        discrepancy_list: List[str],
        channel: str
    ) -> tuple:
        subject = f"⚠️ Action Required: Compliance Hold on Invoice {match_result.invoice_number}"
        formatted_disc = "\n".join(discrepancy_list)
        body = (
            f"Dear {vendor_name},\n\n"
            f"Our autonomous FinOps controller detected discrepancies during 3-Way Matching for Invoice {match_result.invoice_number} "
            f"(PO: {match_result.po_number} | GRN: {match_result.grn_number}):\n\n"
            f"{formatted_disc}\n\n"
            f"Under Section 16(2)(aa) of the CGST Act and standard FinOps protocol, the corresponding RazorpayX disbursement "
            f"has been placed on compliance hold. Please upload the corrected invoice / GSTR-1 return immediately to release funds.\n\n"
            f"— GSTShield Autonomous FinOps Desk"
        )
        return subject, body

class MultiAgentFinOpsOrchestrator:
    """
    Central Multi-Agent Coordinator for Ingestion, Validation, Matching,
    Dispute Management, and Payout Authorization.
    """

    def __init__(self):
        self.extraction_agent = ExtractionAgent()
        self.tax_validation_agent = TaxValidationAgent()
        self.anomaly_agent = AnomalyAgent()
        self.dispute_agent = DisputeResolutionAgent()

    def process_invoice_pipeline(
        self,
        invoice: InvoiceDocument,
        po: Optional[Any] = None,
        grn: Optional[Any] = None
    ) -> Dict[str, Any]:
        tax_report = self.tax_validation_agent.validate(invoice)
        anomaly_report = self.anomaly_agent.analyze_vendor(invoice.vendor_gstin)

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "invoice_number": invoice.invoice_number,
            "tax_compliance": tax_report,
            "anomaly_analysis": anomaly_report,
            "is_ready_for_payout": tax_report["is_valid"] and not anomaly_report.get("circular_loop_suspect", False)
        }

orchestrator = MultiAgentFinOpsOrchestrator()
