import React from 'react';

interface QuickReplyProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading: boolean;
}

const QuickReply: React.FC<QuickReplyProps> = ({ suggestions, onSelect, isLoading }) => {
  if (isLoading) return null;

  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2 justify-end">
      {suggestions.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm bg-white/0 border border-[#7E6961] text-[#550B14] rounded-full hover:bg-[#CBC0B2]/20 transition-colors disabled:opacity-50"
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default QuickReply;