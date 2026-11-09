// AutoLearn AI - Adaptive Learning & Mastery Engine
// Provides continuous closed-loop adaptive analytics, mistake pattern detection,
// spaced-repetition scheduling (SM-2 algorithm), and personalized study planning.

const STORAGE_KEY = 'autolearn_learner_profile_v2';

const DEFAULT_PROFILE = {
  user_id: 'default_student',
  name: 'Alex Developer',
  goal: 'Machine Learning & AI Engineering',
  currentLevel: 'Intermediate',
  targetDate: '2026-11-30',
  dailyHours: 2,
  xp: 1450,
  level: 4,
  levelTitle: 'Adaptive Scholar',
  streak: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  accuracyRate: 82.4,
  topicMastery: {
    python: 95,
    math: 88,
    eda: 90,
    regression: 82,
    classification: 78,
    clustering: 72,
    neural_networks: 60,
    nlp: 48,
    deep_learning: 64,
    rag: 58,
    cv: 52,
    reinforcement: 38,
    llm: 29
  },
  mistakePatterns: [
    {
      id: 'mistake-overfitting',
      topic: 'Machine Learning',
      pattern: 'Model Evaluation',
      issue: 'Overfitting on High-Variance Training Data',
      frequency: 4,
      severity: 'High',
      recommendation: 'Apply L1/L2 regularization or use K-Fold cross-validation.'
    },
    {
      id: 'mistake-gradient-exploding',
      topic: 'Deep Learning',
      pattern: 'Backpropagation',
      issue: 'Gradient Explosion in Deep Layers',
      frequency: 3,
      severity: 'Medium',
      recommendation: 'Use gradient clipping and normalized weight initialization (He/Xavier).'
    },
    {
      id: 'mistake-clustering-metrics',
      topic: 'Unsupervised Learning',
      pattern: 'Clustering',
      issue: 'Inappropriate distance metric selection for high dimensions',
      frequency: 2,
      severity: 'Low',
      recommendation: 'Use cosine similarity or dimensionality reduction (PCA/t-SNE) before clustering.'
    }
  ],
  badges: [
    { id: 'first_quiz', title: 'First Diagnostic Passed', icon: 'CheckCircle', unlocked: true, date: '2026-09-10' },
    { id: 'ml_ace', title: 'Machine Learning Ace', icon: 'Layers', unlocked: true, date: '2026-09-12' },
    { id: 'streak_5', title: '5-Day Streak Master', icon: 'Flame', unlocked: true, date: '2026-09-16' },
    { id: 'deep_learning_scholar', title: 'Deep Learning Scholar', icon: 'Cpu', unlocked: false, requirement: 'Achieve 75%+ in Neural Networks' }
  ],
  spacedRepetitionCards: [
    {
      id: 'card-1',
      topic: 'neural_networks',
      concept: 'Vanishing Gradient Solution',
      question: 'Why does the ReLU activation function mitigate the vanishing gradient problem compared to Sigmoid?',
      answer: 'ReLU has a constant derivative of 1 for all positive inputs (f\'(x) = 1), preventing gradient shrinkage during deep backpropagation.',
      intervalDays: 1,
      repetitions: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString().split('T')[0],
      isDueToday: true
    },
    {
      id: 'card-2',
      topic: 'classification',
      concept: 'Precision vs Recall Tradeoff',
      question: 'In medical diagnosis of rare diseases, should you optimize for Precision or Recall?',
      answer: 'Recall (Sensitivity), because missing a positive disease diagnosis (False Negative) is significantly more dangerous than investigating a False Positive.',
      intervalDays: 2,
      repetitions: 3,
      easeFactor: 2.4,
      nextReviewDate: new Date().toISOString().split('T')[0],
      isDueToday: true
    },
    {
      id: 'card-3',
      topic: 'regression',
      concept: 'L1 (Lasso) vs L2 (Ridge) Regularization',
      question: 'Why does L1 regularization create sparse models with zeroed-out feature weights while L2 only shrinks them?',
      answer: 'L1 adds the absolute sum penalty (|w|), creating diamond-shaped geometric constraints with corners on axes where weights become exactly zero.',
      intervalDays: 5,
      repetitions: 4,
      easeFactor: 2.6,
      nextReviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      isDueToday: false
    }
  ]
};

// Load learner profile from storage
export function getLearnerProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

// Save updated learner profile
export function saveLearnerProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Could not save learner profile', err);
  }
}

// Generate Time-Aware Daily Study Plan
export function generateDailyStudyPlan(durationOption = '1hr') {
  const profile = getLearnerProfile();
  const weakTopics = Object.entries(profile.topicMastery)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);

  if (durationOption === '30min') {
    return {
      duration: '30 Minutes Power Sprint',
      totalMinutes: 30,
      agenda: [
        { type: 'concept', title: `Fast Recap: ${weakTopics[0]?.[0]?.toUpperCase() || 'NEURAL NETS'} Fundamentals`, minutes: 10, icon: 'BookOpen' },
        { type: 'quiz', title: '5-Question Rapid Diagnostic Check', minutes: 12, icon: 'HelpCircle' },
        { type: 'review', title: 'Spaced Repetition Flashcard Review', minutes: 8, icon: 'RotateCw' }
      ]
    };
  }

  if (durationOption === '2hr') {
    return {
      duration: '2 Hours Deep Mastery Session',
      totalMinutes: 120,
      agenda: [
        { type: 'concept', title: `Deep Dive: Advanced Optimization in ${weakTopics[0]?.[0]?.toUpperCase() || 'DEEP LEARNING'}`, minutes: 35, icon: 'BookOpen' },
        { type: 'quiz', title: 'Comprehensive Diagnostic Assessment', minutes: 40, icon: 'HelpCircle' },
        { type: 'review', title: 'Spaced Repetition Review: 3 Due Cards', minutes: 25, icon: 'RotateCw' },
        { type: 'analysis', title: 'Mistake Diagnostics with AI Tutor', minutes: 20, icon: 'Search' }
      ]
    };
  }

  if (durationOption === '3hr') {
    return {
      duration: '3+ Hours Intensive Preparation Sprint',
      totalMinutes: 180,
      agenda: [
        { type: 'mock', title: 'Full Timed Mock Assessment', minutes: 75, icon: 'Clock' },
        { type: 'analysis', title: 'AI Concept Review & Diagnostics', minutes: 35, icon: 'Search' },
        { type: 'concept', title: `Remedial Deep Dive: ${weakTopics[1]?.[0]?.toUpperCase() || 'CLASSIFICATION'} Formulations`, minutes: 45, icon: 'BookOpen' },
        { type: 'review', title: 'Knowledge Graph Prerequisite Flashcards', minutes: 25, icon: 'RotateCw' }
      ]
    };
  }

  // Default: 1 hour
  return {
    duration: '1 Hour Balanced Session',
    totalMinutes: 60,
    agenda: [
      { type: 'concept', title: `Concept Polish: ${weakTopics[0]?.[0]?.toUpperCase() || 'REGRESSION'} Core Mechanics`, minutes: 18, icon: 'BookOpen' },
      { type: 'quiz', title: 'Adaptive 5-Question Checkpoint', minutes: 25, icon: 'HelpCircle' },
      { type: 'review', title: 'Flashcards & Spaced Retention Drill', minutes: 17, icon: 'RotateCw' }
    ]
  };
}
