/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { LiveWinningTicker } from './components/LiveWinningTicker';
import { Hero } from './components/Hero';
import { ServiceScheduler } from './components/ServiceScheduler';
import { CustomStudio } from './components/CustomStudio';
import { RentalFleet } from './components/RentalFleet';
import { InvestmentHub } from './components/InvestmentHub';
import { PromotionsHub } from './components/PromotionsHub';
import { ProductShop } from './components/ProductShop';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { GeminiChatbot } from './components/GeminiChatbot';
import { DepositModal } from './components/DepositModal';
import { AuthModal } from './components/AuthModal';
import { CartModal } from './components/CartModal';
import { ReferralHub } from './components/ReferralHub';
import { SocialConnect } from './components/SocialConnect';
import { TeslaCarSales } from './components/TeslaCarSales';
import { CouponsHub } from './components/CouponsHub';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TeslaStockHub } from './components/TeslaStockHub';
import { UnifiedShowcaseDeck } from './components/UnifiedShowcaseDeck';
import { PromoBannersPage } from './components/PromoBannersPage';
import { CustomPageView } from './components/CustomPageView';
import { SitemapRssPage } from './components/SitemapRssPage';
import { CertificatesPage } from './components/CertificatesPage';
import { WinActivationPolicyModal } from './components/WinActivationPolicyModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const isPathAdmin = () => {
  if (typeof window === 'undefined') return false;
  const cleanPath = window.location.pathname.replace(/\/+$/, '');
  return cleanPath === '/admin' || window.location.hash === '#/admin';
};

