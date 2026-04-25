import { cn } from "@/lib/utils";

type FinloLogoSize = "sm" | "md" | "lg";

const sizeMap: Record<FinloLogoSize, { mark: string; text: string; gap: string }> = {
  sm: {
    mark: "h-6 w-6",
    text: "text-base",
    gap: "gap-2",
  },
  md: {
    mark: "h-7 w-7",
    text: "text-lg",
    gap: "gap-2.5",
  },
  lg: {
    mark: "h-8 w-8",
    text: "text-[1.45rem]",
    gap: "gap-2.5",
  },
};

interface FinloLogoProps {
  size?: FinloLogoSize;
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  /** Use on dark backgrounds — swaps logo colors to light palette */
  dark?: boolean;
}

export function FinloLogo({
  size = "md",
  showWordmark = true,
  className,
  markClassName,
  wordmarkClassName,
  dark = false,
}: FinloLogoProps) {
  const styles = sizeMap[size];

  return (
    <div className={cn("flex items-center", styles.gap, className)}>
      <svg
        viewBox="0 0 56 56"
        className={cn("shrink-0", styles.mark, markClassName)}
        fill="none"
        aria-hidden
      >
        <path
          d="M34.5 8c0-2.9-2.3-5.2-5.2-5.2h-5.2c-8 0-14.5 6.5-14.5 14.5V21H6.8A3.8 3.8 0 0 0 3 24.8c0 2.1 1.7 3.8 3.8 3.8h2.8v18.6c0 2.9 2.3 5.2 5.2 5.2s5.2-2.3 5.2-5.2V28.6h9.8a3.8 3.8 0 1 0 0-7.6h-9.8v-3.7c0-2.2 1.8-4 4-4h5.2c2.9 0 5.2-2.3 5.2-5.2Z"
          fill={dark ? "#ffffff" : "#0f2424"}
        />
        <path
          d="M9.6 47.5c6.7 0 12.8-2.3 18-7"
          stroke={dark ? "#b4f03a" : "#2f7f76"}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark ? (
        <span className={cn("font-heading font-semibold lowercase leading-none tracking-tight", styles.text, dark ? "text-white" : "text-[#0f2424]", wordmarkClassName)}>
          finlo
        </span>
      ) : null}
    </div>
  );
}
