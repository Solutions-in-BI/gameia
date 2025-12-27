/**
 * Dashboard unificado - todos os elementos de jogo integrados
 * Redesign com perfil, badges, apostas, skills e jogos
 */

import { useState } from "react";
import { QuickStats } from "./QuickStats";
import { GameHub } from "./GameHub";
import { SocialHub } from "./SocialHub";
import { OrganizationCard } from "./OrganizationCard";
import { MarketplacePreview } from "./MarketplacePreview";
import { DailyRewards } from "./DailyRewards";
import { PlayerProfileCard } from "@/components/game/common/PlayerProfileCard";
import { AchievementsBadges, BadgesCarousel, Badge } from "@/components/game/common/AchievementsBadges";
import { BettingSection, Bet } from "@/components/game/bets/BettingSection";
import { SkillTree } from "@/components/game/enterprise/SkillTree";
import { useLevel } from "@/hooks/useLevel";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStreak } from "@/hooks/useStreak";
import { useFriends } from "@/hooks/useFriends";
import { useAchievements } from "@/hooks/useAchievements";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { useSkillTree } from "@/hooks/useSkillTree";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { QuizGame } from "@/components/game/quiz/QuizGame";
import { EnterpriseQuiz } from "@/components/game/enterprise/EnterpriseQuiz";
import { MarketplacePage } from "@/components/game/marketplace/MarketplacePage";
import { FriendsPage } from "@/components/game/friends/FriendsPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Trophy, 
  Ticket, 
  Target, 
  Gamepad2, 
  Store, 
  Crown 
} from "lucide-react";

type ActiveView = "dashboard" | "snake" | "memory" | "tetris" | "dino" | "quiz" | "decisions" | "marketplace" | "friends" | "organization" | "escape" | "projects" | "brainstorm" | "leader";

export function UnifiedDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { profile } = useAuth();
  const { level, xp, progress } = useLevel();
  const { coins, items, purchaseItem, refresh: refreshMarketplace } = useMarketplace();
  const { streak, canClaimToday, isAtRisk, claimDailyReward, getTodayReward } = useStreak();
  const { friends, pendingGifts, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, acceptGift, rejectGift } = useFriends();
  const { getProgress, stats, unlockedAchievements } = useAchievements();
  const { currentOrg, members, challenges, isAdmin, completeChallenge, refresh: refreshOrg } = useOrganization();
  const { skills, unlockSkill } = useSkillTree();

  const achievementProgress = getProgress();
  const pendingRequests = friends.filter(f => f.status === "pending" && !f.isRequester);
  
  // Calculate XP to next level
  const xpToNextLevel = 1000 * level;

  // Convert achievements to badges format
  const badges: Badge[] = unlockedAchievements?.map(a => ({
    id: a.achievementId,
    name: a.achievementId,
    icon: "🏆",
    rarity: "common" as Badge["rarity"],
    isUnlocked: true,
    unlockedAt: a.unlockedAt,
  })) || [];

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
  if (activeView === "snake") return <SnakeGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "memory") return <MemoryGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "tetris") return <TetrisGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "dino") return <DinoGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "quiz") return <QuizGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "decisions") return <EnterpriseQuiz onBack={() => setActiveView("dashboard")} />;
  if (activeView === "marketplace") return <MarketplacePage onBack={() => setActiveView("dashboard")} />;
  if (activeView === "friends") return <FriendsPage isOpen={true} onClose={() => setActiveView("dashboard")} />;

  // Placeholder for unimplemented games
  const handleSelectGame = (game: string) => {
    const validViews = ["snake", "memory", "tetris", "dino", "quiz", "decisions", "marketplace", "friends"];
    if (validViews.includes(game)) {
      setActiveView(game as ActiveView);
    } else {
      // Show coming soon or redirect to quiz/decisions for enterprise games
      setActiveView("quiz");
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start gap-1 bg-card/50 border border-border/30 p-1 rounded-xl overflow-x-auto">
          <TabsTrigger value="dashboard" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Jogos</span>
          </TabsTrigger>
          <TabsTrigger value="bets" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Apostas</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Loja</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Ranking</span>
          </TabsTrigger>
        </TabsList>

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
              streak={streak.currentStreak}
              ranking={5}
              badges={achievementProgress.unlocked}
              title={profile?.selected_title || undefined}
            />
            
            <BadgesCarousel
              badges={badges.slice(0, 6)}
              title="Conquistas"
            />
          </div>

          {/* Game Hub */}
          <GameHub
            stats={stats as any}
            onSelectGame={handleSelectGame}
          />
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <AchievementsBadges badges={badges} />
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="mt-6">
          <GameHub
            stats={stats as any}
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

        {/* Store Tab */}
        <TabsContent value="store" className="mt-6">
          <MarketplacePreview
            items={items}
            coins={coins}
            onPurchase={purchaseItem}
            onViewAll={() => setActiveView("marketplace")}
          />
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

      {/* Daily Rewards - Always visible */}
      <DailyRewards
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        canClaim={canClaimToday}
        isAtRisk={isAtRisk}
        todayReward={getTodayReward()}
        onClaim={claimDailyReward}
      />
    </div>
  );
}
