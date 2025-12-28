import { motion } from "framer-motion";
import { Phone, MessageSquare, Linkedin, ArrowLeft, Zap, Target, Shield, Eye, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

export type OutreachChannel = 'phone' | 'whatsapp' | 'linkedin';

interface ColdOutreachModeSelectorProps {
  onSelectChannel: (channel: OutreachChannel) => void;
  onBack: () => void;
}

const CHANNEL_CONFIG: Record<OutreachChannel, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  gradient: string;
  difficulty: string;
  tips: string[];
}> = {
  phone: {
    icon: Phone,
    label: 'Ligação Fria',
    description: 'Contato direto por telefone. O mais desafiador, mas também o mais efetivo.',
    gradient: 'from-orange-500 to-red-500',
    difficulty: 'Difícil',
    tips: ['Sorria ao falar', 'Tom confiante', 'Seja breve e objetivo']
  },
  whatsapp: {
    icon: MessageSquare,
    label: 'WhatsApp',
    description: 'Primeiro contato via mensagem. Mais tempo para pensar, menos pressão.',
    gradient: 'from-green-500 to-emerald-500',
    difficulty: 'Médio',
    tips: ['Use emojis com moderação', 'Seja informal mas profissional', 'Ofereça áudio']
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    description: 'Abordagem profissional. Contexto de negócios ajuda na receptividade.',
    gradient: 'from-blue-500 to-indigo-500',
    difficulty: 'Fácil',
    tips: ['Personalize a mensagem', 'Mencione conexões em comum', 'Agregue valor primeiro']
  }
};

const SKILLS_PREVIEW = [
  { icon: Eye, label: 'First Impression' },
  { icon: Anchor, label: 'Hook Crafting' },
  { icon: Zap, label: 'Elevator Pitch' },
  { icon: Shield, label: 'Brushoff Handling' },
  { icon: Target, label: 'Micro-Commitment' },
];

export function ColdOutreachModeSelector({ onSelectChannel, onBack }: ColdOutreachModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 mb-4">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Cold Outreach</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Escolha seu Canal de Prospecção
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Cada canal tem suas particularidades. Escolha como você quer abordar o prospect 
          e pratique técnicas específicas para cada situação.
        </p>
      </div>

      {/* Skills Preview */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {SKILLS_PREVIEW.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs">
            <Icon className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Channel Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(CHANNEL_CONFIG) as OutreachChannel[]).map((channel, index) => {
          const config = CHANNEL_CONFIG[channel];
          const Icon = config.icon;
          
          return (
            <motion.button
              key={channel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectChannel(channel)}
              className="relative group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm text-left transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-1">{config.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
              
              {/* Difficulty Badge */}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs mb-4">
                <div className={`w-2 h-2 rounded-full ${
                  config.difficulty === 'Difícil' ? 'bg-red-500' :
                  config.difficulty === 'Médio' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-muted-foreground">{config.difficulty}</span>
              </div>
              
              {/* Tips */}
              <ul className="space-y-1">
                {config.tips.map((tip) => (
                  <li key={tip} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6"
      >
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-orange-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">O Desafio da Prospecção Fria</h4>
            <p className="text-sm text-muted-foreground">
              Você tem <strong>3 minutos</strong> para captar a atenção do prospect e conseguir um micro-compromisso. 
              O lead foi gerado por análise de tribunais - ele NÃO está esperando sua ligação. 
              Prepare-se para alta resistência inicial!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Trilhas
        </Button>
      </div>
    </motion.div>
  );
}
