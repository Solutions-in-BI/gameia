/**
 * ArenaTab - Hub de Experiências
 * Jogos, Desafios, Treinamentos, Testes Cognitivos e Simulações
 * Sub-navegação via sidebar lateral (não mais tabs internas)
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Brain,
  MessageSquare,
  Sparkles,
  Play,
  Grid3X3,
  Puzzle,
  Car,
  Lightbulb,
  Target,
  GraduationCap,
} from "lucide-react";
import { HubCard, HubEmptyState, HubButton, HubHeader } from "../common";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { useOrganization } from "@/hooks/useOrganization";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { ChallengesHighlight, ChallengeDetailModal } from "@/components/challenges";
import { ExperienceCard } from "@/components/arena/ExperienceCard";

// Games
import { QuizMasterGame } from "@/components/game/enterprise/QuizMasterGame";
import { DecisionGame } from "@/components/game/enterprise/DecisionGame";
import { AIScenarioGame } from "@/components/game/enterprise/AIScenarioGame";
import { SalesGame } from "@/components/game/sales/SalesGame";
import { ComingSoonGame } from "@/components/game/enterprise/ComingSoonGame";
import { CognitiveTestPlayer } from "@/components/game/development/CognitiveTestPlayer";

type ArenaFilter = "all" | "games" | "challenges" | "cognitive" | "simulations";
type ActiveExperience = { type: string; id: string } | null;

interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: "games" | "simulations";
  skills: string[];
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  duration?: string;
  isNew?: boolean;
  isRecommended?: boolean;
}

const GAMES: GameItem[] = [
  {
    id: "quiz",
    name: "Quiz Master",
    description: "Teste seus conhecimentos em diversas categorias",
    icon: Brain,
    category: "games",
    skills: ["Conhecimento Técnico", "Raciocínio Lógico"],
    xpReward: 50,
    difficulty: "medium",
    duration: "5-10 min",
  },
  {
    id: "decisions",
    name: "Decisões Estratégicas",
    description: "Tome decisões difíceis em cenários realistas",
    icon: Target,
    category: "simulations",
    skills: ["Tomada de Decisão", "Pensamento Crítico"],
    xpReward: 75,
    difficulty: "hard",
    duration: "15-20 min",
    isRecommended: true,
  },
  {
    id: "sales",
    name: "Desafio de Vendas",
    description: "Pratique técnicas de vendas com IA",
    icon: MessageSquare,
    category: "simulations",
    skills: ["Comunicação", "Negociação", "Vendas"],
    xpReward: 100,
    difficulty: "hard",
    duration: "10-15 min",
  },
  {
    id: "ai-game",
    name: "Cenários com IA",
    description: "Resolva problemas complexos gerados por IA",
    icon: Sparkles,
    category: "simulations",
    skills: ["Resolução de Problemas", "Criatividade"],
    xpReward: 80,
    difficulty: "hard",
    duration: "15 min",
    isNew: true,
  },
];

const COMING_SOON_GAMES = [
  { id: "escape", name: "Escape Room Virtual", icon: Puzzle, description: "Resolva enigmas em equipe" },
  { id: "projects", name: "Corrida de Projetos", icon: Car, description: "Gerencie recursos e complete projetos" },
  { id: "brainstorm", name: "Brainstorm Battle", icon: Lightbulb, description: "Competição de ideias criativas" },
];

export function ArenaTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get("tab") as ArenaFilter) || "all";
  const [activeExperience, setActiveExperience] = useState<ActiveExperience>(null);
  const { skills } = useSkillProgress();
  
  // Data hooks
  const { currentOrg } = useOrganization();
  const { activeChallenges, getSupporters } = useChallenges(currentOrg?.id);
  const { tests, mySessions } = useCognitiveTests();
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);

  // Find recommended experience based on weak skills
  const weakSkills = skills.slice(0, 3).map(s => s.name.toLowerCase());
  const recommendedGame = GAMES.find(g => 
    g.skills.some(s => weakSkills.some(ws => s.toLowerCase().includes(ws)))
  ) || GAMES.find(g => g.isRecommended);

  // Filter items
  const filteredGames = GAMES.filter(g => 
    filter === "all" || filter === "games" && g.category === "games" || filter === "simulations" && g.category === "simulations"
  );

  const filteredTests = tests.filter(t => 
    filter === "all" || filter === "cognitive"
  );

  // Check if test was completed recently
  const getTestLastSession = (testId: string) => {
    return mySessions.find(s => s.test_id === testId && s.status === "completed");
  };

  // Handle back from experience
  const handleBack = () => setActiveExperience(null);

  // Render active experience
  if (activeExperience) {
    const { type, id } = activeExperience;
    
    if (type === "game") {
      switch (id) {
        case "quiz": return <QuizMasterGame onBack={handleBack} />;
        case "decisions": return <DecisionGame onBack={handleBack} />;
        case "sales": return <SalesGame onBack={handleBack} />;
        case "ai-game": return <AIScenarioGame onBack={handleBack} />;
        case "escape": return <ComingSoonGame onBack={handleBack} gameName="Escape Room Virtual" gameIcon={<Puzzle className="w-12 h-12" />} description="Resolva enigmas em equipe" expectedFeatures={["Puzzles colaborativos", "Chat em tempo real", "Rankings de equipe"]} />;
        case "projects": return <ComingSoonGame onBack={handleBack} gameName="Corrida de Projetos" gameIcon={<Car className="w-12 h-12" />} description="Gerencie recursos e complete projetos" expectedFeatures={["Gestão de recursos", "Simulação de projetos reais"]} />;
        case "brainstorm": return <ComingSoonGame onBack={handleBack} gameName="Brainstorm Battle" gameIcon={<Lightbulb className="w-12 h-12" />} description="Competição de ideias criativas" expectedFeatures={["Geração de ideias", "Votação democrática"]} />;
      }
    }
    
    if (type === "cognitive_test") {
      return (
        <CognitiveTestPlayer
          testId={id}
          onComplete={handleBack}
          onCancel={handleBack}
        />
      );
    }
    
    if (type === "training") {
      // Navigate to training detail
      window.location.href = `/app/trainings/${id}`;
      return null;
    }
    
    return null;
  }

  const showGames = filter === "all" || filter === "games" || filter === "simulations";
  const showTests = filter === "all" || filter === "cognitive";
  const showChallenges = filter === "all" || filter === "challenges";

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Arena"
        subtitle="Experiências que evoluem suas skills e geram recompensas"
        icon={Gamepad2}
        actionLabel="Jogar Agora"
        actionIcon={Play}
        onAction={() => recommendedGame && setActiveExperience({ type: "game", id: recommendedGame.id })}
      />

      {/* Active Challenges Highlight */}
      {showChallenges && activeChallenges.length > 0 && (
        <ChallengesHighlight
          challenges={activeChallenges}
          onChallengeClick={(c) => {
            setSelectedChallenge(c);
            setShowChallengeDetail(true);
          }}
          onViewAllClick={() => {
            window.location.href = "/app/evolution?tab=challenges";
          }}
        />
      )}

      {/* Challenge Detail Modal */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        isOpen={showChallengeDetail}
        onClose={() => setShowChallengeDetail(false)}
        getSupporters={getSupporters}
      />

      {/* Recommended Game - Highlight */}
      {recommendedGame && (filter === "all" || filter === "games") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExperienceCard
            id={recommendedGame.id}
            type="game"
            title={recommendedGame.name}
            description={recommendedGame.description}
            icon={<recommendedGame.icon className="w-5 h-5" />}
            skills={recommendedGame.skills}
            duration={recommendedGame.duration}
            difficulty={recommendedGame.difficulty}
            xpReward={recommendedGame.xpReward}
            isNew={recommendedGame.isNew}
            isFeatured
            variant="featured"
            onClick={() => setActiveExperience({ type: "game", id: recommendedGame.id })}
          />
        </motion.div>
      )}

      {/* Cognitive Tests Section */}
      {showTests && filteredTests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-500" />
              Testes Cognitivos
            </h3>
            <Badge variant="outline" className="text-xs">
              {filteredTests.length} disponíveis
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test, index) => {
              const lastSession = getTestLastSession(test.id);
              const targetScore = 70; // Default target
              
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExperienceCard
                    id={test.id}
                    type="cognitive_test"
                    title={test.name}
                    description={test.description || "Avalie suas habilidades cognitivas"}
                    skills={[test.test_type]}
                    duration={test.time_limit_minutes ? `${test.time_limit_minutes} min` : "15 min"}
                    difficulty={test.difficulty as "easy" | "medium" | "hard"}
                    xpReward={test.xp_reward || 100}
                    targetPercent={targetScore}
                    isCompleted={!!lastSession}
                    onClick={() => setActiveExperience({ type: "cognitive_test", id: test.id })}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Info about conditional rewards */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Target className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Testes cognitivos têm <strong>recompensa condicional</strong>: 
              atinja a meta de acerto para ganhar XP. Você pode refazer os testes!
            </span>
          </div>
        </section>
      )}

      {/* CTA to Development */}
      {filter === "all" && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HubCard className="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border-blue-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quer se desenvolver melhor?</h3>
                  <p className="text-sm text-muted-foreground">Conheça as Jornadas e Treinamentos estruturados</p>
                </div>
              </div>
              <HubButton 
                onClick={() => window.location.href = "/app/development"}
                className="shrink-0"
              >
                Ver Desenvolvimento
              </HubButton>
            </div>
          </HubCard>
        </motion.section>
      )}

      {/* Games Grid */}
      {showGames && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-500" />
              {filter === "simulations" ? "Simulações" : filter === "games" ? "Jogos" : "Jogos & Simulações"}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames
              .filter(g => g.id !== recommendedGame?.id) // Exclude featured
              .map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExperienceCard
                    id={game.id}
                    type="game"
                    title={game.name}
                    description={game.description}
                    icon={<game.icon className="w-5 h-5" />}
                    skills={game.skills}
                    duration={game.duration}
                    difficulty={game.difficulty}
                    xpReward={game.xpReward}
                    isNew={game.isNew}
                    onClick={() => setActiveExperience({ type: "game", id: game.id })}
                  />
                </motion.div>
              ))}
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {(filter === "all" || filter === "games") && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Em Breve</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COMING_SOON_GAMES.map((game) => (
              <HubCard 
                key={game.id} 
                className="opacity-60 cursor-pointer hover:opacity-80"
                onClick={() => setActiveExperience({ type: "game", id: game.id })}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <game.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{game.name}</p>
                    <p className="text-xs text-muted-foreground">{game.description}</p>
                  </div>
                </div>
              </HubCard>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filter !== "all" && 
       ((filter === "cognitive" && filteredTests.length === 0) ||
        (filter === "challenges" && activeChallenges.length === 0)) && (
        <HubEmptyState
          icon={Grid3X3}
          title={`Nenhum item disponível`}
          description="Novos conteúdos serão adicionados em breve"
        />
      )}
    </div>
  );
}
