"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, RefreshCw, Eye, Download, Search, X, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";

const initialNotices = [
  { id: "INV-2026-001", type: "Tax Invoice", date: "2026-05-15", status: "Analyzed", risk: "Low", amount: "₹45,000" },
  { id: "INV-2026-002", type: "Proforma", date: "2026-05-10", status: "Drafted", risk: "Low", amount: "-" },
  { id: "INV-2026-003", type: "Tax Invoice", date: "2026-04-22", status: "Analyzed", risk: "Medium", amount: "₹1,12,000" },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState(initialNotices);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [aiResult, setAiResult] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStep("uploading");
    setAiResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // In production, use your actual backend URL here
      const response = await fetch("http://localhost:8000/api/v1/ai/analyze-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze invoice");
      }

      const data = await response.json();
      setAiResult(data.data); // data.data contains the Gemini JSON response
      setUploadStep("success");

      // Auto-close success modal after 5s and add to table
      setTimeout(() => {
        setNotices(current => [{
          id: `INV-2026-00${current.length + 1}`,
          type: "Tax Invoice",
          date: new Date().toISOString().split('T')[0],
          status: "Analyzed",
          risk: data.data.risk_level || "Medium",
          amount: "-"
        }, ...current]);
        setIsUploading(false);
        setUploadStep("idle");
      }, 5000);

    } catch (error) {
      console.error(error);
      setUploadStep("error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Invoice Analysis</h1>
          <p className="text-zinc-400 mt-1">Upload an invoice to identify compliance errors and loopholes via Gemini AI.</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-emerald-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 border-l-4 border-l-rose-500">
          <div className="text-zinc-400 text-sm font-medium">High Risk Invoices</div>
          <div className="text-3xl font-bold text-rose-500 mt-2">{notices.filter(n => n.risk === 'High').length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5 border-l-4 border-l-amber-500">
          <div className="text-zinc-400 text-sm font-medium">Medium Risk Invoices</div>
          <div className="text-3xl font-bold text-amber-500 mt-2">{notices.filter(n => n.risk === 'Medium').length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500">
          <div className="text-zinc-400 text-sm font-medium">Compliant Invoices</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{notices.filter(n => n.risk === 'Low').length}</div>
        </motion.div>
      </div>

      {/* Notice Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <button className="text-zinc-400 hover:text-white inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-zinc-800/50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync from Portal
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date Received</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    {notice.id}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{notice.type}</td>
                  <td className="px-6 py-4 text-zinc-400">{notice.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      notice.risk === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      notice.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {notice.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{notice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        notice.status === 'Pending' ? 'bg-rose-500' :
                        notice.status === 'Analyzed' ? 'bg-cyan-500' :
                        'bg-emerald-500'
                      }`} />
                      {notice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded hover:bg-zinc-700 transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-zinc-400 hover:text-emerald-400 bg-zinc-800 rounded hover:bg-emerald-400/20 transition-colors" title="Download AI Draft">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-zinc-950 border border-white/10 p-6 rounded-2xl w-full relative shadow-2xl transition-all ${uploadStep === 'success' ? 'max-w-2xl' : 'max-w-md'}`}
            >
              <button 
                onClick={() => { setIsUploading(false); setUploadStep("idle"); setAiResult(null); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                disabled={uploadStep === "uploading"}
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">Upload GST Invoice</h2>
              <p className="text-sm text-zinc-400 mb-6">Upload PDF or scanned image of the invoice for AI analysis.</p>
              
              {uploadStep === "idle" && (
                <label 
                  className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                >
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
                  <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-emerald-500/20 flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-zinc-300 font-medium">Click or drag invoice to upload</span>
                  <span className="text-zinc-500 text-xs mt-2">Supports PDF, JPG, PNG (Max 10MB)</span>
                </label>
              )}

              {uploadStep === "uploading" && (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
                  <span className="text-emerald-400 font-medium mb-2">Gemini AI is analyzing invoice...</span>
                  <span className="text-zinc-500 text-xs mt-2 text-center max-w-xs">Checking HSN codes, tax calculations, and detecting compliance loopholes.</span>
                </div>
              )}

              {uploadStep === "success" && aiResult && (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Analysis Complete</h3>
                      <p className="text-zinc-400 text-sm">Risk Level: <span className={`font-medium ${aiResult.risk_level === 'High' ? 'text-rose-500' : aiResult.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{aiResult.risk_level}</span></p>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                    {aiResult.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Errors */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-rose-500 font-medium mb-3 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Compliance Errors ({aiResult.errors?.length || 0})
                      </div>
                      <ul className="space-y-2">
                        {aiResult.errors?.map((err: string, i: number) => (
                          <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            {err}
                          </li>
                        ))}
                        {(!aiResult.errors || aiResult.errors.length === 0) && (
                          <li className="text-emerald-500/70 text-xs italic">No errors found.</li>
                        )}
                      </ul>
                    </div>

                    {/* Loopholes / Warnings */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-500 font-medium mb-3 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Loopholes & Warnings ({aiResult.loopholes?.length || 0})
                      </div>
                      <ul className="space-y-2">
                        {aiResult.loopholes?.map((loophole: string, i: number) => (
                          <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {loophole}
                          </li>
                        ))}
                        {(!aiResult.loopholes || aiResult.loopholes.length === 0) && (
                          <li className="text-emerald-500/70 text-xs italic">No loopholes detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center text-xs text-zinc-500">
                    This window will close automatically...
                  </div>
                </div>
              )}

              {uploadStep === "error" && (
                <div className="py-8 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
                    <X className="w-6 h-6" />
                  </div>
                  <span className="text-white font-medium">Analysis Failed</span>
                  <span className="text-zinc-400 text-sm mt-1">Please check your API key or try again.</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
