import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BannerImageMode,
  BannerSizeType,
  BannerTransitionEffect,
  MarketingBanner,
  PromoVideoItem,
} from '../types';
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
  Sliders,
  Car,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Film,
  Eye,
  Upload,
  Maximize2,
  Plus,
  Trash2,
  RotateCcw,
  Layers,
  Image as ImageIcon,
  ArrowLeftRight,
  Smartphone,
  Monitor,
  Check,
  X,
} from 'lucide-react';
import { ImageLightbox, LightboxImageItem } from './ImageLightbox';

interface PromoBannersPageProps {
  onOpenAuth?: () => void;
  onNavigate?: (tab: string) => void;
}

const SIZE_PRESETS: Record<
  BannerSizeType,
  { w: number; h: number; label: string; shortLabel: string; category: string }
> = {
  leaderboard: { w: 728, h: 90, label: 'Leaderboard (728×90)', shortLabel: '728×90', category: 'Web Wide' },
  billboard: { w: 970, h: 250, label: 'Billboard (970×250)', shortLabel: '970×250', category: 'Hero Wide' },
  square: { w: 300, h: 300, label: 'Square (300×300)', shortLabel: '300×300', category: 'Square' },
  rectangle: { w: 300, h: 250, label: 'Rectangle (300×250)', shortLabel: '300×250', category: 'Medium Card' },
  sidebar: { w: 160, h: 600, label: 'Sidebar (160×600)', shortLabel: '160×600', category: 'Skyscraper' },
  wide_skyscraper: { w: 300, h: 600, label: 'Half-Page (300×600)', shortLabel: '300×600', category: 'Tall Card' },
  social_og: { w: 1200, h: 628, label: 'Social Card (1200×628)', shortLabel: '1200×628', category: 'Social Share' },
  story: { w: 1080, h: 1920, label: 'Story Vertical (1080×1920)', shortLabel: '1080×1920', category: '9:16 Story' },
  mobile_banner: { w: 320, h: 100, label: 'Mobile Banner (320×100)', shortLabel: '320×100', category: 'Mobile' },
  custom: { w: 800, h: 400, label: 'Custom Size', shortLabel: 'Custom', category: 'Custom px' },
};

const GRADIENT_THEMES = [
  { id: 'crimson', label: 'Crimson Obsidian', value: 'from-zinc-950 via-red-950/80 to-zinc-950', accent: '#ef4444' },
  { id: 'emerald', label: 'Emerald Vault', value: 'from-zinc-950 via-slate-900 to-emerald-950/60', accent: '#10b981' },
  { id: 'amber', label: 'Amber Gold', value: 'from-zinc-950 via-amber-950/60 to-red-950/70', accent: '#f59e0b' },
  { id: 'cyan', label: 'Electric Cyan', value: 'from-zinc-950 via-cyan-950/60 to-zinc-950', accent: '#06b6d4' },
  { id: 'stealth', label: 'Stealth Carbon', value: 'from-zinc-950 via-zinc-900 to-black', accent: '#e4e4e7' },
];

const GALLERY_BACKDROPS = [
  { label: 'Cybertruck Cyberbeast', url: '/promo-cyberbeast.jpg' },
  { label: 'Model S Plaid Track', url: '/promo-plaid.jpg' },
  { label: 'Robotaxi Fleet', url: '/promo-robotaxi.jpg' },
  { label: 'Apex Emblem', url: '/logo.jpg' },
];

const ACCENT_SWATCHES = ['#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#f43f5e'];

const USER_CUSTOM_BANNERS_KEY = 'apex_user_custom_banners_v1';

interface BannerOverride {
  size?: BannerSizeType;
  customWidth?: number;
  customHeight?: number;
  imageMode?: BannerImageMode;
  transitionEffect?: BannerTransitionEffect;
  slideIntervalSec?: number;
  selectedSingleImage?: string;
  slideImages?: string[];
  is3dHd?: boolean;
  resolutionQuality?: '4K UHD' | 'HD 1080p';
  accentColor?: string;
  themeGradient?: string;
  overlayOpacity?: number;
  borderRadiusPx?: number;
  showReferralCode?: boolean;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  targetTab?: string;
}

const DEFAULT_STUDIO_DRAFT: Omit<MarketingBanner, 'id' | 'createdAt' | 'clicksCount'> = {
  title: 'Custom Tesla VIP Promo Banner',
  size: 'social_og',
  dimensions: '1200×628',
  customWidth: 1200,
  customHeight: 628,
  imageMode: 'multi',
  transitionEffect: 'fade',
  borderRadiusPx: 16,
  overlayOpacity: 0.42,
  showReferralCode: true,
  headline: 'DRIVE THE 2026 CYBERBEAST OR EARN 28.5% FLEET YIELD',
  subheadline: 'Claim $25 welcome credit & priority Tesla allocations with verified instant crypto settlement.',
  ctaText: 'Claim VIP Access',
  badgeText: 'CUSTOM BANNER',
  themeGradient: 'from-zinc-950 via-red-950/80 to-zinc-950',
  accentColor: '#ef4444',
  targetTab: 'vehicles',
  imageUrl: '/promo-cyberbeast.jpg',
  slideImages: ['/promo-cyberbeast.jpg', '/promo-plaid.jpg', '/promo-robotaxi.jpg'],
  slideIntervalSec: 4,
  isActive: true,
  isAiGenerated: false,
  is3dHd: true,
  style3dPreset: 'cyber_perspective',
  resolutionQuality: '4K UHD',
  carRenderModel: 'Cybertruck Cyberbeast',
};

