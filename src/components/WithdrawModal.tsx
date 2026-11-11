import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
  Clock,
  ArrowRight,
  Building,
  RefreshCw,
  Info,
  DollarSign,
  Lock,
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onOpenDeposit }) => {
  const {
    currentUser,
    balances,
    withdrawalSettings,
    withdrawalRequests,
    requestWithdrawal,
    isEligibleForWithdrawal,
    setUserDepositedForDemo,
    showToast,
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<'USDT_TRC20' | 'BTC' | 'USDT_ERC20' | 'ETH' | 'BNB' | 'BANK_WIRE'>('USDT_TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [routingNumber, setRoutingNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>(currentUser?.name || 'Alex Vance');
  const [securityPin, setSecurityPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (!isOpen) return null;

  const eligibility = isEligibleForWithdrawal(currentUser);
  const numAmount = parseFloat(withdrawAmount) || 0;
  const userWithdrawals = withdrawalRequests.filter((r) => r.userId === currentUser?.id);

  const methodsList = [
    { id: 'USDT_TRC20', name: 'USDT (TRC-20)', network: 'TRON TRC-20', icon: '🟢', fee: '0% Free', estTime: '10 - 20 Mins' },
    { id: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Native', icon: '🟠', fee: '0% Free', estTime: '15 - 45 Mins' },
    { id: 'USDT_ERC20', name: 'USDT (ERC-20)', network: 'Ethereum ERC-20', icon: '🔵', fee: '0% Free', estTime: '10 - 25 Mins' },
    { id: 'ETH', name: 'Ethereum (ETH)', network: 'Ethereum Mainnet', icon: '🔷', fee: '0% Free', estTime: '10 - 25 Mins' },
    { id: 'BNB', name: 'BNB (BEP-20)', network: 'BNB Smart Chain', icon: '🟡', fee: '0% Free', estTime: '5 - 15 Mins' },
    { id: 'BANK_WIRE', name: 'Bank Wire / ACH', network: 'Direct FedWire / ACH', icon: '🏛️', fee: '0% Free', estTime: 'Same-Day Wire' },
  ];

  const handlePercentageSelect = (pct: number) => {
    const calculated = (balances.usd * pct) / 100;
    setWithdrawAmount(calculated > 0 ? Math.floor(calculated).toString() : '0');
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eligibility.eligible) {
      showToast(eligibility.reason || 'You must complete a minimum deposit of $200 before withdrawing.', 'error');
      return;
    }

    if (numAmount < withdrawalSettings.minWithdrawalUsd) {
      showToast(`Minimum withdrawal is $${withdrawalSettings.minWithdrawalUsd} USD.`, 'error');
      return;
    }

    if (numAmount > balances.usd) {
      showToast(`Insufficient vault balance ($${balances.usd.toFixed(2)} USD).`, 'error');
      return;
    }

    if (selectedMethod === 'BANK_WIRE') {
      if (!bankName || !accountNumber || !routingNumber) {
        showToast('Please provide your complete bank routing and account details.', 'error');
        return;
      }
    } else {
      if (!destinationAddress || destinationAddress.trim().length < 8) {
        showToast(`Please enter a valid recipient address for ${selectedMethod}.`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const selectedObj = methodsList.find((m) => m.id === selectedMethod);
      const res = await requestWithdrawal(
        numAmount,
        selectedObj?.name || selectedMethod,
        selectedMethod === 'BANK_WIRE' ? `${bankName} • Acc: ****${accountNumber.slice(-4)}` : destinationAddress.trim(),
        {
          network: selectedObj?.network,
          bankName,
          accountNumber,
          routingNumber,
          accountName,
        }
      );

      if (res.success) {
        setWithdrawAmount('');
        setDestinationAddress('');
        setSecurityPin('');
        setShowHistory(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-red-950/20 overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-white">WITHDRAW FUNDS</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Instant Dispatch
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Available Vault Balance:{' '}
                <strong className="text-emerald-400 font-mono">${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* CRITICAL WITHDRAWAL REJECTION ALERT (Triggered if user has not completed minimum $200 deposit) */}
          {!eligibility.eligible ? (
            <div className="rounded-2xl border-2 border-red-500/50 bg-gradient-to-b from-red-950/40 via-zinc-950 to-red-950/20 p-5 space-y-4 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-lg shadow-red-600/30 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-base text-red-400 tracking-wide uppercase">
                    WITHDRAWAL REQUEST REJECTED: DEPOSIT REQUIRED
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Under Apex AML & On-Chain Security Protocol, members must have completed a cumulative verified deposit of at least{' '}
                    <strong className="text-yellow-400 font-semibold">${withdrawalSettings.minDepositRequiredUsd.toLocaleString()} USD</strong> before cash-out withdrawals can be processed.
                  </p>
                </div>
              </div>

              {/* Progress Bar of verified deposit */}
              <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Verified Deposits Completed:</span>
                  <span className="font-mono font-bold text-red-400">
                    ${eligibility.totalDeposited.toFixed(2)} / ${withdrawalSettings.minDepositRequiredUsd.toFixed(2)} USD
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (eligibility.totalDeposited / withdrawalSettings.minDepositRequiredUsd) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Status: <strong className="text-red-400">Locked (Zero / Incomplete Deposits)</strong></span>
                  <span>Amount Remaining: <strong className="text-yellow-400 font-mono">${Math.max(0, withdrawalSettings.minDepositRequiredUsd - eligibility.totalDeposited).toFixed(2)} USD</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Deposit $200 to Activate Withdrawals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Tester / Evaluator Simulation Quick-Action */}
                <button
                  type="button"
                  onClick={() => setUserDepositedForDemo(500)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-[11px] font-semibold transition shrink-0"
                  title="Simulate a $500 verified deposit to unlock the withdrawal form"
                >
                  ⚡ Demo: Set $500 Deposit
                </button>
              </div>
            </div>
          ) : (
            /* ELIGIBILITY VERIFIED BANNER */
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Withdrawal Access Active:</strong> Verified deposit of{' '}
                  <span className="font-mono font-bold text-white">${eligibility.totalDeposited.toFixed(2)} USD</span> on file.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUserDepositedForDemo(0)}
                className="text-[10px] text-zinc-400 hover:text-red-400 underline shrink-0 transition"
                title="Reset deposit to $0 to test the rejection alert again"
              >
                Reset to $0 for testing
              </button>
            </div>
          )}

          {/* Toggle between Withdraw Form and History */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !showHistory ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'
                }`}
              >
                New Withdrawal
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  showHistory ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Payout History ({userWithdrawals.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Fee: <strong className="text-emerald-400">{withdrawalSettings.feePercent}% Free</strong>
            </span>
          </div>

          {!showHistory ? (
            /* WITHDRAWAL FORM */
            <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
              {/* Select Payout Method */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {methodsList.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500/70 text-white shadow-sm shadow-red-950/30'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{m.icon}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">
                            {m.fee}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white block">{m.name}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">{m.estTime}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">
                    Withdrawal Amount (USD)
                  </label>
                  <span className="text-zinc-400">
                    Min: <strong className="text-zinc-200">${withdrawalSettings.minWithdrawalUsd}</strong> • Max: <strong className="text-zinc-200">${withdrawalSettings.maxWithdrawalUsd.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    min={withdrawalSettings.minWithdrawalUsd}
                    max={balances.usd}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>

                {/* Percentage Quick Pick */}
                <div className="flex items-center gap-2 pt-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentageSelect(pct)}
                      className="flex-1 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white transition"
                    >
                      {pct === 100 ? 'MAX' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Destination Input */}
              {selectedMethod === 'BANK_WIRE' ? (
                <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>Beneficiary Bank Information</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Account Holder</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Legal Account Name"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Routing / ABA Number</label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="9-digit routing"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account number"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-zinc-300 uppercase tracking-wider">
                      Recipient {selectedMethod.replace('_', ' ')} Destination Address
                    </label>
                    <span className="text-zinc-400 text-[11px]">Network: {methodsList.find((m) => m.id === selectedMethod)?.network}</span>
                  </div>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder={`Paste your ${selectedMethod.replace('_', ' ')} address`}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-red-500 transition"
                    required
                  />
                </div>
              )}

              {/* Summary Breakdown */}
              <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Gross Withdrawal:</span>
                  <span className="font-mono text-white">${numAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Platform Processing Fee (0%):</span>
                  <span className="font-mono text-emerald-400">$0.00 USD (Waived)</span>
                </div>
                <div className="flex items-center justify-between font-bold text-white border-t border-zinc-800 pt-1.5">
                  <span>Net Payout Dispatched:</span>
                  <span className="font-mono text-emerald-400">${numAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !eligibility.eligible}
                className={`w-full py-3.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                  eligibility.eligible
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Request...</span>
                  </>
                ) : eligibility.eligible ? (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Confirm & Dispatch Withdrawal</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Withdrawal Locked ($200 Deposit Required)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* PAYOUT HISTORY VIEW */
            <div className="space-y-3">
              {userWithdrawals.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-zinc-600 opacity-60" />
                  <p>No withdrawal requests submitted yet.</p>
                </div>
              ) : (
                userWithdrawals.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-mono text-sm">${req.amountUsd.toLocaleString()} USD</strong>
                        <span className="text-zinc-400 font-semibold">• {req.currency}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-xs font-mono">
                        Dest: {req.destinationAddress}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {new Date(req.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'approved' || req.status === 'processed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : req.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.txHash && (
                        <span className="block text-[10px] text-emerald-400 font-mono mt-0.5 truncate max-w-[120px]">
                          {req.txHash}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
