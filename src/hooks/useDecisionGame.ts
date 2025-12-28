/**
 * Hook para gerenciar o jogo de cenários de decisão com sistema de progressão
 * Integrado com useGameRewards para registro de atividades
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useLevel } from "./useLevel";
import { useGameRewards } from "./useGameRewards";

export interface DecisionScenario {
  id: string;
  category_id: string | null;
  title: string;
  context: string;
  difficulty: string;
  xp_reward: number;
}

export interface DecisionOption {
  id: string;
  scenario_id: string;
  option_text: string;
  impact_score: number;
  cost_score: number;
  risk_score: number;
  feedback: string;
  is_optimal: boolean;
}

export interface DecisionResult {
  option: DecisionOption;
  timeTaken: number;
  isOptimal: boolean;
  xpEarned: number;
}

export interface ScenarioWithProgress extends DecisionScenario {
  isCompleted: boolean;
  isUnlocked: boolean;
  isOptimalDecision: boolean | null;
}

export interface ProgressionStats {
  easyCompleted: number;
  easyTotal: number;
  mediumCompleted: number;
  mediumTotal: number;
  hardCompleted: number;
  hardTotal: number;
  totalCompleted: number;
  totalScenarios: number;
  optimalDecisions: number;
}

// Requisitos para desbloquear níveis
const UNLOCK_REQUIREMENTS = {
  medium: 1, // Completar 1 cenário easy para desbloquear medium
  hard: 2,   // Completar 2 cenários medium para desbloquear hard
};

interface UseDecisionGame {
  scenarios: DecisionScenario[];
  scenariosWithProgress: ScenarioWithProgress[];
  progressionStats: ProgressionStats;
  currentScenario: DecisionScenario | null;
  currentOptions: DecisionOption[];
  result: DecisionResult | null;
  isLoading: boolean;
  startScenario: (scenarioId: string) => Promise<void>;
  makeDecision: (optionId: string, timeTaken: number) => Promise<void>;
  nextScenario: () => void;
  fetchScenarios: () => Promise<void>;
  canAccessDifficulty: (difficulty: string) => boolean;
}

export function useDecisionGame(): UseDecisionGame {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addXP } = useLevel();
  const { logActivity, updateStreak } = useGameRewards();

  const [scenarios, setScenarios] = useState<DecisionScenario[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Map<string, boolean>>(new Map());
  const [currentScenario, setCurrentScenario] = useState<DecisionScenario | null>(null);
  const [currentOptions, setCurrentOptions] = useState<DecisionOption[]>([]);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch completed scenarios for the user
  const fetchCompletedScenarios = useCallback(async () => {
    if (!user) {
      setCompletedScenarios(new Map());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_decision_answers")
        .select("scenario_id, option_id, decision_options!inner(is_optimal)")
        .eq("user_id", user.id);

      if (error) throw error;

      const completedMap = new Map<string, boolean>();
      (data || []).forEach((answer: any) => {
        const isOptimal = answer.decision_options?.is_optimal ?? false;
        // Se já tiver uma decisão ótima registrada, manter
        if (!completedMap.has(answer.scenario_id) || isOptimal) {
          completedMap.set(answer.scenario_id, isOptimal);
        }
      });

      setCompletedScenarios(completedMap);
    } catch (err) {
      console.error("Erro ao buscar cenários completados:", err);
    }
  }, [user]);

  const fetchScenarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("decision_scenarios")
        .select("*")
        .order("difficulty", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScenarios((data || []) as DecisionScenario[]);
    } catch (err) {
      console.error("Erro ao buscar cenários:", err);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
    fetchCompletedScenarios();
  }, [fetchScenarios, fetchCompletedScenarios]);

  // Calcular estatísticas de progressão
  const progressionStats = useMemo((): ProgressionStats => {
    const byDifficulty = {
      easy: { total: 0, completed: 0, optimal: 0 },
      medium: { total: 0, completed: 0, optimal: 0 },
      hard: { total: 0, completed: 0, optimal: 0 },
    };

    scenarios.forEach((s) => {
      const diff = s.difficulty as keyof typeof byDifficulty;
      if (byDifficulty[diff]) {
        byDifficulty[diff].total++;
        if (completedScenarios.has(s.id)) {
          byDifficulty[diff].completed++;
          if (completedScenarios.get(s.id)) {
            byDifficulty[diff].optimal++;
          }
        }
      }
    });

    return {
      easyCompleted: byDifficulty.easy.completed,
      easyTotal: byDifficulty.easy.total,
      mediumCompleted: byDifficulty.medium.completed,
      mediumTotal: byDifficulty.medium.total,
      hardCompleted: byDifficulty.hard.completed,
      hardTotal: byDifficulty.hard.total,
      totalCompleted: completedScenarios.size,
      totalScenarios: scenarios.length,
      optimalDecisions: byDifficulty.easy.optimal + byDifficulty.medium.optimal + byDifficulty.hard.optimal,
    };
  }, [scenarios, completedScenarios]);

  // Verificar se pode acessar uma dificuldade
  const canAccessDifficulty = useCallback((difficulty: string): boolean => {
    if (difficulty === "easy") return true;
    
    if (difficulty === "medium") {
      return progressionStats.easyCompleted >= UNLOCK_REQUIREMENTS.medium;
    }
    
    if (difficulty === "hard") {
      return progressionStats.mediumCompleted >= UNLOCK_REQUIREMENTS.hard;
    }
    
    return false;
  }, [progressionStats]);

  // Cenários com informações de progresso
  const scenariosWithProgress = useMemo((): ScenarioWithProgress[] => {
    return scenarios.map((scenario) => ({
      ...scenario,
      isCompleted: completedScenarios.has(scenario.id),
      isUnlocked: canAccessDifficulty(scenario.difficulty),
      isOptimalDecision: completedScenarios.has(scenario.id) 
        ? completedScenarios.get(scenario.id) ?? null 
        : null,
    }));
  }, [scenarios, completedScenarios, canAccessDifficulty]);

  const startScenario = useCallback(async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Verificar se está desbloqueado
    if (!canAccessDifficulty(scenario.difficulty)) {
      const requirement = scenario.difficulty === "medium" 
        ? `Complete ${UNLOCK_REQUIREMENTS.medium} cenário(s) fácil(eis)`
        : `Complete ${UNLOCK_REQUIREMENTS.hard} cenário(s) médio(s)`;
      
      toast({
        title: "🔒 Cenário Bloqueado",
        description: requirement,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data: options, error: optionsError } = await supabase
        .from("decision_options")
        .select("*")
        .eq("scenario_id", scenarioId);

      if (optionsError) throw optionsError;

      setCurrentScenario(scenario);
      setCurrentOptions((options || []) as DecisionOption[]);
    } catch (err) {
      console.error("Erro ao iniciar cenário:", err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cenário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [scenarios, canAccessDifficulty, toast]);

  const makeDecision = useCallback(
    async (optionId: string, timeTaken: number) => {
      if (!currentScenario || !user) return;

      const selectedOption = currentOptions.find((o) => o.id === optionId);
      if (!selectedOption) return;

      try {
        // Record the decision
        await supabase.from("user_decision_answers").insert({
          user_id: user.id,
          scenario_id: currentScenario.id,
          option_id: optionId,
          time_taken: timeTaken,
        });

        // Calculate XP based on decision quality
        let xpEarned = 0;
        if (selectedOption.is_optimal) {
          xpEarned = currentScenario.xp_reward;
        } else if (selectedOption.impact_score > 0) {
          xpEarned = Math.floor(currentScenario.xp_reward * 0.5);
        } else {
          xpEarned = Math.floor(currentScenario.xp_reward * 0.2);
        }

        // Bonus for quick decisions (under 30s)
        if (timeTaken < 30000) {
          xpEarned = Math.floor(xpEarned * 1.2);
        }

        // Update competency profile
        await updateCompetencyProfile(selectedOption, timeTaken);

        // Add XP
        if (xpEarned > 0) {
          await addXP(xpEarned, "Cenário de decisão");
        }

        // Award coins
        const coinsEarned = selectedOption.is_optimal ? 50 : selectedOption.impact_score > 0 ? 25 : 10;

        // Registra atividade e atualiza streak
        await logActivity("decision_made", "decision", xpEarned, coinsEarned, {
          scenarioId: currentScenario.id,
          isOptimal: selectedOption.is_optimal,
          timeTaken,
          difficulty: currentScenario.difficulty
        });
        await updateStreak();
        const { data: stats } = await supabase
          .from("user_stats")
          .select("coins")
          .eq("user_id", user.id)
          .single();

        if (stats) {
          await supabase
            .from("user_stats")
            .update({ coins: stats.coins + coinsEarned })
            .eq("user_id", user.id);
        }

        // Update local completed scenarios state
        setCompletedScenarios((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentScenario.id, selectedOption.is_optimal);
          return newMap;
        });

        setResult({
          option: selectedOption,
          timeTaken,
          isOptimal: selectedOption.is_optimal,
          xpEarned,
        });

        // Check if unlocked new difficulty
        const newEasyCompleted = progressionStats.easyCompleted + (currentScenario.difficulty === "easy" && !completedScenarios.has(currentScenario.id) ? 1 : 0);
        const newMediumCompleted = progressionStats.mediumCompleted + (currentScenario.difficulty === "medium" && !completedScenarios.has(currentScenario.id) ? 1 : 0);

        if (currentScenario.difficulty === "easy" && newEasyCompleted === UNLOCK_REQUIREMENTS.medium) {
          toast({
            title: "🔓 Novo Nível Desbloqueado!",
            description: "Cenários MÉDIOS agora estão disponíveis!",
          });
        } else if (currentScenario.difficulty === "medium" && newMediumCompleted === UNLOCK_REQUIREMENTS.hard) {
          toast({
            title: "🔓 Novo Nível Desbloqueado!",
            description: "Cenários DIFÍCEIS agora estão disponíveis!",
          });
        } else {
          toast({
            title: selectedOption.is_optimal ? "🎯 Decisão Ótima!" : "💡 Decisão Registrada",
            description: `+${xpEarned} XP | +${coinsEarned} moedas`,
          });
        }
      } catch (err) {
        console.error("Erro ao registrar decisão:", err);
      }
    },
    [currentScenario, currentOptions, user, toast, addXP, progressionStats, completedScenarios]
  );

  const updateCompetencyProfile = async (
    option: DecisionOption,
    timeTaken: number
  ) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("user_competency_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const totalCompleted = (existing?.total_scenarios_completed || 0) + 1;
      const totalCorrect = (existing?.total_correct_decisions || 0) + (option.is_optimal ? 1 : 0);

      const oldAvgSpeed = existing?.decision_speed_avg || 0;
      const newAvgSpeed = Math.floor(
        (oldAvgSpeed * (totalCompleted - 1) + timeTaken) / totalCompleted
      );

      const oldRiskTolerance = Number(existing?.risk_tolerance || 0.5);
      const riskFactor = option.risk_score / 100;
      const newRiskTolerance = Math.max(0, Math.min(1, 
        (oldRiskTolerance * (totalCompleted - 1) + riskFactor) / totalCompleted
      ));

      const oldImpactFocus = Number(existing?.impact_focus || 0.5);
      const impactFactor = (option.impact_score + 100) / 200;
      const newImpactFocus = Math.max(0, Math.min(1,
        (oldImpactFocus * (totalCompleted - 1) + impactFactor) / totalCompleted
      ));

      const newConsistency = totalCorrect / totalCompleted;

      await supabase.from("user_competency_profile").upsert({
        user_id: user.id,
        decision_speed_avg: newAvgSpeed,
        risk_tolerance: newRiskTolerance,
        impact_focus: newImpactFocus,
        consistency_score: newConsistency,
        total_scenarios_completed: totalCompleted,
        total_correct_decisions: totalCorrect,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Erro ao atualizar perfil de competências:", err);
    }
  };

  const nextScenario = useCallback(() => {
    setCurrentScenario(null);
    setCurrentOptions([]);
    setResult(null);
  }, []);

  return {
    scenarios,
    scenariosWithProgress,
    progressionStats,
    currentScenario,
    currentOptions,
    result,
    isLoading,
    startScenario,
    makeDecision,
    nextScenario,
    fetchScenarios,
    canAccessDifficulty,
  };
}
