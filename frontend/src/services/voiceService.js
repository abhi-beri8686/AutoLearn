/**
 * Voice Service Adapter
 * 
 * Modular speech-to-text (STT) and text-to-speech (TTS) abstraction layer.
 * Uses browser Web Speech API (SpeechRecognition & SpeechSynthesis) by default.
 * Designed to be easily extended/swapped with cloud APIs (e.g., Whisper, Google Cloud Speech, Gemini Audio).
 */

export const voiceService = {
  /**
   * Check if Speech-to-Text is supported in current environment
   */
  isSTTSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  /**
   * Check if Text-to-Speech is supported in current environment
   */
  isTTSSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  },

  /**
   * Create and initialize a Speech Recognition controller
   */
  createSpeechRecognition({
    onStart,
    onResult,
    onError,
    onEnd,
    lang = 'en-US',
    continuous = false,
    interimResults = true,
  } = {}) {
    if (!this.isSTTSupported()) {
      throw new Error('Speech Recognition (STT) is not supported in this browser.');
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    let finalTranscriptAccumulator = '';

    recognition.onstart = () => {
      finalTranscriptAccumulator = '';
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (currentFinal) {
        finalTranscriptAccumulator += (finalTranscriptAccumulator ? ' ' : '') + currentFinal;
      }

      const fullTranscript = (finalTranscriptAccumulator + (interimTranscript ? ' ' + interimTranscript : '')).trim();

      if (onResult) {
        onResult({
          finalTranscript: finalTranscriptAccumulator.trim(),
          interimTranscript: interimTranscript.trim(),
          fullTranscript,
        });
      }
    };

    recognition.onerror = (event) => {
      let userFriendlyMessage = 'Speech recognition error occurred.';
      const errorCode = event.error;

      switch (errorCode) {
        case 'not-allowed':
        case 'service-not-allowed':
          userFriendlyMessage = 'Microphone permission was denied or blocked. Please allow microphone access in your browser settings.';
          break;
        case 'no-speech':
          userFriendlyMessage = 'No speech was detected. Please try speaking again into your microphone.';
          break;
        case 'audio-capture':
          userFriendlyMessage = 'No microphone was found or audio capture failed. Ensure your microphone is plugged in.';
          break;
        case 'network':
          userFriendlyMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          userFriendlyMessage = 'Speech recognition was stopped.';
          break;
        default:
          userFriendlyMessage = `Speech recognition error: ${errorCode}`;
      }

      if (onError) {
        onError({
          code: errorCode,
          message: userFriendlyMessage,
          originalEvent: event,
        });
      }
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return {
      start() {
        try {
          recognition.start();
        } catch (err) {
          if (err.name !== 'InvalidStateError') {
            console.error('Failed to start speech recognition:', err);
          }
        }
      },
      stop() {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Failed to stop speech recognition:', err);
        }
      },
      abort() {
        try {
          recognition.abort();
        } catch (err) {
          console.error('Failed to abort speech recognition:', err);
        }
      },
    };
  },

  /**
   * Speak given text using Text-to-Speech
   */
  speakText(text, {
    voiceIndex = null,
    rate = 1.0,
    pitch = 1.0,
    lang = 'en-US',
    onStart,
    onEnd,
    onError,
    onPause,
    onResume,
  } = {}) {
    if (!this.isTTSSupported()) {
      if (onError) onError({ message: 'Text-to-Speech is not supported in this browser.' });
      return null;
    }

    // Stop any existing speech playback
    this.stopSpeaking();

    // Clean markdown formatting if present so TTS reads clean text
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted for audio playback. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~`-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return null;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));
    utterance.lang = lang;

    // Attach voice if selected
    const voices = this.getVoices();
    if (voices && voices.length > 0) {
      if (voiceIndex !== null && voices[voiceIndex]) {
        utterance.voice = voices[voiceIndex];
      } else {
        // Preferred natural English voices if available
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => { if (onStart) onStart(); };
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = (e) => { if (onError) onError(e); };
    utterance.onpause = () => { if (onPause) onPause(); };
    utterance.onresume = () => { if (onResume) onResume(); };

    window.speechSynthesis.speak(utterance);

    return {
      stop: () => this.stopSpeaking(),
      pause: () => this.pauseSpeaking(),
      resume: () => this.resumeSpeaking(),
    };
  },

  /**
   * Stop all active Speech Synthesis audio
   */
  stopSpeaking() {
    if (this.isTTSSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Pause active Speech Synthesis audio
   */
  pauseSpeaking() {
    if (this.isTTSSupported()) {
      window.speechSynthesis.pause();
    }
  },

  /**
   * Resume paused Speech Synthesis audio
   */
  resumeSpeaking() {
    if (this.isTTSSupported()) {
      window.speechSynthesis.resume();
    }
  },

  /**
   * Retrieve available Speech Synthesis voices
   */
  getVoices() {
    if (!this.isTTSSupported()) return [];
    return window.speechSynthesis.getVoices() || [];
  },
};
