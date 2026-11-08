import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Bot,
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  FileText,
  Upload,
  Server,
  Sparkles,
  Key,
  Globe,
  Settings,
  DollarSign,
  X,
  BadgeCheck,
  Check,
  Ban,
  Clock,
  Layers,
  Flame,
  ChevronDown,
  XCircle,
  AlertCircle,
  HelpCircle,
  Info,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { SmtpConfig, EmailTemplate, User, CryptoCurrency, TestEmailResult } from '../types';

const PREBUILT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-wrap-promo',
    name: '3M Stealth Wrap & Ceramic PPF Sale',
    category: 'Vehicle Customization',
    subject: '⚡ Transform Your Cybertruck: 20% Off Ceramic PPF & Satin Stealth Wraps',
    previewText: 'Exclusive bay booking discount for Tesla owners this month.',
    content: `Dear Tesla Owner,

Elevate your vehicle aesthetics and road protection with Apex Tesla Hub's certified custom wrap bay. For the next 7 days, receive 20% off full body 3M 2080 Satin Stealth Black and Avery Dennison Supreme PPF wraps.

Highlights:
• 10-Year Manufacturer Ceramic Warranty
• Certified Clean-Room Bay Application
• Complete Door Jamb & Edge Tucking
• Pay seamlessly via USDT, BTC, XRP, or USD Vault

Book your appointment today directly in your owner dashboard.

Best regards,
The Apex Tesla Custom Studio Team`,
  },
  {
    id: 'tmpl-plaid-track',
    name: 'Model S Plaid Track Mode Telematics',
    category: 'Performance & Service',
    subject: '🏁 Plaid Member Exclusive: Track Mode Inspection & Brake Flush Bay Slots',
    previewText: 'Prep your Tri-Motor beast for track day precision.',
    content: `Attention Performance Drivers,

High-speed track demands peak thermal and braking efficiency. Apex Tesla Hub has opened priority bay slots for high-voltage diagnostics, DOT 5.1 synthetic brake fluid flushes, and camber alignment.

Our master technicians specialize in 1,020 HP Plaid dynamics and Laguna Seca race telemetry.

Reserve your diagnostic bay slot now via your personalized dashboard.

Apex Engineering Division`,
  },
  {
    id: 'tmpl-spin-scratch',
    name: '$8,000 Scratch Jackpots & Spin Promotion',
    category: 'Giveaways & Vault',
    subject: '🎁 High Roller Scratch Cards Active: Win up to $8,000 Max Payout!',
    previewText: 'Try your luck on verified cryptographic scratch foils.',
    content: `Hello Driver,

The Apex Promotions Hub has loaded new provably fair scratch cards valued from $50 minimum up to $8,000 max payout. 

Available Tiers:
• Cyber Starter Foil ($50)
• Satin Silver Plaid ($250)
• Giga Gold Plaid VIP ($1,000)
• Founders Roadster Apex Grand ($8,000)

Log in to your dashboard to inspect live winning history and provably fair outcomes.

Apex Concierge Desk`,
  },
  {
    id: 'tmpl-referral-bonus',
    name: '$100 Referral Invite Boost',
    category: 'Referrals & Growth',
    subject: '🚀 Earn $100 Platform Credit for Every Tesla Driver You Invite',
    previewText: 'Share your unique invite link and stack vault credits.',
    content: `Greetings Apex Member,

Your unique referral code is active! When a fellow Tesla enthusiast signs up using your link and completes their first crypto or USD deposit, you immediately receive:

• +$100.00 USD Platform Credit directly in your vault
• Priority VIP bay scheduling

Share your referral link on Twitter, Threads, Facebook, or WhatsApp directly from your dashboard!

Apex Growth Operations`,
  },
  {
    id: 'tmpl-robotaxi-yield',
    name: 'Robotaxi Fleet Yield Dividend Alert',
    category: 'Investments',
    subject: '💎 Staking Dividend Alert: Autonomous Fleet Pool APY Updated to 18.4%',
    previewText: 'Daily automated dividend distributions are now active.',
    content: `Valued Investor,

The Autonomous Robotaxi Staking Pool on Apex Tesla Hub has completed its daily dividend cycle. Backed by real fleet vehicle revenue in Austin and Fremont, stakers are yielding up to 18.4% APY paid in USDT and USD.

Audit proof-of-reserves anytime in the Fleet Yield tab.

Apex Capital Management`,
  },
  {
    id: 'tmpl-winter-prep',
    name: 'Winter Battery & Range Optimization',
    category: 'Maintenance',
    subject: '❄️ Tesla Winter Range Check: Pre-Conditioning & HEPA Filter Service',
    previewText: 'Keep your battery state-of-health at 99%+ this season.',
    content: `Dear Owner,

Cold weather impacts lithium-ion battery resistance and cabin thermal efficiency. Book our 40-Point Winter Readiness Inspection including:

• High-voltage cell balance telemetry scan
• 12V / 16V auxiliary battery conductance test
• Bioweapon Defense Mode HEPA filter replacement
• Mobile Ranger doorstep service available

Stay optimal all season long with Apex Tesla Hub.`,
  },
];

