/**
 * PublicProfileModal - Modal para visualizar perfil público de outros jogadores
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star, Gamepad2, Crown, Medal, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CompactAnimatedAvatar } from "./AnimatedAvatarFrame";
import { LevelBadge, LevelProgressBar } from "./LevelBadge";
import { getTitleById, RARITY_COLORS } from "@/constants/titles";
import { getLevelInfo, getLevelTier, LEVEL_COLORS } from "@/constants/levels";

interface PublicProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  selected_title: string | null;
  created_at: string;
}

interface PublicStats {
  level: number;
  xp: number;
  total_games_played: number;
  snake_best_score: number;
  dino_best_score: number;
  tetris_best_score: number;
  memory_games_played: number;
}

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicProfileModal({ userId, isOpen, onClose }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [frameRarity, setFrameRarity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rankings, setRankings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userId && isOpen) {
      fetchProfileData(userId);
    }
  }, [userId, isOpen]);

  const fetchProfileData = async (id: string) => {
    setIsLoading(true);
    try {
      // Busca perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      setProfile(profileData);

      // Busca stats públicas
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("level, xp, total_games_played, snake_best_score, dino_best_score, tetris_best_score, memory_games_played")
        .eq("user_id", id)
        .maybeSingle();
      
      setStats(statsData);

      // Busca moldura equipada
      const { data: inventoryData } = await supabase
        .from("user_inventory")
        .select("item:marketplace_items(rarity, category)")
        .eq("user_id", id)
        .eq("is_equipped", true);
      
      const frame = inventoryData?.find((inv: any) => inv.item?.category === "frame");
      setFrameRarity(frame?.item?.rarity || null);

      // Busca posições no ranking
      await fetchRankings(id);

    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRankings = async (id: string) => {
    const games = ["snake", "dino", "tetris", "memory"];
    const ranks: Record<string, number> = {};

    for (const game of games) {
      const { data } = await supabase
        .from("leaderboard")
        .select("user_id")
        .eq("game_type", game)
        .order("score", { ascending: game === "memory" })
        .limit(100);

      if (data) {
        const position = data.findIndex(e => e.user_id === id);
        if (position !== -1) {
          ranks[game] = position + 1;
        }
      }
    }

    setRankings(ranks);
  };

  const title = profile?.selected_title ? getTitleById(profile.selected_title) : null;
  const titleRarity = title ? RARITY_COLORS[title.rarity] : null;
  const levelInfo = stats ? getLevelInfo(stats.level, stats.xp) : null;
  const levelTier = stats ? getLevelTier(stats.level) : "bronze";
  const levelColors = LEVEL_COLORS[levelTier];

  const gameStats = [
    { name: "Snake", icon: "🐍", score: stats?.snake_best_score || 0, rank: rankings.snake },
    { name: "Dino", icon: "🦖", score: stats?.dino_best_score || 0, rank: rankings.dino },
    { name: "Tetris", icon: "🧱", score: stats?.tetris_best_score || 0, rank: rankings.tetris },
    { name: "Memória", icon: "🧠", score: stats?.memory_games_played || 0, rank: rankings.memory, isGames: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header com gradient baseado no nível */}
            <div className={cn(
              "relative h-24 bg-gradient-to-br",
              levelTier === "legendary" && "from-orange-500/30 to-yellow-500/30",
              levelTier === "grandmaster" && "from-pink-500/30 to-purple-500/30",
              levelTier === "master" && "from-red-500/30 to-rose-500/30",
              levelTier === "diamond" && "from-purple-500/30 to-indigo-500/30",
              levelTier === "platinum" && "from-cyan-500/30 to-blue-500/30",
              levelTier === "gold" && "from-yellow-500/30 to-amber-500/30",
              levelTier === "silver" && "from-slate-400/30 to-gray-500/30",
              levelTier === "bronze" && "from-amber-700/30 to-orange-700/30",
            )}>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar sobreposto */}
            <div className="relative -mt-12 flex justify-center">
              <div className="relative">
                <CompactAnimatedAvatar
                  avatarUrl={profile?.avatar_url}
                  nickname={profile?.nickname || "?"}
                  rarity={(frameRarity as any) || "common"}
                  size="md"
                />
                {stats && (
                  <div className="absolute -bottom-1 -right-1">
                    <LevelBadge level={stats.level} size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 pt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando perfil...
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  {/* Nome e Título */}
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground">
                      {profile.nickname}
                    </h2>
                    {title && (
                      <div className={cn(
                        "inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full mt-1",
                        titleRarity?.bg,
                        titleRarity?.text
                      )}>
                        <span>{title.icon}</span>
                        <span className="font-medium">{title.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Nível */}
                  {stats && levelInfo && (
                    <div className="bg-muted/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <LevelBadge level={stats.level} xp={stats.xp} size="lg" showProgress />
                          <div>
                            <div className={cn("font-semibold", levelColors.color)}>
                              {levelInfo.icon} {levelInfo.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Nível {stats.level}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">{stats.xp.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">XP Total</div>
                        </div>
                      </div>
                      <LevelProgressBar level={stats.level} xp={stats.xp} />
                    </div>
                  )}

                  {/* Estatísticas dos jogos */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Melhores Scores
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {gameStats.map((game) => (
                        <div
                          key={game.name}
                          className="bg-muted/20 rounded-lg p-3 border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{game.icon}</span>
                            {game.rank && game.rank <= 3 && (
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                game.rank === 1 && "bg-yellow-500/20 text-yellow-500",
                                game.rank === 2 && "bg-slate-400/20 text-slate-400",
                                game.rank === 3 && "bg-amber-600/20 text-amber-600",
                              )}>
                                #{game.rank}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-foreground">{game.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {game.isGames 
                              ? `${game.score} jogos`
                              : `${game.score.toLocaleString()} pts`
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total de jogos */}
                  {stats && (
                    <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Gamepad2 className="w-4 h-4" />
                        <span>{stats.total_games_played} jogos</span>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span>Desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Perfil não encontrado
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
