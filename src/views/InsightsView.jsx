import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, BarChart3 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { EMOTIONS, getEmotionConfig } from '../constants/emotions';
import { generateWeeklyInsight } from '../services/openai';

const InsightsView = ({ stats, memories, t }) => {
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    if (memories.length > 0 && !weeklyInsight && !isLoadingInsight) {
      loadWeeklyInsight();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories.length]);

  const loadWeeklyInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await generateWeeklyInsight(memories);
      setWeeklyInsight(insight);
    } catch (err) {
      console.error('Weekly insight error:', err);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (!stats || stats.total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={BarChart3}
          title="暂无数据"
          subtitle="先去对话页面记录几条记忆，洞察图表会在这里显示"
        />
      </div>
    );
  }

  // Top emotion
  const topEmotionEntry = Object.entries(stats.emotionCounts ?? {}).sort(([, a], [, b]) => b - a)[0];
  const topEmotion = topEmotionEntry?.[0];
  const topCfg = topEmotion ? getEmotionConfig(topEmotion) : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-10 pt-8 pb-6 shrink-0 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.insights}</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Deep Intelligence</p>
      </div>

      <div className="px-10 py-8 space-y-6">
        {/* ── Metric cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t.totalMemories}
            </p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t.shortLongTerm(stats.shortTerm, stats.longTerm)}</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t.avgEmotionIntensity}
            </p>
            <p className="text-3xl font-black text-slate-900">{stats.avgIntensity}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t.outOf}</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t.topEmotion ?? '最活跃情绪'}
            </p>
            <p className="text-3xl font-black" style={{ color: topCfg?.color ?? '#888' }}>
              {topCfg?.label ?? '—'}
            </p>
            {topEmotionEntry && (
              <p className="text-[11px] text-slate-400 mt-1">{topEmotionEntry[1]} 次</p>
            )}
          </div>
        </div>

        {/* ── Emotion trend chart ── */}
        {stats.emotionTrend.length > 0 && (
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <h3 className="text-[11px] font-bold opacity-50 uppercase tracking-widest mb-6">
              {t.emotionTrend}
            </h3>
            <div className="flex items-end gap-2" style={{ height: 112 }}>
              {stats.emotionTrend.slice(0, 7).map((item, i) => {
                const cfg = getEmotionConfig(item.emotion);
                const h = ((item.intensity ?? 0) / 10) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    {/* hover label */}
                    <span className="text-[9px] font-bold opacity-0 group-hover:opacity-60 transition-all leading-none">
                      {item.intensity}
                    </span>
                    {/* bar */}
                    <div
                      className="w-full bg-white/10 rounded-t relative flex-1"
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bar-grow opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                    {/* weekday label */}
                    <span className="text-[9px] font-bold opacity-30 leading-none">
                      {new Date(item.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 blur-[60px]" />
          </div>
        )}

        {/* ── AI Insight card ── */}
        {isLoadingInsight && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        )}

        {weeklyInsight && (
          <div className="bg-white border-2 border-slate-50 rounded-3xl p-8 shadow-sm fade-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight">{t.aiDeepAnalysis}</h4>
                <p className="text-slate-400 text-[11px] font-bold">{t.generatedJustNow}</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium italic mb-4">
              "{weeklyInsight.insight}"
            </p>
            {weeklyInsight.suggestion && (
              <p className="text-slate-500 text-sm leading-relaxed">
                💡 {weeklyInsight.suggestion}
              </p>
            )}
          </div>
        )}

        {/* ── Emotion distribution ── */}
        {stats.emotionCounts && Object.keys(stats.emotionCounts).length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
              {t.emotionDistribution ?? '情绪分布'}
            </h4>
            <div className="space-y-3">
              {Object.entries(stats.emotionCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, count]) => {
                  const cfg = getEmotionConfig(emotion);
                  const pct = (count / stats.total) * 100;
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-14 shrink-0" style={{ color: cfg.dark }}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bar-grow"
                          style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-5 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsView;
