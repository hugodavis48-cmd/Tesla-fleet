import React, { useState } from 'react';
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
  Check,
  Sun,
  Moon,
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
  const { currentUser, logout, balances, cart, userRole, setRole, adminNotifications, tslaQuote, featureToggles } = useApp();
  const { currentLanguageOption, setLanguage, languages, t } = useLanguage();
  const { theme, toggleTheme, isLight } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotificationsCount = adminNotifications.filter((n) => {
    const isRead = Boolean(n.isRead || (currentUser && n.readBy?.includes(currentUser.id)));
    const isTargeted = n.targetType === 'all' || (currentUser && n.targetUserId === currentUser.id);
    return !isRead && isTargeted;
  }).length;

  const navLinks = [
    { id: 'home', label: t('nav.home', 'Home') },
    ...(featureToggles.teslaStocksEnabled ? [{
      id: 'stocks',
      label: t('nav.stocks', 'TSLA Stocks & Fast ROI'),
      icon: Activity,
      highlight: true,
      stockPill: `$${tslaQuote.price.toFixed(1)}`,
      stockChange: tslaQuote.change24h,
    }] : []),
    { id: 'vehicles', label: t('nav.vehicles', 'Buy Tesla'), icon: Car, highlight: true },
    { id: 'coupons', label: t('nav.coupons', 'Coupons'), icon: Tag, highlight: true },
    { id: 'services', label: t('nav.services', 'Service & Fixes'), icon: Wrench },
    { id: 'wraps', label: t('nav.wraps', 'Wrap Studio'), icon: Palette },
    { id: 'rentals', label: t('nav.rentals', 'Rentals'), icon: Car },
    { id: 'investment', label: t('nav.investment', 'Fleet Yield'), icon: TrendingUp },
    { id: 'promotions', label: t('nav.promotions', 'Spin & Win'), icon: Gift },
    { id: 'referrals', label: t('nav.referrals', 'Refer & Earn'), icon: Users, badge: '+$100' },
    { id: 'social', label: t('nav.social', 'Social'), icon: Share2 },
    { id: 'shop', label: t('nav.shop', 'Parts & Store') },
    { id: 'about', label: t('nav.about', 'About') },
    { id: 'faq', label: t('nav.faq', 'FAQ') },
    { id: 'contact', label: t('nav.contact', 'Contact') },
  ];


  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 p-0.5 shadow-lg shadow-red-900/40 group-hover:scale-105 transition">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl tracking-tight text-white group-hover:text-red-400 transition">
                APEX
              </span>
              <span className="font-mono text-xs text-red-500 font-extrabold tracking-widest">//</span>
              <span className="font-heading font-extrabold text-xl tracking-wider text-zinc-300">
                TESLA
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-semibold block -mt-1">
              Service • Wraps • Fleet
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
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

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Global Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition shadow-sm"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{currentLanguageOption.flag}</span>
              <span className="uppercase font-mono text-[11px] font-bold">{currentLanguageOption.code}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl py-1.5 z-50 text-zinc-200 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                  Select Language
                </div>
                {languages.map((lang) => {
                  const isSelected = lang.code === currentLanguageOption.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-900 transition ${
                        isSelected ? 'bg-red-950/30 text-white font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* High-Contrast Light / Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition shadow-sm cursor-pointer"
            title={isLight ? 'Switch to Dark Theme' : 'Switch to High-Contrast Light Theme'}
            aria-label="Toggle theme"
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                <span className="hidden md:inline text-[11px] font-mono font-bold">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="hidden md:inline text-[11px] font-mono font-bold">Light</span>
              </>
            )}
          </button>

          {/* Quick Balance & Deposit/Withdraw buttons */}
          <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 pl-3 shadow-inner">
            <div className="mr-2 text-right">
              <span className="text-[10px] text-zinc-400 block -mb-0.5">{t('nav.vaultBalance', 'Vault Balance')}</span>
              <span className="font-mono font-bold text-xs text-emerald-400">
                ${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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


          {/* WhatsApp VIP Concierge Quick Link */}
          <a
            href="https://wa.me/18005552739?text=Hi%20Apex%20Tesla%20Hub!%20I%20am%20inquiring%20about%20vehicle%20service%20or%20fleet%20investments."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition"
            title="Chat with WhatsApp VIP Concierge"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">WhatsApp</span>
          </a>

          {/* Track Orders Quick Trigger */}
          {onOpenTracking && (
            <button
              onClick={onOpenTracking}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition"
              title="Track Vehicle & Parts Orders"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline text-[11px]">Track Order</span>
            </button>
          )}

          {/* User Notifications Bell */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
            title="User Notifications & Investment Dashboard"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Role switcher toggle (Customer vs Admin) */}
          <button
            onClick={() => setRole(userRole === 'admin' ? 'customer' : 'admin')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
              userRole === 'admin'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Switch between Customer view and Admin view"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{userRole === 'admin' ? 'Admin Ops' : 'Customer'}</span>
          </button>

          {/* User Account / Dashboard profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
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
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl py-2 z-50 text-zinc-200 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                      {currentUser.tier}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 hover:text-white transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-red-500" />
                    <span>Personalized Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenTracking) onOpenTracking();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 hover:text-white transition"
                  >
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Track Vehicle & Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 hover:text-white transition"
                  >
                    <Wrench className="w-3.5 h-3.5 text-red-500" />
                    <span>Service History & Tracker</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenDeposit();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 hover:text-white transition"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Crypto Deposit & Wallet</span>
                  </button>

                  {onOpenWithdraw && (
                    <button
                      onClick={() => {
                        onOpenWithdraw();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center gap-2 text-zinc-300 hover:text-white transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Payout / Withdrawal</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleNavClick('referrals');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-zinc-900 flex items-center justify-between text-zinc-300 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Refer & Earn</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      +$100
                    </span>
                  </button>

                  <div className="my-1 border-t border-zinc-800" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-red-950/40 text-red-400 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 flex items-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Up</span>
            </button>
          )}

          {/* Mobile menu burger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-6 space-y-3 animate-in slide-in-from-top-2">
          {/* Quick Balance Mobile */}
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


          <div className="grid grid-cols-2 gap-2 mb-2">
            {onOpenTracking && (
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
              href="https://wa.me/18005552739?text=Hi%20Apex%20Tesla%20Hub!%20I%20am%20inquiring%20about%20vehicle%20service%20or%20fleet%20investments."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp VIP</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border ${
                  activeTab === link.id
                    ? 'bg-red-600/20 border-red-500/50 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-red-500" />}
                <span>{link.label}</span>
              </button>
            ))}
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

          <div className="pt-1 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                setRole(userRole === 'admin' ? 'customer' : 'admin');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {userRole}</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  handleNavClick('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
