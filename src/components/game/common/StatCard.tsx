import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: StatCard
 * ===========================================
 * 
 * Card reutilizável para exibir estatísticas.
 * Usado em ambos os jogos para mostrar pontos, tempo, etc.
 * 
 * @example
 * <StatCard 
 *   icon={Timer} 
 *   label="Tempo" 
 *   value="01:30" 
 *   iconColor="text-primary"
 * />
 */

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconAnimation?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  iconColor = "text-primary",
  iconAnimation = "",
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "hover:border-primary/30"
      )}
    >
      <motion.div 
        className={`p-2 rounded-lg bg-muted/50 ${iconColor}`}
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.3 }}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconAnimation}`} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <motion.p 
            className="text-lg sm:text-xl font-display font-bold text-foreground truncate"
            key={String(value)}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.p>
          {trend && (
            <span className={cn(
              "text-xs",
              trend === "up" && "text-emerald-500",
              trend === "down" && "text-rose-500",
              trend === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
