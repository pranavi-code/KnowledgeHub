import {
  BookOpen, Brain, ChevronRight, Clock, Code, Copy, FileText, GitBranch,
  MessageSquare, Search, Send, Sparkles, Star, ThumbsDown, ThumbsUp,
  TrendingUp, Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AIKnowledgeAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI Knowledge Assistant. I can help you understand past technical decisions, find architectural rationale, and explore project history. What would you like to know?",
      timestamp: new Date(Date.now() - 5000),
      sources: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [useRag, setUseRag] = useState(true); // default to RAG, or false for agent
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "Why did we migrate from MongoDB to PostgreSQL?",
    "What was the rationale behind our microservices architecture?",
    "How did we implement authentication in the v2.0 release?",
    "What performance optimizations were made last quarter?",
    "Why did we choose Kubernetes over Docker Swarm?",
    "What were the key decisions in our API design?"
  ];

  const recentTopics = [
    { icon: Code, title: "React to Vue Migration", category: "Architecture", confidence: 95 },
    { icon: GitBranch, title: "CI/CD Pipeline Changes", category: "DevOps", confidence: 89 },
    { icon: FileText, title: "API Versioning Strategy", category: "Backend", confidence: 92 },
    { icon: MessageSquare, title: "Database Schema Evolution", category: "Database", confidence: 87 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Example: Use a toggle or state to choose endpoint
    const endpoint = useRag ? '/api/rag-chat' : '/api/agent-query';

    let data;
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      data = await response.json();
    } catch (error) {
      console.error('Error fetching response:', error);
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date(),
        sources: [],
        confidence: 0
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      return;
    }

    const aiResponse = {
      id: Date.now() + 1,
      type: 'assistant',
      content: data.response || data.error || "Sorry, I couldn't find an answer.",
      timestamp: new Date(),
      sources: data.sources || [],
      confidence: data.confidence || 90
    };
    setMessages(prev => [...prev, aiResponse]);

    setIsLoading(false);
    setQuery(''); // Clear the input
  };

  const handleSuggestedQuestion = (question) => {
    setQuery(question);
  };

  const SourceCard = ({ source }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
        {source.type === 'github' && <GitBranch className="w-4 h-4 text-gray-700" />}
        {source.type === 'docs' && <FileText className="w-4 h-4 text-gray-700" />}
        {source.type === 'meeting' && <MessageSquare className="w-4 h-4 text-gray-700" />}
        {source.type === 'issue' && <Code className="w-4 h-4 text-gray-700" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {source.title}
        </p>
        <p className="text-xs text-gray-500">
          {source.relevance}% relevance
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
    </div>
  );

  const MessageBubble = ({ message }) => (
    <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      {message.type === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-gray-700" />
        </div>
      )}
      <div className={`max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
        <div className={`p-4 rounded-2xl ${message.type === 'user'
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
            {message.content}
          </p>
          {message.confidence && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Confidence: {message.confidence}%</span>
              </div>
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Sources
            </p>
            {message.sources.map((source, idx) => (
              <SourceCard key={idx} source={source} />
            ))}
          </div>
        )}

        {message.type === 'assistant' && (
          <div className="flex items-center gap-2 mt-3">
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ThumbsUp className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ThumbsDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
      {message.type === 'user' && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">U</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto bg-white">
      {/* Page Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
            <Brain className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Knowledge Assistant</h1>
            <p className="text-sm text-gray-500">Ask about technical decisions, architecture, or project history</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {recentTopics.map((topic, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                      <topic.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{topic.category}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">{topic.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Try asking...
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.slice(0, 4).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-3 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-blue-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[700px] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about technical decisions, architecture, or project history..."
                  className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                AI can make mistakes. Verify important information with your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKnowledgeAssistant;