/**
 * Componente de resultados do Quiz
 */

import { motion } from "framer-motion";
import { Trophy, Coins, Zap, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
  betAmount: number;
  betWon: boolean | null;
  onPlayAgain: () => void;
  onBack: () => void;
}

export function QuizResults({
  score,
  correctAnswers,
  totalQuestions,
  xpEarned,
  coinsEarned,
  betAmount,
  betWon,
  onPlayAgain,
  onBack,
}: QuizResultsProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excelente!", emoji: "🏆", color: "text-yellow-500" };
    if (percentage >= 70) return { label: "Muito Bom!", emoji: "🌟", color: "text-green-500" };
    if (percentage >= 50) return { label: "Bom!", emoji: "👍", color: "text-blue-500" };
    return { label: "Continue Praticando!", emoji: "📚", color: "text-orange-500" };
  };

  const grade = getGrade();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      {/* Emoji e nota */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="text-8xl"
      >
        {grade.emoji}
      </motion.div>

      <div>
        <h2 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h2>
        <p className="text-muted-foreground mt-2">
          Você acertou {correctAnswers} de {totalQuestions} perguntas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-card rounded-xl border border-border"
        >
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <p className="text-sm text-muted-foreground">Pontos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-card rounded-xl border border-border"
        >
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          <p className="text-sm text-muted-foreground">Acertos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-card rounded-xl border border-border"
        >
          <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <span className="text-2xl font-bold text-foreground">+{xpEarned}</span>
          <p className="text-sm text-muted-foreground">XP Ganho</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-card rounded-xl border border-border"
        >
          <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <span className="text-2xl font-bold text-foreground">+{coinsEarned}</span>
          <p className="text-sm text-muted-foreground">Moedas</p>
        </motion.div>
      </div>

      {/* Resultado da aposta */}
      {betAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-4 rounded-xl ${
            betWon ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"
          }`}
        >
          <p className="font-bold text-lg">
            {betWon ? (
              <>🎉 Você ganhou a aposta! +{betAmount * (percentage >= 70 ? 2 : 1)} moedas</>
            ) : (
              <>😔 Você perdeu a aposta de {betAmount} moedas</>
            )}
          </p>
        </motion.div>
      )}

      {/* Botões */}
      <div className="flex gap-4 justify-center pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button onClick={onPlayAgain} className="gap-2">
          <Trophy className="w-4 h-4" />
          Jogar Novamente
        </Button>
      </div>
    </motion.div>
  );
}
