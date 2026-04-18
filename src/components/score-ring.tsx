import { motion } from "framer-motion";

export function ScoreRing({
  value,
  max = 1000,
  size = 120,
  label = "Score",
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 150)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 230)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-muted)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-semibold text-foreground tabular-nums">
            {value}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
