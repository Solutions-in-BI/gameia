import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Clock, Target, ArrowLeft, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesIntro } from "./SalesIntro";
import { SalesChat } from "./SalesChat";
import { SalesResults } from "./SalesResults";

export interface Client {
  id: string;
  name: string;
  company: string;
  avatar: string;
  type: 'friendly' | 'skeptical' | 'busy' | 'analytical';
  interests: string[];
  initialRapport: number;
}

export interface Message {
  id: string;
  sender: 'client' | 'player';
  text: string;
}

export interface Response {
  id: string;
  text: string;
  rapportChange: number;
  isOptimal: boolean;
}

export interface Scenario {
  clientMessage: string;
  responses: Response[];
}

const CLIENT_TYPES = [
  { type: 'friendly', emoji: '😊', label: 'Amigável', hint: 'Gosta de conexão' },
  { type: 'skeptical', emoji: '🤨', label: 'Cético', hint: 'Precisa de provas' },
  { type: 'busy', emoji: '🏃', label: 'Ocupado', hint: 'Seja direto' },
  { type: 'analytical', emoji: '📊', label: 'Analítico', hint: 'Mostre dados' },
];

const CLIENTS: Client[] = [
  { id: '1', name: 'Roberto Almeida', company: 'Indústrias RAL', avatar: '👨‍💼', type: 'skeptical', interests: ['SEGURANÇA', 'ESCALABILIDADE', 'ROI'], initialRapport: 40 },
  { id: '2', name: 'Maria Santos', company: 'Tech Solutions', avatar: '👩‍💻', type: 'analytical', interests: ['DADOS', 'INTEGRAÇÃO', 'SUPORTE'], initialRapport: 50 },
  { id: '3', name: 'Carlos Lima', company: 'Startup Hub', avatar: '👨‍🚀', type: 'busy', interests: ['VELOCIDADE', 'PREÇO', 'SIMPLICIDADE'], initialRapport: 30 },
];

const SCENARIOS: Record<string, Scenario[]> = {
  skeptical: [
    {
      clientMessage: 'Preciso de provas, não de promessas.',
      responses: [
        { id: '1', text: 'COM BASE EM NOSSA CONVERSA, QUAL PROPOSTA FAZ MAIS SENTIDO PARA VOCÊS?', rapportChange: 15, isOptimal: true },
        { id: '2', text: 'PRECISO DA SUA DECISÃO AGORA. ESSA OFERTA EXPIRA HOJE.', rapportChange: -20, isOptimal: false },
        { id: '3', text: 'POSSO OFERECER CONDIÇÕES ESPECIAIS SE FECHARMOS ESTA SEMANA.', rapportChange: 5, isOptimal: false },
      ]
    },
    {
      clientMessage: 'Interessante... me diga mais sobre isso.',
      responses: [
        { id: '1', text: 'QUE TAL UM PERÍODO DE TESTE GRATUITO PARA VALIDAR?', rapportChange: 20, isOptimal: true },
        { id: '2', text: 'NOSSOS CLIENTES VIRAM 40% DE AUMENTO EM PRODUTIVIDADE.', rapportChange: 10, isOptimal: false },
        { id: '3', text: 'CONFIE EM MIM, VOCÊ NÃO VAI SE ARREPENDER.', rapportChange: -15, isOptimal: false },
      ]
    },
  ],
  analytical: [
    {
      clientMessage: 'Preciso ver os números antes de decidir.',
      responses: [
        { id: '1', text: 'PREPAREI UM RELATÓRIO DETALHADO COM ROI PROJETADO E MÉTRICAS.', rapportChange: 20, isOptimal: true },
        { id: '2', text: 'OS NÚMEROS SÃO EXCELENTES, PODE CONFIAR.', rapportChange: -15, isOptimal: false },
        { id: '3', text: 'POSSO AGENDAR UMA DEMO TÉCNICA COM SUA EQUIPE.', rapportChange: 10, isOptimal: false },
      ]
    },
  ],
  busy: [
    {
      clientMessage: 'Tenho apenas 5 minutos. Seja rápido.',
      responses: [
        { id: '1', text: 'EM 3 PONTOS: 50% MAIS RÁPIDO, 30% MAIS BARATO, IMPLEMENTAÇÃO EM 1 SEMANA.', rapportChange: 20, isOptimal: true },
        { id: '2', text: 'DEIXE-ME EXPLICAR NOSSA HISTÓRIA E METODOLOGIA COMPLETA.', rapportChange: -25, isOptimal: false },
        { id: '3', text: 'QUANDO PODEMOS REMARCAR PARA UMA REUNIÃO MAIS LONGA?', rapportChange: -10, isOptimal: false },
      ]
    },
  ],
  friendly: [
    {
      clientMessage: 'Adoro conhecer novas soluções! Como vocês começaram?',
      responses: [
        { id: '1', text: 'NOSSA HISTÓRIA COMEÇOU RESOLVENDO ESSE MESMO PROBLEMA PARA NÓS MESMOS.', rapportChange: 20, isOptimal: true },
        { id: '2', text: 'VAMOS DIRETO AO PONTO - AQUI ESTÁ O PREÇO.', rapportChange: -15, isOptimal: false },
        { id: '3', text: 'QUE BOM! O QUE VOCÊ MAIS VALORIZA EM UM PARCEIRO?', rapportChange: 15, isOptimal: false },
      ]
    },
  ],
};

