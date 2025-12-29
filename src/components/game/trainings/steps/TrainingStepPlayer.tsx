/**
 * TrainingStepPlayer - Universal step player for training modules
 * Renders different step types: content, arena games, cognitive tests, etc.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Trophy,
  Coins,
  Target,
  Brain,
  Gamepad2,
  FileText,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

// Step type components
import { ContentStep } from "./ContentStep";
import { ArenaGameStep } from "./ArenaGameStep";
import { CognitiveTestStep } from "./CognitiveTestStep";
import { ReflectionStep } from "./ReflectionStep";
import { PracticalChallengeStep } from "./PracticalChallengeStep";

interface TrainingStepPlayerProps {
  module: EnhancedTrainingModule;
  isCompleted: boolean;
  isLocked: boolean;
  onComplete: (result: StepResult) => Promise<void>;
  onSkip?: () => void;
}

const STEP_ICONS = {
  content: FileText,
  quiz: Target,
  arena_game: Gamepad2,
  cognitive_test: Brain,
  practical_challenge: Target,
  simulation: Gamepad2,
  reflection: MessageSquare,
};

const STEP_LABELS = {
  content: "Conteúdo",
  quiz: "Quiz",
  arena_game: "Jogo da Arena",
  cognitive_test: "Teste Cognitivo",
  practical_challenge: "Desafio Prático",
  simulation: "Simulação",
  reflection: "Reflexão",
};

export function TrainingStepPlayer({
  module,
  isCompleted,
  isLocked,
  onComplete,
  onSkip,
}: TrainingStepPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<StepResult | null>(null);

  const StepIcon = STEP_ICONS[module.step_type] || FileText;

  const handleStepComplete = useCallback(async (stepResult: StepResult) => {
    setIsSubmitting(true);
    try {
      await onComplete(stepResult);
      setResult(stepResult);
      setIsPlaying(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete]);

  const handleStartStep = () => {
    setIsPlaying(true);
    setResult(null);
  };

  // If locked, show locked state
  if (isLocked) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">{module.name}</h3>
          <p className="text-sm text-muted-foreground">
            Complete a etapa anterior para desbloquear
          </p>
        </CardContent>
      </Card>
    );
  }

  // If completed, show completion state
  if (isCompleted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {STEP_LABELS[module.step_type]}
                </Badge>
                {module.is_checkpoint && (
                  <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Checkpoint
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground mb-1">{module.name}</h3>
              <p className="text-sm text-muted-foreground">Etapa concluída</p>
              {result?.score !== undefined && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Score: {result.score}%</span>
                </div>
              )}
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span>+{module.xp_reward} XP</span>
              </div>
              {module.coins_reward > 0 && (
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  <Coins className="w-4 h-4" />
                  <span>+{module.coins_reward}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If playing, render the appropriate step component
  if (isPlaying) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="step-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Default: show start state
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
            module.is_checkpoint ? "bg-amber-500/10" : "bg-primary/10"
          )}>
            <StepIcon className={cn(
              "w-6 h-6",
              module.is_checkpoint ? "text-amber-500" : "text-primary"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {STEP_LABELS[module.step_type]}
              </Badge>
              {module.is_checkpoint && (
                <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Checkpoint
                </Badge>
              )}
              {module.is_optional && (
                <Badge variant="secondary" className="text-xs">
                  Opcional
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-foreground mb-1">{module.name}</h3>
            {module.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {module.description}
              </p>
            )}
            {module.is_checkpoint && module.min_score && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Score mínimo: {module.min_score}%
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span>+{module.xp_reward} XP</span>
              </div>
              {module.coins_reward > 0 && (
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  <Coins className="w-4 h-4" />
                  <span>+{module.coins_reward}</span>
                </div>
              )}
            </div>
            <Button onClick={handleStartStep} className="mt-2">
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function renderStepContent() {
    switch (module.step_type) {
      case 'content':
        return (
          <ContentStep
            module={module}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
          />
        );
      
      case 'arena_game':
      case 'simulation':
        return (
          <ArenaGameStep
            module={module}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
          />
        );
      
      case 'cognitive_test':
        return (
          <CognitiveTestStep
            module={module}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
          />
        );
      
      case 'reflection':
        return (
          <ReflectionStep
            module={module}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
            isSubmitting={isSubmitting}
          />
        );
      
      case 'practical_challenge':
        return (
          <PracticalChallengeStep
            module={module}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
            isSubmitting={isSubmitting}
          />
        );
      
      case 'quiz':
        return (
          <ArenaGameStep
            module={{ ...module, step_config: { ...module.step_config, game_type: 'quiz' } }}
            onComplete={handleStepComplete}
            onCancel={() => setIsPlaying(false)}
          />
        );
      
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p>Tipo de etapa não suportado: {module.step_type}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsPlaying(false)}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        );
    }
  }
}
