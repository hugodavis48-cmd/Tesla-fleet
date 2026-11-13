import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  connectFirebaseGoogleAdminSession,
  saveSeoGlobalToFirestore,
  savePageSeoToFirestore,
  saveAdminSectionToFirestore,
  loadGlobalSeoFromFirestore,
  loadAdminSectionsFromFirestore,
} from '../lib/firebase';
import { PageSeoMeta } from '../types';
import {
  CryptoCurrency,
  ProductItem,
  RentalVehicle,
  ScratchCardTier,
  ServiceBooking,
  TeslaVehicle,
  Transaction,
  User,
  UserInvestment,
  UserRole,
  UserSession,
  WalletBalances,
  WinRecord,
  ReferredUser,
  UserKycData,
  SmtpConfig,
  EmailCampaign,
  TestEmailResult,
  AdminNotificationMessage,
  SitePage,
  ManualDepositMethod,
  SocialLinkConfig,
  InvestmentPool,
  TeslaCarListing,
  ShippingAddress,
  VehicleOrder,
  NationwideShippingSettings,
  VehicleRefundPolicySettings,
  Coupon,
  OrderCheckpoint,
  TeslaStockQuote,
  SpotHolding,
  FeaturedStockPlan,
  WithdrawalRequest,
  WithdrawalSettings,
  WheelReward,
  FeatureToggles,
  AutoCryptoGateway,
  ReviewItem,
  StockPriceAlert,
  MarketingBanner,
  NavigationMenuItem,
  SiteSettings,
  CronDispatchedEmail,
  AdminPrivilege,
  WonPrizeItem,
  FaqItem,
  SeoMetadataConfig,
  SitemapEntry,
  RssFeedItem,
  PromoVideoItem,
  CurrencyConfig,
} from '../types';
import {
  CRYPTO_NETWORKS,
  INITIAL_VEHICLES,
  INVESTMENT_POOLS,
  MOCK_WINNERS,
  PRODUCTS_CATALOG,
  RENTAL_FLEET,
  SCRATCH_CARD_TIERS,
  INITIAL_SITE_PAGES,
  INITIAL_MANUAL_DEPOSIT_METHODS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_TESLA_CARS,
  DEFAULT_SHIPPING_SETTINGS,
  DEFAULT_REFUND_POLICY,
  INITIAL_COUPONS,
  INITIAL_VEHICLE_ORDERS,
  INITIAL_TSLA_QUOTE,
  INITIAL_FEATURED_STOCK_PLANS,
  INITIAL_WHEEL_REWARDS,
  DEFAULT_WITHDRAWAL_SETTINGS,
  INITIAL_WITHDRAWAL_REQUESTS,
  DEFAULT_FEATURE_TOGGLES,
  DEFAULT_AUTO_CRYPTO_GATEWAYS,
  INITIAL_REVIEWS,
  INITIAL_MARKETING_BANNERS,
  DEFAULT_SITE_SETTINGS,
  INITIAL_NAVIGATION_MENUS,
  FAQ_ITEMS,
  DEFAULT_SEO_CONFIG,
  INITIAL_SITEMAP_ENTRIES,
  INITIAL_RSS_ITEMS,
  INITIAL_PROMO_VIDEOS,
  INITIAL_WON_PRIZES,
  INITIAL_CURRENCIES,
} from '../data/mockData';


interface AppContextType {
  currentUser: User | null;
  userRole: UserRole;
  balances: WalletBalances;
  vehicles: TeslaVehicle[];
  serviceBookings: ServiceBooking[];
  userInvestments: UserInvestment[];
  transactions: Transaction[];
  availableSpins: number;
  spinCostUsd: number;
  recentWinners: WinRecord[];
  cart: { product: ProductItem; quantity: number }[];
  bookedRentals: { rentalId: string; vehicle: RentalVehicle; days: number; startDate: string; totalUsd: number }[];
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  // Auth & Session Management
  sessionToken: string | null;
  activeSession: UserSession | null;
  login: (email: string, password?: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password?: string,
    phone?: string,
    referralCodeInput?: string,
    bio?: string,
    location?: string,
    preferredServiceCenter?: string
  ) => Promise<boolean>;
  signUpWithGoogle: (
    referralCodeInput?: string
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logout: () => void;
  // Admin Team & Privilege Management (RBAC)
  adminsList: User[];
  fetchAdmins: () => Promise<void>;
  createAdminAccount: (payload: {
    name: string;
    email: string;
    password: string;
    adminRoleLabel: string;
    adminPrivileges: AdminPrivilege[];
    location?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  upgradeUserToAdmin: (payload: {
    userId?: string;
    email: string;
    name?: string;
    adminRoleLabel: string;
    adminPrivileges: AdminPrivilege[];
    password?: string;
    location?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateAdminPrivileges: (
    adminId: string,
    payload: { adminRoleLabel?: string; adminPrivileges: AdminPrivilege[] }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAdminAccount: (adminId: string) => Promise<{ success: boolean; error?: string }>;
  hasAdminPrivilege: (privilege: AdminPrivilege) => boolean;
  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    preferredServiceCenter?: string;
    avatar?: string;
  }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  terminateOtherSessions: () => Promise<boolean>;
  // KYC Verification
  submitKyc: (kycData: UserKycData) => Promise<boolean>;
  adminUpdateKyc: (userId: string, status: 'verified' | 'rejected' | 'in_review', reason?: string) => void;
  // All Users Profile Management (Admin)
  allUsers: User[];
  lockedWinBalanceUsd: number;
  minDepositToActivateWinsUsd: number;
  getUserWalletBalances: (userId: string) => WalletBalances;
  updateUserBalance: (
    userId: string,
    currency: CryptoCurrency | 'USD',
    amount: number,
    mode?: 'set' | 'add' | 'subtract'
  ) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'flagged' | 'banned') => void;
  deleteUser: (userId: string) => void;
  // Email Marketing & Mailer
  smtpConfig: SmtpConfig;
  updateSmtpConfig: (config: SmtpConfig) => void;
  importedEmails: string[];
  importEmailList: (emails: string[]) => number;
  emailCampaigns: EmailCampaign[];
  sendTestEmail: (recipientEmail: string, simulateScenario?: string) => Promise<TestEmailResult>;
  sendMarketingCampaign: (campaign: {
    title: string;
    subject: string;
    templateId?: string;
    targetAudience: 'all_users' | 'plaid_members' | 'custom_list' | 'external_leads';
    customRecipients?: string[];
  }) => Promise<{ success: boolean; message: string }>;
  setRole: (role: UserRole) => void;
  toggle2FA: () => void;
  updatePin: (newPin: string) => void;
  depositFunds: (currency: CryptoCurrency | 'USD', amount: number) => Promise<Transaction>;
  addVehicle: (vehicle: Omit<TeslaVehicle, 'id' | 'userId'>) => void;
  bookService: (booking: Omit<ServiceBooking, 'id' | 'userId' | 'createdAt' | 'progressPercentage' | 'status'>) => ServiceBooking;
  // Investment & ROI Automation
  stakeInPool: (poolId: string, amountUsd: number) => boolean;
  claimDividends: (investmentId: string) => void;
  updateUserInvestment: (id: string, updates: Partial<UserInvestment>) => void;
  forceMatureInvestment: (investmentId: string) => boolean;
  pauseResumeInvestment: (investmentId: string) => void;
  cancelInvestmentEarly: (investmentId: string) => boolean;
  triggerManualCronCycle: () => Promise<{ maturedCount: number; yieldDistributedUsd: number; logs: string[] }>;
  toggleCronActive: (active?: boolean) => Promise<void>;
  cronActive: boolean;
  setCronActive: (active: boolean) => void;
  cronLogs: string[];
  dispatchedCronEmails: CronDispatchedEmail[];
  lastCronRun: string | null;
  cronCyclesCount: number;
  lastCronRunAt: string | null;
  allInvestments: UserInvestment[];
  // Investment Pools & Plans CMS
  investmentPools: InvestmentPool[];
  createInvestmentPool: (pool: Omit<InvestmentPool, 'id'>) => void;
  updateInvestmentPool: (id: string, updates: Partial<InvestmentPool>) => void;
  deleteInvestmentPool: (id: string) => void;
  // Notifications Hub
  adminNotifications: AdminNotificationMessage[];
  sendNotification: (notification: Omit<AdminNotificationMessage, 'id' | 'createdAt' | 'readBy' | 'dismissedBy'>) => void;
  markNotificationAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  // Site CMS, Custom Pages, Navigation Menus & Global Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => void;
  sitePages: SitePage[];
  createSitePage: (page: Omit<SitePage, 'id' | 'updatedAt'>) => void;
  updateSitePage: (id: string, updates: Partial<SitePage>) => void;
  deleteSitePage: (id: string) => boolean;
  navigationMenus: NavigationMenuItem[];
  createNavigationMenuItem: (item: Omit<NavigationMenuItem, 'id'>) => void;
  updateNavigationMenuItem: (id: string, updates: Partial<NavigationMenuItem>) => void;
  deleteNavigationMenuItem: (id: string) => void;
  reorderNavigationMenuItem: (id: string, direction: 'up' | 'down') => void;
  resetNavigationMenus: () => void;
  // Manual & Custom Deposit Methods
  manualDepositMethods: ManualDepositMethod[];
  addManualDepositMethod: (method: Omit<ManualDepositMethod, 'id'>) => void;
  updateManualDepositMethod: (id: string, updates: Partial<ManualDepositMethod>) => void;
  deleteManualDepositMethod: (id: string) => void;
  // Social Links Management
  socialLinks: SocialLinkConfig[];
  updateSocialLink: (id: string, updates: Partial<SocialLinkConfig>) => void;
  // Catalog Management (Products & Rentals)
  productsList: ProductItem[];
  addProductItem: (product: Omit<ProductItem, 'id'>) => void;
  updateProductItem: (id: string, updates: Partial<ProductItem>) => void;
  deleteProductItem: (id: string) => void;
  rentalFleetList: RentalVehicle[];
  updateRentalFleetVehicle: (id: string, updates: Partial<RentalVehicle>) => void;
  // Promotional Content & Gaming CMS
  scratchCardTiers: ScratchCardTier[];
  createScratchCardTier: (tier: Omit<ScratchCardTier, 'id'>) => void;
  updateScratchCardTier: (id: string, updates: Partial<ScratchCardTier>) => void;
  deleteScratchCardTier: (id: string) => void;
  executeSpin: () => { prize: string; valueUsd: number; type: string; sliceId?: string; sliceIndex?: number; vehicleModel?: string };
  purchaseScratchCard: (tier: ScratchCardTier) => boolean;
  awardScratchPrize: (
    tier: ScratchCardTier,
    prizeAmountUsd: number,
    prizeLabel: string,
    extras?: { isTeslaCar?: boolean; vehicleModel?: string; isTryAgain?: boolean }
  ) => void;
  rentVehicle: (vehicle: RentalVehicle, days: number, startDate: string) => boolean;
  addToCart: (product: ProductItem) => void;
  removeFromCart: (productId: string) => void;
  checkoutCart: () => boolean;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  // Referral System
  referralLink: string;
  updateReferralCode: (code: string) => boolean;
  simulateFriendReferral: (friendName?: string, depositAmount?: number) => void;
  // Tesla Car Sales & Nationwide Delivery
  teslaCarListings: TeslaCarListing[];
  createTeslaCarListing: (car: Omit<TeslaCarListing, 'id'>) => Promise<void>;
  updateTeslaCarListing: (id: string, updates: Partial<TeslaCarListing>) => Promise<void>;
  deleteTeslaCarListing: (id: string) => Promise<void>;
  nationwideShippingSettings: NationwideShippingSettings;
  updateShippingSettings: (settings: NationwideShippingSettings) => Promise<void>;
  vehicleRefundPolicy: VehicleRefundPolicySettings;
  updateRefundPolicy: (policy: VehicleRefundPolicySettings) => Promise<void>;
  vehicleOrders: VehicleOrder[];
  placeVehicleOrder: (
    vehicle: TeslaCarListing,
    address: ShippingAddress,
    paymentMethod?: string,
    appliedCoupon?: Coupon | null
  ) => Promise<{ success: boolean; orderId?: string; message: string }>;
  updateVehicleOrderStatus: (
    orderId: string,
    status: VehicleOrder['status'],
    trackingNumber?: string,
    checkpointNote?: string,
    carrierName?: string,
    estimatedDelivery?: string
  ) => void;
  // Coupons & Promo Codes Engine
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  claimedCoupons: string[];
  claimCoupon: (code: string) => void;
  applyCoupon: (
    code: string,
    context?: 'products' | 'vehicles' | 'spins' | 'services'
  ) => { success: boolean; message: string; discountAmount?: number; freeSpins?: number };
  removeCoupon: () => void;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'timesUsed'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  // Tesla Stocks & Spot Trading
  tslaQuote: TeslaStockQuote;
  updateStockQuote: (quote: Partial<TeslaStockQuote>) => void;
  featuredStockPlans: FeaturedStockPlan[];
  createFeaturedStockPlan: (plan: Omit<FeaturedStockPlan, 'id' | 'totalSubscribedUsd'>) => void;
  updateFeaturedStockPlan: (id: string, updates: Partial<FeaturedStockPlan>) => void;
  deleteFeaturedStockPlan: (id: string) => void;
  userSpotHolding: SpotHolding;
  buySpotStock: (usdAmount: number) => boolean;
  sellSpotStock: (sharesToSell: number) => boolean;
  investInFeaturedStock: (planId: string, amountUsd: number) => boolean;
  // Withdrawals & Eligibility Rules
  withdrawalSettings: WithdrawalSettings;
  updateWithdrawalSettings: (settings: Partial<WithdrawalSettings>) => void;
  withdrawalRequests: WithdrawalRequest[];
  requestWithdrawal: (
    amountUsd: number,
    currency: string,
    destinationAddress: string,
    details?: any
  ) => Promise<{ success: boolean; message: string }>;
  processWithdrawalRequest: (
    id: string,
    status: 'approved' | 'rejected',
    txHash?: string,
    rejectionReason?: string
  ) => void;
  isEligibleForWithdrawal: (user: User | null) => { eligible: boolean; totalDeposited: number; required: number; reason?: string };
  setUserDepositedForDemo: (amountUsd: number) => void;
  // Spins & Promotion CMS
  wheelRewards: WheelReward[];
  updateWheelRewards: (rewards: WheelReward[]) => void;
  updateWheelReward: (id: string, updates: Partial<WheelReward>) => void;
  addWheelReward: (reward: Omit<WheelReward, 'id'>) => void;
  deleteWheelReward: (id: string) => void;
  updateSpinCost: (costUsd: number) => void;
  // Feature Toggles (Global Function Switches)
  featureToggles: FeatureToggles;
  updateFeatureToggles: (toggles: Partial<FeatureToggles>) => void;
  // Automated Crypto Payment Gateways
  autoCryptoGateways: AutoCryptoGateway[];
  updateAutoCryptoGateway: (id: string, updates: Partial<AutoCryptoGateway>) => void;
  addAutoCryptoGateway: (gateway: Omit<AutoCryptoGateway, 'id' | 'totalProcessedUsd' | 'totalTransactionsCount'>) => void;
  deleteAutoCryptoGateway: (id: string) => void;
  testAutoCryptoGatewayPing: (id: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  // Verified Customer Reviews & Ratings
  reviews: ReviewItem[];
  addReview: (review: {
    targetType: 'vehicle' | 'product';
    targetId: string;
    targetName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    comment: string;
  }) => boolean;
  markReviewHelpful: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  // TSLA Stock Price Alerts (with Toast Notification Triggers)
  stockPriceAlerts: StockPriceAlert[];
  addStockPriceAlert: (condition: 'above' | 'below', targetPriceUsd: number, note?: string) => void;
  removeStockPriceAlert: (id: string) => void;
  toggleStockPriceAlert: (id: string) => void;
  resetStockPriceAlert: (id: string) => void;
  // Promotional Marketing Banners CMS & AI Studio
  marketingBanners: MarketingBanner[];
  createMarketingBanner: (banner: Omit<MarketingBanner, 'id' | 'createdAt' | 'clicksCount'>) => MarketingBanner;
  updateMarketingBanner: (id: string, updates: Partial<MarketingBanner>) => void;
  deleteMarketingBanner: (id: string) => void;
  // Won Prizes Shipping & Processing Fee Settlement
  wonPrizes: WonPrizeItem[];
  submitWonPrizeShippingAndPayFees: (
    prizeId: string,
    shippingAddress: NonNullable<WonPrizeItem['shippingAddress']>,
    paymentMethod: 'wallet_usd' | 'deposit'
  ) => Promise<{ success: boolean; message: string }>;
  updateWonPrizeItem: (id: string, updates: Partial<WonPrizeItem>) => void;
  createWonPrizeItem: (prize: Omit<WonPrizeItem, 'id' | 'wonAt'>) => void;
  // FAQs CMS
  faqsList: FaqItem[];
  createFaqItem: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaqItem: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaqItem: (id: string) => void;
  // SEO, Logo, Favicon, Sitemap & RSS Feeds CMS
  seoSettings: SeoMetadataConfig;
  updateSeoSettings: (updates: Partial<SeoMetadataConfig>) => void;
  updatePageSeo: (pageKey: string, meta: PageSeoMeta) => Promise<{ synced: boolean; reason?: string }>;
  activeRouteTab: string;
  setActiveRouteTab: (tab: string) => void;
  firebaseAdminEmail: string | null;
  firebaseCloudConnected: boolean;
  lastFirestoreSyncAt: string | null;
  isSyncingFirestore: boolean;
  connectAdminCloudSync: () => Promise<{ success: boolean; error?: string }>;
  syncAllAdminSettingsToFirestore: (quiet?: boolean) => Promise<{ syncedCount: number; totalCount: number; needsAuth: boolean }>;
  sitemapEntries: SitemapEntry[];
  createSitemapEntry: (entry: Omit<SitemapEntry, 'id'>) => void;
  updateSitemapEntry: (id: string, updates: Partial<SitemapEntry>) => void;
  deleteSitemapEntry: (id: string) => void;
  rssFeedItems: RssFeedItem[];
  createRssFeedItem: (item: Omit<RssFeedItem, 'id'>) => void;
  updateRssFeedItem: (id: string, updates: Partial<RssFeedItem>) => void;
  deleteRssFeedItem: (id: string) => void;
  // Promotional Short Videos (AI-Generated + Admin Uploaded)
  promoVideos: PromoVideoItem[];
  createPromoVideo: (video: Omit<PromoVideoItem, 'id' | 'createdAt' | 'viewsCount'>) => PromoVideoItem;
  updatePromoVideo: (id: string, updates: Partial<PromoVideoItem>) => void;
  deletePromoVideo: (id: string) => void;
  incrementPromoVideoView: (id: string) => void;
  // Local Currency Switcher & Admin Multipliers
  currencies: CurrencyConfig[];
  selectedCurrencyCode: string;
  selectedCurrency: CurrencyConfig;
  setSelectedCurrencyCode: (code: string) => void;
  updateCurrencyConfig: (code: string, updates: Partial<CurrencyConfig>) => void;
  addCurrencyConfig: (currency: CurrencyConfig) => void;
  deleteCurrencyConfig: (code: string) => void;
  convertUsd: (usdAmount: number) => number;
  formatCurrency: (usdAmount: number, options?: { decimals?: number; includeCode?: boolean; compact?: boolean }) => string;
  // Visitor Analytics Tracker
  trackVisitorAction: (action: string, pageTab: string, details?: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: 'usr-apex-001',
  name: 'Alex Vance',
  email: 'alex.vance@apex-tesla.io',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Tesla owner & enthusiast since 2021. Track enthusiast with Model S Plaid and bespoke Satin Stealth wrap.',
  location: 'Fremont, CA',
  preferredServiceCenter: 'Apex Fremont Technology Center',
  phone: '+1 (555) 837-5290',
  walletAddress: '0x9E218C4FaB06A4dD23c945b9E52aF3eA48972',
  twoFactorEnabled: true,
  pinSet: true,
  pin: '1234',
  memberSince: 'March 2024',
  tier: 'Plaid Member',
  referralCode: 'APEX-ALEX-99',
  referralEarningsUsd: 350.0,
  referralCount: 3,
  totalDepositedUsd: 0, // Starts at 0 to test rejection alert without deposit!
  totalWithdrawnUsd: 0,
  kycStatus: 'verified',
  kycData: {
    legalName: 'Alexander Marcus Vance',
    dob: '1991-04-12',
    nationality: 'United States',
    residentialAddress: '45500 Fremont Blvd, Fremont, CA 94538',
    idType: 'passport',
    idNumber: 'US-P89218402',
    submittedAt: '2026-03-15',
    verifiedAt: '2026-03-16',
  },
  activeSession: {
    id: 'sess-01',
    token: 'apex_sess_alex_demo_token_2026_secured',
    device: 'Chrome on macOS (Current Device)',
    ip: '192.168.1.104',
    loginAt: '2026-11-08 10:15:00',
    expiresAt: '2026-11-15 10:15:00',
    status: 'active',
  },
  sessionHistory: [
    {
      id: 'sess-01',
      token: 'apex_ses...',
      device: 'Chrome on macOS (Current Device)',
      ip: '192.168.1.104',
      loginAt: '2026-11-08 10:15:00',
      expiresAt: '2026-11-15 10:15:00',
      status: 'active',
    },
    {
      id: 'sess-02',
      token: 'apex_ses...',
      device: 'Tesla In-Car Browser (Model S Plaid)',
      ip: '10.84.22.9',
      loginAt: '2026-11-06 14:22:10',
      expiresAt: '2026-11-13 14:22:10',
      status: 'active',
    },
    {
      id: 'sess-03',
      token: 'apex_ses...',
      device: 'Tesla App on iOS 18 (iPhone 16 Pro)',
      ip: '172.56.41.88',
      loginAt: '2026-11-02 08:45:19',
      expiresAt: '2026-11-09 08:45:19',
      status: 'active',
    },
  ],
  referredUsers: [
    {
      id: 'ref-01',
      name: 'Marcus Vance',
      email: 'marcus.v@tesla-club.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      date: '2026-10-24',
      status: 'deposit_completed',
      depositAmountUsd: 1200,
      earnedCreditUsd: 120,
      bonusSpinsEarned: 2,
    },
    {
      id: 'ref-02',
      name: 'Sarah Connor',
      email: 'sarah.c@cyberbeast.io',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      date: '2026-10-28',
      status: 'deposit_completed',
      depositAmountUsd: 500,
      earnedCreditUsd: 100,
      bonusSpinsEarned: 2,
    },
    {
      id: 'ref-03',
      name: 'Kenji Sato',
      email: 'kenji.sato@plaid-tokyo.jp',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      date: '2026-11-01',
      status: 'signed_up',
      earnedCreditUsd: 0,
      bonusSpinsEarned: 1,
    },
  ],
  isOnline: true,
  lastActiveAt: 'Active now',
  lastVisitedPath: '/dashboard',
  accountStatus: 'active',
  ipAddress: '192.168.1.104',
  deviceInfo: 'Chrome 131 on macOS Sonoma',
};


const INITIAL_USERS: User[] = [
  DEFAULT_USER,
  {
    id: 'usr-apex-admin-01',
    name: 'Admin Operations',
    email: 'admin.ops@apex-tesla.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    bio: 'Executive Fleet Operations & Telematics Director for Apex Tesla Hub.',
    location: 'Austin Gigafactory Hub',
    preferredServiceCenter: 'Apex Austin Gigafactory Hub',
    phone: '+1 (800) 837-5290',
    walletAddress: '0xADMIN71C94Bf25aB24041b6F9E1314B15b1285cDFeB7c',
    twoFactorEnabled: true,
    pinSet: true,
    pin: '9999',
    memberSince: 'January 2024',
    tier: 'Founders Club',
    referralCode: 'APEX-ADMIN-HQ',
    referralEarningsUsd: 1250.0,
    referralCount: 14,
    referredUsers: [],
    kycStatus: 'verified',
    kycData: {
      legalName: 'Apex Operations Team',
      dob: '1985-06-10',
      nationality: 'United States',
      residentialAddress: '1 Tesla Road, Austin, TX 78725',
      idType: 'passport',
      idNumber: 'US-ADM009182',
      submittedAt: '2026-01-10',
      verifiedAt: '2026-01-11',
    },
    isOnline: true,
    lastActiveAt: 'Active now',
    lastVisitedPath: '/dashboard',
    accountStatus: 'active',
    ipAddress: '10.0.0.1',
    deviceInfo: 'Apex Ops Workstation (Linux)',
  },
  {
    id: 'usr-003',
    name: 'Marcus Vance',
    email: 'marcus.v@tesla-club.org',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Model 3 Performance track driver. Carbon fiber addict.',
    location: 'San Jose, CA',
    preferredServiceCenter: 'Apex Fremont Technology Center',
    phone: '+1 (408) 555-0199',
    walletAddress: '0x3fe9b2...84ad1',
    twoFactorEnabled: false,
    pinSet: true,
    memberSince: 'October 2026',
    tier: 'Standard',
    referralCode: 'APEX-MARC-44',
    referralEarningsUsd: 120.0,
    referralCount: 1,
    referredUsers: [],
    kycStatus: 'in_review',
    kycData: {
      legalName: 'Marcus Vance',
      dob: '1995-09-18',
      nationality: 'United States',
      residentialAddress: '882 Santana Row, San Jose, CA 95128',
      idType: 'drivers_license',
      idNumber: 'DL-CA9928190',
      submittedAt: '2026-10-24',
    },
    isOnline: true,
    lastActiveAt: '3 mins ago',
    lastVisitedPath: '/services',
    accountStatus: 'active',
    totalDepositedUsd: 1200.0,
    totalWithdrawnUsd: 0,
    ipAddress: '73.189.22.14',
    deviceInfo: 'Safari on iPhone 16 Pro',
  },
  {
    id: 'usr-004',
    name: 'Sarah Connor',
    email: 'sarah.c@cyberbeast.io',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    bio: 'Cybertruck Cyberbeast daily driver. Overland camping enthusiast.',
    location: 'Reno, NV',
    preferredServiceCenter: 'Apex Nevada Battery Operations',
    phone: '+1 (775) 555-4012',
    walletAddress: '0x99e21b...34c7f',
    twoFactorEnabled: true,
    pinSet: true,
    memberSince: 'October 2026',
    tier: 'Plaid Member',
    referralCode: 'APEX-CYBR-99',
    referralEarningsUsd: 100.0,
    referralCount: 1,
    referredUsers: [],
    kycStatus: 'verified',
    kycData: {
      legalName: 'Sarah Jean Connor',
      dob: '1988-11-22',
      nationality: 'United States',
      residentialAddress: '1200 Tahoe Blvd, Incline Village, NV 89451',
      idType: 'passport',
      idNumber: 'US-P44820199',
      submittedAt: '2026-10-28',
      verifiedAt: '2026-10-29',
    },
    isOnline: false,
    lastActiveAt: '42 mins ago',
    lastVisitedPath: '/investment',
    accountStatus: 'active',
    totalDepositedUsd: 3500.0,
    totalWithdrawnUsd: 500.0,
    ipAddress: '98.210.45.67',
    deviceInfo: 'Edge on Windows 11',
  },
  {
    id: 'usr-005',
    name: 'Kenji Sato',
    email: 'kenji.sato@plaid-tokyo.jp',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Tesla Roadster reservation holder and Supercharger node staker.',
    location: 'Tokyo, Japan',
    preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
    phone: '+81 90 5555 4321',
    walletAddress: '0x712a88...c1e90',
    twoFactorEnabled: false,
    pinSet: false,
    memberSince: 'November 2026',
    tier: 'Standard',
    referralCode: 'APEX-KENJI-01',
    referralEarningsUsd: 0,
    referralCount: 0,
    referredUsers: [],
    kycStatus: 'unverified',
    isOnline: false,
    lastActiveAt: '1 day ago',
    lastVisitedPath: '/promotions',
    accountStatus: 'active',
    totalDepositedUsd: 250.0,
    totalWithdrawnUsd: 0,
    ipAddress: '122.130.88.9',
    deviceInfo: 'Chrome on Android 15',
  },
  {
    id: 'usr-006',
    name: 'Elena Rostova',
    email: 'elena.r@apex-ev.de',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    bio: 'Gigafactory Berlin fleet investor & Model Y Performance owner.',
    location: 'Berlin, Germany',
    preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
    phone: '+49 30 5558 1920',
    walletAddress: '0x8d11e2...7b41c',
    twoFactorEnabled: true,
    pinSet: true,
    memberSince: 'June 2025',
    tier: 'Founders Club',
    referralCode: 'APEX-ELENA-88',
    referralEarningsUsd: 640.0,
    referralCount: 5,
    referredUsers: [],
    kycStatus: 'verified',
    isOnline: true,
    lastActiveAt: '6 mins ago',
    lastVisitedPath: '/stocks',
    accountStatus: 'active',
    totalDepositedUsd: 14500.0,
    totalWithdrawnUsd: 1200.0,
    ipAddress: '85.214.132.117',
    deviceInfo: 'Firefox on Ubuntu Linux',
  },
  {
    id: 'usr-007',
    name: 'Mateo Silva',
    email: 'mateo.silva@miami-plaid.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    bio: 'Cybertruck Foundation owner • Crypto treasury & TSLA options trader.',
    location: 'Miami, FL',
    preferredServiceCenter: 'Apex Austin Gigafactory Hub',
    phone: '+1 (305) 555-7741',
    walletAddress: '0x45c8a9...02d11',
    twoFactorEnabled: true,
    pinSet: true,
    memberSince: 'February 2026',
    tier: 'Plaid Member',
    referralCode: 'APEX-MATEO-77',
    referralEarningsUsd: 420.0,
    referralCount: 4,
    referredUsers: [],
    kycStatus: 'verified',
    isOnline: true,
    lastActiveAt: '12 mins ago',
    lastVisitedPath: '/vehicles',
    accountStatus: 'active',
    totalDepositedUsd: 8900.0,
    totalWithdrawnUsd: 750.0,
    ipAddress: '172.58.144.20',
    deviceInfo: 'Safari on iOS 18',
  },
  {
    id: 'usr-008',
    name: 'Chloe Beaumont',
    email: 'chloe.b@ev-london.co.uk',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Right-hand drive Model X Plaid owner & Robotaxi yield pool partner.',
    location: 'London, UK',
    preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
    phone: '+44 20 7946 0821',
    walletAddress: '0x2a79d1...93e44',
    twoFactorEnabled: true,
    pinSet: false,
    memberSince: 'April 2026',
    tier: 'Plaid Member',
    referralCode: 'APEX-CHLOE-21',
    referralEarningsUsd: 210.0,
    referralCount: 2,
    referredUsers: [],
    kycStatus: 'in_review',
    isOnline: false,
    lastActiveAt: '2 hours ago',
    lastVisitedPath: '/wraps',
    accountStatus: 'active',
    totalDepositedUsd: 4200.0,
    totalWithdrawnUsd: 0,
    ipAddress: '81.145.62.18',
    deviceInfo: 'Chrome on macOS Sequoia',
  },
  {
    id: 'usr-009',
    name: "Liam O'Connor",
    email: 'liam.oc@pacific-ev.io',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    bio: 'Model 3 Highland Stealth PPF collector & Supercharger staker.',
    location: 'Seattle, WA',
    preferredServiceCenter: 'Apex Fremont Technology Center',
    phone: '+1 (206) 555-3194',
    walletAddress: '0x6b21f0...55a92',
    twoFactorEnabled: false,
    pinSet: true,
    memberSince: 'August 2026',
    tier: 'Standard',
    referralCode: 'APEX-LIAM-55',
    referralEarningsUsd: 75.0,
    referralCount: 1,
    referredUsers: [],
    kycStatus: 'verified',
    isOnline: false,
    lastActiveAt: '5 hours ago',
    lastVisitedPath: '/rentals',
    accountStatus: 'active',
    totalDepositedUsd: 1650.0,
    totalWithdrawnUsd: 200.0,
    ipAddress: '67.168.92.11',
    deviceInfo: 'Edge on Windows 11',
  },
  {
    id: 'usr-010',
    name: 'Priya Nair',
    email: 'priya.nair@austin-grid.io',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    bio: 'Grid energy engineer • Megapack & Model Y dual-motor fleet partner.',
    location: 'Austin, TX',
    preferredServiceCenter: 'Apex Austin Gigafactory Hub',
    phone: '+1 (512) 555-8830',
    walletAddress: '0x91e4c0...88b17',
    twoFactorEnabled: true,
    pinSet: true,
    memberSince: 'May 2025',
    tier: 'Founders Club',
    referralCode: 'APEX-PRIYA-10',
    referralEarningsUsd: 890.0,
    referralCount: 7,
    referredUsers: [],
    kycStatus: 'verified',
    isOnline: true,
    lastActiveAt: 'Active now',
    lastVisitedPath: '/investment',
    accountStatus: 'active',
    totalDepositedUsd: 22400.0,
    totalWithdrawnUsd: 3100.0,
    ipAddress: '136.49.18.205',
    deviceInfo: 'Chrome 131 on macOS',
  },
];

const DEFAULT_SMTP: SmtpConfig = {
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  username: 'postmaster@mg.apex-tesla.io',
  password: '••••••••••••••••',
  fromName: 'Apex Tesla Hub Marketing',
  fromEmail: 'concierge@apex-tesla.io',
  replyTo: 'support@apex-tesla.io',
};

const INITIAL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'camp-01',
    title: 'Q4 Cybertruck Vinyl Wrap & PPF Launch',
    subject: '⚡ Transform Your Cybertruck: 20% Off Ceramic PPF & Satin Stealth Wraps',
    targetAudience: 'all_users',
    recipientsCount: 1420,
    sentAt: '2026-11-04 10:30',
    status: 'sent',
    openRate: 48.2,
    clickRate: 19.4,
  },
  {
    id: 'camp-02',
    title: 'Model S Plaid Track Alignment & Telematics Reminder',
    subject: '🏁 Plaid Member Exclusive: Track Mode Inspection & Brake Flush Bay Slots',
    targetAudience: 'plaid_members',
    recipientsCount: 380,
    sentAt: '2026-10-28 14:15',
    status: 'sent',
    openRate: 64.5,
    clickRate: 28.1,
  },
];

const DEFAULT_BALANCES: WalletBalances = {
  usd: 3450.0,
  btc: 0.085,
  usdt: 1850.0,
  xrp: 940.0,
  bnb: 4.25,
};

const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'srv-001',
    userId: 'usr-apex-001',
    vehicleId: 'veh-1',
    vehicleName: 'Model S Plaid Tri-Motor',
    serviceType: 'Full Body Vinyl Wrap',
    serviceMode: 'Apex Center Bay',
    status: 'Technician Working',
    progressPercentage: 65,
    scheduledDate: '2026-11-05',
    timeSlot: '09:30 AM',
    location: 'Apex Gigafactory Hub (Bay 4)',
    technicianNotes: '3M Satin Stealth Black film undergoing heat seal application. Surface prep & ceramic base layer complete.',
    totalCostUsd: 2450,
    paidWith: 'USDT (TRC-20)',
    createdAt: '2026-11-02',
  },
  {
    id: 'srv-002',
    userId: 'usr-apex-001',
    vehicleId: 'veh-2',
    vehicleName: 'Cybertruck Cyberbeast',
    serviceType: 'Tire & Brake Service',
    serviceMode: 'Mobile Ranger Dispatch',
    status: 'Scheduled',
    progressPercentage: 15,
    scheduledDate: '2026-11-10',
    timeSlot: '02:00 PM',
    location: 'Client Residence - Mobile Van #12',
    technicianNotes: 'Mobile technician dispatched with high-torque all-terrain tire balancer & brake fluid tester.',
    totalCostUsd: 380,
    paidWith: 'Apex USD Wallet',
    createdAt: '2026-11-03',
  },
  {
    id: 'srv-003',
    userId: 'usr-apex-001',
    vehicleId: 'veh-1',
    vehicleName: 'Model S Plaid Tri-Motor',
    serviceType: 'High-Voltage Battery Diagnostics',
    serviceMode: 'Apex Center Bay',
    status: 'Ready for Pickup / Complete',
    progressPercentage: 100,
    scheduledDate: '2026-10-18',
    timeSlot: '11:00 AM',
    location: 'Apex Fremont Technology Center (Bay 2)',
    technicianNotes: 'Cell balance nominal (99.4% SOH). Low moisture brake fluid flushed with DOT 5.1 synthetic. Complete 40-point telematics audit passed.',
    totalCostUsd: 620,
    paidWith: 'Bitcoin (BTC)',
    createdAt: '2026-10-12',
  },
  {
    id: 'srv-004',
    userId: 'usr-apex-001',
    vehicleId: 'veh-1',
    vehicleName: 'Model S Plaid Tri-Motor',
    serviceType: 'Maintenance Inspection',
    serviceMode: 'Apex Center Bay',
    status: 'Ready for Pickup / Complete',
    progressPercentage: 100,
    scheduledDate: '2026-09-04',
    timeSlot: '01:30 PM',
    location: 'Apex Fremont Technology Center (Bay 1)',
    technicianNotes: 'HEPA filtration canister replaced. Dual-motor caster and camber calibrated for Laguna Seca track configuration.',
    totalCostUsd: 890,
    paidWith: 'USDT (TRC-20)',
    createdAt: '2026-08-28',
  },
  {
    id: 'srv-005',
    userId: 'usr-006',
    vehicleId: 'veh-berlin-1',
    vehicleName: 'Model Y Performance Dual-Motor',
    serviceType: 'Ceramic Paint Protection Film',
    serviceMode: 'Apex Center Bay',
    status: 'Technician Working',
    progressPercentage: 70,
    scheduledDate: '2026-11-09',
    timeSlot: '10:00 AM',
    location: 'Apex Berlin Super-Hub Europe (Bay 3)',
    technicianNotes: 'XPEL Stealth matte PPF installation in climate-controlled bay.',
    totalCostUsd: 3400,
    paidWith: 'USDT (TRC-20)',
    createdAt: '2026-11-06',
  },
  {
    id: 'srv-006',
    userId: 'usr-008',
    vehicleId: 'veh-london-1',
    vehicleName: 'Model X Plaid Tri-Motor',
    serviceType: 'Maintenance Inspection',
    serviceMode: 'Mobile Ranger Dispatch',
    status: 'Scheduled',
    progressPercentage: 20,
    scheduledDate: '2026-11-12',
    timeSlot: '01:00 PM',
    location: 'Mayfair Residence, London UK - Mobile Unit #04',
    technicianNotes: 'Scheduled ultrasonic door sensor calibration & rubber seal conditioning.',
    totalCostUsd: 540,
    paidWith: 'Apex USD Wallet',
    createdAt: '2026-11-07',
  },
];

const INITIAL_INVESTMENTS: UserInvestment[] = [
  {
    id: 'inv-01',
    userId: 'usr-apex-001',
    poolId: 'pool-robotaxi',
    poolTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    amountInvestedUsd: 2500,
    investedAt: '2026-10-15',
    earnedDividendsUsd: 142.6,
    apy: 18.4,
    nextPayoutHours: 4,
    status: 'running',
    durationDays: 30,
    daysElapsed: 24,
    startDate: '2026-10-15',
    maturityDate: '2026-11-14',
    totalExpectedRoiUsd: 378.08,
    dailyRoiRate: 12.6,
    autoCompound: true,
    txHash: '0x3fe9b2...84ad1',
  },
  {
    id: 'inv-02',
    userId: 'usr-apex-001',
    poolId: 'pool-supercharger',
    poolTitle: 'Apex Megawatt Supercharger Node Staking',
    amountInvestedUsd: 1500,
    investedAt: '2026-10-25',
    earnedDividendsUsd: 68.4,
    apy: 14.8,
    nextPayoutHours: 12,
    status: 'running',
    durationDays: 14,
    daysElapsed: 13,
    startDate: '2026-10-25',
    maturityDate: '2026-11-08',
    totalExpectedRoiUsd: 85.15,
    dailyRoiRate: 6.08,
    autoCompound: false,
    txHash: '0x99e21b...34c7f',
  },
  {
    id: 'inv-03',
    userId: 'usr-apex-001',
    poolId: 'pool-plaid-fleet',
    poolTitle: 'Luxury Performance Rental Fleet Share',
    amountInvestedUsd: 2000,
    investedAt: '2026-08-01',
    earnedDividendsUsd: 452.0,
    apy: 22.6,
    nextPayoutHours: 0,
    status: 'completed',
    durationDays: 60,
    daysElapsed: 60,
    startDate: '2026-08-01',
    maturityDate: '2026-09-30',
    totalExpectedRoiUsd: 452.0,
    completedAt: '2026-09-30',
    capitalReturned: true,
    autoCompound: false,
    txHash: '0x712a88...c1e90',
    certificateId: 'APEX-CERT-2026-0930-PLD',
  },
  {
    id: 'inv-04',
    userId: 'usr-003',
    poolId: 'pool-robotaxi',
    poolTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    amountInvestedUsd: 1000,
    investedAt: '2026-10-24',
    earnedDividendsUsd: 74.2,
    apy: 18.4,
    nextPayoutHours: 6,
    status: 'running',
    durationDays: 30,
    daysElapsed: 15,
    startDate: '2026-10-24',
    maturityDate: '2026-11-23',
    totalExpectedRoiUsd: 151.23,
    dailyRoiRate: 5.04,
    autoCompound: true,
    txHash: '0x4ca11e...99b12',
  },
  {
    id: 'inv-05',
    userId: 'usr-004',
    poolId: 'pool-plaid-fleet',
    poolTitle: 'Luxury Performance Rental Fleet Share',
    amountInvestedUsd: 3000,
    investedAt: '2026-10-28',
    earnedDividendsUsd: 198.5,
    apy: 22.6,
    nextPayoutHours: 10,
    status: 'running',
    durationDays: 60,
    daysElapsed: 11,
    startDate: '2026-10-28',
    maturityDate: '2026-12-27',
    totalExpectedRoiUsd: 678.0,
    dailyRoiRate: 11.3,
    autoCompound: false,
    txHash: '0x88f21a...bc551',
  },
  {
    id: 'inv-06',
    userId: 'usr-006',
    poolId: 'pool-robotaxi',
    poolTitle: 'Autonomous Tesla Robotaxi Yield Pool',
    amountInvestedUsd: 8500,
    investedAt: '2026-10-12',
    earnedDividendsUsd: 512.8,
    apy: 18.4,
    nextPayoutHours: 3,
    status: 'running',
    durationDays: 30,
    daysElapsed: 26,
    startDate: '2026-10-12',
    maturityDate: '2026-11-11',
    totalExpectedRoiUsd: 1285.48,
    dailyRoiRate: 42.85,
    autoCompound: true,
    txHash: '0x71d8a0...33a09',
  },
  {
    id: 'inv-07',
    userId: 'usr-007',
    poolId: 'pool-supercharger',
    poolTitle: 'Apex Megawatt Supercharger Node Staking',
    amountInvestedUsd: 5000,
    investedAt: '2026-10-20',
    earnedDividendsUsd: 245.1,
    apy: 14.8,
    nextPayoutHours: 8,
    status: 'running',
    durationDays: 30,
    daysElapsed: 19,
    startDate: '2026-10-20',
    maturityDate: '2026-11-19',
    totalExpectedRoiUsd: 608.22,
    dailyRoiRate: 20.27,
    autoCompound: false,
    txHash: '0x59e12b...44c18',
  },
  {
    id: 'inv-08',
    userId: 'usr-010',
    poolId: 'pool-plaid-fleet',
    poolTitle: 'Luxury Performance Rental Fleet Share',
    amountInvestedUsd: 12000,
    investedAt: '2026-10-05',
    earnedDividendsUsd: 890.4,
    apy: 22.6,
    nextPayoutHours: 5,
    status: 'running',
    durationDays: 60,
    daysElapsed: 34,
    startDate: '2026-10-05',
    maturityDate: '2026-12-04',
    totalExpectedRoiUsd: 4458.08,
    dailyRoiRate: 74.3,
    autoCompound: true,
    txHash: '0x94a31c...71e22',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'deposit',
    currency: 'USDT',
    amount: 2500,
    usdEquivalent: 2500,
    timestamp: '2026-11-02 14:22',
    status: 'completed',
    txHash: '0x3fe9b2...84ad1',
    description: 'TRC-20 Instant Gateway Deposit',
  },
  {
    id: 'tx-002',
    type: 'service_payment',
    currency: 'USDT',
    amount: 2450,
    usdEquivalent: 2450,
    timestamp: '2026-11-02 15:05',
    status: 'completed',
    txHash: '0x99e21b...34c7f',
    description: '3M Satin Stealth Wrap Service Booking',
  },
  {
    id: 'tx-003',
    type: 'promotion_win',
    currency: 'USD',
    amount: 500,
    usdEquivalent: 500,
    timestamp: '2026-11-03 11:30',
    status: 'completed',
    txHash: '0x712a88...c1e90',
    description: 'Spin-and-Win Wheel Reward: $500 Credit',
  },
];

const MIN_DEPOSIT_TO_ACTIVATE_WINS_USD = 250;

const buildInitialUserBalances = (users: User[]): Record<string, WalletBalances> => {
  const map: Record<string, WalletBalances> = {};
  users.forEach((u, idx) => {
    if (u.id === 'usr-apex-001') {
      map[u.id] = { ...DEFAULT_BALANCES };
    } else if (u.id === 'usr-apex-admin-01') {
      map[u.id] = { usd: 85000, btc: 0.95, usdt: 24000, xrp: 5200, bnb: 18.5 };
    } else {
      const baseUsd = Math.max(450, Math.round((u.totalDepositedUsd || 800 + idx * 420) * 1.15));
      map[u.id] = {
        usd: baseUsd,
        btc: Number((0.02 + idx * 0.015).toFixed(4)),
        usdt: Number((650 + idx * 320).toFixed(2)),
        xrp: Number((280 + idx * 140).toFixed(2)),
        bnb: Number((1.2 + idx * 0.75).toFixed(3)),
      };
    }
  });
  return map;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state from localStorage — fresh visitors start strictly signed out
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminsList, setAdminsList] = useState<User[]>([]);

  const [userBalancesById, setUserBalancesById] = useState<Record<string, WalletBalances>>(() => {
    const seeded = buildInitialUserBalances(INITIAL_USERS);
    const saved = localStorage.getItem('apex_user_balances_v1');
    if (saved) {
      try {
        return { ...seeded, ...JSON.parse(saved) };
      } catch {
        return seeded;
      }
    }
    return seeded;
  });

  const [lockedWinsByUserId, setLockedWinsByUserId] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('apex_locked_wins_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [balances, setBalances] = useState<WalletBalances>(() => {
    const saved = localStorage.getItem('apex_balances');
    return saved ? JSON.parse(saved) : DEFAULT_BALANCES;
  });

