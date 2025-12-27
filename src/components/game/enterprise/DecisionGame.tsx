/**
 * Decision Game - Simulador de Decisões Estratégicas
 * Jogo focado em cenários de tomada de decisão empresarial
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Play, 
  Trophy, 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  Star,
  Coins,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameLayout } from "../common/GameLayout";
import { DecisionScenarioCard } from "./DecisionScenarioCard";
import { useDecisionGame } from "@/hooks/useDecisionGame";

type GamePhase = "intro" | "selection" | "playing" | "results";

interface DecisionGameProps {
  onBack: () => void;
}

interface GameResults {
  scenario: string;
  wasOptimal: boolean;
  xpEarned: number;
  coinsEarned: number;
  feedback: string;
}

export function DecisionGame({ onBack }: DecisionGameProps) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [results, setResults] = useState<GameResults | null>(null);

  const {
    scenariosWithProgress,
    progressionStats,
    currentScenario,
    currentOptions,
    result: decisionResult,
    startScenario,
    makeDecision,
    nextScenario,
    canAccessDifficulty,
  } = useDecisionGame();

  // When decision result comes, show it then transition to results
  useEffect(() => {
    if (decisionResult && phase === "playing") {
      // After showing feedback, go to results
      const timer = setTimeout(() => {
        const coinsEarned = decisionResult.isOptimal ? 50 : decisionResult.option.impact_score > 0 ? 25 : 10;
        setResults({
          scenario: currentScenario?.title || "",
          wasOptimal: decisionResult.isOptimal,
          xpEarned: decisionResult.xpEarned,
          coinsEarned: coinsEarned,
          feedback: decisionResult.option.feedback,
        });
        setPhase("results");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [decisionResult, phase, currentScenario]);

  const handleStartScenario = (scenarioId: string) => {
    startScenario(scenarioId);
    setPhase("playing");
  };

  const handlePlayAgain = () => {
    nextScenario();
    setResults(null);
    setPhase("selection");
  };

  // Intro Phase
  if (phase === "intro") {
    return (
      <GameLayout title="Decisões Estratégicas" subtitle="Pense como um líder" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Simulador de Decisões</h1>
            <p className="text-muted-foreground">
              Enfrente cenários empresariais reais e tome decisões estratégicas
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
              <h3 className="font-semibold">Cenários Reais</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Baseados em situações empresariais reais
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <h3 className="font-semibold">Progressão</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Desbloqueie níveis mais difíceis
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <h3 className="font-semibold">Feedback Detalhado</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Aprenda com cada decisão tomada
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Seu Progresso</h2>
              <span className="text-2xl font-bold text-primary">
                {progressionStats.totalCompleted}/{progressionStats.totalScenarios}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">{progressionStats.easyCompleted}</div>
                <div className="text-xs text-muted-foreground">Fácil</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-500">{progressionStats.mediumCompleted}</div>
                <div className="text-xs text-muted-foreground">Médio</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-500">{progressionStats.hardCompleted}</div>
                <div className="text-xs text-muted-foreground">Difícil</div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => setPhase("selection")}
            className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
          >
            <Play className="w-5 h-5 mr-2" />
            Escolher Cenário
          </Button>
        </motion.div>
      </GameLayout>
    );
  }

  // Scenario Selection
  if (phase === "selection") {
    return (
      <GameLayout 
        title="Decisões Estratégicas" 
        subtitle="Escolha um cenário" 
        onBack={() => setPhase("intro")}
      >
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="p-4 bg-card/50 rounded-xl border border-border">
            <div className="grid grid-cols-3 gap-3">
              <DifficultyProgress
                label="Fácil"
                completed={progressionStats.easyCompleted}
                total={progressionStats.easyTotal}
                color="green"
                unlocked={true}
              />
              <DifficultyProgress
                label="Médio"
                completed={progressionStats.mediumCompleted}
                total={progressionStats.mediumTotal}
                color="yellow"
                unlocked={canAccessDifficulty("medium")}
                unlockHint="Complete 1 cenário fácil"
              />
              <DifficultyProgress
                label="Difícil"
                completed={progressionStats.hardCompleted}
                total={progressionStats.hardTotal}
                color="red"
                unlocked={canAccessDifficulty("hard")}
                unlockHint="Complete 2 cenários médios"
              />
            </div>
          </div>

          {/* Scenarios by Difficulty */}
          {["easy", "medium", "hard"].map((difficulty) => {
            const diffScenarios = scenariosWithProgress.filter((s) => s.difficulty === difficulty);
            if (diffScenarios.length === 0) return null;

            const isLocked = !canAccessDifficulty(difficulty);
            const diffLabel = difficulty === "easy" ? "Fácil" : difficulty === "medium" ? "Médio" : "Difícil";
            const diffColor = difficulty === "easy" ? "green" : difficulty === "medium" ? "yellow" : "red";

            return (
              <div key={difficulty} className="space-y-3">
                <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                  isLocked ? "text-muted-foreground" : `text-${diffColor}-500`
                }`}>
                  {isLocked && <Lock className="w-4 h-4" />}
                  Nível {diffLabel}
                </h3>
                <div className="grid gap-3">
                  {diffScenarios.map((scenario) => (
                    <motion.button
                      key={scenario.id}
                      whileHover={scenario.isUnlocked ? { scale: 1.01 } : {}}
                      whileTap={scenario.isUnlocked ? { scale: 0.99 } : {}}
                      onClick={() => scenario.isUnlocked && handleStartScenario(scenario.id)}
                      disabled={!scenario.isUnlocked}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        !scenario.isUnlocked 
                          ? "bg-muted/30 border-border opacity-50 cursor-not-allowed"
                          : scenario.isCompleted
                          ? "bg-card/50 border-primary/30 hover:border-primary/50"
                          : "bg-card/50 border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {scenario.isCompleted && (
                            <CheckCircle className={`w-4 h-4 ${
                              scenario.isOptimalDecision ? "text-green-500" : "text-yellow-500"
                            }`} />
                          )}
                          <h4 className="font-semibold">{scenario.title}</h4>
                        </div>
                        {!scenario.isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scenario.context}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-primary">+{scenario.xp_reward} XP</span>
                        {scenario.isCompleted && (
                          <span className="text-xs text-muted-foreground">
                            {scenario.isOptimalDecision ? "✅ Decisão ótima" : "Pode melhorar"}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GameLayout>
    );
  }

  // Playing Phase
  if (phase === "playing" && currentScenario) {
    return (
      <GameLayout
        title="Decisões Estratégicas"
        subtitle={currentScenario.title}
        onBack={() => {
          nextScenario();
          setPhase("selection");
        }}
      >
        <DecisionScenarioCard
          scenario={currentScenario}
          options={currentOptions}
          result={decisionResult}
          onDecision={makeDecision}
          onNext={() => {
            nextScenario();
            setPhase("selection");
          }}
        />
      </GameLayout>
    );
  }

  // Results Phase
  if (phase === "results" && results) {
    return (
      <GameLayout title="Decisões Estratégicas" subtitle="Resultado" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto space-y-6"
        >
          {/* Result Icon */}
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              results.wasOptimal 
                ? "bg-gradient-to-br from-green-400 to-emerald-500" 
                : "bg-gradient-to-br from-yellow-400 to-orange-500"
            }`}>
              {results.wasOptimal ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <Target className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold">
              {results.wasOptimal ? "Decisão Ótima!" : "Bom Raciocínio!"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {results.scenario}
            </p>
          </div>

          {/* Feedback */}
          <div className="p-4 bg-card/50 rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Feedback</h3>
            <p className="text-sm text-muted-foreground">{results.feedback}</p>
          </div>

          {/* Rewards */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 space-y-3">
            <h3 className="font-semibold">Recompensas</h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-400">
                <Star className="w-5 h-5" />
                XP Ganho
              </span>
              <span className="font-bold">+{results.xpEarned} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-400">
                <Coins className="w-5 h-5" />
                Moedas
              </span>
              <span className="font-bold">+{results.coinsEarned}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handlePlayAgain} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600">
              <Play className="w-4 h-4 mr-2" />
              Próximo Cenário
            </Button>
          </div>
        </motion.div>
      </GameLayout>
    );
  }

  // Fallback
  return (
    <GameLayout title="Decisões Estratégicas" subtitle="Carregando..." onBack={onBack}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </GameLayout>
  );
}

// Helper Component
function DifficultyProgress({ 
  label, 
  completed, 
  total, 
  color, 
  unlocked,
  unlockHint 
}: { 
  label: string;
  completed: number;
  total: number;
  color: "green" | "yellow" | "red";
  unlocked: boolean;
  unlockHint?: string;
}) {
  const colorClasses = {
    green: "bg-green-500 text-green-500",
    yellow: "bg-yellow-500 text-yellow-500",
    red: "bg-red-500 text-red-500",
  };

  return (
    <div className={`p-3 rounded-lg border ${
      unlocked 
        ? `bg-${color}-500/10 border-${color}-500/20` 
        : "bg-muted/50 border-border opacity-60"
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${unlocked ? colorClasses[color].split(' ')[1] : "text-muted-foreground"}`}>
          {!unlocked && "🔒 "}{label}
        </span>
        <span className="text-xs text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
      <div className={`h-1.5 ${unlocked ? `bg-${color}-500/20` : "bg-muted"} rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorClasses[color].split(' ')[0]} rounded-full transition-all`}
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>
      {!unlocked && unlockHint && (
        <p className="text-[10px] text-muted-foreground mt-1">{unlockHint}</p>
      )}
    </div>
  );
}
