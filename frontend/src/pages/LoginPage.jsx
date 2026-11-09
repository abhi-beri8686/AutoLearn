import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Shield, Database, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const from = location.state?.from?.pathname || '/goals';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login({ email, password });
    setIsSubmitting(false);

    if (res.success) {
      navigate(from === '/dashboard' ? '/goals' : from, { replace: true });
    } else {
      setLocalError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickDemo = () => {
    setEmail('student@aieducation.io');
    setPassword('aieducation2026');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20 mb-2">
            <Brain size={30} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Welcome Back to <span className="neon-text-blue">AutoLearn</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to access your adaptive ML learning paths, quizzes & interviews.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card-strong p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-slate-950/80">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

          {/* Error Alert */}
          {(localError || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="cyber-input cyber-input-icon-left w-full py-2.5 text-sm bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400/70">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="cyber-input cyber-input-icons-both w-full py-2.5 text-sm bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cyber-solid w-full py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles size={13} /> Auto-fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Footer Link to Signup */}
        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Create AIEDUCATION Account
          </Link>
        </p>
      </div>
    </div>
  );
}
