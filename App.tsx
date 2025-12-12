import React from 'react';
import ChatInterface from './components/ChatInterface';
import { AuraLogo } from './components/IconComponents';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F7] text-gray-800 flex flex-col items-center justify-center p-2 sm:p-4">
      <main className="w-full h-[95vh] sm:h-full max-w-4xl mx-auto flex flex-col bg-white shadow-2xl shadow-[#7E6961]/20 rounded-2xl overflow-hidden border border-gray-200">
        <header className="p-4 sm:p-6 bg-[#550B14] flex flex-col items-center justify-center">
          <AuraLogo className="h-10 sm:h-12 w-auto text-[#F8F8F7]" />
          <p className="text-center text-sm text-[#CBC0B2] mt-2">Your Personal Style Confidante</p>
        </header>
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;