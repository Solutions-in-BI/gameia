import { motion } from "framer-motion";
import { MessageSquare, Clock, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesPersona, SalesStage } from "@/hooks/useSalesGame";

interface SalesIntroProps {
  personas: SalesPersona[];
  stages: SalesStage[];
  onStart: (persona: SalesPersona) => void;
  onBack: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Médio', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  hard: { label: 'Difícil', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const PERSONALITY_EMOJIS: Record<string, string> = {
  friendly: '😊',
  skeptical: '🤨',
  busy: '⚡',
  analytical: '📊',
  indecisive: '🤔',
};

export function SalesIntro({ personas, stages, onStart, onBack }: SalesIntroProps) {
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Desafio de Vendas
        </h1>
        
        <p className="text-muted-foreground">
          Simule uma conversa de vendas completa. Guie o cliente desde a abertura até o fechamento!
        </p>
      </div>

      {/* Stages Preview */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Etapas da Conversa
        </h3>
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm">
                  {stage.icon || '💬'}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{stage.stage_label}</span>
              </div>
              {index < stages.length - 1 && (
                <div className="w-6 h-0.5 bg-muted-foreground/20 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-xl font-bold">5:00</div>
          <div className="text-xs text-muted-foreground">Tempo Limite</div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <div className="text-xl font-bold">{personas.length}</div>
          <div className="text-xs text-muted-foreground">Clientes Disponíveis</div>
        </div>
      </div>

      {/* Persona Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3">Escolha seu Cliente:</h3>
        <div className="space-y-3">
          {personas.map((persona) => {
            const difficulty = DIFFICULTY_CONFIG[persona.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.medium;
            const emoji = PERSONALITY_EMOJIS[persona.personality] || '👤';
            
            return (
              <motion.button
                key={persona.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onStart(persona)}
                className="w-full text-left bg-card/50 hover:bg-card/80 border border-border/50 hover:border-cyan-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {persona.avatar || emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{persona.name}</span>
                      <Badge variant="outline" className={`text-xs ${difficulty.color}`}>
                        {difficulty.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {persona.role} {persona.company_name && `• ${persona.company_name}`}
                    </p>
                    
                    {persona.pain_points && persona.pain_points.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {persona.pain_points.slice(0, 2).map((pain, i) => (
                          <span key={i} className="text-xs bg-muted/50 px-2 py-0.5 rounded">
                            {pain}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="w-full">
        Voltar
      </Button>
    </motion.div>
  );
}
