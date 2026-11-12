import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Wallet,
  Shield,
  Car,
  Plus,
  Lock,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Users,
  MapPin,
  Calendar,
  FileText,
  Edit3,
  Server,
  LogOut,
  X,
  History,
  ShieldCheck,
  Building,
  CheckCircle,
  Camera,
  Upload,
  BadgeCheck,
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  TrendingUp,
  Bell,
  BellRing,
  Activity,
  Flame,
  DollarSign,
  Clock,
} from 'lucide-react';
import { TeslaVehicle, ServiceBooking, UserKycData, FeaturedStockPlan } from '../types';
import { ReferralHub } from './ReferralHub';
import { UserInvestmentBoard } from './UserInvestmentBoard';
import { NotificationInbox } from './NotificationInbox';
import { RoiGrowthChart } from './RoiGrowthChart';

interface DashboardProps {
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
  onNavigateToServices: () => void;
  onOpenAuth: () => void;
}


const PRESET_AVATARS = [
  {
    name: 'Cyber Driver Plaid',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Roadster Test Pilot',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Cybertruck Overland',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Founders Club Executive',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Plaid Track Racer',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Stealth Matte Specialist',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Austin Gigafactory Lead',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  },
  {
    name: 'Supercharger Node Tech',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onNavigateToServices,
  onOpenAuth,
}) => {

  const {
    currentUser,
    balances,
    vehicles,
    serviceBookings,
    transactions,
    userInvestments,
    adminNotifications,
    addVehicle,
    toggle2FA,
    updatePin,
    updateProfile,
    changePassword,
    terminateOtherSessions,
    submitKyc,
    logout,
    showToast,
    tslaQuote,
    userSpotHolding,
    featuredStockPlans,
    buySpotStock,
    sellSpotStock,
    investInFeaturedStock,
    featureToggles,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'garage' | 'stocks' | 'services' | 'history' | 'wallet' | 'investments' | 'notifications' | 'kyc' | 'referrals' | 'security'
  >('garage');

  // Stock trading states in user dashboard
  const [spotBuyAmount, setSpotBuyAmount] = useState<string>('500');
  const [spotSellShares, setSpotSellShares] = useState<string>('1');
  const [selectedPlanForInvest, setSelectedPlanForInvest] = useState<FeaturedStockPlan | null>(null);
  const [investPlanAmount, setInvestPlanAmount] = useState<string>('500');

  const unreadNotificationsCount = adminNotifications.filter((n) => {
    const isTarget =
      n.targetType === 'all' ||
      n.targetUserId === currentUser?.id ||
      n.targetUserEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
    return isTarget && !(n.readBy || []).includes(currentUser?.id || 'usr-apex-001');
  }).length;
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<ServiceBooking | null>(null);

  // Avatar Editor state
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentUser?.avatar || PRESET_AVATARS[0].url);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Edit profile state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || 'Fremont, CA');
  const [editCenter, setEditCenter] = useState(currentUser?.preferredServiceCenter || 'Apex Fremont Technology Center');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // KYC Submission state
  const [kycForm, setKycForm] = useState<UserKycData>({
    legalName: currentUser?.kycData?.legalName || currentUser?.name || '',
    dob: currentUser?.kycData?.dob || '1992-04-15',
    nationality: currentUser?.kycData?.nationality || 'United States',
    residentialAddress: currentUser?.kycData?.residentialAddress || '3500 Deer Creek Rd, Palo Alto, CA 94304',
    idType: currentUser?.kycData?.idType || 'passport',
    idNumber: currentUser?.kycData?.idNumber || '',
    idFrontUrl: currentUser?.kycData?.idFrontUrl || '',
    proofOfAddressUrl: currentUser?.kycData?.proofOfAddressUrl || '',
    submittedAt: currentUser?.kycData?.submittedAt || '',
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Add vehicle state
  const [newVehicle, setNewVehicle] = useState({
    model: 'Model 3' as TeslaVehicle['model'],
    trim: 'Long Range AWD',
    year: 2024,
    vin: '5YJ3E1EB4PF' + Math.floor(100000 + Math.random() * 900000),
    licensePlate: 'TSLA-' + Math.floor(10 + Math.random() * 90),
    color: 'Midnight Silver Metallic',
    batterySoc: 90,
    odometer: 11200,
    estimatedRange: 335,
    serviceStatus: 'optimal' as TeslaVehicle['serviceStatus'],
    lastServiceDate: '2026-10-18',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  });

  const [newPinInput, setNewPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Transaction filter
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'service_payment' | 'referral_credit' | 'promotion_win'>('all');

  // Safe preview identity so signed-out users can still explore the User Dashboard
  const isGuestView = !currentUser;
  const displayUser = currentUser || {
    id: 'usr-apex-001',
    name: 'Guest Explorer (Preview)',
    email: 'guest.preview@apex-tesla.io',
    role: 'customer' as const,
    avatar: PRESET_AVATARS[0].url,
    bio: 'Previewing Apex Tesla Hub digital garage, fleet investments, service bays, TSLA stocks, and wallet analytics.',
    location: 'Fremont, CA',
    preferredServiceCenter: 'Apex Fremont Technology Center',
    phone: '+1 (555) 837-5290',
    walletAddress: '0x9E218C4FaB06A4dD23c945b9E52aF3eA48972',
    twoFactorEnabled: false,
    pinSet: false,
    memberSince: 'Public Preview',
    tier: 'Plaid Member' as const,
    referralCode: 'APEX-ALEX-99',
    referralEarningsUsd: 350,
    referralCount: 3,
    referredUsers: [],
    kycStatus: 'unverified' as const,
    kycData: undefined,
    activeSession: undefined,
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle(newVehicle);
    setShowAddVehicleModal(false);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to configure a transaction PIN.', 'info');
      onOpenAuth();
      return;
    }
    if (newPinInput.length !== 4) {
      showToast('PIN must be exactly 4 digits.', 'error');
      return;
    }
    updatePin(newPinInput);
    setShowPinModal(false);
    setNewPinInput('');
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to save profile changes.', 'info');
      setShowEditProfileModal(false);
      onOpenAuth();
      return;
    }
    await updateProfile({
      name: editName,
      phone: editPhone,
      bio: editBio,
      location: editLocation,
      preferredServiceCenter: editCenter,
    });
    setShowEditProfileModal(false);
  };

  const handleSaveAvatar = async () => {
    if (!currentUser) {
      showToast('Please sign in to update your avatar.', 'info');
      setShowAvatarModal(false);
      onOpenAuth();
      return;
    }
    setIsSavingAvatar(true);
    await updateProfile({ avatar: selectedAvatarUrl });
    setIsSavingAvatar(false);
    setShowAvatarModal(false);
    showToast('Profile picture updated successfully!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatarUrl(reader.result);
        showToast('Photo loaded into preview. Click "Save Avatar" to apply.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to submit KYC verification documents.', 'info');
      onOpenAuth();
      return;
    }
    if (!kycForm.legalName || !kycForm.idNumber) {
      showToast('Please provide your full legal name and government ID number.', 'error');
      return;
    }

    setIsSubmittingKyc(true);
    const success = await submitKyc(kycForm);
    setIsSubmittingKyc(false);
    if (success) {
      setActiveTab('kyc');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to manage account password security.', 'info');
      onOpenAuth();
      return;
    }
    setPasswordStatus(null);
    if (!currentPassword || !newPassword) {
      setPasswordStatus('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus('Password successfully updated and re-encrypted with scrypt.');
    } else {
      setPasswordStatus(res.message || 'Failed to update password.');
    }
  };

  // Helper for tracking stages
  const getStageIndex = (status: string) => {
    const stages = [
      'Scheduled',
      'Received & Queued',
      'Diagnostics',
      'Technician Working',
      'Quality Inspection',
      'Ready for Pickup / Complete',
    ];
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 1;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter;
  });

  // Calculate Transaction Summary Stats
  const totalDepositsUsd = transactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((acc, tx) => acc + tx.usdEquivalent, 0);

  const totalServicesUsd = transactions
    .filter((tx) => tx.type === 'service_payment' || tx.type === 'rental_payment')
    .reduce((acc, tx) => acc + tx.usdEquivalent, 0);

  const totalRewardsUsd = transactions
    .filter((tx) => tx.type === 'referral_credit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim')
    .reduce((acc, tx) => acc + tx.usdEquivalent, 0);

  // Active vs Past Service bookings
  const activeBookings = serviceBookings.filter(
    (b) => b.status !== 'Ready for Pickup / Complete'
  );
  const pastBookings = serviceBookings.filter(
    (b) => b.status === 'Ready for Pickup / Complete'
  );

  const kycStatus = displayUser.kycStatus || 'unverified';

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Guest Preview Mode Banner (Non-blocking for Signed-Out Visitors) */}
      {isGuestView && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Public Guest Dashboard Preview — Signed Out Mode
              </p>
              <p className="text-[11px] text-zinc-400">
                Browse the digital garage, live TSLA stock ROI, fleet investments, services, and vault layout freely. Sign in to save personal profile changes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 shadow-md transition cursor-pointer"
          >
            Sign In / Demo User
          </button>
        </div>
      )}

      {/* User Header Profile Card with Editable Avatar & Bio */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Avatar with Click-to-Edit Overlay & Main Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <img
                src={displayUser.avatar}
                alt={displayUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500/50 shadow-xl group-hover:opacity-85 transition"
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-[10px] text-white font-mono font-bold">
                <Camera className="w-5 h-5 text-red-400 mb-0.5" />
                <span>EDIT</span>
              </div>
              <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-black text-[9px] font-mono font-bold shadow-md ${isGuestView ? 'bg-amber-400' : 'bg-emerald-500'}`}>
                {isGuestView ? 'PREVIEW' : 'ONLINE'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {displayUser.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono uppercase font-bold">
                  {displayUser.tier}
                </span>

                {/* KYC Status Pill in Header */}
                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                    kycStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : kycStatus === 'in_review'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>
                    KYC: {kycStatus === 'verified' ? 'TIER 2 VERIFIED' : kycStatus === 'in_review' ? 'PENDING REVIEW' : 'UNVERIFIED'}
                  </span>
                </button>
              </div>

              <p className="text-xs text-zinc-400 font-mono">{displayUser.email}</p>

              {/* Bio Details */}
              <p className="text-xs text-zinc-300 max-w-xl pt-1 leading-relaxed">
                {displayUser.bio || 'Tesla owner & enthusiast. Passionate about zero-emission performance.'}
              </p>

              {/* Location, Service Center, Phone */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-zinc-400 pt-2 font-mono">
                <span className="flex items-center gap-1 text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {displayUser.location || 'Fremont, CA'}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Building className="w-3.5 h-3.5 text-red-400" />
                  {displayUser.preferredServiceCenter || 'Apex Fremont Technology Center'}
                </span>
                {displayUser.phone && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                    {displayUser.phone}
                  </span>
                )}
                <span className="flex items-center gap-1 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Member since {displayUser.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons & Total Vault Balance */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-end gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-right w-full sm:w-auto">
              <span className="text-[10px] text-zinc-400 block font-mono">TOTAL VAULT ASSETS</span>
              <span className="font-heading font-black text-2xl text-emerald-400">
                ${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-red-400" />
                <span>Avatar</span>
              </button>

              <button
                onClick={() => {
                  setEditName(displayUser.name);
                  setEditPhone(displayUser.phone || '');
                  setEditBio(displayUser.bio || '');
                  setEditLocation(displayUser.location || 'Fremont, CA');
                  setEditCenter(displayUser.preferredServiceCenter || 'Apex Fremont Technology Center');
                  setShowEditProfileModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-red-400" />
                <span>Edit Bio</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                title="Owner Notifications & Alerts"
                className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-zinc-300" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenDeposit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>

              {currentUser ? (
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  title="Sign In"
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Subtabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'garage', label: 'My Digital Garage', count: vehicles.length, icon: Car },
          { id: 'stocks', label: 'TSLA Stocks & Fast ROI', icon: Activity, badge: `$${tslaQuote.price.toFixed(1)}` },
          { id: 'investments', label: 'Fleet Investments & ROI', count: userInvestments.filter(i => !i.userId || i.userId === displayUser.id).length, icon: TrendingUp, badge: 'ROI' },
          { id: 'notifications', label: 'Notifications', count: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined, icon: BellRing, badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} NEW` : undefined },
          { id: 'services', label: 'Active Repairs', count: activeBookings.length, icon: Wrench },
          { id: 'history', label: 'Past Service History', count: pastBookings.length, icon: History },
          { id: 'wallet', label: 'Transaction Summary & Vault', count: transactions.length, icon: Wallet },
          { id: 'kyc', label: 'KYC & Limits', icon: BadgeCheck, badge: kycStatus === 'verified' ? 'TIER 2' : kycStatus === 'in_review' ? 'REVIEW' : 'VERIFY' },
          { id: 'referrals', label: 'Invite & Earn', count: displayUser.referralCount || 0, icon: Users, badge: '+$100' },
          { id: 'security', label: 'Security & Sessions', icon: Shield },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                active
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  tab.badge === 'TIER 2' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Digital Garage */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          {/* Visual Recharts ROI Growth & Compounding Chart */}
          <RoiGrowthChart
            onOpenDeposit={onOpenDeposit}
            onNavigateToStake={onNavigateToServices}
          />

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Registered Tesla Fleet</h3>
              <p className="text-xs text-zinc-400">Live telematics, battery state-of-charge, and maintenance logs</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tesla to Garage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-700 text-xs font-bold text-white">
                    {v.licensePlate}
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600/80 backdrop-blur-md text-[11px] font-mono font-bold text-white">
                    {v.batterySoc}% Charged
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                      {v.year} {v.model}
                    </span>
                    <h4 className="font-heading font-bold text-xl text-white">{v.trim}</h4>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Telematics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">EST. RANGE</span>
                      <span className="text-white font-bold">{v.estimatedRange} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">ODOMETER</span>
                      <span className="text-white font-bold">{v.odometer.toLocaleString()} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">COLOR / WRAP</span>
                      <span className="text-red-400 font-semibold truncate block">{v.color.split(' ')[0]}</span>
                    </div>
                  </div>

                  {v.wrapType && (
                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-300">
                      <span className="text-[10px] text-zinc-500 font-mono block">INSTALLED WRAP SPEC</span>
                      <span className="font-medium text-white">{v.wrapType}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          v.serviceStatus === 'optimal'
                            ? 'bg-emerald-400'
                            : v.serviceStatus === 'in_service'
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-red-400'
                        }`}
                      />
                      <span className="text-zinc-300 capitalize font-medium">
                        Status: {v.serviceStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={onNavigateToServices}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-red-400" />
                      <span>Book Service</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Active Service Tracker */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Active Service Bay Telematics</h3>
              <p className="text-xs text-zinc-400">Step-by-step telemetry, technician notes & GPS Ranger tracking</p>
            </div>
            <button
              onClick={onNavigateToServices}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
            >
              + Schedule New Repair
            </button>
          </div>

          {activeBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
              <Wrench className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-300 font-bold">No in-progress repair appointments at this moment.</p>
              <p className="text-xs text-zinc-500">Need scheduled maintenance, diagnostics, or custom styling? Check past records or book a slot.</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
                >
                  View Past Service History
                </button>
                <button
                  onClick={onNavigateToServices}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeBookings.map((booking) => {
                const currentStageIdx = getStageIndex(booking.status);
                const stages = [
                  'Scheduled',
                  'Received & Queued',
                  'Diagnostics',
                  'Technician Working',
                  'Quality Inspection',
                  'Ready for Pickup',
                ];

                return (
                  <div
                    key={booking.id}
                    className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-red-400 uppercase">
                            #{booking.id}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs font-semibold text-zinc-300">{booking.vehicleName}</span>
                        </div>
                        <h4 className="font-heading font-black text-xl text-white mt-1">
                          {booking.serviceType}
                        </h4>
                        <p className="text-xs text-zinc-400">{booking.location}</p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold inline-block">
                          {booking.status}
                        </span>
                        <span className="text-xs text-zinc-400 block mt-1 font-mono">
                          {booking.scheduledDate} @ {booking.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar 5-Stage Stepper */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Workflow Phase: {booking.status}</span>
                        <span className="font-mono text-emerald-400 font-bold">{booking.progressPercentage}% Completed</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${booking.progressPercentage}%` }}
                        />
                      </div>

                      {/* Stage steps indicator */}
                      <div className="grid grid-cols-6 gap-1 pt-2">
                        {stages.map((stg, i) => {
                          const isDone = i <= currentStageIdx;
                          const isCurrent = i === currentStageIdx;
                          return (
                            <div key={stg} className="text-center space-y-1">
                              <div
                                className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isDone
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                                    : 'bg-zinc-800 text-zinc-500'
                                } ${isCurrent ? 'ring-2 ring-yellow-400' : ''}`}
                              >
                                {isDone ? '✓' : i + 1}
                              </div>
                              <span className="text-[9px] text-zinc-400 hidden sm:block truncate leading-tight">
                                {stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technician Notes */}
                    {booking.technicianNotes && (
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-red-400 font-semibold font-mono">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Active Bay Telemetry & Master Technician Notes</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">{booking.technicianNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Past Service History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Past Service History & Maintenance Logs</h3>
              <p className="text-xs text-zinc-400">Archived service tickets, parts replacements, diagnostics & invoices</p>
            </div>
            <button
              onClick={onNavigateToServices}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
            >
              + Book New Maintenance
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-xl">
            {pastBookings.length === 0 ? (
              <p className="text-zinc-400 text-xs py-8 text-center">No completed historical service records found.</p>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          COMPLETED
                        </span>
                        <span className="text-xs font-mono text-zinc-500">#{item.id}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs font-semibold text-white">{item.vehicleName}</span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-zinc-100">{item.serviceType}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {item.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-zinc-500" />
                          {item.location}
                        </span>
                        <span className="text-zinc-400">
                          Paid via <span className="text-zinc-200 font-medium">{item.paidWith}</span>
                        </span>
                      </div>
                      {item.technicianNotes && (
                        <p className="text-xs text-zinc-400 italic pt-1 border-t border-zinc-800/50 mt-1">
                          "{item.technicianNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-zinc-500 block font-mono">TOTAL INVOICE</span>
                        <span className="font-heading font-black text-lg text-emerald-400">
                          ${item.totalCostUsd.toLocaleString()} USD
                        </span>
                      </div>
                      <button
                        onClick={() => setShowInvoiceModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        <span>Work Order</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Summary of Transactions & Vault */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Executive Summary Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">TOTAL INFLOW / DEPOSITS</span>
              <div className="font-heading font-black text-2xl text-emerald-400 flex items-center gap-1">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>${totalDepositsUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">Verified on-chain via XRP, USDT, BTC, BNB</span>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">SERVICES & HARDWARE</span>
              <div className="font-heading font-black text-2xl text-zinc-200 flex items-center gap-1">
                <ArrowUpRight className="w-5 h-5 text-zinc-400" />
                <span>${totalServicesUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">Maintenance, custom wraps & rental bookings</span>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">REFERRALS & PROMO REWARDS</span>
              <div className="font-heading font-black text-2xl text-yellow-400 flex items-center gap-1">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>${totalRewardsUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">Invite credits, spins & scratch card payouts</span>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-red-500/30 bg-gradient-to-br from-red-950/20 to-zinc-950 space-y-1 shadow-lg">
              <span className="text-[10px] text-zinc-300 font-mono uppercase tracking-wider">NET VAULT ASSETS</span>
              <div className="font-heading font-black text-2xl text-white">
                ${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-400 block font-mono">100% Cold Storage Backed</span>
            </div>
          </div>

          {/* Balances Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Apex USD Vault', symbol: 'USD', val: balances.usd.toFixed(2), isFiat: true },
              { label: 'Tether USD', symbol: 'USDT', val: balances.usdt.toFixed(2) },
              { label: 'Bitcoin', symbol: 'BTC', val: balances.btc.toFixed(4) },
              { label: 'Ripple XRP', symbol: 'XRP', val: balances.xrp.toFixed(2) },
              { label: 'BNB Chain', symbol: 'BNB', val: balances.bnb.toFixed(3) },
            ].map((coin) => (
              <div
                key={coin.symbol}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span className="font-bold text-white">{coin.symbol}</span>
                  <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded">
                    {coin.isFiat ? 'FIAT' : 'ON-CHAIN'}
                  </span>
                </div>
                <div className="font-heading font-black text-xl text-white">
                  {coin.val}
                </div>
                <span className="text-[10px] text-zinc-500 block truncate">{coin.label}</span>
              </div>
            ))}
          </div>

          {/* Deposit & Withdraw Trigger Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-lg text-white">Vault Fundings & Payouts</h4>
              <p className="text-xs text-zinc-400">Instant funding via XRP, USDT, BNB, BTC, or request secure payout to your external wallet.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenDeposit}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/50 flex items-center gap-2 shrink-0 transition cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Launch Deposit Gateway</span>
              </button>
              {onOpenWithdraw && (
                <button
                  onClick={onOpenWithdraw}
                  className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-heading font-bold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-red-400" />
                  <span>Withdraw Payout</span>
                </button>
              )}
            </div>
          </div>


          {/* Summary of Transactions Ledger Table with Filtering */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-heading font-bold text-lg text-white">Summary of Transactions</h4>
                <p className="text-xs text-zinc-400">Real-time audit log of all account deposits, service bills, and earnings</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deposit', label: 'Deposits' },
                  { id: 'service_payment', label: 'Services' },
                  { id: 'referral_credit', label: 'Referrals' },
                  { id: 'promotion_win', label: 'Promo Wins' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTxFilter(f.id as typeof txFilter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      txFilter === f.id
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {filteredTransactions.length === 0 ? (
                <p className="text-zinc-500 text-xs py-8 text-center">No transactions match the selected filter.</p>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' || tx.type === 'referral_credit'
                            ? 'bg-emerald-600/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' || tx.type === 'referral_credit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate max-w-sm sm:max-w-md">{tx.description}</p>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {tx.timestamp} • TX: {tx.txHash} • Currency: {tx.currency}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-sm ${
                          tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' || tx.type === 'referral_credit'
                            ? 'text-emerald-400'
                            : 'text-zinc-200'
                        }`}
                      >
                        {tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' || tx.type === 'referral_credit' ? '+' : '-'}
                        ${tx.usdEquivalent.toLocaleString()} USD
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono block capitalize">{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: KYC Verification & Identity Compliance */}
      {activeTab === 'kyc' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-red-500" />
                <h3 className="font-heading font-black text-2xl text-white">
                  KYC Identity Verification & Limit Status
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Institutional KYC standards for anti-money laundering compliance, high-value crypto withdrawals, and loan-to-value vehicle investments.
              </p>
            </div>

            <div className="shrink-0">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                  kycStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : kycStatus === 'in_review'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  kycStatus === 'verified' ? 'bg-emerald-400' : kycStatus === 'in_review' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'
                }`} />
                <span>
                  {kycStatus === 'verified' ? 'TIER 2 VERIFIED (UNLIMITED)' : kycStatus === 'in_review' ? 'IN REVIEW BY COMPLIANCE' : 'UNVERIFIED (TIER 0)'}
                </span>
              </span>
            </div>
          </div>

          {/* Status Banners */}
          {kycStatus === 'verified' && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/40 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base text-white">Identity Verified & Cryptographically Certified</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Your government identification and proof of address have been approved. All withdrawal throttles have been unlocked.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">DAILY WITHDRAWAL LIMIT</span>
                  <span className="text-emerald-400 font-bold">$250,000 USD / Day</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">VERIFIED ID TYPE</span>
                  <span className="text-white font-bold capitalize">{displayUser.kycData?.idType?.replace('_', ' ') || 'Government Passport'}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">CERTIFIED ON</span>
                  <span className="text-white font-bold">{displayUser.kycData?.verifiedAt || 'Active'}</span>
                </div>
              </div>
            </div>
          )}

          {kycStatus === 'in_review' && (
            <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-heading font-bold text-sm text-white">Verification Documents Under Compliance Review</h4>
                <p className="text-zinc-300 leading-relaxed">
                  Our compliance desk is currently reviewing your submitted {displayUser.kycData?.idType || 'government ID'}. Typical processing window is 15 to 45 minutes during operational hours.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 pt-1">
                  Submitted: {displayUser.kycData?.submittedAt || 'Today'} • Tracking ID: KYC-TSLA-{displayUser.id.slice(-4)}
                </div>
              </div>
            </div>
          )}

          {/* Submission / Resubmission Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-red-500" />
              <h4 className="font-heading font-bold text-base text-white">
                {kycStatus === 'verified' ? 'Registered KYC Verification Details' : 'Submit Identity Verification Form'}
              </h4>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Full Legal Name (as on ID)</label>
                  <input
                    type="text"
                    required
                    value={kycForm.legalName}
                    onChange={(e) => setKycForm({ ...kycForm, legalName: e.target.value })}
                    placeholder="e.g. Elon Reeve Musk"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={kycForm.dob}
                    onChange={(e) => setKycForm({ ...kycForm, dob: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Nationality / Citizenship</label>
                  <input
                    type="text"
                    required
                    value={kycForm.nationality}
                    onChange={(e) => setKycForm({ ...kycForm, nationality: e.target.value })}
                    placeholder="e.g. United States, Germany, Japan"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Government ID Document Type</label>
                  <select
                    value={kycForm.idType}
                    onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value as UserKycData['idType'] })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="passport">Passport (International)</option>
                    <option value="drivers_license">Driver's License (State / Province)</option>
                    <option value="national_id">National ID Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">ID / Document Number</label>
                  <input
                    type="text"
                    required
                    value={kycForm.idNumber}
                    onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                    placeholder="e.g. 5Y89104192B"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Residential Street Address</label>
                  <input
                    type="text"
                    required
                    value={kycForm.residentialAddress}
                    onChange={(e) => setKycForm({ ...kycForm, residentialAddress: e.target.value })}
                    placeholder="Full street address, city, state, zip"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Document upload simulation dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-red-500/50 text-center space-y-2 transition cursor-pointer">
                  <Upload className="w-6 h-6 text-red-400 mx-auto" />
                  <span className="font-semibold text-white block">Front of Government ID</span>
                  <span className="text-[10px] text-zinc-400 block">Clear color scan or smartphone camera photo (PNG, JPG, PDF)</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">✓ Document Attached (Simulated)</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-red-500/50 text-center space-y-2 transition cursor-pointer">
                  <Upload className="w-6 h-6 text-red-400 mx-auto" />
                  <span className="font-semibold text-white block">Proof of Address / Utility Bill</span>
                  <span className="text-[10px] text-zinc-400 block">Bank statement or electric utility bill dated within 90 days</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">✓ Document Attached (Simulated)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmittingKyc ? 'Submitting to Compliance...' : kycStatus === 'verified' ? 'Update KYC Details' : 'Submit for Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 6: Security Measures & Session Management */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-8 shadow-2xl">
          <div>
            <h3 className="font-heading font-black text-2xl text-white">Security & Session Management</h3>
            <p className="text-xs text-zinc-400">Institutional grade security, scrypt password hashing, session revocation, and 2FA</p>
          </div>

          {/* Active Session & Device Controls */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Current Active Session</h4>
                  <p className="text-xs text-zinc-400">
                    Device: {displayUser.activeSession?.device || 'Browser Preview Session'} • IP: {displayUser.activeSession?.ip || '192.168.1.104'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isGuestView ? 'GUEST PREVIEW' : 'LIVE ACTIVE'}
                </span>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      showToast('Sign in to manage and terminate active sessions.', 'info');
                      onOpenAuth();
                    } else {
                      terminateOtherSessions();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Terminate Other Sessions
                </button>
              </div>
            </div>

            {/* Change Password with scrypt */}
            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">New Password (8+ chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {passwordStatus && (
                <div className="md:col-span-3 text-xs text-amber-400 font-mono">
                  {passwordStatus}
                </div>
              )}

              <div className="md:col-span-3 text-right pt-1">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPassword ? 'Encrypting & Updating...' : 'Update Password with scrypt'}
                </button>
              </div>
            </form>
          </div>

          {/* 2FA & PIN Protections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2FA Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-zinc-400 mt-1">Requires biometric or authenticator passkey for high-value service payouts and crypto withdrawals.</p>
                </div>
                <Smartphone className="w-6 h-6 text-red-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className={`text-xs font-bold ${displayUser.twoFactorEnabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  Status: {displayUser.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      showToast('Sign in to configure Two-Factor Authentication.', 'info');
                      onOpenAuth();
                    } else {
                      toggle2FA();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    displayUser.twoFactorEnabled
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {displayUser.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                </button>
              </div>
            </div>

            {/* PIN Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Transaction Security PIN</h4>
                  <p className="text-xs text-zinc-400 mt-1">4-digit PIN required prior to confirming crypto balance withdrawals or vehicle investment redemptions.</p>
                </div>
                <Lock className="w-6 h-6 text-yellow-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-zinc-300">
                  {displayUser.pinSet ? 'PIN Set (••••)' : 'No PIN Configured'}
                </span>
                <button
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  {displayUser.pinSet ? 'Update PIN' : 'Set Security PIN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Referrals & Invites */}
      {activeTab === 'referrals' && (
        <ReferralHub onOpenDeposit={onOpenDeposit} onOpenAuth={onOpenAuth} />
      )}

      {/* Tab: Tesla Stocks & Fast ROI Dashboard Display */}
      {activeTab === 'stocks' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header & Live NASDAQ TSLA Bar */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE NASDAQ TICKER
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">• NYSE / NASDAQ REGULATED</span>
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white flex items-center gap-2">
                  <span>TESLA, INC.</span>
                  <span className="font-mono text-emerald-400 font-extrabold text-xl">(TSLA)</span>
                </h3>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Trade spot Tesla shares directly or subscribe to institutional Fast-ROI yield plans backed by Autonomous Robotaxi fleet expansion and Gigafactory infrastructure.
                </p>
              </div>

              {/* Live Ticker Metrics Pill */}
              <div className="flex flex-wrap items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">SPOT PRICE</span>
                  <span className="font-heading font-black text-2xl text-white font-mono">
                    ${tslaQuote.price.toFixed(2)}
                  </span>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">24H CHANGE</span>
                  <span className={`font-mono font-bold text-sm flex items-center gap-0.5 ${
                    tslaQuote.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tslaQuote.change24h >= 0 ? '+' : ''}{tslaQuote.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
                <div className="hidden sm:block">
                  <span className="text-[10px] text-zinc-500 block font-mono">24H RANGE</span>
                  <span className="font-mono text-xs text-zinc-300">
                    ${tslaQuote.low24h.toFixed(1)} - ${tslaQuote.high24h.toFixed(1)}
                  </span>
                </div>
                <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
                <div className="hidden sm:block">
                  <span className="text-[10px] text-zinc-500 block font-mono">MARKET CAP</span>
                  <span className="font-mono text-xs text-zinc-300">{tslaQuote.marketCap}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Spot Holding & Portfolio Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Card */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-lg text-white">Your TSLA Spot Portfolio</h4>
                    <span className="text-xs text-zinc-400">Directly custody spot shares held in Apex Vault</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Updated: {userSpotHolding.lastUpdated}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Current Equity</span>
                  <span className="font-heading font-bold text-xl text-emerald-400 font-mono">
                    ${userSpotHolding.currentEquityUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Shares Owned</span>
                  <span className="font-heading font-bold text-xl text-white font-mono">
                    {userSpotHolding.shares.toFixed(4)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Avg Cost</span>
                  <span className="font-heading font-bold text-xl text-zinc-300 font-mono">
                    ${userSpotHolding.avgBuyPrice.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Unrealized P&L</span>
                  <span className={`font-heading font-bold text-xl font-mono ${
                    userSpotHolding.pnlUsd >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {userSpotHolding.pnlUsd >= 0 ? '+' : ''}${userSpotHolding.pnlUsd.toFixed(2)}
                    <span className="text-xs block font-normal">
                      ({userSpotHolding.pnlPercent >= 0 ? '+' : ''}{userSpotHolding.pnlPercent.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Spot Buy / Sell Quick Terminal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Spot Buy Box (Min $500) */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Buy TSLA Spot (Min $500)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Vault: ${balances.usd.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={500}
                      step={50}
                      value={spotBuyAmount}
                      onChange={(e) => setSpotBuyAmount(e.target.value)}
                      placeholder="Amount in USD (min 500)"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Est. Shares:</span>
                    <span className="text-emerald-400 font-bold">
                      {tslaQuote.price > 0 ? (Number(spotBuyAmount || 0) / tslaQuote.price).toFixed(4) : 0} TSLA
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const amt = Number(spotBuyAmount);
                      if (amt < 500) {
                        showToast('Minimum spot investment is $500.', 'error');
                        return;
                      }
                      if (balances.usd < amt) {
                        showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit first.`, 'error');
                        onOpenDeposit();
                        return;
                      }
                      const ok = buySpotStock(amt);
                      if (ok) {
                        setSpotBuyAmount('500');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    Execute Buy Spot
                  </button>
                </div>

                {/* Spot Sell Box */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                      Sell TSLA Spot Shares
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Available: {userSpotHolding.shares.toFixed(4)} TSLA
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0.01}
                      max={userSpotHolding.shares}
                      step={0.1}
                      value={spotSellShares}
                      onChange={(e) => setSpotSellShares(e.target.value)}
                      placeholder="Shares to liquidate"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white font-mono focus:border-red-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Est. Payout to Vault:</span>
                    <span className="text-white font-bold">
                      ${(Number(spotSellShares || 0) * tslaQuote.price).toFixed(2)} USD
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const sh = Number(spotSellShares);
                      if (sh <= 0 || sh > userSpotHolding.shares) {
                        showToast('Invalid shares amount to liquidate.', 'error');
                        return;
                      }
                      const ok = sellSpotStock(sh);
                      if (ok) {
                        setSpotSellShares('1');
                      }
                    }}
                    disabled={userSpotHolding.shares <= 0}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    Liquidate to USD
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions & Fast-ROI Highlights */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-lg text-white">Fast ROI Programs</h4>
                    <span className="text-xs text-zinc-400">Institutional Yield & Dividends</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-red-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-300 font-bold uppercase font-mono">Accelerated Yield</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[10px] font-bold">MIN $500</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Earn up to <strong className="text-emerald-400">54.0% APY</strong> with daily compounding dividend accrual directly into your Vault Balance.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                    <span>Minimum Entry:</span>
                    <span className="text-white font-mono font-bold">$500.00 USD</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                    <span>Dividend Frequency:</span>
                    <span className="text-emerald-400 font-mono font-bold">Daily Auto-Credit</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                    <span>Principal Return:</span>
                    <span className="text-white font-mono font-bold">100% on Maturity</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenDeposit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Deposit Crypto to Fund TSLA</span>
              </button>
            </div>
          </div>

          {/* Featured Stock Plans Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-xl text-white">Featured Fast-ROI Stock Plans</h4>
                <p className="text-xs text-zinc-400">Select an accelerated growth contract with direct dividend payouts (Minimum $500+)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStockPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 hover:border-emerald-500/50 transition shadow-xl relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                        {plan.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {plan.badge}
                      </span>
                    </div>

                    <h5 className="font-heading font-black text-lg text-white">
                      {plan.title}
                    </h5>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">EST. APY</span>
                        <span className="text-emerald-400 font-bold text-lg">{plan.apy}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">TERM</span>
                        <span className="text-white font-bold text-lg">{plan.durationDays} Days</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono text-zinc-400">
                      <div className="flex justify-between">
                        <span>Daily Yield:</span>
                        <span className="text-emerald-400 font-bold">~{plan.dailyYieldPercent}% / day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Investment:</span>
                        <span className="text-white font-bold">${plan.minInvestmentUsd.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlanForInvest(plan);
                      setInvestPlanAmount(String(plan.minInvestmentUsd || 500));
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Subscribe • Fast ROI</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Subscribing to Featured Fast-ROI Stock Plan */}
      {selectedPlanForInvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 text-zinc-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-xl text-white">Subscribe Fast ROI</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForInvest(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-white text-sm">{selectedPlanForInvest.title}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedPlanForInvest.apy}% APY</span>
              </div>
              <p className="text-xs text-zinc-400">{selectedPlanForInvest.description}</p>
              <div className="flex justify-between text-xs text-zinc-400 font-mono pt-1">
                <span>Duration: <strong>{selectedPlanForInvest.durationDays} Days</strong></span>
                <span>Minimum: <strong>${selectedPlanForInvest.minInvestmentUsd}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">Investment Amount (USD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={selectedPlanForInvest.minInvestmentUsd || 500}
                  step={50}
                  value={investPlanAmount}
                  onChange={(e) => setInvestPlanAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-mono block">
                Vault Balance: <strong className="text-emerald-400">${balances.usd.toFixed(2)} USD</strong>
              </span>
            </div>

            {/* Return Calculator */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Estimated Total Dividends:</span>
                <span className="text-emerald-400 font-bold">
                  +${((Number(investPlanAmount || 0) * (selectedPlanForInvest.apy / 100) * (selectedPlanForInvest.durationDays / 365))).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Principal Returned at Maturity:</span>
                <span className="text-white font-bold">${Number(investPlanAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForInvest(null)}
                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const amt = Number(investPlanAmount);
                  if (amt < (selectedPlanForInvest.minInvestmentUsd || 500)) {
                    showToast(`Minimum investment for this plan is $${selectedPlanForInvest.minInvestmentUsd || 500}.`, 'error');
                    return;
                  }
                  if (balances.usd < amt) {
                    showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit crypto first.`, 'error');
                    onOpenDeposit();
                    return;
                  }
                  const ok = investInFeaturedStock(selectedPlanForInvest.id, amt);
                  if (ok) {
                    setSelectedPlanForInvest(null);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                Confirm Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Fleet Investments & ROI Dashboard Board */}
      {activeTab === 'investments' && (
        <UserInvestmentBoard
          onNavigateToStake={onNavigateToServices}
          onOpenDeposit={onOpenDeposit}
        />
      )}

      {/* Tab: Owner Notifications & Messages Hub */}
      {activeTab === 'notifications' && (
        <NotificationInbox
          onNavigateTab={(tab) => {
            if (tab === 'investment' || tab === 'investments') setActiveTab('investments');
            else if (tab === 'wallet') setActiveTab('wallet');
            else if (tab === 'services') onNavigateToServices();
          }}
          onOpenDeposit={onOpenDeposit}
        />
      )}

      {/* Avatar Selector / Editor Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 text-zinc-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                <h3 className="font-heading font-black text-xl text-white">Edit Profile Avatar</h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current / Preview Avatar */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <img
                src={selectedAvatarUrl}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-lg"
              />
              <div>
                <span className="text-xs font-bold text-white block">Active Avatar Preview</span>
                <span className="text-[10px] text-zinc-400">Select a preset below, upload a local photo, or enter an image URL.</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">Choose From Verified Tesla Presets</span>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer group ${
                        isSelected ? 'border-red-500 ring-2 ring-red-500/50' : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8px] font-mono text-zinc-200 truncate">{preset.name.split(' ')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Upload & URL Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  <span>Upload Photo from Device</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Or Paste Image URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarInput.startsWith('http')) {
                        setSelectedAvatarUrl(customAvatarInput);
                        setCustomAvatarInput('');
                        showToast('Custom URL applied to preview!', 'success');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSavingAvatar}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {isSavingAvatar ? 'Saving...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bio Details Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-500" />
                <h3 className="font-heading font-black text-xl text-white">Edit Profile & Bio Details</h3>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Bio Details & Enthusiast Notes</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share details about your Tesla models, driving habits, or customization projects..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Preferred Tesla Service Center</label>
                <select
                  value={editCenter}
                  onChange={(e) => setEditCenter(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="Apex Fremont Technology Center">Apex Fremont Technology Center (CA)</option>
                  <option value="Apex Austin Gigafactory Hub">Apex Austin Gigafactory Hub (TX)</option>
                  <option value="Apex Nevada Battery Operations">Apex Nevada Battery Operations (NV)</option>
                  <option value="Apex Berlin Super-Hub Europe">Apex Berlin Super-Hub (Europe)</option>
                  <option value="Apex Mobile Ranger Dispatch">Apex Mobile Ranger (Doorstep Service)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer transition shadow-md"
                >
                  Save Bio & Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice / Work Order Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="font-heading font-black text-xl text-white">Official Service Work Order</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">INVOICE ID:</span>
                  <span className="text-white font-bold">{showInvoiceModal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">VEHICLE:</span>
                  <span className="text-white">{showInvoiceModal.vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">SERVICE:</span>
                  <span className="text-red-400 font-bold">{showInvoiceModal.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">SERVICE FACILITY:</span>
                  <span className="text-zinc-300">{showInvoiceModal.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">DATE COMPLETED:</span>
                  <span className="text-zinc-300">{showInvoiceModal.scheduledDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">PAYMENT METHOD:</span>
                  <span className="text-zinc-300">{showInvoiceModal.paidWith}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm">
                  <span className="text-zinc-300 font-bold">TOTAL BILLED:</span>
                  <span className="text-emerald-400 font-black">${showInvoiceModal.totalCostUsd.toLocaleString()} USD</span>
                </div>
              </div>

              {showInvoiceModal.technicianNotes && (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold mb-1">
                    Certified Technician Field Report
                  </span>
                  <p>{showInvoiceModal.technicianNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Official PDF Invoice downloaded to client storage.', 'success');
                  setShowInvoiceModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Download Sealed PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100">
            <h3 className="font-heading font-bold text-lg text-white">Add Tesla Vehicle to Garage</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Tesla Model</label>
                <select
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value as TeslaVehicle['model'] })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Model S">Model S</option>
                  <option value="Model 3">Model 3</option>
                  <option value="Model X">Model X</option>
                  <option value="Model Y">Model Y</option>
                  <option value="Cybertruck">Cybertruck</option>
                  <option value="Roadster">Roadster</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Trim / Specification</label>
                <input
                  type="text"
                  required
                  value={newVehicle.trim}
                  onChange={(e) => setNewVehicle({ ...newVehicle, trim: e.target.value })}
                  placeholder="e.g. Plaid Tri-Motor"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Year</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100">
            <h3 className="font-heading font-bold text-lg text-white">Set 4-Digit Security PIN</h3>
            <p className="text-xs text-zinc-400">Used to authorize cryptocurrency withdrawals and high-value orders.</p>
            <form onSubmit={handleSavePin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                required
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-center text-2xl font-mono tracking-widest text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
