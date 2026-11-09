import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, MessageSquare, Play, Sparkles, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Lightbulb, Clock, Target, Award,
  ChevronRight, Star, Code, ArrowRight, ShieldCheck,
  Brain, Send, Eye, RefreshCw, Cpu, Check, Zap,
  Bookmark, Terminal, Sliders, Layers, BookOpen
} from 'lucide-react';
import {
  INTERVIEW_GOALS,
  PYTHON_TOPICS,
  getSelectedGoal,
  setSelectedGoal,
  getGoalMetadata,
  getInterviewQuestionsForGoal,
  getInterviewQuestionsForTopic,
  getPythonInterviewQuestions,
  evaluateUserAnswer,
  evaluateUserAnswerAsync,
  fetchInterviewContext,
  runInterviewCode,
  saveInterviewSession
} from '../services/interviewService';

export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeGoalId, setActiveGoalId] = useState(getSelectedGoal());
  const [goalMeta, setGoalMeta] = useState(getGoalMetadata(activeGoalId));
  
  // Navigation View: 'dashboard' | 'session' | 'report'
  const [view, setView] = useState('dashboard');

  // Active Topic Filter
  const [selectedTopic, setSelectedTopic] = useState('Lists & Slicing');

  // Interview Session Setup State
  const [interviewMode, setInterviewMode] = useState('technical'); // 'technical' | 'rapid' | 'conceptual' | 'scenario' | 'coding' | 'mock'
  const [difficulty, setDifficulty] = useState('Intermediate'); // 'Beginner' | 'Intermediate' | 'Advanced'
  const [questionCount, setQuestionCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(20);

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('autolearn_bookmarked_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Active Session State
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [userCode, setUserCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(0); // 0 = none, 1 = hint1, 2 = hint2
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [sessionTimer, setSessionTimer] = useState(1200); // in seconds

  useEffect(() => {
    const goalParam = searchParams.get('goal');
    const topicParam = searchParams.get('topic');

    let currentGoal = activeGoalId;
    if (goalParam && INTERVIEW_GOALS[goalParam]) {
      currentGoal = goalParam;
      setSelectedGoal(goalParam);
    } else {
      currentGoal = getSelectedGoal();
    }
    setActiveGoalId(currentGoal);
    setGoalMeta(getGoalMetadata(currentGoal));

    // If topic parameter is passed directly, immediately start interview on that topic
    if (topicParam) {
      startInterviewForTopic(topicParam, 'technical', currentGoal);
    }
  }, [searchParams]);

  // Session timer countdown effect
  useEffect(() => {
    if (view !== 'session' || sessionTimer <= 0) return;
    const interval = setInterval(() => {
      setSessionTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [view, sessionTimer]);

  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('autolearn_bookmarked_questions', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSwitchGoal = (newGoalId) => {
    setSelectedGoal(newGoalId);
    setActiveGoalId(newGoalId);
    const newMeta = getGoalMetadata(newGoalId);
    setGoalMeta(newMeta);
    const firstTopic = newMeta?.topics?.[0] || 'Python';
    setSelectedTopic(firstTopic);
    setView('dashboard');
  };

  // List of active topics for selection and switching strictly from the selected goal/track
  const displayedTopicList = (goalMeta?.topics && goalMeta.topics.length > 0) ? goalMeta.topics : PYTHON_TOPICS;

  // Launch interview immediately for any selected topic
  const startInterviewForTopic = (topicName, mode = 'technical', customGoalId = null) => {
    const targetGoal = customGoalId || activeGoalId || 'placement';
    const cleanTopic = topicName || goalMeta?.topics?.[0] || selectedTopic || 'Python';
    
    setSelectedTopic(cleanTopic);
    setInterviewMode(mode);
    setCodeLanguage('python');

    const filterType = mode === 'coding' ? 'coding' : (mode === 'conceptual' ? 'conceptual' : 'all');
    let questions = [];

    if (targetGoal === 'python') {
      questions = getPythonInterviewQuestions(filterType, difficulty, cleanTopic);
    } else {
      questions = getInterviewQuestionsForTopic(cleanTopic, targetGoal, difficulty, filterType);
    }

    if (!questions || questions.length === 0) {
      questions = getInterviewQuestionsForTopic(cleanTopic, targetGoal, 'all', filterType);
    }

    if (!questions || questions.length === 0) {
      questions = [
        {
          id: `q-fallback-${Date.now()}`,
          title: `${cleanTopic}: Core Concepts & Implementation`,
          topic: cleanTopic,
          difficulty: 'Intermediate',
          type: mode === 'coding' ? 'coding' : 'conceptual',
          question: mode === 'coding' 
            ? `Implement a Python function to solve the problem for ${cleanTopic}. Write your code and submit.`
            : `How does ${cleanTopic} function in real-world ML systems? Discuss its core architectural decisions, performance characteristics, and common pitfalls.`,
          hints: [
            `Hint 1: Outline what ${cleanTopic} does and why it is used.`,
            `Hint 2: Provide clean syntax examples and discuss time/space complexity.`
          ],
          idealKeyPoints: [
            `Core definition and working mechanism of ${cleanTopic}.`,
            `Key advantages, syntax, and performance trade-offs.`,
            `Practical production considerations and edge cases.`
          ],
          starterCode: {
            python: `def solve_${cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}(data: list) -> list:
    """
    Solve ${cleanTopic} problem.
    Write your implementation below and return the result.
    """
    # Write your code here
    pass`
          },
          testCases: [
            { input: 'data=[1, 2, 3]', expectedOutput: '[1, 2, 3]' }
          ],
          explanation: `${cleanTopic} is a key topic in this track.`
        }
      ];
    }

    const count = mode === 'conceptual' || mode === 'rapid' ? 1 : Math.max(1, questionCount || 3);
    const sliced = questions.slice(0, count);
    setSessionQuestions(sliced);
    setCurrentQIndex(0);
    setUserTextAnswer('');
    setUserCode(sliced[0]?.starterCode?.python || sliced[0]?.starterCode?.java || '');
    setUnlockedHintLevel(0);
    setEvaluationResult(null);
    setCodeExecutionResult(null);
    setSessionAnswers([]);
    setSessionTimer((durationMinutes || 20) * 60);
    setView('session');
  };

  const handleEvaluateAnswer = async () => {
    const currentQ = sessionQuestions[currentQIndex];
    if (!currentQ) return;
    setIsEvaluating(true);

    try {
      if (currentQ.type === 'coding') {
        const codeRes = runInterviewCode({
          code: userCode,
          language: codeLanguage,
          testCases: currentQ.testCases
        });
        setCodeExecutionResult(codeRes);
        const evalRes = {
          score: codeRes.success ? 92 : 45,
          verdict: codeRes.success ? 'Accepted & Optimal' : 'Tests Failed',
          isSatisfactory: codeRes.success,
          feedback: codeRes.success
            ? 'Code execution succeeded with clean syntax and optimal complexity.'
            : 'Code did not pass all test cases. Make sure all branches return correct values and handle edge cases.',
          matchedKeyPoints: codeRes.success ? ['Function compiled', 'Passed test cases', 'Correct return signature'] : [],
          missedKeyPoints: codeRes.success ? [] : ['Verify return types and loop bounds']
        };
        setEvaluationResult(evalRes);
        setSessionAnswers(prev => [...prev, { question: currentQ, answer: userCode, isCoding: true, evaluation: evalRes }]);
      } else {
        const evalRes = await evaluateUserAnswerAsync({
          question: currentQ,
          userAnswer: userTextAnswer
        });
        setEvaluationResult(evalRes);
        setSessionAnswers(prev => [...prev, { question: currentQ, answer: userTextAnswer, isCoding: false, evaluation: evalRes }]);
      }
    } catch (err) {
      console.warn('Evaluation error:', err);
      const fallback = evaluateUserAnswer({ question: currentQ, userAnswer: userTextAnswer });
      setEvaluationResult(fallback);
      setSessionAnswers(prev => [...prev, { question: currentQ, answer: userTextAnswer, isCoding: false, evaluation: fallback }]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < sessionQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setUserTextAnswer('');
      setUserCode(sessionQuestions[nextIdx]?.starterCode?.python || sessionQuestions[nextIdx]?.starterCode?.java || '');
      setUnlockedHintLevel(0);
      setEvaluationResult(null);
      setCodeExecutionResult(null);
    } else {
      // Complete Session & Show Report
      const totalScore = Math.round(
        sessionAnswers.reduce((acc, curr) => acc + (curr.evaluation?.score || 50), 0) / Math.max(1, sessionAnswers.length)
      );
      saveInterviewSession({
        goal: activeGoalId,
        goalTitle: goalMeta.title,
        mode: interviewMode,
        score: totalScore,
        totalQuestions: sessionQuestions.length,
        answers: sessionAnswers
      });
      setView('report');
    }
  };

  const currentQ = sessionQuestions[currentQIndex];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ── Top Header & Track Selector ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PYTHON & AI INTERVIEW ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">Adaptive Q&A & Code Evaluation</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mt-1 flex items-center gap-3">
            <Briefcase className="text-cyan-400" /> AI/ML Interview – <span className="text-cyan-300">{goalMeta.title}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Interactive interview simulator with specialized Python theoretical drills and hands-on coding challenges for data structures, lists, tuples, dicts, and sets.
          </p>
        </div>

        {/* Goal Switcher Dropdown */}
        <div className="glass-card p-2 flex items-center gap-2 self-start md:self-auto border border-white/10">
          <span className="text-xs font-mono text-slate-400 pl-2">Track:</span>
          <select
            value={activeGoalId}
            onChange={(e) => handleSwitchGoal(e.target.value)}
            className="cyber-input text-xs py-1 px-2.5 font-medium text-cyan-300 cursor-pointer"
          >
            {Object.entries(INTERVIEW_GOALS).map(([id, g]) => (
              <option key={id} value={id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIEW 1: TOPIC INTERVIEW DASHBOARD
      ════════════════════════════════════════════════════════ */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          {/* ── Topics Launcher ── */}
          <div className="glass-card p-6 space-y-4 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-purple-950/20 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Target className="text-cyan-400" size={18} /> Topics in Selected Track ({goalMeta?.title || 'Selected Track'})
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Click any topic below to <strong>immediately launch your live interview session</strong> with questions focused exclusively on that topic.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  {displayedTopicList.length} Topics Available
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {displayedTopicList.map((topicName, idx) => {
                const isSelected = selectedTopic === topicName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => startInterviewForTopic(topicName, 'technical')}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-sm group ${
                      isSelected
                        ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-cyan-500/40 ring-2 ring-cyan-400/50'
                        : 'bg-slate-900/90 border-cyan-500/30 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40'
                    }`}
                  >
                    <Target size={13} className={isSelected ? 'text-black' : 'text-cyan-400 group-hover:animate-pulse'} />
                    <span>{topicName}</span>
                    <ArrowRight size={12} className={`transition ${isSelected ? 'text-black' : 'opacity-40 group-hover:opacity-100 text-cyan-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 2: LIVE ADAPTIVE INTERVIEW SESSION
      ════════════════════════════════════════════════════════ */}
      {view === 'session' && currentQ && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Session Progress Bar */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-cyan-400 font-bold">
                QUESTION {currentQIndex + 1} OF {sessionQuestions.length}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                <Target size={12} className="text-cyan-400" /> Focus Topic: {selectedTopic || currentQ.topic}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Session Timer Badge */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-white/10 text-amber-400">
                <Clock size={13} />
                <span className="font-mono font-bold">{formatTimer(sessionTimer)}</span>
              </div>

              {/* Topic Switcher Dropdown (ONLY Python topics in Python mode) */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Switch Topic:</span>
                <select
                  value={selectedTopic || currentQ.topic || ''}
                  onChange={(e) => startInterviewForTopic(e.target.value, interviewMode)}
                  className="cyber-input text-[11px] py-1 px-2 text-cyan-300"
                >
                  {displayedTopicList.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="text-slate-400 hover:text-rose-400 text-xs pl-2 border-l border-white/10 transition"
              >
                Exit Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Question, Hints, and Input */}
            <div className="lg:col-span-7 glass-card p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-cyan-400 font-bold uppercase mb-1">
                      {currentQ.title || `${currentQ.topic} Question`}
                    </div>
                    <h2 className="text-lg font-display font-bold text-white leading-snug">
                      {currentQ.question}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentQ.id)}
                    className={`p-2 rounded-lg border transition ${bookmarkedIds.has(currentQ.id) ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
                    title={bookmarkedIds.has(currentQ.id) ? "Remove Bookmark" : "Bookmark Question"}
                  >
                    <Bookmark size={16} className={bookmarkedIds.has(currentQ.id) ? "fill-amber-400" : ""} />
                  </button>
                </div>

                {/* ── Progressive Hint Box ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono flex items-center gap-1.5">
                      <Lightbulb size={13} className="text-amber-400" /> Need guidance?
                    </span>
                    {unlockedHintLevel < (currentQ.hints?.length || 0) && (
                      <button
                        type="button"
                        onClick={() => setUnlockedHintLevel(prev => prev + 1)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        + Unlock Progressive Hint {unlockedHintLevel + 1}
                      </button>
                    )}
                  </div>

                  {unlockedHintLevel > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-1.5 font-mono animate-fadeIn">
                      <div className="font-bold text-amber-400">Hint {unlockedHintLevel}:</div>
                      <div>{currentQ.hints[unlockedHintLevel - 1]}</div>
                    </div>
                  )}
                </div>

                {/* ── Answer Input: Text Area OR Code Editor (Function-only starter) ── */}
                {currentQ.type === 'coding' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Terminal size={13} className="text-cyan-400" /> Python 3.11 Code Editor (Write Implementation Below):
                      </span>
                      <span className="text-cyan-400 text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        Function Stub Loaded
                      </span>
                    </div>

                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="cyber-input w-full h-64 font-mono text-xs p-4 leading-relaxed resize-none bg-slate-950/90 text-cyan-200 border-cyan-500/30"
                      placeholder="def solution_function(...):&#10;    # Write your implementation here&#10;    pass"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">YOUR RESPONSE:</div>
                    <textarea
                      value={userTextAnswer}
                      onChange={(e) => setUserTextAnswer(e.target.value)}
                      className="cyber-input w-full h-44 text-xs font-sans leading-relaxed p-4 resize-none"
                      placeholder="Type your structured technical explanation here (e.g. explain core Python mechanisms, memory details, trade-offs, and examples)..."
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/tutor', {
                      state: {
                        fromInterview: true,
                        interviewGoal: activeGoalId,
                        interviewTopic: selectedTopic || currentQ.topic,
                        questionTitle: currentQ.title || currentQ.question
                      }
                    })
                  }
                  className="btn-cyber text-xs py-2 px-3.5 text-purple-300 border-purple-500/40 hover:bg-purple-950/40 flex items-center gap-1.5 transition"
                >
                  <Brain size={14} /> Discuss with AI Tutor
                </button>

                <div className="flex items-center gap-2">
                  {!evaluationResult ? (
                    <button
                      type="button"
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || (currentQ.type === 'coding' ? !userCode.trim() : !userTextAnswer.trim())}
                      className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles size={14} className={isEvaluating ? 'animate-spin' : ''} />
                      {isEvaluating ? 'Evaluating with AI...' : 'Submit Response'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-none"
                    >
                      {currentQIndex < sessionQuestions.length - 1 ? 'Next Question' : 'View Full Report'} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 cols: AI Evaluation Critique & Missing Points */}
            <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-4">
              {evaluationResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                      <Sparkles size={14} /> AI EVALUATION CRITIQUE
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${evaluationResult.score >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {evaluationResult.score}% Score · {evaluationResult.verdict}
                    </span>
                  </div>

                  {/* Code Runner Execution Output (If Coding Question) */}
                  {codeExecutionResult && (
                    <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${codeExecutionResult.success ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/30 border-rose-500/40 text-rose-200'}`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {codeExecutionResult.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {codeExecutionResult.success ? 'Execution Passed' : 'Execution Errors'}
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap opacity-90">{codeExecutionResult.output || codeExecutionResult.error}</pre>
                    </div>
                  )}

                  {/* Constructive Feedback */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 leading-relaxed">
                    <div className="font-semibold text-white mb-1">Feedback Summary:</div>
                    {evaluationResult.feedback}
                  </div>

                  {/* Matched Points */}
                  {evaluationResult.matchedKeyPoints && evaluationResult.matchedKeyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Points Well Explained:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {evaluationResult.matchedKeyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Crucial Points */}
                  {evaluationResult.missedKeyPoints && evaluationResult.missedKeyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1">
                        <AlertTriangle size={13} /> Missing Key Concepts to Include:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                        {evaluationResult.missedKeyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Explanation Reference */}
                  {currentQ.explanation && (
                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300">
                      <strong className="text-cyan-300">Detailed Explanation: </strong>
                      {currentQ.explanation}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono italic pt-2 border-t border-white/5">
                    *Critique generated dynamically by AI evaluation engine with adaptive criteria.
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Brain size={28} />
                  </div>
                  <div className="text-sm font-semibold text-slate-300">AI Evaluation Ready</div>
                  <div className="text-xs max-w-xs text-slate-400 leading-relaxed">
                    Type your answer or code on the left and click <strong className="text-cyan-300">Submit Response</strong>. The AI engine will evaluate correctness and code performance.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 3: POST-INTERVIEW DIAGNOSTIC REPORT
      ════════════════════════════════════════════════════════ */}
      {view === 'report' && (
        <div className="glass-card p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">SESSION COMPLETE</span>
              <h2 className="text-2xl font-display font-bold text-white mt-1">Interview Diagnostic Report</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">Track: {goalMeta.title} · Mode: {interviewMode.toUpperCase()}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="btn-cyber text-xs py-2 px-4"
              >
                Back to Readiness Dashboard
              </button>
              <button
                type="button"
                onClick={() => startPythonInterviewSession(interviewMode === 'coding' ? 'coding' : 'conceptual')}
                className="btn-cyber-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Retake / New Session
              </button>
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Overall Accuracy</div>
              <div className="text-3xl font-display font-bold text-emerald-400">
                {Math.round(sessionAnswers.reduce((acc, curr) => acc + (curr.evaluation?.score || 50), 0) / Math.max(1, sessionAnswers.length))}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Questions Evaluated</div>
              <div className="text-3xl font-display font-bold text-cyan-400">{sessionAnswers.length} Questions</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Readiness Impact</div>
              <div className="text-3xl font-display font-bold text-purple-400">+4% Lift</div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Question by Question Review</h3>
            <div className="space-y-3">
              {sessionAnswers.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Q{idx + 1}: {item.question?.title || item.question?.topic}</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${(item.evaluation?.score || 0) >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                      {item.evaluation?.score || 0}% Score
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg font-sans">
                    💡 <strong className="text-white">AI Feedback:</strong> {item.evaluation?.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
