"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileWarning, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  X, 
  FileText, 
  Printer, 
  Copy, 
  ChevronRight, 
  Scale, 
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { useFinanceStore, GstNotice } from "@/store/useFinanceStore";

export default function GSTNoticesHub() {
  const { user } = useSessionStore();
  const { notices, addNotice, updateNoticeStatus } = useFinanceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending Response" | "Drafted" | "Replied">("all");
  
  const [activeNotice, setActiveNotice] = useState<GstNotice | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastText, setToastText] = useState("");

  // Upload SCN States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isParsingNotice, setIsParsingNotice] = useState(false);
  const [noticeFileLabel, setNoticeFileLabel] = useState("Click or drag Notice SCN PDF here to audit");

  // Defense Strategies States
  const [defenseStrategy, setDefenseStrategy] = useState<"circular-183" | "portal-challenge" | "wrong-head" | "voluntary-reversal">("circular-183");

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(""), 3000);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesSearch = n.id.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || n.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notices, search, statusFilter]);

  // Dynamic Notice reply letter builder based on Defense Strategy
  const handleGenerateReply = (notice: GstNotice, selectedStrategy = defenseStrategy) => {
    setActiveNotice(notice);
    setIsGenerating(true);
    setIsReplyModalOpen(true);
    
    setTimeout(() => {
      let draftText = `REF: GST/${notice.id}/REPLY\n`;
      draftText += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
      draftText += `To,\n`;
      draftText += `The Proper Officer / Superintendent of Central Tax,\n`;
      draftText += `GST Range Office Ward-27, Maharashtra GST Department\n\n`;
      draftText += `SUBJECT: Reply to show cause notice issued under ${notice.section} with Ref ID ${notice.id} for tax demand of ₹${notice.amount.toLocaleString("en-IN")}\n\n`;
      draftText += `Dear Sir/Madam,\n\n`;
      draftText += `We reference the show cause notice issued to us under Ref ID ${notice.id} proposing a demand of tax along with interest and penalty. In this regard, we, ${user?.companyName || "Tech Solutions Pvt Ltd"}, holding GSTIN ${user?.gstin || "27AADCB2230M1Z2"}, submit our reply as under:\n\n`;
      
      if (selectedStrategy === "circular-183") {
        draftText += `1. GROUND FOR MATCHING CREDIT (Circular 183/15/2022-GST):\n`;
        draftText += `We state that the Input Tax Credit of ₹${notice.amount.toLocaleString("en-IN")} has been claimed in accordance with Section 16 of the CGST Act. The difference between GSTR-3B and GSTR-2B is due to minor filing timing differences by the supplier.\n\n`;
        draftText += `2. VENDOR CREDENTIALS AND DISCREPANCY RECTIFICATION:\n`;
        draftText += `In terms of Circular No. 183/15/2022-GST, we have obtained verified tax payments proofs from the supplier confirming that the tax has been deposited to the government treasury. Any reporting error in GSTR-1 does not invalidate our claim as buyer, as held by the Hon'ble Supreme Court in Union of India vs Bharti Airtel.`;
      } else if (selectedStrategy === "portal-challenge") {
        draftText += `1. CONTEXT OF THE FILING DELAY:\n`;
        draftText += `The credit of ₹${notice.amount.toLocaleString("en-IN")} pertains to services rendered where the supplier uploaded invoices delayed in GSTR-1. The delay in filing was due to systemic server errors and portal downtime on the GSTN website during the financial year ending.\n\n`;
        draftText += `2. JUDICIAL PRECEDENTS ON RIGHT TO CREDIT:\n`;
        draftText += `We submit that Input Tax Credit is a vested right of the taxpayer under Article 300A of the Constitution. Statutory deadlines in Section 16(4) are directory and not mandatory in cases of systemic portal challenges, as affirmed by the Hon'ble Madras High Court in recent rulings.`;
      } else if (selectedStrategy === "wrong-head") {
        draftText += `1. PLACE OF SUPPLY PLACE CORRECTION (Section 77 CGST):\n`;
        draftText += `Regarding the placement of supply and state-code mismatch, we submit that the tax was paid under a wrong head (IGST instead of CGST/SGST, or vice versa) due to place of supply interpretation.\n\n`;
        draftText += `2. WAIVER OF INTEREST AND PENALTY:\n`;
        draftText += `Under Section 77 of the CGST Act and Section 19 of the IGST Act, if a taxpayer pays tax under a wrong head, they are eligible for a refund of the same, and no interest or penalty can be levied when paying the correct head. Hence we request you to drop any penal proceedings.`;
      } else if (selectedStrategy === "voluntary-reversal") {
        draftText += `1. VOLUNTARY REVERSAL (Section 73(8) CGST):\n`;
        draftText += `Without admitting to any liability, we state that we have voluntarily reversed the disputed Input Tax Credit of ₹${notice.amount.toLocaleString("en-IN")} in our GSTR-3B filed for the current tax period.\n\n`;
        draftText += `2. INTEREST DEPOSIT & PENALTY DISMISSAL:\n`;
        draftText += `We have deposited the appropriate interest under Section 50 of the Act. As per Section 73(8) of the CGST Act, if the tax along with interest is paid before or within 30 days of the notice, no penalty is payable and all proceedings in respect of the SCN shall be deemed to be concluded.`;
      }

      draftText += `\n\nWe request your good office to accept our submission and drop the proposed tax liability and any consequential penalty/interest.\n\n`;
      draftText += `Thanking you,\n\n`;
      draftText += `For ${user?.companyName || "Tech Solutions Pvt Ltd"}\n\n`;
      draftText += `Authorized Signatory / Finance Controller`;

      setGeneratedDraft(draftText);
      setIsGenerating(false);
      
      // Update notices status to Drafted if it was Pending Response
      if (notice.status === "Pending Response") {
        updateNoticeStatus(notice.id, "Drafted", draftText, selectedStrategy);
      }
    }, 1500);
  };

  // Simulate uploading SCN Notice PDF
  const handleUploadNotice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNoticeFileLabel(`Selected: ${file.name}`);
    setIsParsingNotice(true);

    setTimeout(() => {
      setIsParsingNotice(false);
      setIsUploadModalOpen(false);

      const parsedNotice = addNotice({
        type: "GSTR-2B Mismatch (SCN)",
        section: "Section 73",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 85000,
        status: "Pending Response",
        risk: "High",
        description: "Show Cause Notice received for mismatch between GSTR-3B claimed ITC and credit available under GSTR-2B.",
        raisedDetails: `Discrepancy of ₹85,000 flagged on vendor Blue Circle Marketing (Bill BCM-9912) due to failure of filing GSTR-1 by vendor.`
      });

      setActiveNotice(parsedNotice);
      setNoticeFileLabel("Click or drag Notice SCN PDF here to audit");
      triggerToast("Show Cause Notice parsed & loaded successfully!");
    }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    triggerToast("Draft reply copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 pl-printable-view">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scale className="w-8 h-8 text-emerald-400" />
            GST Notices & Replies Hub
          </h1>
          <p className="text-zinc-400 mt-1">Audit official portal notices, model discrepancy reports, and auto-draft legal responses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-semibold rounded-lg transition-all text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Portal Notice (SCN)
          </button>
          <div className="text-xs text-zinc-500 font-bold bg-zinc-900 border border-white/5 px-3.5 py-2 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Last Synced: Today, 9:30 PM
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-no-print">
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-rose-500 bg-zinc-900/40">
          <span className="text-xs text-zinc-400 font-medium">Pending Response Notices</span>
          <div className="text-3xl font-bold text-rose-500 mt-2">
            {notices.filter(n => n.status === "Pending Response").length}
          </div>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-amber-500 bg-zinc-900/40">
          <span className="text-xs text-zinc-400 font-medium">Drafted Replies</span>
          <div className="text-3xl font-bold text-amber-500 mt-2">
            {notices.filter(n => n.status === "Drafted").length}
          </div>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500 bg-zinc-900/40">
          <span className="text-xs text-zinc-400 font-medium">Replied & Closed Audits</span>
          <div className="text-3xl font-bold text-emerald-500 mt-2">
            {notices.filter(n => n.status === "Replied").length}
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="glass-card rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between pl-no-print">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by notice or section..." 
              className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Response">Pending Response</option>
            <option value="Drafted">Drafted</option>
            <option value="Replied">Replied</option>
          </select>
        </div>
        <div className="text-zinc-500 text-xs font-semibold">
          Found {filteredNotices.length} notices
        </div>
      </div>

      {/* Notices grid / details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pl-no-print">
        
        {/* Notices list column */}
        <div className="space-y-4 lg:col-span-1">
          {filteredNotices.map((notice) => (
            <div 
              key={notice.id}
              onClick={() => setActiveNotice(notice)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeNotice?.id === notice.id 
                  ? "bg-emerald-500/5 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                  : "glass-card border-white/5"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold font-mono text-zinc-500">{notice.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  notice.risk === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                  notice.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {notice.risk} Risk
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2 leading-snug">{notice.type}</h3>
              <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{notice.description}</p>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] font-medium text-zinc-500">Amount: <strong className="text-white">{formatINR(notice.amount)}</strong></span>
                <span className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                  notice.status === 'Pending Response' ? 'text-rose-500' :
                  notice.status === 'Drafted' ? 'text-amber-500' :
                  'text-emerald-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    notice.status === 'Pending Response' ? 'bg-rose-500' :
                    notice.status === 'Drafted' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                  {notice.status}
                </span>
              </div>
            </div>
          ))}
          {filteredNotices.length === 0 && (
            <div className="p-8 text-center text-zinc-500 italic text-xs glass-card rounded-xl">
              No notices match the filters.
            </div>
          )}
        </div>

        {/* Selected Notice Details pane */}
        <div className="lg:col-span-2">
          {activeNotice ? (
            <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-6 bg-zinc-900/20">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>{activeNotice.section} — Show Cause Compliance Discrepancy</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5">{activeNotice.type}</h2>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Notice Ref: <span className="font-mono font-semibold text-white">{activeNotice.id}</span></div>
                  <div className="text-[10px] text-zinc-500 mt-1">Issued: {activeNotice.issueDate} / Due: {activeNotice.dueDate}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-zinc-400">Notice Description</h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{activeNotice.description}</p>
                </div>
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    <FileWarning className="w-4 h-4 text-rose-500" />
                    Portal Discrepancy Audit Details
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{activeNotice.raisedDetails}</p>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                    <span className="text-xs text-zinc-400">Disputed Tax Amount: <strong className="text-white font-bold">{formatINR(activeNotice.amount)}</strong></span>
                    <span className="text-[10px] text-zinc-500 italic">Interest & penalties liable under Sec 50/122</span>
                  </div>
                </div>
              </div>

              {/* Defense Selector Panel */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Select Legal Defense Strategy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Strategy A */}
                  <label 
                    onClick={() => setDefenseStrategy("circular-183")}
                    className={`border rounded-xl p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                      defenseStrategy === 'circular-183' 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Circular 183 Mismatch Defense</span>
                      <input 
                        type="radio" 
                        name="defense-strategy" 
                        checked={defenseStrategy === 'circular-183'} 
                        onChange={() => {}}
                        className="accent-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                      Cite Circular 183/15/2022. Claim is valid as long as supplier paid taxes and certified compliance.
                    </span>
                  </label>

                  {/* Strategy B */}
                  <label 
                    onClick={() => setDefenseStrategy("portal-challenge")}
                    className={`border rounded-xl p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                      defenseStrategy === 'portal-challenge' 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Portal downtime & Sec 16(4)</span>
                      <input 
                        type="radio" 
                        name="defense-strategy" 
                        checked={defenseStrategy === 'portal-challenge'} 
                        onChange={() => {}}
                        className="accent-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                      Cite systemic GSTN portal crashes. Argue right to claim credit is vested, referencing Madras HC.
                    </span>
                  </label>

                  {/* Strategy C */}
                  <label 
                    onClick={() => setDefenseStrategy("wrong-head")}
                    className={`border rounded-xl p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                      defenseStrategy === 'wrong-head' 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Wrong Tax Head (Sec 77 CGST)</span>
                      <input 
                        type="radio" 
                        name="defense-strategy" 
                        checked={defenseStrategy === 'wrong-head'} 
                        onChange={() => {}}
                        className="accent-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                      Argue misinterpretation of Place of Supply. Demand waiver of interest/penalty under Sec 77 CGST.
                    </span>
                  </label>

                  {/* Strategy D */}
                  <label 
                    onClick={() => setDefenseStrategy("voluntary-reversal")}
                    className={`border rounded-xl p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                      defenseStrategy === 'voluntary-reversal' 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'border-white/5 bg-zinc-900/30 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Voluntary Reversal (Sec 73(8))</span>
                      <input 
                        type="radio" 
                        name="defense-strategy" 
                        checked={defenseStrategy === 'voluntary-reversal'} 
                        onChange={() => {}}
                        className="accent-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                      Voluntarily reverse disputed credit & pay interest under Sec 50. Penalties are dismissed as per Sec 73(8).
                    </span>
                  </label>

                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3">
                <button
                  onClick={() => handleGenerateReply(activeNotice, defenseStrategy)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 font-bold rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-xs"
                >
                  <Sparkles className="w-4 h-4 fill-zinc-950" />
                  Generate AI Reply Draft
                  <ArrowRight className="w-4 h-4" />
                </button>
                {activeNotice.status === "Drafted" && (
                  <button 
                    onClick={() => {
                      setNotices(current => current.map(n => n.id === activeNotice.id ? { ...n, status: "Replied" } : n));
                      triggerToast("Notice marked as Replied & Closed!");
                    }}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 text-xs font-semibold rounded-lg transition-all"
                  >
                    Mark as Submitted
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[300px]">
              <FileText className="w-12 h-12 text-zinc-600 mb-3" />
              <h3 className="font-semibold text-zinc-400 mb-1">No Notice Selected</h3>
              <p className="text-xs text-zinc-600 max-w-xs">Select a notice from the left pane to audit portal mismatch details and generate reply drafts.</p>
            </div>
          )}
        </div>

      </div>

      {/* ============================================== */}
      {/* MODAL: UPLOAD PORTAL NOTICE SCN */}
      {/* ============================================== */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pl-no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  Upload GST Notice Document (SCN)
                </h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isParsingNotice ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
                  <span className="text-emerald-400 text-xs font-semibold">Gemini AI is parsing Notice document...</span>
                  <span className="text-zinc-500 text-[10px] mt-1.5 max-w-xs text-center leading-normal">Extracting statutory sections, demand amounts, issues dates, and disputed parameters.</span>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload SCN notices (Form DRC-01 / Section 73 / Section 74) to let Gemini extract disputed GST amounts and auto-detect place of supply discrepancies.
                  </p>

                  <label 
                    className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group text-center"
                  >
                    <input type="file" className="hidden" onChange={handleUploadNotice} accept=".pdf,.jpg,.png" />
                    <FileText className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-3" />
                    <span className="text-xs text-zinc-300 font-medium">{noticeFileLabel}</span>
                    <span className="text-[10px] text-zinc-600 mt-2">Supports PDF, PNG, JPG (Max 10MB)</span>
                  </label>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================== */}
      {/* MODAL: AI RESPONSE LETTER VIEWER */}
      {/* ============================================== */}
      <AnimatePresence>
        {isReplyModalOpen && activeNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pl-no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 fill-emerald-500/25" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Notice Response Letter</h3>
                    <p className="text-[10px] text-zinc-500">Defense strategy: <span className="capitalize text-emerald-400 font-semibold">{defenseStrategy.replace('-', ' ')}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReplyModalOpen(false)} 
                  disabled={isGenerating}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isGenerating ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
                  <span className="text-emerald-400 text-xs font-semibold">Gemini AI is generating reply defense draft...</span>
                  <span className="text-zinc-500 text-[10px] mt-1.5 max-w-xs text-center leading-normal">Compiling legal arguments, inserting relevant citations, and structuring the presentation.</span>
                </div>
              ) : (
                <div className="flex flex-col h-[480px]">
                  <div className="flex-1 overflow-y-auto p-6 scroll-printable">
                    {/* The editable reply letter paper */}
                    <textarea
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      className="w-full h-full bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-xs font-mono text-zinc-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                    />
                  </div>
                  
                  <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Legally verified draft template</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopy}
                        className="px-3.5 py-1.5 border border-white/5 hover:border-white/10 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-900 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy text
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="px-3.5 py-1.5 bg-emerald-500 text-emerald-950 font-bold rounded-lg text-xs hover:bg-emerald-400 flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styling injection scoped for printable letters */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .pl-printable-view {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .pl-no-print {
            display: none !important;
          }
          aside {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .fixed {
            position: absolute !important;
            z-index: 99999 !important;
            background: #ffffff !important;
            color: #000000 !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .fixed textarea {
            background: #ffffff !important;
            border: none !important;
            color: #000000 !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}} />

      {/* Toast popup */}
      {toastText && (
        <div className="fixed bottom-5 right-5 z-[100] p-3 rounded-lg shadow-lg text-xs font-semibold text-white pointer-events-auto border flex items-center gap-2 bg-zinc-950 border-emerald-500/20 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          {toastText}
        </div>
      )}

    </div>
  );
}
