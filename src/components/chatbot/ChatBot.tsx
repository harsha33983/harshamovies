import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Film, Tv, Search, Star, Brain, Zap, Heart, Clock, TrendingUp, Award, Globe, BookOpen, Lightbulb, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchContent, fetchTrending, fetchMovies, fetchTVShows } from '../../services/api';
import geminiService from '../../services/gemini';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  isLoading?: boolean;
  metadata?: {
    type?: 'recommendation' | 'search' | 'analysis' | 'comparison' | 'entertainment' | 'knowledge' | 'help' | 'general' | 'error';
    confidence?: number;
    sources?: string[];
  };
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface UserContext {
  preferences: {
    genres: string[];
    actors: string[];
    directors: string[];
    recentQueries: string[];
    favoriteDecades: string[];
    moodHistory: string[];
    topics: string[];
  };
  conversationHistory: string[];
  currentSession: {
    topic?: string;
    context?: string;
    lastRecommendations?: any[];
  };
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    preferences: {
      genres: [],
      actors: [],
      directors: [],
      recentQueries: [],
      favoriteDecades: [],
      moodHistory: [],
      topics: []
    },
    conversationHistory: [],
    currentSession: {}
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  // Enhanced context understanding
  const updateUserContext = (query: string, response: any) => {
    setUserContext(prev => {
      const newContext = { ...prev };
      
      // Extract and store preferences
      const genres = extractGenres(query);
      const actors = extractActors(query);
      const mood = extractMood(query);
      const topics = extractTopics(query);
      
      if (genres.length > 0) {
        newContext.preferences.genres = [...new Set([...newContext.preferences.genres, ...genres])];
      }
      
      if (actors.length > 0) {
        newContext.preferences.actors = [...new Set([...newContext.preferences.actors, ...actors])];
      }
      
      if (mood) {
        newContext.preferences.moodHistory = [...newContext.preferences.moodHistory.slice(-4), mood];
      }

      if (topics.length > 0) {
        newContext.preferences.topics = [...new Set([...newContext.preferences.topics, ...topics])];
      }
      
      // Update conversation history
      newContext.conversationHistory = [...newContext.conversationHistory.slice(-9), query];
      
      return newContext;
    });
  };

  // Enhanced query processing with Harsha AI
  const processQuery = async (query: string): Promise<Message> => {
    try {
      // Check if it's a simple entertainment query that can be handled with real data
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('trending') || lowerQuery.includes('popular now')) {
        return await handleTrendingQuery(query);
      }
      
      if (lowerQuery.includes('search for') && (lowerQuery.includes('movie') || lowerQuery.includes('show'))) {
        return await handleSearchQuery(query);
      }

      // Use Harsha AI for all other queries
      const response = await geminiService.generateResponse(query, userContext.conversationHistory);
      
      // Update user context
      updateUserContext(query, response);
      
      return {
        id: Date.now().toString(),
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        suggestions: response.suggestions,
        metadata: response.metadata
      };
      
    } catch (error) {
      console.error('Error processing query:', error);
      
      return {
        id: Date.now().toString(),
        text: `🤖 **Processing Error**\n\nI encountered an issue while processing your question. This could be due to:\n\n• **Network connectivity issues**\n• **API rate limits**\n• **Temporary service unavailability**\n\nPlease try:\n• Rephrasing your question\n• Waiting a moment and trying again\n• Asking a simpler question\n\nI'm here to help with any topic you'd like to discuss!`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'Try a different question',
          'Movie recommendations',
          'General knowledge question',
          'Help with something else'
        ],
        metadata: {
          type: 'error',
          confidence: 0.5,
          sources: ['fallback']
        }
      };
    }
  };

  // Handle trending queries with real data
  const handleTrendingQuery = async (query: string) => {
    try {
      const trendingData = await fetchTrending('all', 'day');
      const topItems = trendingData.results.slice(0, 5);
      
      return {
        id: Date.now().toString(),
        text: `🔥 **Real-Time Trending Content**\n\nHere's what's actually trending on Streamflix right now:\n\n${topItems.map((item: any, index: number) => 
          `${index + 1}. **${item.title || item.name}** ${item.media_type === 'tv' ? '📺' : '🎬'}\n   ⭐ ${(item.vote_average / 10 * 5).toFixed(1)}/5 stars\n   📊 Popularity: ${Math.round(item.popularity)}`
        ).join('\n\n')}\n\nThese are based on real user engagement and viewing patterns. Would you like details about any of these?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: topItems.slice(0, 3).map((item: any) => `Tell me about ${item.title || item.name}`),
        metadata: {
          type: 'entertainment',
          confidence: 1.0,
          sources: ['TMDB API', 'real-time data']
        }
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        text: `🔥 **Trending Content**\n\nI'm having trouble accessing real-time trending data right now, but I can still help you discover great content! Here are some universally popular options:\n\n🎬 **Movies:**\n• The Shawshank Redemption\n• Inception\n• Parasite\n• Dune\n• Everything Everywhere All at Once\n\n📺 **TV Shows:**\n• Breaking Bad\n• Stranger Things\n• The Crown\n• Wednesday\n• House of the Dragon\n\nWhat type of content are you in the mood for?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'Action movies',
          'Comedy series',
          'Sci-fi recommendations',
          'International content'
        ],
        metadata: {
          type: 'entertainment',
          confidence: 0.8,
          sources: ['curated list']
        }
      };
    }
  };

  // Handle search queries with real data
  const handleSearchQuery = async (query: string) => {
    const searchTerm = query.match(/search for (.+)/i)?.[1] || query;
    
    try {
      const searchResults = await searchContent(searchTerm);
      const topResults = searchResults.results.slice(0, 5);
      
      if (topResults.length === 0) {
        return {
          id: Date.now().toString(),
          text: `🔍 **Search Results**\n\nNo results found for "${searchTerm}". Try:\n\n• **Different keywords** - Use alternative terms\n• **Broader search** - Remove specific details\n• **Check spelling** - Verify the title is correct\n\nWould you like me to suggest similar content or help you find something else?`,
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            'Suggest similar content',
            'Popular movies',
            'Top TV shows',
            'Help me find something'
          ],
          metadata: {
            type: 'search',
            confidence: 0.6,
            sources: ['TMDB search']
          }
        };
      }
      
      return {
        id: Date.now().toString(),
        text: `🔍 **Search Results for "${searchTerm}"**\n\n${topResults.map((item: any, index: number) => 
          `${index + 1}. **${item.title || item.name}** ${item.media_type === 'tv' ? '📺' : '🎬'}\n   ⭐ ${item.vote_average ? (item.vote_average / 10 * 5).toFixed(1) : 'N/A'}/5 stars\n   📅 ${item.release_date || item.first_air_date || 'Unknown'}`
        ).join('\n\n')}\n\nWould you like more details about any of these?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: topResults.slice(0, 3).map((item: any) => `Details about ${item.title || item.name}`),
        metadata: {
          type: 'search',
          confidence: 1.0,
          sources: ['TMDB search API']
        }
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        text: `🔍 **Search Error**\n\nI'm having trouble searching right now. Let me help you in other ways:\n\n• **Ask me anything** - I can discuss any topic\n• **Get recommendations** - Tell me your preferences\n• **Explore genres** - What type of content interests you?\n• **General questions** - I'm here for any questions!\n\nWhat would you like to know?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'Movie recommendations',
          'Ask a general question',
          'Explore different genres',
          'Help with something else'
        ],
        metadata: {
          type: 'error',
          confidence: 0.5,
          sources: ['fallback']
        }
      };
    }
  };

  // Helper functions for extraction and analysis
  const extractGenres = (query: string): string[] => {
    const genres = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'science fiction', 'romance', 'thriller', 'fantasy', 'documentary', 'animation', 'adventure', 'crime', 'mystery', 'war', 'western', 'musical', 'biography', 'history', 'sport'];
    return genres.filter(genre => query.toLowerCase().includes(genre));
  };

  const extractActors = (query: string): string[] => {
    const commonActors = ['tom hanks', 'meryl streep', 'leonardo dicaprio', 'scarlett johansson', 'robert downey jr', 'jennifer lawrence', 'brad pitt', 'angelina jolie', 'will smith', 'denzel washington'];
    return commonActors.filter(actor => query.toLowerCase().includes(actor));
  };

  const extractMood = (query: string): string | null => {
    const moods = ['happy', 'sad', 'romantic', 'scary', 'thoughtful', 'energetic', 'relaxing', 'excited', 'calm', 'adventurous'];
    return moods.find(mood => query.toLowerCase().includes(mood)) || null;
  };

  const extractTopics = (query: string): string[] => {
    const topics = ['science', 'technology', 'history', 'art', 'music', 'sports', 'politics', 'philosophy', 'psychology', 'education', 'health', 'travel', 'food', 'nature', 'space', 'literature', 'mathematics', 'physics', 'biology', 'chemistry'];
    return topics.filter(topic => query.toLowerCase().includes(topic));
  };

  // Get appropriate icon for message type
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'recommendation': return <Star size={12} className="text-yellow-400" />;
      case 'search': return <Search size={12} className="text-blue-400" />;
      case 'analysis': return <Brain size={12} className="text-purple-400" />;
      case 'comparison': return <TrendingUp size={12} className="text-green-400" />;
      case 'entertainment': return <Film size={12} className="text-red-400" />;
      case 'knowledge': return <BookOpen size={12} className="text-indigo-400" />;
      case 'help': return <HelpCircle size={12} className="text-orange-400" />;
      case 'general': return <Globe size={12} className="text-gray-400" />;
      case 'error': return <X size={12} className="text-red-500" />;
      default: return <Lightbulb size={12} className="text-yellow-400" />;
    }
  };

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi${currentUser ? ` ${currentUser.email?.split('@')[0]}` : ''}! 🧠✨\n\nI'm **Harsha AI**, your intelligent assistant for Streamflix! I can help you with:\n\n🎬 **Entertainment & Streaming**\n• Movie and TV show recommendations\n• Content analysis and reviews\n• Cast and crew information\n• Trending content discovery\n\n🌍 **General Knowledge**\n• Science, technology, and research\n• History, culture, and current events\n• Education and learning support\n• Creative writing and brainstorming\n\n🤖 **Advanced Capabilities**\n• Complex problem solving\n• Detailed explanations on any topic\n• Comparative analysis\n• Step-by-step tutorials\n\n**Ask me anything!** From "What should I watch tonight?" to "Explain quantum physics" - I'm here to help with any question you have.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'What should I watch tonight?',
          'Explain a complex topic',
          'Help me learn something new',
          'Creative writing assistance',
          'Current trending movies',
          'Science and technology questions'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Process query with enhanced AI
      const botResponse = await processQuery(currentInput);
      
      // Simulate realistic typing delay based on response complexity
      const typingDelay = Math.min(1500 + (botResponse.text.length * 15), 4000);
      
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, typingDelay);
    } catch (error) {
      console.error('Error processing query:', error);
      
      const errorResponse: Message = {
        id: Date.now().toString(),
        text: '🤔 I encountered an unexpected error. Please try asking your question again, or try a different question. I\'m here to help with anything you\'d like to know!',
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'Try a different question',
          'Ask for recommendations',
          'General knowledge question',
          'Help with something else'
        ]
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 animate-scaleIn transition-colors duration-300 ${
      window.innerWidth <= 640 
        ? 'inset-0 bg-white dark:bg-gray-900 chatbot-container' 
        : 'bottom-4 right-4 w-80 sm:w-96 h-[500px] sm:h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700'
    } flex flex-col`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#E50914] to-[#f6121d] text-white rounded-t-2xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Brain size={16} className="sm:w-5 sm:h-5" />
            <Sparkles size={10} className="sm:w-3 sm:h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              Harsha AI
              <Globe size={12} className="sm:w-3.5 sm:h-3.5 text-blue-300" />
            </h3>
            <p className="text-xs opacity-90">Advanced AI Assistant • Universal Knowledge</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 touch-target"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Messages with enhanced styling */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot 
                  ? 'bg-gradient-to-r from-[#E50914] to-[#f6121d] text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {message.isBot ? <Brain size={12} className="sm:w-4 sm:h-4" /> : <User size={12} className="sm:w-4 sm:h-4" />}
              </div>
              <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                message.isBot
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'bg-[#E50914] text-white'
              } transition-colors duration-300 relative`}>
                <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed chatbot-message">{message.text}</p>
                
                {/* Enhanced metadata display for bot messages */}
                {message.isBot && message.metadata && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs opacity-70">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {getTypeIcon(message.metadata.type)}
                        <span className="capitalize text-xs">{message.metadata.type || 'response'}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs">Confidence: {Math.round((message.metadata.confidence || 0) * 100)}%</span>
                        {message.metadata.sources && message.metadata.sources.length > 0 && (
                          <span title={`Sources: ${message.metadata.sources.join(', ')}`}>
                            📊
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced suggestions */}
        {messages.length > 0 && messages[messages.length - 1].suggestions && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
            {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 sm:px-3 sm:py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-[#E50914] hover:to-[#f6121d] hover:text-white text-gray-700 dark:text-gray-300 rounded-full transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600 shadow-sm touch-target"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Enhanced typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#E50914] to-[#f6121d] text-white flex items-center justify-center">
                <Brain size={12} className="sm:w-4 sm:h-4 animate-pulse" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 transition-colors duration-300">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 flex items-center gap-1">
                    <Sparkles size={10} className="sm:w-3 sm:h-3 animate-pulse" />
                    Harsha AI thinking
                  </span>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E50914] rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E50914] rounded-full animate-pulse animation-delay-200"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E50914] rounded-full animate-pulse animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything - entertainment, science, history, help with tasks..."
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm sm:text-base mobile-form-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#E50914] to-[#f6121d] hover:from-[#f6121d] hover:to-[#E50914] disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg touch-target"
          >
            <Send size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        
        {/* Enhanced context indicator */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Brain size={10} className="sm:w-3 sm:h-3" />
            <span>Powered by Harsha AI</span>
          </div>
          {userContext.conversationHistory.length > 0 && (
            <div className="flex items-center gap-1">
              <Globe size={10} className="sm:w-3 sm:h-3" />
              <span>Learning from {userContext.conversationHistory.length} queries</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;