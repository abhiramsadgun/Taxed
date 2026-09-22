"use client";

import React, { useState, useMemo } from "react";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function CategoryReportsPage() {
  const { transactions } = useFinanceStore();
  const [timeframe, setTimeframe] = useState<"all-time" | "this-month" | "last-month" | "this-quarter">("this-month");

  // Filter based on selected timeframe
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    if (timeframe === "this-month") {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && d.getMonth() === 5;
      });
    } else if (timeframe === "last-month") {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && d.getMonth() === 4;
      });
    } else if (timeframe === "this-quarter") {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === 2026 && (d.getMonth() >= 3 && d.getMonth() <= 5);
      });
    }

    return filtered;
  }, [transactions, timeframe]);

  // Compile expense and income by category
  const expenseData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      if (t.type === "expense") {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });

    const colors: Record<string, string> = {
      "salaries": "#f43f5e",
      "rent": "#fb923c",
      "marketing": "#fbbf24",
      "utilities": "#a855f7",
      "vendor payments": "#3b82f6"
    };

    const data = Object.entries(categories).map(([name, value], idx) => ({
      name,
      value,
      color: colors[name.toLowerCase()] || `hsl(${(idx * 60) % 360}, 70%, 55%)`
    }));

    const total = data.reduce((acc, item) => acc + item.value, 0);

    return { data, total };
  }, [filteredTransactions]);

  const incomeData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      if (t.type === "income") {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });

    const colors: Record<string, string> = {
      "product sales": "#10b981",
      "services": "#00f2fe",
      "other income": "#6366f1"
    };

    const data = Object.entries(categories).map(([name, value], idx) => ({
      name,
      value,
      color: colors[name.toLowerCase()] || `hsl(${(idx * 120) % 360}, 65%, 50%)`
    }));

    const total = data.reduce((acc, item) => acc + item.value, 0);

    return { data, total };
  }, [filteredTransactions]);

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
          <h1 className="text-3xl font-bold tracking-tight text-white">Category Reports</h1>
          <p className="text-zinc-400 mt-1">Detailed analysis of revenue categories and expense allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="reports-timeframe" className="text-sm text-zinc-400 font-medium">Period:</label>
          <select 
            id="reports-timeframe"
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="all-time">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Charts Layout Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EXPENSES BREAKDOWN */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-white">Expenses by Category</h3>
          </div>

          {expenseData.data.length > 0 ? (
            <div className="flex flex-col space-y-6">
              {/* Recharts Doughnut with Center Text */}
              <div className="h-60 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseData.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      itemStyle={{ fontSize: "11px", color: "#e2e8f0" }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Absolute overlay for total sum */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total</span>
                  <span className="text-lg font-bold text-white font-outfit mt-0.5">
                    ₹{expenseData.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custom HTML Legend List */}
              <ul className="space-y-2">
                {expenseData.data.map((item) => {
                  const pct = Math.round((item.value / expenseData.total) * 100);
                  return (
                    <li 
                      key={item.name} 
                      className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.03] hover:translate-x-1 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3 h-3 rounded-[30%]" 
                          style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}50` }} 
                        />
                        <span className="text-xs font-medium text-zinc-300 capitalize">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-white font-mono">
                        {formatINR(item.value)} <span className="text-[10px] text-zinc-500 font-normal">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 italic text-sm">
              No expenditures recorded for this period.
            </div>
          )}
        </div>

        {/* INCOME BREAKDOWN */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-white">Revenues by Category</h3>
          </div>

          {incomeData.data.length > 0 ? (
            <div className="flex flex-col space-y-6">
              {/* Recharts Doughnut with Center Text */}
              <div className="h-60 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={incomeData.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomeData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      itemStyle={{ fontSize: "11px", color: "#e2e8f0" }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Absolute overlay for total sum */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total</span>
                  <span className="text-lg font-bold text-white font-outfit mt-0.5">
                    ₹{incomeData.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custom HTML Legend List */}
              <ul className="space-y-2">
                {incomeData.data.map((item) => {
                  const pct = Math.round((item.value / incomeData.total) * 100);
                  return (
                    <li 
                      key={item.name} 
                      className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.03] hover:translate-x-1 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3 h-3 rounded-[30%]" 
                          style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}50` }} 
                        />
                        <span className="text-xs font-medium text-zinc-300 capitalize">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-white font-mono">
                        {formatINR(item.value)} <span className="text-[10px] text-zinc-500 font-normal">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 italic text-sm">
              No revenues recorded for this period.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
