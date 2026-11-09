import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Cpu, Network, MessageSquare, Eye, Server, BarChart2, ArrowRight, Check } from 'lucide-react';

const GOALS = [
  {
    id: 'placement',
    icon: Briefcase,
    title: 'ML for Placement',
    subtitle: 'Industry Ready',
    desc: 'Master the core ML concepts most asked in technical interviews. Focus on algorithms, optimization, and real-world problem solving for top tech companies.',
    topics: ['Python', 'Statistics', 'Linear Regression', 'Logistic Regression', 'SVM', 'Decision Trees', 'Random Forest', 'XGBoost', 'Feature Engineering', 'System Design'],
    duration: '3–4 months',
    difficulty: 'Intermediate',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-400/30',
    glow: '0 0 40px rgba(0, 212, 255, 0.15)',
    badge: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  },
  {
    id: 'project',
    icon: Cpu,
    title: 'AI for Project',
    subtitle: 'Build Real Apps',
    desc: 'Build production-ready AI applications. Learn end-to-end pipelines, model deployment, API integration, and wrapping ML into full-stack software products.',
    topics: ['Python', 'Data Preprocessing', 'EDA', 'Model Building', 'Flask/FastAPI', 'Docker', 'Cloud Deployment', 'MLflow', 'CI/CD', 'Monitoring'],
    duration: '2–3 months',
    difficulty: 'Beginner–Intermediate',
    color: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-400/30',
    glow: '0 0 40px rgba(168, 85, 247, 0.15)',
    badge: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  },
  {
    id: 'deeplearning',
    icon: Network,
    title: 'Deep Learning',
    subtitle: 'Neural Networks',
    desc: 'Dive deep into neural networks, backpropagation, CNNs, RNNs, Transformers, and generative models. Ideal for AI research, computer vision, and advanced AI systems.',
    topics: ['NumPy', 'PyTorch/TensorFlow', 'Neural Networks', 'CNN', 'RNN/LSTM', 'Attention Mechanism', 'Transformers', 'GANs', 'Model Optimization'],
    duration: '4–6 months',
    difficulty: 'Advanced',
    color: 'green',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-400/30',
    glow: '0 0 40px rgba(52, 211, 153, 0.15)',
    badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  },
  {
    id: 'nlp_llm',
    icon: MessageSquare,
    title: 'NLP & Gen AI',
    subtitle: 'LLMs & Text AI',
    desc: 'Master Natural Language Processing, text tokenization, BERT, Transformers, Fine-Tuning LLMs, Retrieval-Augmented Generation (RAG), and Prompt Engineering.',
    topics: ['Tokenization', 'TF-IDF', 'Word Embeddings', 'BERT', 'Transformers', 'Fine-Tuning', 'LangChain', 'RAG Pipelines', 'Prompt Engineering'],
    duration: '3–4 months',
    difficulty: 'Intermediate–Advanced',
    color: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-400/30',
    glow: '0 0 40px rgba(245, 158, 11, 0.15)',
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  },
  {
    id: 'cv_vision',
    icon: Eye,
    title: 'Computer Vision',
    subtitle: 'Visual Perception',
    desc: 'Master image processing, object detection, image segmentation, OpenCV, Convolutional Architectures, YOLO models, and Vision Transformers (ViT).',
    topics: ['OpenCV', 'Image Processing', 'CNN Architecture', 'YOLO', 'Object Detection', 'Segmentation', 'Vision Transformers', 'Diffusion Models'],
    duration: '3–5 months',
    difficulty: 'Intermediate–Advanced',
    color: 'rose',
    gradient: 'from-rose-500/20 to-red-500/10',
    border: 'border-rose-400/30',
    glow: '0 0 40px rgba(244, 63, 94, 0.15)',
    badge: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  },
  {
    id: 'mlops',
    icon: Server,
    title: 'MLOps & AI Systems',
    subtitle: 'Production & Infra',
    desc: 'Learn to deploy, monitor, scale, and maintain machine learning pipelines in production environments with Docker, Kubernetes, MLflow, and CI/CD.',
    topics: ['Docker', 'Kubernetes', 'MLflow', 'Feature Stores', 'CI/CD Pipelines', 'Model Monitoring', 'FastAPI', 'Cloud Deployment'],
    duration: '2–4 months',
    difficulty: 'Intermediate–Advanced',
    color: 'indigo',
    gradient: 'from-indigo-500/20 to-blue-600/10',
    border: 'border-indigo-400/30',
    glow: '0 0 40px rgba(99, 102, 241, 0.15)',
    badge: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  },
  {
    id: 'datascience',
    icon: BarChart2,
    title: 'Data Science & EDA',
    subtitle: 'Data & Analytics',
    desc: 'Master exploratory data analysis, statistical modeling, Pandas data manipulation, SQL queries, data visualization, and data-driven business insights.',
    topics: ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Visualization', 'Exploratory Data Analysis', 'Hypothesis Testing', 'Scikit-Learn'],
    duration: '2–3 months',
    difficulty: 'Beginner–Intermediate',
    color: 'teal',
    gradient: 'from-teal-500/20 to-emerald-500/10',
    border: 'border-teal-400/30',
    glow: '0 0 40px rgba(20, 184, 166, 0.15)',
    badge: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
  },
];

