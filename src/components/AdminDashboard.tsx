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
  Coins,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Megaphone,
  ArrowUp,
  ArrowDown,
  Package,
  Gift,
  RotateCcw,
  Navigation,
  UserPlus,
  KeyRound,
  LogOut,
  ShieldAlert,
  Award,
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
  TeslaStockQuote,
  FeaturedStockPlan,
  WithdrawalRequest,
  WithdrawalSettings,
  WheelReward,
  FeatureToggles,
  AutoCryptoGateway,
  MarketingBanner,
  BannerSizeType,
  Banner3dPreset,
  NavigationMenuItem,
  MenuLocation,
  ProductItem,
  ScratchCardTier,
  SiteSettings,
  AdminPrivilege,
  CronDispatchedEmail,
} from '../types';
import { AdminVisitorAnalytics } from './AdminVisitorAnalytics';
import { AdminSeoFaqManager } from './AdminSeoFaqManager';
import { AdminWonPrizesManager } from './AdminWonPrizesManager';
import { AdminPromoVideosManager } from './AdminPromoVideosManager';
import { AdminCertificatesManager } from './AdminCertificatesManager';

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
  | 'admins_mgmt'
  | 'investment_mgmt'
  | 'withdrawals_mgmt'
  | 'stocks_mgmt'
  | 'auto_gateways'
  | 'spins_cms'
  | 'promo_banners'
  | 'feature_switches'
  | 'notifications_hub'
  | 'car_sales'
  | 'site_editor'
  | 'seo_faq_cms'
  | 'certificates_cms'
  | 'visitors_analytics'
  | 'email_marketing'
  | 'fleet_ops';

const ADMIN_PRIVILEGE_CATALOG: {
  id: AdminPrivilege;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'super_admin',
    label: 'Super-Admin (Full Access)',
    description: 'Unrestricted access to all modules, feature switches & security policies',
    color: 'amber',
  },
  {
    id: 'manage_admins',
    label: 'Admin Team & Privileges',
    description: 'Create new administrators, edit assigned permissions & revoke access',
    color: 'rose',
  },
  {
    id: 'manage_users',
    label: 'Users, Profiles & KYC',
    description: 'Review user KYC, adjust vault balances, suspend/flag accounts',
    color: 'cyan',
  },
  {
    id: 'manage_investments',
    label: 'Investments, Stocks & Cron',
    description: 'Manage staking pools, TSLA stock plans, ROI cron & early maturity',
    color: 'emerald',
  },
  {
    id: 'manage_withdrawals',
    label: 'Withdrawals & Gateways',
    description: 'Approve user crypto/wire payouts, $200 rule & Web3 RPC gateways',
    color: 'indigo',
  },
  {
    id: 'manage_cars_store',
    label: 'Car Sales, Shipping & Orders',
    description: 'Manage Tesla vehicle inventory, MSRP, shipping rates & vehicle orders',
    color: 'blue',
  },
  {
    id: 'manage_site_cms',
    label: 'Site CMS, Pages & Menus',
    description: 'Edit site settings, custom pages, nav menus, products & manual deposit methods',
    color: 'purple',
  },
  {
    id: 'manage_marketing',
    label: 'Promos, Spins, Mail & Alerts',
    description: 'Manage spin wheel rewards, AI promo banners, SMTP mailer & user notifications',
    color: 'orange',
  },
  {
    id: 'manage_fleet_ops',
    label: 'Fleet Bays & Ops AI Copilot',
    description: 'Oversee service bays, Mobile Ranger dispatch & Gemini Ops Copilot',
    color: 'teal',
  },
];

