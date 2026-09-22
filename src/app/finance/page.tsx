"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Coins, 
  BarChart as BarChartIcon,
  Zap,
  QrCode,
  Lock,
  Clock,
  Network,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Percent,
  CreditCard
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function FinanceDashboard() {
  const { transactions, payables, payouts, smartLinks, vendors } = useFinanceStore();
  const [timeframe, setTimeframe] = useState<"all-time" | "this-month" | "last-month" | "this-quarter">("this-month");

  // Calculate metrics based on timeframe
  const metrics = useMemo(() => {
    let filteredTx = [...transactions];
    
    if (timeframe === "this-month") {
      filteredTx = filteredTx.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && d.getMonth() === 5; // June 2026
      });
    } else if (timeframe === "last-month") {
      filteredTx = filteredTx.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && d.getMonth() === 4; // May 2026
      });
    } else if (timeframe === "this-quarter") {
      filteredTx = filteredTx.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && (d.getMonth() >= 3 && d.getMonth() <= 5); // Q2
      });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    filteredTx.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else if (t.type === "expense") totalExpense += t.amount;
    });

    const outstandingPayables = payables.reduce((acc, p) => {
      if (p.status !== "Paid") {
        return acc + (p.totalAmount - p.paidAmount);
      }
      return acc;
    }, 0);

    const incomeEver = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expenseEver = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    const cashPosition = 500000 + incomeEver - expenseEver;

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      outstandingPayables,
      cashPosition
    };
  }, [transactions, payables, timeframe]);

  // Chart data grouping using Recharts
  const chartData = useMemo(() => {
    if (timeframe === "this-month" || timeframe === "last-month") {
      const targetMonth = timeframe === "this-month" ? 5 : 4;
      const groups = ["Day 1-5", "Day 6-10", "Day 11-15", "Day 16-20", "Day 21-25", "Day 26-30"];
      const income = [0, 0, 0, 0, 0, 0];
      const expense = [0, 0, 0, 0, 0, 0];

      transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === 2026 && d.getMonth() === targetMonth) {
          const day = d.getDate();
          const idx = Math.min(Math.floor((day - 1) / 5), 5);
          if (t.type === "income") income[idx] += t.amount;
          else expense[idx] += t.amount;
        }
      });

      return groups.map((g, i) => ({
        name: g,
        Revenue: income[i],
        Expenditures: expense[i]
      }));
    } else if (timeframe === "this-quarter") {
      const months = ["April 2026", "May 2026", "June 2026"];
      const income = [0, 0, 0];
      const expense = [0, 0, 0];

      transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === 2026 && d.getMonth() >= 3 && d.getMonth() <= 5) {
          const idx = d.getMonth() - 3;
          if (t.type === "income") income[idx] += t.amount;
          else expense[idx] += t.amount;
        }
      });

      return months.map((m, i) => ({
        name: m,
        Revenue: income[i],
        Expenditures: expense[i]
      }));
    } else {
      const months = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];
      const income = [0, 0, 0, 0, 0, 0];
      const expense = [0, 0, 0, 0, 0, 0];

      transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === 2026 && d.getMonth() < 6) {
          const idx = d.getMonth();
          if (t.type === "income") income[idx] += t.amount;
          else expense[idx] += t.amount;
        }
      });

      return months.map((m, i) => ({
        name: m,
        Revenue: income[i],
        Expenditures: expense[i]
      }));
    }
  }, [transactions, timeframe]);

  // FinOps Highlights
  const complianceHoldsCount = payouts.filter(p => p.payoutStatus === "COMPLIANCE_HOLD").length;
  const totalHoldsValue = payouts.filter(p => p.payoutStatus === "COMPLIANCE_HOLD").reduce((acc, p) => acc + p.invoiceAmount, 0);
  const totalTdsAllocated = payouts.reduce((acc, p) => acc + p.tdsAmount, 0);
  const totalEscrowLocked = smartLinks.filter(l => l.status === "PARTIALLY_SETTLED_DISPUTED").reduce((acc, l) => acc + (l.dispute?.escrowHeldAmount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Lemon Tree Editorial Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2C1E] via-[#091D13] to-[#06110B] border border-lemon-400/25 p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-lemon-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-lemon-400/15 text-lemon-300 border border-lemon-400/30 uppercase tracking-wider">
                Lemon Tree Editorial FinOps
              </span>
              <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Live Sentinel
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-headline">
              Agentic FinOps & Autonomous B2B Payments Shield
            </h1>
            <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Unified compliance intelligence powering <strong className="text-lemon-300 font-semibold">RazorpayX Payouts</strong>, <strong className="text-lemon-300 font-semibold">Smart Collect Links</strong>, and <strong className="text-lemon-300 font-semibold">Autonomous GSTR-2B Lock & Fraud Defense</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/finance/payouts"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-lemon-400 via-lime-400 to-forest-500 hover:scale-[1.02] text-forest-950 font-extrabold text-xs shadow-lg shadow-lemon-400/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-forest-950" />
              <span>Verify-Before-Pay Hub</span>
            </Link>
            <Link
              href="/finance/smart-collect"
              className="px-5 py-3 rounded-xl bg-[#0A1D13] hover:bg-forest-900/60 text-lemon-300 font-bold text-xs transition-all border border-lemon-400/30 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-lemon-400" />
              <span>Smart Collect & Escrow</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 5 Core Pillars Fast Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
          <Link href="/finance/payouts" className="h-full p-5 rounded-2xl bg-[#0A1C13]/90 hover:bg-[#0E281C] border border-lemon-400/20 hover:border-lemon-400/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="p-2.5 rounded-xl bg-lemon-400/15 text-lemon-300 w-fit mb-3 group-hover:scale-110 transition-transform border border-lemon-400/20">
                <Zap className="w-4 h-4 text-lemon-400" />
              </div>
              <div className="text-xs font-bold text-white leading-tight font-headline">RazorpayX Payout Shield</div>
              <div className="text-[11px] text-zinc-300 mt-1">Pre-Disbursement Gating & 194Q TDS</div>
            </div>
            <div className="mt-4 pt-3 border-t border-lemon-400/10 flex items-center justify-between text-[11px] text-lemon-400 font-bold">
              <span>{complianceHoldsCount} Held</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
          <Link href="/finance/smart-collect" className="h-full p-5 rounded-2xl bg-[#0A1C13]/90 hover:bg-[#0E281C] border border-emerald-400/20 hover:border-emerald-400/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 w-fit mb-3 group-hover:scale-110 transition-transform border border-emerald-500/20">
                <QrCode className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white leading-tight font-headline">Smart Collect & Escrow</div>
              <div className="text-[11px] text-zinc-300 mt-1">Embedded IRN QR & Dispute Split</div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-400/10 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>₹{totalEscrowLocked.toLocaleString()} Escrow</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
          <Link href="/finance/itc-lock" className="h-full p-5 rounded-2xl bg-[#0A1C13]/90 hover:bg-[#0E281C] border border-lime-400/20 hover:border-lime-400/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="p-2.5 rounded-xl bg-lime-400/15 text-lime-300 w-fit mb-3 group-hover:scale-110 transition-transform border border-lime-400/20">
                <Lock className="w-4 h-4 text-lime-400" />
              </div>
              <div className="text-xs font-bold text-white leading-tight font-headline">ITC Risk & 2B Lock</div>
              <div className="text-[11px] text-zinc-300 mt-1">Vendor Scorecard & AI Dunning</div>
            </div>
            <div className="mt-4 pt-3 border-t border-lime-400/10 flex items-center justify-between text-[11px] text-lime-400 font-bold">
              <span>Agentic Dunning</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
          <Link href="/finance/msme-sentinel" className="h-full p-5 rounded-2xl bg-[#0A1C13]/90 hover:bg-[#0E281C] border border-amber-400/20 hover:border-amber-400/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300 w-fit mb-3 group-hover:scale-110 transition-transform border border-amber-400/20">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs font-bold text-white leading-tight font-headline">MSME 45-Day Sentinel</div>
              <div className="text-[11px] text-zinc-300 mt-1">Sec 43B(h) SLA Timers & Scheduler</div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-400/10 flex items-center justify-between text-[11px] text-amber-400 font-bold">
              <span>15/45-Day Clock</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
          <Link href="/finance/fraud-graph" className="h-full p-5 rounded-2xl bg-[#0A1C13]/90 hover:bg-[#0E281C] border border-teal-400/20 hover:border-teal-400/50 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="p-2.5 rounded-xl bg-teal-400/15 text-teal-300 w-fit mb-3 group-hover:scale-110 transition-transform border border-teal-400/20">
                <Network className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xs font-bold text-white leading-tight font-headline">Circular Trading Shield</div>
              <div className="text-[11px] text-zinc-300 mt-1">Graph Visualizer & Audit Trail</div>
            </div>
            <div className="mt-4 pt-3 border-t border-teal-400/10 flex items-center justify-between text-[11px] text-teal-400 font-bold">
              <span>AI Risk Graph</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-lemon-400/15 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-headline">Cashflow & P&L Health</h2>
          <p className="text-xs text-zinc-400">Integrated enterprise books and compliance ledger</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-[#0A1C13] border border-lemon-400/20 rounded-2xl p-1 gap-1">
          {(["this-month", "last-month", "this-quarter", "all-time"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                timeframe === tf
                  ? "bg-lemon-400 text-forest-950 shadow-sm"
                  : "text-zinc-400 hover:text-lemon-300"
              }`}
            >
              {tf.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-[#0A1C13]/90 border border-lemon-400/15 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-lemon-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">₹{metrics.totalIncome.toLocaleString()}</div>
          <div className="text-[11px] text-lemon-400 mt-1 flex items-center gap-1 font-bold">
            +18.4% vs previous period
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-[#0A1C13]/90 border border-lemon-400/15 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">₹{metrics.totalExpense.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Includes vendor payouts & statutory TDS
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-[#0A1C13]/90 border border-lemon-400/15 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Net Profit (EBITDA)</span>
            <BarChartIcon className="w-4 h-4 text-lemon-400" />
          </div>
          <div className={`text-2xl font-black font-mono ${metrics.netProfit >= 0 ? "text-lemon-300" : "text-rose-400"}`}>
            ₹{metrics.netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Margin: {metrics.totalIncome > 0 ? Math.round((metrics.netProfit / metrics.totalIncome) * 100) : 0}%
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-[#0A1C13]/90 border border-lemon-400/15 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Liquid Cash Position</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">₹{metrics.cashPosition.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-300 mt-1">
            Protected across RazorpayX & Escrows
          </div>
        </motion.div>
      </div>

      {/* Cashflow Chart Component */}
      <div className="p-7 rounded-3xl bg-[#0A1C13]/90 border border-lemon-400/15 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white font-headline">Revenue vs Expenditure Stream</h3>
            <p className="text-xs text-zinc-400">Cashflow tracking synchronized with Razorpay payouts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-2 text-lemon-300">
              <span className="w-3 h-3 rounded-full bg-lemon-400" />
              Revenue
            </span>
            <span className="flex items-center gap-2 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Expenditures
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 249, 82, 0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#9AB3A2" fontSize={11} tickLine={false} />
              <YAxis stroke="#9AB3A2" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#06120B", borderColor: "rgba(226, 249, 82, 0.3)", borderRadius: "14px", fontSize: "12px", color: "#F6FAF4" }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
              />
              <Bar dataKey="Revenue" fill="#E2F952" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expenditures" fill="#F87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

