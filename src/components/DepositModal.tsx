import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CRYPTO_NETWORKS } from '../data/mockData';
import { CryptoCurrency, ManualDepositMethod } from '../types';
import {
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Clock,
  RefreshCw,
  QrCode,
  AlertTriangle,
  Coins,
  Building2,
  Smartphone,
  Send,
  XCircle,
  MessageCircle,
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: CryptoCurrency;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    manualDepositMethods,
    submitManualDepositRequest,
    depositRequests,
    refreshDepositRequests,
    socialLinks,
    showToast,
    currentUser,
  } = useApp();
  const { isBlue } = useTheme();

  const enabledManualMethods = useMemo(
    () => manualDepositMethods.filter((m) => m.enabled ?? m.isActive ?? true),
    [manualDepositMethods]
  );

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fiat' | 'e_wallet' | 'crypto'>('all');
  const filteredMethods = useMemo(
    () =>
      categoryFilter === 'all'
        ? enabledManualMethods
        : enabledManualMethods.filter((m) => (m.category || 'fiat') === categoryFilter),
    [enabledManualMethods, categoryFilter]
  );

  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    enabledManualMethods[0]?.id || ''
  );
  const [amountUsd, setAmountUsd] = useState<string>('500');
  const [txReference, setTxReference] = useState<string>('');
  const [senderDetails, setSenderDetails] = useState<string>('');
  const [senderNote, setSenderNote] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!filteredMethods.some((m) => m.id === selectedMethodId)) {
      setSelectedMethodId(filteredMethods[0]?.id || enabledManualMethods[0]?.id || '');
    }
  }, [filteredMethods, enabledManualMethods, selectedMethodId]);

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      void refreshDepositRequests();
    }
  }, [isOpen, currentUser?.id, refreshDepositRequests]);

  const activeMethod: ManualDepositMethod | undefined = useMemo(
    () =>
      filteredMethods.find((m) => m.id === selectedMethodId) ||
      enabledManualMethods[0],
    [filteredMethods, enabledManualMethods, selectedMethodId]
  );

  const methodTitle = activeMethod?.title || activeMethod?.name || 'Manual Bank Wire';
  const methodAddress = activeMethod?.accountNumber || activeMethod?.accountDetails || '';
  const methodCurrency = (activeMethod?.currencySymbol || activeMethod?.currency || 'USD').toUpperCase();
  const methodCategory: 'fiat' | 'e_wallet' | 'crypto' = activeMethod?.category || 'fiat';

  // Generate QR code when a crypto cold vault channel is active
  useEffect(() => {
    let cancelled = false;
    if (!isOpen || methodCategory !== 'crypto' || !methodAddress) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(methodAddress, {
      width: 180,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, methodCategory, methodAddress]);

  const numericUsd = Math.max(0, parseFloat(amountUsd) || 0);
  const feePercent = Math.max(0, Number(activeMethod?.feePercent) || 0);
  const feeUsd = Number(((numericUsd * feePercent) / 100).toFixed(2));
  const netUsd = Number(Math.max(0, numericUsd - feeUsd).toFixed(2));

  const cryptoUnitRate =
    methodCategory === 'crypto' && methodCurrency in CRYPTO_NETWORKS
      ? CRYPTO_NETWORKS[methodCurrency as CryptoCurrency].rateUsd
      : 1;
  const nativeTokenAmount =
    methodCategory === 'crypto' && cryptoUnitRate > 0
      ? Number((numericUsd / cryptoUnitRate).toFixed(methodCurrency === 'BTC' ? 6 : 2))
      : Number(numericUsd.toFixed(2));

  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    const cleanEmail = currentUser.email.trim().toLowerCase();
    return depositRequests.filter(
      (r) =>
        r.userId === currentUser.id ||
        (cleanEmail && r.userEmail?.trim().toLowerCase() === cleanEmail)
    );
  }, [depositRequests, currentUser]);

  const whatsappChannel = socialLinks.find((s) => s.platform === 'whatsapp' && s.enabled);
  const whatsappUrl =
    whatsappChannel?.url ||
    'https://wa.me/18005552739?text=Hi%20Apex%20Tesla%20Treasury%20Team!%20I%20submitted%20a%20manual%20deposit%20and%20would%20like%20assistance.';

  if (!isOpen) return null;

  const handleCopy = (val: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    showToast(`${label} copied to clipboard.`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMethod) {
      showToast('Please select an active treasury deposit method.', 'error');
      return;
    }
    const minUsd = activeMethod.minDepositUsd ?? 25;
    const maxUsd = activeMethod.maxDepositUsd ?? 500000;
    if (numericUsd < minUsd) {
      showToast(`Minimum deposit for ${methodTitle} is $${minUsd.toLocaleString()} USD.`, 'error');
      return;
    }
    if (numericUsd > maxUsd) {
      showToast(`Maximum single deposit for ${methodTitle} is $${maxUsd.toLocaleString()} USD.`, 'error');
      return;
    }
    const cleanRef = txReference.trim();
    if (cleanRef.length < 4) {
      showToast('Enter your Transfer Reference, Wire ID, or TX Hash (min 4 characters).', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await submitManualDepositRequest({
      methodId: activeMethod.id,
      methodTitle,
      category: methodCategory,
      currency: methodCategory === 'crypto' ? methodCurrency : 'USD',
      amount: nativeTokenAmount,
      usdEquivalent: numericUsd,
      txReference: cleanRef,
      senderDetails: senderDetails.trim() || undefined,
      senderNote: senderNote.trim() || undefined,
      proofNote: proofNote.trim() || undefined,
      feePercent,
    });
    setIsSubmitting(false);

    if (res.success && res.request) {
      setSubmittedRequestId(res.request.id);
      setTxReference('');
      setSenderDetails('');
      setSenderNote('');
      setProofNote('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800 ${
            isBlue
              ? 'bg-gradient-to-r from-blue-50 via-white to-blue-50'
              : 'bg-gradient-to-r from-zinc-950 via-red-950/20 to-zinc-950'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                isBlue
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-600'
                  : 'bg-red-600/20 border-red-500/30 text-red-500'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate">
                Manual Treasury Deposit &amp; Verification
              </h3>
              <p className="text-xs text-zinc-400 truncate">
                Bank Wire, CashApp, Zelle &amp; Cold-Vault Crypto • Admin Confirmed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deposit modal"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Mandatory Admin Verification Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/35 flex items-start gap-3 text-xs">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-400">
                Administrator Receipt Confirmation Required
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Complete your transfer using one of the official treasury channels below, then submit your payment reference or transaction hash. Funds are credited to your spendable vault immediately after an administrator confirms receipt.
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'all', label: 'All Channels', count: enabledManualMethods.length },
              {
                id: 'fiat',
                label: 'Bank Wire',
                count: enabledManualMethods.filter((m) => (m.category || 'fiat') === 'fiat').length,
              },
              {
                id: 'e_wallet',
                label: 'CashApp / Zelle',
                count: enabledManualMethods.filter((m) => m.category === 'e_wallet').length,
              },
              {
                id: 'crypto',
                label: 'Crypto Vaults',
                count: enabledManualMethods.filter((m) => m.category === 'crypto').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as typeof categoryFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? isBlue
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {enabledManualMethods.length === 0 ? (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-bold text-white">No Deposit Channels Currently Active</p>
              <p className="text-xs text-zinc-400">
                Please contact Treasury Concierge for wiring or cold-vault deposit instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Select Channel */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">
                  1. Select Official Treasury Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredMethods.map((method) => {
                    const active = activeMethod?.id === method.id;
                    const cat = method.category || 'fiat';
                    const Icon =
                      cat === 'crypto' ? Coins : cat === 'e_wallet' ? Smartphone : Building2;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                          active
                            ? isBlue
                              ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                              : 'bg-red-600/15 border-red-500 text-white'
                            : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              cat === 'crypto'
                                ? 'bg-amber-500/15 text-amber-400'
                                : cat === 'e_wallet'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-cyan-500/15 text-cyan-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">
                              {method.title || method.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 block truncate">
                              {method.currencySymbol || method.currency} • {method.processingTime || 'Admin Verified'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 shrink-0">
                          {Number(method.feePercent || 0) === 0 ? '0% Fee' : `${method.feePercent}% Fee`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Treasury Destination Details & QR Code */}
              {activeMethod && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                        2. Send Funds To Treasury Destination
                      </span>
                      <h4 className="font-heading font-bold text-sm text-white">
                        {methodTitle}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                      Min ${activeMethod.minDepositUsd.toLocaleString()} – Max ${activeMethod.maxDepositUsd.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 w-full space-y-2 text-xs font-mono">
                      {activeMethod.accountName && (
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] text-zinc-500 block">BENEFICIARY / RECIPIENT</span>
                            <span className="text-white font-bold break-all">{activeMethod.accountName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeMethod.accountName || '', 'Beneficiary Name')}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 shrink-0 cursor-pointer"
                            title="Copy beneficiary"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-zinc-500 block">
                            {methodCategory === 'crypto' ? 'COLD VAULT ADDRESS' : 'ACCOUNT NUMBER / HANDLE / TAG'}
                          </span>
                          <span className="text-emerald-400 font-bold break-all">{methodAddress}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(methodAddress, 'Destination Address / Account')}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 shrink-0 cursor-pointer"
                          title="Copy address or account"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {activeMethod.routingOrBank && (
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] text-zinc-500 block">
                              {methodCategory === 'crypto' ? 'NETWORK RAIL' : 'BANK / ROUTING'}
                            </span>
                            <span className="text-zinc-200 break-all">{activeMethod.routingOrBank}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeMethod.routingOrBank || '', 'Routing / Network')}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 shrink-0 cursor-pointer"
                            title="Copy routing or network"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {methodCategory === 'crypto' && qrDataUrl && (
                      <div className="shrink-0 mx-auto sm:mx-0 p-2.5 rounded-2xl bg-white border border-zinc-300 text-center space-y-1">
                        <img
                          src={qrDataUrl}
                          alt={`${methodCurrency} Vault QR`}
                          className="w-28 h-28 object-contain"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-800 flex items-center justify-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {methodCurrency} Scan
                        </span>
                      </div>
                    )}
                  </div>

                  {activeMethod.instructions && (
                    <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-950/70 border border-zinc-800/80 p-3 rounded-xl">
                      {activeMethod.instructions}
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Submit Receipt Reference for Admin Confirmation */}
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  3. Submit Transfer Details for Admin Approval
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Amount Sent (USD Equivalent)
                    </label>
                    <input
                      type="number"
                      min={activeMethod?.minDepositUsd ?? 25}
                      max={activeMethod?.maxDepositUsd ?? 500000}
                      step="any"
                      required
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-emerald-500 text-sm font-mono text-white outline-none"
                      placeholder="500"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[250, 500, 1000, 5000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmountUsd(String(preset))}
                          className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-[10px] font-mono text-zinc-300 cursor-pointer"
                        >
                          ${preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-1 flex flex-col justify-center">
                    <div className="flex justify-between text-zinc-400">
                      <span>Submitted Value:</span>
                      <span className="text-white font-bold">${numericUsd.toLocaleString()} USD</span>
                    </div>
                    {methodCategory === 'crypto' && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Estimated Crypto:</span>
                        <span className="text-amber-400 font-bold">
                          {nativeTokenAmount} {methodCurrency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>Channel Fee ({feePercent}%):</span>
                      <span>-${feeUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-1 text-emerald-400 font-bold">
                      <span>Net Vault Credit on Approval:</span>
                      <span>${netUsd.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Wire Reference / CashApp ID / Zelle Confirmation / Blockchain TX Hash <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder={
                      methodCategory === 'crypto'
                        ? 'Paste full TXID / transaction hash (e.g. 0x... or TRON hash)'
                        : 'Enter bank wire confirmation #, CashApp Cashtag TX, or Zelle Ref ID'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-emerald-500 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Sender Account / Cashtag / Wallet (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={senderDetails}
                      onChange={(e) => setSenderDetails(e.target.value)}
                      placeholder={
                        methodCategory === 'crypto'
                          ? 'e.g. 0x71C...89B or TRON wallet'
                          : 'e.g. Chase •••4421 / $alexvance / alex@zelle'
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Sender Note / Transfer Memo (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={senderNote}
                      onChange={(e) => setSenderNote(e.target.value)}
                      placeholder="e.g. Sent by Alex Vance on Nov 24"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Attached Proof Details / Receipt Reference (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="e.g. Explorer TX link, wire confirmation code, or receipt notes"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Receipt for Verification...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Deposit Receipt for Admin Confirmation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Confirmation Success Notice for Just-Submitted Request */}
          {submittedRequestId && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-400">
                  Deposit Receipt Queued ({submittedRequestId})
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  Our treasury administrators have received your transfer details. Your vault balance and email receipt will update automatically as soon as receipt of funds is confirmed.
                </p>
              </div>
            </div>
          )}

          {/* Live Recent Manual Deposit Requests Status */}
          {myRequests.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-white">
                  Recent Deposit Verification Requests ({myRequests.length})
                </span>
                <button
                  type="button"
                  onClick={() => void refreshDepositRequests()}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Status</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {myRequests.slice(0, 6).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{req.methodTitle}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ${Number(req.netUsd).toLocaleString()} USD
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block truncate">
                        Ref: {req.txReference} • Submitted {req.submittedAt.replace('T', ' ').slice(0, 16)}
                      </span>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <span className="text-[11px] text-rose-400 block mt-0.5">
                          Reason: {req.rejectionReason}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 inline-flex items-center gap-1 ${
                        req.status === 'approved'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {req.status === 'approved' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : req.status === 'rejected' ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {req.status === 'pending'
                        ? 'Pending Admin'
                        : req.status === 'approved'
                        ? 'Confirmed'
                        : 'Declined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concierge Support Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
            <span>Need expedited wire verification for high-value vehicle purchases?</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Message Treasury Desk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
