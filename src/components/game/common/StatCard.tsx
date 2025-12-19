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
    <div className="stat-card flex items-center gap-3">
      <Icon className={`w-5 h-5 ${iconColor} ${iconAnimation}`} />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-display font-bold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