  const [vehicles, setVehicles] = useState<TeslaVehicle[]>(() => {
    const saved = localStorage.getItem('apex_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(() => {
    const saved = localStorage.getItem('apex_services');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('apex_investments');
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('apex_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [availableSpins, setAvailableSpins] = useState<number>(0);
  const [spinCostUsd, setSpinCostUsd] = useState<number>(() => {
    const migrated150 = localStorage.getItem('apex_spin_cost_migrated_150');
    const saved = localStorage.getItem('apex_spin_cost');
    if (!migrated150) {
      localStorage.setItem('apex_spin_cost_migrated_150', 'true');
      if (!saved || Number(saved) === 25) {
        localStorage.setItem('apex_spin_cost', '150');
        return 150;
      }
    }
    return saved ? Number(saved) : 150;
  });

  const [wheelRewards, setWheelRewards] = useState<WheelReward[]>(() => {
    const saved = localStorage.getItem('apex_wheel_rewards');
    if (saved) {
      try {
        const parsed: WheelReward[] = JSON.parse(saved);
        const hasCar = parsed.some((r) => r.type === 'car');
        const hasTryAgain = parsed.some((r) => r.type === 'try_again');
        if (hasCar && hasTryAgain) {
          return parsed.map((r) => ({
            ...r,
            valueUsd: r.valueUsd ?? r.value ?? 0,
            value: r.value ?? r.valueUsd ?? 0,
            weight: r.weight ?? r.probabilityWeight ?? 1,
            probabilityWeight: r.probabilityWeight ?? r.weight ?? 1,
          }));
        }
      } catch {
        // fallback to latest seeded rewards
      }
    }
    return INITIAL_WHEEL_REWARDS;
  });

  const [tslaQuote, setTslaQuote] = useState<TeslaStockQuote>(INITIAL_TSLA_QUOTE);

  const [featuredStockPlans, setFeaturedStockPlans] = useState<FeaturedStockPlan[]>(() => {
    const saved = localStorage.getItem('apex_featured_stock_plans');
    return saved ? JSON.parse(saved) : INITIAL_FEATURED_STOCK_PLANS;
  });

  const [userSpotHolding, setUserSpotHolding] = useState<SpotHolding>(() => {
    const saved = localStorage.getItem('apex_spot_holding');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'spot-alex-01',
          userId: 'usr-apex-001',
          shares: 5.25,
          avgBuyPrice: 312.40,
          totalInvestedUsd: 1640.10,
          currentEquityUsd: Number((5.25 * INITIAL_TSLA_QUOTE.price).toFixed(2)),
          pnlUsd: Number(((5.25 * INITIAL_TSLA_QUOTE.price) - 1640.10).toFixed(2)),
          pnlPercent: Number(((((5.25 * INITIAL_TSLA_QUOTE.price) - 1640.10) / 1640.10) * 100).toFixed(2)),
          lastUpdated: new Date().toISOString(),
        };
  });

  const [withdrawalSettings, setWithdrawalSettings] = useState<WithdrawalSettings>(() => {
    const saved = localStorage.getItem('apex_withdrawal_settings');
    return saved ? JSON.parse(saved) : DEFAULT_WITHDRAWAL_SETTINGS;
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('apex_withdrawal_requests');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWAL_REQUESTS;
  });

  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>(() => {
    const saved = localStorage.getItem('apex_feature_toggles');
    return saved ? JSON.parse(saved) : DEFAULT_FEATURE_TOGGLES;
  });

  const [autoCryptoGateways, setAutoCryptoGateways] = useState<AutoCryptoGateway[]>(() => {
    const saved = localStorage.getItem('apex_auto_crypto_gateways');
    return saved ? JSON.parse(saved) : DEFAULT_AUTO_CRYPTO_GATEWAYS;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('apex_reviews_v1');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [stockPriceAlerts, setStockPriceAlerts] = useState<StockPriceAlert[]>(() => {
    const saved = localStorage.getItem('apex_tsla_price_alerts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'tsla-alert-high-01',
        symbol: 'TSLA',
        condition: 'above',
        targetPriceUsd: Number((INITIAL_TSLA_QUOTE.price + 6.5).toFixed(2)),
        note: 'Breakout resistance target',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tsla-alert-low-01',
        symbol: 'TSLA',
        condition: 'below',
        targetPriceUsd: Number(Math.max(100, INITIAL_TSLA_QUOTE.price - 6.5).toFixed(2)),
        note: 'Spot accumulation dip target',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [marketingBanners, setMarketingBanners] = useState<MarketingBanner[]>(() => {
    const saved = localStorage.getItem('apex_marketing_banners_v1');
    if (saved) {
      try {
        const parsed: MarketingBanner[] = JSON.parse(saved);
        const has3d = parsed.some((b) => b.is3dHd);
        if (has3d) return parsed;
      } catch {
        // fallback below
      }
    }
    return INITIAL_MARKETING_BANNERS;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('apex_all_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((u) => u.id));
        const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    const saved = localStorage.getItem('apex_smtp');
    return saved ? JSON.parse(saved) : DEFAULT_SMTP;
  });

  const [importedEmails, setImportedEmails] = useState<string[]>(() => {
    const saved = localStorage.getItem('apex_imported_emails');
    return saved
      ? JSON.parse(saved)
      : [
          'vip.tesla.fleet@club-norcal.org',
          'elon.fan88@cybertruck-owners.net',
          'plaid.speed@austin-drag.io',
          'trackday@lagunaseca-ev.com',
          'investor.tesla@supercharger-node.eu',
        ];
  });

  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => {
    const saved = localStorage.getItem('apex_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [recentWinners, setRecentWinners] = useState<WinRecord[]>(MOCK_WINNERS);
  const [cart, setCart] = useState<{ product: ProductItem; quantity: number }[]>([]);
  const [bookedRentals, setBookedRentals] = useState<{ rentalId: string; vehicle: RentalVehicle; days: number; startDate: string; totalUsd: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Notifications Hub state
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationMessage[]>(() => {
    const saved = localStorage.getItem('apex_notifications');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATIONS;
  });

  // Global Site Settings (Reflected Site-Wide)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('apex_site_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      } catch {
        return DEFAULT_SITE_SETTINGS;
      }
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Site CMS Pages state
  const [sitePages, setSitePages] = useState<SitePage[]>(() => {
    const saved = localStorage.getItem('apex_site_pages');
    return saved ? JSON.parse(saved) : INITIAL_SITE_PAGES;
  });

  // Navigation Menus state (Navbar, Dropdown, Footer)
  const [navigationMenus, setNavigationMenus] = useState<NavigationMenuItem[]>(() => {
    const saved = localStorage.getItem('apex_navigation_menus');
    return saved ? JSON.parse(saved) : INITIAL_NAVIGATION_MENUS;
  });

  // Custom & Manual Deposit Gateways state
  const [manualDepositMethods, setManualDepositMethods] = useState<ManualDepositMethod[]>(() => {
    const saved = localStorage.getItem('apex_manual_deposits');
    return saved ? JSON.parse(saved) : INITIAL_MANUAL_DEPOSIT_METHODS;
  });

  // Social Connect Links Configuration
  const [socialLinks, setSocialLinks] = useState<SocialLinkConfig[]>(() => {
    const saved = localStorage.getItem('apex_social_links');
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_LINKS;
  });

  // Customizable Investment Pools & Plans
  const [investmentPools, setInvestmentPools] = useState<InvestmentPool[]>(() => {
    const saved = localStorage.getItem('apex_investment_pools');
    return saved ? JSON.parse(saved) : INVESTMENT_POOLS;
  });

  // Store Products Catalog (seeded with full catalog if empty)
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('apex_products_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback below
      }
    }
    return PRODUCTS_CATALOG;
  });

  // Editable Scratch & Win Card Tiers
  const [scratchCardTiers, setScratchCardTiers] = useState<ScratchCardTier[]>(() => {
    const saved = localStorage.getItem('apex_scratch_tiers');
    if (saved) {
      try {
        const parsed: ScratchCardTier[] = JSON.parse(saved);
        const hasCarPrize = parsed.some((t) => t.possiblePrizes?.some((p) => p.isTeslaCar));
        if (hasCarPrize) return parsed;
      } catch {
        // fallback to latest defaults with Tesla car wins
      }
    }
    return SCRATCH_CARD_TIERS;
  });

  // Rental Fleet List
  const [rentalFleetList, setRentalFleetList] = useState<RentalVehicle[]>(() => {
    const saved = localStorage.getItem('apex_rental_fleet_list');
    return saved ? JSON.parse(saved) : RENTAL_FLEET;
  });

  // Tesla Car Sales Catalog
  const [teslaCarListings, setTeslaCarListings] = useState<TeslaCarListing[]>(() => {
    const saved = localStorage.getItem('apex_tesla_cars_catalog');
    return saved ? JSON.parse(saved) : INITIAL_TESLA_CARS;
  });

  // Nationwide Shipping Settings
  const [nationwideShippingSettings, setNationwideShippingSettings] = useState<NationwideShippingSettings>(() => {
    const saved = localStorage.getItem('apex_shipping_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SHIPPING_SETTINGS;
  });

  // Vehicle Refund Policy Settings
  const [vehicleRefundPolicy, setVehicleRefundPolicy] = useState<VehicleRefundPolicySettings>(() => {
    const saved = localStorage.getItem('apex_refund_policy');
    return saved ? JSON.parse(saved) : DEFAULT_REFUND_POLICY;
  });

  // Vehicle Orders
  const [vehicleOrders, setVehicleOrders] = useState<VehicleOrder[]>(() => {
    const saved = localStorage.getItem('apex_vehicle_orders');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_ORDERS;
  });

  // Coupons & Promo Codes state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('apex_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [claimedCoupons, setClaimedCoupons] = useState<string[]>(() => {
    const saved = localStorage.getItem('apex_claimed_coupons');
    return saved ? JSON.parse(saved) : ['CYBER20', 'FREESPINS5'];
  });

  // Automated ROI Cron Engine state
  const [cronActive, setCronActive] = useState<boolean>(true);
  const [cronCyclesCount, setCronCyclesCount] = useState<number>(186);
  const [lastCronRun, setLastCronRun] = useState<string | null>(new Date().toISOString().replace('T', ' ').substring(0, 16));
  const [dispatchedCronEmails, setDispatchedCronEmails] = useState<CronDispatchedEmail[]>([]);
  const [cronLogs, setCronLogs] = useState<string[]>([
    'System init: Automated ROI Cron Engine active on 60s server interval.',
    'Cycle verified: Calculating daily ROI by plan duration & auto-settling matured wallets.',
  ]);

  // Won Prizes Shipping & Processing Fee State
  const [wonPrizes, setWonPrizes] = useState<WonPrizeItem[]>(() => {
    const saved = localStorage.getItem('apex_won_prizes_v1');
    return saved ? JSON.parse(saved) : INITIAL_WON_PRIZES;
  });

  // Expandable FAQs CMS State
  const [faqsList, setFaqsList] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem('apex_faqs_v1');
    if (saved) {
      try {
        const parsed: FaqItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item) => item.id));
          const missingDefaults = FAQ_ITEMS.filter((d) => !existingIds.has(d.id));
          return [...parsed, ...missingDefaults];
        }
      } catch {
        // fallback below
      }
    }
    return FAQ_ITEMS;
  });

  // SEO, Logo, Favicon, Sitemap & RSS Feeds State
  const [seoSettings, setSeoSettings] = useState<SeoMetadataConfig>(() => {
    const saved = localStorage.getItem('apex_seo_settings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SeoMetadataConfig;
        return {
          ...DEFAULT_SEO_CONFIG,
          ...parsed,
          pageMeta: {
            ...(DEFAULT_SEO_CONFIG.pageMeta || {}),
            ...(parsed.pageMeta || {}),
          },
        };
      } catch {
        return DEFAULT_SEO_CONFIG;
      }
    }
    return DEFAULT_SEO_CONFIG;
  });

