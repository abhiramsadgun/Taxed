# GSTShield 🛡️⚡
### Autonomous FinOps & Statutory GST Compliance Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2.svg?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![RazorpayX](https://img.shields.io/badge/RazorpayX-Banking_FinOps-0C2340.svg?style=flat&logo=razorpay&logoColor=white)](https://razorpay.com/x/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)

> **GSTShield** is an enterprise-grade Autonomous FinOps and Statutory GST Compliance platform engineered for sub-second invoice extraction, real-time 3-way tax matching (PO vs. GRN vs. GSTR-2B), vector-based circular trading fraud detection, and automated conditional vendor payouts via **RazorpayX**.

---

## 📑 Table of Contents

- [🏛️ System Architecture](#️-system-architecture)
- [⚡ Key Features & Core Modules](#-key-features--core-modules)
  - [1. Edge-Optimized Ingestion & Vision Pipeline](#1-edge-optimized-ingestion--vision-pipeline)
  - [2. Multi-Agent Validation Core](#2-multi-agent-validation-core)
  - [3. Real-Time 3-Way Matching Engine](#3-real-time-3-way-matching-engine)
  - [4. RazorpayX Conditional Payout Shield](#4-razorpayx-conditional-payout-shield)
  - [5. MSME Section 43B(h) Sentinel](#5-msme-section-43bh-sentinel)
  - [6. Vector Store & Circular Trading Graph](#6-vector-store--circular-trading-graph)
  - [7. Autonomous Vendor Dispute & Dunning Agent](#7-autonomous-vendor-dispute--dunning-agent)
- [🛡️ Statutory Compliance Alignment](#️-statutory-compliance-alignment)
- [🏗️ Project Directory Structure](#️-project-directory-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quickstart & Installation](#-quickstart--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Backend Setup (FastAPI & Python)](#3-backend-setup-fastapi--python)
  - [4. Frontend Setup (Next.js 15)](#4-frontend-setup-nextjs-15)
  - [5. Run End-to-End CLI Demo](#5-run-end-to-end-cli-demo)
- [📡 API Reference](#-api-reference)
- [🖥️ Companion UI Overview](#️-companion-ui-overview)
- [📄 License & Disclaimer](#-license--disclaimer)

---

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Ingestion Layer [1. Ingestion & Vision Engine]
        A[Multi-Format Invoice: PDF / JPG / PNG] --> B[Edge Regex Parser <5ms]
        A --> C[Gemini 1.5 Flash Vision API]
        B --> D[Structured Invoice Document Model]
        C --> D
    end

    subgraph Agentic FinOps Core [2. Multi-Agent Validation Engine]
        D --> E[ExtractionAgent: Line Items & HSN/SAC]
        E --> F[TaxValidationAgent: Sec 16(2)(aa) & Sec 194Q TDS]
        F --> G[AnomalyAgent: Circular Loops & Vector Profiling]
    end

    subgraph Matching Engine [3. Real-Time 3-Way Match]
        PO[(Purchase Orders - PO)] --> H[3-Way Matching Engine]
        GRN[(Goods Received Notes - GRN)] --> H
        GSTR[(GSTR-2B Filing Ledger)] --> H
        G --> H
    end

    subgraph Dispute & Payout Gate [4. Execution & Gating Layer]
        H -->|Mismatch / ITC Risk| I[Autonomous Dispute Resolution Agent]
        I --> J[Automated WhatsApp / Email Dunning & Mismatch Notice]
        H -->|Verified & Compliant| K[RazorpayX Conditional Payout Shield]
        K --> L[Net Disbursement - Sec 194Q TDS Ledger]
        K --> M[Smart Collect Dynamic UPI QR Code]
        K --> N[Rule 36(4) 18% GST Escrow Release]
    end
```

---

## ⚡ Key Features & Core Modules

### 1. Edge-Optimized Ingestion & Vision Pipeline (`backend/ingestion/`)
- **Multi-Format Processing**: High-speed OCR and parsing for digital PDFs, scanned bills, and mobile receipts.
- **Hybrid Vision Pipeline**: Microsecond edge regex parsing (`<5ms`) backed by **Gemini 1.5 Flash** multimodal vision for nested tables, handwritten notes, and irregular layouts.
- **Metadata Extraction**: Automatic extraction of GSTINs, PAN, 64-character e-Invoice IRN hashes, QR codes, HSN/SAC codes, CGST/SGST/IGST tax rates, and taxable totals.

### 2. Multi-Agent Validation Core (`backend/agents/`)
- **Extraction Agent**: Parses structured line items, units of measurement (UOM), unit prices, and calculates HSN-level tax breakdowns.
- **Tax Validation Agent**: Enforces statutory tax arithmetic, validates GSTIN state prefixes and checksums, calculates **Section 194Q TDS (0.1%)**, and checks **Rule 36(4) / Section 16(2)(aa)** filing status.
- **Anomaly Agent**: Runs forensic heuristics against historical vendor profiles, flags duplicate invoice hashes, and checks for abnormal pricing fluctuations.

### 3. Real-Time 3-Way Matching Engine (`backend/matching/`)
- **Automated Cross-Validation**:
  1. **Purchase Orders (PO)**: Approved line items, negotiated unit rates, and contract payment terms.
  2. **Goods Received Notes (GRN)**: Physically accepted quantities vs. gate rejects (configurable 2% tolerance).
  3. **Vendor Invoices & GSTR-2B**: Real-time statutory filing verification to prevent Input Tax Credit (ITC) blockage.
- **Risk Scoring**: Calculates continuous confidence and risk metrics (0–100 scale) for every line item and invoice.

### 4. RazorpayX Conditional Payout Shield (`backend/payouts/`)
- **"Verify-Before-Pay" Architecture**: Funds are gated until all statutory criteria and 3-way matching rules pass.
- **Section 194Q TDS Deduction**: Automatically computes and withholds 0.1% TDS on aggregate purchase values exceeding INR 50 Lakhs in a financial year.
- **Rule 36(4) GST Escrow Withholding**: Holds back the 18% GST tax portion until the supplier reflects the transaction on GSTR-2B.
- **Smart Collect Dynamic UPI QR**: Generates dynamic, metadata-encoded UPI QR payloads for instant reconciliation.

### 5. MSME Section 43B(h) Sentinel (`src/app/finance/msme-sentinel/`)
- **45-Day Statutory Countdown**: Real-time SLA tracking for Micro and Small Enterprise vendors to avoid tax disallowance under Section 43B(h) of the Income Tax Act.
- **Tiered Urgency Alerts**: Visual indicators and scheduled reminders at 30 days, 15 days, and 48 hours prior to lapse.

### 6. Vector Store & Circular Trading Graph (`backend/database/` & `src/app/finance/fraud-graph/`)
- **Behavioral Profiling**: Vector embeddings generated from turnover-to-employee ratios, filing delay patterns, and invoice dispute histories.
- **Circular Syndicate Detection**: Cosine similarity clustering and interactive forensic network graphs to detect shell companies and circular invoice rings (Section 132(1)(b) CGST Act).
- **PostgreSQL `pgvector` Ready**: Complete DDL with HNSW indexing for high-dimensional nearest-neighbor queries.

### 7. Autonomous Vendor Dispute & Dunning Agent (`backend/agents/`)
- **Instant Trigger**: Automatically activates upon any line item variance, missing GSTR-2B filing, or quantity mismatch.
- **Multi-Channel Dispatch**: Drafts legally precise, contextual **WhatsApp** and **Email** dunning notices referencing Section 16(2)(aa) CGST Act.
- **Audit Trails**: Centralized discrepancy repository with auto-resolution tracking.

---

## 🛡️ Statutory Compliance Alignment

| Statutory Section | Legislation | Platform Enforcement Mechanism |
| :--- | :--- | :--- |
| **Section 16(2)(aa)** | CGST Act, 2017 | **Zero-Tolerance ITC Lock**: Blocks tax credit disbursement until invoice is reflected in buyer's GSTR-2B. |
| **Section 194Q** | Income Tax Act, 1961 | **Automated TDS Withholding**: Automatically calculates 0.1% TDS on cumulative vendor purchases > ₹50,00,000. |
| **Section 43B(h)** | Income Tax Act, 1961 | **MSME Sentinel**: Tracks 45-day payment statutory deadlines for registered Micro/Small enterprises. |
| **Rule 36(4)** | CGST Rules, 2017 | **Escrow Withholding**: Retains the 18% GST component in safe escrow until GSTR-1 is filed by supplier. |
| **Section 132(1)(b)** | CGST Act, 2017 | **Circular Trading Graph**: AI forensic vector analysis to uncover bill trading without actual movement of goods. |

---

## 🏗️ Project Directory Structure

```
GSTshield/
├── backend/                              # Python FastAPI FinOps Backend
│   ├── agents/
│   │   └── multi_agent_orchestrator.py   # Extraction, Tax, Anomaly & Dispute Agent Swarm
│   ├── api/
│   │   └── routes.py                     # Clean REST API endpoints (/api/v1)
│   ├── core/
│   │   └── config.py                     # Pydantic Settings & Statutory FinOps parameters
│   ├── database/
│   │   ├── models.py                     # Pydantic domain models (Invoice, PO, GRN, Payouts)
│   │   └── vector_store.py               # Vector embeddings & cosine similarity profiling
│   ├── ingestion/
│   │   └── ocr_engine.py                 # Edge OCR & hybrid vision parsing
│   ├── matching/
│   │   └── matcher.py                    # Real-time 3-way matching & discrepancy scoring
│   ├── payouts/
│   │   └── razorpayx_client.py           # RazorpayX Payout Gating & Smart Collect
│   ├── cli_demo.py                       # Interactive CLI end-to-end demonstration suite
│   └── main.py                           # FastAPI application entry point & CORS configuration
│
├── src/                                  # Mobile-First Next.js 15 Companion Web App
│   ├── app/
│   │   ├── chat/                         # Gemini AI FinOps / CA Copilot Chat
│   │   ├── finance/
│   │   │   ├── fraud-graph/              # Circular trading forensic graph visualization
│   │   │   ├── itc-lock/                 # Section 16(2)(aa) ITC Lock & GSTR-2B tracker
│   │   │   ├── msme-sentinel/            # Section 43B(h) 45-day MSME SLA countdown
│   │   │   ├── notices/                  # Autonomous dunning & dispute notice center
│   │   │   ├── payables/                 # Accounts payable & gated disbursement table
│   │   │   ├── payouts/                  # RazorpayX Payout Shield command interface
│   │   │   ├── pl/                       # Profit & Loss / Statutory impact dashboard
│   │   │   ├── reconciliation/           # 3-Way Match discrepancy audit room
│   │   │   ├── reports/                  # FinOps compliance reports & export tools
│   │   │   ├── smart-collect/            # Smart Collect dynamic UPI QR generator
│   │   │   └── page.tsx                  # Finance Command Center Dashboard
│   │   ├── login/                        # Authentication portal
│   │   ├── globals.css                   # Tailwind design system & animations
│   │   ├── layout.tsx                    # Root layout with sidebar & providers
│   │   └── page.tsx                      # GSTShield Landing / Executive Overview
│   └── store/                            # Zustand global FinOps state engine
│
├── ai_endpoints.py                       # Gemini microservice endpoints
├── invoice_agent.py                      # Gemini 1.5 Flash prompt controller & CA reasoning
├── .env.example                          # Environment configuration template
├── package.json                          # Node.js dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
└── README.md                             # Platform Documentation
```

---

## 🛠️ Tech Stack

### Backend & AI
- **Python 3.10+** — Core backend runtime
- **FastAPI** — High-performance asynchronous API framework
- **Pydantic v2** — Strict data validation and statutory schema modeling
- **Google Gemini 1.5 Flash** — Multimodal vision extraction & CA reasoning copilot
- **RazorpayX API** — Automated vendor payouts, Smart Collect UPI, & compliance escrow
- **PostgreSQL + pgvector** — High-dimensional vector similarity store

### Frontend & UI
- **Next.js 15 (App Router)** — React server components & optimized routing
- **React 19** — Interactive component architecture
- **TypeScript** — End-to-end type safety
- **Tailwind CSS & Framer Motion** — Glassmorphic dark UI & dynamic micro-animations
- **Zustand** — Client-side FinOps state management
- **Lucide Icons & Recharts** — Visual analytics, charts, and iconography

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** & **npm** installed
- **Google Gemini API Key** ([Get one from Google AI Studio](https://aistudio.google.com/))
- *(Optional)* **RazorpayX Test Key** for live payout sandbox

---

### 1. Clone Repository

```bash
git clone https://github.com/abhiramsadgun/GSTSheild.git
cd GSTSheild
```

---

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Configure your `.env` parameters:

```env
# --- Application Environment ---
ENVIRONMENT=development
DEBUG=True

# --- Gemini AI Configuration ---
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# --- RazorpayX FinOps Gateway ---
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_ACCOUNT_NUMBER=2323230044556677
IS_SANDBOX_MODE=True

# --- Frontend & Backend Connection ---
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
HOST=0.0.0.0
PORT=8000
```

---

### 3. Backend Setup (FastAPI & Python)

Create and activate a virtual environment:

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install fastapi uvicorn pydantic python-dotenv google-generativeai requests numpy
```

Start the FastAPI backend server:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 4. Frontend Setup (Next.js 15)

In a new terminal window, install frontend dependencies:

```bash
npm install
```

Launch the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 5. Run End-to-End CLI Demo

Test the entire pipeline (Ingestion ➔ 3-Way Matching ➔ Section 194Q TDS ➔ RazorpayX Gating ➔ Dispute Agent ➔ Vector Profiling) with the built-in CLI suite:

```bash
python backend/cli_demo.py
```

---

## 📡 API Reference

All backend endpoints are prefixed with `/api/v1`.

### Ingestion & OCR
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ingest/upload` | Upload PDF/Image invoice for edge OCR & vision extraction. |
| `POST` | `/api/v1/ingest/parse-raw` | Microsecond regex stream parser for edge devices. |

### 3-Way Matching Engine
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/match/execute` | Executes PO vs. GRN vs. Invoice vs. GSTR-2B matching. |

### RazorpayX Payouts & Smart Collect
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/payouts/gate` | Evaluates Sec 194Q TDS, Sec 43B(h) SLA, and creates gated payout record. |
| `POST` | `/api/v1/payouts/execute` | Executes disbursement via RazorpayX (live API or sandbox). |
| `GET` | `/api/v1/payouts/smart-collect-qr` | Generates dynamic UPI QR code with embedded invoice metadata. |

### Autonomous Dispute Agent
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/disputes/generate-notice` | Generates structured discrepancy log & drafts WhatsApp/Email notice. |
| `GET` | `/api/v1/disputes/history` | Retrieves all historical dispute notices. |

### Vector Profiling & Anomaly Detection
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/vendors/profile/{gstin}` | Retrieves vendor profile and circular trading risk vector. |
| `GET` | `/api/v1/vendors/similar-risks/{gstin}` | Vector similarity search to detect shell company syndicates. |

### AI Agents & CA Copilot
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ai/analyze-invoice` | Multimodal invoice parsing via Gemini 1.5 Flash Vision. |
| `POST` | `/api/v1/ai/chat` | Multi-turn conversational CA / FinOps advisor. |
| `POST` | `/api/v1/ai/generate-dunning` | Autonomous compliant dunning notice generation. |
| `POST` | `/api/v1/ai/explain-fraud-risk` | Forensic AI explanation for circular trading network graphs. |

---

## 🖥️ Companion UI Overview

The Next.js companion app includes dedicated FinOps command modules:

- **Finance Command Center** (`/finance`): Real-time metrics on gated disbursements, ITC locked, MSME exposure, and active disputes.
- **Payout Shield** (`/finance/payouts`): Execute gated disbursements with automatic 194Q TDS computation and RazorpayX execution.
- **Smart Collect** (`/finance/smart-collect`): Generate and monitor dynamic UPI QR codes.
- **MSME Sentinel** (`/finance/msme-sentinel`): Section 43B(h) countdown radar preventing non-compliance penalties.
- **Fraud Graph** (`/finance/fraud-graph`): Forensic graph explorer uncovering circular trading loops and shell entities.
- **ITC Lock Room** (`/finance/itc-lock`): Section 16(2)(aa) compliance tracker and GSTR-2B reconciliation view.
- **Dispute & Notice Hub** (`/finance/notices`): Multi-channel dispute manager for WhatsApp and Email communications.
- **CA Copilot Chat** (`/chat`): Conversational AI assistant for statutory queries, tax law citations, and invoice audits.

---

## 📄 License & Disclaimer

This software is released under the **MIT License**.

> **Statutory Disclaimer**: *GSTShield is designed to assist financial and tax compliance operations. While statutory calculation logic aligns with current provisions of the CGST Act (2017) and Income Tax Act (1961), tax filings and financial disbursements should be reviewed in accordance with your organization's internal audit policies.*
