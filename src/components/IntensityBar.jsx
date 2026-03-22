import React from 'react';
import { getEmotionConfig } from '../constants/emotions';

const IntensityBar = ({ intensity, emotion }) => {
  const cfg = getEmotionConfig(emotion);
  const pct = Math.min(100, ((intensity ?? 0) / 10) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: cfg.color }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-400 shrink-0">{intensity ?? 0}/10</span>
    </div>
  );
};

export default IntensityBar;
