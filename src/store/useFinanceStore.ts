import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  vendorOrClient: string;
}

export interface Payable {
  id: string;
  vendorName: string;
  category: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: "Pending" | "Partially Paid" | "Paid";
  gstin?: string;
  hsnSac?: string;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  proofImage?: string;
  reconciliationStatus?: "Matched" | "Mismatch" | "Missing" | "Blocked";
  reconciliationReason?: string;
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  contact: string;
  address: string;
  isMsme?: boolean;
  udyamNumber?: string;
  msmeCategory?: "Micro" | "Small" | "Medium";
  filingScore?: number; // 0-100 score
  gstr1FilingDelayRate?: number; // % late filing
  gstr3bStatus?: "Filed" | "Pending" | "Delayed";
  cumulativeFyTurnover?: number; // For Section 194Q (> 50 Lakhs threshold)
  riskLevel?: "Low" | "Medium" | "Critical";
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    beneficiaryName: string;
    virtualVpa?: string;
  };
}

export interface ComplianceGateResult {
  passed: boolean;
  checks: {
    gstinVerified: boolean;
    gstinStatus: "ACTIVE" | "SUSPENDED" | "CANCELLED" | "INVALID";
    hsnValid: boolean;
    hsnTaxRateExpected: number;
    hsnTaxRateBilled: number;
    irnVerified: boolean;
    irnHash?: string;
    circularTradingRisk: "LOW" | "ELEVATED" | "CRITICAL_LOOP";
    msme43BhDueDays: number;
  };
  reasons: string[];
}

export interface RazorpayXPayout {
  id: string;
  payableId?: string;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  baseAmount: number;
  gstAmount: number;
  
  // Section 194Q / 194J TDS
  tdsApplicable: boolean;
  tdsSection: "194Q (Goods > ₹50L)" | "194J (Prof. Services 10%)" | "194C (Contract 2%)" | "None";
  tdsRate: number;
  tdsAmount: number;
  netVendorDisbursement: number;
  gstWithheldFor2B: number;
  
  // RazorpayX Payout Execution
  payoutStatus: "COMPLIANCE_HOLD" | "QUEUED_FOR_DISBURSEMENT" | "PROCESSED" | "REJECTED" | "DISPUTE_ESCROW";
  razorpayPayoutId?: string;
  razorpayUtr?: string;
  complianceGate: ComplianceGateResult;
  autoScheduledDate?: string;
  processedAt?: string;
}

export interface SmartCollectLink {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerGstin: string;
  sellerGstin: string;
  issueDate: string;
  dueDate: string;
  baseSubtotal: number;
  gstRate: number;
  gstAmount: number;
  totalPayable: number;
  irn: string;
  qrPayload: string;
  paymentLinkId: string;
  shortUrl: string;
  virtualUpiId: string;
  status: "ACTIVE" | "SETTLED" | "PARTIALLY_SETTLED_DISPUTED" | "EXPIRED";
  
  // Escrow / Dispute attributes
  dispute?: {
    isDisputed: boolean;
    disputeReason: string;
    disputedTaxAmount: number;
    merchantReleasedSubtotal: number;
    escrowHeldAmount: number;
    disputedAt: string;
    resolutionStatus: "PENDING_CREDIT_NOTE" | "RESOLVED_REFUNDED" | "RESOLVED_SETTLED";
  };
}

export interface DunningRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceAmount: number;
  payoutUtr: string;
  channel: "WhatsApp" | "Email" | "Automated SMS";
  recipient: string;
  triggerDate: string;
  missingPeriod: string;
  messageContent: string;
  status: "SENT" | "DELIVERED" | "READ" | "ACKNOWLEDGED_UPLOADED";
  attemptsCount: number;
}

export interface GraphNode {
  id: string;
  label: string;
  gstin: string;
  city: string;
  riskScore: number;
  entityType: "Active Trading Co" | "Registered Manufacturer" | "Suspected Shell Co" | "Intermediary Conduit";
  annualTurnoverCr: number;
  employees: number;
  circularAlert?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  billingVolumeLakhs: number;
  invoicesCount: number;
  avgTaxRate: number;
  isCircular: boolean;
}

export interface GstNotice {
  id: string;
  type: string;
  section: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "Pending Response" | "Drafted" | "Replied";
  risk: "High" | "Medium" | "Low";
  description: string;
  raisedDetails: string;
  defenseStrategy?: string;
  aiDraft?: string;
}

export type PresentationScenario = "SHOWCASE" | "FRAUD_ATTACK" | "MSME_CRUNCH" | "CLEAN_SLATE";

