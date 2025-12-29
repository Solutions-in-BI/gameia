/**
 * Header reutilizável para subpáginas com navegação e saldo de moedas
 */

import { ArrowLeft, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  coins?: number;
  showCoins?: boolean;
  backTo?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  coins = 0, 
  showCoins = false,
  backTo = "/app",
  children 
}: PageHeaderProps) {
  const navigate = useNavigate();
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinChange, setCoinChange] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (coins !== prevCoins && prevCoins !== 0) {
      setCoinChange(coins - prevCoins);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setCoinChange(null);
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevCoins(coins);
  }, [coins, prevCoins]);

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(backTo)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Coins + Children */}
          <div className="flex items-center gap-3 shrink-0">
            {children}
            
            {showCoins && (
              <motion.div
                className={cn(
                  "relative flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  "bg-amber-500/10 border border-amber-500/20",
                  isAnimating && "ring-1 ring-amber-400/50"
                )}
                animate={isAnimating ? { scale: [1, 1.03, 1] } : {}}
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <motion.span
                  key={coins}
                  initial={coinChange ? { scale: 1.1 } : {}}
                  animate={{ scale: 1 }}
                  className="text-sm font-semibold text-amber-600 tabular-nums"
                >
                  {coins.toLocaleString("pt-BR")}
                </motion.span>
                
                <AnimatePresence>
                  {coinChange && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: -12 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "absolute -top-1 right-1 text-[10px] font-medium px-1 py-0.5 rounded",
                        coinChange > 0 ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
                      )}
                    >
                      {coinChange > 0 ? "+" : ""}{coinChange}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
