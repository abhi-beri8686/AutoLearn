import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code, Flame, Trophy, Target, ArrowRight, Search, Filter, CheckCircle2,
  Layers, ArrowUpDown, GitCommit, Server, Hash, Repeat, RotateCcw,
  Network, GitFork, TrendingUp, Zap, Share2, Cpu, FolderTree, ShieldAlert,
  Terminal, Gauge, FileText, ChevronRight, Sparkles, Building2, BookOpen
} from 'lucide-react';
import { DSA_TOPICS, DSA_PATTERNS, COMPANIES_LIST, DSA_PROBLEMS } from '../services/dsaService';
import { getLearnerProfile, getRecommendedProblems } from '../services/adaptiveEngine';

const TOPIC_ICONS = {
  Terminal, Gauge, Layers, FileText, ArrowUpDown, Search, GitCommit, Server,
  Hash, Repeat, RotateCcw, Network, GitFork, TrendingUp, Zap, Share2, Cpu,
  FolderTree, ShieldAlert
};

export default function DSAPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'problems' | 'patterns' | 'companies'
  const [profile, setProfile] = useState(getLearnerProfile());
  const [recommended, setRecommended] = useState([]);
  const [expandedTopic, setExpandedTopic] = useState('arrays');
  
  // Filters for Problem Library
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const prof = getLearnerProfile();
    setProfile(prof);
    setRecommended(getRecommendedProblems(2));
  }, []);

  const solvedSet = new Set(profile.solvedProblemIds || []);

  // Filtered problems list
  const filteredProblems = DSA_PROBLEMS.filter(prob => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = prob.title.toLowerCase().includes(q) ||
                    prob.topicName.toLowerCase().includes(q) ||
                    prob.patternName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDifficulty !== 'all' && prob.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && prob.topic !== selectedTopic) return false;
    if (selectedPattern !== 'all' && prob.pattern !== selectedPattern) return false;
    if (selectedCompany !== 'all' && !prob.companies.includes(selectedCompany)) return false;
    if (selectedStatus === 'solved' && !solvedSet.has(prob.id)) return false;
    if (selectedStatus === 'unsolved' && solvedSet.has(prob.id)) return false;
    return true;
  });

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header & Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              DSA ADAPTIVE ARENA
            </span>
            <span className="text-xs font-mono text-slate-400">19 Topic Modules · 200+ Curated Problems</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Code className="text-cyan-400" /> AutoLearn DSA Roadmap & Practice
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Master Data Structures & Algorithms with an adaptive engine that adjusts difficulty according to your mastery, identifies mistake patterns, and accelerates interview prep.
          </p>
        </div>

        {/* Quick Hub Navigation */}
        <div className="flex items-center flex-wrap gap-2">
          <Link to="/weak-areas" className="btn-cyber text-xs py-2 px-3 flex items-center gap-2">
            <Target size={14} className="text-rose-400" /> Weak Areas
          </Link>
          <Link to="/graph" className="btn-cyber text-xs py-2 px-3 flex items-center gap-2">
            <Network size={14} className="text-cyan-400" /> Skill Graph
          </Link>
          <Link to="/planner" className="btn-cyber text-xs py-2 px-3 flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" /> Daily Planner
          </Link>
        </div>
      </div>

      {/* ── Adaptive Stats Bar & Next Problem Recommendation ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1: Problems Solved */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Solved Problems</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">{profile.totalProblemsSolved || 0}</span>
            <span className="text-xs text-slate-500">/ 200 total</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400">{profile.easySolved || 0} Easy</span> · 
            <span className="text-amber-400">{profile.mediumSolved || 0} Med</span> · 
            <span className="text-rose-400">{profile.hardSolved || 0} Hard</span>
          </div>
        </div>

        {/* Stat 2: Accuracy & Submissions */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Coding Accuracy</span>
            <Target size={18} className="text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-cyan-400">{profile.accuracyRate || 75}%</span>
            <span className="text-xs text-slate-500">({profile.totalSubmissions || 0} attempts)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full" style={{ width: `${profile.accuracyRate || 75}%` }}></div>
          </div>
        </div>

        {/* Stat 3: Streak & XP */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Streak & Level</span>
            <Flame size={18} className="text-amber-400 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-display font-bold text-amber-400 flex items-center gap-1">
              {profile.streak} <span className="text-sm font-normal text-slate-400">days</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">
              Lvl {profile.level}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
            <span>{profile.levelTitle}</span>
            <span className="text-cyan-400 font-mono">{profile.xp} XP</span>
          </div>
        </div>

        {/* Stat 4: Adaptive Recommender Banner */}
        <div className="glass-card-strong p-5 bg-gradient-to-br from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles size={14} className="animate-spin text-cyan-400" /> AI RECOMMENDED NEXT
            </div>
            <div className="text-white font-semibold text-sm mt-1 truncate">
              {recommended[0]?.title || 'Maximum Subarray (Kadane)'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className={`px-1.5 py-0.2 rounded border text-[10px] ${getDifficultyColor(recommended[0]?.difficulty || 'Medium')}`}>
                {recommended[0]?.difficulty || 'Medium'}
              </span>
              <span>· {recommended[0]?.topicName || 'Arrays'}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/dsa/problem/${recommended[0]?.id || 'kadanes-algorithm'}`)}
            className="btn-cyber-primary text-xs py-1.5 px-3 w-full mt-3 flex items-center justify-center gap-1 font-semibold"
          >
            Solve Now <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'roadmap', label: 'Adaptive Curriculum Roadmap', icon: Layers },
          { id: 'problems', label: 'All Problems Library', icon: Code },
          { id: 'patterns', label: 'Problem Solving Patterns', icon: GitFork },
          { id: 'companies', label: 'Company Tech Tracks', icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-display text-sm transition ${
                isActive 
                  ? 'bg-white/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CURRICULUM ROADMAP (19 TOPICS) ── */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Layers className="text-cyan-400" size={20} /> 19-Step Progressive DSA Roadmap
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Click any topic module to expand problem set and start practicing
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DSA_TOPICS.map((topic, index) => {
              const Icon = TOPIC_ICONS[topic.icon] || Code;
              const mastery = profile.topicMastery[topic.id] || 0;
              const topicProblems = DSA_PROBLEMS.filter(p => p.topic === topic.id);
              const solvedInTopic = topicProblems.filter(p => solvedSet.has(p.id)).length;
              const isExpanded = expandedTopic === topic.id;

              return (
                <div 
                  key={topic.id}
                  className={`glass-card p-5 transition-all duration-300 border ${
                    isExpanded ? 'border-cyan-500/50 bg-white/[0.08] shadow-cyan-900/20' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="cursor-pointer flex items-start justify-between gap-3"
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">#{String(index + 1).padStart(2, '0')}</span>
                          <h3 className="font-display font-semibold text-white text-base">{topic.name}</h3>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{topic.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Topic Mastery Meter */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Mastery</span>
                    <span className={`font-mono font-semibold ${mastery >= 70 ? 'text-emerald-400' : mastery >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {mastery}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        mastery >= 70 ? 'bg-emerald-400' : mastery >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${mastery}%` }}
                    ></div>
                  </div>

                  {/* Expanded Problem Mini-List */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2 animate-fadeIn">
                      <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                        <span>PROBLEMS IN THIS MODULE</span>
                        <span>{solvedInTopic}/{topicProblems.length || topic.count} Solved</span>
                      </div>
                      
                      {topicProblems.length > 0 ? (
                        topicProblems.map(p => (
                          <div 
                            key={p.id}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-between gap-2 transition"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              {solvedSet.has(p.id) ? (
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                              )}
                              <span className="text-xs text-white truncate">{p.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getDifficultyColor(p.difficulty)}`}>
                                {p.difficulty}
                              </span>
                              <Link 
                                to={`/dsa/problem/${p.id}`}
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                              >
                                Solve →
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-lg bg-white/5 text-xs text-slate-400 text-center">
                          {topic.count} practice problems curated for this module.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: PROBLEM LIBRARY WITH ADVANCED FILTERS ── */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problem by name, topic, or pattern..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="cyber-input pl-10 w-full text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  value={selectedDifficulty} 
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="cyber-input text-xs py-2 px-3"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <select 
                  value={selectedTopic} 
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="cyber-input text-xs py-2 px-3"
                >
                  <option value="all">All Topics</option>
                  {DSA_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <select 
                  value={selectedStatus} 
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="cyber-input text-xs py-2 px-3"
                >
                  <option value="all">All Status</option>
                  <option value="solved">Solved</option>
                  <option value="unsolved">Unsolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Problems Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Problem Title</th>
                    <th className="py-3.5 px-4">Topic</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Core Pattern</th>
                    <th className="py-3.5 px-4">Acceptance</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProblems.map(p => {
                    const isSolved = solvedSet.has(p.id);
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.04] transition">
                        <td className="py-3.5 px-4">
                          {isSolved ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600" />
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <Link to={`/dsa/problem/${p.id}`} className="hover:text-cyan-400 transition">
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs">{p.topicName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs border font-mono ${getDifficultyColor(p.difficulty)}`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">{p.patternName}</td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">{p.acceptanceRate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/dsa/problem/${p.id}`)}
                            className="btn-cyber text-xs py-1 px-3"
                          >
                            Practice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PROBLEM SOLVING PATTERNS ── */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="text-slate-300 text-sm max-w-3xl">
            Recognizing algorithmic patterns is the fastest way to crack unseen interview questions. Master these foundational patterns to optimize solutions from brute-force O(n²) to linear or logarithmic runtimes.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DSA_PATTERNS.map(pattern => {
              const matching = DSA_PROBLEMS.filter(p => p.pattern === pattern.id);
              const patternMastery = profile.patternMastery[pattern.id] || 60;
              return (
                <div key={pattern.id} className="glass-card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">{pattern.name}</h3>
                      <p className="text-slate-400 text-xs mt-1">{pattern.desc}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
                      {patternMastery}% Mastery
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full" style={{ width: `${patternMastery}%` }}></div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="text-xs font-mono text-slate-400 mb-2">KEY DRILL PROBLEMS:</div>
                    <div className="flex flex-wrap gap-2">
                      {matching.length > 0 ? (
                        matching.map(p => (
                          <Link 
                            key={p.id} 
                            to={`/dsa/problem/${p.id}`}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 flex items-center gap-1.5 transition"
                          >
                            <Code size={12} className="text-cyan-400" />
                            {p.title}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Pattern problems integrated into topics</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: COMPANY INTERVIEW TRACKS ── */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="text-slate-300 text-sm max-w-3xl">
            Target specific tech companies with curated interview question categories and pattern breakdowns based on common industry hiring standards.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANIES_LIST.map(company => {
              const companyProbs = DSA_PROBLEMS.filter(p => p.companies.includes(company));
              return (
                <div key={company} className="glass-card p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-white text-base">{company}</h3>
                        <span className="text-xs text-slate-400 font-mono">Tech Interview Track</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-mono text-slate-400">FREQUENTLY ASKED:</div>
                      {companyProbs.slice(0, 3).map(p => (
                        <div key={p.id} className="text-xs text-slate-300 flex items-center justify-between">
                          <span>{p.title}</span>
                          <span className={`text-[10px] px-1 rounded border ${getDifficultyColor(p.difficulty)}`}>
                            {p.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setActiveTab('problems');
                    }}
                    className="btn-cyber text-xs py-2 w-full flex items-center justify-center gap-1.5"
                  >
                    View All {company} Questions <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