type AdminTab = 'users_kyc' | 'email_marketing' | 'site_editor' | 'fleet_ops';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    balances,
    serviceBookings,
    allUsers,
    adminUpdateKyc,
    updateUserBalance,
    smtpConfig,
    updateSmtpConfig,
    importedEmails,
    importEmailList,
    emailCampaigns,
    sendTestEmail,
    sendMarketingCampaign,
    showToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('users_kyc');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Service bookings state
  const [localBookings, setLocalBookings] = useState(serviceBookings);

  // Gemini Operations Copilot state
  const [adminPrompt, setAdminPrompt] = useState('');
  const [adminCopilotResponse, setAdminCopilotResponse] = useState<string | null>(null);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  // SMTP Settings state
  const [localSmtp, setLocalSmtp] = useState<SmtpConfig>(smtpConfig);
  const [testEmailRecipient, setTestEmailRecipient] = useState(currentUser?.email || 'admin@apex-tesla.io');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailScenario, setTestEmailScenario] = useState<string>('normal');
  const [lastTestEmailResult, setLastTestEmailResult] = useState<TestEmailResult | null>(null);
  const [smtpServerLog, setSmtpServerLog] = useState<string | null>(null);

  // Email Marketing Campaign state
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(PREBUILT_TEMPLATES[0]);
  const [campaignTitle, setCampaignTitle] = useState(PREBUILT_TEMPLATES[0].name);
  const [campaignSubject, setCampaignSubject] = useState(PREBUILT_TEMPLATES[0].subject);
  const [campaignContent, setCampaignContent] = useState(PREBUILT_TEMPLATES[0].content);
  const [campaignAudience, setCampaignAudience] = useState<'all_users' | 'plaid_members' | 'custom_list' | 'external_leads'>('all_users');
  const [isDispatchingCampaign, setIsDispatchingCampaign] = useState(false);

  // AI Marketing Manager state
  const [aiMarketingPrompt, setAiMarketingPrompt] = useState('Write an exciting promotional email announcing 20% off Cybertruck Satin Stealth wraps for crypto depositors.');
  const [aiMarketingTone, setAiMarketingTone] = useState('Luxury & High-Octane');
  const [isGeneratingAiCopy, setIsGeneratingAiCopy] = useState(false);
  const [aiMarketingResult, setAiMarketingResult] = useState<{ subject: string; previewText: string; body: string } | null>(null);

  // Email List Import state
  const [rawEmailsInput, setRawEmailsInput] = useState('');

  // User Profile & KYC modal state
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<User | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState('Photo ID blur on document number edge. Please provide higher resolution color scan.');
  const [showBalanceAdjustModal, setShowBalanceAdjustModal] = useState<User | null>(null);
  const [adjustCurrency, setAdjustCurrency] = useState<CryptoCurrency | 'USD'>('USD');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);

  // Site Function Editor state
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Apex Tesla Hub',
    heroHeadline: 'NEXT-GENERATION TESLA SERVICE, WRAPS & INVESTMENT FLEET',
    heroSubtitle: 'Complete digital garage, certified high-voltage repairs, custom 3M wraps, and crypto payment processing.',
    spinCostUsd: 25,
    maxScratchPrizeUsd: 8000,
    hourlyBayRateUsd: 185,
    announcementBanner: '⚡ Flash Promotion: Zero deposit fees across BTC, USDT, XRP & BNB network gateways.',
    maintenanceMode: false,
    enableCryptoDeposits: true,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ADMIN_CATEGORIES = [
    {
      id: 'users_kyc' as const,
      label: 'All Users & KYC Management',
      shortLabel: 'Users & KYC',
      description: 'Audit user profiles, KYC verification compliance & crypto balances',
      icon: Users,
      badge: `${allUsers.length} Profiles`,
    },
    {
      id: 'email_marketing' as const,
      label: 'Email Marketing & SMTP Mailer',
      shortLabel: 'Email & SMTP',
      description: 'Configure SMTP relays, test delivery with diagnostics & send campaigns',
      icon: Mail,
      badge: 'PHP/SMTP',
    },
    {
      id: 'site_editor' as const,
      label: 'Site Pages & Functions Editor',
      shortLabel: 'Site Editor',
      description: 'Configure pricing rules, promotion restrictions & headlines',
      icon: Sliders,
      badge: 'Parameters',
    },
    {
      id: 'fleet_ops' as const,
      label: 'Fleet Bays & Gemini Ops AI',
      shortLabel: 'Fleet & Ops AI',
      description: 'Service bay tickets, Mobile Ranger dispatch & AI intelligence copilot',
      icon: Bot,
      badge: 'Live Telematics',
    },
  ];

  const currentCategory = ADMIN_CATEGORIES.find((cat) => cat.id === activeAdminTab) || ADMIN_CATEGORIES[0];
  const ActiveCategoryIcon = currentCategory.icon;

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b))
    );
    showToast(`Service #${id} status updated to ${newStatus}. Client notified.`);
  };

  const handleAskAdminCopilot = async (queryText?: string) => {
    const promptToSend = queryText || adminPrompt;
    if (!promptToSend) return;

    setIsLoadingCopilot(true);
    setAdminCopilotResponse(null);

    try {
      const res = await fetch('/api/gemini/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          adminStats: {
            activeServiceBookings: localBookings.length,
            totalVaultUSD: balances.usd,
            totalVaultUSDT: balances.usdt,
            totalVaultBTC: balances.btc,
            totalVaultXRP: balances.xrp,
            totalVaultBNB: balances.bnb,
            bayCapacity: '18 Bays (92% load)',
            registeredUsers: allUsers.length,
            emailLeadsCount: importedEmails.length,
          },
        }),
      });

      const data = await res.json();
      setAdminCopilotResponse(data.text || 'Operational metrics analyzed.');
    } catch {
      setAdminCopilotResponse(
        '**Fleet Operations Analysis:**\n- All 18 bays running optimal schedule.\n- Mobile Ranger Van #12 en route to Austin service quadrant.\n- Recommending 15% increase in 3M 2080 vinyl roll buffer stock.\n- 0 KYC backlog tickets detected.'
      );
    } finally {
      setIsLoadingCopilot(false);
      setAdminPrompt('');
    }
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmtpConfig(localSmtp);
    showToast('SMTP Mailer credentials and host settings saved!', 'success');
  };

  const handleSendTestMail = async (forcedScenario?: string) => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showToast('Please enter a valid recipient email for the test dispatch.', 'error');
      return;
    }
    setIsSendingTestEmail(true);
    const scenario = forcedScenario || (testEmailScenario !== 'normal' ? testEmailScenario : undefined);
    const result = await sendTestEmail(testEmailRecipient, scenario);
    setIsSendingTestEmail(false);
    setLastTestEmailResult(result);
    if (result.smtpLog) {
      setSmtpServerLog(result.smtpLog);
    }
  };

  const handleSelectTemplate = (tmpl: EmailTemplate) => {
    setSelectedTemplate(tmpl);
    setCampaignTitle(tmpl.name);
    setCampaignSubject(tmpl.subject);
    setCampaignContent(tmpl.content);
    showToast(`Template "${tmpl.name}" loaded into editor!`, 'info');
  };

  const handleImportEmailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const splitEmails = rawEmailsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 3 && e.includes('@'));

    if (splitEmails.length === 0) {
      showToast('No valid email formats found in input.', 'error');
      return;
    }

    const added = importEmailList(splitEmails);
    setRawEmailsInput('');
    showToast(`Successfully added ${added} unique verified email leads to database!`, 'success');
  };

  const handleGenerateAiCopy = async () => {
    setIsGeneratingAiCopy(true);
    try {
      const res = await fetch('/api/gemini/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType: 'Tesla Promotion',
          targetAudience: campaignAudience,
          customPrompt: aiMarketingPrompt,
          tone: aiMarketingTone,
        }),
      });

      const data = await res.json();
      if (data.subject && data.body) {
        setAiMarketingResult({
          subject: data.subject,
          previewText: data.previewText || '',
          body: data.body,
        });
      } else {
        setAiMarketingResult({
          subject: '⚡ Exclusive Cybertruck PPF & Satin Wrap Allocation',
          previewText: 'Save 20% on full-body custom Tesla transformations.',
          body: `Dear Tesla Driver,\n\nReady to transform your vehicle with military-grade 3M Satin Stealth and self-healing ceramic PPF? Apex Tesla Hub has opened 10 exclusive bay slots this week.\n\nEnjoy zero fees when checking out with USDT, Bitcoin, or XRP directly from your dashboard.\n\nLock in your reservation today before slots fill up.\n\nApex Tesla Concierge Desk`,
        });
      }
    } catch {
      setAiMarketingResult({
        subject: '⚡ Exclusive Cybertruck PPF & Satin Wrap Allocation',
        previewText: 'Save 20% on full-body custom Tesla transformations.',
        body: `Dear Tesla Driver,\n\nReady to transform your vehicle with military-grade 3M Satin Stealth and self-healing ceramic PPF? Apex Tesla Hub has opened 10 exclusive bay slots this week.\n\nEnjoy zero fees when checking out with USDT, Bitcoin, or XRP directly from your dashboard.\n\nLock in your reservation today before slots fill up.\n\nApex Tesla Concierge Desk`,
      });
    } finally {
      setIsGeneratingAiCopy(false);
    }
  };

  const handleApplyAiCopy = () => {
    if (!aiMarketingResult) return;
    setCampaignSubject(aiMarketingResult.subject);
    setCampaignContent(aiMarketingResult.body);
    showToast('AI copy applied to Campaign Dispatcher!', 'success');
  };

  const handleDispatchCampaign = async () => {
    setIsDispatchingCampaign(true);
    const res = await sendMarketingCampaign({
      title: campaignTitle,
      subject: campaignSubject,
      templateId: selectedTemplate.id,
      targetAudience: campaignAudience,
    });
    setIsDispatchingCampaign(false);
    if (res.success) {
      showToast(res.message, 'success');
    }
  };

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('apex_site_settings', JSON.stringify(siteSettings));
    showToast('Site functions and live parameters updated globally!', 'success');
  };

  return (
    <div className="py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full overflow-hidden">
      {/* Top Admin Header - Responsive across all screen resolutions */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-black text-lg sm:text-2xl text-white truncate">
                EXECUTIVE OPERATIONS SUITE
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono uppercase font-bold shrink-0">
                Super-Admin
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              All Users & KYC • SMTP Relay & Test Diagnostics • Site Editor • Gemini AI Copilot
            </p>
          </div>
        </div>

        {/* Live Metrics Quick View - Wrap friendly for mobile */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono">
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {allUsers.length} Users
          </span>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400">
            {importedEmails.length} Email Leads
          </span>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400">
            {localSmtp.host}:{localSmtp.port}
          </span>
        </div>
      </div>

      {/* Admin Module Category Dropdown & Navigation Section */}
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Custom Cyber Dropdown Selector */}
          <div className="relative w-full md:w-96" ref={categoryDropdownRef}>
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Admin Category Selector</span>
              </span>
              <span className="text-amber-400 font-bold">Select Dropdown</span>
            </label>

            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 text-white font-medium text-xs transition cursor-pointer shadow-sm group"
              aria-haspopup="listbox"
              aria-expanded={isCategoryDropdownOpen}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <ActiveCategoryIcon className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <span className="font-heading font-bold text-sm text-white block truncate">
                    {currentCategory.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {currentCategory.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentCategory.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 hidden sm:inline-block">
                    {currentCategory.badge}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-transform duration-200 ${
                    isCategoryDropdownOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu Popover */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
                {ADMIN_CATEGORIES.map((cat) => {
                  const isSelected = activeAdminTab === cat.id;
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveAdminTab(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black font-bold shadow-md'
                          : 'hover:bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CatIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                        <div className="truncate">
                          <span className="font-heading font-bold text-xs block truncate">{cat.label}</span>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
                            {cat.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cat.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {cat.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick tab pills - responsive for medium and wide screens */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            {ADMIN_CATEGORIES.map((tab) => {
              const active = activeAdminTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.shortLabel}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold hidden sm:inline-block ${
                      active ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: ALL USERS PROFILE & KYC MANAGEMENT */}
      {activeAdminTab === 'users_kyc' && (
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white">Registered Users & KYC Compliance Dossier</h3>
              <p className="text-xs text-zinc-400">Audit user profiles, adjust cryptocurrency balances, review documents, and approve or reject KYC verification tiers.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400">
                Verified: {allUsers.filter((u) => u.kycStatus === 'verified').length}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400">
                In Review: {allUsers.filter((u) => u.kycStatus === 'in_review').length}
              </span>
            </div>
          </div>

          {/* Desktop Table View (≥1024px) */}
          <div className="hidden lg:block rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role & Tier</th>
                    <th className="p-4">KYC Compliance</th>
                    <th className="p-4">Referrals & Code</th>
                    <th className="p-4">Vault Balances</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-900/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-red-500/30"
                          />
                          <div>
                            <span className="font-semibold text-white block text-sm">{u.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{u.email}</span>
                            <span className="text-[10px] text-zinc-500 block">{u.location || 'United States'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold block w-fit mb-1 ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-red-400 font-bold block">{u.tier}</span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                          u.kycStatus === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : u.kycStatus === 'in_review'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : u.kycStatus === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          <BadgeCheck className="w-3 h-3" />
                          <span>{u.kycStatus?.toUpperCase() || 'UNVERIFIED'}</span>
                        </span>
                        {u.kycData && (
                          <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                            ID: {u.kycData.idType} ({u.kycData.idNumber})
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <span className="text-zinc-200 font-bold">{u.referralCode}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          Invited: {u.referralCount || 0} • Earned: ${u.referralEarningsUsd || 0}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <span className="text-emerald-400 font-bold block">${balances.usd.toFixed(2)} USD</span>
                        <span className="text-[10px] text-zinc-400">
                          {balances.btc} BTC • {balances.usdt} USDT • {balances.xrp} XRP
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserForKyc(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => adminUpdateKyc(u.id, 'verified')}
                            title="Approve KYC"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => adminUpdateKyc(u.id, 'rejected', kycRejectionReason)}
                            title="Reject KYC"
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowBalanceAdjustModal(u)}
                            title="Adjust Balance"
                            className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card Layout (<1024px) for perfect responsive fit */}
          <div className="lg:hidden space-y-3">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-11 h-11 rounded-xl object-cover border border-red-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-white block text-sm truncate">{u.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono block truncate">{u.email}</span>
                      <span className="text-[10px] text-zinc-500">{u.tier} • {u.location || 'USA'}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">KYC STATUS</span>
                    <span className={`font-bold uppercase ${
                      u.kycStatus === 'verified' ? 'text-emerald-400' : u.kycStatus === 'in_review' ? 'text-amber-400' : 'text-zinc-400'
                    }`}>
                      {u.kycStatus || 'UNVERIFIED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">VAULT (USD)</span>
                    <span className="text-white font-bold">${balances.usd.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">REFERRAL CODE</span>
                    <span className="text-zinc-300 font-bold">{u.referralCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">INVITED USERS</span>
                    <span className="text-zinc-300">{u.referralCount || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setSelectedUserForKyc(u)}
                    className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer text-center"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => adminUpdateKyc(u.id, 'verified')}
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    title="Approve KYC"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => adminUpdateKyc(u.id, 'rejected', kycRejectionReason)}
                    className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-pointer"
                    title="Reject KYC"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowBalanceAdjustModal(u)}
                    className="p-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 cursor-pointer"
                    title="Adjust Balance"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL MARKETING SUITE & PHP/SMTP MAILER */}
      {activeAdminTab === 'email_marketing' && (
        <div className="space-y-6 sm:space-y-8 w-full">
          {/* Top Intro */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-heading font-black text-lg sm:text-xl">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                <span>Enterprise Email Marketing & SMTP Engine</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Connect external SMTP relays (Mailgun, SendGrid, Amazon SES, or custom PHP Mailer daemon). Run live test emails with deliverability verification, inspect exact failure reasons, import lead lists, and send campaigns.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 block">TOTAL AUDIENCE</span>
                <span className="text-white font-bold">{allUsers.length + importedEmails.length} Leads</span>
              </span>
            </div>
          </div>

          {/* 2-Column: SMTP Config & Live Test Sender vs External List Importer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Left: SMTP Configuration & Test Dispatcher (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  <h4 className="font-heading font-bold text-sm sm:text-base text-white">SMTP Mailer Configuration (PHP / NodeMailer)</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  READY
                </span>
              </div>

              <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 block mb-1 font-medium">SMTP Server Host</label>
                    <input
                      type="text"
                      required
                      value={localSmtp.host}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, host: e.target.value })}
                      placeholder="e.g. smtp.mailgun.org or mail.apex-tesla.io"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Port</label>
                    <input
                      type="number"
                      required
                      value={localSmtp.port}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, port: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">SMTP Username / API User</label>
                    <input
                      type="text"
                      required
                      value={localSmtp.username}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, username: e.target.value })}
                      placeholder="postmaster@mg.apex-tesla.io"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">SMTP Password / API Key</label>
                    <input
                      type="password"
                      value={localSmtp.password || ''}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, password: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">From Sender Name</label>
                    <input
                      type="text"
                      required
                      value={localSmtp.fromName}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, fromName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">From Email Address</label>
                    <input
                      type="email"
                      required
                      value={localSmtp.fromEmail}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, fromEmail: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Reply-To Email</label>
                    <input
                      type="email"
                      value={localSmtp.replyTo || ''}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, replyTo: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                    <input
                      type="checkbox"
                      checked={localSmtp.secure}
                      onChange={(e) => setLocalSmtp({ ...localSmtp, secure: e.target.checked })}
                      className="rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-red-500"
                    />
                    <span>Enable SSL/TLS (Port 465)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition cursor-pointer shadow-md"
                  >
                    Save SMTP Credentials
                  </button>
                </div>
              </form>

              {/* Enhanced Test Email Dispatcher & Delivery Diagnostic Reporting Section */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 pt-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white uppercase block">
                      Send Test Verification Email
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Tests live SMTP handshake and alerts you with delivery confirmation or reasons for failure
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 shrink-0">
                    DIAGNOSTICS ACTIVE
                  </span>
                </div>

                {/* Recipient Input and Scenario Picker */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="recipient@domain.com (e.g. your-email@tesla-club.io)"
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-red-500"
                    />

                    <select
                      value={testEmailScenario}
                      onChange={(e) => setTestEmailScenario(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-red-500 shrink-0"
                      title="Select diagnostic test scenario"
                    >
                      <option value="normal">Standard Dispatch (250 OK Delivered)</option>
                      <option value="auth_failed">Simulate 535 Auth Failure</option>
                      <option value="host_unreachable">Simulate ENOTFOUND (Host DNS Error)</option>
                      <option value="mailbox_unavailable">Simulate 550 Mailbox Unavailable</option>
                      <option value="timeout">Simulate ETIMEDOUT (Connection Timeout)</option>
                    </select>

                    <button
                      onClick={() => handleSendTestMail()}
                      disabled={isSendingTestEmail}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0 shadow-md"
                    >
                      {isSendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isSendingTestEmail ? 'Sending...' : 'Dispatch Test'}</span>
                    </button>
                  </div>

                  {/* Quick scenario buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <span className="text-zinc-500">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => handleSendTestMail('normal')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30"
                    >
                      Test Successful Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTestMail('auth_failed')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-rose-500/30"
                    >
                      Test 535 Auth Failure
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTestMail('mailbox_unavailable')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30"
                    >
                      Test 550 Bounced Mailbox
                    </button>
                  </div>
                </div>

                {/* TEST MAIL DELIVERY / FAILURE NOTIFICATION REPORT CARD */}
                {lastTestEmailResult && (
                  <div
                    className={`p-4 rounded-2xl border transition-all animate-in fade-in space-y-3 ${
                      lastTestEmailResult.delivered
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                        : 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {lastTestEmailResult.delivered ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 animate-pulse">
                            <XCircle className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span
                            className={`font-heading font-black text-sm block ${
                              lastTestEmailResult.delivered ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {lastTestEmailResult.delivered
                              ? 'TEST MAIL DELIVERED SUCCESSFULLY'
                              : 'TEST MAIL FAILED TO DELIVER'}
                          </span>
                          <span className="text-[11px] text-zinc-300 font-mono block">
                            Recipient: {lastTestEmailResult.recipient}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setLastTestEmailResult(null)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white"
                        title="Dismiss notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delivery Failure Reason Box */}
                    {!lastTestEmailResult.delivered && (
                      <div className="p-3 rounded-xl bg-black/70 border border-rose-500/30 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-rose-300 font-bold font-mono">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Failure Reason & Diagnostic Code:</span>
                        </div>
                        <div className="text-white font-mono bg-rose-950/40 p-2 rounded border border-rose-800 text-[11px]">
                          <strong>Code:</strong> {lastTestEmailResult.failureCode || 'SMTP_DELIVERY_ERR'}<br />
                          <strong>Reason:</strong> {lastTestEmailResult.failureReason}
                        </div>
                        {lastTestEmailResult.troubleshooting && (
                          <div className="text-[11px] text-zinc-300 leading-relaxed pt-1">
                            <strong className="text-amber-400">💡 Recommended Action: </strong>
                            {lastTestEmailResult.troubleshooting}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Success Metrics */}
                    {lastTestEmailResult.delivered && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-black/60 border border-emerald-500/20">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">STATUS CODE</span>
                          <span className="text-emerald-400 font-bold">250 OK Accepted</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">RELAY HOST</span>
                          <span className="text-white font-bold">{lastTestEmailResult.host}:{lastTestEmailResult.port}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-zinc-500 block">MESSAGE ID</span>
                          <span className="text-zinc-300 truncate block">{lastTestEmailResult.messageId || 'Generated'}</span>
                        </div>
                      </div>
                    )}

                    {/* Server Handshake Log */}
                    {lastTestEmailResult.smtpLog && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                          ESMTP Handshake Transaction Transcript:
                        </span>
                        <div className="p-2.5 rounded-xl bg-black border border-zinc-800 font-mono text-[10px] text-emerald-400 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                          {lastTestEmailResult.smtpLog}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: External Email List Importer (5 cols) */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-1 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  <h4 className="font-heading font-bold text-sm sm:text-base text-white">Import External Email Lead Lists</h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Import external marketing lead lists aside from the registered website users.
                </p>
              </div>

              <form onSubmit={handleImportEmailsSubmit} className="space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Paste Raw Emails (CSV, TXT, or line separated)</label>
                  <textarea
                    rows={6}
                    value={rawEmailsInput}
                    onChange={(e) => setRawEmailsInput(e.target.value)}
                    placeholder="elon.fan@tesla-club.org&#10;driver99@plaid-racing.io&#10;investor@austin-energy.com&#10;cybertruck.owner@overland.net"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Registered Website Accounts:</span>
                    <span className="font-bold text-white">{allUsers.length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>External Imported Leads:</span>
                    <span className="font-bold text-cyan-400">{importedEmails.length}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1 text-zinc-300 font-bold">
                    <span>Total Targetable Reach:</span>
                    <span className="text-emerald-400">{allUsers.length + importedEmails.length} verified emails</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Import Leads to Marketing Database
                </button>
              </form>
            </div>
          </div>

          {/* AI Marketing Copywriter & Selectable Templates */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-heading font-black text-base sm:text-lg text-white">
                    Select Pre-Built Templates or Generate with Gemini AI
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">Choose from battle-tested Tesla marketing layouts or have Gemini AI write tailored copy.</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PREBUILT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedTemplate.id === tmpl.id
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generator Box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-red-500/20 space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono uppercase">
                <Bot className="w-4 h-4" />
                <span>Gemini 3.8 Flash AI Marketing Copywriter</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8">
                  <input
                    type="text"
                    value={aiMarketingPrompt}
                    onChange={(e) => setAiMarketingPrompt(e.target.value)}
                    placeholder="e.g. Write an email announcing $8,000 scratch card giveaways with zero platform fees..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <select
                    value={aiMarketingTone}
                    onChange={(e) => setAiMarketingTone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Luxury & High-Octane">Luxury & High-Octane</option>
                    <option value="Urgent FOMO & Flash Sale">Urgent FOMO & Flash Sale</option>
                    <option value="Technical Engineering">Technical Engineering</option>
                    <option value="VIP Private Concierge">VIP Private Concierge</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleGenerateAiCopy}
                    disabled={isGeneratingAiCopy}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingAiCopy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Generate Copy</span>
                  </button>
                </div>
              </div>

              {aiMarketingResult && (
                <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-2 text-xs font-mono animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold">GENERATED CAMPAIGN DRAFT</span>
                    <button
                      onClick={handleApplyAiCopy}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Use in Dispatcher
                    </button>
                  </div>
                  <div className="text-white font-bold">Subject: {aiMarketingResult.subject}</div>
                  <div className="text-zinc-400 whitespace-pre-line text-[11px] leading-relaxed">
                    {aiMarketingResult.body}
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Dispatcher */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 text-xs font-medium">Campaign Internal Title</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 text-xs font-medium">Target Audience Group</label>
                  <select
                    value={campaignAudience}
                    onChange={(e) => setCampaignAudience(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all_users">All Registered Tesla Owners ({allUsers.length} accounts)</option>
                    <option value="plaid_members">Founders Club & Plaid Members Only</option>
                    <option value="external_leads">Imported External Leads List ({importedEmails.length} leads)</option>
                    <option value="custom_list">Combined Master Audience ({allUsers.length + importedEmails.length} leads)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 text-xs font-medium">Email Subject Line</label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 text-xs font-medium">Email Content & Body HTML</label>
                <textarea
                  rows={8}
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs text-zinc-500 font-mono">
                  Engine: NodeMailer / PHP Mailer Daemon • Deliverability: 99.4%
                </span>
                <button
                  onClick={handleDispatchCampaign}
                  disabled={isDispatchingCampaign}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isDispatchingCampaign ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Launch Email Marketing Campaign</span>
                </button>
              </div>
            </div>
          </div>

          {/* Past Campaigns Log */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="font-heading font-bold text-sm sm:text-base text-white">Recent Email Campaigns Performance</h4>
            <div className="divide-y divide-zinc-800">
              {emailCampaigns.map((camp) => (
                <div key={camp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{camp.title}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{camp.subject}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      Dispatched: {camp.sentAt} • Audience: {camp.targetAudience} ({camp.recipientsCount} recipients)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">OPEN RATE</span>
                      <span className="text-emerald-400 font-bold">{camp.openRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">CLICK RATE</span>
                      <span className="text-yellow-400 font-bold">{camp.clickRate}%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      DELIVERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SITE PAGES & FUNCTIONS EDITOR */}
      {activeAdminTab === 'site_editor' && (
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-xl w-full">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">Global Site Pages & Functions Editor</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Configure pricing rules, promotion restrictions, headline copies, and active service facilities.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSiteSettings} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Hero Section Main Headline</label>
                <input
                  type="text"
                  value={siteSettings.heroHeadline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Hero Subtitle Copy</label>
                <input
                  type="text"
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Wheel Spin Cost (USD)</label>
                <input
                  type="number"
                  value={siteSettings.spinCostUsd}
                  onChange={(e) => setSiteSettings({ ...siteSettings, spinCostUsd: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Strictly cost to spin only, no free spins</span>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Scratch Card Max Prize Cap (USD)</label>
                <input
                  type="number"
                  value={siteSettings.maxScratchPrizeUsd}
                  onChange={(e) => setSiteSettings({ ...siteSettings, maxScratchPrizeUsd: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Capped at $8,000 maximum</span>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Hourly Bay Labor Rate (USD)</label>
                <input
                  type="number"
                  value={siteSettings.hourlyBayRateUsd}
                  onChange={(e) => setSiteSettings({ ...siteSettings, hourlyBayRateUsd: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 block mb-1 font-medium">Homepage Live Flash Announcement Bar</label>
              <input
                type="text"
                value={siteSettings.announcementBanner}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcementBanner: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Save Global Site Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: FLEET BAYS & GEMINI OPS AI */}
      {activeAdminTab === 'fleet_ops' && (
        <div className="space-y-6 w-full">
          {/* Admin KPI Cards - Responsive grid for mobile through widescreen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-sm">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">24H Service Inflow</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-white">$48,250 USD</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs last week</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-sm">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">Active Repair Tickets</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-red-500">{localBookings.length} In Progress</div>
              <span className="text-[10px] text-zinc-400">4 Mobile Rangers Dispatched</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-sm">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">Crypto Hot Vault Liquidity</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-cyan-400">100% Backed</div>
              <span className="text-[10px] text-zinc-400">Instant withdrawals enabled</span>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-sm">
              <span className="text-[11px] text-zinc-400 font-mono uppercase">Promotional Prize Reserve</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-yellow-400">$350,000</div>
              <span className="text-[10px] text-zinc-400">Zero-win scratch cards configured</span>
            </div>
          </div>

          {/* Gemini AI Admin Copilot */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 sm:space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    Gemini AI Fleet & Operations Management Copilot
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ask Gemini for predictive fleet maintenance triage, crypto deposit reconciliation, and inventory restock advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Audit current service bay throughput and mobile ranger efficiency',
                'Check crypto liquidity reserves for upcoming prize scratch redemptions',
                'Suggest optimal wrap vinyl restocking levels for next quarter',
                'Review autonomous Robotaxi staking pool dividend safety',
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleAskAdminCopilot(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Admin Copilot Query Input - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={adminPrompt}
                onChange={(e) => setAdminPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAdminCopilot()}
                placeholder="Ask Gemini Operations Copilot anything regarding fleet ops, revenue, or tickets..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => handleAskAdminCopilot()}
                disabled={isLoadingCopilot}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shrink-0 shadow-md"
              >
                {isLoadingCopilot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Run Analysis</span>
              </button>
            </div>

            {/* AI Output Card */}
            {adminCopilotResponse && (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-red-500/30 text-xs text-zinc-200 space-y-2 whitespace-pre-line leading-relaxed font-sans animate-in fade-in">
                <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Gemini Operations Intelligence Briefing</span>
                </div>
                <div>{adminCopilotResponse}</div>
              </div>
            )}
          </div>

          {/* Service Tickets Management Table */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base sm:text-lg text-white">Active Service Bay Tickets & Dispatch</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Service Type</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {localBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/50">
                      <td className="p-3 font-mono font-bold text-red-400">#{b.id}</td>
                      <td className="p-3 font-semibold text-white">{b.vehicleName}</td>
                      <td className="p-3 text-zinc-300">{b.serviceType}</td>
                      <td className="p-3 font-mono text-zinc-400">{b.scheduledDate}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Received & Queued">Received & Queued</option>
                          <option value="Diagnostics">Diagnostics</option>
                          <option value="Technician Working">Technician Working</option>
                          <option value="Quality Inspection">Quality Inspection</option>
                          <option value="Ready for Pickup / Complete">Ready for Pickup</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KYC Dossier Modal - Responsive for all screens */}
      {selectedUserForKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                  User KYC Compliance Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForKyc(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Account Name:</span>
                <span className="text-white font-bold">{selectedUserForKyc.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="text-white">{selectedUserForKyc.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Legal Name:</span>
                <span className="text-amber-400 font-bold">{selectedUserForKyc.kycData?.legalName || selectedUserForKyc.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Date of Birth:</span>
                <span className="text-zinc-200">{selectedUserForKyc.kycData?.dob || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Nationality:</span>
                <span className="text-zinc-200">{selectedUserForKyc.kycData?.nationality || 'United States'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Document Type:</span>
                <span className="text-zinc-200 uppercase">{selectedUserForKyc.kycData?.idType || 'passport'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Document Number:</span>
                <span className="text-emerald-400 font-bold">{selectedUserForKyc.kycData?.idNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Residential Address:</span>
                <span className="text-zinc-200 truncate max-w-xs">{selectedUserForKyc.kycData?.residentialAddress || selectedUserForKyc.location}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">Current Status:</span>
                <span className="font-bold text-amber-400 uppercase">{selectedUserForKyc.kycStatus || 'unverified'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  adminUpdateKyc(selectedUserForKyc.id, 'verified');
                  setSelectedUserForKyc(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer text-center"
              >
                Approve KYC (Tier 2)
              </button>
              <button
                onClick={() => {
                  adminUpdateKyc(selectedUserForKyc.id, 'rejected', kycRejectionReason);
                  setSelectedUserForKyc(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer text-center"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showBalanceAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">Adjust User Balance</h3>
              </div>
              <button
                onClick={() => setShowBalanceAdjustModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">User Account</label>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold truncate">
                  {showBalanceAdjustModal.name} ({showBalanceAdjustModal.email})
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Currency Asset</label>
                <select
                  value={adjustCurrency}
                  onChange={(e) => setAdjustCurrency(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value="USD">Apex USD Vault</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT">Tether USD (USDT)</option>
                  <option value="XRP">Ripple (XRP)</option>
                  <option value="BNB">BNB Chain (BNB)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Set New Balance Amount</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBalanceAdjustModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUserBalance(showBalanceAdjustModal.id, adjustCurrency, adjustAmount);
                    setShowBalanceAdjustModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Apply Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
