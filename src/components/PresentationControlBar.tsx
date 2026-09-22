"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Zap, 
  Lock, 
  Clock, 
  Network, 
  HelpCircle, 
  Check, 
  Sliders, 
  X, 
  ChevronDown, 
  Lightbulb, 
  Eye, 
  RefreshCw,
  QrCode,
  FileCheck2
} from "lucide-react";
import { useFinanceStore, PresentationScenario } from "@/store/useFinanceStore";

const scenarioLabels: Record<PresentationScenario, { title: string; subtitle: string; icon: any; color: string }> = {
  SHOWCASE: {
    title: "Live Pitch Showcase",
    subtitle: "Balanced demo with 1 Gate Hold, 1 Escrow Dispute, 1 Circular Loop",
    icon: Sparkles,
    color: "from-lemon-400 to-lime-500 text-forest-950"
  },
  FRAUD_ATTACK: {
    title: "Fraud Syndicate Attack",
    subtitle: "Suspended DGGI GSTIN, fake invoices, and circular loop alert",
    icon: ShieldAlert,
    color: "from-rose-500 to-amber-500 text-white"
  },
  MSME_CRUNCH: {
    title: "MSME 45-Day Crunch",
    subtitle: "48-Hour Section 43B(h) deadline countdown & auto-scheduler",
    icon: Clock,
    color: "from-amber-400 to-orange-500 text-zinc-950"
  },
  CLEAN_SLATE: {
    title: "Clean Enterprise Slate",
    subtitle: "Empty ledger ready for live invoice and notice uploads",
    icon: RotateCcw,
    color: "from-teal-400 to-emerald-500 text-zinc-950"
  }
};

const pitchTalkingPoints: Record<string, { title: string; problem: string; statutoryBasis: string; razorpayXImpact: string }> = {
  "/finance": {
    title: "Executive FinOps Cockpit",
    problem: "CFOs lack real-time visibility into tax liabilities, MSME deadline risks, and vendor filing failures before disbursing payments.",
    statutoryBasis: "Unified compliance across CGST Sec 16(2)(aa), IT Act Sec 43B(h), and Sec 194Q.",
    razorpayXImpact: "Connects ERP books directly with RazorpayX smart accounts to enforce statutory checks pre-transfer."
  },
  "/finance/payouts": {
    title: "Verify-Before-Pay Payout Shield",
    problem: "Once funds leave a corporate account, recovering cash paid to non-compliant or fraudulent vendors is near impossible.",
    statutoryBasis: "Section 194Q (0.1% TDS on > ₹50L turnover) and GSTIN active validation.",
    razorpayXImpact: "Hooks into RazorpayX Payouts API. Automatically splits base payout to vendor and tax portion to government TDS ledger."
  },
  "/finance/smart-collect": {
    title: "Smart Collect & Tax Dispute Escrow",
    problem: "B2B buyers withhold full invoice payments when there is a small GST rate mismatch, causing severe vendor working capital lockups.",
    statutoryBasis: "Dynamic e-Invoice IRN QR code generation and credit note reconciliation.",
    razorpayXImpact: "Uses Razorpay Smart Collect & Payment Links. Splits disputed payments—releasing undisputed subtotal to seller while holding tax in escrow."
  },
  "/finance/itc-lock": {
    title: "Agentic ITC Risk & GSTR-2B Lock Engine",
    problem: "Buyers face 18% tax clawbacks plus 24% penal interest when suppliers fail to upload GSTR-1 returns.",
    statutoryBasis: "Section 16(2)(aa) requires mandatory GSTR-2B reflection before claiming ITC.",
    razorpayXImpact: "Auto-withholds 18% GST buffer at payment time and launches autonomous multi-channel AI dunning post the 11th of every month."
  },
  "/finance/msme-sentinel": {
    title: "MSME 45-Day Sentinel (Sec 43B(h))",
    problem: "Unpaid MSME invoices after 45/15 days are disallowed from corporate income tax deductions, increasing corporate tax liability.",
    statutoryBasis: "Income Tax Act Section 43B(h) + MSMED Act Section 15 & 16 (Compound interest at 3x RBI rate).",
    razorpayXImpact: "Automated cron scheduler triggers RazorpayX emergency payouts exactly 48 hours before SLA expiration."
  },
  "/finance/fraud-graph": {
    title: "Circular Trading & Shell Syndicate Detector",
    problem: "Fake invoice cartels create circular billing chains to generate bogus input tax credit without physical movement of goods.",
    statutoryBasis: "Section 132(1)(b) & (c) CGST Act (non-bailable offenses for fake invoicing).",
    razorpayXImpact: "Graph-theory network scanner stops RazorpayX payouts to suspicious shell entities before money leaves the bank."
  },
  "/finance/reconciliation": {
    title: "Autonomous GSTR-2B Reconciliation",
    problem: "Manual monthly Excel reconciliation leads to human errors and missed credit claim deadlines.",
    statutoryBasis: "Section 38 & GSTR-2B automated 3-way matching with purchase register.",
    razorpayXImpact: "1-Click ingestion of GST Portal JSON files and instant discrepancy scoring."
  },
  "/finance/notices": {
    title: "AI GST Notice & SCN Defense Hub",
    problem: "Responding to complex Section 73 & Section 16(4) notices requires expensive legal consults and tight response windows.",
    statutoryBasis: "CBIC Circular 183/15/2022 & statutory tribunal precedents.",
    razorpayXImpact: "Generates legally binding, citation-backed response drafts in seconds."
  }
};

