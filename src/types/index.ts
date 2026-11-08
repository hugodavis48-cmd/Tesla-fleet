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
}

export interface UserInvestment {
  id: string;
  poolId: string;
  poolTitle: string;
  amountInvestedUsd: number;
  investedAt: string;
  earnedDividendsUsd: number;
  apy: number;
  nextPayoutHours: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Wraps & Film' | 'Wheels & Performance' | 'Interior & Yoke' | 'Aero & Carbon' | 'Charging & Tech';
  priceUsd: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  compatibility: string;
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
