export type UserRole = 'customer' | 'admin';

export type AdminPrivilege =
  | 'super_admin'
  | 'manage_admins'
  | 'manage_users'
  | 'manage_investments'
  | 'manage_cars_store'
  | 'manage_withdrawals'
  | 'manage_site_cms'
  | 'manage_marketing'
  | 'manage_fleet_ops';

export interface UserSession {
  id: string;
  token: string;
  device: string;
  ip: string;
  loginAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminRoleLabel?: string;
  adminPrivileges?: AdminPrivilege[];
  avatar: string;
  bio?: string;
  location?: string;
  preferredServiceCenter?: string;
  phone?: string;
  walletAddress: string;
  twoFactorEnabled: boolean;
  pinSet: boolean;
  pin?: string;
  memberSince: string;
  tier: 'Standard' | 'Silver Ambassador' | 'Plaid Member' | 'Founders Club';
  referralCode: string;
  referredBy?: string;
  referralEarningsUsd: number;
  referralCount: number;
  referredUsers: ReferredUser[];
  activeSession?: UserSession;
  sessionHistory?: UserSession[];
  kycStatus?: 'unverified' | 'in_review' | 'verified' | 'rejected';
  kycData?: UserKycData;
  isOnline?: boolean;
  lastActiveAt?: string;
  lastVisitedPath?: string;
  accountStatus?: 'active' | 'suspended' | 'flagged' | 'banned';
  totalDepositedUsd?: number;
  totalWithdrawnUsd?: number;
  ipAddress?: string;
  deviceInfo?: string;
  themePreference?: 'dark' | 'light' | 'blue';
}

export interface UserKycData {
  legalName: string;
  dob: string;
  nationality: string;
  residentialAddress: string;
  idType: 'passport' | 'drivers_license' | 'national_id';
  idNumber: string;
  idFrontUrl?: string;
  proofOfAddressUrl?: string;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  previewText: string;
  content: string;
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  templateId?: string;
  targetAudience:
    | 'all_users'
    | 'plaid_members'
    | 'custom_list'
    | 'external_leads'
    | 'newsletter_subscribers'
    | 'all_registered_and_subscribers';
  recipientsCount: number;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  openRate: number;
  clickRate: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  interestCategory:
    | 'All Updates'
    | 'Service & Wraps'
    | 'Fleet & Yield'
    | 'Vehicle Drops & Promos';
  status: 'active' | 'unsubscribed';
  source: 'home_banner' | 'footer' | 'admin_manual' | 'registered_sync';
  subscribedAt: string;
}

export interface TestEmailResult {
  success: boolean;
  delivered: boolean;
  status: 'delivered' | 'failed';
  message: string;
  failureReason?: string;
  failureCode?: string;
  failureCategory?: string;
  troubleshooting?: string;
  smtpLog?: string;
  messageId?: string;
  timestamp?: string;
  recipient?: string;
  host?: string;
  port?: number;
}

export interface ReferredUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  date: string;
  status: 'signed_up' | 'deposit_completed';
  depositAmountUsd?: number;
  earnedCreditUsd: number;
  bonusSpinsEarned: number;
}

export interface WalletBalances {
  usd: number;
  btc: number;
  usdt: number;
  xrp: number;
  bnb: number;
}

export type CryptoCurrency = 'BTC' | 'USDT' | 'XRP' | 'BNB';

export interface CryptoNetworkInfo {
  currency: CryptoCurrency;
  name: string;
  network: string;
  address: string;
  minDeposit: number;
  rateUsd: number;
  iconColor: string;
  memoTag?: string;
}

export interface TransactionInvoiceItem {
  name: string;
  category?: string;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
}

