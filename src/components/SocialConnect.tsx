import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Share2,
  ExternalLink,
  Users,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Flame,
  Globe,
  Radio,
} from 'lucide-react';

interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  category: string;
  membersCount: string;
  url: string;
  description: string;
  color: string;
  badge: string;
  iconType: string;
  features: string[];
}

export const SocialConnect: React.FC = () => {
  const { showToast } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);

  const channels: SocialChannel[] = [
    {
      id: 'facebook',
      name: 'Facebook Community',
      handle: 'facebook.com/groups/apexteslahub',
      category: 'Owners Club & Regional Meets',
      membersCount: '54,200+ Members',
      url: 'https://www.facebook.com',
      description: 'The world’s most active private Tesla customization community. Join group drives, track days, and DIY tech troubleshooting.',
      color: 'from-blue-600 to-indigo-700',
      badge: 'OFFICIAL GROUP',
      iconType: 'FB',
      features: ['Weekly Local Supercharger Meets', 'Verified Owner Badges', 'Peer Part Swaps'],
    },
    {
      id: 'pinterest',
      name: 'Pinterest Wrap Studio',
      handle: 'pinterest.com/apexteslawraps',
      category: 'Color Inspiration & Moodboards',
      membersCount: '128,000+ Followers',
      url: 'https://www.pinterest.com',
      description: 'Curated 4K galleries of satin, matte, color-shift iridescent wraps, forged carbon aero kits, and interior ambient lighting boards.',
      color: 'from-red-600 to-rose-700',
      badge: 'TRENDING BOARDS',
      iconType: 'PIN',
      features: ['High-Res 3M & Inozetek Swatches', 'Cybertruck Camo Guides', 'Aesthetic Visualizers'],
    },
    {
      id: 'threads',
      name: 'Threads Feed',
      handle: '@apexteslahub',
      category: 'Real-time Pulse & Dispatch',
      membersCount: '38,500+ Followers',
      url: 'https://www.threads.net',
      description: 'Behind-the-scenes thoughts from our master wrap techs, software update analysis, and instant customer dispatch highlights.',
      color: 'from-zinc-700 to-black',
      badge: 'FAST UPDATES',
      iconType: 'TH',
      features: ['Live Service Bay Commentary', 'Quick Polls', 'Tech QA with Master Certified Techs'],
    },
    {
      id: 'instagram',
      name: 'Instagram Visuals',
      handle: '@apex.teslahub',
      category: 'Daily Delivery Reels & 4K Photos',
      membersCount: '92,400+ Followers',
      url: 'https://www.instagram.com',
      description: 'High-octane delivery reels, Plaid launch mode reactions, ceramic coating water beading slow-mo, and full body transformations.',
      color: 'from-pink-600 via-purple-600 to-amber-500',
      badge: 'DAILY REELS',
      iconType: 'IG',
      features: ['Stories from Bay 1-18', 'Before & After Vinyl Wraps', 'VIP Client Deliveries'],
    },
    {
      id: 'tiktok',
      name: 'TikTok Workshop ASMR',
      handle: '@apexteslahub',
      category: 'Shortform Wraps & Drag Races',
      membersCount: '215,000+ Followers',
      url: 'https://www.tiktok.com',
      description: 'Satisfying vinyl peel ASMR, Cybertruck Cyberbeast quarter-mile drag races, sound deadening tests, and yoke wheel swaps.',
      color: 'from-cyan-500 via-pink-500 to-black',
      badge: 'VIRAL ASMR',
      iconType: 'TT',
      features: ['Satisfying Vinyl Peels', 'Quarter-mile Telematics', 'DIY Tesla Maintenance Tips'],
    },
    {
      id: 'twitter',
      name: 'X (Twitter) Ops',
      handle: '@ApexTeslaHub',
      category: 'Announcements & Crypto Staking',
      membersCount: '76,800+ Followers',
      url: 'https://twitter.com',
      description: 'Breaking platform announcements, on-chain crypto payment releases, Supercharger node yields, and giveaway drops.',
      color: 'from-zinc-800 to-zinc-950',
      badge: 'VERIFIED GOLD',
      iconType: 'X',
      features: ['Instant Staking Yield Payouts', 'Crypto Liquidity Proofs', 'Product Drop Alerts'],
    },
    {
      id: 'youtube',
      name: 'YouTube Engineering',
      handle: 'youtube.com/@ApexTeslaGarage',
      category: 'Deep Dives & Tutorials',
      membersCount: '164,000+ Subscribers',
      url: 'https://www.youtube.com',
      description: 'Comprehensive 4K teardowns, high-voltage battery health restorations, PPF installation masterclasses, and track build logs.',
      color: 'from-red-600 to-red-800',
      badge: '4K EPISODES',
      iconType: 'YT',
      features: ['Step-by-step Wrap Tutorials', 'Track Mode Data Telemetry', 'Battery Cell Analysis'],
    },
    {
      id: 'discord',
      name: 'Discord VIP DAO',
      handle: 'discord.gg/apextesla',
      category: '24/7 Community & Alpha',
      membersCount: '28,900+ Online',
      url: 'https://discord.com',
      description: 'Connect directly with certified Tesla master mechanics, discuss investment yields, and receive priority service bay reservation alerts.',
      color: 'from-indigo-600 to-blue-700',
      badge: '24/7 ACTIVE',
      iconType: 'DC',
      features: ['Direct Tech Support Chat', 'Alpha Investment Calls', 'Exclusive Scratch Card Drop Pings'],
    },
  ];

  const shareUrl = window.location.origin || 'https://apex-tesla.io';
  const shareText = 'Check out Apex Tesla Hub: Vehicle maintenance, custom 3M wraps, crypto deposits, and $8,000 jackpots!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Platform link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let target = '';

    switch (platform) {
      case 'x':
        target = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        target = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'pinterest':
        target = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
        break;
      case 'threads':
        target = `https://threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'whatsapp':
        target = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        target = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        target = shareUrl;
    }

    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="social" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          <span>Connected Ecosystem & Global Network</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
          CONNECT WITH APEX TESLA
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Join over 750,000 Tesla drivers, performance builders, and crypto investors across our verified social channels. Get instant announcements, share your builds, and access exclusive community perks.
        </p>
      </div>

      {/* Quick Share Hub Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-heading font-black text-xl">
              <Share2 className="w-5 h-5 text-red-500" />
              <span>Share Apex Tesla Hub With Friends</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Spread the word about our zero-fee crypto payments, certified maintenance bays, and $8,000 scratch card giveaways.
            </p>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenShare('x')}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:border-red-500/50"
            >
              <span className="font-black">𝕏</span>
              <span>Post</span>
            </button>

            <button
              onClick={() => handleOpenShare('facebook')}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleOpenShare('pinterest')}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Pinterest</span>
            </button>

            <button
              onClick={() => handleOpenShare('threads')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Threads</span>
            </button>

            <button
              onClick={() => handleOpenShare('whatsapp')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Verified Social Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map((chan) => (
          <div
            key={chan.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-700 transition shadow-xl group relative overflow-hidden"
          >
            <div className="space-y-4">
              {/* Channel Header Banner */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${chan.color} flex items-center justify-center font-heading font-black text-white text-base shadow-lg shadow-black/50`}>
                  {chan.iconType}
                </div>

                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {chan.badge}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-white group-hover:text-red-400 transition">
                  {chan.name}
                </h3>
                <span className="text-[11px] font-mono text-red-400 block">{chan.handle}</span>
                <span className="text-[10px] text-zinc-500 block uppercase font-mono mt-0.5">{chan.category}</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {chan.description}
              </p>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-1">
                {chan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/80 mt-6 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">
                {chan.membersCount}
              </span>

              <a
                href={chan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Follow</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
