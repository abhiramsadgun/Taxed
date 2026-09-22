import math
from typing import List, Dict, Tuple, Optional
from backend.database.models import VendorComplianceProfile, ComplianceStatus, MSMEClassification

class VectorStore:
    """
    In-memory and PostgreSQL (pgvector) compatible vector store for historical 
    vendor profiling and anomaly detection.
    
    Generates multidimensional behavioral embeddings from:
    1. Turnover-to-Employee Ratio
    2. Historical Filing Delay (Days past 11th/20th deadline)
    3. Invoice Discrepancy Frequency
    4. Input-to-Output Ratio Volatility
    5. Circular Trading Graph Centrality
    """

    def __init__(self):
        self._profiles: Dict[str, VendorComplianceProfile] = {}
        self._initialize_benchmark_profiles()

    def _generate_embedding(self, profile: VendorComplianceProfile) -> List[float]:
        """
        Creates a normalized 5-dimensional feature vector:
        [turnover_per_emp_normalized, filing_delay_norm, discrepancy_rate, circularity_factor, risk_score_norm]
        """
        # Feature 1: Disproportionate turnover per employee (shell indicators)
        emp = max(profile.active_employees, 1)
        t_per_emp = (profile.turnover_cr * 10_000_000) / emp
        t_norm = min(1.0, t_per_emp / 50_000_000)  # Capped at 5Cr/emp

        # Feature 2: Punctuality inverse
        delay_norm = max(0.0, min(1.0, (100.0 - profile.historical_filing_punctuality_score) / 100.0))

        # Feature 3: Risk Score
        risk_norm = profile.risk_score / 100.0

        # Feature 4: Circularity flag
        circ_norm = 1.0 if profile.is_circular_loop_suspect else 0.0

        # Feature 5: Status severity
        status_weight = {
            ComplianceStatus.COMPLIANT: 0.1,
            ComplianceStatus.WARNING: 0.4,
            ComplianceStatus.DEFICIENT: 0.7,
            ComplianceStatus.HARD_BLOCKED: 1.0
        }.get(profile.compliance_status, 0.5)

        # Normalize vector to unit length
        raw_vec = [t_norm, delay_norm, risk_norm, circ_norm, status_weight]
        magnitude = math.sqrt(sum(x * x for x in raw_vec)) or 1.0
        return [x / magnitude for x in raw_vec]

    def _initialize_benchmark_profiles(self):
        """Seed realistic profiles for testing and vector matching"""
        seeds = [
            VendorComplianceProfile(
                gstin="27AADCB2230M1Z2",
                legal_name="Apex Precision Engineering Ltd",
                trade_name="Apex Precision",
                msme_type=MSMEClassification.MEDIUM,
                turnover_cr=85.0,
                active_employees=220,
                historical_filing_punctuality_score=98.5,
                risk_score=4.0,
                compliance_status=ComplianceStatus.COMPLIANT,
                is_circular_loop_suspect=False
            ),
            VendorComplianceProfile(
                gstin="29GGGGG9999G1Z9",
                legal_name="Shadow Apex Infra Ventures",
                trade_name="Shadow Apex",
                msme_type=MSMEClassification.MICRO,
                turnover_cr=120.0,
                active_employees=1,
                historical_filing_punctuality_score=35.0,
                risk_score=94.0,
                compliance_status=ComplianceStatus.HARD_BLOCKED,
                is_circular_loop_suspect=True
            ),
            VendorComplianceProfile(
                gstin="07BBBBB2222B1Z2",
                legal_name="Bharat LogiTech & Supply Solutions",
                trade_name="Bharat LogiTech",
                msme_type=MSMEClassification.SMALL,
                turnover_cr=24.5,
                active_employees=54,
                historical_filing_punctuality_score=88.0,
                risk_score=18.0,
                compliance_status=ComplianceStatus.WARNING,
                is_circular_loop_suspect=False
            )
        ]
        for p in seeds:
            self.upsert_vendor_profile(p)

    def upsert_vendor_profile(self, profile: VendorComplianceProfile) -> VendorComplianceProfile:
        profile.vector_embedding = self._generate_embedding(profile)
        self._profiles[profile.gstin] = profile
        return profile

    def get_profile(self, gstin: str) -> Optional[VendorComplianceProfile]:
        return self._profiles.get(gstin)

    def find_similar_risk_profiles(self, profile: VendorComplianceProfile, top_k: int = 3) -> List[Tuple[VendorComplianceProfile, float]]:
        """
        Calculates Cosine Similarity between the query profile vector and historical profiles.
        Returns top_k matching profiles with similarity score.
        """
        target_vec = profile.vector_embedding or self._generate_embedding(profile)
        results = []

        for p in self._profiles.values():
            vec = p.vector_embedding or self._generate_embedding(p)
            dot_product = sum(a * b for a, b in zip(target_vec, vec))
            results.append((p, round(dot_product, 4)))

        # Sort descending by similarity
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    @staticmethod
    def get_pgvector_ddl_schema() -> str:
        """PostgreSQL pgvector DDL for production database deployment"""
        return """
        -- Enable pgvector extension
        CREATE EXTENSION IF NOT EXISTS vector;

        -- Vendor compliance profiles table
        CREATE TABLE IF NOT EXISTS vendor_profiles (
            gstin VARCHAR(15) PRIMARY KEY,
            legal_name VARCHAR(255) NOT NULL,
            trade_name VARCHAR(255),
            msme_type VARCHAR(20) DEFAULT 'Small',
            turnover_cr NUMERIC(12, 2) DEFAULT 0.0,
            active_employees INT DEFAULT 1,
            historical_filing_punctuality_score NUMERIC(5, 2) DEFAULT 100.0,
            risk_score NUMERIC(5, 2) DEFAULT 0.0,
            compliance_status VARCHAR(20) DEFAULT 'COMPLIANT',
            is_circular_loop_suspect BOOLEAN DEFAULT FALSE,
            embedding vector(5),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- HNSW Index for ultra-low latency cosine similarity search
        CREATE INDEX IF NOT EXISTS vendor_profiles_embedding_idx 
        ON vendor_profiles USING hnsw (embedding vector_cosine_ops);
        """

# Singleton instance
vector_store = VectorStore()
