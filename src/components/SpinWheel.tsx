import { useEffect, useMemo, useRef, useState } from 'react';

interface SpinWheelProps {
  segments?: string[];
  targetIndex?: number;
  targetLabel?: string;
  onTarget?: (segment: string, index: number) => void;
  rotationDurationMs?: number;
  hasReferral?: boolean;
  disabled?: boolean;
  spinTrigger?: number;
}

const normalizeAngle = (angle: number) => {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const segmentColors = ['#1f2937', '#2563eb', '#0f766e', '#16a34a', '#ca8a04', '#7c3aed'];
const segmentTextColors = ['#f8fafc', '#f8fafc', '#f8fafc', '#f8fafc', '#0f172a', '#f8fafc'];

const createArcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const radians = (angle: number) => (angle * Math.PI) / 180;
  const startX = centerX + radius * Math.cos(radians(startAngle));
  const startY = centerY + radius * Math.sin(radians(startAngle));
  const endX = centerX + radius * Math.cos(radians(endAngle));
  const endY = centerY + radius * Math.sin(radians(endAngle));
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

export default function SpinWheel({
  segments = ['49', '99', '199', '499', '999', '2499'],
  targetIndex = 3,
  targetLabel,
  onTarget,
  rotationDurationMs = 24 * 60 * 60 * 1000,
  hasReferral = true,
  disabled = false,
}: SpinWheelProps) {
  const activeTargetIndex = targetLabel
    ? segments.indexOf(targetLabel)
    : targetIndex;
  const validTargetIndex = Math.max(0, Math.min(activeTargetIndex, segments.length - 1));
  const [angle, setAngle] = useState(0);
  const [timeToTarget, setTimeToTarget] = useState(rotationDurationMs);
  const [hit, setHit] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const startTimeRef = useRef(Date.now());
  const notifiedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const spinningRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const spinOscillatorRef = useRef<OscillatorNode | null>(null);
  const spinGainRef = useRef<GainNode | null>(null);
  const spinIntervalRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number | null>(null);
  const angleRef = useRef(angle);
  angleRef.current = angle;
  const formatLabel = (s: string) => {
    const str = String(s).trim();
    return str.toUpperCase().endsWith('ETB') ? str : `${str} ETB`;
  };

  useEffect(() => {
    let rafId: number;

    const update = () => {
      if (spinningRef.current) {
        rafId = requestAnimationFrame(update);
        rafRef.current = rafId;
        return;
      }

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const cyclePosition = elapsed % rotationDurationMs;
      const nextAngle = (cyclePosition / rotationDurationMs) * 360;
      const pointerAngle = normalizeAngle(360 - nextAngle);
      const sectorAngle = 360 / segments.length;
      const nextIndex = Math.floor(pointerAngle / sectorAngle) % segments.length;
      const targetCenter = validTargetIndex * sectorAngle + sectorAngle / 2;
      const remainingAngle = normalizeAngle(targetCenter - pointerAngle);
      const remainingMs = (remainingAngle / 360) * rotationDurationMs;

      setAngle(nextAngle);
      setTimeToTarget(remainingMs);
      setActiveIndex(nextIndex);

      if (!spinningRef.current) {
        notifiedRef.current = false;
        setHit(false);
      }

      rafId = requestAnimationFrame(update);
      rafRef.current = rafId;
    };

    rafId = requestAnimationFrame(update);
    rafRef.current = rafId;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rotationDurationMs, segments, validTargetIndex, onTarget]);

  // When `targetIndex` changes, perform a focused spin animation
  const startSpinSound = () => {
    if (typeof window === 'undefined') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 180;
      gain.gain.value = 0.0;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.8);

      spinOscillatorRef.current = oscillator;
      spinGainRef.current = gain;

      if (spinIntervalRef.current !== null) {
        window.clearInterval(spinIntervalRef.current);
      }
      spinIntervalRef.current = window.setInterval(() => {
        if (!spinOscillatorRef.current || !spinGainRef.current) return;
        const nextFreq = 260 + Math.random() * 120;
        spinOscillatorRef.current.frequency.setTargetAtTime(nextFreq, ctx.currentTime, 0.02);
      }, 120);
    } catch (error) {
      console.error('Spin sound failed:', error);
    }
  };

  const stopSpinSound = () => {
    try {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const oscillator = spinOscillatorRef.current;
      const gain = spinGainRef.current;

      if (oscillator && gain) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        oscillator.stop(ctx.currentTime + 0.15);
      }

      if (spinIntervalRef.current !== null) {
        window.clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }

      spinOscillatorRef.current = null;
      spinGainRef.current = null;
    } catch (error) {
      console.error('Stop spin sound failed:', error);
    }
  };

  const playLandSound = () => {
    if (typeof window === 'undefined') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = 520;
      gain.gain.value = 0.12;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      oscillator.stop(now + 0.22);
    } catch (error) {
      console.error('Land sound failed:', error);
    }
  };

  const performTargetSpin = (targetIdx: number) => {
    if (spinningRef.current) return;
    startSpinSound();
    prevTargetRef.current = targetIdx;
    spinningRef.current = true;

    const sectorAngle = 360 / segments.length;
    const targetCenter = targetIdx * sectorAngle + sectorAngle / 2;
    const desiredFinal = normalizeAngle(360 - targetCenter);
    const extraTurns = 3;
    const finalAngle = desiredFinal + 360 * extraTurns;

    const startAngle = angleRef.current;
    const duration = 1800;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startAngle + (finalAngle - startAngle) * eased;
      const normalized = normalizeAngle(current);
      setAngle(current);

      const pointerAngle = normalizeAngle(360 - normalized);
      const nextIndex = Math.floor(pointerAngle / sectorAngle) % segments.length;
      setActiveIndex(nextIndex);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        spinningRef.current = false;
        stopSpinSound();
        startTimeRef.current = Date.now() - (normalized / 360) * rotationDurationMs;
        setHit(true);
        playLandSound();
        onTarget?.(segments[targetIdx], targetIdx);
        setTimeout(() => setHit(false), 1500);
      }
    };

    requestAnimationFrame(step);
  };

  const countdownLabel = useMemo(
    () => formatCountdown(timeToTarget),
    [timeToTarget],
  );

  return (
    <div className="space-y-4">
      <div className="relative mx-auto w-72 h-72">
        <svg viewBox="0 0 200 200" className="w-full h-full rounded-full shadow-lg" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%' }}>
          {segments.map((segment, index) => {
            const sectorAngle = 360 / segments.length;
            const startAngle = index * sectorAngle - 90;
            const endAngle = startAngle + sectorAngle;
            const path = createArcPath(100, 100, 96, startAngle, endAngle);
            const midAngle = startAngle + sectorAngle / 2;
            const labelX = 100 + 64 * Math.cos((midAngle * Math.PI) / 180);
            const labelY = 100 + 64 * Math.sin((midAngle * Math.PI) / 180);
            const outerX = 100 + 86 * Math.cos((midAngle * Math.PI) / 180);
            const outerY = 100 + 86 * Math.sin((midAngle * Math.PI) / 180);
            const isActive = index === activeIndex;
            const isTargetHit = hit && index === validTargetIndex;

            return (
              <g key={segment}>
                {/** sector */}
                <path
                  d={path}
                  fill={segmentColors[index % segmentColors.length]}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                {isTargetHit && (
                  <g>
                    <circle
                      cx={outerX}
                      cy={outerY}
                      r="18"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      opacity="0.8"
                      className="animate-ping"
                    />
                    <circle
                      cx={outerX}
                      cy={outerY}
                      r="10"
                      fill="rgba(245,158,11,0.18)"
                    />
                    <circle
                      cx={outerX}
                      cy={outerY}
                      r="6"
                      fill="#f59e0b"
                    />
                  </g>
                )}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight={isActive ? '700' : '500'}
                  fill={segmentTextColors[index % segmentTextColors.length]}
                >
                  {formatLabel(segment)}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="30" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="100" cy="100" r="14" fill="#0f172a" />
          <path d="M100 10 L96 22 L104 22 Z" fill="#ef4444" />
        </svg>
        <button
          onClick={() => { if (hasReferral && !disabled) performTargetSpin(validTargetIndex); }}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-semibold py-2 px-4 rounded-full shadow-lg ${hasReferral ? 'bg-amber-400 hover:bg-amber-500' : 'bg-slate-300 cursor-not-allowed'}`}
          aria-label="Spin"
          disabled={!hasReferral || Boolean(disabled)}
        >
          {disabled ? 'Please wait...' : hasReferral ? 'Spin' : 'No referral'}
        </button>
      </div>

      <div className="p-4 border bg-slate-50 border-slate-200 rounded-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Target segment</p>
            <p className="text-lg font-semibold text-slate-900">{formatLabel(segments[validTargetIndex])}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Current segment</p>
            <p className="text-lg font-semibold text-slate-900">{formatLabel(segments[activeIndex])}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-600">Time until target</p>
          <p className="text-lg font-semibold text-slate-900">{countdownLabel}</p>
        </div>
        {hit ? (
          <div className="inline-flex items-center px-3 py-2 mt-4 text-sm font-semibold text-white rounded-full bg-emerald-600">
            Target reached: {segments[validTargetIndex]}
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-2 mt-4 text-sm font-medium rounded-full text-slate-700 bg-slate-100">
            Rotating for 24 hours
          </div>
        )}
      </div>
    </div>
  );
}