export interface TransactionInvoiceDetails {
  invoiceNumber: string;
  receiptCategory: 'shop_order' | 'service_booking' | 'deposit' | 'withdrawal' | 'investment' | 'reward';
  customerName: string;
  customerEmail: string;
  customerLocation?: string;
  vehicleName?: string;
  serviceMode?: string;
  scheduledDate?: string;
  timeSlot?: string;
  location?: string;
  technicianNotes?: string;
  paymentMethod: string;
  couponCode?: string;
  subtotalUsd: number;
  discountUsd: number;
  shippingUsd: number;
  totalUsd: number;
  items: TransactionInvoiceItem[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'service_payment' | 'rental_payment' | 'investment_deposit' | 'dividend_claim' | 'promotion_win' | 'scratch_card_purchase' | 'referral_credit' | 'engagement_reward';
  currency: CryptoCurrency | 'USD';
  amount: number;
  usdEquivalent: number;
  timestamp: string;
  status: 'completed' | 'confirming' | 'pending' | 'rejected';
  txHash: string;
  description: string;
  invoiceData?: TransactionInvoiceDetails;
}

export interface TeslaVehicle {
  id: string;
  userId: string;
  model: 'Model S' | 'Model 3' | 'Model X' | 'Model Y' | 'Cybertruck' | 'Roadster';
  trim: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  wrapType?: string;
  batterySoc: number; // percentage 0-100
  odometer: number;
  estimatedRange: number; // miles
  serviceStatus: 'optimal' | 'service_due' | 'in_service' | 'diagnostics_alert';
  lastServiceDate: string;
  image: string;
}

export interface ServiceBooking {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  serviceType: 'Maintenance Inspection' | 'High-Voltage Battery Diagnostics' | 'Drive Unit / Inverter Fix' | 'Full Body Vinyl Wrap' | 'Ceramic Paint Protection Film' | 'Custom Accessories & Aero' | 'Tire & Brake Service';
  serviceMode: 'Apex Center Bay' | 'Mobile Ranger Dispatch';
  status: 'Scheduled' | 'Received & Queued' | 'Diagnostics' | 'Technician Working' | 'Quality Inspection' | 'Ready for Pickup / Complete';
  progressPercentage: number;
  scheduledDate: string;
  timeSlot: string;
  location: string;
  technicianNotes?: string;
  totalCostUsd: number;
  paidWith: string;
  createdAt: string;
  invoiceNumber?: string;
}

export interface RentalVehicle {
  id: string;
  model: string;
  trim: string;
  year: number;
  dailyRateUsd: number;
  weeklyRateUsd: number;
  zeroToSixty: string;
  topSpeed: string;
  rangeMiles: number;
  horsepower: number;
  image: string;
  features: string[];
  isAvailable: boolean;
  location: string;
}

export interface InvestmentPool {
  id: string;
  title: string;
  category: 'Autonomous Robotaxi Fleet' | 'Supercharger Mega-Node' | 'Plaid Track Rental Fleet' | 'Apex Custom Wrap Franchise';
  apy: number;
  lockPeriodDays: number;
  minInvestmentUsd: number;
  totalStakedUsd: number;
  poolCapUsd: number;
  riskLevel: 'Conservative' | 'Balanced' | 'Aggressive Yield';
  dailyPayoutEstUsdPer1000: number;
  description: string;
  image: string;
  apyPercent?: number;
  durationDays?: number;
  minStakeUsd?: number;
}

export interface UserInvestment {
  id: string;
  userId?: string;
  poolId: string;
  poolTitle: string;
  amountInvestedUsd: number;
  investedAt: string;
  earnedDividendsUsd: number;
  apy: number;
  nextPayoutHours: number;
  status: 'running' | 'completed' | 'paused';
  durationDays: number;
  daysElapsed: number;
  startDate?: string;
  maturityDate: string;
  totalExpectedRoiUsd: number;
  dailyRoiRate?: number;
  completedAt?: string;
  capitalReturned?: boolean;
  autoCompound?: boolean;
  txHash?: string;
  certificateId?: string;
  principalUsd?: number;
  poolName?: string;
  apyPercent?: number;
  accruedYieldUsd?: number;
  stakedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Wraps & Film' | 'Wheels & Performance' | 'Interior & Yoke' | 'Aero & Carbon' | 'Charging & Tech' | 'Vehicle Sales';
  priceUsd: number;
  rating?: number;
  reviewsCount?: number;
  image: string;
  description: string;
  compatibility?: string;
  inStock: boolean;
}

export interface WinRecord {
  id: string;
  username: string;
  prize: string;
  type: 'Wheel Spin' | 'Scratch & Win' | 'Staking ROI' | 'TSLA Stock ROI';
  category?:
    | 'Wheel Spin'
    | 'Scratch & Win'
    | 'Staking ROI'
    | 'TSLA Stock ROI'
    | 'Vehicle Jackpot'
    | 'staking'
    | 'stock'
    | 'vehicle'
    | 'spin_scratch';
  poolOrTicker?: string;
  roiPercent?: number;
  valueUsd: number;
  timestamp: string;
  verifiedHash: string;
  avatar: string;
}

export interface ScratchPrizeOption {
  amountUsd: number;
  label: string;
  weight: number;
  isTeslaCar?: boolean;
  vehicleModel?: string;
  isTryAgain?: boolean;
}

export interface ScratchCardTier {
  id: string;
  name: string;
  priceUsd: number;
  maxPrizeUsd: number;
  gradient: string;
  textColor: string;
  description: string;
  possiblePrizes: ScratchPrizeOption[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'diagnostic' | 'suggestion';
}

export interface FleetPerformanceTarget {
  id: string;
  poolId: string;
  poolTitle: string;
  metric: 'apy_threshold' | 'daily_dividend' | 'fleet_utilization' | 'pool_capacity' | 'payout_ready';
  targetValue: number;
  unit: '%' | '$' | 'hours';
  label: string;
  description: string;
  currentValue: number;
  triggered?: boolean;
}

export interface AssetAlertHistoryItem {
  id: string;
  assetTitle: string;
  metricLabel: string;
  targetValue: string;
  currentValue: string;
  timestamp: string;
  channels: ('browser' | 'email')[];
  status: 'delivered' | 'queued';
}

export interface AssetNotificationSettings {
  enabled: boolean;
  emailAlerts: boolean;
  browserAlerts: boolean;
  targetEmail: string;
  selectedPoolIds: string[]; // pool IDs or ['all']
  customThresholds: {
    minApy: number; // e.g. 18.0 (%)
    minUtilization: number; // e.g. 85 (%)
    minDailyYieldUsd: number; // e.g. 25 ($)
    poolCapWarningPercent: number; // e.g. 90 (%)
    payoutReadyAlert: boolean;
  };
  activeTargetIds: string[];
  history: AssetAlertHistoryItem[];
}

export type InvestmentActivityType = 'deposit' | 'payout' | 'milestone' | 'compound';

export interface InvestmentActivityItem {
  id: string;
  type: InvestmentActivityType;
  assetId: string;
  assetTitle: string;
  category: string;
  amountUsd: number;
  cryptoFormatted?: string;
  apyRate?: number;
  timestamp: string;
  status: 'confirmed' | 'settled' | 'compounded';
  txHash: string;
  milestoneTitle?: string;
  notes?: string;
  userId?: string;
  investmentId?: string;
  sourceCron?: string;
}

export type NotificationType = 'announcement' | 'payout' | 'alert' | 'system' | 'bonus' | 'investment' | 'system_alert' | 'promotion' | 'kyc' | 'direct_message';
export type NotificationPriority = 'low' | 'normal' | 'urgent' | 'high';

export interface AdminNotificationMessage {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: 'all' | 'individual' | 'user';
  targetUserId?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  createdAt: string;
  readBy?: string[]; // user IDs who marked as read
  dismissedBy?: string[];
  actionUrl?: string;
  actionLabel?: string;
  actionText?: string;
  category?: string;
  isRead?: boolean;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  displayLocation: 'navbar' | 'footer' | 'both' | 'hidden';
  order: number;
  isSystem: boolean;
  published: boolean;
  isPublished?: boolean;
  metaDescription?: string;
  updatedAt: string;
}

export interface ManualDepositMethod {
  id: string;
  title: string;
  name?: string;
  category: 'crypto' | 'fiat' | 'e_wallet';
  currencySymbol: string;
  currency?: string;
  accountDetails: string;
  accountNumber?: string;
  accountName?: string;
  routingOrBank?: string;
  instructions: string;
  qrCodeUrl?: string;
  minDepositUsd: number;
  maxDepositUsd: number;
  processingTime: string;
  feePercent: number;
  isActive: boolean;
  enabled?: boolean;
  requiresProofUpload: boolean;
  network?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  methodId: string;
  methodTitle: string;
  methodCategory: 'crypto' | 'fiat' | 'e_wallet';
  currency: CryptoCurrency | 'USD';
  amount: number;
  usdEquivalent: number;
  feeUsd: number;
  netUsd: number;
  senderDetails?: string;
  senderNote?: string;
  txReference: string;
  proofNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminEmail?: string;
  confirmedTxReference?: string;
  adminNote?: string;
  rejectionReason?: string;
}

export interface SocialLinkConfig {
  id: string;
  platform: 'whatsapp' | 'twitter' | 'telegram' | 'discord' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'threads';
  label: string;
  name?: string;
  url: string;
  handle: string;
  enabled: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
}

export interface TeslaCarListing {
  id: string;
  model: 'Cybertruck' | 'Model S' | 'Model 3' | 'Model X' | 'Model Y' | 'Roadster';
  trim: string;
  year: number;
  originalPriceUsd: number; // Official Tesla MSRP
  salePriceUsd: number;
  image: string;
  galleryImages?: string[];
  rangeMiles: number;
  zeroToSixty: string;
  topSpeedMph: number;
  horsepower: number;
  driveTrain: string;
  batteryKwh?: number;
  color: string;
  interiorColor: string;
  autopilotType: string;
  inStock: boolean;
  stockCount: number;
  vin?: string;
  description: string;
  specs: {
    seating: string;
    cargoSpaceCuFt: string;
    weightLbs: string;
    superchargingMaxKw: string;
    wheels: string;
  };
  deliveryEstimate: string;
  nationwideShippingFeeUsd: number;
  refundPolicy: string;
  warrantyDetails: string;
  isFeatured?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  country?: string;
  street: string;
  apartmentOrSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  deliveryMethod: 'enclosed_carrier' | 'apex_flatbed' | 'delivery_hub_pickup' | 'air_freight_intl' | 'ocean_roro_intl';
  deliveryNotes?: string;
}

export interface OrderCheckpoint {
  id: string;
  status: string;
  title: string;
  location: string;
  timestamp: string;
  note?: string;
}

export interface VehicleOrder {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  vehicleId: string;
  vehicleName: string;
  model: string;
  trim: string;
  totalUsd: number;
  shippingFeeUsd: number;
  shippingAddress: ShippingAddress;
  status: 'confirmed' | 'carrier_assigned' | 'in_transit' | 'out_for_delivery' | 'delivered';
  trackingNumber: string;
  carrierName?: string;
  estimatedDelivery?: string;
  checkpoints?: OrderCheckpoint[];
  refundPolicyAccepted: boolean;
  orderedAt: string;
  vinAssigned: string;
  paymentMethod: string;
  discountAppliedUsd?: number;
  appliedCouponCode?: string;
}

export interface NationwideShippingSettings {
  flatFeeUsd: number;
  freeShippingEligibleTiers: string[];
  estimatedDays: string;
  carrierPartners: string[];
  trackingPortalUrl: string;
}

export interface VehicleRefundPolicySettings {
  trialDays: number;
  maxMileage: number;
  moneyBackGuaranteePercent: number;
  inspectionRequired: boolean;
  termsSummary: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_usd' | 'free_spins' | 'free_shipping';
  discountValue: number;
  validFor: 'all' | 'products' | 'vehicles' | 'spins' | 'services' | 'wraps';
  minSpendUsd?: number;
  maxDiscountUsd?: number;
  maxUses?: number;
  timesUsed: number;
  expiresAt: string;
  isActive: boolean;
  badge?: string;
}

export interface TeslaStockQuote {
  symbol: 'TSLA';
  name: string;
  exchange: 'NASDAQ';
  price: number;
  changeUsd: number;
  changePercent: number;
  change24h: number;
  high24h: number;
  low24h: number;
  dayHigh?: number;
  dayLow?: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  week52High: number;
  week52Low: number;
  updatedAt: string;
  history: { time: string; price: number }[];
}

export interface SpotHolding {
  id: string;
  userId: string;
  shares: number;
  avgBuyPrice: number;
  totalInvestedUsd: number;
  currentEquityUsd: number;
  pnlUsd: number;
  pnlPercent: number;
  lastUpdated: string;
}

export interface FeaturedStockPlan {
  id: string;
  title: string;
  name?: string;
  ticker: string;
  category: 'Autonomous AI' | 'Supercharger Network' | 'Energy Grid' | 'Next-Gen Vehicle' | string;
  tier?: string;
  apy: number;
  durationDays: number;
  lockPeriodDays?: number;
  minInvestmentUsd: number; // minimum from 500 above
  maxInvestmentUsd: number;
  riskLevel: 'Accelerated ROI' | 'Ultra Fast Yield' | 'Balanced Growth' | 'Conservative' | 'Moderate' | 'Aggressive' | string;
  dailyYieldPercent: number;
  totalExpectedRoiPercent: number;
  expectedRoiPercent?: number;
  accelerationFactor?: string;
  description: string;
  badge: string;
  isActive: boolean;
  totalSubscribedUsd: number;
  subscribersCount?: number;
}

export type WithdrawalMethodType = 'BTC' | 'USDT_TRC20' | 'USDT_ERC20' | 'ETH' | 'BNB' | 'BANK_WIRE';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountUsd: number;
  currency: string;
  method?: string;
  destinationAddress: string;
  network?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  createdAt?: string;
  processedAt?: string;
  txHash?: string;
  rejectionReason?: string;
  feeUsd: number;
  netAmountUsd: number;
  netPayoutUsd?: number;
}

export interface WithdrawalSettings {
  enabled: boolean;
  withdrawalsEnabled?: boolean;
  requireMinDeposit: boolean;
  requireDepositToWithdraw?: boolean;
  minDepositRequiredUsd: number; // default $200
  minimumDepositRequiredUsd?: number;
  minWithdrawalUsd: number;
  minimumWithdrawalUsd?: number;
  maxWithdrawalUsd: number;
  feePercent: number;
  feePercentage?: number;
  estimatedProcessingTime: string;
}

export interface WheelReward {
  id: string;
  label: string;
  text?: string;
  valueUsd: number;
  value?: number;
  type: 'credits' | 'crypto' | 'service' | 'merch' | 'pass' | 'usd' | 'coupon' | 'points' | 'free_spin' | 'car' | 'try_again';
  vehicleModel?: string;
  image?: string;
  color: string;
  textColor: string;
  weight: number;
  probabilityWeight?: number;
  isActive: boolean;
}



export interface FeatureToggles {
  enableStockTrading: boolean;
  enableSpotBuy: boolean;
  enableFastRoiStocks: boolean;
  enableWithdrawals: boolean;
  requireMinDepositForWithdrawal: boolean;
  minDepositForWithdrawalUsd: number;
  enableSpins: boolean;
  enableScratchCards: boolean;
  enableVehicleSales: boolean;
  enableStakingYield: boolean;

