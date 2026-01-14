import { motion } from "framer-motion";
import { MessageSquare, Clock, Users, Sparkles, ArrowRight, ArrowLeft, Phone, Handshake, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesPersona, SalesStage } from "@/hooks/useSalesGame";
import type { SalesTrack } from "./SalesGameModeSelector";
import { DIFFICULTY_COLORS, CONTENT_TYPE_COLORS } from "@/constants/colors";

interface SalesTrackIntroProps {
  track: SalesTrack;
  personas: SalesPersona[];
  stages: SalesStage[];
  onStart: (persona: SalesPersona) => void;
  onBack: () => void;
}

const PERSONALITY_CONFIG: Record<string, { emoji: string; label: string }> = {
  friendly: { emoji: '😊', label: 'Amigável' },
  skeptical: { emoji: '🤨', label: 'Cético' },
  busy: { emoji: '⚡', label: 'Ocupado' },
  analytical: { emoji: '📊', label: 'Analítico' },
  indecisive: { emoji: '🤔', label: 'Indeciso' },
};

const TRACK_CONFIG: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  subtitle: string;
}> = {
  sdr: {
    icon: <Phone className="w-8 h-8 text-primary-foreground" />,
    gradient: 'from-gameia-info to-gameia-teal',
    bgGradient: 'from-gameia-info to-gameia-teal',
    subtitle: 'Prospecte, qualifique e agende reuniões de alto valor',
  },
  closer: {
    icon: <Handshake className="w-8 h-8 text-primary-foreground" />,
    gradient: 'from-gameia-success to-gameia-teal',
    bgGradient: 'from-gameia-success to-gameia-teal',
    subtitle: 'Feche negócios complexos e supere objeções',
  },
};

export function SalesTrackIntro({ track, personas, stages, onStart, onBack }: SalesTrackIntroProps) {
  const trackConfig = TRACK_CONFIG[track.track_key] || TRACK_CONFIG.closer;
  const timeMinutes = Math.floor(track.time_limit_seconds / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto pt-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${trackConfig.gradient} flex items-center justify-center`}>
            {trackConfig.icon}
          </div>
        </div>
        
        <Badge variant="outline" className="mb-2">
          {track.track_key.toUpperCase()}
        </Badge>
        
        <h1 className={`text-2xl font-bold bg-gradient-to-r ${trackConfig.bgGradient} bg-clip-text text-transparent mb-2`}>
          {track.name}
        </h1>
        
        <p className="text-muted-foreground">
          {trackConfig.subtitle}
        </p>
      </div>

      {/* Stages Preview */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gameia-info" />
          Etapas da {track.track_key === 'sdr' ? 'Prospecção' : 'Negociação'}
        </h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg">
                  {stage.icon || '💬'}
                </div>
                <span className="text-xs text-muted-foreground mt-1 text-center max-w-[80px] truncate">
                  {stage.stage_label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className="w-4 h-0.5 bg-muted-foreground/20 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-gameia-info mx-auto mb-2" />
          <div className="text-xl font-bold">{timeMinutes}:00</div>
          <div className="text-xs text-muted-foreground">Tempo Limite</div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-gameia-success mx-auto mb-2" />
          <div className="text-xl font-bold">{stages.length}</div>
          <div className="text-xs text-muted-foreground">Etapas</div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-xl font-bold">{personas.length}</div>
          <div className="text-xs text-muted-foreground">Clientes</div>
        </div>
      </div>

      {/* Persona Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-accent" />
          Escolha seu Cliente:
        </h3>
        <div className="space-y-3">
          {personas.map((persona) => {
            const difficultyKey = persona.difficulty as keyof typeof DIFFICULTY_COLORS || 'medium';
            const difficulty = DIFFICULTY_COLORS[difficultyKey] || DIFFICULTY_COLORS.medium;
            const personality = PERSONALITY_CONFIG[persona.personality] || { emoji: '👤', label: persona.personality };
            
            return (
              <motion.button
                key={persona.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onStart(persona)}
                className="w-full text-left bg-card/50 hover:bg-card/80 border border-border/50 hover:border-primary/50 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {persona.avatar || personality.emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{persona.name}</span>
                      <Badge variant="outline" className={`text-xs ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
                        {difficultyKey === 'easy' ? 'Fácil' : difficultyKey === 'hard' ? 'Difícil' : 'Médio'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {personality.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {persona.role} {persona.company_name && `• ${persona.company_name}`}
                    </p>
                    
                    {persona.pain_points && persona.pain_points.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {persona.pain_points.slice(0, 2).map((pain, i) => (
                          <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                            {pain}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
    </motion.div>
  );
}
