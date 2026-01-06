/**
 * AnimatedAvatarFrame - Moldura animada para avatar
 * 
 * Exibe molduras com animações baseadas na raridade:
 * - Common: borda simples
 * - Rare: borda azul com brilho
 * - Epic: borda roxa com partículas
 * - Legendary: borda dourada com fogo/raios
 * 
 * Paleta: Honey & Charcoal - usando cores centralizadas
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/hooks/useMarketplace";
import { FRAME_RARITY_COLORS, type FrameRarityKey } from "@/constants/colors";

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

// Estilos por raridade com partículas
const FRAME_STYLES = {
  common: {
    ring: "ring-2 ring-border",
    glow: "",
    particles: [],
  },
  rare: {
    ring: cn("ring-3", FRAME_RARITY_COLORS.rare.ring),
    glow: FRAME_RARITY_COLORS.rare.glow,
    particles: ["💎", "✨"],
  },
  epic: {
    ring: cn("ring-4", FRAME_RARITY_COLORS.epic.ring),
    glow: FRAME_RARITY_COLORS.epic.glow,
    particles: ["⚡", "💜", "✨", "🔮"],
  },
  legendary: {
    ring: cn("ring-4", FRAME_RARITY_COLORS.legendary.ring),
    glow: FRAME_RARITY_COLORS.legendary.glow,
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

      {/* Efeito de fogo para lendário - usando cores do sistema */}
      {showAnimations && rarity === "legendary" && (
        <>
          {/* Anel de fogo usando gradiente primary/accent */}
          <motion.div
            className="absolute inset-[-8px] rounded-full bg-gradient-conic from-primary via-accent to-primary"
            style={{ filter: "blur(4px)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Pulso de energia */}
          <motion.div
            className="absolute inset-[-4px] rounded-full bg-primary/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      )}

      {/* Efeito elétrico para épico */}
      {showAnimations && rarity === "epic" && (
        <>
          <motion.div
            className="absolute inset-[-6px] rounded-full bg-gradient-conic from-secondary via-muted to-secondary"
            style={{ filter: "blur(3px)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          {/* Raios */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-0.5 h-4 bg-secondary-foreground"
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
          className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-gameia-info/0 via-gameia-info/50 to-gameia-info/0"
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
  const frameColors = FRAME_RARITY_COLORS[rarity as FrameRarityKey];
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-12 h-12";

  return (
    <div className="relative">
      {/* Glow sutil para frames especiais */}
      {rarity !== "common" && (
        <motion.div
          className={cn(
            "absolute inset-[-2px] rounded-full bg-gradient-to-r",
            frameColors.gradient
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
          frameColors.ring
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
