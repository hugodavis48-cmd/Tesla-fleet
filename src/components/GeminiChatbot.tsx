import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Wrench,
  Palette,
  Car,
  Shield,
  Zap,
  Minimize2,
  Maximize2,
  Trash2,
} from 'lucide-react';

interface GeminiChatbotProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const { vehicles, userRole } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        "Welcome to **Apex Tesla Hub**. I am your **Gemini AI Service Specialist & Diagnostics Concierge**.\n\nI can analyze Tesla diagnostic codes, recommend bespoke body wraps, assist with Mobile Ranger bookings, explain crypto deposits, or check fleet rental availability. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external diagnostic triggers
  useEffect(() => {
    if (initialPrompt) {
      setIsOpen(true);
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const activeVehicle = vehicles[0];
      const endpoint = userRole === 'admin' ? '/api/gemini/support' : '/api/gemini/support';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userVehicle: activeVehicle
            ? {
                model: activeVehicle.model,
                trim: activeVehicle.trim,
                batterySoc: activeVehicle.batterySoc,
                odometer: activeVehicle.odometer,
              }
            : null,
          currentContext: `User Role: ${userRole}`,
        }),
      });

      const data = await res.json();
      const reply = data.text || "I've reviewed your request with our Apex engineering team. How else can we optimize your Tesla?";

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          "I am currently operating in resilient offline mode. Our master technicians recommend checking battery cell voltage balance or scheduling a diagnostic slot in Bay 4. You can also contact our emergency Mobile Ranger hotline 24/7.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Conversation history cleared. Ready for your next Tesla service or customization inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    { label: 'Refer & Earn $100', text: 'How does the Apex referral system work and how do I earn $100 credits per friend first deposit?' },
    { label: 'Diagnose Error Code', text: 'I am seeing Tesla warning code BMS_u018 and reduced acceleration. What is the cause?' },
    { label: 'Recommend Wrap', text: 'What wrap finishes look best on a Model S Plaid? Can you compare Satin Stealth Black vs Liquid Chrome?' },
    { label: 'Rental Rates', text: 'What is the daily rate and 0-60 performance for the Cybertruck Cyberbeast rental?' },
    { label: 'Crypto Payments', text: 'How do crypto deposits in XRP, USDT, and BTC work with zero platform fee?' },
    { label: 'Battery Health', text: 'What are the top recommendations to preserve long-term Tesla High-Voltage battery capacity?' },
  ];

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-950/70 hover:scale-105 transition-all duration-300 flex items-center gap-3 group border border-red-400/40"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="font-heading font-black text-xs uppercase tracking-wider block">
              Gemini AI Specialist
            </span>
            <span className="text-[10px] text-red-200 block -mt-0.5">
              Live Tesla Support & Diagnostics
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-zinc-950 border border-red-500/40 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-zinc-100 transition-all duration-300 ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-red-950/80 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Bot className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-sm text-white">Apex Gemini Concierge</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Tesla Maintenance, Wraps & Fleet Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick chip suggestions */}
          <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex gap-2 overflow-x-auto no-scrollbar text-xs">
            {quickPrompts.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip.text)}
                className="px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] whitespace-nowrap shrink-0 transition border border-zinc-700/60"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 ${
                      isAssistant
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                        : 'bg-red-600 text-white font-medium shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.content}</div>
                    <span
                      className={`text-[9px] block text-right font-mono ${
                        isAssistant ? 'text-zinc-500' : 'text-red-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Gemini AI is analyzing telemetry & diagnostics...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-zinc-900/90 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about maintenance, wraps, battery diagnostics, or rentals..."
                className="flex-1 bg-black/60 border border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
