"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Unlock, 
  Send, 
  MessageSquare, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Building2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Bot,
  X 
} from "lucide-react";
import { useFinanceStore, DunningRecord, Vendor } from "@/store/useFinanceStore";

export default function ItcRiskGstr2BLockPage() {
  const { 
    vendors, 
    payouts, 
    dunningLogs, 
    triggerAutonomousDunning, 
    simulateVendorGstr1Upload 
  } = useFinanceStore();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0] || null);
  const [selectedDunning, setSelectedDunning] = useState<DunningRecord | null>(dunningLogs[0] || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<"ALL" | "WhatsApp" | "Email">("ALL");

  // Custom AI Dunning Composer State
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeVendorId, setComposeVendorId] = useState(vendors[0]?.id || "");
  const [composeChannel, setComposeChannel] = useState<"WhatsApp" | "Email" | "Automated SMS">("WhatsApp");
  const [composeCustomMsg, setComposeCustomMsg] = useState("");

  const handleRunDunning = (vendorId: string, channel?: "WhatsApp" | "Email" | "Automated SMS", msg?: string) => {
    const log = triggerAutonomousDunning(vendorId, channel || "WhatsApp", msg);
    setSelectedDunning(log);
    setToastMessage(`Autonomous AI Dunning sent via ${log.channel} to ${log.recipient}!`);
  };

  const handleSendCustomDunning = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunDunning(composeVendorId, composeChannel, composeCustomMsg || undefined);
    setComposeModalOpen(false);
    setComposeCustomMsg("");
  };

  const handleSimulateUpload = (dunningId: string) => {
    simulateVendorGstr1Upload(dunningId);
    setToastMessage("GST Portal Verified: Vendor uploaded GSTR-1. Withheld GST credits unlocked!");
  };

  const filteredLogs = channelFilter === "ALL" 
    ? dunningLogs 
    : dunningLogs.filter(d => d.channel === channelFilter);

  const totalGstWithheld = payouts.reduce((acc, p) => acc + p.gstWithheldFor2B, 0);
  const highRiskVendorsCount = vendors.filter(v => (v.filingScore || 100) < 70).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                AI Finance Controller Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Lock className="w-3 h-3 text-blue-400" />
                GSTR-2B Dynamic Lock
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Agentic ITC Risk & GSTR-2B Lock Engine
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Protects buyers from Section 16(2)(aa) ITC clawbacks. Evaluates vendor historical filing timeliness and auto-withholds the 18% GST component until invoice is matched in <strong className="text-white">GSTR-2B</strong>. Post the 11th of each month, an autonomous AI agent initiates multi-channel dunning.
            </p>
          </div>

          <button
            onClick={() => setComposeModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            + Compose AI Dunning Notice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>GST Withholding Buffer (In Lock)</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">₹{totalGstWithheld.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Safeguarded until vendors file GSTR-1
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>High ITC Risk Vendors</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{highRiskVendorsCount} Vendors</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Filing score &lt; 70 or late filing rate &gt; 25%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Autonomous Dunning Actions</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300 font-mono">{dunningLogs.length} Dispatched</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Multi-channel WhatsApp & Email reminders
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/30 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-200">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Grid: Vendor Scorecards + Autonomous Dunning Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Vendor Filing Reputation Scorecard */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Vendor Filing Scorecards & 2B Lock Policy
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{vendors.length} Vendors</span>
          </div>

          <div className="space-y-3">
            {vendors.map((vendor) => {
              const isSelected = selectedVendor?.id === vendor.id;
              const isLowScore = (vendor.filingScore || 100) < 70;
              const lateRate = vendor.gstr1FilingDelayRate || 0;

              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-zinc-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20" 
                      : "bg-zinc-900/40 hover:bg-zinc-900/70 border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{vendor.name}</span>
                        {vendor.isMsme && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                            MSME ({vendor.msmeCategory})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        GSTIN: {vendor.gstin}
                      </div>

                      {/* Policy rule tag */}
                      <div className="mt-2 text-[11px] flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border font-mono text-[10px] ${
                          isLowScore 
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}>
                          {lateRate}% Late Filing Rate
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          {isLowScore ? "Auto-withholding GST (18%)" : "Direct Release"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-xl font-bold font-mono ${
                          (vendor.filingScore || 100) >= 80 
                            ? "text-emerald-400" 
                            : (vendor.filingScore || 100) >= 60 
                              ? "text-amber-400" 
                              : "text-rose-400"
                        }`}>
                          {vendor.filingScore}/100
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">
                        Filing Score
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunDunning(vendor.id);
                        }}
                        className="mt-2 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-semibold transition-all flex items-center gap-1 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        Trigger Dunning
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Autonomous Dunning Hub & Interactive Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              Autonomous Dunning Stream (Post-11th GSTR-1 SLA)
            </h2>
            <div className="flex gap-1 text-[10px]">
              {(["ALL", "WhatsApp", "Email"] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    channelFilter === ch 
                      ? "bg-blue-500 text-zinc-950 font-bold" 
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5">
            {selectedDunning ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${
                      selectedDunning.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {selectedDunning.channel === "WhatsApp" ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{selectedDunning.vendorName}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono">To: {selectedDunning.recipient} ({selectedDunning.channel})</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedDunning.status === "ACKNOWLEDGED_UPLOADED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {selectedDunning.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Simulated Chat Bubble Preview */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Bot className="w-3 h-3 text-emerald-400" />
                      Taxed AI Multi-Channel Dispatcher
                    </span>
                    <span>Triggered: {selectedDunning.triggerDate}</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    selectedDunning.channel === "WhatsApp" 
                      ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-100" 
                      : "bg-blue-950/40 border border-blue-500/20 text-blue-100"
                  }`}>
                    {selectedDunning.messageContent}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Target Period: {selectedDunning.missingPeriod}</span>
                    <span>Attempts: {selectedDunning.attemptsCount}</span>
                  </div>
                </div>

                {/* Simulate Portal Verification Action */}
                <div className="pt-2">
                  {selectedDunning.status === "ACKNOWLEDGED_UPLOADED" ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      GSTN Portal Synced: Withheld GST Released
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSimulateUpload(selectedDunning.id)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Simulate Vendor GSTR-1 Upload & Unlock 18% GST
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-500 text-xs py-8">
                Select a dunning notice to inspect AI dispatch details and trigger GSTN auto-unlock.
              </div>
            )}
          </div>

          {/* Dunning Log List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Recent Dunning Dispatch Log</span>
            {filteredLogs.map(log => (
              <div
                key={log.id}
                onClick={() => setSelectedDunning(log)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  selectedDunning?.id === log.id 
                    ? "bg-zinc-900 border-blue-500/50" 
                    : "bg-zinc-900/30 hover:bg-zinc-900/60 border-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {log.channel === "WhatsApp" ? (
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                  <span className="text-white font-medium truncate">{log.vendorName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400">{log.triggerDate}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    log.status === "ACKNOWLEDGED_UPLOADED" ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {log.status === "ACKNOWLEDGED_UPLOADED" ? "Uploaded" : "Sent"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom AI Dunning Modal */}
      <AnimatePresence>
        {composeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Compose AI GSTR-1 Dunning Notice</h3>
                    <p className="text-[11px] text-zinc-400">Autonomous multi-channel compliance reminder</p>
                  </div>
                </div>
                <button 
                  onClick={() => setComposeModalOpen(false)} 
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendCustomDunning} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Select Vendor</label>
                  <select
                    value={composeVendorId}
                    onChange={(e) => setComposeVendorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gstin}) - Score: {v.filingScore}/100
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Dispatch Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["WhatsApp", "Email", "Automated SMS"] as const).map(ch => (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => setComposeChannel(ch)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          composeChannel === ch 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow" 
                            : "bg-zinc-950 text-zinc-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {ch === "WhatsApp" ? <Smartphone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Message Copy</label>
                    <button
                      type="button"
                      onClick={() => {
                        const targetVendor = vendors.find(v => v.id === composeVendorId);
                        setComposeCustomMsg(`🚨 Urgent Taxed Alert for ${targetVendor?.name || "Vendor"}: Your invoice payment was executed via RazorpayX. However, return filing is missing in your GSTR-1 past the 11th statutory deadline. Please upload immediately on GSTN to release the 18% GST credit withholding buffer.`);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-Draft with AI
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={composeCustomMsg}
                    onChange={(e) => setComposeCustomMsg(e.target.value)}
                    placeholder="Enter custom notice text or click 'Auto-Draft with AI'..."
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white leading-relaxed focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setComposeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch AI Notice
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
