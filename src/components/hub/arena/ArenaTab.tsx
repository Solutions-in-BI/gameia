/**
 * ArenaTab - Hub de Experiências
 * Jogos, Desafios, Treinamentos, Testes Cognitivos e Simulações
 * "Arena é onde acontecem todas as experiências que geram XP/moedas"
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Zap,
  Brain,
  MessageSquare,
  Sparkles,
  Play,
  Star,
  Filter,
  Grid3X3,
  Puzzle,
  Car,
  Lightbulb,
  Target,
  GraduationCap,
  Clock,
} from "lucide-react";
import { HubCard, HubEmptyState, HubButton, HubHeader } from "../common";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { useOrganization } from "@/hooks/useOrganization";
import { useTrainings } from "@/hooks/useTrainings";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { useTrainingJourneys } from "@/hooks/useTrainingJourneys";
import { ChallengesHighlight, ChallengeDetailModal } from "@/components/challenges";
import { ExperienceCard } from "@/components/arena/ExperienceCard";
import { JourneyCard } from "@/components/arena/JourneyCard";
import { RewardBadge } from "@/components/rewards/RewardBadge";

// Games
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { QuizMasterGame } from "@/components/game/enterprise/QuizMasterGame";
import { DecisionGame } from "@/components/game/enterprise/DecisionGame";
import { AIScenarioGame } from "@/components/game/enterprise/AIScenarioGame";
import { SalesGame } from "@/components/game/sales/SalesGame";
import { ComingSoonGame } from "@/components/game/enterprise/ComingSoonGame";
import { CognitiveTestPlayer } from "@/components/game/development/CognitiveTestPlayer";

// Types
import { Route } from "lucide-react";

type ArenaFilter = "all" | "games" | "challenges" | "trainings" | "journeys" | "cognitive" | "simulations";
type ActiveExperience = { type: string; id: string } | null;

const ARENA_FILTERS: { id: ArenaFilter; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "Todos", icon: Grid3X3 },
  { id: "games", label: "Jogos", icon: Gamepad2 },
  { id: "challenges", label: "Desafios", icon: Target },
  { id: "trainings", label: "Treinamentos", icon: GraduationCap },
  { id: "journeys", label: "Jornadas", icon: Route },
  { id: "cognitive", label: "Testes", icon: Brain },
  { id: "simulations", label: "Simulações", icon: MessageSquare },
];

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
  {
    id: "memory",
    name: "Jogo da Memória",
    description: "Treine sua memória encontrando pares",
    icon: Grid3X3,
    category: "games",
    skills: ["Memória", "Concentração"],
    xpReward: 25,
    difficulty: "easy",
    duration: "3-5 min",
  },
  {
    id: "snake",
    name: "Snake Game",
    description: "Clássico jogo da cobrinha",
    icon: Gamepad2,
    category: "games",
    skills: ["Reflexos", "Coordenação"],
    xpReward: 20,
    difficulty: "medium",
    duration: "5 min",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Encaixe as peças e faça linhas",
    icon: Puzzle,
    category: "games",
    skills: ["Raciocínio Espacial", "Velocidade"],
    xpReward: 30,
    difficulty: "medium",
    duration: "5-10 min",
  },
  {
    id: "dino",
    name: "Dino Run",
    description: "Pule os obstáculos e sobreviva",
    icon: Zap,
    category: "games",
    skills: ["Reflexos", "Timing"],
    xpReward: 15,
    difficulty: "easy",
    duration: "2-5 min",
  },
];

const COMING_SOON_GAMES = [
  { id: "escape", name: "Escape Room Virtual", icon: Puzzle, description: "Resolva enigmas em equipe" },
  { id: "projects", name: "Corrida de Projetos", icon: Car, description: "Gerencie recursos e complete projetos" },
  { id: "brainstorm", name: "Brainstorm Battle", icon: Lightbulb, description: "Competição de ideias criativas" },
];

export function ArenaTab() {
  const [filter, setFilter] = useState<ArenaFilter>("all");
  const [activeExperience, setActiveExperience] = useState<ActiveExperience>(null);
  const { skills } = useSkillProgress();
  
  // Data hooks
  const { currentOrg } = useOrganization();
  const { activeChallenges, getSupporters } = useChallenges(currentOrg?.id);
  const { trainings, getTrainingProgress } = useTrainings(currentOrg?.id);
  const { tests, mySessions } = useCognitiveTests();
  const { journeys, userProgress: journeyUserProgress, getCompletionPercentage } = useTrainingJourneys(currentOrg?.id);
  
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

  const filteredTrainings = trainings.filter(t => 
    filter === "all" || filter === "trainings"
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
        case "snake": return <SnakeGame onBack={handleBack} />;
        case "memory": return <MemoryGame onBack={handleBack} />;
        case "tetris": return <TetrisGame onBack={handleBack} />;
        case "dino": return <DinoGame onBack={handleBack} />;
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
  const showTrainings = filter === "all" || filter === "trainings";
  const showJourneys = filter === "all" || filter === "journeys";
  const showTests = filter === "all" || filter === "cognitive";
  const showChallenges = filter === "all" || filter === "challenges";

  // Filter active journeys
  const activeJourneys = journeys.filter(j => j.is_active);

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

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ArenaFilter)} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/40 p-1 h-auto">
          {ARENA_FILTERS.map(f => (
            <TabsTrigger
              key={f.id}
              value={f.id}
              className="flex items-center gap-1.5 px-4 py-2 data-[state=active]:bg-background whitespace-nowrap"
            >
              <f.icon className="w-4 h-4" />
              <span>{f.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active Challenges Highlight */}
      {showChallenges && activeChallenges.length > 0 && (
        <ChallengesHighlight
          challenges={activeChallenges}
          onChallengeClick={(c) => {
            setSelectedChallenge(c);
            setShowChallengeDetail(true);
          }}
          onViewAllClick={() => {
            window.location.href = "/app/evolution";
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

      {/* Trainings Section */}
      {showTrainings && filteredTrainings.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Treinamentos
            </h3>
            <Badge variant="outline" className="text-xs">
              {filteredTrainings.length} disponíveis
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainings.slice(0, 6).map((training, index) => {
              const progress = getTrainingProgress(training.id);
              
              return (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExperienceCard
                    id={training.id}
                    type="training"
                    title={training.name}
                    description={training.description || "Desenvolva novas competências"}
                    thumbnail={training.thumbnail_url || undefined}
                    skills={[training.category || "Desenvolvimento"]}
                    duration={training.estimated_hours ? `${training.estimated_hours}h` : undefined}
                    difficulty={(training.difficulty as "easy" | "medium" | "hard") || "medium"}
                    xpReward={training.xp_reward || 100}
                    coinsReward={training.coins_reward || 50}
                    progress={progress?.progress_percent}
                    isCompleted={progress?.progress_percent === 100}
                    onClick={() => setActiveExperience({ type: "training", id: training.id })}
                  />
                </motion.div>
              );
            })}
          </div>

          {filteredTrainings.length > 6 && (
            <div className="text-center">
              <HubButton
                variant="outline"
                onClick={() => window.location.href = "/app/trainings"}
              >
                Ver todos os treinamentos ({filteredTrainings.length})
              </HubButton>
            </div>
          )}
        </section>
      )}

      {/* Journeys Section */}
      {showJourneys && activeJourneys.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Jornadas de Treinamento
            </h3>
            <Badge variant="outline" className="text-xs">
              {activeJourneys.length} disponíveis
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeJourneys.slice(0, 6).map((journey, index) => {
              const progress = getCompletionPercentage(journey.id);
              const userJourneyProgress = journeyUserProgress.find(p => p.journey_id === journey.id);
              const isStarted = !!userJourneyProgress;
              const isCompleted = userJourneyProgress?.status === 'completed';
              
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JourneyCard
                    id={journey.id}
                    name={journey.name}
                    description={journey.description || undefined}
                    category={journey.category || "geral"}
                    level={journey.level || "Iniciante"}
                    trainingsCount={journey.total_trainings || 0}
                    completedTrainings={userJourneyProgress?.trainings_completed || 0}
                    progress={progress}
                    xpReward={journey.bonus_xp || 0}
                    coinsReward={journey.bonus_coins || 0}
                    hasCertificate={journey.generates_certificate || false}
                    hasInsignia={!!journey.bonus_insignia_id}
                    estimatedHours={journey.total_estimated_hours || undefined}
                    thumbnail={journey.thumbnail_url || undefined}
                    isStarted={isStarted}
                    isCompleted={isCompleted}
                    isFeatured={false}
                    onClick={() => window.location.href = `/app/journeys/${journey.id}`}
                  />
                </motion.div>
              );
            })}
          </div>

          {activeJourneys.length > 6 && (
            <div className="text-center">
              <HubButton
                variant="outline"
                onClick={() => window.location.href = "/app/journeys"}
              >
                Ver todas as jornadas ({activeJourneys.length})
              </HubButton>
            </div>
          )}
        </section>
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
       ((filter === "trainings" && filteredTrainings.length === 0) ||
        (filter === "cognitive" && filteredTests.length === 0) ||
        (filter === "challenges" && activeChallenges.length === 0) ||
        (filter === "journeys" && activeJourneys.length === 0)) && (
        <HubEmptyState
          icon={Grid3X3}
          title={`Nenhum item em "${ARENA_FILTERS.find(f => f.id === filter)?.label}"`}
          description="Novos conteúdos serão adicionados em breve"
        />
      )}
    </div>
  );
}
