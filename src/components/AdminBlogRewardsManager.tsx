import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BlogCategory,
  BlogPost,
  BlogPostStatus,
  DailyStreakConfig,
  EngagementActionType,
  EngagementTierLevel,
  SocialSharePlatformId,
  StreakMilestoneBonus,
  StreakTierRate,
} from '../types';
import { DEFAULT_DAILY_STREAK_CONFIG, DEFAULT_ENGAGEMENT_REWARD_CONFIG } from '../data/mockData';
import { SOCIAL_SHARE_PLATFORMS } from '../lib/socialShare';
import {
  Newspaper,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Share2,
  Heart,
  Search,
  CheckCircle2,
  Coins,
  Award,
  Sliders,
  BarChart3,
  Send,
  RotateCcw,
  Ban,
  Upload,
  Globe,
  Sparkles,
  MessageSquare,
  Save,
  X,
  Star,
  Flame,
} from 'lucide-react';

const COVER_PRESETS: { label: string; url: string }[] = [
  { label: 'HV Battery Lab', url: '/cert-hv-safety.jpg' },
  { label: 'Wrap Cleanroom', url: '/cert-wrap-cleanroom.jpg' },
  { label: 'Robotaxi Fleet', url: '/promo-robotaxi.jpg' },
  { label: 'Supercharger V4', url: '/img-supercharger-node.jpg' },
  { label: 'Cyberbeast Delivery', url: '/promo-cyberbeast.jpg' },
  { label: 'Model S Plaid Track', url: '/promo-plaid.jpg' },
  { label: 'Cybertruck AWD', url: '/img-cybertruck-awd.jpg' },
  { label: 'Model 3 Performance', url: '/img-model3-pearl.jpg' },
];

const BLOG_CATEGORY_OPTIONS: BlogCategory[] = [
  'EV Engineering & Diagnostics',
  'Wraps & Protection',
  'Fleet & Staking Yield',
  'TSLA Markets & Crypto',
  'Vehicle Deliveries',
];

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72);

const computeSeoScore = (draft: {
  title: string;
  seoTitle: string;
  metaDescription: string;
  focusKeywordsText: string;
  content: string;
  coverImageUrl: string;
}) => {
  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  const titleLen = (draft.seoTitle || draft.title).trim().length;
  const titleOk = titleLen >= 30 && titleLen <= 70;
  if (titleOk) score += 25;
  checks.push({ label: `SEO Title length (${titleLen}/70 chars)`, ok: titleOk });

  const metaLen = draft.metaDescription.trim().length;
  const metaOk = metaLen >= 100 && metaLen <= 165;
  if (metaOk) score += 25;
  checks.push({ label: `Meta Description (${metaLen}/165 chars)`, ok: metaOk });

  const kws = draft.focusKeywordsText
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const combinedText = `${draft.seoTitle} ${draft.title} ${draft.content}`.toLowerCase();
  const kwMatched = kws.length > 0 && kws.some((k) => combinedText.includes(k));
  if (kwMatched) score += 20;
  checks.push({ label: `Focus keywords active (${kws.length})`, ok: kwMatched });

  const wordCount = draft.content.trim().split(/\s+/).filter(Boolean).length;
  const lengthOk = wordCount >= 120;
  if (lengthOk) score += 20;
  checks.push({ label: `Editorial depth (${wordCount} words)`, ok: lengthOk });

  const imageOk = Boolean(draft.coverImageUrl.trim());
  if (imageOk) score += 10;
  checks.push({ label: 'Featured OG cover image set', ok: imageOk });

  return { score, checks, wordCount };
};

interface AdminBlogRewardsManagerProps {
  initialSubTab?: 'posts' | 'rewards' | 'analytics';
  sectionMode?: 'blog' | 'engagement_rewards';
}

