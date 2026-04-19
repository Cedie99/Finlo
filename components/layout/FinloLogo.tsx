import { cn } from "@/lib/utils";

type FinloLogoSize = "sm" | "md" | "lg";

const sizeMap: Record<FinloLogoSize, { mark: string; text: string; gap: string; stroke: string }> = {
  sm: {
    mark: "h-7 w-7 rounded-lg",
    text: "text-sm",
    gap: "gap-2",
    stroke: "stroke-[1.7]",
  },
  md: {
    mark: "h-8 w-8 rounded-xl",
    text: "text-base",
    gap: "gap-2.5",
    stroke: "stroke-[1.8]",
  },
  lg: {
    mark: "h-9 w-9 rounded-xl",
    text: "text-xl",
    gap: "gap-2.5",
    stroke: "stroke-[1.9]",
  },
};

interface FinloLogoProps {
  size?: FinloLogoSize;
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}

export function FinloLogo({
  size = "md",
  showWordmark = true,
  className,
  markClassName,
  wordmarkClassName,
}: FinloLogoProps) {
  const styles = sizeMap[size];

  return (
    <div className={cn("flex items-center", styles.gap, className)}>
      <div
        className={cn(
          "relative isolate shrink-0 overflow-hidden border border-white/45 bg-[linear-gradient(145deg,#2451de_0%,#5f8cff_100%)] text-white shadow-[0_10px_24px_rgba(36,91,255,0.26)]",
          styles.mark,
          markClassName
        )}
        aria-hidden
      >
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.55),transparent_54%)]" />
        <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-[70%] w-[70%]" fill="none">
          <path
            d="M2.8 8.4c2-2 5.2-2 7.2 0s5.2 2 7.2 0"
            className={cn("text-white/90", styles.stroke)}
            stroke="currentColor"
            strokeLinecap="round"
          />
          <path
            d="M2.8 13.8c2-2 5.2-2 7.2 0s5.2 2 7.2 0"
            className={cn("text-white/85", styles.stroke)}
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showWordmark ? (
        <span className={cn("font-heading font-semibold tracking-wide text-[#15203d]", styles.text, wordmarkClassName)}>FINLO</span>
      ) : null}
    </div>
  );
}
