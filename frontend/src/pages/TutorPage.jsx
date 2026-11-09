import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Brain, Database, BookOpen, Video,
  Sparkles, Trash2, Volume2, Mic, ArrowLeft, Briefcase, ArrowRight,
  Key, Settings, Check, ExternalLink, ShieldCheck, X
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useVoiceTutor } from '../hooks/useVoiceTutor';
import { MicButton, VoicePlaybackControls, VoiceSettingsToolbar } from '../components/VoiceTutorControls';
import MarkdownMessage from '../components/MarkdownMessage';

const starters = [
  'Explain about generative AI and how it works',
  'What is RAG (Retrieval-Augmented Generation)?',
  'Explain Transformers and the Self-Attention mechanism',
  'Compare Classification vs Clustering',
  'What is Agentic AI and how do AI Agents work?',
  'Explain Neural Networks and Backpropagation with formulas',
];

export default function TutorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activeApiKey, setActiveApiKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [keySaveMsg, setKeySaveMsg] = useState('');
  const chatEndRef = useRef(null);

  const isFromInterview = Boolean(location.state?.fromInterview);
  const interviewContext = location.state || {};

  const {
    sttSupported,
    ttsSupported,
    voiceState,
    micStatus,
    error,
    autoSpeak,
    speakingMessageId,
    speakingRate,
    availableVoices,
    selectedVoiceIndex,
    startListening,
    stopListening,
    speakAnswer,
    stopSpeaking,
    setAutoSpeak,
    setSpeakingRate,
    setSelectedVoiceIndex,
    clearError,
  } = useVoiceTutor();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveApiKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) return;
    localStorage.setItem('user_gemini_key', key);
    setActiveApiKey(key);
    try {
      await apiFetch('/api/tutor/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      setKeySaveMsg('API Key saved successfully!');
      setTimeout(() => {
        setKeySaveMsg('');
        setShowKeyModal(false);
      }, 1200);
    } catch {
      setKeySaveMsg('Key saved locally in browser.');
      setTimeout(() => {
        setKeySaveMsg('');
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const handleClearApiKey = async () => {
    localStorage.removeItem('user_gemini_key');
    setActiveApiKey('');
    setApiKeyInput('');
    try {
      await apiFetch('/api/tutor/key', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setKeySaveMsg('API Key cleared. Using built-in AI Engine.');
    setTimeout(() => {
      setKeySaveMsg('');
      setShowKeyModal(false);
    }, 1200);
  };

  const handleBackToInterview = () => {
    if (interviewContext.interviewGoal || interviewContext.interviewTopic) {
      const params = new URLSearchParams();
      if (interviewContext.interviewGoal) params.set('goal', interviewContext.interviewGoal);
      if (interviewContext.interviewTopic) params.set('topic', interviewContext.interviewTopic);
      navigate(`/interview?${params.toString()}`);
    } else {
      navigate('/interview');
    }
  };

  const handleStartVoiceInput = () => {
    startListening((transcribedText) => {
      setQuestion(transcribedText);
    });
  };

  const ask = async (text, isVoiceInput = false) => {
    if (!text.trim() || loading) return;
    
    if (voiceState === 'listening') {
      stopListening();
    }

    const prompt = text.trim();
    setMessages(prev => [...prev, { role: 'user', text: prompt, askedByVoice: isVoiceInput }]);
    setQuestion('');
    setLoading(true);

    try {
      const historyContext = messages.map(m => ({ role: m.role, text: m.text }));
      const data = await apiFetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          history: historyContext,
          apiKey: activeApiKey || undefined,
        }),
      });

      setMeta({
        mode: data.mode,
        topic: data.topic,
        retrieved: data.retrieved || [],
        related: data.related_resources || {}
      });
      
      const answerText = data.answer || 'No answer generated.';
      const newAssistantMsgId = Date.now();

      setMessages(prev => [
        ...prev,
        { id: newAssistantMsgId, role: 'assistant', text: answerText }
      ]);

      if (ttsSupported && (autoSpeak || isVoiceInput)) {
        setTimeout(() => {
          speakAnswer(newAssistantMsgId, answerText);
        }, 300);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: err.message || 'Unable to get AI answer. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    stopListening();
    setMessages([]);
    setMeta(null);
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      {/* ── Active Interview Return Banner ── */}
      {isFromInterview && (
        <div className="glass-card-strong p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/50 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Interview Question Discussion
                </span>
                {interviewContext.interviewTopic && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {interviewContext.interviewTopic}
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 max-w-xl truncate">
                {interviewContext.questionTitle || 'Discussing active interview question with AI Tutor'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToInterview}
            className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-none hover:opacity-95 shrink-0 shadow-lg shadow-cyan-950/50 self-start sm:self-auto transition-transform hover:scale-105"
          >
            <ArrowLeft size={15} /> Back to AI Interview
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={22} className="text-cyan-400" />
            <h1 className="font-display font-bold text-2xl text-white">Exact AI Tutor & Voice Chatbot</h1>
            {activeApiKey ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck size={12} /> Gemini Cloud Connected
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Brain size={12} /> AutoLearn Expert Engine
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">Ask any question by voice or text. Provides exact, comprehensive AI/ML explanations, math formulas, and runnable code.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setApiKeyInput(activeApiKey);
              setShowKeyModal(true);
            }}
            className="btn-cyber text-xs flex items-center gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            <Key size={13} /> {activeApiKey ? 'Manage API Key' : 'Connect Gemini Key'}
          </button>

          {isFromInterview && (
            <button
              type="button"
              onClick={handleBackToInterview}
              className="btn-cyber text-xs flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 hover:bg-cyan-950/30"
            >
              <ArrowLeft size={13} /> Back to Interview
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="btn-cyber text-xs flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={13} /> Clear Chat
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <VoiceSettingsToolbar
              autoSpeak={autoSpeak}
              onToggleAutoSpeak={setAutoSpeak}
              availableVoices={availableVoices}
              selectedVoiceIndex={selectedVoiceIndex}
              onSelectVoice={setSelectedVoiceIndex}
              error={error}
              onClearError={clearError}
            />

            <div className="text-xs text-slate-400 font-mono mb-2 uppercase tracking-wider">Suggested Questions</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {starters.map(s => (
                <button key={s} type="button" className="btn-cyber text-xs" onClick={() => ask(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-4 min-h-[380px] max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-sm space-y-3">
                  <Brain size={42} className="mx-auto text-cyan-400 mb-2 animate-pulse" />
                  <div className="text-slate-200 font-semibold text-lg">Ask your AI Tutor anything!</div>
                  <div className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                    Type your question below or click the <span className="text-cyan-400 font-mono">🎤 Microphone</span> to speak. Click any answer's <span className="text-cyan-400 font-mono">🔊 Read Aloud</span> button to listen.
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 ml-8'
                      : 'bg-slate-800/95 border border-slate-700/70 text-slate-100 mr-2 shadow-xl'
                  }`}
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider mb-2 opacity-80 flex items-center justify-between text-cyan-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      {m.role === 'user' ? '👤 YOU' : '🤖 AI TUTOR'}
                      {m.askedByVoice && (
                        <span className="text-[10px] text-rose-400 lowercase font-sans bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          via voice
                        </span>
                      )}
                    </span>
                  </div>

                  {m.role === 'assistant' ? (
                    <MarkdownMessage content={m.text} />
                  ) : (
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  )}

                  {/* Audio playback controls for AI response */}
                  {m.role === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/50">
                      <VoicePlaybackControls
                        messageId={m.id || i}
                        messageText={m.text}
                        speakingMessageId={speakingMessageId}
                        voiceState={voiceState}
                        ttsSupported={ttsSupported}
                        onSpeak={speakAnswer}
                        onStop={stopSpeaking}
                        speakingRate={speakingRate}
                        onRateChange={setSpeakingRate}
                      />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 text-cyan-400 text-sm animate-pulse flex items-center gap-2">
                  <Brain size={16} className="animate-spin text-cyan-400" /> Thinking and formulating comprehensive answer...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const wasVoice = voiceState === 'listening' || micStatus === 'listening';
              ask(question, wasVoice);
            }}
            className="flex items-center gap-2 pt-3 border-t border-white/10"
          >
            <input
              className="cyber-input flex-1"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={
                voiceState === 'listening'
                  ? 'Listening to your voice...'
                  : 'Ask any question or click 🎤 to speak...'
              }
              disabled={loading}
            />

            {/* Microphone Voice-to-Text Button */}
            <MicButton
              voiceState={voiceState}
              micStatus={micStatus}
              sttSupported={sttSupported}
              onStartListening={handleStartVoiceInput}
              onStopListening={stopListening}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn-cyber-solid flex items-center gap-2 min-w-[90px] justify-center"
              disabled={loading || !question.trim()}
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-mono">Tutor Engine Mode</div>
            <div className="flex items-center gap-2 text-white font-medium">
              <Brain size={16} className="text-cyan-400" />
              {meta?.mode ? meta.mode.toUpperCase() : (activeApiKey ? 'GEMINI CLOUD LLM' : 'AUTOLEARN EXPERT ENGINE')}
            </div>
            {meta?.topic && (
              <div className="text-xs text-slate-400 mt-2">
                Detected Topic: <span className="text-cyan-400 font-semibold uppercase">{meta.topic}</span>
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-3 uppercase font-mono">Retrieved Knowledge Context</div>
            <div className="space-y-2 max-h-56 overflow-auto scrollbar-thin">
              {(meta?.retrieved || []).length ? meta.retrieved.slice(0, 5).map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[11px] text-cyan-400 uppercase font-mono">{item.kind} · {item.topic}</div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">{item.text}</div>
                </div>
              )) : <div className="text-slate-500 text-sm">Ask a question to load topic context.</div>}
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <div className="text-xs text-slate-500 uppercase font-mono">Related Topic Resources</div>
            {meta?.related?.videos?.[0] && (
              <a href={meta.related.videos[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                <Video size={14} className="text-red-400 shrink-0" />
                <span className="truncate">{meta.related.videos[0].title}</span>
              </a>
            )}
            {meta?.related?.courses?.[0] && (
              <a href={meta.related.courses[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                <BookOpen size={14} className="text-cyan-400 shrink-0" />
                <span className="truncate">{meta.related.courses[0].title}</span>
              </a>
            )}
            {meta?.related?.datasets?.[0] && (
              <a href={meta.related.datasets[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                <Database size={14} className="text-green-400 shrink-0" />
                <span className="truncate">{meta.related.datasets[0].title}</span>
              </a>
            )}
            {meta?.related?.project && (
              <div className="text-xs text-slate-400 border-t border-white/10 pt-2">
                Project Idea: <span className="text-slate-300">{meta.related.project}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card-strong max-w-md w-full p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={20} className="text-cyan-400" />
                <h3 className="font-bold text-lg text-white">LLM API Key Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your <strong>Google Gemini API Key</strong> to enable live, unlimited LLM generation across all 2026 Gemini models. If no key is provided, the platform automatically uses the <strong>AutoLearn Expert Offline Knowledge Engine</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300">Gemini / OpenAI API Key</label>
              <input
                type="password"
                className="cyber-input w-full font-mono text-xs"
                placeholder="AIzaSy... or sk-..."
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
              />
            </div>

            {keySaveMsg && (
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded border border-emerald-500/30">
                <Check size={14} /> {keySaveMsg}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get Free Gemini API Key <ExternalLink size={12} />
              </a>
              {activeApiKey && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-red-400 hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="btn-cyber text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="btn-cyber-solid text-xs px-5 py-2 font-bold flex items-center gap-1.5"
              >
                <Check size={14} /> Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
