import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { faqsList } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const publishedFaqs = useMemo(
    () => faqsList.filter((f) => f.isPublished !== false),
    [faqsList]
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(publishedFaqs.map((f) => f.category || 'General')));
    return ['All', ...cats];
  }, [publishedFaqs]);

  const filteredFaqs = useMemo(() => {
    return publishedFaqs.filter((f) => {
      const matchCat = selectedCategory === 'All' || (f.category || 'General') === selectedCategory;
      const qLower = searchQuery.trim().toLowerCase();
      const matchSearch =
        !qLower ||
        (f.question || f.q || '').toLowerCase().includes(qLower) ||
        (f.answer || f.a || '').toLowerCase().includes(qLower) ||
        (f.category || '').toLowerCase().includes(qLower);
      return matchCat && matchSearch;
    });
  }, [publishedFaqs, selectedCategory, searchQuery]);

  const scrollToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(filteredFaqs.length - 1, idx));
    setActiveSlide(clamped);
    const container = sliderRef.current;
    const child = container?.children[clamped] as HTMLElement | undefined;
    if (container && child) {
      const cRect = container.getBoundingClientRect();
      const elRect = child.getBoundingClientRect();
      container.scrollTo({
        left: Math.max(0, container.scrollLeft + (elRect.left - cRect.left)),
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Deck ({publishedFaqs.length} Verified Guides)</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            PLATFORM PROTOCOLS &amp; FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Slide through comprehensive policies covering EV servicing, Robotaxi staking yields, TSLA Fast-ROI stock dividends, and international prize vehicle shipping.
          </p>
        </div>

        {/* Search & Slide Arrow Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveSlide(0);
              }}
              placeholder="Search any question..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              aria-label="Previous FAQ slide"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-red-500 text-zinc-200 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400 px-1">
              <strong className="text-white">{filteredFaqs.length === 0 ? 0 : activeSlide + 1}</strong> / {filteredFaqs.length}
            </span>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1)}
              disabled={activeSlide >= filteredFaqs.length - 1}
              aria-label="Next FAQ slide"
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-red-500 text-zinc-200 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveSlide(0);
                if (sliderRef.current) sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap border transition cursor-pointer ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/40'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Modern Horizontal Card Slider */}
      {filteredFaqs.length === 0 ? (
        <div className="p-10 rounded-3xl border border-zinc-800 bg-zinc-950 text-center text-xs text-zinc-400">
          No matching FAQs found for "{searchQuery}". Clear filters to inspect all {publishedFaqs.length} platform guides.
        </div>
      ) : (
        <div className="space-y-4">
          <div
            ref={sliderRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const step = el.scrollWidth / Math.max(1, filteredFaqs.length);
              const idx = Math.round(el.scrollLeft / step);
              if (idx !== activeSlide && idx >= 0 && idx < filteredFaqs.length) {
                setActiveSlide(idx);
              }
            }}
            className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredFaqs.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const isHighlighted = idx === activeSlide;
              return (
                <article
                  key={item.id}
                  onClick={() => {
                    setActiveSlide(idx);
                    setExpandedId(isExpanded ? null : item.id);
                  }}
                  className={`w-[270px] sm:w-[360px] lg:w-[400px] max-w-[calc(100vw-2.5rem)] shrink-0 snap-start rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer ${
                    isHighlighted
                      ? 'border-red-500/70 shadow-xl shadow-red-950/30'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-[10px] font-mono font-bold text-red-400 uppercase">
                        <Sparkles className="w-3 h-3" />
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-snug">
                      {item.question || item.q}
                    </h3>

                    <p
                      className={`text-xs text-zinc-300 leading-relaxed transition-all ${
                        isExpanded ? '' : 'line-clamp-4'
                      }`}
                    >
                      {item.answer || item.a}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono">Verified Protocol</span>
                    <span className="text-red-400 font-bold">
                      {isExpanded ? 'Collapse Answer' : 'Read Full Answer →'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
            {filteredFaqs.map((item, idx) => (
              <button
                key={`dot-${item.id}`}
                type="button"
                onClick={() => scrollToSlide(idx)}
                aria-label={`Jump to FAQ ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-7 bg-red-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
