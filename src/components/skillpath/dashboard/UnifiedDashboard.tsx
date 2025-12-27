/**
 * Dashboard unificado - todos os elementos de jogo integrados
 * Redesign com perfil, trilhas, apostas, skills e jogos
 * 
 * NOTA: Conquistas de jogos recreativos foram removidas.
 * Agora usamos sistema de Trilhas com Insígnias empresariais.
 */

import { useState } from "react";
import { QuickStats } from "./QuickStats";
import { GameHub } from "./GameHub";
import { SocialHub } from "./SocialHub";
import { OrganizationCard } from "./OrganizationCard";
import { DailyRewards } from "./DailyRewards";
import { PlayerProfileCard } from "@/components/game/common/PlayerProfileCard";
import { BadgesCarousel, Badge } from "@/components/game/common/AchievementsBadges";
import { BettingSection, Bet } from "@/components/game/bets/BettingSection";
import { SkillTree } from "@/components/game/enterprise/SkillTree";
import { TrailsPage } from "@/components/game/trails/TrailsPage";
import { useLevel } from "@/hooks/useLevel";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStreak } from "@/hooks/useStreak";
import { useFriends } from "@/hooks/useFriends";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { useSkillTree } from "@/hooks/useSkillTree";
import { useTrails } from "@/hooks/useTrails";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { QuizMasterGame } from "@/components/game/enterprise/QuizMasterGame";
import { DecisionGame } from "@/components/game/enterprise/DecisionGame";
import { AIScenarioGame } from "@/components/game/enterprise/AIScenarioGame";
import { SalesGame } from "@/components/game/sales/SalesGame";
import { ComingSoonGame } from "@/components/game/enterprise/ComingSoonGame";
import { MarketplacePage } from "@/components/game/marketplace/MarketplacePage";
import { Puzzle, Car, Lightbulb, Target as TargetIcon } from "lucide-react";
import { FriendsPage } from "@/components/game/friends/FriendsPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Trophy, 
  Ticket, 
  Gamepad2, 
  Store, 
  Crown 
} from "lucide-react";

import type { DashboardTab } from "../layout/AppShell";

type ActiveView = "dashboard" | "snake" | "memory" | "tetris" | "dino" | "quiz" | "decisions" | "sales" | "ai-game" | "friends" | "organization" | "escape" | "projects" | "brainstorm" | "leader";

interface UnifiedDashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

