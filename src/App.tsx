/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { userRole, toastMessage } = useApp();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [chatbotPrompt, setChatbotPrompt] = useState<string | null>(null);

  const handleOpenAiDiagnostics = (query?: string) => {
    setChatbotPrompt(query || 'Please run a telemetry diagnostics scan on my Tesla high-voltage battery and drive unit.');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Proof-of-fair Live Winning Ticker Bar */}
      <LiveWinningTicker />

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCart={() => setIsCartModalOpen(true)}
      />

      {/* Tab routing container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDeposit={() => setIsDepositModalOpen(true)}
            />

            {/* Tesla Vehicle Sales & Direct Delivery Inventory */}
            <TeslaCarSales
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              onNavigateToDashboard={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isHomeTeaser={true}
              onViewAll={() => {
                setActiveTab('vehicles');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Custom Studio Wrap Preview Section on Home */}
            <CustomStudio
              onNavigateToServices={() => {
                setActiveTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDeposit={() => setIsDepositModalOpen(true)}
            />

            {/* Promotions Hub: Spin Wheel & Scratch Cards */}
            <PromotionsHub onOpenDeposit={() => setIsDepositModalOpen(true)} />

            {/* Tesla Rental Fleet */}
            <RentalFleet
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              onNavigateToDashboard={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Products Listing on Home */}
            <ProductShop
              onOpenCart={() => setIsCartModalOpen(true)}
              onOpenDeposit={() => setIsDepositModalOpen(true)}
            />

            {/* Vehicle & Supercharger Investment Hub */}
            <InvestmentHub
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              onNavigateToDashboard={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Information Sections */}
            <AboutSection />
            <FaqSection />
            <ContactSection />
          </div>
        )}

        {activeTab === 'vehicles' && (
          <TeslaCarSales
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onNavigateToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServiceScheduler
            onOpenDeposit={() => setIsDepositModalOpen(true)}
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
            onOpenDeposit={() => setIsDepositModalOpen(true)}
          />
        )}

        {activeTab === 'rentals' && (
          <RentalFleet
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'investment' && (
          <InvestmentHub
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'promotions' && (
          <PromotionsHub onOpenDeposit={() => setIsDepositModalOpen(true)} />
        )}

        {activeTab === 'referrals' && (
          <ReferralHub
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'shop' && (
          <ProductShop
            onOpenCart={() => setIsCartModalOpen(true)}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          userRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Dashboard
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              onNavigateToServices={() => setActiveTab('services')}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )
        )}

        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'social' && <SocialConnect />}

        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'faq' && <FaqSection />}
        {activeTab === 'contact' && <ContactSection />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
      />

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
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
