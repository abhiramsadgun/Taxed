"use client";

import React, { useState, useMemo } from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Search,
  BookOpen,
  ArrowRight,
  Info,
  DollarSign
} from "lucide-react";
import { useFinanceStore, Transaction } from "@/store/useFinanceStore";

export default function ProfitLossPage() {
  const { transactions } = useFinanceStore();

  // Date Filters
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  
  // Ledger Search States
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState("all");

  const [toasts, setToasts] = useState<{id: string, text: string, type: "success" | "error"}[]>([]);

  const addToast = (text: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Presets helper
  const setPLPresets = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Compute P&L parameters
  const plData = useMemo(() => {
    // Filter
    const filtered = transactions.filter(t => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    // Income
    const incomeCats = {
      "product sales": 0,
      "services": 0,
      "other income": 0
    };

    // Expenses
    const expenseCats = {
      "salaries": 0,
      "rent": 0,
      "marketing": 0,
      "utilities": 0,
      "vendor payments": 0
    };

    let totalIncome = 0;
    let totalExpense = 0;

    filtered.forEach(t => {
      const amt = t.amount;
      const cat = t.category.toLowerCase();
      
      if (t.type === "income") {
        if (incomeCats.hasOwnProperty(cat)) {
          incomeCats[cat as keyof typeof incomeCats] += amt;
        } else {
          incomeCats["other income"] += amt;
        }
        totalIncome += amt;
      } else if (t.type === "expense") {
        if (expenseCats.hasOwnProperty(cat)) {
          expenseCats[cat as keyof typeof expenseCats] += amt;
        } else {
          expenseCats["vendor payments"] += amt;
        }
        totalExpense += amt;
      }
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return {
      incomeCats,
      expenseCats,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      filteredCount: filtered.length,
      rawTransactions: filtered
    };
  }, [transactions, startDate, endDate]);

  // Exclude / Include based on ledger searches
  const searchedLedgerTransactions = useMemo(() => {
    return plData.rawTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                            t.vendorOrClient.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                            t.id.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesCategory = ledgerCategoryFilter === "all" || t.category.toLowerCase() === ledgerCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [plData.rawTransactions, ledgerSearch, ledgerCategoryFilter]);

  // CSV Ledger exporter
  const handleExportLedger = () => {
    const filtered = plData.rawTransactions;

    if (filtered.length === 0) {
      addToast("No ledger records found to export for these dates.", "error");
      return;
    }

    let csv = "Transaction ID,Date,Type,Category,Description,Vendor/Client,Amount (INR)\n";
    filtered.forEach(t => {
      const desc = `"${t.description.replace(/"/g, '""')}"`;
      const entity = `"${t.vendorOrClient.replace(/"/g, '""')}"`;
      csv += `${t.id},${t.date},${t.type},${t.category},${desc},${entity},${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gstshield_ledger_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Ledger CSV download started!");
  };

  const handlePrintPL = () => {
    window.print();
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const categoryLabels = {
    "salaries": "Salaries & Employee Payroll",
    "rent": "Office Rent & Infrastructure",
    "marketing": "Marketing & Public Relations",
    "utilities": "Utilities & Software Hosting",
    "vendor payments": "Vendor Disbursements"
  };

  const categoryColors = {
    "salaries": "bg-rose-500",
    "rent": "bg-amber-500",
    "marketing": "bg-orange-500",
    "utilities": "bg-purple-500",
    "vendor payments": "bg-blue-500"
  };

  return (
    <div className="space-y-6 pl-printable-view">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profit & Loss Statement</h1>
          <p className="text-zinc-400 mt-1">Audit operating revenues, expenditures, and margins over selected periods.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrintPL}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/5 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-900 transition-colors text-xs"
          >
            <Printer className="w-4 h-4" />
            Print Statement
          </button>
          <button 
            onClick={handleExportLedger}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/5 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-900 transition-colors text-xs"
          >
            <Download className="w-4 h-4" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Date Filter Card */}
      <div className="glass-card rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between pl-no-print">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold uppercase">From</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold uppercase">To</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setPLPresets("2026-06-01", "2026-06-30")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-white/5"
          >
            This Month
          </button>
          <button 
            onClick={() => setPLPresets("2026-04-01", "2026-06-30")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-white/5"
          >
            This Quarter
          </button>
          <button 
            onClick={() => setPLPresets("2026-01-01", "2026-12-31")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-white/5"
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary strips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5 rounded-xl border border-white/5 bg-white/5 overflow-hidden text-center pl-summary-box">
        <div className="bg-zinc-950 p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Gross Operating Revenues</div>
          <div className="text-2xl font-bold text-emerald-400">{formatINR(plData.totalIncome)}</div>
        </div>
        <div className="bg-zinc-950 p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Operating Expenditures</div>
          <div className="text-2xl font-bold text-rose-400">{formatINR(plData.totalExpense)}</div>
        </div>
        <div className="bg-zinc-950 p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Net Operating Surplus</div>
          <div className={`text-2xl font-bold ${plData.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatINR(plData.netProfit)}
          </div>
        </div>
        <div className="bg-zinc-950 p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Surplus Margin Rate</div>
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-1.5">
            {plData.netProfit >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            {plData.profitMargin}%
          </div>
        </div>
      </div>

      {/* Double Column layout: General Ledger + Category Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main ledger sheets (70% width) */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 pl-report-card bg-zinc-900/25">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">General Ledger Statement</h3>
            </div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Period: {startDate ? new Date(startDate).toLocaleDateString("en-IN", {month:"short", day:"numeric", year:"numeric"}) : "Start"} - {endDate ? new Date(endDate).toLocaleDateString("en-IN", {month:"short", day:"numeric", year:"numeric"}) : "End"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs text-zinc-400 uppercase">
                  <th className="py-3 font-semibold">Particulars / Category</th>
                  <th className="py-3 font-semibold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                
                {/* REVENUES */}
                <tr className="bg-white/[0.01]">
                  <td className="py-3 font-bold text-white uppercase text-xs tracking-wider">A. Operating Revenues</td>
                  <td className="py-3 text-right"></td>
                </tr>
                {Object.entries(plData.incomeCats).map(([cat, val]) => (
                  <tr key={cat} className="text-zinc-300">
                    <td className="py-2.5 pl-6 capitalize text-xs">{cat}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatINR(val)}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-emerald-400">
                  <td className="py-3 pl-4">Total Revenue (Gross Receipts)</td>
                  <td className="py-3 text-right font-mono">{formatINR(plData.totalIncome)}</td>
                </tr>

                {/* EXPENSES */}
                <tr className="bg-white/[0.01]">
                  <td className="py-3 font-bold text-white uppercase text-xs tracking-wider">B. Operating Expenditures</td>
                  <td className="py-3 text-right"></td>
                </tr>
                {Object.entries(plData.expenseCats).map(([cat, val]) => (
                  <tr key={cat} className="text-zinc-300">
                    <td className="py-2.5 pl-6 text-xs">{categoryLabels[cat as keyof typeof categoryLabels] || cat}</td>
                    <td className="py-2.5 text-right font-mono text-xs">{formatINR(val)}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-rose-400">
                  <td className="py-3 pl-4">Total Expenses (Disbursements)</td>
                  <td className="py-3 text-right font-mono">{formatINR(plData.totalExpense)}</td>
                </tr>

                {/* NET INCOME */}
                <tr className="border-t-2 border-white/10 font-bold bg-white/[0.01] text-base">
                  <td className="py-4">Net Operating Surplus / (Deficit)</td>
                  <td className={`py-4 text-right font-mono ${plData.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatINR(plData.netProfit)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses contributions progress bars (30% width) */}
        <div className="lg:col-span-1 glass-card rounded-2xl border border-white/5 p-6 space-y-6 bg-zinc-900/25 pl-no-print">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-semibold text-white text-sm">Disbursements Ratios</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Allocation percentage of expense ledger</p>
          </div>

          {plData.totalExpense > 0 ? (
            <div className="space-y-4">
              {Object.entries(plData.expenseCats).map(([cat, val]) => {
                const pct = Math.round((val / plData.totalExpense) * 100);
                const color = categoryColors[cat as keyof typeof categoryColors] || "bg-zinc-500";
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 truncate max-w-[150px]">
                        {categoryLabels[cat as keyof typeof categoryLabels] || cat}
                      </span>
                      <span className="text-white font-semibold font-mono">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 italic text-xs">
              No expenses recorded to calculate ratios.
            </div>
          )}

          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 space-y-2 text-xs leading-relaxed text-zinc-400">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              Surplus Insights
            </div>
            <span>
              Your current surplus margin is **{plData.profitMargin}%**. Tax experts suggest keeping a healthy operating margin above 15% to buffer potential GST notice challenges under SCN reviews.
            </span>
          </div>
        </div>

      </div>

      {/* ============================================== */}
      {/* DETAILED TRANSACTIONS AUDITOR SEARCH TABLE */}
      {/* ============================================== */}
      <div className="glass-card rounded-2xl border border-white/5 p-6 bg-zinc-900/25 pl-no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">General Ledger Audit Log</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search description, entity..." 
                className="w-full bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            
            <select
              value={ledgerCategoryFilter}
              onChange={(e) => setLedgerCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="all">All Categories</option>
              <option value="product sales">Product Sales</option>
              <option value="services">Services</option>
              <option value="salaries">Salaries</option>
              <option value="rent">Rent</option>
              <option value="marketing">Marketing</option>
              <option value="utilities">Utilities</option>
              <option value="vendor payments">Vendor Payments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Tx ID</th>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 font-semibold">Entity</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Particulars</th>
                <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {searchedLedgerTransactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-3 font-mono text-[10px] text-zinc-500">{tx.id}</td>
                  <td className="px-6 py-3 text-zinc-400 text-xs">{tx.date}</td>
                  <td className="px-6 py-3 text-white font-semibold text-xs">{tx.vendorOrClient}</td>
                  <td className="px-6 py-3 text-zinc-300 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-white/5 bg-zinc-900 capitalize">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-400 text-xs max-w-xs truncate">{tx.description}</td>
                  <td className={`px-6 py-3 text-right font-mono font-semibold text-xs ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatINR(tx.amount)}
                  </td>
                </tr>
              ))}
              {searchedLedgerTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic text-xs">
                    No transactions found inside the ledger search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print helpers styled injection */}
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
          .glass-card {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            color: #000000 !important;
          }
          .pl-report-card {
            color: #000000 !important;
            border-top: 2px solid #000000 !important;
          }
          .pl-report-card h3,
          .pl-report-card th,
          .pl-report-card td,
          .pl-report-card div {
            color: #000000 !important;
          }
          .pl-summary-box {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #000000 !important;
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .pl-summary-box div {
            background: none !important;
            color: #000000 !important;
          }
          .pl-summary-box .text-emerald-400,
          .pl-summary-box .text-rose-400 {
            color: #000000 !important;
            font-weight: 800 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th {
            border-bottom: 2px solid #000000 !important;
            color: #000000 !important;
          }
          td {
            border-bottom: 1px solid #cbd5e1 !important;
            color: #000000 !important;
          }
          .divide-y > * + * {
            border-top-color: #cbd5e1 !important;
          }
        }
      `}} />

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-xs font-semibold text-white pointer-events-auto border flex items-center gap-2 bg-zinc-950 ${
              toast.type === "success" ? "border-emerald-500/20" : "border-rose-500/20"
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`} />
            {toast.text}
          </div>
        ))}
      </div>

    </div>
  );
}
