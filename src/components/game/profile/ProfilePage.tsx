/**
 * ProfilePage - Página de perfil do usuário
 * 
 * Refatorada em componentes menores para melhor manutenção.
 */

import { useState, useEffect } from "react";
import { Trophy, Award, User, Crown, Medal, Star, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { AchievementsList } from "../common/AchievementsList";
import { LeaderboardTable } from "../common/LeaderboardTable";
import { TitlesSelector, CurrentTitleBadge } from "../common/TitlesSelector";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useTitles } from "@/hooks/useTitles";
import { useLevel } from "@/hooks/useLevel";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePageProps {
  onBack: () => void;
  onOpenMarketplace: () => void;
}

type Tab = "profile" | "achievements" | "leaderboard" | "titles";
type LeaderboardGame = "snake" | "memory" | "dino" | "tetris";

export function ProfilePage({ onBack, onOpenMarketplace }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [leaderboardGame, setLeaderboardGame] = useState<LeaderboardGame>("snake");
  const [topRanks, setTopRanks] = useState<Record<string, number>>({});
  
  const { getAchievementsWithStatus, getProgress, stats } = useAchievements();
  const { entries, userRank, isLoading, refresh } = useLeaderboard(leaderboardGame);
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { coins, getEquippedItem } = useMarketplace();
  const { getAllTitlesWithStatus, selectedTitle, selectTitle, checkAndUnlockTitles } = useTitles();
  const { level, xp } = useLevel();
  
  const achievements = getAchievementsWithStatus();
  const progress = getProgress();
  const allTitles = getAllTitlesWithStatus();
  
  const equippedAvatar = getEquippedItem("avatar");
  const equippedFrame = getEquippedItem("frame");

  // Busca posição do usuário em todos os rankings e verifica títulos
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTopRanks = async () => {
      const games = ["snake", "dino", "tetris", "memory"];
      const ranks: Record<string, number> = {};
      
      for (const game of games) {
        const { data } = await supabase
          .from("leaderboard")
          .select("user_id")
          .eq("game_type", game)
          .order("score", { ascending: game === "memory" })
          .limit(3);
        
        if (data) {
          const position = data.findIndex(e => e.user_id === user.id) + 1;
          if (position > 0 && position <= 3) {
            ranks[game] = position;
          }
        }
      }
      setTopRanks(ranks);

      // Verifica novos títulos
      checkAndUnlockTitles({
        totalGames: stats.totalGamesPlayed,
        snakeScore: stats.snakeBestScore,
        dinoScore: stats.dinoBestScore,
        tetrisScore: stats.tetrisBestScore,
        memoryGames: stats.memoryGamesPlayed,
        achievementsCount: progress.unlocked,
        topRanks: ranks,
      });
    };
    
    fetchTopRanks();
  }, [user?.id, stats, progress.unlocked]);

  // Atualiza ranking quando muda o jogo
  useEffect(() => {
    if (profile?.id) {
      refresh(profile.id);
    }
  }, [profile?.id, leaderboardGame, refresh]);

  const handleLogout = async () => {
    await signOut();
    onBack();
  };

  // Tabs disponíveis
  const tabs = [
    { id: "profile" as const, icon: User, label: "Perfil" },
    { id: "titles" as const, icon: BadgeCheck, label: "Títulos" },
    { id: "achievements" as const, icon: Award, label: "Conquistas" },
    { id: "leaderboard" as const, icon: Trophy, label: "Ranking" },
  ];

  return (
    <GameLayout title="Perfil" subtitle="Suas conquistas e ranking" onBack={onBack}>
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 font-medium transition-all text-sm",
              activeTab === tab.id
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "profile" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <ProfileHeader 
            profile={profile}
            user={user}
            coins={coins}
            level={level}
            xp={xp}
            topRanks={topRanks}
            selectedTitle={selectedTitle}
            equippedAvatar={equippedAvatar}
            equippedFrame={equippedFrame}
            onOpenMarketplace={onOpenMarketplace}
            onRefreshProfile={refreshProfile}
          />

          <ProfileStats stats={stats} progress={progress} />

          {/* Ações */}
          <div className="flex gap-3">
            <GameButton variant="destructive" onClick={handleLogout} fullWidth>
              Sair da Conta
            </GameButton>
          </div>
        </motion.div>
      )}

      {activeTab === "titles" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Título Atual */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Título Atual</h3>
            {selectedTitle ? (
              <div className="flex items-center gap-3">
                <CurrentTitleBadge title={selectedTitle} size="lg" />
                <button
                  onClick={() => selectTitle(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Remover
                </button>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum título selecionado</p>
            )}
          </div>

          {/* Progresso */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Títulos Desbloqueados</span>
              <span className="text-sm font-medium text-foreground">
                {allTitles.filter(t => t.isUnlocked).length}/{allTitles.length}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${(allTitles.filter(t => t.isUnlocked).length / allTitles.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Seletor de Títulos */}
          <TitlesSelector
            titles={allTitles}
            selectedTitleId={profile?.selected_title || null}
            onSelect={selectTitle}
          />
        </motion.div>
      )}

      {activeTab === "achievements" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Progresso Geral */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-sm font-medium text-foreground">
                {progress.unlocked}/{progress.total}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Conquistas por Categoria */}
          <AchievementsList
            title="🎮 Geral"
            achievements={achievements.filter(a => a.category === "general")}
          />
          <AchievementsList
            title="🧠 Jogo da Memória"
            achievements={achievements.filter(a => a.category === "memory")}
          />
          <AchievementsList
            title="🐍 Snake"
            achievements={achievements.filter(a => a.category === "snake")}
          />
          <AchievementsList
            title="🦖 Dino Runner"
            achievements={achievements.filter(a => a.category === "dino")}
          />
          <AchievementsList
            title="🧱 Tetris"
            achievements={achievements.filter(a => a.category === "tetris")}
          />
        </motion.div>
      )}

      {activeTab === "leaderboard" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Seletor de Jogo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["snake", "memory", "dino", "tetris"] as LeaderboardGame[]).map((game) => (
              <button
                key={game}
                onClick={() => setLeaderboardGame(game)}
                className={cn(
                  "py-2 px-3 rounded-xl border-2 transition-all text-sm font-medium",
                  leaderboardGame === game
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {game === "snake" && "🐍 Snake"}
                {game === "memory" && "🧠 Memória"}
                {game === "dino" && "🦖 Dino"}
                {game === "tetris" && "🧱 Tetris"}
              </button>
            ))}
          </div>

          {/* Tabela de Ranking */}
          <LeaderboardTable
            entries={entries}
            isLoading={isLoading}
            gameType={leaderboardGame}
            userRank={userRank}
          />
        </motion.div>
      )}
    </GameLayout>
  );
}