export default function PresentationControlBar() {
  const pathname = usePathname();
  const { 
    activeScenario, 
    setScenario, 
    resetData, 
    showPresenterNotes, 
    togglePresenterNotes,
    presentationFocusMode,
    togglePresentationFocusMode,
    quickSimulate2BMatch,
    quickSimulateMsmeAutoDisburse,
    quickInjectShellCompany,
    batchProcessApprovedPayouts,
    isSandboxMode,
    toggleSandboxMode
  } = useFinanceStore();

  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const currentTalkingPoint = pitchTalkingPoints[pathname] || pitchTalkingPoints["/finance"];

  return (
    <div className="w-full bg-[#040C07] border-b border-lemon-400/20 text-white z-40 sticky top-0 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Presentation Scenario Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lemon-400/15 border border-lemon-400/30 text-lemon-300 font-bold font-mono text-[11px]">
            <Play className="w-3 h-3 fill-lemon-400 text-lemon-400 animate-pulse" />
            <span>DEMO SUITE</span>
          </div>

          {/* Scenario Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setScenarioMenuOpen(!scenarioMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091D13] hover:bg-[#0E281C] border border-lemon-400/30 text-zinc-100 font-semibold transition-all hover:scale-[1.01]"
            >
              {React.createElement(scenarioLabels[activeScenario].icon, { className: "w-3.5 h-3.5 text-lemon-400" })}
              <span className="font-bold text-white">{scenarioLabels[activeScenario].title}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${scenarioMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {scenarioMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#07170E] border border-lemon-400/30 shadow-2xl p-2 z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                    Select Presentation Scenario
                  </div>
                  {(["SHOWCASE", "FRAUD_ATTACK", "MSME_CRUNCH", "CLEAN_SLATE"] as PresentationScenario[]).map((sc) => {
                    const info = scenarioLabels[sc];
                    const Icon = info.icon;
                    const isSelected = activeScenario === sc;

                    return (
                      <button
                        key={sc}
                        onClick={() => {
                          setScenario(sc);
                          setScenarioMenuOpen(false);
                          showToast(`Switched to: ${info.title}`);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                          isSelected 
                            ? "bg-lemon-400/20 border border-lemon-400/40 text-white" 
                            : "hover:bg-white/5 text-zinc-300"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-zinc-900 border border-white/10 mt-0.5`}>
                          <Icon className="w-3.5 h-3.5 text-lemon-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{info.title}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-lemon-400" />}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">{info.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Quick 1-Click Presentation Simulation Actions */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => {
              quickSimulate2BMatch();
              showToast("Simulated 2B Match: Withheld GST unlocked across all eligible payouts!");
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
            title="Simulate vendor GSTR-1 upload matching in GSTR-2B"
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Simulate 2B Match</span>
          </button>

          <button
            onClick={() => {
              quickSimulateMsmeAutoDisburse();
              showToast("Simulated MSME Shield: Emergency payout queued 48h before Section 43B(h) deadline!");
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
            title="Trigger MSME auto-disbursement buffer"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>MSME 48h Buffer</span>
          </button>

          <button
            onClick={() => {
              quickInjectShellCompany();
              showToast("Injected Circular Shell Syndicate into Graph Sentinel!");
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
            title="Simulate newly discovered shell syndicate in network graph"
          >
            <Network className="w-3 h-3 text-purple-400" />
            <span>Inject Shell Node</span>
          </button>

          <button
            onClick={async () => {
              const count = await batchProcessApprovedPayouts();
              showToast(`Disbursed ${count} compliance-verified payouts via RazorpayX!`);
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
            title="Execute all queued RazorpayX payouts"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Batch RazorpayX</span>
          </button>
        </div>

        {/* Right: Pitch Talking Points & Reset Controls */}
        <div className="flex items-center gap-2">
          {/* Pitch Talking Points Toggle */}
          <button
            onClick={togglePresenterNotes}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showPresenterNotes 
                ? "bg-lemon-400 text-forest-950 border-lemon-300 shadow-md shadow-lemon-400/20" 
                : "bg-[#091D13] hover:bg-[#0E281C] text-lemon-300 border-lemon-400/30"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Pitch Notes</span>
          </button>

          {/* Quick Reset */}
          <button
            onClick={() => {
              resetData();
              showToast("Demo state reset to scenario baseline!");
            }}
            className="p-1.5 rounded-xl bg-[#091D13] hover:bg-[#0E281C] border border-white/15 text-zinc-300 hover:text-white transition-all"
            title="Reset active scenario data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Presenter Pitch Talking Points Drawer / Banner */}
      <AnimatePresence>
        {showPresenterNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gradient-to-r from-[#07190F] via-[#0B2517] to-[#07190F] border-t border-lemon-400/20"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-lemon-400/20 text-lemon-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-lemon-400/30">
                    Presenter Pitch Guide
                  </span>
                  <h4 className="text-sm font-extrabold text-white font-headline">
                    {currentTalkingPoint.title}
                  </h4>
                </div>
                <button
                  onClick={togglePresenterNotes}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-rose-400 font-bold uppercase mb-1">
                    Problem Solved
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {currentTalkingPoint.problem}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase mb-1">
                    Statutory Rule & Section
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {currentTalkingPoint.statutoryBasis}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-lemon-400/30 bg-lemon-400/5">
                  <div className="text-[10px] font-mono text-lemon-300 font-bold uppercase mb-1">
                    RazorpayX AI Innovation
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {currentTalkingPoint.razorpayXImpact}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast Feedback */}
      <AnimatePresence>
        {toastText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-lemon-400 text-forest-950 font-bold text-xs shadow-2xl flex items-center gap-2 z-50 pointer-events-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>{toastText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
