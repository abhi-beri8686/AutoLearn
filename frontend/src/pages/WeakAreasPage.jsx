import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, AlertTriangle, CheckCircle2, ArrowRight, Zap, RefreshCw,
  Sparkles, BookOpen, ChevronRight, Lightbulb, TrendingUp, ShieldAlert
} from 'lucide-react';
import { getLearnerProfile } from '../services/adaptiveEngine';

const TOPIC_NAMES = {
  basics: 'Programming Basics',
  complexity: 'Time & Space Complexity',
  arrays: 'Arrays & Matrix Operations',
  strings: 'String Processing',
  sorting: 'Sorting & Divide & Conquer',
  'binary-search': 'Binary Search & Optimization',
  'linked-lists': 'Linked Lists',
  'stacks-queues': 'Stack & Queue Systems',
  hashing: 'Hashing & HashMaps',
  recursion: 'Recursion & Divide-and-Conquer',
  backtracking: 'Backtracking Search',
  trees: 'Trees & Hierarchies',
  bst: 'Binary Search Trees',
  heap: 'Heaps & Priority Queues',
  greedy: 'Greedy Strategy',
  graphs: 'Graph Algorithms & Traversals',
  dp: 'Dynamic Programming & Memoization',
  trie: 'Trie Prefix Trees',
  advanced: 'Advanced Algorithmic Structures'
};

export default function WeakAreasPage() {
  const navigate = useNavigate();
  const profile = getLearnerProfile();

  // Group topics into Mastery tiers
  const allTopicEntries = Object.entries(profile.topicMastery || {}).map(([id, score]) => {
    return { id, name: TOPIC_NAMES[id] || id, score, desc: `Core concept mastery assessment` };
  });

  const weakTopics = allTopicEntries.filter(t => t.score < 50).sort((a, b) => a.score - b.score);
  const intermediateTopics = allTopicEntries.filter(t => t.score >= 50 && t.score < 75).sort((a, b) => a.score - b.score);
  const strongTopics = allTopicEntries.filter(t => t.score >= 75).sort((a, b) => b.score - a.score);

  const startDrill = (topicId) => {
    navigate('/quiz');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            DIAGNOSTIC INTELLIGENCE
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Target className="text-rose-400" /> Weak Areas & Mistake Pattern Analyzer
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            AutoLearn continuously monitors your assessment scores, quiz submissions, and concept accuracy to identify specific weaknesses and deliver targeted remedial drills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => startDrill(weakTopics[0]?.id || 'dp')}
            className="btn-cyber-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold shadow-lg shadow-rose-950/40"
          >
            <Zap size={14} /> Launch Priority 15-Min Remedial Drill
          </button>
        </div>
      </div>

      {/* ── Critical Alerts: Detected Mistake Patterns ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} /> High-Priority Mistake Patterns Detected by AI
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.mistakePatterns.map(pattern => (
            <div key={pattern.id} className="glass-card p-5 border-l-4 border-rose-500 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                  {pattern.severity} Priority
                </span>
                <span className="text-xs text-slate-500 font-mono">{pattern.frequency}x Occurred</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{pattern.issue}</h3>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">{pattern.topic} · {pattern.pattern}</div>
              </div>
              <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg leading-relaxed">
                💡 <span className="font-semibold text-white">AI Recommendation:</span> {pattern.recommendation}
              </p>
              <button
                onClick={() => navigate('/tutor', { state: { initialPrompt: `Can you explain why "${pattern.issue}" occurs in ${pattern.topic} and give me a step-by-step example on how to avoid it?` } })}
                className="btn-cyber text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 text-cyan-300"
              >
                Discuss with AI Tutor <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comprehensive Mastery Breakdown by Tiers ── */}
      <div className="space-y-6">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-cyan-400" size={20} /> Concept Mastery Distribution
        </h2>

        {/* 1. Critical Attention Needed (< 50%) */}
        <div className="glass-card p-6 space-y-4 border border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-display text-sm">
              <ShieldAlert size={16} /> Critical Focus Area (Mastery &lt; 50%)
            </div>
            <span className="text-xs text-slate-400 font-mono">{weakTopics.length} Topics Detected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weakTopics.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{t.name}</span>
                    <span className="text-rose-400 font-mono font-bold text-sm">{t.score}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{t.desc}</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${t.score}%` }}></div>
                </div>
                <button
                  onClick={() => startDrill(t.id)}
                  className="btn-cyber text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1 text-rose-300 border-rose-500/30"
                >
                  Start Remedial Quiz →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Developing Mastery (50% - 74%) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-display text-sm">
              <RefreshCw size={16} /> Developing Concepts (50% – 74%)
            </div>
            <span className="text-xs text-slate-400 font-mono">{intermediateTopics.length} Topics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {intermediateTopics.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{t.name}</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">{t.score}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{t.desc}</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${t.score}%` }}></div>
                </div>
                <button
                  onClick={() => startDrill(t.id)}
                  className="btn-cyber text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1"
                >
                  Reinforce Concept →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mastered Concepts (>= 75%) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-display text-sm">
              <CheckCircle2 size={16} /> Mastered Concepts (75%+)
            </div>
            <span className="text-xs text-slate-400 font-mono">{strongTopics.length} Topics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {strongTopics.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{t.name}</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{t.score}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{t.desc}</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${t.score}%` }}></div>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono text-center">✓ Solid Retention</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
