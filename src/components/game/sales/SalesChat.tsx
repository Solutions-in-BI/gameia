import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, LogOut, ArrowRight, Lightbulb, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesStageIndicator } from "./SalesStageIndicator";
import { SalesFeedbackToast } from "./SalesFeedbackToast";
import type { SalesPersona, SalesStage, ChatMessage, ResponseOption } from "@/hooks/useSalesGame";

interface SalesChatProps {
  persona: SalesPersona;
  stages: SalesStage[];
  currentStageIndex: number;
  messages: ChatMessage[];
  responseOptions: ResponseOption[];
  rapport: number;
  score: number;
  timeLeft: string;
  hint: string | null;
  feedback: { text: string; isOptimal: boolean } | null;
  isGenerating?: boolean;
  onResponse: (option: ResponseOption) => void;
  onExit: () => void;
}

export function SalesChat({ 
  persona,
  stages,
  currentStageIndex,
  messages, 
  responseOptions, 
  rapport, 
  score, 
  timeLeft, 
  hint,
  feedback,
  isGenerating,
  onResponse, 
  onExit 
}: SalesChatProps) {
  const getRapportColor = () => {
    if (rapport >= 70) return 'from-gameia-success to-gameia-success/80';
    if (rapport >= 40) return 'from-gameia-info to-gameia-info/80';
    if (rapport >= 20) return 'from-gameia-warning to-primary';
    return 'from-destructive to-destructive/80';
  };

  const getRapportStatus = () => {
    if (rapport >= 70) return 'Excelente';
    if (rapport >= 50) return 'Bom';
    if (rapport >= 30) return 'Regular';
    return 'Crítico';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Stage Indicator */}
      <SalesStageIndicator stages={stages} currentStageIndex={currentStageIndex} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-3 py-1.5">
            <Clock className="w-4 h-4 text-gameia-info" />
            <span className="font-mono font-bold text-sm">{timeLeft}</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-3 py-1.5">
            <Star className="w-4 h-4 text-reward-xp" />
            <span className="font-bold text-sm">{score}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-1" />
          Sair
        </Button>
      </div>

      {/* Client Card */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gameia-success/20 to-gameia-success/10 flex items-center justify-center text-2xl">
              {persona.avatar || '👤'}
            </div>
            <div>
              <h3 className="font-bold">{persona.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {persona.role} {persona.company_name && `• ${persona.company_name}`}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Rapport</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{getRapportStatus()}</span>
              <span className="text-lg font-bold text-gameia-info">{rapport}%</span>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getRapportColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${rapport}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Context Hint */}
      <AnimatePresence>
        {hint && !feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">{hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="space-y-3 mb-6 min-h-[180px] max-h-[300px] overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'client' && (
              <div className="max-w-[85%]">
                <div className="text-xs text-muted-foreground mb-1">{persona.name}</div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                  {message.text}
                </div>
              </div>
            )}
            {message.sender === 'player' && (
              <div className="max-w-[85%]">
                <div className="text-xs text-muted-foreground mb-1 text-right">Você</div>
                <div className={`
                  rounded-2xl rounded-tr-sm px-4 py-3 text-sm
                  ${message.isOptimal 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/30'
                  }
                `}>
                  {message.text}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Typing indicator when generating */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%]">
              <div className="text-xs text-muted-foreground mb-1">{persona.name}</div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Digitando...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Response Options */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2">
          Escolha sua resposta:
        </div>
        
        {responseOptions.length > 0 ? (
          responseOptions.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onResponse(option)}
              disabled={!!feedback || isGenerating}
              className="w-full text-left bg-card/50 hover:bg-card/80 border border-border/50 hover:border-green-500/50 rounded-xl px-4 py-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform mt-0.5 flex-shrink-0" />
                <span className="text-sm">{option.text}</span>
              </div>
            </motion.button>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span className="text-sm">Gerando opções...</span>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      <SalesFeedbackToast feedback={feedback} />
    </motion.div>
  );
}
