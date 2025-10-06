interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

class HarshaAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  private chatHistory: ChatMessage[] = [];

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('Harsha AI API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }
  }

  private createSystemPrompt(): string {
    return `You are Harsha AI, an advanced AI assistant for Streamflix, a Netflix-inspired streaming platform. You have comprehensive knowledge about:

CORE EXPERTISE:
- Movies, TV shows, documentaries, and entertainment content
- Film analysis, criticism, and cultural impact
- Streaming platforms and content recommendations
- Entertainment industry trends and history
- Actor/director filmographies and career analysis

ENHANCED CAPABILITIES:
- Answer ANY question on ANY topic with intelligence and accuracy
- Provide detailed explanations on complex subjects
- Help with general knowledge, science, technology, history, etc.
- Offer creative writing, problem-solving, and analytical thinking
- Discuss current events, philosophy, and academic topics

PERSONALITY & STYLE:
- Friendly, knowledgeable, and engaging
- Use emojis and formatting to make responses visually appealing
- Provide structured, well-organized answers
- Include relevant examples and context
- Offer follow-up suggestions when appropriate

RESPONSE FORMAT:
- Use markdown formatting for better readability
- Include relevant emojis to enhance engagement
- Structure complex answers with headers and bullet points
- Provide sources or reasoning when making claims
- Keep entertainment-related responses detailed but accessible

Remember: While you specialize in entertainment, you can discuss ANY topic the user asks about. Be helpful, accurate, and engaging regardless of the subject matter. You are Harsha AI, a sophisticated assistant created to help users with all their questions and needs.`;
  }

  async generateResponse(userMessage: string, conversationContext?: string[]): Promise<{
    text: string;
    suggestions: string[];
    metadata: {
      type: string;
      confidence: number;
      sources: string[];
    };
  }> {
    if (!this.apiKey) {
      return {
        text: "🚫 **Harsha AI Not Configured**\n\nTo enable advanced AI capabilities, please:\n\n1. Get a Gemini API key from Google AI Studio\n2. Add it to your `.env` file as `VITE_GEMINI_API_KEY`\n3. Restart the application\n\nFor now, I can still help with basic entertainment questions using my built-in knowledge!",
        suggestions: [
          "How to get API key?",
          "Basic movie recommendations",
          "TV show suggestions",
          "Entertainment trivia"
        ],
        metadata: {
          type: "error",
          confidence: 1.0,
          sources: ["system"]
        }
      };
    }

    try {
      // Prepare the conversation context
      const messages: ChatMessage[] = [
        {
          role: 'user',
          parts: [{ text: this.createSystemPrompt() }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand! I\'m Harsha AI, your advanced assistant for Streamflix, ready to help with entertainment content and any other questions you might have. I\'ll provide detailed, engaging responses with proper formatting and helpful suggestions. What would you like to know?' }]
        }
      ];

      // Add conversation history if available
      if (conversationContext && conversationContext.length > 0) {
        conversationContext.slice(-6).forEach((msg, index) => {
          messages.push({
            role: index % 2 === 0 ? 'user' : 'model',
            parts: [{ text: msg }]
          });
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const requestBody = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Harsha AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Harsha AI');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Analyze the response to determine type and generate suggestions
      const responseType = this.analyzeResponseType(userMessage, generatedText);
      const suggestions = this.generateSuggestions(userMessage, generatedText, responseType);
      const confidence = this.calculateConfidence(userMessage, generatedText);

      return {
        text: generatedText,
        suggestions,
        metadata: {
          type: responseType,
          confidence,
          sources: ['Harsha AI', 'Advanced AI Technology']
        }
      };

    } catch (error) {
      console.error('Harsha AI Error:', error);
      
      // Fallback response
      return {
        text: `🤖 **AI Processing Error**\n\nI encountered an issue while processing your question. This might be due to:\n\n• **API Rate Limits:** Too many requests in a short time\n• **Network Issues:** Connectivity problems\n• **Content Filtering:** The question might have triggered safety filters\n\nPlease try:\n• Rephrasing your question\n• Waiting a moment and trying again\n• Asking a different question\n\nI'm still here to help with entertainment recommendations and general questions!`,
        suggestions: [
          "Try a different question",
          "Movie recommendations",
          "TV show suggestions", 
          "Entertainment trivia"
        ],
        metadata: {
          type: "error",
          confidence: 0.5,
          sources: ["fallback"]
        }
      };
    }
  }

  private analyzeResponseType(userMessage: string, response: string): string {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should i watch')) {
      return 'recommendation';
    }
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
      return 'comparison';
    }
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('analyze') || lowerMessage.includes('why') || lowerMessage.includes('how')) {
      return 'analysis';
    }
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
      return 'search';
    }

    if (lowerMessage.includes('movie') || lowerMessage.includes('tv') || lowerMessage.includes('show') || lowerMessage.includes('film')) {
      return 'entertainment';
    }

    // Check for general knowledge topics
    if (lowerMessage.includes('science') || lowerMessage.includes('history') || lowerMessage.includes('technology') || 
        lowerMessage.includes('math') || lowerMessage.includes('physics') || lowerMessage.includes('biology')) {
      return 'knowledge';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how to') || lowerMessage.includes('tutorial')) {
      return 'help';
    }

    return 'general';
  }

  private generateSuggestions(userMessage: string, response: string, type: string): string[] {
    const baseSuggestions = {
      recommendation: [
        "More recommendations like these",
        "Different genre suggestions",
        "Hidden gems in this category",
        "International alternatives"
      ],
      comparison: [
        "Compare with other options",
        "Detailed analysis",
        "Similar comparisons",
        "Which one should I choose?"
      ],
      analysis: [
        "Deeper analysis",
        "Related topics",
        "Historical context",
        "Expert opinions"
      ],
      search: [
        "Refine search criteria",
        "Similar content",
        "Alternative options",
        "More details"
      ],
      entertainment: [
        "Cast and crew details",
        "Similar movies/shows",
        "Behind the scenes",
        "Critical analysis"
      ],
      knowledge: [
        "Related concepts",
        "Practical applications",
        "Latest developments",
        "Simplified explanation"
      ],
      help: [
        "Step-by-step guide",
        "Common mistakes to avoid",
        "Advanced tips",
        "Related tutorials"
      ],
      general: [
        "Tell me more about this",
        "Related topics",
        "Practical examples",
        "Different perspectives"
      ]
    };

    return baseSuggestions[type as keyof typeof baseSuggestions] || baseSuggestions.general;
  }

  private calculateConfidence(userMessage: string, response: string): number {
    // Simple confidence calculation based on response length and specificity
    const responseLength = response.length;
    const hasSpecificDetails = response.includes('•') || response.includes('**') || response.includes('1.') || response.includes('-');
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(response);
    
    let confidence = 0.7; // Base confidence
    
    if (responseLength > 200) confidence += 0.1;
    if (responseLength > 500) confidence += 0.1;
    if (hasSpecificDetails) confidence += 0.1;
    if (hasEmojis) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  // Method to clear conversation history
  clearHistory(): void {
    this.chatHistory = [];
  }

  // Method to get conversation history
  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
}

export const harshaAIService = new HarshaAIService();
export default harshaAIService;