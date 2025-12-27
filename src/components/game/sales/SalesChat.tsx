import { motion } from "framer-motion";
import { Clock, Star, LogOut, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Client, Message, Response } from "./SalesGame";

interface SalesChatProps {
  client: Client;
  messages: Message[];
  responses: Response[];
  rapport: number;
  score: number;
  salesClosed: number;
  timeLeft: string;
  onResponse: (response: Response) => void;
  onExit: () => void;
}

export function SalesChat({ 
  client, 
  messages, 
  responses, 
  rapport, 
  score, 
  salesClosed, 
  timeLeft, 
  onResponse, 
  onExit 
}: SalesChatProps) {
  const getRapportColor = () => {
    if (rapport >= 70) return 'from-green-500 to-emerald-400';
    if (rapport >= 40) return 'from-cyan-500 to-blue-400';
    if (rapport >= 20) return 'from-amber-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold">{timeLeft}</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            {salesClosed} VENDAS
          </Badge>
          <Button variant="ghost" size="sm" onClick={onExit}>
            SAIR
          </Button>
        </div>
      </div>

      {/* Client Card */}
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
              {client.avatar}
            </div>
            <div>
              <h3 className="font-bold">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.company}</p>
              <div className="flex gap-2 mt-2">
                {client.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Rapport</div>
            <div className="text-lg font-bold text-cyan-400">{rapport}%</div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
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

      {/* Chat Messages */}
      <div className="space-y-4 mb-6 min-h-[200px]">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'client' && (
              <div className="max-w-[80%]">
                <div className="text-xs text-muted-foreground mb-1">{client.name}</div>
                <div className="bg-card border border-border/50 rounded-xl rounded-tl-none px-4 py-3">
                  {message.text}
                </div>
              </div>
            )}
            {message.sender === 'player' && (
              <div className="max-w-[80%]">
                <div className="text-xs text-muted-foreground mb-1 text-right">Você</div>
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl rounded-tr-none px-4 py-3">
                  {message.text}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Response Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="w-4 h-4 border border-muted-foreground/50 rounded" />
          Escolha sua resposta:
        </div>
        
        {responses.map((response, index) => (
          <motion.button
            key={response.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onResponse(response)}
            className="w-full text-left bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl px-4 py-4 transition-all group"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium text-sm">{response.text}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
