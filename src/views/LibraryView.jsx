import React, { useState } from 'react';
import { Search, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import MemoryCard from '../components/MemoryCard';
import EmptyState from '../components/EmptyState';
import { useMemorySearch } from '../hooks/useMemorySearch';
import { EMOTIONS } from '../constants/emotions';

const FILTER_EMOTIONS = Object.keys(EMOTIONS);

const LibraryView = ({ memories, onNavigateToChat, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { searchResults, searchInsight, isSearching, search, clearSearch } = useMemorySearch();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await search(query);
    } else {
      clearSearch();
    }
  };

  const displayMemories = searchQuery
    ? searchResults
    : activeFilter === 'All'
    ? memories
    : memories.filter((m) => m.emotion === activeFilter);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-10 pt-8 pb-5 shrink-0 border-b border-slate-100">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.memoryArchive}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{t.archiveSubtitle(memories.length)}</p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-56 h-9 bg-white border border-slate-100 rounded-xl pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </div>

        {/* Emotion filter pills */}
        {!searchQuery && (
          <div className="flex gap-2 flex-wrap">
            {/* All pill */}
            <button
              onClick={() => setActiveFilter('All')}
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${
                activeFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
              }`}
            >
              {t.filterAll}
            </button>

            {FILTER_EMOTIONS.map((emotion) => {
              const cfg = EMOTIONS[emotion];
              const isActive = activeFilter === emotion;
              return (
                <button
                  key={emotion}
                  onClick={() => setActiveFilter(emotion)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all border ${
                    isActive ? 'text-white border-transparent' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color }
                      : { color: cfg.dark }
                  }
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-10 py-6">
        {/* AI Insight from search */}
        {searchQuery && searchInsight && (
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 fade-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-900">{t.aiInsight}</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{searchInsight}</p>
          </div>
        )}

        {/* Cards */}
        {displayMemories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {displayMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t.noMemories}
            subtitle="在对话页面和 AI 聊一聊，记忆会自动保存到这里"
            actionLabel={t.startChat}
            onAction={onNavigateToChat}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm font-medium">没有匹配的记忆</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
