import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Award, User, Camera, Edit2, Crown, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { AchievementsList } from "../common/AchievementsList";
import { LeaderboardTable } from "../common/LeaderboardTable";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePageProps {
  onBack: () => void;
}

type Tab = "profile" | "achievements" | "leaderboard";
type LeaderboardGame = "snake" | "memory" | "dino" | "tetris";

// Avatares especiais para top 3
const TOP_AVATARS = [
  { position: 1, icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Campeão" },
  { position: 2, icon: Medal, color: "text-gray-400", bg: "bg-gray-400/20", label: "Vice" },
  { position: 3, icon: Star, color: "text-amber-600", bg: "bg-amber-600/20", label: "Bronze" },
];

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [leaderboardGame, setLeaderboardGame] = useState<LeaderboardGame>("snake");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [topRanks, setTopRanks] = useState<Record<string, number>>({});
  
  const { getAchievementsWithStatus, getProgress, stats } = useAchievements();
  const { entries, userRank, isLoading, refresh } = useLeaderboard(leaderboardGame);
  const { profile, user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  
  const achievements = getAchievementsWithStatus();
  const progress = getProgress();

  // Busca posição do usuário em todos os rankings
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
    };
    
    fetchTopRanks();
  }, [user?.id]);

  // Atualiza ranking com userId quando profile muda
  useEffect(() => {
    if (profile?.id) {
      refresh(profile.id);
    }
  }, [profile?.id, leaderboardGame, refresh]);

  const handleUpdateNickname = async () => {
    if (!newNickname.trim() || newNickname.length < 2 || newNickname.length > 20) {
      toast({ title: "Apelido inválido", description: "Deve ter entre 2 e 20 caracteres", variant: "destructive" });
      return;
    }
    
    const { error } = await updateProfile({ nickname: newNickname.trim() });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o apelido", variant: "destructive" });
    } else {
      toast({ title: "Atualizado!", description: "Seu apelido foi alterado" });
      setIsEditingNickname(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onBack();
  };

  // Verifica se usuário tem badges do top 3
  const getTopBadges = () => {
    return Object.entries(topRanks).map(([game, position]) => {
      const avatar = TOP_AVATARS.find(a => a.position === position);
      if (!avatar) return null;
      const Icon = avatar.icon;
      const gameNames: Record<string, string> = {
        snake: "Snake",
        dino: "Dino",
        tetris: "Tetris",
        memory: "Memória"
      };
      return { game, position, ...avatar, gameName: gameNames[game], Icon };
    }).filter(Boolean);
  };

  const topBadges = getTopBadges();

  return (
    <GameLayout title="Perfil" subtitle="Suas conquistas e ranking">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all",
            activeTab === "profile"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <User className="w-5 h-5" />
          Perfil
        </button>
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
      {activeTab === "profile" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Card do Perfil */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-primary-foreground">
                  {profile?.nickname?.charAt(0).toUpperCase() || "?"}
                </div>
                {topBadges.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-border">
                    {(() => {
                      const best = topBadges.sort((a, b) => (a?.position || 4) - (b?.position || 4))[0];
                      if (!best) return null;
                      const Icon = best.Icon;
                      return <Icon className={cn("w-5 h-5", best.color)} />;
                    })()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                {isEditingNickname ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder="Novo apelido"
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      maxLength={20}
                      autoFocus
                    />
                    <GameButton variant="primary" size="sm" onClick={handleUpdateNickname}>
                      Salvar
                    </GameButton>
                    <GameButton variant="muted" size="sm" onClick={() => setIsEditingNickname(false)}>
                      Cancelar
                    </GameButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground">{profile?.nickname || "Jogador"}</h2>
                    <button 
                      onClick={() => {
                        setNewNickname(profile?.nickname || "");
                        setIsEditingNickname(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Badges do Top 3 */}
          {topBadges.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">🏆 Emblemas Especiais</h3>
              <div className="flex flex-wrap gap-3">
                {topBadges.map((badge) => {
                  if (!badge) return null;
                  const Icon = badge.Icon;
                  return (
                    <div 
                      key={badge.game}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", badge.bg)}
                    >
                      <Icon className={cn("w-5 h-5", badge.color)} />
                      <span className="text-sm font-medium text-foreground">
                        {badge.label} em {badge.gameName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalGamesPlayed}</p>
                <p className="text-xs text-muted-foreground">Jogos Totais</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.snakeBestScore}</p>
                <p className="text-xs text-muted-foreground">Recorde Snake</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.dinoBestScore}</p>
                <p className="text-xs text-muted-foreground">Recorde Dino</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.tetrisBestScore}</p>
                <p className="text-xs text-muted-foreground">Recorde Tetris</p>
              </div>
            </div>
          </div>

          {/* Progresso Conquistas */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Conquistas Desbloqueadas</span>
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

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="muted" icon={ArrowLeft} onClick={onBack} className="flex-1">
              Voltar ao Menu
            </GameButton>
            <GameButton variant="destructive" onClick={handleLogout} className="flex-1">
              Sair da Conta
            </GameButton>
          </div>
        </motion.div>
      ) : activeTab === "achievements" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
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

          <GameButton variant="muted" icon={ArrowLeft} onClick={onBack}>
            Voltar ao Menu
          </GameButton>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Seletor de Jogo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["snake", "memory", "dino", "tetris"] as LeaderboardGame[]).map((game) => (
              <button
                key={game}
                onClick={() => setLeaderboardGame(game)}
                className={cn(
                  "py-2 px-4 rounded-lg border transition-all text-sm",
                  leaderboardGame === game
                    ? "bg-primary/20 border-primary text-primary"
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

          <GameButton variant="muted" icon={ArrowLeft} onClick={onBack}>
            Voltar ao Menu
          </GameButton>
        </motion.div>
      )}
    </GameLayout>
  );
}