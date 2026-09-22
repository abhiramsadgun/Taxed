"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Network, 
  Scale, 
  CreditCard,
  QrCode
} from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      setMessages([
        {
          id: "msg_1",
          role: "assistant",
          content: `Hello ${user?.name?.split(' ')[0] || 'Rajesh'}! I am your Taxed FinOps & Razorpay AI Copilot. I can assist you with Section 194Q TDS rules, Section 43B(h) MSME 45-day payment statutory deadlines, RazorpayX Pre-Disbursement Compliance Gating, and Circular Trading fraud forensics. What would you like to verify?`
        }
      ]);
    }
  }, [isMounted, isAuthenticated, user]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    { label: "Section 194Q TDS Split", prompt: "How does 0.1% TDS computation work for RazorpayX vendor payouts exceeding ₹50 Lakhs?" },
    { label: "MSME 45-Day Rule (43B(h))", prompt: "Explain the tax disallowance penalty under Section 43B(h) if an MSME supplier is paid on Day 46." },
    { label: "GSTR-2B Lock Policy", prompt: "Why is 18% GST withheld for vendors with low filing reliability scores?" },
    { label: "Circular Trading Detection", prompt: "How does the AI Risk Sentinel detect synthetic invoice loops and shell entities?" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input.trim();
    if (!userText) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error("FastAPI offline");
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.data || data.message || "Processed response."
      }]);
    } catch {
      // Offline fallback
      let fallbackText = "I am operating in Offline FinOps Mode. Here is the statutory CA analysis for your query:";
      const promptLower = userText.toLowerCase();

      if (promptLower.includes("194q") || promptLower.includes("tds") || promptLower.includes("50 lakh")) {
        fallbackText = `### Section 194Q TDS & RazorpayX Split Engine\n\n1. **Threshold**: Applies to buyers whose turnover in the preceding FY exceeds ₹10 Crores, purchasing goods from a resident vendor exceeding **₹50 Lakhs** in the current FY.\n2. **Rate**: **0.1%** on the amount exceeding ₹50 Lakhs (or 5% if PAN is not furnished).\n3. **Autonomous Split**: When paying a ₹10,00,000 bill exceeding the threshold, Taxed deducts ₹1,000 TDS directly into the Govt Tax Ledger and disburses ₹9,99,000 net to the vendor via RazorpayX Payouts.`;
      } else if (promptLower.includes("msme") || promptLower.includes("43b") || promptLower.includes("45")) {
        fallbackText = `### MSME 45-Day Payment Rule (Section 43B(h))\n\n1. **Statutory Deadline**: Under Section 15 of the MSMED Act, payment must be made within **15 days** (in absence of agreement) or max **45 days** (with written contract).\n2. **Consequence of Delay**: If unpaid by the end of the financial year, the entire invoice value is **disallowed as a business deduction** and added back to taxable profits, triggering ~25-30% corporate tax penalty.\n3. **Taxed Protection**: Our MSME Sentinel auto-schedules RazorpayX disbursements 48 hours prior to the 45-day mark to preserve 100% tax deductibility.`;
      } else if (promptLower.includes("circular") || promptLower.includes("fraud") || promptLower.includes("shell") || promptLower.includes("loop")) {
        fallbackText = `### Circular Trading & Rule 86A Fraud Shield\n\n1. **Detection Mechanism**: Taxed constructs a directed graph of all supplier-buyer GSTIN nodes. Closed cycles (e.g. A ➔ B ➔ C ➔ A) with high billing volume velocity are flagged as synthetic invoicing syndicates.\n2. **Anomaly Indicators**: Disparity between turnover (e.g. ₹98 Cr) and physical infrastructure (0 electricity consumption, 1 employee) triggers automated hard blocks.\n3. **RazorpayX Action**: Payouts to suspected conduit nodes are placed on immediate compliance freeze with an exportable CA forensic audit memo.`;
      } else if (promptLower.includes("2b") || promptLower.includes("withhold") || promptLower.includes("dunning") || promptLower.includes("gstr-1")) {
        fallbackText = `### GSTR-2B Dynamic Lock & Autonomous Dunning\n\n1. **Rule 36(4) Compliance**: Section 16(2)(aa) requires that ITC is claimable only if the invoice is reported in GSTR-1 by the supplier and reflected in GSTR-2B.\n2. **18% GST Withholding**: For suppliers with high historical late-filing rates (>25%), the GST component is held in buffer until portal reflection.\n3. **Multi-Channel Dunning**: On the 11th of every month, an autonomous AI agent dispatches WhatsApp and Email reminders to non-filing vendors with exact invoice details and UTR receipts.`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackText
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link 
            href="/finance" 
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-none">FinOps AI Assistant</span>
              <span className="text-[10px] text-emerald-400 font-mono">RazorpayX & Tax Copilot</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400 font-mono">Gemini 1.5 Flash</span>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 overflow-y-auto space-y-6">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-4 rounded-3xl max-w-2xl text-xs leading-relaxed ${
                isUser 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/10 rounded-tr-none" 
                  : "bg-zinc-900/90 border border-white/10 text-zinc-200 shadow-xl rounded-tl-none prose prose-invert prose-xs"
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3.5 items-center text-zinc-400 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>Analyzing statutory regulations & RazorpayX protocols...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Console & Quick Suggestions */}
      <div className="border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl p-6 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.prompt)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/20 text-zinc-300 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {q.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Section 194Q TDS, MSME 45-day SLAs, or RazorpayX compliance gating..."
              className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
