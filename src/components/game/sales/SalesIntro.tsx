import { motion } from "framer-motion";
import { Briefcase, Clock, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientType {
  type: string;
  emoji: string;
  label: string;
  hint: string;
}

interface SalesIntroProps {
  clientTypes: ClientType[];
  onStart: () => void;
  onBack: () => void;
  timeLimit: string;
  clientCount: number;
}

export function SalesIntro({ clientTypes, onStart, onBack, timeLimit, clientCount }: SalesIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto pt-8"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center">
          <Briefcase className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
        Desafio de Vendas
      </h1>
      
      <p className="text-center text-muted-foreground mb-8 px-4">
        Simule negociações reais e feche o maior número de vendas! 
        Adapte sua abordagem ao perfil de cada cliente.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-xl font-bold">{timeLimit}</div>
          <div className="text-xs text-muted-foreground">Tempo Limite</div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <div className="text-xl font-bold">{clientCount}</div>
          <div className="text-xs text-muted-foreground">Clientes</div>
        </div>
      </div>

      {/* Client Types */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-4">Tipos de Clientes:</h3>
        <div className="grid grid-cols-2 gap-3">
          {clientTypes.map((ct) => (
            <div 
              key={ct.type}
              className="flex items-center gap-2 bg-card/30 border border-border/30 rounded-lg px-3 py-2"
            >
              <span className="text-lg">{ct.emoji}</span>
              <div>
                <div className="text-sm font-medium">{ct.label}</div>
                <div className="text-xs text-muted-foreground">{ct.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex-1"
        >
          VOLTAR
        </Button>
        <Button
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          INICIAR DESAFIO
        </Button>
      </div>
    </motion.div>
  );
}
