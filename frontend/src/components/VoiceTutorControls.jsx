import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, RotateCcw, AlertTriangle, Settings2, Sparkles, Check } from 'lucide-react';

/**
 * Microphone Input Button for Voice-to-Text
 */
export function MicButton({
  voiceState,
  micStatus,
  sttSupported,
  onStartListening,
  onStopListening,
  disabled = false,
}) {
  const isListening = voiceState === 'listening' || micStatus === 'listening';
  const isProcessing = voiceState === 'processing';
  const isDenied = micStatus === 'denied';
  const isUnsupported = !sttSupported || micStatus === 'unsupported';

  const handleClick = (e) => {
    e.preventDefault();
    if (disabled || isUnsupported || isDenied) return;
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  let title = 'Click to speak question';
  if (isListening) title = 'Listening... Click to stop recording';
  if (isProcessing) title = 'Transcribing your speech...';
  if (isDenied) title = 'Microphone permission blocked. Please allow mic access in browser.';
  if (isUnsupported) title = 'Voice input not supported in this browser.';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUnsupported || isDenied || isProcessing}
        title={title}
        aria-label={title}
        className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
          isListening
            ? 'bg-rose-500/20 border border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
            : isDenied || isUnsupported
            ? 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed opacity-60'
            : 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 active:scale-95'
        }`}
      >
        {isListening ? (
          <>
            <MicOff size={18} className="animate-bounce text-rose-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </>
        ) : (
          <Mic size={18} className={isDenied || isUnsupported ? 'text-slate-500' : 'text-cyan-400'} />
        )}
      </button>

      {/* Audio Wave Visualizer when listening */}
      {isListening && (
        <div className="flex items-center gap-0.5 ml-2 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono animate-pulse">
          <span className="w-1 h-3 bg-rose-400 rounded-full animate-[pulse_0.6s_infinite_ease-in-out]"></span>
          <span className="w-1 h-4 bg-rose-400 rounded-full animate-[pulse_0.4s_infinite_ease-in-out_0.1s]"></span>
          <span className="w-1 h-2 bg-rose-400 rounded-full animate-[pulse_0.8s_infinite_ease-in-out_0.2s]"></span>
          <span className="ml-1 font-semibold uppercase tracking-wider text-[10px]">Listening</span>
        </div>
      )}
    </div>
  );
}

/**
 * Text-to-Speech Playback Controls Bar attached to AI messages
 */
export function VoicePlaybackControls({
  messageId,
  messageText,
  speakingMessageId,
  voiceState,
  ttsSupported,
  onSpeak,
  onStop,
  speakingRate,
  onRateChange,
}) {
  if (!ttsSupported) return null;

  const isCurrentMessage = speakingMessageId === messageId;
  const isSpeaking = isCurrentMessage && voiceState === 'speaking';
  const isPaused = isCurrentMessage && voiceState === 'paused';

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/40">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={() => onSpeak(messageId, messageText)}
        title={isSpeaking ? 'Pause reading' : isPaused ? 'Resume reading' : 'Listen to AI answer'}
        aria-label={isSpeaking ? 'Pause audio' : 'Play audio'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
          isSpeaking || isPaused
            ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            : 'bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30'
        }`}
      >
        {isSpeaking ? (
          <>
            <Pause size={13} className="text-cyan-400" /> Pause
          </>
        ) : isPaused ? (
          <>
            <Play size={13} className="text-cyan-400" /> Resume
          </>
        ) : (
          <>
            <Volume2 size={13} className="text-slate-400 group-hover:text-cyan-400" /> Read Aloud
          </>
        )}
      </button>

      {/* Stop & Replay controls if active */}
      {isCurrentMessage && (isSpeaking || isPaused) && (
        <>
          <button
            type="button"
            onClick={onStop}
            title="Stop audio"
            aria-label="Stop audio"
            className="p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-rose-400"
          >
            <Square size={13} />
          </button>
          <button
            type="button"
            onClick={() => onSpeak(messageId, messageText)}
            title="Replay audio"
            aria-label="Replay audio"
            className="p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-cyan-400"
          >
            <RotateCcw size={13} />
          </button>
        </>
      )}

      {/* Animated Waveform when speaking */}
      {isSpeaking && (
        <div className="flex items-center gap-0.5 ml-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono">
          <span className="w-0.5 h-2.5 bg-cyan-400 rounded animate-[pulse_0.5s_infinite]"></span>
          <span className="w-0.5 h-3.5 bg-cyan-400 rounded animate-[pulse_0.3s_infinite_0.1s]"></span>
          <span className="w-0.5 h-2 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_0.2s]"></span>
          <span className="ml-1 text-[9px] uppercase tracking-wider font-semibold">Speaking</span>
        </div>
      )}

      {/* Speech Rate Toggle */}
      {isCurrentMessage && onRateChange && (
        <button
          type="button"
          onClick={() => {
            const nextRate = speakingRate === 1.0 ? 1.25 : speakingRate === 1.25 ? 1.5 : 1.0;
            onRateChange(nextRate);
          }}
          title="Change audio speed"
          className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400"
        >
          {speakingRate}x
        </button>
      )}
    </div>
  );
}

/**
 * Voice Status & Settings Bar
 */
export function VoiceSettingsToolbar({
  autoSpeak,
  onToggleAutoSpeak,
  availableVoices = [],
  selectedVoiceIndex,
  onSelectVoice,
  error,
  onClearError,
}) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="space-y-2 mb-2">
      {/* Error alert toast */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-rose-400 hover:text-rose-200 font-bold ml-2 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toolbar controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
              autoSpeak
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
            title="Automatically read AI response aloud when question is asked by voice"
          >
            <Volume2 size={13} className={autoSpeak ? 'text-cyan-400' : 'text-slate-400'} />
            <span>Auto-Read Answers</span>
            {autoSpeak && <Check size={12} className="text-cyan-400 ml-0.5" />}
          </button>

          <span className="text-slate-700">|</span>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            🎤 Voice Mode Active
          </span>
        </div>

        {availableVoices.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
            title="Voice settings"
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline text-[11px]">Voice Options</span>
          </button>
        )}
      </div>

      {/* Voice Selection Dropdown */}
      {showSettings && availableVoices.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
          <div className="font-mono text-[11px] text-slate-400 uppercase">Select AI Voice</div>
          <select
            value={selectedVoiceIndex !== null ? selectedVoiceIndex : ''}
            onChange={(e) => onSelectVoice(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-400"
          >
            <option value="">Default System Voice</option>
            {availableVoices.map((v, i) => (
              <option key={i} value={i}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
