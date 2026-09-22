import os
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

class Settings(BaseModel):
    # App Settings
    APP_NAME: str = "GSTShield (iQOO Edition) - Autonomous FinOps Agent"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Gemini AI Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # RazorpayX Configuration
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_gstshield_sandbox")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret_key_12345")
    RAZORPAY_ACCOUNT_NUMBER: str = os.getenv("RAZORPAY_ACCOUNT_NUMBER", "2323230044556677")
    RAZORPAY_BASE_URL: str = os.getenv("RAZORPAY_BASE_URL", "https://api.razorpay.com/v1")
    IS_SANDBOX_MODE: bool = os.getenv("IS_SANDBOX_MODE", "True").lower() == "true"
    
    # Database Configuration (PostgreSQL + pgvector)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gstshield")
    
    # FinOps Statutory Compliance Parameters
    SECTION_194Q_TDS_RATE: float = 0.001  # 0.1% TDS on aggregate purchases exceeding INR 50 Lakhs
    SECTION_194Q_THRESHOLD: float = 5000000.0  # INR 50 Lakhs
    MSME_PAYMENT_SLA_DAYS: int = 45  # Section 43B(h) statutory payment ceiling
    SECTION_16_TOLERANCE_PERCENT: float = 0.00  # 0% discrepancy allowed post GSTR-2B mandate (Rule 36(4))
    MATCHING_QUANTITY_TOLERANCE: float = 0.02  # 2% standard GRN quantity tolerance

settings = Settings()
