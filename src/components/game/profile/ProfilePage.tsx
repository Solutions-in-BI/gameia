import { useState } from "react";
import { ArrowLeft, Trophy, Award } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { AchievementsList } from "../common/AchievementsList";
import { LeaderboardTable } from "../common/LeaderboardTable";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { ACHIEVEMENTS_BY_CATEGORY } from "@/constants/achievements";
import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: ProfilePage
 * ===========================================
 * 
 * Página que mostra conquistas e ranking do jogador.
 */

interface ProfilePageProps {
  onBack: () => void;
}

type Tab = "achievements" | "leaderboard";
type LeaderboardGame = "snake" | "memory" | "dino";

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("achievements");
  const [leaderboardGame, setLeaderboardGame] = useState<LeaderboardGame>("snake");
  
  const { getAchievementsWithStatus, getProgress } = useAchievements();
  const { entries, isLoading } = useLeaderboard(leaderboardGame);
  
  const achievements = getAchievementsWithStatus();
  const progress = getProgress();

  return (
    <GameLayout title="Perfil" subtitle="Suas conquistas e ranking">
      {/* Botão Voltar */}
      <GameButton variant="muted" icon={ArrowLeft} onClick={onBack} className="mb-6">
        Voltar ao Menu
      </GameButton>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("achievements")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
            activeTab === "achievements"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Award className="w-5 h-5" />
          Conquistas
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
            activeTab === "leaderboard"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Trophy className="w-5 h-5" />
          Ranking
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "achievements" ? (
        <div className="space-y-6">
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Seletor de Jogo */}
          <div className="flex gap-2">
            <button
              onClick={() => setLeaderboardGame("snake")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border transition-all text-sm",
                leaderboardGame === "snake"
                  ? "bg-secondary/20 border-secondary text-secondary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              🐍 Snake
            </button>
            <button
              onClick={() => setLeaderboardGame("memory")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border transition-all text-sm",
                leaderboardGame === "memory"
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              🧠 Memória
            </button>
            <button
              onClick={() => setLeaderboardGame("dino")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border transition-all text-sm",
                leaderboardGame === "dino"
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              🦖 Dino
            </button>
          </div>

          {/* Tabela de Ranking */}
          <LeaderboardTable
            entries={entries}
            isLoading={isLoading}
            gameType={leaderboardGame}
          />
        </div>
      )}
    </GameLayout>
  );
}
