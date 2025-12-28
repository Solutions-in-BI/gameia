/**
 * Componentes de Feedback Visual
 * Toasts, alerts e estados de sucesso/erro animados
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
        className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
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
    xp: <Star className="w-8 h-8 text-amber-400" />,
    coins: <Coins className="w-8 h-8 text-yellow-400" />,
    badge: <Trophy className="w-8 h-8 text-purple-400" />,
    achievement: <Sparkles className="w-8 h-8 text-cyan-400" />,
  };

  const colors = {
    xp: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    coins: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    badge: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    achievement: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  };

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
        colors[type]
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
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    },
    error: {
      bg: "bg-rose-500/10 border-rose-500/30",
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
    reward: {
      bg: "bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
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
    success: "ring-emerald-500/50",
    warning: "ring-amber-500/50",
    error: "ring-rose-500/50",
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
