"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, FileText } from 'lucide-react';

interface Source {
  title: string;
  slug: string;
  url?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const STARTER_QUESTIONS = [
  "What is RAG and how does it work?",
  "Explain Rust's ownership model",
  "What are the key system design patterns?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Skippy, your knowledge assistant. Ask me anything about Sunil's technical articles — System Design, AI Architecture, Rust, PyTorch, and more!"
    }
  ]);
  const hasUserMessages = messages.some((m) => m.role === 'user');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || '/api/chat';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      const token = process.env.NEXT_PUBLIC_CHAT_API_TOKEN;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned status ${response.status} - ${errorText.substring(0, 100)}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Invalid response format. Expected JSON backend.");
      }

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text, sources: data.sources || [] }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || "Sorry, I encountered an error. Please try again." }
        ]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Chat Error: ${error.message || "Network error. Please check your connection."}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-secondary text-slate-950 rounded-full shadow-[0_0_20px_rgba(125,249,255,0.4)] hover:shadow-[0_0_30px_rgba(125,249,255,0.7)] transition-all duration-300 hover:scale-110"
          aria-label="Open chat assistant"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <MessageSquare className="w-6 h-6 relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] glass-card rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 bg-slate-950/95">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  Skippy - AI Copilot
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400">Powered by Gemini · RAG</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                  }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[75%] ${msg.role === 'user'
                    ? 'bg-primary/10 text-white border border-primary/20 rounded-tr-none'
                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                  }`}>
                  {msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sources</span>
                      {msg.sources.map((s, si) => (
                        <a
                          key={si}
                          href={s.url || `/articles/${s.slug}`}
                          target={s.url?.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white/5 text-slate-300 border border-white/5 rounded-2xl rounded-tl-none flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            {/* Suggested starter questions */}
            {!hasUserMessages && !isLoading && (
              <div className="space-y-2 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Try asking</span>
                {STARTER_QUESTIONS.map((q, qi) => (
                  <button
                    key={qi}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-primary/20 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me a question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary text-slate-950 rounded-xl hover:bg-primary/80 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-[0_0_10px_rgba(125,249,255,0.3)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
