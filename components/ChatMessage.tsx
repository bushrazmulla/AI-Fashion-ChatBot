import React from 'react';
import { Message } from '../types';
import { AuraIcon, UserIcon } from './IconComponents';
import SourceLink from './SourceLink';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${isModel ? 'bg-[#550B14]' : 'bg-[#7E6961]'}`}>
        {isModel ? <AuraIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
      </div>
      <div className={`max-w-xl p-4 rounded-2xl ${isModel ? 'bg-stone-100 text-gray-800 rounded-tl-none' : 'bg-[#7E6961] text-white rounded-tr-none'}`}>
        {message.image && (
            <img 
              src={message.image} 
              alt="User upload" 
              className="mb-3 rounded-lg max-h-64 w-auto border border-gray-200" 
            />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        
        {message.responseImages && message.responseImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {message.responseImages.map((img, index) => (
              <img
                key={`${message.id}-response-img-${index}`}
                src={img.url}
                alt={img.alt}
                className="w-full h-auto rounded-lg object-cover aspect-square fade-in"
              />
            ))}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#CBC0B2] space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">Sources:</h4>
            {message.sources.map((source, index) => (
              <SourceLink key={`${message.id}-source-${index}`} source={source} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingMessage: React.FC = () => (
  <div className="flex items-start gap-3 my-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#550B14] text-white">
      <AuraIcon className="w-5 h-5" />
    </div>
    <div className="max-w-xl p-4 rounded-2xl bg-stone-100 text-gray-800 rounded-tl-none">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
      </div>
    </div>
  </div>
);

export { ChatMessage, LoadingMessage };