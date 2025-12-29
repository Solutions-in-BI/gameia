import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Award, 
  Coins, 
  Clock, 
  Target, 
  ChevronRight, 
  Home,
  Download,
  Share2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface TrainingCompletionScreenProps {
  trainingName: string;
  trainingIcon?: string;
  trainingColor?: string;
  totalXP: number;
  totalCoins: number;
  totalTimeMinutes: number;
  averageScore?: number;
  modulesCompleted: number;
  certificateEnabled?: boolean;
  insigniaName?: string;
  insigniaIcon?: string;
  onViewCertificate?: () => void;
  nextTrainingId?: string;
  nextTrainingName?: string;
}

export function TrainingCompletionScreen({
  trainingName,
  trainingIcon,
  trainingColor,
  totalXP,
  totalCoins,
  totalTimeMinutes,
  averageScore,
  modulesCompleted,
  certificateEnabled,
  insigniaName,
  insigniaIcon,
  onViewCertificate,
  nextTrainingId,
  nextTrainingName,
}: TrainingCompletionScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3']
      });
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3']
      });
    }, 250);

    // Show content after initial animation
    setTimeout(() => setShowContent(true), 500);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-2xl"
      >
        {/* Trophy Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/30"
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            Parabéns! 🎉
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-muted-foreground"
          >
            Você concluiu o treinamento
          </motion.p>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-xl font-semibold text-primary mt-2"
          >
            {trainingName}
          </motion.h2>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Ganho</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalCoins}</p>
              <p className="text-xs text-muted-foreground">Moedas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatTime(totalTimeMinutes)}</p>
              <p className="text-xs text-muted-foreground">Tempo Total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{modulesCompleted}</p>
              <p className="text-xs text-muted-foreground">Módulos</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Score */}
        {averageScore !== undefined && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Score Médio</p>
                    <p className="text-sm text-muted-foreground">Desempenho geral</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{averageScore}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Insignia Earned */}
        {insigniaName && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                  {insigniaIcon || "🏆"}
                </div>
                <div>
                  <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 mb-1">
                    Nova Insígnia!
                  </Badge>
                  <p className="font-semibold text-lg">{insigniaName}</p>
                  <p className="text-sm text-muted-foreground">Desbloqueada ao concluir</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="space-y-3"
        >
          {certificateEnabled && (
            <Button
              onClick={onViewCertificate}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-5 w-5" />
              Ver Certificado
            </Button>
          )}

          {nextTrainingId && nextTrainingName && (
            <Button
              variant="outline"
              className="w-full gap-2"
              size="lg"
              asChild
            >
              <Link to={`/trainings/${nextTrainingId}`}>
                Próximo: {nextTrainingName}
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 gap-2"
              asChild
            >
              <Link to="/trainings">
                <Home className="h-4 w-4" />
                Voltar aos Treinamentos
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
