/**
 * Seletor de modo de jogo para Quiz Battle
 */

import { motion } from "framer-motion";
import { Zap, Brain, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GAME_MODE_COLORS } from "@/constants/colors";

export type GameMode = "normal" | "blitz" | "strategy" | "hardcore";

interface GameModeOption {
  id: GameMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  time: number; // segundos por pergunta
  multiplier: number;
  colorKey: keyof typeof GAME_MODE_COLORS;
}

const gameModes: GameModeOption[] = [
  {
    id: "normal",
    name: "Normal",
    description: "Modo padrão com 15 segundos por pergunta",
    icon: <Clock className="w-6 h-6" />,
    time: 15,
    multiplier: 1,
    colorKey: "beginner",
  },
  {
    id: "blitz",
    name: "Blitz",
    description: "Velocidade máxima! Apenas 5 segundos",
    icon: <Zap className="w-6 h-6" />,
    time: 5,
    multiplier: 2,
    colorKey: "blitz",
  },
  {
    id: "strategy",
    name: "Estratégia",
    description: "60 segundos para pensar com calma",
    icon: <Brain className="w-6 h-6" />,
    time: 60,
    multiplier: 0.75,
    colorKey: "marathon",
  },
  {
    id: "hardcore",
    name: "Hardcore",
    description: "10 segundos, sem dicas. Recompensa 3x!",
    icon: <Shield className="w-6 h-6" />,
    time: 10,
    multiplier: 3,
    colorKey: "challenge",
  },
];

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export function GameModeSelector({ selectedMode, onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Escolha o Modo de Jogo</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gameModes.map((mode, index) => {
          const colors = GAME_MODE_COLORS[mode.colorKey];
          
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-300",
                "bg-gradient-to-br",
                colors.gradient,
                colors.border,
                selectedMode === mode.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "hover:scale-[1.02]"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  {mode.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{mode.name}</h4>
                    {mode.multiplier !== 1 && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-bold",
                          mode.multiplier > 1
                            ? "bg-gameia-success/20 text-gameia-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        x{mode.multiplier}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{mode.time}s por pergunta</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function getGameModeConfig(mode: GameMode) {
  return gameModes.find((m) => m.id === mode) || gameModes[0];
}
