import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CRYPTO_NETWORKS } from '../data/mockData';
import { AutoCryptoGateway, CryptoCurrency } from '../types';
import {
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  RefreshCw,
  Wallet,
  QrCode,
  ExternalLink,
  AlertTriangle,
  Link2,
  Coins,
  Building2,
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: CryptoCurrency;
}

interface Eip1193Provider {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const getInjectedProvider = (): Eip1193Provider | null => {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { ethereum?: Eip1193Provider; trustwallet?: Eip1193Provider };
  return win.ethereum || win.trustwallet || null;
};

const shortAddress = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  defaultCurrency = 'USDT',
}) => {
  const {
    depositFunds,
    manualDepositMethods,
    autoCryptoGateways,
    showToast,
    currentUser,
  } = useApp();

  // Partition active admin-managed gateways
  const web3Gateways = useMemo(
    () =>
      autoCryptoGateways.filter(
        (g) =>
          (g.providerType === 'metamask' || g.providerType === 'trust_wallet') &&
          g.status !== 'disabled'
      ),
    [autoCryptoGateways]
  );

  const activeCryptoGateways = useMemo(
    () =>
      autoCryptoGateways.filter(
        (g) =>
          (!g.providerType || g.providerType === 'standard_node') && g.status !== 'disabled'
      ),
    [autoCryptoGateways]
  );

  const enabledManualMethods = useMemo(
    () => manualDepositMethods.filter((m) => m.enabled ?? m.isActive),
    [manualDepositMethods]
  );

  const [depositMode, setDepositMode] = useState<'web3' | 'crypto' | 'manual'>(() =>
    web3Gateways.length > 0 ? 'web3' : 'crypto'
  );

  // Web3 MetaMask & Trust Wallet state
  const [selectedWeb3GatewayId, setSelectedWeb3GatewayId] = useState<string>(
    web3Gateways[0]?.id || 'gw-metamask-web3'
  );
  const [web3Token, setWeb3Token] = useState<CryptoCurrency>('USDT');
  const [web3Amount, setWeb3Amount] = useState<string>('500');
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<'metamask' | 'trust_wallet' | null>(null);
  const [manualSenderAddress, setManualSenderAddress] = useState<string>('');
  const [web3TxHashInput, setWeb3TxHashInput] = useState<string>('');
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [wcSessionNonce] = useState<string>(() =>
    `${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`
  );

  // Standard Instant Crypto state
  const [selectedCryptoGatewayId, setSelectedCryptoGatewayId] = useState<string>(
    activeCryptoGateways.find((g) => g.currency === defaultCurrency)?.id ||
      activeCryptoGateways[0]?.id ||
      ''
  );
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [cryptoTxHashInput, setCryptoTxHashInput] = useState<string>('');

  // Manual / Bank Wire state
  const [selectedManualMethodId, setSelectedManualMethodId] = useState<string>(
    enabledManualMethods[0]?.id || manualDepositMethods[0]?.id || 'dep-wire'
  );
  const [manualAmount, setManualAmount] = useState<string>('1000');
  const [manualTxProof, setManualTxProof] = useState<string>('');

  // Shared UI states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmationStep, setConfirmationStep] = useState<number>(0);

  // Sync selected gateways when admin updates/toggles gateways
  useEffect(() => {
    if (web3Gateways.length > 0 && !web3Gateways.some((g) => g.id === selectedWeb3GatewayId)) {
      setSelectedWeb3GatewayId(web3Gateways[0].id);
    }
  }, [web3Gateways, selectedWeb3GatewayId]);

  useEffect(() => {
    if (
      activeCryptoGateways.length > 0 &&
      !activeCryptoGateways.some((g) => g.id === selectedCryptoGatewayId)
    ) {
      setSelectedCryptoGatewayId(
        activeCryptoGateways.find((g) => g.currency === defaultCurrency)?.id ||
          activeCryptoGateways[0].id
      );
    }
  }, [activeCryptoGateways, selectedCryptoGatewayId, defaultCurrency]);

  const activeWeb3Gateway: AutoCryptoGateway | undefined = useMemo(
    () => web3Gateways.find((g) => g.id === selectedWeb3GatewayId) || web3Gateways[0],
    [web3Gateways, selectedWeb3GatewayId]
  );

  const web3SupportedTokens: CryptoCurrency[] = useMemo(() => {
    if (activeWeb3Gateway?.supportedTokens && activeWeb3Gateway.supportedTokens.length > 0) {
      return activeWeb3Gateway.supportedTokens;
    }
    if (activeWeb3Gateway?.providerType === 'trust_wallet') {
      return ['BNB', 'USDT', 'XRP', 'BTC'];
    }
    return ['USDT', 'BNB', 'BTC'];
  }, [activeWeb3Gateway]);

  useEffect(() => {
    if (!web3SupportedTokens.includes(web3Token)) {
      const nextToken = web3SupportedTokens[0] || 'USDT';
      setWeb3Token(nextToken);
      if (nextToken === 'BTC') setWeb3Amount('0.015');
      else if (nextToken === 'BNB') setWeb3Amount('1.5');
      else if (nextToken === 'XRP') setWeb3Amount('500');
      else setWeb3Amount('500');
    }
  }, [web3SupportedTokens, web3Token]);

  if (!isOpen || !currentUser) return null;

  const activeCryptoGateway: AutoCryptoGateway | undefined =
    activeCryptoGateways.find((g) => g.id === selectedCryptoGatewayId) || activeCryptoGateways[0];

  const rawGwCurrency = activeCryptoGateway?.currency;
  const selectedCurrency: CryptoCurrency =
    rawGwCurrency && rawGwCurrency !== 'ETH' ? rawGwCurrency : defaultCurrency;
  const currentNetwork = CRYPTO_NETWORKS[selectedCurrency] || CRYPTO_NETWORKS.USDT;
  const cryptoRateUsd = rawGwCurrency === 'ETH' ? 3200 : currentNetwork?.rateUsd || 1;
  const numCryptoAmount = parseFloat(depositAmount) || 0;
  const cryptoUsdEstimate = selectedCurrency === 'USDT' ? numCryptoAmount : numCryptoAmount * cryptoRateUsd;
  const cryptoFeePercent = activeCryptoGateway?.feePercent ?? 0;
  const cryptoRequiredConfirmations = activeCryptoGateway?.requiredConfirmations ?? 3;
  const cryptoReceivingAddress = activeCryptoGateway?.receivingAddress || currentNetwork.address;
  const cryptoMinUsd = activeCryptoGateway?.minDepositUsd ?? 10;
  const cryptoMaxUsd = activeCryptoGateway?.maxDepositUsd ?? 500000;

  // Web3 derived calculations
  const web3RateUsd = CRYPTO_NETWORKS[web3Token]?.rateUsd || 1;
  const numWeb3Amount = parseFloat(web3Amount) || 0;
  const web3UsdGross = web3Token === 'USDT' ? numWeb3Amount : numWeb3Amount * web3RateUsd;
  const web3FeePercent = activeWeb3Gateway?.feePercent ?? 0;
  const web3FeeUsd = Number(((web3UsdGross * web3FeePercent) / 100).toFixed(2));
  const web3NetUsd = Math.max(0, Number((web3UsdGross - web3FeeUsd).toFixed(2)));
  const web3MinUsd = activeWeb3Gateway?.minDepositUsd ?? 20;
  const web3MaxUsd = activeWeb3Gateway?.maxDepositUsd ?? 500000;

  const wcProjectId = activeWeb3Gateway?.walletConnectProjectId || 'apex-tesla-wc2-9048f3e21b';
  const walletConnectUri = `wc:${wcSessionNonce}@2?relay-protocol=irn&symKey=${wcSessionNonce}a9f2&projectId=${encodeURIComponent(
    wcProjectId
  )}`;
  const trustDeepLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(walletConnectUri)}`;

  const activeManualMethod =
    enabledManualMethods.find((m) => m.id === selectedManualMethodId) || enabledManualMethods[0];

  const whatsappText =
    'Hi Apex Tesla Hub Concierge! I need assistance with funding my vault via MetaMask, Trust Wallet, crypto, or bank wire.';
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  const handleCopy = (text: string, key = 'default') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Connect MetaMask (EIP-1193) or Trust Wallet browser provider
  const handleConnectWeb3Wallet = async (providerType: 'metamask' | 'trust_wallet') => {
    setIsConnectingWallet(true);
    const injected = getInjectedProvider();

    if (!injected?.request) {
      showToast(
        providerType === 'metamask'
          ? 'MetaMask browser extension was not detected. Transfer directly to the vault address below and paste your sender address & TX hash, or open this page inside the MetaMask mobile browser.'
          : 'No injected Web3 provider detected. Scan the Trust Wallet Connect QR / deep link below, transfer to the vault address, and enter your TX hash to verify.',
        'info'
      );
      setIsConnectingWallet(false);
      return;
    }

    try {
      const accounts = (await injected.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (Array.isArray(accounts) && accounts.length > 0) {
        if (activeWeb3Gateway?.chainId) {
          try {
            await injected.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: activeWeb3Gateway.chainId }],
            });
          } catch {
            // Ignore chain switch rejection if user keeps current EVM chain
          }
        }
        setConnectedWalletAddress(accounts[0]);
        setConnectedWalletType(providerType);
        showToast(
          `${providerType === 'metamask' ? 'MetaMask' : 'Trust Wallet'} connected: ${shortAddress(accounts[0])}`,
          'success'
        );
      } else {
        showToast('No wallet accounts returned by your Web3 provider.', 'error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Wallet authorization rejected.';
      showToast(message, 'error');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWeb3 = () => {
    setConnectedWalletAddress(null);
    setConnectedWalletType(null);
    showToast('Web3 wallet disconnected.', 'info');
  };

  const handleConfirmWeb3Deposit = async () => {
    if (!activeWeb3Gateway) {
      showToast('No active Web3 payment gateway available.', 'error');
      return;
    }
    if (numWeb3Amount <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    if (web3UsdGross < web3MinUsd) {
      showToast(
        `Minimum deposit for ${activeWeb3Gateway.name} is $${web3MinUsd.toLocaleString()} USD.`,
        'error'
      );
      return;
    }
    if (web3UsdGross > web3MaxUsd) {
      showToast(
        `Maximum deposit per transaction for ${activeWeb3Gateway.name} is $${web3MaxUsd.toLocaleString()} USD.`,
        'error'
      );
      return;
    }

    const effectiveSenderAddress = (connectedWalletAddress || manualSenderAddress).trim();
    if (!effectiveSenderAddress && !web3TxHashInput.trim()) {
      showToast(
        `Connect your ${
          activeWeb3Gateway.providerType === 'trust_wallet' ? 'Trust Wallet' : 'MetaMask'
        } extension or enter your sending address and on-chain transaction hash.`,
        'error'
      );
      return;
    }

    setIsConfirming(true);
    setConfirmationStep(1);

    let onChainTxHash = web3TxHashInput.trim();
    const injected = getInjectedProvider();

    if (connectedWalletAddress && injected?.request && !onChainTxHash) {
      try {
        const resultHash = await injected.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: connectedWalletAddress,
              to: activeWeb3Gateway.receivingAddress,
              value: '0x0',
            },
          ],
        });
        if (typeof resultHash === 'string' && resultHash.startsWith('0x')) {
          onChainTxHash = resultHash;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Transaction signature declined.';
        showToast(msg, 'error');
        setIsConfirming(false);
        setConfirmationStep(0);
        return;
      }
    }

    setConfirmationStep(2);
    try {
      setConfirmationStep(3);
      const netTokenAmount =
        web3FeePercent > 0
          ? Number((numWeb3Amount * (1 - web3FeePercent / 100)).toFixed(6))
          : numWeb3Amount;
      await depositFunds(web3Token, netTokenAmount, {
        gatewayId: activeWeb3Gateway.id,
        gatewayName: activeWeb3Gateway.name,
        txHash: onChainTxHash || undefined,
        senderAddress: effectiveSenderAddress || undefined,
      });
      onClose();
    } finally {
      setIsConfirming(false);
      setConfirmationStep(0);
    }
  };

  const handleConfirmCryptoDeposit = async () => {
    if (!activeCryptoGateway) {
      showToast('Instant crypto gateways are currently disabled by Administrator.', 'error');
      return;
    }
    if (numCryptoAmount <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    if (cryptoUsdEstimate < cryptoMinUsd) {
      showToast(
        `Minimum deposit for ${activeCryptoGateway.name} is $${cryptoMinUsd.toLocaleString()} USD.`,
        'error'
      );
      return;
    }
    if (cryptoUsdEstimate > cryptoMaxUsd) {
      showToast(
        `Maximum deposit for ${activeCryptoGateway.name} is $${cryptoMaxUsd.toLocaleString()} USD.`,
        'error'
      );
      return;
    }

    setIsConfirming(true);
    setConfirmationStep(1);
    try {
      setConfirmationStep(2);
      const netAmount =
        cryptoFeePercent > 0
          ? Number((numCryptoAmount * (1 - cryptoFeePercent / 100)).toFixed(6))
          : numCryptoAmount;
      setConfirmationStep(3);
      await depositFunds(selectedCurrency, netAmount, {
        gatewayId: activeCryptoGateway.id,
        gatewayName: activeCryptoGateway.name,
        txHash: cryptoTxHashInput.trim() || undefined,
      });
      onClose();
    } finally {
      setIsConfirming(false);
      setConfirmationStep(0);
    }
  };

  const handleSubmitManualDeposit = async () => {
    const numMan = parseFloat(manualAmount) || 0;
    if (numMan <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    if (activeManualMethod && numMan < activeManualMethod.minDepositUsd) {
      showToast(`Minimum deposit is $${activeManualMethod.minDepositUsd} USD.`, 'error');
      return;
    }

    setIsConfirming(true);
    setConfirmationStep(1);
    try {
      setConfirmationStep(2);
      await depositFunds('USD', numMan, {
        gatewayName: activeManualMethod?.name || activeManualMethod?.title || 'Manual Wire',
        txHash: manualTxProof.trim() || undefined,
      });
      showToast(`Manual deposit of $${numMan.toLocaleString()} USD submitted cleanly!`, 'success');
      onClose();
    } finally {
      setIsConfirming(false);
      setConfirmationStep(0);
    }
  };

  const hasInjectedProvider = Boolean(getInjectedProvider());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Wallet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Multi-Gateway Treasury & Web3 Funding
              </h3>
              <p className="text-xs text-zinc-400">
                MetaMask EIP-1193, Trust Wallet Connect v2, Direct Crypto & Bank Wire
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            aria-label="Close deposit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Gateway Mode Selector */}
        <div className="px-6 pt-4 pb-2 grid grid-cols-3 gap-2 border-b border-zinc-800 bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setDepositMode('web3')}
            className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition ${
              depositMode === 'web3'
                ? 'bg-gradient-to-r from-amber-600 to-blue-600 text-white shadow-md shadow-amber-950/40 border border-amber-400/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">Web3 Wallets ({web3Gateways.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setDepositMode('crypto')}
            className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition ${
              depositMode === 'crypto'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50 border border-red-500/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span className="truncate">Direct Crypto ({activeCryptoGateways.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setDepositMode('manual')}
            className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition ${
              depositMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Bank Wire ({enabledManualMethods.length})</span>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* ======================== 1. WEB3 WALLETS (METAMASK & TRUST WALLET) ======================== */}
          {depositMode === 'web3' && (
            <>
              {web3Gateways.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/30 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-heading font-bold text-white text-sm">
                    Web3 Wallet Gateways Temporarily Disabled
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    MetaMask and Trust Wallet Connect gateways have been toggled inactive by the
                    Administrator. Use Direct Crypto or Bank Wire tabs, or contact Concierge.
                  </p>
                </div>
              ) : (
                <>
                  {/* Gateway Cards */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                      Select Web3 Payment Provider
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {web3Gateways.map((gw) => {
                        const isMetaMask = gw.providerType === 'metamask';
                        const isSelected = activeWeb3Gateway?.id === gw.id;
                        return (
                          <button
                            type="button"
                            key={gw.id}
                            onClick={() => {
                              setSelectedWeb3GatewayId(gw.id);
                              if (
                                connectedWalletType &&
                                connectedWalletType !== gw.providerType
                              ) {
                                setConnectedWalletAddress(null);
                                setConnectedWalletType(null);
                              }
                            }}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? isMetaMask
                                  ? 'border-amber-500 bg-amber-950/25 shadow-lg shadow-amber-950/30'
                                  : 'border-blue-500 bg-blue-950/25 shadow-lg shadow-blue-950/30'
                                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-xs border ${
                                    isMetaMask
                                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                  }`}
                                >
                                  {isMetaMask ? 'MM' : 'TW'}
                                </div>
                                <div>
                                  <div className="font-heading font-bold text-sm text-white leading-tight">
                                    {gw.name}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 mt-0.5">
                                    {gw.chainName || gw.network}
                                    {gw.chainId ? ` (${gw.chainId})` : ''}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${
                                  gw.status === 'testing'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                }`}
                              >
                                {gw.status === 'testing' ? 'TESTNET' : 'ACTIVE'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                              <span>
                                Limits: ${gw.minDepositUsd.toLocaleString()}–$
                                {gw.maxDepositUsd.toLocaleString()}
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                {gw.feePercent === 0 ? '0% Fee' : `${gw.feePercent}% Fee`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {activeWeb3Gateway && (
                    <>
                      {/* Wallet Connection Card */}
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <Link2
                                className={`w-4 h-4 ${
                                  activeWeb3Gateway.providerType === 'metamask'
                                    ? 'text-amber-400'
                                    : 'text-blue-400'
                                }`}
                              />
                              <span>
                                {activeWeb3Gateway.providerType === 'metamask'
                                  ? 'MetaMask EIP-1193 Direct Signer'
                                  : 'Trust Wallet Connect v2 Relay'}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {activeWeb3Gateway.description ||
                                `Settlement Vault: ${shortAddress(
                                  activeWeb3Gateway.receivingAddress
                                )}`}
                            </p>
                          </div>

                          {connectedWalletAddress &&
                          connectedWalletType === activeWeb3Gateway.providerType ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                {shortAddress(connectedWalletAddress)} (Live)
                              </span>
                              <button
                                type="button"
                                onClick={handleDisconnectWeb3}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                              >
                                Disconnect
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={isConnectingWallet}
                                onClick={() =>
                                  handleConnectWeb3Wallet(
                                    activeWeb3Gateway.providerType === 'trust_wallet'
                                      ? 'trust_wallet'
                                      : 'metamask'
                                  )
                                }
                                className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs text-white transition flex items-center gap-1.5 ${
                                  activeWeb3Gateway.providerType === 'metamask'
                                    ? 'bg-amber-600 hover:bg-amber-500'
                                    : 'bg-blue-600 hover:bg-blue-500'
                                }`}
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>
                                  {isConnectingWallet
                                    ? 'Connecting...'
                                    : !hasInjectedProvider
                                    ? activeWeb3Gateway.providerType === 'metamask'
                                      ? 'Check MetaMask Extension'
                                      : 'Check Trust Browser Wallet'
                                    : activeWeb3Gateway.providerType === 'metamask'
                                    ? 'Connect Browser MetaMask'
                                    : 'Connect Trust Browser'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Manual Sender Address & On-Chain TX Hash for Mobile / External Wallet Transfers */}
                        {!connectedWalletAddress && (
                          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">
                                Sending Wallet Address (EVM / Native)
                              </label>
                              <input
                                type="text"
                                value={manualSenderAddress}
                                onChange={(e) => setManualSenderAddress(e.target.value)}
                                placeholder="0x... your wallet address"
                                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">
                                On-Chain TX Hash (for external transfers)
                              </label>
                              <input
                                type="text"
                                value={web3TxHashInput}
                                onChange={(e) => setWeb3TxHashInput(e.target.value)}
                                placeholder="0x... transaction hash"
                                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Trust Wallet Connect v2 QR & Deep Link */}
                        {activeWeb3Gateway.providerType === 'trust_wallet' && (
                          <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
                            <div className="shrink-0 p-2 bg-white rounded-xl shadow flex flex-col items-center">
                              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                                <rect x="4" y="4" width="26" height="26" fill="#0f172a" rx="3" />
                                <rect x="8" y="8" width="18" height="18" fill="white" rx="2" />
                                <rect x="12" y="12" width="10" height="10" fill="#2563eb" rx="1" />
                                <rect x="70" y="4" width="26" height="26" fill="#0f172a" rx="3" />
                                <rect x="74" y="8" width="18" height="18" fill="white" rx="2" />
                                <rect x="78" y="12" width="10" height="10" fill="#2563eb" rx="1" />
                                <rect x="4" y="70" width="26" height="26" fill="#0f172a" rx="3" />
                                <rect x="8" y="74" width="18" height="18" fill="white" rx="2" />
                                <rect x="12" y="78" width="10" height="10" fill="#2563eb" rx="1" />
                                <rect x="36" y="8" width="8" height="8" fill="#0f172a" />
                                <rect x="52" y="12" width="8" height="8" fill="#0f172a" />
                                <rect x="40" y="24" width="8" height="8" fill="#0f172a" />
                                <rect x="58" y="26" width="8" height="8" fill="#0f172a" />
                                <rect x="12" y="40" width="8" height="8" fill="#0f172a" />
                                <rect x="26" y="44" width="8" height="8" fill="#0f172a" />
                                <rect x="44" y="44" width="12" height="12" fill="#2563eb" rx="2" />
                                <rect x="64" y="42" width="8" height="8" fill="#0f172a" />
                                <rect x="80" y="44" width="8" height="8" fill="#0f172a" />
                                <rect x="38" y="64" width="8" height="8" fill="#0f172a" />
                                <rect x="54" y="66" width="8" height="8" fill="#0f172a" />
                                <rect x="70" y="64" width="8" height="8" fill="#0f172a" />
                                <rect x="44" y="80" width="8" height="8" fill="#0f172a" />
                                <rect x="64" y="80" width="8" height="8" fill="#0f172a" />
                                <rect x="82" y="82" width="8" height="8" fill="#0f172a" />
                              </svg>
                              <span className="text-[9px] font-mono font-bold text-blue-700 mt-1 flex items-center gap-1">
                                <QrCode className="w-2.5 h-2.5" /> WC v2 SCAN
                              </span>
                            </div>
                            <div className="flex-1 w-full space-y-2 text-xs">
                              <div className="flex items-center justify-between text-zinc-400">
                                <span>WalletConnect Project ID:</span>
                                <span className="font-mono text-blue-300 font-semibold">
                                  {wcProjectId}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-700/80 rounded-lg p-2">
                                <span className="font-mono text-[11px] text-zinc-300 truncate flex-1">
                                  {walletConnectUri}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(walletConnectUri, 'wc-uri')}
                                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] shrink-0 flex items-center gap-1"
                                >
                                  {copiedKey === 'wc-uri' ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>Copy URI</span>
                                </button>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={trustDeepLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Open in Trust Wallet App</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Receiving Vault Details */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                          <span className="text-zinc-400">Admin Vault Address:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-zinc-200 truncate max-w-[260px]">
                              {activeWeb3Gateway.receivingAddress}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(activeWeb3Gateway.receivingAddress, 'web3-vault')
                              }
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              title="Copy Vault Address"
                            >
                              {copiedKey === 'web3-vault' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Asset & Amount Selector */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                            Settlement Asset
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {web3SupportedTokens.map((token) => {
                              const info = CRYPTO_NETWORKS[token];
                              const active = web3Token === token;
                              return (
                                <button
                                  type="button"
                                  key={token}
                                  onClick={() => {
                                    setWeb3Token(token);
                                    if (token === 'BTC') setWeb3Amount('0.015');
                                    else if (token === 'BNB') setWeb3Amount('1.5');
                                    else if (token === 'XRP') setWeb3Amount('500');
                                    else setWeb3Amount('500');
                                  }}
                                  className={`p-2.5 rounded-xl border text-center transition ${
                                    active
                                      ? 'border-amber-500 bg-amber-950/30 text-white'
                                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <div
                                    className="font-heading font-bold text-sm"
                                    style={{ color: info?.iconColor }}
                                  >
                                    {token}
                                  </div>
                                  <div className="text-[10px] text-zinc-500">
                                    1 ≈ ${info?.rateUsd.toLocaleString()}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                          <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                            <span>Transfer Amount ({web3Token})</span>
                            <span>
                              1 {web3Token} ≈ ${web3RateUsd.toLocaleString()} USD
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              value={web3Amount}
                              onChange={(e) => setWeb3Amount(e.target.value)}
                              placeholder="Enter amount"
                              className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-amber-500"
                            />
                            <span className="font-heading font-semibold text-zinc-300 px-3 py-2 bg-zinc-800 rounded-lg shrink-0">
                              {web3Token}
                            </span>
                          </div>
                          <div className="flex flex-wrap justify-between items-center gap-2 mt-2 text-xs">
                            <span className="text-zinc-500">
                              Min ${web3MinUsd.toLocaleString()} • Max $
                              {web3MaxUsd.toLocaleString()} USD
                            </span>
                            <span className="text-emerald-400 font-medium">
                              Net Vault Credit: ≈ ${web3NetUsd.toLocaleString()} USD
                              {web3FeePercent > 0 ? ` (after ${web3FeePercent}% fee)` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Web3 Confirm Button */}
                      <button
                        type="button"
                        onClick={handleConfirmWeb3Deposit}
                        disabled={isConfirming}
                        className={`w-full py-3.5 px-4 rounded-xl font-heading font-bold text-white shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                          activeWeb3Gateway.providerType === 'metamask'
                            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-amber-950/50'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-950/50'
                        }`}
                      >
                        {isConfirming ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>
                              Verifying Web3 Signature ({confirmationStep}/3)...
                            </span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>
                              Confirm{' '}
                              {activeWeb3Gateway.providerType === 'metamask'
                                ? 'MetaMask'
                                : 'Trust Wallet'}{' '}
                              Deposit ({numWeb3Amount} {web3Token} ≈ $
                              {Math.round(web3NetUsd).toLocaleString()} USD)
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ======================== 2. STANDARD INSTANT CRYPTO GATEWAYS ======================== */}
          {depositMode === 'crypto' && (
            <>
              {activeCryptoGateways.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/30 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-heading font-bold text-white text-sm">
                    Direct Crypto Gateways Disabled
                  </h4>
                  <p className="text-xs text-zinc-400">
                    All direct blockchain node gateways are currently toggled inactive by the
                    Administrator. Try Web3 Wallets or Bank Wire tabs.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                      Select Active Blockchain Gateway
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activeCryptoGateways.map((gw) => {
                        const info = CRYPTO_NETWORKS[gw.currency];
                        const active = activeCryptoGateway?.id === gw.id;
                        return (
                          <button
                            type="button"
                            key={gw.id}
                            onClick={() => {
                              setSelectedCryptoGatewayId(gw.id);
                              if (gw.currency === 'BTC') setDepositAmount('0.02');
                              else if (gw.currency === 'XRP') setDepositAmount('250');
                              else if (gw.currency === 'BNB') setDepositAmount('1.5');
                              else setDepositAmount('500');
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                              active
                                ? 'border-red-500 bg-red-950/40 text-white shadow-lg shadow-red-950/30'
                                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            <span
                              className="font-heading font-bold text-base"
                              style={{ color: info?.iconColor }}
                            >
                              {gw.currency}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate max-w-full">
                              {gw.network}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount input */}
                  <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                      <span>Deposit Amount ({selectedCurrency})</span>
                      <span>
                        1 {selectedCurrency} ≈ ${cryptoRateUsd.toLocaleString()} USD
                      </span>
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
                      <span className="text-zinc-500">
                        Limits: ${cryptoMinUsd.toLocaleString()}–${cryptoMaxUsd.toLocaleString()} USD
                      </span>
                      <span className="text-emerald-400 font-medium">
                        Est. Value: ≈ ${Math.round(cryptoUsdEstimate).toLocaleString()} USD
                      </span>
                    </div>
                  </div>

                  {/* Address & QR Code */}
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-2 bg-white rounded-xl shadow-md flex flex-col items-center justify-center">
                        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                          <rect x="5" y="5" width="26" height="26" fill="black" rx="2" />
                          <rect x="9" y="9" width="18" height="18" fill="white" rx="1" />
                          <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />
                          <rect x="69" y="5" width="26" height="26" fill="black" rx="2" />
                          <rect x="73" y="9" width="18" height="18" fill="white" rx="1" />
                          <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />
                          <rect x="5" y="69" width="26" height="26" fill="black" rx="2" />
                          <rect x="9" y="73" width="18" height="18" fill="white" rx="1" />
                          <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />
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

                      <div className="flex-1 space-y-2 min-w-0">
                        <div>
                          <span className="text-[11px] text-zinc-400 block mb-0.5">
                            Gateway & Network Protocol
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {activeCryptoGateway?.name} ({activeCryptoGateway?.network || currentNetwork.network})
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-zinc-400 block mb-0.5">
                            Dedicated Receiving Vault Address
                          </span>
                          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg p-2">
                            <span className="font-mono text-xs text-red-300 break-all select-all flex-1">
                              {cryptoReceivingAddress}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(cryptoReceivingAddress, 'crypto-addr')}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0"
                              title="Copy Address"
                            >
                              {copiedKey === 'crypto-addr' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {currentNetwork.memoTag && (
                          <div className="p-2 rounded bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-semibold block">
                                Required XRP Destination Tag:
                              </span>
                              <span className="font-mono text-sm text-yellow-300">
                                {currentNetwork.memoTag}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(currentNetwork.memoTag!, 'memo-tag')}
                              className="px-2 py-1 text-[11px] bg-amber-800/80 hover:bg-amber-700 rounded text-white"
                            >
                              {copiedKey === 'memo-tag' ? 'Copied' : 'Copy Tag'}
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
                      <strong>Institutional Reserve Protection:</strong> Gateway Fee:{' '}
                      {cryptoFeePercent}% • Auto-credited after {cryptoRequiredConfirmations}{' '}
                      confirmations.
                    </span>
                  </div>

                  {/* Optional TX Hash Input */}
                  <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1.5">
                      On-Chain Transaction Hash / Reference (Recommended)
                    </span>
                    <input
                      type="text"
                      value={cryptoTxHashInput}
                      onChange={(e) => setCryptoTxHashInput(e.target.value)}
                      placeholder="Paste blockchain TXID / hash after sending"
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Transfer Confirmation Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmCryptoDeposit}
                      disabled={isConfirming}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 font-heading font-bold text-white shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 transition disabled:opacity-60"
                    >
                      {isConfirming ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>
                            Validating On-Chain Block ({confirmationStep}/
                            {cryptoRequiredConfirmations})...
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            Confirm On-Chain Deposit ({numCryptoAmount} {selectedCurrency})
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ======================== 3. MANUAL & BANK GATEWAYS MODE ======================== */}
          {depositMode === 'manual' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Select Bank or Custom Deposit Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {enabledManualMethods.map((method) => {
                    const isSel = activeManualMethod?.id === method.id;
                    const methodName = method.name || method.title;
                    const methodCurrency = method.currency || method.currencySymbol;
                    const methodAccount = method.accountName || method.title;

                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedManualMethodId(method.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSel
                            ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/40'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading font-bold text-sm text-white">
                            {methodName}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {methodCurrency}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 line-clamp-1">{methodAccount}</span>
                        <div className="mt-2 text-[11px] text-emerald-400 font-mono">
                          Min: ${method.minDepositUsd.toLocaleString()} USD
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeManualMethod && (
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="font-semibold text-zinc-300">Recipient Account Name:</span>
                    <span className="font-mono text-white font-bold">
                      {activeManualMethod.accountName || activeManualMethod.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="font-semibold text-zinc-300">Account / Routing / Tag:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-emerald-400 font-bold">
                        {activeManualMethod.accountNumber || activeManualMethod.accountDetails}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            activeManualMethod.accountNumber || activeManualMethod.accountDetails,
                            'manual-acct'
                          )
                        }
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Copy"
                      >
                        {copiedKey === 'manual-acct' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {activeManualMethod.routingOrBank && (
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <span className="font-semibold text-zinc-300">Bank / Routing Code:</span>
                      <span className="font-mono text-zinc-200">
                        {activeManualMethod.routingOrBank}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-400 block font-semibold mb-1">
                      Payment Instructions:
                    </span>
                    <p className="text-zinc-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-zinc-800/80">
                      {activeManualMethod.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Amount and Proof Notes */}
              <div className="space-y-3">
                <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                    <span>Manual Deposit Amount (USD)</span>
                    <span className="text-emerald-400 font-mono">1 USD = $1.00 USD Vault</span>
                  </div>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="Enter USD Amount"
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1.5">
                    Wire / Transfer Reference Number or Note (Optional Proof)
                  </span>
                  <input
                    type="text"
                    value={manualTxProof}
                    onChange={(e) => setManualTxProof(e.target.value)}
                    placeholder="e.g. WIRE-REF-9948201 / CashApp Tag"
                    className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitManualDeposit}
                disabled={isConfirming}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-heading font-bold text-white shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {isConfirming ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Verifying Banking Ledger & Crediting Vault...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit & Credit Manual Deposit ($
                      {parseFloat(manualAmount || '0').toLocaleString()} USD)
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Dedicated WhatsApp VIP Concierge Action */}
          <div className="pt-2 border-t border-zinc-800/80">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>High-Limit Wire or Custom Payment? Chat with WhatsApp VIP Concierge</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
