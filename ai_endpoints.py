from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

# Import agents and modular backend
from invoice_agent import (
    analyze_invoice_with_gemini, 
    chat_with_gemini, 
    generate_autonomous_dunning_copy, 
    explain_fraud_network_risk
)
from backend.api.routes import api_router

# FastAPI app for GSTShield FinOps & RazorpayX Suite
app = FastAPI(title="GSTShield Agentic FinOps AI Suite")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Clean Architecture API router
app.include_router(api_router)

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

@app.post("/api/v1/ai/analyze-invoice")
async def api_analyze_invoice(file: UploadFile = File(...)):
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: PDF, JPG, PNG, WEBP.")
    
    file_bytes = await file.read()
    result = analyze_invoice_with_gemini(file_bytes, file.content_type)
    return {"status": "success", "data": result}

@app.post("/api/v1/ai/chat")
async def api_chat(request: ChatRequest):
    result = chat_with_gemini(request.message, request.history)
    return {"status": "success", "data": result}

@app.post("/api/v1/ai/generate-dunning")
async def api_generate_dunning(request: DunningRequest):
    result = generate_autonomous_dunning_copy(
        request.vendor_name,
        request.invoice_number,
        request.invoice_amount,
        request.delay_days,
        request.channel
    )
    return {"status": "success", "data": result}

@app.post("/api/v1/ai/explain-fraud-risk")
async def api_explain_fraud(request: FraudExplainRequest):
    result = explain_fraud_network_risk(
        request.node_gstin,
        request.turnover_cr,
        request.employees,
        request.circular_nodes
    )
    return {"status": "success", "data": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
