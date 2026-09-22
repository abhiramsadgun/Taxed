#!/usr/bin/env python3
"""
GSTShield (iQOO Edition) - Autonomous FinOps & GST Compliance Agent
Interactive CLI Demonstration Runner
"""
import sys
import os
from datetime import date

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.ingestion.ocr_engine import ocr_engine
from backend.matching.matcher import matching_engine
from backend.payouts.razorpayx_client import razorpayx_client
from backend.agents.multi_agent_orchestrator import orchestrator
from backend.database.vector_store import vector_store
from backend.database.models import PurchaseOrder, GoodsReceivedNote, LineItem, MSMEClassification

def run_cli_demo():
    print("=" * 80)
    print(" 🛡️  GSTShield (iQOO Edition) - Autonomous FinOps & GST Compliance Agent")
    print("=" * 80)

    # 1. Edge Ingestion & Fast Parsing
    print("\n[MODULE 1] 🚀 Edge-Optimized Ingestion & OCR Parsing...")
    sample_ocr_text = """
    TAX INVOICE
    Supplier: TechNova Hardware Systems
    GSTIN: 27AADCB2230M1Z2
    Invoice No: INV-2026-9041
    Date: 2026-09-20
    HSN Code: 847130
    Description: Enterprise Micro-Edge Ingestion Servers (Qty 5)
    Taxable Value: INR 5,00,000.00
    IGST @ 18%: INR 90,000.00
    Total Payable: INR 5,90,000.00
    """
    invoice_doc = ocr_engine.process_document(sample_ocr_text.encode('utf-8'), "text/plain")
    print(f" -> Ingested Invoice: {invoice_doc.invoice_number}")
    print(f" -> Vendor GSTIN:     {invoice_doc.vendor_gstin}")
    print(f" -> Total Amount:     ₹{invoice_doc.total_invoice_amount:,.2f} (Taxable: ₹{invoice_doc.subtotal_taxable:,.2f})")
    print(f" -> HSN/SAC Codes:    {list(invoice_doc.hsn_summary.keys())}")

    # 2. Real-Time 3-Way Matching
    print("\n[MODULE 2] ⚖️  Real-Time 3-Way Matching Engine (PO + GRN + Invoice + GSTR-2B)...")
    po = PurchaseOrder(
        po_number="PO-2026-081",
        vendor_gstin="27AADCB2230M1Z2",
        vendor_name="TechNova Hardware Systems",
        issue_date=date(2026, 9, 1),
        line_items=[
            LineItem(
                description="Enterprise Micro-Edge Ingestion Servers",
                hsn_sac_code="847130",
                quantity=5.0,
                unit_rate=100000.0,
                taxable_value=500000.0,
                gst_rate_percent=18.0,
                igst_amount=90000.0,
                total_amount=590000.0
            )
        ],
        total_po_amount=590000.0
    )

    grn = GoodsReceivedNote(
        grn_number="GRN-2026-442",
        po_reference="PO-2026-081",
        received_date=date(2026, 9, 18),
        vendor_gstin="27AADCB2230M1Z2",
        line_items_received=[
            {"description": "Enterprise Micro-Edge Ingestion Servers", "quantity_received": 5.0, "quantity_rejected": 0.0}
        ]
    )

    # Scenario A: GSTR-2B Matched (Clean Flow)
    match_clean = matching_engine.match(invoice_doc, po, grn, gstr2b_present=True)
    print(f" -> Clean Match Result: Matched={match_clean.is_matched} | Confidence={match_clean.confidence_score}%")
    print(f" -> Action: {match_clean.recommended_action}")

    # Scenario B: GSTR-2B Missing (ITC Discrepancy Flow)
    match_discrepant = matching_engine.match(invoice_doc, po, grn, gstr2b_present=False)
    print(f" -> Discrepant Match Result: Matched={match_discrepant.is_matched} | Risk Score={match_discrepant.risk_score}")
    print(f" -> Discrepancies Count: {len(match_discrepant.discrepancies)}")
    for d in match_discrepant.discrepancies:
        print(f"    - [{d.severity}] {d.field_name}: {d.impact_description}")

    # 3. RazorpayX Conditional Payout Gating
    print("\n[MODULE 3] 💳 RazorpayX Conditional Payout Gating...")
    payout_record = razorpayx_client.evaluate_and_gate_payout(invoice_doc, is_gstr2b_matched=False)
    print(f" -> Payout ID:           {payout_record.payout_id}")
    print(f" -> Gross Invoiced:      ₹{payout_record.gross_invoice_amount:,.2f}")
    print(f" -> Section 194Q TDS:    ₹{payout_record.section_194q_tds_amount:,.2f} (0.1% buffer)")
    print(f" -> GST Buffer Withheld: ₹{payout_record.gst_withholding_buffer:,.2f} (Rule 36(4))")
    print(f" -> Net Disbursement:    ₹{payout_record.net_disbursement_amount:,.2f}")
    print(f" -> Status:              {payout_record.payout_status.value}")
    print(f" -> Gate Reason:         {payout_record.compliance_hold_reason}")

    # 4. Autonomous Vendor Dispute & Resolution Agent
    print("\n[MODULE 4] 🤖 Autonomous Dispute & Resolution Agent...")
    dispute_notice = orchestrator.dispute_agent.generate_discrepancy_notice(
        match_result=match_discrepant,
        vendor_name="TechNova Hardware Systems",
        channel="WhatsApp",
        recipient_contact="+91 98450 11223"
    )
    print(f" -> Dispute ID:   {dispute_notice.dispute_id}")
    print(f" -> Channel:      {dispute_notice.channel} ({dispute_notice.recipient_contact})")
    print(f" -> Headline:     {dispute_notice.subject}")
    print(" -> Autonomous Message Body:\n" + "-" * 40)
    print(dispute_notice.message_body)
    print("-" * 40)

    # 5. Vector Store & Historical Vendor Profiling
    print("\n[MODULE 5] 🧠 Vector Embeddings & Shell Syndicate Detection...")
    profile = vector_store.get_profile("29GGGGG9999G1Z9")
    if profile:
        similar = vector_store.find_similar_risk_profiles(profile, top_k=2)
        print(f" -> Profiled GSTIN: {profile.gstin} ({profile.legal_name})")
        print(f" -> Circular Loop Suspect: {profile.is_circular_loop_suspect} | Risk Score: {profile.risk_score}")
        print(" -> Vector Similarity Top Cluster Matches:")
        for p, sim in similar:
            print(f"    - {p.gstin} ({p.legal_name}) -> Similarity: {sim*100:.1f}%")

    print("\n" + "=" * 80)
    print(" ✅ All GSTShield FinOps & Compliance Agent Modules Operational!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    run_cli_demo()
