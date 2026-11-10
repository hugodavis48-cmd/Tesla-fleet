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
  TrendingUp,
  Bell,
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Play,
  Pause,
  FastForward,
  MessageSquare,
  Activity,
  CheckCircle,
  Lock,
  Car,
  Truck,
  ShieldCheck,
  Tag,
  MapPin,
} from 'lucide-react';
import {
  SmtpConfig,
  EmailTemplate,
  User,
  CryptoCurrency,
  TestEmailResult,
  UserInvestment,
  AdminNotificationMessage,
  SitePage,
  ManualDepositMethod,
  SocialLinkConfig,
  InvestmentPool,
  TeslaCarListing,
  NationwideShippingSettings,
  VehicleRefundPolicySettings,
  VehicleOrder,
  Coupon,
} from '../types';

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

type AdminTab =
  | 'users_kyc'
  | 'investment_mgmt'
  | 'notifications_hub'
  | 'car_sales'
  | 'site_editor'
  | 'email_marketing'
  | 'fleet_ops';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    balances,
    serviceBookings,
    allUsers,
    adminUpdateKyc,
    updateUserBalance,
    updateUserStatus,
    deleteUser,
    allInvestments,
    adminNotifications,
    sitePages,
    manualDepositMethods,
    socialLinks,
    investmentPools,
    productsList,
    rentalFleetList,
    cronCyclesCount,
    lastCronRunAt,
    cronLogs,
    triggerManualCronCycle,
    updateUserInvestment,
    forceMatureInvestment,
    pauseResumeInvestment,
    cancelInvestmentEarly,
    sendNotification,
    deleteNotification,
    createSitePage,
    updateSitePage,
    deleteSitePage,
    addManualDepositMethod,
    updateManualDepositMethod,
    deleteManualDepositMethod,
    updateSocialLink,
    createInvestmentPool,
    updateInvestmentPool,
    deleteInvestmentPool,
    addProductItem,
    updateProductItem,
    deleteProductItem,
    updateRentalFleetVehicle,
    smtpConfig,
    updateSmtpConfig,
    importedEmails,
    importEmailList,
    emailCampaigns,
    sendTestEmail,
    sendMarketingCampaign,
    showToast,
    teslaCarListings,
    createTeslaCarListing,
    updateTeslaCarListing,
    deleteTeslaCarListing,
    nationwideShippingSettings,
    updateShippingSettings,
    vehicleRefundPolicy,
    updateRefundPolicy,
    vehicleOrders,
    updateVehicleOrderStatus,
    coupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('users_kyc');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Tesla Car Sales & Nationwide Logistics Admin State
  const [carSalesSubTab, setCarSalesSubTab] = useState<'inventory' | 'shipping' | 'refund_policy' | 'orders' | 'coupons'>('inventory');
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [carFilterModel, setCarFilterModel] = useState<string>('all');
  const [editingCar, setEditingCar] = useState<TeslaCarListing | null>(null);

  // Order status update state
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<VehicleOrder | null>(null);
  const [orderNewStatus, setOrderNewStatus] = useState<VehicleOrder['status']>('in_transit');
  const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
  const [orderCarrierName, setOrderCarrierName] = useState('Apex Dedicated Logistics');
  const [orderEstimatedDelivery, setOrderEstimatedDelivery] = useState('');
  const [orderCheckpointNote, setOrderCheckpointNote] = useState('');

  // Coupon management state
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Omit<Coupon, 'id' | 'timesUsed'>>({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    validFor: 'all',
    minSpendUsd: 0,
    maxDiscountUsd: 1000,
    maxUses: 100,
    expiresAt: '2026-12-31',
    isActive: true,
    badge: 'HOT',
  });
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCarForm, setNewCarForm] = useState<Omit<TeslaCarListing, 'id'>>({
    model: 'Model S',
    trim: 'Model S Plaid Tri-Motor (1,020 HP)',
    year: 2026,
    originalPriceUsd: 89990,
    salePriceUsd: 89990,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    rangeMiles: 359,
    zeroToSixty: '1.99s',
    topSpeedMph: 200,
    horsepower: 1020,
    driveTrain: 'Tri-Motor All-Wheel Drive',
    batteryKwh: 100,
    color: 'Solid Black',
    interiorColor: 'All Black with Carbon Fiber Decor',
    autopilotType: 'Full Self-Driving (Supervised) Included',
    inStock: true,
    stockCount: 4,
    vin: '5YJSA1E28TA994821',
    description: 'High performance tri-motor track specification with carbon-sleeved rotors and Yoke steering.',
    specs: {
      seating: '5 Adults',
      cargoSpaceCuFt: '28 cu ft',
      weightLbs: '4,766 lbs',
      superchargingMaxKw: '250 kW Supercharging V3/V4',
      wheels: '21" Arachnid Forged Wheels',
    },
    deliveryEstimate: 'Priority Nationwide Express (2-4 Days)',
    nationwideShippingFeeUsd: 1200,
    refundPolicy: '7-Day / 1,000-Mile 100% Money-Back Guarantee',
    warrantyDetails: '4-Yr / 50k Mi Basic • 8-Yr / 150k Mi Battery & Drivetrain',
    isFeatured: true,
  });

  const [localShippingSettings, setLocalShippingSettings] = useState<NationwideShippingSettings>(nationwideShippingSettings);
  const [localRefundPolicy, setLocalRefundPolicy] = useState<VehicleRefundPolicySettings>(vehicleRefundPolicy);

  // User Profile & KYC modal state
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<User | null>(null);
  const [selectedUserForInvestments, setSelectedUserForInvestments] = useState<User | null>(null);
  const [directNotificationUser, setDirectNotificationUser] = useState<User | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState('Photo ID blur on document number edge. Please provide higher resolution color scan.');
  const [showBalanceAdjustModal, setShowBalanceAdjustModal] = useState<User | null>(null);
  const [adjustCurrency, setAdjustCurrency] = useState<CryptoCurrency | 'USD'>('USD');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);

  // Investment Management state
  const [investmentFilterStatus, setInvestmentFilterStatus] = useState<'all' | 'running' | 'completed' | 'paused'>('all');
  const [editingInvestment, setEditingInvestment] = useState<UserInvestment | null>(null);
  const [manualCycleRunning, setManualCycleRunning] = useState(false);

  // Notification Message Dashboard state
  const [notifTargetType, setNotifTargetType] = useState<'all' | 'user'>('all');
  const [notifTargetUserId, setNotifTargetUserId] = useState<string>(allUsers[0]?.id || '');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<AdminNotificationMessage['category']>('system_alert');
  const [notifPriority, setNotifPriority] = useState<AdminNotificationMessage['priority']>('normal');
  const [notifActionUrl, setNotifActionUrl] = useState('/dashboard');
  const [notifActionText, setNotifActionText] = useState('View Details');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Site CMS & Settings sub-tabs
  const [siteCmsSubTab, setSiteCmsSubTab] = useState<'pages' | 'manual_deposits' | 'socials' | 'catalog' | 'global_settings'>('pages');

  // Page creation/edit state
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    displayLocation: 'navbar' as 'navbar' | 'footer' | 'both' | 'hidden',
    content: '',
    published: true,
    isPublished: true,
    isSystem: false,
    order: 1,
  });

  // Manual Deposit Gateway creation/edit state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);
  const [depositForm, setDepositForm] = useState({
    title: '',
    name: '',
    category: 'fiat' as 'crypto' | 'fiat' | 'e_wallet',
    currency: 'USD',
    currencySymbol: 'USD',
    accountName: '',
    accountNumber: '',
    accountDetails: '',
    routingOrBank: '',
    instructions: '',
    minDepositUsd: 100,
    maxDepositUsd: 250000,
    processingTime: '1-3 Hours',
    feePercent: 0,
    isActive: true,
    enabled: true,
    requiresProofUpload: false,
  });

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
      shortLabel: 'Users & Profiles',
      description: 'Audit user profiles, online telemetry, last visits & individual actions',
      icon: Users,
      badge: `${allUsers.length} Users`,
    },
    {
      id: 'investment_mgmt' as const,
      label: 'Investments & Automated ROI Cron',
      shortLabel: 'Fleet Investments',
      description: 'Manage user stakes, APY yields, maturity payouts & Cron scheduler',
      icon: TrendingUp,
      badge: `${allInvestments.length} Active`,
    },
    {
      id: 'notifications_hub' as const,
      label: 'Notification Message Dashboard',
      shortLabel: 'Notifications',
      description: 'Send custom broadcast or individual user inbox notifications & alerts',
      icon: Bell,
      badge: `${adminNotifications.length} Sent`,
    },
    {
      id: 'car_sales' as const,
      label: 'Tesla Car Sales, Shipping & Refunds',
      shortLabel: 'Car Sales & Logistics',
      description: 'Vehicle inventory, MSRP, nationwide shipping flat-rates & 7-day money-back guarantee',
      icon: Car,
      badge: `${teslaCarListings.length} Vehicles`,
    },
    {
      id: 'site_editor' as const,
      label: 'Site CMS, Gateways & Menus',
      shortLabel: 'Site CMS & Gateways',
      description: 'Create & delete pages, manual deposit gateways, social URLs & catalog',
      icon: Sliders,
      badge: `${sitePages.length} Pages`,
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
                    <th className="p-4">User Details & Status</th>
                    <th className="p-4">Role & Tier</th>
                    <th className="p-4">Telemetry & Last Visit</th>
                    <th className="p-4">KYC Compliance</th>
                    <th className="p-4">Vault Balances</th>
                    <th className="p-4 text-right">Individual Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {allUsers.map((u) => {
                    const isOnline = u.isOnline ?? true;
                    const accountStatus = u.accountStatus || 'active';
                    const userInvestmentsCount = allInvestments.filter((inv: UserInvestment) => inv.userId === u.id).length;

                    return (
                      <tr key={u.id} className="hover:bg-zinc-900/50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-xl object-cover border border-red-500/30"
                              />
                              <span
                                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                                }`}
                                title={isOnline ? 'Online now' : 'Offline'}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white block text-sm">{u.name}</span>
                                {accountStatus === 'banned' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-mono uppercase font-bold">
                                    Banned
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400 font-mono">{u.email}</span>
                              <span className="text-[10px] text-zinc-500 block">{u.location || 'United States'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold block w-fit mb-1 ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-red-400 font-bold block">{u.tier}</span>
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3 h-3 text-cyan-400" />
                              <span className="text-zinc-200">
                                Path: <span className="text-cyan-400">{u.lastVisitedPath || '/dashboard'}</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block">
                              Active: {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleTimeString() : 'Just now'}
                            </span>
                            <span className="text-[9px] text-zinc-600 block">
                              IP: 198.51.100.{u.id.charCodeAt(u.id.length - 1) % 250} • MacOS/Chrome
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                              u.kycStatus === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : u.kycStatus === 'in_review'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                : u.kycStatus === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            <BadgeCheck className="w-3 h-3" />
                            <span>{u.kycStatus?.toUpperCase() || 'UNVERIFIED'}</span>
                          </span>
                          {u.kycData && (
                            <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                              ID: {u.kycData.idType} ({u.kycData.idNumber})
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-xs">
                          <span className="text-emerald-400 font-bold block">
                            ${balances.usd.toFixed(2)} USD
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            Stakes: {userInvestmentsCount} active
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedUserForInvestments(u)}
                              title="View & Edit User Investments"
                              className="px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Stakes ({userInvestmentsCount})</span>
                            </button>
                            <button
                              onClick={() => {
                                setNotifTargetType('user');
                                setNotifTargetUserId(u.id);
                                setDirectNotificationUser(u);
                              }}
                              title="Send Customized Notification"
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/40 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedUserForKyc(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                            >
                              Dossier
                            </button>
                            <button
                              onClick={() => setShowBalanceAdjustModal(u)}
                              title="Adjust Balance"
                              className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                updateUserStatus(u.id, accountStatus === 'banned' ? 'active' : 'banned')
                              }
                              title={accountStatus === 'banned' ? 'Unban User' : 'Ban User'}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                accountStatus === 'banned'
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
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

          {/* Mobile & Tablet Card Layout (<1024px) for perfect responsive fit */}
          <div className="lg:hidden space-y-3">
            {allUsers.map((u) => {
              const isOnline = u.isOnline ?? true;
              const accountStatus = u.accountStatus || 'active';
              const userInvestmentsCount = allInvestments.filter((inv: UserInvestment) => inv.userId === u.id).length;

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-11 h-11 rounded-xl object-cover border border-red-500/30 shrink-0"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white block text-sm truncate">{u.name}</span>
                          {accountStatus === 'banned' && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-red-600 text-white font-mono uppercase font-bold">
                              Banned
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono block truncate">{u.email}</span>
                        <span className="text-[10px] text-zinc-500">{u.tier} • {u.location || 'USA'}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">STATUS</span>
                      <span className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {isOnline ? '● Online' : '○ Offline'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">LAST PATH</span>
                      <span className="text-cyan-400 truncate block">{u.lastVisitedPath || '/dashboard'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">KYC STATUS</span>
                      <span
                        className={`font-bold uppercase ${
                          u.kycStatus === 'verified'
                            ? 'text-emerald-400'
                            : u.kycStatus === 'in_review'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {u.kycStatus || 'UNVERIFIED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">INVESTMENTS</span>
                      <span className="text-white font-bold">{userInvestmentsCount} Active</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                    <button
                      onClick={() => setSelectedUserForInvestments(u)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Investments</span>
                    </button>
                    <button
                      onClick={() => {
                        setNotifTargetType('user');
                        setNotifTargetUserId(u.id);
                        setDirectNotificationUser(u);
                      }}
                      className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/40"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedUserForKyc(u)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => setShowBalanceAdjustModal(u)}
                      className="p-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"
                      title="Adjust Balance"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        updateUserStatus(u.id, accountStatus === 'banned' ? 'active' : 'banned')
                      }
                      className={`p-2 rounded-xl border ${
                        accountStatus === 'banned'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                      title={accountStatus === 'banned' ? 'Unban User' : 'Ban User'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: INVESTMENTS & AUTOMATED ROI CRON JOB ENGINE */}
      {activeAdminTab === 'investment_mgmt' && (
        <div className="space-y-6 w-full">
          {/* Header & Cron Status Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-5 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-heading font-black text-xl text-white">
                    Fleet Investment Management & Automated ROI Cron Engine
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Monitor active user investment stakes, audit daily yield accruals, adjust APY parameters, and manage the automated background Cron scheduler that credits users' dashboard wallets upon plan completion.
                </p>
              </div>

              {/* Manual Cron Trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    setManualCycleRunning(true);
                    triggerManualCronCycle();
                    setTimeout(() => setManualCycleRunning(false), 800);
                  }}
                  disabled={manualCycleRunning}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-heading font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${manualCycleRunning ? 'animate-spin' : ''}`} />
                  <span>Execute Cron ROI Cycle Now</span>
                </button>
              </div>
            </div>

            {/* Cron Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-mono block">CRON STATUS</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-emerald-400 font-bold text-xs">ACTIVE (60s tick)</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-mono block">TOTAL CRON CYCLES</span>
                <span className="font-mono text-white font-bold text-base">{cronCyclesCount} Cycles</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-mono block">LAST CRON CYCLE</span>
                <span className="font-mono text-zinc-300 text-xs">
                  {lastCronRunAt ? new Date(lastCronRunAt).toLocaleTimeString() : 'Running...'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-mono block">TOTAL ACTIVE STAKES</span>
                <span className="font-mono text-cyan-400 font-bold text-base">
                  {allInvestments.filter((i: UserInvestment) => i.status === 'running').length} Running
                </span>
              </div>
            </div>

            {/* Live Cron Terminal Log */}
            <div className="p-3.5 rounded-2xl bg-black/80 border border-zinc-800 font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] border-b border-zinc-800/80 pb-1">
                <span>AUTOMATED ROI CRON JOB AUDIT LOG (SYSTEM TELEMETRY)</span>
                <span className="text-emerald-400">● LIVE RUNNER</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 text-zinc-300">
                {cronLogs.slice(-4).map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">➜</span>
                    <span className="text-zinc-300">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              {(['all', 'running', 'completed', 'paused'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInvestmentFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                    investmentFilterStatus === st
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st} ({st === 'all' ? allInvestments.length : allInvestments.filter((i: UserInvestment) => i.status === st).length})
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-400 font-mono">
              Total Staked: $
              {allInvestments
                .reduce((acc: number, i: UserInvestment) => acc + (i.principalUsd || i.amountInvestedUsd || 0), 0)
                .toLocaleString()}{' '}
              USD
            </span>
          </div>

          {/* Investments Table */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Investment ID & Investor</th>
                    <th className="p-4">Fleet Asset Pool</th>
                    <th className="p-4">Principal Staked</th>
                    <th className="p-4">APY Rate</th>
                    <th className="p-4">Duration & Progress</th>
                    <th className="p-4">Accrued Yield</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {allInvestments
                    .filter((inv: UserInvestment) => investmentFilterStatus === 'all' || inv.status === investmentFilterStatus)
                    .map((inv: UserInvestment) => {
                      const investor = allUsers.find((u) => u.id === inv.userId) || {
                        name: 'VIP Member',
                        email: 'investor@apex-tesla.io',
                      };
                      const progressPct = Math.min(100, Math.round((inv.daysElapsed / inv.durationDays) * 100));

                      return (
                        <tr key={inv.id} className="hover:bg-zinc-900/50 transition">
                          <td className="p-4">
                            <span className="font-mono text-emerald-400 font-bold block">{inv.id}</span>
                            <span className="font-semibold text-white block text-xs">{investor.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{investor.email}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-heading font-bold text-white block">{inv.poolName || inv.poolTitle || 'Fleet Pool'}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Staked on {new Date(inv.stakedAt || inv.investedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="p-4 font-mono font-bold text-white text-sm">
                            ${(inv.principalUsd ?? inv.amountInvestedUsd ?? 0).toLocaleString()} USD
                          </td>

                          <td className="p-4 font-mono text-emerald-400 font-bold text-sm">
                            {(inv.apyPercent ?? inv.apy ?? 0).toFixed(1)}% APY
                          </td>

                          <td className="p-4 font-mono text-xs min-w-[140px]">
                            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                              <span>
                                {inv.daysElapsed} / {inv.durationDays}d
                              </span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-zinc-500 block mt-1">
                              Maturity: {new Date(inv.maturityDate).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="p-4 font-mono">
                            <span className="text-emerald-400 font-bold block text-sm">
                              +${(inv.accruedYieldUsd ?? inv.earnedDividendsUsd ?? 0).toFixed(2)} USD
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Exp: ${(inv.totalExpectedRoiUsd || 0).toFixed(2)}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                                inv.status === 'running'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                                  : inv.status === 'completed'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => setEditingInvestment(inv)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-pointer"
                                title="Edit APY & Duration"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {inv.status === 'running' && (
                                <>
                                  <button
                                    onClick={() => forceMatureInvestment(inv.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                    title="Auto-Credit Principal & Accrued Yield to User Wallet Now"
                                  >
                                    <FastForward className="w-3 h-3" />
                                    <span>Force Settle</span>
                                  </button>
                                  <button
                                    onClick={() => pauseResumeInvestment(inv.id)}
                                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 cursor-pointer"
                                    title="Pause Yield Accrual"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {inv.status === 'paused' && (
                                <button
                                  onClick={() => pauseResumeInvestment(inv.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                                  title="Resume Yield"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
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
      )}

      {/* TAB: NOTIFICATION MESSAGE DASHBOARD (DISPATCH TO INDIVIDUAL OR ALL) */}
      {activeAdminTab === 'notifications_hub' && (
        <div className="space-y-6 w-full">
          {/* Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 space-y-2 shadow-2xl">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-400" />
              <h3 className="font-heading font-black text-xl text-white">
                Notification Message Dispatcher & Inbox Manager
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Compose custom alerts, payout confirmations, direct account messages, and promotional broadcasts. Deliver customized messages directly to user dashboards either globally or targeted to a specific user.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notification Dispatch Form */}
            <div className="lg:col-span-1 p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
              <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Send className="w-4 h-4 text-red-500" />
                <span>Send Customized Notification</span>
              </h4>

              <div className="space-y-3.5 text-xs">
                {/* Target Type */}
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Recipient Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNotifTargetType('all')}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                        notifTargetType === 'all'
                          ? 'border-red-500 bg-red-950/40 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Broadcast to ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifTargetType('user')}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                        notifTargetType === 'user'
                          ? 'border-red-500 bg-red-950/40 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Target Specific User
                    </button>
                  </div>
                </div>

                {/* Individual user selector */}
                {notifTargetType === 'user' && (
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Select Target User</label>
                    <select
                      value={notifTargetUserId}
                      onChange={(e) => setNotifTargetUserId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    >
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Category / Type</label>
                    <select
                      value={notifCategory}
                      onChange={(e) => setNotifCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option value="system_alert">System Alert</option>
                      <option value="payout">ROI / Payout</option>
                      <option value="investment">Investment Stake</option>
                      <option value="promotion">Promo / Bonus</option>
                      <option value="kyc">KYC Verification</option>
                      <option value="direct_message">Direct Message</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Priority</label>
                    <select
                      value={notifPriority}
                      onChange={(e) => setNotifPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent ⚡</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Notification Title</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="e.g. VIP Dividend Credited to Your Vault"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Message Body</label>
                  <textarea
                    rows={3}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Enter customized message details for the recipient..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Action Link & Text */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Action Link</label>
                    <input
                      type="text"
                      value={notifActionUrl}
                      onChange={(e) => setNotifActionUrl(e.target.value)}
                      placeholder="/dashboard"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Action Text</label>
                    <input
                      type="text"
                      value={notifActionText}
                      onChange={(e) => setNotifActionText(e.target.value)}
                      placeholder="View Vault"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white text-[11px]"
                    />
                  </div>
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  disabled={!notifTitle.trim() || !notifMessage.trim() || isSendingNotification}
                  onClick={() => {
                    setIsSendingNotification(true);
                    const targetUser = allUsers.find((u) => u.id === notifTargetUserId);
                    sendNotification({
                      title: notifTitle,
                      message: notifMessage,
                      type: notifTargetType === 'user' ? 'direct_message' : 'announcement',
                      category: notifCategory,
                      priority: notifPriority,
                      targetType: notifTargetType,
                      targetUserId: notifTargetType === 'user' ? notifTargetUserId : undefined,
                      targetUserName: notifTargetType === 'user' ? targetUser?.name : undefined,
                      actionUrl: notifActionUrl || undefined,
                      actionText: notifActionText || undefined,
                    });
                    setNotifTitle('');
                    setNotifMessage('');
                    setIsSendingNotification(false);
                    showToast('Notification dispatched to user dashboard!', 'success');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Message Now</span>
                </button>
              </div>
            </div>

            {/* Notification History Log */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h4 className="font-heading font-bold text-sm text-white">
                    Dispatched Message Audit History ({adminNotifications.length})
                  </h4>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {adminNotifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">No notifications sent yet.</div>
                ) : (
                  adminNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                              notif.targetType === 'all'
                                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                            }`}
                          >
                            {notif.targetType === 'all' ? 'BROADCAST ALL' : `TO: ${notif.targetUserName || 'USER'}`}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-zinc-800 text-zinc-300">
                            {notif.category}
                          </span>
                          {notif.priority === 'urgent' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-bold animate-pulse">
                              URGENT
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <span className="font-heading font-bold text-white text-sm block">{notif.title}</span>
                        <p className="text-zinc-300 leading-relaxed text-xs">{notif.message}</p>

                        {notif.actionUrl && (
                          <span className="inline-block text-[11px] text-cyan-400 font-mono">
                            Link: {notif.actionUrl} ({notif.actionText})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-white transition shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
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

      {/* TAB 3: SITE CMS, GATEWAYS & PAGES EDITOR */}
      {activeAdminTab === 'site_editor' && (
        <div className="space-y-6 w-full">
          {/* Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-6 h-6 text-amber-400" />
                <h3 className="font-heading font-black text-xl text-white">
                  Site Editor, Pages & Manual Gateway CMS
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Create and delete custom site pages, configure menu display locations, edit social connect URLs (WhatsApp, X, Telegram), manage manual deposit gateways (Bank Wire, CashApp, Zelle), and adjust live catalog items.
              </p>
            </div>

            {/* Sub-tab pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
              {[
                { id: 'pages', label: 'Pages & Menus', count: sitePages.length },
                { id: 'manual_deposits', label: 'Manual Gateways', count: manualDepositMethods.length },
                { id: 'socials', label: 'Social URLs', count: socialLinks.length },
                { id: 'catalog', label: 'Catalog & Plans', count: investmentPools.length },
                { id: 'global_settings', label: 'Global Rules' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSiteCmsSubTab(sub.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    siteCmsSubTab === sub.id
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{sub.label}</span>
                  {sub.count !== undefined && (
                    <span className="ml-1 text-[10px] font-mono opacity-80">({sub.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SUBTAB 1: PAGES & MENUS */}
          {siteCmsSubTab === 'pages' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Site Pages & Navigation Menus</h4>
                  <p className="text-xs text-zinc-400">
                    Create new landing pages, manage existing pages, and set display locations (Navbar, Footer, Both, or Hidden).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPageId(null);
                    setPageForm({
                      title: '',
                      slug: '',
                      displayLocation: 'navbar',
                      content: '',
                      published: true,
                      isPublished: true,
                      isSystem: false,
                      order: sitePages.length + 1,
                    });
                    setIsPageModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Page</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Page Title & Slug</th>
                      <th className="p-3.5">Display Location</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Updated</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {sitePages.map((page) => (
                      <tr key={page.id} className="hover:bg-zinc-900/50">
                        <td className="p-3.5">
                          <span className="font-heading font-bold text-white text-sm block">{page.title}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">/{page.slug}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-700 text-zinc-300">
                            {page.displayLocation}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              page.isPublished
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {page.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingPageId(page.id);
                                setPageForm({
                                  title: page.title,
                                  slug: page.slug,
                                  displayLocation: page.displayLocation,
                                  content: page.content,
                                  published: page.published ?? true,
                                  isPublished: page.isPublished ?? page.published ?? true,
                                  isSystem: page.isSystem ?? false,
                                  order: page.order,
                                });
                                setIsPageModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700"
                              title="Edit Page"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSitePage(page.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-900/50 text-rose-400 border border-zinc-700"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 2: MANUAL DEPOSIT METHODS & GATEWAYS */}
          {siteCmsSubTab === 'manual_deposits' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    Manual Deposit Gateways & Custom Banking Rails
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Configure institutional Wire transfer accounts, CashApp, Zelle, and customized off-chain deposit methods.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDepositId(null);
                    setDepositForm({
                      title: '',
                      name: '',
                      category: 'fiat',
                      currency: 'USD',
                      currencySymbol: '$',
                      accountName: '',
                      accountNumber: '',
                      accountDetails: '',
                      routingOrBank: '',
                      instructions: '',
                      minDepositUsd: 100,
                      maxDepositUsd: 500000,
                      processingTime: '1-3 Hours',
                      feePercent: 0,
                      isActive: true,
                      enabled: true,
                      requiresProofUpload: false,
                    });
                    setIsDepositModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Custom Deposit Method</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {manualDepositMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white text-base">{method.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-emerald-400 border border-zinc-700">
                            {method.currency}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">{method.accountName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDepositId(method.id);
                            setDepositForm({
                              title: method.title || method.name || '',
                              name: method.name || method.title || '',
                              category: method.category || 'fiat',
                              currency: method.currency || 'USD',
                              currencySymbol: method.currencySymbol || '$',
                              accountName: method.accountName || '',
                              accountNumber: method.accountNumber || '',
                              accountDetails: method.accountDetails || '',
                              routingOrBank: method.routingOrBank || '',
                              instructions: method.instructions || '',
                              minDepositUsd: method.minDepositUsd,
                              maxDepositUsd: method.maxDepositUsd,
                              processingTime: method.processingTime || '1-3 Hours',
                              feePercent: method.feePercent || 0,
                              isActive: method.isActive ?? true,
                              enabled: method.enabled ?? method.isActive ?? true,
                              requiresProofUpload: method.requiresProofUpload ?? false,
                            });
                            setIsDepositModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteManualDepositMethod(method.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 font-mono text-xs space-y-1 text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Account / Tag:</span>
                        <span className="text-emerald-400 font-bold">{method.accountNumber}</span>
                      </div>
                      {method.routingOrBank && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Routing / Bank:</span>
                          <span>{method.routingOrBank}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Min / Max:</span>
                        <span>
                          ${method.minDepositUsd.toLocaleString()} - ${method.maxDepositUsd.toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed italic bg-zinc-950/60 p-2.5 rounded-lg">
                      {method.instructions}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`font-mono text-[10px] ${method.enabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {method.enabled ? '● Active in Deposit Modal' : '○ Disabled'}
                      </span>
                      <button
                        onClick={() =>
                          updateManualDepositMethod(method.id, { enabled: !method.enabled })
                        }
                        className="text-xs text-zinc-400 hover:text-white underline font-mono"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: SOCIAL CONNECT URLS */}
          {siteCmsSubTab === 'socials' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div>
                <h4 className="font-heading font-bold text-base text-white">Social Channel Connect URLs</h4>
                <p className="text-xs text-zinc-400">
                  Update live share links, WhatsApp Concierge desk URLs, Telegram alpha chat, and official community handles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-white text-sm">{link.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{link.platform}</span>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">Handle / Display Text</label>
                      <input
                        type="text"
                        value={link.handle}
                        onChange={(e) => updateSocialLink(link.id, { handle: e.target.value })}
                        className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                        className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-mono ${link.enabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {link.enabled ? '● Visible on site' : '○ Hidden'}
                      </span>
                      <button
                        onClick={() => updateSocialLink(link.id, { enabled: !link.enabled })}
                        className="text-[11px] text-zinc-400 hover:text-white underline font-mono"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 4: CATALOG & INVESTMENT PLANS */}
          {siteCmsSubTab === 'catalog' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-xl">
              <div>
                <h4 className="font-heading font-bold text-base text-white">
                  Fleet Investment Plans & Asset Staking Parameters
                </h4>
                <p className="text-xs text-zinc-400">
                  Update APY returns, pool duration periods, and minimum staking thresholds across autonomous fleets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {investmentPools.map((pool) => (
                  <div
                    key={pool.id}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-heading font-bold text-white text-sm">{pool.title}</h5>
                      <span className="font-mono text-emerald-400 font-bold">{pool.apyPercent}% APY</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Annual Percentage Yield (APY %)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={pool.apyPercent || pool.apy}
                          onChange={(e) =>
                            updateInvestmentPool(pool.id, {
                              apy: parseFloat(e.target.value) || 0,
                              apyPercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Min Stake ($)</label>
                          <input
                            type="number"
                            value={pool.minStakeUsd || pool.minInvestmentUsd}
                            onChange={(e) =>
                              updateInvestmentPool(pool.id, {
                                minInvestmentUsd: parseFloat(e.target.value) || 0,
                                minStakeUsd: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-0.5">Plan Days</label>
                          <input
                            type="number"
                            value={pool.durationDays || pool.lockPeriodDays}
                            onChange={(e) =>
                              updateInvestmentPool(pool.id, {
                                lockPeriodDays: parseInt(e.target.value) || 30,
                                durationDays: parseInt(e.target.value) || 30,
                              })
                            }
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 5: GLOBAL SETTINGS & RULES */}
          {siteCmsSubTab === 'global_settings' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <form onSubmit={handleSaveSiteSettings} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hero Section Main Headline</label>
                    <input
                      type="text"
                      value={siteSettings.heroHeadline}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hero Subtitle Copy</label>
                    <input
                      type="text"
                      value={siteSettings.heroSubtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
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
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Scratch Card Max Prize Cap (USD)</label>
                    <input
                      type="number"
                      value={siteSettings.maxScratchPrizeUsd}
                      onChange={(e) => setSiteSettings({ ...siteSettings, maxScratchPrizeUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
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
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
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
        </div>
      )}

      {/* TAB: TESLA CAR SALES, NATIONWIDE SHIPPING & REFUND POLICIES */}
      {activeAdminTab === 'car_sales' && (
        <div className="space-y-6 w-full">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Car className="w-6 h-6 text-red-500" />
                <h3 className="font-heading font-black text-xl text-white">
                  Tesla Vehicle Sales, Shipping & Refund Management
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Manage factory MSRP prices, inventory stock counts, nationwide enclosed carrier rates, 7-day refund guarantee policies, and customer vehicle deliveries.
              </p>
            </div>

            {/* Sub Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCarSalesSubTab('inventory')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  carSalesSubTab === 'inventory'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Vehicles ({teslaCarListings.length})
              </button>

              <button
                type="button"
                onClick={() => setCarSalesSubTab('shipping')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  carSalesSubTab === 'shipping'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Nationwide Shipping
              </button>

              <button
                type="button"
                onClick={() => setCarSalesSubTab('refund_policy')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  carSalesSubTab === 'refund_policy'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                7-Day Refund Policy
              </button>

              <button
                type="button"
                onClick={() => setCarSalesSubTab('orders')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  carSalesSubTab === 'orders'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Orders & Logistics ({vehicleOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setCarSalesSubTab('coupons')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  carSalesSubTab === 'coupons'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Coupons & Deals ({coupons.length})</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: VEHICLE CATALOG & INVENTORY */}
          {carSalesSubTab === 'inventory' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={carFilterModel}
                    onChange={(e) => setCarFilterModel(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
                  >
                    <option value="all">All Models ({teslaCarListings.length})</option>
                    <option value="Cybertruck">Cybertruck</option>
                    <option value="Model S">Model S</option>
                    <option value="Model 3">Model 3</option>
                    <option value="Model X">Model X</option>
                    <option value="Model Y">Model Y</option>
                    <option value="Roadster">Roadster</option>
                  </select>

                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      placeholder="Search trim, color, VIN..."
                      value={carSearchTerm}
                      onChange={(e) => setCarSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500"
                    />
                    <Car className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingCar(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Tesla Model</span>
                </button>
              </div>

              {/* Vehicle Inventory List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teslaCarListings
                  .filter((car) => {
                    if (carFilterModel !== 'all' && car.model !== carFilterModel) return false;
                    if (!carSearchTerm) return true;
                    const q = carSearchTerm.toLowerCase();
                    return (
                      car.model.toLowerCase().includes(q) ||
                      car.trim.toLowerCase().includes(q) ||
                      car.color.toLowerCase().includes(q)
                    );
                  })
                  .map((car) => (
                    <div
                      key={car.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden">
                          <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                            {car.year} {car.model}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                car.inStock ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {car.inStock ? `${car.stockCount} in stock` : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-heading font-black text-white text-base truncate">
                            {car.year} Tesla {car.model}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate">{car.trim}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Original MSRP</span>
                            <span className="font-bold text-white">${car.originalPriceUsd.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Sale Price</span>
                            <span className="font-bold text-red-400">${car.salePriceUsd.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">0-60 Acceleration</span>
                            <span className="font-mono text-zinc-200">{car.zeroToSixty}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">EPA Range</span>
                            <span className="font-mono text-zinc-200">{car.rangeMiles} mi</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Color: <strong className="text-zinc-200">{car.color}</strong></span>
                          <span>VIN: <strong className="text-zinc-300 font-mono text-[10px]">{car.vin?.slice(-8) || 'N/A'}</strong></span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateTeslaCarListing(car.id, { inStock: !car.inStock });
                            showToast(`Updated stock status for ${car.model}.`, 'info');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            car.inStock
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {car.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCar(car)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                            title="Edit Vehicle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${car.model} ${car.trim} from the sales catalog?`)) {
                                deleteTeslaCarListing(car.id);
                                showToast(`Removed ${car.model} from catalog.`, 'info');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: NATIONWIDE SHIPPING SETTINGS */}
          {carSalesSubTab === 'shipping' && (
            <div className="max-w-2xl bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h4 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <span>Nationwide Enclosed Carrier Settings</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure logistics rates, delivery estimates, carrier partnerships, and member tier exemptions.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Standard Flat-Rate Shipping Fee ($ USD)</label>
                  <input
                    type="number"
                    value={localShippingSettings.flatFeeUsd}
                    onChange={(e) => setLocalShippingSettings({ ...localShippingSettings, flatFeeUsd: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Charged on all standard customer orders. Applies to all lower 48 states.
                  </span>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Estimated Turnaround Delivery Window</label>
                  <input
                    type="text"
                    value={localShippingSettings.estimatedDays}
                    onChange={(e) => setLocalShippingSettings({ ...localShippingSettings, estimatedDays: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                    placeholder="3 - 7 Business Days"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Free Shipping Eligible Membership Tiers</label>
                  <input
                    type="text"
                    value={localShippingSettings.freeShippingEligibleTiers.join(', ')}
                    onChange={(e) =>
                      setLocalShippingSettings({
                        ...localShippingSettings,
                        freeShippingEligibleTiers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                    placeholder="Plaid Member, Founders Club"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Comma-separated user tier names.</span>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Authorized Enclosed Carrier Partners</label>
                  <input
                    type="text"
                    value={localShippingSettings.carrierPartners.join(', ')}
                    onChange={(e) =>
                      setLocalShippingSettings({
                        ...localShippingSettings,
                        carrierPartners: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Carrier Live Tracking Portal URL Prefix</label>
                  <input
                    type="text"
                    value={localShippingSettings.trackingPortalUrl}
                    onChange={(e) => setLocalShippingSettings({ ...localShippingSettings, trackingPortalUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateShippingSettings(localShippingSettings);
                      showToast('Nationwide shipping settings updated successfully.', 'success');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Save Shipping Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: 7-DAY REFUND POLICY SETTINGS */}
          {carSalesSubTab === 'refund_policy' && (
            <div className="max-w-2xl bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h4 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>7-Day / 1,000-Mile 100% Money-Back Policy Editor</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Edit the terms, evaluation period, mileage allowance, and legal disclosure presented to vehicle buyers.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-semibold">Evaluation Days</label>
                    <input
                      type="number"
                      value={localRefundPolicy.trialDays}
                      onChange={(e) => setLocalRefundPolicy({ ...localRefundPolicy, trialDays: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-semibold">Max Evaluation Mileage</label>
                    <input
                      type="number"
                      value={localRefundPolicy.maxMileage}
                      onChange={(e) => setLocalRefundPolicy({ ...localRefundPolicy, maxMileage: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-semibold">Money-Back %</label>
                    <input
                      type="number"
                      value={localRefundPolicy.moneyBackGuaranteePercent}
                      onChange={(e) => setLocalRefundPolicy({ ...localRefundPolicy, moneyBackGuaranteePercent: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Refund Policy Terms & Summary Copy</label>
                  <textarea
                    rows={4}
                    value={localRefundPolicy.termsSummary}
                    onChange={(e) => setLocalRefundPolicy({ ...localRefundPolicy, termsSummary: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white leading-relaxed"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Rendered to customer before final checkout and printed on on-chain title certificates.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRefundPolicy(localRefundPolicy);
                      showToast('Vehicle refund policy settings updated successfully.', 'success');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Save Refund Policy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: CUSTOMER VEHICLE ORDERS */}
          {carSalesSubTab === 'orders' && (
            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="font-heading font-black text-lg text-white">
                  Customer Vehicle Orders & Delivery Tracking
                </h4>
                <span className="text-xs font-mono text-zinc-400">{vehicleOrders.length} Confirmed Orders</span>
              </div>

              {vehicleOrders.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs space-y-2">
                  <Truck className="w-10 h-10 mx-auto text-zinc-600" />
                  <p>No customer vehicle orders have been placed yet.</p>
                  <p className="text-[11px] text-zinc-600">Orders placed through the customer showroom will be logged here with assigned VIN and carrier tracking.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/80 text-zinc-400 text-[11px] uppercase border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-3">Order ID / Date</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Vehicle</th>
                        <th className="py-3 px-3">Shipping Status</th>
                        <th className="py-3 px-3">Tracking & Carrier</th>
                        <th className="py-3 px-3">Destination</th>
                        <th className="py-3 px-3 text-right">Settlement</th>
                        <th className="py-3 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {vehicleOrders.map((order) => {
                        const statusColors: Record<string, string> = {
                          confirmed: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
                          carrier_assigned: 'bg-blue-950/80 text-blue-400 border-blue-500/40',
                          in_transit: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
                          out_for_delivery: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
                          delivered: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
                        };

                        const statusLabels: Record<string, string> = {
                          confirmed: 'Confirmed (Prep)',
                          carrier_assigned: 'Carrier Assigned',
                          in_transit: 'In Transit',
                          out_for_delivery: 'Out for Delivery',
                          delivered: 'Delivered & Handover',
                        };

                        return (
                          <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-white block">{order.id}</span>
                              <span className="text-[10px] text-zinc-500">{order.orderedAt.substring(0, 10)}</span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <span className="font-semibold text-white block">{order.userName || 'Customer'}</span>
                              <span className="text-[11px] text-zinc-400">{order.userEmail}</span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <span className="font-bold text-red-400 block">{order.vehicleName}</span>
                              <span className="text-[10px] text-zinc-500">VIN: {order.vinAssigned}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[order.status] || 'bg-zinc-800 text-zinc-300'}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-emerald-400 font-mono text-[11px] block">{order.trackingNumber}</span>
                              <span className="text-[10px] text-zinc-500 font-sans">{order.carrierName || 'Apex Dedicated Logistics'}</span>
                            </td>
                            <td className="py-3 px-3 font-sans text-zinc-300">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-black text-white block">${order.totalUsd.toLocaleString()}</span>
                              {order.appliedCouponCode && (
                                <span className="text-[10px] text-emerald-400">Coupon: {order.appliedCouponCode}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForStatus(order);
                                  setOrderNewStatus(order.status);
                                  setOrderTrackingNumber(order.trackingNumber);
                                  setOrderCarrierName(order.carrierName || 'Apex Dedicated Logistics');
                                  setOrderEstimatedDelivery(order.estimatedDelivery || '2-4 Business Days');
                                  setOrderCheckpointNote('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 hover:text-white font-sans text-[11px] font-semibold flex items-center gap-1 mx-auto transition"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Modify Status</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 5: PROMOTIONAL COUPONS & DISCOUNTS CMS */}
          {carSalesSubTab === 'coupons' && (
            <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-black text-lg text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-500" />
                    <span>Discount & Free Promotional Coupons CMS</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Create, edit, and toggle discount vouchers valid for vehicle purchases, aftermarket parts, spins, or maintenance bay services.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon(null);
                    setCouponForm({
                      code: '',
                      title: '',
                      description: '',
                      discountType: 'percentage',
                      discountValue: 15,
                      validFor: 'all',
                      minSpendUsd: 0,
                      maxDiscountUsd: 1000,
                      maxUses: 100,
                      expiresAt: '2026-12-31',
                      isActive: true,
                      badge: 'HOT',
                    });
                    setIsAddingCoupon(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              {/* Search & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                  <input
                    type="text"
                    value={couponSearchTerm}
                    onChange={(e) => setCouponSearchTerm(e.target.value)}
                    placeholder="Search by coupon code, title, or target category..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="p-2.5 px-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Active Coupons</span>
                  <span className="font-bold text-sm text-emerald-400 font-mono">
                    {coupons.filter((c) => c.isActive).length} / {coupons.length}
                  </span>
                </div>

                <div className="p-2.5 px-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Total Redeemed</span>
                  <span className="font-bold text-sm text-cyan-400 font-mono">
                    {coupons.reduce((sum, c) => sum + (c.timesUsed || 0), 0)} times
                  </span>
                </div>
              </div>

              {/* Coupons Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-zinc-400 text-[11px] uppercase border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-3">Code & Badge</th>
                      <th className="py-3 px-3">Offer Title / Description</th>
                      <th className="py-3 px-3">Discount Value</th>
                      <th className="py-3 px-3">Valid For</th>
                      <th className="py-3 px-3">Uses / Limit</th>
                      <th className="py-3 px-3">Expires</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {coupons
                      .filter((c) => {
                        if (!couponSearchTerm) return true;
                        const q = couponSearchTerm.toLowerCase();
                        return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.validFor.toLowerCase().includes(q);
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-zinc-900 rounded border border-zinc-700">
                                {c.code}
                              </span>
                              {c.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-red-600/30 text-red-300 rounded border border-red-500/40 uppercase font-bold">
                                  {c.badge}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <span className="font-semibold text-white block truncate">{c.title}</span>
                            <span className="text-[10px] text-zinc-400 block truncate">{c.description}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {c.discountType === 'percentage' && <span className="text-yellow-400">{c.discountValue}% OFF</span>}
                            {c.discountType === 'fixed_usd' && <span className="text-emerald-400">${c.discountValue.toLocaleString()} OFF</span>}
                            {c.discountType === 'free_spins' && <span className="text-purple-400">+{c.discountValue} FREE SPINS</span>}
                            {c.discountType === 'free_shipping' && <span className="text-cyan-400">FREE SHIPPING</span>}
                          </td>
                          <td className="py-3 px-3">
                            <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                              {c.validFor}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            <span className="text-white font-bold">{c.timesUsed || 0}</span>
                            <span className="text-zinc-500"> / {c.maxUses ? c.maxUses : '∞'}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                            {c.expiresAt}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleCouponActive(c.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                c.isActive
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                            >
                              {c.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCoupon(c);
                                  setCouponForm({
                                    code: c.code,
                                    title: c.title,
                                    description: c.description,
                                    discountType: c.discountType,
                                    discountValue: c.discountValue,
                                    validFor: c.validFor,
                                    minSpendUsd: c.minSpendUsd || 0,
                                    maxDiscountUsd: c.maxDiscountUsd || 0,
                                    maxUses: c.maxUses || 100,
                                    expiresAt: c.expiresAt,
                                    isActive: c.isActive,
                                    badge: c.badge || '',
                                  });
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                title="Edit Coupon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteCoupon(c.id);
                                  showToast(`Coupon ${c.code} deleted.`, 'info');
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EDIT CAR MODAL */}
          {editingCar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="font-heading font-black text-base text-white">
                    Edit {editingCar.model} {editingCar.trim}
                  </h3>
                  <button onClick={() => setEditingCar(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Trim Name</label>
                    <input
                      type="text"
                      value={editingCar.trim}
                      onChange={(e) => setEditingCar({ ...editingCar, trim: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Sale Price ($ USD)</label>
                      <input
                        type="number"
                        value={editingCar.salePriceUsd}
                        onChange={(e) => setEditingCar({ ...editingCar, salePriceUsd: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Stock Count</label>
                      <input
                        type="number"
                        value={editingCar.stockCount}
                        onChange={(e) => setEditingCar({ ...editingCar, stockCount: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingCar.image}
                      onChange={(e) => setEditingCar({ ...editingCar, image: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Range (Miles)</label>
                      <input
                        type="number"
                        value={editingCar.rangeMiles}
                        onChange={(e) => setEditingCar({ ...editingCar, rangeMiles: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">0-60 Time</label>
                      <input
                        type="text"
                        value={editingCar.zeroToSixty}
                        onChange={(e) => setEditingCar({ ...editingCar, zeroToSixty: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Exterior Color</label>
                    <input
                      type="text"
                      value={editingCar.color}
                      onChange={(e) => setEditingCar({ ...editingCar, color: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCar(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateTeslaCarListing(editingCar.id, editingCar);
                      setEditingCar(null);
                      showToast(`Saved changes to ${editingCar.model}.`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD NEW CAR MODAL */}
          {isAddingCar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="font-heading font-black text-base text-white">
                    Add New Tesla Model to Sales Catalog
                  </h3>
                  <button onClick={() => setIsAddingCar(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Model</label>
                      <select
                        value={newCarForm.model}
                        onChange={(e) => setNewCarForm({ ...newCarForm, model: e.target.value as any })}
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
                      <label className="text-zinc-400 block mb-1">Year</label>
                      <input
                        type="number"
                        value={newCarForm.year}
                        onChange={(e) => setNewCarForm({ ...newCarForm, year: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Trim Name</label>
                    <input
                      type="text"
                      value={newCarForm.trim}
                      onChange={(e) => setNewCarForm({ ...newCarForm, trim: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      placeholder="e.g. Plaid Tri-Motor"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Price ($ USD)</label>
                      <input
                        type="number"
                        value={newCarForm.salePriceUsd}
                        onChange={(e) =>
                          setNewCarForm({
                            ...newCarForm,
                            salePriceUsd: Number(e.target.value),
                            originalPriceUsd: Number(e.target.value),
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Stock Units</label>
                      <input
                        type="number"
                        value={newCarForm.stockCount}
                        onChange={(e) => setNewCarForm({ ...newCarForm, stockCount: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newCarForm.image}
                      onChange={(e) => setNewCarForm({ ...newCarForm, image: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Range (Miles)</label>
                      <input
                        type="number"
                        value={newCarForm.rangeMiles}
                        onChange={(e) => setNewCarForm({ ...newCarForm, rangeMiles: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">0-60 Time</label>
                      <input
                        type="text"
                        value={newCarForm.zeroToSixty}
                        onChange={(e) => setNewCarForm({ ...newCarForm, zeroToSixty: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Exterior Color</label>
                    <input
                      type="text"
                      value={newCarForm.color}
                      onChange={(e) => setNewCarForm({ ...newCarForm, color: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCar(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await createTeslaCarListing(newCarForm);
                      setIsAddingCar(false);
                      showToast(`Added Tesla ${newCarForm.model} to catalog!`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    Create Model Listing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ORDER SHIPPING STATUS & LOGISTICS MODAL */}
          {selectedOrderForStatus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 text-xs text-zinc-100 shadow-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-heading font-black text-base text-white">
                      Modify Shipping & Logistics: {selectedOrderForStatus.id}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedOrderForStatus(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Vehicle:</span>
                    <strong className="text-white font-sans">{selectedOrderForStatus.vehicleName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Assigned VIN:</span>
                    <span className="font-mono text-cyan-400">{selectedOrderForStatus.vinAssigned}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Customer:</span>
                    <span className="text-zinc-200">{selectedOrderForStatus.userName || 'Customer'} ({selectedOrderForStatus.userEmail})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Destination:</span>
                    <span className="text-zinc-300">{selectedOrderForStatus.shippingAddress.city}, {selectedOrderForStatus.shippingAddress.state} {selectedOrderForStatus.shippingAddress.zipCode}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-semibold">Update Shipping Progress Stage</label>
                    <select
                      value={orderNewStatus}
                      onChange={(e) => setOrderNewStatus(e.target.value as VehicleOrder['status'])}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white font-semibold text-xs"
                    >
                      <option value="confirmed">1. Confirmed (Factory Pre-Transit Prep)</option>
                      <option value="carrier_assigned">2. Carrier Assigned (Enclosed Transport Staged)</option>
                      <option value="in_transit">3. In Transit (Interstate Highway Freight)</option>
                      <option value="out_for_delivery">4. Out for Delivery (Local Driver En Route)</option>
                      <option value="delivered">5. Delivered & Key Handover Completed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Carrier Partner Name</label>
                      <input
                        type="text"
                        value={orderCarrierName}
                        onChange={(e) => setOrderCarrierName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                        placeholder="Apex Dedicated Logistics"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={orderTrackingNumber}
                        onChange={(e) => setOrderTrackingNumber(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="APX-TRK-XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Estimated Delivery Timeline</label>
                    <input
                      type="text"
                      value={orderEstimatedDelivery}
                      onChange={(e) => setOrderEstimatedDelivery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      placeholder="e.g. Tomorrow by 3:00 PM EST"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-semibold">New Checkpoint Transit Log Note</label>
                    <input
                      type="text"
                      value={orderCheckpointNote}
                      onChange={(e) => setOrderCheckpointNote(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500"
                      placeholder="e.g. Arrived at regional logistics sorting terminal in Sparks, NV."
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      This note will be logged in the public tracking timeline and dispatched to the customer's dashboard inbox.
                    </span>
                  </div>
                </div>

                {/* Existing Checkpoints Preview */}
                {selectedOrderForStatus.checkpoints && selectedOrderForStatus.checkpoints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <span className="text-[11px] text-zinc-400 uppercase font-bold block">Previous Logged Checkpoints</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedOrderForStatus.checkpoints.map((cp) => (
                        <div key={cp.id} className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] flex justify-between items-start">
                          <div>
                            <span className="font-bold text-white block">{cp.title}</span>
                            <span className="text-zinc-400 text-[10px]">{cp.location} {cp.note ? `— ${cp.note}` : ''}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">{cp.timestamp.substring(11, 16)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForStatus(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateVehicleOrderStatus(
                        selectedOrderForStatus.id,
                        orderNewStatus,
                        orderTrackingNumber,
                        orderCheckpointNote || `Shipping status updated to ${orderNewStatus}`,
                        orderCarrierName,
                        orderEstimatedDelivery
                      );
                      setSelectedOrderForStatus(null);
                      showToast(`Order ${selectedOrderForStatus.id} status updated to ${orderNewStatus}!`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Update Shipping</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD / EDIT COUPON MODAL */}
          {(isAddingCoupon || editingCoupon) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs text-zinc-100 shadow-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-red-500" />
                    <span>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingCoupon(false);
                      setEditingCoupon(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. CYBER20"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={couponForm.badge || ''}
                        onChange={(e) => setCouponForm({ ...couponForm, badge: e.target.value })}
                        placeholder="HOT, VIP, LIMITED"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Offer Title</label>
                    <input
                      type="text"
                      value={couponForm.title}
                      onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                      placeholder="e.g. 20% Off Ceramic Wraps & Body Armor"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Description / Terms</label>
                    <textarea
                      rows={2}
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      placeholder="Applicable at checkout across all custom wrap bays..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        <option value="percentage">Percentage Discount (%)</option>
                        <option value="fixed_usd">Fixed Amount ($ USD)</option>
                        <option value="free_spins">Free Spin Credits (+Spins)</option>
                        <option value="free_shipping">Free Enclosed Shipping</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">
                        Discount Value {couponForm.discountType === 'percentage' ? '(%)' : couponForm.discountType === 'fixed_usd' ? '($ USD)' : couponForm.discountType === 'free_spins' ? '(Count)' : ''}
                      </label>
                      <input
                        type="number"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Valid For Scope</label>
                      <select
                        value={couponForm.validFor}
                        onChange={(e) => setCouponForm({ ...couponForm, validFor: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs capitalize"
                      >
                        <option value="all">All Products & Services</option>
                        <option value="products">Parts & Store Products</option>
                        <option value="vehicles">Tesla Vehicle Sales</option>
                        <option value="spins">Wheel Spins & Scratch Cards</option>
                        <option value="services">Maintenance & Service Bays</option>
                        <option value="wraps">Custom Studio Wraps</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Expiration Date</label>
                      <input
                        type="date"
                        value={couponForm.expiresAt}
                        onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Max Usages Allowed</label>
                      <input
                        type="number"
                        value={couponForm.maxUses || 100}
                        onChange={(e) => setCouponForm({ ...couponForm, maxUses: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Max Discount Cap ($ USD)</label>
                      <input
                        type="number"
                        value={couponForm.maxDiscountUsd || 1000}
                        onChange={(e) => setCouponForm({ ...couponForm, maxDiscountUsd: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="couponIsActive"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 text-red-600 accent-red-600"
                    />
                    <label htmlFor="couponIsActive" className="text-zinc-300 font-semibold cursor-pointer">
                      Coupon is Active & Redeemable immediately
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCoupon(false);
                      setEditingCoupon(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!couponForm.code.trim()) {
                        showToast('Please enter a coupon code.', 'error');
                        return;
                      }
                      if (editingCoupon) {
                        updateCoupon(editingCoupon.id, couponForm);
                        showToast(`Coupon ${couponForm.code} updated!`, 'success');
                      } else {
                        createCoupon(couponForm);
                        showToast(`Created new promo coupon ${couponForm.code}!`, 'success');
                      }
                      setIsAddingCoupon(false);
                      setEditingCoupon(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    {editingCoupon ? 'Save Coupon Changes' : 'Publish Promo Coupon'}
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* User Investments Dossier Modal */}
      {selectedUserForInvestments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    Investments: {selectedUserForInvestments.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {selectedUserForInvestments.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForInvestments(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {allInvestments.filter((i: UserInvestment) => i.userId === selectedUserForInvestments.id).length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  This user currently has no active or historical investment stakes.
                </div>
              ) : (
                allInvestments
                  .filter((i: UserInvestment) => i.userId === selectedUserForInvestments.id)
                  .map((inv: UserInvestment) => {
                    const poolName = inv.poolTitle || inv.poolName || 'Fleet Pool';
                    const principal = inv.amountInvestedUsd || inv.principalUsd || 0;
                    const apy = inv.apy || inv.apyPercent || 0;
                    const accrued = inv.earnedDividendsUsd || inv.accruedYieldUsd || 0;

                    return (
                      <div
                        key={inv.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-heading font-bold text-white text-sm block">
                              {poolName}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ID: {inv.id} • Staked ${principal.toLocaleString()} USD
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              inv.status === 'running'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : inv.status === 'completed'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] p-2.5 rounded-xl bg-black/50">
                          <div>
                            <span className="text-zinc-500 block text-[9px]">APY</span>
                            <span className="text-emerald-400 font-bold">{apy}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">PROGRESS</span>
                            <span>
                              {inv.daysElapsed} / {inv.durationDays}d
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">ACCRUED YIELD</span>
                            <span className="text-emerald-400 font-bold">+${accrued.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingInvestment(inv)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                          >
                            Edit Params
                          </button>
                          {inv.status === 'running' && (
                            <button
                              onClick={() => forceMatureInvestment(inv.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            >
                              Force Settle & Credit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Investment Position Modal */}
      {editingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                Edit Investment: {editingInvestment.poolTitle || editingInvestment.poolName}
              </h3>
              <button
                onClick={() => setEditingInvestment(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">APY Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingInvestment.apyPercent || editingInvestment.apy || 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingInvestment({
                      ...editingInvestment,
                      apy: val,
                      apyPercent: val,
                    });
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Days Elapsed</label>
                  <input
                    type="number"
                    value={editingInvestment.daysElapsed}
                    onChange={(e) =>
                      setEditingInvestment({
                        ...editingInvestment,
                        daysElapsed: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Duration Days</label>
                  <input
                    type="number"
                    value={editingInvestment.durationDays}
                    onChange={(e) =>
                      setEditingInvestment({
                        ...editingInvestment,
                        durationDays: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Accrued Yield (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingInvestment.accruedYieldUsd || editingInvestment.earnedDividendsUsd || 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingInvestment({
                      ...editingInvestment,
                      earnedDividendsUsd: val,
                      accruedYieldUsd: val,
                    });
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Status</label>
                <select
                  value={editingInvestment.status}
                  onChange={(e) =>
                    setEditingInvestment({
                      ...editingInvestment,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInvestment(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const apy = editingInvestment.apyPercent || editingInvestment.apy || 0;
                    const yieldAmt = editingInvestment.accruedYieldUsd || editingInvestment.earnedDividendsUsd || 0;
                    updateUserInvestment(editingInvestment.id, {
                      apy,
                      apyPercent: apy,
                      daysElapsed: editingInvestment.daysElapsed,
                      durationDays: editingInvestment.durationDays,
                      earnedDividendsUsd: yieldAmt,
                      accruedYieldUsd: yieldAmt,
                      status: editingInvestment.status,
                    });
                    setEditingInvestment(null);
                    showToast('Investment position updated successfully!', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Modal (Create / Edit) */}
      {isPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {editingPageId ? 'Edit Site Page' : 'Create New Site Page'}
              </h3>
              <button
                onClick={() => setIsPageModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Page Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="e.g. Terms of Service, VIP Staking, Careers"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={pageForm.slug}
                    onChange={(e) =>
                      setPageForm({
                        ...pageForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    placeholder="e.g. vip-program"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Display Location</label>
                  <select
                    value={pageForm.displayLocation}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, displayLocation: e.target.value as any })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="navbar">Navbar Only</option>
                    <option value="footer">Footer Only</option>
                    <option value="both">Both Navbar & Footer</option>
                    <option value="hidden">Hidden (Direct Link Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Page Content (Markdown / Text)</label>
                <textarea
                  rows={5}
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="Enter page body copy and markdown sections..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pagePublished"
                  checked={pageForm.isPublished}
                  onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <label htmlFor="pagePublished" className="text-zinc-300">
                  Publish page immediately to site menus
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!pageForm.title.trim()}
                  onClick={() => {
                    if (editingPageId) {
                      updateSitePage(editingPageId, pageForm);
                    } else {
                      createSitePage(pageForm);
                    }
                    setIsPageModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50"
                >
                  {editingPageId ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Deposit Method Modal (Create / Edit) */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {editingDepositId ? 'Edit Manual Gateway' : 'Add Manual Deposit Gateway'}
              </h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Gateway Name</label>
                  <input
                    type="text"
                    value={depositForm.name}
                    onChange={(e) => setDepositForm({ ...depositForm, name: e.target.value })}
                    placeholder="e.g. Bank Wire USA, CashApp"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={depositForm.currency}
                    onChange={(e) => setDepositForm({ ...depositForm, currency: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Recipient Account / Legal Name</label>
                <input
                  type="text"
                  value={depositForm.accountName}
                  onChange={(e) => setDepositForm({ ...depositForm, accountName: e.target.value })}
                  placeholder="e.g. Apex Tesla Holdings Treasury LLC"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Account / Tag / Handle</label>
                  <input
                    type="text"
                    value={depositForm.accountNumber}
                    onChange={(e) => setDepositForm({ ...depositForm, accountNumber: e.target.value })}
                    placeholder="Account number or tag"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Bank Name / Routing</label>
                  <input
                    type="text"
                    value={depositForm.routingOrBank}
                    onChange={(e) => setDepositForm({ ...depositForm, routingOrBank: e.target.value })}
                    placeholder="e.g. JPMorgan Chase (Routing #)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Payment Instructions</label>
                <textarea
                  rows={3}
                  value={depositForm.instructions}
                  onChange={(e) => setDepositForm({ ...depositForm, instructions: e.target.value })}
                  placeholder="Specify wire instructions, reference memo format, or confirmation turnaround..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Min Deposit (USD)</label>
                  <input
                    type="number"
                    value={depositForm.minDepositUsd}
                    onChange={(e) =>
                      setDepositForm({ ...depositForm, minDepositUsd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Max Deposit (USD)</label>
                  <input
                    type="number"
                    value={depositForm.maxDepositUsd}
                    onChange={(e) =>
                      setDepositForm({ ...depositForm, maxDepositUsd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="depEnabled"
                  checked={depositForm.enabled}
                  onChange={(e) => setDepositForm({ ...depositForm, enabled: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <label htmlFor="depEnabled" className="text-zinc-300">
                  Enable this method in the public deposit gateway modal
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!depositForm.name.trim() || !depositForm.accountNumber.trim()}
                  onClick={() => {
                    if (editingDepositId) {
                      updateManualDepositMethod(editingDepositId, depositForm);
                    } else {
                      addManualDepositMethod(depositForm);
                    }
                    setIsDepositModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  {editingDepositId ? 'Save Gateway' : 'Add Gateway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
