'use client';

import React, { useEffect, useRef, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import KinCharacter from '@/components/ui/KinCharacter';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const quickReplies = [
  'What are the most important updates?',
  'Summarize recent changes',
  'Any deadlines coming up?',
  'Scan my watchlist now',
];

export default function KinPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickReply(text: string) {
    setInput(text);
  }

  // Simple markdown rendering for Kin responses
  function renderMessageContent(content: string) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Bullet points
      if (processed.startsWith('- ') || processed.startsWith('• ')) {
        return <div key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: `• ${processed.substring(2)}` }} />;
      }
      // Numbered lists
      if (/^\d+\.\s/.test(processed)) {
        return <div key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
      }
      return <div key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: processed || '&nbsp;' }} />;
    });
  }

  return (
    <>
      <TopBar 
        title="Kin AI" 
        subtitle="Ask Kin about your signals, websites, or what to do next."
        unreadSignals={0}
        showSearch={false}
      />
      
      <div className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[720px] mx-auto">
            {initialLoading ? (
              <div className="text-center py-16 text-[#8A8D9A]">Loading conversation...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6 inline-block">
                  <KinCharacter size={100} state="happy" />
                </div>
                <h2 className="text-[22px] font-bold tracking-tight text-[#1A1A1E] mb-2">
                  Hi, I'm Kin
                </h2>
                <p className="text-[14px] text-[#5A5D6B] max-w-md mx-auto mb-8">
                  Your penguin AI companion. Ask me about changes on your monitored sites, 
                  what's important, or what you should do next.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="p-4 text-left rounded-[12px] bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(45,95,138,0.3)] hover:shadow-card-hover transition-all text-[13.5px] text-[#5A5D6B] hover:text-[#1A1A1E] group"
                    >
                      <Sparkles size={14} className="inline mr-2 text-[#D97706] group-hover:scale-110 transition-transform" />
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    {msg.role === 'assistant' && (
                      <div className="mr-3 mt-1 flex-shrink-0">
                        <KinCharacter size={32} animate={false} showShadow={false} />
                      </div>
                    )}
                    <div 
                      className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-kin max-w-[85%]'}
                    >
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="mr-3 mt-1 flex-shrink-0">
                      <KinCharacter size={32} state="thinking" animate={false} showShadow={false} />
                    </div>
                    <div className="chat-msg-kin flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#5A5D6B]" />
                      <span className="text-[#8A8D9A] text-[13px]">Kin is thinking…</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[rgba(0,0,0,0.06)] bg-white p-4">
          <div className="max-w-[720px] mx-auto">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Kin about your signals…"
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-[rgba(0,0,0,0.12)] rounded-[14px] text-[14px] font-sans text-[#1A1A1E] bg-[#FAFAF7] outline-none resize-none transition-all focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] focus:bg-white"
                  style={{ minHeight: '48px', maxHeight: '160px' }}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 flex-shrink-0 rounded-[12px] bg-[#1A1A1E] text-white flex items-center justify-center hover:bg-[#2A2A3A] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-2 text-center text-[11px] text-[#8A8D9A]">
              Powered by Zen Mimo V2.5 · Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
