import React, { useState } from 'react';
import { Zap, ShieldCheck, ExternalLink, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDeposit }) => {
  const { currentUser, navigationMenus, sitePages, siteSettings, socialLinks } = useApp();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const openLegalModal = (title: string, body: string) => {
    setModalContent({ title, body });
  };

  const footerSocials = socialLinks.filter((s) => s.enabled && s.showInFooter);
  const serviceMenus = navigationMenus
    .filter((m) => m.location === 'footer_services' && m.isVisible)
    .sort((a, b) => a.order - b.order);
  const fleetMenus = navigationMenus
    .filter((m) => m.location === 'footer_fleet' && m.isVisible)
    .sort((a, b) => a.order - b.order);
  const legalMenus = navigationMenus
    .filter((m) => m.location === 'footer_legal' && m.isVisible)
    .sort((a, b) => a.order - b.order);
  const customFooterPages = sitePages
    .filter((p) => !p.isSystem && (p.isPublished ?? p.published) && (p.displayLocation === 'footer' || p.displayLocation === 'both'))
    .sort((a, b) => a.order - b.order);

  const brandParts = siteSettings.siteName.includes('//')
    ? siteSettings.siteName.split('//').map((s) => s.trim())
    : [siteSettings.siteName, ''];

  const privacyText = `Apex Tesla Hub is committed to protecting your privacy and digital assets.
1. Data Collection: We collect only necessary vehicle telematics (VIN, error codes, odometer, SoC) to perform maintenance and schedule technician dispatches.
2. Cryptographic Security: All crypto transactions (BTC, USDT, XRP, BNB) are executed via non-custodial or multi-signature cold storage vaults. We never share user identity or financial logs with third parties.
3. Cookies & Local Session: Client session data is stored securely in local encrypted storage. No tracking pixels or surveillance marketing telemetry is employed.`;

  const termsText = `Terms of Service - Apex Tesla Hub:
1. Certified Service & Repairs: All mechanical, electrical, and wrap customization services performed at Apex facilities or via Mobile Rangers include a 2-Year / 24,000-mile warranty.
2. Promotional Gaming & Scratch Cards: Spin-and-Win Wheel and purchasable Scratch & Win cards ($50 to $${siteSettings.maxScratchPrizeUsd.toLocaleString()} tiers) operate via provably fair algorithmic randomness. Prizes are credited immediately to user dashboard balances.
3. Staking & Yield: Vehicle and Supercharger staking APYs (14.8% to 22.6%) reflect distributed commercial fleet operations. Yield payouts are automated daily.
4. Independent Affiliation: Apex Tesla Hub is an independent engineering and customization network dedicated to Tesla vehicle owners and enthusiasts.`;

  return (
    <footer className="bg-black border-t border-zinc-900 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center p-0.5">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-heading font-black text-lg tracking-tight text-white">{brandParts[0]}</span>
                {brandParts[1] && (
                  <>
                    <span className="font-mono text-red-500 font-extrabold">//</span>
                    <span className="font-heading font-extrabold text-lg text-zinc-300">{brandParts[1]}</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              {siteSettings.heroSubtitle}
            </p>

            {/* Social Connect Handles */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">
                  Official Connected Channels
                </span>
                <button
                  onClick={() => onNavigate('social')}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold cursor-pointer"
                >
                  View All & Share →
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {footerSocials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    <span>{social.name || social.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Menus 1: Services & Custom */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Services & Custom
            </h4>
            <ul className="space-y-2">
              {serviceMenus.map((item) => (
                <li key={item.id}>
                  <button onClick={() => onNavigate(item.targetTab)} className="hover:text-red-400 transition text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Menus 2: Fleet & Staking */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Fleet & Yield
            </h4>
            <ul className="space-y-2">
              {fleetMenus.map((item) => (
                <li key={item.id}>
                  <button onClick={() => onNavigate(item.targetTab)} className="hover:text-red-400 transition text-left">
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={onOpenDeposit} className="hover:text-red-400 transition text-left">
                  Crypto Gateway (BTC/USDT/XRP)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Menus 3: Promotions & Legal */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Promotions & Trust
            </h4>
            <ul className="space-y-2">
              {legalMenus.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.targetTab)}
                    className={`hover:text-red-400 transition flex items-center gap-1 text-left ${
                      item.highlight ? 'text-yellow-400 font-bold' : 'text-zinc-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1 py-0.2 bg-red-600 text-white rounded font-bold uppercase animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {customFooterPages.map((pg) => (
                <li key={pg.id}>
                  <button
                    onClick={() => onNavigate(pg.slug)}
                    className="hover:text-amber-300 text-zinc-300 transition text-left"
                  >
                    {pg.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => openLegalModal('Privacy Policy', privacyText)}
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => openLegalModal('Terms of Service & Proof of Fair', termsText)}
                  className="hover:text-white transition"
                >
                  Terms of Service
                </button>
              </li>
              {currentUser?.role === 'admin' && (
                <li>
                  <button onClick={() => onNavigate('admin')} className="hover:text-amber-400 text-amber-400 font-bold font-mono transition">
                    Executive Admin Suite (/admin)
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright disclaimer */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© 2026 {siteSettings.siteName} ({siteSettings.siteTagline}). All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted • Cold-Storage Vault Security</span>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-200">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-white">{modalContent.title}</h3>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs leading-relaxed whitespace-pre-line text-zinc-300 max-h-[60vh] overflow-y-auto">
              {modalContent.body}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
