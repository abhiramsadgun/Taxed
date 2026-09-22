from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api.routes import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous FinOps & GST Compliance Agent with 3-Way Matching and RazorpayX Conditional Gating.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for low-latency frontend companion integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "ONLINE",
        "version": settings.APP_VERSION,
        "sandbox_mode": settings.IS_SANDBOX_MODE,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "modules": {
            "edge_ocr": "ACTIVE",
            "three_way_matcher": "ACTIVE",
            "razorpayx_gating": "ACTIVE",
            "multi_agent_orchestrator": "ACTIVE",
            "vector_store": "ACTIVE"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
