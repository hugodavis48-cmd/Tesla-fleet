import { FeatureToggles } from '../types';

export const TAB_TO_FEATURE_KEY: Record<string, keyof FeatureToggles> = {
  blog: 'enableBlogPage',
  stocks: 'enableStockTrading',
  vehicles: 'enableVehicleSales',
  services: 'enableServicesPage',
  wraps: 'enableWrapsPage',
  rentals: 'enableRentalsPage',
  investment: 'enableStakingYield',
  promotions: 'enablePromotionsPage',
  coupons: 'enableCouponsPage',
  shop: 'enableShopPage',
  referrals: 'enableReferralsPage',
  banners: 'enableBannersPage',
  social: 'enableSocialPage',
  about: 'enableAboutPage',
  certificates: 'enableCertificatesPage',
  faq: 'enableFaqPage',
  contact: 'enableContactPage',
  sitemap: 'enableSitemapRssPages',
  rss: 'enableSitemapRssPages',
};

export const TAB_DISPLAY_LABELS: Record<string, string> = {
  blog: 'News & Blog Hub',
  stocks: 'TSLA Stocks & Fast ROI',
  vehicles: 'Buy Tesla Showroom',
  services: 'Service & Mobile Ranger Bays',
  wraps: 'Custom Wrap Studio',
  rentals: 'Exotic Rental Fleet',
  investment: 'Fleet Staking & Yield',
  promotions: 'Spin & Win Promotions',
  coupons: 'Coupons & Deals',
  shop: 'Hardware & Parts Store',
  referrals: 'Refer & Earn Program',
  banners: '3D Promo Banners & Videos',
  social: 'Social Connect & Share',
  about: 'About Apex Tesla Hub',
  certificates: 'Business & License Certificates',
  faq: 'FAQ Knowledge Base',
  contact: 'Contact & Support',
  sitemap: 'Interactive Site Map',
  rss: 'RSS Feeds & XML',
};

export function isTabEnabled(tab: string, toggles?: Partial<FeatureToggles> | null): boolean {
  if (!toggles) return true;
  if (tab === 'home' || tab === 'admin' || tab === 'dashboard' || tab === 'tracking') return true;
  const key = TAB_TO_FEATURE_KEY[tab];
  if (!key) return true;
  if (key === 'enableStockTrading') {
    return toggles.enableStockTrading !== false && toggles.teslaStocksEnabled !== false;
  }
  if (key === 'enableVehicleSales') {
    return toggles.enableVehicleSales !== false && toggles.vehicleSalesEnabled !== false;
  }
  if (key === 'enableStakingYield') {
    return toggles.enableStakingYield !== false && toggles.investmentsEnabled !== false;
  }
  return toggles[key] !== false;
}

export function normalizeFeatureToggles(
  base: FeatureToggles,
  incoming?: Partial<FeatureToggles> | null
): FeatureToggles {
  const patch = incoming || {};
  const merged: FeatureToggles = {
    ...base,
    ...patch,
  };

  // Resolve paired canonical <-> alias flags cleanly
  const resolvePair = (
    canonical: keyof FeatureToggles,
    alias: keyof FeatureToggles,
    fallback = true
  ): boolean => {
    if (canonical in patch && patch[canonical] !== undefined) return Boolean(patch[canonical]);
    if (alias in patch && patch[alias] !== undefined) return Boolean(patch[alias]);
    if (base[canonical] !== undefined) return Boolean(base[canonical]);
    if (base[alias] !== undefined) return Boolean(base[alias]);
    return fallback;
  };

  const stockTrading = resolvePair('enableStockTrading', 'teslaStocksEnabled', true);
  const spotBuy = resolvePair('enableSpotBuy', 'spotTradingEnabled', true);
  const fastRoi = resolvePair('enableFastRoiStocks', 'fastRoiPlansEnabled', true);
  const withdrawals = resolvePair('enableWithdrawals', 'withdrawalsEnabled', true);
  const minDepositReq = resolvePair('requireMinDepositForWithdrawal', 'requireDepositForWithdrawal', true);
  const spins = resolvePair('enableSpins', 'spinWheelEnabled', true);
  const scratch = resolvePair('enableScratchCards', 'scratchCardsEnabled', true);
  const vehicles = resolvePair('enableVehicleSales', 'vehicleSalesEnabled', true);
  const staking = resolvePair('enableStakingYield', 'investmentsEnabled', true);

  return {
    ...merged,
    enableStockTrading: stockTrading,
    teslaStocksEnabled: stockTrading,
    enableSpotBuy: spotBuy,
    spotTradingEnabled: spotBuy,
    enableFastRoiStocks: fastRoi,
    fastRoiPlansEnabled: fastRoi,
    enableWithdrawals: withdrawals,
    withdrawalsEnabled: withdrawals,
    requireMinDepositForWithdrawal: minDepositReq,
    requireDepositForWithdrawal: minDepositReq,
    minDepositForWithdrawalUsd: Number(merged.minDepositForWithdrawalUsd ?? 200),
    enableSpins: spins,
    spinWheelEnabled: spins,
    enableScratchCards: scratch,
    scratchCardsEnabled: scratch,
    enableVehicleSales: vehicles,
    vehicleSalesEnabled: vehicles,
    enableStakingYield: staking,
    investmentsEnabled: staking,

    enableBlogPage: merged.enableBlogPage !== false,
    enableServicesPage: merged.enableServicesPage !== false,
    enableWrapsPage: merged.enableWrapsPage !== false,
    enableRentalsPage: merged.enableRentalsPage !== false,
    enablePromotionsPage: merged.enablePromotionsPage !== false,
    enableCouponsPage: merged.enableCouponsPage !== false,
    enableShopPage: merged.enableShopPage !== false,
    enableReferralsPage: merged.enableReferralsPage !== false,
    enableBannersPage: merged.enableBannersPage !== false,
    enableSocialPage: merged.enableSocialPage !== false,
    enableAboutPage: merged.enableAboutPage !== false,
    enableCertificatesPage: merged.enableCertificatesPage !== false,
    enableFaqPage: merged.enableFaqPage !== false,
    enableContactPage: merged.enableContactPage !== false,
    enableSitemapRssPages: merged.enableSitemapRssPages !== false,

    enableLiveTickerBar: merged.enableLiveTickerBar !== false,
    enableShowcaseDeck: merged.enableShowcaseDeck !== false,
    enableHomePromotionsSection: merged.enableHomePromotionsSection !== false,
    enableHomeFaqSection: merged.enableHomeFaqSection !== false,
    enableNewsletterSignup: merged.enableNewsletterSignup !== false,
    enableAiChatbot: merged.enableAiChatbot !== false,
    enableCryptoDeposits: merged.enableCryptoDeposits !== false,
  };
}
