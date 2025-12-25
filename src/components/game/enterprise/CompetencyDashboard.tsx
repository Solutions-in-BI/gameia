/**
 * Dashboard de competências do usuário
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CompetencyProfile {
  decision_speed_avg: number;
  risk_tolerance: number;
  impact_focus: number;
  consistency_score: number;
  total_scenarios_completed: number;
  total_correct_decisions: number;
  strengths: string[] | null;
  weaknesses: string[] | null;
}

export function CompetencyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompetencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_competency_profile")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setProfile(data as unknown as CompetencyProfile);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  if (!profile || profile.total_scenarios_completed === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-card/50 rounded-xl border border-border text-center"
      >
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Sem dados ainda</h3>
        <p className="text-muted-foreground">
          Complete cenários de decisão para ver seu perfil de competências.
        </p>
      </motion.div>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const getScoreColor = (value: number) => {
    if (value >= 0.7) return "text-green-500";
    if (value >= 0.4) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskProfile = (tolerance: number) => {
    if (tolerance >= 0.7) return { label: "Arrojado", color: "text-red-500" };
    if (tolerance >= 0.4) return { label: "Moderado", color: "text-yellow-500" };
    return { label: "Conservador", color: "text-green-500" };
  };

  const getImpactProfile = (focus: number) => {
    if (focus >= 0.7) return { label: "Orientado a Resultados", color: "text-blue-500" };
    if (focus >= 0.4) return { label: "Equilibrado", color: "text-purple-500" };
    return { label: "Orientado a Custos", color: "text-yellow-500" };
  };

  const riskProfile = getRiskProfile(profile.risk_tolerance);
  const impactProfile = getImpactProfile(profile.impact_focus);
  const accuracy = profile.total_correct_decisions / profile.total_scenarios_completed;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-card/50 rounded-xl border border-border"
        >
          <Target className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold">{profile.total_scenarios_completed}</div>
          <div className="text-xs text-muted-foreground">Cenários</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-card/50 rounded-xl border border-border"
        >
          <Award className="w-5 h-5 text-green-500 mb-2" />
          <div className={cn("text-2xl font-bold", getScoreColor(accuracy))}>
            {Math.round(accuracy * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Precisão</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-card/50 rounded-xl border border-border"
        >
          <Clock className="w-5 h-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">
            {formatTime(profile.decision_speed_avg)}
          </div>
          <div className="text-xs text-muted-foreground">Tempo Médio</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-card/50 rounded-xl border border-border"
        >
          <TrendingUp className="w-5 h-5 text-purple-500 mb-2" />
          <div className={cn("text-2xl font-bold", getScoreColor(profile.consistency_score))}>
            {Math.round(profile.consistency_score * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Consistência</div>
        </motion.div>
      </div>

      {/* Profile Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20"
      >
        <h3 className="font-semibold mb-4">Seu Perfil de Decisão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Profile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Tolerância a Risco
              </span>
              <span className={cn("font-semibold", riskProfile.color)}>
                {riskProfile.label}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                style={{ width: `${profile.risk_tolerance * 100}%` }}
              />
            </div>
          </div>

          {/* Impact Profile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Foco de Decisão
              </span>
              <span className={cn("font-semibold", impactProfile.color)}>
                {impactProfile.label}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 transition-all"
                style={{ width: `${profile.impact_focus * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-card/50 rounded-xl border border-border"
      >
        <h4 className="font-semibold mb-3">💡 Insights</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {accuracy >= 0.7 && (
            <li>✅ Excelente taxa de acerto! Você toma decisões assertivas.</li>
          )}
          {accuracy < 0.5 && (
            <li>📚 Pratique mais cenários para melhorar suas decisões.</li>
          )}
          {profile.decision_speed_avg < 15000 && (
            <li>⚡ Você decide rapidamente. Cuidado para não ser impulsivo.</li>
          )}
          {profile.decision_speed_avg > 45000 && (
            <li>🤔 Você analisa bastante antes de decidir. Bom para cenários complexos.</li>
          )}
          {profile.risk_tolerance > 0.7 && (
            <li>🎯 Perfil arrojado: você aceita riscos para buscar resultados maiores.</li>
          )}
          {profile.risk_tolerance < 0.3 && (
            <li>🛡️ Perfil conservador: você prioriza segurança nas decisões.</li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
