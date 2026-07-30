'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hi! I am the Nexus AI Assistant. Describe your car trouble, and I will help you diagnose it or find the right part!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as 'en' | 'ar') || 'en';
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);

      // Handle Smart Actions
      if (data.action === 'redirect_tashleeh') {
        setTimeout(() => {
          const queryParams = new URLSearchParams();
          if (data.part) queryParams.append('partName', data.part);
          if (data.make) queryParams.append('make', data.make);
          if (data.model) queryParams.append('model', data.model);
          if (data.year) queryParams.append('year', data.year);
          
          router.push(`/${locale}/tashleeh?${queryParams.toString()}`);
          setIsOpen(false);
        }, 3000);
      } else if (data.action === 'redirect_towing') {
        setTimeout(() => {
          router.push(`/${locale}/towing`);
          setIsOpen(false);
        }, 3000);
      } else if (data.action === 'redirect_workshop') {
        setTimeout(() => {
          router.push(`/${locale}/workshop`);
          setIsOpen(false);
        }, 3000);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="text-2xl">✨</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-white">Nexus AI Assistant</h3>
                <p className="text-[10px] text-emerald-400">Online & Ready to Help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-700 text-slate-400 flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
