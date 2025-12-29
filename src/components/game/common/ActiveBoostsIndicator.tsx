/**
 * Indicador de boosts ativos - exibido no header/perfil
 */

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { useBoosts, ActiveBoost } from "@/hooks/useBoosts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActiveBoostsIndicatorProps {
  compact?: boolean;
}

function formatTimeRemaining(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const BOOST_TYPE_ICONS: Record<string, string> = {
  xp_multiplier: "⚡",
  coins_multiplier: "🪙",
  shield: "🛡️",
};

export function ActiveBoostsIndicator({ compact = false }: ActiveBoostsIndicatorProps) {
  const { activeBoosts, hasActiveBoost, isLoading } = useBoosts();

  if (isLoading || !hasActiveBoost) return null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-full">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </motion.div>
                <span className="text-xs font-medium text-amber-600">
                  {activeBoosts.length}
                </span>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-0">
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Boosts ativos</p>
              {activeBoosts.map((boost) => (
                <BoostItem key={boost.inventory_id} boost={boost} />
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activeBoosts.map((boost) => (
          <motion.div
            key={boost.inventory_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <BoostItem boost={boost} expanded />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function BoostItem({ boost, expanded = false }: { boost: ActiveBoost; expanded?: boolean }) {
  const multiplierPercent = Math.round((boost.boost_value - 1) * 100);
  const icon = BOOST_TYPE_ICONS[boost.boost_type] || "⚡";
  const timeRemaining = formatTimeRemaining(boost.hours_remaining);

  if (expanded) {
    return (
      <div className="flex items-center gap-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
        <span className="text-2xl">{boost.item_icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{boost.item_name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-emerald-600 font-medium">+{multiplierPercent}%</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Zap className="w-4 h-4 text-amber-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm font-medium">+{multiplierPercent}%</span>
      </div>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {timeRemaining}
      </span>
    </div>
  );
}
