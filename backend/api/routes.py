from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Dict, Any, List, Optional
from datetime import date
from pydantic import BaseModel

from backend.ingestion.ocr_engine import ocr_engine
from backend.matching.matcher import matching_engine
from backend.payouts.razorpayx_client import razorpayx_client
from backend.agents.multi_agent_orchestrator import orchestrator
from backend.database.vector_store import vector_store
from backend.database.models import (
    InvoiceDocument,
    PurchaseOrder,
    GoodsReceivedNote,
    LineItem,
    ThreeWayMatchResult,
    RazorpayXPayoutRecord,
    DisputeNotification,
    VendorComplianceProfile
)
from invoice_agent import (
    analyze_invoice_with_gemini,
    chat_with_gemini,
    generate_autonomous_dunning_copy,
    explain_fraud_network_risk
)

api_router = APIRouter(prefix="/api/v1")

# In-memory dispute storage for fast companion retrieval
DISPUTE_STORE: Dict[str, DisputeNotification] = {}

# -------------------------------------------------------------
# Request Schemas
# -------------------------------------------------------------
class MatchRequest(BaseModel):
    invoice: InvoiceDocument
    po: PurchaseOrder
    grn: GoodsReceivedNote
    gstr2b_present: bool = True

class PayoutGateRequest(BaseModel):
    invoice: InvoiceDocument
    is_gstr2b_matched: bool = True
    override_hold: bool = False

class DisputeNoticeRequest(BaseModel):
    match_result: ThreeWayMatchResult
    vendor_name: str
    channel: str = "WhatsApp"
    recipient_contact: str = "+91 98765 43210"

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class DunningRequest(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_amount: float
    delay_days: int = 3
    channel: str = "WhatsApp"

class FraudExplainRequest(BaseModel):
    node_gstin: str
    turnover_cr: float
    employees: int
    circular_nodes: List[str]

# -------------------------------------------------------------
# 1. Edge-Optimized Ingestion & Extraction Endpoints
# -------------------------------------------------------------
@api_router.post("/ingest/upload", response_model=InvoiceDocument)
async def upload_and_parse_invoice(file: UploadFile = File(...)):
    """Accepts PDF/Image invoice and performs edge OCR / vision extraction."""
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported format. Allowed: {allowed_types}")

    file_bytes = await file.read()
    invoice_doc = ocr_engine.process_document(file_bytes, file.content_type)
    return invoice_doc

@api_router.post("/ingest/parse-raw")
async def parse_raw_invoice_text(raw_text: str = Body(..., embed=True)):
    """Fast microsecond regex stream parser for edge devices."""
    parsed = ocr_engine.parse_text_stream(raw_text)
    return {"status": "success", "data": parsed}

# -------------------------------------------------------------
# 2. Real-Time 3-Way Matching Engine Endpoints
# -------------------------------------------------------------
@api_router.post("/match/execute", response_model=ThreeWayMatchResult)
async def execute_three_way_match(request: MatchRequest):
    """Executes automated PO vs GRN vs Tax Invoice vs GSTR-2B 3-way matching."""
    result = matching_engine.match(
        request.invoice,
        request.po,
        request.grn,
        gstr2b_present=request.gstr2b_present
    )
    return result

# -------------------------------------------------------------
# 3. RazorpayX Conditional Payout Gating Endpoints
# -------------------------------------------------------------
@api_router.post("/payouts/gate", response_model=RazorpayXPayoutRecord)
async def evaluate_payout_gate(request: PayoutGateRequest):
    """Calculates Section 194Q TDS, Section 43B(h) MSME SLA, and creates a gated disbursement record."""
    record = razorpayx_client.evaluate_and_gate_payout(
        request.invoice,
        is_gstr2b_matched=request.is_gstr2b_matched,
        override_hold=request.override_hold
    )
    return record

@api_router.post("/payouts/execute")
async def execute_razorpay_disbursement(payout_record: RazorpayXPayoutRecord):
    """Disburses funds via RazorpayX (live API or instant sandbox execution)."""
    result = await razorpayx_client.execute_payout(payout_record)
    return result

@api_router.get("/payouts/smart-collect-qr")
async def get_smart_collect_qr(invoice_number: str, amount: float, vendor_gstin: str):
    """Generates Razorpay Smart Collect dynamic UPI QR payload."""
    qr_data = razorpayx_client.generate_smart_collect_qr(invoice_number, amount, vendor_gstin)
    return qr_data

# -------------------------------------------------------------
# 4. Autonomous Dispute & Resolution Agent Endpoints
# -------------------------------------------------------------
@api_router.post("/disputes/generate-notice", response_model=DisputeNotification)
async def generate_dispute_notice(request: DisputeNoticeRequest):
    """Generates structured mismatch log and drafts high-converting dunning notification."""
    notice = orchestrator.dispute_agent.generate_discrepancy_notice(
        request.match_result,
        request.vendor_name,
        request.channel,
        request.recipient_contact
    )
    DISPUTE_STORE[notice.dispute_id] = notice
    return notice

@api_router.get("/disputes/history")
async def get_disputes_history():
    """Retrieves all generated dispute notices."""
    return list(DISPUTE_STORE.values())

# -------------------------------------------------------------
# 5. Vendor Profiling & Vector Similarity Endpoints
# -------------------------------------------------------------
@api_router.get("/vendors/profile/{gstin}")
async def get_vendor_profile(gstin: str):
    """Retrieves profile and circular trading risk vector."""
    profile = vector_store.get_profile(gstin)
    if not profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return profile

@api_router.get("/vendors/similar-risks/{gstin}")
async def find_similar_risk_vendors(gstin: str):
    """Vector similarity search to detect shell syndicates and circular networks."""
    profile = vector_store.get_profile(gstin)
    if not profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    similar = vector_store.find_similar_risk_profiles(profile, top_k=3)
    return [{"gstin": p.gstin, "name": p.legal_name, "similarity_score": score, "risk_score": p.risk_score} for p, score in similar]

# -------------------------------------------------------------
# 6. AI Agent Endpoints (Gemini 1.5 Flash Vision & Chat)
# -------------------------------------------------------------
@api_router.post("/ai/analyze-invoice")
async def api_analyze_invoice(file: UploadFile = File(...)):
    """Analyze invoice via Gemini Vision / Edge FinOps extraction."""
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.content_type}. Allowed: {allowed_types}")

    file_bytes = await file.read()
    result = analyze_invoice_with_gemini(file_bytes, file.content_type)
    return {"status": "success", "data": result}

@api_router.post("/ai/chat")
async def api_chat(request: ChatRequest):
    """Interactive CA / FinOps Copilot conversation."""
    result = chat_with_gemini(request.message, request.history)
    return {"status": "success", "data": result}

@api_router.post("/ai/generate-dunning")
async def api_generate_dunning(request: DunningRequest):
    """Autonomous compliant vendor dunning copy generation."""
    result = generate_autonomous_dunning_copy(
        request.vendor_name,
        request.invoice_number,
        request.invoice_amount,
        request.delay_days,
        request.channel
    )
    return {"status": "success", "data": result}

@api_router.post("/ai/explain-fraud-risk")
async def api_explain_fraud(request: FraudExplainRequest):
    """Forensic AI explanation for circular trading graphs."""
    result = explain_fraud_network_risk(
        request.node_gstin,
        request.turnover_cr,
        request.employees,
        request.circular_nodes
    )
    return {"status": "success", "data": result}