  // Page display & navigation visibility toggles
  enableBlogPage?: boolean;
  enableServicesPage?: boolean;
  enableWrapsPage?: boolean;
  enableRentalsPage?: boolean;
  enablePromotionsPage?: boolean;
  enableCouponsPage?: boolean;
  enableShopPage?: boolean;
  enableReferralsPage?: boolean;
  enableBannersPage?: boolean;
  enableSocialPage?: boolean;
  enableAboutPage?: boolean;
  enableCertificatesPage?: boolean;
  enableFaqPage?: boolean;
  enableContactPage?: boolean;
  enableSitemapRssPages?: boolean;

  // Homepage sections & UI modules display toggles
  enableLiveTickerBar?: boolean;
  enableShowcaseDeck?: boolean;
  enableHomePromotionsSection?: boolean;
  enableHomeFaqSection?: boolean;
  enableNewsletterSignup?: boolean;
  enableAiChatbot?: boolean;
  enableCryptoDeposits?: boolean;

  // Extended aliases for streamlined components
  teslaStocksEnabled?: boolean;
  spotTradingEnabled?: boolean;
  fastRoiPlansEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  requireDepositForWithdrawal?: boolean;
  spinWheelEnabled?: boolean;
  scratchCardsEnabled?: boolean;
  vehicleSalesEnabled?: boolean;
  investmentsEnabled?: boolean;
}

export interface ReviewItem {
  id: string;
  targetType: 'vehicle' | 'product';
  targetId: string;
  targetName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLocation?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface StockPriceAlert {
  id: string;
  symbol: 'TSLA';
  condition: 'above' | 'below';
  targetPriceUsd: number;
  note?: string;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export type BannerSizeType =
  | 'leaderboard'
  | 'square'
  | 'rectangle'
  | 'sidebar'
  | 'billboard'
  | 'wide_skyscraper'
  | 'social_og'
  | 'story'
  | 'mobile_banner'
  | 'custom';

export type Banner3dPreset = 'cyber_perspective' | 'holographic_depth' | 'studio_4k_bevel' | 'obsidian_neon';

export type BannerImageMode = 'single' | 'multi';

export type BannerTransitionEffect = 'fade' | 'slide' | 'zoom';

export interface MarketingBanner {
  id: string;
  title: string;
  size: BannerSizeType;
  dimensions: string;
  customWidth?: number;
  customHeight?: number;
  imageMode?: BannerImageMode;
  transitionEffect?: BannerTransitionEffect;
  borderRadiusPx?: number;
  overlayOpacity?: number;
  showReferralCode?: boolean;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  themeGradient: string;
  accentColor: string;
  targetTab: string;
  imageUrl?: string;
  slideImages?: string[];
  slideIntervalSec?: number;
  isActive: boolean;
  isAiGenerated?: boolean;
  is3dHd?: boolean;
  style3dPreset?: Banner3dPreset;
  resolutionQuality?: '4K UHD' | 'HD 1080p';
  depthAngle?: number;
  carRenderModel?: string;
  clicksCount?: number;
  createdAt: string;
}

export type MenuLocation =
  | 'navbar'
  | 'dropdown'
  | 'footer_services'
  | 'footer_fleet'
  | 'footer_legal'
  | 'mobile_only';

export interface NavigationMenuItem {
  id: string;
  label: string;
  targetTab: string;
  location: MenuLocation;
  order: number;
  badge?: string;
  highlight?: boolean;
  isVisible: boolean;
  iconName?: string;
  isSystem?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  announcementBanner: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
  spinCostUsd: number;
  maxScratchPrizeUsd: number;
  hourlyBayRateUsd: number;
  maintenanceMode: boolean;
  enableCryptoDeposits: boolean;
}

export interface CronDispatchedEmail {
  id: string;
  type: 'registration_welcome' | 'deposit_confirmation' | 'maturity_settlement' | 'test_dispatch' | string;
  recipient: string;
  subject: string;
  amountUsd: number;
  investmentId: string;
  certificateId: string;
  dispatchedAt: string;
  status: 'delivered' | 'queued' | 'failed';
  detail?: string;
  host?: string;
}

export interface WonPrizeItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  prizeType: 'vehicle' | 'product';
  title: string;
  modelOrSku?: string;
  image: string;
  estimatedValueUsd: number;
  wonAt: string;
  wonAtIso?: string;
  source: 'Wheel Spin' | 'Scratch & Win';
  vinAssigned?: string;
  processingFeeUsd: number;
  shippingDocFeeUsd: number;
  shippingFreightFeeUsd: number;
  totalFeesUsd: number;
  feesPaid: boolean;
  paidAt?: string;
  paymentMethod?: 'wallet_usd' | 'deposit';
  addressConfirmed?: boolean;
  paymentVerifiedByAdmin?: boolean;
  adminApprovedForShipment?: boolean;
  verifiedAt?: string;
  verifiedByAdminEmail?: string;
  shippingStatus: 'awaiting_details' | 'fees_paid_processing' | 'approved' | 'documentation_ready' | 'shipped' | 'delivered';
  shippingAddress?: {
    fullName: string;
    country: string;
    street: string;
    apartmentOrSuite?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    deliveryMethod: string;
    deliveryNotes?: string;
  };
  trackingNumber?: string;
  carrierName?: string;
  checkpoints?: OrderCheckpoint[];
  notes?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  q?: string;
  a?: string;
  isPublished: boolean;
  order: number;
}

export interface PageSeoMeta {
  pageKey: string;
  pageLabel: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle?: string;
  ogImageUrl?: string;
  updatedAt?: string;
}

export interface MediaAssetRecord {
  id: string;
  role: 'logo' | 'favicon' | 'og_image' | 'general';
  name: string;
  storagePath: string;
  downloadUrl: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByEmail?: string;
  source?: 'firebase_storage' | 'local_upload' | 'preset';
}

export interface SeoMetadataConfig {
  siteTitle: string;
  siteName?: string;
  metaTitle?: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: 'summary_large_image' | 'summary';
  canonicalUrl: string;
  logoUrl: string;
  faviconUrl: string;
  robotsDirective: string;
  schemaOrgEnabled: boolean;
  schemaOrgType?: string;
  updatedAt?: string;
  pageMeta?: Record<string, PageSeoMeta>;
}

export interface SitemapEntry {
  id: string;
  path: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  changeFreq: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastMod: string;
}

export interface RssFeedItem {
  id: string;
  title: string;
  linkTab: string;
  description: string;
  category: string;
  pubDate: string;
  guid: string;
  isPublished: boolean;
}

export interface PromoVideoScene {
  title: string;
  subtitle: string;
  metric: string;
  bgImage: string;
}

export interface PromoVideoItem {
  id: string;
  title: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  targetTab: string;
  durationSec: number;
  videoType: 'ai_generated' | 'uploaded';
  videoUrl?: string;
  thumbnailUrl: string;
  accentColor: string;
  scenes: PromoVideoScene[];
  isActive: boolean;
  createdAt: string;
  viewsCount: number;
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  multiplier: number;
  isActive: boolean;
}

export interface VisitorActivityLog {
  id: string;
  visitorId: string;
  ip: string;
  country: string;
  city?: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  mobileModel: string;
  browser: string;
  os: string;
  action: string;
  pageTab: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  screenSize?: string;
  referrer?: string;
  timestamp: string;
}

export type CertificateCategory =
  | 'Business Operating License'
  | 'EV Dealership & Service Authority'
  | 'Fleet Investment & Custody'
  | 'Environmental & HV Safety';

export type CertificateVerificationStatus =
  | 'Active & Verified'
  | 'Renewed'
  | 'Pending Audit'
  | 'Archived';

export interface BusinessCertificate {
  id: string;
  title: string;
  certificateNumber: string;
  category: CertificateCategory;
  issuingAuthority: string;
  legalEntityName: string;
  jurisdiction: string;
  issuedDate: string;
  expiryDate: string;
  status: CertificateVerificationStatus;
  summary: string;
  imageUrl: string;
  watermarkCode: string;
  isPublished: boolean;
  displayOnAbout: boolean;
  order: number;
  updatedAt: string;
}

export type BlogCategory =
  | 'EV Engineering & Diagnostics'
  | 'Wraps & Protection'
  | 'Fleet & Staking Yield'
  | 'TSLA Markets & Crypto'
  | 'Vehicle Deliveries';

export type BlogPostStatus = 'published' | 'draft' | 'scheduled';

export type SocialSharePlatformId =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'threads'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'pinterest'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'discord'
  | 'email'
  | 'copy_link';

export interface BlogContentImage {
  url: string;
  caption?: string;
  alt?: string;
  placement?: 'top' | 'middle' | 'bottom';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: BlogCategory;
  status: BlogPostStatus;
  featured: boolean;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  contentImages?: BlogContentImage[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string;
  canonicalUrl?: string;
  schemaType?: 'BlogPosting' | 'NewsArticle' | 'TechArticle';
  sourceName?: string;
  sourceUrl?: string;
  sourceAuthor?: string;
  sourcePublishedAt?: string;
  isAutoIngested?: boolean;
  isAiRewritten?: boolean;
  rewrittenAt?: string;
  imageGeneratedWithAi?: boolean;
  imageGenerationPrompt?: string;
  pipelineStage?: 'draft_review' | 'approved_published';
  seoScore?: number;
  tags?: string[];
  viewsCount: number;
  sharesCount: number;
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  customReadCents?: number;
  customShareCents?: number;
}

export interface InsideEvsArticleCandidate {
  id: string;
  title: string;
  url: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  galleryImages: string[];
  author: string;
  publishedAt: string;
  bodyText?: string;
  alreadyImported?: boolean;
}

export interface AutoBlogRunLog {
  id: string;
  timestamp: string;
  status: 'success' | 'partial' | 'error';
  fetchedCount: number;
  importedCount: number;
  aiRewrittenCount: number;
  imagesGeneratedCount?: number;
  aiError?: string;
  message: string;
  importedTitles: string[];
}

export interface AutoBlogConfig {
  enabled: boolean;
  sourceUrl: string;
  intervalMinutes: number;
  autoRewriteWithAi: boolean;
  autoPublish: boolean;
  generateArticleImages?: boolean;
  imageGenerationMode?: 'gemini_editorial_svg' | 'gemini_imagen' | 'source_media';
  maxArticlesPerSync: number;
  defaultCategory: BlogCategory;
  includeContentImages: boolean;
  includeSourceAttribution: boolean;
  attributionPrefix: string;
  targetTone:
    | 'Authoritative EV Engineering'
    | 'Executive Fleet & Market Brief'
    | 'Accessible Owner Digest';
  lastSyncAt: string | null;
  lastSyncStatus: string;
  totalSyncedCount: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userTier: User['tier'];
  body: string;
  createdAt: string;
}

export type EngagementActionType =
  | 'read_article'
  | 'share_article'
  | 'engagement_action'
  | 'time_on_platform'
  | 'daily_streak'
  | 'admin_bonus';

export interface EngagementTierMultipliers {
  Standard: number;
  'Silver Ambassador'?: number;
  'Plaid Member': number;
  'Founders Club': number;
}

export interface EngagementTierLevel {
  id: 'standard' | 'silver' | 'plaid' | 'founders';
  name: string;
  mappedUserTier: User['tier'];
  minPoints: number;
  minDepositUsd: number;
  multiplier: number;
  referralRewardUsd: number;
}

export interface StreakTierRate {
  day: number;
  label: string;
  bonusPoints: number;
  bonusCents: number;
}

export interface StreakMilestoneBonus {
  daysRequired: number;
  label: string;
  bonusPoints: number;
  bonusCents: number;
  bonusFreeSpins?: number;
}

export interface DailyStreakConfig {
  enabled: boolean;
  graceWindowHours: number;
  resetAfterHours: number;
  autoResetMissedDays: boolean;
  maxStreakMultiplier: number;
  dailyRates: StreakTierRate[];
  milestoneBonuses: StreakMilestoneBonus[];
}

export interface StreakCheckInEntry {
  dateUtc: string;
  streakDay: number;
  pointsAwarded: number;
  centsAwarded: number;
  milestoneBonusPoints?: number;
  timestamp: string;
}

export interface UserDailyStreakState {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  totalStreakPoints: number;
  totalStreakCents: number;
  lastCheckInDateUtc: string | null;
  lastCheckInAtIso: string | null;
  checkedInToday: boolean;
  claimedMilestones: number[];
  history: StreakCheckInEntry[];
  securitySig?: string;
}

export type SpinDifficultyLevel = 'easy' | 'hard' | 'super_hard';
export type SpinAdminMode = 'auto' | SpinDifficultyLevel;

export interface UserSpinTracker {
  paidSpinsCount: number;
  totalWinsCount: number;
  freeSpinOfferWinsUsed: number;
  freeSpinOffersRedeemed: number;
  activeOfferSpinsRemaining?: number;
  redeemedCouponCodes?: string[];
  welcomeSpinsGranted?: boolean;
  scratchPlaysCount?: number;
  scratchJackpotsWonCount?: number;
  lastScratchAt?: string;
  lastSpinAt?: string;
  lastResolvedLevel?: SpinDifficultyLevel;
  lastReason?: string;
}

export interface SpinSystemConfig {
  minSpinCostUsd: number; // strictly >= 150
  maxSpinCostUsd?: number; // up to $2,500
  maxCashWinUsd: number; // up to $25,000 on max stake
  minStakeCashCapUsd?: number; // max $2,000 on minimum $150 spin cost (no jackpot/car)
  adminMode: SpinAdminMode;
  autoSuperHardWinThreshold: number; // switch user to super_hard after >= N wins
  freeSpinMaxWinsPerOffer: number; // strictly 1 win across offered free spins
  levels: Record<SpinDifficultyLevel, WheelReward[]>;
  userLevelOverrides: Record<string, SpinAdminMode>;
  userTrackers?: Record<string, UserSpinTracker>;
}

export interface WalletLedgerSummary {
  spendableUsd: number;
  activeDepositBalanceUsd: number;
  freeWinBalanceUsd: number;
  lockedWinUsd: number;
}

export type CronJobId =
  | 'investment-roi-cron'
  | 'roi_accrual'
  | 'daily_streak_audit'
  | 'spin_criteria_audit'
  | 'won_prize_logistics'
  | 'tsla_market_sync';

export interface CronJobConfigItem {
  id: CronJobId;
  name: string;
  description: string;
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  runsCount: number;
  lastSummary: string;
}

export interface EngagementRewardConfig {
  enabled: boolean;
  readArticleBaseCents: number;
  readMinDwellSeconds: number;
  shareArticleBaseCents: number;
  shareProgressiveStepCents: number;
  maxRewardedSharesPerPostPerDay: number;
  engagementActionBaseCents: number;
  timeOnPlatformCentsPerInterval: number;
  timeOnPlatformIntervalSeconds: number;
  socialSharePlatformCents?: number;
  dailyCapUsd: number;
  tierMultipliers: EngagementTierMultipliers;
  tierLevels?: EngagementTierLevel[];
  enabledSharePlatforms: SocialSharePlatformId[];
}

export interface EngagementRewardEvent {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userTier: User['tier'];
  actionType: EngagementActionType;
  postId?: string;
  postTitle?: string;
  platform?: SocialSharePlatformId;
  engagementDetail?: string;
  baseCents: number;
  multiplier: number;
  awardedCents: number;
  awardedUsd: number;
  description: string;
  status: 'credited' | 'revoked';
  createdAt: string;
}

export interface EngagementActivityRecord {
  id: string;
  userId: string;
  userTier: string;
  activityType: 'page_dwell' | 'social_share';
  pageTab: string;
  dwellSeconds?: number;
  platform?: string;
  targetTitle?: string;
  centsEarned: number;
  pointsEarned: number;
  createdAt: string;
}
