/**
 * ArenaGameStep - Launches Arena games within training
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gamepad2,
  Play,
  Trophy,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

// Import game components
import { QuizGame } from "@/components/game/quiz/QuizGame";
import { DecisionGame } from "@/components/game/enterprise/DecisionGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";

interface ArenaGameStepProps {
  module: EnhancedTrainingModule;
  onComplete: (result: StepResult) => void;
  onCancel: () => void;
}

const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  quiz: QuizGame,
  decision: DecisionGame,
  memory: MemoryGame,
  snake: SnakeGame,
  tetris: TetrisGame,
  dino: DinoGame,
};

const GAME_LABELS: Record<string, string> = {
  quiz: "Quiz Master",
  decision: "Jogo de Decisões",
  memory: "Jogo da Memória",
  snake: "Snake",
  tetris: "Tetris",
  dino: "Dino Run",
  sales: "Simulador de Vendas",
};

export function ArenaGameStep({ module, onComplete, onCancel }: ArenaGameStepProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<StepResult | null>(null);
  const [startTime] = useState(Date.now());

  const gameType = module.step_config?.game_type || 'quiz';
  const GameComponent = GAME_COMPONENTS[gameType];
  const minScore = module.min_score || 0;

  const handleGameComplete = useCallback((score: number, metadata?: Record<string, unknown>) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const passed = score >= minScore;
    
    const result: StepResult = {
      completed: true,
      score,
      passed,
      timeSpent,
      metadata: {
        ...metadata,
        game_type: gameType,
      },
    };
    
    setGameResult(result);
    setIsPlaying(false);
  }, [startTime, minScore, gameType]);

  const handleConfirmResult = () => {
    if (gameResult) {
      onComplete(gameResult);
    }
  };

  // If showing result
  if (gameResult) {
    const passed = gameResult.passed;
    
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              passed ? 'bg-primary/10' : 'bg-destructive/10'
            }`}
          >
            {passed ? (
              <CheckCircle className="w-10 h-10 text-primary" />
            ) : (
              <AlertCircle className="w-10 h-10 text-destructive" />
            )}
          </motion.div>

          <h3 className="text-2xl font-bold text-foreground mb-2">
            {passed ? 'Parabéns!' : 'Quase lá!'}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {passed
              ? 'Você completou o jogo com sucesso!'
              : `Score mínimo necessário: ${minScore}%`}
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {gameResult.score}%
              </div>
              <div className="text-sm text-muted-foreground">Seu Score</div>
            </div>
            {minScore > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  {minScore}%
                </div>
                <div className="text-sm text-muted-foreground">Mínimo</div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {!passed && (
              <Button variant="outline" onClick={() => {
                setGameResult(null);
                setIsPlaying(true);
              }}>
                Tentar Novamente
              </Button>
            )}
            <Button onClick={handleConfirmResult}>
              {passed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continuar
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If playing the game
  if (isPlaying && GameComponent) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="sm" onClick={() => setIsPlaying(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
        <GameComponent
          onComplete={(result: any) => {
            // Different games might return different result formats
            const score = typeof result === 'number' 
              ? result 
              : result?.score || result?.percentage || 0;
            handleGameComplete(score, typeof result === 'object' ? result : undefined);
          }}
          onExit={() => setIsPlaying(false)}
          trainingMode={true}
        />
      </div>
    );
  }

  // Start screen
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
          <Gamepad2 className="w-10 h-10 text-primary" />
        </div>

        <Badge className="mb-4">{GAME_LABELS[gameType] || 'Jogo da Arena'}</Badge>

        <h3 className="text-2xl font-bold text-foreground mb-2">{module.name}</h3>
        
        {module.description && (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {module.description}
          </p>
        )}

        {module.is_checkpoint && minScore > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Checkpoint</span>
            </div>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              Score mínimo para aprovação: {minScore}%
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Voltar
          </Button>
          <Button onClick={() => setIsPlaying(true)} size="lg">
            <Play className="w-5 h-5 mr-2" />
            Jogar Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
