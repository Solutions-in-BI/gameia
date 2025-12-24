/**
 * Componente de pergunta do Quiz
 */

import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion as QuizQuestionType } from "@/hooks/useQuizGame";
import { Check, X, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  streak: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  isAnswering: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

const DIFFICULTY_COLORS = {
  easy: "text-green-500",
  medium: "text-yellow-500",
  hard: "text-red-500",
};

const DIFFICULTY_LABELS = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

export function QuizQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
  score,
  streak,
  selectedAnswer,
  isCorrect,
  isAnswering,
  onAnswer,
  onNext,
}: QuizQuestionProps) {
  const timePercentage = (timeLeft / 15) * 100;
  const isTimeWarning = timeLeft <= 5;

  return (
    <div className="space-y-6">
      {/* Header com progresso e tempo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Pergunta {questionIndex + 1}/{totalQuestions}
          </span>
          <span className={cn("text-sm font-medium", DIFFICULTY_COLORS[question.difficulty])}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-500"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}x</span>
            </motion.div>
          )}
          <span className="text-lg font-bold text-primary">{score} pts</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-colors",
            isTimeWarning ? "bg-red-500" : "bg-primary"
          )}
          initial={{ width: "100%" }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tempo restante */}
      <div className="flex justify-center">
        <motion.div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            isTimeWarning ? "bg-red-500/20 text-red-500" : "bg-muted"
          )}
          animate={isTimeWarning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <Clock className="w-5 h-5" />
          <span className="text-xl font-bold">{timeLeft}s</span>
        </motion.div>
      </div>

      {/* Pergunta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card rounded-xl border border-border"
      >
        <h2 className="text-xl font-bold text-foreground text-center">
          {question.question}
        </h2>
      </motion.div>

      {/* Opções */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = question.correct_answer === index;
          const showResult = isAnswering && (isSelected || isCorrectAnswer);

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isAnswering && onAnswer(index)}
              disabled={isAnswering}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-300",
                "flex items-center justify-between gap-4",
                isAnswering
                  ? showResult
                    ? isCorrectAnswer
                      ? "border-green-500 bg-green-500/20"
                      : isSelected
                        ? "border-red-500 bg-red-500/20"
                        : "border-border/30 bg-muted/30 opacity-50"
                    : "border-border/30 bg-muted/30 opacity-50"
                  : "border-border bg-card hover:border-primary/50 hover:bg-card/80 cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    isAnswering && showResult
                      ? isCorrectAnswer
                        ? "bg-green-500 text-white"
                        : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-foreground font-medium">{option}</span>
              </div>

              <AnimatePresence>
                {isAnswering && showResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    {isCorrectAnswer ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : isSelected ? (
                      <X className="w-6 h-6 text-red-500" />
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Explicação e botão próximo */}
      <AnimatePresence>
        {isAnswering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {question.explanation && (
              <div
                className={cn(
                  "p-4 rounded-xl",
                  isCorrect ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"
                )}
              >
                <p className="text-sm text-foreground">
                  <strong className={isCorrect ? "text-green-500" : "text-red-500"}>
                    {isCorrect ? "✅ Correto!" : "❌ Incorreto!"}
                  </strong>{" "}
                  {question.explanation}
                </p>
              </div>
            )}

            <motion.button
              onClick={onNext}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold
                         hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {questionIndex < totalQuestions - 1 ? "Próxima Pergunta" : "Ver Resultado"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