export const PromoBannersPage: React.FC<PromoBannersPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { marketingBanners, promoVideos, incrementPromoVideoView, currentUser, referralLink, showToast } = useApp();

  const [sizeFilter, setSizeFilter] = useState<'all' | 'custom_saved' | BannerSizeType>('all');
  const [modeFilter, setModeFilter] = useState<'all' | BannerImageMode>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCodeId, setOpenCodeId] = useState<string | null>(null);
  const [customizingBannerId, setCustomizingBannerId] = useState<string | null>(null);
  const [tiltState, setTiltState] = useState<{ id: string; rx: number; ry: number; gx: number; gy: number } | null>(null);

  // Timer tick & per-banner slide controls
  const [tickMs, setTickMs] = useState<number>(() => Date.now());
  const [bannerSlideOverride, setBannerSlideOverride] = useState<Record<string, number>>({});
  const [pausedBannerIds, setPausedBannerIds] = useState<Record<string, boolean>>({});

  // Per-banner live customization overrides (applies cleanly to any platform banner)
  const [bannerOverrides, setBannerOverrides] = useState<Record<string, BannerOverride>>({});

  // User-created custom banners saved locally
  const [userCustomBanners, setUserCustomBanners] = useState<MarketingBanner[]>(() => {
    try {
      const saved = localStorage.getItem(USER_CUSTOM_BANNERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(USER_CUSTOM_BANNERS_KEY, JSON.stringify(userCustomBanners));
    } catch {
      // ignore quota errors
    }
  }, [userCustomBanners]);

  // Custom Banner Studio panel state
  const [showStudio, setShowStudio] = useState<boolean>(false);
  const [studioDraft, setStudioDraft] = useState<Omit<MarketingBanner, 'id' | 'createdAt' | 'clicksCount'>>(
    DEFAULT_STUDIO_DRAFT
  );
  const [editingCustomBannerId, setEditingCustomBannerId] = useState<string | null>(null);
  const [studioNewImageUrl, setStudioNewImageUrl] = useState<string>('');
  const [overrideNewImageUrl, setOverrideNewImageUrl] = useState<Record<string, string>>({});

  // Video state
  const [videoSceneState, setVideoSceneState] = useState<Record<string, number>>({});
  const [pausedVideos, setPausedVideos] = useState<Record<string, boolean>>({});
  const [lightboxViewer, setLightboxViewer] = useState<{
    images: LightboxImageItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickMs(Date.now());
    }, 1000);
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

  const getEffectiveBanner = (banner: MarketingBanner): MarketingBanner => {
    const ov = bannerOverrides[banner.id];
    if (!ov) return banner;
    const nextSize = ov.size ?? banner.size;
    const preset = SIZE_PRESETS[nextSize] || SIZE_PRESETS.rectangle;
    const w = ov.customWidth ?? (nextSize === banner.size ? banner.customWidth : undefined) ?? preset.w;
    const h = ov.customHeight ?? (nextSize === banner.size ? banner.customHeight : undefined) ?? preset.h;
    return {
      ...banner,
      ...ov,
      size: nextSize,
      customWidth: w,
      customHeight: h,
      dimensions: `${w}×${h}`,
      imageUrl: ov.selectedSingleImage || banner.imageUrl,
      slideImages: ov.slideImages ?? banner.slideImages,
    };
  };

  const resolveDimensions = (banner: MarketingBanner): { w: number; h: number; label: string } => {
    const preset = SIZE_PRESETS[banner.size] || SIZE_PRESETS.rectangle;
    const w = Math.max(120, Math.min(2400, Number(banner.customWidth) || preset.w));
    const h = Math.max(60, Math.min(2400, Number(banner.customHeight) || preset.h));
    const prefix = banner.size === 'custom' ? 'Custom' : preset.label.split(' (')[0];
    return { w, h, label: `${prefix} (${w}×${h})` };
  };

  const getBannerImageMode = (banner: MarketingBanner): BannerImageMode => {
    if (banner.imageMode) return banner.imageMode;
    const slides = banner.slideImages?.filter(Boolean) || [];
    return slides.length > 1 ? 'multi' : 'single';
  };

  const getBannerSlides = (banner: MarketingBanner): string[] => {
    const mode = getBannerImageMode(banner);
    const list =
      banner.slideImages && banner.slideImages.length > 0
        ? banner.slideImages.filter(Boolean)
        : banner.imageUrl
        ? [banner.imageUrl]
        : [];
    if (mode === 'single') {
      const singleSrc = banner.imageUrl || list[0];
      return singleSrc ? [singleSrc] : [];
    }
    return list;
  };

  const getActiveSlideIndex = (banner: MarketingBanner): number => {
    const slides = getBannerSlides(banner);
    if (slides.length <= 1) return 0;
    if (bannerSlideOverride[banner.id] !== undefined) {
      return bannerSlideOverride[banner.id] % slides.length;
    }
    if (pausedBannerIds[banner.id]) return 0;
    const intervalSec = Math.max(1, banner.slideIntervalSec || 4);
    return Math.floor(tickMs / (intervalSec * 1000)) % slides.length;
  };

  const allDisplayBanners = useMemo(() => {
    const platform = marketingBanners.filter((b) => b.isActive);
    const combined = [...userCustomBanners, ...platform].map(getEffectiveBanner);
    return combined.filter((b) => {
      if (sizeFilter === 'custom_saved') {
        return b.id.startsWith('user-banner-');
      }
      const matchSize = sizeFilter === 'all' || b.size === sizeFilter;
      const effMode = getBannerImageMode(b);
      const matchMode = modeFilter === 'all' || effMode === modeFilter;
      return matchSize && matchMode;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketingBanners, userCustomBanners, bannerOverrides, sizeFilter, modeFilter]);

  const userRefCode = currentUser?.referralCode || 'APEX-VIP-REF';

  const getBannerReferralUrl = (banner: MarketingBanner) => {
    const sep = referralLink.includes('?') ? '&' : '?';
    return `${referralLink}${sep}banner=${encodeURIComponent(banner.id)}&dest=${encodeURIComponent(banner.targetTab)}`;
  };

  const buildHtmlEmbedCode = (banner: MarketingBanner) => {
    const dim = resolveDimensions(banner);
    const destUrl = getBannerReferralUrl(banner);
    const mode = getBannerImageMode(banner);
    const slides = getBannerSlides(banner);
    const primaryImg = slides[0] || '/promo-cyberbeast.jpg';
    const isRow = dim.w / Math.max(1, dim.h) >= 2.6;
    const isTall = dim.h / Math.max(1, dim.w) >= 1.45;
    const radius = banner.borderRadiusPx ?? 14;
    const scrimOpacity = banner.overlayOpacity ?? 0.35;
    const intervalMs = Math.max(1000, (banner.slideIntervalSec || 4) * 1000);
    const uid = `apx_${banner.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    if (mode === 'multi' && slides.length > 1) {
      const effect = banner.transitionEffect || 'fade';
      return `<!-- Apex Tesla Hub Multi-Image Switch Banner (${dim.w}×${dim.h}px • ${effect.toUpperCase()}) -->
<div id="${uid}" style="position:relative;display:${isRow ? 'flex' : 'inline-flex'};flex-direction:${isRow ? 'row' : 'column'};align-items:${isRow ? 'center' : 'flex-start'};justify-content:space-between;width:${dim.w}px;max-width:100%;height:${dim.h}px;padding:${isRow ? '12px 20px' : '18px'};box-sizing:border-box;background:#09090b;border:1px solid ${banner.accentColor};border-radius:${radius}px;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,sans-serif;overflow:hidden;">
  <div class="apx-slides" style="position:absolute;inset:0;z-index:0;pointer-events:none;">
    ${slides
      .map(
        (img, i) =>
          `<img src="${img}" alt="${banner.headline}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i === 0 ? scrimOpacity : 0};transition:opacity 0.6s ease,transform 0.7s ease;${effect === 'zoom' && i === 0 ? 'transform:scale(1.04);' : ''}" />`
      )
      .join('\n    ')}
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(9,9,11,0.86) 0%,rgba(24,24,27,0.58) 60%,${banner.accentColor}33 100%);"></div>
  </div>
  <a href="${destUrl}" target="_blank" rel="noopener noreferrer" style="position:relative;z-index:2;display:flex;flex-direction:${isRow ? 'row' : 'column'};align-items:${isRow ? 'center' : 'flex-start'};justify-content:space-between;width:100%;height:100%;color:inherit;text-decoration:none;gap:12px;">
    <div style="min-width:0;${isTall ? 'margin:auto 0;' : ''}">
      ${banner.showReferralCode !== false ? `<span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:1.2px;color:${banner.accentColor};text-transform:uppercase;">APEX TESLA HUB · CODE ${userRefCode}</span>` : ''}
      <div style="font-size:${isRow ? '15px' : '18px'};font-weight:900;line-height:1.2;margin-top:4px;">${banner.headline}</div>
      <div style="font-size:11px;color:#d4d4d8;margin-top:4px;line-height:1.35;">${banner.subheadline}</div>
    </div>
    <span style="display:inline-block;padding:8px 14px;background:${banner.accentColor};color:#ffffff;font-size:11px;font-weight:800;border-radius:10px;white-space:nowrap;">${banner.ctaText} →</span>
  </a>
  <script>
    (function(){
      var imgs=document.querySelectorAll('#${uid} .apx-slides img'),idx=0;
      if(imgs.length>1){setInterval(function(){imgs[idx].style.opacity='0';idx=(idx+1)%imgs.length;imgs[idx].style.opacity='${scrimOpacity}';},${intervalMs});}
    })();
  </script>
</div>`;
    }

    return `<!-- Apex Tesla Hub Single-Image Banner (${dim.w}×${dim.h}px) -->
<a href="${destUrl}" target="_blank" rel="noopener noreferrer" style="position:relative;display:${isRow ? 'flex' : 'inline-flex'};flex-direction:${isRow ? 'row' : 'column'};align-items:${isRow ? 'center' : 'flex-start'};justify-content:space-between;width:${dim.w}px;max-width:100%;height:${dim.h}px;padding:${isRow ? '12px 20px' : '18px'};box-sizing:border-box;background:linear-gradient(135deg,#09090b 0%,#18181b 55%,${banner.accentColor}33 100%);border:1px solid ${banner.accentColor};border-radius:${radius}px;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,sans-serif;text-decoration:none;overflow:hidden;">
  <img src="${primaryImg}" alt="${banner.headline}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${scrimOpacity};z-index:0;pointer-events:none;" />
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(9,9,11,0.82) 0%,rgba(24,24,27,0.5) 100%);z-index:1;"></div>
  <div style="position:relative;z-index:2;${isTall ? 'margin:auto 0;' : ''}">
    ${banner.showReferralCode !== false ? `<span style="display:inline-block;font-size:10px;font-weight:800;letter-spacing:1.2px;color:${banner.accentColor};text-transform:uppercase;">APEX TESLA HUB · CODE ${userRefCode}</span>` : ''}
    <div style="font-size:${isRow ? '15px' : '18px'};font-weight:900;line-height:1.2;margin-top:4px;">${banner.headline}</div>
    <div style="font-size:11px;color:#d4d4d8;margin-top:4px;line-height:1.35;">${banner.subheadline}</div>
  </div>
  <span style="position:relative;z-index:2;display:inline-block;margin-top:${isRow ? '0' : '12px'};padding:8px 14px;background:${banner.accentColor};color:#ffffff;font-size:11px;font-weight:800;border-radius:10px;white-space:nowrap;">${banner.ctaText} →</span>
</a>`;
  };

  const handleCopyEmbed = (banner: MarketingBanner) => {
    const dim = resolveDimensions(banner);
    navigator.clipboard.writeText(buildHtmlEmbedCode(banner));
    setCopiedId(`embed-${banner.id}`);
    showToast(`Copied ${dim.w}×${dim.h}px HTML embed (${getBannerImageMode(banner) === 'multi' ? 'Multi-Image Switch' : 'Single Image'})!`, 'success');
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleCopyRefLink = (banner: MarketingBanner) => {
    navigator.clipboard.writeText(getBannerReferralUrl(banner));
    setCopiedId(`link-${banner.id}`);
    showToast(`Copied referral link for "${banner.title}"!`, 'success');
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleDownloadSvgBanner = (banner: MarketingBanner) => {
    const dim = resolveDimensions(banner);
    const destUrl = getBannerReferralUrl(banner);
    const radius = banner.borderRadiusPx ?? 14;
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const isWide = dim.w / Math.max(1, dim.h) >= 2.6;
    const isTall = dim.h / Math.max(1, dim.w) >= 1.45;
    const padX = Math.max(16, Math.round(dim.w * 0.05));

    const svgContent = isWide
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="65%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="${radius}" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="20" y="${Math.round(dim.h * 0.27)}" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="10" font-weight="bold">APEX TESLA HUB · ${escapeXml(userRefCode)}</text>
  <text x="20" y="${Math.round(dim.h * 0.54)}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.h >= 180 ? 22 : 15}" font-weight="900">${escapeXml(banner.headline.slice(0, 56))}</text>
  <text x="20" y="${Math.round(dim.h * 0.78)}" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="${dim.h >= 180 ? 13 : 11}">${escapeXml(banner.subheadline.slice(0, 78))}</text>
  <rect x="${Math.max(20, dim.w - 172)}" y="${Math.round(dim.h / 2 - 21)}" width="152" height="42" rx="10" fill="${banner.accentColor}"/>
  <text x="${Math.max(96, dim.w - 96)}" y="${Math.round(dim.h / 2 + 4)}" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="12" font-weight="bold">${escapeXml(banner.ctaText)}</text>
</svg>`
      : isTall
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="50%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="${radius}" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="${padX}" y="42" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="${dim.w >= 400 ? 18 : 11}" font-weight="bold">APEX TESLA HUB</text>
  <text x="${padX}" y="66" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="${dim.w >= 400 ? 14 : 9}">REF: ${escapeXml(userRefCode)}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.36)}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 500 ? 38 : 16}" font-weight="900">${escapeXml(banner.headline.slice(0, 26))}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.42)}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 500 ? 38 : 16}" font-weight="900">${escapeXml(banner.headline.slice(26, 52))}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.52)}" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="${dim.w >= 500 ? 22 : 11}">${escapeXml(banner.subheadline.slice(0, 42))}</text>
  <rect x="${padX}" y="${Math.max(120, dim.h - 90)}" width="${dim.w - padX * 2}" height="52" rx="12" fill="${banner.accentColor}"/>
  <text x="${dim.w / 2}" y="${Math.max(150, dim.h - 59)}" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 500 ? 20 : 12}" font-weight="bold">${escapeXml(banner.ctaText)}</text>
  <text x="${padX}" y="${dim.h - 16}" fill="#71717a" font-family="monospace" font-size="9">${escapeXml(destUrl.slice(0, 42))}</text>
