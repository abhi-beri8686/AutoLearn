import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Network, CheckCircle2, Clock, AlertTriangle, Lock, ArrowRight,
  Sparkles, Layers, BookOpen, ChevronRight, Zap
} from 'lucide-react';
import { getLearnerProfile } from '../services/adaptiveEngine';

const GRAPH_NODES = [
  { id: 'basics', label: 'Programming Basics', x: 100, y: 80, level: 1, prereqs: [] },
  { id: 'complexity', label: 'Complexity Analysis', x: 300, y: 80, level: 1, prereqs: ['basics'] },
  { id: 'arrays', label: 'Arrays & Math', x: 180, y: 180, level: 2, prereqs: ['basics', 'complexity'] },
  { id: 'strings', label: 'Strings & Parsing', x: 420, y: 180, level: 2, prereqs: ['basics'] },
  { id: 'hashing', label: 'Hashing & Maps', x: 280, y: 260, level: 2, prereqs: ['arrays', 'strings'] },
  { id: 'two-pointers', label: 'Two Pointers / Sliding Window', x: 500, y: 260, level: 2, prereqs: ['arrays', 'strings'] },
  { id: 'binary-search', label: 'Binary Search', x: 100, y: 280, level: 2, prereqs: ['arrays', 'complexity'] },
  { id: 'sorting', label: 'Sorting Algorithms', x: 200, y: 360, level: 2, prereqs: ['arrays', 'complexity'] },
  { id: 'linked-lists', label: 'Linked Lists', x: 380, y: 360, level: 3, prereqs: ['basics'] },
  { id: 'stacks-queues', label: 'Stack & Queue', x: 560, y: 360, level: 3, prereqs: ['linked-lists', 'arrays'] },
  { id: 'recursion', label: 'Recursion', x: 140, y: 460, level: 3, prereqs: ['basics'] },
  { id: 'backtracking', label: 'Backtracking', x: 320, y: 460, level: 4, prereqs: ['recursion'] },
  { id: 'trees', label: 'Binary Trees & BST', x: 500, y: 460, level: 4, prereqs: ['recursion', 'stacks-queues'] },
  { id: 'heap', label: 'Heap & Priority Queue', x: 680, y: 460, level: 4, prereqs: ['trees', 'arrays'] },
  { id: 'greedy', label: 'Greedy Strategy', x: 120, y: 560, level: 4, prereqs: ['sorting', 'heap'] },
  { id: 'graphs', label: 'Graphs (BFS/DFS/Dijkstra)', x: 340, y: 560, level: 5, prereqs: ['trees', 'stacks-queues', 'recursion'] },
  { id: 'dp', label: 'Dynamic Programming', x: 560, y: 560, level: 5, prereqs: ['recursion', 'arrays'] },
  { id: 'trie', label: 'Trie Prefix Trees', x: 720, y: 560, level: 5, prereqs: ['trees', 'strings'] },
  { id: 'advanced', label: 'Segment Tree & DSU', x: 450, y: 660, level: 6, prereqs: ['graphs', 'dp', 'trees'] },
];

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const profile = getLearnerProfile();
  const [selectedNodeId, setSelectedNodeId] = useState('dp');

  const selectedNode = GRAPH_NODES.find(n => n.id === selectedNodeId) || GRAPH_NODES[0];
  const mastery = profile.topicMastery[selectedNode.id] || 0;

  const getNodeStatus = (nodeId) => {
    const score = profile.topicMastery[nodeId] || 0;
    if (score >= 70) return { label: 'Mastered', color: '#10b981', border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
    if (score >= 40) return { label: 'Learning', color: '#00d4ff', border: 'border-cyan-500', bg: 'bg-cyan-500/20', text: 'text-cyan-400' };
    if (score > 0) return { label: 'Weak Concept', color: '#f43f5e', border: 'border-rose-500', bg: 'bg-rose-500/20', text: 'text-rose-400' };
    return { label: 'Not Started', color: '#64748b', border: 'border-slate-600', bg: 'bg-slate-800', text: 'text-slate-400' };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            PREREQUISITE SKILL GRAPH
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Network className="text-cyan-400" /> Interactive AI Knowledge & Skill Graph
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Explore hierarchical dependency connections between algorithms. Master fundamental prerequisites to unlock advanced techniques without knowledge gaps.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" /><span className="text-slate-300">Mastered (&gt;70%)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" /><span className="text-slate-300">In Progress</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" /><span className="text-slate-300">Weak Area (&lt;40%)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Visual Node Canvas (Left 8 cols) ── */}
        <div className="lg:col-span-8 glass-card p-6 relative overflow-x-auto min-h-[620px] flex items-center justify-center">
          <svg className="w-[820px] h-[720px] select-none">
            <defs>
              <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Prerequisite Connection Lines */}
            {GRAPH_NODES.map(node => {
              return node.prereqs.map(prereqId => {
                const parent = GRAPH_NODES.find(n => n.id === prereqId);
                if (!parent) return null;
                const isSelected = selectedNodeId === node.id || selectedNodeId === parent.id;
                return (
                  <line
                    key={`${parent.id}->${node.id}`}
                    x1={parent.x}
                    y1={parent.y}
                    x2={node.x}
                    y2={node.y}
                    stroke={isSelected ? '#00d4ff' : 'rgba(255, 255, 255, 0.15)'}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeDasharray={isSelected ? '4 2' : 'none'}
                    className="transition-all duration-300"
                  />
                );
              });
            })}

            {/* Nodes */}
            {GRAPH_NODES.map(node => {
              const status = getNodeStatus(node.id);
              const isSelected = selectedNodeId === node.id;
              const nodeMastery = profile.topicMastery[node.id] || 0;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <circle
                    r={isSelected ? 26 : 20}
                    fill="#0f1020"
                    stroke={status.color}
                    strokeWidth={isSelected ? 3.5 : 2}
                    filter={isSelected ? `drop-shadow(0 0 12px ${status.color})` : 'none'}
                  />
                  <text
                    y={3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isSelected ? 11 : 9}
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight="bold"
                  >
                    {nodeMastery}%
                  </text>
                  <text
                    y={isSelected ? 42 : 36}
                    textAnchor="middle"
                    fill={isSelected ? '#00d4ff' : '#cbd5e1'}
                    fontSize={11}
                    fontFamily="DM Sans, sans-serif"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Node Inspector / Drawer (Right 4 cols) ── */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">SELECTED NODE</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono border ${getNodeStatus(selectedNode.id).border} ${getNodeStatus(selectedNode.id).bg} ${getNodeStatus(selectedNode.id).text}`}>
                {getNodeStatus(selectedNode.id).label}
              </span>
            </div>

            <h2 className="text-2xl font-display font-bold text-white">{selectedNode.label}</h2>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Current Mastery</span>
                <span className={`font-bold ${mastery >= 70 ? 'text-emerald-400' : mastery >= 40 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {mastery}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${mastery >= 70 ? 'bg-emerald-400' : mastery >= 40 ? 'bg-cyan-400' : 'bg-rose-400'}`}
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </div>

            {/* Prerequisites */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold">Prerequisites:</div>
              {selectedNode.prereqs.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedNode.prereqs.map(pId => {
                    const pNode = GRAPH_NODES.find(n => n.id === pId);
                    const pStatus = getNodeStatus(pId);
                    return (
                      <div 
                        key={pId} 
                        onClick={() => setSelectedNodeId(pId)}
                        className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer text-xs"
                      >
                        <span className="text-white font-medium">{pNode?.label || pId}</span>
                        <span className={`font-mono ${pStatus.text}`}>{profile.topicMastery[pId] || 0}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">Foundational concept (No prerequisites required).</div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => navigate('/dsa')}
              className="btn-cyber-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 font-bold"
            >
              Practice {selectedNode.label} Problems <ArrowRight size={14} />
            </button>
            <Link
              to="/resources"
              className="btn-cyber text-xs py-2 px-4 w-full flex items-center justify-center gap-2"
            >
              <BookOpen size={14} /> View Notes & Video Lectures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
