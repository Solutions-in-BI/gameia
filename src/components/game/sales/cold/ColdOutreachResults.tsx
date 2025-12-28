import { motion } from "framer-motion";
import { 
  Trophy, Star, Target, Zap, ArrowLeft, RotateCcw, 
  Phone, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle,
  Eye, Anchor, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutreachChannel } from "./ColdOutreachModeSelector";

interface SkillScore {
  skill: string;
  score: number;
  maxScore: number;
}

interface StagePerformance {
  stageKey: string;
  score: number;
  rapportGained: number;
}

interface ColdOutreachResultsProps {
  channel: OutreachChannel;
  score: number;
  rapport: number;
  skills: SkillScore[];
  stagePerformance: StagePerformance[];
  gotCommitment: boolean;
  timeSpent: number;
  onRestart: () => void;
  onBack: () => void;
}

const SKILL_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  first_impression: { label: 'Primeira Impressão', icon: Eye },
  hook_crafting: { label: 'Gancho de Atenção', icon: Anchor },
  elevator_pitch: { label: 'Pitch Relâmpago', icon: Zap },
  brushoff_handling: { label: 'Contorno de Objeção', icon: Shield },
  micro_commitment: { label: 'Micro-Compromisso', icon: Target },
};

const STAGE_LABELS: Record<string, string> = {
  first_impression: 'Primeira Impressão',
  hook: 'Gancho',
  elevator_pitch: 'Pitch',
  brushoff_handling: 'Objeções',
  micro_commitment: 'Fechamento',
};

export function ColdOutreachResults({
  channel,
  score,
  rapport,
  skills,
  stagePerformance,
  gotCommitment,
  timeSpent,
  onRestart,
  onBack,
}: ColdOutreachResultsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceText = () => {
    if (gotCommitment && rapport >= 60) {
      return { title: 'Excelente!', emoji: '🎯', subtitle: 'Você conseguiu o micro-compromisso!' };
    }
    if (gotCommitment) {
      return { title: 'Bom trabalho!', emoji: '✅', subtitle: 'Compromisso conquistado!' };
    }
    if (rapport >= 40) {
      return { title: 'Quase lá!', emoji: '📈', subtitle: 'O prospect ficou interessado.' };
    }
    return { title: 'Continue praticando', emoji: '💪', subtitle: 'Não desanime! Prospecção fria é difícil.' };
  };

  const performance = getPerformanceText();
  
  // Calculate XP and coins
  const xpEarned = Math.round(score * 1.2) + (gotCommitment ? 50 : 0);
  const coinsEarned = Math.round(score * 0.5) + (gotCommitment ? 25 : 0);

  // Get top and bottom skills
  const sortedSkills = [...skills].sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
  const topSkills = sortedSkills.slice(0, 2);
  const bottomSkills = sortedSkills.slice(-2).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto"
    >
      {/* Result Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {performance.emoji}
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{performance.title}</h1>
        <p className="text-muted-foreground">{performance.subtitle}</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
            gotCommitment ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {gotCommitment ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">Compromisso</p>
          <p className={`font-bold ${gotCommitment ? 'text-green-400' : 'text-red-400'}`}>
            {gotCommitment ? 'Sim!' : 'Não'}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 mb-2">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Receptividade</p>
          <p className="font-bold text-foreground">{rapport}%</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Pontuação</p>
          <p className="font-bold text-foreground">{score}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Tempo</p>
          <p className="font-bold text-foreground">{formatTime(timeSpent)}</p>
        </div>
      </div>

      {/* Stage Performance */}
      {stagePerformance.length > 0 && (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Desempenho por Estágio
          </h3>
          <div className="space-y-2">
            {stagePerformance.map((stage, index) => (
              <div key={stage.stageKey} className="flex items-center gap-3">
                <span className="w-4 text-xs text-muted-foreground">{index + 1}</span>
                <span className="flex-1 text-sm text-foreground">
                  {STAGE_LABELS[stage.stageKey] || stage.stageKey}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${stage.rapportGained >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stage.rapportGained >= 0 ? '+' : ''}{stage.rapportGained}
                  </span>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {stage.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Top Skills */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Pontos Fortes
          </h3>
          <div className="space-y-2">
            {topSkills.map((skill) => {
              const config = SKILL_LABELS[skill.skill] || { label: skill.skill, icon: Star };
              const Icon = config.icon;
              const percentage = Math.round((skill.score / skill.maxScore) * 100);
              
              return (
                <div key={skill.skill} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-green-400" />
                  <span className="flex-1 text-sm text-foreground">{config.label}</span>
                  <span className="text-sm font-medium text-green-400">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Areas to Improve */}
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            Áreas para Melhorar
          </h3>
          <div className="space-y-2">
            {bottomSkills.map((skill) => {
              const config = SKILL_LABELS[skill.skill] || { label: skill.skill, icon: Star };
              const Icon = config.icon;
              const percentage = Math.round((skill.score / skill.maxScore) * 100);
              
              return (
                <div key={skill.skill} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="flex-1 text-sm text-foreground">{config.label}</span>
                  <span className="text-sm font-medium text-orange-400">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Recompensas
        </h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">+{xpEarned}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">+{coinsEarned}</div>
            <div className="text-xs text-muted-foreground">Moedas</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button onClick={onRestart} className="gap-2 bg-orange-500 hover:bg-orange-600">
          <RotateCcw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    </motion.div>
  );
}
