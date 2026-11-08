import React, { useRef, useEffect, useState } from 'react';
import { ScratchCardTier } from '../types';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Trophy, AlertTriangle, ShieldCheck, RefreshCw, Frown } from 'lucide-react';

interface ScratchCardModalProps {
  tier: ScratchCardTier;
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ tier, isOpen, onClose }) => {
  const { awardScratchPrize } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Scratch cards are strictly randomized to ZERO wins after scratch per platform configuration
  const assignedPrize = {
    amountUsd: 0,
    label: 'Zero Win • Try Again Next Round',
  };

  useEffect(() => {
    if (isOpen) {
      setRevealed(false);
      setScratchedPercentage(0);
    }
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

  // Draw silver foil overlay onto canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 440;
    canvas.height = 240;

    // Metallic silver/carbon gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#71717a');
    grad.addColorStop(0.3, '#d4d4d8');
    grad.addColorStop(0.5, '#a1a1aa');
    grad.addColorStop(0.7, '#e4e4e7');
    grad.addColorStop(1, '#52525b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative grid pattern & instructions
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
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

    // Badge text on foil
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL JACKPOT', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#3f3f46';
    ctx.fillText('Hold & swipe cursor/finger across foil', canvas.width / 2, canvas.height / 2 + 18);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(`UP TO $${tier.maxPrizeUsd.toLocaleString()} MAX PRIZE`, canvas.width / 2, canvas.height / 2 + 42);
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

    // Clear entire canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Award 0 prize into wallet (zero win)
    awardScratchPrize(tier, 0, assignedPrize.label);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header bar */}
        <div className={`px-6 py-4 bg-gradient-to-r ${tier.gradient} flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="font-heading font-bold text-lg leading-tight">{tier.name}</h3>
              <p className="text-xs text-white/80">Cost: ${tier.priceUsd} • Max Win: ${tier.maxPrizeUsd.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <p className="text-xs text-zinc-400">
            Scratch off the silver metallic layer to reveal your card payout!
          </p>

          {/* Scratch Card Frame */}
          <div className="relative w-full max-w-[440px] h-[240px] rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 select-none">
            {/* Underlying Zero Win Outcome Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-radial from-zinc-900 via-zinc-950 to-black">
              <div className="space-y-2 animate-in zoom-in-90 duration-300">
                <div className="inline-flex p-3 rounded-full bg-red-600/10 text-red-400 border border-red-500/20">
                  <Frown className="w-10 h-10 text-zinc-400" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold block">
                    CARD OUTCOME REVEALED
                  </span>
                  <h4 className="font-heading font-black text-3xl text-zinc-300 drop-shadow-md">
                    $0.00 USD
                  </h4>
                  <p className="text-red-400 text-xs font-semibold mt-1">
                    Zero Win • Better Luck Next Scratch!
                  </p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    Card value (${tier.priceUsd}) consumed. House edge claimed.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>On-Chain Verified Hash: 0x{Math.random().toString(16).substring(2, 8)}...null</span>
                </div>
              </div>
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
                  className="h-full bg-gradient-to-r from-red-500 to-zinc-500 transition-all duration-150"
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
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <span>Close Card</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
