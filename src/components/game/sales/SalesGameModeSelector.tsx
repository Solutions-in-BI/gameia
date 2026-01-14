import { motion } from "framer-motion";
import { Phone, Handshake, Clock, Trophy, Target, ArrowLeft, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SalesTrack {
  id: string;
  track_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  time_limit_seconds: number;
  xp_reward: number | null;
  coins_reward: number | null;
}

interface SalesGameModeSelectorProps {
  tracks: SalesTrack[];
  onSelectTrack: (track: SalesTrack) => void;
  onBack: () => void;
}

const TRACK_DETAILS: Record<string, {
  icon: React.ReactNode;
  skills: string[];
  gradient: string;
  bgGradient: string;
}> = {
  sdr: {
    icon: <Phone className="w-8 h-8" />,
    skills: ['Cold Calling', 'Qualificação BANT', 'Rapport Building', 'Agendamento'],
    gradient: 'from-gameia-info to-gameia-teal',
    bgGradient: 'from-gameia-info/10 to-gameia-teal/10',
  },
  closer: {
    icon: <Handshake className="w-8 h-8" />,
    skills: ['Discovery Call', 'Apresentação', 'Contorno de Objeções', 'Fechamento'],
    gradient: 'from-gameia-success to-gameia-teal',
    bgGradient: 'from-gameia-success/10 to-gameia-teal/10',
  },
};

export function SalesGameModeSelector({ tracks, onSelectTrack, onBack }: SalesGameModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto pt-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gameia-success to-gameia-teal flex items-center justify-center">
            <Target className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gameia-success to-gameia-teal bg-clip-text text-transparent mb-2">
          Desafio de Vendas 3.0
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          Escolha sua trilha de treinamento e domine as habilidades de vendas em cenários realistas com IA.
        </p>
      </div>

      {/* Track Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {tracks.map((track) => {
          const details = TRACK_DETAILS[track.track_key] || TRACK_DETAILS.closer;
          const timeMinutes = Math.floor(track.time_limit_seconds / 60);
          
          return (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTrack(track)}
              className={`relative overflow-hidden text-left bg-gradient-to-br ${details.bgGradient} border border-border/50 hover:border-primary/50 rounded-2xl p-6 transition-all group`}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${details.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${details.gradient} flex items-center justify-center text-white mb-4`}>
                {details.icon}
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{track.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {track.track_key.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {track.description}
                </p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {details.skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-background/50 border border-border/50 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{timeMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <Sparkles className="w-4 h-4" />
                    <span>+{track.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Trophy className="w-4 h-4" />
                    <span>+{track.coins_reward} 🪙</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card/30 border border-border/50 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h4 className="font-medium mb-1">Personas LegalTrade</h4>
            <p className="text-sm text-muted-foreground">
              Pratique com clientes realistas do mercado de ativos judiciais: advogados, investidores, beneficiários de precatórios e gestores financeiros.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Menu
      </Button>
    </motion.div>
  );
}
