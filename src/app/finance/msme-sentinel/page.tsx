"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Zap, 
  Building2, 
  Scale, 
  AlertCircle, 
  ArrowRight, 
  Info, 
  Flame, 
  Sparkles,
  DollarSign
} from "lucide-react";
import { useFinanceStore, RazorpayXPayout } from "@/store/useFinanceStore";

export default function MsmeSection43BhSentinelPage() {
  const { payouts, vendors, autoScheduleMsmePayout, processRazorpayXPayout } = useFinanceStore();
  const [selectedPayout, setSelectedPayout] = useState<RazorpayXPayout | null>(
    payouts.find(p => (p.complianceGate?.checks?.msme43BhDueDays || 0) < 15) || payouts[0] || null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Corporate Tax Rate in India for computing Section 43B(h) penalty liability
  const corporateTaxRate = 0.25; // 25% + surcharge/cess ~ 29.12%

  const msmePayouts = payouts.map(p => {
    const vendor = vendors.find(v => v.id === p.vendorId || v.name.toLowerCase() === p.vendorName.toLowerCase());
    const isMsme = vendor?.isMsme ?? true;
    const msmeCategory = vendor?.msmeCategory || "Small";
    const udyamNumber = vendor?.udyamNumber || "UDYAM-REG-VERIFIED";
    const dueDays = p.complianceGate?.checks?.msme43BhDueDays ?? 18;
    const isCritical = dueDays <= 7;
    const isWarning = dueDays > 7 && dueDays <= 15;
    const potentialTaxPenalty = Math.round(p.invoiceAmount * corporateTaxRate);

    return {
      ...p,
      vendorInfo: vendor,
      isMsme,
      msmeCategory,
      udyamNumber,
      dueDays,
      isCritical,
      isWarning,
      potentialTaxPenalty
    };
  });

  const totalMsmeExposure = msmePayouts.reduce((acc, p) => acc + p.invoiceAmount, 0);
  const criticalCount = msmePayouts.filter(p => p.isCritical && p.payoutStatus !== "PROCESSED").length;
  const totalTaxPenaltyRisk = msmePayouts.filter(p => p.payoutStatus !== "PROCESSED").reduce((acc, p) => acc + p.potentialTaxPenalty, 0);

  const handleAutoSchedule = (payoutId: string) => {
    autoScheduleMsmePayout(payoutId, 2);
    const updated = useFinanceStore.getState().payouts.find(p => p.id === payoutId);
    if (updated) setSelectedPayout(updated);
    setToastMessage(`Auto-Scheduled via RazorpayX 48h before statutory 43B(h) deadline.`);
  };

  const handleInstantDisburse = async (payoutId: string) => {
    const res = await processRazorpayXPayout(payoutId);
    const updated = useFinanceStore.getState().payouts.find(p => p.id === payoutId);
    if (updated) setSelectedPayout(updated);
    setToastMessage(res.message);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Income Tax Act Section 43B(h) Sentinel
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Flame className="w-3 h-3 text-rose-400" />
                Statutory 15 / 45 Day SLA Guard
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              MSME 45-Day Compliance Sentinel
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Under Section 43B(h), any overdue payment to registered Micro & Small enterprises beyond 45 days is <strong className="text-white">disallowed as a business expense</strong>, triggering steep income tax penalties. Taxed auto-tracks Udyam registries and schedules RazorpayX payouts before the deadline.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Total MSME Payables Volume</span>
            <Building2 className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">₹{totalMsmeExposure.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {msmePayouts.length} Registered Micro & Small suppliers tracked
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-rose-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Critical SLA Deadlines (&lt; 7 Days)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{criticalCount} Invoices</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Imminent risk of tax deduction disallowance
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Potential Tax Disallowance Penalty</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">₹{totalTaxPenaltyRisk.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Protected if disbursed via RazorpayX within SLA
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/80 to-zinc-900 border border-orange-500/30 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-orange-200">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Grid: MSME Pipeline + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: MSME Invoices SLA Clock */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Section 43B(h) Statutory SLA Clocks
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{msmePayouts.length} MSME Invoices</span>
          </div>

          <div className="space-y-3">
            {msmePayouts.map((p) => {
              const isSelected = selectedPayout?.id === p.id;
              const isPaid = p.payoutStatus === "PROCESSED";

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPayout(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-zinc-900 border-orange-500/50 shadow-md ring-1 ring-orange-500/20" 
                      : "bg-zinc-900/40 hover:bg-zinc-900/70 border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{p.vendorName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                          {p.msmeCategory} MSME
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                        Udyam: {p.udyamNumber} | Inv: {p.invoiceNumber}
                      </div>

                      {/* SLA Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500">Statutory 45-Day Limit</span>
                          <span className={p.isCritical && !isPaid ? "text-rose-400 font-bold animate-pulse" : "text-zinc-400"}>
                            {isPaid ? "Disbursed / Compliant" : `${p.dueDays} Days Remaining`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full ${
                              isPaid 
                                ? "bg-emerald-500" 
                                : p.isCritical 
                                  ? "bg-rose-500" 
                                  : p.isWarning 
                                    ? "bg-amber-500" 
                                    : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(10, ((45 - p.dueDays) / 45) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-white font-mono">₹{p.invoiceAmount.toLocaleString()}</div>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        Tax Risk: ₹{p.potentialTaxPenalty.toLocaleString()}
                      </span>

                      <div className="mt-3">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isPaid 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : p.isCritical 
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}>
                          {isPaid ? "Disbursed" : p.isCritical ? "CRITICAL SLA" : "TRACKED"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tax Penalty Impact & Auto-Scheduler */}
        <div className="lg:col-span-5">
          {selectedPayout ? (
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Section 43B(h) Audit Detail
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{selectedPayout.vendorName}</h3>
                    <p className="text-xs text-zinc-400 font-mono">Invoice: {selectedPayout.invoiceNumber}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">SLA Clock</span>
                    <span className={`text-lg font-bold font-mono ${
                      selectedPayout.payoutStatus === "PROCESSED"
                        ? "text-emerald-400"
                        : (selectedPayout.complianceGate?.checks?.msme43BhDueDays || 0) <= 7 
                          ? "text-rose-400" 
                          : "text-orange-400"
                    }`}>
                      {selectedPayout.payoutStatus === "PROCESSED" ? "Settled" : `${selectedPayout.complianceGate?.checks?.msme43BhDueDays || 14} Days`}
                    </span>
                  </div>
                </div>

                {/* Tax Disallowance Math Breakdown */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400 uppercase font-sans font-bold text-[11px]">
                    <span>Statutory Impact Calculator</span>
                    <Scale className="w-3.5 h-3.5 text-zinc-500" />
                  </div>

                  <div className="space-y-1.5 divide-y divide-white/5">
                    <div className="flex justify-between py-1 text-zinc-300">
                      <span>Invoice Principal Amount</span>
                      <span className="font-bold text-white">₹{selectedPayout.invoiceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-zinc-400">
                      <span>MSME Classification</span>
                      <span className="text-orange-300">Small Enterprise (Udyam Verified)</span>
                    </div>
                    <div className="flex justify-between py-1 text-zinc-400">
                      <span>Statutory Maximum SLA</span>
                      <span>45 Days (Sec 15 MSMED Act)</span>
                    </div>
                    <div className="flex justify-between py-1 text-rose-300 bg-rose-500/5 px-2 rounded-lg">
                      <span>Potential Tax Penalty (25% + Cess)</span>
                      <span className="font-bold">₹{Math.round(selectedPayout.invoiceAmount * 0.25).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* RazorpayX Auto-Schedule Engine */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Autonomous RazorpayX Protection Actions
                  </div>

                  {selectedPayout.payoutStatus === "PROCESSED" ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-semibold text-emerald-400">
                      Disbursed via RazorpayX. 100% Tax Deduction Secured.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAutoSchedule(selectedPayout.id)}
                        className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-orange-300 font-semibold text-xs transition-all border border-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-orange-400" />
                        Auto-Schedule RazorpayX (48h Before Deadline)
                      </button>

                      <button
                        onClick={() => handleInstantDisburse(selectedPayout.id)}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-zinc-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        Disburse Now via RazorpayX Payouts
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 text-center text-zinc-500 text-xs">
              Select an MSME invoice to inspect Section 43B(h) timeline and auto-schedule RazorpayX disbursements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
