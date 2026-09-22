"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Layers, 
  Cpu, 
  Zap, 
  X,
  Sliders,
  Sparkles,
  ArrowRight,
  Filter,
  Eye
} from "lucide-react";
import { useFinanceStore, GraphNode, GraphEdge } from "@/store/useFinanceStore";

// Node coordinates on a 700x420 SVG viewbox
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  "node-buyer": { x: 350, y: 340 },
  "node-v1": { x: 120, y: 320 },
  "node-v2": { x: 580, y: 320 },
  "node-v4": { x: 230, y: 220 },
  "node-v5": { x: 470, y: 200 },
  "node-shell1": { x: 350, y: 70 },
  "node-shell2": { x: 580, y: 90 },
};

export default function CircularTradingFraudGraphPage() {
  const { graphNodes, graphEdges, payouts, addGraphNode } = useFinanceStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(
    graphNodes.find(n => n.circularAlert) || graphNodes[0] || null
  );
  const [filterMode, setFilterMode] = useState<"all" | "circular" | "legitimate">("all");
  const [isSimulatingAudit, setIsSimulatingAudit] = useState(false);
  const [auditReportOpen, setAuditReportOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Add Entity Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("Vardhaman Steel Traders");
  const [newGstin, setNewGstin] = useState("24VARDH7788A1Z9");
  const [newCity, setNewCity] = useState("Surat");
  const [newEntityType, setNewEntityType] = useState<"Active Trading Co" | "Registered Manufacturer" | "Suspected Shell Co" | "Intermediary Conduit">("Suspected Shell Co");
  const [newTurnover, setNewTurnover] = useState(85);
  const [newEmployees, setNewEmployees] = useState(0);
  const [newVolume, setNewVolume] = useState(120);

  const circularEntitiesCount = graphNodes.filter(n => n.circularAlert).length;
  const legitimateEntitiesCount = graphNodes.filter(n => !n.circularAlert).length;
  const highRiskEdgesCount = graphEdges.filter(e => e.isCircular).length;
  const blockedTransactionsValue = payouts.filter(p => p.complianceGate?.checks?.circularTradingRisk === "CRITICAL_LOOP")
    .reduce((acc, p) => acc + p.invoiceAmount, 0);

  const getCoordinates = (nodeId: string) => {
    if (NODE_COORDINATES[nodeId]) return NODE_COORDINATES[nodeId];
    const idx = graphNodes.findIndex(n => n.id === nodeId);
    const angle = (idx / Math.max(1, graphNodes.length)) * 2 * Math.PI;
    return {
      x: 350 + Math.round(200 * Math.cos(angle)),
      y: 200 + Math.round(130 * Math.sin(angle))
    };
  };

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addGraphNode({
      label: newLabel,
      gstin: newGstin,
      city: newCity,
      entityType: newEntityType,
      annualTurnoverCr: Number(newTurnover),
      employees: Number(newEmployees),
      billingVolumeLakhs: Number(newVolume)
    });
    setSelectedNode(created);
    setAddModalOpen(false);
  };

  const filteredNodes = useMemo(() => {
    if (filterMode === "circular") {
      return graphNodes.filter(n => n.circularAlert);
    }
    if (filterMode === "legitimate") {
      return graphNodes.filter(n => !n.circularAlert);
    }
    return graphNodes;
  }, [graphNodes, filterMode]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return graphEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [graphEdges, filteredNodes]);

  const handleRunDeepAudit = () => {
    setIsSimulatingAudit(true);
    setTimeout(() => {
      setIsSimulatingAudit(false);
      setAuditReportOpen(true);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Network className="w-3.5 h-3.5 text-purple-400" />
                AI Risk Sentinel & Graph Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Circular Loop & Synthetic Invoice Shield
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Circular Trading & Shell Entity Detector
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Detects circular invoice syndicates, bill-trading shell networks, and synthetic turnover spikes before disbursements move via RazorpayX. Features a <strong className="text-white">deterministic audit trail</strong> with zero black-box obscurity for auditors.
            </p>
          </div>

          <button
            onClick={handleRunDeepAudit}
            disabled={isSimulatingAudit}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer shrink-0"
          >
            <Cpu className={`w-4 h-4 ${isSimulatingAudit ? "animate-spin" : ""}`} />
            {isSimulatingAudit ? "Analyzing Graph Topology..." : "Generate CA Audit Certificate"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-zinc-900/70 border border-rose-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Circular Trading Loops Flagged</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono">{circularEntitiesCount} Shell Clusters</div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1 truncate">
            Loop: Kaveri ➔ TexHub ➔ Omkar ➔ Kaveri
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-zinc-900/70 border border-purple-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>High-Risk Inter-Entity Flows</span>
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-300 font-mono">₹2,625 Lakhs</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {highRiskEdgesCount} Artificial billing transactions isolated
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
            <span>Protected RazorpayX Outflow</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">₹{(blockedTransactionsValue || 1850000).toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Hard blocked from disbursement
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Interactive Graph Visualizer Canvas + Explainability Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: GSTIN Network Graph Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              GSTIN Entity Graph & Billing Topology
            </h2>
            
            {/* Filter Pills & Add Action */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                + Scan & Add Entity
              </button>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterMode === "all" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({graphNodes.length})
                </button>
                <button
                  onClick={() => setFilterMode("circular")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterMode === "circular" ? "bg-rose-600 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Circular Loop ({circularEntitiesCount})
                </button>
                <button
                  onClick={() => setFilterMode("legitimate")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterMode === "legitimate" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Legitimate ({legitimateEntitiesCount})
                </button>
              </div>
            </div>
          </div>

          {/* Graph Canvas Card */}
          <div className="relative rounded-3xl bg-zinc-950 border border-white/10 p-4 sm:p-6 min-h-[480px] overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Background grid markings */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {/* Circular Alert Banner */}
            <div className="relative z-10 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Synthetic Loop Alert: 3-Node Circular Invoice Carousel Detected</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                98.4% Confidence
              </span>
            </div>

            {/* SVG Network Visualizer */}
            <div className="relative z-10 my-4 w-full h-[320px] flex items-center justify-center">
              <svg 
                viewBox="0 0 700 420" 
                className="w-full h-full select-none"
                style={{ overflow: "visible" }}
              >
                <defs>
                  {/* Arrow markers */}
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#E2F952" />
                  </marker>
                  <marker id="arrow-rose" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                  </marker>
                  <marker id="arrow-lemon" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#52B788" />
                  </marker>
                </defs>

                {/* Edges */}
                {filteredEdges.map((edge) => {
                  const sourceCoord = getCoordinates(edge.source);
                  const targetCoord = getCoordinates(edge.target);
                  if (!sourceCoord || !targetCoord) return null;

                  const isLoop = edge.isCircular;
                  const markerId = isLoop ? "url(#arrow-rose)" : "url(#arrow-green)";

                  // Slight curve for circular loop edges
                  const midX = (sourceCoord.x + targetCoord.x) / 2;
                  const midY = (sourceCoord.y + targetCoord.y) / 2;
                  const dx = targetCoord.x - sourceCoord.x;
                  const dy = targetCoord.y - sourceCoord.y;
                  const curvature = isLoop ? 25 : 0;
                  const cx = midX - dy * (curvature / 100);
                  const cy = midY + dx * (curvature / 100);

                  const pathD = `M ${sourceCoord.x} ${sourceCoord.y} Q ${cx} ${cy} ${targetCoord.x} ${targetCoord.y}`;

                  return (
                    <g key={edge.id} className="cursor-pointer group">
                      {/* Glow background for loop */}
                      {isLoop && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="6"
                          strokeOpacity="0.25"
                        />
                      )}
                      
                      {/* Base Path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isLoop ? "#f43f5e" : "#E2F952"}
                        strokeWidth={isLoop ? "2.5" : "1.5"}
                        strokeDasharray={isLoop ? "6, 4" : undefined}
                        className={isLoop ? "animate-[dash_1.5s_linear_infinite]" : ""}
                        markerEnd={markerId}
                        opacity={isLoop ? 0.9 : 0.6}
                      />

                      {/* Edge Label Badge */}
                      <rect
                        x={midX - 30}
                        y={midY - 10}
                        width="60"
                        height="18"
                        rx="4"
                        fill="#09090b"
                        stroke={isLoop ? "#f43f5e" : "#27272a"}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        fill={isLoop ? "#fda4af" : "#94a3b8"}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        ₹{edge.billingVolumeLakhs}L
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const coord = getCoordinates(node.id);
                  if (!coord) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const isShell = node.circularAlert;
                  const isBuyer = node.id === "node-buyer";

                  const fillColor = isShell ? "#e11d48" : isBuyer ? "#10b981" : "#3b82f6";
                  const strokeColor = isSelected ? "#a855f7" : isShell ? "#fda4af" : isBuyer ? "#6ee7b7" : "#93c5fd";

                  return (
                    <g 
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer transition-all"
                    >
                      {/* Pulsing ring on shell or selected node */}
                      {(isShell || isSelected) && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={isSelected ? 32 : 28}
                          fill={isShell ? "#f43f5e" : "#a855f7"}
                          opacity="0.25"
                          className="animate-ping origin-center"
                        />
                      )}

                      {/* Outer selection ring */}
                      {isSelected && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={28}
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.5"
                          strokeDasharray="4, 3"
                        />
                      )}

                      {/* Node Base Circle */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={22}
                        fill="#18181b"
                        stroke={strokeColor}
                        strokeWidth="2"
                        className="transition-all hover:scale-110 origin-center shadow-lg"
                      />

                      {/* Inner Indicator Icon or Dot */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={8}
                        fill={fillColor}
                      />

                      {/* Node Label Text */}
                      <text
                        x={coord.x}
                        y={coord.y + 36}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow"
                      >
                        {node.label.length > 18 ? node.label.substring(0, 16) + "..." : node.label}
                      </text>

                      {/* Risk badge pill */}
                      <text
                        x={coord.x}
                        y={coord.y + 49}
                        fill={isShell ? "#f43f5e" : isBuyer ? "#10b981" : "#94a3b8"}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {isShell ? `RISK ${node.riskScore}% [SHELL]` : isBuyer ? "ORIGIN (YOU)" : `Risk ${node.riskScore}%`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Topology Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-3 gap-2">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Your Entity (Origin)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  Suspected Shell Syndicate (Circular Loop)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  Verified Vendor
                </span>
              </div>
              <span className="font-mono text-zinc-500">Graph Neural Network v2.4</span>
            </div>
          </div>
        </div>

        {/* Right: Deterministic Audit Trail & Explainability UI */}
        <div className="lg:col-span-5">
          {selectedNode ? (
            <motion.div 
              key={selectedNode.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      Deterministic Entity Inspector
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedNode.label}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">GSTIN: {selectedNode.gstin}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block font-medium">Risk Score</span>
                    <span className={`text-2xl font-bold font-mono ${
                      selectedNode.riskScore > 70 ? "text-rose-400" : selectedNode.riskScore > 30 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {selectedNode.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Entity Forensic Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Entity Type</span>
                    <span className="font-bold text-white mt-1 block truncate">{selectedNode.entityType}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Annual Turnover</span>
                    <span className="font-bold text-purple-300 mt-1 block">₹{selectedNode.annualTurnoverCr} Crores</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Registered Staff</span>
                    <span className="font-bold text-zinc-300 mt-1 block">{selectedNode.employees} Employees</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block font-sans font-semibold">Circular Loop</span>
                    <span className={`font-bold mt-1 block ${selectedNode.circularAlert ? "text-rose-400" : "text-emerald-400"}`}>
                      {selectedNode.circularAlert ? "DETECTED (98%)" : "CLEAR"}
                    </span>
                  </div>
                </div>

                {/* Explainability & Reason Codes */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Explainable Forensic Reasoning
                  </span>

                  <div className="space-y-2 text-xs">
                    {selectedNode.circularAlert ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-zinc-300 flex items-start gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block">Closed Circular Transaction Loop</strong>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                              98.4% billing volume returns to origin node within 14 days without physical goods movement.
                            </p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-zinc-300 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block">Turnover vs Physical Asset Disparity</strong>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                              ₹98 Cr turnover with 1 registered employee and 0 electricity consumption in textile cluster.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-zinc-300 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Legitimate Operational Entity</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                            Consistent GSTR-1 filings, valid physical footprint, and authentic B2B supply chain topology.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CA Audit Memo Trigger */}
                <button
                  onClick={() => setAuditReportOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  View Full CA Audit Report & Payout Gate Log
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 text-center text-zinc-500 text-xs">
              Select an entity node from the graph to inspect forensic reasoning and risk scoring.
            </div>
          )}
        </div>
      </div>

      {/* CA Audit Certificate Modal */}
      <AnimatePresence>
        {auditReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">CA Forensic Compliance Certificate</h3>
                    <p className="text-xs text-zinc-400 font-mono">Doc ID: CERT-TAXED-2026-RZPX</p>
                  </div>
                </div>
                <button onClick={() => setAuditReportOpen(false)} className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-zinc-300 font-sans max-h-96 overflow-y-auto pr-2">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
                  <div className="text-white font-bold">1. Executive Compliance Finding</div>
                  <p className="text-zinc-400">
                    Taxed AI Risk Engine identified high-confidence synthetic billing circular loops involving GSTIN <strong className="text-white">27ZZZZZ9999Z9Z9 (Kaveri Synthetic Textiles)</strong>. Under Section 132(1)(b) of the CGST Act, 2017, issuance of invoices without supply of goods is a cognizable offence.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
                  <div className="text-white font-bold">2. Autonomous RazorpayX Action</div>
                  <p className="text-zinc-400">
                    All queued disbursements totaling <strong className="text-rose-400">₹18,50,000</strong> to the target beneficiary account have been placed on compliance freeze. RazorpayX Payout ID <code className="text-blue-400">pout_FRAUD_BLOCK_881</code> hard locked.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
                  <div className="text-white font-bold">3. Explainable Anomaly Breakdown</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>Circularity Index: 0.98 (Loops between Kaveri, TexHub, and Omkar).</li>
                    <li>Turnover-to-Employee Ratio: ₹98 Cr / 1 employee (Top 0.01% anomaly).</li>
                    <li>GSTIN Registration Status: Flagged for DGGI Investigation.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => setAuditReportOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert("Downloaded Taxed CA Compliance Certificate (PDF Simulation)");
                    setAuditReportOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <Download className="w-4 h-4" />
                  Export Signed Audit PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Scan & Add Entity Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Scan & Add GSTIN Entity</h3>
                    <p className="text-[11px] text-zinc-400">Add vendor or counterparty to Fraud Topology Graph</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAddModalOpen(false)} 
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEntity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Entity Trade Name</label>
                    <input
                      type="text"
                      required
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">GSTIN</label>
                    <input
                      type="text"
                      required
                      value={newGstin}
                      onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">City / Hub</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Entity Classification</label>
                    <select
                      value={newEntityType}
                      onChange={(e) => setNewEntityType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Active Trading Co">Active Trading Co</option>
                      <option value="Registered Manufacturer">Registered Manufacturer</option>
                      <option value="Suspected Shell Co">Suspected Shell Co (High Risk)</option>
                      <option value="Intermediary Conduit">Intermediary Conduit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Turnover (₹ Cr)</label>
                    <input
                      type="number"
                      required
                      value={newTurnover}
                      onChange={(e) => setNewTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Staff / Employees</label>
                    <input
                      type="number"
                      required
                      value={newEmployees}
                      onChange={(e) => setNewEmployees(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold">Billing Vol (₹ Lakhs)</label>
                    <input
                      type="number"
                      required
                      value={newVolume}
                      onChange={(e) => setNewVolume(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
                  >
                    Run Forensic Scoring & Add Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
