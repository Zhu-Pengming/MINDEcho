import React from 'react';
import { getEmotionConfig } from '../constants/emotions';

const WeeklyMiniChart = ({ emotionTrend }) => {
  if (!emotionTrend?.length) return null;

  const items = emotionTrend.slice(0, 7);
  const maxIntensity = Math.max(...items.map((i) => i.intensity ?? 0), 1);

  return (
    <div className="px-4 py-3">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">本周情绪</p>
      <div className="flex items-end gap-1" style={{ height: 40 }}>
        {items.map((item, i) => {
          const cfg = getEmotionConfig(item.emotion);
          const h = ((item.intensity ?? 0) / maxIntensity) * 100;
          return (
            <div key={i} className="flex-1 relative" style={{ height: 40 }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-700"
                style={{ height: `${h}%`, backgroundColor: cfg.color, opacity: 0.7 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyMiniChart;
