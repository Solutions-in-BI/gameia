/**
 * Hook para gerenciar o jogo de cenários de decisão
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useLevel } from "./useLevel";

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

interface UseDecisionGame {
  scenarios: DecisionScenario[];
  currentScenario: DecisionScenario | null;
  currentOptions: DecisionOption[];
  result: DecisionResult | null;
  isLoading: boolean;
  startScenario: (scenarioId: string) => Promise<void>;
  makeDecision: (optionId: string, timeTaken: number) => Promise<void>;
  nextScenario: () => void;
  fetchScenarios: () => Promise<void>;
}

export function useDecisionGame(): UseDecisionGame {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addXP } = useLevel();

  const [scenarios, setScenarios] = useState<DecisionScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<DecisionScenario | null>(null);
  const [currentOptions, setCurrentOptions] = useState<DecisionOption[]>([]);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchScenarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("decision_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScenarios((data || []) as DecisionScenario[]);
    } catch (err) {
      console.error("Erro ao buscar cenários:", err);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const startScenario = useCallback(async (scenarioId: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Fetch scenario
      const { data: scenario, error: scenarioError } = await supabase
        .from("decision_scenarios")
        .select("*")
        .eq("id", scenarioId)
        .single();

      if (scenarioError) throw scenarioError;

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from("decision_options")
        .select("*")
        .eq("scenario_id", scenarioId);

      if (optionsError) throw optionsError;

      setCurrentScenario(scenario as DecisionScenario);
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
  }, [toast]);

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

        setResult({
          option: selectedOption,
          timeTaken,
          isOptimal: selectedOption.is_optimal,
          xpEarned,
        });

        toast({
          title: selectedOption.is_optimal ? "🎯 Decisão Ótima!" : "💡 Decisão Registrada",
          description: `+${xpEarned} XP | +${coinsEarned} moedas`,
        });
      } catch (err) {
        console.error("Erro ao registrar decisão:", err);
      }
    },
    [currentScenario, currentOptions, user, toast, addXP]
  );

  const updateCompetencyProfile = async (
    option: DecisionOption,
    timeTaken: number
  ) => {
    if (!user) return;

    try {
      // Fetch existing profile
      const { data: existing } = await supabase
        .from("user_competency_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const totalCompleted = (existing?.total_scenarios_completed || 0) + 1;
      const totalCorrect = (existing?.total_correct_decisions || 0) + (option.is_optimal ? 1 : 0);

      // Calculate new averages
      const oldAvgSpeed = existing?.decision_speed_avg || 0;
      const newAvgSpeed = Math.floor(
        (oldAvgSpeed * (totalCompleted - 1) + timeTaken) / totalCompleted
      );

      // Risk tolerance based on choices (higher risk_score = more risk-tolerant)
      const oldRiskTolerance = Number(existing?.risk_tolerance || 0.5);
      const riskFactor = option.risk_score / 100;
      const newRiskTolerance = Math.max(0, Math.min(1, 
        (oldRiskTolerance * (totalCompleted - 1) + riskFactor) / totalCompleted
      ));

      // Impact focus (higher impact_score preference = more impact-focused)
      const oldImpactFocus = Number(existing?.impact_focus || 0.5);
      const impactFactor = (option.impact_score + 100) / 200; // Normalize -100 to 100 → 0 to 1
      const newImpactFocus = Math.max(0, Math.min(1,
        (oldImpactFocus * (totalCompleted - 1) + impactFactor) / totalCompleted
      ));

      // Consistency score (ratio of optimal decisions)
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
    currentScenario,
    currentOptions,
    result,
    isLoading,
    startScenario,
    makeDecision,
    nextScenario,
    fetchScenarios,
  };
}
