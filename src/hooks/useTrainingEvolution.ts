/**
 * useTrainingEvolution - Hook para aplicar evolution templates a treinamentos
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EvolutionTemplate } from "./useEvolutionTemplates";
import type { Json } from "@/integrations/supabase/types";

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

// Convert snapshot to JSON-compatible format
function snapshotToJson(snapshot: EvolutionSnapshot): Json {
  return {
    template_id: snapshot.template_id,
    template_name: snapshot.template_name,
    category: snapshot.category,
    level: snapshot.level,
    importance: snapshot.importance,
    skill_impacts: snapshot.skill_impacts.map(s => ({
      skill_id: s.skill_id,
      weight: s.weight,
    })),
    insignia_ids: snapshot.insignia_ids,
    generates_certificate: snapshot.generates_certificate,
    certificate_min_score: snapshot.certificate_min_score,
    applied_at: snapshot.applied_at,
  };
}

// Parse JSON to EvolutionSnapshot
function parseSnapshot(json: unknown): EvolutionSnapshot | null {
  if (!json || typeof json !== 'object') return null;
  const data = json as Record<string, unknown>;
  
  return {
    template_id: String(data.template_id || ''),
    template_name: String(data.template_name || ''),
    category: String(data.category || ''),
    level: String(data.level || ''),
    importance: String(data.importance || ''),
    skill_impacts: Array.isArray(data.skill_impacts) 
      ? data.skill_impacts.map((s: unknown) => {
          const item = s as Record<string, unknown>;
          return {
            skill_id: String(item.skill_id || ''),
            weight: Number(item.weight || 0),
          };
        })
      : [],
    insignia_ids: Array.isArray(data.insignia_ids) 
      ? data.insignia_ids.map(String) 
      : [],
    generates_certificate: Boolean(data.generates_certificate),
    certificate_min_score: Number(data.certificate_min_score || 80),
    applied_at: String(data.applied_at || ''),
  };
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
          evolution_snapshot: snapshotToJson(snapshot),
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
          evolution_snapshot: snapshotToJson(snapshot),
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
        snapshot: parseSnapshot(data.evolution_snapshot),
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
