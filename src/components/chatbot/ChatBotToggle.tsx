import { useState } from 'react';
import { MessageCircle, Sparkles, Brain, Zap, Globe, Star } from 'lucide-react';
import ChatBot from './ChatBot';

const ChatBotToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChatBot}
          className={`group relative w-16 h-16 bg-gradient-to-r from-[#E50914] to-[#f6121d] hover:from-[#f6121d] hover:to-[#E50914] text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-label="Open Harsha AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E50914] to-[#f6121d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          
          <div className="relative flex items-center justify-center w-full h-full">
            {isOpen ? (
              <MessageCircle size={24} className="transform rotate-180" />
            ) : (
              <div className="relative">
                <Brain size={24} />
                <Globe size={10} className="absolute -top-1 -right-1 text-blue-300 animate-pulse" />
                <Sparkles size={8} className="absolute -bottom-1 -left-1 text-yellow-300 animate-bounce" />
                <Star size={6} className="absolute top-0 left-0 text-green-300 animate-ping" />
              </div>
            )}
          </div>

          {/* Enhanced notification indicators */}
          {!isOpen && (
            <>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full animate-bounce"></div>
            </>
          )}

          {/* Enhanced tooltip */}
          <div className="absolute bottom-full right-0 mb-3 px-4 py-3 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none backdrop-blur-sm border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={14} />
              <span className="font-semibold">Harsha AI Assistant</span>
              <Globe size={12} className="text-blue-300" />
            </div>
            <div className="text-xs opacity-90 space-y-1">
              <div className="flex items-center gap-1">
                <Sparkles size={10} className="text-yellow-300" />
                <span>Advanced AI Technology</span>
              </div>
              <div>🎬 Entertainment • 🌍 General Knowledge • 🤖 Any Question</div>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/95"></div>
          </div>
        </button>

        {/* Enhanced ripple effects */}
        <div className="absolute inset-0 rounded-full bg-[#E50914] opacity-20 animate-ping pointer-events-none"></div>
        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-15 animate-ping animation-delay-200 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-full bg-yellow-500 opacity-10 animate-ping animation-delay-400 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-12 animate-ping animation-delay-600 pointer-events-none"></div>
      </div>

      {/* ChatBot Component */}
      <ChatBot isOpen={isOpen} onToggle={toggleChatBot} />
    </>
  );
};

export default ChatBotToggle;