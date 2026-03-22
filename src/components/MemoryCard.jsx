import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import EmotionPill from './EmotionPill';
import IntensityBar from './IntensityBar';
import { getEmotionConfig } from '../constants/emotions';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MemoryCard = ({ memory }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = getEmotionConfig(memory.emotion);

  const handleClick = (e) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  return (
    <div
      className="memory-card bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer"
      style={{ borderLeft: `3px solid ${cfg.color}` }}
      onClick={handleClick}
    >
      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-3">
          {memory.emotion ? <EmotionPill emotion={memory.emotion} /> : <span />}
          <span className="text-[11px] font-bold text-slate-300">{formatDate(memory.date)}</span>
        </div>

        {/* ── Summary (primary content) ── */}
        <p className={`text-slate-700 text-sm font-medium leading-relaxed mb-3 ${expanded ? '' : 'line-clamp-3'}`}>
          {memory.summary || memory.content}
        </p>

        {/* ── Tags ── */}
        {memory.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Intensity bar ── */}
        {memory.intensity != null && (
          <div className="mb-3">
            <IntensityBar intensity={memory.intensity} emotion={memory.emotion} />
          </div>
        )}

        {/* ── AI advice (always visible if present) ── */}
        {memory.advice_given && (
          <div className="flex items-start gap-2 bg-indigo-50/60 rounded-xl px-3 py-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">{memory.advice_given}</p>
          </div>
        )}

        {/* ── Follow-up reminder (always visible if present) ── */}
        {memory.follow_up && (
          <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2 mb-2">
            <Bell className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">{memory.follow_up}</p>
          </div>
        )}

        {/* ── Expanded: raw user text ── */}
        {expanded && memory.content && memory.summary && (
          <div className="mt-3 pt-3 border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">原始记录</p>
            <p className="text-xs text-slate-400 leading-relaxed">{memory.content}</p>
          </div>
        )}

        {/* ── Expand / collapse toggle ── */}
        <div className="flex items-center justify-between mt-3 pt-2">
          {memory.score != null && (
            <span className="text-[10px] text-slate-300 font-bold">
              Relevance: {(memory.score * 100).toFixed(0)}%
            </span>
          )}
          <span className="ml-auto text-slate-300">
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
