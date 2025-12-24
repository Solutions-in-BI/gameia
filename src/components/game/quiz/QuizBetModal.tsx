/**
 * Modal de aposta antes de iniciar o Quiz
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Coins, TrendingUp, AlertCircle } from "lucide-react";
import { QuizCategory } from "@/hooks/useQuizGame";

interface QuizBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: QuizCategory | null;
  userCoins: number;
  onStartGame: (bet: number) => void;
}

const BET_PRESETS = [0, 50, 100, 200, 500];

export function QuizBetModal({
  isOpen,
  onClose,
  category,
  userCoins,
  onStartGame,
}: QuizBetModalProps) {
  const [betAmount, setBetAmount] = useState(0);
  const maxBet = Math.min(userCoins, 1000);

  const handleStart = () => {
    onStartGame(betAmount);
    onClose();
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <span>{category.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da partida */}
          <div className="p-4 bg-muted/50 rounded-xl space-y-2">
            <p className="text-sm text-muted-foreground">{category.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>📝 10 perguntas</span>
              <span>⏱️ 15s por pergunta</span>
            </div>
          </div>

          {/* Sistema de apostas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                Fazer Aposta
              </h4>
              <span className="text-sm text-muted-foreground">
                Suas moedas: {userCoins}
              </span>
            </div>

            {/* Presets de aposta */}
            <div className="flex flex-wrap gap-2">
              {BET_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  variant={betAmount === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetAmount(preset)}
                  disabled={preset > userCoins}
                >
                  {preset === 0 ? "Sem aposta" : `${preset}`}
                </Button>
              ))}
            </div>

            {/* Slider para valor personalizado */}
            {userCoins > 0 && (
              <div className="space-y-2">
                <Slider
                  value={[betAmount]}
                  onValueChange={([value]) => setBetAmount(value)}
                  max={maxBet}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0</span>
                  <span className="text-lg font-bold text-yellow-500">
                    {betAmount} moedas
                  </span>
                  <span>{maxBet}</span>
                </div>
              </div>
            )}

            {/* Informações de recompensa */}
            {betAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Potencial de Ganho</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background/50 rounded-lg">
                    <span className="text-muted-foreground">≥70% acertos:</span>
                    <span className="block font-bold text-green-500">
                      +{betAmount * 2} moedas
                    </span>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg">
                    <span className="text-muted-foreground">≥50% acertos:</span>
                    <span className="block font-bold text-yellow-500">
                      +{betAmount} moedas
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Abaixo de 50% você perde a aposta
                </p>
              </motion.div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleStart} className="flex-1 gap-2">
              {betAmount > 0 ? (
                <>
                  <Coins className="w-4 h-4" />
                  Apostar e Jogar
                </>
              ) : (
                "Jogar Sem Aposta"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
