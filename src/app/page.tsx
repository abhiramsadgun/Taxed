"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  QrCode, 
  Lock, 
  Clock, 
  Network, 
  Scale, 
  CreditCard,
  Building2,
  Cpu,
  Layers,
  ChevronRight,
  LogOut,
  TrendingUp,
  FileCheck,
  Check
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/useSessionStore";

export default function LandingPage() {
  const { isAuthenticated, logout } = useSessionStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = () => {
    logout();
  };

  const ecosystemFeatures = [
    {
      title: "Verify-Before-Pay Payout Shield",
      tag: "RazorpayX Payouts API",
      accent: "from-lemon-400/20 via-forest-600/10 to-transparent",
      borderColor: "hover:border-lemon-400/40",
      badgeColor: "bg-lemon-400/15 text-lemon-300 border-lemon-400/30",
      icon: Zap,
      href: "/finance/payouts",
      description: "Autonomous GSTIN evaluation, HSN tax rate accuracy, and e-Invoice IRN signatures before funds disburse."
    },
    {
      title: "Smart Collect & Tax Dispute Escrow",
      tag: "Smart Collect / Links",
      accent: "from-forest-500/20 via-emerald-600/10 to-transparent",
      borderColor: "hover:border-emerald-400/40",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: QrCode,
      href: "/finance/smart-collect",
      description: "B2B Payment Links with dynamic e-Invoice QR codes. Auto-splits settlements into operational base and escrowed tax buffers."
    },
    {
      title: "Agentic ITC Risk & 2B Lock",
      tag: "AI Finance Controller",
      accent: "from-lemon-300/20 via-lime-500/10 to-transparent",
      borderColor: "hover:border-lime-400/40",
      badgeColor: "bg-lime-400/15 text-lime-300 border-lime-400/30",
      icon: Lock,
      href: "/finance/itc-lock",
      description: "Scores vendor filing reliability. Withholds 18% GST buffer until 2B match and triggers autonomous dunning post 11th."
    },
    {
      title: "MSME 45-Day Sentinel (Sec 43B(h))",
      tag: "Statutory SLA Clocks",
      accent: "from-amber-400/20 via-lemon-500/10 to-transparent",
      borderColor: "hover:border-amber-400/40",
      badgeColor: "bg-amber-400/15 text-amber-300 border-amber-400/30",
      icon: Clock,
      href: "/finance/msme-sentinel",
      description: "Tracks Udyam micro/small enterprise deadlines. Auto-schedules RazorpayX disbursements 48h before SLA expiry."
    },
    {
      title: "Circular Trading & Shell Detector",
      tag: "Graph Risk Sentinel",
      accent: "from-forest-400/20 via-teal-500/10 to-transparent",
      borderColor: "hover:border-forest-400/40",
      badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      icon: Network,
      href: "/finance/fraud-graph",
      description: "GSTIN network graph visualizer detecting circular invoice loops, synthetic invoices, and fake syndicates before funds move."
    }
  ];

  const highlights = [
    { value: "₹24.8 Cr+", label: "Verified Disbursements" },
    { value: "100%", label: "ITC 2B Reconciliation" },
    { value: "0 ms", label: "Black-Box Latency" },
    { value: "Sec 43B(h)", label: "MSME Compliance Lock" }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#06110B] text-[#F6FAF4] selection:bg-lemon-400/30 selection:text-lemon-950 font-sans">
      
      {/* Lemon Tree Editorial Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-lemon-400/15 via-forest-500/10 to-transparent pointer-events-none blur-3xl animate-pulse-lemon" />
      <div className="absolute top-32 right-[5%] w-[420px] h-[420px] bg-lemon-400/10 blur-[150px] rounded-full pointer-events-none animate-float-slow" />
      <div className="absolute bottom-20 left-[5%] w-[500px] h-[500px] bg-forest-600/20 blur-[160px] rounded-full pointer-events-none animate-float" />
      
      {/* Editorial Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2f95208_1px,transparent_1px),linear-gradient(to_bottom,#e2f95208_1px,transparent_1px)] bg-[size:24px_36px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full sticky top-0 border-b border-lemon-400/10 bg-[#06110B]/85 backdrop-blur-2xl z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lemon-400 via-lime-400 to-forest-500 flex items-center justify-center p-[1px] shadow-[0_0_25px_rgba(226,249,82,0.35)] group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#07150E] rounded-[15px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-lemon-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight font-headline text-white">Taxed</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-lemon-400 text-forest-950 font-bold uppercase tracking-wider shadow-sm">
                  FinOps
                </span>
              </div>
              <span className="text-[10px] text-lemon-400/80 font-semibold tracking-widest uppercase">
                Autonomous B2B Tax Shield
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-300">
            <Link href="/finance/payouts" className="hover:text-lemon-400 transition-colors flex items-center gap-1.5">
              <span>RazorpayX Shield</span>
            </Link>
            <Link href="/finance/smart-collect" className="hover:text-lemon-400 transition-colors">
              Smart Collect
            </Link>
            <Link href="/finance/itc-lock" className="hover:text-lemon-400 transition-colors">
              ITC Risk Engine
            </Link>
            <Link href="/finance/msme-sentinel" className="hover:text-lemon-400 transition-colors">
              MSME Sec 43B(h)
            </Link>
            <Link href="/finance/fraud-graph" className="hover:text-lemon-400 transition-colors">
              Fraud Graph
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {isMounted && isAuthenticated ? (
              <>
                <Link 
                  href="/finance" 
                  className="text-xs font-bold text-lemon-300 hover:text-white px-4 py-2 rounded-xl bg-forest-900/60 border border-lemon-400/30 hover:border-lemon-400/60 shadow-lg shadow-lemon-400/10 transition-all flex items-center gap-1.5"
                >
                  FinOps Console
                  <ArrowRight className="w-3.5 h-3.5 text-lemon-400" />
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-400 px-3 py-2 rounded-xl hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-xs font-semibold text-zinc-300 hover:text-lemon-400 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login" 
                  className="group relative overflow-hidden flex items-center gap-2 text-xs font-extrabold bg-gradient-to-r from-lemon-400 via-lime-300 to-forest-400 text-forest-950 px-5 py-2.5 rounded-xl shadow-lg shadow-lemon-400/25 hover:shadow-lemon-400/40 hover:scale-[1.02] transition-all"
                >
                  <span>Launch Console</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center z-10 pt-16 pb-24">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-forest-900/80 border border-lemon-400/30 text-lemon-300 text-xs font-bold mb-8 shadow-[0_0_20px_rgba(226,249,82,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-lemon-400 animate-ping" />
          <Zap className="w-3.5 h-3.5 text-lemon-400 fill-lemon-400" />
          <span>Lemon Tree Editorial Edition</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-300 font-mono tracking-wide">RazorpayX FinOps AI</span>
        </motion.div>
        
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black font-headline tracking-tight max-w-5xl mb-6 leading-[1.05]"
        >
          Autonomous FinOps & <br />
          <span className="lemon-gradient-text">
            B2B Payout Shield
          </span>
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-zinc-300 max-w-3xl mb-10 leading-relaxed font-light font-sans"
        >
          Natively integrated with <strong className="text-lemon-300 font-semibold">RazorpayX</strong> and <strong className="text-lemon-300 font-semibold">Smart Collect</strong>. Mathematically verify GST compliance, automate Section 194Q TDS, enforce MSME 45-day SLA timers, and isolate circular trading fraud <strong className="text-lemon-400 underline decoration-lemon-400/40 underline-offset-4">before funds move</strong>.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link 
            href="/finance/payouts"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-lemon-400 via-lime-400 to-forest-500 text-forest-950 font-extrabold text-sm shadow-xl shadow-lemon-400/25 hover:shadow-lemon-400/45 hover:scale-[1.03] transition-all flex items-center justify-center gap-2.5 group"
          >
            <Zap className="w-4 h-4 text-forest-950 fill-forest-950 group-hover:scale-110 transition-transform" />
            <span>Explore RazorpayX Payout Shield</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/finance"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#0B2217]/80 hover:bg-[#0E2C1E] text-zinc-200 hover:text-lemon-300 font-semibold text-sm border border-lemon-400/20 hover:border-lemon-400/40 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Launch FinOps Console</span>
            <ChevronRight className="w-4 h-4 text-lemon-400" />
          </Link>
        </motion.div>

        {/* Metric Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 p-6 rounded-3xl bg-[#0A1D13]/70 backdrop-blur-xl border border-lemon-400/15 shadow-2xl"
        >
          {highlights.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center p-3 border-r border-lemon-400/10 last:border-r-0">
              <span className="text-2xl md:text-3xl font-black font-headline text-lemon-300 mb-1">
                {item.value}
              </span>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Live Ecosystem 5 Pillars */}
        <div className="w-full text-left space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-lemon-400/15 pb-5 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-lemon-400 tracking-wider uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Editorial Architecture</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-headline">5-Pillar Razorpay FinOps Shield</h2>
              <p className="text-xs text-zinc-400">Next-generation autonomous payment safety and statutory compliance protocols</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lemon-400 animate-pulse" />
              <span className="text-xs font-mono text-lemon-300 font-bold bg-forest-900/80 px-3 py-1 rounded-full border border-lemon-400/20">
                Production Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <Link
                    href={feat.href}
                    className={`h-full p-7 rounded-3xl bg-[#0A1C13]/85 backdrop-blur-xl border border-lemon-400/15 ${feat.borderColor} transition-all flex flex-col justify-between group relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-lemon-400/10`}
                  >
                    <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${feat.accent} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3.5 rounded-2xl bg-[#06120B] border border-lemon-400/20 text-lemon-400 group-hover:scale-110 group-hover:border-lemon-400/50 shadow-md transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-mono px-3 py-1 rounded-full border font-bold ${feat.badgeColor}`}>
                          {feat.tag}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-lemon-300 transition-colors font-headline">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {feat.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-lemon-400/10 flex items-center justify-between text-xs font-bold text-lemon-400/80 group-hover:text-lemon-300 transition-colors">
                      <span>Launch Protocol</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Architecture Card */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="p-7 rounded-3xl bg-gradient-to-br from-[#0E281C] via-[#091D13] to-[#06110B] border border-lemon-400/40 flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lemon-400 font-extrabold text-xs tracking-wider uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deterministic Proof</span>
                </div>
                <h3 className="text-lg font-bold text-white font-headline">Zero Black-Box Architecture</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every gated RazorpayX disbursement, tax dispute escrow hold, and circular trading flag produces an auditable CA forensic certificate in real-time.
                </p>
              </div>

              <Link
                href="/finance/fraud-graph"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-lemon-300 hover:text-lemon-200 transition-colors group"
              >
                <span>View Graph Sentinel & Audit Logs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-lemon-400/10 bg-[#06110B]/90 py-10 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-lemon-400/20 border border-lemon-400/30 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-lemon-400" />
            </div>
            <span className="font-bold text-zinc-200">Taxed FinOps Protocol</span>
            <span className="text-zinc-600">•</span>
            <span className="text-lemon-400/80 font-mono">Lemon Tree Editorial Theme</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-300 font-semibold">
            <Link href="/finance/payouts" className="hover:text-lemon-400 transition-colors">RazorpayX</Link>
            <Link href="/finance/smart-collect" className="hover:text-lemon-400 transition-colors">Smart Collect</Link>
            <Link href="/finance/itc-lock" className="hover:text-lemon-400 transition-colors">GSTR-2B Lock</Link>
            <Link href="/finance/msme-sentinel" className="hover:text-lemon-400 transition-colors">Section 43B(h)</Link>
            <Link href="/finance/fraud-graph" className="hover:text-lemon-400 transition-colors">Fraud Graph</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

