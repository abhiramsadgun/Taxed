"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      role: "assistant",
      content: `Hello ${user?.name.split(' ')[0]}! I am your GSTShield AI Assistant. I can help you with GST compliance, law explanations, or analyzing your current tax data. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a simulated response in Demo Mode. The actual AI will cite specific sections of the CGST Act (e.g., Section 16 for ITC conditions) and perform calculations based on your uploaded data."
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto border border-white/5 bg-zinc-950/50 rounded-2xl overflow-hidden shadow-2xl glass">
      
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center px-4 bg-zinc-900/50 gap-3 shrink-0">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <div>
          <h2 className="font-semibold text-white text-sm">GST Knowledge Assistant</h2>
          <p className="text-xs text-zinc-500">Powered by LangChain & OpenAI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={clsx("flex gap-4 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "assistant" ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"
            )}>
              {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            
            <div className={clsx(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "assistant" 
                ? "bg-zinc-900/80 border border-white/5 text-zinc-300" 
                : "bg-emerald-500 text-emerald-950 font-medium"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing GST Laws...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/50 border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ITC rules, notice replies, or your tax data..."
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none min-h-[52px] max-h-32"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-emerald-500 text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-zinc-600">AI can make mistakes. Verify critical tax advice with a CA.</p>
        </div>
      </div>

    </div>
  );
}
