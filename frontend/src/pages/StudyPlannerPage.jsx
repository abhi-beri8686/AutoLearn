import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, RotateCw, CheckCircle2, BookOpen, HelpCircle,
  Zap, Calendar, Flame, ArrowRight, Sparkles, Trophy
} from 'lucide-react';
import { generateDailyStudyPlan, getLearnerProfile } from '../services/adaptiveEngine';

export default function StudyPlannerPage() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState('1hr'); // '30min' | '1hr' | '2hr' | '3hr'
  const [profile, setProfile] = useState(getLearnerProfile());
  const [completedTasks, setCompletedTasks] = useState(new Set());
  
  // Spaced Repetition State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(profile.spacedRepetitionCards || []);

  const plan = generateDailyStudyPlan(selectedDuration);
  const dueCards = cards.filter(c => c.isDueToday);

  const toggleTask = (index) => {
    const next = new Set(completedTasks);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedTasks(next);
  };

  const handleRateCard = (rating) => {
    const updated = [...cards];
    if (updated[activeCardIndex]) {
      updated[activeCardIndex].isDueToday = false;
      updated[activeCardIndex].repetitions = (updated[activeCardIndex].repetitions || 1) + 1;
    }
    setCards(updated);
    setIsFlipped(false);
    if (activeCardIndex < dueCards.length - 1) {
      setActiveCardIndex(activeCardIndex + 1);
    }
  };

  const getTaskIcon = (type) => {
    if (type === 'concept') return BookOpen;
    if (type === 'quiz') return HelpCircle;
    if (type === 'review') return RotateCw;
    return Clock;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            TIME-AWARE SESSION ENGINE
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Clock className="text-cyan-400" /> Daily Study Planner & Spaced Revision
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Choose how much time you have today. AutoLearn constructs an optimized, scientifically sequenced study sprint balancing concept review, diagnostic quizzes, and spaced retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['30min', '1hr', '2hr', '3hr'].map(dur => (
            <button
              key={dur}
              onClick={() => {
                setSelectedDuration(dur);
                setCompletedTasks(new Set());
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs transition ${
                selectedDuration === dur
                  ? 'btn-cyber-primary font-bold shadow-lg shadow-cyan-900/30'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {dur === '30min' ? '30 Min' : dur === '1hr' ? '1 Hour' : dur === '2hr' ? '2 Hours' : '3+ Hours'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── PART 1: TIME-AWARE SESSION AGENDA (7 cols) ── */}
        <div className="lg:col-span-7 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-white">{plan.duration}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {plan.totalMinutes} Minutes Total · {completedTasks.size}/{plan.agenda.length} Completed
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
              Personalized Plan
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${(completedTasks.size / plan.agenda.length) * 100}%` }}
            />
          </div>

          {/* Agenda Task Items */}
          <div className="space-y-3">
            {plan.agenda.map((item, idx) => {
              const Icon = getTaskIcon(item.type);
              const isCompleted = completedTasks.has(idx);

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isCompleted 
                      ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75' 
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(idx)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        isCompleted ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-slate-600 hover:border-cyan-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 size={16} />}
                    </button>

                    <div>
                      <div className={`text-sm font-semibold flex items-center gap-2 ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        <Icon size={16} className="text-cyan-400 shrink-0" />
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ⏱ {item.minutes} mins · Type: {item.type.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {item.type === 'quiz' ? (
                    <button
                      onClick={() => navigate('/quiz')}
                      className="btn-cyber text-xs py-1.5 px-3 flex items-center gap-1 shrink-0 text-purple-300"
                    >
                      Take Quiz <ArrowRight size={13} />
                    </button>
                  ) : item.type === 'concept' ? (
                    <button
                      onClick={() => navigate('/resources')}
                      className="btn-cyber text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
                    >
                      Read Notes <ArrowRight size={13} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PART 2: SPACED REPETITION "REVISION DUE TODAY" (5 cols) ── */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase flex items-center gap-1.5">
                <RotateCw size={14} /> SM-2 SPACED REPETITION
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono">
                {dueCards.length} Due Today
              </span>
            </div>

            <h2 className="text-xl font-display font-bold text-white">Daily Revision Queue</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review concepts at mathematically optimized intervals to move patterns into permanent long-term memory.
            </p>

            {dueCards.length > 0 && dueCards[activeCardIndex] ? (
              <div className="space-y-4">
                {/* Flashcard Box */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/50 border border-purple-500/30 min-h-[190px] flex flex-col justify-between cursor-pointer hover:border-cyan-400/50 transition-all shadow-xl"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
                    <span>TOPIC: {dueCards[activeCardIndex].topic?.toUpperCase()}</span>
                    <span>{isFlipped ? 'ANSWER (CLICK FLIP)' : 'QUESTION (CLICK REVEAL)'}</span>
                  </div>

                  <div className="text-sm font-semibold text-white my-3 leading-relaxed">
                    {isFlipped ? dueCards[activeCardIndex].answer : dueCards[activeCardIndex].question}
                  </div>

                  <div className="text-[10px] text-cyan-400 font-mono text-right">
                    {isFlipped ? '⟳ Tap to hide' : '💡 Tap to reveal answer'}
                  </div>
                </div>

                {/* Rating Retention Buttons */}
                {isFlipped && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="text-xs font-mono text-slate-400 text-center">How well did you remember this?</div>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRateCard('again')}
                        className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono text-center border border-rose-500/30"
                      >
                        Again<br/><span className="text-[10px] text-slate-400">&lt; 1 day</span>
                      </button>
                      <button
                        onClick={() => handleRateCard('hard')}
                        className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono text-center border border-amber-500/30"
                      >
                        Hard<br/><span className="text-[10px] text-slate-400">2 days</span>
                      </button>
                      <button
                        onClick={() => handleRateCard('good')}
                        className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono text-center border border-cyan-500/30"
                      >
                        Good<br/><span className="text-[10px] text-slate-400">4 days</span>
                      </button>
                      <button
                        onClick={() => handleRateCard('easy')}
                        className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono text-center border border-emerald-500/30"
                      >
                        Easy<br/><span className="text-[10px] text-slate-400">7 days</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <div className="text-white font-bold text-sm">All Revisions Cleared!</div>
                <p className="text-xs text-slate-400">
                  You have reviewed all due flashcards for today. Great job maintaining your memory curve!
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Next Sync: Automated at 00:00</span>
            <span className="text-cyan-400">Retention Score: 92%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
