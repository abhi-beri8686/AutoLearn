import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, UserPlus, LogIn, Lock, Mail, User, Eye, EyeOff,
  Sparkles, CheckCircle2, Database, AlertCircle, ArrowRight,
  Target, Map, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup, authError, setAuthError } = useAuth();

  // Embedded Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (authMode === 'signup' && password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    let res;
    if (authMode === 'login') {
      res = await login({ email, password });
    } else {
      res = await signup({ name: name || email.split('@')[0], email, password, goal: 'placement' });
    }
    setIsSubmitting(false);

    if (res.success) {
      navigate('/goals');
    } else {
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemo = async () => {
    setEmail('student@aieducation.io');
    setPassword('aieducation2026');
    setIsSubmitting(true);
    const res = await login({ email: 'student@aieducation.io', password: 'aieducation2026' });
    setIsSubmitting(false);
    if (res.success) {
      navigate('/goals');
    } else {
      const reg = await signup({
        name: 'Alex Mercer',
        email: 'student@aieducation.io',
        password: 'aieducation2026',
        goal: 'placement'
      });
      if (reg.success) {
        navigate('/goals');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Top Badges */}
        <div className="flex items-center justify-center">
          <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
            <Sparkles size={13} className="text-cyan-400" />
            AUTOLEARN AI PLATFORM
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
            Master AI & Machine Learning with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Adaptive Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Sign in or create an account to start your personalized learning journey.
          </p>
        </div>

        {/* Auth Box / User Card Directly Below */}
        <div className="w-full max-w-md mx-auto text-left">
          {isAuthenticated && user ? (
            /* Authenticated Welcome Card */
            <div className="glass-card-strong p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-cyan-500/30">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">{user.name || 'Student'}</h3>
                    <div className="text-xs font-mono text-cyan-400">{user.email}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono capitalize">
                  {user.goal || 'Placement'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Account Status</span>
                  <span className="text-emerald-400 font-mono font-bold">Active & Synchronized</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Access Level</span>
                  <span className="text-cyan-300 font-mono">Full Platform Unlocked</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link to="/goals" className="btn-cyber-solid text-xs py-2.5 text-center flex items-center justify-center gap-1.5">
                  <Target size={14} /> Choose Goal
                </Link>
                <Link to="/quiz" className="btn-cyber text-xs py-2.5 text-center flex items-center justify-center gap-1.5">
                  <Brain size={14} /> Start Quiz
                </Link>
                <Link to="/path" className="btn-cyber text-xs py-2.5 text-center flex items-center justify-center gap-1.5">
                  <Map size={14} /> Learning Path
                </Link>
                <Link to="/interview" className="btn-cyber text-xs py-2.5 text-center flex items-center justify-center gap-1.5">
                  <Zap size={14} /> AI Interview
                </Link>
              </div>
            </div>
          ) : (
            /* Clean & Colorful Sign In / Sign Up Card */
            <div className="glass-card-strong p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/40 bg-slate-950/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/10 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLocalError(''); }}
                  className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setLocalError(''); }}
                  className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* Error Alert */}
              {(localError || authError) && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs animate-shake">
                  <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Name (Sign Up only) */}
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-300">Your Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="cyber-input cyber-input-icon-left w-full py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="cyber-input cyber-input-icon-left w-full py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? 'Create password (min 6 chars)' : 'Enter your password'}
                      className="cyber-input cyber-input-icons-both w-full py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 transition"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-cyber-solid w-full py-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 mt-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{authMode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign In & Open Project' : 'Create Account & Open Project'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Demo Login Button */}
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>⚡ 1-Click Instant Demo Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
