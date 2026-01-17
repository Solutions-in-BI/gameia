import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { RARITY_COLORS, type RarityKey } from "@/constants/colors";

interface EquippedItems {
  frame?: { icon: string; rarity: string } | null;
  pet?: { icon: string; rarity: string } | null;
  avatar?: { icon: string; rarity: string } | null;
  banner?: { icon: string; rarity: string } | null;
}

interface AvatarWithEquipmentProps {
  avatarUrl: string | null;
  nickname: string;
  equippedItems?: EquippedItems;
  size?: "sm" | "md" | "lg" | "xl";
  showPet?: boolean;
  className?: string;
}

// Frame styles using centralized rarity colors
const getFrameStyle = (rarity: string): string => {
  const rarityColors = RARITY_COLORS[rarity as RarityKey] || RARITY_COLORS.common;
  const ringSize = rarity === 'legendary' ? 'ring-4' : rarity === 'epic' || rarity === 'rare' ? 'ring-[3px]' : 'ring-2';
  return `${ringSize} ${rarityColors.border.replace('border-', 'ring-')} ${rarityColors.glow}`;
};

const SIZE_CONFIG = {
  sm: { avatar: "h-8 w-8", pet: "text-sm -bottom-1 -right-1", frame: 2 },
  md: { avatar: "h-12 w-12", pet: "text-lg -bottom-1 -right-1", frame: 3 },
  lg: { avatar: "h-16 w-16", pet: "text-xl -bottom-2 -right-2", frame: 4 },
  xl: { avatar: "h-24 w-24", pet: "text-2xl -bottom-2 -right-2", frame: 5 },
};

export function AvatarWithEquipment({
  avatarUrl,
  nickname,
  equippedItems = {},
  size = "md",
  showPet = true,
  className,
}: AvatarWithEquipmentProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const frameStyle = equippedItems.frame 
    ? getFrameStyle(equippedItems.frame.rarity)
    : "";

  const isLegendaryFrame = equippedItems.frame?.rarity === "legendary";
  const isEpicFrame = equippedItems.frame?.rarity === "epic";

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Avatar with frame */}
      <motion.div
        animate={isLegendaryFrame ? { 
          boxShadow: [
            "0 0 20px rgba(245,158,11,0.4)",
            "0 0 30px rgba(245,158,11,0.6)",
            "0 0 20px rgba(245,158,11,0.4)",
          ]
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <Avatar className={cn(
          sizeConfig.avatar,
          "transition-all",
          frameStyle,
          isLegendaryFrame && "animate-pulse",
        )}>
          {/* Custom avatar icon (se equipado) */}
          {equippedItems.avatar ? (
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              {equippedItems.avatar.icon}
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={avatarUrl || undefined} alt={nickname} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {nickname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Frame decoration overlay */}
        {equippedItems.frame && (isEpicFrame || isLegendaryFrame) && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: isLegendaryFrame ? 8 : 12, ease: "linear" }}
            style={{
              background: isLegendaryFrame
                ? "conic-gradient(from 0deg, transparent, rgba(245,158,11,0.3), transparent)"
                : "conic-gradient(from 0deg, transparent, rgba(168,85,247,0.2), transparent)",
            }}
          />
        )}
      </motion.div>

      {/* Pet companion */}
      {showPet && equippedItems.pet && (
        <motion.span
          className={cn(
            "absolute z-10",
            sizeConfig.pet,
          )}
          animate={{
            y: [0, -3, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          {equippedItems.pet.icon}
        </motion.span>
      )}
    </div>
  );
}

// Hook helper para obter itens equipados formatados
export function useEquippedItemsForAvatar(
  getEquippedItem: (category: string) => { item?: { icon: string; rarity: string } } | undefined
): EquippedItems {
  return {
    frame: getEquippedItem("frame")?.item || null,
    pet: getEquippedItem("pet")?.item || null,
    avatar: getEquippedItem("avatar")?.item || null,
    banner: getEquippedItem("banner")?.item || null,
  };
}
