import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminLoginPageProps {
  onReturnHome: () => void;
}

const ROOT_ADMIN_EMAIL = 'admin.ops@apex-tesla.io';
const ROOT_ADMIN_PASS = 'AdminTesla2026!';

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onReturnHome }) => {
  const { adminLogin, currentUser, logout } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const handleCopy = (field: 'email' | 'password', value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleFillAdminDemo = () => {
    setEmail(ROOT_ADMIN_EMAIL);
    setPassword(ROOT_ADMIN_PASS);
    setErrorMessage(null);
  };

  const handleInstantAdminLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const result = await adminLogin(ROOT_ADMIN_EMAIL, ROOT_ADMIN_PASS);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Access denied. Invalid administrator credentials.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Administrator email and password are required.');
      return;
    }

    setIsLoading(true);
    const result = await adminLogin(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Access denied. Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle architectural background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[340px] bg-amber-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md bg-zinc-950/95 border border-amber-500/35 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 backdrop-blur-xl">
        {/* Top Restricted Header */}
        <div className="px-6 py-6 bg-gradient-to-br from-amber-950/50 via-zinc-900 to-zinc-950 border-b border-zinc-800/90">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-bold">
              <Lock className="w-3 h-3" />
              <span>Restricted /admin Gateway</span>
            </span>
            <button
              type="button"
              onClick={onReturnHome}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-black text-xl text-white tracking-tight">
                Executive Admin Sign In
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Authorized personnel only. Customer logins are not permitted on this URL.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Customer Session Warning */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-xs space-y-2">
              <div className="flex items-start gap-2.5 text-zinc-300">
                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    Currently browsing as Customer ({currentUser.email})
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Customer accounts do not have permission to open <code className="text-amber-300">/admin</code>. Sign in with verified Administrator credentials below.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                >
                  Sign out customer session first
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Admin Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.ops@apex-tesla.io"
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter executive password"
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-heading font-black text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Admin Clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Executive Admin Suite</span>
                </>
              )}
            </button>
          </form>

          {/* Displayed Admin Demo Login Details Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Demo Login Details</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono uppercase">
                    Root Super-Admin
                  </span>
                </p>
                <p className="text-[10px] text-zinc-400">
                  Copy, auto-fill, or instant sign in with executive demo credentials below
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillAdminDemo}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 shrink-0 cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-200 truncate">{ROOT_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('email', ROOT_ADMIN_EMAIL)}
                  className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                  title="Copy admin email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-200 truncate">{ROOT_ADMIN_PASS}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('password', ROOT_ADMIN_PASS)}
                  className="text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                  title="Copy admin password"
                >
                  {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstantAdminLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <span>Instant Sign In as Root Super-Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RBAC Privilege Enforcement</span>
            </span>
            <span>/api/auth/admin/login</span>
          </div>
        </div>
      </div>
    </div>
  );
};