</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="60%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="${banner.accentColor}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${dim.w}" height="${dim.h}" rx="${radius}" fill="url(#bg)" stroke="${banner.accentColor}" stroke-width="2"/>
  <text x="${padX}" y="38" fill="${banner.accentColor}" font-family="Arial,sans-serif" font-size="${dim.w >= 700 ? 15 : 10}" font-weight="bold">APEX TESLA HUB · ${escapeXml(userRefCode)}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.34)}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 700 ? 32 : 16}" font-weight="900">${escapeXml(banner.headline.slice(0, 32))}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.45)}" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 700 ? 32 : 16}" font-weight="900">${escapeXml(banner.headline.slice(32, 64))}</text>
  <text x="${padX}" y="${Math.round(dim.h * 0.62)}" fill="#d4d4d8" font-family="Arial,sans-serif" font-size="${dim.w >= 700 ? 18 : 11}">${escapeXml(banner.subheadline.slice(0, 52))}</text>
  <rect x="${padX}" y="${Math.max(90, dim.h - 68)}" width="${Math.min(dim.w - padX * 2, 320)}" height="44" rx="10" fill="${banner.accentColor}"/>
  <text x="${padX + Math.min(dim.w - padX * 2, 320) / 2}" y="${Math.max(116, dim.h - 42)}" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="${dim.w >= 700 ? 16 : 12}" font-weight="bold">${escapeXml(banner.ctaText)}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-tesla-${dim.w}x${dim.h}-${userRefCode.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${dim.w}×${dim.h} SVG banner graphic!`, 'success');
  };

  const handleDownloadHdPng = async (banner: MarketingBanner) => {
    const dim = resolveDimensions(banner);
    const scale = banner.resolutionQuality === '4K UHD' && dim.w * dim.h <= 1500000 ? 2 : 1;
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

    // Paint active slide image if available
    const slides = getBannerSlides(banner);
    const activeSlideUrl = slides[getActiveSlideIndex(banner)] || banner.imageUrl;
    if (activeSlideUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            ctx.save();
            ctx.globalAlpha = banner.overlayOpacity ?? 0.38;
            const imgAspect = img.width / Math.max(1, img.height);
            const canvasAspect = dim.w / Math.max(1, dim.h);
            let drawW = dim.w;
            let drawH = dim.h;
            let dx = 0;
            let dy = 0;
            if (imgAspect > canvasAspect) {
              drawW = dim.h * imgAspect;
              dx = (dim.w - drawW) / 2;
            } else {
              drawH = dim.w / imgAspect;
              dy = (dim.h - drawH) / 2;
            }
            ctx.drawImage(img, dx, dy, drawW, drawH);
            ctx.restore();
          } catch {
            // fallback safely to gradient
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = activeSlideUrl;
      });
    }

    // Contrast scrim overlay
    const scrim = ctx.createLinearGradient(0, 0, dim.w, dim.h);
    scrim.addColorStop(0, 'rgba(7, 9, 14, 0.84)');
    scrim.addColorStop(0.6, 'rgba(11, 14, 22, 0.62)');
    scrim.addColorStop(1, `${banner.accentColor}40`);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, dim.w, dim.h);

    ctx.strokeStyle = banner.accentColor;
    ctx.lineWidth = Math.max(2, Math.round(dim.w * 0.003));
    ctx.strokeRect(1, 1, dim.w - 2, dim.h - 2);

    const isWide = dim.w / Math.max(1, dim.h) >= 2.6;
    const isTall = dim.h / Math.max(1, dim.w) >= 1.45;
    const padX = Math.max(16, Math.round(dim.w * 0.045));
    const qualityTag = banner.is3dHd ? `${banner.resolutionQuality || '4K UHD'} · 3D` : 'HD';

    ctx.fillStyle = banner.accentColor;
    ctx.font = `bold ${isWide ? 10 : Math.max(10, Math.round(dim.w * 0.022))}px monospace`;
    ctx.fillText(
      `APEX TESLA HUB · ${qualityTag}${banner.showReferralCode !== false ? ` · REF: ${userRefCode}` : ''}`,
      padX,
      isWide ? Math.max(20, Math.round(dim.h * 0.24)) : Math.max(26, Math.round(dim.h * 0.09))
    );

    ctx.fillStyle = '#ffffff';
    if (isWide) {
      const hFont = Math.max(14, Math.min(26, Math.round(dim.h * 0.16)));
      ctx.font = `900 ${hFont}px "Space Grotesk", Arial, sans-serif`;
      ctx.fillText(banner.headline.slice(0, 52), padX, Math.round(dim.h * 0.54));
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${Math.max(11, Math.min(16, Math.round(dim.h * 0.11)))}px Arial, sans-serif`;
      ctx.fillText(banner.subheadline.slice(0, 74), padX, Math.round(dim.h * 0.78));

      const btnW = Math.min(200, Math.round(dim.w * 0.22));
      const btnH = Math.min(54, Math.round(dim.h * 0.5));
      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(dim.w - btnW - padX, Math.round((dim.h - btnH) / 2), btnW, btnH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(11, Math.min(15, Math.round(dim.h * 0.12)))}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, dim.w - btnW / 2 - padX, Math.round(dim.h / 2 + 5));
    } else if (isTall) {
      const hFont = Math.max(15, Math.min(44, Math.round(dim.w * 0.065)));
      ctx.font = `900 ${hFont}px Arial, sans-serif`;
      ctx.fillText(banner.headline.slice(0, 22), padX, Math.round(dim.h * 0.34));
      ctx.fillText(banner.headline.slice(22, 44), padX, Math.round(dim.h * 0.4));
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${Math.max(11, Math.min(22, Math.round(dim.w * 0.036)))}px Arial, sans-serif`;
      ctx.fillText(banner.subheadline.slice(0, 32), padX, Math.round(dim.h * 0.52));
      ctx.fillText(banner.subheadline.slice(32, 64), padX, Math.round(dim.h * 0.57));

      const btnH = Math.max(42, Math.round(dim.h * 0.065));
      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(padX, dim.h - btnH - 24, dim.w - padX * 2, btnH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, Math.min(24, Math.round(dim.w * 0.04)))}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, dim.w / 2, dim.h - btnH / 2 - 19);
    } else {
      const hFont = Math.max(16, Math.min(34, Math.round(dim.w * 0.04)));
      ctx.font = `900 ${hFont}px Arial, sans-serif`;
      ctx.fillText(banner.headline.slice(0, 28), padX, Math.round(dim.h * 0.32));
      ctx.fillText(banner.headline.slice(28, 56), padX, Math.round(dim.h * 0.43));
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${Math.max(11, Math.min(18, Math.round(dim.w * 0.023)))}px Arial, sans-serif`;
      ctx.fillText(banner.subheadline.slice(0, 48), padX, Math.round(dim.h * 0.58));
      ctx.fillText(banner.subheadline.slice(48, 96), padX, Math.round(dim.h * 0.65));

      const btnW = Math.min(dim.w - padX * 2, Math.max(160, Math.round(dim.w * 0.36)));
      const btnH = Math.max(38, Math.min(54, Math.round(dim.h * 0.14)));
      ctx.fillStyle = banner.accentColor;
      ctx.fillRect(padX, dim.h - btnH - 20, btnW, btnH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, Math.min(18, Math.round(dim.w * 0.025)))}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(banner.ctaText, padX + btnW / 2, dim.h - btnH / 2 - 15);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apex-tesla-${dim.w}x${dim.h}-${userRefCode.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded PNG (${canvas.width}×${canvas.height}px) promotional banner!`, 'success');
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

  const getVideoReferralUrl = (vid: PromoVideoItem) => {
    const sep = referralLink.includes('?') ? '&' : '?';
    return `${referralLink}${sep}video=${encodeURIComponent(vid.id)}&dest=${encodeURIComponent(vid.targetTab)}`;
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadOrEncodeImage = async (file: File): Promise<string> => {
    const dataUrl = await readFileAsDataUrl(file);
    try {
      const resp = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.url) return data.url;
      }
    } catch {
      // fallback to local dataUrl for unsigned/offline session
    }
    return dataUrl;
  };

  const renderBannerVisual = (banner: MarketingBanner) => {
    const dim = resolveDimensions(banner);
    const destUrl = getBannerReferralUrl(banner);
    const activeTilt = tiltState?.id === banner.id ? tiltState : null;
    const is3d = banner.is3dHd !== false;
    const slides = getBannerSlides(banner);
    const mode = getBannerImageMode(banner);
    const effect = banner.transitionEffect || 'fade';
    const activeSlideIdx = getActiveSlideIndex(banner);
    const activeImage = slides[activeSlideIdx] || banner.imageUrl;
    const scrimOpacity = banner.overlayOpacity ?? 0.35;
    const radius = banner.borderRadiusPx ?? 16;
    const showRef = banner.showReferralCode !== false;

    const aspectRatio = dim.w / Math.max(1, dim.h);
    const isWide = aspectRatio >= 2.6;
    const isTall = dim.h / Math.max(1, dim.w) >= 1.45;

    // Fit large dimensions inside preview viewport proportionally while keeping exact aspect ratio
    const maxPreviewW = isTall ? Math.min(dim.w, 280) : Math.min(dim.w, 860);
    const scaleFactor = maxPreviewW / dim.w;
    const previewW = Math.round(dim.w * scaleFactor);
    const previewH = Math.max(isWide ? 82 : 160, Math.round(dim.h * scaleFactor));

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

    const slideImgTransitionClass =
      effect === 'zoom'
        ? 'scale-105 group-hover:scale-110 transition-all duration-700'
        : effect === 'slide'
        ? 'translate-x-0 transition-all duration-500'
        : 'transition-opacity duration-700';

    if (isWide) {
      return (
        <div className="w-full overflow-x-auto pb-2 flex flex-col items-center gap-2" style={{ perspective: '1200px' }}>
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
            onMouseLeave={() => setTiltState(null)}
            className={`mx-auto flex items-center justify-between gap-4 px-5 py-3 border bg-gradient-to-r ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
            style={{
              width: previewW,
              minHeight: previewH,
              borderRadius: radius,
              borderColor: `${banner.accentColor}88`,
              ...tiltStyle,
            }}
          >
            {activeImage && (
              <img
                key={`${banner.id}-lb-${activeSlideIdx}-${activeImage}`}
                src={activeImage}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${slideImgTransitionClass}`}
                style={{ opacity: scrimOpacity }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30 pointer-events-none" />
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
                <div className="flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                  <span style={{ color: banner.accentColor }}>APEX TESLA</span>
                  {showRef && <span>· REF: {userRefCode}</span>}
                  {banner.carRenderModel && <span className="hidden sm:inline">· {banner.carRenderModel}</span>}
                </div>
                <h4 className="font-heading font-black text-sm sm:text-base text-white truncate drop-shadow">
                  {banner.headline}
                </h4>
                <p className="text-[11px] text-zinc-200 truncate">{banner.subheadline}</p>
              </div>
            </div>
            <span
              className="relative z-10 px-4 py-2 rounded-xl text-xs font-heading font-black text-white shrink-0 shadow-lg whitespace-nowrap"
              style={{ backgroundColor: banner.accentColor }}
            >
              {banner.ctaText} →
            </span>
          </a>
          <span className="text-[10px] font-mono text-zinc-500">
            Export Dimensions: {dim.w}×{dim.h}px · {mode === 'multi' ? `Multi-Image Switch (${slides.length} slides)` : 'Single Image'}
          </span>
        </div>
      );
    }

    if (isTall) {
      return (
        <div className="w-full flex flex-col items-center gap-2 py-2" style={{ perspective: '1200px' }}>
          <a
            href={destUrl}
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate(banner.targetTab);
            }}
            onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
            onMouseLeave={() => setTiltState(null)}
            className={`flex flex-col justify-between p-5 border bg-gradient-to-b ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
            style={{
              width: previewW,
              minHeight: Math.min(previewH, 520),
              borderRadius: radius,
              borderColor: `${banner.accentColor}88`,
              ...tiltStyle,
            }}
          >
            {activeImage && (
              <img
                key={`${banner.id}-sb-${activeSlideIdx}-${activeImage}`}
                src={activeImage}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${slideImgTransitionClass}`}
                style={{ opacity: scrimOpacity }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80 pointer-events-none" />
            {is3d && (
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background: `radial-gradient(circle at ${activeTilt?.gx ?? 30}% ${activeTilt?.gy ?? 20}%, rgba(255,255,255,0.2), transparent 55%)`,
                }}
              />
            )}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" style={{ color: banner.accentColor }} />
                  <span className="font-heading font-black text-xs text-white">APEX TESLA</span>
                </div>
                {showRef && (
                  <span className="text-[9px] font-mono font-bold" style={{ color: banner.accentColor }}>
                    {userRefCode}
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 space-y-3 my-auto">
              <h4 className="font-heading font-black text-lg text-white leading-tight drop-shadow">
                {banner.headline}
              </h4>
              <p className="text-xs text-zinc-200 leading-relaxed">{banner.subheadline}</p>
              {banner.carRenderModel && (
                <div className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                  <Car className="w-3 h-3 shrink-0" />
                  <span className="truncate">{banner.carRenderModel}</span>
                </div>
              )}
            </div>

            <div className="relative z-10 space-y-2">
              <div
                className="w-full py-2.5 px-3 rounded-xl text-center text-xs font-heading font-black text-white shadow-lg"
                style={{ backgroundColor: banner.accentColor }}
              >
                {banner.ctaText} →
              </div>
            </div>
          </a>
          <span className="text-[10px] font-mono text-zinc-500">
            Export Dimensions: {dim.w}×{dim.h}px · {mode === 'multi' ? `Multi-Image Switch (${slides.length} slides)` : 'Single Image'}
          </span>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center gap-2 py-2 overflow-x-auto" style={{ perspective: '1200px' }}>
        <a
          href={destUrl}
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate(banner.targetTab);
          }}
          onMouseMove={(e) => is3d && handle3dMouseMove(banner.id, e)}
          onMouseLeave={() => setTiltState(null)}
          className={`flex flex-col justify-between p-5 border bg-gradient-to-br ${banner.themeGradient} relative overflow-hidden group shadow-2xl`}
          style={{
            width: Math.max(260, Math.min(previewW, 640)),
            minHeight: Math.max(220, Math.min(previewH, 360)),
            borderRadius: radius,
            borderColor: `${banner.accentColor}88`,
            ...tiltStyle,
          }}
        >
          {activeImage && (
            <img
              key={`${banner.id}-card-${activeSlideIdx}-${activeImage}`}
              src={activeImage}
              alt={banner.title}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${slideImgTransitionClass}`}
              style={{ opacity: scrimOpacity }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/55 pointer-events-none" />
          {is3d && (
            <div
              className="absolute inset-0 pointer-events-none opacity-65"
              style={{
                background: `radial-gradient(circle at ${activeTilt?.gx ?? 30}% ${activeTilt?.gy ?? 25}%, rgba(255,255,255,0.22), transparent 58%)`,
              }}
            />
          )}
          <div className="relative z-10 flex items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span style={{ color: banner.accentColor }}>APEX TESLA HUB</span>
            {showRef && <span className="text-zinc-300">{userRefCode}</span>}
          </div>

          <div className="relative z-10 space-y-1.5 my-auto py-3">
            <h4 className="font-heading font-black text-lg sm:text-xl text-white leading-snug drop-shadow max-w-md">
              {banner.headline}
            </h4>
            <p className="text-xs text-zinc-200 leading-relaxed line-clamp-3 max-w-md">
              {banner.subheadline}
            </p>
            {banner.carRenderModel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300">
                <Car className="w-3 h-3" />
                {banner.carRenderModel}
              </span>
            )}
          </div>

          <div
            className="relative z-10 w-full sm:w-fit py-2.5 px-5 rounded-xl text-center text-xs font-heading font-black text-white shadow-lg whitespace-nowrap"
            style={{ backgroundColor: banner.accentColor }}
          >
            {banner.ctaText} →
          </div>
        </a>
        <span className="text-[10px] font-mono text-zinc-500">
          Export Dimensions: {dim.w}×{dim.h}px · {mode === 'multi' ? `Multi-Image Switch (${slides.length} slides)` : 'Single Image'}
        </span>
      </div>
    );
  };

  const handleSaveStudioBanner = () => {
    const w = studioDraft.customWidth || SIZE_PRESETS[studioDraft.size]?.w || 800;
    const h = studioDraft.customHeight || SIZE_PRESETS[studioDraft.size]?.h || 400;
    const mode = studioDraft.imageMode || 'multi';
    const slides = (studioDraft.slideImages || []).filter(Boolean);
    const finalSlides =
      mode === 'single'
        ? [studioDraft.imageUrl || slides[0] || '/promo-cyberbeast.jpg']
        : slides.length > 0
        ? slides
        : ['/promo-cyberbeast.jpg', '/promo-plaid.jpg'];

    if (editingCustomBannerId) {
      setUserCustomBanners((prev) =>
        prev.map((b) =>
          b.id === editingCustomBannerId
            ? {
                ...b,
                ...studioDraft,
                customWidth: w,
                customHeight: h,
                dimensions: `${w}×${h}`,
                imageUrl: finalSlides[0],
                slideImages: finalSlides,
              }
            : b
        )
      );
      showToast(`Updated custom banner (${w}×${h}px · ${mode === 'multi' ? 'Multi-Image Switch' : 'Single Image'})!`, 'success');
    } else {
      const created: MarketingBanner = {
        ...studioDraft,
        id: `user-banner-${Date.now()}`,
        customWidth: w,
        customHeight: h,
        dimensions: `${w}×${h}`,
        imageUrl: finalSlides[0],
        slideImages: finalSlides,
        isActive: true,
        clicksCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUserCustomBanners((prev) => [created, ...prev]);
      showToast(`Created custom banner (${w}×${h}px · ${mode === 'multi' ? 'Multi-Image Switch' : 'Single Image'})!`, 'success');
    }

    setEditingCustomBannerId(null);
    setShowStudio(false);
    setSizeFilter('custom_saved');
  };

  const studioPreviewBanner: MarketingBanner = {
    ...studioDraft,
    id: editingCustomBannerId || 'studio-preview',
    createdAt: '2026-11-12',
    dimensions: `${studioDraft.customWidth || SIZE_PRESETS[studioDraft.size].w}×${studioDraft.customHeight || SIZE_PRESETS[studioDraft.size].h}`,
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
            <Megaphone className="w-4 h-4" />
            <span>Ambassador Ad Studio · Custom Sizes &amp; Single / Multi-Image Banners</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            PROMOTIONAL MARKETING BANNERS
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Configure custom banner dimensions, switch any banner between Single Image and Multi-Image Switch modes, tune transitions and colors, and export HTML embeds, SVG vectors, or 4K PNGs synced to your referral link.
          </p>
        </div>

        {/* User Referral Link Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 lg:w-[400px] shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-emerald-400">Embedded Referral Link</span>
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
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer whitespace-nowrap"
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

      {/* Top Action Bar: Custom Banner Builder Toggle + Image Type Filter + Size Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Single / Multi-Image Filter Segmented Bar */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start">
            {(
              [
                { id: 'all', label: 'All Banner Types' },
                { id: 'single', label: 'Single Image' },
                { id: 'multi', label: 'Multi-Image Switch' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setModeFilter(opt.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  modeFilter === opt.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!showStudio) {
                setEditingCustomBannerId(null);
                setStudioDraft(DEFAULT_STUDIO_DRAFT);
              }
              setShowStudio((v) => !v);
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-red-950/30"
          >
            {showStudio ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showStudio ? 'Close Custom Banner Studio' : 'Create Custom Banner'}</span>
          </button>
        </div>

        {/* Format & Size Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All Sizes (${marketingBanners.filter((b) => b.isActive).length + userCustomBanners.length})`, icon: Layout },
            { id: 'leaderboard', label: 'Leaderboard (728×90)', icon: RectangleHorizontal },
            { id: 'billboard', label: 'Billboard (970×250)', icon: Monitor },
            { id: 'square', label: 'Square (300×300)', icon: Square },
            { id: 'rectangle', label: 'Rectangle (300×250)', icon: RectangleHorizontal },
            { id: 'sidebar', label: 'Sidebar (160×600)', icon: PanelLeft },
            { id: 'wide_skyscraper', label: 'Half-Page (300×600)', icon: PanelLeft },
            { id: 'social_og', label: 'Social Card (1200×628)', icon: Share2 },
            { id: 'story', label: 'Story (1080×1920)', icon: Smartphone },
            { id: 'mobile_banner', label: 'Mobile (320×100)', icon: Smartphone },
            { id: 'custom_saved', label: `My Custom Banners (${userCustomBanners.length})`, icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = sizeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSizeFilter(tab.id as 'all' | 'custom_saved' | BannerSizeType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer whitespace-nowrap shrink-0 ${
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
      </div>

      {/* INTERACTIVE CUSTOM BANNER BUILDER STUDIO */}
      {showStudio && (
        <section className="rounded-3xl border border-zinc-700 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                {editingCustomBannerId ? 'Edit Custom Banner' : 'Custom Banner Builder Studio'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pick any size preset or custom width × height, toggle Single Image vs. Multi-Image Switch, customize transitions, colors, and export or save.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCustomBannerId(null);
                setStudioDraft(DEFAULT_STUDIO_DRAFT);
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Configuration Controls */}
            <div className="lg:col-span-5 space-y-5 text-xs">
              {/* 1. Custom Size Selection */}
              <div className="space-y-2.5">
                <label className="text-zinc-200 font-bold block">1. Banner Size &amp; Custom Dimensions</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(SIZE_PRESETS) as BannerSizeType[]).map((key) => {
                    const p = SIZE_PRESETS[key];
                    const selected = studioDraft.size === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setStudioDraft((prev) => ({
                            ...prev,
                            size: key,
                            customWidth: key === 'custom' ? prev.customWidth || 800 : p.w,
                            customHeight: key === 'custom' ? prev.customHeight || 400 : p.h,
                            dimensions: `${key === 'custom' ? prev.customWidth || 800 : p.w}×${key === 'custom' ? prev.customHeight || 400 : p.h}`,
                          }))
                        }
                        className={`px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                          selected
                            ? 'bg-red-600/20 border-red-500 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="font-semibold truncate">{p.label.split(' (')[0]}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{p.shortLabel}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Always-editable Width × Height inputs */}
                <div className="flex items-end gap-2 pt-1">
                  <div className="flex-1">
                    <label className="text-[11px] text-zinc-400 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      min={120}
                      max={2400}
                      value={studioDraft.customWidth ?? SIZE_PRESETS[studioDraft.size].w}
                      onChange={(e) => {
                        const w = Math.max(120, Math.min(2400, Number(e.target.value) || 300));
                        const h = studioDraft.customHeight ?? SIZE_PRESETS[studioDraft.size].h;
                        setStudioDraft((prev) => ({
                          ...prev,
                          size: 'custom',
                          customWidth: w,
                          customHeight: h,
                          dimensions: `${w}×${h}`,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const w = studioDraft.customWidth ?? SIZE_PRESETS[studioDraft.size].w;
                      const h = studioDraft.customHeight ?? SIZE_PRESETS[studioDraft.size].h;
                      setStudioDraft((prev) => ({
                        ...prev,
                        size: 'custom',
                        customWidth: h,
                        customHeight: w,
                        dimensions: `${h}×${w}`,
                      }));
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer shrink-0"
                    title="Swap Width & Height"
                    aria-label="Swap width and height"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <label className="text-[11px] text-zinc-400 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      min={60}
                      max={2400}
                      value={studioDraft.customHeight ?? SIZE_PRESETS[studioDraft.size].h}
                      onChange={(e) => {
                        const h = Math.max(60, Math.min(2400, Number(e.target.value) || 250));
                        const w = studioDraft.customWidth ?? SIZE_PRESETS[studioDraft.size].w;
                        setStudioDraft((prev) => ({
                          ...prev,
                          size: 'custom',
                          customWidth: w,
                          customHeight: h,
                          dimensions: `${w}×${h}`,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Single Image vs Multi-Image Switch Banner Type */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <label className="text-zinc-200 font-bold block">2. Banner Image Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setStudioDraft((prev) => ({ ...prev, imageMode: 'single' }))}
                    className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      (studioDraft.imageMode || 'multi') === 'single'
                        ? 'bg-red-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Single Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioDraft((prev) => ({ ...prev, imageMode: 'multi' }))}
                    className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      (studioDraft.imageMode || 'multi') === 'multi'
                        ? 'bg-red-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Multi-Image Switch</span>
                  </button>
                </div>

                {/* Preset Gallery Selector (Single picks 1 active; Multi toggles active slide set) */}
                <div className="grid grid-cols-4 gap-2">
                  {GALLERY_BACKDROPS.map((item) => {
                    const isSingle = (studioDraft.imageMode || 'multi') === 'single';
                    const isSelected = isSingle
                      ? studioDraft.imageUrl === item.url
                      : (studioDraft.slideImages || []).includes(item.url);
                    return (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => {
                          if (isSingle) {
                            setStudioDraft((prev) => ({ ...prev, imageUrl: item.url }));
                          } else {
                            setStudioDraft((prev) => {
                              const curr = prev.slideImages || [];
                              const exists = curr.includes(item.url);
                              const nextSlides = exists
                                ? curr.length > 1
                                  ? curr.filter((u) => u !== item.url)
                                  : curr
                                : [...curr, item.url];
                              return {
                                ...prev,
                                slideImages: nextSlides,
                                imageUrl: nextSlides[0] || prev.imageUrl,
                              };
                            });
                          }
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition cursor-pointer ${
                          isSelected ? 'border-red-500 ring-2 ring-red-500/30' : 'border-zinc-800 opacity-70 hover:opacity-100'
                        }`}
                        title={item.label}
                      >
                        <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Multi-Image Switch Transition & Timing OR Add Image URL/Upload */}
                {(studioDraft.imageMode || 'multi') === 'multi' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Switch Transition</label>
                      <select
                        value={studioDraft.transitionEffect || 'fade'}
                        onChange={(e) =>
                          setStudioDraft((prev) => ({
                            ...prev,
                            transitionEffect: e.target.value as BannerTransitionEffect,
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                      >
                        <option value="fade">Crossfade</option>
                        <option value="slide">Slide Transition</option>
                        <option value="zoom">Smooth Zoom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Switch Interval</label>
                      <select
                        value={studioDraft.slideIntervalSec || 4}
                        onChange={(e) =>
                          setStudioDraft((prev) => ({
                            ...prev,
                            slideIntervalSec: Number(e.target.value) || 4,
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                      >
                        <option value={2}>Every 2s</option>
                        <option value={3}>Every 3s</option>
                        <option value={4}>Every 4s</option>
                        <option value={6}>Every 6s</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Add custom URL or Upload Local Image */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studioNewImageUrl}
                    onChange={(e) => setStudioNewImageUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = studioNewImageUrl.trim();
                      if (!trimmed) return;
                      if ((studioDraft.imageMode || 'multi') === 'single') {
                        setStudioDraft((prev) => ({ ...prev, imageUrl: trimmed }));
                      } else {
                        setStudioDraft((prev) => ({
                          ...prev,
                          slideImages: [...(prev.slideImages || []), trimmed],
                          imageUrl: prev.imageUrl || trimmed,
                        }));
                      }
                      setStudioNewImageUrl('');
                      showToast('Added custom image to banner!', 'success');
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold cursor-pointer shrink-0"
                  >
                    Add URL
                  </button>
                  <label className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple={(studioDraft.imageMode || 'multi') === 'multi'}
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        const urls = await Promise.all(files.map(uploadOrEncodeImage));
                        if ((studioDraft.imageMode || 'multi') === 'single') {
                          setStudioDraft((prev) => ({ ...prev, imageUrl: urls[0] }));
                        } else {
                          setStudioDraft((prev) => ({
                            ...prev,
                            slideImages: [...(prev.slideImages || []), ...urls],
                            imageUrl: prev.imageUrl || urls[0],
                          }));
                        }
                        e.target.value = '';
                        showToast(`Added ${urls.length} image(s)!`, 'success');
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Copy & Visual Appearance ("etc") */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <label className="text-zinc-200 font-bold block">3. Copy, Theme &amp; Layout Options</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Banner Name</label>
                    <input
                      type="text"
                      value={studioDraft.title}
                      onChange={(e) => setStudioDraft((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Target Page</label>
                    <select
                      value={studioDraft.targetTab}
                      onChange={(e) => setStudioDraft((prev) => ({ ...prev, targetTab: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    >
                      <option value="vehicles">Car Sales Showroom</option>
                      <option value="stocks">TSLA Stocks</option>
                      <option value="investment">Fleet Staking Yield</option>
                      <option value="promotions">Spin &amp; Scratch</option>
                      <option value="referrals">Referrals (+$100)</option>
                      <option value="shop">Hardware Store</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Headline</label>
                  <input
                    type="text"
                    value={studioDraft.headline}
                    onChange={(e) => setStudioDraft((prev) => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={studioDraft.subheadline}
                    onChange={(e) => setStudioDraft((prev) => ({ ...prev, subheadline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={studioDraft.ctaText}
                      onChange={(e) => setStudioDraft((prev) => ({ ...prev, ctaText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Theme Gradient</label>
                    <select
                      value={studioDraft.themeGradient}
                      onChange={(e) => {
                        const found = GRADIENT_THEMES.find((g) => g.value === e.target.value);
                        setStudioDraft((prev) => ({
                          ...prev,
                          themeGradient: e.target.value,
                          accentColor: found?.accent || prev.accentColor,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                    >
                      {GRADIENT_THEMES.map((g) => (
                        <option key={g.id} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 mr-1">Accent:</span>
                    {ACCENT_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setStudioDraft((prev) => ({ ...prev, accentColor: hex }))}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer transition ${
                          studioDraft.accentColor === hex ? 'border-white scale-110' : 'border-zinc-700'
                        }`}
                        style={{ backgroundColor: hex }}
                        aria-label={`Accent color ${hex}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={studioDraft.accentColor}
                      onChange={(e) => setStudioDraft((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                      title="Custom accent color"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={studioDraft.is3dHd !== false}
                        onChange={(e) => setStudioDraft((prev) => ({ ...prev, is3dHd: e.target.checked }))}
                        className="rounded text-red-500"
                      />
                      <span>3D Tilt</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={studioDraft.showReferralCode !== false}
                        onChange={(e) => setStudioDraft((prev) => ({ ...prev, showReferralCode: e.target.checked }))}
                        className="rounded text-red-500"
                      />
                      <span>Show Ref Code</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Backdrop Opacity</span>
                      <span className="font-mono text-white">{Math.round((studioDraft.overlayOpacity ?? 0.42) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={85}
                      value={Math.round((studioDraft.overlayOpacity ?? 0.42) * 100)}
                      onChange={(e) =>
                        setStudioDraft((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) / 100 }))
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Corner Radius</span>
                      <span className="font-mono text-white">{studioDraft.borderRadiusPx ?? 16}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      value={studioDraft.borderRadiusPx ?? 16}
                      onChange={(e) =>
                        setStudioDraft((prev) => ({ ...prev, borderRadiusPx: Number(e.target.value) }))
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Preview & Instant Export */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#05070b] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">Live Studio Preview</span>
                  <span className="font-mono text-zinc-400">
                    {studioPreviewBanner.dimensions} ·{' '}
                    {(studioPreviewBanner.imageMode || 'multi') === 'multi'
                      ? `Multi-Image (${studioPreviewBanner.slideImages?.length || 1})`
                      : 'Single Image'}
                  </span>
                </div>

                {renderBannerVisual(studioPreviewBanner)}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveStudioBanner}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCustomBannerId ? 'Save Updated Banner' : 'Save to My Custom Banners'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyEmbed(studioPreviewBanner)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Code2 className="w-4 h-4 text-red-400" />
                  <span>Copy HTML Embed</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadHdPng(studioPreviewBanner)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSvgBanner(studioPreviewBanner)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>SVG</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Banners List */}
      <div className="space-y-8">
        {allDisplayBanners.length === 0 ? (
          <div className="p-10 rounded-3xl border border-zinc-800 bg-zinc-950 text-center space-y-3">
            <p className="text-sm text-zinc-400">
              No banners match the selected size or image mode filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSizeFilter('all');
                setModeFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold cursor-pointer"
            >
              Show All Banners
            </button>
          </div>
        ) : (
          allDisplayBanners.map((banner) => {
            const dim = resolveDimensions(banner);
            const destUrl = getBannerReferralUrl(banner);
            const isCodeOpen = openCodeId === banner.id;
            const isCustomizing = customizingBannerId === banner.id;
            const isUserCustom = banner.id.startsWith('user-banner-');
            const effMode = getBannerImageMode(banner);
            const slides = getBannerSlides(banner);
            const isPaused = Boolean(pausedBannerIds[banner.id]);
            const hasOverride = Boolean(bannerOverrides[banner.id]);

            return (
              <div
                key={banner.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 sm:p-7 space-y-5 shadow-2xl"
              >
                {/* Banner Meta Header (Clean unboxed metadata separated by · ) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="font-mono font-semibold text-zinc-200">{dim.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className={effMode === 'multi' ? 'text-amber-300 font-medium' : 'text-cyan-300 font-medium'}>
                        {effMode === 'multi' ? `Multi-Image Switch (${slides.length} slides)` : 'Single Image'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">/{banner.targetTab}</span>
                      {isUserCustom && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-semibold">Custom Saved</span>
                        </>
                      )}
                      {hasOverride && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-red-400 font-semibold">Customized</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white">{banner.title}</h3>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomizingBannerId(isCustomizing ? null : banner.id)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                        isCustomizing
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isCustomizing ? 'Close Options' : 'Customize Size & Type'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyEmbed(banner)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
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
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
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
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSvgBanner(banner)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
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
                      className="px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (slides.length === 0) return;
                        setLightboxViewer({
                          index: getActiveSlideIndex(banner),
                          images: slides.map((url, idx) => ({
                            url,
                            title: `${banner.title} (Slide ${idx + 1}/${slides.length})`,
                            subtitle: `${dim.label} · ${banner.headline}`,
                            badge: banner.resolutionQuality || '4K UHD',
                          })),
                        });
                      }}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                      title="Inspect banner artwork in Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Zoom</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenCodeId(isCodeOpen ? null : banner.id)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono cursor-pointer whitespace-nowrap"
                    >
                      {isCodeOpen ? 'Hide HTML' : 'View HTML'}
                    </button>

                    {isUserCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserCustomBanners((prev) => prev.filter((u) => u.id !== banner.id));
                          showToast('Custom banner deleted.', 'info');
                        }}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Delete custom banner"
                        aria-label="Delete custom banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline User Customizer Drawer for Any Banner */}
                {isCustomizing && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-700 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <span className="font-bold text-white">
                        Customize Size, Image Mode &amp; Styling
                      </span>
                      {hasOverride && (
                        <button
                          type="button"
                          onClick={() =>
                            setBannerOverrides((prev) => {
                              const next = { ...prev };
                              delete next[banner.id];
                              return next;
                            })
                          }
                          className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Original</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Size Preset & Custom Width/Height */}
                      <div className="space-y-2">
                        <label className="text-zinc-300 font-semibold block">Banner Size &amp; Custom px</label>
                        <select
                          value={banner.size}
                          onChange={(e) => {
                            const s = e.target.value as BannerSizeType;
                            const preset = SIZE_PRESETS[s];
                            setBannerOverrides((prev) => ({
                              ...prev,
                              [banner.id]: {
                                ...prev[banner.id],
                                size: s,
                                customWidth: s === 'custom' ? prev[banner.id]?.customWidth || dim.w : preset.w,
                                customHeight: s === 'custom' ? prev[banner.id]?.customHeight || dim.h : preset.h,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                        >
                          {(Object.keys(SIZE_PRESETS) as BannerSizeType[]).map((key) => (
                            <option key={key} value={key}>
                              {SIZE_PRESETS[key].label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={120}
                            max={2400}
                            value={dim.w}
                            aria-label="Custom banner width"
                            onChange={(e) => {
                              const w = Math.max(120, Math.min(2400, Number(e.target.value) || 300));
                              setBannerOverrides((prev) => ({
                                ...prev,
                                [banner.id]: {
                                  ...prev[banner.id],
                                  size: 'custom',
                                  customWidth: w,
                                  customHeight: prev[banner.id]?.customHeight || dim.h,
                                },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono"
                          />
                          <span className="text-zinc-500">×</span>
                          <input
                            type="number"
                            min={60}
                            max={2400}
                            value={dim.h}
                            aria-label="Custom banner height"
                            onChange={(e) => {
                              const h = Math.max(60, Math.min(2400, Number(e.target.value) || 250));
                              setBannerOverrides((prev) => ({
                                ...prev,
                                [banner.id]: {
                                  ...prev[banner.id],
                                  size: 'custom',
                                  customWidth: prev[banner.id]?.customWidth || dim.w,
                                  customHeight: h,
                                },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Single vs Multi Image Switch Mode */}
                      <div className="space-y-2">
                        <label className="text-zinc-300 font-semibold block">Image Switch Mode</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                          <button
                            type="button"
                            onClick={() =>
                              setBannerOverrides((prev) => ({
                                ...prev,
                                [banner.id]: { ...prev[banner.id], imageMode: 'single' },
                              }))
                            }
                            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                              effMode === 'single' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Single</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBannerOverrides((prev) => ({
                                ...prev,
                                [banner.id]: {
                                  ...prev[banner.id],
                                  imageMode: 'multi',
                                  slideImages:
                                    prev[banner.id]?.slideImages ||
                                    (banner.slideImages && banner.slideImages.length > 1
                                      ? banner.slideImages
                                      : ['/promo-cyberbeast.jpg', '/promo-plaid.jpg', '/promo-robotaxi.jpg']),
                                },
                              }))
                            }
                            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                              effMode === 'multi' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            <span>Multi-Switch</span>
                          </button>
                        </div>

                        {effMode === 'multi' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={banner.transitionEffect || 'fade'}
                              onChange={(e) =>
                                setBannerOverrides((prev) => ({
                                  ...prev,
                                  [banner.id]: {
                                    ...prev[banner.id],
                                    transitionEffect: e.target.value as BannerTransitionEffect,
                                  },
                                }))
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                            >
                              <option value="fade">Fade Switch</option>
                              <option value="slide">Slide Switch</option>
                              <option value="zoom">Zoom Switch</option>
                            </select>
                            <select
                              value={banner.slideIntervalSec || 4}
                              onChange={(e) =>
                                setBannerOverrides((prev) => ({
                                  ...prev,
                                  [banner.id]: {
                                    ...prev[banner.id],
                                    slideIntervalSec: Number(e.target.value) || 4,
                                  },
                                }))
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono"
                            >
                              <option value={2}>2s Speed</option>
                              <option value={3}>3s Speed</option>
                              <option value={4}>4s Speed</option>
                              <option value={6}>6s Speed</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            {GALLERY_BACKDROPS.slice(0, 3).map((g) => (
                              <button
                                key={g.url}
                                type="button"
                                onClick={() =>
                                  setBannerOverrides((prev) => ({
                                    ...prev,
                                    [banner.id]: {
                                      ...prev[banner.id],
                                      imageMode: 'single',
                                      selectedSingleImage: g.url,
                                    },
                                  }))
                                }
                                className={`flex-1 h-9 rounded-lg overflow-hidden border-2 cursor-pointer ${
                                  (banner.imageUrl || slides[0]) === g.url ? 'border-red-500' : 'border-zinc-800 opacity-70'
                                }`}
                                title={g.label}
                              >
                                <img src={g.url} alt={g.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Styling, Opacity & Add Image */}
                      <div className="space-y-2">
                        <label className="text-zinc-300 font-semibold block">Style, Backdrop &amp; Depth</label>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {ACCENT_SWATCHES.slice(0, 4).map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() =>
                                  setBannerOverrides((prev) => ({
                                    ...prev,
                                    [banner.id]: { ...prev[banner.id], accentColor: hex },
                                  }))
                                }
                                className={`w-5 h-5 rounded-full border cursor-pointer ${
                                  banner.accentColor === hex ? 'border-white scale-110' : 'border-zinc-700'
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                            <input
                              type="color"
                              value={banner.accentColor}
                              onChange={(e) =>
                                setBannerOverrides((prev) => ({
                                  ...prev,
                                  [banner.id]: { ...prev[banner.id], accentColor: e.target.value },
                                }))
                              }
                              className="w-6 h-6 rounded bg-zinc-950 border border-zinc-700 cursor-pointer"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={banner.is3dHd !== false}
                              onChange={(e) =>
                                setBannerOverrides((prev) => ({
                                  ...prev,
                                  [banner.id]: { ...prev[banner.id], is3dHd: e.target.checked },
                                }))
                              }
                              className="rounded text-red-500"
                            />
                            <span>3D Tilt</span>
                          </label>
                        </div>

                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={overrideNewImageUrl[banner.id] || ''}
                            onChange={(e) =>
                              setOverrideNewImageUrl((prev) => ({ ...prev, [banner.id]: e.target.value }))
                            }
                            placeholder="Custom image URL..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const url = (overrideNewImageUrl[banner.id] || '').trim();
                              if (!url) return;
                              setBannerOverrides((prev) => {
                                const curr = prev[banner.id] || {};
                                const existingSlides = curr.slideImages || banner.slideImages || [];
                                return {
                                  ...prev,
                                  [banner.id]: {
                                    ...curr,
                                    selectedSingleImage: url,
                                    slideImages: [...existingSlides, url],
                                  },
                                };
                              });
                              setOverrideNewImageUrl((prev) => ({ ...prev, [banner.id]: '' }));
                              showToast('Updated banner image!', 'success');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold cursor-pointer shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Visual Preview Stage */}
                <div className="p-4 sm:p-6 rounded-2xl bg-[#05070b] border border-zinc-800/80 space-y-3">
                  {renderBannerVisual(banner)}
                  {effMode === 'multi' && slides.length > 1 && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-900">
                      <span className="text-[10px] font-mono text-zinc-400">
                        Multi-Image Switch ({getActiveSlideIndex(banner) + 1} / {slides.length} · {banner.transitionEffect || 'fade'})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPausedBannerIds((prev) => ({ ...prev, [banner.id]: !prev[banner.id] }))
                          }
                          className="p-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title={isPaused ? 'Resume auto switch' : 'Pause auto switch'}
                          aria-label={isPaused ? 'Resume slide switch' : 'Pause slide switch'}
                        >
                          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const total = slides.length;
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
                        {slides.map((_, sIdx) => (
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
                            const total = slides.length;
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
          })
        )}
      </div>

      {/* Promotional Short Videos Gallery */}
      <div className="pt-6 border-t border-zinc-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Film className="w-4 h-4" />
              <span>Motion Reels &amp; Uploaded Promo Videos</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              PROMOTIONAL SHORT VIDEOS
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Watch and share high-converting 9:16 &amp; 16:9 promotional short videos with your embedded invite code.
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
                        referrerPolicy="no-referrer"
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
                          REEL · {vid.durationSec}s
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const frames =
                                vid.scenes && vid.scenes.length > 0
                                  ? vid.scenes.map((sc, sIdx) => ({
                                      url: sc.bgImage || vid.thumbnailUrl || '',
                                      title: `${vid.title} · Scene ${sIdx + 1}`,
                                      subtitle: `${sc.title} — ${sc.subtitle}`,
                                      badge: sc.metric,
                                    }))
                                  : [
                                      {
                                        url: vid.thumbnailUrl || '',
                                        title: vid.title,
                                        subtitle: vid.subheadline,
                                        badge: `REEL · ${vid.durationSec}s`,
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
                            title={isPaused ? 'Play Motion Reel' : 'Pause Motion Reel'}
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
                        {vid.videoType === 'uploaded' ? 'Studio Upload' : 'Storyboard Motion Reel'}
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
