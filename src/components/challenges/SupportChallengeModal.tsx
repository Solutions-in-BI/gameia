/**
 * SupportChallengeModal - Modal para apoiar um desafio (Torcida)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Coins, Sparkles, Users, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Challenge } from "@/hooks/useChallenges";

interface SupportChallengeModalProps {
  challenge: Challenge | null;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  onSupport: (coins: number) => Promise<boolean>;
}

const PRESET_AMOUNTS = [10, 25, 50, 100];

export function SupportChallengeModal({
  challenge,
  userCoins,
  isOpen,
  onClose,
  onSupport,
}: SupportChallengeModalProps) {
  const [amount, setAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  if (!challenge) return null;

  const maxAmount = Math.min(userCoins, 500);
  const currentMultiplier = challenge.supporter_multiplier;
  
  // Simula novo multiplicador com apoio
  const newSupportersCount = challenge.supporters_count + 1;
  const potentialMultiplier = 1 + Math.min((newSupportersCount / 5) * 0.1, 1.0);

  const handleSupport = async () => {
    if (amount < 1 || amount > maxAmount) return;
    
    setIsLoading(true);
    const success = await onSupport(amount);
    setIsLoading(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Apoiar Desafio
          </DialogTitle>
          <DialogDescription>
            Aposte moedas para torcer pelo sucesso. Se completarem, você ganha de volta + bônus!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Challenge info */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <h4 className="font-medium mb-1">{challenge.name}</h4>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{challenge.participants_count} participantes</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Heart className="w-4 h-4" />
                <span>{challenge.supporters_count} apoiadores</span>
              </div>
            </div>
          </div>

          {/* Amount selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantidade</span>
              <span className="text-sm text-muted-foreground">
                Você tem: <span className="text-amber-400">{userCoins} 🪙</span>
              </span>
            </div>

            {/* Preset buttons */}
            <div className="flex gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset)}
                  disabled={preset > maxAmount}
                  className="flex-1"
                >
                  {preset}
                </Button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <Slider
                value={[amount]}
                onValueChange={([v]) => setAmount(v)}
                min={1}
                max={maxAmount}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <motion.span
                  key={amount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-primary"
                >
                  {amount} 🪙
                </motion.span>
                <span>{maxAmount}</span>
              </div>
            </div>
          </div>

          {/* Multiplier impact */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Impacto no Multiplicador
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base">
                {currentMultiplier.toFixed(1)}x
              </Badge>
              <TrendingUp className="w-4 h-4 text-green-400" />
              <Badge className="text-base bg-green-500">
                {potentialMultiplier.toFixed(1)}x
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              Seu apoio aumenta o multiplicador de recompensa para todos os participantes!
            </p>
          </div>

          {/* What happens */}
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Se o desafio for <strong>completado</strong>: você recebe suas moedas + bônus do pool</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span>Se <strong>falhar</strong>: as moedas são perdidas</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSupport} 
            disabled={isLoading || amount < 1 || amount > maxAmount}
            className="flex-1 gap-2"
          >
            <Coins className="w-4 h-4" />
            Apostar {amount} moedas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
