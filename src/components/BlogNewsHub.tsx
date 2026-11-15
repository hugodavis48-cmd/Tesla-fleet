import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { BlogCategory, BlogPost, SocialSharePlatformId } from '../types';
import {
  SOCIAL_SHARE_PLATFORMS,
  buildArticleShareUrl,
  buildPlatformShareIntentHref,
} from '../lib/socialShare';
import {
  BookOpen,
  Clock,
  Share2,
  Heart,
  Bookmark,
  MessageSquare,
  Coins,
  ArrowLeft,
  ArrowRight,
  Search,
  Eye,
  CheckCircle2,
  Sparkles,
  Copy,
  ExternalLink,
  Award,
  TrendingUp,
  Timer,
  Send,
  ChevronDown,
  ChevronUp,
  Globe,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const BLOG_CATEGORIES: { id: 'all' | BlogCategory; label: string }[] = [
  { id: 'all', label: 'All Briefings' },
  { id: 'EV Engineering & Diagnostics', label: 'EV Engineering' },
  { id: 'Wraps & Protection', label: 'Wraps & PPF' },
  { id: 'Fleet & Staking Yield', label: 'Fleet Yield' },
  { id: 'TSLA Markets & Crypto', label: 'TSLA Markets & Crypto' },
  { id: 'Vehicle Deliveries', label: 'Vehicle Deliveries' },
];

const formatCentsLabel = (cents: number): string => {
  const clean = Number(cents.toFixed(1));
  return `${clean}¢ ($${(clean / 100).toFixed(2)})`;
};

const renderArticleBody = (content: string, isLight: boolean) => {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('## ')) {
      return (
        <h2
          key={idx}
          className={`font-heading font-bold text-xl sm:text-2xl tracking-tight pt-4 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h3
          key={idx}
          className={`font-heading font-bold text-lg tracking-tight pt-2 ${
            isLight ? 'text-slate-800' : 'text-zinc-100'
          }`}
        >
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    const lines = trimmed.split('\n');
    const isBulletList = lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    if (isBulletList) {
      return (
        <ul
          key={idx}
          className={`space-y-2 pl-5 list-disc text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-slate-700' : 'text-zinc-300'
          }`}
        >
          {lines.map((line, lIdx) => (
            <li key={lIdx}>{line.trim().replace(/^[-*]\s+/, '')}</li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={idx}
        className={`text-sm sm:text-base leading-relaxed ${
          isLight ? 'text-slate-700' : 'text-zinc-300'
        }`}
      >
        {trimmed}
      </p>
    );
  });
};

export const BlogNewsHub: React.FC = () => {
  const {
    currentUser,
    blogPosts,
    blogComments,
    engagementRewardConfig,
    activeBlogPostSlug,
    setActiveBlogPostSlug,
    activePlatformSeconds,
    userLikedPostIds,
    userBookmarkedPostIds,
    userSharedPostPlatforms,
    userReadPostDates,
    getUserTierMultiplier,
    todayEngagementEarningsUsd,
    totalUserEngagementUsd,
    recordBlogView,
    claimBlogReadReward,
    claimBlogShareReward,
    toggleBlogLike,
    toggleBlogBookmark,
    addBlogComment,
    seoSettings,
    showToast,
  } = useApp();

  const { isLight } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | BlogCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'most_shared' | 'most_viewed' | 'highest_reward'>('newest');
  const [readElapsedSec, setReadElapsedSec] = useState<number>(0);
  const [commentInput, setCommentInput] = useState('');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [showSeoDrawer, setShowSeoDrawer] = useState(false);

  const publishedPosts = useMemo(
    () => blogPosts.filter((p) => p.status === 'published'),
    [blogPosts]
  );

  const activePost: BlogPost | undefined = useMemo(() => {
    if (!activeBlogPostSlug) return undefined;
    return publishedPosts.find((p) => p.slug === activeBlogPostSlug) || blogPosts.find((p) => p.slug === activeBlogPostSlug);
  }, [activeBlogPostSlug, publishedPosts, blogPosts]);

  // Increment view once when opening an article
  useEffect(() => {
    if (!activePost) {
      setReadElapsedSec(0);
      return;
    }
    recordBlogView(activePost.id);
    setReadElapsedSec(0);
  }, [activePost?.id, recordBlogView]);

  const todayKey = new Date().toISOString().split('T')[0];
  const hasClaimedReadToday = Boolean(
    currentUser && activePost && userReadPostDates[`${currentUser.id}::${activePost.id}`] === todayKey
  );

  // Reading dwell timer inside open article
  useEffect(() => {
    if (!activePost || !currentUser || !engagementRewardConfig.enabled || hasClaimedReadToday) return;
    const minDwell = Math.max(5, engagementRewardConfig.readMinDwellSeconds || 20);
    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      setReadElapsedSec((prev) => {
        const next = prev + 1;
        if (next === minDwell) {
          claimBlogReadReward(activePost.id);
        }
        return Math.min(minDwell, next);
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activePost?.id, currentUser?.id, engagementRewardConfig.enabled, engagementRewardConfig.readMinDwellSeconds, hasClaimedReadToday]);

  const tierLabel = currentUser?.tier || 'Standard';
  const tierMultiplier = getUserTierMultiplier(tierLabel);

  const openArticle = (slug: string) => {
    setActiveBlogPostSlug(slug);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'blog');
      params.set('post', slug);
      window.history.pushState({ tab: 'blog', post: slug }, '', `/?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeArticle = () => {
    setActiveBlogPostSlug(null);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'blog');
      params.delete('post');
      window.history.pushState({ tab: 'blog' }, '', `/?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = publishedPosts.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.focusKeywords.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'most_shared') return (b.sharesCount || 0) - (a.sharesCount || 0);
      if (sortBy === 'most_viewed') return (b.viewsCount || 0) - (a.viewsCount || 0);
      if (sortBy === 'highest_reward') {
        const rewardA = (a.customReadCents ?? engagementRewardConfig.readArticleBaseCents) + (a.customShareCents ?? engagementRewardConfig.shareArticleBaseCents);
        const rewardB = (b.customReadCents ?? engagementRewardConfig.readArticleBaseCents) + (b.customShareCents ?? engagementRewardConfig.shareArticleBaseCents);
        return rewardB - rewardA;
      }
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [publishedPosts, selectedCategory, searchQuery, sortBy, engagementRewardConfig]);

  const featuredPost = useMemo(
    () => publishedPosts.find((p) => p.featured) || publishedPosts[0],
    [publishedPosts]
  );

  const requireAuthPrompt = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apex:require-auth', { detail: 'Earn tier-scaled engagement rewards' }));
    }
  };

  const enabledSharePlatforms = useMemo(() => {
    const enabledSet = new Set<SocialSharePlatformId>(engagementRewardConfig.enabledSharePlatforms || []);
    return SOCIAL_SHARE_PLATFORMS.filter((p) => enabledSet.has(p.id));
  }, [engagementRewardConfig.enabledSharePlatforms]);

  const handleTriggerShare = async (
    post: BlogPost,
    platformId: SocialSharePlatformId,
    isCopyOrNative = false
  ) => {
    const shareUrl = buildArticleShareUrl(post.slug, currentUser?.referralCode, seoSettings.canonicalUrl);
    const shareCaption = `${post.title} — ${post.excerpt}\n${shareUrl}`;

    if (isCopyOrNative || platformId === 'copy_link' || platformId === 'instagram' || platformId === 'tiktok' || platformId === 'youtube' || platformId === 'discord') {
      try {
        await navigator.clipboard.writeText(platformId === 'copy_link' ? shareUrl : shareCaption);
        setCopiedShareId(platformId);
        window.setTimeout(() => setCopiedShareId(null), 2200);
        if (!currentUser) {
          showToast(`Copied share link for ${platformId.toUpperCase()}. Sign in to earn cent rewards on every share!`, 'info');
        }
      } catch {
        // clipboard fallback ignored cleanly
      }
    }

    const res = claimBlogShareReward(post.id, platformId);
    if (!currentUser && res.reason === 'auth_required') {
      showToast('Share opened! Sign in to earn tier-boosted USD cents per social share.', 'info');
    } else if (res.reason === 'platform_already_rewarded_today') {
      showToast(`Shared again on ${platformId.toUpperCase()}! Try another platform today for progressive multi-share cents.`, 'info');
    }
  };

  const handleNativeDeviceShare = async (post: BlogPost) => {
    if (typeof navigator === 'undefined' || !('share' in navigator)) return;
    const shareUrl = buildArticleShareUrl(post.slug, currentUser?.referralCode, seoSettings.canonicalUrl);
    try {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: shareUrl,
      });
      claimBlogShareReward(post.id, 'copy_link');
    } catch {
      // user cancelled native share sheet
    }
  };

  // Calculations for Rewards HUD
  const dailyCapUsd = Math.max(0.1, Number(engagementRewardConfig.dailyCapUsd) || 2.5);
  const dailyProgressPct = Math.min(100, (todayEngagementEarningsUsd / dailyCapUsd) * 100);
  const intervalThreshold = Math.max(15, engagementRewardConfig.timeOnPlatformIntervalSeconds || 60);
  const activeTimePct = Math.min(100, (activePlatformSeconds / intervalThreshold) * 100);
  const effectiveReadCents = Number((engagementRewardConfig.readArticleBaseCents * tierMultiplier).toFixed(1));
  const effectiveShareBaseCents = Number((engagementRewardConfig.shareArticleBaseCents * tierMultiplier).toFixed(1));
  const effectiveShareStepCents = Number((engagementRewardConfig.shareProgressiveStepCents * tierMultiplier).toFixed(1));
  const effectiveEngageCents = Number((engagementRewardConfig.engagementActionBaseCents * tierMultiplier).toFixed(1));
  const effectiveTimeCents = Number((engagementRewardConfig.timeOnPlatformCentsPerInterval * tierMultiplier).toFixed(1));

  const cardSurface = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-zinc-950/90 border-zinc-800 text-zinc-100';
  const mutedText = isLight ? 'text-slate-600' : 'text-zinc-400';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Rewards & Tier Multiplier Engine Strip */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
          isLight
            ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 shadow-sm'
            : 'bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 border-zinc-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className={`flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider ${mutedText}`}>
              <span className="text-red-500 font-bold">Apex Editorial & Engagement Economy</span>
              <span>·</span>
              <span>{engagementRewardConfig.enabled ? 'Rewards Active' : 'Rewards Paused'}</span>
              <span>·</span>
              <span className="text-emerald-500 font-semibold">
                {tierLabel} ({tierMultiplier.toFixed(2)}× Tier Boost)
              </span>
            </div>
            <h1 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              EV Intelligence, Fleet News & Social Share Rewards
            </h1>
            <p className={`text-sm max-w-2xl ${mutedText}`}>
              Read technical briefings, share articles across social platforms for progressive multi-share cents, and accumulate real fractional USD directly into your spendable vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {currentUser ? (
              <div className={`px-4 py-3 rounded-xl border text-right ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/90 border-zinc-800'}`}>
                <span className={`text-[11px] font-mono uppercase block ${mutedText}`}>Lifetime Earned</span>
                <span className="font-heading font-black text-xl text-emerald-500 tabular-nums">
                  ${totalUserEngagementUsd.toFixed(2)} USD
                </span>
                <span className={`text-[11px] font-mono block tabular-nums ${mutedText}`}>
                  Today: ${(todayEngagementEarningsUsd).toFixed(2)} / ${dailyCapUsd.toFixed(2)} ({(todayEngagementEarningsUsd * 100).toFixed(1)}¢)
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={requireAuthPrompt}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Coins className="w-4 h-4" />
                <span>Sign In to Earn Tier Cents</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Payout Multipliers & Dwell Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800/90'}`}>
            <div>
              <span className={`text-[11px] font-mono uppercase ${mutedText}`}>Read Briefing</span>
              <div className="font-heading font-bold text-lg text-emerald-500 tabular-nums mt-0.5">
                +{formatCentsLabel(effectiveReadCents)}
              </div>
              <span className={`text-xs ${mutedText}`}>
                Verified {engagementRewardConfig.readMinDwellSeconds}s dwell
              </span>
            </div>
            <BookOpen className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
          </div>

          <div className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800/90'}`}>
            <div>
              <span className={`text-[11px] font-mono uppercase ${mutedText}`}>Multi-Share Combo</span>
              <div className="font-heading font-bold text-lg text-sky-500 tabular-nums mt-0.5">
                +{effectiveShareBaseCents}¢ → +{Number((effectiveShareBaseCents + effectiveShareStepCents * 2).toFixed(1))}¢
              </div>
              <span className={`text-xs ${mutedText}`}>
                +{effectiveShareStepCents}¢ extra per added platform
              </span>
            </div>
            <Share2 className="w-4 h-4 text-sky-500 shrink-0 mt-1" />
          </div>

          <div className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800/90'}`}>
            <div>
              <span className={`text-[11px] font-mono uppercase ${mutedText}`}>Engage & Discuss</span>
              <div className="font-heading font-bold text-lg text-amber-500 tabular-nums mt-0.5">
                +{formatCentsLabel(effectiveEngageCents)}
              </div>
              <span className={`text-xs ${mutedText}`}>
                Like, Bookmark & Comment
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
          </div>

          <div className={`rounded-xl border p-3.5 space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800/90'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono uppercase ${mutedText}`}>Active Platform Time</span>
              <span className="font-mono text-xs font-bold text-violet-400 tabular-nums">
                {currentUser ? `${activePlatformSeconds}s / ${intervalThreshold}s` : `${intervalThreshold}s cycle`}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading font-bold text-base text-violet-400 tabular-nums">
                +{effectiveTimeCents}¢ / cycle
              </span>
              <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
                Daily Cap {dailyProgressPct.toFixed(0)}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div
                className="h-full bg-violet-500 transition-all duration-500"
                style={{ width: `${currentUser ? activeTimePct : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* READER VIEW */}
      {activePost ? (
        <article className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeArticle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All News & Briefings</span>
            </button>

            <div className={`flex flex-wrap items-center gap-3 text-xs font-mono ${mutedText}`}>
              <span className="text-red-500 font-semibold">{activePost.category}</span>
              <span>·</span>
              <span>{activePost.publishedAt}</span>
              <span>·</span>
              <span>{activePost.readTimeMinutes} min read</span>
              <span>·</span>
              <span className="tabular-nums">{activePost.viewsCount.toLocaleString()} views</span>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${cardSurface}`}>
            <div className="relative h-64 sm:h-88 w-full bg-zinc-900">
              <img
                src={activePost.coverImageUrl}
                alt={activePost.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/img-cybertruck-awd.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-300">
                  <span className="text-red-400 font-bold uppercase">{activePost.category}</span>
                  <span>·</span>
                  <span>{activePost.authorName}</span>
                  <span>·</span>
                  <span>{activePost.authorRole}</span>
                </div>
                <h2 className="font-heading font-black text-2xl sm:text-4xl tracking-tight leading-tight max-w-4xl">
                  {activePost.title}
                </h2>
              </div>
            </div>

            {/* Verified Read Dwell Meter */}
            <div className={`px-6 sm:px-8 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/70 border-zinc-800'}`}>
              <div className="flex items-center gap-3">
                {hasClaimedReadToday ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Timer className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div className="text-xs">
                  {hasClaimedReadToday ? (
                    <span className="font-semibold text-emerald-500">
                      Read Verification Complete — +
                      {Number(
                        ((activePost.customReadCents ?? engagementRewardConfig.readArticleBaseCents) * tierMultiplier).toFixed(1)
                      )}
                      ¢ credited today!
                    </span>
                  ) : currentUser ? (
                    <span className={mutedText}>
                      Reading dwell tracker:{' '}
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                        {readElapsedSec}s / {engagementRewardConfig.readMinDwellSeconds}s
                      </strong>{' '}
                      for{' '}
                      <strong className="text-emerald-500">
                        +
                        {Number(
                          ((activePost.customReadCents ?? engagementRewardConfig.readArticleBaseCents) * tierMultiplier).toFixed(1)
                        )}
                        ¢
                      </strong>{' '}
                      ({tierLabel} {tierMultiplier.toFixed(2)}×)
                    </span>
                  ) : (
                    <span className={mutedText}>
                      Sign in to earn{' '}
                      <strong className="text-emerald-500">
                        +{activePost.customReadCents ?? engagementRewardConfig.readArticleBaseCents}¢–
                        {Number(
                          (
                            (activePost.customReadCents ?? engagementRewardConfig.readArticleBaseCents) *
                            (engagementRewardConfig.tierMultipliers['Founders Club'] || 2.25)
                          ).toFixed(1)
                        )}
                        ¢
                      </strong>{' '}
                      for reading this article.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!hasClaimedReadToday && currentUser && (
                  <div className={`w-32 h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (readElapsedSec / Math.max(5, engagementRewardConfig.readMinDwellSeconds || 20)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
                {!currentUser && (
                  <button
                    type="button"
                    onClick={requireAuthPrompt}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Sign In to Track
                  </button>
                )}
              </div>
            </div>

            {/* Article Main Body */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-5">
                <p className={`text-base sm:text-lg font-medium leading-relaxed ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  {activePost.excerpt}
                </p>
                <div className={`border-t pt-5 space-y-4 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                  {renderArticleBody(activePost.content, isLight)}
                </div>

                {/* Engagement Actions Bar */}
                <div className={`border-t pt-6 flex flex-wrap items-center justify-between gap-4 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          requireAuthPrompt();
                          return;
                        }
                        toggleBlogLike(activePost.id);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        userLikedPostIds.includes(activePost.id)
                          ? 'bg-rose-600/15 border-rose-500/50 text-rose-400'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userLikedPostIds.includes(activePost.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span className="tabular-nums">Applaud ({activePost.likesCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          requireAuthPrompt();
                          return;
                        }
                        toggleBlogBookmark(activePost.id);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        userBookmarkedPostIds.includes(activePost.id)
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${userBookmarkedPostIds.includes(activePost.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{userBookmarkedPostIds.includes(activePost.id) ? 'Saved' : 'Save Briefing'}</span>
                    </button>

                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        type="button"
                        onClick={() => handleNativeDeviceShare(activePost)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        <Share2 className="w-4 h-4 text-sky-400" />
                        <span>Device Share Sheet</span>
                      </button>
                    )}
                  </div>

                  <div className={`text-xs font-mono ${mutedText}`}>
                    Keywords: {activePost.focusKeywords}
                  </div>
                </div>

                {/* SEO & Schema.org Diagnostics Accordion */}
                <div className={`rounded-xl border p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
                  <button
                    type="button"
                    onClick={() => setShowSeoDrawer((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Search Engine Optimization & Structured JSON-LD Verification</span>
                    </span>
                    {showSeoDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showSeoDrawer && (
                    <div className={`mt-3 pt-3 border-t text-xs space-y-2 ${isLight ? 'border-slate-200 text-slate-600' : 'border-zinc-800 text-zinc-400'}`}>
                      <div>
                        <strong className={isLight ? 'text-slate-900' : 'text-zinc-200'}>SEO Title:</strong>{' '}
                        {activePost.seoTitle}
                      </div>
                      <div>
                        <strong className={isLight ? 'text-slate-900' : 'text-zinc-200'}>Meta Description:</strong>{' '}
                        {activePost.metaDescription}
                      </div>
                      <div>
                        <strong className={isLight ? 'text-slate-900' : 'text-zinc-200'}>Focus Keywords:</strong>{' '}
                        {activePost.focusKeywords}
                      </div>
                      <div>
                        <strong className={isLight ? 'text-slate-900' : 'text-zinc-200'}>Canonical URL & Schema:</strong>{' '}
                        <span className="font-mono">/?tab=blog&post={activePost.slug}</span> ({activePost.schemaType})
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className={`border-t pt-6 space-y-4 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-heading font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <MessageSquare className="w-5 h-5 text-red-500" />
                      <span>Owner & Analyst Discussion ({blogComments.filter((c) => c.postId === activePost.id).length})</span>
                    </h3>
                    <span className="text-xs font-mono text-amber-500">
                      First comment earns +{effectiveEngageCents}¢
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!commentInput.trim()) return;
                      const res = addBlogComment(activePost.id, commentInput);
                      if (res.comment) setCommentInput('');
                    }}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={
                        currentUser
                          ? 'Share engineering feedback, performance metrics, or ownership questions...'
                          : 'Sign in to contribute to discussion and earn cents...'
                      }
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-red-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {blogComments
                      .filter((c) => c.postId === activePost.id)
                      .map((cmt) => (
                        <div
                          key={cmt.id}
                          className={`rounded-xl border p-4 space-y-1.5 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {cmt.userName}
                              </span>
                              <span className="font-mono text-[11px] text-emerald-500">
                                {cmt.userTier}
                              </span>
                            </div>
                            <span className={`font-mono text-[11px] ${mutedText}`}>{cmt.createdAt}</span>
                          </div>
                          <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{cmt.body}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: All-Platform Social Share & Progressive Multi-Share Combo Panel */}
              <aside className="lg:col-span-4 space-y-5">
                <div className={`rounded-2xl border p-5 space-y-4 sticky top-24 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/70 border-zinc-800'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase font-bold text-sky-400">
                        Share & Stack Cents
                      </span>
                      <span className="text-xs font-mono tabular-nums text-emerald-500">
                        {tierMultiplier.toFixed(2)}× {tierLabel}
                      </span>
                    </div>
                    <h3 className={`font-heading font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Broadcast Across Social Channels
                    </h3>
                    <p className={`text-xs ${mutedText}`}>
                      Earn progressive cents for sharing on multiple platforms. More platforms shared on this post = more cents unlocked!
                    </p>
                  </div>

                  {(() => {
                    const bucketKey = currentUser ? `${currentUser.id}::${activePost.id}::${todayKey}` : '';
                    const sharedTodayList = (bucketKey && userSharedPostPlatforms[bucketKey]) || [];
                    const maxShares = engagementRewardConfig.maxRewardedSharesPerPostPerDay || 5;
                    const basePostShare = activePost.customShareCents ?? engagementRewardConfig.shareArticleBaseCents;
                    const nextRawCents =
                      basePostShare + sharedTodayList.length * engagementRewardConfig.shareProgressiveStepCents;
                    const nextTierCents = Number((nextRawCents * tierMultiplier).toFixed(1));

                    return (
                      <>
                        <div className={`rounded-xl border p-3.5 space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={mutedText}>Post Share Combos Today</span>
                            <span className="font-mono font-bold tabular-nums text-sky-400">
                              {sharedTodayList.length} / {maxShares} platforms
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={mutedText}>Next New Platform Share Pays</span>
                            <span className="font-mono font-bold tabular-nums text-emerald-500">
                              {sharedTodayList.length >= maxShares ? 'Daily Post Limit Reached' : `+${formatCentsLabel(nextTierCents)}`}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {enabledSharePlatforms.map((platform) => {
                            const shareUrl = buildArticleShareUrl(
                              activePost.slug,
                              currentUser?.referralCode,
                              seoSettings.canonicalUrl
                            );
                            const intentHref = buildPlatformShareIntentHref(platform.id, {
                              url: shareUrl,
                              title: activePost.title,
                              summary: activePost.excerpt,
                              imageUrl: activePost.coverImageUrl,
                              tags: activePost.focusKeywords.split(',').map((t) => t.trim()),
                            });
                            const alreadyShared = sharedTodayList.includes(platform.id);
                            const isCopied = copiedShareId === platform.id;

                            if (platform.mode === 'external_intent' && intentHref) {
                              return (
                                <a
                                  key={platform.id}
                                  href={intentHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    void handleTriggerShare(activePost, platform.id, false);
                                  }}
                                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                    alreadyShared
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                      : isLight
                                      ? 'bg-white border-slate-200 hover:border-sky-400 text-slate-800'
                                      : 'bg-zinc-950 border-zinc-800 hover:border-sky-500/50 text-zinc-200'
                                  }`}
                                >
                                  <span className="truncate">{platform.shortLabel}</span>
                                  {alreadyShared ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                  )}
                                </a>
                              );
                            }

                            return (
                              <button
                                key={platform.id}
                                type="button"
                                onClick={() => {
                                  void handleTriggerShare(activePost, platform.id, true);
                                }}
                                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                  alreadyShared
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-sky-400 text-slate-800'
                                    : 'bg-zinc-950 border-zinc-800 hover:border-sky-500/50 text-zinc-200'
                                }`}
                              >
                                <span className="truncate">
                                  {isCopied ? 'Copied' : platform.shortLabel}
                                </span>
                                {alreadyShared ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}

                  {/* Tier Comparison Mini Card */}
                  <div className={`rounded-xl border p-3.5 space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Tier Multiplier Payouts</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      {(['Standard', 'Plaid Member', 'Founders Club'] as const).map((tierName) => {
                        const mult = engagementRewardConfig.tierMultipliers[tierName] || 1;
                        const activeTier = tierLabel === tierName;
                        return (
                          <div
                            key={tierName}
                            className={`flex items-center justify-between py-1 px-2 rounded-lg ${
                              activeTier
                                ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                                : mutedText
                            }`}
                          >
                            <span>{tierName}</span>
                            <span className="tabular-nums">
                              {mult.toFixed(2)}× ({Number((engagementRewardConfig.shareArticleBaseCents * mult).toFixed(1))}¢/share)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      ) : (
        /* EDITORIAL FEED & MAGAZINE GRID */
        <div className="space-y-8">
          {/* Category Filter + Search + Sort Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, SEO tags..."
                  className={`pl-9 pr-3.5 py-2 rounded-xl border text-xs outline-none focus:border-red-500 w-full sm:w-56 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500'
                  }`}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-red-500 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                <option value="newest">Newest Briefings</option>
                <option value="most_shared">Most Shared</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="highest_reward">Highest Cents Reward</option>
              </select>
            </div>
          </div>

          {/* Featured Headline Story */}
          {featuredPost && selectedCategory === 'all' && !searchQuery.trim() && (
            <div
              onClick={() => openArticle(featuredPost.slug)}
              className={`rounded-2xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 cursor-pointer group transition hover:border-red-500/50 ${cardSurface}`}
            >
              <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-zinc-900">
                <img
                  src={featuredPost.coverImageUrl}
                  alt={featuredPost.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/img-cybertruck-awd.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className={`flex flex-wrap items-center gap-2 text-xs font-mono ${mutedText}`}>
                    <span className="text-red-500 font-bold uppercase">Featured · {featuredPost.category}</span>
                    <span>·</span>
                    <span>{featuredPost.publishedAt}</span>
                    <span>·</span>
                    <span>{featuredPost.readTimeMinutes} min read</span>
                  </div>
                  <h2 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight group-hover:text-red-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {featuredPost.title}
                  </h2>
                  <p className={`text-sm sm:text-base leading-relaxed ${mutedText}`}>
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                    <span className="text-emerald-500 font-bold">
                      Read +{Number(((featuredPost.customReadCents ?? engagementRewardConfig.readArticleBaseCents) * tierMultiplier).toFixed(1))}¢
                    </span>
                    <span className="text-sky-400 font-bold">
                      Share +{Number(((featuredPost.customShareCents ?? engagementRewardConfig.shareArticleBaseCents) * tierMultiplier).toFixed(1))}¢+
                    </span>
                    <span className={mutedText}>{featuredPost.sharesCount.toLocaleString()} shares</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
                    <span>Read & Share Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {filteredPosts.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center space-y-2 ${cardSurface}`}>
              <BookOpen className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="font-heading font-bold text-lg">No briefings match your filter</p>
              <p className={`text-sm ${mutedText}`}>Try clearing your search terms or selecting All Briefings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const readCents = Number(
                  ((post.customReadCents ?? engagementRewardConfig.readArticleBaseCents) * tierMultiplier).toFixed(1)
                );
                const shareCents = Number(
                  ((post.customShareCents ?? engagementRewardConfig.shareArticleBaseCents) * tierMultiplier).toFixed(1)
                );
                const isClaimedToday = Boolean(
                  currentUser && userReadPostDates[`${currentUser.id}::${post.id}`] === todayKey
                );

                return (
                  <article
                    key={post.id}
                    onClick={() => openArticle(post.slug)}
                    className={`rounded-2xl border overflow-hidden flex flex-col cursor-pointer group transition hover:-translate-y-0.5 hover:border-red-500/40 ${cardSurface}`}
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/img-cybertruck-awd.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className={`flex flex-wrap items-center gap-1.5 text-[11px] font-mono ${mutedText}`}>
                          <span className="text-red-500 font-bold uppercase">{post.category}</span>
                          <span>·</span>
                          <span>{post.publishedAt}</span>
                          <span>·</span>
                          <span>{post.readTimeMinutes}m</span>
                        </div>
                        <h3 className={`font-heading font-bold text-lg leading-snug group-hover:text-red-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {post.title}
                        </h3>
                        <p className={`text-xs leading-relaxed line-clamp-3 ${mutedText}`}>
                          {post.excerpt}
                        </p>
                      </div>

                      <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono tabular-nums ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={isClaimedToday ? 'text-emerald-500 font-bold' : 'text-emerald-400'}>
                            {isClaimedToday ? 'Read Earned' : `+${readCents}¢ Read`}
                          </span>
                          <span className={mutedText}>·</span>
                          <span className="text-sky-400">+{shareCents}¢+ Share</span>
                        </div>
                        <div className={`flex items-center gap-2 ${mutedText}`}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.viewsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
