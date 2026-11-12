export type UserRole = 'customer' | 'admin';

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
  tier: 'Standard' | 'Plaid Member' | 'Founders Club';
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
  targetAudience: 'all_users' | 'plaid_members' | 'custom_list' | 'external_leads';
  recipientsCount: number;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  openRate: number;
  clickRate: number;
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
  simulationMode?: boolean;
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

export interface Transaction {
  id: string;
  type: 'deposit' | 'service_payment' | 'rental_payment' | 'investment_deposit' | 'dividend_claim' | 'promotion_win' | 'scratch_card_purchase' | 'referral_credit';
  currency: CryptoCurrency | 'USD';
  amount: number;
  usdEquivalent: number;
  timestamp: string;
  status: 'completed' | 'confirming' | 'pending';
  txHash: string;
  description: string;
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
  type: 'Wheel Spin' | 'Scratch & Win';
  valueUsd: number;
  timestamp: string;
  verifiedHash: string;
  avatar: string;
}

export interface ScratchCardTier {
  id: string;
  name: string;
  priceUsd: number;
  maxPrizeUsd: number;
  gradient: string;
  textColor: string;
  description: string;
  possiblePrizes: { amountUsd: number; label: string; weight: number }[];
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
  status: 'delivered' | 'simulated';
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
  street: string;
  apartmentOrSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  deliveryMethod: 'enclosed_carrier' | 'apex_flatbed' | 'delivery_hub_pickup';
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
  type: 'credits' | 'crypto' | 'service' | 'merch' | 'pass' | 'usd' | 'coupon' | 'points' | 'free_spin';
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

export interface AutoCryptoGateway {

  id: string;
  name: string;
  network: 'TRC20' | 'ERC20' | 'BTC' | 'ETH' | 'BEP20' | 'XRPL';
  currency: 'USDT' | 'BTC' | 'ETH' | 'BNB' | 'XRP';
  symbol: string;
  receivingAddress: string;
  rpcEndpoint: string;
  webhookSecret: string;
  requiredConfirmations: number;
  minDepositUsd: number;
  maxDepositUsd: number;
  feePercent: number;
  autoCreditEnabled: boolean;
  autoPayoutEnabled: boolean;
  status: 'active' | 'testing' | 'disabled';
  lastPingSuccess?: boolean;
  lastPingAt?: string;
  totalProcessedUsd: number;
  totalTransactionsCount: number;
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

export type BannerSizeType = 'leaderboard' | 'square' | 'rectangle' | 'sidebar';

export interface MarketingBanner {
  id: string;
  title: string;
  size: BannerSizeType;
  dimensions: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  themeGradient: string;
  accentColor: string;
  targetTab: string;
  imageUrl?: string;
  isActive: boolean;
  isAiGenerated?: boolean;
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
  type: string;
  recipient: string;
  subject: string;
  amountUsd: number;
  investmentId: string;
  certificateId: string;
  dispatchedAt: string;
  status: 'delivered' | 'simulated';
}

