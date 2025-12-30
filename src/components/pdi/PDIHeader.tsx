import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";

interface PDIHeaderProps {
  plan: DevelopmentPlan;
  goals: DevelopmentGoal[];
  onBack: () => void;
  onNewGoal: () => void;
}

export const PDIHeader: React.FC<PDIHeaderProps> = ({
  plan,
  goals,
  onBack,
  onNewGoal,
}) => {
  const stats = React.useMemo(() => {
    const completed = goals.filter(g => g.status === "completed").length;
    const inProgress = goals.filter(g => g.status === "in_progress").length;
    const stagnant = goals.filter(g => g.stagnant_since).length;
    const overdue = goals.filter(g => {
      if (!g.target_date) return false;
      return new Date(g.target_date) < new Date() && g.status !== "completed";
    }).length;
    
    return { completed, inProgress, stagnant, overdue, total: goals.length };
  }, [goals]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>;
      case "draft":
        return <Badge className="bg-muted text-muted-foreground border-border">Rascunho</Badge>;
      case "completed":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button onClick={onNewGoal} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Main Header Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(plan.overall_progress || 0) * 2.64} 264`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {plan.overall_progress || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                {plan.title}
              </h1>
              {getStatusBadge(plan.status || "draft")}
              {plan.xp_on_completion && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {plan.xp_on_completion} XP
                </Badge>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-2">
              <StatPill 
                icon={CheckCircle2} 
                value={stats.completed} 
                label="Concluídas"
                color="emerald"
              />
              <StatPill 
                icon={TrendingUp} 
                value={stats.inProgress} 
                label="Em progresso"
                color="blue"
              />
              {stats.stagnant > 0 && (
                <StatPill 
                  icon={Clock} 
                  value={stats.stagnant} 
                  label="Estagnadas"
                  color="amber"
                  pulse
                />
              )}
              {stats.overdue > 0 && (
                <StatPill 
                  icon={AlertTriangle} 
                  value={stats.overdue} 
                  label="Atrasadas"
                  color="red"
                  pulse
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatPillProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: "emerald" | "blue" | "amber" | "red";
  pulse?: boolean;
}

const StatPill: React.FC<StatPillProps> = ({ icon: Icon, value, label, color, pulse }) => {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
      colorClasses[color],
      pulse && "animate-pulse"
    )}>
      <Icon className="h-3.5 w-3.5" />
      <span>{value}</span>
      <span className="text-muted-foreground text-xs hidden sm:inline">{label}</span>
    </div>
  );
};

export default PDIHeader;
