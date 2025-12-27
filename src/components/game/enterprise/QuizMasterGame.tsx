/**
 * Quiz Master Game - Jogo focado em quiz de conhecimento
 * Estrutura: Intro → Gameplay → Results
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Play, Trophy, Target, Clock, Coins, Star, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameLayout } from "../common/GameLayout";
import { QuizCategories } from "../quiz/QuizCategories";
import { QuizQuestion } from "../quiz/QuizQuestion";
import { QuizBetModal } from "../quiz/QuizBetModal";
import { GameModeSelector, GameMode, getGameModeConfig } from "./GameModeSelector";
import { useQuizGame, QuizCategory } from "@/hooks/useQuizGame";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type GamePhase = "intro" | "category" | "mode" | "betting" | "playing" | "results";

interface QuizMasterGameProps {
  onBack: () => void;
}

interface GameResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  coinsEarned: number;
  streak: number;
  timeBonus: number;
}

export function QuizMasterGame({ onBack }: QuizMasterGameProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  const [userCoins, setUserCoins] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);

  const {
    categories,
    currentMatch,
    currentQuestion,
    questionIndex,
    totalQuestions,
    score,
    isLoading,
    isAnswering,
    selectedAnswer,
    isCorrect,
    timeLeft,
    streak,
    startGame,
    answerQuestion,
    nextQuestion,
  } = useQuizGame();

  // Fetch user coins
  useEffect(() => {
    if (user) {
      supabase
        .from("user_stats")
        .select("coins")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserCoins(data.coins);
        });
    }
  }, [user]);

  // Check if game ended
  useEffect(() => {
    if (phase === "playing" && currentMatch?.status === "finished") {
      const modeConfig = getGameModeConfig(gameMode);
      const xpEarned = Math.floor(score * modeConfig.multiplier);
      const coinsEarned = Math.floor((score / 10) * modeConfig.multiplier);
      
      setResults({
        score,
        totalQuestions,
        correctAnswers: Math.floor(score / 10), // Assuming 10 points per correct answer
        xpEarned,
        coinsEarned,
        streak,
        timeBonus: 0,
      });
      setPhase("results");
    }
  }, [currentMatch?.status, phase, score, totalQuestions, streak, gameMode]);

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setPhase("mode");
    }
  };

  const handleModeConfirm = () => {
    setPhase("betting");
  };

  const handleStartGame = (bet: number) => {
    if (selectedCategory) {
      startGame(selectedCategory.id, bet);
      setPhase("playing");
    }
  };

  const handlePlayAgain = () => {
    setPhase("category");
    setSelectedCategory(null);
    setResults(null);
  };

  // Intro Phase
  if (phase === "intro") {
    return (
      <GameLayout title="Quiz Master" subtitle="Teste seus conhecimentos" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Quiz Master</h1>
            <p className="text-muted-foreground">
              Desafie seus conhecimentos em diversas categorias empresariais
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-pink-500" />
              <h3 className="font-semibold">Múltiplas Categorias</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Marketing, Projetos, RH e mais
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <h3 className="font-semibold">4 Modos de Jogo</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Normal, Blitz, Estratégia, Hardcore
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <h3 className="font-semibold">Sistema de Apostas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Aposte e multiplique recompensas
              </p>
            </div>
          </div>

          {/* How to Play */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <h2 className="font-bold mb-4">Como Jogar</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">1</span>
                Escolha uma categoria de perguntas
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">2</span>
                Selecione o modo de jogo e faça sua aposta
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">3</span>
                Responda corretamente para ganhar pontos e XP
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">4</span>
                Mantenha um streak para multiplicar recompensas
              </li>
            </ol>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => setPhase("category")}
            className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500"
          >
            <Play className="w-5 h-5 mr-2" />
            Começar Jogo
          </Button>
        </motion.div>
      </GameLayout>
    );
  }

  // Category Selection
  if (phase === "category") {
    return (
      <GameLayout 
        title="Quiz Master" 
        subtitle="Escolha uma categoria" 
        onBack={() => setPhase("intro")}
      >
        <QuizCategories
          categories={categories}
          onSelect={handleCategorySelect}
          isLoading={isLoading}
        />
      </GameLayout>
    );
  }

  // Mode Selection
  if (phase === "mode") {
    return (
      <GameLayout 
        title="Quiz Master" 
        subtitle={`Categoria: ${selectedCategory?.name}`} 
        onBack={() => setPhase("category")}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GameModeSelector
            selectedMode={gameMode}
            onSelectMode={setGameMode}
          />
          <Button
            onClick={handleModeConfirm}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600"
          >
            Continuar
          </Button>
        </motion.div>
      </GameLayout>
    );
  }

  // Betting Modal
  if (phase === "betting") {
    return (
      <GameLayout 
        title="Quiz Master" 
        subtitle={`${selectedCategory?.name} - ${getGameModeConfig(gameMode).name}`} 
        onBack={() => setPhase("mode")}
      >
        <QuizBetModal
          isOpen={true}
          onClose={() => setPhase("mode")}
          category={selectedCategory}
          userCoins={userCoins}
          onStartGame={handleStartGame}
        />
      </GameLayout>
    );
  }

  // Playing Phase
  if (phase === "playing" && currentMatch && currentQuestion) {
    return (
      <GameLayout
        title="Quiz Master"
        subtitle={`Modo ${getGameModeConfig(gameMode).name}`}
        onBack={onBack}
      >
        <QuizQuestion
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          score={score}
          streak={streak}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          isAnswering={isAnswering}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
        />
      </GameLayout>
    );
  }

  // Results Phase
  if (phase === "results" && results) {
    return (
      <GameLayout title="Quiz Master" subtitle="Resultados" onBack={onBack}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto space-y-6"
        >
          {/* Trophy */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Partida Finalizada!</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-primary">{results.score}</div>
              <div className="text-xs text-muted-foreground">Pontuação</div>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-emerald-500">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Acertos</div>
            </div>
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
            {results.streak > 2 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-orange-400">
                  <Zap className="w-5 h-5" />
                  Bônus Streak ({results.streak}x)
                </span>
                <span className="font-bold text-orange-400">🔥</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handlePlayAgain} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
              <Play className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
          </div>
        </motion.div>
      </GameLayout>
    );
  }

  // Fallback
  return (
    <GameLayout title="Quiz Master" subtitle="Carregando..." onBack={onBack}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </GameLayout>
  );
}
