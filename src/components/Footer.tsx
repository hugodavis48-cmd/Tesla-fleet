import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  X,
  Map,
  Rss,
  Award,
  ChevronDown,
  ChevronRight,
  Wrench,
  Car,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsletterSignup } from './NewsletterSignup';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDeposit }) => {
  const { currentUser, navigationMenus, sitePages, siteSettings, seoSettings, socialLinks } = useApp();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<
    'services' | 'fleet' | 'promotions' | null
  >(null);
  const dropdownGroupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownGroupRef.current && !dropdownGroupRef.current.contains(e.target as Node)) {
        setOpenCategoryDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCategoryDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
  const hasCertificatesMenuItem = legalMenus.some((m) => m.targetTab === 'certificates');
  const customFooterPages = sitePages
    .filter(
      (p) =>
        !p.isSystem &&
        (p.isPublished ?? p.published) &&
        (p.displayLocation === 'footer' || p.displayLocation === 'both')
    )
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
        {/* Newsletter Signup Section */}
        <NewsletterSignup source="footer" variant="feature" />

        <div ref={dropdownGroupRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pt-2">
          {/* Brand info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 p-0.5 overflow-hidden shrink-0">
                <img
                  src={seoSettings?.logoUrl || '/logo.jpg'}
                  alt={siteSettings.siteName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.jpg';
                  }}
                  className="w-full h-full rounded-[10px] object-cover bg-zinc-950"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-heading font-black text-lg tracking-tight text-white">
                  {brandParts[0]}
                </span>
                {brandParts[1] && (
                  <>
                    <span className="font-mono text-red-500 font-extrabold">//</span>
                    <span className="font-heading font-extrabold text-lg text-zinc-300">
                      {brandParts[1]}
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              {siteSettings.heroSubtitle}
            </p>

            {/* Social Connect Handles */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between max-w-sm">
                <span className="text-[11px] font-semibold text-zinc-500 block">
                  Official Connected Channels
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('social')}
                  className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
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
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    <span>{social.name || social.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Dropdown Menus: Services & Custom + Fleet & Yield */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-white">
                Platform Categories
              </h4>
              <p className="text-[11px] text-zinc-500">
                Select a division dropdown to jump directly to specialized bays, custom builds, or fleet yield pools.
              </p>
            </div>

            <div className="space-y-3">
              {/* Dropdown 1: Services & Custom */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openCategoryDropdown === 'services'}
                  onClick={() =>
                    setOpenCategoryDropdown((prev) => (prev === 'services' ? null : 'services'))
                  }
                  className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    openCategoryDropdown === 'services'
                      ? 'bg-zinc-900 border-red-500/60 text-white'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Wrench className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-heading font-semibold text-xs sm:text-sm truncate">
                      Services &amp; Custom
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-400 tabular-nums">
                    <span>{serviceMenus.length} options</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openCategoryDropdown === 'services' ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </span>
                </button>

                {openCategoryDropdown === 'services' && (
                  <div
                    role="menu"
                    aria-label="Services and Custom categories"
                    className="mt-1.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 space-y-0.5 z-30"
                  >
                    {serviceMenus.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenCategoryDropdown(null);
                          onNavigate(item.targetTab);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Fleet & Yield */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openCategoryDropdown === 'fleet'}
                  onClick={() =>
                    setOpenCategoryDropdown((prev) => (prev === 'fleet' ? null : 'fleet'))
                  }
                  className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    openCategoryDropdown === 'fleet'
                      ? 'bg-zinc-900 border-red-500/60 text-white'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-heading font-semibold text-xs sm:text-sm truncate">
                      Fleet &amp; Yield
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-400 tabular-nums">
                    <span>{fleetMenus.length + 1} options</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openCategoryDropdown === 'fleet' ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </span>
                </button>

                {openCategoryDropdown === 'fleet' && (
                  <div
                    role="menu"
                    aria-label="Fleet and Yield categories"
                    className="mt-1.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 space-y-0.5 z-30"
                  >
                    {fleetMenus.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenCategoryDropdown(null);
                          onNavigate(item.targetTab);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCategoryDropdown(null);
                        onOpenDeposit();
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-emerald-400 hover:text-emerald-300 hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <span className="truncate">Crypto Gateway (BTC/USDT/XRP)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Menus 3: Promotions & Trust Dropdown */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-white">
                Promotions &amp; Trust
              </h4>
              <p className="text-[11px] text-zinc-500">
                Access promotions, compliance certificates, policies, and syndication feeds.
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openCategoryDropdown === 'promotions'}
                onClick={() =>
                  setOpenCategoryDropdown((prev) => (prev === 'promotions' ? null : 'promotions'))
                }
                className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                  openCategoryDropdown === 'promotions'
                    ? 'bg-zinc-900 border-amber-500/60 text-white'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-heading font-semibold text-xs sm:text-sm truncate">
                    Promotions &amp; Trust
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-400 tabular-nums">
                  <span>
                    {legalMenus.length +
                      customFooterPages.length +
                      (hasCertificatesMenuItem ? 4 : 5) +
                      (currentUser?.role === 'admin' ? 1 : 0)}{' '}
                    options
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openCategoryDropdown === 'promotions' ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </span>
              </button>

              {openCategoryDropdown === 'promotions' && (
                <div
                  role="menu"
                  aria-label="Promotions and Trust links"
                  className="mt-1.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 space-y-0.5 z-30 max-h-80 overflow-y-auto"
                >
                  {legalMenus.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCategoryDropdown(null);
                        onNavigate(item.targetTab);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg text-left text-xs hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer ${
                        item.highlight
                          ? 'text-yellow-400 hover:text-yellow-300 font-semibold'
                          : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono text-red-400 font-bold">
                            · {item.badge}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </button>
                  ))}

                  {customFooterPages.map((pg) => (
                    <button
                      key={pg.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCategoryDropdown(null);
                        onNavigate(pg.slug);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-amber-300 hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <span className="truncate">{pg.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </button>
                  ))}

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenCategoryDropdown(null);
                      openLegalModal('Privacy Policy', privacyText);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="truncate">Privacy Policy</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenCategoryDropdown(null);
                      openLegalModal('Terms of Service & Proof of Fair', termsText);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="truncate">Terms of Service</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  {!hasCertificatesMenuItem && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCategoryDropdown(null);
                        onNavigate('certificates');
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-amber-300 hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Business &amp; License Certificates</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </button>
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenCategoryDropdown(null);
                      onNavigate('sitemap');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-cyan-400 hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Map className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Interactive Site Map</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenCategoryDropdown(null);
                      onNavigate('rss');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-amber-400 hover:bg-zinc-900 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Rss className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">RSS Feeds &amp; Live XML</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCategoryDropdown(null);
                        onNavigate('admin');
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-xs text-amber-400 hover:text-amber-300 hover:bg-zinc-900 font-bold font-mono flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <span className="truncate">Executive Admin Suite (/admin)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </button>
                  )}

                  <div className="mt-1 pt-1.5 px-3 py-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">XML Feeds</span>
                    <div className="flex items-center gap-2.5">
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-cyan-400 underline"
                      >
                        sitemap.xml
                      </a>
                      <span className="text-zinc-700">·</span>
                      <a
                        href="/rss.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-amber-400 underline"
                      >
                        rss.xml
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright disclaimer */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>
            © 2026 {siteSettings.siteName} ({siteSettings.siteTagline}). All rights reserved.
          </p>
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
                type="button"
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
                type="button"
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
