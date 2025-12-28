import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, MessageSquare, Linkedin, X, Clock, Target, Zap, 
  User, Lightbulb, Loader2, PhoneOff, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutreachChannel } from "./ColdOutreachModeSelector";
import { SalesFeedbackToast } from "../SalesFeedbackToast";

interface SalesPersona {
  id: string;
  name: string;
  personality: string;
  role: string | null;
  company_name: string | null;
}

interface SalesStage {
  id: string;
  stage_key: string;
  stage_label: string;
  stage_order: number;
  icon: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'player';
  text: string;
  timestamp: Date;
}

interface ResponseOption {
  text: string;
  quality: 'poor' | 'good' | 'optimal';
  rapport_impact: number;
  score_value: number;
  feedback: string;
}

interface FeedbackData {
  text: string;
  isOptimal: boolean;
}

interface ColdOutreachChatProps {
  channel: OutreachChannel;
  persona: SalesPersona;
  stages: SalesStage[];
  currentStageIndex: number;
  messages: ChatMessage[];
  responseOptions: ResponseOption[];
  rapport: number;
  score: number;
  timeLeft: number;
  hint: string | null;
  feedback: FeedbackData | null;
  isGenerating: boolean;
  onResponse: (option: ResponseOption) => void;
  onExit: () => void;
}

const CHANNEL_ICONS: Record<OutreachChannel, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  whatsapp: MessageSquare,
  linkedin: Linkedin,
};

const CHANNEL_BG: Record<OutreachChannel, string> = {
  phone: 'from-orange-900/20 to-red-900/20',
  whatsapp: 'from-green-900/20 to-emerald-900/20',
  linkedin: 'from-blue-900/20 to-indigo-900/20',
};

export function ColdOutreachChat({
  channel,
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
  onExit,
}: ColdOutreachChatProps) {
  const ChannelIcon = CHANNEL_ICONS[channel];
  const currentStage = stages[currentStageIndex];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 30) return 'text-red-400';
    if (timeLeft <= 60) return 'text-yellow-400';
    return 'text-foreground';
  };

  const getRapportColor = () => {
    if (rapport >= 70) return 'bg-green-500';
    if (rapport >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRapportStatus = () => {
    if (rapport >= 70) return 'Engajado';
    if (rapport >= 40) return 'Interessado';
    if (rapport >= 20) return 'Neutro';
    return 'Resistente';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-gradient-to-b ${CHANNEL_BG[channel]} -m-4 p-4`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Stage Indicator */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`h-1 rounded-full transition-all ${
                index < currentStageIndex ? 'w-8 bg-orange-500' :
                index === currentStageIndex ? 'w-12 bg-orange-400' :
                'w-6 bg-muted'
              }`}
            />
          ))}
        </div>
        
        {/* Current Stage Label */}
        {currentStage && (
          <div className="text-center mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
              {currentStage.stage_label}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 ${getTimeColor()}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          
          {/* Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
          
          {/* Exit */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onExit}
            className="text-muted-foreground hover:text-red-400"
          >
            {channel === 'phone' ? <PhoneOff className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Prospect Card */}
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{persona.name}</h3>
                <ChannelIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {persona.role} • {persona.company_name}
              </p>
            </div>
          </div>
          
          {/* Rapport Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Receptividade</span>
              <span className="text-foreground font-medium">{getRapportStatus()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full ${getRapportColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${rapport}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Context Hint */}
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-orange-400 mt-0.5" />
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="space-y-3 mb-4 min-h-[200px] max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'player'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-card border border-border/50 text-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 rounded-2xl bg-card border border-border/50 rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {channel === 'phone' ? 'Ouvindo...' : 'Digitando...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Response Options */}
        <div className="space-y-2">
          {responseOptions.length > 0 ? (
            <AnimatePresence mode="wait">
              {responseOptions.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onResponse(option)}
                  disabled={isGenerating}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    option.quality === 'optimal' 
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
                      : option.quality === 'good'
                      ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                      : 'bg-card/50 border-border/50 hover:border-border'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 ${
                      option.quality === 'optimal' ? 'text-green-400' :
                      option.quality === 'good' ? 'text-yellow-400' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm text-foreground">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              Gerando opções de resposta...
            </div>
          )}
        </div>

        {/* Feedback Toast */}
        <SalesFeedbackToast feedback={feedback} />
      </div>
    </motion.div>
  );
}
