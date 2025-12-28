import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Clock, Phone, Handshake, Calendar, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface SDRSkillScore {
  cold_calling: number;
  qualification: number;
  rapport_building: number;
  meeting_setting: number;
}

export interface CloserSkillScore {
  discovery: number;
  presentation: number;
  objection_handling: number;
  closing: number;
}

type SkillScore = SDRSkillScore | CloserSkillScore;

interface SalesMetricsPanelProps {
  trackKey: 'sdr' | 'closer';
  skills: SkillScore;
  rapport: number;
  score: number;
  timeLeft: string;
  stagesCompleted: number;
  totalStages: number;
}

const SDR_SKILL_LABELS: Record<keyof SDRSkillScore, { label: string; icon: React.ReactNode }> = {
  cold_calling: { label: 'Cold Calling', icon: <Phone className="w-3 h-3" /> },
  qualification: { label: 'Qualificação', icon: <Target className="w-3 h-3" /> },
  rapport_building: { label: 'Rapport', icon: <TrendingUp className="w-3 h-3" /> },
  meeting_setting: { label: 'Agendamento', icon: <Calendar className="w-3 h-3" /> },
};

const CLOSER_SKILL_LABELS: Record<keyof CloserSkillScore, { label: string; icon: React.ReactNode }> = {
  discovery: { label: 'Discovery', icon: <Target className="w-3 h-3" /> },
  presentation: { label: 'Apresentação', icon: <TrendingUp className="w-3 h-3" /> },
  objection_handling: { label: 'Objeções', icon: <TrendingDown className="w-3 h-3" /> },
  closing: { label: 'Fechamento', icon: <CheckCircle className="w-3 h-3" /> },
};

export function SalesMetricsPanel({
  trackKey,
  skills,
  rapport,
  score,
  timeLeft,
  stagesCompleted,
  totalStages,
}: SalesMetricsPanelProps) {
  const skillLabels = trackKey === 'sdr' ? SDR_SKILL_LABELS : CLOSER_SKILL_LABELS;
  const TrackIcon = trackKey === 'sdr' ? Phone : Handshake;
  const trackColor = trackKey === 'sdr' ? 'text-cyan-400' : 'text-green-400';
  const trackBg = trackKey === 'sdr' ? 'from-blue-500/20 to-cyan-500/20' : 'from-green-500/20 to-emerald-500/20';

  const getRapportColor = () => {
    if (rapport >= 70) return 'text-green-400';
    if (rapport >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-4"
    >
      {/* Track Badge */}
      <div className={`flex items-center gap-2 pb-3 border-b border-border/50`}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${trackBg} flex items-center justify-center`}>
          <TrackIcon className={`w-4 h-4 ${trackColor}`} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Trilha</div>
          <div className="font-semibold text-sm">{trackKey === 'sdr' ? 'SDR' : 'Closer'}</div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rapport */}
        <div className="bg-background/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Rapport</span>
            <span className={`text-sm font-bold ${getRapportColor()}`}>{rapport}%</span>
          </div>
          <Progress 
            value={rapport} 
            className="h-2"
          />
        </div>

        {/* Score */}
        <div className="bg-background/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Pontos</span>
            <span className="text-sm font-bold text-amber-400">{score}</span>
          </div>
          <Progress 
            value={Math.min(100, score / 5)} 
            className="h-2"
          />
        </div>
      </div>

      {/* Time & Progress */}
      <div className="flex items-center justify-between bg-background/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold">{timeLeft}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Etapa {stagesCompleted + 1}/{totalStages}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          {trackKey === 'sdr' ? 'Skills de Prospecção' : 'Skills de Negociação'}
        </h4>
        <div className="space-y-2">
          {Object.entries(skills).map(([key, value]) => {
            const typedKey = key as keyof SDRSkillScore | keyof CloserSkillScore;
            const sdrConfig = SDR_SKILL_LABELS[typedKey as keyof SDRSkillScore];
            const closerConfig = CLOSER_SKILL_LABELS[typedKey as keyof CloserSkillScore];
            const config = trackKey === 'sdr' ? sdrConfig : closerConfig;
            if (!config) return null;
            
            const skillValue = value as number;
            const getSkillColor = () => {
              if (skillValue >= 70) return 'text-green-400';
              if (skillValue >= 40) return 'text-amber-400';
              return 'text-red-400';
            };

            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center text-muted-foreground">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-muted-foreground">{config.label}</span>
                    <span className={`font-medium ${getSkillColor()}`}>{skillValue}%</span>
                  </div>
                  <Progress value={skillValue} className="h-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
