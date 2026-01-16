/**
 * Hub de Testes Cognitivos
 * Lista todos os testes disponíveis com suas informações
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Clock, 
  Zap, 
  ChevronRight,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Calculator,
  Eye,
  RotateCcw,
  MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { CognitiveTestPlayer } from "./CognitiveTestPlayer";
import { MyCognitiveProfile } from "./MyCognitiveProfile";

import { getCognitiveTestColors, getDifficultyColors } from "@/constants/colors";

const TEST_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; gradient: string }> = {
  logic: { icon: Brain, color: getCognitiveTestColors('logic').text, gradient: getCognitiveTestColors('logic').gradient },
  verbal: { icon: MessageSquare, color: getCognitiveTestColors('verbal').text, gradient: getCognitiveTestColors('verbal').gradient },
  spatial: { icon: RotateCcw, color: getCognitiveTestColors('spatial').text, gradient: getCognitiveTestColors('spatial').gradient },
  attention: { icon: Eye, color: getCognitiveTestColors('attention').text, gradient: getCognitiveTestColors('attention').gradient },
  memory: { icon: BookOpen, color: getCognitiveTestColors('memory').text, gradient: getCognitiveTestColors('memory').gradient },
  numerical: { icon: Calculator, color: getCognitiveTestColors('numerical').text, gradient: getCognitiveTestColors('numerical').gradient },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Fácil", color: `${getDifficultyColors('easy').bg} ${getDifficultyColors('easy').text}` },
  medium: { label: "Médio", color: `${getDifficultyColors('medium').bg} ${getDifficultyColors('medium').text}` },
  hard: { label: "Difícil", color: `${getDifficultyColors('hard').bg} ${getDifficultyColors('hard').text}` },
};

interface CognitiveTestsHubProps {
  onBack?: () => void;
}

export function CognitiveTestsHub({ onBack }: CognitiveTestsHubProps) {
  const { tests, myProfile, mySessions, testsLoading } = useCognitiveTests();
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Get completed test IDs
  const completedTestIds = new Set(
    mySessions?.filter(s => s.status === 'completed').map(s => s.test_id)
  );

  const getTestScore = (testId: string) => {
    const session = mySessions?.find(s => s.test_id === testId && s.status === 'completed');
    return session?.score || null;
  };

  if (activeTestId) {
    return (
      <CognitiveTestPlayer 
        testId={activeTestId}
        onComplete={() => setActiveTestId(null)}
        onCancel={() => setActiveTestId(null)}
      />
    );
  }

  if (showProfile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowProfile(false)} className="mb-4">
          ← Voltar aos Testes
        </Button>
        <MyCognitiveProfile />
      </div>
    );
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      setShowProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
              ← Voltar
            </Button>
          )}
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Desafios Mentais
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete testes e evolua suas skills cognitivas
          </p>
        </div>
        
        {myProfile && (
          <Button 
            variant="outline" 
            onClick={() => setShowProfile(true)}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ver Meu Perfil Cognitivo
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {myProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Score Geral</p>
                    <p className="text-3xl font-bold text-foreground">{myProfile.overall_score || 0}%</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xl font-bold text-foreground">{myProfile.assessments_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Testes Realizados</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xl font-bold text-foreground">{completedTestIds.size}</p>
                    <p className="text-xs text-muted-foreground">Tipos Completos</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-xl font-bold text-foreground">{tests?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Disponíveis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tests Grid */}
      {testsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests?.map((test, index) => {
            const config = TEST_TYPE_CONFIG[test.test_type] || TEST_TYPE_CONFIG.logic;
            const difficulty = DIFFICULTY_CONFIG[test.difficulty] || DIFFICULTY_CONFIG.medium;
            const Icon = config.icon;
            const isCompleted = completedTestIds.has(test.id);
            const score = getTestScore(test.id);

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    isCompleted ? 'border-emerald-500/30' : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => setActiveTestId(test.id)}
                >
                  {/* Header with gradient */}
                  <div className={`h-24 bg-gradient-to-br ${config.gradient} p-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 flex items-start justify-between">
                      <Icon className="w-10 h-10 text-white/90" />
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={difficulty.color}>
                          {difficulty.label}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-emerald-500/20 text-emerald-500">
                            ✓ Completo
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-white/10 rounded-full" />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {test.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {test.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{test.time_limit_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        <span>{test.questions_count} questões</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{test.xp_reward} XP</span>
                      </div>
                    </div>

                    {score !== null && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Último Score</span>
                          <span className="font-medium text-foreground">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      {isCompleted ? "Refazer Teste" : "Iniciar Teste"}
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!testsLoading && (!tests || tests.length === 0) && (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum teste disponível</h3>
          <p className="text-muted-foreground mt-2">
            Os testes cognitivos serão disponibilizados pelo administrador da sua organização.
          </p>
        </Card>
      )}
    </div>
  );
}
