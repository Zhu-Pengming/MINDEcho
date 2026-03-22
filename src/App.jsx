import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Smile, 
  Frown, 
  Calendar,
  Activity,
  Send,
  ChevronRight,
  Brain,
  BarChart3,
  Clock,
  LayoutGrid,
  User,
  Bell,
  BookOpen,
  Filter,
  Settings2,
  Loader2
} from 'lucide-react';
import { useMemoryChat } from './hooks/useMemoryChat';
import { useMemorySearch } from './hooks/useMemorySearch';
import { memoryStore, getMemoryStats } from './services/memoryStore';
import { generateAutoDraft, generateWeeklyInsight } from './services/openai';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat'); 
  const [inputValue, setInputValue] = useState('');
  const [memories, setMemories] = useState([]);
  const [showDraft, setShowDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  
  const { messages, isTyping, sendMessage } = useMemoryChat();
  const { searchResults, searchInsight, isSearching, search, clearSearch } = useMemorySearch();
  
  const scrollRef = useRef(null);

  useEffect(() => {
    loadMemories();
    loadStats();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat' && messages.length === 1 && memories.length > 0 && !showDraft) {
      loadAutoDraft();
    }
  }, [activeTab, messages.length, memories.length, showDraft]);

  useEffect(() => {
    if (activeTab === 'stats' && !weeklyInsight && memories.length > 0) {
      loadWeeklyInsight();
    }
  }, [activeTab, weeklyInsight, memories.length]);

  const loadMemories = () => {
    const allMemories = memoryStore.getAll();
    setMemories(allMemories);
  };

  const loadStats = () => {
    const memoryStats = getMemoryStats();
    setStats(memoryStats);
  };

  const loadAutoDraft = async () => {
    if (isLoadingDraft) return;
    
    setIsLoadingDraft(true);
    try {
      const recentMemories = memories.length > 0 ? memories.slice(0, 3) : [];
      const draft = await generateAutoDraft(recentMemories);
      setDraftContent(draft);
      setShowDraft(true);
    } catch (error) {
      console.error('Failed to generate draft:', error);
      setDraftContent('今天过得怎么样？有什么想记录的吗？');
      setShowDraft(true);
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const loadWeeklyInsight = async () => {
    if (isLoadingInsight) return;
    
    setIsLoadingInsight(true);
    try {
      const insight = await generateWeeklyInsight(memories);
      setWeeklyInsight(insight);
    } catch (error) {
      console.error('Failed to generate insight:', error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    await sendMessage(text);
    setInputValue('');
    loadMemories();
    loadStats();
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await search(query);
    } else {
      clearSearch();
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      '开心': 'bg-green-400',
      '焦虑': 'bg-amber-400',
      '平静': 'bg-blue-400',
      '沮丧': 'bg-gray-400',
      '兴奋': 'bg-purple-400',
      '疲惫': 'bg-slate-400'
    };
    return colors[emotion] || 'bg-slate-300';
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans text-slate-900 overflow-hidden">
      
      <header className="flex items-center justify-between px-8 py-6 z-30">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
              <Brain className="text-white w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900">MIND ECHØ</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              AI Syncing
            </p>
          </div>
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative pb-28">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-6 py-2">
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-hide pb-48">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none shadow-xl shadow-slate-200' 
                    : msg.isSystem
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-bl-none shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                  }`}>
                    <p className="text-[16px] leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 rounded-full px-6 py-4 flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-32 left-0 right-0 px-6 max-w-2xl mx-auto">
              {(showDraft || isLoadingDraft) && messages.length === 1 && (
                <div className="mb-6 animate-in fade-in zoom-in-95 duration-700">
                  <div className="bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-5 shadow-2xl shadow-slate-200/50 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-indigo-50 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">智能捕获</span>
                    </div>
                    {isLoadingDraft ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        <p className="text-slate-400 text-[13px] font-medium">正在生成建议...</p>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-[13px] mb-4 font-medium leading-relaxed">
                        "{draftContent}"
                      </p>
                    )}
                    {!isLoadingDraft && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setInputValue(draftContent); 
                            setShowDraft(false); 
                          }} 
                          className="bg-slate-900 text-white text-[11px] px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
                        >
                          输入记录
                        </button>
                        <button 
                          onClick={() => setShowDraft(false)} 
                          className="text-slate-400 text-[11px] px-5 py-2.5 font-bold hover:text-slate-600"
                        >
                          忽略
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(inputValue))}
                  placeholder="记录此刻感悟..."
                  className="w-full bg-white border border-slate-100 rounded-[2.5rem] py-5 pl-7 pr-16 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-2xl shadow-slate-200/60 min-h-[70px] max-h-[180px] resize-none text-slate-800 font-medium"
                  disabled={isTyping}
                />
                <button 
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-105 disabled:opacity-20 transition-all shadow-lg"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="h-full max-w-5xl mx-auto w-full px-8 py-4 overflow-y-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">记忆库</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Archive of Your Soul · {memories.length} 条记忆
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="搜索记忆..."
                    className="w-64 h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-sm"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {searchQuery && searchInsight && (
              <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-indigo-900">AI 洞察</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{searchInsight}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
              {(searchQuery ? searchResults : memories).map(memory => (
                <div key={memory.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{memory.date}</span>
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(memory.emotion)}`}></div>
                  </div>
                  <p className="text-slate-800 text-lg font-bold leading-tight mb-8">"{memory.content}"</p>
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {memory.tags?.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-400 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{memory.summary}</p>
                  </div>
                  {memory.score && (
                    <div className="mt-3 text-[10px] text-slate-300 font-bold">
                      相关度: {(memory.score * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {memories.length === 0 && (
              <div className="text-center py-20">
                <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">还没有记忆，开始记录吧</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="h-full max-w-5xl mx-auto w-full px-8 py-4 overflow-y-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">洞察</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Deep Intelligence</p>
            </div>

            <div className="space-y-8 pb-40">
              {stats && stats.emotionTrend.length > 0 && (
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-8">情绪趋势 (最近7天)</h3>
                    <div className="flex items-end gap-3 h-32">
                      {stats.emotionTrend.slice(0, 7).map((item, i) => {
                        const height = (item.intensity / 10) * 100;
                        return (
                          <div key={i} className="flex-1 bg-white/10 rounded-t-lg relative group">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-400" 
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold opacity-30">
                      {stats.emotionTrend.slice(0, 7).map((item, i) => (
                        <span key={i}>{new Date(item.date).toLocaleDateString('zh-CN', { weekday: 'short' }).toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-[80px]"></div>
                </div>
              )}

              {weeklyInsight && (
                <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-sm">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight">AI 深度观察</h4>
                      <p className="text-slate-400 text-xs font-bold">Generated just now</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium italic mb-6">
                    "{weeklyInsight.insight}"
                  </p>
                  {weeklyInsight.suggestion && (
                    <p className="text-slate-500 text-sm leading-relaxed">
                      💡 {weeklyInsight.suggestion}
                    </p>
                  )}
                </div>
              )}

              {isLoadingInsight && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              )}

              {stats && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">总记忆</h4>
                    <p className="text-4xl font-black text-slate-900">{stats.total}</p>
                    <p className="text-xs text-slate-400 mt-2">短期 {stats.shortTerm} · 长期 {stats.longTerm}</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">平均情绪强度</h4>
                    <p className="text-4xl font-black text-slate-900">{stats.avgIntensity}</p>
                    <p className="text-xs text-slate-400 mt-2">满分 10.0</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-3 shadow-2xl z-50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-4 flex flex-col items-center transition-all ${activeTab === 'review' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
          >
            <BookOpen className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest">库</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${activeTab === 'chat' ? 'bg-slate-900 text-white scale-110' : 'bg-slate-50 text-slate-400'}`}
          >
            <Sparkles className={`w-8 h-8 ${activeTab === 'chat' ? 'animate-pulse' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 flex flex-col items-center transition-all ${activeTab === 'stats' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest">洞察</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
