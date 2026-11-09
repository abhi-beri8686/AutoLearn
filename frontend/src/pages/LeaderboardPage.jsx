import React, { useState } from 'react';
import {
  Trophy, Flame, Award, Star, CheckCircle2, Shield,
  TrendingUp, Users, Crown, Sparkles, Layers, Cpu, Share2
} from 'lucide-react';
import { getLearnerProfile } from '../services/adaptiveEngine';

export default function LeaderboardPage() {
  const profile = getLearnerProfile();
  const [leaderboardTab, setLeaderboardTab] = useState('global'); // 'global' | 'cohort'

  const LEADERBOARD_USERS = [
    { rank: 1, name: 'Siddharth Rao', level: 9, solved: 142, xp: 4850, streak: 28, badge: 'Grandmaster' },
    { rank: 2, name: 'Elena Rostova', level: 8, solved: 128, xp: 4200, streak: 19, badge: 'Architect' },
    { rank: 3, name: 'David Kim', level: 7, solved: 115, xp: 3900, streak: 14, badge: 'Specialist' },
    { rank: 4, name: `${profile.name} (You)`, level: profile.level, solved: profile.totalProblemsSolved, xp: profile.xp, streak: profile.streak, isUser: true, badge: profile.levelTitle },
    { rank: 5, name: 'Priya Sharma', level: 4, solved: 22, xp: 1380, streak: 4, badge: 'Adept' },
    { rank: 6, name: 'Marcus Chen', level: 4, solved: 20, xp: 1250, streak: 6, badge: 'Adept' },
    { rank: 7, name: 'Ananya Verma', level: 3, solved: 16, xp: 980, streak: 2, badge: 'Apprentice' },
  ];

  const BADGE_ICONS = {
    CheckCircle: CheckCircle2,
    Layers: Layers,
    Flame: Flame,
    Share2: Share2,
    Cpu: Cpu,
  };

  const nextLevelXp = profile.level * 400;
  const currentLevelBaseXp = (profile.level - 1) * 400;
  const progressInLevel = Math.min(100, Math.round(((profile.xp - currentLevelBaseXp) / 400) * 100));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            GAMIFICATION & ACHIEVEMENTS
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-2 flex items-center gap-3">
            <Trophy className="text-amber-400" /> Leaderboard, Levels & Badges
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Earn XP for running code, passing test cases, maintaining daily streaks, and conquering algorithmic patterns.
          </p>
        </div>
      </div>

      {/* ── XP & Level Progression Card ── */}
      <div className="glass-card p-6 bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-slate-900 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-display font-bold text-2xl shadow-lg shadow-amber-900/30">
            {profile.level}
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">CURRENT RANK TITLE</div>
            <div className="text-xl font-display font-bold text-white">{profile.levelTitle}</div>
            <div className="text-xs text-amber-400 font-mono mt-0.5">{profile.xp} Total XP Earned</div>
          </div>
        </div>

        {/* Level Bar */}
        <div className="flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Level {profile.level} Progress</span>
            <span className="text-cyan-400 font-bold">{progressInLevel}% ({profile.xp} / {nextLevelXp} XP)</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 h-full rounded-full" style={{ width: `${progressInLevel}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            {nextLevelXp - profile.xp} XP to Level {profile.level + 1}
          </div>
        </div>

        {/* Streak Box */}
        <div className="flex items-center justify-end gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center flex items-center gap-3">
            <Flame size={28} className="text-amber-400 animate-pulse" />
            <div className="text-left">
              <div className="text-2xl font-display font-bold text-white">{profile.streak} Days</div>
              <div className="text-[11px] text-slate-400 font-mono">Active Solving Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Badges & Milestones (5 cols) ── */}
        <div className="lg:col-span-5 glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Award className="text-cyan-400" size={18} /> Badges & Achievements
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {profile.badges.filter(b => b.unlocked).length}/{profile.badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {profile.badges.map(badge => {
              const Icon = BADGE_ICONS[badge.icon] || Star;
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                    badge.unlocked
                      ? 'bg-slate-900 border-cyan-500/40 text-white'
                      : 'bg-white/[0.02] border-white/5 opacity-60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      badge.unlocked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{badge.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {badge.unlocked ? `Unlocked on ${badge.date}` : badge.requirement}
                      </div>
                    </div>
                  </div>

                  {badge.unlocked ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 uppercase">Locked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Leaderboard Table (7 cols) ── */}
        <div className="lg:col-span-7 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Users className="text-purple-400" size={18} /> Top Learners & Algorithmists
            </h2>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg text-xs font-mono">
              <button
                onClick={() => setLeaderboardTab('global')}
                className={`px-2.5 py-1 rounded ${leaderboardTab === 'global' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
              >
                Global
              </button>
              <button
                onClick={() => setLeaderboardTab('cohort')}
                className={`px-2.5 py-1 rounded ${leaderboardTab === 'cohort' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
              >
                2026 Batch
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Learner</th>
                  <th className="py-2.5 px-3">Level / Title</th>
                  <th className="py-2.5 px-3">Solved</th>
                  <th className="py-2.5 px-3">Streak</th>
                  <th className="py-2.5 px-3 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {LEADERBOARD_USERS.map(user => (
                  <tr
                    key={user.rank}
                    className={`hover:bg-white/[0.04] transition ${user.isUser ? 'bg-cyan-950/30 border-l-2 border-cyan-400 font-semibold' : ''}`}
                  >
                    <td className="py-3 px-3">
                      {user.rank === 1 ? (
                        <Crown size={15} className="text-amber-400 inline" />
                      ) : user.rank === 2 ? (
                        <span className="text-slate-300 font-bold">#2</span>
                      ) : user.rank === 3 ? (
                        <span className="text-amber-600 font-bold">#3</span>
                      ) : (
                        `#${user.rank}`
                      )}
                    </td>
                    <td className="py-3 px-3 text-white">
                      {user.name}
                    </td>
                    <td className="py-3 px-3 text-cyan-300">
                      Lvl {user.level} · {user.badge}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{user.solved}</td>
                    <td className="py-3 px-3 text-amber-400 flex items-center gap-1">
                      <Flame size={12} /> {user.streak}d
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {user.xp} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
