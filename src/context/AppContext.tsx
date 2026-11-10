import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  CRYPTO_NETWORKS,
  INITIAL_VEHICLES,
  INVESTMENT_POOLS,
  MOCK_WINNERS,
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
  logout: () => void;
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
  updateUserBalance: (userId: string, currency: CryptoCurrency | 'USD', newAmount: number) => void;
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
  triggerManualCronCycle: () => { maturedCount: number; yieldDistributedUsd: number; logs: string[] };
  cronActive: boolean;
  setCronActive: (active: boolean) => void;
  cronLogs: string[];
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
  // Site CMS & Custom Pages
  sitePages: SitePage[];
  createSitePage: (page: Omit<SitePage, 'id' | 'updatedAt'>) => void;
  updateSitePage: (id: string, updates: Partial<SitePage>) => void;
  deleteSitePage: (id: string) => boolean;
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
  // Promotions & Gaming
  executeSpin: () => { prize: string; valueUsd: number; type: string };
  purchaseScratchCard: (tier: ScratchCardTier) => boolean;
  awardScratchPrize: (tier: ScratchCardTier, prizeAmountUsd: number, prizeLabel: string) => void;
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
  totalDepositedUsd: 7450.0,
  totalWithdrawnUsd: 1200.0,
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
    location: 'Tokyo / International',
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apex_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
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
  const spinCostUsd = 25;

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('apex_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
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

  // Site CMS Pages state
  const [sitePages, setSitePages] = useState<SitePage[]>(() => {
    const saved = localStorage.getItem('apex_site_pages');
    return saved ? JSON.parse(saved) : INITIAL_SITE_PAGES;
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

  // Store Products Catalog
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('apex_products_list');
    return saved ? JSON.parse(saved) : [];
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
  const [cronCyclesCount, setCronCyclesCount] = useState<number>(142);
  const [lastCronRun, setLastCronRun] = useState<string | null>('2026-11-08 14:30');
  const [cronLogs, setCronLogs] = useState<string[]>([
    'System init: Automated ROI Cron Engine active on 45s interval.',
    'Cycle [14:00]: Processed 4 running fleet staking pools. Accrued $18.68 daily yield.',
    'Cycle [14:30]: Validated maturity countdowns. Model S Plaid pool completion verified.',
  ]);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) localStorage.setItem('apex_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('apex_smtp', JSON.stringify(smtpConfig));
  }, [smtpConfig]);

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

    fetch('/api/cron/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((status) => {
        if (status) {
          if (typeof status.cyclesRun === 'number') setCronCyclesCount(status.cyclesRun);
          if (status.lastRunTimestamp) setLastCronRun(status.lastRunTimestamp.replace('T', ' ').substring(0, 16));
          if (Array.isArray(status.logs)) setCronLogs(status.logs);
        }
      })
      .catch((e) => console.warn('Failed to fetch cron status:', e));
  }, []);

  // Periodic simulated live winner popups to give dynamic proof of fair platform activity with guaranteed verified avatars
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
        'CryptoFalcon_X',
        'Dave_TriMotor',
        'Elena_Volt',
        'Viktor_Apex',
        'TeslaKing_Austin',
        'NakamotoXRP',
        'Liam_Roadster',
        'Chloe_Cyberbeast',
      ];
      const prizes = [
        { label: '500 Apex Credits', val: 500, type: 'Wheel Spin' as const },
        { label: '$2,500 Silver Plaid Voucher', val: 2500, type: 'Scratch & Win' as const },
        { label: '100 USDT Instant Cash', val: 100, type: 'Wheel Spin' as const },
        { label: 'Full Body Ceramic PPF Voucher', val: 1800, type: 'Scratch & Win' as const },
        { label: 'Cybertruck 48h VIP Pass', val: 598, type: 'Wheel Spin' as const },
        { label: '$8,000 Grand Jackpot Cash', val: 8000, type: 'Scratch & Win' as const },
        { label: '250 XRP Instant Wallet Credit', val: 595, type: 'Wheel Spin' as const },
        { label: '1,000 kWh Supercharging Credits', val: 350, type: 'Wheel Spin' as const },
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const randomAvatar = verifiedAvatars[Math.floor(Math.random() * verifiedAvatars.length)];
      const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

      const newWin: WinRecord = {
        id: `win-${Date.now()}`,
        username: randomName,
        prize: randomPrize.label,
        type: randomPrize.type,
        valueUsd: randomPrize.val,
        timestamp: 'Just now',
        verifiedHash: randomHash,
        avatar: randomAvatar,
      };

      setRecentWinners((prev) => [newWin, ...prev.slice(0, 15)]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('apex_session_token') || 'apex_sess_alex_demo_token_2026_secured';
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
      .then((res) => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((_err) => {
        // Fallback gracefully keeps local state if server is momentarily restarting
      });
  }, [sessionToken]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || (email === 'admin.ops@apex-tesla.io' ? 'AdminTesla2026!' : 'TeslaPlaid2026!'),
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
      // Local fallback for offline/development resilience
      const user: User = {
        ...DEFAULT_USER,
        email,
        name: email.split('@')[0].toUpperCase(),
      };
      setCurrentUser(user);
      showToast(`Signed in to session for ${user.name}`);
      return true;
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

    localStorage.removeItem('apex_session_token');
    localStorage.removeItem('apex_user');
    setSessionToken(null);
    setCurrentUser(null);
    showToast('Logged out of Apex Tesla Hub.', 'info');
  };

  const updateReferralCode = (newCode: string): boolean => {
    if (!currentUser) return false;
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanCode.length < 3 || cleanCode.length > 20) {
      showToast('Referral code must be 3 to 20 alphanumeric characters.', 'error');
      return false;
    }

    const updated = { ...currentUser, referralCode: cleanCode };
    setCurrentUser(updated);
    showToast(`Your unique invite code updated to: ${cleanCode}`, 'success');
    return true;
  };

  const simulateFriendReferral = (friendName?: string, depositAmount: number = 500) => {
    if (!currentUser) return;

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
    const updatedUser: User = {
      ...currentUser,
      referralEarningsUsd: (currentUser.referralEarningsUsd || 0) + bonusCredits,
      referralCount: (currentUser.referralCount || 0) + 1,
      referredUsers: [newReferred, ...(currentUser.referredUsers || [])],
    };
    setCurrentUser(updatedUser);

    showToast(
      `🎉 Referral Reward Earned! ${selectedName} completed their first deposit ($${depositAmount} USD)! +$${bonusCredits} USD Platform Credits & ${bonusSpins} Free Spins added to your vault!`,
      'success'
    );
  };

  const setRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
      showToast(`Switched active mode to ${role === 'admin' ? 'Executive Operations Admin' : 'Customer Account'}.`, 'info');
    }
  };

  const toggle2FA = () => {
    if (currentUser) {
      const newState = !currentUser.twoFactorEnabled;
      setCurrentUser({ ...currentUser, twoFactorEnabled: newState });
      showToast(`Two-Factor Authentication (2FA) is now ${newState ? 'ENABLED (Hardware Vault Protected)' : 'DISABLED'}.`, newState ? 'success' : 'info');
    }
  };

  const updatePin = (newPin: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, pin: newPin, pinSet: true });
      showToast('Wallet Security PIN successfully updated.', 'success');
    }
  };

  const depositFunds = async (currency: CryptoCurrency | 'USD', amount: number): Promise<Transaction> => {
    let usdValue = amount;
    if (currency !== 'USD') {
      const rate = CRYPTO_NETWORKS[currency]?.rateUsd || 1;
      usdValue = amount * rate;
    }

    const txId = `tx-${Date.now()}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;

    const newTx: Transaction = {
      id: txId,
      type: 'deposit',
      currency,
      amount,
      usdEquivalent: Math.round(usdValue * 100) / 100,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash,
      description: `${currency} Instant Gateway Deposit Confirmed`,
    };

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
    showToast(`Deposit of ${amount} ${currency} (~$${Math.round(usdValue).toLocaleString()}) credited to your vault!`, 'success');
    return newTx;
  };

  const addVehicle = (vehicleData: Omit<TeslaVehicle, 'id' | 'userId'>) => {
    const newVehicle: TeslaVehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    showToast(`${vehicleData.model} (${vehicleData.trim}) added to your digital garage!`);
  };

  const bookService = (bookingData: Omit<ServiceBooking, 'id' | 'userId' | 'createdAt' | 'progressPercentage' | 'status'>) => {
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
    return true;
  };

  const pauseResumeInvestment = (investmentId: string) => {
    setUserInvestments((prev) =>
      prev.map((i) => {
        if (i.id === investmentId) {
          const nextStatus = i.status === 'running' ? 'paused' : 'running';
          showToast(`Investment #${investmentId} status set to ${nextStatus}.`, 'info');
          return { ...i, status: nextStatus as any };
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

  // Automated ROI Cron Job Execution Engine
  const triggerManualCronCycle = () => {
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastCronRun(timeStr);

    let maturedCount = 0;
    let yieldDistributedUsd = 0;
    const newLogs: string[] = [];

    setUserInvestments((prev) => {
      return prev.map((inv) => {
        if (inv.status !== 'running') return inv;

        // Daily incremental ROI: (Principal * APY / 365)
        const dailyYield = (inv.amountInvestedUsd * (inv.apy / 100)) / 365;
        const newEarned = (inv.earnedDividendsUsd || 0) + Number(dailyYield.toFixed(2));
        const newDaysElapsed = (inv.daysElapsed || 0) + 1;
        yieldDistributedUsd += Number(dailyYield.toFixed(2));

        // Check if plan has completed / reached duration
        if (newDaysElapsed >= inv.durationDays) {
          maturedCount++;
          const totalSettlement = inv.amountInvestedUsd + newEarned;

          // Auto-credit wallet with earnings & capital as due
          setBalances((b) => ({ ...b, usd: b.usd + totalSettlement }));

          const completionDate = new Date().toISOString().substring(0, 10);
          const certificateId = `APEX-CERT-${completionDate.replace(/-/g, '')}-${inv.id.substring(4, 8).toUpperCase()}`;

          newLogs.push(`[MATURED] Plan #${inv.id} (${inv.poolTitle}): Paid $${totalSettlement.toFixed(2)} ($${inv.amountInvestedUsd} capital + $${newEarned.toFixed(2)} ROI). Cert: ${certificateId}`);

          // Dispatched notification to user
          sendNotification({
            title: `🏆 Staking Plan Matured: ${inv.poolTitle}`,
            message: `Your investment has completed its ${inv.durationDays}-day staking cycle! Total payout of $${totalSettlement.toFixed(2)} USD (Capital $${inv.amountInvestedUsd.toLocaleString()} + ROI $${newEarned.toFixed(2)}) has been credited directly to your wallet.`,
            type: 'payout',
            priority: 'urgent',
            targetType: 'individual',
            targetUserId: inv.userId || currentUser?.id,
            actionUrl: 'wallet',
            actionLabel: 'Check Wallet',
          });

          return {
            ...inv,
            status: 'completed' as const,
            daysElapsed: inv.durationDays,
            earnedDividendsUsd: newEarned,
            completedAt: completionDate,
            capitalReturned: true,
            certificateId,
          };
        }

        newLogs.push(`[YIELD ACCRUED] Plan #${inv.id} (${inv.poolTitle}): +$${dailyYield.toFixed(2)} USD (Day ${newDaysElapsed}/${inv.durationDays})`);
        return {
          ...inv,
          earnedDividendsUsd: newEarned,
          daysElapsed: newDaysElapsed,
          nextPayoutHours: 24,
        };
      });
    });

    const summaryLog = `[CRON CYCLE at ${timeStr}] Processed active investments. Yield distributed: $${yieldDistributedUsd.toFixed(2)} USD. Matured plans settled: ${maturedCount}.`;
    setCronLogs((prevLogs) => [summaryLog, ...newLogs, ...prevLogs.slice(0, 20)]);
    showToast(`Cron Cycle complete: $${yieldDistributedUsd.toFixed(2)} yield accrued. ${maturedCount} plan(s) matured!`, 'success');

    return { maturedCount, yieldDistributedUsd, logs: [summaryLog, ...newLogs] };
  };

  // Background automated Cron interval (runs every 60s when cronActive is true)
  useEffect(() => {
    if (!cronActive) return;

    const interval = setInterval(() => {
      // Process incremental yield & check for completions
      setUserInvestments((prev) => {
        let maturedFound = false;
        const updated = prev.map((inv) => {
          if (inv.status !== 'running') return inv;

          // Increment slight yield on timer tick (simulated fraction of daily yield)
          const incremental = (inv.amountInvestedUsd * (inv.apy / 100)) / (365 * 24);
          const newEarned = (inv.earnedDividendsUsd || 0) + Number(incremental.toFixed(3));

          // If daysElapsed reaches durationDays, mature plan
          if (inv.daysElapsed >= inv.durationDays) {
            maturedFound = true;
            const totalPayout = inv.amountInvestedUsd + newEarned;
            setBalances((b) => ({ ...b, usd: b.usd + totalPayout }));

            const completionDate = new Date().toISOString().substring(0, 10);
            const cert = `APEX-CERT-${completionDate.replace(/-/g, '')}-${inv.id.substring(4, 8).toUpperCase()}`;

            sendNotification({
              title: `🎉 Staking Completed: ${inv.poolTitle}`,
              message: `Your investment duration has completed. Total payout of $${totalPayout.toFixed(2)} USD (Principal + ROI) has been credited to your available wallet balance.`,
              type: 'payout',
              priority: 'urgent',
              targetType: 'individual',
              targetUserId: inv.userId || currentUser?.id,
              actionUrl: 'wallet',
              actionLabel: 'View Wallet',
            });

            return {
              ...inv,
              status: 'completed' as const,
              completedAt: completionDate,
              capitalReturned: true,
              earnedDividendsUsd: newEarned,
              certificateId: cert,
            };
          }

          return {
            ...inv,
            earnedDividendsUsd: newEarned,
          };
        });

        if (maturedFound) {
          setLastCronRun(new Date().toISOString().replace('T', ' ').substring(0, 19));
        }

        return updated;
      });
    }, 60000);

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

  // Site CMS Pages Handlers
  const createSitePage = (pageData: Omit<SitePage, 'id' | 'updatedAt'>) => {
    const newPage: SitePage = {
      ...pageData,
      id: `page-${Date.now()}`,
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    setSitePages((prev) => [...prev, newPage]);
    showToast(`Page "${pageData.title}" created successfully!`, 'success');
  };

  const updateSitePage = (id: string, updates: Partial<SitePage>) => {
    setSitePages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : p))
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
    setProductsList((prev) => [...prev, newProduct]);
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

  // Admin User Balance Adjustment
  const updateUserBalance = (userId: string, currency: CryptoCurrency | 'USD', newAmount: number) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u };
        }
        return u;
      })
    );

    if (currentUser?.id === userId) {
      setBalances((prev) => {
        if (currency === 'USD') return { ...prev, usd: newAmount };
        if (currency === 'BTC') return { ...prev, btc: newAmount };
        if (currency === 'USDT') return { ...prev, usdt: newAmount };
        if (currency === 'XRP') return { ...prev, xrp: newAmount };
        if (currency === 'BNB') return { ...prev, bnb: newAmount };
        return prev;
      });
    }

    showToast(`Updated ${currency} balance for user #${userId}.`, 'success');
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

  // Paid Spin Only — Strictly costs $25 per spin, No Free Spins!
  const executeSpin = (): { prize: string; valueUsd: number; type: string } => {
    const cost = 25;
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

    const wheelOutcomes = [
      { prize: 'Tesla Cybertruck 48-Hour VIP Rental Pass', valueUsd: 598, type: 'Rental Pass' },
      { prize: '1,000 USDT Instant Cash', valueUsd: 1000, type: 'USDT' },
      { prize: 'Full Body Vinyl Wrap ($3,500 Voucher)', valueUsd: 3500, type: 'Wrap Voucher' },
      { prize: '500 Apex Platform Credits', valueUsd: 500, type: 'Credits' },
      { prize: '100 USDT Instant Bonus', valueUsd: 100, type: 'USDT' },
      { prize: '1,000 kWh Free Supercharger Pass', valueUsd: 350, type: 'Supercharging' },
      { prize: 'Gold Plaid Card Voucher', valueUsd: 1000, type: 'Card Voucher' },
      { prize: '50 Apex Credits', valueUsd: 50, type: 'Credits' },
    ];

    const won = wheelOutcomes[Math.floor(Math.random() * wheelOutcomes.length)];

    if (won.valueUsd > 0) {
      setBalances((prev) => ({ ...prev, usd: prev.usd + won.valueUsd }));
    }

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
    const winTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: won.valueUsd,
      usdEquivalent: won.valueUsd,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description: `Spin-and-Win Prize: ${won.prize}`,
    };
    setTransactions((prev) => [winTx, ...prev]);

    const winRecord: WinRecord = {
      id: `win-${Date.now()}`,
      username: currentUser?.name || 'LuckyUser',
      prize: won.prize,
      type: 'Wheel Spin',
      valueUsd: won.valueUsd,
      timestamp: 'Just now',
      verifiedHash: hash,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setRecentWinners((prev) => [winRecord, ...prev]);

    return won;
  };

  const purchaseScratchCard = (tier: ScratchCardTier): boolean => {
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

  // Scratch cards configured to strictly have ZERO wins after users scratch cards
  const awardScratchPrize = (tier: ScratchCardTier, _prizeAmountUsd: number, _prizeLabel: string) => {
    const zeroPrize = 0;
    const zeroLabel = 'Zero Payout - Better Luck Next Time';

    const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'promotion_win',
      currency: 'USD',
      amount: zeroPrize,
      usdEquivalent: zeroPrize,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed',
      txHash: hash,
      description: `Scratch & Win [${tier.name}]: ${zeroLabel}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Card Expended: ${zeroLabel} ($0 USD credited).`, 'info');
  };

  const rentVehicle = (vehicle: RentalVehicle, days: number, startDate: string): boolean => {
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || 'customer',
        balances,
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
        register,
        logout,
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
        cronActive,
        setCronActive,
        cronLogs,
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
        sitePages,
        createSitePage,
        updateSitePage,
        deleteSitePage,
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
