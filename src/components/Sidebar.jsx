import React from 'react';
import { Brain, MessageSquare, BookOpen, BarChart3 } from 'lucide-react';
import WeeklyMiniChart from './WeeklyMiniChart';

const NAV_ITEMS = [
  { id: 'chat',   icon: MessageSquare, labelZh: '对话',  labelEn: 'Chat'     },
  { id: 'review', icon: BookOpen,      labelZh: '记忆库', labelEn: 'Library'  },
  { id: 'stats',  icon: BarChart3,     labelZh: '洞察',  labelEn: 'Insights' },
];

const Sidebar = ({ activeTab, setActiveTab, stats, lang, toggleLang }) => (
  <aside
    className="w-[220px] shrink-0 flex flex-col border-r border-slate-200/60 h-full"
    style={{ backgroundColor: '#f3f2ee' }}
  >
    {/* Logo */}
    <div className="px-5 py-6 flex items-center gap-3">
      <div className="relative">
        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <Brain className="text-white w-5 h-5" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 border-2 border-[#f3f2ee] rounded-full" />
      </div>
      <div>
        <h1 className="text-sm font-black tracking-tighter text-slate-900">MIND ECHØ</h1>
        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
          AI Syncing
        </p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-2 space-y-0.5">
      {NAV_ITEMS.map(({ id, icon: Icon, labelZh, labelEn }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`sidebar-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              active
                ? 'bg-white text-slate-900 shadow-sm sidebar-nav-active'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-500' : ''}`} />
            {lang === 'zh' ? labelZh : labelEn}
          </button>
        );
      })}
    </nav>

    {/* Mini chart */}
    {stats?.emotionTrend?.length > 0 && (
      <div className="border-t border-slate-200/60">
        <WeeklyMiniChart emotionTrend={stats.emotionTrend} />
      </div>
    )}

    {/* Lang toggle */}
    <div className="px-4 py-4 border-t border-slate-200/60">
      <button
        onClick={toggleLang}
        className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest py-1.5 rounded-lg hover:bg-white/70 transition-all"
      >
        {lang === 'zh' ? 'Switch to EN' : '切换中文'}
      </button>
    </div>
  </aside>
);

export default Sidebar;
