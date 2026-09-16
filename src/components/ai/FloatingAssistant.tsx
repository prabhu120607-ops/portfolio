'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, X, Send, User, Bot, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/services/dbService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: "Welcome to NOVA. I am your editorial AI styling assistant. How can I help you curate your wardrobe today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    "What should I wear to a wedding?",
    "Show me black outfits.",
    "I need an outfit under ₹3000.",
    "Show me winter coats."
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    // Add user message
    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, chatHistory: history })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Add model message
        setMessages(prev => [...prev, { role: 'model', text: data.response }]);
        
        // Load recommended products if any returned
        if (data.recommendedProductIds && data.recommendedProductIds.length > 0) {
          const productsRes = await Promise.all(
            data.recommendedProductIds.map((id: string) => 
              fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null)
            )
          );
          setRecommendedProducts(productsRes.filter(Boolean));
        } else {
          setRecommendedProducts([]);
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: "I apologize, but I am experiencing difficulty accessing the archives right now. Please try again shortly." 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "It seems we are encountering connectivity difficulties. Please ensure your connection is active." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. Assistant Panel */}
      {isOpen ? (
        <div className="w-[380px] h-[550px] bg-[#FAF9F6] border border-[#E5E4E0] shadow-2xl flex flex-col animate-slide-up">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#1A1A1A]">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold">NOVA STYLIST</h3>
                <span className="text-[10px] text-emerald-400 font-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Expert
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-[#E5E4E0] flex-shrink-0 flex items-center justify-center text-[#1A1A1A]">
                    <Bot size={12} />
                  </div>
                )}
                
                <div className={`p-3 max-w-[80%] border ${
                  m.role === 'user' 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                    : 'bg-[#F3F2EE] text-gray-800 border-[#E5E4E0]'
                }`}>
                  <p className="whitespace-pre-line font-light">{m.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#E5E4E0] flex-shrink-0 flex items-center justify-center text-[#1A1A1A]">
                  <Bot size={12} />
                </div>
                <div className="p-3 bg-[#F3F2EE] border border-[#E5E4E0] flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            
            {/* Auto scroll pointer */}
            <div ref={messagesEndRef} />
          </div>

          {/* Recommendations Area (if any matching items) */}
          {recommendedProducts.length > 0 && (
            <div className="bg-[#F3F2EE] border-t border-[#E5E4E0] p-3 space-y-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Recommended Essentials:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {recommendedProducts.map((p) => (
                  <Link 
                    key={p.id}
                    href={`/product/${p.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex-shrink-0 bg-white border border-[#E5E4E0] p-1.5 flex items-center gap-2 hover:border-[#1A1A1A] transition-colors w-[150px]"
                  >
                    <div className="w-8 h-10 bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[10px] leading-tight truncate">
                      <p className="font-bold text-gray-800 truncate">{p.name}</p>
                      <p className="text-gray-400 mt-0.5">₹{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Starter Questions panel if history is empty */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-[#E5E4E0] space-y-2 bg-[#F3F2EE]/40">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">Curated Prompts</span>
              <div className="grid grid-cols-2 gap-2">
                {starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left bg-white border border-[#E5E4E0] p-2 hover:border-[#1A1A1A] transition-colors text-[10px] font-light leading-relaxed text-gray-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Form */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-[#E5E4E0] bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask for outfits, items, sizes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#F3F2EE] border border-[#E5E4E0] text-xs px-3 py-2.5 focus:outline-none focus:border-[#1A1A1A] font-light text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] text-white hover:bg-black p-2.5 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      ) : (
        /* 2. Floating bubble button */
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#1A1A1A] hover:bg-black text-white shadow-2xl flex items-center justify-center group hover:scale-105 transition-all duration-300 border border-[#FAF9F6]/10"
          aria-label="Open AI Stylist"
        >
          <Sparkles className="group-hover:rotate-12 transition-transform duration-300" size={24} />
        </button>
      )}
    </div>
  );
}
