/**
 * JourneyCompletionScreen - Tela épica de conclusão de jornada
 * Celebração com confetti e exibição de todas as recompensas
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  Star,
  Coins,
  Share2,
  Download,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Route
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Reward {
  type: "xp" | "coins" | "certificate" | "insignia" | "item";
  label: string;
  value?: number;
  icon?: React.ReactNode;
  description?: string;
}

interface JourneyCompletionScreenProps {
  journeyName: string;
  journeyDescription?: string;
  category: string;
  level: string;
  trainingsCompleted: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  rewards: Reward[];
  certificateUrl?: string;
  onViewCertificate?: () => void;
  onShare?: () => void;
  onContinue?: () => void;
  nextJourneyName?: string;
}

export function JourneyCompletionScreen({
  journeyName,
  journeyDescription,
  category,
  level,
  trainingsCompleted,
  totalXpEarned,
  totalCoinsEarned,
  rewards,
  certificateUrl,
  onViewCertificate,
  onShare,
  onContinue,
  nextJourneyName,
}: JourneyCompletionScreenProps) {
  const navigate = useNavigate();
  const [showRewards, setShowRewards] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#8B5CF6", "#10B981", "#F59E0B", "#3B82F6"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Show rewards after initial animation
    setTimeout(() => setShowRewards(true), 800);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto w-32 h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full blur-2xl opacity-50" />
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-emerald-500 shadow-lg"
          >
            <CheckCircle2 className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>

        {/* Congratulations Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Jornada Concluída!</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
            Parabéns! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Você completou a jornada <span className="font-semibold text-foreground">{journeyName}</span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl bg-card border">
            <div className="text-2xl font-bold text-primary">{trainingsCompleted}</div>
            <div className="text-xs text-muted-foreground">Treinamentos</div>
          </div>
          <div className="p-4 rounded-xl bg-card border">
            <div className="text-2xl font-bold text-amber-500">{totalXpEarned}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="p-4 rounded-xl bg-card border">
            <div className="text-2xl font-bold text-yellow-500">{totalCoinsEarned}</div>
            <div className="text-xs text-muted-foreground">Moedas</div>
          </div>
        </motion.div>

        {/* Rewards Section */}
        {showRewards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-muted-foreground">Recompensas Desbloqueadas</h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              {rewards.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border",
                    reward.type === "xp" && "bg-amber-500/10 border-amber-500/30 text-amber-600",
                    reward.type === "coins" && "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
                    reward.type === "certificate" && "bg-blue-500/10 border-blue-500/30 text-blue-600",
                    reward.type === "insignia" && "bg-purple-500/10 border-purple-500/30 text-purple-600",
                    reward.type === "item" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
                  )}
                >
                  {reward.type === "xp" && <Star className="w-4 h-4" />}
                  {reward.type === "coins" && <Coins className="w-4 h-4" />}
                  {reward.type === "certificate" && <Award className="w-4 h-4" />}
                  {reward.type === "insignia" && <Trophy className="w-4 h-4" />}
                  {reward.type === "item" && <Sparkles className="w-4 h-4" />}
                  <span className="font-medium">
                    {reward.value ? `+${reward.value} ${reward.label}` : reward.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          {certificateUrl && (
            <Button variant="outline" onClick={onViewCertificate} className="gap-2">
              <Download className="w-4 h-4" />
              Ver Certificado
            </Button>
          )}
          <Button variant="outline" onClick={onShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
          <Button 
            onClick={onContinue || (() => navigate("/app/arena"))} 
            className="gap-2"
          >
            {nextJourneyName ? (
              <>
                <Route className="w-4 h-4" />
                Próxima Jornada
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Voltar à Arena
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
