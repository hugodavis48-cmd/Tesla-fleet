import React, { useState } from 'react';
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
} from 'lucide-react';

interface ReferralHubProps {
  onOpenDeposit?: () => void;
  onOpenAuth?: () => void;
  onNavigateToBanners?: () => void;
}

export const ReferralHub: React.FC<ReferralHubProps> = ({ onOpenDeposit, onOpenAuth, onNavigateToBanners }) => {
  const {
    currentUser,
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
