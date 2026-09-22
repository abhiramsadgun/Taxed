"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Shield, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Coins, 
  PieChart, 
  MessageSquare, 
  UploadCloud,
  CheckSquare,
  FileWarning,
  Bell,
  Building2,
  RefreshCw,
  User,
  CheckCircle,
  AlertCircle,
  LogOut,
  Zap,
  QrCode,
  Lock,
  Clock,
  Network,
  CreditCard,
  SlidersHorizontal,
  Flame,
  Menu,
  X
} from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion, AnimatePresence } from "framer-motion";

import PresentationControlBar from "@/components/PresentationControlBar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useSessionStore();
  const { payouts, smartLinks, isSandboxMode, toggleSandboxMode } = useFinanceStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth Hydration Guard
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const complianceHoldsCount = payouts.filter(p => p.payoutStatus === "COMPLIANCE_HOLD").length;
  const disputedLinksCount = smartLinks.filter(l => l.status === "PARTIALLY_SETTLED_DISPUTED").length;

  const finopsNavItems = [
    { 
      name: "RazorpayX Payout Shield", 
      href: "/finance/payouts", 
      icon: Zap, 
      badge: complianceHoldsCount > 0 ? `${complianceHoldsCount} Blocked` : null,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
    },
    { 
      name: "Smart Collect & Escrow", 
      href: "/finance/smart-collect", 
      icon: QrCode,
      badge: disputedLinksCount > 0 ? `${disputedLinksCount} Dispute` : "e-Inv QR",
      badgeColor: disputedLinksCount > 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
    },
    { 
      name: "ITC Risk & 2B Lock", 
      href: "/finance/itc-lock", 
      icon: Lock,
      badge: "Agentic",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
    },
    { 
      name: "MSME 45-Day Sentinel", 
      href: "/finance/msme-sentinel", 
      icon: Clock,
      badge: "Sec 43B(h)",
      badgeColor: "bg-orange-500/10 text-orange-300 border-orange-500/20"
    },
    { 
      name: "Circular Trading Detector", 
      href: "/finance/fraud-graph", 
      icon: Network,
      badge: "AI Risk",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20"
    },
  ];

  const standardNavItems = [
    { name: "Executive Overview", href: "/finance", icon: LayoutDashboard },
    { name: "Payables Tracker", href: "/finance/payables", icon: Coins },
    { name: "GSTR Reconciliation", href: "/finance/reconciliation", icon: CheckSquare },
    { name: "GST Notices & Replies", href: "/finance/notices", icon: FileWarning },
    { name: "Profit & Loss", href: "/finance/pl", icon: FileSpreadsheet },
    { name: "Category Reports", href: "/finance/reports", icon: PieChart },
  ];

  const handlePortalSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const dummyAlerts = [
    { id: 1, text: `RazorpayX Payout Blocked: ${complianceHoldsCount} payouts under compliance gating`, type: "notice", time: "Just now" },
    { id: 2, text: "Section 43B(h) MSME Alert: Apex Security invoice due in 6 days", type: "notice", time: "10m ago" },
    { id: 3, text: "GSTR-2B discrepancy: Reddy Tech late filing rate is 34%", type: "mismatch", time: "4h ago" },
  ];

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-9 h-9 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          Authenticating Taxed FinOps Session...
        </span>
      </div>
    );
  }
  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-between px-6 border-b border-lemon-400/10 bg-[#06110B]/90 backdrop-blur-xl">
        <Link href="/finance" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lemon-400 via-lime-400 to-forest-500 flex items-center justify-center p-[1px] shadow-[0_0_20px_rgba(226,249,82,0.3)] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#07150E] rounded-[15px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-lemon-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white font-headline">Taxed</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-lemon-400 text-forest-950 font-bold uppercase tracking-wider shadow-sm">
                FinOps
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 tracking-wider">
              Autonomous B2B Defense
            </span>
          </div>
        </Link>
        {mobileMenuOpen && (
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-lemon-300 hover:bg-forest-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-forest-800">
        {/* Pillar Section: FinOps Modules */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-lemon-400 uppercase">
              RazorpayX FinOps Engines
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lemon-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            {finopsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-lemon-400 text-forest-950 shadow-md shadow-lemon-400/20 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-[#0E281C]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-forest-950 stroke-[2.5]" : "text-lemon-400"}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isActive ? "bg-forest-950 text-lemon-300 border-forest-900" : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Standard Accounting & Compliance */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">
            Ledger & Statutory Hub
          </div>
          <div className="space-y-1">
            {standardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-lemon-400 text-forest-950 shadow-md shadow-lemon-400/20 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-[#0E281C]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-forest-950 stroke-[2.5]" : "text-zinc-400 group-hover:text-lemon-300"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Tools */}
        <div>
          <div className="px-3 mb-2.5 text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-headline">
            AI Copilots
          </div>
          <div className="space-y-1">
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-forest-900/30 hover:text-lemon-300 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-lemon-400" />
              <span>AI CA Legal Chat</span>
            </Link>
            <Link
              href="/notices"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-forest-900/30 hover:text-lemon-300 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Invoice & Notice Auditor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* RazorpayX Sandbox / Live Indicator */}
      <div className="p-4 border-t border-lemon-400/10 bg-[#06110B]/90 space-y-2.5">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0A1C13] border border-lemon-400/15">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-lemon-400" />
            <span className="text-[11px] font-semibold text-zinc-200">RazorpayX Gateway</span>
          </div>
          <button
            onClick={toggleSandboxMode}
            className={`text-[9px] font-mono px-2.5 py-1 rounded-full font-bold uppercase transition-all shadow-sm ${
              isSandboxMode 
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" 
                : "bg-lemon-400/20 text-lemon-300 border border-lemon-400/40"
            }`}
          >
            {isSandboxMode ? "Sandbox" : "Live API"}
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#06110B] text-[#F6FAF4] flex finance-theme selection:bg-lemon-400/30 selection:text-lemon-950">
      {/* Desktop Sidebar navigation */}
      <aside className="hidden lg:flex w-72 border-r border-lemon-400/10 bg-[#06110B]/95 backdrop-blur-2xl flex-col fixed h-screen z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#06110B] border-r border-lemon-400/20 z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content layout */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full">
        {/* Presentation & Live Demo Control Bar */}
        <PresentationControlBar />

        {/* Topbar Header */}
        <header className="h-16 border-b border-lemon-400/10 bg-[#06110B]/85 backdrop-blur-2xl sticky top-[49px] z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-lemon-300 hover:bg-forest-900/40 transition-all"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-forest-900/80 border border-lemon-400/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-lemon-400 shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px] sm:max-w-none">
                  {user?.companyName || "Tech Solutions Pvt Ltd"}
                </span>
                <span className="text-[10px] text-lemon-400/80 font-mono tracking-wider font-semibold">
                  {user?.gstin || "27AADCB2230M1Z2"}
                </span>
              </div>
            </div>

            {/* Razorpay Integration Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/70 border border-lemon-400/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lemon-400 animate-pulse" />
              <span className="text-[10px] font-bold text-lemon-300 font-headline">
                RazorpayX Payout Gateway: Connected
              </span>
            </div>

            {/* Portal Sync Status */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#0A1D13] border border-lemon-400/15">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? "bg-amber-400" : "bg-lemon-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? "bg-amber-500" : "bg-lemon-400"}`}></span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-300">
                {isSyncing ? "Syncing GSTN..." : "GST Portal: Synced"}
              </span>
              <button 
                onClick={handlePortalSync}
                disabled={isSyncing}
                className="text-[10px] hover:text-lemon-300 text-zinc-400 transition-colors ml-1 p-0.5 rounded hover:bg-forest-900/40"
                title="Sync from GST Portal"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-lemon-400" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications Alert Center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-300 hover:text-lemon-300 rounded-xl hover:bg-forest-900/40 transition-all relative border border-lemon-400/10 hover:border-lemon-400/30"
              >
                <Bell className="w-4 h-4" />
                {complianceHoldsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#06110B] animate-ping" />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-92 bg-[#0A1C13] border border-lemon-400/25 rounded-2xl overflow-hidden shadow-2xl z-30 divide-y divide-lemon-400/10 backdrop-blur-2xl"
                    >
                      <div className="p-4 bg-[#06110B]/80 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white flex items-center gap-2 font-headline">
                          <Zap className="w-3.5 h-3.5 text-lemon-400 fill-lemon-400" />
                          FinOps Live Stream
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                          {complianceHoldsCount} Blocked Actions
                        </span>
                      </div>
                      <div className="p-1.5 max-h-72 overflow-y-auto">
                        {dummyAlerts.map(alert => (
                          <div key={alert.id} className="p-3 hover:bg-forest-900/40 rounded-xl transition-colors flex items-start gap-3">
                            {alert.type === 'notice' ? (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-lemon-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-200 font-medium leading-normal">{alert.text}</p>
                              <span className="text-[9px] text-zinc-400 block mt-1 font-mono">{alert.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center bg-[#06110B]/60 flex justify-around">
                        <Link 
                          href="/finance/payouts" 
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-lemon-400 hover:text-lemon-300 font-bold inline-flex items-center gap-1"
                        >
                          Resolve Holds →
                        </Link>
                        <Link 
                          href="/finance/msme-sentinel" 
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
                        >
                          MSME Timers →
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-3 border-l border-lemon-400/15 pl-3 sm:pl-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lemon-400 to-forest-500 p-[1px] shadow-sm">
                <div className="w-full h-full bg-[#07150E] rounded-[10px] flex items-center justify-center text-lemon-300 font-bold text-xs">
                  RK
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">{user?.name || "Rajesh Kumar"}</span>
                <span className="text-[10px] text-lemon-400 font-mono font-semibold">Finance Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
