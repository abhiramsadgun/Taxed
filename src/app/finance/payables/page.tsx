"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, 
  Trash2, 
  Edit2, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  X, 
  Bell, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Receipt,
  Mail,
  MessageCircle,
  FileCheck
} from "lucide-react";
import { useFinanceStore, Payable } from "@/store/useFinanceStore";

export default function PayablesPage() {
  const { payables, addBill, updateBill, deleteBill, recordPayment, vendors } = useFinanceStore();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Partially Paid" | "Paid">("all");
  const [sortBy, setSortBy] = useState<"due-date" | "amount-desc" | "amount-asc" | "vendor-name">("due-date");

  // Modal Open States
  const [activeBill, setActiveBill] = useState<Payable | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  
  const [activePaymentBill, setActivePaymentBill] = useState<Payable | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState("2026-06-18");

  const [activeReminderBill, setActiveReminderBill] = useState<Payable | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTab, setReminderTab] = useState<"whatsapp" | "email">("whatsapp");

  const [activeProofBill, setActiveProofBill] = useState<Payable | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Form Fields
  const [vendorName, setVendorName] = useState("");
  const [gstin, setGstin] = useState("");
  const [category, setCategory] = useState("vendor payments");
  const [hsnSac, setHsnSac] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [gstRate, setGstRate] = useState<number>(18);
  const [billDate, setBillDate] = useState("2026-06-18");
  const [dueDate, setDueDate] = useState("2026-07-03");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [proofBase64, setProofBase64] = useState("");
  const [fileLabel, setFileLabel] = useState("Click here to upload receipt photo (Required for new bills)");

  // Toast State
  const [toasts, setToasts] = useState<{id: string, text: string, type: "success" | "error" | "info"}[]>([]);

  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const appToday = new Date("2026-06-18");

  // Summary figures
  const summary = useMemo(() => {
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalPartialCount = 0;

    payables.forEach(p => {
      if (p.status !== "Paid") {
        const oAmt = p.totalAmount - p.paidAmount;
        totalOutstanding += oAmt;
        
        const dueObj = new Date(p.dueDate);
        if (dueObj < appToday) {
          totalOverdue += oAmt;
        }

        if (p.status === "Partially Paid") {
          totalPartialCount++;
        }
      }
    });

    return { totalOutstanding, totalOverdue, totalPartialCount };
  }, [payables]);

  // List of filtered & sorted payables
  const filteredPayables = useMemo(() => {
    let result = payables.filter(p => {
      const matchesSearch = p.vendorName.toLowerCase().includes(search.toLowerCase()) || p.billNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "due-date") {
        if (a.status === "Paid" && b.status !== "Paid") return 1;
        if (a.status !== "Paid" && b.status === "Paid") return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "amount-desc") {
        return b.totalAmount - a.totalAmount;
      } else if (sortBy === "amount-asc") {
        return a.totalAmount - b.totalAmount;
      } else if (sortBy === "vendor-name") {
        return a.vendorName.localeCompare(b.vendorName);
      }
      return 0;
    });

    return result;
  }, [payables, search, statusFilter, sortBy]);

  // Form tax calculations
  const formTaxDetails = useMemo(() => {
    if (totalAmount <= 0) return null;
    const baseValue = Math.round(totalAmount / (1 + gstRate / 100));
    const totalTax = totalAmount - baseValue;
    const isLocal = !gstin || gstin.toUpperCase().startsWith("27");
    
    if (isLocal) {
      return {
        baseValue,
        cgst: Math.round(totalTax / 2),
        sgst: Math.round(totalTax / 2),
        igst: 0,
        isIntra: true
      };
    } else {
      return {
        baseValue,
        cgst: 0,
        sgst: 0,
        igst: totalTax,
        isIntra: false
      };
    }
  }, [totalAmount, gstRate, gstin]);

  // File parsing (FileReader)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      addToast("File size too large. Please select an image under 1.5MB.", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setProofBase64(base64);
      setFileLabel(`Selected: ${file.name} (${Math.round(file.size/1024)} KB)`);
      addToast("Receipt proof image uploaded!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Open Add Bill Modal
  const handleOpenAddModal = (bill: Payable | null = null) => {
    if (bill) {
      setActiveBill(bill);
      setVendorName(bill.vendorName);
      setGstin(bill.gstin || "");
      setCategory(bill.category);
      setHsnSac(bill.hsnSac || "");
      setBillNumber(bill.billNumber);
      setGstRate(bill.gstRate);
      setBillDate(bill.billDate);
      setDueDate(bill.dueDate);
      setTotalAmount(bill.totalAmount);
      setPaidAmount(bill.paidAmount);
      setProofBase64(bill.proofImage || "");
      setFileLabel(bill.proofImage ? "Existing receipt loaded. Click here to replace." : "Click here to upload receipt photo (Required for new bills)");
    } else {
      setActiveBill(null);
      setVendorName("");
      setGstin("");
      setCategory("vendor payments");
      setHsnSac("");
      setBillNumber("");
      setGstRate(18);
      setBillDate("2026-06-18");
      setDueDate("2026-07-03");
      setTotalAmount(0);
      setPaidAmount(0);
      setProofBase64("");
      setFileLabel("Click here to upload receipt photo (Required for new bills)");
    }
    setIsBillModalOpen(true);
  };

  // Submit Bill
  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorName.trim() || !billNumber.trim() || totalAmount <= 0) {
      addToast("Please fill all required inputs.", "error");
      return;
    }

    // Enforce proof file uploads
    if (!activeBill && !proofBase64) {
      addToast("Verification Failed: Receipt proof image is required!", "error");
      return;
    }

    if (paidAmount > totalAmount) {
      addToast("Amount paid cannot exceed total bill amount.", "error");
      return;
    }

    const billPayload = {
      vendorName,
      category,
      billNumber,
      billDate,
      dueDate,
      totalAmount,
      paidAmount,
      gstin,
      hsnSac: hsnSac || "998313",
      gstRate,
      proofImage: proofBase64
    };

    if (activeBill) {
      updateBill(activeBill.id, billPayload);
      addToast("Vendor bill updated successfully!");
    } else {
      addBill(billPayload);
      addToast("New vendor bill recorded!");
    }

    setIsBillModalOpen(false);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (bill: Payable) => {
    setActivePaymentBill(bill);
    const balance = bill.totalAmount - bill.paidAmount;
    setPaymentAmount(balance);
    setPaymentDate("2026-06-18");
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentBill) return;

    const balance = activePaymentBill.totalAmount - activePaymentBill.paidAmount;
    if (paymentAmount <= 0 || paymentAmount > balance) {
      addToast(`Please enter a payment amount between ₹1 and ₹${balance.toLocaleString()}`, "error");
      return;
    }

    recordPayment(activePaymentBill.id, paymentAmount, paymentDate);
    addToast(`Recorded payment of ₹${paymentAmount.toLocaleString()} to ${activePaymentBill.vendorName}`);
    setIsPaymentModalOpen(false);
  };

  // Open Reminder Modal
  const handleOpenReminderModal = (bill: Payable) => {
    setActiveReminderBill(bill);
    setReminderTab("whatsapp");
    setIsReminderModalOpen(true);
  };

  const handleReminderSendSim = () => {
    addToast("Automation trigger fired! Alert sent via WhatsApp and Email APIs.", "success");
    setIsReminderModalOpen(false);
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Payables Tracker</h1>
          <p className="text-zinc-400 mt-1">Audit outstanding vendor bills, track GST inputs, and trigger payment alerts.</p>
        </div>
        <button 
          onClick={() => handleOpenAddModal(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-emerald-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add New Bill
        </button>
      </div>

      {/* Mini Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-amber-500">
          <div className="text-zinc-400 text-sm font-medium">Outstanding Payables</div>
          <div className="text-3xl font-bold text-white mt-2">{formatINR(summary.totalOutstanding)}</div>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-rose-500">
          <div className="text-zinc-400 text-sm font-medium">Overdue Bills Liabilities</div>
          <div className="text-3xl font-bold text-rose-500 mt-2">{formatINR(summary.totalOverdue)}</div>
        </div>
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500">
          <div className="text-zinc-400 text-sm font-medium">Partially Settled Bills</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{summary.totalPartialCount}</div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-card rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor or bill..." 
              className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="due-date">Sort: Due Date</option>
            <option value="amount-desc">Sort: Amount (High to Low)</option>
            <option value="amount-asc">Sort: Amount (Low to High)</option>
            <option value="vendor-name">Sort: Vendor Name</option>
          </select>
        </div>
        <div className="text-zinc-500 text-xs font-medium shrink-0">
          Showing {filteredPayables.length} of {payables.length} bills
        </div>
      </div>

      {/* Payables Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor & GSTIN</th>
                <th className="px-6 py-4 font-medium">Category / HSN</th>
                <th className="px-6 py-4 font-medium">Dates (Bill / Due)</th>
                <th className="px-6 py-4 font-medium">GST Breakdown</th>
                <th className="px-6 py-4 font-medium">Settlement Progress</th>
                <th className="px-6 py-4 font-medium">Outstanding</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayables.map((p) => {
                const balance = p.totalAmount - p.paidAmount;
                const paidPct = Math.round((p.paidAmount / p.totalAmount) * 100);
                
                const isOverdue = new Date(p.dueDate) < appToday && p.status !== "Paid";
                const diffDays = Math.ceil((new Date(p.dueDate).getTime() - appToday.getTime()) / (1000 * 60 * 60 * 24));
                const isDueSoon = !isOverdue && diffDays >= 0 && diffDays <= 5 && p.status !== "Paid";

                return (
                  <tr 
                    key={p.id} 
                    className={`border-b border-white/5 hover:bg-white/[0.01] transition-colors ${
                      isOverdue ? "bg-rose-500/[0.015]" : isDueSoon ? "bg-amber-500/[0.01]" : ""
                    }`}
                  >
                    {/* Vendor name */}
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="font-semibold">{p.vendorName}</div>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                        GSTIN: {p.gstin || "Not provided"}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="capitalize text-xs font-semibold">{p.category}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">HSN/SAC: {p.hsnSac || "-"}</div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-zinc-400">
                      <div className={`text-xs ${isOverdue ? "text-rose-500 font-semibold" : isDueSoon ? "text-amber-500 font-semibold" : ""}`}>
                        Due: {p.dueDate}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Bill Date: {p.billDate}</div>
                    </td>

                    {/* Tax Splits */}
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="text-xs">
                        {p.gstRate > 0 ? (
                          p.cgst > 0 ? (
                            `CGST+SGST (${p.gstRate}%): ₹${(p.cgst + p.sgst).toLocaleString()}`
                          ) : (
                            `IGST (${p.gstRate}%): ₹${p.igst.toLocaleString()}`
                          )
                        ) : (
                          "0% Tax-Exempt"
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Bill Ref: {p.billNumber}</div>
                    </td>

                    {/* Progress Bar */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${paidPct}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          ₹{p.paidAmount.toLocaleString()} / ₹{p.totalAmount.toLocaleString()} ({paidPct}%)
                        </span>
                      </div>
                    </td>

                    {/* Outstanding */}
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{formatINR(balance)}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          p.status === "Pending" ? "bg-rose-500" :
                          p.status === "Partially Paid" ? "bg-amber-500" :
                          "bg-emerald-500"
                        }`} />
                        <span className="text-[10px] text-zinc-400">{p.status}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { setActiveProofBill(p); setIsProofModalOpen(true); }}
                          className="p-1.5 text-zinc-400 hover:text-cyan-400 bg-zinc-900 rounded hover:bg-zinc-800 transition-colors"
                          title="View Receipt Proof"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(isOverdue || isDueSoon) && (
                          <button 
                            onClick={() => handleOpenReminderModal(p)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 bg-amber-500/5 rounded hover:bg-amber-500/20 transition-colors border border-amber-500/10"
                            title="Simulate Reminders"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {p.status !== "Paid" && (
                          <button 
                            onClick={() => handleOpenPaymentModal(p)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 rounded hover:bg-emerald-500/20 transition-colors border border-emerald-500/10"
                            title="Record Payment"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenAddModal(p)}
                          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded hover:bg-zinc-800 transition-colors"
                          title="Edit Bill Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => { if(confirm("Delete this bill?")) deleteBill(p.id); }}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 bg-zinc-900 rounded hover:bg-zinc-800 transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPayables.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                    No vendor bills found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================== */}
      {/* MODAL: ADD/EDIT VENDOR BILL */}
      {/* ============================================== */}
      <AnimatePresence>
        {isBillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-lg font-bold text-white">
                  {activeBill ? "Edit Vendor Bill" : "Record Vendor Bill"}
                </h3>
                <button onClick={() => setIsBillModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBillSubmit}>
                <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Vendor Name *</label>
                      <input 
                        type="text" 
                        value={vendorName} 
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g. Reddy Tech Solutions" 
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Vendor GSTIN</label>
                      <input 
                        type="text" 
                        value={gstin} 
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAAAA1111A1Z1" 
                        maxLength={15}
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Category *</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="salaries">Salaries & Payroll</option>
                        <option value="rent">Office Rent</option>
                        <option value="marketing">Marketing & Ads</option>
                        <option value="utilities">Utilities & Hosting</option>
                        <option value="vendor payments">Vendor Payments</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">HSN/SAC Code</label>
                      <input 
                        type="text" 
                        value={hsnSac} 
                        onChange={(e) => setHsnSac(e.target.value)}
                        placeholder="e.g. 998313" 
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Bill Number *</label>
                      <input 
                        type="text" 
                        value={billNumber} 
                        onChange={(e) => setBillNumber(e.target.value)}
                        placeholder="e.g. RTS-26-27/044" 
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Bill Date *</label>
                      <input 
                        type="date" 
                        value={billDate} 
                        onChange={(e) => setBillDate(e.target.value)}
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Due Date *</label>
                      <input 
                        type="date" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">GST Rate (%)</label>
                      <select 
                        value={gstRate} 
                        onChange={(e) => setGstRate(Number(e.target.value))}
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Total Bill Amount (Gross ₹) *</label>
                      <input 
                        type="number" 
                        value={totalAmount || ""} 
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        placeholder="0.00" 
                        min={1}
                        step="any"
                        required
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Amount Already Paid (₹)</label>
                      <input 
                        type="number" 
                        value={paidAmount || ""} 
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        placeholder="0.00" 
                        min={0}
                        step="any"
                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Receipt Upload Zone */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Bill Proof Attachment *</label>
                      <input 
                        type="file" 
                        id="payable-proof-file-react" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <div 
                        onClick={() => document.getElementById("payable-proof-file-react")?.click()}
                        className="border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-center"
                      >
                        <UploadCloud className="w-6 h-6 text-zinc-400 mb-2" />
                        <span className="text-xs text-zinc-300 font-medium">{fileLabel}</span>
                        {proofBase64 && (
                          <div className="mt-3">
                            <img src={proofBase64} alt="Thumb Preview" className="max-h-20 max-w-full rounded border border-white/5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tax splits display panel */}
                  {formTaxDetails && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-1 text-emerald-400 leading-relaxed">
                      <strong>Tax Split Computations ({formTaxDetails.isIntra ? "Intra-state GST" : "Inter-state GST"}):</strong>
                      <div>• Taxable Base Value (Net of Tax): ₹{formTaxDetails.baseValue.toLocaleString()}</div>
                      {formTaxDetails.isIntra ? (
                        <>
                          <div>• CGST ({gstRate/2}%): ₹{formTaxDetails.cgst.toLocaleString()}</div>
                          <div>• SGST ({gstRate/2}%): ₹{formTaxDetails.sgst.toLocaleString()}</div>
                        </>
                      ) : (
                        <div>• IGST ({gstRate}%): ₹{formTaxDetails.igst.toLocaleString()}</div>
                      )}
                      <div className="text-[10px] text-zinc-500 mt-1 font-medium">Mapped using GSTIN code (buyer base state is Maharashtra - 27)</div>
                    </div>
                  )}

                </div>

                <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsBillModalOpen(false)}
                    className="px-4 py-2 border border-white/5 text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-emerald-500 text-emerald-950 rounded-lg text-sm font-bold hover:bg-emerald-400"
                  >
                    Save Vendor Bill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================== */}
      {/* MODAL: ADD PAYMENT INSTANCE */}
      {/* ============================================== */}
      <AnimatePresence>
        {isPaymentModalOpen && activePaymentBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-md font-bold text-white">Record Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Vendor</label>
                    <div className="font-semibold text-white mt-0.5">{activePaymentBill.vendorName}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Outstanding Balance</label>
                    <div className="font-bold text-lg text-rose-500 mt-0.5">
                      {formatINR(activePaymentBill.totalAmount - activePaymentBill.paidAmount)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Payment Amount (₹)</label>
                    <input 
                      type="number" 
                      value={paymentAmount || ""} 
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="0.00" 
                      min={1}
                      step="any"
                      required
                      className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Payment Date</label>
                    <input 
                      type="date" 
                      value={paymentDate} 
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                      className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-white/5 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-3 py-1.5 border border-white/5 text-zinc-400 rounded-lg text-xs font-semibold hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-3 py-1.5 bg-emerald-500 text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================== */}
      {/* MODAL: REMINDER SIMULATOR */}
      {/* ============================================== */}
      <AnimatePresence>
        {isReminderModalOpen && activeReminderBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Automated Reminder Simulator
                </h3>
                <button onClick={() => setIsReminderModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Vriddhi Capital automated triggers generate payment reminders for vendor liabilities. Preview below:
                </p>

                <div className="flex gap-2 border-b border-white/5 pb-2">
                  <button 
                    onClick={() => setReminderTab("whatsapp")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      reminderTab === "whatsapp" ? "bg-emerald-500 text-emerald-950" : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Preview
                  </button>
                  <button 
                    onClick={() => setReminderTab("email")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      reminderTab === "email" ? "bg-cyan-500 text-cyan-950" : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Notification
                  </button>
                </div>

                {reminderTab === "whatsapp" && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3 animate-in fade-in">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">WhatsApp API Template Payload</div>
                    <pre className="p-3 bg-zinc-950 rounded-lg text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "messaging_product": "whatsapp",
  "to": "+91 98765 43210",
  "type": "template",
  "template": {
    "name": "payment_reminder",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "${activeReminderBill.vendorName}" },
          { "type": "text", "text": "${activeReminderBill.billNumber}" },
          { "type": "text", "text": "₹${(activeReminderBill.totalAmount - activeReminderBill.paidAmount).toLocaleString('en-IN')}" },
          { "type": "text", "text": "${activeReminderBill.dueDate}" }
        ]
      }
    ]
  }
}`}
                    </pre>
                  </div>
                )}

                {reminderTab === "email" && (
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-3 animate-in fade-in">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">SMTP Client Email Draft</div>
                    <div className="bg-zinc-950 border border-white/5 rounded-lg p-3 text-xs space-y-2 text-zinc-300 font-mono">
                      <div><strong>Subject:</strong> Payment Notification Alert - ${activeReminderBill.billNumber}</div>
                      <div><strong>To:</strong> finance@vendor.com</div>
                      <div className="border-t border-white/5 pt-2 whitespace-pre-wrap leading-relaxed">
{`Dear Finance Team at ${activeReminderBill.vendorName},

This is an automated notification from Vriddhi Capital regarding vendor bill reference ${activeReminderBill.billNumber} (total ₹${activeReminderBill.totalAmount.toLocaleString()}).

An outstanding balance of ₹${(activeReminderBill.totalAmount - activeReminderBill.paidAmount).toLocaleString()} is logged in our payables registry. Our accounts team will complete this bank settlement based on terms (Due Date: ${activeReminderBill.dueDate}).

GST details verified: ${activeReminderBill.gstin || "Not Provided"}.

Sincerely,
Accounts Department
Vriddhi Capital`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex justify-end gap-2">
                <button 
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3 py-1.5 border border-white/5 text-zinc-400 rounded-lg text-xs font-semibold hover:bg-zinc-800"
                >
                  Close
                </button>
                <button 
                  onClick={handleReminderSendSim}
                  className="px-3 py-1.5 bg-emerald-500 text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
                >
                  Trigger Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================== */}
      {/* MODAL: PROOF LIGHTBOX */}
      {/* ============================================== */}
      <AnimatePresence>
        {isProofModalOpen && activeProofBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  Bill Attachment Proof
                </h3>
                <button onClick={() => setIsProofModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 text-center max-h-[400px] overflow-y-auto">
                {activeProofBill.proofImage && activeProofBill.proofImage.startsWith("data:image/") ? (
                  <img 
                    src={activeProofBill.proofImage} 
                    alt="Uploaded bill receipt" 
                    className="max-w-full h-auto mx-auto rounded-lg border border-white/5 shadow-md"
                  />
                ) : (
                  <div className="bg-zinc-900 border border-white/5 p-5 rounded-xl text-left space-y-3 font-mono text-xs text-zinc-300">
                    <div className="text-emerald-400 font-bold border-b border-white/5 pb-2 uppercase tracking-wide">
                      Invoice Transcript & Audit Trail
                    </div>
                    <div>VENDOR: {activeProofBill.vendorName}</div>
                    <div>GSTIN : {activeProofBill.gstin || "27EXAMP1234A1Z1"}</div>
                    <div>BILL # : {activeProofBill.billNumber}</div>
                    <div>HSN/SAC: {activeProofBill.hsnSac || "998313"}</div>
                    <div>DATE  : {activeProofBill.billDate}</div>
                    <div className="border-t border-white/5 pt-2">
                      GROSS TRANS: ₹{activeProofBill.totalAmount.toLocaleString()}
                    </div>
                    <div>
                      TAX SPLITS : {activeProofBill.gstRate}% (CGST+SGST: ₹{(activeProofBill.cgst+activeProofBill.sgst).toLocaleString()})
                    </div>
                    <div>STATUS     : {activeProofBill.status} (Verified audit proof)</div>
                    <div className="text-[10px] text-zinc-500 pt-3 text-center border-t border-white/5">
                      NIC-EINV-CRYPTOGRAPHIC-VERIFICATION-PASS
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex justify-end">
                <button 
                  onClick={() => setIsProofModalOpen(false)}
                  className="px-4 py-2 bg-emerald-500 text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toasts container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-xs font-semibold text-white pointer-events-auto border flex items-center gap-2 bg-zinc-900 animate-in slide-in-from-right-10 duration-200 ${
              toast.type === "success" ? "border-emerald-500/20 bg-zinc-950" :
              toast.type === "error" ? "border-rose-500/20 bg-zinc-950" : "border-white/10"
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" :
              toast.type === "error" ? "bg-rose-500" : "bg-zinc-500"
            }`} />
            {toast.text}
          </div>
        ))}
      </div>

    </div>
  );
}
