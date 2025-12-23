import { useState } from "react";
import { LeaderboardEntry } from "@/types/leaderboard";
import { getTitleById, RARITY_COLORS } from "@/constants/titles";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CompactAnimatedAvatar } from "./AnimatedAvatarFrame";
import { PublicProfileModal } from "./PublicProfileModal";
import { Eye } from "lucide-react";

interface UserRankInfo {
  entry: LeaderboardEntry;
  position: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  gameType: "memory" | "snake" | "dino" | "tetris";
  highlightName?: string;
  userRank?: UserRankInfo | null;
}

export function LeaderboardTable({ 
  entries, 
  isLoading, 
  gameType,
  highlightName,
  userRank 
}: LeaderboardTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleViewProfile = (userId: string | null | undefined) => {
    if (userId) {
      setSelectedUserId(userId);
      setIsProfileOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando ranking...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum score registrado ainda. Seja o primeiro!
      </div>
    );
  }

  // Verifica se o usuário está fora do top 10
  const showUserRank = userRank && userRank.position > 10;

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            position={index + 1}
            gameType={gameType}
            index={index}
            isHighlighted={
              (highlightName && entry.player_name === highlightName) || 
              (userRank && entry.user_id === userRank.entry.user_id)
            }
            onViewProfile={() => handleViewProfile(entry.user_id)}
          />
        ))}

        {/* Separador e posição do usuário fora do top 10 */}
        {showUserRank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 py-3">
              <div className="flex-1 border-t border-dashed border-primary/30" />
              <span className="text-xs text-primary/70 font-medium">sua posição</span>
              <div className="flex-1 border-t border-dashed border-primary/30" />
            </div>
            
            <LeaderboardRow
              entry={userRank.entry}
              position={userRank.position}
              gameType={gameType}
              index={11}
              isHighlighted={true}
              isCurrentUser={true}
              onViewProfile={() => handleViewProfile(userRank.entry.user_id)}
            />
          </motion.div>
        )}
      </div>

      {/* Modal de perfil público */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}

// Componente separado para cada linha do ranking
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  gameType: string;
  isHighlighted?: boolean;
  isCurrentUser?: boolean;
  index: number;
  onViewProfile?: () => void;
}

// Estilos especiais para top 3
const TOP_STYLES = {
  1: {
    border: "border-yellow-400/80",
    bg: "bg-gradient-to-r from-yellow-500/20 via-amber-400/10 to-yellow-500/20",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]",
    icon: "👑",
    animation: "animate-pulse",
    particles: ["✨", "⚡", "🔥"],
  },
  2: {
    border: "border-slate-300/80",
    bg: "bg-gradient-to-r from-slate-400/20 via-gray-300/10 to-slate-400/20",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]",
    icon: "⚔️",
    animation: "",
    particles: ["✨", "💫"],
  },
  3: {
    border: "border-amber-600/80",
    bg: "bg-gradient-to-r from-amber-700/20 via-orange-500/10 to-amber-700/20",
    glow: "shadow-[0_0_12px_rgba(180,83,9,0.3)]",
    icon: "🛡️",
    animation: "",
    particles: ["🔥"],
  },
};

function LeaderboardRow({ entry, position, gameType, isHighlighted, isCurrentUser, index, onViewProfile }: LeaderboardRowProps) {
  const isTop3 = position <= 3;
  const topStyle = isTop3 ? TOP_STYLES[position as 1 | 2 | 3] : null;
  const canViewProfile = !!entry.user_id;

  // Busca título do jogador
  const title = entry.profile?.selected_title ? getTitleById(entry.profile.selected_title) : null;
  const titleRarity = title ? RARITY_COLORS[title.rarity] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative group"
      onClick={canViewProfile ? onViewProfile : undefined}
      style={{ cursor: canViewProfile ? "pointer" : "default" }}
    >
      {/* Partículas animadas para top 3 */}
      {isTop3 && topStyle && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {topStyle.particles.map((particle, i) => (
            <motion.span
              key={i}
              className="absolute text-xs"
              initial={{ 
                x: `${20 + i * 30}%`, 
                y: "50%", 
                opacity: 0 
              }}
              animate={{ 
                y: ["50%", "20%", "50%", "80%", "50%"],
                opacity: [0, 1, 0.5, 1, 0],
                scale: [0.5, 1, 0.8, 1, 0.5],
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {particle}
            </motion.span>
          ))}
        </div>
      )}
      
      <div
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
          isTop3 && topStyle
            ? cn(topStyle.border, topStyle.bg, topStyle.glow, topStyle.animation)
            : isHighlighted
              ? "bg-primary/10 border-primary/50"
              : "bg-card/50 border-border/50 hover:border-border hover:bg-card/70"
        )}
      >
        {/* Efeito de brilho para o #1 */}
        {position === 1 && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
        
        {/* Posição com ícone especial */}
        <div className="relative w-12 text-center">
          {isTop3 && topStyle ? (
            <motion.div
              animate={position === 1 ? { 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              {topStyle.icon}
            </motion.div>
          ) : (
            <span className="text-xl font-bold text-muted-foreground">
              {position}º
            </span>
          )}
        </div>
        
        {/* Avatar com moldura animada */}
        <CompactAnimatedAvatar
          avatarUrl={entry.profile?.avatar_url}
          nickname={entry.player_name}
          rarity={entry.equipped_frame_rarity || (isTop3 ? (position === 1 ? "legendary" : position === 2 ? "epic" : "rare") : "common")}
          size="md"
        />
        
        {/* Nome e Título */}
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-semibold truncate",
              isTop3 ? "text-foreground" : "text-foreground/90"
            )}>
              {entry.player_name}
            </span>
            {isCurrentUser && (
              <span className="text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                você
              </span>
            )}
          </div>
          {title && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1",
                titleRarity?.bg,
                titleRarity?.text
              )}
            >
              <span>{title.icon}</span>
              <span className="font-medium">{title.name}</span>
            </motion.div>
          )}
        </div>
        
        {/* Score com destaque */}
        <div className="text-right flex-shrink-0 z-10 flex items-center gap-2">
          <div>
            <motion.span 
              className={cn(
                "text-xl font-bold",
                isTop3 
                  ? position === 1 
                    ? "text-yellow-500" 
                    : position === 2 
                      ? "text-slate-400" 
                      : "text-amber-600"
                  : "text-primary"
              )}
              animate={position === 1 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {entry.score.toLocaleString()}
            </motion.span>
            <span className="text-sm text-muted-foreground ml-1">
              {gameType === "memory" ? "mov" : "pts"}
            </span>
          </div>
          
          {/* Botão ver perfil */}
          {canViewProfile && (
            <motion.button
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile?.();
              }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
