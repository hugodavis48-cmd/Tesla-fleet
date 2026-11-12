import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BannerSizeType, MarketingBanner } from '../types';
import {
  Megaphone,
  Copy,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  Code2,
  Zap,
  MessageCircle,
  Lock,
  Layout,
  Square,
  RectangleHorizontal,
  PanelLeft,
} from 'lucide-react';

interface PromoBannersPageProps {
  onOpenAuth?: () => void;
  onNavigate?: (tab: string) => void;
}

const SIZE_DIMENSIONS: Record<BannerSizeType, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: 'Leaderboard (728×90)' },
  square: { w: 300, h: 300, label: 'Square (300×300)' },
  rectangle: { w: 300, h: 250, label: 'Rectangle (300×250)' },
  sidebar: { w: 160, h: 600, label: 'Sidebar (160×600)' },
};

export const PromoBannersPage: React.FC<PromoBannersPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { marketingBanners, currentUser, referralLink, showToast } = useApp();

  const [sizeFilter, setSizeFilter] = useState<'all' | BannerSizeType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCodeId, setOpenCodeId] = useState<string | null>(null);

  const activeBanners = useMemo(() => {
    return marketingBanners
      .filter((b) => b.isActive)
      .filter((b) => sizeFilter === 'all' || b.size === sizeFilter);
  }, [marketingBanners, sizeFilter]);

  const userRefCode = currentUser?.referralCode || 'APEX-VIP-REF';

  const getBannerReferralUrl = (banner: MarketingBanner) => {
    const sep = referralLink.includes('?') ? '&' : '?';
    return `${referralLink}${sep}banner=${encodeURIComponent(banner.id)}&dest=${encodeURIComponent(banner.targetTab)}`;
  };

  const buildHtmlEmbedCode = (banner: MarketingBanner) => {
    const dim = SIZE_DIMENSIONS[banner.size];
    const destUrl = getBannerReferralUrl(banner);
    const isRow = banner.size === 'leaderboard';
    return `<!-- Apex Tesla Hub Promotional Banner (${banner.dimensions}) -->
<a href="${destUrl}" target="_blank" rel="noopener noreferrer" style="display:${isRow ? 'flex' : 'inline-flex'};flex-direction:${isRow ? 'row' : 'column'};align-items:${isRow ? 'center' : 'flex-start'};justify-content:space-between;width:${dim.w}px;max-width:100%;height:${dim.h}px;padding:${isRow ? '12px 20px' : '18px'};box-sizing:border-box;background:linear-gradient(135deg,#09090b 0%,#18181b 55%,${banner.accentColor}33 100%);border:1px solid ${banner.accentColor};border-radius:14px;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,sans-serif;text-decoration:none;overflow:hidden;">
  <div>
    <span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:1.2px;color:${banner.accentColor};text-transform:uppercase;">APEX TESLA HUB • CODE ${userRefCode}</span>
    <div style="font-size:${isRow ? '15px' : '18px'};font-weight:900;line-height:1.2;margin-top:4px;">${banner.headline}</div>
    <div style="font-size:11px;color:#d4d4d8;margin-top:4px;line-height:1.35;">${banner.subheadline}</div>
  </div>
  <span style="display:inline-block;margin-top:${isRow ? '0' : '12px'};padding:8px 14px;background:${banner.accentColor};color:#ffffff;font-size:11px;font-weight:800;border-radius:10px;white-space:nowrap;">${banner.ctaText} →</span>
</a>`;
  };

  const handleCopyEmbed = (banner: MarketingBanner) => {
    navigator.clipboard.writeText(buildHtmlEmbedCode(banner));
    setCopiedId(`embed-${banner.id}`);
    showToast(`Copied ${banner.dimensions} HTML embed code with your referral link!`, 'success');
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleCopyRefLink = (banner: MarketingBanner) => {
    navigator.clipboard.writeText(getBannerReferralUrl(banner));
    setCopiedId(`link-${banner.id}`);
    showToast(`Copied referral link for "${banner.title}"!`, 'success');
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleDownloadSvgBanner = (banner: MarketingBanner) => {
    const dim = SIZE_DIMENSIONS[banner.size];
    const destUrl = getBannerReferralUrl(banner);
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const isLeaderboard = banner.size === 'leaderboard';
    const isSidebar = banner.size === 'sidebar';

    const svgContent = isLeaderboard
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="65%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="12" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="22" y="24" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="10" font-weight="bold">APEX TESLA HUB • REFERRAL CODE: ${escapeXml(userRefCode)}</text>
  <text x="22" y="48" fill="#ffffff" font-family="Arial,sans-serif" font-size="16" font-weight="900">${escapeXml(banner.headline.slice(0, 52))}</text>
  <text x="22" y="70" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="11">${escapeXml(banner.subheadline.slice(0, 74))}</text>
  <rect x="556" y="24" width="152" height="42" rx="10" fill="${banner.accentColor}"/>
  <text x="632" y="49" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="12" font-weight="bold">${escapeXml(banner.ctaText)}</text>
</svg>`
      : isSidebar
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="50%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="14" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="16" y="40" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="10" font-weight="bold">APEX // TESLA</text>
  <text x="16" y="60" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="9">INVITE: ${escapeXml(userRefCode)}</text>
  <text x="16" y="130" fill="#ffffff" font-family="Arial,sans-serif" font-size="14" font-weight="900">${escapeXml(banner.headline.slice(0, 18))}</text>
  <text x="16" y="152" fill="#ffffff" font-family="Arial,sans-serif" font-size="14" font-weight="900">${escapeXml(banner.headline.slice(18, 36))}</text>
  <text x="16" y="240" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="10">${escapeXml(banner.subheadline.slice(0, 22))}</text>
  <text x="16" y="258" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="10">${escapeXml(banner.subheadline.slice(22, 44))}</text>
  <rect x="14" y="490" width="132" height="44" rx="10" fill="${banner.accentColor}"/>
  <text x="80" y="517" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="11" font-weight="bold">${escapeXml(banner.ctaText)}</text>
  <text x="16" y="575" fill="#71717a" font-family="monospace" font-size="8">${escapeXml(destUrl.slice(0, 26))}</text>
</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="60%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="14" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="20" y="34" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="10" font-weight="bold">APEX TESLA HUB • ${escapeXml(userRefCode)}</text>
  <text x="20" y="74" fill="#ffffff" font-family="Arial,sans-serif" font-size="16" font-weight="900">${escapeXml(banner.headline.slice(0, 28))}</text>
  <text x="20" y="96" fill="#ffffff" font-family="Arial,sans-serif" font-size="16" font-weight="900">${escapeXml(banner.headline.slice(28, 56))}</text>
  <text x="20" y="138" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="11">${escapeXml(banner.subheadline.slice(0, 40))}</text>
  <text x="20" y="156" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="11">${escapeXml(banner.subheadline.slice(40, 80))}</text>
  <rect x="20" y="${dim.h - 62}" width="${dim.w - 40}" height="40" rx="10" fill="${banner.accentColor}"/>
  <text x="${dim.w / 2}" y="${dim.h - 38}" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="12" font-weight="bold">${escapeXml(banner.ctaText)}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-tesla-${banner.size}-${userRefCode.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${banner.dimensions} SVG banner graphic!`, 'success');
  };

  const renderBannerVisual = (banner: MarketingBanner) => {
    const destUrl = getBannerReferralUrl(banner);

    if (banner.size === 'leaderboard') {
      return (
        <div className="w-full overflow-x-auto pb-2">
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            className={`mx-auto flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border bg-gradient-to-r ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
            style={{ width: 728, height: 90, borderColor: `${banner.accentColor}66` }}
          >
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition duration-500 pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: `${banner.accentColor}22`, borderColor: `${banner.accentColor}66` }}
              >
                <Zap className="w-5 h-5" style={{ color: banner.accentColor }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: banner.accentColor }}>
                    APEX // TESLA • REF: {userRefCode}
                  </span>
                </div>
                <h4 className="font-heading font-black text-sm text-white truncate">{banner.headline}</h4>
                <p className="text-[11px] text-zinc-300 truncate">{banner.subheadline}</p>
              </div>
            </div>
            <span
              className="relative z-10 px-4 py-2 rounded-xl text-xs font-heading font-black text-white shrink-0 shadow-lg"
              style={{ backgroundColor: banner.accentColor }}
            >
              {banner.ctaText} →
            </span>
          </a>
        </div>
      );
    }

    if (banner.size === 'sidebar') {
      return (
        <div className="w-full flex justify-center py-2">
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            className={`flex flex-col justify-between p-4 rounded-2xl border bg-gradient-to-b ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
            style={{ width: 160, height: 600, borderColor: `${banner.accentColor}66` }}
          >
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition duration-500 pointer-events-none"
              />
            )}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" style={{ color: banner.accentColor }} />
                <span className="font-heading font-black text-xs text-white">APEX TESLA</span>
              </div>
              <span
                className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border"
                style={{
                  color: banner.accentColor,
                  borderColor: `${banner.accentColor}55`,
                  backgroundColor: `${banner.accentColor}15`,
                }}
              >
                {userRefCode}
              </span>
            </div>

            <div className="relative z-10 space-y-3 my-auto">
              <h4 className="font-heading font-black text-lg text-white leading-tight">{banner.headline}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{banner.subheadline}</p>
            </div>

            <div className="relative z-10 space-y-2">
              <div
                className="w-full py-2.5 px-2 rounded-xl text-center text-[11px] font-heading font-black text-white shadow-lg"
                style={{ backgroundColor: banner.accentColor }}
              >
                {banner.ctaText} →
              </div>
              <span className="block text-center text-[9px] font-mono text-zinc-400 truncate">
                apex-tesla.io
              </span>
            </div>
          </a>
        </div>
      );
    }

    const dim = SIZE_DIMENSIONS[banner.size];
    return (
      <div className="w-full flex justify-center py-2 overflow-x-auto">
        <a
          href={destUrl}
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate(banner.targetTab);
          }}
          className={`flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br ${banner.themeGradient} relative overflow-hidden group shadow-2xl shrink-0`}
          style={{ width: dim.w, height: dim.h, borderColor: `${banner.accentColor}66` }}
        >
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition duration-500 pointer-events-none"
            />
          )}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: banner.accentColor }}>
              APEX // TESLA
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 text-zinc-300 border border-zinc-700">
              {userRefCode}
            </span>
          </div>

          <div className="relative z-10 space-y-1.5 my-auto">
            <h4 className="font-heading font-black text-lg text-white leading-snug">{banner.headline}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{banner.subheadline}</p>
          </div>

          <div
            className="relative z-10 w-full py-2.5 px-4 rounded-xl text-center text-xs font-heading font-black text-white shadow-lg"
            style={{ backgroundColor: banner.accentColor }}
          >
            {banner.ctaText} →
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Ambassador Ad Kit • Auto-Synced Referral Links</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            PROMOTIONAL MARKETING BANNERS
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Ready-to-deploy responsive banners in standard Leaderboard (728×90), Square (300×300), Rectangle (300×250), and Sidebar (160×600) formats. Every banner automatically embeds your unique referral link to credit $100 vault bonuses + 2 free spins per deposited invite.
          </p>
        </div>

        {/* User Referral Link Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-2.5 lg:w-[400px] shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-emerald-400 uppercase">Your Embedded Invite Link</span>
            <span className="font-mono text-zinc-300">{userRefCode}</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 pl-3">
            <span className="text-[11px] font-mono text-zinc-300 truncate flex-1">{referralLink}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                showToast('Referral URL copied!', 'success');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              Copy
            </button>
          </div>
          {!currentUser && onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In to Lock Your Personal Referral Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Format Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: `All Formats (${marketingBanners.filter((b) => b.isActive).length})`, icon: Layout },
          { id: 'leaderboard', label: 'Leaderboard (728×90)', icon: RectangleHorizontal },
          { id: 'square', label: 'Square (300×300)', icon: Square },
          { id: 'rectangle', label: 'Rectangle (300×250)', icon: RectangleHorizontal },
          { id: 'sidebar', label: 'Sidebar (160×600)', icon: PanelLeft },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = sizeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSizeFilter(tab.id as 'all' | BannerSizeType)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                active
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Banners List */}
      <div className="space-y-8">
        {activeBanners.map((banner) => {
          const destUrl = getBannerReferralUrl(banner);
          const isCodeOpen = openCodeId === banner.id;
          return (
            <div
              key={banner.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 sm:p-7 space-y-5 shadow-2xl"
            >
              {/* Banner Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-200 uppercase">
                      {SIZE_DIMENSIONS[banner.size].label}
                    </span>
                    {banner.isAiGenerated && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-zinc-500">
                      Target: /{banner.targetTab}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">{banner.title}</h3>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyEmbed(banner)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === `embed-${banner.id}` ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === `embed-${banner.id}` ? 'HTML Copied!' : 'Copy HTML Embed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyRefLink(banner)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === `link-${banner.id}` ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>Copy Ref Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSvgBanner(banner)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SVG</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `${banner.headline} — ${banner.subheadline} Join with my Apex Tesla invite link: ${destUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setOpenCodeId(isCodeOpen ? null : banner.id)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono cursor-pointer"
                  >
                    {isCodeOpen ? 'Hide Code' : 'View HTML'}
                  </button>
                </div>
              </div>

              {/* Live Visual Preview Stage */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#05070b] border border-zinc-800/80">
                {renderBannerVisual(banner)}
              </div>

              {/* Embedded Referral URL Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3.5 py-2">
                <span className="text-zinc-400 font-mono truncate">
                  Destination URL: <strong className="text-emerald-400">{destUrl}</strong>
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(banner.headline)}&url=${encodeURIComponent(destUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share on X</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(destUrl)}&text=${encodeURIComponent(banner.headline)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>

              {/* Expandable Raw HTML Embed Snippet */}
              {isCodeOpen && (
                <pre className="p-4 rounded-2xl bg-black border border-zinc-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {buildHtmlEmbedCode(banner)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
