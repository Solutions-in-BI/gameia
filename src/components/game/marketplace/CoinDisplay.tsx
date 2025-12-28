import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CoinDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showChange?: boolean;
  className?: string;
}

export function CoinDisplay({ amount, size = "md", showChange = true, className }: CoinDisplayProps) {
  const [prevAmount, setPrevAmount] = useState(amount);
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    if (amount !== prevAmount && showChange) {
      setChange(amount - prevAmount);
      setPrevAmount(amount);
      
      const timer = setTimeout(() => setChange(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [amount, prevAmount, showChange]);

  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("relative inline-flex items-center font-bold", sizeClasses[size], className)}>
      <motion.span
        className={iconSizes[size]}
        animate={{ rotate: change ? [0, -10, 10, 0] : 0 }}
        transition={{ duration: 0.3 }}
      >
        🪙
      </motion.span>
      
      <motion.span
        key={amount}
        initial={change ? { scale: 1.2, color: change > 0 ? "#22c55e" : "#ef4444" } : {}}
        animate={{ scale: 1, color: "inherit" }}
        transition={{ duration: 0.3 }}
        className="tabular-nums"
      >
        {amount.toLocaleString("pt-BR")}
      </motion.span>

      <AnimatePresence>
        {change && (
          <motion.span
            initial={{ opacity: 0, y: 0, x: 10 }}
            animate={{ opacity: 1, y: -20, x: 10 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute -right-8 top-0 text-xs font-bold",
              change > 0 ? "text-green-500" : "text-red-500"
            )}
          >
            {change > 0 ? "+" : ""}{change}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
