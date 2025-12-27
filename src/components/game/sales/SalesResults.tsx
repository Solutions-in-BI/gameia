import { motion } from "framer-motion";
import { Trophy, Target, Star, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalesResultsProps {
  score: number;
  salesClosed: number;
  totalClients: number;
  onRestart: () => void;
  onBack: () => void;
}

export function SalesResults({ score, salesClosed, totalClients, onRestart, onBack }: SalesResultsProps) {
  const percentage = Math.round((salesClosed / totalClients) * 100);
  const xpEarned = score * 2 + salesClosed * 50;
  const coinsEarned = salesClosed * 25;

  const getPerformanceText = () => {
    if (percentage >= 80) return { title: 'Vendedor Nato!', emoji: '🏆' };
    if (percentage >= 60) return { title: 'Bom Desempenho!', emoji: '⭐' };
    if (percentage >= 40) return { title: 'Pode Melhorar', emoji: '💪' };
    return { title: 'Continue Praticando', emoji: '📚' };
  };

  const performance = getPerformanceText();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto pt-8"
    >
      {/* Trophy */}
      <div className="flex justify-center mb-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
        >
          <span className="text-5xl">{performance.emoji}</span>
        </motion.div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">{performance.title}</h1>
      <p className="text-center text-muted-foreground mb-8">
        Você fechou {salesClosed} de {totalClients} vendas
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4 text-center"
        >
          <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{salesClosed}</div>
          <div className="text-xs text-muted-foreground">Vendas</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4 text-center"
        >
          <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs text-muted-foreground">Pontos</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 border border-border/50 rounded-xl p-4 text-center"
        >
          <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{percentage}%</div>
          <div className="text-xs text-muted-foreground">Taxa</div>
        </motion.div>
      </div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 mb-8"
      >
        <h3 className="text-sm font-semibold mb-3 text-center">Recompensas</h3>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-400">+{xpEarned} XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">+{coinsEarned} 🪙</div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={onRestart} 
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Jogar Novamente
        </Button>
      </div>
    </motion.div>
  );
}
