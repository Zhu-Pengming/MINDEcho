import { useState, useEffect, useRef, useCallback } from 'react';

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const useVoiceInput = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Check browser support once on mount
  const isSupported = !!getSpeechRecognition();

  useEffect(() => {
    if (!isSupported) {
      setError('当前浏览器不支持语音识别，请使用 Chrome 或 Edge');
      return;
    }

    const SR = getSpeechRecognition();
    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      // Expose the latest segment (caller appends to inputValue)
      setTranscript(final || interim);
    };

    recognition.onerror = (event) => {
      // 'aborted' fires when we call stop() ourselves — not a real error
      if (event.error === 'aborted') return;
      setError(`语音识别错误：${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    // onend will set isListening = false
  }, [isListening]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    error,
    isSupported,
  };
};
