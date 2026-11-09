import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Code, Play, CheckCircle2, XCircle, Clock, Cpu, Sparkles, Lightbulb,
  ArrowLeft, ArrowRight, RotateCcw, Copy, Check, MessageSquare, Shield,
  ChevronRight, Terminal, Award, Flame, AlertTriangle
} from 'lucide-react';
import { getProblemById, executeCodeSimulation } from '../services/dsaService';
import { recordSubmission, getRecommendedProblems, getLearnerProfile } from '../services/adaptiveEngine';

export default function DSAProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problem = getProblemById(id);

  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'hints' | 'approach' | 'submissions'
  const [language, setLanguage] = useState('java'); // 'java' | 'python' | 'cpp'
  const [code, setCode] = useState(problem.starterCode.java);
  const [activeHintLevel, setActiveHintLevel] = useState(0); // 0 = none, 1, 2, 3
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [profile, setProfile] = useState(getLearnerProfile());
  const [nextProblems, setNextProblems] = useState([]);

  useEffect(() => {
    const p = getProblemById(id);
    setCode(p.starterCode[language] || p.starterCode.java);
    setActiveHintLevel(0);
    setExecutionResult(null);
    setShowCelebration(false);
    setProfile(getLearnerProfile());
    setNextProblems(getRecommendedProblems(2));
  }, [id, language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(problem.starterCode[newLang] || problem.starterCode.java);
  };

  const handleResetCode = () => {
    setCode(problem.starterCode[language] || problem.starterCode.java);
    setExecutionResult(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = executeCodeSimulation({
        problemId: problem.id,
        language,
        code,
        customInput: useCustomInput ? customInput : null
      });
      setExecutionResult(result);
      setIsRunning(false);
    }, 450);
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const result = executeCodeSimulation({
        problemId: problem.id,
        language,
        code,
        customInput: null
      });
      setExecutionResult(result);
      setIsSubmitting(false);

      if (result.success) {
        setShowCelebration(true);
        const updatedProfile = recordSubmission({
          problemId: problem.id,
          problemTitle: problem.title,
          topic: problem.topic,
          difficulty: problem.difficulty,
          passed: true,
          code,
          language: language === 'java' ? 'Java' : language === 'python' ? 'Python' : 'C++',
          executionResult: result
        });
        setProfile(updatedProfile);
        setNextProblems(getRecommendedProblems(2));
      } else {
        recordSubmission({
          problemId: problem.id,
          problemTitle: problem.title,
          topic: problem.topic,
          difficulty: problem.difficulty,
          passed: false,
          code,
          language: language === 'java' ? 'Java' : language === 'python' ? 'Python' : 'C++',
          executionResult: result
        });
      }
    }, 600);
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fadeIn">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/dsa" className="btn-cyber text-xs py-1.5 px-3 flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to DSA Hub
          </Link>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <span className="text-white font-display font-semibold text-lg">{problem.title}</span>
          <span className={`px-2 py-0.5 rounded text-xs border font-mono ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tutor', { state: { initialPrompt: `Can you help me understand the optimal approach and debug my code for "${problem.title}" (${problem.difficulty})? Here is my current code:\n\n\`\`\`${language}\n${code}\n\`\`\`` } })}
            className="btn-cyber text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300"
          >
            <MessageSquare size={14} className="text-cyan-400" /> AI Tutor Help
          </button>
        </div>
      </div>

      {/* ── Celebration Toast for Accepted Submissions ── */}
      {showCelebration && (
        <div className="glass-card-strong p-4 bg-gradient-to-r from-emerald-950/50 via-cyan-950/40 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award size={22} />
            </div>
            <div>
              <div className="text-emerald-400 font-display font-bold text-base flex items-center gap-2">
                Accepted! +{problem.difficulty === 'Easy' ? 50 : problem.difficulty === 'Medium' ? 100 : 200} XP Earned
              </div>
              <div className="text-xs text-slate-300">
                Mastery in <span className="text-cyan-400 font-semibold">{problem.topicName}</span> increased!
              </div>
            </div>
          </div>
          {nextProblems[0] && (
            <button
              onClick={() => navigate(`/dsa/problem/${nextProblems[0].id}`)}
              className="btn-cyber-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap font-semibold"
            >
              Next Problem: {nextProblems[0].title} <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Main Workspace: Two-Pane Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[720px]">
        {/* ── Left Pane: Problem Description, Progressive Hints, Approaches ── */}
        <div className="lg:col-span-5 glass-card flex flex-col overflow-hidden">
          {/* Sub Navigation */}
          <div className="flex border-b border-white/10 bg-white/5 text-xs">
            {[
              { id: 'description', label: 'Problem' },
              { id: 'hints', label: 'AI Progressive Hints' },
              { id: 'approach', label: 'Optimal Approach' },
              { id: 'submissions', label: 'Submissions' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 font-display transition ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Left Pane Content Scroll Area */}
          <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
            {/* 1. Problem Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                    Pattern: {problem.patternName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                    Topic: {problem.topicName}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold">Examples:</div>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5 font-mono text-xs">
                      <div className="text-cyan-300 font-semibold">Example {i + 1}:</div>
                      <div><span className="text-slate-400">Input:</span> <span className="text-white">{ex.input}</span></div>
                      <div><span className="text-slate-400">Output:</span> <span className="text-emerald-400">{ex.output}</span></div>
                      {ex.explanation && (
                        <div><span className="text-slate-400">Explanation:</span> <span className="text-slate-300">{ex.explanation}</span></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold">Constraints:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Companies Tag */}
                {problem.companies && problem.companies.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-xs font-mono uppercase text-slate-400 mb-2">Frequently Asked At:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.companies.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. AI Progressive Hints Tab */}
            {activeTab === 'hints' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-display font-semibold text-sm">
                    <Sparkles size={16} /> 3-Tier Progressive AI Hints
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unlock hints sequentially to build intuition without spoiling the full solution. Start with high-level conceptual hints before diving into algorithm structure.
                  </p>
                </div>

                {problem.hints.map((hint, idx) => {
                  const isUnlocked = activeHintLevel > idx;
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isUnlocked 
                          ? 'bg-slate-900/90 border-cyan-500/40 text-slate-200' 
                          : 'bg-white/5 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-xs text-cyan-400 flex items-center gap-2">
                          <Lightbulb size={14} /> Tier {idx + 1} Hint
                        </span>
                        {!isUnlocked && (
                          <button
                            onClick={() => setActiveHintLevel(idx + 1)}
                            className="btn-cyber text-[11px] py-1 px-2.5"
                          >
                            Unlock Hint {idx + 1}
                          </button>
                        )}
                      </div>
                      {isUnlocked ? (
                        <p className="text-xs text-slate-200 mt-2.5 leading-relaxed font-mono">
                          {hint}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          Locked — Click Unlock to reveal algorithmic guidance.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Optimal Approach Tab */}
            {activeTab === 'approach' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="prose prose-invert max-w-none text-slate-200 text-xs whitespace-pre-line leading-relaxed font-mono">
                  {problem.approach}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="text-cyan-400 font-bold">COMPLEXITY ANALYSIS:</div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={14} className="text-amber-400" /> <span className="text-slate-400">Time Complexity:</span> {problem.timeComplexity}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Cpu size={14} className="text-purple-400" /> <span className="text-slate-400">Space Complexity:</span> {problem.spaceComplexity}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs font-mono uppercase text-slate-400 font-bold">Your Submissions:</div>
                {profile.submissionsHistory && profile.submissionsHistory.length > 0 ? (
                  profile.submissionsHistory.map(sub => (
                    <div key={sub.id} className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className={`font-semibold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </div>
                        <div className="text-slate-500 text-[10px]">{new Date(sub.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-right text-slate-400">
                        <div>{sub.runtime} · {sub.memory}</div>
                        <div className="text-[10px] text-cyan-400">{sub.language}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">No submissions recorded yet for this session.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Pane: Code Editor & Execution Console ── */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Editor Header Bar */}
          <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Language:</span>
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                className="cyber-input text-xs py-1 px-2.5 font-mono"
              >
                <option value="java">Java (Primary)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ 20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="btn-cyber text-xs py-1 px-2.5 flex items-center gap-1"
                title="Copy Code"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleResetCode}
                className="btn-cyber text-xs py-1 px-2.5 flex items-center gap-1 text-slate-300"
                title="Reset Starter Code"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* Integrated Code Area */}
          <div className="glass-card flex-1 flex flex-col overflow-hidden relative border border-cyan-500/20">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-80 lg:h-96 p-4 bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-none overflow-y-auto border-none focus:ring-0"
              placeholder="// Write your solution here..."
            />
          </div>

          {/* Test Case & Custom Input Selectors */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">Test Cases:</span>
                {problem.testCases.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTestCase(idx);
                      setUseCustomInput(false);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                      activeTestCase === idx && !useCustomInput
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Case {idx + 1} {tc.isHidden && '(Hidden)'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setUseCustomInput(!useCustomInput)}
                className={`text-xs font-mono transition ${useCustomInput ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                + Custom Input
              </button>
            </div>

            {useCustomInput ? (
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Enter custom input..."
                className="cyber-input w-full h-16 font-mono text-xs"
              />
            ) : (
              <div className="p-2.5 rounded bg-slate-950 border border-white/5 font-mono text-xs text-slate-300">
                <div className="text-slate-500 text-[10px]">INPUT:</div>
                <div>{problem.testCases[activeTestCase]?.input}</div>
              </div>
            )}
          </div>

          {/* Execution Output Console */}
          {executionResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-fadeIn ${
              executionResult.success 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {executionResult.success ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  {executionResult.success ? 'Execution Accepted' : executionResult.error}
                </span>
                <span className="text-slate-400 font-normal">
                  {executionResult.timeMs}ms · {executionResult.memoryMb}MB
                </span>
              </div>
              <pre className="text-slate-200 text-xs whitespace-pre-wrap">{executionResult.output}</pre>
            </div>
          )}

          {/* Action Execution Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="btn-cyber text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Play size={14} className={isRunning ? 'animate-spin' : ''} />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="btn-cyber-primary text-xs py-2.5 px-6 flex items-center gap-2 font-bold shadow-lg shadow-cyan-900/30"
            >
              <CheckCircle2 size={14} className={isSubmitting ? 'animate-spin' : ''} />
              {isSubmitting ? 'Submitting...' : 'Submit Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
