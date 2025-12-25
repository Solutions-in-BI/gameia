/**
 * Componente de cenário de decisão empresarial
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Target, AlertTriangle, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DecisionScenario, DecisionOption, DecisionResult } from "@/hooks/useDecisionGame";

interface DecisionScenarioCardProps {
  scenario: DecisionScenario;
  options: DecisionOption[];
  result: DecisionResult | null;
  onDecision: (optionId: string, timeTaken: number) => void;
  onNext: () => void;
}

export function DecisionScenarioCard({
  scenario,
  options,
  result,
  onDecision,
  onNext,
}: DecisionScenarioCardProps) {
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, result]);

  const handleSelect = (optionId: string) => {
    if (result) return;
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    const timeTaken = Date.now() - startTime;
    onDecision(selectedOption, timeTaken);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-medium uppercase", getDifficultyColor(scenario.difficulty))}>
            {scenario.difficulty}
          </span>
          <span className="text-sm text-muted-foreground">
            +{scenario.xp_reward} XP
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Scenario Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
      >
        <h2 className="text-xl font-bold mb-4">{scenario.title}</h2>
        <p className="text-muted-foreground leading-relaxed">{scenario.context}</p>
      </motion.div>

      {/* Options */}
      {!result ? (
        <div className="space-y-3">
          <h3 className="font-semibold">O que você faz?</h3>
          {options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
                selectedOption === option.id
                  ? "border-primary bg-primary/10 shadow-[var(--shadow-glow-primary)]"
                  : "border-border hover:border-primary/50 bg-card/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                    selectedOption === option.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <p className="flex-1">{option.option_text}</p>
              </div>
            </motion.button>
          ))}

          <Button
            onClick={handleConfirm}
            disabled={!selectedOption}
            className="w-full mt-4"
            size="lg"
          >
            Confirmar Decisão
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        /* Result */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Decision Quality */}
          <div
            className={cn(
              "p-6 rounded-xl border-2",
              result.isOptimal
                ? "bg-green-500/10 border-green-500/50"
                : result.option.impact_score > 0
                ? "bg-yellow-500/10 border-yellow-500/50"
                : "bg-red-500/10 border-red-500/50"
            )}
          >
            <h3
              className={cn(
                "text-lg font-bold mb-2",
                result.isOptimal
                  ? "text-green-500"
                  : result.option.impact_score > 0
                  ? "text-yellow-500"
                  : "text-red-500"
              )}
            >
              {result.isOptimal
                ? "🎯 Decisão Ótima!"
                : result.option.impact_score > 0
                ? "💡 Decisão Razoável"
                : "⚠️ Decisão Arriscada"}
            </h3>
            <p className="text-muted-foreground">{result.option.feedback}</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">
                {result.option.impact_score > 0 ? "+" : ""}
                {result.option.impact_score}
              </div>
              <div className="text-xs text-muted-foreground">Impacto</div>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold">{result.option.cost_score}</div>
              <div className="text-xs text-muted-foreground">Custo</div>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold">{result.option.risk_score}</div>
              <div className="text-xs text-muted-foreground">Risco</div>
            </div>
          </div>

          {/* XP Earned */}
          <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl text-center">
            <span className="text-2xl font-bold text-primary">+{result.xpEarned} XP</span>
            <p className="text-sm text-muted-foreground mt-1">
              Tempo de decisão: {formatTime(result.timeTaken)}
            </p>
          </div>

          <Button onClick={onNext} className="w-full" size="lg">
            Próximo Cenário
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
