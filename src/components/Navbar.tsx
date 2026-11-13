import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Zap,
  Wallet,
  ShoppingBag,
  User,
  Shield,
  Menu,
  X,
  Plus,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Gift,
  Wrench,
  Palette,
  Car,
  TrendingUp,
  Users,
  Share2,
  Bell,
  MessageCircle,
  Tag,
  Truck,
  ArrowDownLeft,
  Activity,
  CreditCard,
  Globe,
  Sun,
  Moon,
  Megaphone,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenTracking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAuth,
  onOpenCart,
  onOpenTracking,
}) => {
  const {
    currentUser,
    logout,
    balances,
    cart,
    adminNotifications,
    tslaQuote,
    featureToggles,
    navigationMenus,
    sitePages,
    siteSettings,
    seoSettings,
    socialLinks,
    currencies,
    selectedCurrencyCode,
    selectedCurrency,
    setSelectedCurrencyCode,
    formatCurrency,
  } = useApp();
  const { currentLanguageOption, setLanguage, languages, t } = useLanguage();
  const { isLight, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const dropdownPagesRef = useRef<HTMLDivElement>(null);
  const mobileDrawerPagesRef = useRef<HTMLDivElement>(null);

  const [canSlideDesktopLeft, setCanSlideDesktopLeft] = useState(false);
  const [canSlideDesktopRight, setCanSlideDesktopRight] = useState(true);
  const [canSlideMobileBarLeft, setCanSlideMobileBarLeft] = useState(false);
  const [canSlideMobileBarRight, setCanSlideMobileBarRight] = useState(true);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotificationsCount = adminNotifications.filter((n) => {
    const isRead = Boolean(n.isRead || (currentUser && n.readBy?.includes(currentUser.id)));
    const isTargeted = n.targetType === 'all' || (currentUser && n.targetUserId === currentUser.id);
    return !isRead && isTargeted;
  }).length;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Activity,
    Car,
    Tag,
    Wrench,
    Palette,
    TrendingUp,
    Gift,
    Users,
    Share2,
    Megaphone,
  };

  const primaryMenuLinks = navigationMenus
    .filter((m) => m.location === 'navbar' && m.isVisible)
    .filter((m) => m.targetTab !== 'stocks' || featureToggles.teslaStocksEnabled)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      id: m.targetTab,
      label: m.isSystem ? t(`nav.${m.targetTab}`, m.label) : m.label,
      icon: m.iconName ? iconMap[m.iconName] : undefined,
      highlight: m.highlight,
      badge: m.badge,
      stockPill: m.targetTab === 'stocks' ? `$${tslaQuote.price.toFixed(1)}` : undefined,
    }));

  const dropdownMenuLinks = navigationMenus
    .filter((m) => m.location === 'dropdown' && m.isVisible)
    .sort((a, b) => a.order - b.order);

  const mobileOnlyLinks = navigationMenus
    .filter((m) => m.location === 'mobile_only' && m.isVisible)
    .sort((a, b) => a.order - b.order);

  const customNavbarPages = sitePages
    .filter((p) => !p.isSystem && (p.isPublished ?? p.published) && p.displayLocation !== 'hidden')
    .filter((p) => !primaryMenuLinks.some((m) => m.id === p.slug))
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: p.slug,
      label: p.title,
      icon: undefined as React.ComponentType<{ className?: string }> | undefined,
      highlight: false,
      badge: undefined as string | undefined,
      stockPill: undefined as string | undefined,
    }));

  // Combine all accessible pages so every page is reachable via the slidable menu
  const extraDropdownAsNav = dropdownMenuLinks
    .filter((m) => !primaryMenuLinks.some((p) => p.id === m.targetTab))
    .map((m) => ({
      id: m.targetTab,
      label: m.label,
      icon: m.iconName ? iconMap[m.iconName] : Megaphone,
      highlight: m.highlight,
      badge: m.badge,
      stockPill: undefined as string | undefined,
    }));

  const navLinks = [...primaryMenuLinks, ...extraDropdownAsNav, ...customNavbarPages].filter(
    (link) => currentUser || link.id !== 'dashboard'
  );

  const whatsappChannel = socialLinks.find((s) => s.platform === 'whatsapp' && s.enabled);
  const whatsappUrl =
    whatsappChannel?.url ||
    'https://wa.me/18005552739?text=Hi%20Apex%20Tesla%20Hub!%20I%20am%20inquiring%20about%20vehicle%20service%20or%20fleet%20investments.';

  const brandParts = siteSettings.siteName.includes('//')
    ? siteSettings.siteName.split('//').map((s) => s.trim())
    : [siteSettings.siteName, ''];

  const handleNavClick = (id: string) => {
    if (id === 'dashboard' && !currentUser) {
      onOpenAuth();
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const updateSlideButtons = useCallback(() => {
    const desk = desktopNavRef.current;
    if (desk) {
      setCanSlideDesktopLeft(desk.scrollLeft > 4);
      setCanSlideDesktopRight(desk.scrollLeft + desk.clientWidth < desk.scrollWidth - 4);
    }
    const mob = mobileBarRef.current;
    if (mob) {
      setCanSlideMobileBarLeft(mob.scrollLeft > 4);
      setCanSlideMobileBarRight(mob.scrollLeft + mob.clientWidth < mob.scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    updateSlideButtons();
    window.addEventListener('resize', updateSlideButtons);
    return () => window.removeEventListener('resize', updateSlideButtons);
  }, [updateSlideButtons, navLinks.length]);

  const slideContainer = (ref: React.RefObject<HTMLElement | null>, direction: 'left' | 'right', step = 240) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const centerNavButtonHorizontally = (btn: HTMLButtonElement) => {
    const parent = btn.parentElement;
    if (!parent) return;
    const pRect = parent.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const targetLeft = parent.scrollLeft + (bRect.left - pRect.left) - (pRect.width / 2 - bRect.width / 2);
    parent.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 xl:gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group shrink-0 min-w-0 max-w-[62vw] sm:max-w-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 p-0.5 shadow-lg shadow-red-900/40 group-hover:scale-105 transition overflow-hidden shrink-0">
            <img
              src={seoSettings?.logoUrl || '/logo.jpg'}
              alt={siteSettings.siteName}
              className="w-full h-full rounded-[10px] object-cover bg-zinc-950"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-heading font-black text-base sm:text-xl tracking-tight text-white group-hover:text-red-400 transition truncate">
                {brandParts[0]}
              </span>
              {brandParts[1] && (
                <>
                  <span className="font-mono text-[10px] sm:text-xs text-red-500 font-extrabold tracking-widest shrink-0">//</span>
                  <span className="font-heading font-extrabold text-base sm:text-xl tracking-wider text-zinc-300 truncate">
                    {brandParts[1]}
                  </span>
                </>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-widest text-zinc-400 uppercase font-semibold hidden xs:block -mt-0.5 truncate">
              {siteSettings.siteTagline}
            </span>
          </div>
        </button>

        {/* Slidable Desktop Navigation Track */}
        <div className="hidden xl:flex flex-1 min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => slideContainer(desktopNavRef, 'left')}
            disabled={!canSlideDesktopLeft}
            aria-label="Slide pages left"
            className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer ${
              canSlideDesktopLeft
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-red-500/50'
                : 'bg-zinc-950 border-zinc-800/60 text-zinc-600 opacity-50 cursor-default'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <nav
            ref={desktopNavRef}
            onScroll={updateSlideButtons}
            className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1"
          >
            {navLinks.map((link) => {
              const active = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={(e) => {
                    centerNavButtonHorizontally(e.currentTarget);
                    handleNavClick(link.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'text-white bg-red-600/20 border border-red-500/40'
                      : link.highlight
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                      : link.badge
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {link.icon && <link.icon className={`w-3.5 h-3.5 ${link.highlight ? 'text-yellow-400' : link.badge ? 'text-emerald-400' : ''}`} />}
                  <span>{link.label}</span>
                  {(link as any).stockPill && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-900 border border-emerald-500/40 text-emerald-400">
                      {(link as any).stockPill}
                    </span>
                  )}
                  {link.highlight && !(link as any).stockPill && (
                    <span className="text-[9px] px-1 py-0.2 bg-red-600 text-white rounded font-bold uppercase animate-pulse">
                      HOT
                    </span>
                  )}
                  {link.badge && (
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-600 text-white rounded font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => slideContainer(desktopNavRef, 'right')}
            disabled={!canSlideDesktopRight}
            aria-label="Slide pages right"
            className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer ${
              canSlideDesktopRight
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-red-500/50'
                : 'bg-zinc-950 border-zinc-800/60 text-zinc-600 opacity-50 cursor-default'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Balance & Deposit/Withdraw buttons — strictly authenticated members only */}
          {currentUser ? (
            <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 pl-3 shadow-inner">
              <div className="mr-2 text-right">
                <span className="text-[10px] text-zinc-400 block -mb-0.5">
                  {t('nav.vaultBalance', 'Vault Balance')} ({selectedCurrency.code})
                </span>
                <span className="font-mono font-bold text-xs text-emerald-400 tabular-nums">
                  {formatCurrency(balances.usd)}
                </span>
              </div>
              <button
                onClick={onOpenDeposit}
                className="p-1.5 px-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                title="Deposit Crypto / USD"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('nav.deposit', 'Deposit')}</span>
              </button>
              {onOpenWithdraw && (
                <button
                  onClick={onOpenWithdraw}
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1 shadow-sm transition ml-1 border border-zinc-700"
                  title="Withdraw Crypto / Bank Wire"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                  <span>{t('nav.withdraw', 'Withdraw')}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* WhatsApp VIP Concierge Quick Link */}
          {whatsappChannel && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition"
              title="Chat with WhatsApp VIP Concierge"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">WhatsApp</span>
            </a>
          )}

          {/* Dedicated Admin Suite shortcut — visible ONLY to authenticated administrators */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
              }`}
              title="Open Restricted Executive Admin Suite (/admin)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Suite</span>
            </button>
          )}

          {/* User Account / Menu Dropdown (Both Authenticated & Guest with Cart, Notifications, Theme & Language) */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="relative flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
                aria-label="User account and settings menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-red-500/40"
                />
                <span className="hidden lg:inline text-xs font-medium text-white max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                {(totalCartCount > 0 || unreadNotificationsCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {totalCartCount + unreadNotificationsCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold shadow-sm transition"
                aria-label="Account, cart, and preferences menu"
              >
                <User className="w-3.5 h-3.5 text-red-500" />
                <span>Menu</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                {(totalCartCount > 0 || unreadNotificationsCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {totalCartCount + unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {userDropdownOpen && (
              <>
                {/* Backdrop dismiss */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />

                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[82vh] overflow-y-auto rounded-2xl bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 shadow-2xl py-2 z-50 text-zinc-200 animate-in fade-in slide-in-from-top-2"
                >
                  {/* User Profile Header or Guest Sign-in */}
                  {currentUser ? (
                    <div className="px-4 py-2.5 border-b border-zinc-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                          title="Log out of your account"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Log Out</span>
                        </button>
                      </div>
                      <span className="inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                        {currentUser.role === 'admin' ? currentUser.adminRoleLabel || 'Administrator' : `${currentUser.tier} Member`}
                      </span>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-xs font-bold text-white mb-2">Welcome to Apex Tesla Hub</p>
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5 transition"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In / Register</span>
                      </button>
                    </div>
                  )}

                  {/* Slidable Pages Explorer inside User Menu */}
                  <div className="px-3 py-2 border-b border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                        Browse Pages ({navLinks.length})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => slideContainer(dropdownPagesRef, 'left', 180)}
                          className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer"
                          aria-label="Slide dropdown pages left"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => slideContainer(dropdownPagesRef, 'right', 180)}
                          className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer"
                          aria-label="Slide dropdown pages right"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div
                      ref={dropdownPagesRef}
                      className="flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5"
                    >
                      {navLinks.map((link) => {
                        const active = activeTab === link.id;
                        return (
                          <button
                            key={`drop-${link.id}`}
                            type="button"
                            onClick={() => {
                              handleNavClick(link.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap border transition cursor-pointer ${
                              active
                                ? 'bg-red-600/25 border-red-500/50 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {link.icon && <link.icon className="w-3 h-3 text-red-400" />}
                            <span>{link.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Functional Actions: Authenticated Users Only */}
                  {currentUser && (
                    <div className="px-2 py-1.5 border-b border-zinc-800 space-y-1">
                      <button
                        onClick={() => {
                          onOpenCart();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Shopping Cart</span>
                        </div>
                        {totalCartCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                            {totalCartCount} items
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">0 items</span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span className="font-medium">Notifications & Alerts</span>
                        </div>
                        {unreadNotificationsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                            {unreadNotificationsCount} new
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">All read</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Core Navigation Items */}
                  <div className="px-2 py-1.5 border-b border-zinc-800 space-y-0.5">
                    {currentUser && (
                      <>
                        <button
                          onClick={() => {
                            handleNavClick('dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-200 hover:text-white transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <LayoutDashboard className="w-4 h-4 text-red-500" />
                            <span>User Dashboard</span>
                          </div>
                        </button>

                        {onOpenTracking && (
                          <button
                            onClick={() => {
                              onOpenTracking();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center gap-2.5 text-zinc-300 hover:text-white transition"
                          >
                            <Truck className="w-4 h-4 text-cyan-400" />
                            <span>Track Vehicle & Orders</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onOpenDeposit();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center gap-2.5 text-zinc-300 hover:text-white transition"
                        >
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span>Crypto Deposit & Wallet</span>
                        </button>

                        {onOpenWithdraw && (
                          <button
                            onClick={() => {
                              onOpenWithdraw();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center gap-2.5 text-zinc-300 hover:text-white transition"
                          >
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            <span>Request Payout / Withdrawal</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            handleNavClick('referrals');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-300 hover:text-white transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span>Refer & Earn</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            +$100
                          </span>
                        </button>
                      </>
                    )}

                    {dropdownMenuLinks.map((m) => {
                      const DropIcon = (m.iconName && iconMap[m.iconName]) || Megaphone;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            handleNavClick(m.targetTab);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-300 hover:text-white transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <DropIcon className="w-4 h-4 text-red-400" />
                            <span>{m.label}</span>
                          </div>
                          {m.badge && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
                              {m.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preferences: Theme Toggle & Language Selector */}
                  <div className="px-3 py-2.5 border-b border-zinc-800 space-y-2">
                    {/* Theme Switcher Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        {isLight ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="font-medium">Theme</span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition"
                      >
                        <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
                        <span className="text-[10px] text-zinc-500">Toggle</span>
                      </button>
                    </div>

                    {/* Language Switcher Selector */}
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300 mb-1.5">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">Language</span>
                        <span className="text-[10px] text-zinc-500 uppercase">({currentLanguageOption.code})</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {languages.map((lang) => {
                          const isSelected = lang.code === currentLanguageOption.code;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                              }}
                              className={`py-1 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                                isSelected
                                  ? 'bg-red-600/30 border-red-500 text-white'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                              title={lang.name}
                            >
                              <span>{lang.flag}</span>
                              <span className="uppercase text-[10px] font-mono">{lang.code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Currency Switcher (Site Settings) */}
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">Display Currency</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {selectedCurrency.code} (×{selectedCurrency.multiplier})
                        </span>
                      </div>
                      <select
                        value={selectedCurrencyCode}
                        onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                        aria-label="Select local display currency"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        {currencies
                          .filter((c) => c.isActive)
                          .map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} ({c.symbol.trim()}) — {c.name} (×{c.multiplier})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Sign Out or VIP Link */}
                  {currentUser ? (
                    <div className="px-2 pt-1.5 pb-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 hover:text-white flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Log Out</span>
                        </span>
                        <span className="text-[10px] font-mono text-red-400/80">End Session</span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 pt-2 text-[11px] text-zinc-500 text-center">
                      Need help? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Chat VIP WhatsApp</a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu burger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tablet & Mobile Slidable Pages Strip (Always Accessible Under Header) */}
      <div className="xl:hidden border-t border-zinc-900 bg-zinc-950/90 px-2 sm:px-4 py-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => slideContainer(mobileBarRef, 'left', 200)}
          disabled={!canSlideMobileBarLeft}
          aria-label="Slide pages left"
          className={`p-1 rounded-lg border shrink-0 transition cursor-pointer ${
            canSlideMobileBarLeft
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
              : 'bg-zinc-950 border-zinc-800/60 text-zinc-600 opacity-45 cursor-default'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div
          ref={mobileBarRef}
          onScroll={updateSlideButtons}
          className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navLinks.map((link) => {
            const active = activeTab === link.id;
            return (
              <button
                key={`mob-rail-${link.id}`}
                type="button"
                onClick={(e) => {
                  centerNavButtonHorizontally(e.currentTarget);
                  handleNavClick(link.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap border transition cursor-pointer ${
                  active
                    ? 'text-white bg-red-600/25 border-red-500/50'
                    : link.highlight
                    ? 'text-yellow-400 border-yellow-500/20 bg-zinc-900/70'
                    : 'text-zinc-300 border-zinc-800 bg-zinc-900/60 hover:text-white'
                }`}
              >
                {link.icon && <link.icon className="w-3 h-3" />}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => slideContainer(mobileBarRef, 'right', 200)}
          disabled={!canSlideMobileBarRight}
          aria-label="Slide pages right"
          className={`p-1 rounded-lg border shrink-0 transition cursor-pointer ${
            canSlideMobileBarRight
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
              : 'bg-zinc-950 border-zinc-800/60 text-zinc-600 opacity-45 cursor-default'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-5 space-y-3 max-h-[calc(100vh-7.5rem)] overflow-y-auto animate-in slide-in-from-top-2">
          {/* Quick Balance Mobile — authenticated users only */}
          {currentUser && (
            <>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 mb-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Available Vault Balance</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    ${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenDeposit();
                      setMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-red-600 text-white font-bold text-xs flex-1 text-center"
                  >
                    + Deposit
                  </button>
                  {onOpenWithdraw && (
                    <button
                      onClick={() => {
                        onOpenWithdraw();
                        setMobileMenuOpen(false);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex-1 text-center"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Cart & Notifications Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => {
                    onOpenCart();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-red-500" />
                    <span>Cart</span>
                  </div>
                  {totalCartCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                      {totalCartCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">0</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleNavClick('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Alerts</span>
                  </div>
                  {unreadNotificationsCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">0</span>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 mb-2">
            {currentUser && onOpenTracking && (
              <button
                onClick={() => {
                  onOpenTracking();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Track Orders</span>
              </button>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp VIP</span>
            </a>
          </div>

          {/* Slidable Pages Slider inside Mobile Menu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                All Platform Pages (Slide)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => slideContainer(mobileDrawerPagesRef, 'left', 220)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  aria-label="Slide mobile drawer pages left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => slideContainer(mobileDrawerPagesRef, 'right', 220)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  aria-label="Slide mobile drawer pages right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={mobileDrawerPagesRef}
              className="flex items-stretch gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1"
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border shrink-0 whitespace-nowrap ${
                    activeTab === link.id
                      ? 'bg-red-600/20 border-red-500/50 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-red-500" />}
                  <span>{link.label}</span>
                </button>
              ))}
              {mobileOnlyLinks.map((m) => {
                const MobIcon = (m.iconName && iconMap[m.iconName]) || Megaphone;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleNavClick(m.targetTab)}
                    className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border shrink-0 whitespace-nowrap ${
                      activeTab === m.targetTab
                        ? 'bg-red-600/20 border-red-500/50 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <MobIcon className="w-4 h-4 text-amber-400" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Language Switcher */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2">
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span>Language / Idioma / 语言 / 言語</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {languages.map((lang) => {
                const isSelected = lang.code === currentLanguageOption.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                      isSelected
                        ? 'bg-red-600/30 border-red-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="uppercase text-[10px] font-mono">{lang.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Theme Switcher */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={toggleTheme}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center gap-2 cursor-pointer font-semibold text-xs"
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Theme: High-Contrast Light (Click to switch to Dark)</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Theme: Dark Mode (Click to switch to Light)</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1 flex justify-between items-center gap-2 text-xs">
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => {
                  handleNavClick('admin');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Suite</span>
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500 font-mono">
                {currentUser ? `Member: ${currentUser.tier}` : 'Public Customer Access'}
              </span>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleNavClick('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
