import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/mockData';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
          COMMON INQUIRIES & PLATFORM PROTOCOLS
        </h2>
        <p className="text-zinc-400 text-sm">
          Everything you need to know about Tesla servicing, crypto settlements, promotional scratch jackpots, and custom wrap maintenance.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden transition"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-white hover:text-red-400 transition"
              >
                <span className="font-heading font-bold text-sm sm:text-base">
                  {item.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900 animate-in fade-in">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
