import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './views/ChatView';
import LibraryView from './views/LibraryView';
import InsightsView from './views/InsightsView';
import { memoryStore, getMemoryStats } from './services/memoryStore';

// ── i18n ──────────────────────────────────────────────────────────────────────
const translations = {
  zh: {
    // chat
    chatTitle: '今日记录',
    chatSubtitle: '和你的 AI 记忆伙伴分享',
    smartCapture: '智能捕获',
    generatingSuggestion: '正在生成建议...',
    useDraft: '输入记录',
    dismiss: '忽略',
    inputPlaceholder: '记录此刻感悟...',
    defaultDraft: '今天过得怎么样？有什么想记录的吗？',
    // library
    memoryArchive: '记忆库',
    archiveSubtitle: (n) => `Archive of Your Soul · ${n} 条记忆`,
    searchPlaceholder: '搜索记忆...',
    aiInsight: 'AI 洞察',
    noMemories: '还没有记忆，开始记录吧',
    filterAll: '全部',
    startChat: '开始记录',
    // insights
    insights: '洞察',
    emotionTrend: '情绪趋势（最近7天）',
    aiDeepAnalysis: 'AI 深度观察',
    generatedJustNow: '刚刚生成',
    totalMemories: '总记忆',
    shortLongTerm: (s, l) => `短期 ${s} · 长期 ${l}`,
    avgEmotionIntensity: '平均情绪强度',
    outOf: '满分 10.0',
    topEmotion: '最活跃情绪',
    emotionDistribution: '情绪分布',
  },
  en: {
    chatTitle: "Today's Record",
    chatSubtitle: 'Share with your AI memory companion',
    smartCapture: 'Smart Capture',
    generatingSuggestion: 'Generating suggestion...',
    useDraft: 'Use this',
    dismiss: 'Dismiss',
    inputPlaceholder: 'Record your thoughts...',
    defaultDraft: "How was your day? Anything you'd like to record?",
    memoryArchive: 'Memory Archive',
    archiveSubtitle: (n) => `Archive of Your Soul · ${n} ${n === 1 ? 'memory' : 'memories'}`,
    searchPlaceholder: 'Search memories...',
    aiInsight: 'AI Insight',
    noMemories: 'No memories yet — start recording!',
    filterAll: 'All',
    startChat: 'Start Recording',
    insights: 'Insights',
    emotionTrend: 'Emotion Trend (Last 7 Days)',
    aiDeepAnalysis: 'AI Deep Analysis',
    generatedJustNow: 'Generated just now',
    totalMemories: 'Total Memories',
    shortLongTerm: (s, l) => `Short-term ${s} · Long-term ${l}`,
    avgEmotionIntensity: 'Avg Emotion Intensity',
    outOf: 'Out of 10.0',
    topEmotion: 'Top Emotion',
    emotionDistribution: 'Emotion Distribution',
  },
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [memories, setMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [lang, setLang] = useState('zh');

  const t = translations[lang];

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMemories(memoryStore.getAll());
    setStats(getMemoryStats());
  };

  const toggleLang = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'));

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#faf9f6' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        lang={lang}
        toggleLang={toggleLang}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatView memories={memories} onMemoryUpdate={refreshData} t={t} />
        )}
        {activeTab === 'review' && (
          <LibraryView
            memories={memories}
            onNavigateToChat={() => setActiveTab('chat')}
            t={t}
          />
        )}
        {activeTab === 'stats' && (
          <InsightsView stats={stats} memories={memories} t={t} />
        )}
      </main>
    </div>
  );
};

export default App;
