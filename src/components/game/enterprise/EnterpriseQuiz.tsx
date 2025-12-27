/**
 * Página principal do Quiz Battle Empresarial
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Award, BarChart3, Lock, Sparkles } from "lucide-react";
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
import { AIScenarioGenerator } from "./AIScenarioGenerator";
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
    scenariosWithProgress,
    progressionStats,
    currentScenario,
    currentOptions,
    result: decisionResult,
    startScenario,
    makeDecision,
    nextScenario,
    canAccessDifficulty,
    fetchScenarios,
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
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Decisões</span>
          </TabsTrigger>
          <TabsTrigger value="game-ia" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Game IA</span>
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
              {/* Header com progresso */}
              <div className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Simulador de Decisões</h2>
                    <p className="text-sm text-muted-foreground">
                      Complete cenários para desbloquear níveis mais difíceis
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {progressionStats.totalCompleted}/{progressionStats.totalScenarios}
                    </div>
                    <div className="text-xs text-muted-foreground">Completados</div>
                  </div>
                </div>

                {/* Barra de progresso por dificuldade */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-green-500">Fácil</span>
                      <span className="text-xs text-muted-foreground">
                        {progressionStats.easyCompleted}/{progressionStats.easyTotal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-green-500/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progressionStats.easyTotal > 0 ? (progressionStats.easyCompleted / progressionStats.easyTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${canAccessDifficulty("medium") ? "bg-yellow-500/10 border-yellow-500/20" : "bg-muted/50 border-border opacity-60"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${canAccessDifficulty("medium") ? "text-yellow-500" : "text-muted-foreground"}`}>
                        {canAccessDifficulty("medium") ? "Médio" : "🔒 Médio"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {progressionStats.mediumCompleted}/{progressionStats.mediumTotal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${progressionStats.mediumTotal > 0 ? (progressionStats.mediumCompleted / progressionStats.mediumTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${canAccessDifficulty("hard") ? "bg-red-500/10 border-red-500/20" : "bg-muted/50 border-border opacity-60"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${canAccessDifficulty("hard") ? "text-red-500" : "text-muted-foreground"}`}>
                        {canAccessDifficulty("hard") ? "Difícil" : "🔒 Difícil"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {progressionStats.hardCompleted}/{progressionStats.hardTotal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${progressionStats.hardTotal > 0 ? (progressionStats.hardCompleted / progressionStats.hardTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de cenários por dificuldade */}
              {["easy", "medium", "hard"].map((difficulty) => {
                const diffScenarios = scenariosWithProgress.filter((s) => s.difficulty === difficulty);
                if (diffScenarios.length === 0) return null;

                const isLocked = !canAccessDifficulty(difficulty);
                const diffLabel = difficulty === "easy" ? "Fácil" : difficulty === "medium" ? "Médio" : "Difícil";
                const diffColor = difficulty === "easy" ? "green" : difficulty === "medium" ? "yellow" : "red";

                return (
                  <div key={difficulty} className="mb-6">
                    <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isLocked ? "text-muted-foreground" : `text-${diffColor}-500`}`}>
                      {isLocked && <Lock className="w-4 h-4" />}
                      Nível {diffLabel}
                      {isLocked && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                          {difficulty === "medium" 
                            ? `(Complete 1 cenário fácil)` 
                            : `(Complete 2 cenários médios)`}
                        </span>
                      )}
                    </h3>
                    <div className="grid gap-3">
                      {diffScenarios.map((scenario) => (
                        <motion.button
                          key={scenario.id}
                          whileHover={scenario.isUnlocked ? { scale: 1.01 } : {}}
                          whileTap={scenario.isUnlocked ? { scale: 0.99 } : {}}
                          onClick={() => scenario.isUnlocked && startScenario(scenario.id)}
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
                                <span className={scenario.isOptimalDecision ? "text-green-500" : "text-yellow-500"}>
                                  {scenario.isOptimalDecision ? "🎯" : "✓"}
                                </span>
                              )}
                              <h4 className="font-semibold">{scenario.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {!scenario.isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                              <span className={`text-xs px-2 py-1 rounded-full bg-${diffColor}-500/20 text-${diffColor}-500`}>
                                {diffLabel}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {scenario.context}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-primary">+{scenario.xp_reward} XP</span>
                            {scenario.isCompleted && (
                              <span className="text-xs text-muted-foreground">
                                {scenario.isOptimalDecision ? "Decisão ótima" : "Pode melhorar"}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
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

          {/* Game IA Tab */}
          <TabsContent value="game-ia" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AIScenarioGenerator 
                onScenarioGenerated={() => {
                  // Refresh scenarios list
                  fetchScenarios();
                }} 
              />
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
