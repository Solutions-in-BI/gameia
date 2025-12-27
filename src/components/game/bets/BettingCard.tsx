/**
 * Card de Aposta individual
 * Mostra odds, participantes, prazo e botões de apostar
 */

import { motion } from "framer-motion";
import { Users, Clock, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type BetType = "prediction" | "challenge";

export interface Bet {
  id: string;
  title: string;
  description: string;
  type: BetType;
  participants: number;
  daysLeft: number;
  oddsFor: number;
  oddsAgainst: number;
  minBet: number;
  maxBet: number;
  isActive: boolean;
}

interface BettingCardProps {
  bet: Bet;
  onBetFor: () => void;
  onBetAgainst: () => void;
  delay?: number;
}

const TYPE_STYLES: Record<BetType, { label: string; color: string }> = {
  prediction: {
    label: "PREDICTION",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  challenge: {
    label: "CHALLENGE",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

export function BettingCard({ bet, onBetFor, onBetAgainst, delay = 0 }: BettingCardProps) {
  const typeStyle = TYPE_STYLES[bet.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{bet.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{bet.description}</p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold border shrink-0 ml-3",
          typeStyle.color
        )}>
          {typeStyle.label}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {bet.participants} participantes
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {bet.daysLeft} dias
        </span>
      </div>

      {/* Odds Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* A Favor */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            A Favor
          </div>
          <div className="text-3xl font-bold text-foreground">
            {bet.oddsFor.toFixed(2)}x
          </div>
          <Button
            onClick={onBetFor}
            disabled={!bet.isActive}
            className="w-full bg-transparent border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
          >
            APOSTAR
          </Button>
        </div>

        {/* Contra */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-rose-400">
            <TrendingDown className="w-4 h-4" />
            Contra
          </div>
          <div className="text-3xl font-bold text-foreground">
            {bet.oddsAgainst.toFixed(2)}x
          </div>
          <Button
            onClick={onBetAgainst}
            disabled={!bet.isActive}
            className="w-full bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
          >
            APOSTAR
          </Button>
        </div>
      </div>

      {/* Min/Max */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          Min: <Coins className="w-3 h-3 text-amber-400" /> {bet.minBet.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          Max: <Coins className="w-3 h-3 text-amber-400" /> {bet.maxBet.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
