import { SocialSharePlatformId } from '../types';

export interface SocialSharePlatformMeta {
  id: SocialSharePlatformId;
  label: string;
  shortLabel: string;
  badgeColor: string;
  mode: 'external_intent' | 'copy_and_open' | 'copy_only';
  externalDestination?: string;
}

export const SOCIAL_SHARE_PLATFORMS: SocialSharePlatformMeta[] = [
  {
    id: 'twitter',
    label: 'X / Twitter',
    shortLabel: 'X',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    mode: 'external_intent',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    shortLabel: 'Facebook',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    mode: 'external_intent',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    shortLabel: 'LinkedIn',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    mode: 'external_intent',
  },
  {
    id: 'threads',
    label: 'Threads',
    shortLabel: 'Threads',
    badgeColor: 'text-slate-200 border-zinc-600/60 bg-zinc-800/60',
    mode: 'external_intent',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    shortLabel: 'WhatsApp',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    mode: 'external_intent',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    shortLabel: 'Telegram',
    badgeColor: 'text-sky-300 border-sky-400/30 bg-sky-400/10',
    mode: 'external_intent',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    shortLabel: 'Reddit',
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    mode: 'external_intent',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    shortLabel: 'Pinterest',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    mode: 'external_intent',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    shortLabel: 'Instagram',
    badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    mode: 'copy_and_open',
    externalDestination: 'https://www.instagram.com/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    shortLabel: 'TikTok',
    badgeColor: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10',
    mode: 'copy_and_open',
    externalDestination: 'https://www.tiktok.com/',
  },
  {
    id: 'youtube',
    label: 'YouTube Post',
    shortLabel: 'YouTube',
    badgeColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    mode: 'copy_and_open',
    externalDestination: 'https://www.youtube.com/',
  },
  {
    id: 'discord',
    label: 'Discord',
    shortLabel: 'Discord',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    mode: 'copy_and_open',
    externalDestination: 'https://discord.com/app',
  },
  {
    id: 'email',
    label: 'Email',
    shortLabel: 'Email',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    mode: 'external_intent',
  },
  {
    id: 'copy_link',
    label: 'Copy Tracked Link',
    shortLabel: 'Copy Link',
    badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    mode: 'copy_only',
  },
];

export const buildArticleShareUrl = (
  slug: string,
  referralCode?: string,
  canonicalBase?: string
): string => {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : canonicalBase || 'https://apex-tesla-hub.io';
  const params = new URLSearchParams();
  params.set('tab', 'blog');
  params.set('post', slug);
  if (referralCode) {
    params.set('ref', referralCode);
  }
  return `${origin.replace(/\/+$/, '')}/?${params.toString()}`;
};

export const buildPlatformShareIntentHref = (
  platform: SocialSharePlatformId,
  params: {
    url: string;
    title: string;
    summary: string;
    imageUrl?: string;
    tags?: string[];
  }
): string | undefined => {
  const encodedUrl = encodeURIComponent(params.url);
  const encodedTitle = encodeURIComponent(params.title);
  const hashString = (params.tags || [])
    .slice(0, 3)
    .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
    .filter((t) => t.length > 1)
    .join(' ');
  const fullText = `${params.title} — ${params.summary}${hashString ? ` ${hashString}` : ''}`;
  const encodedText = encodeURIComponent(fullText);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'threads':
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${fullText} ${params.url}`)}`;
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${fullText}\n${params.url}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(params.imageUrl || '')}&description=${encodedTitle}`;
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${params.title}\n\n${params.summary}\n\nRead full briefing: ${params.url}`)}`;
    case 'instagram':
      return 'https://www.instagram.com/';
    case 'tiktok':
      return 'https://www.tiktok.com/';
    case 'youtube':
      return 'https://www.youtube.com/';
    case 'discord':
      return 'https://discord.com/app';
    case 'copy_link':
    default:
      return undefined;
  }
};
