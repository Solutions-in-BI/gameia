/**
 * Página principal do Quiz Battle Empresarial
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Award, BarChart3 } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { useQuizGame, QuizCategory } from "@/hooks/useQuizGame";
import { useSkillTree, SkillWithProgress } from "@/hooks/useSkillTree";
import { useDecisionGame } from "@/hooks/useDecisionGame";
import { useAuth } from "@/hooks/useAuth";
import { QuizCategories } from "../quiz/QuizCategories";
import { QuizQuestion } from "../quiz/QuizQuestion";
import { QuizBetModal } from "../quiz/QuizBetModal";
import { SkillTree } from "./SkillTree";
import { DecisionScenarioCard } from "./DecisionScenarioCard";
import { GameModeSelector, GameMode, getGameModeConfig } from "./GameModeSelector";
import { CompetencyDashboard } from "./CompetencyDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface EnterpriseQuizProps {
  onBack: () => void;
}

export function EnterpriseQuiz({ onBack }: EnterpriseQuizProps) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("quiz");
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  const [userCoins, setUserCoins] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Hooks
  const {
    categories,
    currentMatch,
    currentQuestion,
    questionIndex,
    totalQuestions,
    score,
    isLoading: quizLoading,
    isAnswering,
    selectedAnswer,
    isCorrect,
    timeLeft,
    streak,
    startGame,
    answerQuestion,
    nextQuestion,
  } = useQuizGame();

  const { skills, unlockSkill } = useSkillTree();

  const {
    scenarios,
    currentScenario,
    currentOptions,
    result: decisionResult,
    startScenario,
    makeDecision,
    nextScenario,
  } = useDecisionGame();

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

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setShowModeSelector(true);
    }
  };

  const handleModeConfirm = () => {
    setShowModeSelector(false);
    setShowBetModal(true);
  };

  const handleStartGame = (bet: number) => {
    if (selectedCategory) {
      startGame(selectedCategory.id, bet);
    }
  };

  const handleSkillClick = async (skill: SkillWithProgress) => {
    if (!skill.isUnlocked && skill.parent_skill_id) {
      // Try to unlock
      await unlockSkill(skill.id);
    }
  };

  // If quiz is in progress
  if (currentMatch && currentQuestion) {
    return (
      <GameLayout
        title="Quiz Battle"
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

  // If decision scenario is active
  if (currentScenario) {
    return (
      <GameLayout
        title="Simulador de Decisões"
        subtitle="Pense como um gestor"
        onBack={() => {
          nextScenario();
          setActiveTab("decisions");
        }}
      >
        <DecisionScenarioCard
          scenario={currentScenario}
          options={currentOptions}
          result={decisionResult}
          onDecision={makeDecision}
          onNext={nextScenario}
        />
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Centro de Desenvolvimento"
      subtitle="Aprenda, evolua, domine"
      onBack={onBack}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Decisões</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Mode Selector Modal */}
              {showModeSelector && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <GameModeSelector
                    selectedMode={gameMode}
                    onSelectMode={setGameMode}
                  />
                  <button
                    onClick={handleModeConfirm}
                    className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
                  >
                    Continuar
                  </button>
                </motion.div>
              )}

              {!showModeSelector && (
                <>
                  {/* Instructions */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                    <h2 className="text-xl font-bold mb-4">Quiz Battle</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🧠</span>
                        <div>
                          <strong>Teste Conhecimentos</strong>
                          <p className="text-muted-foreground">
                            Perguntas de marketing, projetos e mais
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <strong>4 Modos de Jogo</strong>
                          <p className="text-muted-foreground">
                            Blitz, Estratégia, Hardcore
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <strong>Aposte e Ganhe</strong>
                          <p className="text-muted-foreground">
                            Multiplicadores por modo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <QuizCategories
                    categories={categories}
                    onSelect={handleCategorySelect}
                    isLoading={quizLoading}
                  />
                </>
              )}

              <QuizBetModal
                isOpen={showBetModal}
                onClose={() => setShowBetModal(false)}
                category={selectedCategory}
                userCoins={userCoins}
                onStartGame={handleStartGame}
              />
            </motion.div>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 mb-6">
                <h2 className="text-xl font-bold mb-2">Simulador de Decisões</h2>
                <p className="text-muted-foreground">
                  Enfrente cenários reais de negócios. Não existe certo ou errado, 
                  apenas impacto, custo e risco. Aprenda a pensar como um líder.
                </p>
              </div>

              <div className="grid gap-4">
                {scenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startScenario(scenario.id)}
                    className="p-4 bg-card/50 rounded-xl border border-border text-left hover:border-accent/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{scenario.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scenario.difficulty === "hard" 
                          ? "bg-red-500/20 text-red-500"
                          : scenario.difficulty === "medium"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-green-500/20 text-green-500"
                      }`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {scenario.context}
                    </p>
                    <div className="mt-2 text-xs text-primary">
                      +{scenario.xp_reward} XP
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20 mb-6">
                <h2 className="text-xl font-bold mb-2">Árvore de Habilidades</h2>
                <p className="text-muted-foreground">
                  Desbloqueie e domine competências. Complete quizzes e cenários 
                  para ganhar XP e evoluir suas skills.
                </p>
              </div>

              <SkillTree skills={skills} onSkillClick={handleSkillClick} />
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 mb-6">
                <h2 className="text-xl font-bold mb-2">Perfil de Competências</h2>
                <p className="text-muted-foreground">
                  Seu "gêmeo digital" de competências. Veja como você decide, 
                  seus pontos fortes e áreas de melhoria.
                </p>
              </div>

              <CompetencyDashboard />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </GameLayout>
  );
}
