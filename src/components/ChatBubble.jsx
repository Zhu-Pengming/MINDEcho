import React from 'react';
import { Brain } from 'lucide-react';
import EmotionPill from './EmotionPill';

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #534AB7, #378ADD)' }}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed font-medium ${
            isUser
              ? 'bg-slate-900 text-white rounded-br-sm shadow-md'
              : message.isSystem
              ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-bl-sm'
              : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'
          }`}
        >
          {message.content.split('\n\n').map((block, bi) => (
            <p key={bi} className={bi > 0 ? 'mt-3' : ''}>
              {block.split('\n').map((line, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>

        {!isUser && message.emotion && (
          <EmotionPill emotion={message.emotion} />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