const ADMIN_ROLE_PRESETS: { label: string; privileges: AdminPrivilege[] }[] = [
  {
    label: 'Super Admin',
    privileges: [
      'super_admin',
      'manage_admins',
      'manage_users',
      'manage_investments',
      'manage_cars_store',
      'manage_withdrawals',
      'manage_site_cms',
      'manage_marketing',
      'manage_fleet_ops',
    ],
  },
  {
    label: 'Site CMS & Inventory Manager',
    privileges: ['manage_site_cms', 'manage_cars_store', 'manage_marketing'],
  },
  {
    label: 'Finance & Withdrawals Officer',
    privileges: ['manage_withdrawals', 'manage_investments', 'manage_users'],
  },
  {
    label: 'Customer Support & KYC Lead',
    privileges: ['manage_users', 'manage_fleet_ops', 'manage_marketing'],
  },
];

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
    siteSettings,
    updateSiteSettings,
    sitePages,
    navigationMenus,
    createNavigationMenuItem,
    updateNavigationMenuItem,
    deleteNavigationMenuItem,
    reorderNavigationMenuItem,
    resetNavigationMenus,
    manualDepositMethods,
    socialLinks,
    investmentPools,
    productsList,
    scratchCardTiers,
    createScratchCardTier,
    updateScratchCardTier,
    deleteScratchCardTier,
    rentalFleetList,
    cronActive,
    toggleCronActive,
    cronCyclesCount,
    lastCronRunAt,
    cronLogs,
    dispatchedCronEmails,
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
    // Stocks & Spot CMS
    tslaQuote,
    updateStockQuote,
    featuredStockPlans,
    createFeaturedStockPlan,
    updateFeaturedStockPlan,
    deleteFeaturedStockPlan,
    // Withdrawals & Eligibility Rules
    withdrawalSettings,
    updateWithdrawalSettings,
    withdrawalRequests,
    processWithdrawalRequest,
    // Spins & Rewards CMS
    spinCostUsd,
    updateSpinCost,
    wheelRewards,
    updateWheelRewards,
    updateWheelReward,
    addWheelReward,
    deleteWheelReward,
    // Platform Feature Switches
    featureToggles,
    updateFeatureToggles,
    // Automated Crypto Gateways & RPC Nodes
    autoCryptoGateways,
    updateAutoCryptoGateway,
    addAutoCryptoGateway,
    deleteAutoCryptoGateway,
    testAutoCryptoGatewayPing,
    // Promotional Marketing Banners & Videos CMS
    marketingBanners,
    createMarketingBanner,
    updateMarketingBanner,
    deleteMarketingBanner,
    promoVideos,
    // Currencies, Won Prizes, SEO, Sitemap, RSS, FAQs
    getUserWalletBalances,
    currencies,
    updateCurrencyConfig,
    addCurrencyConfig,
    deleteCurrencyConfig,
    wonPrizes,
    sitemapEntries,
    rssFeedItems,
    faqsList,
    businessCertificates,
    // Admin RBAC & Session Controls
    sessionToken,
    adminsList,
    fetchAdmins,
    createAdminAccount,
    upgradeUserToAdmin,
    updateAdminPrivileges,
    deleteAdminAccount,
    hasAdminPrivilege,
    logout,
    firebaseCloudConnected,
    isSyncingFirestore,
    syncAllAdminSettingsToFirestore,
    connectAdminCloudSync,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('users_kyc');

  // Admin Team & Privileges State
  const [adminProvisionMode, setAdminProvisionMode] = useState<'create' | 'upgrade'>('create');
  const [upgradeTargetUserId, setUpgradeTargetUserId] = useState<string>('');
  const [newAdminForm, setNewAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    adminRoleLabel: string;
    location: string;
    phone: string;
    adminPrivileges: AdminPrivilege[];
  }>({
    name: '',
    email: '',
    password: '',
    adminRoleLabel: 'Site CMS & Inventory Manager',
    location: 'Austin Gigafactory Hub',
    phone: '',
    adminPrivileges: ['manage_site_cms', 'manage_cars_store'],
  });
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreateError, setAdminCreateError] = useState<string | null>(null);
  const [editingAdminTarget, setEditingAdminTarget] = useState<User | null>(null);
  const [editingAdminRoleLabel, setEditingAdminRoleLabel] = useState('');
  const [editingAdminPrivileges, setEditingAdminPrivileges] = useState<AdminPrivilege[]>([]);
  const [isSavingAdminPrivs, setIsSavingAdminPrivs] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // AI & Manual Promotional Banner Generator State (with 3D / HD Support)
  const [aiBannerGoal, setAiBannerGoal] = useState('Promote TSLA 28.5% Fast ROI Pools, Cybertruck Sales & $100 Referral Rewards');
  const [aiBannerSize, setAiBannerSize] = useState<BannerSizeType>('leaderboard');
  const [aiBannerTone, setAiBannerTone] = useState('Luxury High-Octane EV');
  const [aiBannerTargetTab, setAiBannerTargetTab] = useState('stocks');
  const [aiBannerIs3dHd, setAiBannerIs3dHd] = useState(true);
  const [aiBannerStyle3d, setAiBannerStyle3d] = useState<Banner3dPreset>('cyber_perspective');
  const [aiBannerQuality, setAiBannerQuality] = useState<'4K UHD' | 'HD 1080p'>('4K UHD');
  const [aiBannerCarModel, setAiBannerCarModel] = useState('Cybertruck Cyberbeast');
  const [isGeneratingAiBanner, setIsGeneratingAiBanner] = useState(false);
  const [isGeneratingAllSizes, setIsGeneratingAllSizes] = useState(false);
  const [showManualBannerModal, setShowManualBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [manualBannerForm, setManualBannerForm] = useState<Omit<MarketingBanner, 'id' | 'createdAt' | 'clicksCount'>>({
    title: 'Cybertruck VIP Referral Leaderboard',
    size: 'leaderboard',
    dimensions: '1456×180 HD',
    customWidth: 728,
    customHeight: 90,
    imageMode: 'multi',
    transitionEffect: 'fade',
    headline: 'TESLA CYBERBEAST DIRECT DELIVERY + $100 REFERRAL BONUS',
    subheadline: 'Nationwide enclosed transport, 7-day money-back protection & instant crypto settlement.',
    ctaText: 'Explore Inventory',
    badgeText: '3D 4K UHD • LEADERBOARD',
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
  });
  const [isUploadingBannerSlides, setIsUploadingBannerSlides] = useState(false);

  // Auto Crypto Gateways Admin Local State
  const [gatewayNetworkFilter, setGatewayNetworkFilter] = useState<string>('all');
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [gatewayEditDraft, setGatewayEditDraft] = useState<Partial<AutoCryptoGateway>>({});
  const [isAddGatewayModalOpen, setIsAddGatewayModalOpen] = useState(false);
  const [pingingGatewayId, setPingingGatewayId] = useState<string | null>(null);
  const [showWebhookSecret, setShowWebhookSecret] = useState<{ [id: string]: boolean }>({});
  const [newGatewayForm, setNewGatewayForm] = useState<Omit<AutoCryptoGateway, 'id' | 'lastPingSuccess' | 'totalProcessedUsd' | 'totalTransactionsCount'>>({
    name: 'Tether TRC-20 Automated Node',
    network: 'TRC20',
    currency: 'USDT',
    symbol: 'USDT-TRC20',
    receivingAddress: 'TYDzsYUEpvnYmQK4WKnmbukC44FgwTRC20',
    rpcEndpoint: 'https://api.trongrid.io/jsonrpc',
    webhookSecret: 'whsec_trc20_' + Math.random().toString(36).substring(2, 10),
    requiredConfirmations: 19,
    minDepositUsd: 20,
    maxDepositUsd: 100000,
    feePercent: 0,
    autoCreditEnabled: true,
    autoPayoutEnabled: false,
    status: 'active',
  });

  // Tesla Car Sales & Nationwide Logistics Admin State
  const [carSalesSubTab, setCarSalesSubTab] = useState<'inventory' | 'won_prizes' | 'shipping' | 'refund_policy' | 'orders' | 'coupons'>('inventory');
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

  // User Profile, Activity & KYC modal state
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<User | null>(null);
  const [selectedUserForInvestments, setSelectedUserForInvestments] = useState<User | null>(null);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<User | null>(null);
  const [directNotificationUser, setDirectNotificationUser] = useState<User | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState('Photo ID blur on document number edge. Please provide higher resolution color scan.');
  const [showBalanceAdjustModal, setShowBalanceAdjustModal] = useState<User | null>(null);
  const [adjustCurrency, setAdjustCurrency] = useState<CryptoCurrency | 'USD'>('USD');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustMode, setAdjustMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [newCurrencyForm, setNewCurrencyForm] = useState<{ code: string; name: string; symbol: string; multiplier: number }>({
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    multiplier: 129,
  });

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
  const [siteCmsSubTab, setSiteCmsSubTab] = useState<
    'pages' | 'menus' | 'products' | 'promo_content' | 'manual_deposits' | 'socials' | 'catalog' | 'global_settings'
  >('pages');

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

  // Navigation Menu CRUD state
  const [menuLocationFilter, setMenuLocationFilter] = useState<'all' | MenuLocation>('all');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<Omit<NavigationMenuItem, 'id'>>({
    label: '',
    targetTab: 'home',
    location: 'navbar',
    order: 1,
    badge: '',
    highlight: false,
    isVisible: true,
    iconName: 'Tag',
    isSystem: false,
  });

  // Product Inventory CRUD state
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<ProductItem, 'id'>>({
    name: '',
    category: 'Charging & Tech',
    priceUsd: 299,
    description: '',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    compatibility: 'Model 3, Model Y, Model S, Model X, Cybertruck',
    inStock: true,
  });

  // Scratch Card Promotional Tier CRUD state
  const [isScratchModalOpen, setIsScratchModalOpen] = useState(false);
  const [editingScratchId, setEditingScratchId] = useState<string | null>(null);
  const [scratchForm, setScratchForm] = useState<Omit<ScratchCardTier, 'id'>>({
    name: 'Hyperion Cyber Vault',
    priceUsd: 250,
    maxPrizeUsd: 5000,
    gradient: 'from-amber-600 via-red-600 to-rose-700',
    textColor: 'text-white',
    description: 'High-stakes promotional scratch foil featuring instant USDT vault credits & Cybertruck service vouchers.',
    possiblePrizes: [
      { amountUsd: 5000, label: 'Apex Vault Grand Prize ($5,000)', weight: 2 },
      { amountUsd: 1000, label: 'Giga Crypto Payout ($1,000)', weight: 10 },
      { amountUsd: 350, label: 'Supercharging Pass ($350)', weight: 30 },
      { amountUsd: 100, label: 'Cashback Bonus ($100)', weight: 58 },
    ],
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

  // SMTP Settings & Automated Dispatch Logs state
  const [localSmtp, setLocalSmtp] = useState<SmtpConfig>(smtpConfig);
  const [testEmailRecipient, setTestEmailRecipient] = useState(currentUser?.email || 'admin@apex-tesla.io');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailScenario, setTestEmailScenario] = useState<string>('normal');
  const [lastTestEmailResult, setLastTestEmailResult] = useState<TestEmailResult | null>(null);
  const [smtpServerLog, setSmtpServerLog] = useState<string | null>(null);
  const [mailerLogs, setMailerLogs] = useState<CronDispatchedEmail[]>([]);
  const [smtpEnvSummary, setSmtpEnvSummary] = useState<{
    configured: boolean;
    host: string;
    port: number;
    secure: boolean;
    fromEmail: string;
  } | null>(null);
  const [isLoadingMailerLogs, setIsLoadingMailerLogs] = useState(false);

  const fetchMailerLogs = React.useCallback(async () => {
    setIsLoadingMailerLogs(true);
    try {
      const token = sessionToken || localStorage.getItem('apex_session_token');
      const res = await fetch('/api/mailer/logs', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) setMailerLogs(data.logs);
        if (data.smtpSummary) setSmtpEnvSummary(data.smtpSummary);
      }
    } catch {
      // keep existing logs
    } finally {
      setIsLoadingMailerLogs(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (activeAdminTab === 'email_marketing') {
      fetchMailerLogs();
    }
  }, [activeAdminTab, fetchMailerLogs]);

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

  // Site Function Editor state (synced with global AppContext siteSettings)
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(siteSettings);
  useEffect(() => {
    setSiteSettingsForm(siteSettings);
  }, [siteSettings]);

  // Withdrawals Management State
  const [withdrawalTxInputs, setWithdrawalTxInputs] = useState<Record<string, string>>({});
  const [withdrawalRejectInputs, setWithdrawalRejectInputs] = useState<Record<string, string>>({});
  const [withdrawalFilterStatus, setWithdrawalFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Tesla Stocks & Fast-ROI CMS State
  const [stockQuoteEditForm, setStockQuoteEditForm] = useState({
    price: tslaQuote.price,
    change24h: tslaQuote.change24h,
    dayHigh: tslaQuote.dayHigh,
    dayLow: tslaQuote.dayLow,
    volume: tslaQuote.volume,
  });
  const [editingStockPlan, setEditingStockPlan] = useState<FeaturedStockPlan | null>(null);
  const [isAddingStockPlan, setIsAddingStockPlan] = useState(false);
  const [stockPlanForm, setStockPlanForm] = useState<Omit<FeaturedStockPlan, 'id' | 'subscribersCount'>>({
    title: 'Cyber-Optimus Accelerated Fleet Pool',
    name: 'Cyber-Optimus Accelerated Fleet Pool',
    ticker: 'TSLA-CYBER',
    category: 'Autonomous AI',
    tier: 'Cyber-Optimus',
    badge: 'ACCELERATED 28.5%',
    description: 'Autonomous Robotaxi and Optimus Bot robotics production allocation. 14-day cycle with direct profit share.',
    minInvestmentUsd: 500,
    maxInvestmentUsd: 25000,
    apy: 28.5,
    durationDays: 14,
    dailyYieldPercent: 2.03,
    totalExpectedRoiPercent: 28.5,
    totalSubscribedUsd: 0,
    expectedRoiPercent: 28.5,
    lockPeriodDays: 14,
    riskLevel: 'Moderate',
    accelerationFactor: '2.5x Standard TSLA',
    isActive: true,
  });

  // Spins CMS State
  const [localSpinCost, setLocalSpinCost] = useState<number>(spinCostUsd);
  const [editingReward, setEditingReward] = useState<WheelReward | null>(null);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newRewardForm, setNewRewardForm] = useState<Omit<WheelReward, 'id'>>({
    label: '$100 Vault Credit',
    text: '$100',
    valueUsd: 100,
    value: 100,
    type: 'usd',
    vehicleModel: 'Tesla Model 3 Performance',
    color: '#06b6d4',
    textColor: '#ffffff',
    weight: 8,
    probabilityWeight: 8,
    isActive: true,
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

  const ALL_ADMIN_CATEGORIES: {
    id: AdminTab;
    requiredPrivilege: AdminPrivilege;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'users_kyc',
      requiredPrivilege: 'manage_users',
      label: 'All Users & KYC Management',
      shortLabel: 'Users & Profiles',
      description: 'Audit user profiles, online telemetry, last visits & individual actions',
      icon: Users,
      badge: `${allUsers.length} Users`,
    },
    {
      id: 'admins_mgmt',
      requiredPrivilege: 'manage_admins',
      label: 'Admin Accounts & Privileges (RBAC)',
      shortLabel: 'Admin Roles',
      description: 'Create new administrators, assign role privileges & manage executive access',
      icon: Shield,
      badge: `${adminsList.length || 1} Admins`,
    },
    {
      id: 'investment_mgmt',
      requiredPrivilege: 'manage_investments',
      label: 'Investments & Automated ROI Cron',
      shortLabel: 'Fleet Investments',
      description: 'Manage user stakes, APY yields, maturity payouts & Cron scheduler',
      icon: TrendingUp,
      badge: `${allInvestments.length} Active`,
    },
    {
      id: 'notifications_hub',
      requiredPrivilege: 'manage_marketing',
      label: 'Notification Message Dashboard',
      shortLabel: 'Notifications',
      description: 'Send custom broadcast or individual user inbox notifications & alerts',
      icon: Bell,
      badge: `${adminNotifications.length} Sent`,
    },
    {
      id: 'car_sales',
      requiredPrivilege: 'manage_cars_store',
      label: 'Tesla Car Sales, Shipping & Refunds',
      shortLabel: 'Car Sales & Logistics',
      description: 'Vehicle inventory, MSRP, nationwide shipping flat-rates & 7-day money-back guarantee',
      icon: Car,
      badge: `${teslaCarListings.length} Vehicles`,
    },
    {
      id: 'site_editor',
      requiredPrivilege: 'manage_site_cms',
      label: 'Site CMS, Gateways & Menus',
      shortLabel: 'Site CMS & Gateways',
      description: 'Create & delete pages, manual deposit gateways, social URLs, currency multipliers & catalog',
      icon: Sliders,
      badge: `${sitePages.length} Pages`,
    },
    {
      id: 'seo_faq_cms',
      requiredPrivilege: 'manage_site_cms',
      label: 'SEO, Logo/Favicon, Sitemap, RSS & FAQs',
      shortLabel: 'SEO, RSS & FAQs',
      description: 'Upload JPG/PNG logo & favicon, manage meta/schema tags, RSS articles, XML sitemap & 24+ FAQ slider cards',
      icon: Globe,
      badge: `${faqsList.length} FAQs • ${rssFeedItems.length} RSS • ${sitemapEntries.length} URLs`,
    },
    {
      id: 'certificates_cms',
      requiredPrivilege: 'manage_site_cms',
      label: 'Business & License Certificates CMS',
      shortLabel: 'License Certificates',
      description: 'Upload, edit, reorder & publish non-downloadable view-only business & operating license images',
      icon: Award,
      badge: `${businessCertificates.length} Docs`,
    },
    {
      id: 'visitors_analytics',
      requiredPrivilege: 'manage_users',
      label: 'Visitor Analytics & Live Activity',
      shortLabel: 'Visitor Analytics',
      description: 'Live telemetry tracking visitor IP, country, mobile device type, browser, OS & page actions',
      icon: Activity,
      badge: 'Live Geo/Device',
    },
    {
      id: 'email_marketing',
      requiredPrivilege: 'manage_marketing',
      label: 'Email Marketing & SMTP Mailer',
      shortLabel: 'Email & SMTP',
      description: 'Configure SMTP relays, test delivery with diagnostics & send campaigns',
      icon: Mail,
      badge: 'PHP/SMTP',
    },
    {
      id: 'withdrawals_mgmt',
      requiredPrivilege: 'manage_withdrawals',
      label: 'User Withdrawals & $200 Deposit Rule',
      shortLabel: 'Withdrawals & AML',
      description: 'Review pending payouts, approve on-chain tx hashes & configure minimum $200 deposit policy',
      icon: CreditCard,
      badge: `${withdrawalRequests.filter((r) => r.status === 'pending').length} Pending`,
    },
    {
      id: 'stocks_mgmt',
      requiredPrivilege: 'manage_investments',
      label: 'Tesla Live Stocks & Fast ROI CMS',
      shortLabel: 'Tesla Stocks & Fast ROI',
      description: 'Manage TSLA live quote, base prices, spot trading & high-yield accelerated stock plans',
      icon: Activity,
      badge: `${featuredStockPlans.length} Plans`,
    },
    {
      id: 'auto_gateways',
      requiredPrivilege: 'manage_withdrawals',
      label: 'Auto Crypto Gateways & Web3 RPC Nodes',
      shortLabel: 'Auto Crypto Gateways',
      description: 'Configure automated blockchain receiving addresses, RPC nodes, webhook secrets, confirmations & latency ping',
      icon: Server,
      badge: `${autoCryptoGateways.filter((g) => g.status === 'active').length} Active`,
    },
    {
      id: 'spins_cms',
      requiredPrivilege: 'manage_marketing',
      label: 'Spins Rewards & Spin Cost CMS',
      shortLabel: 'Spins & Rewards',
      description: 'Set execution spin cost ($USD/credits), customize wheel prizes, colors and probability weights',
      icon: Coins,
      badge: `$${spinCostUsd} / Spin`,
    },
    {
      id: 'promo_banners',
      requiredPrivilege: 'manage_marketing',
      label: 'Promotional Banners & Gemini AI Studio',
      shortLabel: 'Promo Banners AI',
      description: 'Auto-generate Leaderboard, Square, Rectangle & Sidebar referral banners with Gemini AI',
      icon: Megaphone,
      badge: `${marketingBanners.length} Banners`,
    },
    {
      id: 'feature_switches',
      requiredPrivilege: 'super_admin',
      label: 'Platform Feature Switches & Toggles',
      shortLabel: 'Feature Toggles',
      description: 'Master on/off toggles for stocks, withdrawals, spins, scratch cards & vehicle sales',
      icon: Sliders,
      badge: 'Live Switches',
    },
    {
      id: 'fleet_ops',
      requiredPrivilege: 'manage_fleet_ops',
      label: 'Fleet Bays & Gemini Ops AI',
      shortLabel: 'Fleet & Ops AI',
      description: 'Service bay tickets, Mobile Ranger dispatch & AI intelligence copilot',
      icon: Bot,
      badge: 'Live Telematics',
    },
  ];

  const ADMIN_CATEGORIES = ALL_ADMIN_CATEGORIES.filter((cat) =>
    hasAdminPrivilege(cat.requiredPrivilege)
  );

  useEffect(() => {
    if (ADMIN_CATEGORIES.length > 0 && !ADMIN_CATEGORIES.some((c) => c.id === activeAdminTab)) {
      setActiveAdminTab(ADMIN_CATEGORIES[0].id);
    }
  }, [currentUser?.id, currentUser?.adminPrivileges, activeAdminTab]);

  const currentCategory = ADMIN_CATEGORIES.find((cat) => cat.id === activeAdminTab) || ADMIN_CATEGORIES[0] || ALL_ADMIN_CATEGORIES[0];
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
    updateSiteSettings(siteSettingsForm);
    updateSpinCost(siteSettingsForm.spinCostUsd);
    setLocalSpinCost(siteSettingsForm.spinCostUsd);
  };

  const handleGenerateAiBanner = async (sizeToUse: BannerSizeType) => {
    setIsGeneratingAiBanner(true);
    try {
      const res = await fetch('/api/gemini/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignGoal: aiBannerGoal,
          size: sizeToUse,
          tone: aiBannerTone,
          targetTab: aiBannerTargetTab,
          is3dHd: aiBannerIs3dHd,
          style3dPreset: aiBannerStyle3d,
          resolutionQuality: aiBannerQuality,
          carRenderModel: aiBannerCarModel,
        }),
      });
      const data = await res.json();
      if (data.success && data.banner) {
        createMarketingBanner({
          title: data.banner.title,
          size: sizeToUse,
          dimensions: data.banner.dimensions,
          headline: data.banner.headline,
          subheadline: data.banner.subheadline,
          ctaText: data.banner.ctaText,
          badgeText: data.banner.badgeText,
          themeGradient: data.banner.themeGradient || 'from-zinc-950 via-red-950/80 to-zinc-950',
          accentColor: data.banner.accentColor || '#ef4444',
          targetTab: data.banner.targetTab || aiBannerTargetTab,
          imageUrl: data.banner.imageUrl || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1400&q=90',
          isActive: true,
          isAiGenerated: true,
          is3dHd: data.banner.is3dHd ?? aiBannerIs3dHd,
          style3dPreset: data.banner.style3dPreset || aiBannerStyle3d,
          resolutionQuality: data.banner.resolutionQuality || aiBannerQuality,
          carRenderModel: data.banner.carRenderModel || aiBannerCarModel,
        });
      } else {
        showToast(data.error || 'AI banner generation failed.', 'error');
      }
    } catch {
      showToast('Network error contacting Gemini AI banner endpoint.', 'error');
    } finally {
      setIsGeneratingAiBanner(false);
    }
  };

  const handleGenerateFullBannerPack = async () => {
    setIsGeneratingAllSizes(true);
    const sizes: BannerSizeType[] = ['leaderboard', 'square', 'rectangle', 'sidebar'];
    try {
      for (const s of sizes) {
        await handleGenerateAiBanner(s);
      }
      showToast('Generated full 4-size AI referral banner pack (Leaderboard, Square, Rectangle, Sidebar)!', 'success');
    } finally {
      setIsGeneratingAllSizes(false);
    }
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
                {currentUser?.adminRoleLabel || 'Administrator'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Signed in as <span className="text-zinc-200 font-semibold">{currentUser?.email}</span> • {currentUser?.adminPrivileges?.length || 0} Privilege Scopes Granted
            </p>
          </div>
        </div>

        {/* Live Metrics Quick View & Admin Sign Out - Wrap friendly for mobile */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono">
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {allUsers.length} Users
          </span>
          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400">
            {importedEmails.length} Email Leads
          </span>
          <button
            type="button"
            disabled={isSyncingFirestore}
            onClick={() => {
              if (firebaseCloudConnected) {
                syncAllAdminSettingsToFirestore();
              } else {
                connectAdminCloudSync();
              }
            }}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition cursor-pointer ${
              firebaseCloudConnected
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-500/40 text-amber-300'
            }`}
            title={firebaseCloudConnected ? 'Sync all admin settings & SEO to Firestore' : 'Connect Google Admin & sync to Firestore'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing...' : firebaseCloudConnected ? 'Firestore Sync' : 'Connect Cloud Sync'}</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Lock /admin gateway and sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
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
                    const userBookingsCount = localBookings.filter((b) => b.userId === u.id).length;
                    const userOrdersCount = vehicleOrders.filter((o) => o.userId === u.id).length;
                    const userWithdrawalsCount = withdrawalRequests.filter((w) => w.userId === u.id).length;
                    const userTotalActivity = userInvestmentsCount + userBookingsCount + userOrdersCount + userWithdrawalsCount;

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
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0" />
                                <span>{u.location || 'Austin, TX, USA'}</span>
                              </span>
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
                          {u.preferredServiceCenter && (
                            <span className="text-[9px] text-zinc-500 block mt-0.5 truncate max-w-[140px]">
                              {u.preferredServiceCenter}
                            </span>
                          )}
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
                            <span className="text-[9px] text-zinc-500 block">
                              IP: {u.ipAddress || `198.51.100.${u.id.charCodeAt(u.id.length - 1) % 250}`} • {u.deviceInfo || 'MacOS/Chrome'}
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
                            ${(u.id === currentUser?.id ? balances.usd : (u.totalDepositedUsd ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            Stakes: {userInvestmentsCount} • Bays: {userBookingsCount} • Orders: {userOrdersCount}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedUserForActivity(u)}
                              title="Inspect User Bookings, Orders, Stakes & Telemetry"
                              className="px-2 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Activity ({userTotalActivity})</span>
                            </button>
                            <button
                              onClick={() => setSelectedUserForInvestments(u)}
                              title="View & Edit User Investments"
                              className="px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Stakes ({userInvestmentsCount})</span>
                            </button>
                            {u.role !== 'admin' && hasAdminPrivilege('manage_admins') && (
                              <button
                                onClick={() => {
                                  setAdminProvisionMode('upgrade');
                                  setUpgradeTargetUserId(u.id);
                                  setAdminCreateError(null);
                                  setActiveAdminTab('admins_mgmt');
                                }}
                                title="Upgrade User to Administrator"
                                className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Make Admin</span>
                              </button>
                            )}
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
              const userBookingsCount = localBookings.filter((b) => b.userId === u.id).length;
              const userOrdersCount = vehicleOrders.filter((o) => o.userId === u.id).length;
              const userTotalActivity = userInvestmentsCount + userBookingsCount + userOrdersCount;

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
                      <span className="text-[10px] text-zinc-500 block">ACTIVITIES</span>
                      <span className="text-white font-bold">{userTotalActivity} Logged</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                    <button
                      onClick={() => setSelectedUserForActivity(u)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3" />
                      <span>Activity ({userTotalActivity})</span>
                    </button>
                    <button
                      onClick={() => setSelectedUserForInvestments(u)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Stakes</span>
                    </button>
                    {u.role !== 'admin' && hasAdminPrivilege('manage_admins') && (
                      <button
                        onClick={() => {
                          setAdminProvisionMode('upgrade');
                          setUpgradeTargetUserId(u.id);
                          setAdminCreateError(null);
                          setActiveAdminTab('admins_mgmt');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Make Admin</span>
                      </button>
                    )}
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

              {/* Manual Cron Trigger & Pause/Resume Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    void toggleCronActive();
                  }}
                  className={`px-3.5 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                    cronActive
                      ? 'bg-zinc-900 border-amber-500/40 text-amber-300 hover:bg-zinc-800'
                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  {cronActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{cronActive ? 'Pause Server Cron' : 'Resume Server Cron'}</span>
                </button>
                <button
                  onClick={async () => {
                    setManualCycleRunning(true);
                    await triggerManualCronCycle();
                    setManualCycleRunning(false);
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
                <span className="text-[10px] text-zinc-500 font-mono block">SERVER CRON STATUS</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cronActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`font-mono font-bold text-xs ${
                      cronActive ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {cronActive ? 'ACTIVE (server.ts)' : 'PAUSED'}
                  </span>
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
                <span>AUTOMATED ROI CRON JOB AUDIT LOG (SERVER.TS SCHEDULER)</span>
                <span className={cronActive ? 'text-emerald-400' : 'text-amber-400'}>
                  {cronActive ? '● LIVE SERVER CRON' : '○ PAUSED'}
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-zinc-300">
                {cronLogs.slice(0, 8).map((log, i) => (
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

          {/* Dispatched Maturity Notification Emails Audit Trail */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Automated Plan Maturity Settlement Emails ({dispatchedCronEmails.length})</span>
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Real-time audit log of automated emails dispatched by the server.ts Cron Engine via configured SMTP relay (or simulated audit mode) upon plan completion.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 w-fit">
                SMTP: {localSmtp.host}:{localSmtp.port}
              </span>
            </div>

            {dispatchedCronEmails.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center text-xs text-zinc-400">
                No matured investment notification emails dispatched in this server session yet. Click{' '}
                <strong className="text-emerald-400">Execute Cron ROI Cycle Now</strong> (or wait for the next interval) to process running stakes through maturity.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {dispatchedCronEmails.map((em) => (
                  <div
                    key={em.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white truncate">{em.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            em.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {em.status === 'delivered' ? 'SMTP DELIVERED' : 'AUDIT LOGGED (SIMULATED)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        To: <span className="text-zinc-200">{em.recipient}</span> • Plan ID: {em.investmentId} • Cert: {em.certificateId}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 font-mono">
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">+${em.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(em.dispatchedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {/* Automated .env SMTP Status & Dispatch Audit Log */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-heading font-bold text-sm sm:text-base text-white">
                    Automated .env SMTP Notification Dispatch Log
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time audit of registration welcome emails, deposit confirmations, and maturity settlements dispatched via <code className="text-zinc-200">.env</code> SMTP configuration.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {smtpEnvSummary && (
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border ${
                      smtpEnvSummary.configured
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {smtpEnvSummary.configured
                      ? `LIVE SMTP: ${smtpEnvSummary.host}:${smtpEnvSummary.port}`
                      : 'LOCAL AUDIT LOG MODE (.env SMTP fallback)'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={fetchMailerLogs}
                  disabled={isLoadingMailerLogs}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMailerLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {mailerLogs.length === 0 && dispatchedCronEmails.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                No automated transactional dispatches logged yet. Register a new account or complete a vault deposit to trigger an automated SMTP alert.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Subject & Summary</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Dispatched At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 font-mono">
                    {(mailerLogs.length > 0 ? mailerLogs : dispatchedCronEmails).slice(0, 25).map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/40">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] uppercase text-cyan-300 font-bold">
                            {log.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-white">{log.recipient}</td>
                        <td className="p-3 text-zinc-300">
                          <span className="block truncate max-w-xs">{log.subject}</span>
                          {log.detail && (
                            <span className="text-[10px] text-zinc-500 block truncate max-w-xs">{log.detail}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'delivered'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : log.status === 'simulated'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-zinc-400 text-[10px]">
                          {new Date(log.dispatchedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
              {[
                { id: 'pages', label: 'Pages', count: sitePages.length },
                { id: 'menus', label: 'Nav Menus', count: navigationMenus.length },
                { id: 'products', label: 'Products', count: productsList.length },
                { id: 'promo_content', label: 'Promotions', count: scratchCardTiers.length },
                { id: 'manual_deposits', label: 'Gateways', count: manualDepositMethods.length },
                { id: 'socials', label: 'Social URLs', count: socialLinks.length },
                { id: 'catalog', label: 'Fleet Plans', count: investmentPools.length },
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

          {/* SUBTAB 1: SITE PAGES */}
          {siteCmsSubTab === 'pages' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Site Pages & Custom Routes</h4>
                  <p className="text-xs text-zinc-400">
                    Create new pages, edit existing page copy, and assign display locations (Navbar, Footer, Both, or Hidden).
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

              <div className="rounded-2xl border border-zinc-800 overflow-x-auto">
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
                    {sitePages.map((page) => {
                      const published = page.isPublished ?? page.published;
                      return (
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
                                published
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {published ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </td>
                          <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                            {page.updatedAt}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {published && (
                                <button
                                  onClick={() =>
                                    window.dispatchEvent(new CustomEvent('apex:navigate', { detail: page.slug }))
                                  }
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 cursor-pointer"
                                  title="Open Live Page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
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
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-pointer"
                                title="Edit Page"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {!page.isSystem && (
                                <button
                                  onClick={() => deleteSitePage(page.id)}
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-900/50 text-rose-400 border border-zinc-700 cursor-pointer"
                                  title="Delete Page"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          )}

          {/* SUBTAB: NAVIGATION MENUS CRUD */}
          {siteCmsSubTab === 'menus' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Navigation Menus Builder (Header, Dropdown & Footer)</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Add, edit, reorder, hide, or delete menu links across the top Navbar, Account Dropdown, and all Footer columns. Changes reflect immediately site-wide.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={resetNavigationMenus}
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMenuId(null);
                      setMenuForm({
                        label: '',
                        targetTab: sitePages[0]?.slug || 'home',
                        location: menuLocationFilter === 'all' ? 'navbar' : menuLocationFilter,
                        order: navigationMenus.length + 1,
                        badge: '',
                        highlight: false,
                        isVisible: true,
                        iconName: 'Tag',
                        isSystem: false,
                      });
                      setIsMenuModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Menu Item</span>
                  </button>
                </div>
              </div>

              {/* Location Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Locations' },
                  { id: 'navbar', label: 'Navbar' },
                  { id: 'dropdown', label: 'User Dropdown' },
                  { id: 'footer_services', label: 'Footer Services' },
                  { id: 'footer_fleet', label: 'Footer Fleet' },
                  { id: 'footer_legal', label: 'Footer Trust' },
                  { id: 'mobile_only', label: 'Mobile Only' },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setMenuLocationFilter(loc.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      menuLocationFilter === loc.id
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Label & Badge</th>
                      <th className="p-3.5">Target Route / Page</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Visibility</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {navigationMenus
                      .filter((m) => menuLocationFilter === 'all' || m.location === menuLocationFilter)
                      .sort((a, b) => a.location.localeCompare(b.location) || a.order - b.order)
                      .map((menu) => (
                        <tr key={menu.id} className="hover:bg-zinc-900/50">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-white">{menu.label}</span>
                              {menu.badge && (
                                <span className="px-1.5 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-300 font-mono text-[9px] font-bold">
                                  {menu.badge}
                                </span>
                              )}
                              {menu.highlight && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
                                  HIGHLIGHT
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-cyan-300">/{menu.targetTab}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                              {menu.location}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-zinc-400">#{menu.order}</td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => updateNavigationMenuItem(menu.id, { isVisible: !menu.isVisible })}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer ${
                                menu.isVisible
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {menu.isVisible ? 'VISIBLE' : 'HIDDEN'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => reorderNavigationMenuItem(menu.id, 'up')}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => reorderNavigationMenuItem(menu.id, 'down')}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMenuId(menu.id);
                                  setMenuForm({
                                    label: menu.label,
                                    targetTab: menu.targetTab,
                                    location: menu.location,
                                    order: menu.order,
                                    badge: menu.badge || '',
                                    highlight: Boolean(menu.highlight),
                                    isVisible: menu.isVisible,
                                    iconName: menu.iconName || 'Tag',
                                    isSystem: Boolean(menu.isSystem),
                                  });
                                  setIsMenuModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-pointer"
                                title="Edit Menu"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNavigationMenuItem(menu.id)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-900/50 text-rose-400 border border-zinc-700 cursor-pointer"
                                title="Delete Menu Item"
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

          {/* SUBTAB: PRODUCT INVENTORY CRUD */}
          {siteCmsSubTab === 'products' && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Product Inventory Management ({productsList.length} Items)</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Create, edit, price, toggle stock availability, or delete Tesla accessories & gear directly in the live storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm({
                      name: '',
                      category: 'Charging & Tech',
                      priceUsd: 299,
                      description: '',
                      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
                      compatibility: 'Model 3, Model Y, Model S, Model X, Cybertruck',
                      inStock: true,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Store Product</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search product name or description..."
                  className="w-full sm:w-72 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Wraps & Film', 'Aero & Carbon', 'Wheels & Performance', 'Interior & Yoke', 'Charging & Tech', 'Vehicle Sales'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        productCategoryFilter === cat
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsList
                  .filter((p) => productCategoryFilter === 'All' || p.category === productCategoryFilter)
                  .filter(
                    (p) =>
                      !productSearchTerm.trim() ||
                      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      p.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-36 bg-black relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 border border-zinc-700 text-[10px] font-mono text-zinc-200">
                            {product.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateProductItem(product.id, { inStock: !product.inStock })}
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer ${
                              product.inStock
                                ? 'bg-emerald-500/90 text-black'
                                : 'bg-rose-600/90 text-white'
                            }`}
                          >
                            {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-heading font-bold text-sm text-white line-clamp-1">{product.name}</h5>
                            <span className="font-mono font-bold text-sm text-emerald-400 shrink-0">
                              ${product.priceUsd.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{product.description}</p>
                          {product.compatibility && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {product.compatibility.split(',').slice(0, 3).map((c) => (
                                <span key={c.trim()} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                                  {c.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => updateProductItem(product.id, { inStock: !product.inStock })}
                          className="text-[11px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(product.id);
                              setProductForm({
                                name: product.name,
                                category: product.category,
                                priceUsd: product.priceUsd,
                                description: product.description,
                                image: product.image,
                                compatibility: product.compatibility || '',
                                inStock: product.inStock,
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProductItem(product.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-rose-400 cursor-pointer"
                            title="Delete Product"
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

          {/* SUBTAB: PROMOTIONAL CONTENT & SCRATCH CARD TIERS CRUD */}
          {siteCmsSubTab === 'promo_content' && (
            <div className="space-y-6">
              {/* Live Promotional Copy & Flash Announcement */}
              <form
                onSubmit={handleSaveSiteSettings}
                className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Promotional Headlines, Announcement Banner & Spin Pricing</span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Edit homepage hero copy, top ticker announcement banner, Spin & Win cost, and Scratch Card promotional headings.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('spins_cms')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-300 font-semibold cursor-pointer"
                    >
                      Spin Wheel Slices →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('promo_banners')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-cyan-300 font-semibold cursor-pointer"
                    >
                      AI Promo Banners →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Promotions Hub Main Title</label>
                    <input
                      type="text"
                      value={siteSettingsForm.promoBannerTitle}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, promoBannerTitle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Live Flash Announcement Ticker</label>
                    <input
                      type="text"
                      value={siteSettingsForm.announcementBanner}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementBanner: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Promotions Hub Subtitle</label>
                  <input
                    type="text"
                    value={siteSettingsForm.promoBannerSubtitle}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, promoBannerSubtitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Wheel Spin Cost (USD)</label>
                    <input
                      type="number"
                      value={siteSettingsForm.spinCostUsd}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, spinCostUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Max Scratch Jackpot Display (USD)</label>
                    <input
                      type="number"
                      value={siteSettingsForm.maxScratchPrizeUsd}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, maxScratchPrizeUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                  >
                    Save Promotional Copy & Pricing
                  </button>
                </div>
              </form>

              {/* Scratch Card Tiers CRUD */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-heading font-bold text-base text-white">
                      Scratch & Win Promotional Tiers ({scratchCardTiers.length})
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Create, customize, price, or remove interactive scratch card tiers shown in the Promotions Hub.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScratchId(null);
                      setScratchForm({
                        name: '',
                        priceUsd: 250,
                        maxPrizeUsd: 5000,
                        gradient: 'from-amber-600 via-red-600 to-rose-700',
                        textColor: 'text-white',
                        description: 'High-stakes promotional scratch foil featuring instant crypto payouts & Tesla perks.',
                        possiblePrizes: [
                          { amountUsd: 5000, label: 'Apex Vault Grand Prize ($5,000)', weight: 2 },
                          { amountUsd: 1000, label: 'Giga Crypto Payout ($1,000)', weight: 10 },
                          { amountUsd: 350, label: 'Supercharging Pass ($350)', weight: 30 },
                          { amountUsd: 100, label: 'Cashback Bonus ($100)', weight: 58 },
                        ],
                      });
                      setIsScratchModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Scratch Card Tier</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scratchCardTiers.map((tier) => (
                    <div key={tier.id} className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${tier.gradient} text-white`}>
                          <span className="text-[9px] font-mono uppercase opacity-80 block">Scratch Card Tier</span>
                          <h5 className="font-heading font-black text-base">{tier.name}</h5>
                          <div className="flex justify-between items-center mt-2 text-xs font-mono">
                            <span>Ticket: ${tier.priceUsd}</span>
                            <span className="text-yellow-300 font-bold">Max: ${tier.maxPrizeUsd.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">{tier.description}</p>
                        <div className="space-y-1 text-[11px] text-zinc-300 border-t border-zinc-800 pt-2">
                          {tier.possiblePrizes.slice(0, 4).map((p, i) => (
                            <div key={i} className="flex justify-between items-center gap-2">
                              <span className="truncate flex items-center gap-1">
                                {p.isTeslaCar && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-600/20 border border-red-500/40 text-red-300 text-[9px] font-mono font-bold shrink-0">
                                    TESLA CAR
                                  </span>
                                )}
                                <span className="truncate">{p.label}</span>
                              </span>
                              <span className="font-mono text-amber-400 shrink-0">${p.amountUsd.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingScratchId(tier.id);
                            setScratchForm({
                              name: tier.name,
                              priceUsd: tier.priceUsd,
                              maxPrizeUsd: tier.maxPrizeUsd,
                              gradient: tier.gradient,
                              textColor: tier.textColor,
                              description: tier.description,
                              possiblePrizes: tier.possiblePrizes,
                            });
                            setIsScratchModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          title="Edit Scratch Tier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteScratchCardTier(tier.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-rose-400 cursor-pointer"
                          title="Delete Scratch Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span className="font-heading font-bold text-white text-sm">{link.name || link.label}</span>
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

                    <div className="flex items-center gap-3 text-[11px] text-zinc-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.showInFooter}
                          onChange={(e) => updateSocialLink(link.id, { showInFooter: e.target.checked })}
                        />
                        <span>Footer</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.showInHeader}
                          onChange={(e) => updateSocialLink(link.id, { showInHeader: e.target.checked })}
                        />
                        <span>Header</span>
                      </label>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Platform Brand Name</label>
                    <input
                      type="text"
                      value={siteSettingsForm.siteName}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Header Tagline</label>
                    <input
                      type="text"
                      value={siteSettingsForm.siteTagline}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteTagline: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hero Top Status Badge</label>
                    <input
                      type="text"
                      value={siteSettingsForm.heroBadge}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroBadge: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hero Section Main Headline</label>
                    <input
                      type="text"
                      value={siteSettingsForm.heroHeadline}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroHeadline: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hero Subtitle Copy</label>
                    <input
                      type="text"
                      value={siteSettingsForm.heroSubtitle}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroSubtitle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Wheel Spin Cost (USD)</label>
                    <input
                      type="number"
                      value={siteSettingsForm.spinCostUsd}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, spinCostUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Scratch Card Max Prize Cap (USD)</label>
                    <input
                      type="number"
                      value={siteSettingsForm.maxScratchPrizeUsd}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, maxScratchPrizeUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Hourly Bay Labor Rate (USD)</label>
                    <input
                      type="number"
                      value={siteSettingsForm.hourlyBayRateUsd}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, hourlyBayRateUsd: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Homepage Live Flash Announcement Bar</label>
                  <input
                    type="text"
                    value={siteSettingsForm.announcementBanner}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementBanner: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Enable Crypto Deposit Gateways</span>
                      <span className="text-[10px] text-zinc-400">Accept BTC, USDT, XRP & BNB wallet funding</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.enableCryptoDeposits}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, enableCryptoDeposits: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-amber-300 block">Sitewide Maintenance Banner</span>
                      <span className="text-[10px] text-zinc-400">Display scheduled maintenance banner at top of app</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettingsForm.maintenanceMode}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
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

              {/* Local Currency Switcher & Exchange Multipliers */}
              <div className="pt-6 border-t border-zinc-800 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>Local Currency Switcher &amp; Conversion Multipliers</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Control multipliers applied when users switch display currency across Navbar, Dashboard Vaults, and Tesla Vehicle Sales (base = 1.00 USD).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currencies.map((cur) => (
                    <div
                      key={cur.code}
                      className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        cur.isActive ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-950 border-zinc-900 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-black text-sm text-white">
                            {cur.symbol} {cur.code}
                          </span>
                          <p className="text-[10px] text-zinc-400">{cur.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateCurrencyConfig(cur.code, { isActive: !cur.isActive })}
                            disabled={cur.code === 'USD'}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                              cur.isActive
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            } disabled:opacity-60`}
                          >
                            {cur.isActive ? 'Active' : 'Hidden'}
                          </button>
                          {cur.code !== 'USD' && (
                            <button
                              type="button"
                              onClick={() => deleteCurrencyConfig(cur.code)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400"
                              title={`Delete ${cur.code}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-zinc-400 font-mono shrink-0">1 USD ×</label>
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          disabled={cur.code === 'USD'}
                          value={cur.multiplier}
                          onChange={(e) =>
                            updateCurrencyConfig(cur.code, {
                              multiplier: Math.max(0.0001, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs disabled:opacity-60"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Local Currency */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Custom Local Currency</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <input
                      type="text"
                      placeholder="Code (e.g. ZAR)"
                      value={newCurrencyForm.code}
                      onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, code: e.target.value.toUpperCase() })}
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                    <input
                      type="text"
                      placeholder="Currency Name"
                      value={newCurrencyForm.name}
                      onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, name: e.target.value })}
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Symbol (e.g. R)"
                      value={newCurrencyForm.symbol}
                      onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, symbol: e.target.value })}
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        placeholder="Multiplier"
                        value={newCurrencyForm.multiplier}
                        onChange={(e) => setNewCurrencyForm({ ...newCurrencyForm, multiplier: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-2 text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCurrencyForm.code.trim() || !newCurrencyForm.symbol.trim()) {
                            showToast('Currency code and symbol are required.', 'error');
                            return;
                          }
                          addCurrencyConfig({
                            code: newCurrencyForm.code.trim().toUpperCase(),
                            name: newCurrencyForm.name.trim() || newCurrencyForm.code.trim().toUpperCase(),
                            symbol: newCurrencyForm.symbol.trim(),
                            multiplier: Math.max(0.0001, Number(newCurrencyForm.multiplier) || 1),
                            isActive: true,
                          });
                          setNewCurrencyForm({ code: '', name: '', symbol: '', multiplier: 1 });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                onClick={() => setCarSalesSubTab('won_prizes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  carSalesSubTab === 'won_prizes'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Won Prizes Shipping ({wonPrizes.length})</span>
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

          {carSalesSubTab === 'won_prizes' && <AdminWonPrizesManager />}

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

      {/* 7. User Withdrawals & $200 Deposit Rule Management */}
      {activeAdminTab === 'withdrawals_mgmt' && (
        <div className="space-y-6">
          {/* Policy & AML Thresholds Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  Withdrawal Gateways & AML Anti-Fraud Policy
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enforce strict anti-money-laundering policies, minimum user deposit hurdles, and review on-chain payouts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${withdrawalSettings.withdrawalsEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {withdrawalSettings.withdrawalsEnabled ? 'Withdrawals ACTIVE' : 'Withdrawals PAUSED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Min Deposit Requirement</label>
                  <button
                    onClick={() => {
                      updateWithdrawalSettings({ requireDepositToWithdraw: !withdrawalSettings.requireDepositToWithdraw });
                      showToast(withdrawalSettings.requireDepositToWithdraw ? 'Deposit requirement disabled' : 'Deposit requirement ENABLED');
                    }}
                    className={`text-xl ${withdrawalSettings.requireDepositToWithdraw ? 'text-emerald-400' : 'text-zinc-600'}`}
                  >
                    {withdrawalSettings.requireDepositToWithdraw ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {withdrawalSettings.requireDepositToWithdraw 
                    ? 'Users must deposit min $200 before withdrawing. Otherwise, reject alert is shown.' 
                    : 'Disabled: Any user can request withdrawal without previous deposit.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-300">Min Deposit Required ($USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    value={withdrawalSettings.minimumDepositRequiredUsd}
                    onChange={(e) => updateWithdrawalSettings({ minimumDepositRequiredUsd: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">Default requirement is $200.00</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-300">Minimum Payout ($USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    value={withdrawalSettings.minimumWithdrawalUsd}
                    onChange={(e) => updateWithdrawalSettings({ minimumWithdrawalUsd: Math.max(10, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">Min withdrawal allowed per transaction</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-300">Withdrawal Processing Fee (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawalSettings.feePercentage}
                    onChange={(e) => updateWithdrawalSettings({ feePercentage: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-zinc-500 text-sm">%</span>
                </div>
                <p className="text-[11px] text-zinc-500">0% for promotional zero-fee window</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Requests List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-heading font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Payout Requests ({withdrawalRequests.length} Total)
                </h4>
                <p className="text-xs text-zinc-400">Review pending withdrawals, verify destination wallet / bank account, and enter blockchain transaction hash.</p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setWithdrawalFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      withdrawalFilterStatus === status
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="pb-3 font-semibold">REQUEST ID / TIME</th>
                    <th className="pb-3 font-semibold">USER</th>
                    <th className="pb-3 font-semibold">METHOD & ADDRESS</th>
                    <th className="pb-3 font-semibold">AMOUNT</th>
                    <th className="pb-3 font-semibold">USER DEPOSITS</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {withdrawalRequests
                    .filter((r) => withdrawalFilterStatus === 'all' || r.status === withdrawalFilterStatus)
                    .map((req) => {
                      const user = allUsers.find((u) => u.id === req.userId);
                      const userDeposit = (user?.totalDepositedUsd ?? (req.userId === currentUser?.id ? currentUser?.totalDepositedUsd : 0)) || 0;
                      const minDepositReq = withdrawalSettings.minDepositRequiredUsd ?? withdrawalSettings.minimumDepositRequiredUsd ?? 200;
                      const isEligible = userDeposit >= minDepositReq;

                      return (
                        <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 pr-2">
                            <span className="font-bold text-white block">{req.id}</span>
                            <span className="text-[10px] text-zinc-500">{new Date(req.createdAt || req.requestedAt).toLocaleString()}</span>
                          </td>
                          <td className="py-3 pr-2">
                            <span className="text-white font-medium block">{req.userName}</span>
                            <span className="text-[10px] text-zinc-500">{req.userEmail}</span>
                          </td>
                          <td className="py-3 pr-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase inline-block mb-1">
                              {req.method || req.currency}
                            </span>
                            <p className="text-[11px] text-zinc-400 max-w-xs truncate" title={req.destinationAddress}>
                              {req.destinationAddress}
                            </p>
                          </td>
                          <td className="py-3 pr-2">
                            <span className="text-emerald-400 font-bold block">${req.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-[10px] text-zinc-500">Net: ${(req.netPayoutUsd ?? req.netAmountUsd).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td className="py-3 pr-2">
                            {isEligible ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                <CheckCircle className="w-3 h-3" />
                                Deposited: ${userDeposit}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                ${userDeposit} / ${minDepositReq}
                              </span>
                            )}
                          </td>

                          <td className="py-3 pr-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                                req.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : req.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {req.status}
                            </span>
                            {req.txHash && (
                              <span className="block text-[10px] text-zinc-500 mt-1 truncate max-w-xs" title={req.txHash}>
                                TX: {req.txHash}
                              </span>
                            )}
                            {req.rejectionReason && (
                              <span className="block text-[10px] text-red-400 mt-1 max-w-xs">
                                Note: {req.rejectionReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {req.status === 'pending' ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="Tx Hash (0x...)"
                                    value={withdrawalTxInputs[req.id] || ''}
                                    onChange={(e) => setWithdrawalTxInputs({ ...withdrawalTxInputs, [req.id]: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-white w-28 focus:border-emerald-500 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const tx = withdrawalTxInputs[req.id] || `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
                                      processWithdrawalRequest(req.id, 'approved', tx);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                                  >
                                    Approve
                                  </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="Reject reason..."
                                    value={withdrawalRejectInputs[req.id] || ''}
                                    onChange={(e) => setWithdrawalRejectInputs({ ...withdrawalRejectInputs, [req.id]: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-white w-28 focus:border-red-500 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const reason = withdrawalRejectInputs[req.id] || 'Minimum deposit requirement not met. Please complete deposit of $200.';
                                      processWithdrawalRequest(req.id, 'rejected', undefined, reason);
                                    }}
                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-500">Processed</span>
                            )}
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

      {/* 8. Tesla Live Stocks & Fast ROI CMS */}
      {activeAdminTab === 'stocks_mgmt' && (
        <div className="space-y-6">
          {/* TSLA Live Quote Controller */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  NASDAQ: TSLA Live Stock Pricing Engine
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Control the live Tesla stock baseline quote, simulated market variance range, and 24h market metrics.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                  Current: <strong className="text-white">${tslaQuote.price.toFixed(2)}</strong> ({tslaQuote.change24h >= 0 ? '+' : ''}{tslaQuote.change24h.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Base Price ($USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockQuoteEditForm.price}
                  onChange={(e) => setStockQuoteEditForm({ ...stockQuoteEditForm, price: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">24h Change (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockQuoteEditForm.change24h}
                  onChange={(e) => setStockQuoteEditForm({ ...stockQuoteEditForm, change24h: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Day High ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockQuoteEditForm.dayHigh}
                  onChange={(e) => setStockQuoteEditForm({ ...stockQuoteEditForm, dayHigh: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Day Low ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stockQuoteEditForm.dayLow}
                  onChange={(e) => setStockQuoteEditForm({ ...stockQuoteEditForm, dayLow: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Volume</label>
                <input
                  type="text"
                  value={stockQuoteEditForm.volume}
                  onChange={(e) => setStockQuoteEditForm({ ...stockQuoteEditForm, volume: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  updateStockQuote(stockQuoteEditForm);
                  showToast('Tesla live stock quote updated successfully!');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply TSLA Quote Update
              </button>
            </div>
          </div>

          {/* Featured Fast-ROI Stock Plans Manager */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-base font-heading font-black text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Featured Stocks Buy For Faster ROI Plans (Min $500 Enforced)
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  High-yield accelerated stock packages with guaranteed minimum entry from $500 and above.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingStockPlan(true);
                  setEditingStockPlan(null);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Accelerated Stock Plan
              </button>
            </div>

            {/* Plans List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="pb-3 font-semibold">PLAN / TIER</th>
                    <th className="pb-3 font-semibold">EXPECTED ROI</th>
                    <th className="pb-3 font-semibold">CYCLE DURATION</th>
                    <th className="pb-3 font-semibold">ENTRY RANGE</th>
                    <th className="pb-3 font-semibold">ACCELERATION</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {featuredStockPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-white block">{plan.name}</span>
                        <span className="text-[10px] text-zinc-400">{plan.badge}</span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="text-emerald-400 font-black text-sm">+{plan.expectedRoiPercent}%</span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="text-zinc-300">{plan.lockPeriodDays} Days</span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="text-white font-bold">${plan.minInvestmentUsd.toLocaleString()}</span>
                        <span className="text-zinc-500 text-[10px] block">up to ${plan.maxInvestmentUsd.toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-[10px] font-bold">
                          {plan.accelerationFactor}
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <button
                          onClick={() => updateFeaturedStockPlan(plan.id, { isActive: !plan.isActive })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            plan.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {plan.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingStockPlan(plan);
                            setStockPlanForm({
                              title: plan.title || plan.name || 'Accelerated Stock Plan',
                              name: plan.name || plan.title || 'Accelerated Stock Plan',
                              ticker: plan.ticker || 'TSLA',
                              category: plan.category || 'Autonomous AI',
                              tier: plan.tier || 'Cyber-Optimus',
                              badge: plan.badge,
                              description: plan.description,
                              minInvestmentUsd: plan.minInvestmentUsd,
                              maxInvestmentUsd: plan.maxInvestmentUsd,
                              apy: plan.apy ?? plan.expectedRoiPercent ?? 28.5,
                              durationDays: plan.durationDays ?? plan.lockPeriodDays ?? 14,
                              dailyYieldPercent: plan.dailyYieldPercent ?? 2.0,
                              totalExpectedRoiPercent: plan.totalExpectedRoiPercent ?? plan.expectedRoiPercent ?? 28.5,
                              totalSubscribedUsd: plan.totalSubscribedUsd ?? 0,
                              expectedRoiPercent: plan.expectedRoiPercent ?? plan.totalExpectedRoiPercent ?? 28.5,
                              lockPeriodDays: plan.lockPeriodDays ?? plan.durationDays ?? 14,
                              riskLevel: plan.riskLevel,
                              accelerationFactor: plan.accelerationFactor || '2.0x Standard',
                              isActive: plan.isActive,
                            });
                            setIsAddingStockPlan(true);

                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white inline-block"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete plan ${plan.name}?`)) {
                              deleteFeaturedStockPlan(plan.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600/30 text-zinc-400 hover:text-red-400 inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Stock Plan Modal */}
            {isAddingStockPlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="font-heading font-black text-white text-base">
                      {editingStockPlan ? 'Edit Fast-ROI Stock Plan' : 'Create Accelerated Fast-ROI Plan'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsAddingStockPlan(false);
                        setEditingStockPlan(null);
                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Plan Name</label>
                      <input
                        type="text"
                        value={stockPlanForm.name}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Badge Text</label>
                      <input
                        type="text"
                        value={stockPlanForm.badge}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, badge: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Min Investment ($USD - Min 500)</label>
                      <input
                        type="number"
                        min="500"
                        value={stockPlanForm.minInvestmentUsd}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, minInvestmentUsd: Math.max(500, Number(e.target.value)) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Max Investment ($USD)</label>
                      <input
                        type="number"
                        value={stockPlanForm.maxInvestmentUsd}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, maxInvestmentUsd: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Expected ROI (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={stockPlanForm.expectedRoiPercent}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, expectedRoiPercent: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-emerald-400 font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Cycle Duration (Days)</label>
                      <input
                        type="number"
                        value={stockPlanForm.lockPeriodDays}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, lockPeriodDays: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Acceleration Factor</label>
                      <input
                        type="text"
                        value={stockPlanForm.accelerationFactor}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, accelerationFactor: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-bold">Risk Level</label>
                      <select
                        value={stockPlanForm.riskLevel}
                        onChange={(e) => setStockPlanForm({ ...stockPlanForm, riskLevel: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-300 font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={stockPlanForm.description}
                      onChange={(e) => setStockPlanForm({ ...stockPlanForm, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsAddingStockPlan(false);
                        setEditingStockPlan(null);
                      }}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingStockPlan) {
                          updateFeaturedStockPlan(editingStockPlan.id, stockPlanForm);
                          showToast('Plan updated successfully');
                        } else {
                          createFeaturedStockPlan(stockPlanForm);
                          showToast('Plan created successfully');
                        }
                        setIsAddingStockPlan(false);
                        setEditingStockPlan(null);
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold"
                    >
                      {editingStockPlan ? 'Save Changes' : 'Create Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Spins Rewards & Spin Cost CMS */}
      {activeAdminTab === 'spins_cms' && (
        <div className="space-y-6">
          {/* Spin Cost Settings Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Spin Wheel Price & Reward Probabilities CMS
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Adjust the cost per spin in USD and configure every wheel slice reward, value, and probability weight.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Current Cost:</span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold rounded-lg text-sm">
                  ${spinCostUsd} / Spin
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
              <div className="w-full sm:w-64 space-y-1">
                <label className="text-xs font-bold text-zinc-300">Execution Cost Per Spin ($USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    value={localSpinCost}
                    onChange={(e) => setLocalSpinCost(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  updateSpinCost(localSpinCost);
                  showToast(`Spin cost updated to $${localSpinCost} USD!`);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Spin Cost
              </button>
            </div>
          </div>

          {/* Wheel Slices Rewards List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-base font-heading font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Wheel Reward Slices ({wheelRewards.length} Configured)
                </h4>
                <p className="text-xs text-zinc-400">
                  Each prize has a visual slice color, reward value, and probability weight. Total weights determine likelihood.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingReward(true);
                  setEditingReward(null);
                }}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Wheel Prize Slice
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="pb-3 font-semibold">COLOR</th>
                    <th className="pb-3 font-semibold">PRIZE LABEL</th>
                    <th className="pb-3 font-semibold">TYPE</th>
                    <th className="pb-3 font-semibold">REWARD VALUE</th>
                    <th className="pb-3 font-semibold">PROBABILITY WEIGHT</th>
                    <th className="pb-3 font-semibold">ACTIVE</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {wheelRewards.map((reward) => (
                    <tr key={reward.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: reward.color }}
                          />
                          <span className="text-[10px] text-zinc-500">{reward.color}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 font-bold text-white">
                        <span>{reward.label}</span>
                        {reward.type === 'car' && reward.vehicleModel && (
                          <span className="block text-[10px] text-red-400 font-normal">
                            Vehicle: {reward.vehicleModel}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                            reward.type === 'car'
                              ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                              : reward.type === 'try_again'
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {reward.type}
                        </span>
                      </td>
                      <td className="py-3 pr-2 font-bold text-emerald-400">
                        {reward.type === 'try_again'
                          ? '$0 (Try Again)'
                          : `$${(reward.valueUsd ?? reward.value ?? 0).toLocaleString()}`}
                      </td>
                      <td className="py-3 pr-2 text-zinc-300">
                        {reward.weight ?? reward.probabilityWeight ?? 1} pts
                      </td>
                      <td className="py-3 pr-2">
                        <button
                          onClick={() => updateWheelReward(reward.id, { isActive: !reward.isActive })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reward.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {reward.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingReward(reward);
                            setNewRewardForm({
                              label: reward.label,
                              text: reward.text || reward.label,
                              valueUsd: reward.valueUsd ?? reward.value ?? 100,
                              value: reward.value ?? reward.valueUsd ?? 100,
                              type: reward.type,
                              vehicleModel: reward.vehicleModel || 'Tesla Model 3 Performance',
                              color: reward.color,
                              textColor: reward.textColor || '#ffffff',
                              weight: reward.weight ?? reward.probabilityWeight ?? 8,
                              probabilityWeight: reward.probabilityWeight ?? reward.weight ?? 8,
                              isActive: reward.isActive,
                            });
                            setIsAddingReward(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-block cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            deleteWheelReward(reward.id);
                            showToast(`Removed wheel slice "${reward.label}".`, 'info');
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600/30 text-zinc-400 hover:text-red-400 inline-block cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Reward Modal */}
            {isAddingReward && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="font-heading font-black text-white text-base">
                      {editingReward ? 'Edit Wheel Reward' : 'Add Wheel Prize Slice'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsAddingReward(false);
                        setEditingReward(null);
                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-zinc-300 font-bold block mb-1">Prize Label (Wheel Slice & Announcement)</label>
                      <input
                        type="text"
                        value={newRewardForm.label}
                        onChange={(e) => setNewRewardForm({ ...newRewardForm, label: e.target.value, text: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-300 font-bold block mb-1">Slice Outcome Type</label>
                        <select
                          value={newRewardForm.type}
                          onChange={(e) => {
                            const nextType = e.target.value as WheelReward['type'];
                            setNewRewardForm({
                              ...newRewardForm,
                              type: nextType,
                              value: nextType === 'try_again' ? 0 : (newRewardForm.valueUsd || 100),
                              valueUsd: nextType === 'try_again' ? 0 : (newRewardForm.valueUsd || 100),
                            });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="car">Tesla Car Win</option>
                          <option value="try_again">Try Again ($0)</option>
                          <option value="usd">USD Cash</option>
                          <option value="credits">Vault Credits</option>
                          <option value="coupon">Discount Coupon</option>
                          <option value="points">Points / XP</option>
                          <option value="free_spin">Free Spin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-zinc-300 font-bold block mb-1">Prize Value ($USD)</label>
                        <input
                          type="number"
                          disabled={newRewardForm.type === 'try_again'}
                          value={newRewardForm.valueUsd ?? newRewardForm.value ?? 0}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value) || 0);
                            setNewRewardForm({ ...newRewardForm, value: v, valueUsd: v });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {newRewardForm.type === 'car' && (
                      <div>
                        <label className="text-zinc-300 font-bold block mb-1">Awarded Tesla Vehicle Model</label>
                        <input
                          type="text"
                          value={newRewardForm.vehicleModel || ''}
                          onChange={(e) => setNewRewardForm({ ...newRewardForm, vehicleModel: e.target.value })}
                          placeholder="e.g. Tesla Model 3 Performance or Cybertruck Cyberbeast"
                          className="w-full bg-zinc-900 border border-red-500/40 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-300 font-bold block mb-1">Slice Hex Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newRewardForm.color}
                            onChange={(e) => setNewRewardForm({ ...newRewardForm, color: e.target.value })}
                            className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={newRewardForm.color}
                            onChange={(e) => setNewRewardForm({ ...newRewardForm, color: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-zinc-300 font-bold block mb-1">Probability Weight</label>
                        <input
                          type="number"
                          min="1"
                          value={newRewardForm.weight ?? newRewardForm.probabilityWeight ?? 1}
                          onChange={(e) => {
                            const w = Math.max(1, Number(e.target.value) || 1);
                            setNewRewardForm({ ...newRewardForm, weight: w, probabilityWeight: w });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsAddingReward(false);
                        setEditingReward(null);
                      }}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingReward) {
                          updateWheelReward(editingReward.id, newRewardForm);
                          showToast('Reward updated successfully');
                        } else {
                          addWheelReward(newRewardForm);
                          showToast('New reward added');
                        }
                        setIsAddingReward(false);
                        setEditingReward(null);
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold"
                    >
                      {editingReward ? 'Save Reward' : 'Add Slice'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. Platform Feature Switches & Toggles */}
      {activeAdminTab === 'feature_switches' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-red-500" />
                  Platform Master Feature Switches & Control Toggles
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Dynamically activate or deactivate functional modules across user navigation, landing pages, and APIs in real-time.
                </p>
              </div>
              <span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono text-emerald-400 font-bold">
                Live State Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  key: 'teslaStocksEnabled' as const,
                  label: 'Tesla Live Stocks & Market Data',
                  desc: 'Displays real-time TSLA stock charts, price fluctuations, and NASDAQ stats across navigation and tabs.',
                  icon: TrendingUp,
                },
                {
                  key: 'spotTradingEnabled' as const,
                  label: 'Spot Buy Direct TSLA Shares ($500+ Min)',
                  desc: 'Permits users to execute spot share purchases with $500 minimum capital requirement.',
                  icon: DollarSign,
                },
                {
                  key: 'fastRoiPlansEnabled' as const,
                  label: 'Featured Fast-ROI Stock Plans',
                  desc: 'Accelerated 14-45 day stock allocation packages offering higher APY returns.',
                  icon: Flame,
                },
                {
                  key: 'withdrawalsEnabled' as const,
                  label: 'User Payouts & Withdrawals',
                  desc: 'Allows users to request crypto or bank payouts from their cash balances.',
                  icon: CreditCard,
                },
                {
                  key: 'requireDepositForWithdrawal' as const,
                  label: 'Enforce $200 Minimum Deposit Before Withdrawal',
                  desc: 'Crucial rule: Users without completed $200 deposit receive clear withdrawal rejection alert.',
                  icon: ShieldCheck,
                },
                {
                  key: 'spinWheelEnabled' as const,
                  label: 'Lucky Spin Wheel Hub',
                  desc: 'Interactive provably fair wheel module with customizable slice prizes.',
                  icon: Coins,
                },
                {
                  key: 'scratchCardsEnabled' as const,
                  label: 'Scratch Card Foils & Jackpots',
                  desc: 'Instant foil reveals with $8,000 jackpot potential.',
                  icon: Sparkles,
                },
                {
                  key: 'vehicleSalesEnabled' as const,
                  label: 'Tesla Direct Vehicle Sales & Shipping',
                  desc: 'MSRP inventory sales with nationwide door delivery and 7-day guarantee.',
                  icon: Car,
                },
                {
                  key: 'investmentsEnabled' as const,
                  label: 'Supercharger & Fleet Yield Pools',
                  desc: 'Staking pools for vehicle rentals and charging infrastructure APY.',
                  icon: Activity,
                },
              ].map((sw) => {
                const isEnabled = featureToggles[sw.key];
                const IconComponent = sw.icon;

                return (
                  <div
                    key={sw.key}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${isEnabled ? 'text-red-500' : 'text-zinc-600'}`} />
                          <h4 className="text-xs font-bold text-white">{sw.label}</h4>
                        </div>
                        <button
                          onClick={() => {
                            updateFeatureToggles({ [sw.key]: !isEnabled });
                            showToast(`${sw.label} ${!isEnabled ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`text-xl transition-colors ${isEnabled ? 'text-emerald-400' : 'text-zinc-600'}`}
                        >
                          {isEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{sw.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Status:</span>
                      <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-zinc-500 font-bold'}>
                        {isEnabled ? 'ACTIVE / VISIBLE' : 'DISABLED / HIDDEN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 11. Automated Crypto Payment Gateways & RPC Nodes CMS */}
      {activeAdminTab === 'auto_gateways' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  Automated Web3 Crypto Payment Gateways & RPC Nodes
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Configure live blockchain listeners, receiving addresses, confirmation thresholds, RPC endpoints, and instant auto-credit webhook triggers. Edit, modify, and save changes with persistent state.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddGatewayModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Gateway</span>
                </button>
              </div>
            </div>

            {/* Overall Gateway Analytics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Active Nodes</span>
                <span className="font-heading font-black text-xl text-emerald-400 font-mono">
                  {autoCryptoGateways.filter((g) => g.status === 'active').length} / {autoCryptoGateways.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Total Auto-Processed</span>
                <span className="font-heading font-black text-xl text-white font-mono">
                  ${autoCryptoGateways.reduce((acc, g) => acc + (g.totalProcessedUsd || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Total Auto Credits</span>
                <span className="font-heading font-black text-xl text-cyan-400 font-mono">
                  {autoCryptoGateways.reduce((acc, g) => acc + (g.totalTransactionsCount || 0), 0)} Txns
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Webhook Security</span>
                <span className="font-heading font-black text-xl text-amber-400 font-mono">
                  HMAC-SHA256
                </span>
              </div>
            </div>

            {/* Network Filter Bar */}
            <div className="flex items-center gap-1.5 pt-2 overflow-x-auto pb-1">
              {['all', 'TRC20', 'ERC20', 'BTC', 'ETH', 'BEP20', 'XRPL'].map((net) => {
                const count = net === 'all'
                  ? autoCryptoGateways.length
                  : autoCryptoGateways.filter((g) => g.network === net).length;
                return (
                  <button
                    key={net}
                    onClick={() => setGatewayNetworkFilter(net)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
                      gatewayNetworkFilter === net
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{net === 'all' ? 'All Networks' : net}</span>
                    <span className="ml-1.5 text-[10px] opacity-70 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gateways List & Inline Editor */}
          <div className="space-y-4">
            {autoCryptoGateways
              .filter((g) => gatewayNetworkFilter === 'all' || g.network === gatewayNetworkFilter)
              .map((gw) => {
                const isEditing = editingGatewayId === gw.id;
                const draft = isEditing ? { ...gw, ...gatewayEditDraft } : gw;
                const isPinging = pingingGatewayId === gw.id;

                return (
                  <div
                    key={gw.id}
                    className={`rounded-2xl border transition p-5 space-y-4 ${
                      gw.status === 'active'
                        ? 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
                        : 'bg-zinc-950/50 border-zinc-900 opacity-80'
                    }`}
                  >
                    {/* Gateway Top Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold font-mono text-emerald-400">
                          {gw.currency}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-black text-white text-base">
                              {gw.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                              {gw.network}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                gw.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : gw.status === 'testing'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                            >
                              {gw.status}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 font-mono">
                            Symbol: <strong className="text-zinc-200">{gw.symbol}</strong> • Processed: <strong className="text-emerald-400">${gw.totalProcessedUsd.toLocaleString()} USD</strong> ({gw.totalTransactionsCount} txns)
                          </span>
                        </div>
                      </div>

                      {/* Quick Gateway Master Toggles */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Auto Credit Toggle */}
                        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
                          <span className="text-[11px] text-zinc-300 font-mono">Auto-Credit:</span>
                          <button
                            onClick={() => {
                              updateAutoCryptoGateway(gw.id, { autoCreditEnabled: !gw.autoCreditEnabled });
                              showToast(`${gw.name} Auto-Credit set to ${!gw.autoCreditEnabled ? 'ENABLED' : 'DISABLED'}`);
                            }}
                            className={`cursor-pointer ${gw.autoCreditEnabled ? 'text-emerald-400' : 'text-zinc-600'}`}
                          >
                            {gw.autoCreditEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>

                        {/* Status Toggle (Active / Disabled) */}
                        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
                          <span className="text-[11px] text-zinc-300 font-mono">Status:</span>
                          <button
                            onClick={() => {
                              const nextStatus = gw.status === 'active' ? 'disabled' : 'active';
                              updateAutoCryptoGateway(gw.id, { status: nextStatus });
                              showToast(`${gw.name} marked as ${nextStatus.toUpperCase()}`);
                            }}
                            className={`cursor-pointer ${gw.status === 'active' ? 'text-emerald-400' : 'text-zinc-600'}`}
                          >
                            {gw.status === 'active' ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gateway Config Form (Inline Editable) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column: Blockchain Addresses & Node URLs */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                            Receiving Address ({gw.network} Network)
                          </label>
                          <input
                            type="text"
                            value={isEditing ? draft.receivingAddress : gw.receivingAddress}
                            onChange={(e) => {
                              if (!isEditing) {
                                setEditingGatewayId(gw.id);
                                setGatewayEditDraft({ receivingAddress: e.target.value });
                              } else {
                                setGatewayEditDraft((prev) => ({ ...prev, receivingAddress: e.target.value }));
                              }
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            placeholder="Wallet address for receiving automated deposits"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                            RPC Node Endpoint URL
                          </label>
                          <input
                            type="text"
                            value={isEditing ? draft.rpcEndpoint : gw.rpcEndpoint}
                            onChange={(e) => {
                              if (!isEditing) {
                                setEditingGatewayId(gw.id);
                                setGatewayEditDraft({ rpcEndpoint: e.target.value });
                              } else {
                                setGatewayEditDraft((prev) => ({ ...prev, rpcEndpoint: e.target.value }));
                              }
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            placeholder="https://rpc.node.example.com"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-zinc-400 block">
                              Webhook Signing Secret
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowWebhookSecret((prev) => ({ ...prev, [gw.id]: !prev[gw.id] }))}
                              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {showWebhookSecret[gw.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showWebhookSecret[gw.id] ? 'Hide' : 'Reveal'}</span>
                            </button>
                          </div>
                          <input
                            type={showWebhookSecret[gw.id] ? 'text' : 'password'}
                            value={isEditing ? draft.webhookSecret : gw.webhookSecret}
                            onChange={(e) => {
                              if (!isEditing) {
                                setEditingGatewayId(gw.id);
                                setGatewayEditDraft({ webhookSecret: e.target.value });
                              } else {
                                setGatewayEditDraft((prev) => ({ ...prev, webhookSecret: e.target.value }));
                              }
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            placeholder="whsec_..."
                          />
                        </div>
                      </div>

                      {/* Right Column: Confirmation Thresholds & Limits */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                              Required Confirmations
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={isEditing ? draft.requiredConfirmations : gw.requiredConfirmations}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                if (!isEditing) {
                                  setEditingGatewayId(gw.id);
                                  setGatewayEditDraft({ requiredConfirmations: val });
                                } else {
                                  setGatewayEditDraft((prev) => ({ ...prev, requiredConfirmations: val }));
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                              Gateway Fee %
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={isEditing ? draft.feePercent : gw.feePercent}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (!isEditing) {
                                  setEditingGatewayId(gw.id);
                                  setGatewayEditDraft({ feePercent: val });
                                } else {
                                  setGatewayEditDraft((prev) => ({ ...prev, feePercent: val }));
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                              Min Deposit ($ USD)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={isEditing ? draft.minDepositUsd : gw.minDepositUsd}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 10;
                                if (!isEditing) {
                                  setEditingGatewayId(gw.id);
                                  setGatewayEditDraft({ minDepositUsd: val });
                                } else {
                                  setGatewayEditDraft((prev) => ({ ...prev, minDepositUsd: val }));
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                              Max Deposit ($ USD)
                            </label>
                            <input
                              type="number"
                              min={100}
                              value={isEditing ? draft.maxDepositUsd : gw.maxDepositUsd}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 100000;
                                if (!isEditing) {
                                  setEditingGatewayId(gw.id);
                                  setGatewayEditDraft({ maxDepositUsd: val });
                                } else {
                                  setGatewayEditDraft((prev) => ({ ...prev, maxDepositUsd: val }));
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Health Ping & Telemetry Status Box */}
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${gw.lastPingSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            <span className="text-zinc-300">
                              {gw.lastPingSuccess ? 'Node Status: Operational' : 'Node Status: Standby'}
                            </span>
                            {gw.lastPingAt && (
                              <span className="text-[10px] text-zinc-500">
                                ({gw.lastPingAt.split(' ')[1] || 'recent'})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={isPinging}
                            onClick={async () => {
                              setPingingGatewayId(gw.id);
                              const res = await testAutoCryptoGatewayPing(gw.id);
                              setPingingGatewayId(null);
                              showToast(res.message, res.success ? 'success' : 'error');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
                            <span>{isPinging ? 'Pinging...' : 'Ping Node'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Gateway ID: <code className="text-zinc-400">{gw.id}</code>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGatewayId(null);
                              setGatewayEditDraft({});
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              updateAutoCryptoGateway(gw.id, gatewayEditDraft);
                              setEditingGatewayId(null);
                              setGatewayEditDraft({});
                              showToast(`Saved modifications to ${gw.name} successfully!`, 'success');
                            } else {
                              setEditingGatewayId(gw.id);
                              setGatewayEditDraft({
                                receivingAddress: gw.receivingAddress,
                                rpcEndpoint: gw.rpcEndpoint,
                                webhookSecret: gw.webhookSecret,
                                requiredConfirmations: gw.requiredConfirmations,
                                minDepositUsd: gw.minDepositUsd,
                                maxDepositUsd: gw.maxDepositUsd,
                                feePercent: gw.feePercent,
                              });
                            }
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            isEditing
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Save Changes' : 'Edit Gateway'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${gw.name}? This will remove automated processing for this network.`)) {
                              deleteAutoCryptoGateway(gw.id);
                              showToast(`Deleted ${gw.name}`, 'info');
                            }
                          }}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 transition cursor-pointer"
                          title="Delete Gateway"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add New Automated Gateway Modal */}
      {isAddGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                  Add Automated Crypto Gateway
                </h3>
              </div>
              <button
                onClick={() => setIsAddGatewayModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Gateway Name</label>
                <input
                  type="text"
                  value={newGatewayForm.name}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-emerald-500"
                  placeholder="e.g. Solana SPL Automated Node"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Network</label>
                  <select
                    value={newGatewayForm.network}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, network: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  >
                    <option value="TRC20">TRC20 (Tron)</option>
                    <option value="ERC20">ERC20 (Ethereum)</option>
                    <option value="BTC">BTC (Bitcoin Native)</option>
                    <option value="ETH">ETH (Mainnet)</option>
                    <option value="BEP20">BEP20 (BNB Chain)</option>
                    <option value="XRPL">XRPL (XRP Ledger)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Currency</label>
                  <select
                    value={newGatewayForm.currency}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, currency: e.target.value as any, symbol: `${e.target.value}-${newGatewayForm.network}` })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                    <option value="XRP">XRP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Receiving Blockchain Address</label>
                <input
                  type="text"
                  value={newGatewayForm.receivingAddress}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, receivingAddress: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  placeholder="Blockchain address"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">RPC Node Endpoint URL</label>
                <input
                  type="text"
                  value={newGatewayForm.rpcEndpoint}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, rpcEndpoint: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Confirmations</label>
                  <input
                    type="number"
                    min={1}
                    value={newGatewayForm.requiredConfirmations}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, requiredConfirmations: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Min Dep ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={newGatewayForm.minDepositUsd}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, minDepositUsd: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Fee %</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={newGatewayForm.feePercent}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, feePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoCreditCheck"
                  checked={newGatewayForm.autoCreditEnabled}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, autoCreditEnabled: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <label htmlFor="autoCreditCheck" className="text-zinc-300 font-medium">
                  Enable automatic balance credit upon required blockchain confirmations
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddGatewayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newGatewayForm.name.trim() || !newGatewayForm.receivingAddress.trim()}
                  onClick={() => {
                    addAutoCryptoGateway(newGatewayForm);
                    setIsAddGatewayModalOpen(false);
                    showToast(`Automated gateway ${newGatewayForm.name} created!`, 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  Create Gateway
                </button>
              </div>
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

      {/* Adjust Balance Modal (Add / Subtract / Set Exact) */}
      {showBalanceAdjustModal && (() => {
        const userBal = getUserWalletBalances(showBalanceAdjustModal.id);
        const currentAssetValue =
          adjustCurrency === 'USD'
            ? userBal.usd
            : adjustCurrency === 'BTC'
            ? userBal.btc
            : adjustCurrency === 'USDT'
            ? userBal.usdt
            : adjustCurrency === 'XRP'
            ? userBal.xrp
            : userBal.bnb;
        const projectedValue =
          adjustMode === 'add'
            ? currentAssetValue + Math.max(0, adjustAmount)
            : adjustMode === 'subtract'
            ? Math.max(0, currentAssetValue - Math.max(0, adjustAmount))
            : Math.max(0, adjustAmount);

        return (
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
                  <label className="text-zinc-400 block mb-1">Adjustment Operation</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustMode('add')}
                      className={`py-2 px-2.5 rounded-xl font-bold border transition cursor-pointer ${
                        adjustMode === 'add'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      + Add Funds
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustMode('subtract')}
                      className={`py-2 px-2.5 rounded-xl font-bold border transition cursor-pointer ${
                        adjustMode === 'subtract'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      - Subtract
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustMode('set')}
                      className={`py-2 px-2.5 rounded-xl font-bold border transition cursor-pointer ${
                        adjustMode === 'set'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      = Set Exact
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">
                    {adjustMode === 'add'
                      ? `Amount to Credit (+ ${adjustCurrency})`
                      : adjustMode === 'subtract'
                      ? `Amount to Deduct (- ${adjustCurrency})`
                      : `New Exact Balance (${adjustCurrency})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                  <div>
                    <span className="text-zinc-400 block">Current {adjustCurrency}</span>
                    <span className="text-white font-bold tabular-nums">
                      {adjustCurrency === 'USD' ? `$${currentAssetValue.toLocaleString()}` : currentAssetValue}
                    </span>
                  </div>
                  <div className="text-zinc-500">→</div>
                  <div className="text-right">
                    <span className="text-zinc-400 block">Resulting Balance</span>
                    <span
                      className={`font-black tabular-nums ${
                        adjustMode === 'subtract'
                          ? 'text-rose-400'
                          : adjustMode === 'add'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {adjustCurrency === 'USD' ? `$${projectedValue.toLocaleString()}` : projectedValue}
                    </span>
                  </div>
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
                      updateUserBalance(showBalanceAdjustModal.id, adjustCurrency, adjustAmount, adjustMode);
                      setShowBalanceAdjustModal(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold cursor-pointer ${
                      adjustMode === 'subtract'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : adjustMode === 'add'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                  >
                    {adjustMode === 'add'
                      ? 'Credit Balance (+)'
                      : adjustMode === 'subtract'
                      ? 'Deduct Balance (-)'
                      : 'Set Exact Balance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* User Full Activity & Location Inspector Modal */}
      {selectedUserForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-indigo-500/30 rounded-3xl p-6 space-y-5 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForActivity.avatar}
                  alt={selectedUserForActivity.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/40"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-lg text-white">
                      {selectedUserForActivity.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono uppercase">
                      {selectedUserForActivity.tier} • {selectedUserForActivity.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">{selectedUserForActivity.email}</p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{selectedUserForActivity.location || 'Austin, TX, USA'}</span>
                    {selectedUserForActivity.preferredServiceCenter && (
                      <span className="text-zinc-500">• {selectedUserForActivity.preferredServiceCenter}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForActivity(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">LAST PATH</span>
                <span className="text-cyan-400 font-bold">{selectedUserForActivity.lastVisitedPath || '/dashboard'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">DEVICE / IP</span>
                <span className="text-zinc-200 truncate block">
                  {selectedUserForActivity.deviceInfo || 'Desktop Browser'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">DEPOSITED / WITHDRAWN</span>
                <span className="text-emerald-400 font-bold">
                  ${(selectedUserForActivity.totalDepositedUsd ?? 0).toLocaleString()} / ${(selectedUserForActivity.totalWithdrawnUsd ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">REFERRALS</span>
                <span className="text-amber-300 font-bold">
                  {selectedUserForActivity.referralCount} (${selectedUserForActivity.referralEarningsUsd})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Service Bookings */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <h4 className="font-heading font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Service & Wrap Bookings</span>
                </h4>
                {localBookings.filter((b) => b.userId === selectedUserForActivity.id).length === 0 ? (
                  <p className="text-zinc-500 text-[11px]">No bay or ranger bookings recorded.</p>
                ) : (
                  localBookings
                    .filter((b) => b.userId === selectedUserForActivity.id)
                    .map((b) => (
                      <div key={b.id} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{b.serviceType}</span>
                          <span className="text-emerald-400 font-mono">${b.totalCostUsd}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex justify-between">
                          <span>{b.vehicleName} • {b.location}</span>
                          <span className="text-cyan-300">{b.status}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Vehicle Orders */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <h4 className="font-heading font-bold text-white flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-red-400" />
                  <span>Vehicle Orders & Deliveries</span>
                </h4>
                {vehicleOrders.filter((o) => o.userId === selectedUserForActivity.id).length === 0 ? (
                  <p className="text-zinc-500 text-[11px]">No Tesla vehicle purchases or prize orders recorded.</p>
                ) : (
                  vehicleOrders
                    .filter((o) => o.userId === selectedUserForActivity.id)
                    .map((o) => (
                      <div key={o.id} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{o.vehicleName}</span>
                          <span className="text-emerald-400 font-mono">${o.totalUsd.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                          <span>{o.trackingNumber}</span>
                          <span className="uppercase text-amber-300">{o.status.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Investments */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <h4 className="font-heading font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Fleet & Stock Investments</span>
                </h4>
                {allInvestments.filter((i: UserInvestment) => i.userId === selectedUserForActivity.id).length === 0 ? (
                  <p className="text-zinc-500 text-[11px]">No staking positions recorded.</p>
                ) : (
                  allInvestments
                    .filter((i: UserInvestment) => i.userId === selectedUserForActivity.id)
                    .map((i: UserInvestment) => (
                      <div key={i.id} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{i.poolTitle || i.poolName}</span>
                          <span className="text-emerald-400 font-mono">${(i.amountInvestedUsd || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                          <span>APY {i.apy}% ({i.daysElapsed}/{i.durationDays}d)</span>
                          <span className="uppercase text-emerald-300">{i.status}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Withdrawals */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <h4 className="font-heading font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Withdrawal Requests</span>
                </h4>
                {withdrawalRequests.filter((w) => w.userId === selectedUserForActivity.id).length === 0 ? (
                  <p className="text-zinc-500 text-[11px]">No withdrawal requests submitted.</p>
                ) : (
                  withdrawalRequests
                    .filter((w) => w.userId === selectedUserForActivity.id)
                    .map((w) => (
                      <div key={w.id} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{w.currency} Payout</span>
                          <span className="text-cyan-300 font-mono">${w.amountUsd.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                          <span className="truncate max-w-[180px]">{w.destinationAddress}</span>
                          <span className="uppercase text-amber-300">{w.status}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              {selectedUserForActivity.role !== 'admin' && hasAdminPrivilege('manage_admins') && (
                <button
                  type="button"
                  onClick={() => {
                    const targetId = selectedUserForActivity.id;
                    setSelectedUserForActivity(null);
                    setAdminProvisionMode('upgrade');
                    setUpgradeTargetUserId(targetId);
                    setAdminCreateError(null);
                    setActiveAdminTab('admins_mgmt');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Upgrade User to Admin</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedUserForActivity(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROMOTIONAL BANNERS & GEMINI AI GENERATOR */}
      {activeAdminTab === 'promo_banners' && (
        <div className="space-y-6 w-full">
          {/* Gemini AI Banner Studio Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-red-950/20 to-zinc-950 border border-red-500/30 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                    AI Promotional Banner Generator (Gemini 4 Hydrogen)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Auto-create responsive Leaderboard (728×90), Square (300×300), Rectangle (300×250), and Sidebar (160×600) banners. Users automatically receive every active banner with their personal referral link embedded.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingBannerId(null);
                  setManualBannerForm({
                    title: 'Cybertruck VIP Referral Leaderboard',
                    size: 'leaderboard',
                    dimensions: '1456×180 HD',
                    headline: 'TESLA CYBERBEAST DIRECT DELIVERY + $100 REFERRAL BONUS',
                    subheadline: 'Nationwide enclosed transport, 7-day money-back protection & instant crypto settlement.',
                    ctaText: 'Explore Inventory',
                    badgeText: '3D 4K UHD • LEADERBOARD',
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
                  });
                  setShowManualBannerModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create 3D / HD Banner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              <div className="lg:col-span-6 space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Campaign Objective / AI Prompt</label>
                <input
                  type="text"
                  value={aiBannerGoal}
                  onChange={(e) => setAiBannerGoal(e.target.value)}
                  placeholder="Describe offer, APY, vehicle discount, or referral bonus..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Banner Size</label>
                <select
                  value={aiBannerSize}
                  onChange={(e) => setAiBannerSize(e.target.value as BannerSizeType)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="leaderboard">Leaderboard ({aiBannerIs3dHd ? '1456×180 HD' : '728×90'})</option>
                  <option value="square">Square ({aiBannerIs3dHd ? '1200×1200 4K' : '300×300'})</option>
                  <option value="rectangle">Rectangle ({aiBannerIs3dHd ? '1200×1000 HD' : '300×250'})</option>
                  <option value="sidebar">Sidebar ({aiBannerIs3dHd ? '640×2400 HD' : '160×600'})</option>
                  <option value="billboard">Billboard (970×250)</option>
                  <option value="wide_skyscraper">Half-Page (300×600)</option>
                  <option value="social_og">Social Card (1200×628)</option>
                  <option value="story">Story Vertical (1080×1920)</option>
                  <option value="mobile_banner">Mobile Banner (320×100)</option>
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Tone</label>
                <select
                  value={aiBannerTone}
                  onChange={(e) => setAiBannerTone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="Luxury High-Octane EV">Luxury High-Octane EV</option>
                  <option value="Urgent Limited Offer">Urgent Limited Offer</option>
                  <option value="Institutional Fintech">Institutional Fintech</option>
                  <option value="Ambassador VIP Invite">Ambassador VIP Invite</option>
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Target Route</label>
                <select
                  value={aiBannerTargetTab}
                  onChange={(e) => setAiBannerTargetTab(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="stocks">TSLA Stocks</option>
                  <option value="vehicles">Car Sales</option>
                  <option value="investment">Fleet Yield</option>
                  <option value="promotions">Spin & Win</option>
                  <option value="referrals">Referrals (+$100)</option>
                  <option value="shop">Hardware Store</option>
                </select>
              </div>
            </div>

            {/* 3D / HD Render Studio Options */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs">
              <label className="flex items-center gap-2.5 text-zinc-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiBannerIs3dHd}
                  onChange={(e) => setAiBannerIs3dHd(e.target.checked)}
                  className="rounded text-red-500 focus:ring-0"
                />
                <span>Enable 3D Depth &amp; HD Export</span>
              </label>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">3D Perspective Preset</label>
                <select
                  disabled={!aiBannerIs3dHd}
                  value={aiBannerStyle3d}
                  onChange={(e) => setAiBannerStyle3d(e.target.value as Banner3dPreset)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white disabled:opacity-50"
                >
                  <option value="cyber_perspective">Cyber Tilt Perspective</option>
                  <option value="holographic_depth">Holographic Iridescent Depth</option>
                  <option value="studio_4k_bevel">Studio 4K Carbon Bevel</option>
                  <option value="obsidian_neon">Obsidian Neon Reflection</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">Render Quality</label>
                <select
                  value={aiBannerQuality}
                  onChange={(e) => setAiBannerQuality(e.target.value as '4K UHD' | 'HD 1080p')}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="4K UHD">4K UHD (Hi-DPI 2x)</option>
                  <option value="HD 1080p">HD 1080p</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">Featured Tesla Showcase</label>
                <input
                  type="text"
                  value={aiBannerCarModel}
                  onChange={(e) => setAiBannerCarModel(e.target.value)}
                  placeholder="Cybertruck Cyberbeast"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={isGeneratingAiBanner || isGeneratingAllSizes}
                onClick={() => handleGenerateAiBanner(aiBannerSize)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGeneratingAiBanner ? 'Generating 3D / HD Banner...' : `Auto-Generate ${aiBannerIs3dHd ? '3D HD ' : ''}${aiBannerSize.toUpperCase()} Banner`}
                </span>
              </button>

              <button
                type="button"
                disabled={isGeneratingAiBanner || isGeneratingAllSizes}
                onClick={handleGenerateFullBannerPack}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>
                  {isGeneratingAllSizes ? 'Generating Full 4-Size Pack...' : 'AI Generate All 4 Sizes Pack'}
                </span>
              </button>
            </div>
          </div>

          {/* Published Marketing Banners List */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 className="font-heading font-bold text-base text-white">
                  Active & Draft Promotional Banners ({marketingBanners.length})
                </h4>
                <p className="text-xs text-zinc-400">
                  Every published banner is rendered in interactive 3D / HD perspective on the Promotional Banners page with user referral links attached.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketingBanners.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: b.accentColor }}
                        />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[10px] font-mono font-bold text-white uppercase">
                          {b.size} ({b.dimensions})
                        </span>
                        {b.is3dHd && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                            3D • {b.resolutionQuality || '4K UHD'}
                          </span>
                        )}
                        {b.isAiGenerated && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            AI
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => updateMarketingBanner(b.id, { isActive: !b.isActive })}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                          b.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.isActive ? 'Published' : 'Paused'}
                      </button>
                    </div>

                    <h5 className="font-heading font-bold text-sm text-white">{b.headline}</h5>
                    <p className="text-xs text-zinc-400 line-clamp-2">{b.subheadline}</p>
                    {b.carRenderModel && (
                      <span className="inline-block text-[10px] font-mono text-red-400">
                        Showcase: {b.carRenderModel}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400">
                      CTA: <strong className="text-white">{b.ctaText}</strong> • /{b.targetTab}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBannerId(b.id);
                          setManualBannerForm({
                            title: b.title,
                            size: b.size,
                            dimensions: b.dimensions,
                            customWidth: b.customWidth,
                            customHeight: b.customHeight,
                            imageMode: b.imageMode || ((b.slideImages?.length || 0) > 1 ? 'multi' : 'single'),
                            transitionEffect: b.transitionEffect || 'fade',
                            headline: b.headline,
                            subheadline: b.subheadline,
                            ctaText: b.ctaText,
                            badgeText: b.badgeText,
                            themeGradient: b.themeGradient,
                            accentColor: b.accentColor,
                            targetTab: b.targetTab,
                            imageUrl: b.imageUrl || '/promo-cyberbeast.jpg',
                            slideImages: b.slideImages && b.slideImages.length > 0 ? b.slideImages : [b.imageUrl || '/promo-cyberbeast.jpg'],
                            slideIntervalSec: b.slideIntervalSec || 4,
                            isActive: b.isActive,
                            isAiGenerated: b.isAiGenerated,
                            is3dHd: b.is3dHd ?? true,
                            style3dPreset: b.style3dPreset || 'cyber_perspective',
                            resolutionQuality: b.resolutionQuality || '4K UHD',
                            carRenderModel: b.carRenderModel || 'Cybertruck Cyberbeast',
                          });
                          setShowManualBannerModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                        title="Edit banner"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMarketingBanner(b.id)}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Delete banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotional Short Videos Studio (AI Generated + Admin Uploads) */}
          <AdminPromoVideosManager />

          {/* Manual Create / Edit 3D HD Banner Modal */}
          {showManualBannerModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-xl space-y-4 text-xs max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-heading font-bold text-base text-white">
                    {editingBannerId ? 'Edit 3D / HD Promotional Banner' : 'Create 3D / HD Promotional Banner'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowManualBannerModal(false);
                      setEditingBannerId(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Banner Name</label>
                      <input
                        type="text"
                        value={manualBannerForm.title}
                        onChange={(e) => setManualBannerForm({ ...manualBannerForm, title: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Size Format</label>
                      <select
                        value={manualBannerForm.size}
                        onChange={(e) => {
                          const s = e.target.value as BannerSizeType;
                          const pxMap: Record<BannerSizeType, { w: number; h: number; label: string }> = {
                            leaderboard: { w: 728, h: 90, label: manualBannerForm.is3dHd ? '1456×180 HD' : '728×90' },
                            square: { w: 300, h: 300, label: manualBannerForm.is3dHd ? '1200×1200 4K' : '300×300' },
                            rectangle: { w: 300, h: 250, label: manualBannerForm.is3dHd ? '1200×1000 HD' : '300×250' },
                            sidebar: { w: 160, h: 600, label: manualBannerForm.is3dHd ? '640×2400 HD' : '160×600' },
                            billboard: { w: 970, h: 250, label: '970×250' },
                            wide_skyscraper: { w: 300, h: 600, label: '300×600' },
                            social_og: { w: 1200, h: 628, label: '1200×628' },
                            story: { w: 1080, h: 1920, label: '1080×1920' },
                            mobile_banner: { w: 320, h: 100, label: '320×100' },
                            custom: {
                              w: manualBannerForm.customWidth || 800,
                              h: manualBannerForm.customHeight || 400,
                              label: `${manualBannerForm.customWidth || 800}×${manualBannerForm.customHeight || 400}`,
                            },
                          };
                          const picked = pxMap[s];
                          setManualBannerForm({
                            ...manualBannerForm,
                            size: s,
                            customWidth: picked.w,
                            customHeight: picked.h,
                            dimensions: picked.label,
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="leaderboard">Leaderboard (728×90)</option>
                        <option value="square">Square (300×300)</option>
                        <option value="rectangle">Rectangle (300×250)</option>
                        <option value="sidebar">Sidebar (160×600)</option>
                        <option value="billboard">Billboard (970×250)</option>
                        <option value="wide_skyscraper">Half-Page (300×600)</option>
                        <option value="social_og">Social Card (1200×628)</option>
                        <option value="story">Story Vertical (1080×1920)</option>
                        <option value="mobile_banner">Mobile Banner (320×100)</option>
                        <option value="custom">Custom Dimensions (px)</option>
                      </select>
                    </div>
                  </div>

                  {manualBannerForm.size === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div>
                        <label className="text-zinc-400 block mb-1">Custom Width (px)</label>
                        <input
                          type="number"
                          min={120}
                          max={2400}
                          value={manualBannerForm.customWidth || 800}
                          onChange={(e) => {
                            const w = Math.max(120, Math.min(2400, Number(e.target.value) || 800));
                            const h = manualBannerForm.customHeight || 400;
                            setManualBannerForm({
                              ...manualBannerForm,
                              customWidth: w,
                              dimensions: `${w}×${h}`,
                            });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Custom Height (px)</label>
                        <input
                          type="number"
                          min={60}
                          max={2400}
                          value={manualBannerForm.customHeight || 400}
                          onChange={(e) => {
                            const h = Math.max(60, Math.min(2400, Number(e.target.value) || 400));
                            const w = manualBannerForm.customWidth || 800;
                            setManualBannerForm({
                              ...manualBannerForm,
                              customHeight: h,
                              dimensions: `${w}×${h}`,
                            });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">Banner Image Type</label>
                      <select
                        value={manualBannerForm.imageMode || 'multi'}
                        onChange={(e) =>
                          setManualBannerForm({
                            ...manualBannerForm,
                            imageMode: e.target.value as 'single' | 'multi',
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="single">Single Static Image</option>
                        <option value="multi">Multi-Image Switch Carousel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Switch Transition Effect</label>
                      <select
                        disabled={manualBannerForm.imageMode === 'single'}
                        value={manualBannerForm.transitionEffect || 'fade'}
                        onChange={(e) =>
                          setManualBannerForm({
                            ...manualBannerForm,
                            transitionEffect: e.target.value as 'fade' | 'slide' | 'zoom',
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white disabled:opacity-50"
                      >
                        <option value="fade">Crossfade</option>
                        <option value="slide">Horizontal Slide</option>
                        <option value="zoom">Cinematic Zoom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Headline</label>
                    <input
                      type="text"
                      value={manualBannerForm.headline}
                      onChange={(e) => setManualBannerForm({ ...manualBannerForm, headline: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Subheadline</label>
                    <textarea
                      rows={2}
                      value={manualBannerForm.subheadline}
                      onChange={(e) => setManualBannerForm({ ...manualBannerForm, subheadline: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={manualBannerForm.ctaText}
                        onChange={(e) => setManualBannerForm({ ...manualBannerForm, ctaText: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Target Route</label>
                      <select
                        value={manualBannerForm.targetTab}
                        onChange={(e) => setManualBannerForm({ ...manualBannerForm, targetTab: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="vehicles">Car Sales</option>
                        <option value="stocks">TSLA Stocks</option>
                        <option value="investment">Fleet Yield</option>
                        <option value="promotions">Spin & Scratch</option>
                        <option value="referrals">Referrals</option>
                        <option value="shop">Store</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Accent Color</label>
                      <input
                        type="color"
                        value={manualBannerForm.accentColor}
                        onChange={(e) => setManualBannerForm({ ...manualBannerForm, accentColor: e.target.value })}
                        className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1"
                      />
                    </div>
                  </div>

                  {/* 3D / HD Configuration */}
                  <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                    <label className="flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(manualBannerForm.is3dHd)}
                        onChange={(e) =>
                          setManualBannerForm({
                            ...manualBannerForm,
                            is3dHd: e.target.checked,
                          })
                        }
                        className="rounded text-red-500"
                      />
                      <span>Enable Interactive 3D Tilt &amp; HD Export Mode</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-zinc-400 block mb-1">3D Shader Style</label>
                        <select
                          value={manualBannerForm.style3dPreset || 'cyber_perspective'}
                          onChange={(e) =>
                            setManualBannerForm({
                              ...manualBannerForm,
                              style3dPreset: e.target.value as Banner3dPreset,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-2 text-white"
                        >
                          <option value="cyber_perspective">Cyber Tilt Perspective</option>
                          <option value="holographic_depth">Holographic Depth</option>
                          <option value="studio_4k_bevel">Studio 4K Bevel</option>
                          <option value="obsidian_neon">Obsidian Neon</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Quality</label>
                        <select
                          value={manualBannerForm.resolutionQuality || '4K UHD'}
                          onChange={(e) =>
                            setManualBannerForm({
                              ...manualBannerForm,
                              resolutionQuality: e.target.value as '4K UHD' | 'HD 1080p',
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-2 text-white"
                        >
                          <option value="4K UHD">4K UHD</option>
                          <option value="HD 1080p">HD 1080p</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Tesla Showcase</label>
                        <input
                          type="text"
                          value={manualBannerForm.carRenderModel || ''}
                          onChange={(e) =>
                            setManualBannerForm({ ...manualBannerForm, carRenderModel: e.target.value })
                          }
                          placeholder="Model S Plaid"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Primary HD Backdrop Image URL</label>
                      <input
                        type="text"
                        value={manualBannerForm.imageUrl || ''}
                        onChange={(e) => setManualBannerForm({ ...manualBannerForm, imageUrl: e.target.value })}
                        placeholder="/promo-cyberbeast.jpg"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-zinc-300 font-semibold">
                          Multi-Slide 3D Rotating Gallery (One URL per line)
                        </label>
                        <select
                          value={manualBannerForm.slideIntervalSec || 4}
                          onChange={(e) =>
                            setManualBannerForm({ ...manualBannerForm, slideIntervalSec: Number(e.target.value) || 4 })
                          }
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                        >
                          <option value={3}>Rotate 3s</option>
                          <option value={4}>Rotate 4s</option>
                          <option value={6}>Rotate 6s</option>
                        </select>
                      </div>

                      <textarea
                        rows={3}
                        value={(manualBannerForm.slideImages || []).join('\n')}
                        onChange={(e) => {
                          const list = e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setManualBannerForm({
                            ...manualBannerForm,
                            slideImages: list,
                            imageUrl: list[0] || manualBannerForm.imageUrl,
                          });
                        }}
                        placeholder="/promo-cyberbeast.jpg&#10;/promo-plaid.jpg&#10;/promo-robotaxi.jpg"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono text-[11px]"
                      />

                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer font-semibold">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUploadingBannerSlides ? 'Uploading Slides...' : 'Upload Slide Images (JPG/PNG)'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setIsUploadingBannerSlides(true);
                            try {
                              const uploadedUrls: string[] = [];
                              for (const file of files) {
                                const dataUrl = await new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader();
                                  reader.onload = () => resolve(String(reader.result || ''));
                                  reader.onerror = reject;
                                  reader.readAsDataURL(file);
                                });
                                const resp = await fetch('/api/media/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    filename: file.name,
                                    dataUrl,
                                  }),
                                });
                                const data = await resp.json();
                                if (data?.url) uploadedUrls.push(data.url);
                              }
                              if (uploadedUrls.length > 0) {
                                const merged = [...(manualBannerForm.slideImages || []), ...uploadedUrls];
                                setManualBannerForm({
                                  ...manualBannerForm,
                                  slideImages: merged,
                                  imageUrl: manualBannerForm.imageUrl || merged[0],
                                });
                                showToast(`Added ${uploadedUrls.length} slide image(s) to 3D banner!`, 'success');
                              }
                            } catch {
                              showToast('Failed to upload slide image.', 'error');
                            } finally {
                              setIsUploadingBannerSlides(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualBannerModal(false);
                      setEditingBannerId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingBannerId) {
                        updateMarketingBanner(editingBannerId, manualBannerForm);
                        showToast('3D / HD banner updated successfully!', 'success');
                      } else {
                        createMarketingBanner(manualBannerForm);
                      }
                      setShowManualBannerModal(false);
                      setEditingBannerId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                  >
                    {editingBannerId ? 'Save Changes' : 'Publish 3D / HD Banner'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ADMIN ACCOUNTS & ROLE PRIVILEGES (RBAC) */}
      {activeAdminTab === 'admins_mgmt' && hasAdminPrivilege('manage_admins') && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-1">
              <p className="text-[11px] font-mono uppercase text-zinc-400">Authorized Administrators</p>
              <p className="font-heading font-black text-2xl text-white">{adminsList.length || 1}</p>
              <p className="text-[11px] text-amber-400">Restricted to /admin portal authentication</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-mono uppercase text-zinc-400">Super-Admin Accounts</p>
              <p className="font-heading font-black text-2xl text-emerald-400">
                {adminsList.filter((a) => a.adminPrivileges?.includes('super_admin')).length || 1}
              </p>
              <p className="text-[11px] text-zinc-400">Unrestricted system-wide control</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <p className="text-[11px] font-mono uppercase text-zinc-400">Delegated Role Admins</p>
              <p className="font-heading font-black text-2xl text-cyan-400">
                {adminsList.filter((a) => !a.adminPrivileges?.includes('super_admin')).length}
              </p>
              <p className="text-[11px] text-zinc-400">Scoped strictly to assigned privileges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Create New Admin OR Upgrade Existing User Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-950 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-white">
                      {adminProvisionMode === 'upgrade' ? 'Upgrade Existing User to Admin' : 'Create New Admin'}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {adminProvisionMode === 'upgrade'
                        ? 'Promote a registered member & assign admin role privileges'
                        : 'Provision a new administrator & assign permissions'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchAdmins}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  title="Refresh admin roster"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAdminProvisionMode('create');
                    setAdminCreateError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer ${
                    adminProvisionMode === 'create'
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Create New Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminProvisionMode('upgrade');
                    setAdminCreateError(null);
                    if (!upgradeTargetUserId) {
                      const firstNonAdmin = allUsers.find((u) => u.role !== 'admin');
                      if (firstNonAdmin) setUpgradeTargetUserId(firstNonAdmin.id);
                    }
                  }}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer ${
                    adminProvisionMode === 'upgrade'
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upgrade Existing User
                </button>
              </div>

              {adminCreateError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{adminCreateError}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminCreateError(null);
                  if (newAdminForm.adminPrivileges.length === 0) {
                    setAdminCreateError('Select at least one privilege scope.');
                    return;
                  }

                  if (adminProvisionMode === 'upgrade') {
                    const targetUser = allUsers.find((u) => u.id === upgradeTargetUserId);
                    if (!targetUser) {
                      setAdminCreateError('Please select an existing registered user to upgrade.');
                      return;
                    }
                    setIsCreatingAdmin(true);
                    const res = await upgradeUserToAdmin({
                      userId: targetUser.id,
                      email: targetUser.email,
                      name: targetUser.name,
                      adminRoleLabel: newAdminForm.adminRoleLabel || 'Operations Admin',
                      adminPrivileges: newAdminForm.adminPrivileges,
                      location: targetUser.location || newAdminForm.location,
                      phone: targetUser.phone || newAdminForm.phone,
                    });
                    setIsCreatingAdmin(false);
                    if (!res.success) {
                      setAdminCreateError(res.error || 'Failed to upgrade user to admin.');
                    } else {
                      setUpgradeTargetUserId('');
                      fetchAdmins();
                    }
                    return;
                  }

                  if (!newAdminForm.name.trim() || !newAdminForm.email.trim()) {
                    setAdminCreateError('Admin full name and email are required.');
                    return;
                  }
                  if (newAdminForm.password.length < 8) {
                    setAdminCreateError('Password must be at least 8 characters.');
                    return;
                  }
                  setIsCreatingAdmin(true);
                  const res = await createAdminAccount(newAdminForm);
                  setIsCreatingAdmin(false);
                  if (!res.success) {
                    setAdminCreateError(res.error || 'Failed to create admin account.');
                  } else {
                    setNewAdminForm({
                      name: '',
                      email: '',
                      password: '',
                      adminRoleLabel: 'Site CMS & Inventory Manager',
                      location: 'Austin Gigafactory Hub',
                      phone: '',
                      adminPrivileges: ['manage_site_cms', 'manage_cars_store'],
                    });
                  }
                }}
                className="space-y-3.5 text-xs"
              >
                {adminProvisionMode === 'upgrade' ? (
                  <>
                    <div>
                      <label className="text-zinc-400 block mb-1">Select Registered User to Promote</label>
                      <select
                        value={upgradeTargetUserId}
                        onChange={(e) => setUpgradeTargetUserId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white"
                      >
                        <option value="">-- Choose Existing User --</option>
                        {allUsers
                          .filter((u) => u.role !== 'admin')
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email}) — {u.location || 'Global'}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Assigned Admin Role Title</label>
                      <input
                        type="text"
                        required
                        value={newAdminForm.adminRoleLabel}
                        onChange={(e) => setNewAdminForm({ ...newAdminForm, adminRoleLabel: e.target.value })}
                        placeholder="e.g. Regional Operations Admin"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.name}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                          placeholder="e.g. Elena Rostova"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Role Title</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.adminRoleLabel}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, adminRoleLabel: e.target.value })}
                          placeholder="e.g. Finance Officer"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Admin Login Email</label>
                      <input
                        type="email"
                        required
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                        placeholder="elena.finance@apex-tesla.io"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-zinc-400">Password (min 8 chars)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const rand = `ApexAdm!${Math.floor(1000 + Math.random() * 9000)}`;
                            setNewAdminForm({ ...newAdminForm, password: rand });
                            setShowNewAdminPassword(true);
                          }}
                          className="text-[10px] text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          Generate Strong Password
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewAdminPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-3 pr-9 py-2 text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                          className="absolute right-2.5 top-2 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1">Hub Location</label>
                        <input
                          type="text"
                          value={newAdminForm.location}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, location: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Phone (Optional)</label>
                        <input
                          type="text"
                          value={newAdminForm.phone}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                          placeholder="+1 (555) ..."
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Role Presets */}
                <div className="pt-1">
                  <label className="text-zinc-400 block mb-1.5 font-semibold">Quick Role Presets</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ADMIN_ROLE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setNewAdminForm({
                            ...newAdminForm,
                            adminRoleLabel: preset.label,
                            adminPrivileges: [...preset.privileges],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-200 cursor-pointer transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Privileges Checkboxes */}
                <div className="pt-1 space-y-1.5">
                  <label className="text-zinc-300 font-semibold block">
                    Assign Privileges ({newAdminForm.adminPrivileges.length} selected)
                  </label>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {ADMIN_PRIVILEGE_CATALOG.map((priv) => {
                      const checked = newAdminForm.adminPrivileges.includes(priv.id);
                      const canGrantSuper =
                        priv.id !== 'super_admin' || currentUser?.adminPrivileges?.includes('super_admin');
                      return (
                        <label
                          key={priv.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition ${
                            !canGrantSuper
                              ? 'opacity-45 cursor-not-allowed bg-zinc-900/40 border-zinc-800'
                              : checked
                              ? 'bg-amber-500/10 border-amber-500/40 cursor-pointer'
                              : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!canGrantSuper}
                            checked={checked}
                            onChange={() => {
                              setNewAdminForm((prev) => {
                                const exists = prev.adminPrivileges.includes(priv.id);
                                return {
                                  ...prev,
                                  adminPrivileges: exists
                                    ? prev.adminPrivileges.filter((p) => p !== priv.id)
                                    : [...prev.adminPrivileges, priv.id],
                                };
                              });
                            }}
                            className="mt-0.5 rounded text-amber-500 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block">{priv.label}</span>
                            <span className="text-[10px] text-zinc-400 leading-snug block">
                              {priv.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-heading font-black text-xs shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingAdmin ? (
                    <span>{adminProvisionMode === 'upgrade' ? 'Upgrading User to Admin...' : 'Provisioning Admin Account...'}</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {adminProvisionMode === 'upgrade'
                          ? 'Upgrade User to Admin & Grant Privileges'
                          : 'Create Administrator & Assign Privileges'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Active Admin Accounts Roster */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white">
                      Authorized Administrators & Permissions Roster
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Only listed accounts can authenticate at <code className="text-amber-300">/admin</code>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-amber-300">
                    {adminsList.length} Active Accounts
                  </span>
                </div>

                <div className="space-y-3">
                  {adminsList.map((adm) => {
                    const isRoot = adm.id === 'usr-apex-admin-01';
                    const isSelf = adm.id === currentUser?.id;
                    const privs = adm.adminPrivileges || [];
                    return (
                      <div
                        key={adm.id}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isRoot
                            ? 'bg-amber-950/15 border-amber-500/40'
                            : 'bg-zinc-900/70 border-zinc-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={adm.avatar}
                              alt={adm.name}
                              className="w-11 h-11 rounded-xl object-cover border border-amber-500/40 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-heading font-bold text-sm text-white truncate">
                                  {adm.name}
                                </span>
                                {isRoot && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black uppercase">
                                    ROOT PROTECTED
                                  </span>
                                )}
                                {isSelf && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-zinc-400 truncate">{adm.email}</p>
                              <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                                {adm.adminRoleLabel || 'Administrator'} • {adm.location || 'HQ'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAdminTarget(adm);
                                setEditingAdminRoleLabel(adm.adminRoleLabel || 'Administrator');
                                setEditingAdminPrivileges([...(adm.adminPrivileges || [])]);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              <span>Edit Privileges</span>
                            </button>
                            {!isRoot && !isSelf && (
                              <button
                                type="button"
                                onClick={() => deleteAdminAccount(adm.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                title="Revoke admin and terminate sessions"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Revoke</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Granted Privilege Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/80">
                          {privs.map((p) => {
                            const meta = ADMIN_PRIVILEGE_CATALOG.find((c) => c.id === p);
                            return (
                              <span
                                key={p}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                  p === 'super_admin'
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                                    : 'bg-zinc-950 border-zinc-700 text-zinc-300'
                                }`}
                              >
                                {meta?.label || p}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Admin Privileges Modal */}
          {editingAdminTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white">
                      Edit Privileges: {editingAdminTarget.name}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400">{editingAdminTarget.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAdminTarget(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Role Label</label>
                    <input
                      type="text"
                      value={editingAdminRoleLabel}
                      onChange={(e) => setEditingAdminRoleLabel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-300 font-semibold block">Granted Privileges</label>
                    {ADMIN_PRIVILEGE_CATALOG.map((priv) => {
                      const isChecked = editingAdminPrivileges.includes(priv.id);
                      const isLockedRoot =
                        editingAdminTarget.id === 'usr-apex-admin-01' &&
                        (priv.id === 'super_admin' || priv.id === 'manage_admins');
                      return (
                        <label
                          key={priv.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition ${
                            isLockedRoot
                              ? 'opacity-65 cursor-not-allowed bg-amber-950/20 border-amber-500/30'
                              : isChecked
                              ? 'bg-amber-500/10 border-amber-500/40 cursor-pointer'
                              : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isLockedRoot}
                            checked={isChecked}
                            onChange={() => {
                              setEditingAdminPrivileges((prev) =>
                                prev.includes(priv.id)
                                  ? prev.filter((p) => p !== priv.id)
                                  : [...prev, priv.id]
                              );
                            }}
                            className="mt-0.5 rounded text-amber-500 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{priv.label}</span>
                            <span className="text-[10px] text-zinc-400 block">{priv.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingAdminTarget(null)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingAdminPrivs || editingAdminPrivileges.length === 0}
                      onClick={async () => {
                        setIsSavingAdminPrivs(true);
                        const res = await updateAdminPrivileges(editingAdminTarget.id, {
                          adminRoleLabel: editingAdminRoleLabel,
                          adminPrivileges: editingAdminPrivileges,
                        });
                        setIsSavingAdminPrivs(false);
                        if (res.success) {
                          setEditingAdminTarget(null);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingAdminPrivs ? 'Saving...' : 'Save Privileges'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  onChange={(e) =>
                    setPageForm({ ...pageForm, isPublished: e.target.checked, published: e.target.checked })
                  }
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

      {/* Navigation Menu Item Modal (Create / Edit) */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {editingMenuId ? 'Edit Navigation Menu Item' : 'Add Navigation Menu Item'}
              </h3>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Menu Display Label</label>
                  <input
                    type="text"
                    value={menuForm.label}
                    onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
                    placeholder="e.g. VIP Fleet, Storefront"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Menu Location</label>
                  <select
                    value={menuForm.location}
                    onChange={(e) => setMenuForm({ ...menuForm, location: e.target.value as MenuLocation })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="navbar">Top Navbar</option>
                    <option value="dropdown">User Dropdown Menu</option>
                    <option value="footer_services">Footer: Services Column</option>
                    <option value="footer_fleet">Footer: Fleet Column</option>
                    <option value="footer_legal">Footer: Trust & Promotions</option>
                    <option value="mobile_only">Mobile Drawer Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Target Route / Page Slug</label>
                  <select
                    value={menuForm.targetTab}
                    onChange={(e) => setMenuForm({ ...menuForm, targetTab: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    {[
                      'home',
                      'stocks',
                      'vehicles',
                      'coupons',
                      'services',
                      'wraps',
                      'rentals',
                      'investment',
                      'promotions',
                      'banners',
                      'referrals',
                      'social',
                      'shop',
                      'about',
                      'faq',
                      'contact',
                      'tracking',
                      'dashboard',
                      ...sitePages.filter((p) => !p.isSystem).map((p) => p.slug),
                    ]
                      .filter((v, idx, arr) => arr.indexOf(v) === idx)
                      .map((slug) => (
                        <option key={slug} value={slug}>
                          /{slug}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Badge Pill (Optional)</label>
                  <input
                    type="text"
                    value={menuForm.badge || ''}
                    onChange={(e) => setMenuForm({ ...menuForm, badge: e.target.value })}
                    placeholder="e.g. HOT, NEW, +$100"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={menuForm.order}
                    onChange={(e) => setMenuForm({ ...menuForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Icon (Optional)</label>
                  <select
                    value={menuForm.iconName || ''}
                    onChange={(e) => setMenuForm({ ...menuForm, iconName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">None</option>
                    <option value="Car">Car</option>
                    <option value="Activity">Activity</option>
                    <option value="Tag">Tag</option>
                    <option value="Wrench">Wrench</option>
                    <option value="Palette">Palette</option>
                    <option value="TrendingUp">TrendingUp</option>
                    <option value="Gift">Gift</option>
                    <option value="Users">Users</option>
                    <option value="Share2">Share2</option>
                    <option value="Megaphone">Megaphone</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(menuForm.highlight)}
                    onChange={(e) => setMenuForm({ ...menuForm, highlight: e.target.checked })}
                  />
                  <span>Highlight in Amber/Gold</span>
                </label>
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={menuForm.isVisible}
                    onChange={(e) => setMenuForm({ ...menuForm, isVisible: e.target.checked })}
                  />
                  <span>Visible on Site</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!menuForm.label.trim()}
                  onClick={() => {
                    if (editingMenuId) {
                      updateNavigationMenuItem(editingMenuId, menuForm);
                    } else {
                      createNavigationMenuItem(menuForm);
                    }
                    setIsMenuModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50"
                >
                  {editingMenuId ? 'Save Menu Item' : 'Add Menu Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Product Inventory Modal (Create / Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {editingProductId ? 'Edit Store Product' : 'Add Store Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Cybertruck Forged Wheel Set"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductItem['category'] })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Wraps & Film">Wraps &amp; Film</option>
                    <option value="Aero & Carbon">Aero &amp; Carbon</option>
                    <option value="Wheels & Performance">Wheels &amp; Performance</option>
                    <option value="Interior & Yoke">Interior &amp; Yoke</option>
                    <option value="Charging & Tech">Charging &amp; Tech</option>
                    <option value="Vehicle Sales">Vehicle Sales</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={productForm.priceUsd}
                    onChange={(e) => setProductForm({ ...productForm, priceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-cyan-300 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Compatible Models</label>
                <input
                  type="text"
                  value={productForm.compatibility || ''}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      compatibility: e.target.value,
                    })
                  }
                  placeholder="e.g. Model S, Model 3, Model X, Model Y, Cybertruck"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                />
                <span>Available in stock on public Store page</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!productForm.name.trim()}
                  onClick={() => {
                    if (editingProductId) {
                      updateProductItem(editingProductId, productForm);
                    } else {
                      addProductItem(productForm);
                    }
                    setIsProductModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50"
                >
                  {editingProductId ? 'Save Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scratch Card Tier Promotional Modal (Create / Edit) */}
      {isScratchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-base text-white">
                {editingScratchId ? 'Edit Scratch Card Tier' : 'Create Scratch Card Tier'}
              </h3>
              <button
                onClick={() => setIsScratchModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Tier Name</label>
                <input
                  type="text"
                  value={scratchForm.name}
                  onChange={(e) => setScratchForm({ ...scratchForm, name: e.target.value })}
                  placeholder="e.g. Founders Roadster Apex"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Ticket Price (USD)</label>
                  <input
                    type="number"
                    value={scratchForm.priceUsd}
                    onChange={(e) => setScratchForm({ ...scratchForm, priceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Max Jackpot (USD)</label>
                  <input
                    type="number"
                    value={scratchForm.maxPrizeUsd}
                    onChange={(e) => setScratchForm({ ...scratchForm, maxPrizeUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Tailwind Gradient Class</label>
                <select
                  value={scratchForm.gradient}
                  onChange={(e) => setScratchForm({ ...scratchForm, gradient: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value="from-amber-600 via-red-600 to-rose-700">Amber → Red → Rose</option>
                  <option value="from-emerald-600 via-teal-600 to-cyan-700">Emerald → Teal → Cyan</option>
                  <option value="from-purple-600 via-indigo-600 to-blue-700">Purple → Indigo → Blue</option>
                  <option value="from-zinc-700 via-slate-800 to-zinc-950">Carbon Metallic</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={scratchForm.description}
                  onChange={(e) => setScratchForm({ ...scratchForm, description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    Prize Payout &amp; Tesla Car Jackpot Outcomes
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setScratchForm({
                        ...scratchForm,
                        possiblePrizes: [
                          ...scratchForm.possiblePrizes,
                          {
                            amountUsd: 48990,
                            label: 'TESLA MODEL Y PERFORMANCE WIN',
                            weight: 3,
                            isTeslaCar: true,
                            vehicleModel: 'Tesla Model Y Performance',
                          },
                        ],
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Prize / Car Win</span>
                  </button>
                </div>

                {scratchForm.possiblePrizes.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={p.label}
                        onChange={(e) => {
                          const updated = [...scratchForm.possiblePrizes];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setScratchForm({ ...scratchForm, possiblePrizes: updated });
                        }}
                        placeholder="Prize Label"
                        className="col-span-6 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-white"
                      />
                      <input
                        type="number"
                        value={p.amountUsd}
                        onChange={(e) => {
                          const updated = [...scratchForm.possiblePrizes];
                          updated[idx] = { ...updated[idx], amountUsd: parseFloat(e.target.value) || 0 };
                          setScratchForm({ ...scratchForm, possiblePrizes: updated });
                        }}
                        title="Prize USD Value"
                        className="col-span-3 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-amber-400 font-mono"
                      />
                      <input
                        type="number"
                        min="1"
                        value={p.weight}
                        onChange={(e) => {
                          const updated = [...scratchForm.possiblePrizes];
                          updated[idx] = { ...updated[idx], weight: Math.max(1, parseFloat(e.target.value) || 1) };
                          setScratchForm({ ...scratchForm, possiblePrizes: updated });
                        }}
                        title="Probability weight"
                        className="col-span-2 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (scratchForm.possiblePrizes.length <= 1) return;
                          setScratchForm({
                            ...scratchForm,
                            possiblePrizes: scratchForm.possiblePrizes.filter((_, i) => i !== idx),
                          });
                        }}
                        className="col-span-1 p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 flex items-center justify-center cursor-pointer"
                        title="Delete prize row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <label className="flex items-center gap-1.5 text-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(p.isTeslaCar)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updated = [...scratchForm.possiblePrizes];
                            updated[idx] = {
                              ...updated[idx],
                              isTeslaCar: checked,
                              isTryAgain: checked ? false : updated[idx].isTryAgain,
                              vehicleModel: checked
                                ? updated[idx].vehicleModel || 'Tesla Model 3 Performance'
                                : updated[idx].vehicleModel,
                            };
                            setScratchForm({ ...scratchForm, possiblePrizes: updated });
                          }}
                          className="rounded text-red-500"
                        />
                        <span>Tesla Car Jackpot</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(p.isTryAgain)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updated = [...scratchForm.possiblePrizes];
                            updated[idx] = {
                              ...updated[idx],
                              isTryAgain: checked,
                              isTeslaCar: checked ? false : updated[idx].isTeslaCar,
                              amountUsd: checked ? 0 : updated[idx].amountUsd,
                            };
                            setScratchForm({ ...scratchForm, possiblePrizes: updated });
                          }}
                          className="rounded text-zinc-500"
                        />
                        <span>Try Again ($0)</span>
                      </label>

                      {p.isTeslaCar && (
                        <input
                          type="text"
                          value={p.vehicleModel || ''}
                          onChange={(e) => {
                            const updated = [...scratchForm.possiblePrizes];
                            updated[idx] = { ...updated[idx], vehicleModel: e.target.value };
                            setScratchForm({ ...scratchForm, possiblePrizes: updated });
                          }}
                          placeholder="e.g. Cybertruck Cyberbeast"
                          className="flex-1 min-w-[160px] bg-zinc-950 border border-red-500/40 rounded-lg px-2 py-1 text-white text-[11px]"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScratchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!scratchForm.name.trim()}
                  onClick={() => {
                    if (editingScratchId) {
                      updateScratchCardTier(editingScratchId, scratchForm);
                    } else {
                      createScratchCardTier(scratchForm);
                    }
                    setIsScratchModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50"
                >
                  {editingScratchId ? 'Save Tier' : 'Create Tier'}
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
                    onChange={(e) => setDepositForm({ ...depositForm, name: e.target.value, title: e.target.value })}
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
                    onChange={(e) =>
                      setDepositForm({
                        ...depositForm,
                        accountNumber: e.target.value,
                        accountDetails: e.target.value,
                      })
                    }
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
                  onChange={(e) =>
                    setDepositForm({ ...depositForm, enabled: e.target.checked, isActive: e.target.checked })
                  }
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

      {/* TAB: VISITOR ANALYTICS & LIVE TELEMETRY */}
      {activeAdminTab === 'visitors_analytics' && hasAdminPrivilege('manage_users') && (
        <AdminVisitorAnalytics />
      )}

      {/* TAB: SEO, LOGO/FAVICON, SITEMAP, RSS & FAQS CMS */}
      {activeAdminTab === 'seo_faq_cms' && hasAdminPrivilege('manage_site_cms') && (
        <AdminSeoFaqManager />
      )}

      {/* TAB: BUSINESS & OPERATING LICENSE CERTIFICATES CMS */}
      {activeAdminTab === 'certificates_cms' && hasAdminPrivilege('manage_site_cms') && (
        <AdminCertificatesManager />
      )}
    </div>
  );
};