export const AdminBlogRewardsManager: React.FC<AdminBlogRewardsManagerProps> = ({
  initialSubTab = 'posts',
  sectionMode = 'blog',
}) => {
  const {
    blogPosts,
    blogComments,
    engagementRewardConfig,
    engagementRewardLogs,
    engagementActivities,
    featureToggles,
    updateFeatureToggles,
    allUsers,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    toggleBlogPostStatus,
    deleteBlogComment,
    updateEngagementRewardConfig,
    grantManualEngagementReward,
    revokeEngagementReward,
    resetDailyEngagementUsage,
    setActiveBlogPostSlug,
    dailyStreakConfig,
    allUserStreakStates,
    updateDailyStreakConfig,
    adminUpdateUserStreak,
    showToast,
  } = useApp();

  const [subTab, setSubTab] = useState<'posts' | 'rewards' | 'analytics'>(initialSubTab);
  const [postSearch, setPostSearch] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | BlogPostStatus>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [draft, setDraft] = useState<{
    title: string;
    subtitle: string;
    slug: string;
    category: BlogCategory;
    status: BlogPostStatus;
    featured: boolean;
    authorName: string;
    authorRole: string;
    coverImageUrl: string;
    readTimeMinutes: number;
    publishedAt: string;
    excerpt: string;
    content: string;
    seoTitle: string;
    metaDescription: string;
    focusKeywordsText: string;
    schemaType: 'BlogPosting' | 'NewsArticle' | 'TechArticle';
    customReadCents: string;
    customShareCents: string;
  }>({
    title: '',
    subtitle: '',
    slug: '',
    category: 'EV Engineering & Diagnostics',
    status: 'published',
    featured: false,
    authorName: 'Apex Editorial Desk',
    authorRole: 'Lead EV Engineering Analyst',
    coverImageUrl: '/cert-hv-safety.jpg',
    readTimeMinutes: 5,
    publishedAt: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
    seoTitle: '',
    metaDescription: '',
    focusKeywordsText: 'Tesla diagnostics, Apex Tesla Hub',
    schemaType: 'BlogPosting',
    customReadCents: '',
    customShareCents: '',
  });

  // Rewards Engine Local Form State synced cleanly on explicit save
  const [rewardDraft, setRewardDraft] = useState(() => ({
    ...DEFAULT_ENGAGEMENT_REWARD_CONFIG,
    ...engagementRewardConfig,
    tierLevels:
      Array.isArray(engagementRewardConfig.tierLevels) && engagementRewardConfig.tierLevels.length > 0
        ? engagementRewardConfig.tierLevels
        : DEFAULT_ENGAGEMENT_REWARD_CONFIG.tierLevels || [],
  }));

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    setRewardDraft({
      ...DEFAULT_ENGAGEMENT_REWARD_CONFIG,
      ...engagementRewardConfig,
      tierLevels:
        Array.isArray(engagementRewardConfig.tierLevels) && engagementRewardConfig.tierLevels.length > 0
          ? engagementRewardConfig.tierLevels
          : DEFAULT_ENGAGEMENT_REWARD_CONFIG.tierLevels || [],
    });
  }, [engagementRewardConfig]);

  const [streakDraft, setStreakDraft] = useState<DailyStreakConfig>(() => ({
    ...DEFAULT_DAILY_STREAK_CONFIG,
    ...dailyStreakConfig,
    dailyRates: dailyStreakConfig.dailyRates?.length
      ? dailyStreakConfig.dailyRates
      : DEFAULT_DAILY_STREAK_CONFIG.dailyRates,
    milestoneBonuses: dailyStreakConfig.milestoneBonuses?.length
      ? dailyStreakConfig.milestoneBonuses
      : DEFAULT_DAILY_STREAK_CONFIG.milestoneBonuses,
  }));

  useEffect(() => {
    setStreakDraft({
      ...DEFAULT_DAILY_STREAK_CONFIG,
      ...dailyStreakConfig,
      dailyRates: dailyStreakConfig.dailyRates?.length
        ? dailyStreakConfig.dailyRates
        : DEFAULT_DAILY_STREAK_CONFIG.dailyRates,
      milestoneBonuses: dailyStreakConfig.milestoneBonuses?.length
        ? dailyStreakConfig.milestoneBonuses
        : DEFAULT_DAILY_STREAK_CONFIG.milestoneBonuses,
    });
  }, [dailyStreakConfig]);

  const [streakUserEdits, setStreakUserEdits] = useState<Record<string, { currentStreak: number; totalStreakPoints: number }>>({});

  const [grantUserId, setGrantUserId] = useState<string>(allUsers[0]?.id || 'usr-apex-001');
  const [grantCents, setGrantCents] = useState<number>(150);
  const [grantReason, setGrantReason] = useState<string>('Community Advocacy & Top Social Share Bonus');
  const [ledgerActionFilter, setLedgerActionFilter] = useState<'all' | EngagementActionType>('all');
  const [commentSearch, setCommentSearch] = useState('');

  const seoAudit = useMemo(
    () =>
      computeSeoScore({
        title: draft.title,
        seoTitle: draft.seoTitle,
        metaDescription: draft.metaDescription,
        focusKeywordsText: draft.focusKeywordsText,
        content: draft.content,
        coverImageUrl: draft.coverImageUrl,
      }),
    [draft]
  );

  const openCreateComposer = () => {
    setEditingPostId(null);
    setDraft({
      title: '',
      subtitle: '',
      slug: '',
      category: 'EV Engineering & Diagnostics',
      status: 'published',
      featured: false,
      authorName: 'Apex Editorial Desk',
      authorRole: 'Lead EV Engineering Analyst',
      coverImageUrl: '/cert-hv-safety.jpg',
      readTimeMinutes: 5,
      publishedAt: new Date().toISOString().split('T')[0],
      excerpt: '',
      content:
        '## Executive Technical Overview\n\nEnter high-precision technical details, fleet metrics, and customer ownership insights here.\n\n## Key Ownership Takeaways\n\n- Verified cleanroom & high-voltage diagnostic precision\n- Transparent USDT, BTC, XRP, and BNB vault settlement',
      seoTitle: '',
      metaDescription: '',
      focusKeywordsText: 'Tesla engineering, EV diagnostics, Apex Tesla Hub',
      schemaType: 'BlogPosting',
      customReadCents: '',
      customShareCents: '',
    });
    setIsComposerOpen(true);
  };

  const openEditComposer = (post: BlogPost) => {
    setEditingPostId(post.id);
    setDraft({
      title: post.title,
      subtitle: post.subtitle || '',
      slug: post.slug,
      category: post.category,
      status: post.status,
      featured: Boolean(post.featured),
      authorName: post.authorName,
      authorRole: post.authorRole,
      coverImageUrl: post.coverImageUrl,
      readTimeMinutes: post.readTimeMinutes,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      content: post.content,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      focusKeywordsText: post.focusKeywords || '',
      schemaType: post.schemaType || 'BlogPosting',
      customReadCents: post.customReadCents !== undefined ? String(post.customReadCents) : '',
      customShareCents: post.customShareCents !== undefined ? String(post.customShareCents) : '',
    });
    setIsComposerOpen(true);
  };

  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, dataUrl }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.url) {
              setDraft((prev) => ({ ...prev, coverImageUrl: data.url }));
              showToast('Cover image uploaded and attached.', 'success');
              return;
            }
          }
        } catch {
          // fallback to dataUrl
        }
        setDraft((prev) => ({ ...prev, coverImageUrl: dataUrl }));
        showToast('Cover image attached.', 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      showToast('Article title and body content are required.', 'error');
      return;
    }

    const cleanSlug = (draft.slug.trim() || slugify(draft.title)) || `article-${Date.now().toString(36)}`;
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || draft.excerpt.trim() || draft.title.trim(),
      slug: cleanSlug,
      category: draft.category,
      status: draft.status,
      featured: draft.featured,
      authorName: draft.authorName.trim() || 'Apex Editorial Desk',
      authorRole: draft.authorRole.trim() || 'EV Analyst',
      coverImageUrl: draft.coverImageUrl.trim() || '/cert-hv-safety.jpg',
      readTimeMinutes: Math.max(1, Number(draft.readTimeMinutes) || 4),
      publishedAt: draft.publishedAt || new Date().toISOString().split('T')[0],
      excerpt:
        draft.excerpt.trim() ||
        draft.content.replace(/[#*-]/g, '').trim().slice(0, 155),
      content: draft.content.trim(),
      seoTitle: draft.seoTitle.trim() || `${draft.title.trim()} | Apex Tesla Hub`,
      metaDescription:
        draft.metaDescription.trim() ||
        draft.excerpt.trim() ||
        draft.content.replace(/[#*-]/g, '').trim().slice(0, 155),
      focusKeywords: draft.focusKeywordsText.trim() || 'Tesla, Apex Tesla Hub',
      schemaType: draft.schemaType,
      customReadCents: draft.customReadCents.trim() ? Math.max(0, Number(draft.customReadCents)) : undefined,
      customShareCents: draft.customShareCents.trim() ? Math.max(0, Number(draft.customShareCents)) : undefined,
    };

    if (editingPostId) {
      updateBlogPost(editingPostId, payload);
    } else {
      createBlogPost(payload);
    }
    setIsComposerOpen(false);
  };

  const filteredAdminPosts = useMemo(() => {
    const q = postSearch.trim().toLowerCase();
    return blogPosts.filter((p) => {
      if (postStatusFilter !== 'all' && p.status !== postStatusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [blogPosts, postSearch, postStatusFilter]);

  const analyticsStats = useMemo(() => {
    const credited = engagementRewardLogs.filter((ev) => ev.status === 'credited');
    const totalUsd = credited.reduce((s, e) => s + e.awardedUsd, 0);
    const totalCents = credited.reduce((s, e) => s + e.awardedCents, 0);
    const totalViews = blogPosts.reduce((s, p) => s + (p.viewsCount || 0), 0);
    const totalShares = blogPosts.reduce((s, p) => s + (p.sharesCount || 0), 0);

    const byAction: Record<EngagementActionType, number> = {
      read_article: 0,
      share_article: 0,
      engagement_action: 0,
      time_on_platform: 0,
      daily_streak: 0,
      admin_bonus: 0,
    };
    const byPlatform: Record<string, number> = {};

    credited.forEach((ev) => {
      byAction[ev.actionType] = (byAction[ev.actionType] || 0) + ev.awardedCents;
      if (ev.platform) {
        byPlatform[ev.platform] = (byPlatform[ev.platform] || 0) + 1;
      }
    });

    return {
      totalUsd,
      totalCents,
      creditedCount: credited.length,
      totalViews,
      totalShares,
      byAction,
      byPlatform: Object.entries(byPlatform).sort((a, b) => b[1] - a[1]),
    };
  }, [engagementRewardLogs, blogPosts]);

  const toggleSharePlatformInDraft = (platformId: SocialSharePlatformId) => {
    setRewardDraft((prev) => {
      const exists = prev.enabledSharePlatforms.includes(platformId);
      if (exists && prev.enabledSharePlatforms.length === 1) {
        showToast('At least one share channel must remain enabled.', 'info');
        return prev;
      }
      return {
        ...prev,
        enabledSharePlatforms: exists
          ? prev.enabledSharePlatforms.filter((id) => id !== platformId)
          : [...prev.enabledSharePlatforms, platformId],
      };
    });
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header & Subtabs */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-wider">
              {sectionMode === 'engagement_rewards' ? <Coins className="w-4 h-4" /> : <Newspaper className="w-4 h-4" />}
              <span>
                {sectionMode === 'engagement_rewards'
                  ? 'Engagement Rewards, Tier Thresholds & Referral Engine'
                  : 'Blog, SEO Studio & Engagement Rewards Management'}
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl text-white tracking-tight">
              {sectionMode === 'engagement_rewards'
                ? 'Cent-Reward Rates, Tier Thresholds & $25–$200 Referral Rules'
                : 'Editorial CMS, Social Share Multiplier & Fractional Cents Engine'}
            </h2>
            <p className="text-xs text-zinc-400">
              {sectionMode === 'engagement_rewards'
                ? 'Set cent rates for page dwell time, article reads & social sharing, define tier level thresholds, configure $25–$200 referral bonuses, and inspect Firestore activity logs.'
                : 'Toggle blog visibility on the public site, publish SEO-optimized articles, regulate tier-multiplied USD cent payouts, and audit all rewards.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => updateFeatureToggles({ enableBlogPage: featureToggles.enableBlogPage === false })}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition ${
                featureToggles.enableBlogPage !== false
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Blog Page: {featureToggles.enableBlogPage !== false ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}</span>
            </button>
            <button
              type="button"
              onClick={openCreateComposer}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Article</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-4">
          {[
            { id: 'posts', label: `Articles & SEO CMS (${blogPosts.length})`, icon: Newspaper },
            { id: 'rewards', label: 'Cents Rates & Tier Multipliers', icon: Coins },
            { id: 'analytics', label: `Analytics, Grants & Ledger (${engagementRewardLogs.length})`, icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as typeof subTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                  subTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: ARTICLES & SEO CMS */}
      {subTab === 'posts' && (
        <div className="space-y-6">
          {/* Article Composer Drawer / Form */}
          {isComposerOpen && (
            <form
              onSubmit={handleSavePost}
              className="rounded-3xl bg-zinc-950 border border-red-500/40 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    {editingPostId ? 'Edit Article & SEO Settings' : 'Compose New SEO Article'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Automatically feeds sitemap (/sitemap.xml), RSS syndication (/rss.xml), and per-post Schema.org markup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Article Headline *</label>
                      <input
                        type="text"
                        required
                        value={draft.title}
                        onChange={(e) => {
                          const nextTitle = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            title: nextTitle,
                            slug: editingPostId ? prev.slug : slugify(nextTitle),
                            seoTitle: prev.seoTitle || `${nextTitle} | Apex Tesla Hub`,
                          }));
                        }}
                        placeholder="e.g. How 800V Cybertruck Architecture Optimizes Fleet Supercharging"
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={draft.slug}
                        onChange={(e) => setDraft((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                        placeholder="cybertruck-800v-supercharging-analysis"
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-cyan-300 font-mono outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Category</label>
                      <select
                        value={draft.category}
                        onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value as BlogCategory }))}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
                      >
                        {BLOG_CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Status</label>
                      <select
                        value={draft.status}
                        onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as BlogPostStatus }))}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Read Time (min)</label>
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={draft.readTimeMinutes}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, readTimeMinutes: Math.max(1, Number(e.target.value) || 3) }))
                        }
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Publish Date</label>
                      <input
                        type="date"
                        value={draft.publishedAt}
                        onChange={(e) => setDraft((prev) => ({ ...prev, publishedAt: e.target.value }))}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Author Name</label>
                      <input
                        type="text"
                        value={draft.authorName}
                        onChange={(e) => setDraft((prev) => ({ ...prev, authorName: e.target.value }))}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Author Title / Credential</label>
                      <input
                        type="text"
                        value={draft.authorRole}
                        onChange={(e) => setDraft((prev) => ({ ...prev, authorRole: e.target.value }))}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.featured}
                          onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
                          className="accent-red-600"
                        />
                        <span className="font-semibold text-amber-300">Feature as Top Spotlight</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Summary Excerpt</label>
                    <textarea
                      rows={2}
                      value={draft.excerpt}
                      onChange={(e) => setDraft((prev) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Concise hook displayed on editorial feed cards..."
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-zinc-400">Article Body Content (Markdown `## ` headings & `- ` bullets) *</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              content: `${prev.content}\n\n## New Technical Section\n\nDetailed breakdown here.`,
                            }))
                          }
                          className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                        >
                          + ## Section
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              content: `${prev.content}\n\n- Key metric or performance highlight\n- Secondary verification insight`,
                            }))
                          }
                          className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                        >
                          + Bullet List
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={9}
                      required
                      value={draft.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        const words = val.trim().split(/\s+/).filter(Boolean).length;
                        setDraft((prev) => ({
                          ...prev,
                          content: val,
                          readTimeMinutes: Math.max(2, Math.ceil(words / 180)),
                        }));
                      }}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3.5 text-white font-mono text-xs leading-relaxed outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Cover Image + Upload + Presets */}
                  <div className="space-y-2">
                    <label className="text-zinc-400 block">Cover Image URL or Upload</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={draft.coverImageUrl}
                        onChange={(e) => setDraft((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                        className="flex-1 min-w-[200px] rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-cyan-300 font-mono"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isUploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleUploadCoverFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, coverImageUrl: preset.url }))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer ${
                            draft.coverImageUrl === preset.url
                              ? 'border-red-500 bg-red-500/15 text-red-300 font-semibold'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Subtitle / Editorial Subhead</label>
                      <input
                        type="text"
                        value={draft.subtitle}
                        onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Supporting deck headline..."
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Custom Read Base Cents (¢, optional)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={draft.customReadCents}
                        onChange={(e) => setDraft((prev) => ({ ...prev, customReadCents: e.target.value }))}
                        placeholder={`Default: ${engagementRewardConfig.readArticleBaseCents}¢`}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-emerald-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Custom Share Base Cents (¢, optional)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={draft.customShareCents}
                        onChange={(e) => setDraft((prev) => ({ ...prev, customShareCents: e.target.value }))}
                        placeholder={`Default: ${engagementRewardConfig.shareArticleBaseCents}¢`}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-sky-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Dedicated SEO Studio & Live SERP Snippet Preview */}
                <div className="lg:col-span-4 space-y-4 text-xs">
                  <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <span>SEO & Schema Inspector</span>
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                          seoAudit.score >= 80
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : seoAudit.score >= 50
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        SEO {seoAudit.score}/100
                      </span>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">SEO Meta Title</label>
                      <input
                        type="text"
                        value={draft.seoTitle}
                        onChange={(e) => setDraft((prev) => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Target 50–65 characters..."
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Meta Description</label>
                      <textarea
                        rows={3}
                        value={draft.metaDescription}
                        onChange={(e) => setDraft((prev) => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Compelling 120–160 char summary for search snippets..."
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Focus Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={draft.focusKeywordsText}
                        onChange={(e) => setDraft((prev) => ({ ...prev, focusKeywordsText: e.target.value }))}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Schema.org Type</label>
                      <select
                        value={draft.schemaType}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            schemaType: e.target.value as 'BlogPosting' | 'NewsArticle' | 'TechArticle',
                          }))
                        }
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white"
                      >
                        <option value="BlogPosting">BlogPosting</option>
                        <option value="NewsArticle">NewsArticle</option>
                        <option value="TechArticle">TechArticle</option>
                      </select>
                    </div>

                    {/* Google SERP Snippet Preview */}
                    <div className="rounded-xl bg-white p-3.5 text-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-700 block truncate">
                        https://apex-tesla-hub.io/?tab=blog&post={draft.slug || 'article-slug'}
                      </span>
                      <p className="text-sm font-semibold text-blue-700 leading-snug line-clamp-2">
                        {draft.seoTitle || draft.title || 'Your SEO Headline Preview'}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {draft.metaDescription || draft.excerpt || 'Your meta description will render here in search results.'}
                      </p>
                    </div>

                    {/* Audit Checklist */}
                    <div className="space-y-1.5 pt-1">
                      {seoAudit.checks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${c.ok ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span className={c.ok ? 'text-zinc-200' : 'text-zinc-500'}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPostId ? 'Update Published Article' : 'Publish & Index Article'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Filter & Articles Table */}
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Filter articles by headline, slug, or category..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'published', 'draft', 'scheduled'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPostStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                      postStatusFilter === st
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {filteredAdminPosts.map((post) => {
                const postScore = computeSeoScore({
                  title: post.title,
                  seoTitle: post.seoTitle,
                  metaDescription: post.metaDescription,
                  focusKeywordsText: post.focusKeywords || '',
                  content: post.content,
                  coverImageUrl: post.coverImageUrl,
                }).score;

                return (
                  <div
                    key={post.id}
                    className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/img-cybertruck-awd.jpg';
                        }}
                        className="w-20 h-14 rounded-xl object-cover shrink-0 bg-zinc-900 border border-zinc-800"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          <span className="text-red-400 font-bold uppercase">{post.category}</span>
                          <span className="text-zinc-500">·</span>
                          <span
                            className={`uppercase font-bold ${
                              post.status === 'published'
                                ? 'text-emerald-400'
                                : post.status === 'scheduled'
                                ? 'text-sky-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {post.status}
                          </span>
                          {post.featured && (
                            <>
                              <span className="text-zinc-500">·</span>
                              <span className="text-amber-300 inline-flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-300" /> Featured
                              </span>
                            </>
                          )}
                          <span className="text-zinc-500">·</span>
                          <span className="text-sky-400">SEO {postScore}/100</span>
                        </div>
                        <h4 className="font-heading font-bold text-sm text-white truncate max-w-2xl">
                          {post.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400 tabular-nums">
                          <span>/{post.slug}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {post.viewsCount.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Share2 className="w-3 h-3 text-sky-400" /> {post.sharesCount.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-400" /> {post.likesCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveBlogPostSlug(post.slug);
                          window.dispatchEvent(new CustomEvent('apex:navigate', { detail: 'blog' }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer"
                      >
                        Live View
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleBlogPostStatus(post.id, post.status === 'published' ? 'draft' : 'published')
                        }
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-amber-300 cursor-pointer"
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditComposer(post)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-xs font-semibold text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlogPost(post.id)}
                        className="p-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 text-red-400 cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CENTS RATES & TIER MULTIPLIERS ENGINE */}
      {subTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Fractional Dollar ($ Cents) Payout Configuration</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  100¢ = $1.00 USD. All base rates are dynamically multiplied by each user&apos;s membership tier.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={rewardDraft.enabled}
                  onChange={(e) => setRewardDraft((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span className={rewardDraft.enabled ? 'text-emerald-400' : 'text-zinc-500'}>
                  {rewardDraft.enabled ? 'Engine Active' : 'Paused'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Read Article Base Cents (¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.readArticleBaseCents}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({ ...prev, readArticleBaseCents: Math.max(0, Number(e.target.value)) }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Read Minimum Dwell Seconds</label>
                <input
                  type="number"
                  min="5"
                  value={rewardDraft.readMinDwellSeconds}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({ ...prev, readMinDwellSeconds: Math.max(5, Number(e.target.value)) }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Social Share Base Cents (¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.shareArticleBaseCents}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({ ...prev, shareArticleBaseCents: Math.max(0, Number(e.target.value)) }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Progressive Extra Cents / Platform (+¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.shareProgressiveStepCents}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      shareProgressiveStepCents: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-sky-300 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Like / Bookmark / Comment Cents (¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.engagementActionBaseCents}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      engagementActionBaseCents: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Max Rewarded Shares / Post / Day</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={rewardDraft.maxRewardedSharesPerPostPerDay}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      maxRewardedSharesPerPostPerDay: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Active Platform Time Interval (seconds)</label>
                <input
                  type="number"
                  min="15"
                  value={rewardDraft.timeOnPlatformIntervalSeconds}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      timeOnPlatformIntervalSeconds: Math.max(15, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-violet-400 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Cents Awarded Per Active Interval (¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.timeOnPlatformCentsPerInterval}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      timeOnPlatformCentsPerInterval: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-violet-300 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Daily Maximum USD Earnings Cap per User ($ USD)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={rewardDraft.dailyCapUsd}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({ ...prev, dailyCapUsd: Math.max(0.5, Number(e.target.value)) }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Social Channel Share Click Bonus (¢)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={rewardDraft.socialSharePlatformCents ?? 4}
                  onChange={(e) =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      socialSharePlatformCents: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Configurable Tier Level Thresholds & Referral Rewards ($25 - $200) */}
            <div className="border-t border-zinc-800 pt-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Tier Level Thresholds, Multipliers &amp; Referral Rewards ($25–$200)</span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-400">
                  Referral Payout Clamped: $25 Min – $200 Max
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {(rewardDraft.tierLevels || []).map((lvl: EngagementTierLevel, idx: number) => (
                  <div
                    key={lvl.id}
                    className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Tier Label</label>
                      <input
                        type="text"
                        value={lvl.name}
                        onChange={(e) => {
                          const next = [...(rewardDraft.tierLevels || [])];
                          next[idx] = { ...lvl, name: e.target.value };
                          setRewardDraft((prev) => ({ ...prev, tierLevels: next }));
                        }}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Min Points</label>
                      <input
                        type="number"
                        min="0"
                        value={lvl.minPoints}
                        onChange={(e) => {
                          const next = [...(rewardDraft.tierLevels || [])];
                          next[idx] = { ...lvl, minPoints: Math.max(0, Number(e.target.value) || 0) };
                          setRewardDraft((prev) => ({ ...prev, tierLevels: next }));
                        }}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-cyan-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Min Deposit ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={lvl.minDepositUsd}
                        onChange={(e) => {
                          const next = [...(rewardDraft.tierLevels || [])];
                          next[idx] = { ...lvl, minDepositUsd: Math.max(0, Number(e.target.value) || 0) };
                          setRewardDraft((prev) => ({ ...prev, tierLevels: next }));
                        }}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-zinc-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Cents Mult (×)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        value={lvl.multiplier}
                        onChange={(e) => {
                          const nextVal = Math.max(0.5, Number(e.target.value) || 1);
                          const next = [...(rewardDraft.tierLevels || [])];
                          next[idx] = { ...lvl, multiplier: nextVal };
                          setRewardDraft((prev) => ({
                            ...prev,
                            tierLevels: next,
                            tierMultipliers: {
                              ...prev.tierMultipliers,
                              [lvl.mappedUserTier]: nextVal,
                            },
                          }));
                        }}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-emerald-400 block mb-1">Referral ($25–$200)</label>
                      <input
                        type="number"
                        min="25"
                        max="200"
                        step="5"
                        value={lvl.referralRewardUsd}
                        onChange={(e) => {
                          const nextVal = Math.min(200, Math.max(25, Number(e.target.value) || 25));
                          const next = [...(rewardDraft.tierLevels || [])];
                          next[idx] = { ...lvl, referralRewardUsd: nextVal };
                          setRewardDraft((prev) => ({ ...prev, tierLevels: next }));
                        }}
                        className="w-full rounded-lg bg-zinc-950 border border-emerald-500/40 px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetDailyEngagementUsage}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Clear Daily Cooldowns (QA Test)</span>
              </button>

              <button
                type="button"
                onClick={() => updateEngagementRewardConfig(rewardDraft)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Rewards &amp; Tier Rules</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Tier Payout Matrix + Share Platforms Switchboard */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
              <h3 className="font-heading font-bold text-base text-white">
                Live Tier Payout Matrix Preview
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2 pr-2">Action / Benefit</th>
                      <th className="py-2 px-1.5">Std</th>
                      <th className="py-2 px-1.5 text-emerald-400">Silver</th>
                      <th className="py-2 px-1.5 text-sky-400">Plaid</th>
                      <th className="py-2 pl-1.5 text-amber-400">Founders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 tabular-nums">
                    {(() => {
                      const levels = rewardDraft.tierLevels || [];
                      const mStd = levels[0]?.multiplier ?? (rewardDraft.tierMultipliers.Standard || 1);
                      const mSil = levels[1]?.multiplier ?? (rewardDraft.tierMultipliers['Silver Ambassador'] || 1.25);
                      const mPla = levels[2]?.multiplier ?? (rewardDraft.tierMultipliers['Plaid Member'] || 1.5);
                      const mFnd = levels[3]?.multiplier ?? (rewardDraft.tierMultipliers['Founders Club'] || 2.25);
                      return (
                        <>
                          {[
                            { label: 'Article Read', base: rewardDraft.readArticleBaseCents },
                            { label: 'Blog Share #1', base: rewardDraft.shareArticleBaseCents },
                            { label: 'Social Share Click', base: rewardDraft.socialSharePlatformCents ?? 4 },
                            { label: 'Like / Comment', base: rewardDraft.engagementActionBaseCents },
                            { label: 'Page Dwell Cycle', base: rewardDraft.timeOnPlatformCentsPerInterval },
                          ].map((row) => (
                            <tr key={row.label}>
                              <td className="py-2 pr-2 text-zinc-300 font-sans">{row.label}</td>
                              <td className="py-2 px-1.5">{(row.base * mStd).toFixed(1)}¢</td>
                              <td className="py-2 px-1.5 text-emerald-300">{(row.base * mSil).toFixed(1)}¢</td>
                              <td className="py-2 px-1.5 text-sky-300">{(row.base * mPla).toFixed(1)}¢</td>
                              <td className="py-2 pl-1.5 text-amber-300 font-bold">{(row.base * mFnd).toFixed(1)}¢</td>
                            </tr>
                          ))}
                          <tr className="bg-emerald-950/20">
                            <td className="py-2 pr-2 text-emerald-300 font-sans font-bold">Referral Bonus</td>
                            <td className="py-2 px-1.5 font-bold">${levels[0]?.referralRewardUsd ?? 25}</td>
                            <td className="py-2 px-1.5 text-emerald-300 font-bold">${levels[1]?.referralRewardUsd ?? 75}</td>
                            <td className="py-2 px-1.5 text-sky-300 font-bold">${levels[2]?.referralRewardUsd ?? 125}</td>
                            <td className="py-2 pl-1.5 text-amber-300 font-bold">${levels[3]?.referralRewardUsd ?? 200}</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-white">
                  Enabled Social Share Platforms ({rewardDraft.enabledSharePlatforms.length}/14)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setRewardDraft((prev) => ({
                      ...prev,
                      enabledSharePlatforms: SOCIAL_SHARE_PLATFORMS.map((p) => p.id),
                    }))
                  }
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Enable All 14
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL_SHARE_PLATFORMS.map((platform) => {
                  const active = rewardDraft.enabledSharePlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => toggleSharePlatformInDraft(platform.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="truncate">{platform.shortLabel}</span>
                      <span className="font-mono text-[10px]">{active ? 'ON' : 'OFF'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full-Width Daily Visit Streak Tracker Config & Member Overrides */}
          <div className="lg:col-span-12 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Daily Visit Streak Tracker — Bonus Rates, Milestones &amp; Member Overrides</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure consecutive UTC daily visit points, fractional cent payouts, milestone free-spin chests, and per-member streak overrides.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setStreakDraft((prev) => ({
                      ...prev,
                      enabled: !prev.enabled,
                    }))
                  }
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    streakDraft.enabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}
                >
                  Streak Tracker: {streakDraft.enabled ? 'ACTIVE' : 'PAUSED'}
                </button>
                <button
                  type="button"
                  onClick={() => updateDailyStreakConfig(streakDraft)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Daily Streak Config</span>
                </button>
              </div>
            </div>

            {/* Global Streak Policy Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Grace Window (Hours)</label>
                <input
                  type="number"
                  min={24}
                  max={72}
                  value={streakDraft.graceWindowHours}
                  onChange={(e) =>
                    setStreakDraft((prev) => ({
                      ...prev,
                      graceWindowHours: Math.max(24, Number(e.target.value) || 36),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Reset Threshold (Hours)</label>
                <input
                  type="number"
                  min={24}
                  max={120}
                  value={streakDraft.resetAfterHours}
                  onChange={(e) =>
                    setStreakDraft((prev) => ({
                      ...prev,
                      resetAfterHours: Math.max(24, Number(e.target.value) || 48),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Max Streak Multiplier (×)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.1}
                  value={streakDraft.maxStreakMultiplier}
                  onChange={(e) =>
                    setStreakDraft((prev) => ({
                      ...prev,
                      maxStreakMultiplier: Math.max(1, Number(e.target.value) || 2.5),
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-amber-300 font-mono font-bold"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setStreakDraft((prev) => ({
                      ...prev,
                      autoResetMissedDays: !prev.autoResetMissedDays,
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    streakDraft.autoResetMissedDays
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Auto-Reset Missed Days: {streakDraft.autoResetMissedDays ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Daily Ladder & Milestone Chests CRUD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consecutive Day Rates CRUD */}
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-white">
                    Consecutive Day Bonus Rates ({streakDraft.dailyRates.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const nextDay =
                        streakDraft.dailyRates.reduce((m, r) => Math.max(m, r.day), 0) + 1;
                      setStreakDraft((prev) => ({
                        ...prev,
                        dailyRates: [
                          ...prev.dailyRates,
                          {
                            day: nextDay,
                            label: `Day ${nextDay}`,
                            bonusPoints: 100 + nextDay * 25,
                            bonusCents: 10 + nextDay * 2,
                          },
                        ],
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {streakDraft.dailyRates.map((rate, idx) => (
                    <div
                      key={`${rate.day}-${idx}`}
                      className="grid grid-cols-12 gap-2 items-center rounded-xl bg-zinc-950 border border-zinc-800 p-2 text-xs"
                    >
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-500 block">Day #</label>
                        <input
                          type="number"
                          min={1}
                          value={rate.day}
                          onChange={(e) => {
                            const next = [...streakDraft.dailyRates];
                            next[idx] = { ...rate, day: Math.max(1, Number(e.target.value) || 1) };
                            setStreakDraft((prev) => ({ ...prev, dailyRates: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-white font-mono"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-zinc-500 block">Label</label>
                        <input
                          type="text"
                          value={rate.label}
                          onChange={(e) => {
                            const next = [...streakDraft.dailyRates];
                            next[idx] = { ...rate, label: e.target.value };
                            setStreakDraft((prev) => ({ ...prev, dailyRates: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-amber-400 block">Pts</label>
                        <input
                          type="number"
                          min={0}
                          value={rate.bonusPoints}
                          onChange={(e) => {
                            const next = [...streakDraft.dailyRates];
                            next[idx] = { ...rate, bonusPoints: Math.max(0, Number(e.target.value) || 0) };
                            setStreakDraft((prev) => ({ ...prev, dailyRates: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-amber-300 font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-emerald-400 block">Cents (¢)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={rate.bonusCents}
                          onChange={(e) => {
                            const next = [...streakDraft.dailyRates];
                            next[idx] = { ...rate, bonusCents: Math.max(0, Number(e.target.value) || 0) };
                            setStreakDraft((prev) => ({ ...prev, dailyRates: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-emerald-400 font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (streakDraft.dailyRates.length <= 1) return;
                            setStreakDraft((prev) => ({
                              ...prev,
                              dailyRates: prev.dailyRates.filter((_, i) => i !== idx),
                            }));
                          }}
                          title="Delete day rate"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Bonus Chests CRUD */}
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-white">
                    Streak Milestone Chests ({streakDraft.milestoneBonuses.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const nextReq =
                        streakDraft.milestoneBonuses.reduce((m, r) => Math.max(m, r.daysRequired), 0) + 7;
                      setStreakDraft((prev) => ({
                        ...prev,
                        milestoneBonuses: [
                          ...prev.milestoneBonuses,
                          {
                            daysRequired: nextReq,
                            label: `${nextReq}-Day Milestone Chest`,
                            bonusPoints: 500,
                            bonusCents: 100,
                            bonusFreeSpins: 1,
                          },
                        ],
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {streakDraft.milestoneBonuses.map((ms, idx) => (
                    <div
                      key={`${ms.daysRequired}-${idx}`}
                      className="grid grid-cols-12 gap-2 items-center rounded-xl bg-zinc-950 border border-zinc-800 p-2 text-xs"
                    >
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-500 block">Days</label>
                        <input
                          type="number"
                          min={2}
                          value={ms.daysRequired}
                          onChange={(e) => {
                            const next = [...streakDraft.milestoneBonuses];
                            next[idx] = { ...ms, daysRequired: Math.max(2, Number(e.target.value) || 2) };
                            setStreakDraft((prev) => ({ ...prev, milestoneBonuses: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-white font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-zinc-500 block">Chest Title</label>
                        <input
                          type="text"
                          value={ms.label}
                          onChange={(e) => {
                            const next = [...streakDraft.milestoneBonuses];
                            next[idx] = { ...ms, label: e.target.value };
                            setStreakDraft((prev) => ({ ...prev, milestoneBonuses: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-amber-400 block">Pts</label>
                        <input
                          type="number"
                          min={0}
                          value={ms.bonusPoints}
                          onChange={(e) => {
                            const next = [...streakDraft.milestoneBonuses];
                            next[idx] = { ...ms, bonusPoints: Math.max(0, Number(e.target.value) || 0) };
                            setStreakDraft((prev) => ({ ...prev, milestoneBonuses: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-amber-300 font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-emerald-400 block">¢ Bonus</label>
                        <input
                          type="number"
                          min={0}
                          value={ms.bonusCents}
                          onChange={(e) => {
                            const next = [...streakDraft.milestoneBonuses];
                            next[idx] = { ...ms, bonusCents: Math.max(0, Number(e.target.value) || 0) };
                            setStreakDraft((prev) => ({ ...prev, milestoneBonuses: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-emerald-400 font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-sky-400 block">Free Spins</label>
                        <input
                          type="number"
                          min={0}
                          value={ms.bonusFreeSpins ?? 0}
                          onChange={(e) => {
                            const next = [...streakDraft.milestoneBonuses];
                            next[idx] = { ...ms, bonusFreeSpins: Math.max(0, Number(e.target.value) || 0) };
                            setStreakDraft((prev) => ({ ...prev, milestoneBonuses: next }));
                          }}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-sky-300 font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setStreakDraft((prev) => ({
                              ...prev,
                              milestoneBonuses: prev.milestoneBonuses.filter((_, i) => i !== idx),
                            }));
                          }}
                          title="Delete milestone"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Member Daily Streak Audit & Manual Override Table */}
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-3">
              <h4 className="font-heading font-bold text-sm text-white">
                Member Daily Streak States &amp; Overrides
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[11px]">
                      <th className="py-2 pr-3">Member</th>
                      <th className="py-2 px-3">Last Check-In (UTC)</th>
                      <th className="py-2 px-3">Current Streak (Days)</th>
                      <th className="py-2 px-3">Total Streak Pts</th>
                      <th className="py-2 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 tabular-nums">
                    {allUsers.map((member) => {
                      const st = allUserStreakStates[member.id];
                      const edit = streakUserEdits[member.id] ?? {
                        currentStreak: st?.currentStreak ?? 0,
                        totalStreakPoints: st?.totalStreakPoints ?? 0,
                      };
                      return (
                        <tr key={member.id}>
                          <td className="py-2.5 pr-3">
                            <span className="font-semibold text-white block">{member.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{member.email}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400">
                            {st?.lastCheckInDateUtc || 'Never'}
                            {st?.checkedInToday && (
                              <span className="ml-2 text-emerald-400">[Today]</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min={0}
                              value={edit.currentStreak}
                              onChange={(e) =>
                                setStreakUserEdits((prev) => ({
                                  ...prev,
                                  [member.id]: {
                                    ...edit,
                                    currentStreak: Math.max(0, Number(e.target.value) || 0),
                                  },
                                }))
                              }
                              className="w-24 rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-amber-300 font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min={0}
                              value={edit.totalStreakPoints}
                              onChange={(e) =>
                                setStreakUserEdits((prev) => ({
                                  ...prev,
                                  [member.id]: {
                                    ...edit,
                                    totalStreakPoints: Math.max(0, Number(e.target.value) || 0),
                                  },
                                }))
                              }
                              className="w-28 rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-emerald-400 font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 pl-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  adminUpdateUserStreak(member.id, {
                                    currentStreak: edit.currentStreak,
                                    totalStreakPoints: edit.totalStreakPoints,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStreakUserEdits((prev) => ({
                                    ...prev,
                                    [member.id]: { currentStreak: 0, totalStreakPoints: 0 },
                                  }));
                                  adminUpdateUserStreak(member.id, { reset: true });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 font-semibold cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ANALYTICS, USER BONUS GRANTS, LEDGER & COMMENTS */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Total Disbursed</span>
              <p className="font-heading font-black text-2xl text-emerald-400 tabular-nums">
                ${analyticsStats.totalUsd.toFixed(2)}
              </p>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                {analyticsStats.totalCents.toFixed(1)}¢ across {analyticsStats.creditedCount} events
              </span>
            </div>
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Total Read Views</span>
              <p className="font-heading font-black text-2xl text-white tabular-nums">
                {analyticsStats.totalViews.toLocaleString()}
              </p>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                Reads Paid: {analyticsStats.byAction.read_article.toFixed(1)}¢
              </span>
            </div>
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Total Social Shares</span>
              <p className="font-heading font-black text-2xl text-sky-400 tabular-nums">
                {analyticsStats.totalShares.toLocaleString()}
              </p>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                Shares Paid: {analyticsStats.byAction.share_article.toFixed(1)}¢
              </span>
            </div>
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Active Dwell, Streak &amp; Bonus</span>
              <p className="font-heading font-black text-2xl text-amber-400 tabular-nums">
                {(
                  analyticsStats.byAction.time_on_platform +
                  analyticsStats.byAction.daily_streak +
                  analyticsStats.byAction.admin_bonus
                ).toFixed(1)}
                ¢
              </p>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                Streak: {analyticsStats.byAction.daily_streak.toFixed(1)}¢ · Engage: {analyticsStats.byAction.engagement_action.toFixed(1)}¢
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Manual Admin User Bonus Grant */}
            <div className="lg:col-span-5 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Manual Cents / USD Bonus Grant</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Select Member Account</label>
                  <select
                    value={grantUserId}
                    onChange={(e) => setGrantUserId(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.tier || 'Standard'}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">
                    Grant Amount in Cents (¢) = ${(Number(grantCents || 0) / 100).toFixed(2)} USD
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={grantCents}
                    onChange={(e) => setGrantCents(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-emerald-400 font-mono font-bold"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {[25, 50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGrantCents(preset)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-emerald-300 cursor-pointer"
                      >
                        +{preset}¢ (${(preset / 100).toFixed(2)})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Credit Note / Reason</label>
                  <input
                    type="text"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => grantManualEngagementReward(grantUserId, grantCents, grantReason)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Credit +{grantCents}¢ (${(grantCents / 100).toFixed(2)}) Now</span>
                </button>
              </div>
            </div>

            {/* Platform Breakdown + Comment Moderation */}
            <div className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Blog Comment Moderation ({blogComments.length})</span>
                </h3>
                <input
                  type="text"
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  placeholder="Search comments..."
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/80">
                {blogComments
                  .filter(
                    (c) =>
                      !commentSearch.trim() ||
                      c.body.toLowerCase().includes(commentSearch.toLowerCase()) ||
                      c.userName.toLowerCase().includes(commentSearch.toLowerCase())
                  )
                  .map((cmt) => {
                    const postMatch = blogPosts.find((p) => p.id === cmt.postId);
                    return (
                      <div key={cmt.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{cmt.userName}</span>
                            <span className="font-mono text-emerald-400 text-[10px]">{cmt.userTier}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{cmt.createdAt}</span>
                          </div>
                          <p className="text-zinc-300">{cmt.body}</p>
                          {postMatch && (
                            <span className="text-[10px] font-mono text-zinc-500 block truncate">
                              On: {postMatch.title}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBlogComment(cmt.id)}
                          className="p-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/30 text-red-400 shrink-0 cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Engagement Rewards Audit Ledger */}
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Engagement Cents & Tier Payout Audit Ledger
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time log of all fractional USD cent disbursements, share combos & admin adjustments.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'read_article', label: 'Reads' },
                    { id: 'share_article', label: 'Social Shares' },
                    { id: 'engagement_action', label: 'Engagements' },
                    { id: 'time_on_platform', label: 'Active Time' },
                    { id: 'daily_streak', label: 'Daily Streaks' },
                    { id: 'admin_bonus', label: 'Admin Bonus' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLedgerActionFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      ledgerActionFilter === f.id
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[11px]">
                    <th className="py-2.5 pr-3">Member & Tier</th>
                    <th className="py-2.5 px-3">Action / Channel</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Cents / USD</th>
                    <th className="py-2.5 pl-3 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {engagementRewardLogs
                    .filter((ev) => ledgerActionFilter === 'all' || ev.actionType === ledgerActionFilter)
                    .map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-3 pr-3">
                          <span className="font-semibold text-white block">{ev.userName}</span>
                          <span className="font-mono text-[10px] text-amber-400">
                            {ev.userTier} ({ev.multiplier.toFixed(2)}×)
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <span className="text-sky-300 uppercase">{ev.actionType.replace('_', ' ')}</span>
                          {ev.platform && (
                            <span className="block text-zinc-400 uppercase">{ev.platform}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-300 max-w-md truncate">
                          {ev.description}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <span
                            className={`font-bold ${
                              ev.status === 'credited' ? 'text-emerald-400' : 'text-zinc-500 line-through'
                            }`}
                          >
                            +{ev.awardedCents.toFixed(1)}¢ (${ev.awardedUsd.toFixed(2)})
                          </span>
                          <span className="block text-[10px] text-zinc-500 uppercase">{ev.status}</span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => revokeEngagementReward(ev.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                              ev.status === 'credited'
                                ? 'bg-red-600/15 hover:bg-red-600/30 text-red-400'
                                : 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400'
                            }`}
                          >
                            <Ban className="w-3 h-3" />
                            <span>{ev.status === 'credited' ? 'Revoke' : 'Re-Credit'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tracked Page Dwell & Social Share Activity Stream (Firestore Synced) */}
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Tracked Page Dwell &amp; Social Share Stream ({engagementActivities.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Lightweight Firestore-synced engagement telemetry recording verified page dwell intervals and social share clicks.
                </p>
              </div>
            </div>

            {engagementActivities.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No page dwell or social share records logged yet in this session.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[11px]">
                      <th className="py-2 pr-3">Event Type</th>
                      <th className="py-2 px-3">Page / Platform</th>
                      <th className="py-2 px-3">Target / Note</th>
                      <th className="py-2 px-3 text-right">Dwell / Points</th>
                      <th className="py-2 pl-3 text-right">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {engagementActivities.slice(0, 40).map((act) => (
                      <tr key={act.id}>
                        <td className="py-2.5 pr-3 font-mono text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase ${
                              act.activityType === 'social_share'
                                ? 'bg-sky-500/15 text-sky-300'
                                : 'bg-violet-500/15 text-violet-300'
                            }`}
                          >
                            {act.activityType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-300">
                          /{act.pageTab}
                          {act.platform ? ` • ${act.platform.toUpperCase()}` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300 max-w-xs truncate">
                          {act.targetTitle || 'Verified Session Activity'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                          {act.dwellSeconds ? `${act.dwellSeconds}s • ` : ''}+{act.pointsEarned} pts
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono font-bold text-emerald-400">
                          +{act.centsEarned.toFixed(1)}¢
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
