import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Shield,
  ArrowRight,
  Gift,
  Sparkles,
  Eye,
  EyeOff,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Copy,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onNavigateToAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onNavigateToAdmin,
}) => {
  const { login, register, signUpWithGoogle } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Fremont, CA');
  const [preferredCenter, setPreferredCenter] = useState('Apex Fremont Technology Center');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    }
    return '';
  });

  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'admin_email' | 'admin_password' | null>(null);

  if (!isOpen) return null;

  const DEMO_CUSTOMER_EMAIL = 'alex.vance@apex-tesla.io';
  const DEMO_CUSTOMER_PASS = 'TeslaPlaid2026!';
  const DEMO_ADMIN_EMAIL = 'admin.ops@apex-tesla.io';
  const DEMO_ADMIN_PASS = 'AdminTesla2026!';

  const handleCopyDemo = (
    field: 'email' | 'password' | 'admin_email' | 'admin_password',
    value: string
  ) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Password strength check
  const isLengthValid = password.length >= 8;
  const hasMixedChars = /[0-9]/.test(password) && /[a-zA-Z]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMessage('Please enter both your email address and password.');
        return;
      }
      setIsLoading(true);
      const success = await login(email.trim(), password);
      setIsLoading(false);
      if (success) {
        onClose();
      } else {
        setErrorMessage('Invalid customer credentials or restricted account. Check your details or use the Public Demo User credentials below.');
      }
    } else {
      if (!name.trim() || !email.trim()) {
        setErrorMessage('Full name and email are required.');
        return;
      }
      if (!isLengthValid) {
        setErrorMessage('Password must contain at least 8 characters for cryptographic security.');
        return;
      }
      setIsLoading(true);
      const success = await register(
        name.trim(),
        email.trim(),
        password,
        phone.trim(),
        referralCode.trim(),
        'Tesla owner & performance driving enthusiast.',
        location,
        preferredCenter
      );
      setIsLoading(false);
      if (success) {
        onClose();
      } else {
        setErrorMessage('Account registration failed. Please try a different email or check inputs.');
      }
    }
  };

  const handleDemoCustomerLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const ok = await login(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASS);
    setIsLoading(false);
    if (ok) {
      onClose();
    }
  };

  const handleFillDemoCustomer = () => {
    setMode('login');
    setEmail(DEMO_CUSTOMER_EMAIL);
    setPassword(DEMO_CUSTOMER_PASS);
    setErrorMessage(null);
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const result = await signUpWithGoogle(referralCode);
    setIsGoogleLoading(false);
    if (result.success) {
      onClose();
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-950/70 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-sm shadow-inner">
              T
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white tracking-wide">
                {mode === 'login' ? 'Tesla Customer Sign In' : 'Create Apex Tesla Account'}
              </h3>
              <p className="text-xs text-zinc-400">Personalized dashboard, service history & session security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 mb-2 bg-zinc-900/90 rounded-xl border border-zinc-800 shrink-0">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-2 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4 overflow-y-auto">
          {/* Google Social Sign-Up / Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm shadow-md flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer border border-zinc-200"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span>{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              {mode === 'login' && (
                <span className="text-[11px] text-zinc-400 hover:text-red-400 cursor-pointer">
                  scrypt Salted Verification
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      isLengthValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isLengthValid ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </div>
                  <span className={isLengthValid ? 'text-emerald-400' : 'text-zinc-500'}>
                    At least 8 characters long
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      hasMixedChars ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {hasMixedChars ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </div>
                  <span className={hasMixedChars ? 'text-emerald-400' : 'text-zinc-500'}>
                    Letters and numbers recommended
                  </span>
                </div>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Preferred Apex Service Center</label>
                <select
                  value={preferredCenter}
                  onChange={(e) => setPreferredCenter(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Apex Fremont Technology Center">Apex Fremont Technology Center (CA)</option>
                  <option value="Apex Austin Gigafactory Hub">Apex Austin Gigafactory Hub (TX)</option>
                  <option value="Apex Nevada Battery Operations">Apex Nevada Battery Operations (NV)</option>
                  <option value="Apex Berlin Super-Hub Europe">Apex Berlin Super-Hub (Europe)</option>
                  <option value="Apex Mobile Ranger Dispatch">Apex Mobile Ranger (Doorstep Service)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-zinc-300">Invite / Referral Code (Optional)</label>
                  <span className="text-emerald-400 font-semibold text-[11px]">+$25 Credit & 5 Spins</span>
                </div>
                <div className="relative">
                  <Gift className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. APEX-ALEX-99"
                    className="w-full bg-zinc-900/90 border border-emerald-500/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {referralCode && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Referral bonus active: $25 welcome service credit applied!</span>
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-bold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Securing Session...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Access Personalized Dashboard'
                    : referralCode
                    ? 'Create Account & Claim $25 Bonus'
                    : 'Create Account & Claim 3 Free Spins'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Public Demo Customer Access Card */}
          <div className="pt-3 border-t border-zinc-800 space-y-2.5">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Public Demo User Account</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Use these public customer credentials to explore the dashboard, wallet, fleet & orders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCustomer}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shrink-0 cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-300 truncate">{DEMO_CUSTOMER_EMAIL}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyDemo('email', DEMO_CUSTOMER_EMAIL)}
                    className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                    title="Copy demo email"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-300 truncate">{DEMO_CUSTOMER_PASS}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyDemo('password', DEMO_CUSTOMER_PASS)}
                    className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                    title="Copy demo password"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoCustomerLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-red-500/50 text-white text-xs font-bold transition flex items-center justify-between cursor-pointer"
              >
                <span>Instant Sign In as Demo Customer (Alex Vance)</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>

            {/* Admin Demo Login Details Card (links cleanly to separated /admin URL) */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Demo Login Details</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Executive admin accounts authenticate on the dedicated <code className="text-amber-300">/admin</code> URL
                  </p>
                </div>
                {onNavigateToAdmin && (
                  <button
                    type="button"
                    onClick={onNavigateToAdmin}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shrink-0 cursor-pointer"
                  >
                    Open /admin
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-200 truncate">{DEMO_ADMIN_EMAIL}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyDemo('admin_email', DEMO_ADMIN_EMAIL)}
                    className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                    title="Copy admin email"
                  >
                    {copiedField === 'admin_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-200 truncate">{DEMO_ADMIN_PASS}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyDemo('admin_password', DEMO_ADMIN_PASS)}
                    className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                    title="Copy admin password"
                  >
                    {copiedField === 'admin_password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>scrypt Salted Hashing • Customer Portal • 2FA Ready</span>
          </div>
        </form>
      </div>
    </div>
  );
};