interface SalesGameProps {
  onBack: () => void;
}

export function SalesGame({ onBack }: SalesGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentClientIndex, setCurrentClientIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [rapport, setRapport] = useState(40);
  const [score, setScore] = useState(0);
  const [salesClosed, setSalesClosed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [messages, setMessages] = useState<Message[]>([]);

  const currentClient = CLIENTS[currentClientIndex];
  const clientScenarios = SCENARIOS[currentClient?.type] || [];
  const currentScenario = clientScenarios[currentScenarioIndex];

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && currentScenario && messages.length === 0) {
      setMessages([{ id: '1', sender: 'client', text: currentScenario.clientMessage }]);
    }
  }, [gameState, currentScenario, messages.length]);

  const startGame = () => {
    setGameState('playing');
    setCurrentClientIndex(0);
    setCurrentScenarioIndex(0);
    setRapport(CLIENTS[0].initialRapport);
    setScore(0);
    setSalesClosed(0);
    setTimeLeft(120);
    setMessages([]);
  };

  const handleResponse = (response: Response) => {
    const newRapport = Math.min(100, Math.max(0, rapport + response.rapportChange));
    setRapport(newRapport);
    
    const points = response.isOptimal ? 15 : response.rapportChange > 0 ? 5 : 0;
    setScore(prev => prev + points);

    setMessages(prev => [
      ...prev,
      { id: `player-${Date.now()}`, sender: 'player', text: response.text }
    ]);

    if (newRapport >= 80) {
      setSalesClosed(prev => prev + 1);
      setTimeout(() => nextClient(), 1500);
    } else if (newRapport <= 10) {
      setTimeout(() => nextClient(), 1500);
    } else {
      setTimeout(() => nextScenario(), 1000);
    }
  };

  const nextScenario = () => {
    if (currentScenarioIndex + 1 < clientScenarios.length) {
      setCurrentScenarioIndex(prev => prev + 1);
      const nextScenario = clientScenarios[currentScenarioIndex + 1];
      if (nextScenario) {
        setMessages(prev => [
          ...prev,
          { id: `client-${Date.now()}`, sender: 'client', text: nextScenario.clientMessage }
        ]);
      }
    } else {
      nextClient();
    }
  };

  const nextClient = () => {
    if (currentClientIndex + 1 < CLIENTS.length) {
      const nextIndex = currentClientIndex + 1;
      setCurrentClientIndex(nextIndex);
      setCurrentScenarioIndex(0);
      setRapport(CLIENTS[nextIndex].initialRapport);
      setMessages([]);
    } else {
      setGameState('results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <SalesIntro 
            clientTypes={CLIENT_TYPES} 
            onStart={startGame} 
            onBack={onBack}
            timeLimit="2:00"
            clientCount={CLIENTS.length}
          />
        )}

        {gameState === 'playing' && currentClient && currentScenario && (
          <SalesChat
            client={currentClient}
            messages={messages}
            responses={currentScenario.responses}
            rapport={rapport}
            score={score}
            salesClosed={salesClosed}
            timeLeft={formatTime(timeLeft)}
            onResponse={handleResponse}
            onExit={() => setGameState('results')}
          />
        )}

        {gameState === 'results' && (
          <SalesResults
            score={score}
            salesClosed={salesClosed}
            totalClients={CLIENTS.length}
            onRestart={startGame}
            onBack={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
