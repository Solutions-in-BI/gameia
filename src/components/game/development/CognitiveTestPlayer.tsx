/**
 * Player de Teste Cognitivo
 * Interface gamificada com recompensas condicionais
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  X,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  Brain,
  AlertTriangle,
  Target,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCognitiveTests, CognitiveTestQuestion } from "@/hooks/useCognitiveTests";
import { useRewardEngine, RewardConfig } from "@/hooks/useRewardEngine";
import { RewardResultCard } from "@/components/rewards/RewardBadge";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface CognitiveTestPlayerProps {
  testId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface Answer {
  question_id: string;
  answer: string;
  time_seconds: number;
  is_correct?: boolean;
}

export function CognitiveTestPlayer({ testId, onComplete, onCancel }: CognitiveTestPlayerProps) {
  const { tests, getQuestionsForTest, startSession, completeSession } = useCognitiveTests();
  const { processReward } = useRewardEngine();
  
  const [questions, setQuestions] = useState<CognitiveTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const test = tests?.find(t => t.id === testId);
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Load questions and start session
  useEffect(() => {
    async function init() {
      try {
        const loadedQuestions = await getQuestionsForTest(testId);
        setQuestions(loadedQuestions);
        
        if (test?.time_limit_minutes) {
          setTimeRemaining(test.time_limit_minutes * 60);
        }
        
        const session = await startSession.mutateAsync(testId);
        setSessionId(session.id);
        setQuestionStartTime(Date.now());
      } catch (error) {
        console.error("Error loading test:", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback || showResults) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        const content = currentQuestion?.content as { options: string[] };
        if (content?.options?.[index]) {
          setSelectedAnswer(content.options[index]);
        }
      } else if (key === 'Enter' && selectedAnswer) {
        handleConfirmAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, selectedAnswer, showFeedback]);

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const newAnswer: Answer = {
      question_id: currentQuestion.id,
      answer: selectedAnswer,
      time_seconds: timeSpent,
      is_correct: isCorrect,
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        handleFinishTest();
      }
    }, 1500);
  };

  const handleFinishTest = useCallback(async () => {
    if (!sessionId) return;

    const correctCount = answers.filter(a => a.is_correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    setFinalScore(score);

    // Target score from test config (default 70%)
    const targetScore = 70;
    const targetMet = score >= targetScore;

    try {
      await completeSession.mutateAsync({
        sessionId,
        answers: answers.map(({ is_correct, ...rest }) => rest),
        score,
      });

      // Apply rewards using reward engine
      const rewardConfig: RewardConfig = {
        sourceType: 'cognitive_test',
        sourceId: testId,
        title: test?.name,
        rules: [{
          type: 'conditional',
          metric: 'accuracy',
          target: targetScore / 100,
          baseReward: { xp: 0, coins: 0 },
          bonusReward: { xp: test?.xp_reward || 100, coins: 0 },
          failReward: { xp: 0, coins: 0 }
        }]
      };

      const rewardResult = await processReward(rewardConfig, {
        accuracy: score / 100,
        score
      }, false); // Don't show toast, we have custom UI

      if (targetMet) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error("Error completing session:", error);
    }

    setShowResults(true);
  }, [sessionId, answers, questions.length, completeSession, testId, test, processReward]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Preparando seu teste...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = answers.filter(a => a.is_correct).length;
    const totalTime = answers.reduce((acc, a) => acc + a.time_seconds, 0);
    const avgTime = Math.round(totalTime / answers.length);
    const targetScore = 70;
    const targetMet = finalScore >= targetScore;
    const xpEarned = targetMet ? (test?.xp_reward || 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg space-y-6">
          {/* Resultado com Recompensa */}
          <RewardResultCard
            xpEarned={xpEarned}
            coinsEarned={0}
            targetMet={targetMet}
            performanceScore={finalScore}
            targetScore={targetScore}
            bonusApplied={targetMet}
          />

          {/* Stats detalhados */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">{test?.name}</h3>
              
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{correctCount}</p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{questions.length - correctCount}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{avgTime}s</p>
                  <p className="text-xs text-muted-foreground">Média/Questão</p>
                </div>
              </div>

              {/* CTA baseado no resultado */}
              <div className="flex gap-3 mt-6">
                {!targetMet && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()} 
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </Button>
                )}
                <Button onClick={onComplete} className="flex-1" size="lg">
                  {targetMet ? "Continuar" : "Voltar"}
                </Button>
              </div>

              {/* Info sobre reaplicabilidade */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                💡 Você pode refazer este teste a qualquer momento para melhorar seu score
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  const content = currentQuestion?.content as { question: string; options: string[]; explanation?: string };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-foreground">{test?.name}</h2>
            <p className="text-sm text-muted-foreground">
              Questão {currentIndex + 1} de {questions.length}
            </p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-mono",
          timeRemaining < 60 ? "bg-red-500/20 text-red-500" : "bg-muted"
        )}>
          <Clock className="w-4 h-4" />
          <span className="font-medium">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-xl font-medium text-foreground">
                  {content?.question}
                </h3>
                <Badge variant="outline" className="shrink-0">
                  {currentQuestion?.question_type}
                </Badge>
              </div>

              <div className="grid gap-3">
                {content?.options?.map((option, index) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => !showFeedback && setSelectedAnswer(option)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                      "flex items-center gap-4",
                      showFeedback && option === currentQuestion.correct_answer
                        ? "border-emerald-500 bg-emerald-500/10"
                        : showFeedback && option === selectedAnswer && option !== currentQuestion.correct_answer
                        ? "border-red-500 bg-red-500/10"
                        : selectedAnswer === option
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      showFeedback && option === currentQuestion.correct_answer
                        ? "bg-emerald-500 text-white"
                        : showFeedback && option === selectedAnswer && option !== currentQuestion.correct_answer
                        ? "bg-red-500 text-white"
                        : selectedAnswer === option
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {showFeedback && option === currentQuestion.correct_answer ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : showFeedback && option === selectedAnswer ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && content?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Explicação: </span>
                      {content.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keyboard hints */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <kbd className="px-2 py-1 bg-muted rounded">1-4</kbd>
                  <span>para selecionar</span>
                  <kbd className="px-2 py-1 bg-muted rounded ml-2">Enter</kbd>
                  <span>para confirmar</span>
                </div>

                <Button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedAnswer || showFeedback}
                  className="gap-2"
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Sair do Teste?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se você sair agora, seu progresso será perdido e o teste não será concluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Teste</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
