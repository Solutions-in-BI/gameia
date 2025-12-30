/**
 * useTrainingEvolution - Hook para aplicar evolution templates a treinamentos
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EvolutionTemplate } from "./useEvolutionTemplates";

export interface EvolutionSnapshot {
  template_id: string;
  template_name: string;
  category: string;
  level: string;
  importance: string;
  skill_impacts: { skill_id: string; weight: number }[];
  insignia_ids: string[];
  generates_certificate: boolean;
  certificate_min_score: number;
  applied_at: string;
}

export function useTrainingEvolution() {
  // Apply a template to a training (creates a snapshot)
  const applyTemplate = useCallback(async (
    trainingId: string,
    template: EvolutionTemplate
  ) => {
    const snapshot: EvolutionSnapshot = {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
      level: template.level,
      importance: template.importance,
      skill_impacts: template.skill_impacts,
      insignia_ids: template.insignia_ids,
      generates_certificate: template.generates_certificate,
      certificate_min_score: template.certificate_min_score,
      applied_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('trainings')
        .update({
          evolution_template_id: template.id,
          evolution_snapshot: snapshot,
          importance: template.importance,
          xp_reward: template.suggested_xp,
          coins_reward: template.suggested_coins,
          category: template.category,
        })
        .eq('id', trainingId);

      if (error) throw error;
      return snapshot;
    } catch (error) {
      console.error("Error applying template:", error);
      throw error;
    }
  }, []);

  // Save a custom snapshot (for manual configuration)
  const saveCustomEvolution = useCallback(async (
    trainingId: string,
    customSnapshot: Omit<EvolutionSnapshot, 'template_id' | 'template_name' | 'applied_at'>
  ) => {
    const snapshot: EvolutionSnapshot = {
      ...customSnapshot,
      template_id: 'custom',
      template_name: 'Configuração Manual',
      applied_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('trainings')
        .update({
          evolution_template_id: null,
          evolution_snapshot: snapshot,
          importance: customSnapshot.importance,
        })
        .eq('id', trainingId);

      if (error) throw error;
      return snapshot;
    } catch (error) {
      console.error("Error saving custom evolution:", error);
      throw error;
    }
  }, []);

  // Get evolution data for a training
  const getTrainingEvolution = useCallback(async (trainingId: string) => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('evolution_template_id, evolution_snapshot, importance')
        .eq('id', trainingId)
        .single();

      if (error) throw error;
      return {
        templateId: data.evolution_template_id,
        snapshot: data.evolution_snapshot as EvolutionSnapshot | null,
        importance: data.importance,
      };
    } catch (error) {
      console.error("Error getting training evolution:", error);
      throw error;
    }
  }, []);

  // Clear evolution from a training
  const clearEvolution = useCallback(async (trainingId: string) => {
    try {
      const { error } = await supabase
        .from('trainings')
        .update({
          evolution_template_id: null,
          evolution_snapshot: null,
          importance: 'complementar',
        })
        .eq('id', trainingId);

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing evolution:", error);
      throw error;
    }
  }, []);

  return {
    applyTemplate,
    saveCustomEvolution,
    getTrainingEvolution,
    clearEvolution,
  };
}
