"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Smartphone
} from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "login" | "register" | "forgot" | "verify-otp" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const { 
    loginUser, 
    registerUser, 
    requestPasswordResetOtp, 
    verifyResetOtp, 
    completePasswordReset, 
    isAuthenticated 
  } = useSessionStore();
  
  const [activeTab, setActiveTab] = useState<Tab>("login");
  
  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // OTP Verification States
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [maskedContact, setMaskedContact] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  
  // Validation / Feedback States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Temp email storage for recovery flow
  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/finance");
    }
  }, [isAuthenticated, router]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === "verify-otp" && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, resendTimer]);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Switch tabs cleanly
  const switchTab = (tab: Tab) => {
    clearMessages();
    setActiveTab(tab);
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    setTimeout(() => {
      const res = loginUser(email, password);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Success! Accessing FinOps workspace...");
        setTimeout(() => router.push("/finance"), 800);
      } else {
        setErrorMsg(res.error || "Authentication failed.");
      }
    }, 600);
  };

  // Fill in demo account credentials instantly
  const handleFillDemo = () => {
    setEmail("rajesh@techsolutions.in");
    setPassword("password");
    clearMessages();
  };

  // 2. REGISTRATION HANDLER
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !companyName || !gstin) {
      setErrorMsg("All registration fields are required.");
      return;
    }

    // Basic GSTIN Check (Indian GSTIN is 15 chars: 2 state digits + 10 PAN alpha + 3 checksum)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const upperGstin = gstin.trim().toUpperCase();
    if (!gstinRegex.test(upperGstin)) {
      setErrorMsg("Format Mismatch: Please enter a valid 15-character GSTIN format (e.g. 27AADCB2230M1Z2).");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = registerUser(name, email, password, companyName, upperGstin, phone);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Account registered! Opening workspace...");
        setTimeout(() => router.push("/finance"), 800);
      } else {
        setErrorMsg(res.error || "Failed to create account.");
      }
    }, 800);
  };

  // 3. FORGOT PASSWORD HANDLER - REQUEST VERIFICATION CODE
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered enterprise email.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = requestPasswordResetOtp(email);
      setLoading(false);
      if (res.success && res.otp) {
        setResetEmail(email);
        setSimulatedOtp(res.otp);
        setMaskedContact(res.maskedContact || email);
        setOtpCode("");
        setResendTimer(60);
        setSuccessMsg(`Verification code generated for ${res.maskedContact}. Please verify your identity.`);
        setActiveTab("verify-otp");
      } else {
        setErrorMsg(res.error || "No enterprise account found with this email.");
      }
    }, 800);
  };

  // 4. VERIFY OTP HANDLER - PROVE ACCOUNT OWNERSHIP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = verifyResetOtp(resetEmail, otpCode);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Identity successfully verified! Please establish your new password.");
        setActiveTab("reset");
      } else {
        setErrorMsg(res.error || "Invalid verification code.");
      }
    }, 600);
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const res = requestPasswordResetOtp(resetEmail);
    if (res.success && res.otp) {
      setSimulatedOtp(res.otp);
      setResendTimer(60);
      setSuccessMsg(`New 6-digit verification code sent to ${res.maskedContact}.`);
    }
  };

  // Auto-fill OTP button for ease of testing
  const handleAutofillOtp = () => {
    if (simulatedOtp) {
      setOtpCode(simulatedOtp);
      clearMessages();
    }
  };

  // Copy OTP
  const handleCopyOtp = () => {
    if (simulatedOtp) {
      navigator.clipboard.writeText(simulatedOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  // 5. RESET PASSWORD HANDLER - COMPLETE PASSWORD UPDATE
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg("Please enter and confirm your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = completePasswordReset(resetEmail, otpCode, newPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Password updated & verified! Logging in to workspace...");
        // Log user in automatically
        loginUser(resetEmail, newPassword);
        setTimeout(() => router.push("/finance"), 1000);
      } else {
        setErrorMsg(res.error || "Password reset failed. Please restart verification.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#06110B] text-[#F6FAF4] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-lemon-400/30 selection:text-lemon-950 font-sans">
      
      {/* Lemon Tree Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lemon-400/15 via-forest-500/10 to-transparent pointer-events-none blur-3xl rounded-full animate-pulse-lemon" />
      <div className="absolute -top-40 right-[10%] w-[350px] h-[350px] bg-lemon-400/10 blur-[140px] rounded-full pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-40 left-[10%] w-[350px] h-[350px] bg-forest-600/15 blur-[140px] rounded-full pointer-events-none animate-float" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2f95208_1px,transparent_1px),linear-gradient(to_bottom,#e2f95208_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lemon-400 via-lime-400 to-forest-500 flex items-center justify-center p-[1px] shadow-[0_0_25px_rgba(226,249,82,0.3)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07150E] rounded-[15px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-lemon-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight font-headline text-white">
              Taxed FinOps
            </span>
          </Link>
          <p className="text-xs text-lemon-400/80 font-medium max-w-xs">
            Autonomous B2B Tax Gating • RazorpayX Governance
          </p>
        </div>

        {/* Card Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0A1C13]/90 border border-lemon-400/20 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-lemon-400/60 to-transparent" />

          {/* Navigation Tabs (Only for login & register) */}
          {(activeTab === "login" || activeTab === "register") && (
            <div className="grid grid-cols-2 p-1 bg-[#06110B] rounded-2xl border border-lemon-400/15 mb-6 text-xs font-bold font-headline">
              <button
                onClick={() => switchTab("login")}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "login" 
                    ? "bg-lemon-400 text-forest-950 shadow-sm font-extrabold" 
                    : "text-zinc-400 hover:text-lemon-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab("register")}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "register" 
                    ? "bg-lemon-400 text-forest-950 shadow-sm font-extrabold" 
                    : "text-zinc-400 hover:text-lemon-300"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* 1. SIGN IN TAB */}
            {activeTab === "login" && (
              <motion.div 
                key="login-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Enterprise Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        placeholder="controller@techsolutions.in"
                        required
                        className="w-full bg-[#06110B] border border-lemon-400/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-lemon-400/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Password</label>
                      <button 
                        type="button"
                        onClick={() => switchTab("forgot")}
                        className="text-[11px] text-lemon-400 hover:text-lemon-300 font-semibold transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[#06110B] border border-lemon-400/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-lemon-400/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-lemon-400/15 border border-lemon-400/30 text-lemon-300 p-3 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-lemon-400 via-lime-400 to-forest-500 hover:scale-[1.01] text-forest-950 font-black rounded-xl transition-all shadow-lg shadow-lemon-400/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-headline"
                  >
                    {loading ? "Authenticating..." : "Sign In to Workspace"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Demo Fill Pill */}
                <div className="pt-3 border-t border-lemon-400/10 flex items-center justify-between text-xs text-zinc-400">
                  <span>Demo Controller:</span>
                  <button 
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-forest-900/80 hover:bg-forest-900 text-lemon-300 border border-lemon-400/30 font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-lemon-400" />
                    Auto-Fill Demo
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. REGISTER TAB */}
            {activeTab === "register" && (
              <motion.div 
                key="register-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => { setName(e.target.value); clearMessages(); }}
                        placeholder="Rajesh Kumar"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        placeholder="rajesh@company.in"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Company Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => { setCompanyName(e.target.value); clearMessages(); }}
                          placeholder="Tech Solutions"
                          required
                          className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Company GSTIN</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          value={gstin}
                          onChange={(e) => { setGstin(e.target.value.toUpperCase()); clearMessages(); }}
                          placeholder="27AADCB2230M1Z2"
                          required
                          maxLength={15}
                          className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono uppercase text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Password (Min 6 chars)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {loading ? "Creating Enterprise..." : "Register Workspace"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD TAB: STEP 1 - REQUEST VERIFICATION OTP */}
            {activeTab === "forgot" && (
              <motion.div 
                key="forgot-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2 text-blue-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Account Recovery & Verification</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter your registered enterprise email to receive a secure 6-digit identity verification code.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        placeholder="rajesh@techsolutions.in"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {loading ? "Verifying Registry..." : "Send Verification Code"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-500 border-t border-white/5 pt-3">
                  <button 
                    type="button"
                    onClick={() => switchTab("login")}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. VERIFY OTP TAB: STEP 2 - ENTER 6-DIGIT CODE & PROVE OWNERSHIP */}
            {activeTab === "verify-otp" && (
              <motion.div 
                key="verify-otp-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Verify Account Identity</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    A 6-digit verification token was issued for <strong className="text-white">{maskedContact}</strong>.
                  </p>
                </div>

                {/* Simulated Verification Notice Box */}
                {simulatedOtp && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-teal-950/70 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        Simulated SMS / Email Delivery
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">Active Token</span>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-950/80 px-3 py-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">OTP Code:</span>
                        <span className="text-sm font-mono font-bold tracking-widest text-emerald-300">{simulatedOtp}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyOtp}
                          className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 cursor-pointer"
                          title="Copy OTP"
                        >
                          {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedOtp ? "Copied" : "Copy"}
                        </button>
                        <button
                          type="button"
                          onClick={handleAutofillOtp}
                          className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold cursor-pointer"
                        >
                          Auto-fill
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">6-Digit Verification Code</label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className={`text-[10px] font-semibold transition-colors ${
                          resendTimer > 0 
                            ? "text-zinc-500 cursor-not-allowed" 
                            : "text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        }`}
                      >
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); clearMessages(); }}
                        placeholder="123456"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-base text-center font-mono tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Validating Token..." : "Verify Identity & Proceed"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-500 border-t border-white/5 pt-3 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={() => switchTab("forgot")}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Re-enter Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => switchTab("login")}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. RESET PASSWORD TAB: STEP 3 - ESTABLISH NEW PASSWORD */}
            {activeTab === "reset" && (
              <motion.div 
                key="reset-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Set Verified Password</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Identity verified for <strong className="text-emerald-400">{resetEmail}</strong>. Set your new password.
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">New Password (Min 6 chars)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {loading ? "Updating Credentials..." : "Update Password & Open FinOps"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-500">
          <span>Protected by AES-256 GSTR-2B Encryption & Multi-Factor Enterprise Authentication</span>
        </div>

      </div>

    </div>
  );
}

