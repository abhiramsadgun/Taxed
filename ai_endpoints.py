from fastapi import FastAPI, UploadFile, File, HTTPException
from invoice_agent import analyze_invoice_with_gemini
from fastapi.middleware.cors import CORSMiddleware

# This is a standalone FastAPI app for the Gemini Invoice Analysis endpoint.
app = FastAPI()

# Add CORS so Next.js frontend can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/ai/analyze-invoice")
async def api_analyze_invoice(file: UploadFile = File(...)):
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, and PNG are supported.")
    
    file_bytes = await file.read()
    
    # Process with Gemini AI 
    # Ensure GEMINI_API_KEY is set in your environment variables
    result = analyze_invoice_with_gemini(file_bytes, file.content_type)
    
    return {"status": "success", "data": result}

# Example to run this standalone (if needed for testing):
# if __name__ == "__main__":
#     import uvicorn
#     from fastapi import FastAPI
#     app = FastAPI()
#     app.include_router(router)
#     uvicorn.run(app, host="0.0.0.0", port=8000)
