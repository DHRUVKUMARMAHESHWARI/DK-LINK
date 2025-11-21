
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, LinkItem, PasswordItem, CalendarEvent } from '../types';
import { chatWithAI } from '../services/geminiService';
import { api } from '../services/api';
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';

interface AiAssistantProps {
  contextData: {
    links: LinkItem[];
    passwords: PasswordItem[];
    events: CalendarEvent[];
  };
  userId: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ contextData, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persistent history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getChats(userId);
        if (history.length > 0) {
          setMessages(history);
        } else {
           // Set welcome message only if history is empty
           setMessages([{
            id: 'welcome',
            role: 'model',
            text: "Hello! I'm Nexus, your personal AI assistant. I have access to your links, safe-guarded password metadata, and schedule. How can I help you organize your life today?",
            timestamp: Date.now()
          }]);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    };
    loadHistory();
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Persist user message
    api.addChat(userMsg, userId).catch(e => console.error("Failed to save chat", e));

    // Prepare context string
    const contextString = `
      Links: ${contextData.links.map(l => `${l.title} (${l.url}) - Tags: ${l.tags.join(',')}`).join('; ')}
      Passwords Stored For: ${contextData.passwords.map(p => p.site).join(', ')}
      Upcoming Events: ${contextData.events.filter(e => !e.completed).map(e => `${e.title} on ${e.date}`).join('; ')}
    `;

    const responseText = await chatWithAI(userMsg.text, contextString);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
    
    // Persist AI message
    api.addChat(aiMsg, userId).catch(e => console.error("Failed to save chat", e));
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl overflow-hidden relative animate-in fade-in duration-500">
      <div className="bg-indigo-600 p-4 flex items-center text-white">
        <div className="p-2 bg-white/20 rounded-lg mr-3">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold">Nexus AI Chat</h3>
          <p className="text-xs text-indigo-200">Powered by Gemini 2.5 • Auto-clears daily</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white/40">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${msg.role === 'user' ? 'bg-indigo-100 ml-3 text-indigo-600' : 'bg-emerald-100 mr-3 text-emerald-600'}`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-white/50'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center bg-white/50 px-4 py-2 rounded-full">
              <Loader2 size={16} className="animate-spin text-indigo-600 mr-2" />
              <span className="text-xs text-slate-500">Nexus is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/60 border-t border-white/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your links, schedule, or for advice..."
          className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white/80 text-slate-800 placeholder:text-slate-400"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;
