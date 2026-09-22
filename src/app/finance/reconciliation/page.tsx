"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  X, 
  MessageCircle, 
  Mail, 
  HelpCircle,
  ArrowUpRight,
  ShieldAlert,
  Download,
  Send,
  ExternalLink,
  UploadCloud,
  FileCheck,
  Columns,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useFinanceStore, Payable } from "@/store/useFinanceStore";

export default function ReconciliationPage() {
  const { payables } = useFinanceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Matched" | "Mismatch" | "Missing" | "Blocked">("all");
  
  // Modals / Console States
  const [isNudgeOpen, setIsNudgeOpen] = useState(false);
  const [activePayable, setActivePayable] = useState<any>(null);
  const [nudgeChannel, setNudgeChannel] = useState<"whatsapp" | "email">("whatsapp");
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [importFileLabel, setImportFileLabel] = useState("Drag GSTR-2B JSON file here or select to simulate");
  const [importSuccess, setImportSuccess] = useState(false);
  const [matchingScore, setMatchingScore] = useState(94.2);

  // Sync animation handler
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setMatchingScore(98.4);
      alert("GST Portal matching checks re-run! Score updated to 98.4%.");
    }, 1500);
  };

  // Simulate file upload for GSTR-2B JSON
  const handleImportGSTR2B = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileLabel(`Processing GSTR-2B: ${file.name}`);
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      setImportSuccess(true);
      setMatchingScore(98.1);
      alert(`Successfully reconciled 4 entries from GST Portal JSON: ${file.name}`);
      setIsImportModalOpen(false);
      setImportSuccess(false);
      setImportFileLabel("Drag GSTR-2B JSON file here or select to simulate");
    }, 1800);
  };

  // Generate reconciliation matches from our payables list
  const reconciledItems = useMemo(() => {
    return payables.map((p) => {
      let portalGstAmount = p.totalAmount - Math.round(p.totalAmount / (1 + p.gstRate / 100));
      let portalGstRate = p.gstRate;
      let status: "Matched" | "Mismatch" | "Missing" | "Blocked" = "Matched";
      let reason = "Perfect match on GSTIN, Bill date, and Tax amount.";

      // Determine reconciliation statuses based on bill items & store overrides
      if (p.reconciliationStatus) {
        status = p.reconciliationStatus;
        reason = p.reconciliationReason || "Status updated via GST Portal matching engine.";
        if (status === "Missing") {
          portalGstAmount = 0;
          portalGstRate = 0;
        } else if (status === "Mismatch") {
          portalGstRate = 12;
          const base = Math.round(p.totalAmount / (1 + 18 / 100));
          portalGstAmount = Math.round(base * 0.12);
        }
      } else if (p.billNumber === "BCM-9912") { // Blue Circle Marketing
        status = "Missing";
        portalGstAmount = 0;
        portalGstRate = 0;
        reason = "Vendor has not filed GSTR-1. Invoice missing from GSTR-2B.";
      } else if (p.billNumber === "APEX/881") { // Apex Security
        status = "Mismatch";
        portalGstRate = 12;
        const base = Math.round(p.totalAmount / (1 + 18 / 100));
        portalGstAmount = Math.round(base * 0.12);
        reason = "GST rate discrepancy. Portal shows 12% GST but purchase log recorded 18%.";
      } else if (p.category === "marketing" && p.billNumber !== "BCM-9912") {
        status = "Blocked";
        reason = "Legally blocked Input Tax Credit (ITC) under Section 17(5).";
      } else if (p.category === "salaries") {
        status = "Blocked";
        reason = "Employee salaries are outside the scope of GST credit.";
      }

      const bookGstAmount = (p.cgst + p.sgst + p.igst) || (p.totalAmount - Math.round(p.totalAmount / (1 + p.gstRate / 100)));

      return {
        id: p.id,
        vendorName: p.vendorName,
        billNumber: p.billNumber,
        billDate: p.billDate,
        dueDate: p.dueDate,
        gstin: p.gstin,
        category: p.category,
        totalAmount: p.totalAmount,
        bookGstRate: p.gstRate,
        bookGstAmount,
        portalGstRate,
        portalGstAmount,
        status,
        reason
      };
    });
  }, [payables]);

  // Compute stats
  const stats = useMemo(() => {
    let totalEligible = 0;
    let matchedCredit = 0;
    let mismatchedCredit = 0;
    let missingCredit = 0;
    let blockedCredit = 0;

    reconciledItems.forEach((item) => {
      if (item.status === "Matched") {
        matchedCredit += item.bookGstAmount;
        totalEligible += item.bookGstAmount;
      } else if (item.status === "Mismatch") {
        mismatchedCredit += Math.abs(item.bookGstAmount - item.portalGstAmount);
        totalEligible += item.portalGstAmount; // can only claim portal amount safely
      } else if (item.status === "Missing") {
        missingCredit += item.bookGstAmount;
      } else if (item.status === "Blocked") {
        blockedCredit += item.bookGstAmount;
      }
    });

    return { totalEligible, matchedCredit, mismatchedCredit, missingCredit, blockedCredit };
  }, [reconciledItems]);

  // Filter reconciliation entries
  const filteredItems = useMemo(() => {
    return reconciledItems.filter((item) => {
      const matchesSearch = item.vendorName.toLowerCase().includes(search.toLowerCase()) || item.billNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reconciledItems, search, statusFilter]);

  const handleOpenNudge = (item: any) => {
    setActivePayable(item);
    setNudgeChannel("whatsapp");
    setIsNudgeOpen(true);
  };

  const getNudgeTemplate = () => {
    if (!activePayable) return "";
    if (activePayable.status === "Missing") {
      return `Dear Finance Team at ${activePayable.vendorName},\n\nWe noticed that your invoice #${activePayable.billNumber} dated ${activePayable.billDate} for ₹${activePayable.totalAmount.toLocaleString("en-IN")} is not reflecting in our GSTR-2B portal report. Could you please ensure your GSTR-1 returns are filed so we can claim our Input Tax Credit (₹${activePayable.bookGstAmount.toLocaleString("en-IN")})? \n\nRegards,\nTech Solutions Pvt Ltd`;
    } else {
      return `Dear Finance Team at ${activePayable.vendorName},\n\nWe noticed a GST rate discrepancy in our reconciliation report for invoice #${activePayable.billNumber}. Our books record 18% GST (₹${activePayable.bookGstAmount.toLocaleString("en-IN")}) but the portal shows GSTR-1 uploaded at 12% GST (₹${activePayable.portalGstAmount.toLocaleString("en-IN")}). Could you please verify and amend this in your GSTR-1 filings?\n\nRegards,\nTech Solutions Pvt Ltd`;
    }
  };

  const triggerNudgeSend = () => {
    alert("Nudge notification dispatched to supplier's primary contact endpoint!");
    setIsNudgeOpen(false);
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            GSTR-2B Reconciliation
          </h1>
          <p className="text-zinc-400 mt-1">Audit purchase ledgers against portal records. Resolve Input Tax Credit leakages instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-semibold rounded-lg transition-all text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            Import GSTR-2B JSON
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/5 hover:border-white/10 bg-zinc-900 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800 transition-all text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Running Match..." : "Portal Match Score: " + matchingScore + "%"}
          </button>
        </div>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-emerald-500">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Matched ITC</span>
          <div className="text-xl font-bold text-emerald-500 mt-1.5">{formatINR(stats.matchedCredit)}</div>
          <span className="text-[9px] text-zinc-500 block mt-1">Ready for GSTR-3B filings</span>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-cyan-500">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Claimable</span>
          <div className="text-xl font-bold text-white mt-1.5">{formatINR(stats.totalEligible)}</div>
          <span className="text-[9px] text-zinc-500 block mt-1">Verified safe credits</span>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-rose-500">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Missing filings</span>
          <div className="text-xl font-bold text-rose-500 mt-1.5">{formatINR(stats.missingCredit)}</div>
          <span className="text-[9px] text-zinc-500 block mt-1">Vendor reporting defaults</span>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Mismatched Rate</span>
          <div className="text-xl font-bold text-amber-500 mt-1.5">{formatINR(stats.mismatchedCredit)}</div>
          <span className="text-[9px] text-zinc-500 block mt-1">Discrepancy variance</span>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-purple-500 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Blocked ITC</span>
          <div className="text-xl font-bold text-purple-500 mt-1.5">{formatINR(stats.blockedCredit)}</div>
          <span className="text-[9px] text-zinc-500 block mt-1">Blocked under Sec 17(5)</span>
        </div>
      </div>

      {/* Warning Alert Banner if there are defaults */}
      {stats.missingCredit > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white">Input Tax Credit leakage detected!</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              You are losing up to <strong className="text-rose-400 font-semibold">{formatINR(stats.missingCredit)}</strong> in Input Tax Credits because some suppliers have not filed GSTR-1. Under Section 16(2)(aa), you cannot claim credits for these invoices. Please nudge them to submit.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="glass-card rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor or invoice..." 
              className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 rounded-lg p-0.5">
            {(["all", "Matched", "Mismatch", "Missing", "Blocked"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  statusFilter === tab 
                    ? "bg-emerald-500 text-emerald-950 font-bold" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="text-zinc-500 text-xs font-semibold">
          Showing {filteredItems.length} of {reconciledItems.length} entries
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Vendor Name & GSTIN</th>
                <th className="px-6 py-4 font-semibold">Invoice Details</th>
                <th className="px-6 py-4 font-semibold">Our Books (GSTR-3B)</th>
                <th className="px-6 py-4 font-semibold">GST Portal (GSTR-2B)</th>
                <th className="px-6 py-4 font-semibold">Match Status</th>
                <th className="px-6 py-4 font-semibold">Audit Feedback</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{item.vendorName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">GSTIN: {item.gstin || "Not Entered"}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <div className="font-medium text-xs">Ref: {item.billNumber}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Date: {item.billDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{formatINR(item.bookGstAmount)}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Rate: {item.bookGstRate}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-medium ${item.status === 'Missing' ? 'text-zinc-600' : 'text-white'}`}>
                      {item.status === 'Missing' ? "₹0" : formatINR(item.portalGstAmount)}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">Rate: {item.portalGstRate}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      item.status === 'Matched' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      item.status === 'Mismatch' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      item.status === 'Missing' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      'bg-purple-500/10 text-purple-500 border-purple-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400 max-w-xs leading-normal">
                    {item.reason}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(item.status === "Missing" || item.status === "Mismatch") ? (
                      <button 
                        onClick={() => handleOpenNudge(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-emerald-950 font-bold rounded-lg hover:bg-emerald-400 transition-colors text-xs"
                      >
                        <Columns className="w-3.5 h-3.5" />
                        Audit Variance
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="px-3 py-1.5 bg-zinc-900 border border-white/5 text-zinc-600 rounded-lg text-xs font-semibold"
                      >
                        Reconciled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                    No entries found matching the GSTR matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================== */}
      {/* MODAL: GSTR-2B FILE IMPORT SIMULATOR */}
      {/* ============================================== */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  Import GSTR-2B Portal JSON
                </h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upload the official auto-drafted **GSTR-2B JSON file** downloaded from the GSTN portal to compare supplier uploads against your accounts.
                </p>

                <label 
                  className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group text-center"
                >
                  <input type="file" className="hidden" onChange={handleImportGSTR2B} accept=".json" />
                  <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-3" />
                  <span className="text-xs text-zinc-300 font-medium">{importFileLabel}</span>
                  <span className="text-[10px] text-zinc-600 mt-2">Format: GSTR2B_27_2026_06.json (Max 5MB)</span>
                </label>

                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 text-[11px] text-zinc-500 flex gap-2">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Don't have a JSON? Select any file to run a simulation with standard GSTR-2B ledger splits.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================== */}
      {/* MODAL: AUDIT VARIANCE & VENDOR NUDGE CONSOLE */}
      {/* ============================================== */}
      <AnimatePresence>
        {isNudgeOpen && activePayable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Audit Variance Review Console
                </h3>
                <button onClick={() => setIsNudgeOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                
                {/* Side-by-Side Variance Visualizer */}
                <div>
                  <h4 className="text-xs uppercase font-bold text-zinc-400 mb-3 tracking-widest pl-1">Side-by-Side Comparison</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Books Record */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Our Books (GSTR-3B)
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">GSTIN Registered</span>
                        <span className="font-semibold text-white block mt-0.5">{activePayable.gstin || "N/A"}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">Invoice Ref / Date</span>
                        <span className="font-semibold text-white block mt-0.5">#{activePayable.billNumber} ({activePayable.billDate})</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">GST Bracket / Amount</span>
                        <span className="font-semibold text-white block mt-0.5">
                          {activePayable.bookGstRate}% Bracket — <strong className="text-white">{formatINR(activePayable.bookGstAmount)}</strong>
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Booked & Approved
                      </div>
                    </div>

                    {/* Portal Record */}
                    <div className="bg-zinc-900/50 border border-rose-500/10 rounded-xl p-4 space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        GST Portal (GSTR-2B)
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">GSTIN Registered</span>
                        <span className="font-semibold text-white block mt-0.5">{activePayable.gstin || "N/A"}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">Invoice Ref / Date</span>
                        <span className="font-semibold text-white block mt-0.5">
                          {activePayable.status === 'Missing' ? 'Not Found' : `#${activePayable.billNumber} (${activePayable.billDate})`}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-zinc-500 block uppercase text-[9px] font-bold">GST Bracket / Amount</span>
                        <span className={`font-semibold block mt-0.5 ${activePayable.status === 'Missing' ? 'text-rose-500 font-bold' : 'text-amber-500 font-bold'}`}>
                          {activePayable.status === 'Missing' 
                            ? '0% (Filing Missing)' 
                            : `${activePayable.portalGstRate}% Bracket — ${formatINR(activePayable.portalGstAmount)}`}
                        </span>
                      </div>
                      <div className={`text-[10px] font-semibold mt-2 flex items-center gap-1 ${
                        activePayable.status === 'Missing' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 
                        {activePayable.status === 'Missing' ? 'Filing Missing' : 'Rate Mismatch'}
                      </div>
                    </div>
                  </div>

                  {/* Variance Callout */}
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4.5 mt-4 text-xs">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        Discrepancy Mismatch Summary:
                      </span>
                      <span className="font-bold font-mono text-rose-400">
                        - {formatINR(activePayable.bookGstAmount - activePayable.portalGstAmount)} Variance
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-2 leading-relaxed">
                      {activePayable.reason} Claiming full books amount may trigger CGST audit queries. Supplier must correct GSTR-1.
                    </p>
                  </div>
                </div>

                {/* Outreach / Nudge Actions */}
                <div className="border-t border-white/5 pt-5 space-y-4">
                  <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-widest pl-1">Outreach Dispatcher</h4>

                  <div className="flex gap-2 p-1 bg-zinc-900 border border-white/5 rounded-lg">
                    <button
                      onClick={() => setNudgeChannel("whatsapp")}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        nudgeChannel === 'whatsapp' ? 'bg-emerald-500 text-emerald-950' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Business API
                    </button>
                    <button
                      onClick={() => setNudgeChannel("email")}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        nudgeChannel === 'email' ? 'bg-emerald-500 text-emerald-950' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email SMTP Server
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Auto-Compiled Message</label>
                    <textarea
                      readOnly
                      value={getNudgeTemplate()}
                      className="w-full h-36 bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none font-mono resize-none leading-relaxed"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-white/5 bg-zinc-900/10 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsNudgeOpen(false)}
                  className="px-4 py-2 border border-white/5 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={triggerNudgeSend}
                  className="px-5 py-2 bg-emerald-500 text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
