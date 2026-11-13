import React, { useRef, useEffect, useState } from 'react';
import { ScratchCardTier, ScratchPrizeOption } from '../types';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, ShieldCheck, RefreshCw, Car } from 'lucide-react';

interface ScratchCardModalProps {
  tier: ScratchCardTier;
  isOpen: boolean;
  onClose: () => void;
}

function pickWeightedPrize(tier: ScratchCardTier): ScratchPrizeOption {
  const options = Array.isArray(tier.possiblePrizes) && tier.possiblePrizes.length > 0
    ? tier.possiblePrizes
    : [{ amountUsd: tier.maxPrizeUsd, label: `$${tier.maxPrizeUsd.toLocaleString()} Prize`, weight: 1 }];
  const totalWeight = options.reduce((acc, p) => acc + Math.max(0.1, Number(p.weight) || 1), 0);
  let r = Math.random() * totalWeight;
  for (const item of options) {
    r -= Math.max(0.1, Number(item.weight) || 1);
    if (r <= 0) return item;
  }
  return options[0];
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ tier, isOpen, onClose }) => {
  const { awardScratchPrize, currentUser, minDepositToActivateWinsUsd, openWinActivationPopup } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [assignedPrize, setAssignedPrize] = useState<ScratchPrizeOption>(() => pickWeightedPrize(tier));
  const [verifyHash, setVerifyHash] = useState<string>(() => Math.random().toString(16).substring(2, 8));
  const popupTriggeredRef = useRef(false);
  const popupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRevealed(false);
      setScratchedPercentage(0);
      setAssignedPrize(pickWeightedPrize(tier));
      setVerifyHash(Math.random().toString(16).substring(2, 8));
      popupTriggeredRef.current = false;
    }
    return () => {
      if (popupTimerRef.current !== null) {
        window.clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;
      }
    };
  }, [isOpen, tier]);

  // Audio synthesis for scratching sound
  const playScratchSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 250, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext fallback
    }
  };

  // Draw metallic silver/carbon foil overlay onto canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 440;
    canvas.height = 240;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#71717a');
    grad.addColorStop(0.3, '#e4e4e7');
    grad.addColorStop(0.5, '#a1a1aa');
    grad.addColorStop(0.7, '#f4f4f5');
    grad.addColorStop(1, '#52525b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const hasCarJackpot = tier.possiblePrizes?.some((p) => p.isTeslaCar);
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL JACKPOT', canvas.width / 2, canvas.height / 2 - 14);
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#3f3f46';
    ctx.fillText('Hold & swipe cursor or finger across foil', canvas.width / 2, canvas.height / 2 + 12);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(
      hasCarJackpot
        ? `WIN A TESLA CAR OR UP TO $${tier.maxPrizeUsd.toLocaleString()}!`
        : `UP TO $${tier.maxPrizeUsd.toLocaleString()} MAX PRIZE`,
      canvas.width / 2,
      canvas.height / 2 + 38
    );
  }, [isOpen, tier]);

  const scratch = (clientX: number, clientY: number) => {
    if (!canvasRef.current || revealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();

    if (Math.random() > 0.6) {
      checkProgress();
    }
  };

  const checkProgress = () => {
    if (!canvasRef.current || revealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] === 0) {
        transparentPixels += 4;
      }
    }

    const pct = Math.min(100, Math.round((transparentPixels / totalPixels) * 100));
    setScratchedPercentage(pct);

    if (pct >= 45 && !revealed) {
      handleFinalReveal();
    }
  };

  const handleFinalReveal = () => {
    if (revealed) return;
    setRevealed(true);
    setScratchedPercentage(100);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const isWin = Boolean(assignedPrize.isTeslaCar || (!assignedPrize.isTryAgain && assignedPrize.amountUsd > 0));
    if (isWin) {
      confetti({
        particleCount: assignedPrize.isTeslaCar ? 180 : 110,
        spread: assignedPrize.isTeslaCar ? 95 : 70,
        origin: { y: 0.55 },
        colors: ['#e82127', '#10b981', '#f59e0b', '#ffffff'],
      });
    }

    awardScratchPrize(tier, assignedPrize.amountUsd, assignedPrize.label, {
      isTeslaCar: assignedPrize.isTeslaCar,
      vehicleModel: assignedPrize.vehicleModel,
      isTryAgain: assignedPrize.isTryAgain || assignedPrize.amountUsd <= 0,
    });

    const isCashWinOutcome =
      !assignedPrize.isTeslaCar && !assignedPrize.isTryAgain && assignedPrize.amountUsd > 0;
    const needsDeposit = (currentUser?.totalDepositedUsd || 0) < minDepositToActivateWinsUsd;
    if (isCashWinOutcome && needsDeposit) {
      popupTimerRef.current = window.setTimeout(() => {
        if (!popupTriggeredRef.current) {
          popupTriggeredRef.current = true;
          openWinActivationPopup({
            actionLabel: 'Scratch & Win Cash Prize',
            prizeLabel: assignedPrize.label,
            prizeAmountUsd: assignedPrize.amountUsd,
          });
        }
      }, 750);
    }
  };

  const handleCloseModal = () => {
    if (popupTimerRef.current !== null) {
      window.clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    const isCashWinOutcome =
      revealed && !assignedPrize.isTeslaCar && !assignedPrize.isTryAgain && assignedPrize.amountUsd > 0;
    const needsDeposit = (currentUser?.totalDepositedUsd || 0) < minDepositToActivateWinsUsd;
    if (isCashWinOutcome && needsDeposit && !popupTriggeredRef.current) {
      popupTriggeredRef.current = true;
      openWinActivationPopup({
        actionLabel: 'Scratch & Win Cash Prize',
        prizeLabel: assignedPrize.label,
        prizeAmountUsd: assignedPrize.amountUsd,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const isCarWin = Boolean(assignedPrize.isTeslaCar);
  const isCashWin = !isCarWin && !assignedPrize.isTryAgain && assignedPrize.amountUsd > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header bar */}
        <div className={`px-6 py-4 bg-gradient-to-r ${tier.gradient} flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="font-heading font-bold text-lg leading-tight">{tier.name}</h3>
              <p className="text-xs text-white/85">
                Cost: ${tier.priceUsd.toLocaleString()} • Top Prize: ${tier.maxPrizeUsd.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <p className="text-xs text-zinc-400">
            Scratch off the metallic foil layer to reveal your Tesla jackpot or vault payout!
          </p>

          {/* Scratch Card Frame */}
          <div className="relative w-full max-w-[440px] h-[240px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 select-none">
            {/* Underlying Outcome Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-5 bg-radial from-zinc-900 via-zinc-950 to-black">
              {isCarWin ? (
                <div className="space-y-2 animate-in zoom-in-90 duration-300">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-lg">
                    <Car className="w-9 h-9 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-yellow-300 font-bold block">
                      TESLA CAR JACKPOT WON!
                    </span>
                    <h4 className="font-heading font-black text-2xl text-white drop-shadow-md">
                      {assignedPrize.vehicleModel || assignedPrize.label}
                    </h4>
                    <p className="text-emerald-400 text-xs font-bold mt-1">
                      Est. MSRP Value: ${assignedPrize.amountUsd.toLocaleString()} USD
                    </p>
                    <p className="text-zinc-300 text-[11px] mt-0.5">
                      Allocated to your Digital Garage &amp; VIP Enclosed Delivery
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400/90 font-mono pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Hash: 0x{verifyHash}...car</span>
                  </div>
                </div>
              ) : isCashWin ? (
                <div className="space-y-2 animate-in zoom-in-90 duration-300">
                  <div className="inline-flex p-3 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    <Trophy className="w-9 h-9 text-yellow-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                      INSTANT VAULT PRIZE WON
                    </span>
                    <h4 className="font-heading font-black text-3xl text-emerald-300 drop-shadow-md">
                      +${assignedPrize.amountUsd.toLocaleString()} USD
                    </h4>
                    <p className="text-white text-xs font-semibold mt-1">
                      {assignedPrize.label}
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      Instant payout credited to your Apex Vault balance.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400/90 font-mono pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Hash: 0x{verifyHash}...win</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in zoom-in-90 duration-300">
                  <div className="inline-flex p-3 rounded-full bg-zinc-800/70 text-zinc-400 border border-zinc-700">
                    <RefreshCw className="w-9 h-9 text-zinc-400" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold block">
                      CARD OUTCOME REVEALED
                    </span>
                    <h4 className="font-heading font-black text-2xl text-zinc-300 drop-shadow-md">
                      Try Again ($0.00)
                    </h4>
                    <p className="text-zinc-400 text-xs font-medium mt-1">
                      {assignedPrize.label}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Verified Hash: 0x{verifyHash}...null</span>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Scratch Foil Layer */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity ${
                revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
              onMouseDown={() => setIsScratching(true)}
              onMouseUp={() => setIsScratching(false)}
              onMouseLeave={() => setIsScratching(false)}
              onMouseMove={(e) => {
                if (isScratching) scratch(e.clientX, e.clientY);
              }}
              onTouchStart={() => setIsScratching(true)}
              onTouchEnd={() => setIsScratching(false)}
              onTouchMove={(e) => {
                if (isScratching && e.touches[0]) {
                  scratch(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
            />
          </div>

          {/* Progress bar & Quick Reveal */}
          <div className="w-full flex items-center justify-between gap-4 pt-2">
            <div className="flex-1 text-left">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Scratched</span>
                <span className="font-mono text-white">{scratchedPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-150"
                  style={{ width: `${scratchedPercentage}%` }}
                />
              </div>
            </div>

            {!revealed ? (
              <button
                onClick={handleFinalReveal}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Quick Reveal</span>
              </button>
            ) : (
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <span>Done &amp; Collect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
