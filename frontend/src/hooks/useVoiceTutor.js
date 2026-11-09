import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceService } from '../services/voiceService';

export function useVoiceTutor() {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking' | 'paused'
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'denied' | 'unsupported'
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const isSTT = voiceService.isSTTSupported();
    const isTTS = voiceService.isTTSSupported();
    setSttSupported(isSTT);
    setTtsSupported(isTTS);

    if (!isSTT) {
      setMicStatus('unsupported');
    }

    if (isTTS) {
      const loadVoices = () => {
        const voices = voiceService.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      voiceService.stopSpeaking();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startListening = useCallback((onTranscriptUpdate) => {
    setError(null);

    if (!sttSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setMicStatus('unsupported');
      return;
    }

    // Stop speaking if currently speaking
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      recognitionRef.current = voiceService.createSpeechRecognition({
        onStart: () => {
          setVoiceState('listening');
          setMicStatus('listening');
          setTranscript('');
        },
        onResult: ({ fullTranscript }) => {
          setTranscript(fullTranscript);
          if (onTranscriptUpdate) {
            onTranscriptUpdate(fullTranscript);
          }
        },
        onError: ({ code, message }) => {
          setError(message);
          setVoiceState('idle');
          if (code === 'not-allowed' || code === 'service-not-allowed') {
            setMicStatus('denied');
          } else {
            setMicStatus('idle');
          }
        },
        onEnd: () => {
          setVoiceState(prev => (prev === 'listening' ? 'idle' : prev));
          setMicStatus(prev => (prev === 'listening' ? 'idle' : prev));
        },
      });

      recognitionRef.current.start();
    } catch (err) {
      setError(err.message || 'Failed to start microphone.');
      setVoiceState('idle');
      setMicStatus('idle');
    }
  }, [sttSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
    setMicStatus('idle');
  }, []);

  const speakAnswer = useCallback((messageId, text) => {
    setError(null);

    if (!ttsSupported) {
      setError('Text-to-speech audio playback is not supported in this browser.');
      return;
    }

    // Stop recording if active
    if (voiceState === 'listening') {
      stopListening();
    }

    // If clicking on the message currently speaking
    if (speakingMessageId === messageId) {
      if (voiceState === 'speaking') {
        voiceService.pauseSpeaking();
        setVoiceState('paused');
        return;
      }
      if (voiceState === 'paused') {
        voiceService.resumeSpeaking();
        setVoiceState('speaking');
        return;
      }
    }

    // Start speaking new message
    voiceService.speakText(text, {
      voiceIndex: selectedVoiceIndex,
      rate: speakingRate,
      onStart: () => {
        setSpeakingMessageId(messageId);
        setVoiceState('speaking');
      },
      onEnd: () => {
        setSpeakingMessageId(null);
        setVoiceState('idle');
      },
      onError: (err) => {
        console.error('Speech Synthesis Error:', err);
        setError('Audio playback encountered an error.');
        setSpeakingMessageId(null);
        setVoiceState('idle');
      },
      onPause: () => {
        setVoiceState('paused');
      },
      onResume: () => {
        setVoiceState('speaking');
      },
    });
  }, [ttsSupported, voiceState, speakingMessageId, selectedVoiceIndex, speakingRate, stopListening]);

  const pauseSpeaking = useCallback(() => {
    voiceService.pauseSpeaking();
    setVoiceState('paused');
  }, []);

  const resumeSpeaking = useCallback(() => {
    voiceService.resumeSpeaking();
    setVoiceState('speaking');
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setVoiceState('idle');
  }, []);

  return {
    sttSupported,
    ttsSupported,
    voiceState,
    micStatus,
    error,
    transcript,
    autoSpeak,
    speakingMessageId,
    speakingRate,
    availableVoices,
    selectedVoiceIndex,
    startListening,
    stopListening,
    speakAnswer,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    setAutoSpeak,
    setSpeakingRate,
    setSelectedVoiceIndex,
    clearError,
  };
}