interface FinanceState {
  transactions: Transaction[];
  payables: Payable[];
  vendors: Vendor[];
  payouts: RazorpayXPayout[];
  smartLinks: SmartCollectLink[];
  dunningLogs: DunningRecord[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  notices: GstNotice[];
  isSandboxMode: boolean;

  // Presentation & Demo Suite Controls
  activeScenario: PresentationScenario;
  showPresenterNotes: boolean;
  presentationFocusMode: boolean;

  // State Controls
  setScenario: (scenario: PresentationScenario) => void;
  resetData: () => void;
  togglePresenterNotes: () => void;
  togglePresentationFocusMode: () => void;
  toggleSandboxMode: () => void;

  // Payables & Core Actions
  addBill: (bill: Omit<Payable, "id" | "status" | "cgst" | "sgst" | "igst">) => void;
  updateBill: (id: string, updated: Omit<Payable, "id" | "status" | "cgst" | "sgst" | "igst">) => void;
  deleteBill: (id: string) => void;
  recordPayment: (id: string, amount: number, date: string) => void;
  
  // RazorpayX Payout Shield Actions
  evaluateAndCreatePayout: (payableId: string) => RazorpayXPayout;
  createCustomPayout: (data: {
    vendorName: string;
    vendorGstin: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    gstRate: number;
    hsnExpectedRate?: number;
    hasValidIrn?: boolean;
    isMsme?: boolean;
    cumulativeFyTurnover?: number;
    vendorFilingScore?: number;
  }) => RazorpayXPayout;
  processRazorpayXPayout: (payoutId: string) => Promise<{ success: boolean; utr?: string; message: string }>;
  overrideComplianceHold: (payoutId: string, reason: string) => void;
  batchProcessApprovedPayouts: () => Promise<number>;
  
  // Smart Collect & Dispute Escrow Actions
  generateSmartCollectLink: (data: {
    invoiceNumber: string;
    buyerName: string;
    buyerGstin: string;
    baseSubtotal: number;
    gstRate: number;
  }) => SmartCollectLink;
  flagTaxDisputeOnSmartLink: (linkId: string, reason: string, disputedRateDelta?: number) => void;
  resolveSmartLinkDispute: (linkId: string, resolution: "MERCHANT_RELEASE" | "BUYER_REFUND") => void;

  // Autonomous Dunning Actions
  triggerAutonomousDunning: (payoutIdOrVendorId: string, customChannel?: "WhatsApp" | "Email" | "Automated SMS", customMessage?: string) => DunningRecord;
  simulateVendorGstr1Upload: (dunningId: string) => void;

  // MSME Auto-Scheduler
  autoScheduleMsmePayout: (payoutId: string, scheduleDaysBeforeDeadline?: number) => void;

  // Graph Network Actions
  addGraphNode: (data: {
    label: string;
    gstin: string;
    city: string;
    entityType: "Active Trading Co" | "Registered Manufacturer" | "Suspected Shell Co" | "Intermediary Conduit";
    annualTurnoverCr: number;
    employees: number;
    connectToNodeId?: string;
    billingVolumeLakhs?: number;
  }) => GraphNode;

  // Notices Actions
  addNotice: (notice: Omit<GstNotice, "id">) => GstNotice;
  updateNoticeStatus: (id: string, status: GstNotice["status"], aiDraft?: string, defenseStrategy?: string) => void;
  saveNoticeDraft: (id: string, draftText: string, strategy: string) => void;

  // Quick 1-Click Simulation Triggers for Live Demos
  quickSimulate2BMatch: () => void;
  quickSimulateMsmeAutoDisburse: () => void;
  quickInjectShellCompany: () => void;
}

// -------------------------------------------------------------
// Scenario Data Presets
// -------------------------------------------------------------

const SCENARIO_SHOWCASE_DATA = {
  transactions: [
    { id: "t-1", type: "income" as const, category: "product sales", amount: 450000, date: "2026-06-01", description: "Enterprise Software License - Phase 1", vendorOrClient: "Acme Corp" },
    { id: "t-2", type: "income" as const, category: "services", amount: 120000, date: "2026-06-05", description: "Cloud Architecture Consultation", vendorOrClient: "Innovate India Labs" },
    { id: "t-3", type: "expense" as const, category: "salaries", amount: 180000, date: "2026-06-10", description: "June Payroll - Dev Team", vendorOrClient: "Employees" },
    { id: "t-4", type: "expense" as const, category: "rent", amount: 45000, date: "2026-06-01", description: "Office Rent - June", vendorOrClient: "Builders Realty" },
    { id: "t-5", type: "expense" as const, category: "marketing", amount: 30000, date: "2026-06-12", description: "Google Ads Campaign", vendorOrClient: "Alphabet Inc" },
    { id: "t-6", type: "expense" as const, category: "utilities", amount: 15000, date: "2026-06-14", description: "AWS Cloud Hosting Bill", vendorOrClient: "Amazon Web Services" },
    { id: "t-8", type: "expense" as const, category: "vendor payments", amount: 25000, date: "2026-06-02", description: "Bill Payment - RTS/2026-27/044", vendorOrClient: "Reddy Tech Solutions" }
  ],
  payables: [
    { id: "p-1", vendorName: "Reddy Tech Solutions", category: "vendor payments", billNumber: "RTS/2026-27/044", billDate: "2026-06-02", dueDate: "2026-07-02", totalAmount: 75000, paidAmount: 25000, status: "Partially Paid" as const, gstin: "27AAAAA1111A1Z1", hsnSac: "998313", gstRate: 18, cgst: 5720, sgst: 5720, igst: 0, reconciliationStatus: "Matched" as const, reconciliationReason: "GSTIN, bill amount & 18% HSN matched in GSTR-2B." },
    { id: "p-2", vendorName: "Blue Circle Marketing", category: "marketing", billNumber: "BCM-9912", billDate: "2026-06-10", dueDate: "2026-06-25", totalAmount: 50000, paidAmount: 0, status: "Pending" as const, gstin: "29BBBBB2222B2Z2", hsnSac: "998381", gstRate: 18, cgst: 0, sgst: 0, igst: 7627, reconciliationStatus: "Missing" as const, reconciliationReason: "Vendor has not filed GSTR-1. Invoice missing from GSTR-2B." },
    { id: "p-3", vendorName: "Saraswati Office Supplies", category: "utilities", billNumber: "SOS-662", billDate: "2026-05-28", dueDate: "2026-06-15", totalAmount: 12000, paidAmount: 12000, status: "Paid" as const, gstin: "19CCCCC3333C3Z3", hsnSac: "998711", gstRate: 12, cgst: 0, sgst: 0, igst: 1285, reconciliationStatus: "Matched" as const, reconciliationReason: "Perfect match in portal 2B ledger." },
    { id: "p-4", vendorName: "Apex Security & Allied Services", category: "salaries", billNumber: "APEX/881", billDate: "2026-06-05", dueDate: "2026-06-20", totalAmount: 35000, paidAmount: 10000, status: "Partially Paid" as const, gstin: "33DDDDD4444D4Z4", hsnSac: "998529", gstRate: 18, cgst: 0, sgst: 0, igst: 5338, reconciliationStatus: "Mismatch" as const, reconciliationReason: "Portal shows 12% GST instead of 18%." }
  ],
  vendors: [
    { id: "v-1", name: "Reddy Tech Solutions", gstin: "27AAAAA1111A1Z1", contact: "raj.reddy@techreddy.in", address: "Andheri East, Mumbai, Maharashtra", isMsme: true, udyamNumber: "UDYAM-MH-03-0044912", msmeCategory: "Small" as const, filingScore: 68, gstr1FilingDelayRate: 34, gstr3bStatus: "Filed" as const, cumulativeFyTurnover: 6200000, riskLevel: "Medium" as const, bankAccount: { accountNumber: "919020088192341", ifsc: "HDFC0000128", beneficiaryName: "Reddy Tech Solutions LLP", virtualVpa: "reddytech@hdfcbank" } },
    { id: "v-2", name: "Blue Circle Marketing", gstin: "29BBBBB2222B2Z2", contact: "billing@bluecircle.in", address: "Jayanagar 4th Block, Bengaluru, Karnataka", isMsme: true, udyamNumber: "UDYAM-KR-03-0099812", msmeCategory: "Micro" as const, filingScore: 98, gstr1FilingDelayRate: 2, gstr3bStatus: "Filed" as const, cumulativeFyTurnover: 2400000, riskLevel: "Low" as const, bankAccount: { accountNumber: "00120500991823", ifsc: "ICIC0000012", beneficiaryName: "Blue Circle Media Private Limited", virtualVpa: "bluecircle@icici" } },
    { id: "v-3", name: "Saraswati Office Supplies", gstin: "19CCCCC3333C3Z3", contact: "orders@saraswatios.com", address: "Salt Lake Sector V, Kolkata, West Bengal", isMsme: false, filingScore: 92, gstr1FilingDelayRate: 8, gstr3bStatus: "Filed" as const, cumulativeFyTurnover: 1450000, riskLevel: "Low" as const, bankAccount: { accountNumber: "349912001928", ifsc: "SBIN0001824", beneficiaryName: "Saraswati Office Supplies", virtualVpa: "saraswati@sbi" } },
    { id: "v-4", name: "Apex Security & Allied Services", gstin: "33DDDDD4444D4Z4", contact: "hr@apexsecurity.in", address: "T. Nagar, Chennai, Tamil Nadu", isMsme: true, udyamNumber: "UDYAM-TN-01-0081290", msmeCategory: "Small" as const, filingScore: 45, gstr1FilingDelayRate: 52, gstr3bStatus: "Delayed" as const, cumulativeFyTurnover: 8400000, riskLevel: "Critical" as const, bankAccount: { accountNumber: "2201991827419", ifsc: "KKBK0000451", beneficiaryName: "Apex Security Services", virtualVpa: "apexsecurity@kotak" } },
    { id: "v-5", name: "Kaveri Synthetic Textiles Pvt Ltd", gstin: "27ZZZZZ9999Z9Z9", contact: "contact@kaverisynthetic.org", address: "Bhiwandi Textile Cluster, Maharashtra", isMsme: false, filingScore: 22, gstr1FilingDelayRate: 88, gstr3bStatus: "Pending" as const, cumulativeFyTurnover: 98000000, riskLevel: "Critical" as const, bankAccount: { accountNumber: "50200091823901", ifsc: "UTIB0000881", beneficiaryName: "Kaveri Synthetic Textiles", virtualVpa: "kaveri@axisbank" } }
  ],
  payouts: [
    {
      id: "payout-rzp-001",
      payableId: "p-1",
      vendorId: "v-1",
      vendorName: "Reddy Tech Solutions",
      vendorGstin: "27AAAAA1111A1Z1",
      invoiceNumber: "RTS/2026-27/044",
      invoiceDate: "2026-06-02",
      invoiceAmount: 75000,
      baseAmount: 63560,
      gstAmount: 11440,
      tdsApplicable: true,
      tdsSection: "194Q (Goods > ₹50L)" as const,
      tdsRate: 0.1,
      tdsAmount: 64,
      netVendorDisbursement: 63496,
      gstWithheldFor2B: 11440,
      payoutStatus: "COMPLIANCE_HOLD" as const,
      razorpayPayoutId: "pout_M89aBc7819X",
      complianceGate: {
        passed: false,
        checks: {
          gstinVerified: true,
          gstinStatus: "ACTIVE" as const,
          hsnValid: true,
          hsnTaxRateExpected: 18,
          hsnTaxRateBilled: 18,
          irnVerified: true,
          irnHash: "9a8f23bc410982d6e3f4a1290cba76",
          circularTradingRisk: "LOW" as const,
          msme43BhDueDays: 14
        },
        reasons: [
          "ITC Risk Engine: Vendor late-filing rate is 34%. 18% GST (₹11,440) locked in Compliance Hold until GSTR-2B reflection.",
          "Section 194Q Triggered: Vendor cumulative turnover > ₹50 Lakhs. ₹64 TDS allocated to Govt Ledger."
        ]
      },
      autoScheduledDate: "2026-06-28"
    },
    {
      id: "payout-rzp-002",
      payableId: "p-2",
      vendorId: "v-2",
      vendorName: "Blue Circle Marketing",
      vendorGstin: "29BBBBB2222B2Z2",
      invoiceNumber: "BCM-9912",
      invoiceDate: "2026-06-10",
      invoiceAmount: 50000,
      baseAmount: 42373,
      gstAmount: 7627,
      tdsApplicable: true,
      tdsSection: "194J (Prof. Services 10%)" as const,
      tdsRate: 10,
      tdsAmount: 4237,
      netVendorDisbursement: 45763,
      gstWithheldFor2B: 0,
      payoutStatus: "QUEUED_FOR_DISBURSEMENT" as const,
      razorpayPayoutId: "pout_N10cDe9920Y",
      complianceGate: {
        passed: true,
        checks: {
          gstinVerified: true,
          gstinStatus: "ACTIVE" as const,
          hsnValid: true,
          hsnTaxRateExpected: 18,
          hsnTaxRateBilled: 18,
          irnVerified: true,
          irnHash: "44cb89a102eef980d21094ba55761a",
          circularTradingRisk: "LOW" as const,
          msme43BhDueDays: 32
        },
        reasons: [
          "All Gates Verified: GSTIN active, IRN QR signature verified, Micro MSME timer compliant (32 days remaining)."
        ]
      },
      autoScheduledDate: "2026-06-24"
    },
    {
      id: "payout-rzp-003",
      payableId: "p-4",
      vendorId: "v-4",
      vendorName: "Apex Security & Allied Services",
      vendorGstin: "33DDDDD4444D4Z4",
      invoiceNumber: "APEX/881",
      invoiceDate: "2026-06-05",
      invoiceAmount: 35000,
      baseAmount: 29662,
      gstAmount: 5338,
      tdsApplicable: true,
      tdsSection: "194C (Contract 2%)" as const,
      tdsRate: 2,
      tdsAmount: 593,
      netVendorDisbursement: 29069,
      gstWithheldFor2B: 5338,
      payoutStatus: "COMPLIANCE_HOLD" as const,
      razorpayPayoutId: "pout_K44mNo2231Z",
      complianceGate: {
        passed: false,
        checks: {
          gstinVerified: true,
          gstinStatus: "ACTIVE" as const,
          hsnValid: false,
          hsnTaxRateExpected: 12,
          hsnTaxRateBilled: 18,
          irnVerified: false,
          circularTradingRisk: "ELEVATED" as const,
          msme43BhDueDays: 6
        },
        reasons: [
          "GATE_BLOCKED: HSN Rate Mismatch: SAC 998529 billed at 18% instead of expected 12%.",
          "MSME 43B(h) URGENCY: Only 6 days remaining before tax disallowance under Section 43B(h)."
        ]
      }
    },
    {
      id: "payout-rzp-004",
      vendorId: "v-5",
      vendorName: "Kaveri Synthetic Textiles Pvt Ltd",
      vendorGstin: "27ZZZZZ9999Z9Z9",
      invoiceNumber: "KST-88190",
      invoiceDate: "2026-06-14",
      invoiceAmount: 1850000,
      baseAmount: 1567796,
      gstAmount: 282204,
      tdsApplicable: true,
      tdsSection: "194Q (Goods > ₹50L)" as const,
      tdsRate: 0.1,
      tdsAmount: 1568,
      netVendorDisbursement: 1848432,
      gstWithheldFor2B: 282204,
      payoutStatus: "COMPLIANCE_HOLD" as const,
      razorpayPayoutId: "pout_FRAUD_BLOCK_881",
      complianceGate: {
        passed: false,
        checks: {
          gstinVerified: false,
          gstinStatus: "SUSPENDED" as const,
          hsnValid: false,
          hsnTaxRateExpected: 5,
          hsnTaxRateBilled: 18,
          irnVerified: false,
          circularTradingRisk: "CRITICAL_LOOP" as const,
          msme43BhDueDays: 45
        },
        reasons: [
          "CRITICAL FRAUD SHIELD: Circular Trading loop detected (Kaveri -> TexHub -> Omkar -> Kaveri).",
          "GSTIN Status SUSPENDED by DGGI. 500% turnover surge with 0 physical assets.",
          "AUTONOMOUS ACTION: Payout hard blocked; RazorpayX funds frozen."
        ]
      }
    }
  ],
  smartLinks: [
    {
      id: "link-rzp-001",
      invoiceNumber: "INV-2026-099",
      buyerName: "Zenith Aerospace Systems",
      buyerGstin: "27ZENITH1234Z1",
      sellerGstin: "27AADCB2230M1Z2",
      issueDate: "2026-06-12",
      dueDate: "2026-06-27",
      baseSubtotal: 250000,
      gstRate: 18,
      gstAmount: 45000,
      totalPayable: 295000,
      irn: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      qrPayload: "upi://pay?pa=gstshield.smartcollect@razorpay&pn=TechSolutions&am=295000&tr=INV2026099&gstin=27AADCB2230M1Z2",
      paymentLinkId: "plink_Q9182390192a",
      shortUrl: "https://rzp.io/i/gstshield-q918",
      virtualUpiId: "gstshield.b2b.inv099@icici",
      status: "ACTIVE" as const
    },
    {
      id: "link-rzp-002",
      invoiceNumber: "INV-2026-084",
      buyerName: "Apex Logistics India Pvt Ltd",
      buyerGstin: "29APEXLOG8811A1",
      sellerGstin: "27AADCB2230M1Z2",
      issueDate: "2026-06-08",
      dueDate: "2026-06-23",
      baseSubtotal: 100000,
      gstRate: 18,
      gstAmount: 18000,
      totalPayable: 118000,
      irn: "9f83a1a9e8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1",
      qrPayload: "upi://pay?pa=gstshield.smartcollect@razorpay&pn=TechSolutions&am=118000&tr=INV2026084",
      paymentLinkId: "plink_P8821903912b",
      shortUrl: "https://rzp.io/i/gstshield-p882",
      virtualUpiId: "gstshield.b2b.inv084@icici",
      status: "PARTIALLY_SETTLED_DISPUTED" as const,
      dispute: {
        isDisputed: true,
        disputeReason: "Buyer claimed SAC 998311 should be 12% GST instead of 18%.",
        disputedTaxAmount: 18000,
        merchantReleasedSubtotal: 100000,
        escrowHeldAmount: 18000,
        disputedAt: "2026-06-10T14:30:00Z",
        resolutionStatus: "PENDING_CREDIT_NOTE" as const
      }
    }
  ],
  dunningLogs: [
    {
      id: "dun-001",
      vendorId: "v-1",
      vendorName: "Reddy Tech Solutions",
      vendorGstin: "27AAAAA1111A1Z1",
      invoiceNumber: "RTS/2026-27/044",
      invoiceAmount: 75000,
      payoutUtr: "RZP9012903192",
      channel: "WhatsApp" as const,
      recipient: "+91 98201 88123",
      triggerDate: "2026-06-12",
      missingPeriod: "May 2026 GSTR-1",
      messageContent: "🚨 Urgent Taxed Alert: Invoice RTS/2026-27/044 (₹75,000) paid on 02-June is missing in your GSTR-1 as of 11th June deadline. Please upload immediately to prevent Section 16 ITC disallowance for buyer.",
      status: "DELIVERED" as const,
      attemptsCount: 2
    },
    {
      id: "dun-002",
      vendorId: "v-4",
      vendorName: "Apex Security & Allied Services",
      vendorGstin: "33DDDDD4444D4Z4",
      invoiceNumber: "APEX/881",
      invoiceAmount: 35000,
      payoutUtr: "RZP8819203912",
      channel: "Email" as const,
      recipient: "accounts@apexsecurity.in",
      triggerDate: "2026-06-12",
      missingPeriod: "May 2026 GSTR-1",
      messageContent: "Formal Notice: Pending GSTR-1 filing for Tax Invoice APEX/881. GST payment ₹5,338 is in GSTR-2B compliance hold pending portal upload.",
      status: "READ" as const,
      attemptsCount: 1
    }
  ],
  graphNodes: [
    { id: "node-buyer", label: "Tech Solutions Pvt Ltd (You)", gstin: "27AADCB2230M1Z2", city: "Mumbai", riskScore: 5, entityType: "Active Trading Co" as const, annualTurnoverCr: 12.5, employees: 42 },
    { id: "node-v1", label: "Reddy Tech Solutions", gstin: "27AAAAA1111A1Z1", city: "Mumbai", riskScore: 34, entityType: "Active Trading Co" as const, annualTurnoverCr: 4.8, employees: 14 },
    { id: "node-v2", label: "Blue Circle Marketing", gstin: "29BBBBB2222B2Z2", city: "Bengaluru", riskScore: 8, entityType: "Active Trading Co" as const, annualTurnoverCr: 2.1, employees: 9 },
    { id: "node-v4", label: "Apex Security Services", gstin: "33DDDDD4444D4Z4", city: "Chennai", riskScore: 65, entityType: "Intermediary Conduit" as const, annualTurnoverCr: 6.2, employees: 55 },
    { id: "node-v5", label: "Kaveri Synthetic Textiles", gstin: "27ZZZZZ9999Z9Z9", city: "Bhiwandi", riskScore: 96, entityType: "Suspected Shell Co" as const, annualTurnoverCr: 98.0, employees: 1, circularAlert: true },
    { id: "node-shell1", label: "TexHub Fabrications LLP", gstin: "27TTTTT8888T8T8", city: "Surat", riskScore: 94, entityType: "Suspected Shell Co" as const, annualTurnoverCr: 112.0, employees: 0, circularAlert: true },
    { id: "node-shell2", label: "Omkar Trade Links", gstin: "24OOOOO7777O7O7", city: "Ahmedabad", riskScore: 92, entityType: "Suspected Shell Co" as const, annualTurnoverCr: 105.0, employees: 0, circularAlert: true }
  ],
  graphEdges: [
    { id: "e-1", source: "node-v1", target: "node-buyer", billingVolumeLakhs: 75.0, invoicesCount: 12, avgTaxRate: 18, isCircular: false },
    { id: "e-2", source: "node-v2", target: "node-buyer", billingVolumeLakhs: 24.0, invoicesCount: 6, avgTaxRate: 18, isCircular: false },
    { id: "e-3", source: "node-v4", target: "node-buyer", billingVolumeLakhs: 42.0, invoicesCount: 10, avgTaxRate: 18, isCircular: false },
    { id: "e-4", source: "node-v5", target: "node-buyer", billingVolumeLakhs: 185.0, invoicesCount: 3, avgTaxRate: 18, isCircular: true },
    { id: "e-loop-1", source: "node-v5", target: "node-shell1", billingVolumeLakhs: 890.0, invoicesCount: 18, avgTaxRate: 18, isCircular: true },
    { id: "e-loop-2", source: "node-shell1", target: "node-shell2", billingVolumeLakhs: 875.0, invoicesCount: 17, avgTaxRate: 18, isCircular: true },
    { id: "e-loop-3", source: "node-shell2", target: "node-v5", billingVolumeLakhs: 860.0, invoicesCount: 16, avgTaxRate: 18, isCircular: true }
  ],
  notices: [
    { 
      id: "GST-2026-N73-091", 
      type: "GSTR-2B Mismatch (ITC Discrepancy)", 
      section: "Section 73", 
      issueDate: "2026-06-12", 
      dueDate: "2026-07-12",
      amount: 112000, 
      status: "Pending Response" as const, 
      risk: "High" as const, 
      description: "Mismatch identified between Input Tax Credit (ITC) claimed in GSTR-3B and credit reflecting in auto-populated GSTR-2B ledger.",
      raisedDetails: "A discrepancy of ₹1,12,000 has been flagged on purchases from Reddy Tech Solutions (invoice mismatch) and Apex Security (mismatch of state codes causing IGST vs CGST/SGST mismatch)."
    },
    { 
      id: "GST-2026-N16-042", 
      type: "Delayed Input Credit Claim (Sec 16(4))", 
      section: "Section 16(4)", 
      issueDate: "2026-05-18", 
      dueDate: "2026-06-18",
      amount: 45000, 
      status: "Drafted" as const, 
      risk: "Medium" as const, 
      description: "ITC claimed on tax invoices where the date of filing by supplier exceeds the statutory deadlines prescribed under CGST regulations.",
      raisedDetails: "Credit of ₹45,000 claimed on invoice SOS-662 which was filed after November 30 of the succeeding fiscal period, violating Section 16(4)."
    },
    { 
      id: "GST-2026-N17-881", 
      type: "Claim of Ineligible Blocked Credits", 
      section: "Section 17(5)", 
      issueDate: "2026-04-05", 
      dueDate: "2026-05-05",
      amount: 15000, 
      status: "Replied" as const, 
      risk: "Low" as const, 
      description: "Taxpayer has availed input tax credit on purchases listed as blocked under Section 17(5) of the Act (hospitality, motor vehicles).",
      raisedDetails: "Input credit claimed for food catering expenses (₹5,000) and office motor vehicle leasing (₹10,000) which falls under absolute blocked credits."
    }
  ]
};

// Fraud Syndicate Attack Preset
const SCENARIO_FRAUD_DATA = {
  ...SCENARIO_SHOWCASE_DATA,
  payouts: [
    ...SCENARIO_SHOWCASE_DATA.payouts,
    {
      id: "payout-rzp-fraud-999",
      vendorId: "v-shell-alert",
      vendorName: "Phantom Mercantile Syndicate",
      vendorGstin: "27PHANT9999P1Z9",
      invoiceNumber: "PH-2026-9091",
      invoiceDate: "2026-06-18",
      invoiceAmount: 4800000,
      baseAmount: 4067796,
      gstAmount: 732204,
      tdsApplicable: true,
      tdsSection: "194Q (Goods > ₹50L)" as const,
      tdsRate: 0.1,
      tdsAmount: 4068,
      netVendorDisbursement: 4795932,
      gstWithheldFor2B: 732204,
      payoutStatus: "COMPLIANCE_HOLD" as const,
      razorpayPayoutId: "pout_DGGI_SUSPENDED_99",
      complianceGate: {
        passed: false,
        checks: {
          gstinVerified: false,
          gstinStatus: "SUSPENDED" as const,
          hsnValid: false,
          hsnTaxRateExpected: 18,
          hsnTaxRateBilled: 18,
          irnVerified: false,
          circularTradingRisk: "CRITICAL_LOOP" as const,
          msme43BhDueDays: 45
        },
        reasons: [
          "DGGI EMERGENCY ALERT: GSTIN 27PHANT9999P1Z9 suspended for issuing fake invoices without physical goods.",
          "CIRCULAR TRADING DETECTED: Node connects to 3 high-velocity pass-through accounts in Surat shell cluster.",
          "AUTONOMOUS ACTION: RazorpayX Payout frozen immediately."
        ]
      }
    }
  ]
};

// MSME Crunch Scenario Preset (Highlighting 48h emergency SLA deadline)
const SCENARIO_MSME_DATA = {
  ...SCENARIO_SHOWCASE_DATA,
  payouts: SCENARIO_SHOWCASE_DATA.payouts.map((p, idx) => {
    if (idx === 0) {
      return {
        ...p,
        complianceGate: {
          ...p.complianceGate,
          checks: {
            ...p.complianceGate.checks,
            msme43BhDueDays: 2 // 48h remaining!
          },
          reasons: [
            "CRITICAL MSME SECTION 43B(h) ALERT: Only 48 hours remaining before mandatory tax deduction disallowance!",
            "Autonomous Auto-Scheduler has queued payout for immediate execution."
          ]
        },
        autoScheduledDate: new Date().toISOString().split("T")[0]
      };
    }
    return p;
  })
};

// Clean Slate Scenario Preset (For live uploads)
const SCENARIO_CLEAN_DATA = {
  transactions: [
    { id: "t-init", type: "income" as const, category: "services", amount: 500000, date: "2026-06-01", description: "Opening Operational Balance", vendorOrClient: "Enterprise Bank" }
  ],
  payables: [],
  vendors: [],
  payouts: [],
  smartLinks: [],
  dunningLogs: [],
  graphNodes: [
    { id: "node-buyer", label: "Tech Solutions Pvt Ltd (You)", gstin: "27AADCB2230M1Z2", city: "Mumbai", riskScore: 5, entityType: "Active Trading Co" as const, annualTurnoverCr: 12.5, employees: 42 }
  ],
  graphEdges: [],
  notices: []
};

function computeGstSplits(total: number, rate: number, gstin: string) {
  const baseValue = Math.round(total / (1 + rate / 100));
  const taxTotal = total - baseValue;
  const isLocal = !gstin || gstin.toUpperCase().startsWith("27");
  
  if (isLocal) {
    return {
      cgst: Math.round(taxTotal / 2),
      sgst: Math.round(taxTotal / 2),
      igst: 0
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: taxTotal
    };
  }
}

function determineStatus(paid: number, total: number): "Pending" | "Partially Paid" | "Paid" {
  if (paid <= 0) return "Pending";
  if (paid >= total) return "Paid";
  return "Partially Paid";
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: SCENARIO_SHOWCASE_DATA.transactions,
      payables: SCENARIO_SHOWCASE_DATA.payables,
      vendors: SCENARIO_SHOWCASE_DATA.vendors,
      payouts: SCENARIO_SHOWCASE_DATA.payouts,
      smartLinks: SCENARIO_SHOWCASE_DATA.smartLinks,
      dunningLogs: SCENARIO_SHOWCASE_DATA.dunningLogs,
      graphNodes: SCENARIO_SHOWCASE_DATA.graphNodes,
      graphEdges: SCENARIO_SHOWCASE_DATA.graphEdges,
      notices: SCENARIO_SHOWCASE_DATA.notices,
      isSandboxMode: true,

      activeScenario: "SHOWCASE",
      showPresenterNotes: false,
      presentationFocusMode: false,

      // Scenario Engine
      setScenario: (scenario) => {
        let selectedData = SCENARIO_SHOWCASE_DATA;
        if (scenario === "FRAUD_ATTACK") selectedData = SCENARIO_FRAUD_DATA;
        if (scenario === "MSME_CRUNCH") selectedData = SCENARIO_MSME_DATA;
        if (scenario === "CLEAN_SLATE") selectedData = SCENARIO_CLEAN_DATA;

        set({
          activeScenario: scenario,
          transactions: selectedData.transactions,
          payables: selectedData.payables,
          vendors: selectedData.vendors,
          payouts: selectedData.payouts,
          smartLinks: selectedData.smartLinks,
          dunningLogs: selectedData.dunningLogs,
          graphNodes: selectedData.graphNodes,
          graphEdges: selectedData.graphEdges,
          notices: selectedData.notices
        });
      },

      resetData: () => {
        const scenario = get().activeScenario;
        get().setScenario(scenario);
      },

      togglePresenterNotes: () => set((state) => ({ showPresenterNotes: !state.showPresenterNotes })),
      togglePresentationFocusMode: () => set((state) => ({ presentationFocusMode: !state.presentationFocusMode })),
      toggleSandboxMode: () => set((state) => ({ isSandboxMode: !state.isSandboxMode })),

      // Core Payables
      addBill: (bill) => set((state) => {
        const id = `p-${Date.now()}`;
        const splits = computeGstSplits(bill.totalAmount, bill.gstRate, bill.gstin || "");
        const status = determineStatus(bill.paidAmount, bill.totalAmount);
        
        const newBill: Payable = {
          ...bill,
          id,
          status,
          reconciliationStatus: "Matched",
          reconciliationReason: "Auto-synced with GSTR-2B ledger.",
          ...splits
        };

        const updatedTx = [...state.transactions];
        if (bill.paidAmount > 0) {
          updatedTx.push({
            id: `t-pay-${Date.now()}`,
            type: "expense",
            category: bill.category,
            amount: bill.paidAmount,
            date: bill.billDate,
            description: `Initial payment on Bill ${bill.billNumber}`,
            vendorOrClient: bill.vendorName
          });
        }

        const updatedVendors = [...state.vendors];
        if (bill.gstin && !updatedVendors.some(v => v.name.toLowerCase() === bill.vendorName.toLowerCase())) {
          updatedVendors.push({
            id: `v-${Date.now()}`,
            name: bill.vendorName,
            gstin: bill.gstin,
            contact: "finance@vendor.com",
            address: "India",
            isMsme: true,
            msmeCategory: "Small",
            filingScore: 85,
            gstr1FilingDelayRate: 10,
            cumulativeFyTurnover: 1200000,
            riskLevel: "Low"
          });
        }

        return {
          payables: [...state.payables, newBill],
          transactions: updatedTx,
          vendors: updatedVendors
        };
      }),

      updateBill: (id, updated) => set((state) => {
        const idx = state.payables.findIndex(p => p.id === id);
        if (idx === -1) return {};

        const oldBill = state.payables[idx];
        const splits = computeGstSplits(updated.totalAmount, updated.gstRate, updated.gstin || "");
        const status = determineStatus(updated.paidAmount, updated.totalAmount);

        const newBill: Payable = {
          ...updated,
          id,
          status,
          reconciliationStatus: oldBill.reconciliationStatus || "Matched",
          ...splits
        };

        const payables = [...state.payables];
        payables[idx] = newBill;

        const updatedTx = [...state.transactions];
        const payDiff = updated.paidAmount - oldBill.paidAmount;
        if (payDiff > 0) {
          updatedTx.push({
            id: `t-pay-${Date.now()}`,
            type: "expense",
            category: updated.category,
            amount: payDiff,
            date: new Date().toISOString().split('T')[0],
            description: `Adjustment payment on Bill ${updated.billNumber}`,
            vendorOrClient: updated.vendorName
          });
        }

        return { payables, transactions: updatedTx };
      }),

      deleteBill: (id) => set((state) => ({
        payables: state.payables.filter(p => p.id !== id)
      })),

      recordPayment: (id, amount, date) => set((state) => {
        const payables = state.payables.map((p) => {
          if (p.id !== id) return p;
          
          const newPaid = Math.min(p.paidAmount + amount, p.totalAmount);
          const status = determineStatus(newPaid, p.totalAmount);
          return {
            ...p,
            paidAmount: newPaid,
            status
          };
        });

        const bill = state.payables.find(p => p.id === id);
        const updatedTx = [...state.transactions];
        if (bill) {
          updatedTx.push({
            id: `t-pay-${Date.now()}`,
            type: "expense",
            category: bill.category,
            amount: amount,
            date: date,
            description: `Payment for Bill ${bill.billNumber}`,
            vendorOrClient: bill.vendorName
          });
        }

        return { payables, transactions: updatedTx };
      }),

      // Pillar 1: Evaluate & Gate RazorpayX Payout
      evaluateAndCreatePayout: (payableId: string) => {
        const payable = get().payables.find(p => p.id === payableId);
        if (!payable) throw new Error("Payable not found");

        const vendor = get().vendors.find(v => v.name.toLowerCase() === payable.vendorName.toLowerCase()) || {
          id: `v-${Date.now()}`,
          name: payable.vendorName,
          gstin: payable.gstin || "27XXXXX0000X0Z0",
          contact: "accounts@vendor.in",
          address: "India",
          cumulativeFyTurnover: 5500000,
          filingScore: 80,
          gstr1FilingDelayRate: 15,
          isMsme: true,
          msmeCategory: "Small" as const
        };

        const baseAmount = Math.round(payable.totalAmount / (1 + payable.gstRate / 100));
        const gstAmount = payable.totalAmount - baseAmount;
        
        // Section 194Q TDS computation
        const exceeds50L = (vendor.cumulativeFyTurnover || 0) > 5000000;
        const tdsRate = exceeds50L ? 0.1 : 0;
        const tdsAmount = exceeds50L ? Math.round(baseAmount * 0.001) : 0;
        const tdsSection = exceeds50L ? "194Q (Goods > ₹50L)" as const : "None" as const;

        // ITC Gating: If vendor has poor filing score or > 25% late filings, withhold GST portion
        const shouldWithholdGst = (vendor.filingScore || 100) < 70 || (vendor.gstr1FilingDelayRate || 0) > 25;
        const gstWithheldFor2B = shouldWithholdGst ? gstAmount : 0;

        const netVendorDisbursement = payable.totalAmount - tdsAmount - gstWithheldFor2B;

        // Gate checks
        const gstinValid = !!(payable.gstin && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(payable.gstin));
        const passed = gstinValid && !shouldWithholdGst;

        const reasons: string[] = [];
        if (!gstinValid) reasons.push("GATE_BLOCKED: GSTIN is missing or invalid format.");
        if (shouldWithholdGst) reasons.push(`ITC Risk Engine: Vendor filing reliability score is low (${vendor.filingScore}/100). Withholding ₹${gstAmount} GST.`);
        if (exceeds50L) reasons.push(`Section 194Q Applied: Cumulative purchases > ₹50L. ₹${tdsAmount} allocated to TDS Tax Ledger.`);

        const payout: RazorpayXPayout = {
          id: `payout-rzp-${Date.now()}`,
          payableId: payable.id,
          vendorId: vendor.id,
          vendorName: vendor.name,
          vendorGstin: payable.gstin || vendor.gstin,
          invoiceNumber: payable.billNumber,
          invoiceDate: payable.billDate,
          invoiceAmount: payable.totalAmount,
          baseAmount,
          gstAmount,
          tdsApplicable: exceeds50L,
          tdsSection,
          tdsRate,
          tdsAmount,
          netVendorDisbursement,
          gstWithheldFor2B,
          payoutStatus: passed ? "QUEUED_FOR_DISBURSEMENT" : "COMPLIANCE_HOLD",
          razorpayPayoutId: `pout_${Math.random().toString(36).substring(2, 11)}`,
          complianceGate: {
            passed,
            checks: {
              gstinVerified: gstinValid,
              gstinStatus: gstinValid ? "ACTIVE" : "INVALID",
              hsnValid: true,
              hsnTaxRateExpected: payable.gstRate,
              hsnTaxRateBilled: payable.gstRate,
              irnVerified: true,
              circularTradingRisk: "LOW",
              msme43BhDueDays: 28
            },
            reasons
          }
        };

        set((state) => ({ payouts: [payout, ...state.payouts] }));
        return payout;
      },

      createCustomPayout: (data) => {
        const baseAmount = Math.round(data.invoiceAmount / (1 + data.gstRate / 100));
        const gstAmount = data.invoiceAmount - baseAmount;

        const exceeds50L = (data.cumulativeFyTurnover || 0) > 5000000;
        const tdsRate = exceeds50L ? 0.1 : 0;
        const tdsAmount = exceeds50L ? Math.round(baseAmount * 0.001) : 0;
        const tdsSection = exceeds50L ? "194Q (Goods > ₹50L)" as const : "None" as const;

        const filingScore = data.vendorFilingScore ?? 80;
        const shouldWithholdGst = filingScore < 70;
        const gstWithheldFor2B = shouldWithholdGst ? gstAmount : 0;

        const netVendorDisbursement = data.invoiceAmount - tdsAmount - gstWithheldFor2B;

        const gstinValid = !!(data.vendorGstin && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.vendorGstin.toUpperCase()));
        const expectedHsnRate = data.hsnExpectedRate ?? data.gstRate;
        const hsnValid = data.gstRate === expectedHsnRate;
        const irnVerified = data.hasValidIrn ?? true;
        const msmeDays = data.isMsme ? 15 : 45;

        const passed = gstinValid && hsnValid && irnVerified && !shouldWithholdGst;

        const reasons: string[] = [];
        if (!gstinValid) reasons.push("GATE_BLOCKED: GSTIN format is invalid or unregistered.");
        if (!hsnValid) reasons.push(`GATE_BLOCKED: HSN Rate Mismatch (Billed ${data.gstRate}% vs Expected ${expectedHsnRate}%).`);
        if (!irnVerified) reasons.push("GATE_BLOCKED: e-Invoice IRN QR signature missing or invalid.");
        if (shouldWithholdGst) reasons.push(`ITC Risk Engine: Vendor score is ${filingScore}/100. Withholding ₹${gstAmount} GST pending GSTR-2B reflection.`);
        if (exceeds50L) reasons.push(`Section 194Q Applied: Turnover > ₹50L. ₹${tdsAmount} auto-allocated to Govt TDS ledger.`);
        if (passed) reasons.push("All Gates Verified: GSTIN active, IRN QR signature verified, TDS compliant.");

        const payout: RazorpayXPayout = {
          id: `payout-rzp-${Date.now()}`,
          vendorId: `v-${Date.now()}`,
          vendorName: data.vendorName,
          vendorGstin: data.vendorGstin.toUpperCase(),
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate,
          invoiceAmount: data.invoiceAmount,
          baseAmount,
          gstAmount,
          tdsApplicable: exceeds50L,
          tdsSection,
          tdsRate,
          tdsAmount,
          netVendorDisbursement,
          gstWithheldFor2B,
          payoutStatus: passed ? "QUEUED_FOR_DISBURSEMENT" : "COMPLIANCE_HOLD",
          razorpayPayoutId: `pout_${Math.random().toString(36).substring(2, 11)}`,
          complianceGate: {
            passed,
            checks: {
              gstinVerified: gstinValid,
              gstinStatus: gstinValid ? "ACTIVE" : "INVALID",
              hsnValid,
              hsnTaxRateExpected: expectedHsnRate,
              hsnTaxRateBilled: data.gstRate,
              irnVerified,
              circularTradingRisk: "LOW",
              msme43BhDueDays: msmeDays
            },
            reasons
          },
          autoScheduledDate: new Date(Date.now() + msmeDays * 86400000).toISOString().split("T")[0]
        };

        const existingVendor = get().vendors.find(v => v.gstin === data.vendorGstin.toUpperCase());
        if (!existingVendor) {
          const newVendor: Vendor = {
            id: payout.vendorId,
            name: data.vendorName,
            gstin: data.vendorGstin.toUpperCase(),
            contact: "accounts@vendor.com",
            address: "India",
            isMsme: data.isMsme ?? true,
            msmeCategory: "Small",
            filingScore,
            gstr1FilingDelayRate: filingScore < 70 ? 35 : 5,
            cumulativeFyTurnover: data.cumulativeFyTurnover || 1000000,
            riskLevel: filingScore < 70 ? "Medium" : "Low"
          };
          set((state) => ({ vendors: [newVendor, ...state.vendors] }));
        }

        set((state) => ({ payouts: [payout, ...state.payouts] }));
        return payout;
      },

