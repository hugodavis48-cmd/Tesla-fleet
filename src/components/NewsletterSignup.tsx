import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsletterSubscriber } from '../types';

interface NewsletterSignupProps {
  source?: NewsletterSubscriber['source'];
  variant?: 'feature' | 'compact';
}

const INTEREST_OPTIONS: NewsletterSubscriber['interestCategory'][] = [
  'All Updates',
  'Service & Wraps',
  'Fleet & Yield',
  'Vehicle Drops & Promos',
];

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  source = 'home_banner',
  variant = 'feature',
}) => {
  const { subscribeToNewsletter, currentUser } = useApp();
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [interestCategory] =
    useState<NewsletterSubscriber['interestCategory']>('All Updates');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedSub, setConfirmedSub] = useState<NewsletterSubscriber | null>(null);
  const [alreadyActive, setAlreadyActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Enter a valid email address (for example, owner@tesla-club.com).');
      return;
    }

    setIsSubmitting(true);
    const result = await subscribeToNewsletter({
      email: trimmedEmail,
      name: name.trim(),
      interestCategory,
      source,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Could not complete newsletter signup. Please try again.');
      return;
    }

    if (result.subscriber) {
      setConfirmedSub(result.subscriber);
      setAlreadyActive(Boolean(result.alreadySubscribed));
    }
  };

  const handleReset = () => {
    setConfirmedSub(null);
    setAlreadyActive(false);
    setEmail('');
    setName('');
    setErrorMsg(null);
  };

  if (variant === 'compact') {
    return (
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-sm text-white">
            Newsletter &amp; Allocation Bulletins
          </h4>
          <p className="text-xs text-zinc-400">
            Receive bay availability alerts, wrap studio releases, and fleet yield updates.
          </p>
        </div>

        {confirmedSub ? (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  {alreadyActive ? 'Preferences updated' : 'Subscribed to Apex Dispatch'}
                </p>
                <p className="text-zinc-400 mt-0.5">{confirmedSub.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-zinc-300 hover:text-white underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Add another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Enter your email address"
                aria-label="Newsletter email address"
                className="flex-1 min-w-0 bg-black border border-zinc-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-semibold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>Subscribe</span>
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <section
      aria-label="Newsletter Signup"
      className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 lg:p-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left editorial pitch */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-red-400">
            <Mail className="w-4 h-4 shrink-0" />
            <span>Direct Owner Briefings</span>
          </div>
          <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight [text-wrap:balance]">
            Priority Service Slots, Wrap Releases &amp; Fleet Yield Reports
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
            Receive verified bay booking windows, seasonal 3M wrap film allocations, and monthly autonomous fleet statements directly in your inbox.
          </p>
        </div>

        {/* Right form surface */}
        <div className="lg:col-span-7">
          {confirmedSub ? (
            <div className="p-6 rounded-2xl bg-black border border-emerald-500/35 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base text-white">
                    {alreadyActive
                      ? 'Subscription Preferences Updated'
                      : 'Confirmed on the Apex Mailing List'}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Dispatches for <span className="text-white font-medium">{confirmedSub.email}</span> are now active.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800 text-xs">
                <span className="font-mono text-zinc-500 tabular-nums">
                  Recorded {confirmedSub.subscribedAt}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Subscribe Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label htmlFor="nl-name" className="text-xs text-zinc-400 block mb-1.5">
                    Name (Optional)
                  </label>
                  <input
                    id="nl-name"
                    type="text"
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-black border border-zinc-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition"
                  />
                </div>
                <div className="sm:col-span-7">
                  <label htmlFor="nl-email" className="text-xs text-zinc-400 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="nl-email"
                    type="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="driver@apex-tesla.io"
                    className="w-full bg-black border border-zinc-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/35 text-xs text-rose-300 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-zinc-500">
                  Zero spam. Unsubscribe at any time.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Subscription...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe to Dispatch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
