import React from 'react';
import { Brain } from 'lucide-react';

const EmptyState = ({ icon: Icon = Brain, title, subtitle, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
      <Icon className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-base font-black text-slate-400 mb-1.5">{title}</h3>
    {subtitle && <p className="text-sm text-slate-300 mb-6 max-w-xs">{subtitle}</p>}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
