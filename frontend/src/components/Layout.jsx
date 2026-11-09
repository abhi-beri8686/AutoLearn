import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Brain, Search, Bell, RotateCcw, LogIn, UserPlus, LogOut, User, Database, Shield } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/notifications')
      .then(data => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  const runSearch = async (e) => {
    e?.preventDefault?.();
    if (!search.trim()) {
      setResults([]);
      setShowSearch(true);
      return;
    }

    try {
      const data = await apiFetch(`/api/search?q=${encodeURIComponent(search)}`);
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setShowSearch(true);
  };

  const resetAll = async () => {
    try {
      await apiFetch('/api/reset', { method: 'POST' });
    } catch (e) {
      console.log('Resetting');
    }
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 font-display font-bold text-lg">
            <Brain className="text-cyan-400" size={22} />
            <span>AutoLearn</span>
          </Link>

          {isAuthenticated && user && (
            <nav className="hidden lg:flex items-center gap-4 text-sm">
              <NavLink to="/goals">Goals</NavLink>
              <NavLink to="/start">Start</NavLink>
              <NavLink to="/quiz">Quiz</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/path">Path</NavLink>
              <NavLink to="/resources">Resources</NavLink>
              <NavLink to="/tutor">Tutor</NavLink>
              <NavLink to="/interview" className={({isActive}) => isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'}>
                Interview
              </NavLink>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2.5">
            {isAuthenticated && user && (
              <>
                {/* Search Bar */}
                <form onSubmit={runSearch} className="hidden md:flex items-center gap-2">
                  <input
                    className="cyber-input"
                    style={{ minWidth: 180 }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search resources"
                  />
                  <button className="btn-cyber" type="submit"><Search size={14} /></button>
                </form>

                <button className="btn-cyber" onClick={() => setShowNotifications(s => !s)} title="Notifications">
                  <Bell size={14} />
                </button>
                
                <button className="btn-cyber" onClick={resetAll} title="Reset Platform State">
                  <RotateCcw size={14} />
                </button>
              </>
            )}

            {/* User Profile / Auth Area */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/20 px-2.5 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-black font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white truncate max-w-[110px] leading-tight">
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400 capitalize leading-tight">
                      {user.goal || 'Student'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition text-xs flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1.5"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="btn-cyber-solid px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-500/30"
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="glass-card p-4 space-y-2">
            <div className="font-display font-semibold text-white text-sm">Notifications</div>
            {notifications.length ? notifications.map((n, i) => (
              <div key={i} className="text-slate-300 text-sm">
                <span className="text-cyan-400 font-medium">{n.title}:</span> {n.message}
              </div>
            )) : <div className="text-slate-500 text-sm">No notifications yet.</div>}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="glass-card p-4 space-y-3">
            <div className="font-display font-semibold text-white text-sm">Search Results</div>
            {results.length ? results.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="text-cyan-400 text-xs uppercase">{r.kind} · {r.topic}</div>
                <div className="text-white text-sm">{r.title}</div>
                <div className="text-slate-500 text-xs">{r.provider}</div>
              </a>
            )) : <div className="text-slate-500 text-sm">No results found.</div>}
          </div>
        </div>
      )}

      <main><Outlet /></main>
    </div>
  );
}
