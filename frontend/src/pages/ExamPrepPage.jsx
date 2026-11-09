import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Clock, Award, CheckCircle2, ArrowRight, ShieldCheck,
  AlertCircle, BarChart3, Target, Calendar, Sparkles, Building2
} from 'lucide-react';

export default function ExamPrepPage() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState('placements'); // 'placements' | 'university' | 'faang' | 'cert'

  const EXAM_GOALS = [
    {
      id: 'placements',
      title: 'Campus Placements 2026',
      subtitle: 'Target: Product Companies & High-Growth Startups',
      icon: Building2,
      durationDays: 45,
      mockDuration: '45 Mins (Diagnostic Assessment)',
      topics: ['Python & ML Core', 'Linear Regression & Classifiers', 'Data Preprocessing', 'Model Evaluation']
    },
    {
      id: 'faang',
      title: 'AI & Data Science Engineering Interview',
      subtitle: 'Target: Google, Meta, Amazon, Microsoft, Uber',
      icon: Award,
      durationDays: 60,
      mockDuration: '60 Mins (Deep Dive Technical)',
      topics: ['Deep Learning & Neural Nets', 'NLP & Computer Vision', 'Ensemble Models', 'Feature Pipelines']
    },
    {
      id: 'university',
      title: 'University Semester / Midterm Exams',
      subtitle: 'Target: Academic Excellence & Theory Foundations',
      icon: GraduationCap,
      durationDays: 30,
      mockDuration: '30 Mins (Theory & Practical Quiz)',
      topics: ['Supervised vs Unsupervised', 'Mathematical Formulations', 'Confusion Matrix & ROC', 'Clustering Metrics']
    },
    {
      id: 'cert',
      title: 'Cloud & ML Engineering Certification',
      subtitle: 'Target: System Scalability & Production Pipelines',
      icon: ShieldCheck,
      durationDays: 40,
      mockDuration: '45 Mins (Practical Assessment)',
      topics: ['MLOps Lifecycle', 'Hyperparameter Tuning', 'Data Drift & Monitoring', 'API Deployment']
    }
  ];

  const activeExam = EXAM_GOALS.find(g => g.id === selectedGoal) || EXAM_GOALS[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            EXAM PREPARATION & MOCK ASSESSMENTS
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <GraduationCap className="text-cyan-400" /> Exam & Placement Acceleration Mode
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Select your specific target exam or placement timeline to generate a targeted diagnostic assessment, timed full-length mock tests, and high-yield revision schedules.
          </p>
        </div>
      </div>

      {/* ── Goal Selector Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXAM_GOALS.map(goal => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.id;
          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={`glass-card p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                isSelected 
                  ? 'border-cyan-400 bg-white/[0.09] shadow-cyan-900/30' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="font-display font-bold text-white text-base">{goal.title}</h3>
                <p className="text-slate-400 text-xs mt-1">{goal.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{goal.durationDays} Days Sprint</span>
                <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                  {isSelected ? 'Selected ✓' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Selected Exam Track Overview & Timed Mock Suite ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Track Details & High-Yield Syllabus (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Active Sprint Track</span>
              <h2 className="text-2xl font-display font-bold text-white mt-0.5">{activeExam.title}</h2>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>Target Duration: {activeExam.durationDays} Days</div>
              <div className="text-cyan-300">Mock: {activeExam.mockDuration}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">High-Yield Topic Priority:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeExam.topics.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-white">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sprints Timeline */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">Sprint Milestones:</div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300">Phase 1 (Days 1–15): Foundations & Core Algorithms</span>
                <span className="text-emerald-400 font-mono font-semibold">100% In Progress</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300">Phase 2 (Days 16–30): High-Frequency Applied Concepts & Models</span>
                <span className="text-amber-400 font-mono font-semibold">Upcoming</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300">Phase 3 (Days 31–45): Full-Length Timed Diagnostics & Performance Review</span>
                <span className="text-slate-500 font-mono">Final Sprint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timed Mock Test Arena Launcher (5 cols) */}
        <div className="lg:col-span-5 glass-card-strong p-6 flex flex-col justify-between space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 border border-cyan-500/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Clock size={15} /> TIMED MOCK ASSESSMENT
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono">
                {activeExam.mockDuration}
              </span>
            </div>

            <h3 className="text-xl font-display font-bold text-white">Diagnostic Knowledge Assessment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assesses your technical mastery across required topics. Dynamically analyzes accuracy, highlights knowledge gaps, and provides recommendations upon completion.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="text-slate-400 uppercase font-bold text-[10px]">Included Topics:</div>
              {activeExam.topics.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-200">
                  <span>Module {idx + 1}: {t}</span>
                  <span className="text-cyan-400">Diagnostic</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/quiz')}
            className="btn-cyber-primary text-xs py-3 px-4 w-full flex items-center justify-center gap-2 font-bold shadow-xl shadow-cyan-900/40"
          >
            <Clock size={16} /> Start Diagnostic Assessment <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
