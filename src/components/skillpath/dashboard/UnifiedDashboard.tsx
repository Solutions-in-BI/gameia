/**
 * Dashboard unificado - todos os elementos de jogo integrados
 */

import { useState } from "react";
import { QuickStats } from "./QuickStats";
import { GameHub } from "./GameHub";
import { SocialHub } from "./SocialHub";
import { OrganizationCard } from "./OrganizationCard";
import { MarketplacePreview } from "./MarketplacePreview";
import { DailyRewards } from "./DailyRewards";
import { useLevel } from "@/hooks/useLevel";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStreak } from "@/hooks/useStreak";
import { useFriends } from "@/hooks/useFriends";
import { useAchievements } from "@/hooks/useAchievements";
import { useOrganization } from "@/hooks/useOrganization";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { QuizGame } from "@/components/game/quiz/QuizGame";
import { EnterpriseQuiz } from "@/components/game/enterprise/EnterpriseQuiz";
import { MarketplacePage } from "@/components/game/marketplace/MarketplacePage";
import { FriendsPage } from "@/components/game/friends/FriendsPage";

type ActiveView = "dashboard" | "snake" | "memory" | "tetris" | "dino" | "quiz" | "decisions" | "marketplace" | "friends" | "organization";

export function UnifiedDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  
  const { level, xp, progress } = useLevel();
  const { coins, items, purchaseItem, refresh: refreshMarketplace } = useMarketplace();
  const { streak, canClaimToday, isAtRisk, claimDailyReward, getTodayReward } = useStreak();
  const { friends, pendingGifts, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, acceptGift, rejectGift } = useFriends();
  const { getProgress, stats } = useAchievements();
  const { currentOrg, members, challenges, isAdmin, createOrganization, joinOrganization, completeChallenge } = useOrganization();

  const achievementProgress = getProgress();
  const pendingRequests = friends.filter(f => f.status === "pending" && !f.isRequester);

  // Render game or sub-page
  if (activeView === "snake") return <SnakeGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "memory") return <MemoryGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "tetris") return <TetrisGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "dino") return <DinoGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "quiz") return <QuizGame onBack={() => setActiveView("dashboard")} />;
  if (activeView === "decisions") return <EnterpriseQuiz onBack={() => setActiveView("dashboard")} />;
  if (activeView === "marketplace") return <MarketplacePage onBack={() => setActiveView("dashboard")} />;
  if (activeView === "friends") return <FriendsPage isOpen={true} onClose={() => setActiveView("dashboard")} />;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats
        level={level}
        xp={xp}
        xpProgress={progress}
        coins={coins}
        streak={streak.currentStreak}
        achievements={achievementProgress.unlocked}
        totalAchievements={achievementProgress.total}
      />

      {/* Daily Rewards */}
      <DailyRewards
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        canClaim={canClaimToday}
        isAtRisk={isAtRisk}
        todayReward={getTodayReward()}
        onClaim={claimDailyReward}
      />

      {/* Organization */}
      <OrganizationCard
        organization={currentOrg}
        members={members}
        challenges={challenges}
        isAdmin={isAdmin}
        onCreateOrg={createOrganization}
        onJoinOrg={joinOrganization}
        onCompleteChallenge={completeChallenge}
        onViewAll={() => setActiveView("organization")}
      />

      {/* Game Hub */}
      <GameHub
        stats={stats as any}
        onSelectGame={(game) => setActiveView(game as ActiveView)}
      />

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

      {/* Marketplace Preview */}
      <MarketplacePreview
        items={items}
        coins={coins}
        onPurchase={purchaseItem}
        onViewAll={() => setActiveView("marketplace")}
      />
    </div>
  );
}
