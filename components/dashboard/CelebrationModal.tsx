"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Target, Zap, TrendingDown, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "PLAN_PAID_OFF" | "MILESTONE" | "ACHIEVEMENT";
  planName?: string;
  amountPaid?: number;
  monthsPaid?: number;
  totalDebtReduced?: number;
  achievementTitle?: string;
  achievementDescription?: string;
  nextGoal?: string;
}

// Confetti particle component
function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ["#2f7f76", "#45a79d", "#fbbf24", "#60a5fa", "#f472b6"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ 
        y: 400, 
        x: x + (Math.random() - 0.5) * 200,
        opacity: 0,
        scale: 0.5,
        rotate: Math.random() * 720
      }}
      transition={{ 
        duration: 2.5 + Math.random(),
        delay,
        ease: "easeOut"
      }}
      style={{ 
        position: "absolute",
        width: 8 + Math.random() * 8,
        height: 8 + Math.random() * 8,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        left: "50%",
        top: "20%"
      }}
    />
  );
}


export function CelebrationModal({
  isOpen,
  onClose,
  type,
  planName,
  amountPaid,
  monthsPaid,
  totalDebtReduced,
  achievementTitle,
  achievementDescription,
  nextGoal,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case "PLAN_PAID_OFF":
        return {
          icon: Trophy,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          title: `🎉 ${planName} Paid Off!`,
          subtitle: "One less commitment to worry about",
          stats: [
            { icon: CheckCircle2, label: "Months to pay off", value: `${monthsPaid} months` },
            { icon: Target, label: "Total amount paid", value: formatCurrency(amountPaid || 0) },
            { icon: TrendingDown, label: "Debt reduced by", value: formatCurrency(totalDebtReduced || 0) },
          ],
          message: "Every plan you complete brings you closer to financial freedom. Great job!",
          buttonText: "Continue to Dashboard",
          buttonVariant: "default" as const,
        };
      
      case "MILESTONE":
        return {
          icon: Award,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          title: achievementTitle || "Milestone Reached!",
          subtitle: achievementDescription || "You're making incredible progress",
          stats: [
            { icon: Target, label: "Current progress", value: formatCurrency(totalDebtReduced || 0) },
            { icon: Zap, label: "Momentum", value: "Strong" },
          ],
          message: nextGoal || "Keep the momentum going - your next milestone is within reach!",
          buttonText: "Keep Going",
          buttonVariant: "default" as const,
        };
      
      case "ACHIEVEMENT":
        return {
          icon: Sparkles,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
          title: achievementTitle || "Achievement Unlocked!",
          subtitle: achievementDescription || "You've earned a new badge",
          stats: [
            { icon: Award, label: "Badge earned", value: "Debt Slayer" },
            { icon: Target, label: "Progress", value: "On Track" },
          ],
          message: "Your consistent payments are paying off - literally!",
          buttonText: "View All Achievements",
          buttonVariant: "outline" as const,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  // Generate confetti pieces
  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: (Math.random() - 0.5) * 400
  }));


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Confetti Layer */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confetti.map((c) => (
                <ConfettiPiece key={c.id} delay={c.delay} x={c.x} />
              ))}
              </div>
          )}

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Header Background */}
            <div className="bg-linear-to-br from-[#2f7f76] via-[#2f7f76] to-[#45a79d] p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`mx-auto h-20 w-20 rounded-2xl ${content.iconBg} flex items-center justify-center shadow-lg mb-4`}
              >
                <Icon className={`h-10 w-10 ${content.iconColor}`} />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white"
              >
                {content.title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 mt-2"
              >
                {content.subtitle}
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6"
            >
              <div className="grid grid-cols-3 gap-3 mb-6">
                {content.stats.map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="text-center p-3 rounded-xl bg-gray-50"
                    >
                      <StatIcon className="h-5 w-5 text-[#2f7f76] mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-gray-600 text-sm mb-6"
              >
                {content.message}
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3"
              >
                <Button
                  onClick={onClose}
                  className="flex-1 bg-[#2f7f76] hover:bg-[#266a63] text-white rounded-full"
                >
                  {content.buttonText}
                </Button>
              </motion.div>
            </motion.div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage celebration state
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    config: Omit<CelebrationModalProps, "isOpen" | "onClose">;
  }>({
    isOpen: false,
    config: { type: "PLAN_PAID_OFF" },
  });

  const showCelebration = useCallback((config: Omit<CelebrationModalProps, "isOpen" | "onClose">) => {
    setCelebration({ isOpen: true, config });
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    celebration,
    showCelebration,
    closeCelebration,
    CelebrationModal: (
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={closeCelebration}
        {...celebration.config}
      />
    ),
  };
}
