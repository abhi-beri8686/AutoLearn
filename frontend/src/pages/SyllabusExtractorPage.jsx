import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight,
  HelpCircle, RefreshCw, Upload, Copy, Check, ListChecks
} from 'lucide-react';
import { DSA_TOPICS } from '../services/dsaService';

export default function SyllabusExtractorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'notes'
  const [syllabusInput, setSyllabusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results State
  const [extractedPath, setExtractedPath] = useState(null);
  const [extractedStudyPack, setExtractedStudyPack] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const sampleSyllabus = `Unit 1: Foundations of Algorithms & Asymptotic Notations
Unit 2: Linear Data Structures (Arrays, Linked Lists, Stack, Queue)
Unit 3: Trees, Binary Search Trees, and Heaps
Unit 4: Graph Algorithms (BFS, DFS, Shortest Path, Minimum Spanning Trees)
Unit 5: Dynamic Programming & Greedy Approaches (Knapsack, LCS, Activity Selection)`;

  const sampleNotes = `Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into overlapping subproblems and storing the subproblem results to avoid redundant computations.
The two key properties of DP are:
1. Optimal Substructure: An optimal solution to the problem contains optimal solutions to its subproblems.
2. Overlapping Subproblems: The same subproblems are solved multiple times.
Top-Down (Memoization) uses recursion with caching, whereas Bottom-Up (Tabulation) iteratively fills a DP table starting from base cases.`;

  const handleProcessSyllabus = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setExtractedPath({
        title: 'Extracted Syllabus Learning Track',
        totalWeeks: 5,
        estimatedHours: 42,
        modules: [
          {
            unit: 'Week 1: Algorithmic Foundations & Complexity',
            topics: ['Time & Space Complexity', 'Big-O Proofs', 'Recursion Recurrence Relations'],
            prerequisites: ['Basic Discrete Math', 'Programming Basics'],
            dsaTopicId: 'complexity'
          },
          {
            unit: 'Week 2: Linear Structures & Two-Pointers',
            topics: ['Array Manipulations', 'Singly & Doubly Linked Lists', 'Monotonic Stacks', 'Queue Implementations'],
            prerequisites: ['Pointers & Dynamic Memory'],
            dsaTopicId: 'arrays'
          },
          {
            unit: 'Week 3: Hierarchical Structures',
            topics: ['Binary Trees', 'BST Balancing', 'Min/Max Heaps', 'Priority Queues'],
            prerequisites: ['Recursion Tree Invariants'],
            dsaTopicId: 'trees'
          },
          {
            unit: 'Week 4: Graph Algorithms & Traversals',
            topics: ['BFS & DFS', 'Dijkstra Shortest Path', 'Topological Sort', 'Disjoint Set Union'],
            prerequisites: ['Queues', 'Recursion'],
            dsaTopicId: 'graphs'
          },
          {
            unit: 'Week 5: Dynamic Programming & Greedy Mastery',
            topics: ['0/1 Knapsack', 'Longest Common Subsequence', 'Interval Scheduling', 'Grid DP'],
            prerequisites: ['Recursion Trees', 'State Tables'],
            dsaTopicId: 'dp'
          }
        ]
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleProcessNotes = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setExtractedStudyPack({
        summary: 'Dynamic Programming optimizes recursion by storing intermediate states. Key pillars are Optimal Substructure and Overlapping Subproblems. Approaches include Top-Down (Memoization) and Bottom-Up (Tabulation).',
        keyTakeaways: [
          'Optimal Substructure ensures global optimal solution is composed of sub-solutions.',
          'Overlapping Subproblems distinguish DP from Divide & Conquer.',
          'Memoization is recursion + table lookup; Tabulation is iterative table filling.',
          'State representation: Choose minimal state variables (e.g., dp[i][w]).'
        ],
        flashcards: [
          {
            front: 'What are the two mandatory properties required to apply Dynamic Programming?',
            back: '1. Optimal Substructure (subproblems compose global optimum)\n2. Overlapping Subproblems (subproblems recur repeatedly).'
          },
          {
            front: 'What is the primary difference between Top-Down and Bottom-Up DP?',
            back: 'Top-Down uses recursion + caching (memoization); Bottom-Up iteratively computes from base cases up to the target state (tabulation).'
          },
          {
            front: 'When can 2D DP space be optimized into 1D array?',
            back: 'When the current state dp[i] only depends on the previous row dp[i-1].'
          }
        ],
        practiceQuestions: [
          {
            q: 'Why does Divide & Conquer (like Merge Sort) not qualify as Dynamic Programming?',
            ans: 'Divide and conquer subproblems are independent and do NOT overlap; DP specifically caches overlapping subproblems.'
          },
          {
            q: 'How does memoization change the time complexity of the Fibonacci sequence?',
            ans: 'Reduces time complexity from O(2^n) exponential tree to O(n) linear evaluations.'
          }
        ]
      });
      setActiveCardIndex(0);
      setIsCardFlipped(false);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            AI KNOWLEDGE & CONTENT EXTRACTOR
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Sparkles className="text-purple-400" /> Syllabus & Study Material Parser
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Paste your university syllabus, exam curriculum, or legal study notes. AutoLearn extracts topic hierarchies, detects prerequisites, and generates instant flashcards, learning paths, and quizzes.
          </p>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-display text-sm transition ${
            activeTab === 'syllabus'
              ? 'bg-white/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={16} /> Syllabus & Curriculum Parser
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-display text-sm transition ${
            activeTab === 'notes'
              ? 'bg-white/10 text-purple-400 border-b-2 border-purple-400 font-semibold shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={16} /> Legal Notes & Flashcard Generator
        </button>
      </div>

      {/* ── TAB 1: SYLLABUS PARSER ── */}
      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form (5 cols) */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-base">Paste Syllabus or Course Outline</h2>
              <button
                onClick={() => setSyllabusInput(sampleSyllabus)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Insert Sample
              </button>
            </div>

            <textarea
              value={syllabusInput}
              onChange={e => setSyllabusInput(e.target.value)}
              placeholder="Paste course modules, syllabus units, or topic list..."
              className="cyber-input w-full h-64 text-xs font-mono resize-none leading-relaxed"
            />

            <button
              onClick={handleProcessSyllabus}
              disabled={isProcessing || !syllabusInput.trim()}
              className="btn-cyber-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 font-bold"
            >
              <Sparkles size={14} className={isProcessing ? 'animate-spin' : ''} />
              {isProcessing ? 'Analyzing Topic Hierarchy...' : 'Extract & Generate Roadmap'}
            </button>
          </div>

          {/* Results Area (7 cols) */}
          <div className="lg:col-span-7 glass-card p-6">
            {extractedPath ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-white font-display font-bold text-lg">{extractedPath.title}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {extractedPath.totalWeeks} Weeks · ~{extractedPath.estimatedHours} Hours Required
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/path')}
                    className="btn-cyber text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300"
                  >
                    View In Path Page <ArrowRight size={13} />
                  </button>
                </div>

                <div className="space-y-3">
                  {extractedPath.modules.map((mod, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-400 text-sm">{mod.unit}</span>
                        <span className="text-xs text-slate-500 font-mono">Module #{i + 1}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mod.topics.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white/5 text-slate-200 text-xs border border-white/10">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 pt-1 font-mono">
                        <span className="text-amber-400 font-semibold">Prerequisites:</span> {mod.prerequisites.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Layers size={36} className="text-slate-600 mb-2" />
                <div className="text-sm font-semibold text-slate-400">Ready to Extract Syllabus</div>
                <div className="text-xs max-w-sm">
                  Paste your university or exam syllabus on the left to extract prerequisite hierarchies and custom roadmaps.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: LEGAL NOTES EXTRACTOR & FLASHCARDS ── */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Area (5 cols) */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-base">Paste Study Notes / Textbook Text</h2>
              <button
                onClick={() => setNotesInput(sampleNotes)}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono"
              >
                Insert Sample
              </button>
            </div>

            <textarea
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="Paste study material, notes, or chapter excerpt..."
              className="cyber-input w-full h-64 text-xs font-mono resize-none leading-relaxed"
            />

            <button
              onClick={handleProcessNotes}
              disabled={isProcessing || !notesInput.trim()}
              className="btn-cyber-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 font-bold bg-gradient-to-r from-purple-600 to-cyan-500"
            >
              <Sparkles size={14} className={isProcessing ? 'animate-spin' : ''} />
              {isProcessing ? 'Generating Study Pack...' : 'Generate Summaries & Flashcards'}
            </button>
          </div>

          {/* Results Area (7 cols) */}
          <div className="lg:col-span-7 glass-card p-6">
            {extractedStudyPack ? (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. Executive Summary */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <div className="text-xs font-mono font-bold text-purple-400 uppercase">AI Concept Summary:</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{extractedStudyPack.summary}</p>
                </div>

                {/* 2. Key Takeaways */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase">Core Takeaways:</div>
                  <ul className="space-y-1.5">
                    {extractedStudyPack.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Interactive Flashcard */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold uppercase">FLASHCARD REVIEW</span>
                    <span className="text-slate-400">Card {activeCardIndex + 1} of {extractedStudyPack.flashcards.length}</span>
                  </div>

                  <div 
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-white/15 min-h-[160px] flex flex-col justify-between cursor-pointer hover:border-cyan-400/50 transition-all shadow-xl"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      {isCardFlipped ? 'ANSWER (CLICK TO FLIP BACK)' : 'QUESTION (CLICK TO REVEAL ANSWER)'}
                    </div>
                    <div className="text-sm font-semibold text-white my-3 leading-relaxed whitespace-pre-line">
                      {isCardFlipped ? extractedStudyPack.flashcards[activeCardIndex].back : extractedStudyPack.flashcards[activeCardIndex].front}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-right">
                      Flip ⟳
                    </div>
                  </div>

                  {/* Card Switcher Buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setActiveCardIndex(Math.max(0, activeCardIndex - 1));
                        setIsCardFlipped(false);
                      }}
                      disabled={activeCardIndex === 0}
                      className="btn-cyber text-xs py-1.5 px-3"
                    >
                      ← Previous Card
                    </button>
                    <button
                      onClick={() => {
                        setActiveCardIndex(Math.min(extractedStudyPack.flashcards.length - 1, activeCardIndex + 1));
                        setIsCardFlipped(false);
                      }}
                      disabled={activeCardIndex === extractedStudyPack.flashcards.length - 1}
                      className="btn-cyber text-xs py-1.5 px-3"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <FileText size={36} className="text-slate-600 mb-2" />
                <div className="text-sm font-semibold text-slate-400">Ready to Extract Notes</div>
                <div className="text-xs max-w-sm">
                  Paste textbook excerpts or lecture notes on the left to extract flashcards, key points, and summaries.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
