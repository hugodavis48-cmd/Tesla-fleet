import React from 'react';
import { SitePage } from '../types';
import { ArrowLeft, Calendar, FileText, Globe, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomPageViewProps {
  page: SitePage;
  onNavigate: (tab: string) => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({ page, onNavigate }) => {
  const { socialLinks } = useApp();
  const whatsappUrl =
    socialLinks.find((s) => s.platform === 'whatsapp' && s.enabled)?.url ||
    'https://wa.me/18005552739';

  const paragraphs = (page.content || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-300">
            /{page.slug}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span>Updated {page.updatedAt}</span>
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 border border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="space-y-3 border-b border-zinc-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[11px] font-mono uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Apex Published Page • {page.displayLocation.toUpperCase()}</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-white leading-tight">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
              {page.metaDescription}
            </p>
          )}
        </div>

        <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((block, idx) => {
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-heading font-bold text-lg sm:text-xl text-white pt-2">
                    {block.replace(/^###\s+/, '')}
                  </h3>
                );
              }
              if (block.startsWith('## ')) {
                return (
                  <h2 key={idx} className="font-heading font-extrabold text-xl sm:text-2xl text-white pt-3">
                    {block.replace(/^##\s+/, '')}
                  </h2>
                );
              }
              if (block.includes('\n- ') || block.startsWith('- ')) {
                const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
                return (
                  <ul key={idx} className="space-y-2 pl-1">
                    {lines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                        <span>{line.replace(/^-\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-zinc-300 whitespace-pre-line">
                  {block}
                </p>
              );
            })
          ) : (
            <p className="text-zinc-400 italic">No content has been added to this page yet.</p>
          )}
        </div>

        <div className="pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Apex Tesla Hub Information Portal</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('vehicles')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Browse Tesla Showroom
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
            >
              Hardware Store
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
        <Globe className="w-3.5 h-3.5" />
        <span>Managed dynamically via Apex Admin Site Editor</span>
      </div>
    </section>
  );
};
