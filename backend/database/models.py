from datetime import datetime, date
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class MSMEClassification(str, Enum):
    MICRO = "Micro"
    SMALL = "Small"
    MEDIUM = "Medium"
    NON_MSME = "Non-MSME"

class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    WARNING = "WARNING"
    DEFICIENT = "DEFICIENT"
    HARD_BLOCKED = "HARD_BLOCKED"

class PayoutStatus(str, Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    COMPLIANCE_HOLD = "COMPLIANCE_HOLD"
    QUEUED = "QUEUED"
    PROCESSED = "PROCESSED"
    REJECTED = "REJECTED"

class LineItem(BaseModel):
    item_id: Optional[str] = None
    description: str
    hsn_sac_code: str
    quantity: float
    unit_rate: float
    taxable_value: float
    gst_rate_percent: float
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    total_amount: float

class PurchaseOrder(BaseModel):
    po_number: str
    vendor_gstin: str
    vendor_name: str
    issue_date: date
    line_items: List[LineItem]
    total_po_amount: float
    payment_terms_days: int = 30
    is_active: bool = True

class GoodsReceivedNote(BaseModel):
    grn_number: str
    po_reference: str
    received_date: date
    vendor_gstin: str
    line_items_received: List[Dict[str, Any]]  # {'description': str, 'quantity_received': float, 'quantity_rejected': float}
    warehouse_gate_pass: Optional[str] = None
    inspected_by: str = "Automated Gate Vision Agent"

class InvoiceDocument(BaseModel):
    invoice_number: str
    vendor_name: str
    vendor_gstin: str
    buyer_gstin: str = "27AADCB2230M1Z2"
    invoice_date: date
    irn_hash: Optional[str] = None
    qr_code_present: bool = True
    line_items: List[LineItem] = []
    subtotal_taxable: float
    total_tax: float
    total_invoice_amount: float
    hsn_summary: Dict[str, float] = {}
    is_gstr2b_matched: bool = False
    gstr2b_filing_date: Optional[date] = None

class VendorComplianceProfile(BaseModel):
    gstin: str
    legal_name: str
    trade_name: Optional[str] = None
    msme_type: MSMEClassification = MSMEClassification.SMALL
    udyam_registration: Optional[str] = None
    turnover_cr: float = 12.5
    active_employees: int = 45
    historical_filing_punctuality_score: float = 94.0 # Percentage (0-100)
    risk_score: float = 12.0 # 0-100 (lower is safer)
    compliance_status: ComplianceStatus = ComplianceStatus.COMPLIANT
    vector_embedding: Optional[List[float]] = None
    is_circular_loop_suspect: bool = False

class ThreeWayMatchDiscrepancy(BaseModel):
    field_name: str
    expected_value: Any
    actual_value: Any
    severity: str  # "CRITICAL", "MAJOR", "MINOR"
    impact_description: str

class ThreeWayMatchResult(BaseModel):
    match_id: str
    invoice_number: str
    po_number: str
    grn_number: str
    vendor_gstin: str
    is_matched: bool
    confidence_score: float
    discrepancies: List[ThreeWayMatchDiscrepancy] = []
    gstr2b_verified: bool
    itc_eligible: bool
    risk_score: float
    recommended_action: str

class RazorpayXPayoutRecord(BaseModel):
    payout_id: str
    invoice_number: str
    vendor_name: str
    vendor_gstin: str
    gross_invoice_amount: float
    section_194q_tds_amount: float
    gst_withholding_buffer: float
    net_disbursement_amount: float
    payout_status: PayoutStatus
    razorpay_account_number: str
    utr_number: Optional[str] = None
    compliance_hold_reason: Optional[str] = None
    msme_sla_deadline: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

class DisputeNotification(BaseModel):
    dispute_id: str
    vendor_name: str
    vendor_gstin: str
    invoice_number: str
    channel: str # "WhatsApp", "Email", "Vendor_Portal"
    recipient_contact: str
    subject: str
    message_body: str
    discrepancy_summary: List[str]
    auto_resolved: bool = False
    generated_at: datetime = Field(default_factory=datetime.utcnow)
