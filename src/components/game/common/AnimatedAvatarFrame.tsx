/**
 * AnimatedAvatarFrame - Moldura animada para avatar
 * 
 * Exibe molduras com animações baseadas na raridade:
 * - Common: borda simples
 * - Rare: borda azul com brilho
 * - Epic: borda roxa com partículas
 * - Legendary: borda dourada com fogo/raios
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/hooks/useMarketplace";

interface AnimatedAvatarFrameProps {
  avatarUrl?: string | null;
  nickname?: string;
  equippedFrame?: InventoryItem;
  equippedAvatar?: InventoryItem;
  size?: "sm" | "md" | "lg" | "xl";
  showAnimations?: boolean;
  className?: string;
}

// Tamanhos do avatar
const SIZES = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

// Estilos por raridade
const FRAME_STYLES = {
  common: {
    ring: "ring-2 ring-muted-foreground/50",
    glow: "",
    particles: [],
  },
  rare: {
    ring: "ring-3 ring-blue-500",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    particles: ["💎", "✨"],
  },
  epic: {
    ring: "ring-4 ring-purple-500",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.6)]",
    particles: ["⚡", "💜", "✨", "🔮"],
  },
  legendary: {
    ring: "ring-4 ring-yellow-400",
    glow: "shadow-[0_0_35px_rgba(234,179,8,0.7)]",
    particles: ["🔥", "⚡", "✨", "👑", "💫", "🌟"],
  },
};

export function AnimatedAvatarFrame({
  avatarUrl,
  nickname = "?",
  equippedFrame,
  equippedAvatar,
  size = "lg",
  showAnimations = true,
  className,
}: AnimatedAvatarFrameProps) {
  const rarity = (equippedFrame?.item?.rarity || "common") as keyof typeof FRAME_STYLES;
  const frameStyle = FRAME_STYLES[rarity];
  const hasFrame = !!equippedFrame;

  return (
    <div className={cn("relative", className)}>
      {/* Partículas animadas para frames épicos/lendários */}
      {showAnimations && hasFrame && frameStyle.particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {frameStyle.particles.map((particle, i) => (
            <motion.span
              key={i}
              className="absolute text-sm"
              initial={{
                x: "50%",
                y: "50%",
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: [
                  "50%",
                  `${20 + Math.random() * 60}%`,
                  `${10 + Math.random() * 80}%`,
                  "50%",
                ],
                y: [
                  "50%",
                  `${-20 + Math.random() * 40}%`,
                  `${80 + Math.random() * 40}%`,
                  "50%",
                ],
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 0.8, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              {particle}
            </motion.span>
          ))}
        </div>
      )}

      {/* Efeito de fogo para lendário */}
      {showAnimations && rarity === "legendary" && (
        <>
          {/* Anel de fogo */}
          <motion.div
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #f59e0b, #ef4444, #f59e0b, #fbbf24, #f59e0b)",
              filter: "blur(4px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Pulso de energia */}
          <motion.div
            className="absolute inset-[-4px] rounded-full bg-yellow-400/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      )}

      {/* Efeito elétrico para épico */}
      {showAnimations && rarity === "epic" && (
        <>
          <motion.div
            className="absolute inset-[-6px] rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #a855f7, #6366f1, #a855f7, #c084fc, #a855f7)",
              filter: "blur(3px)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          {/* Raios */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-0.5 h-4 bg-purple-400"
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "center",
                transform: `rotate(${angle}deg) translateY(-150%)`,
              }}
              animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: angle / 360 }}
            />
          ))}
        </>
      )}

      {/* Efeito brilho para raro */}
      {showAnimations && rarity === "rare" && (
        <motion.div
          className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-blue-500/0 via-blue-400/50 to-blue-500/0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Container do avatar */}
      <motion.div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center",
          SIZES[size],
          hasFrame && frameStyle.ring,
          hasFrame && frameStyle.glow,
          !hasFrame && "ring-2 ring-border"
        )}
        whileHover={showAnimations ? { scale: 1.05 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />

        {/* Avatar image ou icon */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={nickname}
            className="relative z-10 w-full h-full object-cover"
          />
        ) : equippedAvatar?.item?.icon ? (
          <span className={cn(
            "relative z-10",
            size === "sm" && "text-xl",
            size === "md" && "text-3xl",
            size === "lg" && "text-4xl",
            size === "xl" && "text-5xl",
          )}>
            {equippedAvatar.item.icon}
          </span>
        ) : (
          <span className={cn(
            "relative z-10 font-bold text-primary",
            size === "sm" && "text-lg",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            size === "xl" && "text-4xl",
          )}>
            {nickname.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Efeito de brilho passando */}
        {showAnimations && hasFrame && rarity !== "common" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </motion.div>

      {/* Ícone da moldura */}
      {equippedFrame?.item?.icon && (
        <motion.div
          className="absolute -bottom-1 -right-1 text-lg bg-card rounded-full p-1 border border-border shadow-lg"
          animate={showAnimations && rarity === "legendary" ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {equippedFrame.item.icon}
        </motion.div>
      )}
    </div>
  );
}

// Versão compacta para usar no ranking
export function CompactAnimatedAvatar({
  avatarUrl,
  nickname = "?",
  rarity = "common",
  size = "md",
}: {
  avatarUrl?: string | null;
  nickname?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  size?: "sm" | "md";
}) {
  const frameStyle = FRAME_STYLES[rarity];
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-12 h-12";

  return (
    <div className="relative">
      {/* Glow sutil para frames especiais */}
      {rarity !== "common" && (
        <motion.div
          className={cn(
            "absolute inset-[-2px] rounded-full",
            rarity === "legendary" && "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500",
            rarity === "epic" && "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500",
            rarity === "rare" && "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500",
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: rarity === "legendary" ? 2 : 4, repeat: Infinity, ease: "linear" }}
          style={{ filter: "blur(2px)" }}
        />
      )}

      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center",
          sizeClass,
          "ring-2",
          rarity === "legendary" && "ring-yellow-400",
          rarity === "epic" && "ring-purple-500",
          rarity === "rare" && "ring-blue-500",
          rarity === "common" && "ring-border",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        {avatarUrl ? (
          <img src={avatarUrl} alt={nickname} className="relative z-10 w-full h-full object-cover" />
        ) : (
          <span className={cn("relative z-10 font-bold text-primary", size === "sm" ? "text-sm" : "text-lg")}>
            {nickname.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}