export function UnifiedDashboard({ activeTab = "dashboard", onTabChange }: UnifiedDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  
  const { profile } = useAuth();
  const { level, xp, progress } = useLevel();
  const { coins, items, purchaseItem, refresh: refreshMarketplace } = useMarketplace();
  const { streak, canClaimToday, isAtRisk, claimDailyReward, getTodayReward } = useStreak();
  const { friends, pendingGifts, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, acceptGift, rejectGift } = useFriends();
  const { currentOrg, members, challenges, isAdmin, completeChallenge, refresh: refreshOrg } = useOrganization();
  const { skills, unlockSkill } = useSkillTree();
  const { trails, isTrailCompleted, getOverallStats } = useTrails();

  const pendingRequests = friends.filter(f => f.status === "pending" && !f.isRequester);
  const trailStats = getOverallStats();
  
  // Calculate XP to next level
  const xpToNextLevel = 1000 * level;

  // Convert completed trails to badges format for display
  const trailBadges: Badge[] = trails
    .filter(t => isTrailCompleted(t.id))
    .map(t => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      rarity: (t.difficulty === "expert" ? "legendary" : t.difficulty === "advanced" ? "epic" : t.difficulty === "intermediate" ? "rare" : "common") as Badge["rarity"],
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
    }));

  // Mock bets data - in production, this would come from the database
  const mockBets: Bet[] = currentOrg ? [
    {
      id: "1",
      title: "Meta de Vendas Q4",
      description: "A equipe de vendas vai bater a meta de R$1M este trimestre?",
      type: "prediction",
      participants: 45,
      daysLeft: 15,
      oddsFor: 1.80,
      oddsAgainst: 2.20,
      minBet: 100,
      maxBet: 5000,
      isActive: true,
    },
    {
      id: "2",
      title: "Desafio de Produtividade",
      description: "Quem terminar mais tarefas esta semana leva o prêmio",
      type: "challenge",
      participants: 28,
      daysLeft: 5,
      oddsFor: 1.50,
      oddsAgainst: 2.80,
      minBet: 50,
      maxBet: 2000,
      isActive: true,
    },
  ] : [];

  // Render game or sub-page
  // Casual games
  if (activeView === "snake") return <SnakeGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "memory") return <MemoryGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "tetris") return <TetrisGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "dino") return <DinoGame onBack={() => setActiveView("dashboard")} />;
  
  // Enterprise games - independent focused games
  if (activeView === "quiz") return <QuizMasterGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "decisions") return <DecisionGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "sales") return <SalesGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "ai-game") return <AIScenarioGame onBack={() => setActiveView("dashboard")} />;
  
  // Coming soon games
  if (activeView === "escape") return <ComingSoonGame onBack={() => setActiveView("dashboard")} gameName="Escape Room Virtual" gameIcon={<Puzzle className="w-12 h-12" />} description="Resolva enigmas em equipe para escapar antes do tempo acabar" expectedFeatures={["Puzzles colaborativos", "Chat em tempo real", "Rankings de equipe", "Múltiplas salas temáticas"]} />;
  if (activeView === "projects") return <ComingSoonGame onBack={() => setActiveView("dashboard")} gameName="Corrida de Projetos" gameIcon={<Car className="w-12 h-12" />} description="Gerencie recursos e complete o projeto antes da concorrência" expectedFeatures={["Gestão de recursos", "Simulação de projetos reais", "Competição multiplayer", "Métricas de desempenho"]} />;
  if (activeView === "brainstorm") return <ComingSoonGame onBack={() => setActiveView("dashboard")} gameName="Brainstorm Battle" gameIcon={<Lightbulb className="w-12 h-12" />} description="Competição de ideias criativas com votação em tempo real" expectedFeatures={["Geração de ideias em tempo real", "Votação democrática", "Premiação por criatividade", "Histórico de melhores ideias"]} />;
  if (activeView === "leader") return <ComingSoonGame onBack={() => setActiveView("dashboard")} gameName="Líder Supremo" gameIcon={<TargetIcon className="w-12 h-12" />} description="Simulador de liderança com desafios de gestão de equipe" expectedFeatures={["Simulação realista de gestão", "Feedback 360°", "Cenários adaptativos", "Perfil de liderança"]} />;
  
  if (activeView === "friends") return <FriendsPage isOpen={true} onClose={() => setActiveView("dashboard")} />;

  // Handle game selection - all games now have proper views
  const handleSelectGame = (game: string) => {
    const validViews: ActiveView[] = ["snake", "memory", "tetris", "dino", "quiz", "decisions", "sales", "ai-game", "friends", "escape", "projects", "brainstorm", "leader"];
    if (validViews.includes(game as ActiveView)) {
      setActiveView(game as ActiveView);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs - controlled by parent AppShell */}
      <Tabs value={activeTab} onValueChange={(value) => onTabChange?.(value as DashboardTab)} className="w-full">
        {/* TabsList removed - now in AppShell header */}

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Profile + Badges Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlayerProfileCard
              nickname={profile?.nickname || "Jogador"}
              avatarUrl={profile?.avatar_url}
              level={level}
              xp={xp}
              xpToNextLevel={xpToNextLevel}
              xpProgress={progress}
              coins={coins}
              ranking={5}
              badges={trailStats.completedTrails}
              title={profile?.selected_title || undefined}
            />
            
            <BadgesCarousel
              badges={trailBadges.slice(0, 6)}
              title="Insígnias de Trilhas"
            />
          </div>

          {/* Game Hub */}
          <GameHub
            onSelectGame={handleSelectGame}
          />
        </TabsContent>

        {/* Badges Tab - Now shows Trails with Badges */}
        <TabsContent value="badges" className="mt-6">
          <TrailsPage />
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="mt-6">
          <GameHub
            onSelectGame={handleSelectGame}
          />
        </TabsContent>

        {/* Bets Tab */}
        <TabsContent value="bets" className="mt-6">
          <BettingSection
            bets={mockBets}
            userCoins={coins}
            isAdmin={isAdmin}
            onPlaceBet={async (betId, side, amount) => {
              console.log("Placing bet:", { betId, side, amount });
            }}
            onCreateBet={isAdmin ? async (bet) => {
              console.log("Creating bet:", bet);
            } : undefined}
          />
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <SkillTree
            skills={skills}
            onSkillClick={(skill) => {
              if (!skill.isUnlocked) {
                unlockSkill(skill.id);
              }
            }}
          />
        </TabsContent>

        {/* Store Tab - Opens Marketplace directly */}
        <TabsContent value="store" className="mt-6">
          <MarketplacePage onBack={() => onTabChange?.("dashboard")} />
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="mt-6">
          <div className="space-y-6">
            {/* Organization Ranking */}
            {currentOrg && (
              <OrganizationCard
                organization={currentOrg}
                members={members}
                challenges={challenges}
                isAdmin={isAdmin}
                onCompleteChallenge={completeChallenge}
                onViewAll={() => setActiveView("organization")}
                onRefresh={refreshOrg}
              />
            )}

            {/* Social Hub */}
            <SocialHub
              friends={friends}
              pendingRequests={pendingRequests}
              pendingGifts={pendingGifts}
              onSendRequest={sendFriendRequest}
              onAcceptRequest={acceptFriendRequest}
              onRejectRequest={rejectFriendRequest}
              onAcceptGift={acceptGift}
              onRejectGift={rejectGift}
              onViewFriends={() => setActiveView("friends")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
