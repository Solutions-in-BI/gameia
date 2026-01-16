import { motion } from "framer-motion";
import { Trophy, Target, Star, RotateCcw, ArrowLeft, TrendingUp, TrendingDown, CheckCircle, XCircle, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SkillScore, SalesStage, SalesTrack } from "@/hooks/useSalesGame";
import { useNavigate } from "react-router-dom";

interface SkillImpact {
  id: string;
  name: string;
  impact: number;
}

interface SalesResultsProps {
  score: number;
  rapport: number;
  skills: SkillScore;
  stagePerformance: Record<string, { score: number; time: number }>;
  stages: SalesStage[];
  saleClosed: boolean;
  onRestart: () => void;
  onBack: () => void;
  track?: SalesTrack | null;
  personaMultiplier?: number;
  skillImpacts?: SkillImpact[];
}

const SKILL_LABELS: Record<keyof SkillScore, string> = {
  rapport: 'Construção de Rapport',
  discovery: 'Descoberta de Necessidades',
  presentation: 'Apresentação de Valor',
  objection: 'Tratamento de Objeções',
  closing: 'Técnica de Fechamento',
};

export function SalesResults({ 
  score, 
  rapport, 
  skills, 
  stagePerformance, 
  stages,
  saleClosed, 
  onRestart, 
  onBack,
  track,
  personaMultiplier = 1.0,
  skillImpacts = []
}: SalesResultsProps) {
  const navigate = useNavigate();
  
  // Calculate rewards with multipliers (matching useSalesGame logic)
  const trackXpReward = track?.xp_reward || 100;
  const trackCoinsReward = track?.coins_reward || 50;
  const baseXp = Math.round(score * 0.5);
  const xpEarned = Math.round((baseXp + trackXpReward) * personaMultiplier * (saleClosed ? 1.5 : 0.8));
  const coinsEarned = Math.round((score * 0.2 + trackCoinsReward) * (saleClosed ? 1.3 : 0.7));

  const getPerformanceText = () => {
    if (saleClosed && rapport >= 80) return { title: 'Vendedor Nato!', emoji: '🏆', subtitle: 'Você fechou a venda com maestria!' };
    if (saleClosed) return { title: 'Venda Fechada!', emoji: '🎉', subtitle: 'Parabéns, você conseguiu!' };
    if (rapport >= 40) return { title: 'Quase lá!', emoji: '💪', subtitle: 'Continue praticando para fechar mais vendas.' };
    return { title: 'Não foi dessa vez', emoji: '📚', subtitle: 'Revise as dicas e tente novamente.' };
  };

  const performance = getPerformanceText();

  // Get top 3 skills and bottom 2 skills
  const sortedSkills = Object.entries(skills).sort((a, b) => b[1] - a[1]);
  const topSkills = sortedSkills.slice(0, 3);
  const weakSkills = sortedSkills.slice(-2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-lg mx-auto pt-4"
    >
      {/* Result Header */}
      <div className="text-center mb-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            saleClosed 
              ? 'bg-gradient-to-br from-gameia-success to-gameia-success/80' 
              : 'bg-gradient-to-br from-gameia-warning to-primary'
          }`}
        >
          <span className="text-4xl">{performance.emoji}</span>
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-1">{performance.title}</h1>
        <p className="text-muted-foreground text-sm">{performance.subtitle}</p>
        
        {personaMultiplier > 1 && (
          <Badge variant="secondary" className="mt-2">
            <Zap className="w-3 h-3 mr-1" />
            Multiplicador {personaMultiplier}x
          </Badge>
        )}
      </div>

      {/* Sale Status */}
      <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-full mx-auto w-fit ${
        saleClosed ? 'bg-gameia-success/20 text-gameia-success' : 'bg-gameia-warning/20 text-gameia-warning'
      }`}>
        {saleClosed ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Venda Concluída</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Venda Não Concluída</span>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 border border-border/50 rounded-xl p-3 text-center"
        >
          <Target className="w-5 h-5 text-gameia-info mx-auto mb-1" />
          <div className="text-xl font-bold">{rapport}%</div>
          <div className="text-xs text-muted-foreground">Rapport Final</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 border border-border/50 rounded-xl p-3 text-center"
        >
          <Star className="w-5 h-5 text-reward-xp mx-auto mb-1" />
          <div className="text-xl font-bold">{score}</div>
          <div className="text-xs text-muted-foreground">Pontuação</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 border border-border/50 rounded-xl p-3 text-center"
        >
          <Trophy className="w-5 h-5 text-secondary mx-auto mb-1" />
          <div className="text-xl font-bold">{Object.keys(stagePerformance).length}</div>
          <div className="text-xs text-muted-foreground">Etapas</div>
        </motion.div>
      </div>

      {/* Skill Impacts (from track configuration) */}
      {skillImpacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4 mb-6"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Impacto nas suas Skills
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {skillImpacts.map((skill) => (
              <div 
                key={skill.id}
                className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-muted-foreground truncate">{skill.name}</span>
                <span className="text-sm font-bold text-gameia-success">+{skill.impact}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card/50 border border-border/50 rounded-xl p-4 mb-6"
      >
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gameia-success" />
          Suas Competências
        </h3>
        
        <div className="space-y-3">
          {topSkills.map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {SKILL_LABELS[key as keyof SkillScore]}
                </span>
                <span className={`font-medium ${value >= 60 ? 'text-gameia-success' : value >= 40 ? 'text-gameia-warning' : 'text-destructive'}`}>
                  {value}%
                </span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>

        {weakSkills.some(([_, value]) => value < 50) && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Áreas para Melhorar
            </h4>
            <div className="flex flex-wrap gap-2">
              {weakSkills
                .filter(([_, value]) => value < 50)
                .map(([key]) => (
                  <span key={key} className="text-xs bg-gameia-warning/10 text-gameia-warning px-2 py-1 rounded">
                    {SKILL_LABELS[key as keyof SkillScore]}
                  </span>
                ))
              }
            </div>
          </div>
        )}
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-gameia-info/10 to-gameia-success/10 border border-gameia-info/30 rounded-xl p-4 mb-6"
      >
        <h3 className="text-sm font-semibold mb-3 text-center">Recompensas</h3>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-xl font-bold text-reward-xp">+{xpEarned} XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-reward-coins">+{coinsEarned} 🪙</div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={onRestart} 
          className="flex-1 bg-gradient-to-r from-gameia-success to-gameia-success/80 hover:from-gameia-success/90 hover:to-gameia-success/70 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Jogar Novamente
        </Button>
      </div>

      {/* View Evolution Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-4 text-center"
      >
        <Button 
          variant="link" 
          onClick={() => navigate('/app/evolution')}
          className="text-muted-foreground hover:text-primary"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver minha evolução completa
        </Button>
      </motion.div>
    </motion.div>
  );
}
