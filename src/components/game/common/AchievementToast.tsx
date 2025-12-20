import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS } from "@/constants/achievements";

/**
 * ===========================================
 * COMPONENTE: AchievementToast
 * ===========================================
 * 
 * Toast animado que aparece quando uma conquista é desbloqueada.
 */

interface AchievementToastProps {
  achievementId: string | null;
  onClose: () => void;
}

export function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {achievementId && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          onAnimationComplete={() => {
            setTimeout(onClose, 3000);
          }}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-yellow-500/90 to-amber-600/90 
                     backdrop-blur-sm border border-yellow-400/50 rounded-xl p-4 shadow-2xl
                     flex items-center gap-4 min-w-[280px]"
        >
          <div className="text-4xl">{achievement.icon}</div>
          <div>
            <p className="text-xs text-yellow-100 uppercase tracking-wider font-medium">
              Conquista Desbloqueada!
            </p>
            <p className="text-white font-bold text-lg">{achievement.name}</p>
            <p className="text-yellow-100 text-sm">{achievement.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
