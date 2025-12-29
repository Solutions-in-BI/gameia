/**
 * Modal para ativar um boost do inventário
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface BoostItem {
  id: string;
  item: {
    name: string;
    icon: string;
    boost_type: string;
    boost_value: number;
    boost_duration_hours: number;
  };
  uses_remaining: number | null;
}

interface BoostActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BoostItem | null;
  onActivate: (inventoryId: string) => Promise<{ success: boolean }>;
}

const BOOST_TYPE_LABELS: Record<string, string> = {
  xp_multiplier: "XP",
  coins_multiplier: "Moedas",
  shield: "Proteção",
};

export function BoostActivationModal({ 
  isOpen, 
  onClose, 
  item, 
  onActivate 
}: BoostActivationModalProps) {
  const [isActivating, setIsActivating] = useState(false);

  if (!item) return null;

  const { name, icon, boost_type, boost_value, boost_duration_hours } = item.item;
  const multiplierPercent = Math.round((boost_value - 1) * 100);
  const typeLabel = BOOST_TYPE_LABELS[boost_type] || boost_type;

  const handleActivate = async () => {
    setIsActivating(true);
    const result = await onActivate(item.id);
    setIsActivating(false);
    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Ativar Vantagem
          </DialogTitle>
          <DialogDescription>
            Confirme a ativação do boost selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Boost preview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative">
              <span className="text-6xl">{icon}</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            
            <h3 className="mt-4 font-semibold text-lg">{name}</h3>
            
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">+{multiplierPercent}% {typeLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{boost_duration_hours}h de duração</span>
              </div>
            </div>

            {item.uses_remaining !== null && (
              <p className="mt-3 text-xs text-muted-foreground">
                {item.uses_remaining} {item.uses_remaining === 1 ? "uso restante" : "usos restantes"}
              </p>
            )}
          </motion.div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleActivate} 
            disabled={isActivating}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isActivating ? "Ativando..." : "Ativar agora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
