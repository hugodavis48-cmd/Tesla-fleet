import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BannerSizeType, MarketingBanner, PromoVideoItem } from '../types';
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
  Box,
  Car,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Film,
  Eye,
  Upload,
  Maximize2,
} from 'lucide-react';
import { ImageLightbox, LightboxImageItem } from './ImageLightbox';

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
  const { marketingBanners, promoVideos, incrementPromoVideoView, currentUser, referralLink, showToast } = useApp();

  const [sizeFilter, setSizeFilter] = useState<'all' | BannerSizeType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCodeId, setOpenCodeId] = useState<string | null>(null);
  const [tiltState, setTiltState] = useState<{ id: string; rx: number; ry: number; gx: number; gy: number } | null>(null);
  const [slideTick, setSlideTick] = useState<number>(0);
  const [bannerSlideOverride, setBannerSlideOverride] = useState<Record<string, number>>({});
  const [videoSceneState, setVideoSceneState] = useState<Record<string, number>>({});
  const [pausedVideos, setPausedVideos] = useState<Record<string, boolean>>({});
  const [lightboxViewer, setLightboxViewer] = useState<{
    images: LightboxImageItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideTick((t) => t + 1);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const activePromoVideos = useMemo(() => promoVideos.filter((v) => v.isActive), [promoVideos]);

  useEffect(() => {
    const vidTimer = setInterval(() => {
      setVideoSceneState((prev) => {
        const next = { ...prev };
        activePromoVideos.forEach((vid) => {
          if (vid.videoType === 'ai_generated' && vid.scenes && vid.scenes.length > 1 && !pausedVideos[vid.id]) {
            next[vid.id] = ((prev[vid.id] || 0) + 1) % vid.scenes.length;
          }
        });
        return next;
      });
    }, 3200);
    return () => clearInterval(vidTimer);
  }, [activePromoVideos, pausedVideos]);

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

  const handleDownloadHdPng = (banner: MarketingBanner) => {
    const dim = SIZE_DIMENSIONS[banner.size];
    const scale = 2; // 2x Hi-DPI crisp render
    const canvas = document.createElement('canvas');
    canvas.width = dim.w * scale;
    canvas.height = dim.h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    const bgGrad = ctx.createLinearGradient(0, 0, dim.w, dim.h);
    bgGrad.addColorStop(0, '#07090e');
    bgGrad.addColorStop(0.55, '#141720');
    bgGrad.addColorStop(1, '#0b0e16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, dim.w, dim.h);

    const glow = ctx.createRadialGradient(dim.w * 0.8, dim.h * 0.25, 10, dim.w * 0.8, dim.h * 0.25, dim.w * 0.7);
    glow.addColorStop(0, `${banner.accentColor}44`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Metallic 3D border sheen
    ctx.strokeStyle = banner.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, dim.w - 2, dim.h - 2);

    ctx.fillStyle = banner.accentColor;
    ctx.font = 'bold 10px monospace';
    const qualityTag = banner.is3dHd ? `${banner.resolutionQuality || '4K UHD'} • 3D` : 'HD';
    ctx.fillText(`APEX TESLA HUB • ${qualityTag} • REF: ${userRefCode}`, 18, banner.size === 'leaderboard' ? 22 : 28);

    ctx.fillStyle = '#ffffff';
    if (banner.size === 'leaderboard') {
      ctx.font = '900 15px "Space Grotesk", Arial, sans-serif';
      ctx.fillText(banner.headline.slice(0, 48), 18, 46);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText(banner.subheadline.slice(0, 68), 18, 66);

      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(dim.w - 170, 22, 152, 46);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, dim.w - 94, 49);
    } else if (banner.size === 'sidebar') {
      ctx.font = '900 15px Arial, sans-serif';
      ctx.fillText(banner.headline.slice(0, 16), 16, 84);
      ctx.fillText(banner.headline.slice(16, 32), 16, 104);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText(banner.subheadline.slice(0, 22), 16, 146);
      ctx.fillText(banner.subheadline.slice(22, 44), 16, 162);
      if (banner.carRenderModel) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(banner.carRenderModel, 16, dim.h - 90);
      }
      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(14, dim.h - 62, dim.w - 28, 42);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, dim.w / 2, dim.h - 37);
    } else {
      ctx.font = '900 17px Arial, sans-serif';
      ctx.fillText(banner.headline.slice(0, 24), 18, 68);
      ctx.fillText(banner.headline.slice(24, 48), 18, 90);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Arial, sans-serif';
      ctx.fillText(banner.subheadline.slice(0, 38), 18, 124);
      ctx.fillText(banner.subheadline.slice(38, 76), 18, 140);
      if (banner.carRenderModel) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`Model: ${banner.carRenderModel}`, 18, dim.h - 76);
      }
      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(18, dim.h - 56, dim.w - 36, 38);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, dim.w / 2, dim.h - 33);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apex-tesla-3d-hd-${banner.size}-${userRefCode.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded 2x HD PNG (${dim.w * 2}×${dim.h * 2}) promotional graphic!`, 'success');
    }, 'image/png');
  };

  const handle3dMouseMove = (id: string, e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width);
    const py = (e.clientY - rect.top) / Math.max(1, rect.height);
    const ry = Number(((px - 0.5) * 14).toFixed(2));
    const rx = Number(((0.5 - py) * 12).toFixed(2));
    setTiltState({ id, rx, ry, gx: Math.round(px * 100), gy: Math.round(py * 100) });
  };

  const getBannerSlides = (banner: MarketingBanner): string[] => {
    const list = (banner.slideImages && banner.slideImages.length > 0)
      ? banner.slideImages.filter(Boolean)
      : banner.imageUrl
      ? [banner.imageUrl]
      : [];
    return list;
  };

  const getActiveSlideIndex = (banner: MarketingBanner): number => {
    const slides = getBannerSlides(banner);
    if (slides.length <= 1) return 0;
    if (bannerSlideOverride[banner.id] !== undefined) {
      return bannerSlideOverride[banner.id] % slides.length;
    }
    return slideTick % slides.length;
  };

  const getVideoReferralUrl = (vid: PromoVideoItem) => {
    const sep = referralLink.includes('?') ? '&' : '?';
    return `${referralLink}${sep}video=${encodeURIComponent(vid.id)}&dest=${encodeURIComponent(vid.targetTab)}`;
  };

  const renderBannerVisual = (banner: MarketingBanner) => {
    const destUrl = getBannerReferralUrl(banner);
    const activeTilt = tiltState?.id === banner.id ? tiltState : null;
    const is3d = banner.is3dHd !== false;
    const slides = getBannerSlides(banner);
    const activeSlideIdx = getActiveSlideIndex(banner);
    const activeImage = slides[activeSlideIdx] || banner.imageUrl;
    const tiltStyle: React.CSSProperties = is3d
      ? {
          transform: activeTilt
            ? `rotateX(${activeTilt.rx}deg) rotateY(${activeTilt.ry}deg) scale(1.015)`
            : 'rotateX(1.5deg) rotateY(-1.5deg)',
          transition: activeTilt ? 'transform 80ms ease-out' : 'transform 400ms ease-out',
          transformStyle: 'preserve-3d',
          boxShadow: `0 22px 50px -12px ${banner.accentColor}44, inset 0 1px 0 rgba(255,255,255,0.22)`,
        }
      : {};

    if (banner.size === 'leaderboard') {
      return (
        <div className="w-full overflow-x-auto pb-2" style={{ perspective: '1200px' }}>
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
            onMouseLeave={() => setTiltState(null)}
            className={`mx-auto flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border bg-gradient-to-r ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
            style={{ width: 728, height: 90, borderColor: `${banner.accentColor}88`, ...tiltStyle }}
          >
            {activeImage && (
              <img
                key={`${banner.id}-lb-${activeSlideIdx}`}
                src={activeImage}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              />
            )}
            {is3d && (
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background: `radial-gradient(circle at ${activeTilt?.gx ?? 25}% ${activeTilt?.gy ?? 30}%, rgba(255,255,255,0.2), transparent 55%)`,
                }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-lg"
                style={{ backgroundColor: `${banner.accentColor}22`, borderColor: `${banner.accentColor}88` }}
              >
                <Zap className="w-5 h-5" style={{ color: banner.accentColor }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: banner.accentColor }}>
                    APEX // TESLA • REF: {userRefCode}
                  </span>
                  {banner.is3dHd && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/20">
                      3D • {banner.resolutionQuality || '4K UHD'}
                    </span>
                  )}
                  {banner.carRenderModel && (
                    <span className="text-[8px] font-mono text-zinc-300 hidden sm:inline">
                      [{banner.carRenderModel}]
                    </span>
                  )}
                </div>
                <h4 className="font-heading font-black text-sm text-white truncate drop-shadow">{banner.headline}</h4>
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
        <div className="w-full flex justify-center py-2" style={{ perspective: '1200px' }}>
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
            onMouseLeave={() => setTiltState(null)}
            className={`flex flex-col justify-between p-4 rounded-2xl border bg-gradient-to-b ${banner.themeGradient} relative overflow-hidden group shadow-2xl w-full`}
            style={{ maxWidth: 220, minHeight: 480, borderColor: `${banner.accentColor}88`, ...tiltStyle }}
          >
            {activeImage && (
              <img
                key={`${banner.id}-sb-${activeSlideIdx}`}
                src={activeImage}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              />
            )}
            {is3d && (
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background: `radial-gradient(circle at ${activeTilt?.gx ?? 30}% ${activeTilt?.gy ?? 20}%, rgba(255,255,255,0.2), transparent 55%)`,
                }}
              />
            )}
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" style={{ color: banner.accentColor }} />
                <span className="font-heading font-black text-xs text-white">APEX TESLA</span>
              </div>
              {banner.is3dHd && (
                <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[8px] font-mono font-bold text-white">
                  3D • {banner.resolutionQuality || '4K UHD'}
                </span>
              )}
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
              <h4 className="font-heading font-black text-lg text-white leading-tight drop-shadow">{banner.headline}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{banner.subheadline}</p>
              {banner.carRenderModel && (
                <div className="text-[9px] font-mono text-amber-300 flex items-center gap-1">
                  <Car className="w-3 h-3 shrink-0" />
                  <span className="truncate">{banner.carRenderModel}</span>
                </div>
              )}
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
      <div className="w-full flex justify-center py-2 overflow-x-auto" style={{ perspective: '1200px' }}>
        <a
          href={destUrl}
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate(banner.targetTab);
          }}
          onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
          onMouseLeave={() => setTiltState(null)}
          className={`flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br ${banner.themeGradient} relative overflow-hidden group shadow-2xl w-full`}
          style={{ maxWidth: dim.w, minHeight: Math.min(dim.h, 260), height: 'auto', borderColor: `${banner.accentColor}88`, ...tiltStyle }}
        >
          {activeImage && (
            <img
              key={`${banner.id}-card-${activeSlideIdx}`}
              src={activeImage}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-all duration-700 pointer-events-none"
            />
          )}
          {is3d && (
            <div
              className="absolute inset-0 pointer-events-none opacity-65"
              style={{
                background: `radial-gradient(circle at ${activeTilt?.gx ?? 30}% ${activeTilt?.gy ?? 25}%, rgba(255,255,255,0.22), transparent 58%)`,
              }}
            />
          )}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: banner.accentColor }}>
              APEX // TESLA
            </span>
            <div className="flex items-center gap-1">
              {banner.is3dHd && (
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/15 text-white border border-white/25">
                  3D {banner.resolutionQuality || '4K UHD'}
                </span>
              )}
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 text-zinc-300 border border-zinc-700">
                {userRefCode}
              </span>
            </div>
          </div>

          <div className="relative z-10 space-y-1.5 my-auto">
            <h4 className="font-heading font-black text-lg text-white leading-snug drop-shadow">{banner.headline}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{banner.subheadline}</p>
            {banner.carRenderModel && (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300">
                <Car className="w-3 h-3" />
                {banner.carRenderModel}
              </span>
            )}
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
                    {banner.is3dHd && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-mono font-bold text-indigo-300 flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        3D • {banner.resolutionQuality || '4K UHD'}
                      </span>
                    )}
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
                    onClick={() => handleDownloadHdPng(banner)}
                    className="px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-300" />
                    <span>HD PNG</span>
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
                    onClick={() => {
                      const slides = getBannerSlides(banner);
                      if (slides.length === 0) return;
                      setLightboxViewer({
                        index: getActiveSlideIndex(banner),
                        images: slides.map((url, idx) => ({
                          url,
                          title: `${banner.title} (Slide ${idx + 1}/${slides.length})`,
                          subtitle: `${SIZE_DIMENSIONS[banner.size].label} • ${banner.headline}`,
                          badge: banner.resolutionQuality || '4K UHD',
                        })),
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Inspect banner artwork in Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zoom</span>
                  </button>

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
              <div className="p-4 sm:p-6 rounded-2xl bg-[#05070b] border border-zinc-800/80 space-y-3">
                {renderBannerVisual(banner)}
                {getBannerSlides(banner).length > 1 && (
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-900">
                    <span className="text-[10px] font-mono text-zinc-400">
                      3D Multi-Slide Rotation ({getActiveSlideIndex(banner) + 1} / {getBannerSlides(banner).length})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const total = getBannerSlides(banner).length;
                          const curr = getActiveSlideIndex(banner);
                          setBannerSlideOverride((prev) => ({
                            ...prev,
                            [banner.id]: (curr - 1 + total) % total,
                          }));
                        }}
                        className="p-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                        aria-label="Previous banner slide"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {getBannerSlides(banner).map((_, sIdx) => (
                        <button
                          key={`${banner.id}-dot-${sIdx}`}
                          type="button"
                          onClick={() =>
                            setBannerSlideOverride((prev) => ({
                              ...prev,
                              [banner.id]: sIdx,
                            }))
                          }
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            getActiveSlideIndex(banner) === sIdx
                              ? 'w-5 bg-red-500'
                              : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                          }`}
                          aria-label={`Slide ${sIdx + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const total = getBannerSlides(banner).length;
                          const curr = getActiveSlideIndex(banner);
                          setBannerSlideOverride((prev) => ({
                            ...prev,
                            [banner.id]: (curr + 1) % total,
                          }));
                        }}
                        className="p-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                        aria-label="Next banner slide"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Promotional Short Videos Gallery (AI-Generated Storyboard Reels + Admin Uploaded MP4/WEBM) */}
      <div className="pt-6 border-t border-zinc-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/15 border border-indigo-500/35 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>AI Motion Reels &amp; Uploaded Promo Videos</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              PROMOTIONAL SHORT VIDEOS
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Watch and share high-converting 9:16 &amp; 16:9 promotional short videos—both AI-directed multi-scene reels and official studio uploads with your embedded invite code.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {activePromoVideos.length} Active Video{activePromoVideos.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePromoVideos.map((vid) => {
            const isPaused = !!pausedVideos[vid.id];
            const sceneIdx = (videoSceneState[vid.id] || 0) % Math.max(1, vid.scenes?.length || 1);
            const activeScene = vid.scenes?.[sceneIdx];
            const vidUrl = getVideoReferralUrl(vid);

            return (
              <div
                key={vid.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                {/* Video Stage */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  {vid.videoType === 'uploaded' && vid.videoUrl ? (
                    <video
                      src={vid.videoUrl}
                      poster={vid.thumbnailUrl}
                      controls
                      playsInline
                      onPlay={() => incrementPromoVideoView(vid.id)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        key={`${vid.id}-scene-${sceneIdx}`}
                        src={activeScene?.bgImage || vid.thumbnailUrl}
                        alt={vid.title}
                        className={`w-full h-full object-cover transition-transform duration-[3000ms] ${
                          isPaused ? 'scale-100' : 'scale-110'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30" />

                      {/* Scene Progress Bars */}
                      {vid.scenes && vid.scenes.length > 0 && (
                        <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-10">
                          {vid.scenes.map((_, i) => (
                            <button
                              key={`${vid.id}-bar-${i}`}
                              type="button"
                              onClick={() =>
                                setVideoSceneState((prev) => ({ ...prev, [vid.id]: i }))
                              }
                              className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                                i === sceneIdx ? 'bg-white' : i < sceneIdx ? 'bg-white/60' : 'bg-white/25'
                              }`}
                              aria-label={`Scene ${i + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Top Type & Play/Pause Controls */}
                      <div className="absolute top-7 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/75 border border-white/15 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI REEL • {vid.durationSec}s
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const frames = vid.scenes && vid.scenes.length > 0
                                ? vid.scenes.map((sc, sIdx) => ({
                                    url: sc.bgImage || vid.thumbnailUrl || '',
                                    title: `${vid.title} • Scene ${sIdx + 1}`,
                                    subtitle: `${sc.title} — ${sc.subtitle}`,
                                    badge: sc.metric,
                                  }))
                                : [
                                    {
                                      url: vid.thumbnailUrl || '',
                                      title: vid.title,
                                      subtitle: vid.subheadline,
                                      badge: `AI REEL • ${vid.durationSec}s`,
                                    },
                                  ];
                              setLightboxViewer({
                                index: sceneIdx,
                                images: frames.filter((f) => !!f.url),
                              });
                            }}
                            className="p-2 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer"
                            title="Inspect reel artwork in Lightbox"
                            aria-label="Inspect reel artwork"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPausedVideos((prev) => ({ ...prev, [vid.id]: !prev[vid.id] }));
                              incrementPromoVideoView(vid.id);
                            }}
                            className="p-2 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white cursor-pointer"
                            title={isPaused ? 'Play AI Reel' : 'Pause AI Reel'}
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Animated Storyboard Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
                        {activeScene && (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black text-black"
                            style={{ backgroundColor: vid.accentColor || '#ef4444' }}
                          >
                            {activeScene.metric}
                          </span>
                        )}
                        <h4 className="font-heading font-black text-base text-white drop-shadow">
                          {activeScene?.title || vid.headline}
                        </h4>
                        <p className="text-[11px] text-zinc-200 line-clamp-2 drop-shadow">
                          {activeScene?.subtitle || vid.subheadline}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Video Meta & Actions */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="uppercase flex items-center gap-1">
                        {vid.videoType === 'uploaded' ? (
                          <Upload className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        )}
                        {vid.videoType === 'uploaded' ? 'Admin Studio Upload' : 'AI Storyboard Motion Reel'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(vid.viewsCount || 0).toLocaleString()} views
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-white">{vid.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{vid.subheadline}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        incrementPromoVideoView(vid.id);
                        if (onNavigate) onNavigate(vid.targetTab);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      style={{ backgroundColor: vid.accentColor || '#dc2626' }}
                    >
                      <span>{vid.ctaText || 'Explore Now'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(vidUrl);
                        setCopiedId(`vid-${vid.id}`);
                        showToast(`Copied invite link for "${vid.title}"!`, 'success');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `vid-${vid.id}` ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>{copiedId === `vid-${vid.id}` ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ImageLightbox
        isOpen={lightboxViewer !== null}
        onClose={() => setLightboxViewer(null)}
        images={lightboxViewer?.images || []}
        initialIndex={lightboxViewer?.index ?? 0}
      />
    </div>
  );
};
