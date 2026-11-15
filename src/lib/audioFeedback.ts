export type AudioFeedbackVariant = 'default' | 'deposit' | 'order' | 'wrap' | 'jackpot';

const AUDIO_PREF_KEY = 'apex_tesla_audio_enabled';

let sharedAudioContext: AudioContext | null = null;
let lastPlayedTimestamp = 0;

interface ToneStep {
  frequency: number;
  delaySec: number;
  durationSec: number;
  peakGain: number;
  type: OscillatorType;
}

const SOUND_PATTERNS: Record<AudioFeedbackVariant, ToneStep[]> = {
  default: [
    { frequency: 587.33, delaySec: 0, durationSec: 0.11, peakGain: 0.045, type: 'sine' },
    { frequency: 880.0, delaySec: 0.065, durationSec: 0.18, peakGain: 0.055, type: 'triangle' },
  ],
  deposit: [
    { frequency: 523.25, delaySec: 0, durationSec: 0.1, peakGain: 0.045, type: 'sine' },
    { frequency: 659.25, delaySec: 0.06, durationSec: 0.11, peakGain: 0.05, type: 'sine' },
    { frequency: 1046.5, delaySec: 0.125, durationSec: 0.22, peakGain: 0.055, type: 'triangle' },
  ],
  order: [
    { frequency: 440.0, delaySec: 0, durationSec: 0.1, peakGain: 0.045, type: 'triangle' },
    { frequency: 659.25, delaySec: 0.07, durationSec: 0.13, peakGain: 0.05, type: 'sine' },
    { frequency: 880.0, delaySec: 0.14, durationSec: 0.2, peakGain: 0.05, type: 'sine' },
  ],
  wrap: [
    { frequency: 659.25, delaySec: 0, durationSec: 0.11, peakGain: 0.04, type: 'sine' },
    { frequency: 783.99, delaySec: 0.06, durationSec: 0.12, peakGain: 0.045, type: 'triangle' },
    { frequency: 1174.66, delaySec: 0.12, durationSec: 0.22, peakGain: 0.05, type: 'sine' },
  ],
  jackpot: [
    { frequency: 523.25, delaySec: 0, durationSec: 0.09, peakGain: 0.045, type: 'triangle' },
    { frequency: 659.25, delaySec: 0.055, durationSec: 0.1, peakGain: 0.05, type: 'triangle' },
    { frequency: 783.99, delaySec: 0.11, durationSec: 0.11, peakGain: 0.05, type: 'sine' },
    { frequency: 1046.5, delaySec: 0.17, durationSec: 0.26, peakGain: 0.06, type: 'sine' },
  ],
};

export const isAudioFeedbackEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(AUDIO_PREF_KEY);
    if (raw === 'false' || raw === '0') return false;
    return true;
  } catch {
    return true;
  }
};

export const setAudioFeedbackEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
};

export const inferAudioVariantFromMessage = (message: string): AudioFeedbackVariant => {
  const lower = message.toLowerCase();
  if (lower.includes('winner') || lower.includes('jackpot') || lower.includes('unlocked') || lower.includes('activated')) {
    return 'jackpot';
  }
  if (lower.includes('deposit') || lower.includes('credited') || lower.includes('vault')) {
    return 'deposit';
  }
  if (lower.includes('wrap') || lower.includes('studio') || lower.includes('ppf')) {
    return 'wrap';
  }
  if (
    lower.includes('order') ||
    lower.includes('checkout') ||
    lower.includes('invoice') ||
    lower.includes('booked') ||
    lower.includes('purchased') ||
    lower.includes('reserved')
  ) {
    return 'order';
  }
  return 'default';
};

export const playSuccessSound = (variant: AudioFeedbackVariant = 'default'): void => {
  if (typeof window === 'undefined') return;
  if (!isAudioFeedbackEnabled()) return;

  const nowMs = Date.now();
  if (nowMs - lastPlayedTimestamp < 120) return;
  lastPlayedTimestamp = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const triggerPattern = () => {
      const startTime = ctx.currentTime + 0.01;
      const steps = SOUND_PATTERNS[variant] || SOUND_PATTERNS.default;

      steps.forEach((step) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = step.type;
        osc.frequency.setValueAtTime(step.frequency, startTime + step.delaySec);

        gainNode.gain.setValueAtTime(0.0001, startTime + step.delaySec);
        gainNode.gain.exponentialRampToValueAtTime(
          step.peakGain,
          startTime + step.delaySec + 0.015
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + step.delaySec + step.durationSec
        );

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime + step.delaySec);
        osc.stop(startTime + step.delaySec + step.durationSec + 0.02);
      });
    };

    if (ctx.state === 'suspended') {
      void ctx.resume().then(triggerPattern).catch(() => {});
    } else {
      triggerPattern();
    }
  } catch {
    // Non-fatal on restricted audio environments
  }
};
