import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, Brain, Mic, MicOff } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { useMemoryChat } from '../hooks/useMemoryChat';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { generateAutoDraft } from '../services/openai';

const ChatView = ({ memories, onMemoryUpdate, t }) => {
  const [inputValue, setInputValue] = useState('');
  const [showDraft, setShowDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  const { messages, isTyping, sendMessage } = useMemoryChat();
  const { transcript, isListening, startListening, stopListening, isSupported } = useVoiceInput();
  const scrollRef = useRef(null);
  const prevTranscriptRef = useRef('');

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Smart draft on first load
  useEffect(() => {
    if (messages.length === 1 && !showDraft && !isLoadingDraft) {
      if (memories.length > 0) {
        loadAutoDraft();
      } else {
        setDraftContent(t.defaultDraft);
        setShowDraft(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAutoDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const draft = await generateAutoDraft(memories.slice(0, 3));
      setDraftContent(draft);
      setShowDraft(true);
    } catch {
      setDraftContent(t.defaultDraft);
      setShowDraft(true);
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;
    setInputValue('');
    setShowDraft(false);
    await sendMessage(text);
    onMemoryUpdate();
  };

  // Append new voice transcript segments to the input box
  useEffect(() => {
    if (!transcript || transcript === prevTranscriptRef.current) return;
    const added = transcript.slice(prevTranscriptRef.current.length);
    if (added) {
      setInputValue((prev) => prev + added);
    }
    prevTranscriptRef.current = transcript;
  }, [transcript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      prevTranscriptRef.current = '';
    } else {
      prevTranscriptRef.current = '';
      startListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-10 pt-8 pb-4 shrink-0 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.chatTitle}</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{t.chatSubtitle}</p>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-10 py-6 space-y-5"
      >
        <div className="max-w-[760px] mx-auto space-y-5">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #534AB7, #378ADD)' }}
              >
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-10 pb-8 pt-4 shrink-0 border-t border-slate-100">
        <div className="max-w-[760px] mx-auto space-y-3">
          {/* Smart draft card */}
          {(showDraft || isLoadingDraft) && messages.length === 1 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm fade-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-indigo-50 rounded-lg">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t.smartCapture}
                </span>
              </div>
              {isLoadingDraft ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  <span className="text-slate-400 text-xs font-medium">{t.generatingSuggestion}</span>
                </div>
              ) : (
                <p className="text-slate-600 text-xs mb-3 font-medium leading-relaxed">
                  "{draftContent}"
                </p>
              )}
              {!isLoadingDraft && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setInputValue(draftContent); setShowDraft(false); }}
                    className="bg-slate-900 text-white text-[11px] px-4 py-1.5 rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    {t.useDraft}
                  </button>
                  <button
                    onClick={() => setShowDraft(false)}
                    className="text-slate-400 text-[11px] px-4 py-1.5 font-bold hover:text-slate-600 transition-colors"
                  >
                    {t.dismiss}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Textarea + mic + send button */}
          <div className="flex items-end gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '正在聆听...' : t.inputPlaceholder}
              disabled={isTyping}
              className="flex-1 bg-white border border-slate-100 rounded-[20px] py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm min-h-[52px] max-h-[160px] resize-none text-slate-800 text-sm font-medium"
            />

            {/* Mic button — only shown when browser supports it */}
            {isSupported && (
              <button
                onClick={handleMicClick}
                disabled={isTyping}
                title={isListening ? '停止录音' : '语音输入'}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 mb-0.5 disabled:opacity-25 ${
                  isListening
                    ? 'bg-red-500 mic-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                }`}
              >
                {isListening
                  ? <MicOff className="w-4 h-4 text-white" />
                  : <Mic className="w-4 h-4" />
                }
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="send-btn w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 transition-all shadow-md shrink-0 mb-0.5"
              style={{ background: 'linear-gradient(135deg, #534AB7, #378ADD)' }}
            >
              {isTyping
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