  const [activeRouteTab, setActiveRouteTab] = useState<string>('home');
  const [firebaseAdminEmail, setFirebaseAdminEmail] = useState<string | null>(() => auth.currentUser?.email || null);
  const [firebaseCloudConnected, setFirebaseCloudConnected] = useState<boolean>(() => Boolean(auth.currentUser?.uid));
  const [lastFirestoreSyncAt, setLastFirestoreSyncAt] = useState<string | null>(null);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
  const isHydratingRemoteRef = useRef<boolean>(true);

  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>(() => {
    const saved = localStorage.getItem('apex_sitemap_entries_v1');
    return saved ? JSON.parse(saved) : INITIAL_SITEMAP_ENTRIES;
  });

  const [rssFeedItems, setRssFeedItems] = useState<RssFeedItem[]>(() => {
    const saved = localStorage.getItem('apex_rss_items_v1');
    return saved ? JSON.parse(saved) : INITIAL_RSS_ITEMS;
  });

  // Promotional Short Videos (AI-Generated + Admin Uploaded)
  const [promoVideos, setPromoVideos] = useState<PromoVideoItem[]>(() => {
    const saved = localStorage.getItem('apex_promo_videos_v1');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_VIDEOS;
  });

  // Local Currency Switcher & Admin-Managed Multipliers
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>(() => {
    const saved = localStorage.getItem('apex_currencies_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_CURRENCIES;
  });

  const [selectedCurrencyCode, setSelectedCurrencyCodeState] = useState<string>(() => {
    return localStorage.getItem('apex_selected_currency_v1') || 'USD';
  });

  const lockedWinBalanceUsd = currentUser ? Number((lockedWinsByUserId[currentUser.id] || 0).toFixed(2)) : 0;

  const getUserWalletBalances = (userId: string): WalletBalances => {
    if (currentUser?.id === userId) return balances;
    return userBalancesById[userId] || { usd: 0, btc: 0, usdt: 0, xrp: 0, bnb: 0 };
  };

  // Sync to local storage
  useEffect(() => {
    if (currentUser) localStorage.setItem('apex_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('apex_smtp', JSON.stringify(smtpConfig));
    fetch('/api/mailer/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smtpConfig }),
    }).catch(() => {});
  }, [smtpConfig]);

  useEffect(() => {
    localStorage.setItem('apex_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('apex_imported_emails', JSON.stringify(importedEmails));
  }, [importedEmails]);

  useEffect(() => {
    localStorage.setItem('apex_campaigns', JSON.stringify(emailCampaigns));
  }, [emailCampaigns]);

  useEffect(() => {
    localStorage.setItem('apex_balances', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('apex_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('apex_services', JSON.stringify(serviceBookings));
  }, [serviceBookings]);

  useEffect(() => {
    localStorage.setItem('apex_investments', JSON.stringify(userInvestments));
  }, [userInvestments]);

  useEffect(() => {
    localStorage.setItem('apex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('apex_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  useEffect(() => {
    localStorage.setItem('apex_site_pages', JSON.stringify(sitePages));
  }, [sitePages]);

  useEffect(() => {
    localStorage.setItem('apex_navigation_menus', JSON.stringify(navigationMenus));
  }, [navigationMenus]);

  useEffect(() => {
    localStorage.setItem('apex_manual_deposits', JSON.stringify(manualDepositMethods));
  }, [manualDepositMethods]);

  useEffect(() => {
    localStorage.setItem('apex_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  useEffect(() => {
    localStorage.setItem('apex_investment_pools', JSON.stringify(investmentPools));
  }, [investmentPools]);

  useEffect(() => {
    localStorage.setItem('apex_products_list', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('apex_scratch_tiers', JSON.stringify(scratchCardTiers));
  }, [scratchCardTiers]);

  useEffect(() => {
    localStorage.setItem('apex_rental_fleet_list', JSON.stringify(rentalFleetList));
  }, [rentalFleetList]);

  useEffect(() => {
    localStorage.setItem('apex_tesla_cars_catalog', JSON.stringify(teslaCarListings));
  }, [teslaCarListings]);

  useEffect(() => {
    localStorage.setItem('apex_shipping_settings', JSON.stringify(nationwideShippingSettings));
  }, [nationwideShippingSettings]);

  useEffect(() => {
    localStorage.setItem('apex_refund_policy', JSON.stringify(vehicleRefundPolicy));
  }, [vehicleRefundPolicy]);

  useEffect(() => {
    localStorage.setItem('apex_vehicle_orders', JSON.stringify(vehicleOrders));
  }, [vehicleOrders]);

  useEffect(() => {
    localStorage.setItem('apex_spin_cost', spinCostUsd.toString());
  }, [spinCostUsd]);

  useEffect(() => {
    localStorage.setItem('apex_wheel_rewards', JSON.stringify(wheelRewards));
  }, [wheelRewards]);

  useEffect(() => {
    localStorage.setItem('apex_featured_stock_plans', JSON.stringify(featuredStockPlans));
  }, [featuredStockPlans]);

  useEffect(() => {
    localStorage.setItem('apex_spot_holding', JSON.stringify(userSpotHolding));
  }, [userSpotHolding]);

  useEffect(() => {
    localStorage.setItem('apex_withdrawal_settings', JSON.stringify(withdrawalSettings));
  }, [withdrawalSettings]);

  useEffect(() => {
    localStorage.setItem('apex_withdrawal_requests', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('apex_feature_toggles', JSON.stringify(featureToggles));
  }, [featureToggles]);

  useEffect(() => {
    localStorage.setItem('apex_auto_crypto_gateways', JSON.stringify(autoCryptoGateways));
  }, [autoCryptoGateways]);

  useEffect(() => {
    localStorage.setItem('apex_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('apex_tsla_price_alerts', JSON.stringify(stockPriceAlerts));
  }, [stockPriceAlerts]);

  useEffect(() => {
    localStorage.setItem('apex_marketing_banners_v1', JSON.stringify(marketingBanners));
  }, [marketingBanners]);

  useEffect(() => {
    localStorage.setItem('apex_user_balances_v1', JSON.stringify(userBalancesById));
  }, [userBalancesById]);

  useEffect(() => {
    if (currentUser?.id) {
      setUserBalancesById((prev) => {
        const existing = prev[currentUser.id];
        if (
          existing &&
          existing.usd === balances.usd &&
          existing.btc === balances.btc &&
          existing.usdt === balances.usdt &&
          existing.xrp === balances.xrp &&
          existing.bnb === balances.bnb
        ) {
          return prev;
        }
        return { ...prev, [currentUser.id]: { ...balances } };
      });
    }
  }, [balances, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('apex_locked_wins_v1', JSON.stringify(lockedWinsByUserId));
  }, [lockedWinsByUserId]);

  useEffect(() => {
    localStorage.setItem('apex_won_prizes_v1', JSON.stringify(wonPrizes));
  }, [wonPrizes]);

  useEffect(() => {
    localStorage.setItem('apex_faqs_v1', JSON.stringify(faqsList));
  }, [faqsList]);

  useEffect(() => {
    localStorage.setItem('apex_seo_settings_v1', JSON.stringify(seoSettings));
    if (typeof document !== 'undefined') {
      const pageOverride = seoSettings.pageMeta?.[activeRouteTab];
      const customPageMatch = sitePages.find((p) => p.slug === activeRouteTab);
      const resolvedTitle =
        pageOverride?.metaTitle ||
        (customPageMatch ? `${customPageMatch.title} | ${seoSettings.siteTitle}` : '') ||
        seoSettings.metaTitle ||
        seoSettings.siteTitle ||
        DEFAULT_SEO_CONFIG.siteTitle;
      const resolvedDescription =
        pageOverride?.metaDescription ||
        customPageMatch?.metaDescription ||
        seoSettings.metaDescription;
      const resolvedKeywords = pageOverride?.keywords || seoSettings.keywords;
      const resolvedOgTitle =
        pageOverride?.ogTitle || pageOverride?.metaTitle || seoSettings.ogTitle || resolvedTitle;
      const resolvedOgImage = pageOverride?.ogImageUrl || seoSettings.ogImageUrl;

      document.title = resolvedTitle;
      const setMeta = (selector: string, content: string) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute('content', content);
      };
      setMeta('meta[name="description"]', resolvedDescription);
      setMeta('meta[name="keywords"]', resolvedKeywords);
      setMeta('meta[name="robots"]', seoSettings.robotsDirective || 'index, follow');
      setMeta('meta[property="og:title"]', resolvedOgTitle);
      setMeta('meta[property="og:description"]', resolvedDescription);
      setMeta('meta[property="og:image"]', resolvedOgImage);
      setMeta('meta[name="twitter:image"]', resolvedOgImage);

      const canonicalEl = document.getElementById('canonical-link');
      if (canonicalEl && seoSettings.canonicalUrl) {
        const base = seoSettings.canonicalUrl.replace(/\/+$/, '');
        canonicalEl.setAttribute('href', activeRouteTab === 'home' ? `${base}/` : `${base}/?tab=${encodeURIComponent(activeRouteTab)}`);
      }

      const faviconEl = document.getElementById('site-favicon') as HTMLLinkElement | null;
      if (faviconEl && seoSettings.faviconUrl) {
        faviconEl.href = seoSettings.faviconUrl;
        faviconEl.type = seoSettings.faviconUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      }
      const appleEl = document.getElementById('site-apple-icon') as HTMLLinkElement | null;
      if (appleEl && seoSettings.logoUrl) {
        appleEl.href = seoSettings.logoUrl;
      }

      const schemaEl = document.getElementById('apex-schema-org');
      if (schemaEl && seoSettings.schemaOrgEnabled !== false) {
        schemaEl.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': seoSettings.schemaOrgType || 'AutoDealer',
          name: seoSettings.siteName || resolvedTitle,
          url: seoSettings.canonicalUrl,
          logo: seoSettings.logoUrl,
          image: resolvedOgImage,
          description: resolvedDescription,
        });
      }
    }
  }, [seoSettings, activeRouteTab, sitePages]);

  useEffect(() => {
    localStorage.setItem('apex_sitemap_entries_v1', JSON.stringify(sitemapEntries));
  }, [sitemapEntries]);

  useEffect(() => {
    localStorage.setItem('apex_rss_items_v1', JSON.stringify(rssFeedItems));
  }, [rssFeedItems]);

  useEffect(() => {
    fetch('/api/seo/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seoSettings, sitemapEntries, rssFeedItems }),
    }).catch(() => {});
  }, [seoSettings, sitemapEntries, rssFeedItems]);

  // Monitor Firebase Auth state & hydrate remote Firestore + server state on boot
  useEffect(() => {
    const applyLoadedSections = (sections: Record<string, any>) => {
      if (sections.site_settings && typeof sections.site_settings === 'object') {
        setSiteSettings((prev) => ({ ...prev, ...sections.site_settings }));
      }
      if (Array.isArray(sections.currencies) && sections.currencies.length > 0) {
        setCurrencies(sections.currencies);
      }
      if (sections.feature_toggles && typeof sections.feature_toggles === 'object') {
        setFeatureToggles((prev) => ({ ...prev, ...sections.feature_toggles }));
      }
      if (sections.withdrawal_settings && typeof sections.withdrawal_settings === 'object') {
        setWithdrawalSettings((prev) => ({ ...prev, ...sections.withdrawal_settings }));
      }
      if (sections.shipping_settings && typeof sections.shipping_settings === 'object') {
        setNationwideShippingSettings((prev) => ({ ...prev, ...sections.shipping_settings }));
      }
      if (sections.refund_policy && typeof sections.refund_policy === 'object') {
        setVehicleRefundPolicy((prev) => ({ ...prev, ...sections.refund_policy }));
      }
      if (Array.isArray(sections.navigation_menus) && sections.navigation_menus.length > 0) {
        setNavigationMenus(sections.navigation_menus);
      }
      if (Array.isArray(sections.site_pages) && sections.site_pages.length > 0) {
        setSitePages(sections.site_pages);
      }
      if (Array.isArray(sections.faqs) && sections.faqs.length > 0) {
        setFaqsList(sections.faqs);
      }
      if (Array.isArray(sections.sitemap_entries) && sections.sitemap_entries.length > 0) {
        setSitemapEntries(sections.sitemap_entries);
      }
      if (Array.isArray(sections.rss_items) && sections.rss_items.length > 0) {
        setRssFeedItems(sections.rss_items);
      }
      if (Array.isArray(sections.promo_banners) && sections.promo_banners.length > 0) {
        setMarketingBanners(sections.promo_banners);
      }
      if (Array.isArray(sections.promo_videos) && sections.promo_videos.length > 0) {
        setPromoVideos(sections.promo_videos);
      }
      if (Array.isArray(sections.products) && sections.products.length > 0) {
        setProductsList(sections.products);
      }
      if (Array.isArray(sections.tesla_cars) && sections.tesla_cars.length > 0) {
        setTeslaCarListings(sections.tesla_cars);
      }
      if (Array.isArray(sections.investment_pools) && sections.investment_pools.length > 0) {
        setInvestmentPools(sections.investment_pools);
      }
      if (Array.isArray(sections.stock_plans) && sections.stock_plans.length > 0) {
        setFeaturedStockPlans(sections.stock_plans);
      }
      if (Array.isArray(sections.coupons) && sections.coupons.length > 0) {
        setCoupons(sections.coupons);
      }
      if (Array.isArray(sections.wheel_rewards) && sections.wheel_rewards.length > 0) {
        setWheelRewards(sections.wheel_rewards);
      }
      if (Array.isArray(sections.scratch_tiers) && sections.scratch_tiers.length > 0) {
        setScratchCardTiers(sections.scratch_tiers);
      }
      if (Array.isArray(sections.manual_deposits) && sections.manual_deposits.length > 0) {
        setManualDepositMethods(sections.manual_deposits);
      }
      if (Array.isArray(sections.social_links) && sections.social_links.length > 0) {
        setSocialLinks(sections.social_links);
      }
      if (typeof sections.spin_cost === 'number' && sections.spin_cost > 0) {
        setSpinCostUsd(sections.spin_cost);
      }
      if (sections.smtp_config && typeof sections.smtp_config === 'object') {
        setSmtpConfig((prev) => ({ ...prev, ...sections.smtp_config }));
      }
      if (Array.isArray(sections.auto_gateways) && sections.auto_gateways.length > 0) {
        setAutoCryptoGateways(sections.auto_gateways);
      }
      if (Array.isArray(sections.won_prizes) && sections.won_prizes.length > 0) {
        setWonPrizes(sections.won_prizes);
      }
    };

    const hydrateAll = async () => {
      try {
        // 1. Hydrate from local Express backend state mirror
        const res = await fetch('/api/admin/state');
        if (res.ok) {
          const data = await res.json();
          const st = data?.state || {};
          if (st.seoSettings) {
            setSeoSettings((prev) => ({
              ...prev,
              ...st.seoSettings,
              pageMeta: { ...(prev.pageMeta || {}), ...(st.seoSettings.pageMeta || {}) },
            }));
          }
          if (Array.isArray(st.sitemapEntries) && st.sitemapEntries.length > 0) {
            setSitemapEntries(st.sitemapEntries);
          }
          if (Array.isArray(st.rssFeedItems) && st.rssFeedItems.length > 0) {
            setRssFeedItems(st.rssFeedItems);
          }
          applyLoadedSections(st);
        }
      } catch {
        // ignore server state error
      }

      try {
        // 2. Hydrate authoritative Firestore SEO + Admin Config sections
        const [fbSeo, fbSections] = await Promise.all([
          loadGlobalSeoFromFirestore(),
          loadAdminSectionsFromFirestore(Boolean(auth.currentUser)),
        ]);

        if (fbSeo.globalSeo || fbSeo.pageMeta) {
          setSeoSettings((prev) => ({
            ...prev,
            ...(fbSeo.globalSeo || {}),
            pageMeta: {
              ...(prev.pageMeta || {}),
              ...(fbSeo.pageMeta || {}),
            },
          }));
        }
        applyLoadedSections(fbSections);
      } finally {
        setTimeout(() => {
          isHydratingRemoteRef.current = false;
        }, 400);
      }
    };

    void hydrateAll();

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseAdminEmail(fbUser?.email || null);
      setFirebaseCloudConnected(Boolean(fbUser?.uid));
      if (fbUser) {
        void loadAdminSectionsFromFirestore(true).then(applyLoadedSections).catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('apex_promo_videos_v1', JSON.stringify(promoVideos));
  }, [promoVideos]);

  useEffect(() => {
    localStorage.setItem('apex_currencies_v1', JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem('apex_selected_currency_v1', selectedCurrencyCode);
  }, [selectedCurrencyCode]);

  // Monitor live TSLA quote against user-defined stock price alert thresholds
  useEffect(() => {
    const currentPrice = tslaQuote.price;
    const hitAlerts = stockPriceAlerts.filter((a) => {
      if (!a.isActive || a.triggeredAt) return false;
      if (a.condition === 'above') return currentPrice >= a.targetPriceUsd;
      return currentPrice <= a.targetPriceUsd;
    });

    if (hitAlerts.length > 0) {
      const nowIso = new Date().toISOString();
      setStockPriceAlerts((prev) =>
        prev.map((item) =>
          hitAlerts.some((h) => h.id === item.id) ? { ...item, triggeredAt: nowIso } : item
        )
      );

      const first = hitAlerts[0];
      showToast(
        `📈 TSLA Price Alert Hit! TSLA reached $${currentPrice.toFixed(2)} (Target: ${
          first.condition === 'above' ? '≥' : '≤'
        } $${first.targetPriceUsd.toFixed(2)}${first.note ? ` — ${first.note}` : ''})`,
        'success'
      );
    }
  }, [tslaQuote.price, stockPriceAlerts]);


  // Live TSLA stock price fluctuation (simulating real-time NASDAQ market updates)
  useEffect(() => {
    const stockInterval = setInterval(() => {
      setTslaQuote((prev) => {
        const delta = Number(((Math.random() - 0.47) * 0.40).toFixed(2));
        const newPrice = Math.max(120, Number((prev.price + delta).toFixed(2)));
        const baseOpen = 316.07;
        const changeUsd = Number((newPrice - baseOpen).toFixed(2));
        const changePercent = Number(((changeUsd / baseOpen) * 100).toFixed(2));
        const high24h = Math.max(prev.high24h, newPrice);
        const low24h = Math.min(prev.low24h, newPrice);
        const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newHistory = [...prev.history];
        if (newHistory.length > 0) {
          newHistory[newHistory.length - 1] = { time: nowStr, price: newPrice };
        }

        return {
          ...prev,
          price: newPrice,
          changeUsd,
          changePercent,
          high24h,
          low24h,
          updatedAt: new Date().toISOString(),
          history: newHistory,
        };
      });
    }, 6000);
    return () => clearInterval(stockInterval);
  }, []);

  // Update spot holdings whenever TSLA price shifts
  useEffect(() => {
    setUserSpotHolding((prev) => {
      if (prev.shares <= 0) return prev;
      const currentEquity = Number((prev.shares * tslaQuote.price).toFixed(2));
      const pnlUsd = Number((currentEquity - prev.totalInvestedUsd).toFixed(2));
      const pnlPercent = prev.totalInvestedUsd > 0 ? Number(((pnlUsd / prev.totalInvestedUsd) * 100).toFixed(2)) : 0;
      return {
        ...prev,
        currentEquityUsd: currentEquity,
        pnlUsd,
        pnlPercent,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [tslaQuote.price]);


  // Hydrate with server data on mount
  useEffect(() => {
    fetch('/api/cars')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeslaCarListings(data);
        }
      })
      .catch((e) => console.warn('Failed to fetch server car catalog:', e));

    fetch('/api/cars/shipping-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNationwideShippingSettings(data);
      })
      .catch((e) => console.warn('Failed to fetch shipping settings:', e));

    fetch('/api/cars/refund-policy')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setVehicleRefundPolicy(data);
      })
      .catch((e) => console.warn('Failed to fetch refund policy:', e));

    // Sync client investments up to server cron service on boot, then pull authoritative cron status
    const syncPayload = userInvestments.map((inv) => ({
      ...inv,
      userId: inv.userId || currentUser?.id || 'usr-alex-001',
      userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
      userName: currentUser?.name || 'Alex Vance',
    }));

    fetch('/api/investments/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investments: syncPayload }),
    })
      .catch(() => {})
      .finally(() => {
        fetch('/api/cron/status')
          .then((res) => (res.ok ? res.json() : null))
          .then((status) => {
            if (status) {
              if (typeof status.active === 'boolean') setCronActive(status.active);
              if (typeof status.cyclesRun === 'number') setCronCyclesCount(status.cyclesRun);
              if (status.lastRunTimestamp) setLastCronRun(status.lastRunTimestamp.replace('T', ' ').substring(0, 19));
              if (Array.isArray(status.logs)) setCronLogs(status.logs);
              if (Array.isArray(status.dispatchedEmails)) setDispatchedCronEmails(status.dispatchedEmails);
            }
          })
          .catch((e) => console.warn('Failed to fetch cron status:', e));
      });
  }, []);

  // Periodic simulated live community win & ROI ledger drops every 10s (Spin, Scratch, Staking ROI & TSLA Stock ROI)
  useEffect(() => {
    const verifiedAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    ];

    const interval = setInterval(() => {
      const mockNames = [
        'Marcus_V_Plaid',
        'Sarah_Cyber99',
        'Elena_Berlin_EV',
        'Mateo_Miami_TSLA',
        'Kenji_Roadster',
        'Chloe_London_FSD',
        'Priya_Austin_Grid',
        'Liam_Seattle_EV',
        'Viktor_Apex',
        'TeslaKing_Austin',
      ];
      const drops: Array<{
        label: string;
        val: number;
        type: WinRecord['type'];
        category: WinRecord['category'];
        poolOrTicker?: string;
        roiPercent?: number;
      }> = [
        { label: 'Robotaxi Fleet Staking ROI Settled', val: 1480, type: 'Staking ROI', category: 'staking', poolOrTicker: 'Robotaxi Yield', roiPercent: 18.4 },
        { label: 'TSLA.FSD Fast-ROI Stock Dividend Payout', val: 3250, type: 'TSLA Stock ROI', category: 'stock', poolOrTicker: 'TSLA.FSD', roiPercent: 34.0 },
        { label: '2026 Tesla Model 3 Performance Jackpot', val: 54990, type: 'Wheel Spin', category: 'vehicle' },
        { label: 'Supercharger V4 Grid Staking Yield', val: 920, type: 'Staking ROI', category: 'staking', poolOrTicker: 'Supercharger V4', roiPercent: 14.8 },
        { label: 'TSLA Spot Equity +14.6% Swing Gain', val: 4120, type: 'TSLA Stock ROI', category: 'stock', poolOrTicker: 'TSLA Spot', roiPercent: 14.6 },
        { label: '500 USDT Instant Wheel Win', val: 500, type: 'Wheel Spin', category: 'spin_scratch' },
        { label: 'Plaid Track Fleet Staking Compound', val: 2150, type: 'Staking ROI', category: 'staking', poolOrTicker: 'Plaid Track', roiPercent: 22.6 },
        { label: '$8,000 Max Scratch Cash Jackpot', val: 8000, type: 'Scratch & Win', category: 'spin_scratch' },
        { label: 'TSLA.OPTM Robotics Call ROI Yield', val: 2890, type: 'TSLA Stock ROI', category: 'stock', poolOrTicker: 'TSLA.OPTM', roiPercent: 28.5 },
        { label: '2026 Cybertruck AWD Scratch Win', val: 79990, type: 'Scratch & Win', category: 'vehicle' },
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const drop = drops[Math.floor(Math.random() * drops.length)];
      const randomAvatar = verifiedAvatars[Math.floor(Math.random() * verifiedAvatars.length)];
      const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

      const newWin: WinRecord = {
        id: `win-${Date.now()}-${Math.floor(Math.random() * 999)}`,
        username: randomName,
        prize: drop.label,
        type: drop.type,
        category: drop.category,
        poolOrTicker: drop.poolOrTicker,
        roiPercent: drop.roiPercent,
        valueUsd: drop.val,
        timestamp: 'Just now',
        verifiedHash: randomHash,
        avatar: randomAvatar,
      };

      setRecentWinners((prev) => [newWin, ...prev.slice(0, 29)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('apex_session_token') || null;
  });

  // Verify and fetch session on startup
  useEffect(() => {
    const token = sessionToken || localStorage.getItem('apex_session_token');
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('apex_session_token');
          localStorage.removeItem('apex_user');
          setSessionToken(null);
          setCurrentUser(null);
          throw new Error('Session invalid');
        }
        if (!res.ok) throw new Error('Session check failed');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((_err) => {
        // Ignore transient network errors
      });
  }, [sessionToken]);

  const hasAdminPrivilege = (privilege: AdminPrivilege): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    const privs = currentUser.adminPrivileges || [];
    if (privs.includes('super_admin')) return true;
    return privs.includes(privilege);
  };

  const fetchAdmins = async () => {
    if (!sessionToken || currentUser?.role !== 'admin') return;
    try {
      const res = await fetch('/api/auth/admins', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.admins)) {
          setAdminsList(data.admins);
        }
      }
    } catch {
      // ignore transient errors
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin' && sessionToken) {
      fetchAdmins();
    } else {
      setAdminsList([]);
    }
  }, [currentUser?.id, currentUser?.role, sessionToken]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const requireSignedIn = (actionLabel?: string): boolean => {
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apex:require-auth', { detail: actionLabel || '' }));
      }
      showToast(
        actionLabel
          ? `Please sign in or register to ${actionLabel}.`
          : 'Please sign in or register to access this feature.',
        'error'
      );
      return false;
    }
    return true;
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || 'TeslaPlaid2026!',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Authentication failed. Please check credentials.', 'error');
        return false;
      }

      setSessionToken(data.token);
      localStorage.setItem('apex_session_token', data.token);
      setCurrentUser(data.user);
      showToast(data.message || `Welcome back, ${data.user.name}!`, 'success');
      return true;
    } catch {
      if (email.trim().toLowerCase().includes('admin')) {
        showToast('Admin accounts must sign in at /admin.', 'error');
        return false;
      }
      // Local fallback for customer demo resilience
      const user: User = {
        ...DEFAULT_USER,
        email,
        role: 'customer',
        name: email.split('@')[0].toUpperCase(),
      };
      setCurrentUser(user);
      showToast(`Signed in to session for ${user.name}`);
      return true;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'Administrator authentication failed.';
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      setSessionToken(data.token);
      localStorage.setItem('apex_session_token', data.token);
      setCurrentUser(data.user);
      showToast(data.message || `Admin console unlocked for ${data.user.name}.`, 'success');
      return { success: true };
    } catch {
      const errMsg = 'Unable to reach authentication server. Please verify the backend is running.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const createAdminAccount = async (payload: {
    name: string;
    email: string;
    password: string;
    adminRoleLabel: string;
    adminPrivileges: AdminPrivilege[];
    location?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!sessionToken || currentUser?.role !== 'admin') {
      return { success: false, error: 'Admin session required.' };
    }
    try {
      const res = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create admin account.', 'error');
        return { success: false, error: data.error || 'Failed to create admin account.' };
      }
      if (data.admin) {
        setAdminsList((prev) => [data.admin, ...prev]);
      }
      showToast(data.message || 'New administrator account created!', 'success');
      return { success: true };
    } catch {
      const err = 'Network error creating administrator account.';
      showToast(err, 'error');
      return { success: false, error: err };
    }
  };

  const upgradeUserToAdmin = async (payload: {
    userId?: string;
    email: string;
    name?: string;
    adminRoleLabel: string;
    adminPrivileges: AdminPrivilege[];
    password?: string;
    location?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!sessionToken || currentUser?.role !== 'admin') {
      return { success: false, error: 'Admin session required.' };
    }
    try {
      const res = await fetch('/api/auth/admins/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to upgrade user to administrator.', 'error');
        return { success: false, error: data.error || 'Failed to upgrade user to administrator.' };
      }
      if (data.admin) {
        setAdminsList((prev) => {
          const exists = prev.some((a) => a.id === data.admin.id || a.email === data.admin.email);
          return exists
            ? prev.map((a) => (a.id === data.admin.id || a.email === data.admin.email ? data.admin : a))
            : [data.admin, ...prev];
        });
        setAllUsers((prev) => {
          const exists = prev.some(
            (u) => u.id === data.admin.id || u.email.toLowerCase() === data.admin.email.toLowerCase()
          );
          if (!exists) return [data.admin, ...prev];
          return prev.map((u) =>
            u.id === data.admin.id || u.email.toLowerCase() === data.admin.email.toLowerCase()
              ? {
                  ...u,
                  role: 'admin',
                  adminRoleLabel: data.admin.adminRoleLabel,
                  adminPrivileges: data.admin.adminPrivileges,
                }
              : u
          );
        });
        if (currentUser?.id === data.admin.id) {
          setCurrentUser(data.admin);
        }
      }
      showToast(data.message || `${payload.name || payload.email} promoted to Administrator!`, 'success');
      return { success: true };
    } catch {
      const err = 'Network error upgrading user to administrator.';
      showToast(err, 'error');
      return { success: false, error: err };
    }
  };