const MainAppContent: React.FC = () => {
  const { currentUser, userRole, toastMessage, sitePages, siteSettings, showToast, trackVisitorAction, setActiveRouteTab } = useApp();
  const { isLight } = useTheme();

  const [activeTab, setActiveTabState] = useState<string>(() => (isPathAdmin() ? 'admin' : 'home'));
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [chatbotPrompt, setChatbotPrompt] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveRouteTab(activeTab);
  }, [activeTab, setActiveRouteTab]);

  React.useEffect(() => {
    trackVisitorAction('Session Initialized', activeTab, 'Loaded Apex Tesla Hub portal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveTab = React.useCallback((tab: string) => {
    if (tab === 'dashboard' && !currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to access your User Dashboard.', 'error');
      trackVisitorAction('Auth Gate Prompted', 'dashboard', 'Guest attempted to access User Dashboard');
      return;
    }
    setActiveTabState(tab);
    trackVisitorAction(`Viewed /${tab}`, tab, `Navigated to ${tab} section`);
    if (typeof window !== 'undefined') {
      const targetUrl = tab === 'admin' ? '/admin' : '/';
      const currentClean = window.location.pathname.replace(/\/+$/, '') || '/';
      if (currentClean !== targetUrl) {
        window.history.pushState({ tab }, '', targetUrl);
      }
    }
  }, [currentUser, showToast, trackVisitorAction]);

  const openDepositModalGated = React.useCallback(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to make a deposit.', 'error');
      return;
    }
    setIsDepositModalOpen(true);
  }, [currentUser, showToast]);

  const openWithdrawModalGated = React.useCallback(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to request a withdrawal.', 'error');
      return;
    }
    setIsWithdrawModalOpen(true);
  }, [currentUser, showToast]);

  React.useEffect(() => {
    const onPopState = () => {
      setActiveTabState(isPathAdmin() ? 'admin' : 'home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenAiDiagnostics = (query?: string) => {
    setChatbotPrompt(query || 'Please run a telemetry diagnostics scan on my Tesla high-voltage battery and drive unit.');
  };

  React.useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setActiveTab(custom.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('apex:navigate', handler);
    return () => window.removeEventListener('apex:navigate', handler);
  }, [setActiveTab]);

  React.useEffect(() => {
    const onRequireAuth = () => {
      setIsAuthModalOpen(true);
    };
    window.addEventListener('apex:require-auth', onRequireAuth);
    return () => window.removeEventListener('apex:require-auth', onRequireAuth);
  }, []);

  const BUILTIN_TABS = new Set([
    'home',
    'stocks',
    'vehicles',
    'services',
    'wraps',
    'rentals',
    'investment',
    'promotions',
    'coupons',
    'tracking',
    'referrals',
    'banners',
    'shop',
    'dashboard',
    'admin',
    'social',
    'about',
    'certificates',
    'faq',
    'contact',
    'sitemap',
    'rss',
  ]);

  const matchedCustomPage = !BUILTIN_TABS.has(activeTab)
    ? sitePages.find((p) => p.slug === activeTab && (p.isPublished ?? p.published))
    : undefined;

  return (
    <div className={`min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col transition-colors duration-200 selection:bg-red-600 selection:text-white ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07090e] text-slate-100'}`}>
      {/* Proof-of-fair Live Winning Ticker Bar */}
      <LiveWinningTicker
        onNavigateToCoupons={() => {
          setActiveTab('coupons');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToTracking={() => setIsOrderTrackingOpen(true)}
        onNavigateToInvestment={() => {
          setActiveTab('investment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToStocks={() => {
          setActiveTab('stocks');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToPromotions={() => {
          setActiveTab('promotions');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={openDepositModalGated}
        onOpenWithdraw={openWithdrawModalGated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCart={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            showToast('Please sign in or register to view your cart.', 'error');
            return;
          }
          setIsCartModalOpen(true);
        }}
        onOpenTracking={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            showToast('Please sign in or register to track orders.', 'error');
            return;
          }
          setIsOrderTrackingOpen(true);
        }}
      />

        {/* Tab routing container */}
      <main className="flex-1 w-full min-w-0">
        {siteSettings.maintenanceMode && userRole !== 'admin' && (
          <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-300 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Scheduled system upgrade window active — existing investments & telemetry remain protected.</span>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDeposit={openDepositModalGated}
            />

            {/* Unified Interactive Showcase Slides (Reduces lengthy page and highlights all products, services & stock yields) */}
            <UnifiedShowcaseDeck
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDeposit={openDepositModalGated}
              onOpenCart={() => setIsCartModalOpen(true)}
            />

            {/* Promotions Hub: Provably Fair Spin Wheel & Scratch Cards */}
            <PromotionsHub onOpenDeposit={openDepositModalGated} />

            {/* Information & Trust Sections */}
            <AboutSection
              onNavigateToCertificates={() => {
                setActiveTab('certificates');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FaqSection />
            <ContactSection />
          </div>
        )}

        {/* Dedicated Tesla Live Stocks, Fast ROI & Spot Hub */}
        {activeTab === 'stocks' && (
          <TeslaStockHub
            onOpenDeposit={openDepositModalGated}
            onNavigateToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}


        {activeTab === 'vehicles' && (
          <TeslaCarSales
            onOpenDeposit={openDepositModalGated}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigateToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServiceScheduler
            onOpenDeposit={openDepositModalGated}
            onOpenAiDiagnostics={handleOpenAiDiagnostics}
            onNavigateToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'wraps' && (
          <CustomStudio
            onNavigateToServices={() => setActiveTab('services')}
            onOpenDeposit={openDepositModalGated}
          />
        )}

        {activeTab === 'rentals' && (
          <RentalFleet
            onOpenDeposit={openDepositModalGated}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'investment' && (
          <InvestmentHub
            onOpenDeposit={openDepositModalGated}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'promotions' && (
          <PromotionsHub onOpenDeposit={openDepositModalGated} />
        )}

        {activeTab === 'coupons' && (
          <CouponsHub
            onOpenCart={() => setIsCartModalOpen(true)}
            onNavigateToVehicles={() => {
              setActiveTab('vehicles');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToPromotions={() => {
              setActiveTab('promotions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToServices={() => {
              setActiveTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'tracking' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl"
            >
              Open Live Order Tracking Portal
            </button>
          </div>
        )}

        {activeTab === 'referrals' && (
          <ReferralHub
            onOpenDeposit={openDepositModalGated}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigateToBanners={() => {
              setActiveTab('banners');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'banners' && (
          <PromoBannersPage
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'shop' && (
          <ProductShop
            onOpenCart={() => setIsCartModalOpen(true)}
            onOpenDeposit={openDepositModalGated}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenDeposit={openDepositModalGated}
            onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
            onNavigateToServices={() => setActiveTab('services')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AdminLoginPage onReturnHome={() => setActiveTab('home')} />
          )
        )}
        {activeTab === 'social' && <SocialConnect />}

        {activeTab === 'about' && (
          <AboutSection
            onNavigateToCertificates={() => {
              setActiveTab('certificates');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'certificates' && (
          <CertificatesPage
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'faq' && <FaqSection />}
        {activeTab === 'contact' && <ContactSection />}
        {activeTab === 'sitemap' && (
          <SitemapRssPage
            initialMode="sitemap"
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'rss' && (
          <SitemapRssPage
            initialMode="rss"
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {matchedCustomPage && (
          <CustomPageView
            page={matchedCustomPage}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDeposit={openDepositModalGated}
      />

      {/* Floating Gemini AI Chatbot Concierge */}
      <GeminiChatbot
        initialPrompt={chatbotPrompt}
        onClearInitialPrompt={() => setChatbotPrompt(null)}
      />

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onOpenDeposit={() => {
          setIsWithdrawModalOpen(false);
          setIsDepositModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigateToAdmin={() => {
          setIsAuthModalOpen(false);
          setActiveTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onOpenDeposit={openDepositModalGated}
      />

      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
      />

      <WinActivationPolicyModal onOpenDeposit={openDepositModalGated} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-sm p-4 rounded-2xl bg-zinc-950/95 border border-red-500/40 shadow-2xl backdrop-blur-md text-xs text-white flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
          <p className="leading-snug">{toastMessage.text}</p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <MainAppContent />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

