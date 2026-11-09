import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, RefreshCcw, Timer } from 'lucide-react';
import { useFlaskData } from '../hooks/useFlaskData';
import { apiFetch } from '../utils/api';

const getTimerForDifficulty = (difficulty) => {
  const diff = (difficulty || 'beginner').toLowerCase();
  if (diff === 'beginner' || diff === 'easy') return 30;
  if (diff === 'intermediate' || diff === 'medium') return 45;
  if (diff === 'advanced' || diff === 'hard') return 60;
  return 30;
};

const difficultyConfig = {
  beginner: { label: 'Beginner', color: '#4ade80', pct: 30, timerLabel: '30s timer' },
  intermediate: { label: 'Intermediate', color: '#fbbf24', pct: 60, timerLabel: '45s timer' },
  advanced: { label: 'Advanced', color: '#f87171', pct: 90, timerLabel: '60s timer' },
};

export default function QuizPage() {
  const navigate = useNavigate();
  const { quizItems: rawQuizItems, savePartial, refresh } = useFlaskData();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  // Cap quiz questions to maximum 10 questions
  const quizItems = React.useMemo(() => {
    return (rawQuizItems || []).slice(0, 10);
  }, [rawQuizItems]);

  const total = quizItems?.length || 0;

  const loadQuiz = async (forceNew = false) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/quiz${forceNew ? '?refresh=1' : ''}`);
      const sliced = (data.quizItems || []).slice(0, 10);
      savePartial({ quizItems: sliced });
      setAnswers({});
      setCurrentQ(0);
    } catch (err) {
      setError(err.message || 'Unable to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quizItems?.length) loadQuiz(false);
  }, []);

  // Initialize and reset timer whenever active question changes
  useEffect(() => {
    if (!quizItems?.length) return;
    const currentItem = quizItems[currentQ];
    const initialTime = getTimerForDifficulty(currentItem?.difficulty);
    setTimeLeft(initialTime);
  }, [currentQ, quizItems]);

  // Countdown timer interval & auto next on expiration
  useEffect(() => {
    if (!quizItems?.length || submitted || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQ, quizItems, submitted, loading]);

  const handleTimeExpired = () => {
    const item = quizItems?.[currentQ];
    if (item) {
      const qKey = `${item.topic}_${item.index}`;
      // Auto-record unanswered question when time runs out
      setAnswers((prev) => {
        if (!prev[qKey]) {
          return { ...prev, [qKey]: 'Time Expired' };
        }
        return prev;
      });
    }

    // Auto-advance to next question if available
    if (currentQ < total - 1) {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const progress = total ? (Object.keys(answers).length / total) * 100 : 0;
  const item = quizItems?.[currentQ];
  const answeredAll = total > 0 && Object.keys(answers).length === total;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!answeredAll) return;
    setSubmitted(true);
    setError('');
    try {
      const data = await apiFetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      savePartial(data);
      await refresh();
      navigate('/dashboard');
    } catch (err) {
      setSubmitted(false);
      setError(err.message || 'Quiz submission failed.');
    }
  };

  if (loading && !total) {
    return <div className="px-6 py-8 max-w-2xl mx-auto text-slate-300">Loading quiz...</div>;
  }

  if (!total) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center space-y-4">
          <div className="text-white text-lg font-display">No quiz generated yet</div>
          <div className="text-slate-500 text-sm">Start with your syllabus first.</div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="button" onClick={() => navigate('/start')} className="btn-cyber-solid">Go to Start</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto text-center">
        <div className="glass-card p-10">
          <div className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Quiz Submitted!</h2>
          <p className="text-slate-400 mb-6">Opening your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const currentDiffKey = (item?.difficulty || 'beginner').toLowerCase();
  const diff = difficultyConfig[currentDiffKey] || difficultyConfig.beginner;
  const maxTimeForCurrent = getTimerForDifficulty(item?.difficulty);
  const timerPct = Math.max((timeLeft / maxTimeForCurrent) * 100, 0);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-mono mb-3">
            STEP 3 OF 4 · KNOWLEDGE ASSESSMENT (MAX 10 QUESTIONS)
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Adaptive Knowledge Quiz</h1>
          <p className="text-slate-400 text-sm mt-1">
            Questions are generated from your selected syllabus with timed difficulty limits (Beginner: 30s · Medium: 45s · Hard: 60s).
          </p>
        </div>
        <button type="button" onClick={() => loadQuiz(true)} className="btn-cyber flex items-center gap-2 text-xs">
          <RefreshCcw size={14} /> New Quiz
        </button>
      </div>

      {/* Overall Progress & Quiz Stats Bar */}
      <div className="glass-card p-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-cyan-400 font-mono font-medium">
              {Object.keys(answers).length}/{total} Answered
            </span>
          </div>
          <div className="difficulty-track">
            <div className="difficulty-fill bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="text-center">
          <div className="font-display font-bold text-white text-2xl">{currentQ + 1}</div>
          <div className="text-slate-500 text-xs">of {total}</div>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-mono bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          <Timer size={14} />
          <span>Timed Quiz</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {quizItems.map((q, idx) => {
          const qKey = `${q.topic}_${q.index}`;
          const qDiff = difficultyConfig[(q.difficulty || 'beginner').toLowerCase()] || difficultyConfig.beginner;
          const isCurrent = idx === currentQ;

          return (
            <div key={qKey} style={{ display: isCurrent ? 'block' : 'none' }}>
              <div className="glass-card p-6 mb-4 space-y-5">
                {/* Question Metadata Header & Live Countdown Badge */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
                  <span className="px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-semibold font-mono uppercase tracking-wider">
                    {q.topic}
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Difficulty Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Difficulty:</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 difficulty-track">
                          <div className="difficulty-fill" style={{ width: `${qDiff.pct}%`, background: qDiff.color }} />
                        </div>
                        <span className="text-xs font-semibold font-mono" style={{ color: qDiff.color }}>
                          {qDiff.label} ({getTimerForDifficulty(q.difficulty)}s)
                        </span>
                      </div>
                    </div>

                    {/* Live Question Timer Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
                        timeLeft <= 10
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      <Clock size={13} className={timeLeft <= 10 ? 'animate-bounce' : ''} />
                      <span>{timeLeft}s</span>
                      <span className="text-[10px] text-slate-400 font-normal">left</span>
                    </div>
                  </div>
                </div>

                {/* Per-Question Live Timer Bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                    }`}
                    style={{ width: `${timerPct}%` }}
                  />
                </div>

                {/* Question Text */}
                <div className="flex gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold text-cyan-300">
                    {idx + 1}
                  </div>
                  <h2 className="font-display font-semibold text-white text-lg leading-snug">{q.q}</h2>
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qKey] === opt;
                    return (
                      <div key={oi} className={`quiz-option ${isSelected ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name={qKey}
                          value={opt}
                          id={`${qKey}_${oi}`}
                          checked={isSelected}
                          onChange={() => setAnswers((a) => ({ ...a, [qKey]: opt }))}
                        />
                        <label htmlFor={`${qKey}_${oi}`}>
                          <div className="radio-dot">{isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400" />}</div>
                          <span className="font-mono text-xs text-slate-500 mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}

        {/* Navigation & Submission Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn-cyber flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-1.5 overflow-x-auto max-w-[200px] py-1">
            {quizItems.map((q, i) => {
              const qk = `${q.topic}_${q.index}`;
              const isAns = answers[qk];
              const isTimedOut = answers[qk] === 'Time Expired';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQ(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentQ
                      ? 'w-6 bg-cyan-400'
                      : isTimedOut
                      ? 'w-2 bg-rose-500'
                      : isAns
                      ? 'w-2 bg-emerald-400/80'
                      : 'w-2 bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          {currentQ < total - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQ((q) => q + 1)}
              className="btn-cyber flex items-center gap-2 text-xs"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!answeredAll}
              className={`btn-cyber-solid flex items-center gap-2 text-xs ${!answeredAll ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Brain size={15} /> Submit Quiz
            </button>
          )}
        </div>

        {!answeredAll && currentQ === total - 1 && (
          <div className="mt-4 flex items-center gap-2 text-yellow-400 text-xs justify-center glass-card p-3 border-yellow-400/30">
            <AlertCircle size={14} />
            <span>
              {total - Object.keys(answers).length} question(s) unanswered or awaiting timer. You can complete all or click individual dots to review.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
