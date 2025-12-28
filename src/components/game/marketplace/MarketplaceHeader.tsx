import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles, TrendingUp, History } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MarketplaceHeaderProps {
  coins: number;
  isAuthenticated: boolean;
}

export function MarketplaceHeader({ coins, isAuthenticated }: MarketplaceHeaderProps) {
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinChange, setCoinChange] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (coins !== prevCoins) {
      setCoinChange(coins - prevCoins);
      setIsAnimating(true);
      setPrevCoins(coins);
      
      const timer = setTimeout(() => {
        setCoinChange(null);
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [coins, prevCoins]);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-yellow-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
      
      {/* Shimmer effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative p-6 flex flex-wrap items-center justify-between gap-4">
        {/* Store Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-3 h-3 text-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Loja Virtual
            </h1>
            <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
          </div>
        </div>

        {/* Coins Display */}
        <div className="flex items-center gap-3">
          <motion.div
            className={cn(
              "relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2",
              "bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10",
              "border-amber-500/30 shadow-lg",
              isAnimating && "ring-2 ring-amber-400/50"
            )}
            animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {/* Coin icon with animation */}
            <motion.div
              animate={isAnimating ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <Coins className="w-7 h-7 text-amber-500" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)" }}
                />
              </div>
            </motion.div>

            {/* Coin amount */}
            <div className="flex flex-col">
              <motion.span
                key={coins}
                initial={coinChange ? { scale: 1.2, color: coinChange > 0 ? "#22c55e" : "#ef4444" } : {}}
                animate={{ scale: 1, color: "inherit" }}
                className="text-2xl font-bold text-amber-500 tabular-nums"
              >
                {coins.toLocaleString("pt-BR")}
              </motion.span>
              <span className="text-xs text-amber-500/70">moedas</span>
            </div>

            {/* Change indicator */}
            <AnimatePresence>
              {coinChange && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute -top-2 right-4 text-sm font-bold px-2 py-0.5 rounded-full",
                    coinChange > 0 
                      ? "text-green-500 bg-green-500/20" 
                      : "text-red-500 bg-red-500/20"
                  )}
                >
                  {coinChange > 0 ? "+" : ""}{coinChange}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* History button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-card border border-border hover:border-amber-500/50 transition-colors"
            title="Histórico"
          >
            <History className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Login prompt */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4"
        >
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
            <Sparkles className="w-4 h-4" />
            <span>Faça login para comprar e ganhar moedas</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
