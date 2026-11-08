import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CRYPTO_NETWORKS } from '../data/mockData';
import { CryptoCurrency } from '../types';
import { X, Copy, CheckCircle2, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: CryptoCurrency;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, defaultCurrency = 'USDT' }) => {
  const { depositFunds, showToast } = useApp();
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>(defaultCurrency);
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmationStep, setConfirmationStep] = useState<number>(0);

  if (!isOpen) return null;

  const currentNetwork = CRYPTO_NETWORKS[selectedCurrency];
  const rateUsd = currentNetwork?.rateUsd || 1;
  const numAmount = parseFloat(depositAmount) || 0;
  const estimatedUsd = selectedCurrency === 'USDT' ? numAmount : numAmount * rateUsd;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Address copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSimulateDeposit = async () => {
    if (numAmount <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    if (numAmount < currentNetwork.minDeposit) {
      showToast(`Minimum deposit for ${selectedCurrency} is ${currentNetwork.minDeposit}.`, 'error');
      return;
    }

    setIsConfirming(true);
    setConfirmationStep(1);

    // Simulate blockchain validation nodes
    setTimeout(() => setConfirmationStep(2), 1200);
    setTimeout(async () => {
      setConfirmationStep(3);
      await depositFunds(selectedCurrency, numAmount);
      setIsConfirming(false);
      setConfirmationStep(0);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Instant Crypto Deposit Gateway</h3>
              <p className="text-xs text-zinc-400">Direct wallet funding for services, wraps, rentals & investment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Currency Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Select Deposit Cryptocurrency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CRYPTO_NETWORKS) as CryptoCurrency[]).map((curr) => {
                const info = CRYPTO_NETWORKS[curr];
                const active = selectedCurrency === curr;
                return (
                  <button
                    key={curr}
                    onClick={() => {
                      setSelectedCurrency(curr);
                      if (curr === 'BTC') setDepositAmount('0.02');
                      else if (curr === 'XRP') setDepositAmount('250');
                      else if (curr === 'BNB') setDepositAmount('1.5');
                      else setDepositAmount('500');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      active
                        ? 'border-red-500 bg-red-950/40 text-white shadow-lg shadow-red-950/30'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-heading font-bold text-base" style={{ color: info.iconColor }}>
                      {curr}
                    </span>
                    <span className="text-[10px] text-zinc-500">{info.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
              <span>Deposit Amount ({selectedCurrency})</span>
              <span>1 {selectedCurrency} ≈ ${rateUsd.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-red-500"
              />
              <span className="font-heading font-semibold text-zinc-300 px-3 py-2 bg-zinc-800 rounded-lg shrink-0">
                {selectedCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-zinc-500">Min: {currentNetwork.minDeposit} {selectedCurrency}</span>
              <span className="text-emerald-400 font-medium">
                Est. Value: ≈ ${Math.round(estimatedUsd).toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Address & QR Code */}
          <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-start gap-4">
              {/* Visual simulated QR code */}
              <div className="shrink-0 p-2 bg-white rounded-xl shadow-md flex flex-col items-center justify-center">
                <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" fill="black" rx="2" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="1" />
                  <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="black" rx="2" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="1" />
                  <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="black" rx="2" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="1" />
                  <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

                  {/* Matrix bit blocks */}
                  <rect x="36" y="8" width="6" height="6" fill="black" />
                  <rect x="48" y="14" width="6" height="6" fill="black" />
                  <rect x="36" y="24" width="6" height="6" fill="black" />
                  <rect x="54" y="24" width="6" height="6" fill="black" />
                  <rect x="12" y="38" width="6" height="6" fill="black" />
                  <rect x="24" y="42" width="6" height="6" fill="black" />
                  <rect x="36" y="40" width="8" height="8" fill="#e82127" rx="1" />
                  <rect x="48" y="40" width="6" height="6" fill="black" />
                  <rect x="62" y="38" width="6" height="6" fill="black" />
                  <rect x="78" y="42" width="6" height="6" fill="black" />
                  <rect x="40" y="54" width="6" height="6" fill="black" />
                  <rect x="56" y="56" width="6" height="6" fill="black" />
                  <rect x="72" y="56" width="6" height="6" fill="black" />
                  <rect x="36" y="70" width="6" height="6" fill="black" />
                  <rect x="52" y="72" width="6" height="6" fill="black" />
                  <rect x="68" y="70" width="6" height="6" fill="black" />
                  <rect x="82" y="78" width="6" height="6" fill="black" />
                </svg>
                <span className="text-[9px] font-mono font-bold text-zinc-800 mt-1 uppercase tracking-wider">
                  {selectedCurrency} SCAN
                </span>
              </div>

              {/* Address details */}
              <div className="flex-1 space-y-2 min-w-0">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-0.5">Network Protocol</span>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                    {currentNetwork.network}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block mb-0.5">Your Dedicated Deposit Address</span>
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg p-2">
                    <span className="font-mono text-xs text-red-300 break-all select-all flex-1">
                      {currentNetwork.address}
                    </span>
                    <button
                      onClick={() => handleCopy(currentNetwork.address)}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0"
                      title="Copy Address"
                    >
                      {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* XRP Memo Tag requirement */}
                {currentNetwork.memoTag && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold block">Required XRP Destination Tag:</span>
                      <span className="font-mono text-sm text-yellow-300">{currentNetwork.memoTag}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(currentNetwork.memoTag!)}
                      className="px-2 py-1 text-[11px] bg-amber-800/80 hover:bg-amber-700 rounded text-white"
                    >
                      Copy Tag
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-emerald-500/20 text-xs text-zinc-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Cold-Storage Vault Protection:</strong> 100% of user balances are backed in multi-sig institutional reserves. Zero platform fees. Auto-credited after 3 confirmations.
            </span>
          </div>

          {/* Transfer Confirmation Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulateDeposit}
              disabled={isConfirming}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 font-heading font-bold text-white shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isConfirming ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>
                    Validating On-Chain Block ({confirmationStep}/3 Confirmations)...
                  </span>
                </>
              ) : (
                <>
                  <span>Simulate Instant On-Chain Deposit ({numAmount} {selectedCurrency})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              For testing: Click above to simulate real blockchain network confirmation and credit your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
