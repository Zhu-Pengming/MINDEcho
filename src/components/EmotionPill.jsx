import React from 'react';
import { getEmotionConfig } from '../constants/emotions';

const EmotionPill = ({ emotion, size = 'sm' }) => {
  const cfg = getEmotionConfig(emotion);
  const cls = size === 'sm'
    ? 'text-[11px] px-2.5 py-0.5'
    : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${cls}`}
      style={{ color: cfg.dark, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
};

export default EmotionPill;
