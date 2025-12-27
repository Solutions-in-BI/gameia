/**
 * AI Scenario Game - Cenários gerados por IA
 * Jogo independente com cenários dinâmicos
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Play, 
  Trophy, 
  ArrowLeft, 
  Star,
  Coins,
  Brain,
  Lightbulb,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameLayout } from "../common/GameLayout";
import { AIScenarioGenerator } from "./AIScenarioGenerator";

type GamePhase = "intro" | "playing" | "results";

interface AIScenarioGameProps {
  onBack: () => void;
}

export function AIScenarioGame({ onBack }: AIScenarioGameProps) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);

  const handleScenarioComplete = (xp: number, coins: number) => {
    setScenariosCompleted((prev) => prev + 1);
    setTotalXP((prev) => prev + xp);
    setTotalCoins((prev) => prev + coins);
  };

  const handleFinishSession = () => {
    setPhase("results");
  };

  const handlePlayAgain = () => {
    setScenariosCompleted(0);
    setTotalXP(0);
    setTotalCoins(0);
    setPhase("playing");
  };

  // Intro Phase
  if (phase === "intro") {
    return (
      <GameLayout title="Game IA" subtitle="Cenários gerados por inteligência artificial" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Game IA</h1>
            <p className="text-muted-foreground">
              Enfrente cenários únicos criados por inteligência artificial
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-violet-500" />
              <h3 className="font-semibold">Cenários Únicos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Cada jogo é uma experiência diferente
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <h3 className="font-semibold">Adaptativo</h3>
              <p className="text-xs text-muted-foreground mt-1">
                A IA se adapta ao seu nível
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Rocket className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <h3 className="font-semibold">Sem Limites</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Infinitas possibilidades de aprendizado
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-xl border border-violet-500/20">
            <h2 className="font-bold mb-4">Como Funciona</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0">1</span>
                A IA gera um cenário empresarial único baseado em seu perfil
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0">2</span>
                Você analisa a situação e escolhe a melhor abordagem
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0">3</span>
                Receba feedback personalizado e aprenda com cada decisão
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0">4</span>
                Acumule XP e moedas baseado na qualidade das suas respostas
              </li>
            </ol>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => setPhase("playing")}
            className="w-full py-6 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Jogo
          </Button>
        </motion.div>
      </GameLayout>
    );
  }

  // Playing Phase
  if (phase === "playing") {
    return (
      <GameLayout 
        title="Game IA" 
        subtitle={`Cenários: ${scenariosCompleted} | XP: ${totalXP}`} 
        onBack={() => {
          if (scenariosCompleted > 0) {
            handleFinishSession();
          } else {
            setPhase("intro");
          }
        }}
      >
        <div className="space-y-4">
          {/* Session Stats */}
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{scenariosCompleted}</div>
                <div className="text-xs text-muted-foreground">Cenários</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-400">{totalXP}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">{totalCoins}</div>
                <div className="text-xs text-muted-foreground">Moedas</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFinishSession}
              disabled={scenariosCompleted === 0}
            >
              Encerrar Sessão
            </Button>
          </div>

          {/* AI Scenario Generator */}
          <AIScenarioGenerator 
            onScenarioGenerated={() => {
              // Simulate completion with XP and coins
              handleScenarioComplete(75, 25);
            }}
          />
        </div>
      </GameLayout>
    );
  }

  // Results Phase
  if (phase === "results") {
    return (
      <GameLayout title="Game IA" subtitle="Sessão Encerrada" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto space-y-6"
        >
          {/* Trophy */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Sessão Finalizada!</h2>
            <p className="text-muted-foreground mt-2">
              Você completou {scenariosCompleted} cenário{scenariosCompleted !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-primary">{scenariosCompleted}</div>
              <div className="text-xs text-muted-foreground">Cenários Completados</div>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-emerald-500">
                {scenariosCompleted > 0 ? Math.round((totalXP / scenariosCompleted)) : 0}
              </div>
              <div className="text-xs text-muted-foreground">XP Médio/Cenário</div>
            </div>
          </div>

          {/* Rewards */}
          <div className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-xl border border-violet-500/20 space-y-3">
            <h3 className="font-semibold">Recompensas Totais</h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-400">
                <Star className="w-5 h-5" />
                XP Total
              </span>
              <span className="font-bold">+{totalXP} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-400">
                <Coins className="w-5 h-5" />
                Moedas Total
              </span>
              <span className="font-bold">+{totalCoins}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handlePlayAgain} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600">
              <Play className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </div>
        </motion.div>
      </GameLayout>
    );
  }

  return null;
}
