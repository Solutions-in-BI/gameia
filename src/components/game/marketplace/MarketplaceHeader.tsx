import { motion, AnimatePresence } from "framer-motion";
import { Coins, Store } from "lucide-react";
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
    <div className="relative rounded-xl mb-6 bg-card border border-border">
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Store Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Loja de Recompensas
            </h1>
            <p className="text-sm text-muted-foreground">Troque suas moedas por benefícios</p>
          </div>
        </div>

        {/* Coins Display */}
        <motion.div
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-amber-500/10 border border-amber-500/20",
            isAnimating && "ring-1 ring-amber-400/50"
          )}
          animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
        >
          <Coins className="w-5 h-5 text-amber-500" />
          <motion.span
            key={coins}
            initial={coinChange ? { scale: 1.1 } : {}}
            animate={{ scale: 1 }}
            className="text-lg font-semibold text-amber-600 tabular-nums"
          >
            {coins.toLocaleString("pt-BR")}
          </motion.span>
          
          <AnimatePresence>
            {coinChange && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: -15 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute -top-1 right-2 text-xs font-medium px-1.5 py-0.5 rounded",
                  coinChange > 0 ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
                )}
              >
                {coinChange > 0 ? "+" : ""}{coinChange}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Login prompt */}
      {!isAuthenticated && (
        <div className="px-5 pb-4">
          <p className="text-sm text-muted-foreground">
            Faça login para comprar e acumular moedas
          </p>
        </div>
      )}
    </div>
  );
}