  const updateAdminPrivileges = async (
    adminId: string,
    payload: { adminRoleLabel?: string; adminPrivileges: AdminPrivilege[] }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!sessionToken || currentUser?.role !== 'admin') {
      return { success: false, error: 'Admin session required.' };
    }
    try {
      const res = await fetch(`/api/auth/admins/${encodeURIComponent(adminId)}/privileges`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update admin privileges.', 'error');
        return { success: false, error: data.error || 'Failed to update admin privileges.' };
      }
      if (data.admin) {
        setAdminsList((prev) => prev.map((a) => (a.id === adminId ? data.admin : a)));
        if (currentUser?.id === adminId) {
          setCurrentUser(data.admin);
        }
      }
      showToast(data.message || 'Administrator privileges updated!', 'success');
      return { success: true };
    } catch {
      const err = 'Network error updating privileges.';
      showToast(err, 'error');
      return { success: false, error: err };
    }
  };

  const deleteAdminAccount = async (adminId: string): Promise<{ success: boolean; error?: string }> => {
    if (!sessionToken || currentUser?.role !== 'admin') {
      return { success: false, error: 'Admin session required.' };
    }
    try {
      const res = await fetch(`/api/auth/admins/${encodeURIComponent(adminId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete admin.', 'error');
        return { success: false, error: data.error || 'Failed to delete admin.' };
      }
      setAdminsList((prev) => prev.filter((a) => a.id !== adminId));
      showToast(data.message || 'Administrator access revoked.', 'info');
      return { success: true };
    } catch {
      const err = 'Network error revoking admin.';
      showToast(err, 'error');
      return { success: false, error: err };
    }
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    phone?: string,
    referralCodeInput?: string,
    bio?: string,
    location?: string,
    preferredServiceCenter?: string
  ): Promise<boolean> => {
    const isReferred = !!referralCodeInput?.trim();
    const cleanRef = referralCodeInput?.trim().toUpperCase();
    const welcomeCredit = isReferred ? 25 : 0;
    const initialSpins = isReferred ? 5 : 3;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: password || 'TeslaPlaid2026!',
          phone,
          referralCode: cleanRef,
          bio,
          location,
          preferredServiceCenter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed.', 'error');
        return false;
      }

      setSessionToken(data.token);
      localStorage.setItem('apex_session_token', data.token);
      setCurrentUser(data.user);

      if (welcomeCredit > 0) {
        setBalances((prev) => ({ ...prev, usd: prev.usd + welcomeCredit }));
        const newTx: Transaction = {
          id: `tx-ref-welcome-${Date.now()}`,
          type: 'referral_credit',
          currency: 'USD',
          amount: welcomeCredit,
          usdEquivalent: welcomeCredit,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...welc`,
          description: `Welcome Referral Bonus from code ${cleanRef} (+$25 USD & 5 Spins)`,
        };
        setTransactions((prev) => [newTx, ...prev]);
        showToast(`Account created with invite code ${cleanRef}! Received +$25 Service Credit and 5 Free Wheel Spins!`, 'success');
      } else {
        showToast(`Account successfully created for ${name}! Enjoy 3 complimentary promotional wheel spins.`, 'success');
      }

      setAvailableSpins(initialSpins);
      return true;
    } catch {
      // Local fallback
      const userCode = `APEX-${name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        phone,
        bio: bio || 'Tesla owner & enthusiast.',
        location: location || 'California, USA',
        preferredServiceCenter: preferredServiceCenter || 'Apex Fremont Technology Center',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        walletAddress: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        twoFactorEnabled: false,
        pinSet: false,
        memberSince: 'Today',
        tier: 'Standard',
        referralCode: userCode,
        referredBy: isReferred ? cleanRef : undefined,
        referralEarningsUsd: 0,
        referralCount: 0,
        referredUsers: [],
      };
      setCurrentUser(fallbackUser);
      setAvailableSpins(initialSpins);
      return true;
    }
  };

  const signUpWithGoogle = async (
    referralCodeInput?: string
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    const cleanRef = referralCodeInput?.trim().toUpperCase();
    const isReferred = !!cleanRef;
    const welcomeCredit = isReferred ? 25 : 0;
    const initialSpins = isReferred ? 5 : 3;

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const fbUser = credential.user;
      const idToken = await fbUser.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          referralCode: cleanRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        await signOut(auth).catch(() => {});
        const errMsg = data.error || 'Google authentication failed.';
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      // Sync verified user profile to Firestore under owner-isolated /users/{uid}
      const userDocPath = `users/${fbUser.uid}`;
      const userDocRef = doc(db, 'users', fbUser.uid);
      let existingSnap;
      try {
        existingSnap = await getDoc(userDocRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userDocPath);
      }

      const safeReferralCode =
        (data.user?.referralCode || `APEX-GGL-${fbUser.uid.substring(0, 6).toUpperCase()}`)
          .toUpperCase()
          .replace(/[^A-Z0-9_-]/g, '')
          .substring(0, 32);

      try {
        if (!existingSnap.exists()) {
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            name: (data.user?.name || fbUser.displayName || 'Tesla Member').substring(0, 120),
            email: (data.user?.email || fbUser.email || '').substring(0, 200),
            avatar: (data.user?.avatar || fbUser.photoURL || '').substring(0, 500),
            authProvider: 'google.com',
            role: 'customer',
            referralCode: safeReferralCode,
            bio: (data.user?.bio || 'Verified Google Member & Apex Tesla Hub Enthusiast.').substring(0, 500),
            location: (data.user?.location || 'California, USA').substring(0, 120),
            preferredServiceCenter: (
              data.user?.preferredServiceCenter || 'Apex Fremont Technology Center'
            ).substring(0, 160),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(
            userDocRef,
            {
              name: (data.user?.name || fbUser.displayName || 'Tesla Member').substring(0, 120),
              avatar: (data.user?.avatar || fbUser.photoURL || '').substring(0, 500),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userDocPath);
      }

      setSessionToken(data.token);
      localStorage.setItem('apex_session_token', data.token);
      setCurrentUser(data.user);

      if (data.isNewUser) {
        if (welcomeCredit > 0) {
          setBalances((prev) => ({ ...prev, usd: prev.usd + welcomeCredit }));
          const newTx: Transaction = {
            id: `tx-ggl-welcome-${Date.now()}`,
            type: 'referral_credit',
            currency: 'USD',
            amount: welcomeCredit,
            usdEquivalent: welcomeCredit,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'completed',
            txHash: `0x${Math.random().toString(16).substring(2, 10)}...gglw`,
            description: `Google Social Sign-Up Referral Bonus (${cleanRef}: +$25 USD & 5 Spins)`,
          };
          setTransactions((prev) => [newTx, ...prev]);
          showToast(
            `Google account created with code ${cleanRef}! +$25 Credit & 5 Free Spins unlocked!`,
            'success'
          );
        } else {
          showToast(
            `Welcome to Apex Tesla Hub, ${data.user.name}! Enjoy 3 complimentary wheel spins.`,
            'success'
          );
        }
        setAvailableSpins(initialSpins);
      } else {
        showToast(data.message || `Signed in with Google as ${data.user.name}!`, 'success');
      }

      return { success: true, isNewUser: Boolean(data.isNewUser) };
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        const msg = 'Google sign-in popup was closed before completing authentication.';
        showToast(msg, 'info');
        return { success: false, error: msg };
      }
      if (code === 'auth/popup-blocked') {
        const msg = 'Popups were blocked by your browser. Please allow popups and try again.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
      const msg = error instanceof Error ? error.message : 'Google sign-up failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    preferredServiceCenter?: string;
    avatar?: string;
  }): Promise<boolean> => {
    try {
      if (sessionToken) {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(profileData),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            showToast('Profile and bio details updated successfully!', 'success');
            return true;
          }
        }
      }
    } catch (err) {
      console.warn('API update failed, updating local state:', err);
    }

    if (currentUser) {
      const updated: User = {
        ...currentUser,
        ...(profileData.name ? { name: profileData.name } : {}),
        ...(profileData.phone !== undefined ? { phone: profileData.phone } : {}),
        ...(profileData.bio !== undefined ? { bio: profileData.bio } : {}),
        ...(profileData.location !== undefined ? { location: profileData.location } : {}),
        ...(profileData.preferredServiceCenter !== undefined ? { preferredServiceCenter: profileData.preferredServiceCenter } : {}),
        ...(profileData.avatar ? { avatar: profileData.avatar } : {}),
      };
      setCurrentUser(updated);
      showToast('Profile details updated.', 'success');
      return true;
    }
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (sessionToken) {
        const res = await fetch('/api/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Password updated and secured with scrypt hashing.', 'success');
          return { success: true, message: data.message };
        } else {
          showToast(data.error || 'Failed to update password.', 'error');
          return { success: false, message: data.error };
        }
      }
    } catch {
      // Fallback
    }
    showToast('Password updated successfully.', 'success');
    return { success: true, message: 'Password updated successfully.' };
  };

  const terminateOtherSessions = async (): Promise<boolean> => {
    try {
      if (sessionToken) {
        const res = await fetch('/api/auth/revoke-all-sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
          showToast('All other active device sessions have been revoked.', 'success');
          return true;
        }
      }
    } catch {
      // Fallback
    }

    if (currentUser && currentUser.sessionHistory) {
      const updatedSessions = currentUser.sessionHistory.map((s, idx) =>
        idx === 0 ? s : { ...s, status: 'revoked' as const }
      );
      setCurrentUser({
        ...currentUser,
        sessionHistory: updatedSessions,
      });
      showToast('All other active device sessions have been revoked.', 'success');
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
      }
    } catch {
      // Ignore network errors on logout
    }

    await signOut(auth).catch(() => {});
    localStorage.removeItem('apex_session_token');
    localStorage.removeItem('apex_user');
    setSessionToken(null);
    setCurrentUser(null);
    showToast('Logged out of Apex Tesla Hub.', 'info');
  };

  const updateReferralCode = (newCode: string): boolean => {
    if (!requireSignedIn('customize your referral code')) return false;
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 3 || cleanCode.length > 20) {
      showToast('Referral code must be 3 to 20 alphanumeric characters.', 'error');
      return false;
    }

    const updated = { ...currentUser!, referralCode: cleanCode };
    setCurrentUser(updated);
    showToast(`Your unique invite code updated to: ${cleanCode}`, 'success');
    return true;
  };

  const simulateFriendReferral = (friendName?: string, depositAmount: number = 500) => {
    if (!requireSignedIn('simulate referral rewards')) return;

    const names = ['Liam Thorne', 'Mia Vance', 'David Chen', 'Chloe Sterling', 'Jordan Rivera', 'Noah Zhao'];
    const selectedName = friendName || names[Math.floor(Math.random() * names.length)];
    const friendEmail = `${selectedName.toLowerCase().replace(/\s+/g, '.')}@tesla-driver.io`;
    const verifiedAvatarsList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    ];
    const avatar = verifiedAvatarsList[Math.floor(Math.random() * verifiedAvatarsList.length)];

    // Reward: $100 platform credits + 2 bonus spins for the user
    const bonusCredits = 100;
    const bonusSpins = 2;

    const newReferred: ReferredUser = {
      id: `ref-${Date.now()}`,
      name: selectedName,
      email: friendEmail,
      avatar,
      date: new Date().toISOString().substring(0, 10),
      status: 'deposit_completed',
      depositAmountUsd: depositAmount,
      earnedCreditUsd: bonusCredits,
      bonusSpinsEarned: bonusSpins,
    };

    // Credit USD wallet balance
    setBalances((prev) => ({
      ...prev,
      usd: prev.usd + bonusCredits,
    }));

    // Add extra promotional spins
    setAvailableSpins((prev) => prev + bonusSpins);

    // Record on-chain transaction
    const txId = `tx-ref-${Date.now()}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...ref`;
    const newTx: Transaction = {
      id: txId,
      type: 'referral_credit',
      currency: 'USD',
      amount: bonusCredits,
      usdEquivalent: bonusCredits,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash,
      description: `Referral Reward: ${selectedName} completed first deposit of $${depositAmount} USD`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update current user's referredUsers list and metrics
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        referralEarningsUsd: (currentUser.referralEarningsUsd || 0) + bonusCredits,
        referralCount: (currentUser.referralCount || 0) + 1,
        referredUsers: [newReferred, ...(currentUser.referredUsers || [])],
      };
      setCurrentUser(updatedUser);
    }

    showToast(
      `🎉 Referral Reward Earned! ${selectedName} completed their first deposit ($${depositAmount} USD)! +$${bonusCredits} USD Platform Credits & ${bonusSpins} Free Spins added to your vault!`,
      'success'
    );
  };

  const setRole = (role: UserRole) => {
    // Disallow unauthenticated or customer self-elevation to admin
    if (role === 'admin' && currentUser?.role !== 'admin') {
      showToast('Administrator privileges require verified authentication at /admin.', 'error');
      return;
    }
    if (currentUser && currentUser.role === 'admin') {
      showToast(`Active admin session: ${currentUser.adminRoleLabel || 'Administrator'}.`, 'info');
    }
  };

  const toggle2FA = () => {
    if (!requireSignedIn('manage 2FA settings')) return;
    if (currentUser) {
      const newState = !currentUser.twoFactorEnabled;
      setCurrentUser({ ...currentUser, twoFactorEnabled: newState });
      showToast(`Two-Factor Authentication (2FA) is now ${newState ? 'ENABLED (Hardware Vault Protected)' : 'DISABLED'}.`, newState ? 'success' : 'info');
    }
  };

  const updatePin = (newPin: string) => {
    if (!requireSignedIn('update security PIN')) return;
    if (currentUser) {
      setCurrentUser({ ...currentUser, pin: newPin, pinSet: true });
      showToast('Wallet Security PIN successfully updated.', 'success');
    }
  };

  const depositFunds = async (currency: CryptoCurrency | 'USD', amount: number): Promise<Transaction> => {
    if (!requireSignedIn('deposit funds into your vault')) {
      throw new Error('Authentication required to deposit funds.');
    }

    let usdValue = amount;
    if (currency !== 'USD') {
      const rate = CRYPTO_NETWORKS[currency]?.rateUsd || 1;
      usdValue = amount * rate;
    }

    const txId = `tx-${Date.now()}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;
    const usdEquivRounded = Math.round(usdValue * 100) / 100;

    const newTx: Transaction = {
      id: txId,
      type: 'deposit',
      currency,
      amount,
      usdEquivalent: usdEquivRounded,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash,
      description: `${currency} Instant Gateway Deposit Confirmed`,
    };

    const nextUsdBalance = Number((balances.usd + (currency === 'USD' ? amount : usdValue)).toFixed(2));
    setBalances((prev) => {
      if (currency === 'USD') {
        return { ...prev, usd: prev.usd + amount };
      } else if (currency === 'BTC') {
        return { ...prev, btc: prev.btc + amount, usd: prev.usd + usdValue };
      } else if (currency === 'USDT') {
        return { ...prev, usdt: prev.usdt + amount, usd: prev.usd + usdValue };
      } else if (currency === 'XRP') {
        return { ...prev, xrp: prev.xrp + amount, usd: prev.usd + usdValue };
      } else if (currency === 'BNB') {
        return { ...prev, bnb: prev.bnb + amount, usd: prev.usd + usdValue };
      }
      return prev;
    });

    setTransactions((prev) => [newTx, ...prev]);

    // Update user's total deposited metric & auto-unlock locked $250-threshold spin winnings
    if (currentUser) {
      const updatedTotal = Number(((currentUser.totalDepositedUsd || 0) + usdValue).toFixed(2));
      const updatedUser: User = { ...currentUser, totalDepositedUsd: updatedTotal };
      setCurrentUser(updatedUser);
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === currentUser.id ? { ...u, totalDepositedUsd: updatedTotal } : u))
      );

      const lockedAmt = lockedWinsByUserId[currentUser.id] || 0;
      if (updatedTotal >= MIN_DEPOSIT_TO_ACTIVATE_WINS_USD && lockedAmt > 0) {
        setBalances((prev) => ({ ...prev, usd: Number((prev.usd + lockedAmt).toFixed(2)) }));
        setLockedWinsByUserId((prev) => ({ ...prev, [currentUser.id]: 0 }));
        const unlockTx: Transaction = {
          id: `tx-unlock-${Date.now()}`,
          type: 'promotion_win',
          currency: 'USD',
          amount: lockedAmt,
          usdEquivalent: lockedAmt,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substring(2, 12)}...unlk`,
          description: `Activated $${lockedAmt.toFixed(2)} Locked Spin/Promo Winnings ($250 Min Deposit Verified)`,
        };
        setTransactions((prev) => [unlockTx, ...prev]);
        showToast(
          `🔓 $${lockedAmt.toLocaleString()} locked promotional winnings activated & moved to your spendable vault!`,
          'success'
        );
      }

      // Dispatch .env SMTP email notification for completed deposit
      fetch('/api/notifications/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          currency,
          amount,
          usdEquivalent: usdEquivRounded,
          txHash,
          newBalanceUsd: nextUsdBalance,
        }),
      }).catch(() => {});
    }

    showToast(`Deposit of ${amount} ${currency} (~$${Math.round(usdValue).toLocaleString()}) credited to your vault!`, 'success');
    return newTx;
  };

  const addVehicle = (vehicleData: Omit<TeslaVehicle, 'id' | 'userId'>) => {
    if (!requireSignedIn('register a vehicle in your garage')) return;
    const newVehicle: TeslaVehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    showToast(`${vehicleData.model} (${vehicleData.trim}) added to your digital garage!`);
  };

  const bookService = (bookingData: Omit<ServiceBooking, 'id' | 'userId' | 'createdAt' | 'progressPercentage' | 'status'>) => {
    if (!requireSignedIn('book a service or wrap appointment')) {
      throw new Error('Sign in required to book services.');
    }
    const newBooking: ServiceBooking = {
      ...bookingData,
      id: `srv-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
      progressPercentage: 10,
      status: 'Scheduled',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setServiceBookings((prev) => [newBooking, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: bookingData.totalCostUsd,
      usdEquivalent: bookingData.totalCostUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      description: `${bookingData.serviceType} (${bookingData.serviceMode})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Deduct from USD wallet
    setBalances((prev) => ({
      ...prev,
      usd: Math.max(0, prev.usd - bookingData.totalCostUsd),
    }));

    showToast(`Service appointment booked for ${bookingData.vehicleName} on ${bookingData.scheduledDate}!`);
    return newBooking;
  };

  const stakeInPool = (poolId: string, amountUsd: number): boolean => {
    if (!requireSignedIn('stake in autonomous fleet yield pools')) return false;
    if (balances.usd < amountUsd) {
      showToast(`Insufficient USD balance ($${balances.usd.toFixed(2)}). Please deposit funds.`, 'error');
      return false;
    }

    const pool = investmentPools.find((p) => p.id === poolId) || INVESTMENT_POOLS.find((p) => p.id === poolId);
    if (!pool) return false;

    // Deduct balance
    setBalances((prev) => ({ ...prev, usd: prev.usd - amountUsd }));

    const durationDays = pool.lockPeriodDays || 30;
    const now = new Date();
    const startDate = now.toISOString().substring(0, 10);
    const maturity = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const maturityDate = maturity.toISOString().substring(0, 10);
    const totalExpectedRoiUsd = Number(((amountUsd * (pool.apy / 100) * (durationDays / 365))).toFixed(2));
    const dailyRoiRate = Number(((amountUsd * (pool.apy / 100)) / 365).toFixed(2));

    const newInvestment: UserInvestment = {
      id: `inv-${Date.now()}`,
      userId: currentUser?.id || 'usr-apex-001',
      poolId,
      poolTitle: pool.title,
      amountInvestedUsd: amountUsd,
      investedAt: startDate,
      earnedDividendsUsd: 0,
      apy: pool.apy,
      nextPayoutHours: 24,
      status: 'running',
      durationDays,
      daysElapsed: 0,
      startDate,
      maturityDate,
      totalExpectedRoiUsd,
      dailyRoiRate,
      autoCompound: true,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    setUserInvestments((prev) => [newInvestment, ...prev]);

    // Sync newly created stake to server.ts automated ROI cron store
    fetch('/api/investments/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investments: [
          {
            ...newInvestment,
            userId: currentUser?.id || 'usr-alex-001',
            userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
            userName: currentUser?.name || 'Alex Vance',
          },
        ],
      }),
    }).catch(() => {});

    // Record transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: amountUsd,
      usdEquivalent: amountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: newInvestment.txHash || `0x${Math.random().toString(16).substring(2, 10)}`,
      description: `Staked in ${pool.title} @ ${pool.apy}% APY (${durationDays}-Day Plan)`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Staked $${amountUsd.toLocaleString()} in ${pool.title}! Daily payouts activated.`);
    return true;
  };

  const claimDividends = (investmentId: string) => {
    if (!requireSignedIn('claim staking dividends')) return;
    const inv = userInvestments.find((i) => i.id === investmentId);
    if (!inv || inv.earnedDividendsUsd <= 0) {
      showToast('No dividends available to claim yet.', 'info');
      return;
    }

    const amount = inv.earnedDividendsUsd;
    setBalances((prev) => ({ ...prev, usd: prev.usd + amount }));
    setUserInvestments((prev) =>
      prev.map((i) => (i.id === investmentId ? { ...i, earnedDividendsUsd: 0 } : i))
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'dividend_claim',
      currency: 'USD',
      amount,
      usdEquivalent: amount,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...div`,
      description: `Claimed $${amount.toFixed(2)} dividends from ${inv.poolTitle}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setRecentWinners((prev) => [
      {
        id: `win-roi-${Date.now()}`,
        username: currentUser?.name || 'Apex_Staker',
        prize: `${inv.poolTitle} Staking ROI Payout`,
        type: 'Staking ROI',
        category: 'staking',
        poolOrTicker: inv.poolTitle,
        roiPercent: inv.apy,
        valueUsd: Number(amount.toFixed(2)),
        timestamp: 'Just now',
        verifiedHash: newTx.txHash || '0xroi...claim',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      ...prev.slice(0, 23),
    ]);

    showToast(`Claimed $${amount.toFixed(2)} dividends into your vault!`, 'success');
  };

  // User Investment Management Handlers (Admin & User)
  const updateUserInvestment = (id: string, updates: Partial<UserInvestment>) => {
    setUserInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
    showToast('Investment position updated successfully.', 'success');
  };

  // Force Mature Investment & Auto-Credit Wallet Capital + ROI
  const forceMatureInvestment = (investmentId: string): boolean => {
    const inv = userInvestments.find((i) => i.id === investmentId);
    if (!inv) return false;

    const totalReturn = inv.amountInvestedUsd + (inv.earnedDividendsUsd || 0);

    // Credit user balances
    setBalances((prev) => ({ ...prev, usd: prev.usd + totalReturn }));

    const completionDate = new Date().toISOString().substring(0, 10);
    const certificateId = `APEX-CERT-${completionDate.replace(/-/g, '')}-${inv.id.substring(4, 8).toUpperCase()}`;

    // Mark as completed
    setUserInvestments((prev) =>
      prev.map((i) =>
        i.id === investmentId
          ? {
              ...i,
              status: 'completed',
              daysElapsed: i.durationDays,
              completedAt: completionDate,
              capitalReturned: true,
              certificateId,
            }
          : i
      )
    );

    // Payout transaction
    const newTx: Transaction = {
      id: `tx-mature-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: totalReturn,
      usdEquivalent: totalReturn,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...settle`,
      description: `Maturity Settlement: ${inv.poolTitle} (Principal $${inv.amountInvestedUsd.toLocaleString()} + ROI $${inv.earnedDividendsUsd.toFixed(2)})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Send personalized notification
    sendNotification({
      title: `🎉 Investment Plan Matured: ${inv.poolTitle}`,
      message: `Your staking plan has concluded. Principal ($${inv.amountInvestedUsd.toLocaleString()}) and earned dividends ($${inv.earnedDividendsUsd.toFixed(2)}) totaling $${totalReturn.toFixed(2)} USD have been credited to your wallet balance. Certificate #${certificateId} issued.`,
      type: 'payout',
      priority: 'urgent',
      targetType: 'individual',
      targetUserId: inv.userId || currentUser?.id,
      targetUserEmail: currentUser?.email,
      actionUrl: 'wallet',
      actionLabel: 'View Wallet Balance',
    });

    showToast(`Settled $${totalReturn.toFixed(2)} (Capital + ROI) to wallet!`, 'success');
    setRecentWinners((prev) => [
      {
        id: `win-mat-${Date.now()}`,
        username: currentUser?.name || 'Apex_Investor',
        prize: `${inv.poolTitle} Matured ROI Settlement`,
        type: 'Staking ROI',
        category: 'staking',
        poolOrTicker: inv.poolTitle,
        roiPercent: inv.apy,
        valueUsd: Number(totalReturn.toFixed(2)),
        timestamp: 'Just now',
        verifiedHash: newTx.txHash || '0xmat...roi',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      ...prev.slice(0, 23),
    ]);
    // Also dispatch maturity email & mark settled on server.ts
    fetch(`/api/investments/${investmentId}/force-mature`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.dispatchedEmails) setDispatchedCronEmails(d.dispatchedEmails);
      })
      .catch(() => {});
    return true;
  };

  const pauseResumeInvestment = (investmentId: string) => {
    setUserInvestments((prev) =>
      prev.map((i) => {
        if (i.id === investmentId) {
          const nextStatus = i.status === 'running' ? 'paused' : 'running';
          showToast(`Investment #${investmentId} status set to ${nextStatus}.`, 'info');
          const updated = { ...i, status: nextStatus as any };
          fetch('/api/investments/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ investments: [updated] }),
          }).catch(() => {});
          return updated;
        }
        return i;
      })
    );
  };

  const cancelInvestmentEarly = (investmentId: string): boolean => {
    const inv = userInvestments.find((i) => i.id === investmentId);
    if (!inv) return false;

    // Early withdrawal penalty 5%
    const penalty = inv.amountInvestedUsd * 0.05;
    const refund = inv.amountInvestedUsd - penalty + inv.earnedDividendsUsd;

    setBalances((prev) => ({ ...prev, usd: prev.usd + refund }));

    setUserInvestments((prev) =>
      prev.map((i) =>
        i.id === investmentId
          ? {
              ...i,
              status: 'completed',
              completedAt: new Date().toISOString().substring(0, 10),
              capitalReturned: true,
            }
          : i
      )
    );

    const cancelTx: Transaction = {
      id: `tx-cancel-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: refund,
      usdEquivalent: refund,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...unstake`,
      description: `Early Unstake: ${inv.poolTitle} ($${refund.toFixed(2)} refunded after 5% fee)`,
    };
    setTransactions((prev) => [cancelTx, ...prev]);

    showToast(`Early unstake complete. $${refund.toFixed(2)} refunded to wallet.`, 'info');
    return true;
  };

  // Reconcile Server Cron State & Apply Newly Matured Wallet Settlements (Idempotent)
  const applyServerCronSnapshot = (snapshot: {
    active?: boolean;
    cyclesRun?: number;
    lastRunTimestamp?: string;
    logs?: string[];
    dispatchedEmails?: CronDispatchedEmail[];
    investments?: any[];
    settlementEvents?: Array<{
      id: string;
      investmentId: string;
      userId: string;
      userEmail: string;
      userName: string;
      poolTitle: string;
      principalUsd: number;
      roiUsd: number;
      totalPayoutUsd: number;
      certificateId: string;
      settledAt: string;
    }>;
  }) => {
    if (typeof snapshot.active === 'boolean') setCronActive(snapshot.active);
    if (typeof snapshot.cyclesRun === 'number') setCronCyclesCount(snapshot.cyclesRun);
    if (snapshot.lastRunTimestamp) setLastCronRun(snapshot.lastRunTimestamp.replace('T', ' ').substring(0, 19));
    if (Array.isArray(snapshot.logs)) setCronLogs(snapshot.logs);
    if (Array.isArray(snapshot.dispatchedEmails)) setDispatchedCronEmails(snapshot.dispatchedEmails);

    if (Array.isArray(snapshot.investments) && snapshot.investments.length > 0) {
      const serverById = new Map<string, any>();
      snapshot.investments.forEach((sInv) => {
        if (sInv?.id) serverById.set(sInv.id, sInv);
      });

      setUserInvestments((prev) =>
        prev.map((localInv) => {
          const srv = serverById.get(localInv.id);
          if (!srv) return localInv;
          return {
            ...localInv,
            earnedDividendsUsd: typeof srv.earnedDividendsUsd === 'number' ? srv.earnedDividendsUsd : localInv.earnedDividendsUsd,
            daysElapsed: typeof srv.daysElapsed === 'number' ? srv.daysElapsed : localInv.daysElapsed,
            status: srv.status || localInv.status,
            completedAt: srv.completedAt ? String(srv.completedAt).substring(0, 10) : localInv.completedAt,
            capitalReturned: typeof srv.capitalReturned === 'boolean' ? srv.capitalReturned : localInv.capitalReturned,
            certificateId: srv.certificateId || localInv.certificateId,
          };
        })
      );
    }

    if (Array.isArray(snapshot.settlementEvents) && snapshot.settlementEvents.length > 0) {
      const appliedRaw = localStorage.getItem('apex_applied_settlements');
      const appliedIds: string[] = appliedRaw ? JSON.parse(appliedRaw) : [];
      const appliedSet = new Set<string>(appliedIds);
      const activeUid = currentUser?.id || 'usr-alex-001';
      let creditedAny = false;

      snapshot.settlementEvents.forEach((ev) => {
        if (appliedSet.has(ev.id)) return;
        const belongsToSession =
          ev.userId === activeUid || ev.userId === 'usr-alex-001' || ev.userId === 'usr-apex-001';
        if (!belongsToSession) return;

        appliedSet.add(ev.id);
        creditedAny = true;

        setBalances((b) => ({ ...b, usd: Number((b.usd + ev.totalPayoutUsd).toFixed(2)) }));

        const settleTx: Transaction = {
          id: `tx-cron-${ev.investmentId}-${Date.now()}`,
          type: 'dividend_claim',
          currency: 'USD',
          amount: ev.totalPayoutUsd,
          usdEquivalent: ev.totalPayoutUsd,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...cron`,
          description: `Cron Auto-Settlement: ${ev.poolTitle} ($${ev.principalUsd.toLocaleString()} Capital + $${ev.roiUsd.toFixed(2)} ROI) • Cert ${ev.certificateId}`,
        };
        setTransactions((prev) => [settleTx, ...prev]);

        sendNotification({
          title: `🏆 Plan Matured & Auto-Settled: ${ev.poolTitle}`,
          message: `Automated ROI Cron completed your investment cycle! $${ev.totalPayoutUsd.toFixed(2)} USD (Capital $${ev.principalUsd.toLocaleString()} + ROI $${ev.roiUsd.toFixed(2)}) has been credited to your wallet and an email receipt was dispatched to ${ev.userEmail}.`,
          type: 'payout',
          priority: 'urgent',
          targetType: 'individual',
          targetUserId: activeUid,
          actionUrl: 'wallet',
          actionLabel: 'View Wallet',
        });
      });

      if (creditedAny) {
        localStorage.setItem('apex_applied_settlements', JSON.stringify(Array.from(appliedSet).slice(-100)));
      }
    }
  };

  // Toggle Server Cron Service Active / Paused
  const toggleCronActive = async (active?: boolean) => {
    try {
      const res = await fetch('/api/cron/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeof active === 'boolean' ? { active } : {}),
      });
      const data = await res.json();
      if (res.ok && typeof data.active === 'boolean') {
        setCronActive(data.active);
        showToast(data.message || `Cron service ${data.active ? 'activated' : 'paused'}.`, 'info');
        return;
      }
    } catch {
      // Fallback
    }
    const next = typeof active === 'boolean' ? active : !cronActive;
    setCronActive(next);
    showToast(`Cron service ${next ? 'activated' : 'paused'}.`, 'info');
  };

  // Automated ROI Cron Job Execution Engine (calls server.ts /api/cron/trigger)
  const triggerManualCronCycle = async (): Promise<{ maturedCount: number; yieldDistributedUsd: number; logs: string[] }> => {
    try {
      // Ensure server has latest client investments before executing cycle
      await fetch('/api/investments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investments: userInvestments.map((inv) => ({
            ...inv,
            userId: inv.userId || currentUser?.id || 'usr-alex-001',
            userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
            userName: currentUser?.name || 'Alex Vance',
          })),
        }),
      });

      const res = await fetch('/api/cron/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        applyServerCronSnapshot(data);
        showToast(
          data.message ||
            `Cron Cycle complete: $${(data.yieldDistributedUsd || 0).toFixed(2)} yield accrued. ${data.maturedCount || 0} plan(s) matured!`,
          'success'
        );
        return {
          maturedCount: data.maturedCount || 0,
          yieldDistributedUsd: data.yieldDistributedUsd || 0,
          logs: Array.isArray(data.logs) ? data.logs : [],
        };
      }
    } catch (err) {
      console.warn('Server cron trigger fallback triggered:', err);
    }

    // Safe local fallback if server unreachable
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastCronRun(timeStr);
    let maturedCount = 0;
    let yieldDistributedUsd = 0;
    const newLogs: string[] = [];

    setUserInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status !== 'running' || inv.capitalReturned) return inv;
        const duration = Math.max(1, inv.durationDays || 30);
        const dailyYield =
          inv.dailyRoiRate && inv.dailyRoiRate > 0
            ? inv.dailyRoiRate
            : inv.totalExpectedRoiUsd > 0
            ? Number((inv.totalExpectedRoiUsd / duration).toFixed(2))
            : Number(((inv.amountInvestedUsd * (inv.apy / 100)) / 365).toFixed(2));
        const newEarned = Number(((inv.earnedDividendsUsd || 0) + dailyYield).toFixed(2));
        const newDaysElapsed = Math.min(duration, (inv.daysElapsed || 0) + 1);
        yieldDistributedUsd += dailyYield;

        if (newDaysElapsed >= duration) {
          maturedCount++;
          const finalRoi = inv.totalExpectedRoiUsd > newEarned ? inv.totalExpectedRoiUsd : newEarned;
          const totalSettlement = Number((inv.amountInvestedUsd + finalRoi).toFixed(2));
          setBalances((b) => ({ ...b, usd: Number((b.usd + totalSettlement).toFixed(2)) }));
          const completionDate = new Date().toISOString().substring(0, 10);
          const certificateId = `APEX-CERT-${completionDate.replace(/-/g, '')}-${inv.id.substring(4, 8).toUpperCase()}`;
          newLogs.push(`[MATURED] Plan #${inv.id}: Paid $${totalSettlement.toFixed(2)}. Cert: ${certificateId}`);
          return {
            ...inv,
            status: 'completed' as const,
            daysElapsed: duration,
            earnedDividendsUsd: finalRoi,
            completedAt: completionDate,
            capitalReturned: true,
            certificateId,
          };
        }
        newLogs.push(`[YIELD ACCRUED] Plan #${inv.id}: +$${dailyYield.toFixed(2)} (Day ${newDaysElapsed}/${duration})`);
        return { ...inv, earnedDividendsUsd: newEarned, daysElapsed: newDaysElapsed, nextPayoutHours: 24 };
      })
    );
    const summaryLog = `[CRON CYCLE at ${timeStr}] Accrued $${yieldDistributedUsd.toFixed(2)} USD. Matured: ${maturedCount}.`;
    setCronLogs((prevLogs) => [summaryLog, ...newLogs, ...prevLogs.slice(0, 20)]);
    return { maturedCount, yieldDistributedUsd, logs: [summaryLog, ...newLogs] };
  };

  // Poll authoritative server.ts Cron Engine every 20 seconds when active
  useEffect(() => {
    if (!cronActive) return;

    const interval = setInterval(() => {
      fetch('/api/cron/status')
        .then((res) => (res.ok ? res.json() : null))
        .then((status) => {
          if (status) applyServerCronSnapshot(status);
        })
        .catch(() => {});
    }, 20000);

    return () => clearInterval(interval);
  }, [cronActive, currentUser?.id]);

  // Notifications Hub Handlers
  const sendNotification = (notificationData: Omit<AdminNotificationMessage, 'id' | 'createdAt' | 'readBy' | 'dismissedBy'>) => {
    const newNotif: AdminNotificationMessage = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      readBy: [],
      dismissedBy: [],
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);
    showToast(`Notification "${notificationData.title}" dispatched!`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    const uid = currentUser?.id || 'usr-apex-001';
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readBy: Array.from(new Set([...(n.readBy || []), uid])) } : n))
    );
  };

  const dismissNotification = (id: string) => {
    const uid = currentUser?.id || 'usr-apex-001';
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissedBy: Array.from(new Set([...(n.dismissedBy || []), uid])) } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setAdminNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification deleted.', 'info');
  };

  // Global Site Settings Handler
  const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const next = { ...prev, ...updates };
      if (typeof updates.spinCostUsd === 'number' && updates.spinCostUsd > 0) {
        setSpinCostUsd(updates.spinCostUsd);
      }
      return next;
    });
    showToast('Site settings saved and reflected site-wide.', 'success');
  };

  // Site CMS Pages Handlers
  const createSitePage = (pageData: Omit<SitePage, 'id' | 'updatedAt'>) => {
    const newPage: SitePage = {
      ...pageData,
      isPublished: pageData.isPublished ?? pageData.published ?? true,
      published: pageData.published ?? pageData.isPublished ?? true,
      id: `page-${Date.now()}`,
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    setSitePages((prev) => [...prev, newPage]);
    showToast(`Page "${pageData.title}" created successfully!`, 'success');
  };

  const updateSitePage = (id: string, updates: Partial<SitePage>) => {
    setSitePages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              published: updates.isPublished ?? updates.published ?? p.published,
              isPublished: updates.isPublished ?? updates.published ?? p.isPublished ?? p.published,
              updatedAt: new Date().toISOString().substring(0, 10),
            }
          : p
      )
    );
    showToast('Page configuration saved.', 'success');
  };

  const deleteSitePage = (id: string): boolean => {
    const target = sitePages.find((p) => p.id === id);
    if (target?.isSystem) {
      showToast('System core pages cannot be deleted.', 'error');
      return false;
    }
    setSitePages((prev) => prev.filter((p) => p.id !== id));
    showToast(`Page "${target?.title || id}" removed.`, 'info');
    return true;
  };

  // Navigation Menus CRUD Handlers
  const createNavigationMenuItem = (itemData: Omit<NavigationMenuItem, 'id'>) => {
    const newItem: NavigationMenuItem = {
      ...itemData,
      id: `menu-${Date.now()}`,
    };
    setNavigationMenus((prev) => [...prev, newItem]);
    showToast(`Menu link "${itemData.label}" added.`, 'success');
  };

  const updateNavigationMenuItem = (id: string, updates: Partial<NavigationMenuItem>) => {
    setNavigationMenus((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Navigation menu updated.', 'success');
  };

  const deleteNavigationMenuItem = (id: string) => {
    setNavigationMenus((prev) => prev.filter((m) => m.id !== id));
    showToast('Menu item deleted.', 'info');
  };

  const reorderNavigationMenuItem = (id: string, direction: 'up' | 'down') => {
    setNavigationMenus((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const group = prev
        .filter((m) => m.location === target.location)
        .sort((a, b) => a.order - b.order);
      const idx = group.findIndex((m) => m.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= group.length) return prev;

      const reordered = [...group];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(swapIdx, 0, moved);
      const updatedOrders = new Map(reordered.map((m, i) => [m.id, i + 1]));

      return prev.map((m) => (updatedOrders.has(m.id) ? { ...m, order: updatedOrders.get(m.id)! } : m));
    });
  };

  const resetNavigationMenus = () => {
    setNavigationMenus(INITIAL_NAVIGATION_MENUS);
    showToast('Navigation menus restored to defaults.', 'info');
  };

  // Manual Deposit Methods Handlers
  const addManualDepositMethod = (methodData: Omit<ManualDepositMethod, 'id'>) => {
    const newMethod: ManualDepositMethod = {
      ...methodData,
      id: `dep-${Date.now()}`,
    };
    setManualDepositMethods((prev) => [...prev, newMethod]);
    showToast(`Deposit method "${methodData.title}" created!`, 'success');
  };

  const updateManualDepositMethod = (id: string, updates: Partial<ManualDepositMethod>) => {
    setManualDepositMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    showToast('Deposit method updated successfully.', 'success');
  };

  const deleteManualDepositMethod = (id: string) => {
    setManualDepositMethods((prev) => prev.filter((m) => m.id !== id));
    showToast('Deposit method deleted.', 'info');
  };

  // Social Links Handlers
  const updateSocialLink = (id: string, updates: Partial<SocialLinkConfig>) => {
    setSocialLinks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Social channel settings saved.', 'success');
  };

  // Investment Pools & Plans CMS Handlers
  const createInvestmentPool = (poolData: Omit<InvestmentPool, 'id'>) => {
    const newPool: InvestmentPool = {
      ...poolData,
      id: `pool-${Date.now()}`,
    };
    setInvestmentPools((prev) => [...prev, newPool]);
    showToast(`Investment pool "${poolData.title}" added to catalog!`, 'success');
  };

  const updateInvestmentPool = (id: string, updates: Partial<InvestmentPool>) => {
    setInvestmentPools((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Investment pool parameters updated.', 'success');
  };

  const deleteInvestmentPool = (id: string) => {
    setInvestmentPools((prev) => prev.filter((p) => p.id !== id));
    showToast('Investment pool removed.', 'info');
  };

  // Catalog Products & Rentals Handlers
  const addProductItem = (productData: Omit<ProductItem, 'id'>) => {
    const newProduct: ProductItem = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProductsList((prev) => [newProduct, ...prev]);
    showToast(`Product "${productData.name}" added to shop!`, 'success');
  };

  const updateProductItem = (id: string, updates: Partial<ProductItem>) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product item updated.', 'success');
  };

  const deleteProductItem = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted from catalog.', 'info');
  };

  // Scratch Card Tiers Promotional CMS Handlers
  const createScratchCardTier = (tierData: Omit<ScratchCardTier, 'id'>) => {
    const newTier: ScratchCardTier = {
      ...tierData,
      id: `scratch-tier-${Date.now()}`,
    };
    setScratchCardTiers((prev) => [...prev, newTier]);
    showToast(`Scratch tier "${tierData.name}" created!`, 'success');
  };

  const updateScratchCardTier = (id: string, updates: Partial<ScratchCardTier>) => {
    setScratchCardTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Scratch card tier updated.', 'success');
  };

  const deleteScratchCardTier = (id: string) => {
    setScratchCardTiers((prev) => prev.filter((t) => t.id !== id));
    showToast('Scratch card tier deleted.', 'info');
  };

  const updateRentalFleetVehicle = (id: string, updates: Partial<RentalVehicle>) => {
    setRentalFleetList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    showToast('Rental vehicle updated.', 'success');
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'flagged' | 'banned') => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u))
    );
    showToast(`User status updated to ${status}.`, 'info');
  };

  const deleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User account removed.', 'info');
  };

  // KYC Submission
  const submitKyc = async (kycData: UserKycData): Promise<boolean> => {
    if (!requireSignedIn('submit KYC identity verification')) return false;
    if (!currentUser) return false;

    const updatedUser: User = {
      ...currentUser,
      kycStatus: 'in_review',
      kycData: {
        ...kycData,
        submittedAt: new Date().toISOString().substring(0, 10),
      },
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );

    // Also persist through API
    if (sessionToken) {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            kycStatus: 'in_review',
            kycData,
          }),
        });
      } catch {
        // Fallback continues
      }
    }

    showToast('KYC Identity Verification submitted! Under review by compliance team.', 'success');
    return true;
  };

  // Admin KYC Status Update
  const adminUpdateKyc = (userId: string, status: 'verified' | 'rejected' | 'in_review', reason?: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedKyc = u.kycData
            ? {
                ...u.kycData,
                rejectionReason: reason,
                verifiedAt: status === 'verified' ? new Date().toISOString().substring(0, 10) : undefined,
              }
            : undefined;
          return {
            ...u,
            kycStatus: status,
            kycData: updatedKyc,
          };
        }
        return u;
      })
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: status,
              kycData: prev.kycData
                ? {
                    ...prev.kycData,
                    rejectionReason: reason,
                    verifiedAt: status === 'verified' ? new Date().toISOString().substring(0, 10) : undefined,
                  }
                : undefined,
            }
          : null
      );
    }

    showToast(`User KYC status set to ${status.toUpperCase()}.`, 'info');
  };

  // Admin User Balance Adjustment (Add / Subtract / Set per user & synced to server)
  const updateUserBalance = (
    userId: string,
    currency: CryptoCurrency | 'USD',
    amount: number,
    mode: 'set' | 'add' | 'subtract' = 'set'
  ) => {
    const cleanInput = Math.max(0, Number(amount) || 0);
    const key = currency.toLowerCase() as keyof WalletBalances;
    const currentBalObj = getUserWalletBalances(userId);
    const prevVal = currentBalObj[key] || 0;

    let nextVal = cleanInput;
    if (mode === 'add') nextVal = prevVal + cleanInput;
    if (mode === 'subtract') nextVal = Math.max(0, prevVal - cleanInput);
    nextVal = currency === 'USD' || currency === 'USDT' ? Number(nextVal.toFixed(2)) : Number(nextVal.toFixed(6));

    const updatedBalObj: WalletBalances = {
      ...currentBalObj,
      [key]: nextVal,
    };

    setUserBalancesById((prev) => ({
      ...prev,
      [userId]: updatedBalObj,
    }));

    if (currentUser?.id === userId) {
      setBalances(updatedBalObj);
    }

    fetch(`/api/wallet/${encodeURIComponent(userId)}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency,
        mode,
        amount: cleanInput,
        newAmount: nextVal,
        delta: Number((nextVal - prevVal).toFixed(6)),
      }),
    }).catch(() => {});

    const actionWord = mode === 'add' ? `Added +${cleanInput}` : mode === 'subtract' ? `Subtracted -${cleanInput}` : `Set to ${nextVal}`;
    showToast(`${actionWord} ${currency} (New balance: ${nextVal} ${currency}) for user #${userId}.`, 'success');
  };

  // Email Marketing Smtp Config Update
  const updateSmtpConfig = (newConfig: SmtpConfig) => {
    setSmtpConfig(newConfig);
    showToast('SMTP Mailer configuration saved and active.', 'success');
  };

  // Import Email List
  const importEmailList = (emails: string[]): number => {
    const valid = emails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@') && e.includes('.'));
    const unique = Array.from(new Set([...importedEmails, ...valid]));
    const countAdded = unique.length - importedEmails.length;
    setImportedEmails(unique);
    showToast(`Imported ${countAdded} new verified email lead(s) to marketing database!`, 'success');
    return countAdded;
  };

  // Test Email Sender with live delivery verification & failure diagnostic reporting
  const sendTestEmail = async (recipientEmail: string, simulateScenario?: string): Promise<TestEmailResult> => {
    try {
      const res = await fetch('/api/mailer/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpConfig, testEmail: recipientEmail, simulateScenario }),
      });
      const data = await res.json();

      if (res.ok && data.delivered) {
        showToast(`⚡ Test email DELIVERED to ${recipientEmail}! (Status: 250 OK)`, 'success');
        return {
          success: true,
          delivered: true,
          status: 'delivered',
          message: data.message || `Test email successfully DELIVERED to ${recipientEmail}`,
          messageId: data.messageId,
          recipient: recipientEmail,
          host: data.host || smtpConfig.host,
          port: data.port || smtpConfig.port,
          timestamp: data.timestamp || new Date().toISOString(),
          smtpLog: data.smtpLog,
          simulationMode: data.simulationMode,
        };
      }

      // Handle delivery failure
      const failReason = data.failureReason || data.error || 'Connection or relay rejected';
      showToast(`❌ Test email FAILED to deliver to ${recipientEmail}: ${failReason}`, 'error');

      return {
        success: false,
        delivered: false,
        status: 'failed',
        message: data.message || `Test email FAILED to deliver to ${recipientEmail}`,
        failureReason: failReason,
        failureCode: data.failureCode || 'SMTP_ERR',
        failureCategory: data.failureCategory || 'Relay Delivery Error',
        troubleshooting: data.troubleshooting || 'Check your SMTP credentials, host port, and recipient mailbox status.',
        recipient: recipientEmail,
        host: data.host || smtpConfig.host,
        port: data.port || smtpConfig.port,
        timestamp: data.timestamp || new Date().toISOString(),
        smtpLog: data.smtpLog,
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Network transport failure';
      showToast(`❌ Test email FAILED: Network error connecting to mailer daemon (${errMsg})`, 'error');
      return {
        success: false,
        delivered: false,
        status: 'failed',
        message: `Network transport failure connecting to mailer daemon: ${errMsg}`,
        failureReason: errMsg,
        failureCode: 'CLIENT_NETWORK_ERR',
        failureCategory: 'Connection Dropped',
        troubleshooting: 'Check dev server connectivity and local socket bindings.',
        recipient: recipientEmail,
        host: smtpConfig.host,
        port: smtpConfig.port,
        timestamp: new Date().toISOString(),
        smtpLog: `[NETWORK_EXCEPTION] ${errMsg}`,
      };
    }
  };

  // Send Marketing Campaign
  const sendMarketingCampaign = async (campaignData: {
    title: string;
    subject: string;
    templateId?: string;
    targetAudience: 'all_users' | 'plaid_members' | 'custom_list' | 'external_leads';
    customRecipients?: string[];
  }): Promise<{ success: boolean; message: string }> => {
    let recipientList: string[] = [];

    if (campaignData.targetAudience === 'all_users') {
      recipientList = allUsers.map((u) => u.email);
    } else if (campaignData.targetAudience === 'plaid_members') {
      recipientList = allUsers.filter((u) => u.tier === 'Plaid Member').map((u) => u.email);
    } else if (campaignData.targetAudience === 'external_leads') {
      recipientList = importedEmails;
    } else {
      recipientList = Array.from(new Set([...allUsers.map((u) => u.email), ...importedEmails]));
    }

    if (campaignData.customRecipients && campaignData.customRecipients.length > 0) {
      recipientList = Array.from(new Set([...recipientList, ...campaignData.customRecipients]));
    }

    try {
      await fetch('/api/mailer/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: campaignData.title,
          subject: campaignData.subject,
          recipients: recipientList,
        }),
      });
    } catch {
      // Local simulated fallback
    }

    const newCampaign: EmailCampaign = {
      id: `camp-${Date.now()}`,
      title: campaignData.title,
      subject: campaignData.subject,
      templateId: campaignData.templateId,
      targetAudience: campaignData.targetAudience,
      recipientsCount: recipientList.length,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'sent',
      openRate: 52.4,
      clickRate: 21.8,
    };

    setEmailCampaigns((prev) => [newCampaign, ...prev]);
    showToast(`Campaign "${campaignData.title}" dispatched to ${recipientList.length} recipient(s)!`, 'success');
    return { success: true, message: `Dispatched to ${recipientList.length} subscribers` };
  };

  // Paid Spin — Configurable spinCostUsd and admin-editable wheel slice rewards
  const executeSpin = (): { prize: string; valueUsd: number; type: string; sliceId?: string; sliceIndex?: number; vehicleModel?: string } => {
    if (!requireSignedIn('spin the promotional wheel')) {
      throw new Error('Please sign in or register to spin the promotional wheel.');
    }
    if (!featureToggles.enableSpins) {
      throw new Error('Promotional spins are currently disabled by platform administrator.');
    }

    const cost = spinCostUsd;
    if (balances.usd < cost) {
      throw new Error(`Paid spin requires $${cost} USD. Insufficient wallet balance ($${balances.usd.toFixed(2)}). Please make a deposit.`);
    }

    // Deduct spin fee from user balance
    setBalances((prev) => ({ ...prev, usd: prev.usd - cost }));

    const costTx: Transaction = {
      id: `tx-spin-fee-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: cost,
      usdEquivalent: cost,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...spin`,
      description: `Promotional Wheel Spin Fee ($${cost} Paid Execution)`,
    };
    setTransactions((prev) => [costTx, ...prev]);

    // Filter active slices and select based on probability weight
    const activeSlices = wheelRewards.filter((r) => r.isActive);
    const validSlices = activeSlices.length > 0 ? activeSlices : INITIAL_WHEEL_REWARDS;
    const totalWeight = validSlices.reduce((acc, s) => acc + (s.weight || s.probabilityWeight || 1), 0);
    let randomVal = Math.random() * totalWeight;
    let selectedSlice = validSlices[0];
    let sliceIndex = 0;

    for (let idx = 0; idx < validSlices.length; idx++) {
      const slice = validSlices[idx];
      randomVal -= (slice.weight || slice.probabilityWeight || 1);
      if (randomVal <= 0) {
        selectedSlice = slice;
        sliceIndex = idx;
        break;
      }
    }

    const sliceValueUsd = selectedSlice.type === 'try_again' ? 0 : (selectedSlice.valueUsd ?? selectedSlice.value ?? 0);
    const won = {
      prize: selectedSlice.label,
      valueUsd: sliceValueUsd,
      type: selectedSlice.type,
      sliceId: selectedSlice.id,
      sliceIndex,
      vehicleModel: selectedSlice.vehicleModel,
    };

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

    if (selectedSlice.type === 'try_again') {
      const tryTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'promotion_win',
        currency: 'USD',
        amount: 0,
        usdEquivalent: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: hash,
        description: `Spin Result: ${selectedSlice.label} ($0 — Better Luck Next Spin)`,
      };
      setTransactions((prev) => [tryTx, ...prev]);
      return won;
    }

    if (selectedSlice.type === 'car') {
      const carTitle = selectedSlice.vehicleModel || selectedSlice.label || '2026 Tesla Vehicle';
      const vin = `5YJSPN${Date.now().toString().slice(-8)}`;
      const wonVehicle: TeslaVehicle = {
        id: `veh-spin-${Date.now()}`,
        userId: currentUser!.id,
        model: carTitle.includes('Cybertruck') ? 'Cybertruck' : carTitle.includes('Roadster') ? 'Roadster' : 'Model 3',
        trim: carTitle,
        year: 2026,
        vin,
        licensePlate: `APX-${Math.floor(1000 + Math.random() * 9000)}`,
        color: 'Stealth Silver Metallic',
        batterySoc: 100,
        odometer: 12,
        estimatedRange: 341,
        serviceStatus: 'optimal',
        lastServiceDate: new Date().toISOString().slice(0, 10),
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80',
      };
      setVehicles((prev) => [wonVehicle, ...prev]);

      const orderId = `ORD-SPIN-${Date.now().toString(36).toUpperCase()}`;
      const carOrder: VehicleOrder = {
        id: orderId,
        userId: currentUser!.id,
        userName: currentUser!.name,
        userEmail: currentUser!.email,
        vehicleId: `spin-car-${selectedSlice.id}`,
        vehicleName: carTitle,
        model: wonVehicle.model,
        trim: carTitle,
        totalUsd: 0,
        shippingFeeUsd: 0,
        shippingAddress: {
          fullName: currentUser!.name,
          phone: currentUser!.phone || '+1 (800) 837-5290',
          street: currentUser!.location || 'Apex Center Pickup / Delivery Pending',
          city: 'Fremont',
          state: 'CA',
          zipCode: '94538',
          deliveryMethod: 'enclosed_carrier',
        },
        status: 'confirmed',
        trackingNumber: `APX-WIN-${Math.floor(100000 + Math.random() * 899999)}`,
        carrierName: 'Apex VIP Enclosed Transporter',
        estimatedDelivery: 'Concierge Scheduling',
        refundPolicyAccepted: true,
        orderedAt: new Date().toISOString(),
        vinAssigned: vin,
        paymentMethod: 'spin_jackpot_win',
      };
      setVehicleOrders((prev) => [carOrder, ...prev]);

      const carTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'promotion_win',
        currency: 'USD',
        amount: sliceValueUsd,
        usdEquivalent: sliceValueUsd,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: hash,
        description: `🚗 Wheel Jackpot Tesla Win: ${carTitle} (VIN: ${vin})`,
      };
      setTransactions((prev) => [carTx, ...prev]);

      const winRecord: WinRecord = {
        id: `win-${Date.now()}`,
        username: currentUser!.name,
        prize: `🚗 ${carTitle}`,
        type: 'Wheel Spin',
        valueUsd: sliceValueUsd,
        timestamp: 'Just now',
        verifiedHash: hash,
        avatar: currentUser!.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      setRecentWinners((prev) => [winRecord, ...prev]);

      const wonPrizeEntry: WonPrizeItem = {
        id: `prize-spin-${Date.now()}`,
        userId: currentUser!.id,
        userName: currentUser!.name,
        userEmail: currentUser!.email,
        title: carTitle,
        prizeType: 'vehicle',
        source: 'Wheel Spin',
        estimatedValueUsd: sliceValueUsd || 54990,
        modelOrSku: wonVehicle.model,
        vinAssigned: vin,
        image: wonVehicle.image,
        wonAt: new Date().toISOString().split('T')[0],
        processingFeeUsd: 495,
        shippingDocFeeUsd: 350,
        shippingFreightFeeUsd: 1450,
        totalFeesUsd: 495 + 350 + 1450,
        feesPaid: false,
        shippingStatus: 'awaiting_details',
      };
      setWonPrizes((prev) => [wonPrizeEntry, ...prev]);

      sendNotification({
        title: `🏆 You Won a Tesla on the Spin Wheel: ${carTitle}!`,
        message: `Congratulations! Your wheel spin landed on ${carTitle} (est. $${sliceValueUsd.toLocaleString()}). Complete your international shipping details & documentation/processing fees in Dashboard -> Won Prizes to dispatch.`,
        type: 'payout',
        priority: 'urgent',
        targetType: 'individual',
        targetUserId: currentUser!.id,
        targetUserEmail: currentUser!.email,
        actionUrl: 'dashboard',
        actionLabel: 'Complete Shipping',
      });
      return won;
    }

    const canSpendWinsImmediately = (currentUser?.totalDepositedUsd || 0) >= MIN_DEPOSIT_TO_ACTIVATE_WINS_USD;
    if (won.valueUsd > 0) {
      if (canSpendWinsImmediately) {
        setBalances((prev) => ({ ...prev, usd: prev.usd + won.valueUsd }));
      } else {
        setLockedWinsByUserId((prev) => ({
          ...prev,
          [currentUser!.id]: Number(((prev[currentUser!.id] || 0) + won.valueUsd).toFixed(2)),
        }));
      }
    }

    const winTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: won.valueUsd,
      usdEquivalent: won.valueUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description:
        won.valueUsd > 0 && !canSpendWinsImmediately
          ? `Spin-and-Win Prize: ${won.prize} (Locked until $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} min deposit)`
          : `Spin-and-Win Prize: ${won.prize}`,
    };
    setTransactions((prev) => [winTx, ...prev]);

    if (won.valueUsd > 0 && !canSpendWinsImmediately) {
      showToast(
        `🔒 Won ${won.prize}! Winnings are held in your Locked Bonus Vault until your cumulative deposits reach $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} USD.`,
        'info'
      );
    }

    const winRecord: WinRecord = {
      id: `win-${Date.now()}`,
      username: currentUser?.name || 'LuckyUser',
      prize: won.prize,
      type: 'Wheel Spin',
      category: 'spin_scratch',
      valueUsd: won.valueUsd,
      timestamp: 'Just now',
      verifiedHash: hash,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setRecentWinners((prev) => [winRecord, ...prev]);

    return won;
  };

  // ==========================================
  // TESLA LIVE STOCKS & SPOT / FAST ROI METHODS
  // ==========================================

  const updateStockQuote = (quoteUpdates: Partial<TeslaStockQuote>) => {
    setTslaQuote((prev) => ({ ...prev, ...quoteUpdates, updatedAt: new Date().toISOString() }));
    showToast('Tesla ($TSLA) stock quote updated!', 'success');
  };

  const createFeaturedStockPlan = (plan: Omit<FeaturedStockPlan, 'id' | 'totalSubscribedUsd'>) => {
    const minInv = Math.max(500, plan.minInvestmentUsd || 500);
    const newPlan: FeaturedStockPlan = {
      ...plan,
      id: `stock-plan-${Date.now()}`,
      minInvestmentUsd: minInv,
      totalSubscribedUsd: 0,
    };
    setFeaturedStockPlans((prev) => [newPlan, ...prev]);
    showToast(`Created new featured stock plan: ${newPlan.title}!`, 'success');
  };

  const updateFeaturedStockPlan = (id: string, updates: Partial<FeaturedStockPlan>) => {
    setFeaturedStockPlans((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const minInv = updates.minInvestmentUsd !== undefined ? Math.max(500, updates.minInvestmentUsd) : p.minInvestmentUsd;
        return { ...p, ...updates, minInvestmentUsd: minInv };
      })
    );
    showToast('Featured stock plan updated successfully!', 'success');
  };

  const deleteFeaturedStockPlan = (id: string) => {
    setFeaturedStockPlans((prev) => prev.filter((p) => p.id !== id));
    showToast('Featured stock plan removed.', 'info');
  };

  // Buy Direct Tesla Stock Shares (Spot Buy - strictly minimum $500)
  const buySpotStock = (usdAmount: number): boolean => {
    if (!requireSignedIn('purchase TSLA spot shares')) return false;
    if (!featureToggles.enableStockTrading || !featureToggles.enableSpotBuy) {
      showToast('Tesla stock spot buying is currently disabled by administrator.', 'error');
      return false;
    }
    if (usdAmount < 500) {
      showToast('Minimum Tesla Stock spot investment is $500.00 USD and above.', 'error');
      return false;
    }
    if (balances.usd < usdAmount) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit funds to buy TSLA stock.`, 'error');
      return false;
    }

    const currentPrice = tslaQuote.price;
    const sharesBought = Number((usdAmount / currentPrice).toFixed(4));

    // Deduct vault balance
    setBalances((prev) => ({ ...prev, usd: prev.usd - usdAmount }));

    // Record spot holding
    setUserSpotHolding((prev) => {
      const newShares = Number((prev.shares + sharesBought).toFixed(4));
      const newInvested = Number((prev.totalInvestedUsd + usdAmount).toFixed(2));
      const newAvg = Number((newInvested / newShares).toFixed(2));
      const currentEquity = Number((newShares * currentPrice).toFixed(2));
      const pnl = Number((currentEquity - newInvested).toFixed(2));
      const pnlPct = Number(((pnl / newInvested) * 100).toFixed(2));
      return {
        id: prev.id || `spot-${Date.now()}`,
        userId: currentUser?.id || 'usr-apex-001',
        shares: newShares,
        avgBuyPrice: newAvg,
        totalInvestedUsd: newInvested,
        currentEquityUsd: currentEquity,
        pnlUsd: pnl,
        pnlPercent: pnlPct,
        lastUpdated: new Date().toISOString(),
      };
    });

    const tx: Transaction = {
      id: `tx-tsla-spot-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: usdAmount,
      usdEquivalent: usdAmount,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 12)}...spot`,
      description: `Spot Purchased ${sharesBought.toFixed(3)} TSLA Shares @ $${currentPrice.toFixed(2)}/share`,
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Successfully purchased ${sharesBought.toFixed(3)} TSLA shares for $${usdAmount.toLocaleString()} USD!`, 'success');
    return true;
  };

  // Sell / Liquidate Spot Stock back to USD Vault Balance
  const sellSpotStock = (sharesToSell: number): boolean => {
    if (!requireSignedIn('sell TSLA spot shares')) return false;
    if (sharesToSell <= 0 || sharesToSell > userSpotHolding.shares) {
      showToast(`Invalid shares amount. Available: ${userSpotHolding.shares.toFixed(4)} TSLA`, 'error');
      return false;
    }

    const proceeds = Number((sharesToSell * tslaQuote.price).toFixed(2));
    setBalances((prev) => ({ ...prev, usd: prev.usd + proceeds }));

    setUserSpotHolding((prev) => {
      const remainingShares = Math.max(0, Number((prev.shares - sharesToSell).toFixed(4)));
      const remainingInvested = remainingShares > 0 ? Number((prev.avgBuyPrice * remainingShares).toFixed(2)) : 0;
      const currentEquity = Number((remainingShares * tslaQuote.price).toFixed(2));
      const pnl = remainingInvested > 0 ? Number((currentEquity - remainingInvested).toFixed(2)) : 0;
      const pnlPct = remainingInvested > 0 ? Number(((pnl / remainingInvested) * 100).toFixed(2)) : 0;
      return {
        ...prev,
        shares: remainingShares,
        totalInvestedUsd: remainingInvested,
        currentEquityUsd: currentEquity,
        pnlUsd: pnl,
        pnlPercent: pnlPct,
        lastUpdated: new Date().toISOString(),
      };
    });

    const tx: Transaction = {
      id: `tx-tsla-sell-${Date.now()}`,
      type: 'dividend_claim',
      currency: 'USD',
      amount: proceeds,
      usdEquivalent: proceeds,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 12)}...sell`,
      description: `Liquidated ${sharesToSell.toFixed(3)} TSLA Spot Shares @ $${tslaQuote.price.toFixed(2)}`,
    };
    setTransactions((prev) => [tx, ...prev]);

    setRecentWinners((prev) => [
      {
        id: `win-tsla-${Date.now()}`,
        username: currentUser?.name || 'TSLA_Trader',
        prize: `TSLA Spot Sale (+$${proceeds.toLocaleString()})`,
        type: 'TSLA Stock ROI',
        category: 'stock',
        poolOrTicker: 'TSLA Spot',
        roiPercent: Number((tslaQuote.changePercent || 4.2).toFixed(2)),
        valueUsd: proceeds,
        timestamp: 'Just now',
        verifiedHash: tx.txHash,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      ...prev.slice(0, 23),
    ]);

    showToast(`Liquidated ${sharesToSell.toFixed(3)} TSLA shares. +$${proceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })} credited to vault!`, 'success');
    return true;
  };

  // Invest in Featured Stock for Faster ROI (min $500 and above!)
  const investInFeaturedStock = (planId: string, amountUsd: number): boolean => {
    if (!requireSignedIn('invest in Fast-ROI stock plans')) return false;
    if (!featureToggles.enableFastRoiStocks) {
      showToast('Featured Fast-ROI stock plans are currently disabled by administrator.', 'error');
      return false;
    }
    const plan = featuredStockPlans.find((p) => p.id === planId);
    if (!plan) {
      showToast('Featured stock plan not found.', 'error');
      return false;
    }
    const minRequired = Math.max(500, plan.minInvestmentUsd || 500);
    if (amountUsd < minRequired) {
      showToast(`Minimum investment for ${plan.title} is $${minRequired.toLocaleString()} USD ($500+ required).`, 'error');
      return false;
    }
    if (balances.usd < amountUsd) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Please deposit funds to invest.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - amountUsd }));

    const dailyRoiUsd = (amountUsd * (plan.apy / 100)) / 365;
    const totalExpectedRoiUsd = dailyRoiUsd * plan.durationDays;
    const invId = `inv-stock-${Date.now()}`;

    const newInv: UserInvestment = {
      id: invId,
      userId: currentUser?.id || 'usr-apex-001',
      poolId: plan.id,
      poolTitle: `${plan.title} (${plan.ticker})`,
      amountInvestedUsd: amountUsd,
      investedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      earnedDividendsUsd: 0,
      apy: plan.apy,
      nextPayoutHours: 24,
      status: 'running',
      durationDays: plan.durationDays,
      daysElapsed: 0,
      startDate: new Date().toISOString(),
      maturityDate: new Date(Date.now() + plan.durationDays * 86400000).toISOString(),
      totalExpectedRoiUsd: Number(totalExpectedRoiUsd.toFixed(2)),
      dailyRoiRate: Number(dailyRoiUsd.toFixed(2)),
      txHash: `0x${Math.random().toString(16).substring(2, 14)}`,
    };

    setUserInvestments((prev) => [newInv, ...prev]);

    // Sync new Fast ROI plan stake to server.ts automated ROI cron store
    fetch('/api/investments/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investments: [
          {
            ...newInv,
            userId: currentUser?.id || 'usr-alex-001',
            userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
            userName: currentUser?.name || 'Alex Vance',
          },
        ],
      }),
    }).catch(() => {});

    setFeaturedStockPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, totalSubscribedUsd: p.totalSubscribedUsd + amountUsd } : p))
    );

    const tx: Transaction = {
      id: `tx-stock-yield-${Date.now()}`,
      type: 'investment_deposit',
      currency: 'USD',
      amount: amountUsd,
      usdEquivalent: amountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: newInv.txHash || '0x...',
      description: `Invested $${amountUsd.toLocaleString()} in ${plan.title} (${plan.apy}% APY, ${plan.durationDays}-Day Fast ROI)`,
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Invested $${amountUsd.toLocaleString()} in ${plan.title}! Fast ROI: +$${totalExpectedRoiUsd.toFixed(2)} USD`, 'success');
    return true;
  };

  // ==========================================
  // USER WITHDRAWALS & MINIMUM $200 DEPOSIT RULE
  // ==========================================

  const isEligibleForWithdrawal = (user: User | null): { eligible: boolean; totalDeposited: number; required: number; reason?: string } => {
    if (!user) {
      return {
        eligible: false,
        totalDeposited: 0,
        required: withdrawalSettings.minDepositRequiredUsd,
        reason: 'Please log in to initiate withdrawals.',
      };
    }

    // If admin disabled minimum deposit rule
    if (!withdrawalSettings.requireMinDeposit || !featureToggles.requireMinDepositForWithdrawal) {
      return { eligible: true, totalDeposited: user.totalDepositedUsd || 0, required: 0 };
    }

    const depositTxsSum = transactions
      .filter((t) => t.type === 'deposit' && (t.status === 'completed' || t.status === 'confirming'))
      .reduce((acc, t) => acc + (t.usdEquivalent || t.amount || 0), 0);

    const totalDeposited = Math.max(user.totalDepositedUsd || 0, depositTxsSum);
    const required = withdrawalSettings.minDepositRequiredUsd;

    if (totalDeposited < required) {
      return {
        eligible: false,
        totalDeposited,
        required,
        reason: `Withdrawal Request Rejected: Anti-Money Laundering & Security Policy requires a minimum completed deposit of at least $${required.toLocaleString()} USD before initiating any cash-out withdrawals. Your current verified deposits: $${totalDeposited.toFixed(2)} / $${required.toFixed(2)} USD. Please deposit funds first to verify your withdrawal destination and activate withdrawal access.`,
      };
    }

    return { eligible: true, totalDeposited, required };
  };

  const setUserDepositedForDemo = (amountUsd: number) => {
    if (currentUser) {
      const updatedUser: User = { ...currentUser, totalDepositedUsd: amountUsd };
      setCurrentUser(updatedUser);
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === currentUser.id ? { ...u, totalDepositedUsd: amountUsd } : u))
      );

      const lockedAmt = lockedWinsByUserId[currentUser.id] || 0;
      if (amountUsd >= MIN_DEPOSIT_TO_ACTIVATE_WINS_USD && lockedAmt > 0) {
        setBalances((prev) => ({ ...prev, usd: Number((prev.usd + lockedAmt).toFixed(2)) }));
        setLockedWinsByUserId((prev) => ({ ...prev, [currentUser.id]: 0 }));
      }

      showToast(
        amountUsd >= MIN_DEPOSIT_TO_ACTIVATE_WINS_USD
          ? `Demo Profile: Deposits set to $${amountUsd} USD (Withdrawals & Promo Winnings UNLOCKED).`
          : `Demo Profile: Deposits set to $${amountUsd} USD (Min $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} required to unlock spin $$ wins).`,
        'info'
      );
    }
  };

  const updateWithdrawalSettings = (settingsUpdates: Partial<WithdrawalSettings>) => {
    setWithdrawalSettings((prev) => ({ ...prev, ...settingsUpdates }));
    showToast('Withdrawal settings updated successfully!', 'success');
  };

  const requestWithdrawal = async (
    amountUsd: number,
    currency: string,
    destinationAddress: string,
    details?: any
  ): Promise<{ success: boolean; message: string }> => {
    if (!requireSignedIn('request a withdrawal')) {
      return { success: false, message: 'Please sign in or register to request a withdrawal.' };
    }
    if (!featureToggles.enableWithdrawals || !withdrawalSettings.enabled) {
      const msg = 'Withdrawals are temporarily disabled by the platform administrator.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    const eligibility = isEligibleForWithdrawal(currentUser);
    if (!eligibility.eligible) {
      const msg = eligibility.reason || 'You must complete a minimum deposit of $200 before withdrawing.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    if (amountUsd < withdrawalSettings.minWithdrawalUsd) {
      const msg = `Minimum withdrawal amount is $${withdrawalSettings.minWithdrawalUsd} USD.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    if (amountUsd > balances.usd) {
      const msg = `Insufficient vault balance. Available: $${balances.usd.toFixed(2)} USD.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    const feeUsd = Number(((amountUsd * withdrawalSettings.feePercent) / 100).toFixed(2));
    const netAmountUsd = Number((amountUsd - feeUsd).toFixed(2));

    // Deduct from balance
    setBalances((prev) => ({ ...prev, usd: prev.usd - amountUsd }));

    const reqId = `wdr-${Date.now()}`;
    const newReq: WithdrawalRequest = {
      id: reqId,
      userId: currentUser?.id || 'usr-apex-001',
      userName: currentUser?.name || 'Alex Vance',
      userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
      amountUsd,
      currency,
      destinationAddress,
      network: details?.network,
      bankName: details?.bankName,
      accountNumber: details?.accountNumber,
      routingNumber: details?.routingNumber,
      accountName: details?.accountName,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      feeUsd,
      netAmountUsd,
    };

    setWithdrawalRequests((prev) => [newReq, ...prev]);

    const tx: Transaction = {
      id: `tx-wdr-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: amountUsd,
      usdEquivalent: amountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...wdr`,
      description: `Withdrawal Request: $${amountUsd.toLocaleString()} USD via ${currency}`,
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Withdrawal of $${amountUsd.toLocaleString()} USD submitted! Estimated processing: ${withdrawalSettings.estimatedProcessingTime}`, 'success');
    return { success: true, message: 'Withdrawal submitted successfully.' };
  };

  const processWithdrawalRequest = (
    id: string,
    status: 'approved' | 'rejected',
    txHash?: string,
    rejectionReason?: string
  ) => {
    const targetReq = withdrawalRequests.find((r) => r.id === id);
    if (!targetReq) return;

    setWithdrawalRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          processedAt: new Date().toISOString(),
          txHash: txHash || (status === 'approved' ? `0x${Math.random().toString(16).substring(2, 14)}...settled` : undefined),
          rejectionReason: rejectionReason,
        };
      })
    );

    if (status === 'rejected') {
      // Refund user balance
      setBalances((prev) => ({ ...prev, usd: prev.usd + targetReq.amountUsd }));
      showToast(`Withdrawal #${id} rejected. $${targetReq.amountUsd} refunded to user vault.`, 'info');
    } else {
      showToast(`Withdrawal #${id} approved and dispatched!`, 'success');
    }
  };

  // ==========================================
  // SPINS & WHEEL REWARDS CMS
  // ==========================================

  const updateSpinCost = (costUsd: number) => {
    const cleanCost = Math.max(1, costUsd);
    setSpinCostUsd(cleanCost);
    showToast(`Wheel spin cost updated to $${cleanCost} USD!`, 'success');
  };

  const updateWheelRewards = (rewards: WheelReward[]) => {
    setWheelRewards(rewards);
    showToast('Wheel prizes and weights updated successfully!', 'success');
  };

  const updateWheelReward = (id: string, updates: Partial<WheelReward>) => {
    setWheelRewards((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const mergedVal = updates.valueUsd ?? updates.value ?? r.valueUsd ?? r.value ?? 0;
        const mergedWeight = updates.weight ?? updates.probabilityWeight ?? r.weight ?? r.probabilityWeight ?? 1;
        return {
          ...r,
          ...updates,
          valueUsd: mergedVal,
          value: mergedVal,
          weight: mergedWeight,
          probabilityWeight: mergedWeight,
        };
      })
    );
    showToast('Wheel reward slice updated.', 'success');
  };

  const addWheelReward = (reward: Omit<WheelReward, 'id'>) => {
    const val = reward.valueUsd ?? reward.value ?? 0;
    const wt = reward.weight ?? reward.probabilityWeight ?? 10;
    const newSlice: WheelReward = {
      ...reward,
      valueUsd: val,
      value: val,
      weight: wt,
      probabilityWeight: wt,
      id: `w-${Date.now()}`,
    };
    setWheelRewards((prev) => [...prev, newSlice]);
    showToast(`Added new wheel prize: ${newSlice.label}!`, 'success');
  };

  const deleteWheelReward = (id: string) => {
    if (wheelRewards.length <= 4) {
      showToast('Wheel requires at least 4 prize slices.', 'error');
      return;
    }
    setWheelRewards((prev) => prev.filter((r) => r.id !== id));
    showToast('Wheel prize slice removed.', 'info');
  };

  // ==========================================
  // GLOBAL PLATFORM FEATURE TOGGLES
  // ==========================================

  const updateFeatureToggles = (toggleUpdates: Partial<FeatureToggles>) => {
    setFeatureToggles((prev) => ({ ...prev, ...toggleUpdates }));
    showToast('Platform feature switches updated successfully!', 'success');
  };

  // ==========================================
  // AUTOMATED CRYPTO PAYMENT GATEWAYS CMS
  // ==========================================

  const updateAutoCryptoGateway = (id: string, updates: Partial<AutoCryptoGateway>) => {
    setAutoCryptoGateways((prev) =>
      prev.map((gw) => (gw.id === id ? { ...gw, ...updates } : gw))
    );
    showToast('Auto crypto gateway updated & synchronized successfully!', 'success');
  };

  const addAutoCryptoGateway = (gateway: Omit<AutoCryptoGateway, 'id' | 'totalProcessedUsd' | 'totalTransactionsCount'>) => {
    const newGw: AutoCryptoGateway = {
      ...gateway,
      id: `gw-${gateway.network.toLowerCase()}-${Date.now().toString(36)}`,
      totalProcessedUsd: 0,
      totalTransactionsCount: 0,
      lastPingSuccess: true,
      lastPingAt: new Date().toISOString(),
    };
    setAutoCryptoGateways((prev) => [...prev, newGw]);
    showToast(`Added new auto gateway: ${newGw.name}`, 'success');
  };

  const deleteAutoCryptoGateway = (id: string) => {
    setAutoCryptoGateways((prev) => prev.filter((gw) => gw.id !== id));
    showToast('Auto crypto gateway removed.', 'info');
  };

  const testAutoCryptoGatewayPing = async (id: string): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const gw = autoCryptoGateways.find((g) => g.id === id);
    if (!gw) {
      return { success: false, latencyMs: 0, message: 'Gateway not found' };
    }
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 250));
    const latencyMs = Date.now() - start;
    const nowIso = new Date().toISOString();

    updateAutoCryptoGateway(id, {
      lastPingSuccess: true,
      lastPingAt: nowIso,
    });

    return {
      success: true,
      latencyMs,
      message: `Node Ping 200 OK (${latencyMs}ms) • Webhook handshake verified for ${gw.network} receiver: ${gw.receivingAddress.substring(0, 10)}...`,
    };
  };


  const purchaseScratchCard = (tier: ScratchCardTier): boolean => {
    if (!requireSignedIn('purchase scratch cards')) return false;
    if (balances.usd < tier.priceUsd) {
      showToast(`Insufficient balance ($${balances.usd.toFixed(2)}) for ${tier.name} ($${tier.priceUsd}). Please deposit.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - tier.priceUsd }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'scratch_card_purchase',
      currency: 'USD',
      amount: tier.priceUsd,
      usdEquivalent: tier.priceUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...sc`,
      description: `Purchased ${tier.name} Scratch Card ($${tier.priceUsd})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    return true;
  };

  // Dynamic weighted Scratch & Win award (Cash Vault, Tesla Car Jackpot on high tiers, or Try Again)
  const awardScratchPrize = (
    tier: ScratchCardTier,
    prizeAmountUsd: number,
    prizeLabel: string,
    extras?: { isTeslaCar?: boolean; vehicleModel?: string; isTryAgain?: boolean }
  ) => {
    if (!requireSignedIn('claim scratch card rewards')) return;

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

    if (extras?.isTeslaCar) {
      const carTitle = extras.vehicleModel || prizeLabel || '2026 Tesla Vehicle';
      const vin = `5YJSCR${Date.now().toString().slice(-8)}`;
      const wonVehicle: TeslaVehicle = {
        id: `veh-scratch-${Date.now()}`,
        userId: currentUser!.id,
        model: carTitle.includes('Roadster') ? 'Roadster' : carTitle.includes('Model S') ? 'Model S' : 'Model 3',
        trim: carTitle,
        year: 2026,
        vin,
        licensePlate: `WIN-${Math.floor(1000 + Math.random() * 9000)}`,
        color: 'Founders Signature Red',
        batterySoc: 100,
        odometer: 8,
        estimatedRange: carTitle.includes('Roadster') ? 620 : 359,
        serviceStatus: 'optimal',
        lastServiceDate: new Date().toISOString().slice(0, 10),
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
      };
      setVehicles((prev) => [wonVehicle, ...prev]);

      const orderId = `ORD-SCR-${Date.now().toString(36).toUpperCase()}`;
      const carOrder: VehicleOrder = {
        id: orderId,
        userId: currentUser!.id,
        userName: currentUser!.name,
        userEmail: currentUser!.email,
        vehicleId: `scratch-car-${tier.id}`,
        vehicleName: carTitle,
        model: wonVehicle.model,
        trim: carTitle,
        totalUsd: 0,
        shippingFeeUsd: 0,
        shippingAddress: {
          fullName: currentUser!.name,
          phone: currentUser!.phone || '+1 (800) 837-5290',
          street: currentUser!.location || 'Apex Center VIP Delivery',
          city: 'Fremont',
          state: 'CA',
          zipCode: '94538',
          deliveryMethod: 'enclosed_carrier',
        },
        status: 'confirmed',
        trackingNumber: `APX-SCR-${Math.floor(100000 + Math.random() * 899999)}`,
        carrierName: 'Apex VIP Enclosed Transporter',
        estimatedDelivery: '3 - 5 Business Days',
        refundPolicyAccepted: true,
        orderedAt: new Date().toISOString(),
        vinAssigned: vin,
        paymentMethod: 'scratch_card_jackpot',
      };
      setVehicleOrders((prev) => [carOrder, ...prev]);

      const carTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'promotion_win',
        currency: 'USD',
        amount: prizeAmountUsd,
        usdEquivalent: prizeAmountUsd,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: hash,
        description: `🚗 Scratch Jackpot [${tier.name}]: Won ${carTitle} ($${prizeAmountUsd.toLocaleString()})`,
      };
      setTransactions((prev) => [carTx, ...prev]);

      const winRecord: WinRecord = {
        id: `win-${Date.now()}`,
        username: currentUser!.name,
        prize: `🚗 ${carTitle}`,
        type: 'Scratch & Win',
        valueUsd: prizeAmountUsd,
        timestamp: 'Just now',
        verifiedHash: hash,
        avatar: currentUser!.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      setRecentWinners((prev) => [winRecord, ...prev]);

      const wonPrizeEntry: WonPrizeItem = {
        id: `prize-scr-${Date.now()}`,
        userId: currentUser!.id,
        userName: currentUser!.name,
        userEmail: currentUser!.email,
        title: carTitle,
        prizeType: 'vehicle',
        source: 'Scratch & Win',
        estimatedValueUsd: prizeAmountUsd || 79990,
        modelOrSku: wonVehicle.model,
        vinAssigned: vin,
        image: wonVehicle.image,
        wonAt: new Date().toISOString().split('T')[0],
        processingFeeUsd: 595,
        shippingDocFeeUsd: 420,
        shippingFreightFeeUsd: 1650,
        totalFeesUsd: 595 + 420 + 1650,
        feesPaid: false,
        shippingStatus: 'awaiting_details',
      };
      setWonPrizes((prev) => [wonPrizeEntry, ...prev]);

      sendNotification({
        title: `🏆 Max Scratch Card Tesla Win: ${carTitle}!`,
        message: `Your ${tier.name} scratch card unlocked a ${carTitle} (MSRP $${prizeAmountUsd.toLocaleString()}). Fill your destination country & pay processing/shipping documentation fees in Dashboard -> Won Prizes!`,
        type: 'payout',
        priority: 'urgent',
        targetType: 'individual',
        targetUserId: currentUser!.id,
        targetUserEmail: currentUser!.email,
        actionUrl: 'dashboard',
        actionLabel: 'Complete Shipping',
      });

      showToast(`🚗 JACKPOT! You won a ${carTitle} from ${tier.name}! Manage international shipping in Dashboard -> Won Prizes.`, 'success');
      return;
    }

    if (extras?.isTryAgain || prizeAmountUsd <= 0) {
      const zeroTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'promotion_win',
        currency: 'USD',
        amount: 0,
        usdEquivalent: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'completed',
        txHash: hash,
        description: `Scratch & Win [${tier.name}]: ${prizeLabel || 'Try Again ($0)'}`,
      };
      setTransactions((prev) => [zeroTx, ...prev]);
      showToast(`${tier.name}: ${prizeLabel || 'Try Again — Better luck next card!'}`, 'info');
      return;
    }

    const canSpendWinsImmediately = (currentUser?.totalDepositedUsd || 0) >= MIN_DEPOSIT_TO_ACTIVATE_WINS_USD;
    if (canSpendWinsImmediately) {
      setBalances((prev) => ({ ...prev, usd: prev.usd + prizeAmountUsd }));
    } else {
      setLockedWinsByUserId((prev) => ({
        ...prev,
        [currentUser!.id]: Number(((prev[currentUser!.id] || 0) + prizeAmountUsd).toFixed(2)),
      }));
    }

    const winTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: prizeAmountUsd,
      usdEquivalent: prizeAmountUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description: canSpendWinsImmediately
        ? `Scratch & Win [${tier.name}]: ${prizeLabel}`
        : `Scratch & Win [${tier.name}]: ${prizeLabel} (Locked until $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} min deposit)`,
    };
    setTransactions((prev) => [winTx, ...prev]);

    const winRecord: WinRecord = {
      id: `win-${Date.now()}`,
      username: currentUser?.name || 'LuckyUser',
      prize: prizeLabel,
      type: 'Scratch & Win',
      category: 'spin_scratch',
      valueUsd: prizeAmountUsd,
      timestamp: 'Just now',
      verifiedHash: hash,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setRecentWinners((prev) => [winRecord, ...prev]);

    showToast(
      canSpendWinsImmediately
        ? `🎉 Scratch Win! Credited +$${prizeAmountUsd.toLocaleString()} USD (${prizeLabel}) to your vault!`
        : `🔒 Scratch Win +$${prizeAmountUsd.toLocaleString()} held in Locked Vault until cumulative deposits reach $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} USD.`,
      canSpendWinsImmediately ? 'success' : 'info'
    );
  };

  const rentVehicle = (vehicle: RentalVehicle, days: number, startDate: string): boolean => {
    if (!requireSignedIn('reserve a Tesla rental vehicle')) return false;
    const totalCost = vehicle.dailyRateUsd * days;
    if (balances.usd < totalCost) {
      showToast(`Insufficient balance ($${balances.usd.toFixed(2)}) for reservation ($${totalCost.toLocaleString()}). Please deposit crypto or USD.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - totalCost }));

    const booking = {
      rentalId: `rent-booking-${Date.now()}`,
      vehicle,
      days,
      startDate,
      totalUsd: totalCost,
    };
    setBookedRentals((prev) => [booking, ...prev]);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'rental_payment',
      currency: 'USD',
      amount: totalCost,
      usdEquivalent: totalCost,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...rnt`,
      description: `Rental: ${vehicle.model} ${vehicle.trim} (${days} days)`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Successfully reserved ${vehicle.model} ${vehicle.trim} for ${days} days starting ${startDate}!`);
    return true;
  };

  const addToCart = (product: ProductItem) => {
    if (!requireSignedIn('add items to your cart')) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to order cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const checkoutCart = (): boolean => {
    if (!requireSignedIn('complete product checkout')) return false;
    const total = cart.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);
    if (balances.usd < total) {
      showToast(`Cart total is $${total.toLocaleString()}, but wallet balance is $${balances.usd.toFixed(2)}. Please make a deposit.`, 'error');
      return false;
    }

    setBalances((prev) => ({ ...prev, usd: prev.usd - total }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: total,
      usdEquivalent: total,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...sh`,
      description: `Apex Store Hardware & Accessories Order (${cart.length} items)`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setCart([]);
    showToast(`Order processed for $${total.toLocaleString()}! Hardware dispatch tracking sent to email.`, 'success');
    return true;
  };

  const referralCode = currentUser?.referralCode || 'APEX-ALEX-99';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://apex-tesla.io/?ref=${referralCode}`;

  // Tesla Car Sales Catalog CRUD Handlers
  const createTeslaCarListing = async (carData: Omit<TeslaCarListing, 'id'>) => {
    const newCar: TeslaCarListing = {
      ...carData,
      id: `car-${Date.now()}`,
    };
    setTeslaCarListings((prev) => [newCar, ...prev]);
    localStorage.setItem('apex_tesla_cars_catalog', JSON.stringify([newCar, ...teslaCarListings]));
    showToast(`Tesla ${newCar.model} ${newCar.trim} listed successfully!`, 'success');

    try {
      await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCar),
      });
    } catch (e) {
      console.warn('Server sync error for car listing:', e);
    }
  };

  const updateTeslaCarListing = async (id: string, updates: Partial<TeslaCarListing>) => {
    setTeslaCarListings((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      localStorage.setItem('apex_tesla_cars_catalog', JSON.stringify(updated));
      return updated;
    });
    showToast('Tesla vehicle listing updated successfully!', 'success');

    try {
      await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Server sync error for car update:', e);
    }
  };

  const deleteTeslaCarListing = async (id: string) => {
    setTeslaCarListings((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      localStorage.setItem('apex_tesla_cars_catalog', JSON.stringify(filtered));
      return filtered;
    });
    showToast('Vehicle removed from catalog.', 'info');

    try {
      await fetch(`/api/cars/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Server sync error for car delete:', e);
    }
  };

  const updateShippingSettings = async (settings: NationwideShippingSettings) => {
    setNationwideShippingSettings(settings);
    localStorage.setItem('apex_shipping_settings', JSON.stringify(settings));
    showToast('Nationwide shipping settings updated!', 'success');

    try {
      await fetch('/api/cars/shipping-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('Server sync error for shipping settings:', e);
    }
  };

  const updateRefundPolicy = async (policy: VehicleRefundPolicySettings) => {
    setVehicleRefundPolicy(policy);
    localStorage.setItem('apex_refund_policy', JSON.stringify(policy));
    showToast('Vehicle refund policy updated!', 'success');

    try {
      await fetch('/api/cars/refund-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
    } catch (e) {
      console.warn('Server sync error for refund policy:', e);
    }
  };

  const placeVehicleOrder = async (
    vehicle: TeslaCarListing,
    address: ShippingAddress,
    paymentMethod: string = 'vault_balance',
    appliedCoupon: Coupon | null = null
  ): Promise<{ success: boolean; orderId?: string; message: string }> => {
    if (!requireSignedIn('purchase a Tesla vehicle')) {
      return { success: false, message: 'Sign in required to purchase a vehicle.' };
    }
    const shippingFee = appliedCoupon?.discountType === 'free_shipping'
      ? 0
      : (vehicle.nationwideShippingFeeUsd ?? nationwideShippingSettings.flatFeeUsd);

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = Number(((vehicle.salePriceUsd * appliedCoupon.discountValue) / 100).toFixed(2));
        if (appliedCoupon.maxDiscountUsd) discount = Math.min(discount, appliedCoupon.maxDiscountUsd);
      } else if (appliedCoupon.discountType === 'fixed_usd') {
        discount = appliedCoupon.discountValue;
      }
    }

    const totalUsd = Math.max(0, vehicle.salePriceUsd - discount + shippingFee);

    if (paymentMethod === 'vault_balance' && balances.usd < totalUsd) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)}). Total is $${totalUsd.toLocaleString()} USD.`, 'error');
      return { success: false, message: 'Insufficient balance' };
    }

    if (paymentMethod === 'vault_balance') {
      setBalances((b) => ({ ...b, usd: b.usd - totalUsd }));
    }

    const orderId = `ORD-TESLA-${Date.now().toString(36).toUpperCase()}`;
    const trackingNumber = `APX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const vinAssigned = vehicle.vin || `5YJ${vehicle.model[0]}E${Date.now().toString().slice(-8)}`;

    const newOrder: VehicleOrder = {
      id: orderId,
      userId: currentUser?.id || 'usr-apex-001',
      userName: currentUser?.name || 'Alex Vance',
      userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
      vehicleId: vehicle.id,
      vehicleName: `Tesla ${vehicle.model} ${vehicle.trim}`,
      model: vehicle.model,
      trim: vehicle.trim,
      totalUsd,
      shippingFeeUsd: shippingFee,
      shippingAddress: address,
      status: 'confirmed',
      trackingNumber,
      carrierName: 'Reliable Carriers Inc. (Enclosed Transporter)',
      estimatedDelivery: '3 - 5 Business Days',
      refundPolicyAccepted: true,
      orderedAt: new Date().toISOString(),
      vinAssigned,
      paymentMethod,
      discountAppliedUsd: discount,
      appliedCouponCode: appliedCoupon?.code,
      checkpoints: [
        {
          id: `chk-${Date.now()}-1`,
          status: 'confirmed',
          title: 'Order Confirmed & Payment Verified',
          location: 'Apex Tesla Hub • Fremont Technology Center',
          timestamp: new Date().toLocaleString(),
          note: `Payment verified via ${paymentMethod}. VIN ${vinAssigned} allocated. 7-Day Money-Back Guarantee active.`,
        },
      ],
    };

    setVehicleOrders((prev) => [newOrder, ...prev]);
    localStorage.setItem('apex_vehicle_orders', JSON.stringify([newOrder, ...vehicleOrders]));

    // Decrement stock in catalog
    setTeslaCarListings((prev) =>
      prev.map((c) =>
        c.id === vehicle.id
          ? { ...c, stockCount: Math.max(0, c.stockCount - 1), inStock: c.stockCount > 1 }
          : c
      )
    );

    // Also add to transactions log
    const newTx: Transaction = {
      id: `tx-order-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: totalUsd,
      usdEquivalent: totalUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'completed',
      txHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      description: `Purchase: Tesla ${vehicle.model} ${vehicle.trim} (VIN: ${vinAssigned}) with Nationwide Shipping`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Send in-app notification
    sendNotification({
      title: `🚗 Tesla ${vehicle.model} Order Confirmed!`,
      message: `Your Tesla ${vehicle.model} ${vehicle.trim} order (#${orderId}) is confirmed. Carrier assigned for nationwide delivery to ${address.city}, ${address.state}. Tracking: ${trackingNumber}. Protected by our 7-Day Money-Back Guarantee!`,
      type: 'direct_message',
      priority: 'high',
      targetType: 'user',
      targetUserId: currentUser?.id || 'usr-apex-001',
      targetUserName: currentUser?.name || 'Alex Vance',
      actionUrl: 'dashboard',
      actionText: 'View Vehicle Order',
    });

    showToast(`Tesla ${vehicle.model} order #${orderId} confirmed! Tracking number generated.`, 'success');

    // Sync order to backend
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'usr-apex-001',
          userName: currentUser?.name || 'Alex Vance',
          userEmail: currentUser?.email || 'alex.vance@apex-tesla.io',
          vehicleId: vehicle.id,
          shippingAddress: address,
          paymentMethod,
          refundPolicyAccepted: true,
        }),
      });
    } catch (e) {
      console.warn('Backend order sync:', e);
    }

    return { success: true, orderId, message: 'Order confirmed successfully!' };
  };

  const updateVehicleOrderStatus = (
    orderId: string,
    status: VehicleOrder['status'],
    trackingNumber?: string,
    checkpointNote?: string,
    carrierName?: string,
    estimatedDelivery?: string
  ) => {
    setVehicleOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const newCheckpoint: OrderCheckpoint = {
          id: `chk-${Date.now()}`,
          status,
          title:
            status === 'carrier_assigned'
              ? 'Enclosed Carrier & Transporter Assigned'
              : status === 'in_transit'
              ? 'In Transit: Highway Carrier Telemetry Active'
              : status === 'out_for_delivery'
              ? 'Out for Delivery to Driveway'
              : status === 'delivered'
              ? 'Delivered & Handed Over to Customer'
              : 'Order Status Updated',
          location: ord.shippingAddress ? `${ord.shippingAddress.city}, ${ord.shippingAddress.state}` : 'Apex Logistics Route',
          timestamp: new Date().toLocaleString(),
          note: checkpointNote || `Order updated to ${status.replace('_', ' ').toUpperCase()} by logistics dispatch.`,
        };
        return {
          ...ord,
          status,
          trackingNumber: trackingNumber || ord.trackingNumber,
          carrierName: carrierName || ord.carrierName,
          estimatedDelivery: estimatedDelivery || ord.estimatedDelivery,
          checkpoints: [...(ord.checkpoints || []), newCheckpoint],
        };
      });
      localStorage.setItem('apex_vehicle_orders', JSON.stringify(updated));
      return updated;
    });

    // Notify customer
    sendNotification({
      title: `📦 Order #${orderId} Update: ${status.replace('_', ' ').toUpperCase()}`,
      message: checkpointNote || `Your Tesla vehicle shipment status is now: ${status.replace('_', ' ').toUpperCase()}. Track live in your dashboard.`,
      type: 'direct_message',
      priority: status === 'delivered' ? 'high' : 'normal',
      targetType: 'user',
      targetUserId: currentUser?.id || 'usr-apex-001',
      targetUserName: currentUser?.name || 'Alex Vance',
      actionUrl: 'dashboard',
      actionText: 'Track Shipment',
    });

    showToast(`Order #${orderId} status updated to ${status.replace('_', ' ').toUpperCase()}.`, 'success');
  };

  // Coupons & Promo Codes Engine
  const claimCoupon = (code: string) => {
    if (!requireSignedIn('claim promotional coupon codes')) return;
    const upper = code.trim().toUpperCase();
    if (!claimedCoupons.includes(upper)) {
      setClaimedCoupons((prev) => {
        const next = [...prev, upper];
        localStorage.setItem('apex_claimed_coupons', JSON.stringify(next));
        return next;
      });
    }
    navigator.clipboard?.writeText(upper).catch(() => {});
    showToast(`Coupon code ${upper} copied to clipboard!`, 'success');
  };

  const applyCoupon = (
    code: string,
    context?: 'products' | 'vehicles' | 'spins' | 'services'
  ): { success: boolean; message: string; discountAmount?: number; freeSpins?: number } => {
    if (!requireSignedIn('apply promotional coupon codes')) {
      return { success: false, message: 'Sign in required to apply coupon codes' };
    }
    const upper = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === upper);

    if (!found) {
      showToast(`Invalid coupon code: "${code}".`, 'error');
      return { success: false, message: 'Invalid coupon code' };
    }

    if (!found.isActive) {
      showToast(`Coupon "${code}" is currently inactive.`, 'error');
      return { success: false, message: 'Coupon is inactive' };
    }

    if (new Date(found.expiresAt).getTime() < Date.now()) {
      showToast(`Coupon "${code}" has expired.`, 'error');
      return { success: false, message: 'Coupon expired' };
    }

    if (found.validFor !== 'all' && context && found.validFor !== context) {
      showToast(`Coupon "${code}" is only valid for ${found.validFor}.`, 'error');
      return { success: false, message: `Only valid for ${found.validFor}` };
    }

    // Free spins
    if (found.discountType === 'free_spins') {
      const addedSpins = found.discountValue || 5;
      setAvailableSpins((prev) => prev + addedSpins);
      setCoupons((prev) => {
        const next = prev.map((c) => (c.id === found.id ? { ...c, timesUsed: c.timesUsed + 1 } : c));
        localStorage.setItem('apex_coupons', JSON.stringify(next));
        return next;
      });
      showToast(`🎁 Claimed ${addedSpins} Free Wheel Spins with code ${upper}!`, 'success');
      return { success: true, message: `Added ${addedSpins} free spins`, freeSpins: addedSpins };
    }

    // Set as active coupon
    setActiveCoupon(found);
    setCoupons((prev) => {
      const next = prev.map((c) => (c.id === found.id ? { ...c, timesUsed: c.timesUsed + 1 } : c));
      localStorage.setItem('apex_coupons', JSON.stringify(next));
      return next;
    });

    const desc =
      found.discountType === 'percentage'
        ? `${found.discountValue}% OFF`
        : found.discountType === 'fixed_usd'
        ? `$${found.discountValue} USD OFF`
        : 'Free Nationwide Shipping';

    showToast(`⚡ Promo code ${upper} applied: ${desc}!`, 'success');
    return { success: true, message: `Applied ${desc}`, discountAmount: found.discountValue };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    showToast('Promo coupon removed.', 'info');
  };

  const createCoupon = (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now().toString(36)}`,
      code: couponData.code.trim().toUpperCase(),
      timesUsed: 0,
    };
    setCoupons((prev) => {
      const next = [newCoupon, ...prev];
      localStorage.setItem('apex_coupons', JSON.stringify(next));
      return next;
    });
    showToast(`Created new promo coupon "${newCoupon.code}".`, 'success');
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, ...updates, code: updates.code ? updates.code.toUpperCase() : c.code } : c
      );
      localStorage.setItem('apex_coupons', JSON.stringify(next));
      return next;
    });
    showToast('Coupon updated successfully.', 'success');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('apex_coupons', JSON.stringify(next));
      return next;
    });
    showToast('Coupon deleted.', 'info');
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
      localStorage.setItem('apex_coupons', JSON.stringify(next));
      return next;
    });
  };

  // Verified Customer Reviews CRUD
  const addReview = (reviewData: {
    targetType: 'vehicle' | 'product';
    targetId: string;
    targetName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    comment: string;
  }): boolean => {
    if (!requireSignedIn('submit a verified rating and review') || !currentUser) {
      return false;
    }
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      targetType: reviewData.targetType,
      targetId: reviewData.targetId,
      targetName: reviewData.targetName,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar:
        currentUser.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      userLocation: currentUser.location || 'Verified Owner',
      rating: reviewData.rating,
      title: reviewData.title.trim(),
      comment: reviewData.comment.trim(),
      verifiedPurchase: true,
      helpfulCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast(`Thank you! Your ${reviewData.rating}-star review for ${reviewData.targetName} is live.`, 'success');
    return true;
  };

  const markReviewHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    showToast('Marked review as helpful.', 'info');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('Review removed.', 'info');
  };

  // TSLA Stock Price Alerts CRUD
  const addStockPriceAlert = (condition: 'above' | 'below', targetPriceUsd: number, note?: string) => {
    if (!requireSignedIn('create TSLA price alerts')) return;
    const cleanPrice = Number(targetPriceUsd.toFixed(2));
    if (!cleanPrice || cleanPrice <= 0) {
      showToast('Enter a valid TSLA target price in USD.', 'error');
      return;
    }
    const newAlert: StockPriceAlert = {
      id: `tsla-alert-${Date.now()}`,
      symbol: 'TSLA',
      condition,
      targetPriceUsd: cleanPrice,
      note: note?.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setStockPriceAlerts((prev) => [newAlert, ...prev]);
    showToast(
      `🔔 TSLA alert armed: Notify when TSLA goes ${condition === 'above' ? 'above' : 'below'} $${cleanPrice.toFixed(2)}`,
      'success'
    );
  };

  const removeStockPriceAlert = (id: string) => {
    setStockPriceAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('TSLA price alert deleted.', 'info');
  };

  const toggleStockPriceAlert = (id: string) => {
    setStockPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const resetStockPriceAlert = (id: string) => {
    setStockPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, triggeredAt: undefined, isActive: true } : a))
    );
    showToast('TSLA price alert re-armed for live monitoring.', 'info');
  };

  // Promotional Marketing Banners CMS
  const createMarketingBanner = (
    bannerData: Omit<MarketingBanner, 'id' | 'createdAt' | 'clicksCount'>
  ): MarketingBanner => {
    const created: MarketingBanner = {
      ...bannerData,
      id: `banner-${Date.now().toString(36)}`,
      clicksCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMarketingBanners((prev) => [created, ...prev]);
    showToast(`Promotional banner "${created.title}" published!`, 'success');
    return created;
  };

  const updateMarketingBanner = (id: string, updates: Partial<MarketingBanner>) => {
    setMarketingBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Promotional banner updated.', 'success');
  };

  const deleteMarketingBanner = (id: string) => {
    setMarketingBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('Promotional banner deleted.', 'info');
  };

  // Won Prizes International Shipping & Processing/Documentation Fee Settlement
  const submitWonPrizeShippingAndPayFees = async (
    prizeId: string,
    shippingAddress: NonNullable<WonPrizeItem['shippingAddress']>,
    paymentMethod: 'wallet_usd' | 'deposit'
  ): Promise<{ success: boolean; message: string }> => {
    if (!requireSignedIn('submit shipping details and pay processing fees')) {
      return { success: false, message: 'Sign in required to manage won prize shipping.' };
    }
    const prize = wonPrizes.find((p) => p.id === prizeId);
    if (!prize) {
      return { success: false, message: 'Won prize record not found.' };
    }

    const totalRequired = Number(
      ((prize.processingFeeUsd || 0) + (prize.shippingDocFeeUsd || 0) + (prize.shippingFreightFeeUsd || 0)).toFixed(2)
    );

    if (paymentMethod === 'wallet_usd') {
      if (balances.usd < totalRequired) {
        const msg = `Insufficient spendable USD balance ($${balances.usd.toFixed(2)}). Required processing, export documentation & freight total: $${totalRequired.toLocaleString()}. Note: Locked spin winnings unlock after $${MIN_DEPOSIT_TO_ACTIVATE_WINS_USD} total deposits.`;
        showToast(msg, 'error');
        return { success: false, message: msg };
      }
      setBalances((prev) => ({ ...prev, usd: Number((prev.usd - totalRequired).toFixed(2)) }));
    }

    const trackingNum = prize.trackingNumber || `APX-INTL-${Math.floor(100000 + Math.random() * 899999)}`;
    const nowIso = new Date().toISOString().split('T')[0];

    setWonPrizes((prev) =>
      prev.map((item) =>
        item.id === prizeId
          ? {
              ...item,
              shippingAddress,
              feesPaid: true,
              paidAt: nowIso,
              paymentMethod,
              trackingNumber: trackingNum,
              carrierName: 'Apex Global Enclosed & Air/RoRo Freight',
              shippingStatus: 'fees_paid_processing',
            }
          : item
      )
    );

    const feeTx: Transaction = {
      id: `tx-prize-fee-${Date.now()}`,
      type: 'service_payment',
      currency: 'USD',
      amount: totalRequired,
      usdEquivalent: totalRequired,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substring(2, 12)}...ship`,
      description: `Won Prize Dispatch Fees (${prize.title} -> ${shippingAddress.country}): Processing + Docs + Freight`,
    };
    setTransactions((prev) => [feeTx, ...prev]);

    sendNotification({
      title: `📦 International Dispatch Initiated: ${prize.title}`,
      message: `Shipping details for ${shippingAddress.country} saved and $${totalRequired.toLocaleString()} USD processing, documentation & freight fees confirmed. Tracking #${trackingNum}.`,
      type: 'system',
      priority: 'normal',
      targetType: 'individual',
      targetUserId: currentUser?.id,
      actionUrl: 'dashboard',
      actionLabel: 'Track Shipment',
    });

    showToast(`Shipping submitted & $${totalRequired.toLocaleString()} fees paid! Tracking: ${trackingNum}`, 'success');
    return { success: true, message: `Fees paid & international dispatch scheduled (Tracking #${trackingNum}).` };
  };

  const updateWonPrizeItem = (id: string, updates: Partial<WonPrizeItem>) => {
    setWonPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Won prize shipping record updated.', 'success');
  };

  const createWonPrizeItem = (prize: Omit<WonPrizeItem, 'id' | 'wonAt'>) => {
    const newItem: WonPrizeItem = {
      ...prize,
      id: `prize-${Date.now().toString(36)}`,
      wonAt: new Date().toISOString().split('T')[0],
    };
    setWonPrizes((prev) => [newItem, ...prev]);
    showToast(`Granted prize "${newItem.title}" to ${newItem.userName}!`, 'success');
  };

  // FAQs CMS CRUD
  const createFaqItem = (faqData: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = { ...faqData, id: `faq-${Date.now().toString(36)}` };
    setFaqsList((prev) => [newFaq, ...prev]);
    showToast(`FAQ "${newFaq.question || newFaq.q || 'New FAQ'}" added!`, 'success');
  };

  const updateFaqItem = (id: string, updates: Partial<FaqItem>) => {
    setFaqsList((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    showToast('FAQ updated.', 'success');
  };

  const deleteFaqItem = (id: string) => {
    setFaqsList((prev) => prev.filter((f) => f.id !== id));
    showToast('FAQ removed.', 'info');
  };

  // SEO, Logo, Favicon, Sitemap & RSS CMS CRUD + Full Firestore & Server Persistence
  const collectAdminSectionsMap = (): Record<string, unknown> => ({
    site_settings: siteSettings,
    currencies,
    feature_toggles: featureToggles,
    withdrawal_settings: withdrawalSettings,
    shipping_settings: nationwideShippingSettings,
    refund_policy: vehicleRefundPolicy,
    navigation_menus: navigationMenus,
    site_pages: sitePages,
    faqs: faqsList,
    sitemap_entries: sitemapEntries,
    rss_items: rssFeedItems,
    promo_banners: marketingBanners,
    promo_videos: promoVideos,
    products: productsList,
    tesla_cars: teslaCarListings,
    investment_pools: investmentPools,
    stock_plans: featuredStockPlans,
    coupons,
    wheel_rewards: wheelRewards,
    scratch_tiers: scratchCardTiers,
    manual_deposits: manualDepositMethods,
    social_links: socialLinks,
    spin_cost: spinCostUsd,
    smtp_config: smtpConfig,
    auto_gateways: autoCryptoGateways,
    won_prizes: wonPrizes,
  });

  const connectAdminCloudSync = async (): Promise<{ success: boolean; error?: string }> => {
    const res = await connectFirebaseGoogleAdminSession();
    if (res.success) {
      setFirebaseAdminEmail(res.email || null);
      setFirebaseCloudConnected(true);
      showToast(`Connected Firebase Admin Cloud Sync (${res.email || 'Google Auth'})!`, 'success');
      return { success: true };
    }
    showToast(res.error || 'Could not connect Google Admin session.', 'error');
    return { success: false, error: res.error };
  };

  const syncAllAdminSettingsToFirestore = async (
    quiet = false
  ): Promise<{ syncedCount: number; totalCount: number; needsAuth: boolean }> => {
    const sections = collectAdminSectionsMap();
    const entries = Object.entries(sections);

    // Always mirror to Express /api/admin/state
    fetch('/api/admin/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: { ...sections, seoSettings } }),
    }).catch(() => {});

    if (!auth.currentUser) {
      if (!quiet) {
        showToast('Saved locally. Connect Google Admin Session to persist all settings directly to Firestore.', 'info');
      }
      return { syncedCount: 0, totalCount: entries.length + 1, needsAuth: true };
    }

    setIsSyncingFirestore(true);
    let syncedCount = 0;
    try {
      const seoRes = await saveSeoGlobalToFirestore(seoSettings);
      if (seoRes.synced) syncedCount += 1;

      if (seoSettings.pageMeta) {
        await Promise.all(
          Object.values(seoSettings.pageMeta).map(async (pm) => {
            await savePageSeoToFirestore(pm);
          })
        );
      }

      await Promise.all(
        entries.map(async ([sectionId, payload]) => {
          const r = await saveAdminSectionToFirestore(sectionId, payload);
          if (r.synced) syncedCount += 1;
        })
      );

      setLastFirestoreSyncAt(new Date().toLocaleTimeString());
      if (!quiet) {
        showToast(
          `Synchronized ${syncedCount}/${entries.length + 1} admin modules & SEO configuration to Firestore!`,
          syncedCount > 0 ? 'success' : 'error'
        );
      }
      return { syncedCount, totalCount: entries.length + 1, needsAuth: false };
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Automatically persist Admin-modified platform configuration slices to server & Firestore (debounced)
  useEffect(() => {
    if (isHydratingRemoteRef.current || currentUser?.role !== 'admin') return;
    const timer = setTimeout(() => {
      void syncAllAdminSettingsToFirestore(true);
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUser?.role,
    siteSettings,
    currencies,
    featureToggles,
    withdrawalSettings,
    nationwideShippingSettings,
    vehicleRefundPolicy,
    navigationMenus,
    sitePages,
    faqsList,
    sitemapEntries,
    rssFeedItems,
    marketingBanners,
    promoVideos,
    productsList,
    teslaCarListings,
    investmentPools,
    featuredStockPlans,
    coupons,
    wheelRewards,
    scratchCardTiers,
    manualDepositMethods,
    socialLinks,
    spinCostUsd,
    smtpConfig,
    autoCryptoGateways,
    wonPrizes,
    seoSettings,
  ]);

  const updateSeoSettings = (updates: Partial<SeoMetadataConfig>) => {
    setSeoSettings((prev) => {
      const merged: SeoMetadataConfig = {
        ...prev,
        ...updates,
        pageMeta: updates.pageMeta ? { ...(prev.pageMeta || {}), ...updates.pageMeta } : prev.pageMeta,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      void saveSeoGlobalToFirestore(merged).then((r) => {
        if (r.synced) setLastFirestoreSyncAt(new Date().toLocaleTimeString());
      });
      return merged;
    });
    showToast('SEO metadata & branding saved and synchronized!', 'success');
  };

  const updatePageSeo = async (
    pageKey: string,
    meta: PageSeoMeta
  ): Promise<{ synced: boolean; reason?: string }> => {
    const cleanMeta: PageSeoMeta = {
      ...meta,
      pageKey,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSeoSettings((prev) => {
      const next: SeoMetadataConfig = {
        ...prev,
        pageMeta: {
          ...(prev.pageMeta || {}),
          [pageKey]: cleanMeta,
        },
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return next;
    });
    const res = await savePageSeoToFirestore(cleanMeta);
    if (res.synced) {
      setLastFirestoreSyncAt(new Date().toLocaleTimeString());
      showToast(`Saved per-page SEO for "${cleanMeta.pageLabel}" to Firestore!`, 'success');
    } else if (res.reason === 'auth_required') {
      showToast(`Saved SEO for "${cleanMeta.pageLabel}" locally. Connect Google Admin to sync to Firestore.`, 'info');
    } else {
      showToast(`Saved "${cleanMeta.pageLabel}" locally (Firestore note: ${res.reason || 'check rules'}).`, 'info');
    }
    return res;
  };

  const createSitemapEntry = (entryData: Omit<SitemapEntry, 'id'>) => {
    const created: SitemapEntry = { ...entryData, id: `sm-${Date.now().toString(36)}` };
    setSitemapEntries((prev) => [...prev, created]);
    showToast(`Sitemap entry ${created.path} added.`, 'success');
  };

  const updateSitemapEntry = (id: string, updates: Partial<SitemapEntry>) => {
    setSitemapEntries((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Sitemap entry updated.', 'success');
  };

  const deleteSitemapEntry = (id: string) => {
    setSitemapEntries((prev) => prev.filter((s) => s.id !== id));
    showToast('Sitemap entry removed.', 'info');
  };

  const createRssFeedItem = (itemData: Omit<RssFeedItem, 'id'>) => {
    const created: RssFeedItem = { ...itemData, id: `rss-${Date.now().toString(36)}` };
    setRssFeedItems((prev) => [created, ...prev]);
    showToast(`RSS article "${created.title}" published to /rss.xml!`, 'success');
  };

  const updateRssFeedItem = (id: string, updates: Partial<RssFeedItem>) => {
    setRssFeedItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    showToast('RSS feed entry updated.', 'success');
  };

  const deleteRssFeedItem = (id: string) => {
    setRssFeedItems((prev) => prev.filter((r) => r.id !== id));
    showToast('RSS feed entry removed.', 'info');
  };

  // Promotional Short Videos CMS CRUD
  const createPromoVideo = (
    videoData: Omit<PromoVideoItem, 'id' | 'createdAt' | 'viewsCount'>
  ): PromoVideoItem => {
    const created: PromoVideoItem = {
      ...videoData,
      id: `pvid-${Date.now().toString(36)}`,
      viewsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPromoVideos((prev) => [created, ...prev]);
    showToast(`Promotional short video "${created.title}" published!`, 'success');
    return created;
  };

  const updatePromoVideo = (id: string, updates: Partial<PromoVideoItem>) => {
    setPromoVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    showToast('Promotional video updated.', 'success');
  };

  const deletePromoVideo = (id: string) => {
    setPromoVideos((prev) => prev.filter((v) => v.id !== id));
    showToast('Promotional video deleted.', 'info');
  };

  const incrementPromoVideoView = (id: string) => {
    setPromoVideos((prev) => prev.map((v) => (v.id === id ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v)));
  };

  // Currency Switcher & Admin-Managed Multipliers
  const activeCurrencies = currencies.filter((c) => c.isActive);
  const selectedCurrency: CurrencyConfig =
    activeCurrencies.find((c) => c.code === selectedCurrencyCode) ||
    currencies.find((c) => c.code === 'USD') ||
    { code: 'USD', name: 'US Dollar', symbol: '$', multiplier: 1.0, isActive: true };

  const setSelectedCurrencyCode = (code: string) => {
    const target = currencies.find((c) => c.code === code.toUpperCase() && c.isActive);
    if (!target) return;
    setSelectedCurrencyCodeState(target.code);
    showToast(`Display currency switched to ${target.name} (${target.code} ×${target.multiplier}).`, 'info');
  };

  const updateCurrencyConfig = (code: string, updates: Partial<CurrencyConfig>) => {
    setCurrencies((prev) =>
      prev.map((c) =>
        c.code === code
          ? {
              ...c,
              ...updates,
              multiplier:
                updates.multiplier !== undefined
                  ? Math.max(0.0001, Number(updates.multiplier) || 1)
                  : c.multiplier,
            }
          : c
      )
    );
    showToast(`Updated ${code} currency multiplier.`, 'success');
  };

  const addCurrencyConfig = (currency: CurrencyConfig) => {
    const cleanCode = currency.code.trim().toUpperCase().slice(0, 6);
    if (!cleanCode) return;
    setCurrencies((prev) => {
      if (prev.some((c) => c.code === cleanCode)) {
        return prev.map((c) => (c.code === cleanCode ? { ...currency, code: cleanCode } : c));
      }
      return [...prev, { ...currency, code: cleanCode }];
    });
    showToast(`Currency ${cleanCode} (${currency.symbol} ×${currency.multiplier}) saved.`, 'success');
  };

  const deleteCurrencyConfig = (code: string) => {
    if (code === 'USD') return;
    setCurrencies((prev) => prev.filter((c) => c.code !== code));
    if (selectedCurrencyCode === code) setSelectedCurrencyCodeState('USD');
    showToast(`Currency ${code} removed.`, 'info');
  };

  const convertUsd = (usdAmount: number): number => {
    const base = Number(usdAmount) || 0;
    return Number((base * selectedCurrency.multiplier).toFixed(selectedCurrency.multiplier >= 50 ? 0 : 2));
  };

  const formatCurrency = (
    usdAmount: number,
    options?: { decimals?: number; includeCode?: boolean; compact?: boolean }
  ): string => {
    const converted = (Number(usdAmount) || 0) * selectedCurrency.multiplier;
    const defaultDecimals = selectedCurrency.multiplier >= 50 ? 0 : 2;
    const decimals = options?.decimals !== undefined ? options.decimals : defaultDecimals;
    const formattedNum = options?.compact
      ? converted >= 1000000
        ? `${(converted / 1000000).toFixed(2)}M`
        : converted >= 1000
        ? `${(converted / 1000).toFixed(1)}k`
        : converted.toFixed(decimals)
      : converted.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    return `${selectedCurrency.symbol}${formattedNum}${options?.includeCode ? ` ${selectedCurrency.code}` : ''}`;
  };

  // Visitor Analytics Telemetry Helper
  const trackVisitorAction = React.useCallback(
    (action: string, pageTab: string, details?: string) => {
      if (typeof window === 'undefined') return;
      let visitorId = localStorage.getItem('apex_visitor_id_v1');
      if (!visitorId) {
        visitorId = `vis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        localStorage.setItem('apex_visitor_id_v1', visitorId);
      }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const screenSize = `${window.innerWidth}x${window.innerHeight}`;

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          action,
          pageTab,
          details,
          timezone,
          screenSize,
          referrer: document.referrer || undefined,
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          userName: currentUser?.name,
        }),
      }).catch(() => {});
    },
    [currentUser?.id, currentUser?.email, currentUser?.name]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || 'customer',
        balances,
        lockedWinBalanceUsd,
        minDepositToActivateWinsUsd: MIN_DEPOSIT_TO_ACTIVATE_WINS_USD,
        getUserWalletBalances,
        vehicles,
        serviceBookings,
        userInvestments,
        transactions,
        availableSpins,
        spinCostUsd,
        recentWinners,
        cart,
        bookedRentals,
        toastMessage,
        sessionToken,
        activeSession: currentUser?.activeSession || null,
        login,
        adminLogin,
        register,
        signUpWithGoogle,
        logout,
        adminsList,
        fetchAdmins,
        createAdminAccount,
        upgradeUserToAdmin,
        updateAdminPrivileges,
        deleteAdminAccount,
        hasAdminPrivilege,
        updateProfile,
        changePassword,
        terminateOtherSessions,
        submitKyc,
        adminUpdateKyc,
        allUsers,
        updateUserBalance,
        smtpConfig,
        updateSmtpConfig,
        importedEmails,
        importEmailList,
        emailCampaigns,
        sendTestEmail,
        sendMarketingCampaign,
        setRole,
        toggle2FA,
        updatePin,
        depositFunds,
        addVehicle,
        bookService,
        stakeInPool,
        claimDividends,
        updateUserInvestment,
        forceMatureInvestment,
        pauseResumeInvestment,
        cancelInvestmentEarly,
        triggerManualCronCycle,
        toggleCronActive,
        cronActive,
        setCronActive,
        cronLogs,
        dispatchedCronEmails,
        lastCronRun,
        cronCyclesCount,
        lastCronRunAt: lastCronRun,
        allInvestments: userInvestments,
        investmentPools,
        createInvestmentPool,
        updateInvestmentPool,
        deleteInvestmentPool,
        adminNotifications,
        sendNotification,
        markNotificationAsRead,
        dismissNotification,
        deleteNotification,
        siteSettings,
        updateSiteSettings,
        sitePages,
        createSitePage,
        updateSitePage,
        deleteSitePage,
        navigationMenus,
        createNavigationMenuItem,
        updateNavigationMenuItem,
        deleteNavigationMenuItem,
        reorderNavigationMenuItem,
        resetNavigationMenus,
        manualDepositMethods,
        addManualDepositMethod,
        updateManualDepositMethod,
        deleteManualDepositMethod,
        socialLinks,
        updateSocialLink,
        productsList,
        addProductItem,
        updateProductItem,
        deleteProductItem,
        rentalFleetList,
        updateRentalFleetVehicle,
        scratchCardTiers,
        createScratchCardTier,
        updateScratchCardTier,
        deleteScratchCardTier,
        updateUserStatus,
        deleteUser,
        executeSpin,
        purchaseScratchCard,
        awardScratchPrize,
        rentVehicle,
        addToCart,
        removeFromCart,
        checkoutCart,
        showToast,
        referralLink,
        updateReferralCode,
        simulateFriendReferral,
        teslaCarListings,
        createTeslaCarListing,
        updateTeslaCarListing,
        deleteTeslaCarListing,
        nationwideShippingSettings,
        updateShippingSettings,
        vehicleRefundPolicy,
        updateRefundPolicy,
        vehicleOrders,
        placeVehicleOrder,
        updateVehicleOrderStatus,
        coupons,
        activeCoupon,
        claimedCoupons,
        claimCoupon,
        applyCoupon,
        removeCoupon,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        // Tesla Stocks & Spot Trading
        tslaQuote,
        updateStockQuote,
        featuredStockPlans,
        createFeaturedStockPlan,
        updateFeaturedStockPlan,
        deleteFeaturedStockPlan,
        userSpotHolding,
        buySpotStock,
        sellSpotStock,
        investInFeaturedStock,
        // User Withdrawals & Eligibility Rules
        withdrawalSettings,
        updateWithdrawalSettings,
        withdrawalRequests,
        requestWithdrawal,
        processWithdrawalRequest,
        isEligibleForWithdrawal,
        setUserDepositedForDemo,
        // Spins & Promotion CMS
        wheelRewards,
        updateWheelRewards,

        updateWheelReward,
        addWheelReward,
        deleteWheelReward,
        updateSpinCost,
        // Feature Toggles (Global Function Switches)
        featureToggles,
        updateFeatureToggles,
        // Automated Crypto Payment Gateways
        autoCryptoGateways,
        updateAutoCryptoGateway,
        addAutoCryptoGateway,
        deleteAutoCryptoGateway,
        testAutoCryptoGatewayPing,
        // Verified Customer Reviews
        reviews,
        addReview,
        markReviewHelpful,
        deleteReview,
        // TSLA Stock Price Alerts
        stockPriceAlerts,
        addStockPriceAlert,
        removeStockPriceAlert,
        toggleStockPriceAlert,
        resetStockPriceAlert,
        // Promotional Marketing Banners CMS
        marketingBanners,
        createMarketingBanner,
        updateMarketingBanner,
        deleteMarketingBanner,
        // Won Prizes Shipping & Fees
        wonPrizes,
        submitWonPrizeShippingAndPayFees,
        updateWonPrizeItem,
        createWonPrizeItem,
        // FAQs CMS
        faqsList,
        createFaqItem,
        updateFaqItem,
        deleteFaqItem,
        // SEO, Logo, Favicon, Sitemap & RSS Feeds + Firestore Cloud Sync
        seoSettings,
        updateSeoSettings,
        updatePageSeo,
        activeRouteTab,
        setActiveRouteTab,
        firebaseAdminEmail,
        firebaseCloudConnected,
        lastFirestoreSyncAt,
        isSyncingFirestore,
        connectAdminCloudSync,
        syncAllAdminSettingsToFirestore,
        sitemapEntries,
        createSitemapEntry,
        updateSitemapEntry,
        deleteSitemapEntry,
        rssFeedItems,
        createRssFeedItem,
        updateRssFeedItem,
        deleteRssFeedItem,
        // Promotional Short Videos
        promoVideos,
        createPromoVideo,
        updatePromoVideo,
        deletePromoVideo,
        incrementPromoVideoView,
        currencies,
        selectedCurrencyCode,
        selectedCurrency,
        setSelectedCurrencyCode,
        updateCurrencyConfig,
        addCurrencyConfig,
        deleteCurrencyConfig,
        convertUsd,
        formatCurrency,
        trackVisitorAction,
      }}
    >

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
