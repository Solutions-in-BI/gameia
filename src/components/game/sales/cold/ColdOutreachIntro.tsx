import { motion } from "framer-motion";
import { 
  Phone, MessageSquare, Linkedin, ArrowLeft, Play, User, Building2, 
  AlertTriangle, Lightbulb, Clock, FileText, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutreachChannel } from "./ColdOutreachModeSelector";

interface SalesPersona {
  id: string;
  name: string;
  personality: string;
  role: string | null;
  company_name: string | null;
  company_type: string | null;
  pain_points: string[] | null;
  decision_factors: string[] | null;
  difficulty: string | null;
  channel: string | null;
}

interface OpeningScript {
  id: string;
  name: string;
  script_template: string;
  context_tags: string[];
  effectiveness_score: number;
}

interface ColdOutreachIntroProps {
  channel: OutreachChannel;
  personas: SalesPersona[];
  scripts: OpeningScript[];
  onStart: (persona: SalesPersona, script: OpeningScript | null) => void;
  onBack: () => void;
}

const CHANNEL_ICONS: Record<OutreachChannel, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  whatsapp: MessageSquare,
  linkedin: Linkedin,
};

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  phone: 'Ligação Fria',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Fácil', color: 'text-green-400', bg: 'bg-green-500/20' },
  medium: { label: 'Médio', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  hard: { label: 'Difícil', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  extreme: { label: 'Extremo', color: 'text-red-400', bg: 'bg-red-500/20' },
};

const PERSONALITY_CONFIG: Record<string, { emoji: string; label: string }> = {
  skeptical: { emoji: '🤨', label: 'Cético' },
  busy: { emoji: '⏰', label: 'Ocupado' },
  aggressive: { emoji: '😤', label: 'Agressivo' },
  indifferent: { emoji: '😐', label: 'Indiferente' },
  analytical: { emoji: '🧐', label: 'Analítico' },
  friendly: { emoji: '😊', label: 'Amigável' },
};

export function ColdOutreachIntro({ channel, personas, scripts, onStart, onBack }: ColdOutreachIntroProps) {
  const ChannelIcon = CHANNEL_ICONS[channel];
  const channelLabel = CHANNEL_LABELS[channel];
  
  // Filter personas by channel
  const filteredPersonas = personas.filter(p => 
    !p.channel || p.channel === 'all' || p.channel === channel
  );
  
  // Filter scripts by channel
  const filteredScripts = scripts.filter(s => s.context_tags?.includes(channel) || channel === 'phone');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <ChannelIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{channelLabel}</h1>
          <p className="text-muted-foreground">Selecione um prospect para abordar</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Tempo Limite</span>
          </div>
          <p className="text-2xl font-bold text-foreground">3:00</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Estágios</span>
          </div>
          <p className="text-2xl font-bold text-foreground">5</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Prospects</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{filteredPersonas.length}</p>
        </div>
      </div>

      {/* Scripts Section (if phone) */}
      {channel === 'phone' && filteredScripts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Scripts de Abertura Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {filteredScripts.slice(0, 4).map((script) => (
              <div 
                key={script.id}
                className="p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{script.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    {script.effectiveness_score}% efetivo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {script.script_template}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personas Grid */}
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        Prospects de Alta Resistência
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredPersonas.map((persona, index) => {
          const difficulty = DIFFICULTY_CONFIG[persona.difficulty || 'medium'];
          const personality = PERSONALITY_CONFIG[persona.personality] || { emoji: '👤', label: persona.personality };
          
          return (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart(persona, filteredScripts[0] || null)}
              className="p-4 rounded-xl bg-card/50 border border-border/50 text-left transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-lg">
                    {personality.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{persona.name}</h3>
                    <p className="text-xs text-muted-foreground">{persona.role}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${difficulty.bg} ${difficulty.color}`}>
                  {difficulty.label}
                </span>
              </div>
              
              {/* Company */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>{persona.company_name}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{persona.company_type}</span>
              </div>
              
              {/* Pain Points */}
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Objeções prováveis:
                </span>
                <div className="flex flex-wrap gap-1">
                  {persona.pain_points?.slice(0, 2).map((point) => (
                    <span key={point} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      "{point}"
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                  <Play className="w-4 h-4" />
                  Iniciar Abordagem
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6"
      >
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-orange-400" />
          Dicas para {channelLabel}
        </h4>
        <ul className="grid md:grid-cols-2 gap-2">
          {channel === 'phone' && (
            <>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Sorria ao falar - isso muda seu tom de voz
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Fale devagar e com clareza
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Tenha seu hook pronto nos primeiros 10 segundos
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Não tenha medo do silêncio - deixe o prospect pensar
              </li>
            </>
          )}
          {channel === 'whatsapp' && (
            <>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Seja informal mas mantenha o profissionalismo
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Use áudios curtos para humanizar
              </li>
            </>
          )}
          {channel === 'linkedin' && (
            <>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Personalize baseado no perfil
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Agregue valor antes de pedir algo
              </li>
            </>
          )}
        </ul>
      </motion.div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Canais
        </Button>
      </div>
    </motion.div>
  );
}
