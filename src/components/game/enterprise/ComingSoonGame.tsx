/**
 * Coming Soon Game - Placeholder para jogos não implementados
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Bell, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameLayout } from "../common/GameLayout";
import { toast } from "sonner";

interface ComingSoonGameProps {
  onBack: () => void;
  gameName: string;
  gameIcon: React.ReactNode;
  description: string;
  expectedFeatures: string[];
}

export function ComingSoonGame({ 
  onBack, 
  gameName, 
  gameIcon, 
  description,
  expectedFeatures 
}: ComingSoonGameProps) {
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    toast.success("Você será notificado quando o jogo estiver disponível!");
  };

  return (
    <GameLayout title={gameName} subtitle="Em breve" onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto space-y-8 text-center"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground">
          {gameIcon}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">{gameName}</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Em Desenvolvimento</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground">
          {description}
        </p>

        {/* Expected Features */}
        <div className="p-6 bg-card/50 rounded-xl border border-border text-left">
          <h3 className="font-semibold mb-4">O que esperar:</h3>
          <ul className="space-y-2">
            {expectedFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Notify Button */}
        <div className="space-y-3">
          <Button
            onClick={handleNotify}
            disabled={notified}
            className="w-full py-5"
            variant={notified ? "outline" : "default"}
          >
            {notified ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Notificação Ativada
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Notifique-me quando disponível
              </>
            )}
          </Button>
          
          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Jogos
          </Button>
        </div>
      </motion.div>
    </GameLayout>
  );
}
