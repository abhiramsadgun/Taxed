"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  CreditCard, 
  Lock, 
  FileText, 
  Building2, 
  Scale, 
  DollarSign, 
  Layers, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Percent,
  Check,
  X
} from "lucide-react";
import { useFinanceStore, type RazorpayXPayout } from "@/store/useFinanceStore";

export default function RazorpayXPayoutShieldPage() {
  const { 
    payouts, 
    payables, 
    vendors, 
    isSandboxMode,
    evaluateAndCreatePayout, 
    createCustomPayout, 
    processRazorpayXPayout, 
    overrideComplianceHold,
    batchProcessApprovedPayouts 
  } = useFinanceStore();

  const [selectedPayout, setSelectedPayout] = useState<RazorpayXPayout | null>(payouts[0] || null);
  const [filterTab, setFilterTab] = useState<"all" | "holds" | "queued" | "processed">("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [selectedPayableToGate, setSelectedPayableToGate] = useState<string>(payables[0]?.id || "");

  // Custom Invoice Evaluator Modal State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [cVendor, setCVendor] = useState("Delta Infra Solutions");
  const [cGstin, setCGstin] = useState("27DELTA9988D1Z2");
  const [cInvNumber, setCInvNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [cAmount, setCAmount] = useState(125000);
  const [cGstRate, setCGstRate] = useState(18);
  const [cHsnExpected, setCHsnExpected] = useState(18);
  const [cTurnover, setCTurnover] = useState(6500000);
  const [cIsMsme, setCIsMsme] = useState(true);
  const [cFilingScore, setCFilingScore] = useState(85);
  const [cHasIrn, setCHasIrn] = useState(true);

  const filteredPayouts = payouts.filter((p) => {
    if (filterTab === "holds") return p.payoutStatus === "COMPLIANCE_HOLD";
    if (filterTab === "queued") return p.payoutStatus === "QUEUED_FOR_DISBURSEMENT";
    if (filterTab === "processed") return p.payoutStatus === "PROCESSED";
    return true;
  });

  // FinOps Totals
  const totalGatedValue = payouts.reduce((acc, p) => acc + p.invoiceAmount, 0);
  const totalHoldsValue = payouts.filter((p) => p.payoutStatus === "COMPLIANCE_HOLD").reduce((acc, p) => acc + p.invoiceAmount, 0);
  const totalTdsAllocated = payouts.reduce((acc, p) => acc + p.tdsAmount, 0);
  const totalDisbursed = payouts.filter((p) => p.payoutStatus === "PROCESSED").reduce((acc, p) => acc + p.netVendorDisbursement, 0);

  const handleProcessPayout = async (payoutId: string) => {
    setIsProcessing(true);
    setActionMessage(null);
    const res = await processRazorpayXPayout(payoutId);
    setIsProcessing(false);
    setActionMessage(res.message);
    const updated = useFinanceStore.getState().payouts.find((p) => p.id === payoutId);
    if (updated) setSelectedPayout(updated);
  };

  const handleBatchProcess = async () => {
    setIsBatchProcessing(true);
    const count = await batchProcessApprovedPayouts();
    setIsBatchProcessing(false);
    setActionMessage(`Batch Complete: ${count} compliance-verified payouts disbursed via RazorpayX.`);
  };

  const handleGateNewPayable = () => {
    if (!selectedPayableToGate) return;
    const newPayout = evaluateAndCreatePayout(selectedPayableToGate);
    setSelectedPayout(newPayout);
    setActionMessage(`Evaluated Bill: Gate Result: ${newPayout.complianceGate.passed ? "APPROVED" : "COMPLIANCE_HOLD"}`);
  };

  const handleConfirmOverride = () => {
    if (!selectedPayout || !overrideReason.trim()) return;
    overrideComplianceHold(selectedPayout.id, overrideReason);
    setOverrideModalOpen(false);
    setOverrideReason("");
    const updated = useFinanceStore.getState().payouts.find((p) => p.id === selectedPayout.id);
    if (updated) setSelectedPayout(updated);
    setActionMessage("Compliance Hold overridden with Finance Controller approval.");
  };

  const handleCreateCustomPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayout = createCustomPayout({
      vendorName: cVendor,
      vendorGstin: cGstin,
      invoiceNumber: cInvNumber,
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceAmount: Number(cAmount),
      gstRate: Number(cGstRate),
      hsnExpectedRate: Number(cHsnExpected),
      hasValidIrn: cHasIrn,
      isMsme: cIsMsme,
      cumulativeFyTurnover: Number(cTurnover),
      vendorFilingScore: Number(cFilingScore)
    });
    setSelectedPayout(newPayout);
    setEvalModalOpen(false);
    setActionMessage(`Live Gate Evaluated for ${newPayout.vendorName}: ${newPayout.complianceGate.passed ? "APPROVED FOR DISBURSEMENT" : "PLACED ON COMPLIANCE HOLD"}`);
    setCInvNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                RazorpayX Ecosystem Integration
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verify-Before-Pay Gating Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Autonomous Vendor Payout Shield
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Every vendor payout is mathematically verified against GSTIN registries, HSN tax rates, IRN signatures, and Section 194Q TDS rules <strong className="text-white">before</strong> funds move through RazorpayX. Non-compliant disbursements are held autonomously.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setEvalModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              + Evaluate New Invoice
            </button>
            <button
              onClick={handleBatchProcess}
              disabled={isBatchProcessing || payouts.filter((p) => p.payoutStatus === "QUEUED_FOR_DISBURSEMENT").length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${isBatchProcessing ? "animate-spin" : ""}`} />
              {isBatchProcessing ? "Executing Batch..." : "Batch Disburse Approved"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Total Gated Outflow</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">₹{totalGatedValue.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">{payouts.length} Invoices</span> in RazorpayX pipeline
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-rose-500/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Compliance Holds (Frozen)</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">₹{totalHoldsValue.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            <span className="text-rose-400 font-bold">{payouts.filter((p) => p.payoutStatus === "COMPLIANCE_HOLD").length} Payouts</span> blocked before disbursement
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Disbursed via RazorpayX</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">₹{totalDisbursed.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            <span className="text-emerald-400 font-semibold">{payouts.filter((p) => p.payoutStatus === "PROCESSED").length} Successful</span> instant settlements
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Auto TDS (Sec 194Q & 194J)</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">₹{totalTdsAllocated.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Allocated to Govt Tax Ledger on the fly
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/30 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-200">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-zinc-500 hover:text-white text-xs">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Main Grid: Pipeline Table + Detail Inspect Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gated Payouts Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Pre-Disbursement Payout Queue</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {filteredPayouts.length}
              </span>
            </div>

            {/* Quick Gate Trigger from un-gated bills */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPayableToGate}
                onChange={(e) => setSelectedPayableToGate(e.target.value)}
                className="text-xs bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500 max-w-[200px] truncate"
              >
                {payables.map((p) => (
                  <option key={p.id} value={p.id}>
                    Gate: {p.vendorName} ({p.billNumber})
                  </option>
                ))}
              </select>
              <button
                onClick={handleGateNewPayable}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all shrink-0 cursor-pointer"
              >
                Run Gate
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-white/5 text-xs overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
                filterTab === "all" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({payouts.length})
            </button>
            <button
              onClick={() => setFilterTab("holds")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterTab === "holds" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Holds ({payouts.filter((p) => p.payoutStatus === "COMPLIANCE_HOLD").length})
            </button>
            <button
              onClick={() => setFilterTab("queued")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterTab === "queued" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Queued ({payouts.filter((p) => p.payoutStatus === "QUEUED_FOR_DISBURSEMENT").length})
            </button>
            <button
              onClick={() => setFilterTab("processed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterTab === "processed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Disbursed ({payouts.filter((p) => p.payoutStatus === "PROCESSED").length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredPayouts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 text-center text-zinc-500 text-xs">
                No payouts found matching the selected filter.
              </div>
            ) : (
              filteredPayouts.map((p) => {
                const isSelected = selectedPayout?.id === p.id;
                const isHold = p.payoutStatus === "COMPLIANCE_HOLD";
                const isProcessed = p.payoutStatus === "PROCESSED";

                return (
                  <motion.div
                    key={p.id}
                    onClick={() => setSelectedPayout(p)}
                    whileHover={{ scale: 1.005 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-zinc-900/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20" 
                        : "bg-zinc-900/40 hover:bg-zinc-900/70 border-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                          isHold 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : isProcessed 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {isHold ? <ShieldAlert className="w-4 h-4" /> : isProcessed ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{p.vendorName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {p.invoiceNumber}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                            GSTIN: {p.vendorGstin}
                          </div>

                          {/* Reason / Trigger snippet */}
                          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5 flex-wrap">
                            {p.complianceGate.reasons.slice(0, 1).map((r, i) => (
                              <span key={i} className={`px-2 py-0.5 rounded-md border text-[10px] ${
                                isHold ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              }`}>
                                {r.length > 55 ? `${r.substring(0, 55)}...` : r}
                              </span>
                            ))}
                            {p.tdsApplicable && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono">
                                TDS {p.tdsSection} (₹{p.tdsAmount})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white font-mono">₹{p.invoiceAmount.toLocaleString()}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          Net: ₹{p.netVendorDisbursement.toLocaleString()}
                        </div>
                        <div className="mt-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isHold 
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30" 
                              : isProcessed 
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          }`}>
                            {p.payoutStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Deep Inspector & RazorpayX Action Console */}
        <div className="lg:col-span-5">
          {selectedPayout ? (
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">RazorpayX Shield Audit</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        selectedPayout.payoutStatus === "COMPLIANCE_HOLD"
                          ? "bg-rose-500/20 text-rose-300"
                          : selectedPayout.payoutStatus === "PROCESSED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {selectedPayout.payoutStatus}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedPayout.vendorName}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Inv: {selectedPayout.invoiceNumber} | Date: {selectedPayout.invoiceDate}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-mono block">Razorpay Payout ID</span>
                    <span className="text-xs font-mono text-blue-400 font-bold">{selectedPayout.razorpayPayoutId}</span>
                  </div>
                </div>

                {/* Split Calculation: Vendor Net + TDS Ledger + GST Hold */}
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Autonomous Split Accounting</span>
                    <Percent className="w-3.5 h-3.5 text-zinc-500" />
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-white/5 font-mono">
                    <div className="flex justify-between py-1 text-zinc-300">
                      <span>Total Invoice Amount</span>
                      <span className="font-bold text-white">₹{selectedPayout.invoiceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-zinc-400">
                      <span>Base Taxable Value</span>
                      <span>₹{selectedPayout.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-zinc-400">
                      <span>GST Component</span>
                      <span>₹{selectedPayout.gstAmount.toLocaleString()}</span>
                    </div>

                    {/* TDS Deduction */}
                    <div className="flex justify-between py-1 text-indigo-300 bg-indigo-500/5 px-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        TDS Deduction ({selectedPayout.tdsSection})
                      </span>
                      <span className="font-bold">-₹{selectedPayout.tdsAmount.toLocaleString()}</span>
                    </div>

                    {/* GST Withholding */}
                    {selectedPayout.gstWithheldFor2B > 0 && (
                      <div className="flex justify-between py-1 text-rose-300 bg-rose-500/5 px-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          GST Withheld (GSTR-2B Guard)
                        </span>
                        <span className="font-bold">-₹{selectedPayout.gstWithheldFor2B.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-emerald-400 font-bold text-sm">
                      <span>Net Vendor Disbursement (RazorpayX)</span>
                      <span>₹{selectedPayout.netVendorDisbursement.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pre-Disbursement Compliance Gating Verification Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Autonomous Gate Checks
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center gap-2">
                      {selectedPayout.complianceGate.checks.gstinVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldX className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-200">GSTIN Status</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{selectedPayout.complianceGate.checks.gstinStatus}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center gap-2">
                      {selectedPayout.complianceGate.checks.hsnValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-200">HSN Tax Rate</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {selectedPayout.complianceGate.checks.hsnTaxRateBilled}% (Exp: {selectedPayout.complianceGate.checks.hsnTaxRateExpected}%)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center gap-2">
                      {selectedPayout.complianceGate.checks.irnVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldX className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-200">e-Invoice IRN</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {selectedPayout.complianceGate.checks.irnVerified ? "Verified QR" : "Missing/Invalid"}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center gap-2">
                      {selectedPayout.complianceGate.checks.circularTradingRisk === "LOW" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-200">Fraud Network</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{selectedPayout.complianceGate.checks.circularTradingRisk} Risk</div>
                      </div>
                    </div>
                  </div>

                  {/* Reasons log */}
                  <div className="mt-3 space-y-1.5">
                    {selectedPayout.complianceGate.reasons.map((reason, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="pt-2 space-y-2">
                  {selectedPayout.payoutStatus === "PROCESSED" ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Disbursed via RazorpayX
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-1">
                        Bank UTR: <strong className="text-white">{selectedPayout.razorpayUtr}</strong>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleProcessPayout(selectedPayout.id)}
                        disabled={isProcessing || selectedPayout.payoutStatus === "COMPLIANCE_HOLD"}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Zap className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                        {isProcessing ? "Executing RazorpayX API..." : "Disburse via RazorpayX Payouts"}
                      </button>

                      {selectedPayout.payoutStatus === "COMPLIANCE_HOLD" && (
                        <button
                          onClick={() => setOverrideModalOpen(true)}
                          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs transition-all border border-amber-500/20 flex items-center justify-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          Override Compliance Gate (Finance Controller)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 text-center text-zinc-500 text-xs">
              Select a payout from the queue to inspect compliance gating and execute RazorpayX disbursements.
            </div>
          )}
        </div>
      </div>

      {/* Override Modal */}
      <AnimatePresence>
        {overrideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Manual Compliance Gate Override</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You are about to unblock payout for <strong className="text-white">{selectedPayout?.vendorName}</strong>. 
                This action is audited and logged permanently for CA compliance.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-300 font-semibold">Audit Justification / CA Note</label>
                  <span className="text-[10px] text-zinc-500 font-mono">Immutable CA Log</span>
                </div>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified revised debit note offline; tax variance reconciled in advance ledger."
                  className="w-full h-20 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setOverrideReason("Verified debit note issued offline for tax rate difference.")}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all"
                  >
                    + Debit Note Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideReason("Vendor provided signed CA undertaking for GSTR-1 inclusion.")}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all"
                  >
                    + CA Undertaking
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideReason("Urgent raw material batch critical for production line.")}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all"
                  >
                    + Production Critical
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOverride}
                  disabled={!overrideReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs disabled:opacity-40"
                >
                  Confirm & Unblock Payout
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Invoice Evaluator Modal */}
        {evalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Evaluate Vendor Invoice (Live Compliance Gate)</h3>
                    <p className="text-[11px] text-zinc-400">RazorpayX Verify-Before-Pay Gating Simulation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEvalModalOpen(false)} 
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomPayout} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Vendor Company Name</label>
                    <input
                      type="text"
                      required
                      value={cVendor}
                      onChange={(e) => setCVendor(e.target.value)}
                      placeholder="e.g. Acme Industrial Supplies"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Vendor GSTIN</label>
                    <input
                      type="text"
                      required
                      value={cGstin}
                      onChange={(e) => setCGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Invoice Number</label>
                    <input
                      type="text"
                      required
                      value={cInvNumber}
                      onChange={(e) => setCInvNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Total Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={cAmount}
                      onChange={(e) => setCAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Billed GST Rate (%)</label>
                    <select
                      value={cGstRate}
                      onChange={(e) => setCGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                      <option value={28}>28% GST</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Expected HSN Rate (%)</label>
                    <select
                      value={cHsnExpected}
                      onChange={(e) => setCHsnExpected(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={5}>5% Expected</option>
                      <option value={12}>12% Expected</option>
                      <option value={18}>18% Expected</option>
                      <option value={28}>28% Expected</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">FY Cumulative Turnover (₹)</label>
                    <input
                      type="number"
                      value={cTurnover}
                      onChange={(e) => setCTurnover(Number(e.target.value))}
                      placeholder=">50L for 194Q"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Filing Score (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cFilingScore}
                      onChange={(e) => setCFilingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-3 rounded-xl bg-zinc-950/60 border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={cHasIrn}
                      onChange={(e) => setCHasIrn(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/20 text-blue-500 focus:ring-0"
                    />
                    <span>Has Valid e-Invoice IRN QR</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={cIsMsme}
                      onChange={(e) => setCIsMsme(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/20 text-orange-500 focus:ring-0"
                    />
                    <span>Registered MSME (15-Day Rule)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEvalModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
                  >
                    Run Gate & Add to Payout Queue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
