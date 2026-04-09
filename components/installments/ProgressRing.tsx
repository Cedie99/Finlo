interface ProgressRingProps {
  paid: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({
  paid,
  total,
  size = 64,
  strokeWidth = 6,
  color = "#6366f1",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? paid / total : 0;
  const offset = circumference - pct * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xs font-bold leading-none">{paid}</div>
        <div className="text-[10px] text-muted-foreground leading-none">
          /{total}
        </div>
      </div>
    </div>
  );
}
