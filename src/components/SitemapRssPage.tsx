import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Map,
  Rss,
  ExternalLink,
  Copy,
  Check,
  Search,
  Globe,
  FileCode2,
  ArrowRight,
  Calendar,
  Tag,
} from 'lucide-react';

interface SitemapRssPageProps {
  initialMode: 'sitemap' | 'rss';
  onNavigate: (tab: string) => void;
}

export const SitemapRssPage: React.FC<SitemapRssPageProps> = ({ initialMode, onNavigate }) => {
  const { sitemapEntries, rssFeedItems, seoSettings, showToast } = useApp();
  const [mode, setMode] = useState<'sitemap' | 'rss'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const activeSitemap = useMemo(
    () =>
      sitemapEntries
        .filter((e) => e.isActive !== false)
        .filter(
          (e) =>
            !searchQuery.trim() ||
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [sitemapEntries, searchQuery]
  );

  const activeRss = useMemo(
    () =>
      rssFeedItems
        .filter((r) => r.isPublished)
        .filter(
          (r) =>
            !searchQuery.trim() ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [rssFeedItems, searchQuery]
  );

  const xmlPreview = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : seoSettings.canonicalUrl || 'https://apex-tesla.io';
    if (mode === 'sitemap') {
      const urls = activeSitemap
        .map(
          (item) =>
            `  <url>\n    <loc>${origin}/?tab=${encodeURIComponent(item.path)}</loc>\n    <lastmod>${item.lastMod}</lastmod>\n    <changefreq>${item.changeFreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`
        )
        .join('\n');
      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    }

    const items = activeRss
      .map(
        (item) =>
          `    <item>\n      <title>${item.title}</title>\n      <link>${origin}/?tab=${encodeURIComponent(item.linkTab || 'home')}</link>\n      <category>${item.category}</category>\n      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>\n      <description>${item.description}</description>\n    </item>`
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${seoSettings.siteTitle || seoSettings.siteName}</title>\n    <link>${origin}</link>\n    <description>${seoSettings.metaDescription}</description>\n${items}\n  </channel>\n</rss>`;
  }, [mode, activeSitemap, activeRss, seoSettings]);

  const handleCopyXml = () => {
    navigator.clipboard?.writeText(xmlPreview);
    setCopiedXml(true);
    showToast(`Copied live ${mode === 'sitemap' ? 'sitemap.xml' : 'rss.xml'} markup to clipboard!`, 'success');
    setTimeout(() => setCopiedXml(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[11px] font-mono uppercase tracking-wider font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>SEO Architecture & Syndication</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            {mode === 'sitemap' ? 'Platform Site Map & Directory' : 'RSS 2.0 Feeds & Live Dispatch Stream'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {mode === 'sitemap'
              ? 'Structured navigation index of every Apex Tesla Hub showroom, staking yield pool, promotion, and member portal, synchronized directly with /sitemap.xml.'
              : 'Subscribe to real-time updates covering vehicle inventory drops, TSLA Fast-ROI stock releases, promotional events, and service engineering advisories via /rss.xml.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMode('sitemap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
              mode === 'sitemap'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Interactive Site Map ({activeSitemap.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('rss')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
              mode === 'rss'
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Rss className="w-4 h-4" />
            <span>RSS Feeds ({activeRss.length})</span>
          </button>
          <a
            href={mode === 'sitemap' ? '/sitemap.xml' : '/rss.xml'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <FileCode2 className="w-4 h-4" />
            <span>{mode === 'sitemap' ? '/sitemap.xml' : '/rss.xml'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={mode === 'sitemap' ? 'Filter routes, hubs, or paths...' : 'Filter RSS feed bulletins...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Main Grid */}
      {mode === 'sitemap' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSitemap.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-red-500/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-cyan-400">
                    {entry.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Priority {entry.priority} • {entry.changeFreq}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-white">{entry.title}</h3>
                <p className="text-xs font-mono text-zinc-400 break-all">{entry.path}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-[11px]">
                <span className="text-zinc-500 font-mono">Updated {entry.lastMod}</span>
                <button
                  type="button"
                  onClick={() => onNavigate(entry.path)}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Visit Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeRss.map((item) => (
            <article
              key={item.id}
              className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    {item.pubDate}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-xs">
                <span className="text-[11px] text-zinc-500">By Apex Tesla Editorial</span>
                <button
                  type="button"
                  onClick={() => onNavigate(item.linkTab)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-600 text-zinc-200 hover:text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Open Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Live XML Output Preview */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <h2 className="font-heading font-bold text-sm text-white">
              Live Generated {mode === 'sitemap' ? 'sitemap.xml' : 'rss.xml'} Payload
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCopyXml}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedXml ? 'Copied XML' : 'Copy XML'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/80 border border-zinc-900 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
          {xmlPreview}
        </pre>
      </div>
    </section>
  );
};
