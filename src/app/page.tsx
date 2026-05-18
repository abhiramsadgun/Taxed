import { Shield, FileText, Bot, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">GSTShield</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#" className="hover:text-white transition-colors">Features</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-white transition-colors">For CAs</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notices" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/notices" className="text-sm font-medium bg-white text-zinc-950 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          <span>Gemini 1.5 Flash Integration Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight max-w-4xl mb-6">
          India's Smartest AI <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            GST Compliance Copilot
          </span>
        </h1>
        
        <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Upload your invoices and let our Gemini-powered AI detect compliance errors, identify tax loopholes, and safeguard your business against GST notices before they happen.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/notices" className="group flex items-center gap-2 bg-emerald-500 text-emerald-950 px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5">
            <FileText className="w-5 h-5" />
            Try Invoice AI
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/chat" className="group flex items-center gap-2 bg-zinc-900 border border-white/10 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-zinc-800 transition-all hover:-translate-y-0.5">
            <Bot className="w-5 h-5 text-emerald-400" />
            Talk to AI Assistant
          </Link>
        </div>

        {/* Feature Preview */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
              <Shield className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Detection</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Automatically scan invoices for invalid HSN codes, GSTIN mismatches, and mathematical errors.</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Invoice Parsing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Powered by Gemini 1.5 Flash to instantly extract and validate structured data from raw PDFs or images.</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Bot className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">24/7 CA Assistant</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Chat with an AI trained on the latest CGST acts to get instant clarification on tax rules.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
