import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  Gift,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Check,
  Zap,
  TrendingUp,
  Award,
  QrCode,
  ExternalLink,
  Megaphone,
  Trophy,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Crosshair,
} from 'lucide-react';

interface ReferralHubProps {
  onOpenDeposit?: () => void;
  onOpenAuth?: () => void;
  onNavigateToBanners?: () => void;
}

export const ReferralHub: React.FC<ReferralHubProps> = ({ onOpenDeposit, onOpenAuth, onNavigateToBanners }) => {
  const {
    currentUser,
    allUsers,
    referralLink,
    updateReferralCode,
    simulateFriendReferral,
    showToast,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState(currentUser?.referralCode || 'APEX-ALEX-99');
  const [simFriendName, setSimFriendName] = useState('Jordan Rivera');
  const [simDepositAmount, setSimDepositAmount] = useState<number>(500);
  const [isSimulating, setIsSimulating] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState<string>('');
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();
  const sliderRegionRef = useRef<HTMLDivElement | null>(null);

  const isGuestView = !currentUser;
  const displayUser = currentUser || {
    referralCode: 'APEX-ALEX-99',
    referralEarningsUsd: 0,
    referralCount: 0,
    referredUsers: [],
  };

  const handleCopyLink = () => {
    if (!currentUser) {
      showToast('Please sign in or register to get your personal referral link.', 'error');
      onOpenAuth?.();
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Unique invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!currentUser) {
      showToast('Please sign in or register to access your personal referral code.', 'error');
      onOpenAuth?.();
      return;
    }
    navigator.clipboard.writeText(displayUser.referralCode || 'APEX-ALEX-99');
    setCopiedCode(true);
    showToast('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveCustomCode = () => {
    if (!currentUser) {
      showToast('Please sign in to customize your personal referral code.', 'info');
      onOpenAuth?.();
      return;
    }
    if (updateReferralCode(customCodeInput)) {
      setIsEditingCode(false);
    }
  };

  const handleRunSimulation = () => {
    if (!currentUser) {
      showToast('Sign in to credit live referral bonuses to your personal vault.', 'info');
      onOpenAuth?.();
      return;
    }
    setIsSimulating(true);
    setTimeout(() => {
      simulateFriendReferral(simFriendName, simDepositAmount);
      setIsSimulating(false);
    }, 800);
  };

  // Social share URLs
  const shareText = encodeURIComponent(
    `Join me on Apex Tesla Hub for certified maintenance, bespoke body wraps, rentals & fleet yield! Use my invite code ${displayUser.referralCode} for $25 welcome credit + 5 free spins: `
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralLink)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(referralLink)}`;

  const totalEarnings = displayUser.referralEarningsUsd || 0;
  const totalInvited = displayUser.referredUsers?.length || 0;
  const completedDeposits = displayUser.referredUsers?.filter((u) => u.status === 'deposit_completed').length || 0;

  interface LeaderboardEntry {
    id: string;
    name: string;
    username: string;
    tierLabel: 'Founders Club' | 'Plaid Member' | 'Standard';
    referralCode: string;
    referralCount: number;
    totalCreditsUsd: number;
    avatar?: string;
    isCurrentUser: boolean;
  }

  const additionalFleetMembers: LeaderboardEntry[] = [
    {
      id: 'mbr-devon',
      name: 'Devon Sterling',
      username: '@DevonSterling',
      tierLabel: 'Founders Club',
      referralCode: 'APEX-DEVON-88',
      referralCount: 34,
      totalCreditsUsd: 3400,
      isCurrentUser: false,
    },
    {
      id: 'mbr-nadia',
      name: 'Nadia Al-Mansoor',
      username: '@NadiaAlMansoor',
      tierLabel: 'Founders Club',
      referralCode: 'APEX-NADIA-24',
      referralCount: 28,
      totalCreditsUsd: 2850,
      isCurrentUser: false,
    },
    {
      id: 'mbr-lucas',
      name: 'Lucas Lindqvist',
      username: '@LucasLindqvist',
      tierLabel: 'Founders Club',
      referralCode: 'APEX-LUCAS-19',
      referralCount: 24,
      totalCreditsUsd: 2420,
      isCurrentUser: false,
    },
    {
      id: 'mbr-amara',
      name: 'Amara Okafor',
      username: '@AmaraOkafor',
      tierLabel: 'Founders Club',
      referralCode: 'APEX-AMARA-31',
      referralCount: 22,
      totalCreditsUsd: 2200,
      isCurrentUser: false,
    },
    {
      id: 'mbr-julian',
      name: 'Julian Vance-Kerr',
      username: '@JulianKerr',
      tierLabel: 'Founders Club',
      referralCode: 'APEX-JULN-20',
      referralCount: 20,
      totalCreditsUsd: 2050,
      isCurrentUser: false,
    },
    {
      id: 'mbr-sienna',
      name: 'Sienna Takahashi',
      username: '@SiennaTakahashi',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-SIENA-14',
      referralCount: 18,
      totalCreditsUsd: 1840,
      isCurrentUser: false,
    },
    {
      id: 'mbr-hendrik',
      name: 'Hendrik Van Dijk',
      username: '@HendrikEV',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-HEND-16',
      referralCount: 16,
      totalCreditsUsd: 1620,
      isCurrentUser: false,
    },
    {
      id: 'mbr-rafael',
      name: 'Rafael Mendoza',
      username: '@RafaelMendoza',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-RAFA-11',
      referralCount: 14,
      totalCreditsUsd: 1450,
      isCurrentUser: false,
    },
    {
      id: 'mbr-camille',
      name: 'Camille Laurent',
      username: '@CamillePlaid',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-CAML-12',
      referralCount: 12,
      totalCreditsUsd: 1280,
      isCurrentUser: false,
    },
    {
      id: 'mbr-tomasz',
      name: 'Tomasz Kowalski',
      username: '@TomaszTesla',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-TOMA-10',
      referralCount: 11,
      totalCreditsUsd: 1120,
      isCurrentUser: false,
    },
    {
      id: 'mbr-meilin',
      name: 'Mei-Lin Zhou',
      username: '@MeiLinZhou',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-MEIL-09',
      referralCount: 10,
      totalCreditsUsd: 1010,
      isCurrentUser: false,
    },
    {
      id: 'mbr-hannah',
      name: 'Hannah Mercer',
      username: '@HannahMercer',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-HANA-07',
      referralCount: 8,
      totalCreditsUsd: 840,
      isCurrentUser: false,
    },
    {
      id: 'mbr-omar',
      name: 'Omar Farooq',
      username: '@OmarFarooq',
      tierLabel: 'Plaid Member',
      referralCode: 'APEX-OMAR-08',
      referralCount: 7,
      totalCreditsUsd: 720,
      isCurrentUser: false,
    },
    {
      id: 'mbr-sophie',
      name: 'Sophie Lindholm',
      username: '@SophieEV',
      tierLabel: 'Standard',
      referralCode: 'APEX-SOPH-06',
      referralCount: 6,
      totalCreditsUsd: 590,
      isCurrentUser: false,
    },
    {
      id: 'mbr-diego',
      name: 'Diego Morales',
      username: '@DiegoCyber',
      tierLabel: 'Standard',
      referralCode: 'APEX-DIEG-05',
      referralCount: 5,
      totalCreditsUsd: 510,
      isCurrentUser: false,
    },
    {
      id: 'mbr-freya',
      name: 'Freya Solberg',
      username: '@FreyaSolberg',
      tierLabel: 'Standard',
      referralCode: 'APEX-FREY-04',
      referralCount: 4,
      totalCreditsUsd: 430,
      isCurrentUser: false,
    },
    {
      id: 'mbr-kieran',
      name: 'Kieran Byrne',
      username: '@KieranByrne',
      tierLabel: 'Standard',
      referralCode: 'APEX-KIER-03',
      referralCount: 3,
      totalCreditsUsd: 360,
      isCurrentUser: false,
    },
    {
      id: 'mbr-ananya',
      name: 'Ananya Patel',
      username: '@AnanyaPatel',
      tierLabel: 'Standard',
      referralCode: 'APEX-ANAN-02',
      referralCount: 3,
      totalCreditsUsd: 295,
      isCurrentUser: false,
    },
    {
      id: 'mbr-noah',
      name: 'Noah Callahan',
      username: '@NoahCallahan',
      tierLabel: 'Standard',
      referralCode: 'APEX-NOAH-02',
      referralCount: 2,
      totalCreditsUsd: 225,
      isCurrentUser: false,
    },
    {
      id: 'mbr-zara',
      name: 'Zara Haddad',
      username: '@ZaraHaddad',
      tierLabel: 'Standard',
      referralCode: 'APEX-ZARA-01',
      referralCount: 2,
      totalCreditsUsd: 165,
      isCurrentUser: false,
    },
    {
      id: 'mbr-ethan',
      name: 'Ethan Gallagher',
      username: '@EthanGallagher',
      tierLabel: 'Standard',
      referralCode: 'APEX-ETHN-01',
      referralCount: 1,
      totalCreditsUsd: 90,
      isCurrentUser: false,
    },
  ];

  // Merge live user accounts from AppContext with fleet member referrers, keeping exactly 30 displayed members
  const mergedUsersMap = new Map<string, LeaderboardEntry>();
  allUsers
    .filter((u) => u.role !== 'admin')
    .forEach((u) => {
      const cleanHandle = u.name.replace(/[^a-zA-Z0-9]/g, '');
      mergedUsersMap.set(u.id, {
        id: u.id,
        name: u.name,
        username: `@${cleanHandle || 'TeslaDriver'}`,
        tierLabel: u.tier,
        referralCode: u.referralCode,
        referralCount: u.referralCount || 0,
        totalCreditsUsd: u.referralEarningsUsd || 0,
        avatar: u.avatar,
        isCurrentUser: Boolean(currentUser && (u.id === currentUser.id || u.email === currentUser.email)),
      });
    });

  if (currentUser && currentUser.role !== 'admin') {
    const existingKey = Array.from(mergedUsersMap.values()).find(
      (entry) => entry.id === currentUser.id || entry.referralCode === currentUser.referralCode
    )?.id;
    const targetKey = existingKey || currentUser.id;
    const cleanHandle = currentUser.name.replace(/[^a-zA-Z0-9]/g, '');
    mergedUsersMap.set(targetKey, {
      id: currentUser.id,
      name: currentUser.name,
      username: `@${cleanHandle || 'You'}`,
      tierLabel: currentUser.tier,
      referralCode: currentUser.referralCode,
      referralCount: currentUser.referralCount || 0,
      totalCreditsUsd: currentUser.referralEarningsUsd || 0,
      avatar: currentUser.avatar,
      isCurrentUser: true,
    });
  }

  const liveMembersList = Array.from(mergedUsersMap.values());
  const TARGET_LEADERBOARD_COUNT = 30;
  const remainingSlots = Math.max(0, TARGET_LEADERBOARD_COUNT - liveMembersList.length);

  const baseLeaderboard = [
    ...liveMembersList,
    ...additionalFleetMembers.slice(0, remainingSlots),
  ]
    .sort((a, b) => {
      if (b.totalCreditsUsd !== a.totalCreditsUsd) return b.totalCreditsUsd - a.totalCreditsUsd;
      return b.referralCount - a.referralCount;
    })
    .slice(0, TARGET_LEADERBOARD_COUNT);

  const rankedLeaderboard = baseLeaderboard.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  const currentUserRankEntry = rankedLeaderboard.find((e) => e.isCurrentUser);

  const getCreditBadge = (creditsUsd: number): {
    label: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
    textClass: string;
    surfaceClass: string;
    glowClass: string;
  } => {
    if (creditsUsd >= 2000) {
      return {
        label: 'Platinum',
        textClass: 'text-cyan-300',
        surfaceClass: 'bg-cyan-950/60 border-cyan-500/40',
        glowClass: 'from-cyan-500/15 via-transparent to-transparent',
      };
    }
    if (creditsUsd >= 1000) {
      return {
        label: 'Gold',
        textClass: 'text-amber-300',
        surfaceClass: 'bg-amber-950/50 border-amber-500/40',
        glowClass: 'from-amber-500/15 via-transparent to-transparent',
      };
    }
    if (creditsUsd >= 350) {
      return {
        label: 'Silver',
        textClass: 'text-zinc-200',
        surfaceClass: 'bg-zinc-800/80 border-zinc-600/60',
        glowClass: 'from-zinc-400/10 via-transparent to-transparent',
      };
    }
    return {
      label: 'Bronze',
      textClass: 'text-orange-300',
      surfaceClass: 'bg-orange-950/40 border-orange-500/35',
      glowClass: 'from-orange-500/15 via-transparent to-transparent',
    };
  };

  const getNextTierProgress = (creditsUsd: number) => {
    if (creditsUsd >= 2000) {
      return { label: 'Max Tier Reached · Platinum', progress: 1 };
    }
    if (creditsUsd >= 1000) {
      return {
        label: `$${(2000 - creditsUsd).toLocaleString()} to Platinum`,
        progress: Math.min(1, (creditsUsd - 1000) / 1000),
      };
    }
    if (creditsUsd >= 350) {
      return {
        label: `$${(1000 - creditsUsd).toLocaleString()} to Gold`,
        progress: Math.min(1, (creditsUsd - 350) / 650),
      };
    }
    return {
      label: `$${(350 - creditsUsd).toLocaleString()} to Silver`,
      progress: Math.min(1, creditsUsd / 350),
    };
  };

  const visibleLeaderboard = rankedLeaderboard.filter((entry) => {
    if (leaderboardSearch.trim()) {
      const q = leaderboardSearch.trim().toLowerCase();
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.username.toLowerCase().includes(q) ||
        entry.referralCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const SLIDE_PAGE_SIZE = 5;
  const totalMembersCount = visibleLeaderboard.length;
  const safeActiveIndex =
    totalMembersCount > 0 ? Math.min(activeSlideIndex, totalMembersCount - 1) : 0;
  const totalDeckPages = Math.max(1, Math.ceil(totalMembersCount / SLIDE_PAGE_SIZE));
  const currentDeckPage = Math.floor(safeActiveIndex / SLIDE_PAGE_SIZE);
  const currentDeckItems = visibleLeaderboard.slice(
    currentDeckPage * SLIDE_PAGE_SIZE,
    currentDeckPage * SLIDE_PAGE_SIZE + SLIDE_PAGE_SIZE
  );

  const stepToIndex = (targetIdx: number) => {
    if (totalMembersCount === 0) return;
    const normalized = ((targetIdx % totalMembersCount) + totalMembersCount) % totalMembersCount;
    const dir = targetIdx >= safeActiveIndex ? 1 : -1;
    setSlideDirection(dir);
    setActiveSlideIndex(normalized);
  };

  const stepByDelta = (delta: number) => {
    if (totalMembersCount === 0) return;
    const normalized = ((safeActiveIndex + delta) % totalMembersCount + totalMembersCount) % totalMembersCount;
    setSlideDirection(delta >= 0 ? 1 : -1);
    setActiveSlideIndex(normalized);
  };

  const handleCoverflowDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (totalMembersCount <= 1) return;
    if (info.offset.x < -45 || info.velocity.x < -300) {
      stepByDelta(1);
    } else if (info.offset.x > 45 || info.velocity.x > 300) {
      stepByDelta(-1);
    }
  };

  useEffect(() => {
    setSlideDirection(1);
    setActiveSlideIndex(0);
  }, [leaderboardSearch]);

  useEffect(() => {
    if (!isAutoPlaying || isSliderHovered || shouldReduceMotion || totalMembersCount <= 1 || leaderboardSearch.trim()) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideDirection(1);
      setActiveSlideIndex((prev) => (prev + 1) % totalMembersCount);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isSliderHovered, shouldReduceMotion, totalMembersCount, leaderboardSearch]);

  const activeFeaturedEntry = visibleLeaderboard[safeActiveIndex];
  const prevFeaturedEntry =
    totalMembersCount > 1
      ? visibleLeaderboard[(safeActiveIndex - 1 + totalMembersCount) % totalMembersCount]
      : undefined;
  const nextFeaturedEntry =
    totalMembersCount > 1
      ? visibleLeaderboard[(safeActiveIndex + 1) % totalMembersCount]
      : undefined;
  const prevFarEntry =
    totalMembersCount > 4
      ? visibleLeaderboard[(safeActiveIndex - 2 + totalMembersCount) % totalMembersCount]
      : undefined;
  const nextFarEntry =
    totalMembersCount > 4
      ? visibleLeaderboard[(safeActiveIndex + 2) % totalMembersCount]
      : undefined;

  const renderMemberAvatar = (entry: RankedEntry, sizeClass: string, textClass: string) => {
    const initials = entry.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const showImage = Boolean(entry.avatar) && !failedAvatars[entry.id];

    if (showImage) {
      return (
        <img
          src={entry.avatar}
          alt={entry.name}
          referrerPolicy="no-referrer"
          onError={() => setFailedAvatars((prev) => ({ ...prev, [entry.id]: true }))}
          className={`${sizeClass} rounded-xl object-cover border border-zinc-700 shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center ${textClass} font-bold text-zinc-200 shrink-0`}
      >
        {initials || 'TD'}
      </div>
    );
  };

  type RankedEntry = (typeof rankedLeaderboard)[number];

  return (
    <div id="referrals" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {isGuestView && onOpenAuth && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-zinc-300">
            Viewing the Referral Rewards Program in Guest Mode. Sign in to generate and track your personal referral payouts.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Sign In to Claim Link
          </button>
        </div>
      )}
      {/* Program Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5" />
          <span>Apex Tesla Ambassador & Referral Protocol</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          INVITE FRIENDS • EARN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">$100 CREDITS</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Share your unique invite link with Tesla owners and crypto enthusiasts. Earn guaranteed $100 platform credits directly into your dashboard vault whenever a referred user signs up and makes their first deposit.
        </p>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase font-mono">Total Referral Earned</span>
          <div className="font-heading font-black text-3xl text-emerald-400">
            ${totalEarnings.toLocaleString()} <span className="text-xs font-mono font-normal text-zinc-400">USD</span>
          </div>
          <span className="text-[10px] text-zinc-400 block">Credited to dashboard vault</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase font-mono">Total Friends Joined</span>
          <div className="font-heading font-black text-3xl text-white">
            {totalInvited} <span className="text-xs font-mono font-normal text-zinc-400">Members</span>
          </div>
          <span className="text-[10px] text-zinc-400 block">Via your unique link</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase font-mono">Completed 1st Deposits</span>
          <div className="font-heading font-black text-3xl text-yellow-400">
            {completedDeposits} <span className="text-xs font-mono font-normal text-zinc-400">Verified</span>
          </div>
          <span className="text-[10px] text-emerald-400 block">100% Payout Success Rate</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] text-zinc-500 uppercase font-mono">Reward Per 1st Deposit</span>
          <div className="font-heading font-black text-3xl text-red-500">
            +$100 <span className="text-xs font-mono font-normal text-zinc-400">+ 2 Spins</span>
          </div>
          <span className="text-[10px] text-zinc-400 block">Zero earning cap</span>
        </div>
      </div>

      {/* Main Referral Generation Card & QR Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 8 Cols: Link Generator & Sharing */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  Your Dedicated Ambassador Link
                </span>
                <h3 className="font-heading font-bold text-xl text-white">
                  Share & Start Earning Platform Credits
                </h3>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Unique Invite Link Input Box */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                Unique Referral Link (Embeds Your Personal Tracking Code)
              </label>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-2xl p-2 pl-4">
                <span className="font-mono text-xs sm:text-sm text-zinc-200 truncate flex-1 select-all">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {onNavigateToBanners && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Promotional Ad Banners (All Sizes)</span>
                    <span className="text-[11px] text-zinc-400">
                      Get 728×90, 300×300, 300×250 & 160×600 banners pre-loaded with your code {displayUser.referralCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToBanners}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  <span>Open Ad Banners</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Unique Referral Code with Edit Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Your Referral Code</span>
                  {!isEditingCode && (
                    <button
                      onClick={() => setIsEditingCode(true)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Customize</span>
                    </button>
                  )}
                </div>

                {isEditingCode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCodeInput}
                      onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. CYBER-ALEX"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold uppercase focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={handleSaveCustomCode}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xl text-yellow-400 tracking-wider">
                      {displayUser.referralCode || 'APEX-ALEX-99'}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                      title="Copy Code Only"
                    >
                      {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-zinc-500">Friends can enter this code manually during registration</p>
              </div>

              {/* Instant Social Share Buttons */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-xs text-zinc-400 block">Quick Share via Socials</span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                  >
                    <span>X</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                  <a
                    href={telegramShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                  >
                    <span>Telegram</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
                <p className="text-[10px] text-zinc-500">Includes pre-filled invite copy and bonus claim link</p>
              </div>
            </div>
          </div>

          {/* Mutual Benefits Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                <strong>Dual-Sided Benefits:</strong> You get <span className="text-white font-bold">$100 Credits + 2 Spins</span> on their 1st deposit. Your friend receives <span className="text-white font-bold">$25 Welcome Credit + 5 Free Spins</span> upon sign up.
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant Vault Credit</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: QR Code & Mobile Invite Card */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-between text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider block">
              In-Person Mobile Scan
            </span>
            <h4 className="font-heading font-bold text-lg text-white">Scan to Claim Bonus</h4>
            <p className="text-xs text-zinc-400">Point phone camera to open invite link immediately</p>
          </div>

          {/* Visual QR Code Display */}
          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-red-500/30 flex flex-col items-center justify-center">
            <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
              <rect x="5" y="5" width="26" height="26" fill="black" rx="3" />
              <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

              <rect x="69" y="5" width="26" height="26" fill="black" rx="3" />
              <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

              <rect x="5" y="69" width="26" height="26" fill="black" rx="3" />
              <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

              {/* Data blocks */}
              <rect x="36" y="8" width="6" height="6" fill="black" />
              <rect x="46" y="12" width="6" height="6" fill="black" />
              <rect x="38" y="22" width="6" height="6" fill="black" />
              <rect x="54" y="24" width="6" height="6" fill="black" />
              <rect x="10" y="38" width="6" height="6" fill="black" />
              <rect x="22" y="44" width="6" height="6" fill="black" />
              <rect x="36" y="38" width="12" height="12" fill="#e82127" rx="2" />
              <rect x="54" y="40" width="6" height="6" fill="black" />
              <rect x="68" y="38" width="6" height="6" fill="black" />
              <rect x="80" y="44" width="6" height="6" fill="black" />
              <rect x="38" y="56" width="6" height="6" fill="black" />
              <rect x="50" y="56" width="6" height="6" fill="black" />
              <rect x="68" y="54" width="6" height="6" fill="black" />
              <rect x="36" y="72" width="6" height="6" fill="black" />
              <rect x="52" y="74" width="6" height="6" fill="black" />
              <rect x="68" y="70" width="6" height="6" fill="black" />
              <rect x="80" y="80" width="6" height="6" fill="black" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-black mt-2 tracking-wider">
              {displayUser.referralCode || 'APEX-ALEX-99'}
            </span>
          </div>

          <div className="text-center text-xs text-zinc-400">
            <span className="font-semibold text-white">Share at Tesla Superchargers</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Perfect for car meetups & EV charging lounges</p>
          </div>
        </div>
      </div>

      {/* Program How-It-Works Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 font-heading font-black flex items-center justify-center text-base">
            01
          </div>
          <h4 className="font-heading font-bold text-lg text-white">Generate & Share Link</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Copy your personalized invite link or custom code and share with friends, EV forums, or social networks.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-heading font-black flex items-center justify-center text-base">
            02
          </div>
          <h4 className="font-heading font-bold text-lg text-white">Friend Signs Up</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your friend registers using your link and instantly unlocks 5 Free Spins + $25 welcome platform credit.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-heading font-black flex items-center justify-center text-base">
            03
          </div>
          <h4 className="font-heading font-bold text-lg text-white">First Deposit = $100 Cash</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            As soon as they make their first deposit in XRP, USDT, BNB, or BTC, you automatically receive $100 Platform Credits + 2 Free Spins!
          </p>
        </div>
      </div>

      {/* Interactive Simulation Sandbox for Testing */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-heading font-bold text-xl text-white">
                Live Referral Simulation Tester
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Test how new friends join via your invite link and trigger your $100 platform credits payout in real time.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            Interactive Test Sandbox
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1">Simulated Friend Name</label>
            <input
              type="text"
              value={simFriendName}
              onChange={(e) => setSimFriendName(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white font-medium"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Friend's First Deposit Amount (USD)</label>
            <select
              value={simDepositAmount}
              onChange={(e) => setSimDepositAmount(Number(e.target.value))}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
            >
              <option value={100}>$100 USD (e.g. 100 USDT)</option>
              <option value={500}>$500 USD (e.g. 210 XRP)</option>
              <option value={1200}>$1,200 USD (e.g. 0.013 BTC)</option>
              <option value={2500}>$2,500 USD (e.g. 3.8 BNB)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-heading font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Coins className="w-4 h-4" />
              <span>{isSimulating ? 'Processing On-Chain Referral...' : 'Simulate Deposit & Claim $100'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Tesla Fleet Referrers Leaderboard Slider */}
      <section
        aria-labelledby="referral-leaderboard-heading"
        ref={sliderRegionRef}
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            stepByDelta(1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            stepByDelta(-1);
          }
        }}
        tabIndex={0}
        className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Tesla Fleet Ambassador Standings</span>
            </div>
            <h3 id="referral-leaderboard-heading" className="font-heading font-bold text-2xl text-white">
              Leaderboard
            </h3>
            <p className="text-xs text-zinc-400">
              Top {rankedLeaderboard.length} Tesla fleet referrers ranked dynamically by total platform credits earned
              {currentUserRankEntry ? (
                <>
                  {' '}· Your rank:{' '}
                  <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                    #{currentUserRankEntry.rank} (${currentUserRankEntry.totalCreditsUsd.toLocaleString()} USD)
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {currentUserRankEntry && !leaderboardSearch.trim() && (
              <button
                type="button"
                onClick={() => {
                  const idx = visibleLeaderboard.findIndex((item) => item.isCurrentUser);
                  if (idx >= 0) stepToIndex(idx);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 shrink-0" />
                <span>Jump to My Rank</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-pressed={isAutoPlaying}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Pause Slider</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Auto Slide</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white whitespace-nowrap shrink-0">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono tabular-nums">All Members ({rankedLeaderboard.length})</span>
            </div>
          </div>
        </div>

        {/* Search + Slider Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={leaderboardSearch}
              onChange={(e) => setLeaderboardSearch(e.target.value)}
              placeholder="Search member username or referral code..."
              aria-label="Search leaderboard members"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-zinc-400 font-mono tabular-nums">
              {totalMembersCount > 0
                ? `Spotlight #${String(safeActiveIndex + 1).padStart(2, '0')} of ${totalMembersCount}`
                : '0 matching members'}
            </span>
            {totalMembersCount > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => stepByDelta(-1)}
                  aria-label="Previous member slide"
                  className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-200 transition cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => stepByDelta(1)}
                  aria-label="Next member slide"
                  className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-200 transition cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State vs Active 3D Coverflow Stage + Synchronized Slide Track */}
        {visibleLeaderboard.length === 0 ? (
          <div className="text-center py-10 space-y-3 border-t border-zinc-800/80">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No members match your search</p>
              <p className="text-xs text-zinc-500">
                Clear your search query to view all {rankedLeaderboard.length} members on the leaderboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLeaderboardSearch('')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. 3D Perspective Coverflow Spotlight Slider */}
            <div className="relative overflow-hidden py-4 px-1 [perspective:1200px]">
              {/* Edge Vignette Fades for Seamless Depth Framing */}
              <div className="pointer-events-none hidden md:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-20" />
              <div className="pointer-events-none hidden md:block absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-20" />

              <motion.div
                drag={totalMembersCount > 1 && !shouldReduceMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleCoverflowDragEnd}
                className="relative flex items-center justify-center gap-4 min-h-[228px] select-none cursor-grab active:cursor-grabbing"
              >
                {/* Far Left (-2) Coverflow Card (Desktop XL) */}
                {prevFarEntry && (
                  <motion.button
                    type="button"
                    key={`far-prev-${prevFarEntry.id}`}
                    onClick={() => stepByDelta(-2)}
                    initial={false}
                    animate={{ opacity: 0.34, scale: 0.78, rotateY: 22, x: 18 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.1 }
                        : { type: 'spring', stiffness: 260, damping: 28 }
                    }
                    className="hidden xl:flex flex-col justify-between w-48 h-44 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-left shrink-0 cursor-pointer hover:border-zinc-700"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono tabular-nums text-xs font-bold text-zinc-400">
                        #{String(prevFarEntry.rank).padStart(2, '0')}
                      </span>
                      <span className={`text-[10px] font-semibold ${getCreditBadge(prevFarEntry.totalCreditsUsd).textClass}`}>
                        {getCreditBadge(prevFarEntry.totalCreditsUsd).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderMemberAvatar(prevFarEntry, 'w-9 h-9', 'text-xs')}
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-xs text-white truncate">{prevFarEntry.username}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{prevFarEntry.name}</p>
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-xs font-bold text-emerald-400">
                      ${prevFarEntry.totalCreditsUsd.toLocaleString()} USD
                    </div>
                  </motion.button>
                )}

                {/* Adjacent Left (-1) Coverflow Card */}
                {prevFeaturedEntry && (
                  <motion.button
                    type="button"
                    key={`prev-${prevFeaturedEntry.id}`}
                    onClick={() => stepByDelta(-1)}
                    initial={false}
                    animate={{ opacity: 0.65, scale: 0.88, rotateY: 14, x: 8 }}
                    whileHover={shouldReduceMotion ? undefined : { opacity: 0.88, scale: 0.91 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.1 }
                        : { type: 'spring', stiffness: 280, damping: 28 }
                    }
                    className="hidden md:flex flex-col justify-between w-60 h-48 p-5 rounded-2xl bg-zinc-900/85 border border-zinc-800 text-left shrink-0 cursor-pointer hover:border-zinc-700"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono tabular-nums text-xs font-bold text-zinc-300">
                        #{String(prevFeaturedEntry.rank).padStart(2, '0')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${getCreditBadge(prevFeaturedEntry.totalCreditsUsd).surfaceClass} ${getCreditBadge(prevFeaturedEntry.totalCreditsUsd).textClass}`}
                      >
                        <Award className="w-3 h-3 shrink-0" />
                        <span>{getCreditBadge(prevFeaturedEntry.totalCreditsUsd).label}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      {renderMemberAvatar(prevFeaturedEntry, 'w-10 h-10', 'text-xs')}
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-white truncate">
                          {prevFeaturedEntry.username}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{prevFeaturedEntry.name}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 border-t border-zinc-800/80 pt-3">
                      <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                        {prevFeaturedEntry.referralCount} invites
                      </span>
                      <span className="font-mono tabular-nums text-sm font-black text-emerald-400">
                        ${prevFeaturedEntry.totalCreditsUsd.toLocaleString()}
                      </span>
                    </div>
                  </motion.button>
                )}

                {/* Center Active Spotlight Card */}
                {activeFeaturedEntry && (
                  <div className="w-full max-w-md shrink-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
                    <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
                      {(() => {
                        const badge = getCreditBadge(activeFeaturedEntry.totalCreditsUsd);
                        const tierProgress = getNextTierProgress(activeFeaturedEntry.totalCreditsUsd);
                        const rankAccent =
                          activeFeaturedEntry.rank === 1
                            ? 'text-amber-400'
                            : activeFeaturedEntry.rank === 2
                              ? 'text-zinc-200'
                              : activeFeaturedEntry.rank === 3
                                ? 'text-amber-600'
                                : 'text-emerald-400';

                        return (
                          <motion.div
                            key={activeFeaturedEntry.id}
                            custom={slideDirection}
                            initial={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, x: slideDirection * 64, scale: 0.94, rotateY: slideDirection * -10 }
                            }
                            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, x: -slideDirection * 64, scale: 0.94, rotateY: slideDirection * 10 }
                            }
                            transition={
                              shouldReduceMotion
                                ? { duration: 0.15 }
                                : { type: 'spring', stiffness: 300, damping: 28, mass: 0.85 }
                            }
                            className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl space-y-5 ${
                              activeFeaturedEntry.isCurrentUser
                                ? 'bg-zinc-900 border-emerald-500/50'
                                : 'bg-zinc-900 border-zinc-700/80'
                            }`}
                          >
                            {/* Subtle tier gradient sheen */}
                            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${badge.glowClass}`} />

                            <div className="relative flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {renderMemberAvatar(activeFeaturedEntry, 'w-14 h-14', 'text-base')}
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="font-heading font-black text-base sm:text-lg text-white truncate">
                                      {activeFeaturedEntry.username}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap shrink-0 ${badge.surfaceClass} ${badge.textClass}`}
                                    >
                                      <Award className="w-3 h-3 shrink-0" />
                                      <span>{badge.label}</span>
                                    </span>
                                    {activeFeaturedEntry.isCurrentUser && (
                                      <span className="text-[11px] font-semibold text-emerald-400 shrink-0">
                                        · You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-400 truncate">
                                    {activeFeaturedEntry.name}
                                    <span aria-hidden="true"> · </span>
                                    <span className="font-mono text-zinc-500">{activeFeaturedEntry.referralCode}</span>
                                  </p>
                                </div>
                              </div>

                              <div className={`font-mono tabular-nums font-black text-xl flex items-center gap-1.5 shrink-0 ${rankAccent}`}>
                                <span>#{String(activeFeaturedEntry.rank).padStart(2, '0')}</span>
                                {activeFeaturedEntry.rank <= 3 && <Trophy className="w-4 h-4 shrink-0" />}
                              </div>
                            </div>

                            <div className="relative grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                              <div>
                                <span className="text-[11px] font-mono text-zinc-500 block">Verified Invites</span>
                                <span className="font-heading font-bold text-lg font-mono tabular-nums text-white">
                                  {activeFeaturedEntry.referralCount}{' '}
                                  <span className="text-xs font-normal text-zinc-400">
                                    {activeFeaturedEntry.referralCount === 1 ? 'invite' : 'invites'}
                                  </span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-mono text-zinc-500 block">Total Credits Earned</span>
                                <span className="font-heading font-black text-xl font-mono tabular-nums text-emerald-400 whitespace-nowrap">
                                  ${activeFeaturedEntry.totalCreditsUsd.toLocaleString()} USD
                                </span>
                              </div>
                            </div>

                            {/* Next Badge Milestone Progress */}
                            <div className="relative space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                                <span>Badge Standing: {badge.label}</span>
                                <span>{tierProgress.label}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                                <motion.div
                                  initial={false}
                                  animate={{ scaleX: tierProgress.progress }}
                                  transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                                  className="h-full w-full origin-left bg-gradient-to-r from-emerald-500 to-cyan-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                )}

                {/* Adjacent Right (+1) Coverflow Card */}
                {nextFeaturedEntry && (
                  <motion.button
                    type="button"
                    key={`next-${nextFeaturedEntry.id}`}
                    onClick={() => stepByDelta(1)}
                    initial={false}
                    animate={{ opacity: 0.65, scale: 0.88, rotateY: -14, x: -8 }}
                    whileHover={shouldReduceMotion ? undefined : { opacity: 0.88, scale: 0.91 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.1 }
                        : { type: 'spring', stiffness: 280, damping: 28 }
                    }
                    className="hidden md:flex flex-col justify-between w-60 h-48 p-5 rounded-2xl bg-zinc-900/85 border border-zinc-800 text-left shrink-0 cursor-pointer hover:border-zinc-700"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono tabular-nums text-xs font-bold text-zinc-300">
                        #{String(nextFeaturedEntry.rank).padStart(2, '0')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${getCreditBadge(nextFeaturedEntry.totalCreditsUsd).surfaceClass} ${getCreditBadge(nextFeaturedEntry.totalCreditsUsd).textClass}`}
                      >
                        <Award className="w-3 h-3 shrink-0" />
                        <span>{getCreditBadge(nextFeaturedEntry.totalCreditsUsd).label}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      {renderMemberAvatar(nextFeaturedEntry, 'w-10 h-10', 'text-xs')}
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm text-white truncate">
                          {nextFeaturedEntry.username}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{nextFeaturedEntry.name}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 border-t border-zinc-800/80 pt-3">
                      <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                        {nextFeaturedEntry.referralCount} invites
                      </span>
                      <span className="font-mono tabular-nums text-sm font-black text-emerald-400">
                        ${nextFeaturedEntry.totalCreditsUsd.toLocaleString()}
                      </span>
                    </div>
                  </motion.button>
                )}

                {/* Far Right (+2) Coverflow Card (Desktop XL) */}
                {nextFarEntry && (
                  <motion.button
                    type="button"
                    key={`far-next-${nextFarEntry.id}`}
                    onClick={() => stepByDelta(2)}
                    initial={false}
                    animate={{ opacity: 0.34, scale: 0.78, rotateY: -22, x: -18 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.1 }
                        : { type: 'spring', stiffness: 260, damping: 28 }
                    }
                    className="hidden xl:flex flex-col justify-between w-48 h-44 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-left shrink-0 cursor-pointer hover:border-zinc-700"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono tabular-nums text-xs font-bold text-zinc-400">
                        #{String(nextFarEntry.rank).padStart(2, '0')}
                      </span>
                      <span className={`text-[10px] font-semibold ${getCreditBadge(nextFarEntry.totalCreditsUsd).textClass}`}>
                        {getCreditBadge(nextFarEntry.totalCreditsUsd).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderMemberAvatar(nextFarEntry, 'w-9 h-9', 'text-xs')}
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-xs text-white truncate">{nextFarEntry.username}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{nextFarEntry.name}</p>
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-xs font-bold text-emerald-400">
                      ${nextFarEntry.totalCreditsUsd.toLocaleString()} USD
                    </div>
                  </motion.button>
                )}
              </motion.div>

              {/* Auto-play subtle progress rail when active */}
              {isAutoPlaying && !isSliderHovered && !shouldReduceMotion && totalMembersCount > 1 && !leaderboardSearch.trim() && (
                <div className="max-w-md mx-auto mt-2 h-0.5 rounded-full bg-zinc-900 overflow-hidden">
                  <motion.div
                    key={`autoplay-bar-${safeActiveIndex}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 4.5, ease: 'linear' }}
                    className="h-full w-full origin-left bg-emerald-500/70"
                  />
                </div>
              )}
            </div>

            {/* 2. Synchronized Slide Range Selector (Jump across all 30 members in groups of 5) */}
            {totalDeckPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-5">
                <div className="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Leaderboard rank ranges">
                  {Array.from({ length: totalDeckPages }).map((_, pageIdx) => {
                    const startNum = pageIdx * SLIDE_PAGE_SIZE + 1;
                    const endNum = Math.min((pageIdx + 1) * SLIDE_PAGE_SIZE, totalMembersCount);
                    const isActivePage = pageIdx === currentDeckPage;
                    return (
                      <button
                        key={pageIdx}
                        type="button"
                        role="tab"
                        aria-selected={isActivePage}
                        onClick={() => stepToIndex(pageIdx * SLIDE_PAGE_SIZE)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                          isActivePage
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        #{String(startNum).padStart(2, '0')}–{String(endNum).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>

                {/* Scrubber Dots */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {visibleLeaderboard.map((entry, idx) => {
                    const isFocused = idx === safeActiveIndex;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => stepToIndex(idx)}
                        aria-label={`Focus rank ${entry.rank} ${entry.username}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          isFocused
                            ? 'w-5 bg-emerald-400'
                            : entry.isCurrentUser
                              ? 'w-2.5 bg-amber-400/70 hover:bg-amber-300'
                              : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Animated Multi-Row Slide Track (5 members per slide, synced with coverflow) */}
            <div className="overflow-hidden border-t border-zinc-800/80 pt-4">
              <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
                <motion.div
                  key={`deck-page-${currentDeckPage}-${leaderboardSearch}`}
                  custom={slideDirection}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: slideDirection * 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -slideDirection * 48 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.12 }
                      : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="divide-y divide-zinc-800/80"
                >
                  {currentDeckItems.map((entry) => {
                    const badge = getCreditBadge(entry.totalCreditsUsd);
                    const isActiveSpotlight = activeFeaturedEntry?.id === entry.id;
                    const rankAccent =
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                          ? 'text-zinc-200'
                          : entry.rank === 3
                            ? 'text-amber-600'
                            : 'text-zinc-400';

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          const targetIdx = visibleLeaderboard.findIndex((item) => item.id === entry.id);
                          if (targetIdx >= 0) stepToIndex(targetIdx);
                        }}
                        className={`w-full py-3.5 px-3 flex items-center justify-between gap-4 text-left transition-colors rounded-xl cursor-pointer ${
                          isActiveSpotlight
                            ? 'bg-zinc-900/90'
                            : entry.isCurrentUser
                              ? 'bg-emerald-950/20 hover:bg-emerald-950/35'
                              : 'hover:bg-zinc-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className={`w-14 font-mono tabular-nums font-bold text-sm flex items-center gap-1 shrink-0 ${rankAccent}`}>
                            <span>#{String(entry.rank).padStart(2, '0')}</span>
                            {entry.rank <= 3 && <Trophy className="w-3.5 h-3.5 shrink-0" />}
                          </div>

                          {renderMemberAvatar(entry, 'w-9 h-9', 'text-xs')}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <span className="font-heading font-bold text-sm text-white truncate">
                                {entry.username}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap shrink-0 ${badge.surfaceClass} ${badge.textClass}`}
                              >
                                <Award className="w-3 h-3 shrink-0" />
                                <span>{badge.label}</span>
                              </span>
                              {entry.isCurrentUser && (
                                <span className="text-[11px] font-semibold text-emerald-400 shrink-0">
                                  · You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">
                              <span>{entry.name}</span>
                              <span aria-hidden="true"> · </span>
                              <span className="font-mono text-zinc-500">{entry.referralCode}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <span className="hidden sm:inline font-mono tabular-nums text-xs text-zinc-300">
                            {entry.referralCount} {entry.referralCount === 1 ? 'invite' : 'invites'}
                          </span>
                          <span className="font-heading font-black text-sm sm:text-base font-mono tabular-nums text-emerald-400 whitespace-nowrap min-w-[96px] text-right">
                            ${entry.totalCreditsUsd.toLocaleString()} USD
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>

      {/* Referral Activity Ledger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Your Referred Network Activity</h3>
            <p className="text-xs text-zinc-400">Real-time status tracking for all invited Tesla community members</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {displayUser.referredUsers?.length || 0} Total Invites
          </span>
        </div>

        {(!displayUser.referredUsers || displayUser.referredUsers.length === 0) ? (
          <div className="text-center py-12 space-y-2">
            <Users className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-300 font-bold text-sm">No referred friends yet.</p>
            <p className="text-xs text-zinc-500">Copy your invite link above or run the simulation tester to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {displayUser.referredUsers.map((friend) => (
              <div
                key={friend.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-red-500/30 shrink-0"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white">{friend.name}</h4>
                    <span className="text-[11px] text-zinc-500 font-mono">{friend.email} • Joined on {friend.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    {friend.status === 'deposit_completed' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        First Deposit Verified (${friend.depositAmountUsd} USD)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase">
                        Signed Up (Deposit Pending)
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 min-w-[100px]">
                    <span className="font-heading font-black text-base text-emerald-400 block">
                      +${friend.earnedCreditUsd} USD
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      +{friend.bonusSpinsEarned} Free Spins
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