const difficultyColor = {
  Beginner: 'text-green-400',
  'Beginner–Intermediate': 'text-emerald-400',
  Intermediate: 'text-yellow-400',
  'Intermediate–Advanced': 'text-orange-400',
  Advanced: 'text-rose-400',
};

export default function GoalSelectionPage() {
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem('autolearn_selected_goal') || 'placement';
  });
  const navigate = useNavigate();

  const handleSelectGoal = (goalId) => {
    setSelected(goalId);
    localStorage.setItem('autolearn_selected_goal', goalId);
  };

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem('autolearn_selected_goal', selected);
      navigate('/start', { state: { goal: selected } });
    }
  };


  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono tracking-wider uppercase">
          STEP 1 OF 4 · AI/ML GOAL SELECTION
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white">
          What's your <span className="neon-text-blue">AI/ML learning goal?</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Choose a specialized AI/ML track that matches your target objective. Your study path, recommended resources, and adaptive quizzes will be tailored accordingly.
        </p>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selected === goal.id;
          return (
            <div
              key={goal.id}
              onClick={() => handleSelectGoal(goal.id)}
              className={`goal-card cursor-pointer relative overflow-hidden transition-all duration-300 p-6 rounded-2xl border ${
                isSelected ? 'selected border-cyan-400 scale-[1.02]' : 'border-white/10 hover:border-cyan-500/40'
              }`}
              style={{ boxShadow: isSelected ? goal.glow : undefined }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} opacity-50 pointer-events-none`} />

              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                  <Check size={16} className="text-slate-950 font-bold" strokeWidth={3} />
                </div>
              )}

              <div className="relative space-y-4">
                {/* Header Icon & Subtitle Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${goal.badge}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`badge-chip ${goal.badge} border text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg`}>
                    {goal.subtitle}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-2">{goal.title}</h2>
                  <p className="text-slate-400 text-xs leading-relaxed min-h-[48px] line-clamp-3">{goal.desc}</p>
                </div>

                {/* Duration & Difficulty Metadata */}
                <div className="flex items-center gap-4 py-3 border-y border-white/10 text-xs">
                  <div>
                    <div className="text-slate-500 font-mono text-[11px]">Duration</div>
                    <div className="text-slate-200 font-semibold mt-0.5">{goal.duration}</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <div className="text-slate-500 font-mono text-[11px]">Difficulty</div>
                    <div className={`font-semibold mt-0.5 ${difficultyColor[goal.difficulty] || 'text-slate-300'}`}>
                      {goal.difficulty}
                    </div>
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Topics Covered</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Click topic to interview</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {goal.topics.slice(0, 6).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            localStorage.setItem('autolearn_selected_goal', goal.id);
                          } catch {}
                          navigate(`/interview?goal=${goal.id}&topic=${encodeURIComponent(t)}`);
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 text-[11px] font-mono transition cursor-pointer"
                        title={`Start AI Interview on ${t}`}
                      >
                        {t}
                      </button>
                    ))}
                    {goal.topics.length > 6 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-400 text-[11px] font-mono font-semibold">
                        +{goal.topics.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="glass-card px-6 py-4 flex items-center justify-between flex-wrap gap-4 border border-cyan-500/20">
        <div>
          {selected ? (
            <div>
              <div className="text-white font-display font-semibold text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                {GOALS.find((g) => g.id === selected)?.title} Track Selected
              </div>
              <div className="text-slate-400 text-xs">Ready to map your customized AI/ML learning plan & dynamic interview</div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs font-mono">Select an AI/ML goal track above to proceed</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selected && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('autolearn_selected_goal', selected);
                } catch {}
                navigate(`/interview?goal=${selected}`);
              }}
              className="btn-cyber px-4 py-2.5 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-2"
            >
              Start AI Interview <ArrowRight size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className={`btn-cyber-solid px-6 py-2.5 text-xs font-bold flex items-center gap-2 transition-all ${
              !selected ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            Continue to Step 2 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
