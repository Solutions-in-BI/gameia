import { LucideIcon } from "lucide-react";

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
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  iconColor = "text-primary",
  iconAnimation = "",
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg bg-muted/50 ${iconColor}`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconAnimation}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-display font-bold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
