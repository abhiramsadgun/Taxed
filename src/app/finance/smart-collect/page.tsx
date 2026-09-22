"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Link as LinkIcon, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Split, 
  Lock, 
  ArrowUpRight, 
  Building2, 
  CreditCard, 
  Smartphone, 
  Scale, 
  FileCheck,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";
import { useFinanceStore, SmartCollectLink } from "@/store/useFinanceStore";

export default function SmartCollectB2BLinksPage() {
  const { 
    smartLinks, 
    generateSmartCollectLink, 
    flagTaxDisputeOnSmartLink, 
    resolveSmartLinkDispute 
  } = useFinanceStore();

  const [selectedLink, setSelectedLink] = useState<SmartCollectLink | null>(smartLinks[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Generator
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [buyerName, setBuyerName] = useState("Acme Aerospace Systems");
  const [buyerGstin, setBuyerGstin] = useState("27AACCA1234A1Z5");
  const [baseSubtotal, setBaseSubtotal] = useState(150000);
  const [gstRate, setGstRate] = useState(18);

  // Dispute Form
  const [disputeReason, setDisputeReason] = useState("HSN SAC 998313 billed at 18% instead of statutory 12% concessional rate.");
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const link = generateSmartCollectLink({
      invoiceNumber,
      buyerName,
      buyerGstin,
      baseSubtotal: Number(baseSubtotal),
      gstRate: Number(gstRate)
    });
    setSelectedLink(link);
    setToastMessage(`Smart B2B Payment Link generated with embedded IRN & QR metadata!`);
    setInvoiceNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerDispute = () => {
    if (!selectedLink) return;
    flagTaxDisputeOnSmartLink(selectedLink.id, disputeReason, 6);
    setDisputeModalOpen(false);
    const updated = useFinanceStore.getState().smartLinks.find(l => l.id === selectedLink.id);
    if (updated) setSelectedLink(updated);
    setToastMessage("Tax Dispute Flagged: Subtotal released to merchant, ₹18,000 tax locked in Escrow.");
  };

  const handleResolveDispute = (resolution: "MERCHANT_RELEASE" | "BUYER_REFUND") => {
    if (!selectedLink) return;
    resolveSmartLinkDispute(selectedLink.id, resolution);
    const updated = useFinanceStore.getState().smartLinks.find(l => l.id === selectedLink.id);
    if (updated) setSelectedLink(updated);
    setToastMessage(`Dispute Resolved: ${resolution === "MERCHANT_RELEASE" ? "Escrow released to Merchant" : "Disputed tax refunded to Buyer"}.`);
  };

  const totalActiveCollect = smartLinks.filter(l => l.status === "ACTIVE").reduce((acc, l) => acc + l.totalPayable, 0);
  const totalEscrowLocked = smartLinks.filter(l => l.status === "PARTIALLY_SETTLED_DISPUTED").reduce((acc, l) => acc + (l.dispute?.escrowHeldAmount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                Razorpay Smart Collect & Payment Links
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Cryptographic e-Invoice IRN Embedded
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Dynamic B2B Links & Tax Escrow Settlement
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Generate Razorpay Payment Links and dedicated Virtual UPI Accounts embedded with government e-Invoice IRN & QR metadata. In case of HSN rate or tax disputes, our <strong className="text-white">Escrow Split Engine</strong> releases the base subtotal immediately to the merchant while holding only disputed tax amounts.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Active Smart Collect Links</span>
            <LinkIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">₹{totalActiveCollect.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {smartLinks.filter(l => l.status === "ACTIVE").length} Links active with verified IRN metadata
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Dispute Escrow Locked</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">₹{totalEscrowLocked.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Held in compliance escrow pending credit notes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Base Subtotals Released</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ₹{smartLinks.filter(l => l.status === "PARTIALLY_SETTLED_DISPUTED").reduce((acc, l) => acc + (l.dispute?.merchantReleasedSubtotal || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Zero cashflow bottlenecks for merchants during tax disputes
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-zinc-900 border border-cyan-500/30 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-cyan-200">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white text-xs">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Generator & Interactive Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Generate B2B Smart Link</h2>
                <p className="text-[11px] text-zinc-400">Auto-embeds e-Invoice IRN & GST Breakdown</p>
              </div>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">Buyer Company</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">Buyer GSTIN</label>
                  <input
                    type="text"
                    value={buyerGstin}
                    onChange={(e) => setBuyerGstin(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">Base Subtotal (₹)</label>
                  <input
                    type="number"
                    value={baseSubtotal}
                    onChange={(e) => setBaseSubtotal(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value={5}>5% (Concessional)</option>
                    <option value={12}>12% (Standard Services)</option>
                    <option value={18}>18% (Standard Goods/IT)</option>
                    <option value={28}>28% (Luxury/Demerit)</option>
                  </select>
                </div>
              </div>

              {/* Real-time calculated total */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5 flex items-center justify-between font-mono">
                <span className="text-zinc-400">Total B2B Collect:</span>
                <span className="text-sm font-bold text-cyan-400">
                  ₹{(baseSubtotal + Math.round(baseSubtotal * (gstRate / 100))).toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Razorpay Smart Link & Virtual QR
              </button>
            </form>
          </div>

          {/* Active Links History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Payment Links</h3>
            <div className="space-y-2">
              {smartLinks.map((link) => (
                <div
                  key={link.id}
                  onClick={() => setSelectedLink(link)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLink?.id === link.id
                      ? "bg-zinc-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20"
                      : "bg-zinc-900/40 hover:bg-zinc-900/70 border-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{link.buyerName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {link.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                      {link.virtualUpiId}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-white font-mono">₹{link.totalPayable.toLocaleString()}</div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      link.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : link.status === "PARTIALLY_SETTLED_DISPUTED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {link.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Link Preview & Interactive Dispute Escrow Simulator */}
        <div className="lg:col-span-7">
          {selectedLink ? (
            <div className="space-y-6">
              {/* Virtual UPI & QR Card Preview */}
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Razorpay Smart Collect Virtual Account
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1.5">{selectedLink.buyerName}</h3>
                    <p className="text-xs text-zinc-400 font-mono">Invoice: {selectedLink.invoiceNumber} | Due: {selectedLink.dueDate}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">Total Payable</span>
                    <span className="text-2xl font-bold text-white font-mono">₹{selectedLink.totalPayable.toLocaleString()}</span>
                  </div>
                </div>

                {/* QR Code and Virtual UPI details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
                    {/* Simulated SVG QR */}
                    <div className="w-32 h-32 flex flex-col items-center justify-center border-4 border-zinc-950 rounded-xl p-2 relative bg-zinc-900">
                      <QrCode className="w-24 h-24 text-white" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-md bg-cyan-500 flex items-center justify-center shadow-lg">
                          <ShieldCheck className="w-4 h-4 text-zinc-950 font-bold" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-800 mt-2 uppercase tracking-wider">
                      e-Invoice Compliant QR
                    </span>
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Razorpay Smart Link URL
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={selectedLink.shortUrl}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                        />
                        <button
                          onClick={() => handleCopy(selectedLink.shortUrl, "url")}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          title="Copy Link"
                        >
                          {copiedId === "url" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Dedicated Smart Collect Virtual UPI ID
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={selectedLink.virtualUpiId}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300"
                        />
                        <button
                          onClick={() => handleCopy(selectedLink.virtualUpiId, "vpa")}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          title="Copy UPI VPA"
                        >
                          {copiedId === "vpa" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* e-Invoice IRN Hash */}
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Cryptographic e-Invoice IRN Hash
                      </span>
                      <div className="mt-1 text-[10px] font-mono text-emerald-400/90 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg truncate">
                        {selectedLink.irn}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Dispute & Partial Settlement Escrow Box */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Partial Settlement on Tax Dispute</span>
                    </div>
                    {selectedLink.dispute?.isDisputed && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        ESCROW HOLD ACTIVE
                      </span>
                    )}
                  </div>

                  {selectedLink.dispute?.isDisputed ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Buyer Flagged Tax Discrepancy</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          Reason: {selectedLink.dispute.disputeReason}
                        </p>
                      </div>

                      {/* Escrow Breakdown */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] text-zinc-400 block">Released to Merchant</span>
                          <span className="text-sm font-bold text-emerald-400">
                            ₹{selectedLink.dispute.merchantReleasedSubtotal.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-emerald-300/80 block mt-0.5">Base Subtotal Settled</span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="text-[10px] text-zinc-400 block">Held in Escrow</span>
                          <span className="text-sm font-bold text-amber-400">
                            ₹{selectedLink.dispute.escrowHeldAmount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-amber-300/80 block mt-0.5">Pending Credit Note</span>
                        </div>
                      </div>

                      {/* Resolution Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleResolveDispute("MERCHANT_RELEASE")}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Release Escrow to Merchant (CN Issued)
                        </button>
                        <button
                          onClick={() => handleResolveDispute("BUYER_REFUND")}
                          className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          Refund Tax to Buyer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                        Simulate the buyer checkout experience. If the buyer detects an incorrect HSN tax rate, they can flag a dispute without withholding the entire payment.
                      </p>
                      <button
                        onClick={() => setDisputeModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                      >
                        Simulate Buyer Tax Dispute
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 text-center text-zinc-500 text-xs">
              Select or generate a Smart Payment Link to inspect QR metadata and simulate dispute escrow flows.
            </div>
          )}
        </div>
      </div>

      {/* Buyer Dispute Modal */}
      <AnimatePresence>
        {disputeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Simulate Buyer Checkout Dispute</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Buyer flagging tax variance on <strong className="text-white">{selectedLink?.invoiceNumber}</strong>. 
                The system will automatically disburse <strong className="text-emerald-400">₹{selectedLink?.baseSubtotal.toLocaleString()}</strong> to the merchant and lock the disputed tax in escrow.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-semibold">Dispute Rationale</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full h-20 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerDispute}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  Execute Escrow Split
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