      processRazorpayXPayout: async (payoutId: string) => {
        const payout = get().payouts.find(p => p.id === payoutId);
        if (!payout) return { success: false, message: "Payout record not found" };

        if (payout.payoutStatus === "COMPLIANCE_HOLD") {
          return {
            success: false,
            message: "Cannot process payout: Pre-Disbursement Compliance Hold is active."
          };
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        const utr = `RZP${Date.now().toString().slice(-9)}`;

        set((state) => ({
          payouts: state.payouts.map(p => {
            if (p.id !== payoutId) return p;
            return {
              ...p,
              payoutStatus: "PROCESSED",
              razorpayUtr: utr,
              processedAt: new Date().toISOString()
            };
          }),
          transactions: [
            ...state.transactions,
            {
              id: `t-rzp-${Date.now()}`,
              type: "expense",
              category: "RazorpayX Vendor Payout",
              amount: payout.netVendorDisbursement,
              date: new Date().toISOString().split("T")[0],
              description: `RazorpayX Net Payout [UTR: ${utr}] - Inv ${payout.invoiceNumber}`,
              vendorOrClient: payout.vendorName
            },
            ...(payout.tdsAmount > 0 ? [{
              id: `t-tds-${Date.now()}`,
              type: "expense" as const,
              category: "TDS Govt Tax Ledger (Sec 194Q)",
              amount: payout.tdsAmount,
              date: new Date().toISOString().split("T")[0],
              description: `Govt TDS deduction on Inv ${payout.invoiceNumber}`,
              vendorOrClient: "Income Tax Department"
            }] : [])
          ]
        }));

        return {
          success: true,
          utr,
          message: `Disbursement executed via RazorpayX. Net: ₹${payout.netVendorDisbursement.toLocaleString()}, TDS Ledger: ₹${payout.tdsAmount}`
        };
      },

      overrideComplianceHold: (payoutId: string, reason: string) => {
        set((state) => ({
          payouts: state.payouts.map(p => {
            if (p.id !== payoutId) return p;
            return {
              ...p,
              payoutStatus: "QUEUED_FOR_DISBURSEMENT",
              complianceGate: {
                ...p.complianceGate,
                passed: true,
                reasons: [...p.complianceGate.reasons, `MANUAL OVERRIDE: ${reason}`]
              }
            };
          })
        }));
      },

      batchProcessApprovedPayouts: async () => {
        const queued = get().payouts.filter(p => p.payoutStatus === "QUEUED_FOR_DISBURSEMENT");
        for (const item of queued) {
          await get().processRazorpayXPayout(item.id);
        }
        return queued.length;
      },

      // Pillar 2: Dynamic B2B Smart Collect Links
      generateSmartCollectLink: (data) => {
        const gstAmount = Math.round(data.baseSubtotal * (data.gstRate / 100));
        const totalPayable = data.baseSubtotal + gstAmount;
        const linkId = `link-rzp-${Date.now()}`;
        const randomHash = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

        const newLink: SmartCollectLink = {
          id: linkId,
          invoiceNumber: data.invoiceNumber,
          buyerName: data.buyerName,
          buyerGstin: data.buyerGstin,
          sellerGstin: "27AADCB2230M1Z2",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          baseSubtotal: data.baseSubtotal,
          gstRate: data.gstRate,
          gstAmount,
          totalPayable,
          irn: `irn_einv_${randomHash}`,
          qrPayload: `upi://pay?pa=gstshield.smartcollect@razorpay&pn=TechSolutions&am=${totalPayable}&tr=${data.invoiceNumber}&gstin=27AADCB2230M1Z2`,
          paymentLinkId: `plink_${Math.random().toString(36).substring(2, 12)}`,
          shortUrl: `https://rzp.io/i/gstshield-${Math.random().toString(36).substring(2, 6)}`,
          virtualUpiId: `gstshield.b2b.${data.invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@icici`,
          status: "ACTIVE"
        };

        set((state) => ({ smartLinks: [newLink, ...state.smartLinks] }));
        return newLink;
      },

      flagTaxDisputeOnSmartLink: (linkId: string, reason: string, disputedRateDelta = 6) => {
        set((state) => ({
          smartLinks: state.smartLinks.map(l => {
            if (l.id !== linkId) return l;
            const disputedTaxAmount = Math.round(l.baseSubtotal * (disputedRateDelta / 100));
            return {
              ...l,
              status: "PARTIALLY_SETTLED_DISPUTED",
              dispute: {
                isDisputed: true,
                disputeReason: reason,
                disputedTaxAmount,
                merchantReleasedSubtotal: l.baseSubtotal,
                escrowHeldAmount: disputedTaxAmount,
                disputedAt: new Date().toISOString(),
                resolutionStatus: "PENDING_CREDIT_NOTE"
              }
            };
          })
        }));
      },

      resolveSmartLinkDispute: (linkId: string, resolution: "MERCHANT_RELEASE" | "BUYER_REFUND") => {
        set((state) => ({
          smartLinks: state.smartLinks.map(l => {
            if (l.id !== linkId || !l.dispute) return l;
            return {
              ...l,
              status: "SETTLED",
              dispute: {
                ...l.dispute,
                resolutionStatus: resolution === "MERCHANT_RELEASE" ? "RESOLVED_SETTLED" : "RESOLVED_REFUNDED"
              }
            };
          })
        }));
      },

      // Pillar 3: Autonomous Dunning
      triggerAutonomousDunning: (payoutIdOrVendorId: string, customChannel = "WhatsApp", customMessage?: string) => {
        const vendor = get().vendors.find(v => v.id === payoutIdOrVendorId) || get().vendors[0];
        const payout = get().payouts.find(p => p.vendorId === vendor.id) || get().payouts[0];

        const defaultMsg = `🤖 Autonomous Taxed Notice: Vendor Payout of ₹${(payout?.invoiceAmount || 50000).toLocaleString()} for ${payout?.invoiceNumber || "invoice"} was processed. GSTR-1 return is not reflected on GSTN portal. Please upload before monthly lock to release withheld GST credits.`;

        const dunning: DunningRecord = {
          id: `dun-${Date.now()}`,
          vendorId: vendor.id,
          vendorName: vendor.name,
          vendorGstin: vendor.gstin,
          invoiceNumber: payout?.invoiceNumber || "INV-GEN-2026",
          invoiceAmount: payout?.invoiceAmount || 50000,
          payoutUtr: payout?.razorpayUtr || "RZP9012903192",
          channel: customChannel,
          recipient: vendor.contact,
          triggerDate: new Date().toISOString().split("T")[0],
          missingPeriod: "GSTR-1 (Overdue post 11th)",
          messageContent: customMessage || defaultMsg,
          status: "SENT",
          attemptsCount: 1
        };

        set((state) => ({ dunningLogs: [dunning, ...state.dunningLogs] }));
        return dunning;
      },

      simulateVendorGstr1Upload: (dunningId: string) => {
        set((state) => {
          const log = state.dunningLogs.find(d => d.id === dunningId);
          if (!log) return state;

          return {
            dunningLogs: state.dunningLogs.map(d => {
              if (d.id !== dunningId) return d;
              return { ...d, status: "ACKNOWLEDGED_UPLOADED" };
            }),
            payouts: state.payouts.map(p => {
              if (p.vendorId === log.vendorId && p.payoutStatus === "COMPLIANCE_HOLD") {
                return {
                  ...p,
                  gstWithheldFor2B: 0,
                  payoutStatus: "QUEUED_FOR_DISBURSEMENT",
                  complianceGate: {
                    ...p.complianceGate,
                    passed: true,
                    reasons: [...p.complianceGate.reasons, "GSTR-2B Lock Released: Vendor acknowledged & uploaded GSTR-1."]
                  }
                };
              }
              return p;
            })
          };
        });
      },

      // Pillar 4: MSME Auto-Scheduler
      autoScheduleMsmePayout: (payoutId: string, scheduleDaysBeforeDeadline = 2) => {
        set((state) => ({
          payouts: state.payouts.map(p => {
            if (p.id !== payoutId) return p;
            const dueDays = p.complianceGate?.checks?.msme43BhDueDays || 15;
            const targetDays = Math.max(1, dueDays - scheduleDaysBeforeDeadline);
            const scheduled = new Date(Date.now() + targetDays * 86400000).toISOString().split("T")[0];
            return {
              ...p,
              autoScheduledDate: scheduled,
              complianceGate: {
                ...p.complianceGate,
                reasons: [...p.complianceGate.reasons, `MSME 43B(h) Shield: Auto-scheduled for ${scheduled} (${scheduleDaysBeforeDeadline}d safety buffer)`]
              }
            };
          })
        }));
      },

      // Pillar 5: Add Graph Node Dynamically
      addGraphNode: (data) => {
        const nodeId = `node-custom-${Date.now()}`;
        const isShell = data.entityType === "Suspected Shell Co" || (data.annualTurnoverCr > 50 && data.employees <= 1);
        const riskScore = isShell ? 92 : data.employees > 10 ? 15 : 45;

        const newNode: GraphNode = {
          id: nodeId,
          label: data.label,
          gstin: data.gstin.toUpperCase(),
          city: data.city,
          riskScore,
          entityType: data.entityType,
          annualTurnoverCr: data.annualTurnoverCr,
          employees: data.employees,
          circularAlert: isShell
        };

        const targetId = data.connectToNodeId || "node-buyer";
        const newEdge: GraphEdge = {
          id: `e-${Date.now()}`,
          source: nodeId,
          target: targetId,
          billingVolumeLakhs: data.billingVolumeLakhs || 50,
          invoicesCount: 4,
          avgTaxRate: 18,
          isCircular: isShell
        };

        set((state) => ({
          graphNodes: [...state.graphNodes, newNode],
          graphEdges: [...state.graphEdges, newEdge]
        }));

        return newNode;
      },

      // Notices Hub
      addNotice: (notice) => {
        const newNotice: GstNotice = {
          ...notice,
          id: `GST-2026-N-${Date.now().toString().slice(-4)}`
        };
        set((state) => ({ notices: [newNotice, ...state.notices] }));
        return newNotice;
      },

      updateNoticeStatus: (id, status, aiDraft, defenseStrategy) => {
        set((state) => ({
          notices: state.notices.map(n => {
            if (n.id !== id) return n;
            return {
              ...n,
              status,
              ...(aiDraft ? { aiDraft } : {}),
              ...(defenseStrategy ? { defenseStrategy } : {})
            };
          })
        }));
      },

      saveNoticeDraft: (id, draftText, strategy) => {
        set((state) => ({
          notices: state.notices.map(n => {
            if (n.id !== id) return n;
            return {
              ...n,
              status: "Drafted",
              aiDraft: draftText,
              defenseStrategy: strategy
            };
          })
        }));
      },

      // Quick 1-Click Live Simulation Triggers
      quickSimulate2BMatch: () => {
        set((state) => ({
          payouts: state.payouts.map(p => {
            if (p.payoutStatus === "COMPLIANCE_HOLD" && p.gstWithheldFor2B > 0) {
              return {
                ...p,
                gstWithheldFor2B: 0,
                payoutStatus: "QUEUED_FOR_DISBURSEMENT",
                complianceGate: {
                  ...p.complianceGate,
                  passed: true,
                  reasons: [...p.complianceGate.reasons, "GSTR-2B Reconciled: Portal return matched. Withheld GST released."]
                }
              };
            }
            return p;
          }),
          payables: state.payables.map(p => ({
            ...p,
            reconciliationStatus: "Matched",
            reconciliationReason: "Live 2B sync validated."
          }))
        }));
      },

      quickSimulateMsmeAutoDisburse: () => {
        set((state) => ({
          payouts: state.payouts.map(p => {
            return {
              ...p,
              autoScheduledDate: new Date().toISOString().split("T")[0],
              payoutStatus: "QUEUED_FOR_DISBURSEMENT",
              complianceGate: {
                ...p.complianceGate,
                passed: true,
                reasons: [...p.complianceGate.reasons, "MSME 43B(h) Auto-Disburse: 48h deadline shield executed."]
              }
            };
          })
        }));
      },

      quickInjectShellCompany: () => {
        const shellId = `node-shell-${Date.now()}`;
        const newShell: GraphNode = {
          id: shellId,
          label: "Vanguard Synergy Tradelinks",
          gstin: "27VANGU9988V1Z3",
          city: "Surat",
          riskScore: 98,
          entityType: "Suspected Shell Co",
          annualTurnoverCr: 145.0,
          employees: 0,
          circularAlert: true
        };
        const newEdge: GraphEdge = {
          id: `e-shell-${Date.now()}`,
          source: shellId,
          target: "node-buyer",
          billingVolumeLakhs: 240.0,
          invoicesCount: 2,
          avgTaxRate: 18,
          isCircular: true
        };
        set((state) => ({
          graphNodes: [...state.graphNodes, newShell],
          graphEdges: [...state.graphEdges, newEdge]
        }));
      }
    }),
    {
      name: "gstshield-finops-store-v2",
    }
  )
);
