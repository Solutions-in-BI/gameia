/**
 * Componente principal do Quiz Battle
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Trophy, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizGame, QuizCategory } from "@/hooks/useQuizGame";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizCategories } from "./QuizCategories";
import { QuizQuestion } from "./QuizQuestion";
import { QuizBetModal } from "./QuizBetModal";
import { GameLayout } from "../common/GameLayout";

interface QuizGameProps {
  onBack: () => void;
}

export function QuizGame({ onBack }: QuizGameProps) {
  const { user, isAuthenticated } = useAuth();
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

  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  // Busca moedas do usuário
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

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setShowBetModal(true);
    }
  };

  const handleStartGame = (bet: number) => {
    if (selectedCategory) {
      startGame(selectedCategory.id, bet);
    }
  };

  // Tela de seleção de categoria
  if (!currentMatch) {
    return (
      <GameLayout
        title="Quiz Battle"
        subtitle="Teste seus conhecimentos"
        onBack={onBack}
      >
        <div className="space-y-6">
          {/* Header com stats */}
          {isAuthenticated && (
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{userCoins}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-5 h-5" />
                <span className="text-sm">Teste seus conhecimentos!</span>
              </div>
            </div>
          )}

          {/* Instruções */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20"
          >
            <h2 className="text-xl font-bold mb-4">Como Jogar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <strong>10 Perguntas</strong>
                  <p className="text-muted-foreground">
                    Responda perguntas sobre o tema escolhido
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <strong>15 Segundos</strong>
                  <p className="text-muted-foreground">
                    Tempo limitado para cada pergunta
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <strong>Aposte Moedas</strong>
                  <p className="text-muted-foreground">
                    Dobre suas moedas com bom desempenho
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Categorias */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Escolha uma Categoria</h3>
            <QuizCategories
              categories={categories}
              onSelect={handleCategorySelect}
              isLoading={isLoading}
            />
          </div>

          {/* Modal de aposta */}
          <QuizBetModal
            isOpen={showBetModal}
            onClose={() => setShowBetModal(false)}
            category={selectedCategory}
            userCoins={userCoins}
            onStartGame={handleStartGame}
          />
        </div>
      </GameLayout>
    );
  }

  // Tela do jogo
  return (
    <GameLayout
      title="Quiz Battle"
      subtitle="Responda rápido!"
      onBack={onBack}
    >
      {currentQuestion && (
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
      )}
    </GameLayout>
  );
}
