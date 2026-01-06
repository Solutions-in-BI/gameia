/**
 * Componentes de Feedback Visual
 * Toasts, alerts e estados de sucesso/erro animados
 * 
 * Paleta: Honey & Charcoal - usando cores centralizadas
 */

import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Sparkles,
  Trophy,
  Coins,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { REWARD_COLORS, STATUS_COLORS } from "@/constants/colors";

// Success State Animation
export function SuccessAnimation({ 
  message, 
  subMessage,
  onComplete 
}: { 
  message: string; 
  subMessage?: string;
  onComplete?: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(() => onComplete?.(), 1500);
      }}
      className="flex flex-col items-center gap-3 p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
        className={cn("w-20 h-20 rounded-full flex items-center justify-center", STATUS_COLORS.success.bgSubtle)}
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CheckCircle2 className={cn("w-12 h-12", STATUS_COLORS.success.text)} />
        </motion.div>
      </motion.div>
      <motion.p 
        className="text-xl font-bold text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
      {subMessage && (
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subMessage}
        </motion.p>
      )}
    </motion.div>
  );
}

// Reward Animation (XP, Coins, etc.)
interface RewardAnimationProps {
  type: "xp" | "coins" | "badge" | "achievement";
  amount?: number;
  label: string;
  onComplete?: () => void;
}

export function RewardAnimation({ type, amount, label, onComplete }: RewardAnimationProps) {
  const icons = {
    xp: <Star className={cn("w-8 h-8", REWARD_COLORS.xp.icon)} />,
    coins: <Coins className={cn("w-8 h-8", REWARD_COLORS.coins.icon)} />,
    badge: <Trophy className={cn("w-8 h-8", REWARD_COLORS.badge.icon)} />,
    achievement: <Sparkles className={cn("w-8 h-8", REWARD_COLORS.achievement.icon)} />,
  };

  const colors = REWARD_COLORS[type];

  return (
    <motion.div
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: -20, opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(() => onComplete?.(), 2000);
      }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        "bg-gradient-to-r backdrop-blur-sm",
        colors.gradient,
        colors.border
      )}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {icons[type]}
      </motion.div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {amount !== undefined && (
          <motion.p 
            className="text-lg font-bold text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            +{amount.toLocaleString()}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Floating Notification (para conquistas, level up, etc.)
interface FloatingNotificationProps {
  show: boolean;
  icon?: React.ReactNode;
  title: string;
  message?: string;
  variant?: "success" | "warning" | "error" | "info" | "reward";
  onClose?: () => void;
  autoClose?: number;
}

export function FloatingNotification({ 
  show, 
  icon, 
  title, 
  message, 
  variant = "info",
  onClose,
  autoClose = 4000
}: FloatingNotificationProps) {
  const variants = {
    success: {
      bg: cn(STATUS_COLORS.success.bgSubtle, STATUS_COLORS.success.border),
      icon: <CheckCircle2 className={cn("w-5 h-5", STATUS_COLORS.success.text)} />,
    },
    warning: {
      bg: cn(STATUS_COLORS.warning.bgSubtle, STATUS_COLORS.warning.border),
      icon: <AlertCircle className={cn("w-5 h-5", STATUS_COLORS.warning.text)} />,
    },
    error: {
      bg: cn(STATUS_COLORS.error.bgSubtle, STATUS_COLORS.error.border),
      icon: <XCircle className={cn("w-5 h-5", STATUS_COLORS.error.text)} />,
    },
    info: {
      bg: cn(STATUS_COLORS.info.bgSubtle, STATUS_COLORS.info.border),
      icon: <Info className={cn("w-5 h-5", STATUS_COLORS.info.text)} />,
    },
    reward: {
      bg: cn("bg-gradient-to-r", REWARD_COLORS.streak.gradient, REWARD_COLORS.streak.border),
      icon: <Sparkles className={cn("w-5 h-5", REWARD_COLORS.streak.icon)} />,
    },
  };

  const config = variants[variant];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          onAnimationComplete={() => {
            if (autoClose > 0) {
              setTimeout(() => onClose?.(), autoClose);
            }
          }}
          className={cn(
            "fixed top-4 left-1/2 z-50",
            "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm",
            "shadow-lg",
            config.bg
          )}
        >
          {icon || config.icon}
          <div>
            <p className="font-medium text-foreground">{title}</p>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pulse Effect para destacar elementos
export function PulseHighlight({ 
  children, 
  active = false,
  color = "primary"
}: { 
  children: React.ReactNode; 
  active?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}) {
  const colors = {
    primary: "ring-primary/50",
    success: "ring-gameia-success/50",
    warning: "ring-gameia-warning/50",
    error: "ring-destructive/50",
  };

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.5, 0], 
              scale: [1, 1.5] 
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity 
            }}
            className={cn(
              "absolute inset-0 rounded-lg ring-2",
              colors[color]
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Number Counter Animation
export function AnimatedNumber({ 
  value, 
  duration = 1,
  className 
}: { 
  value: number; 
  duration?: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}
