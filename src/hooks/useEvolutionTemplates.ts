/**
 * useEvolutionTemplates - Hook para gerenciar Evolution Templates
 * Templates que definem automaticamente skills, insígnias e recompensas
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface SkillImpact {
  skill_id: string;
  weight: number; // 0.1 to 1.0
}

export interface EvolutionTemplate {
  id: string;
  organization_id: string | null;
  name: string;
  category: string;
  level: string;
  importance: string;
  skill_impacts: SkillImpact[];
  insignia_ids: string[];
  generates_certificate: boolean;
  certificate_min_score: number;
  suggested_xp: number;
  suggested_coins: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory = 
  | 'vendas' 
  | 'lideranca' 
  | 'soft_skills' 
  | 'produtividade' 
  | 'estrategia' 
  | 'onboarding' 
  | 'compliance' 
  | 'tecnico';

export type TemplateLevel = 'basico' | 'intermediario' | 'avancado' | 'especialista';
export type TemplateImportance = 'essencial' | 'estrategico' | 'complementar';

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  vendas: 'Vendas',
  lideranca: 'Liderança',
  soft_skills: 'Soft Skills',
  produtividade: 'Produtividade',
  estrategia: 'Estratégia',
  onboarding: 'Onboarding',
  compliance: 'Compliance',
  tecnico: 'Técnico',
};

export const LEVEL_LABELS: Record<TemplateLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  especialista: 'Especialista',
};

export const IMPORTANCE_LABELS: Record<TemplateImportance, string> = {
  essencial: 'Essencial',
  estrategico: 'Estratégico',
  complementar: 'Complementar',
};

// Helper to convert DB row to typed EvolutionTemplate
function parseTemplate(row: Record<string, unknown>): EvolutionTemplate {
  const skillImpacts = row.skill_impacts;
  const parsedSkillImpacts: SkillImpact[] = Array.isArray(skillImpacts) 
    ? skillImpacts.map((s: unknown) => {
        const item = s as Record<string, unknown>;
        return {
          skill_id: String(item.skill_id || ''),
          weight: Number(item.weight || 0),
        };
      })
    : [];

  return {
    id: String(row.id),
    organization_id: row.organization_id as string | null,
    name: String(row.name),
    category: String(row.category),
    level: String(row.level),
    importance: String(row.importance),
    skill_impacts: parsedSkillImpacts,
    insignia_ids: (row.insignia_ids as string[]) || [],
    generates_certificate: Boolean(row.generates_certificate),
    certificate_min_score: Number(row.certificate_min_score || 80),
    suggested_xp: Number(row.suggested_xp || 100),
    suggested_coins: Number(row.suggested_coins || 50),
    is_default: Boolean(row.is_default),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function useEvolutionTemplates(orgId?: string) {
  const [templates, setTemplates] = useState<EvolutionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('evolution_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('level', { ascending: true });

      // Get global templates and org-specific ones
      if (orgId) {
        query = query.or(`organization_id.is.null,organization_id.eq.${orgId}`);
      } else {
        query = query.is('organization_id', null);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const parsed = (data || []).map(row => parseTemplate(row as Record<string, unknown>));
      setTemplates(parsed);
    } catch (error) {
      console.error("Error fetching evolution templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Get template for a specific category/level/importance combination
  const getTemplateFor = useCallback((
    category: TemplateCategory,
    level: TemplateLevel,
    importance: TemplateImportance
  ): EvolutionTemplate | undefined => {
    // First try to find exact match with org
    const orgMatch = templates.find(t => 
      t.category === category && 
      t.level === level && 
      t.importance === importance &&
      t.organization_id === orgId
    );
    if (orgMatch) return orgMatch;

    // Then try to find a default/global match
    return templates.find(t => 
      t.category === category && 
      t.level === level && 
      (t.is_default || t.organization_id === null)
    );
  }, [templates, orgId]);

  // Get all templates for a category
  const getTemplatesByCategory = useCallback((category: TemplateCategory) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  // Create a new template (org-specific)
  const createTemplate = useCallback(async (
    template: Omit<EvolutionTemplate, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const dbData = {
        organization_id: orgId,
        name: template.name,
        category: template.category,
        level: template.level,
        importance: template.importance,
        skill_impacts: template.skill_impacts as unknown as Json,
        insignia_ids: template.insignia_ids,
        generates_certificate: template.generates_certificate,
        certificate_min_score: template.certificate_min_score,
        suggested_xp: template.suggested_xp,
        suggested_coins: template.suggested_coins,
        is_default: template.is_default,
      };

      const { data, error } = await supabase
        .from('evolution_templates')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      await fetchTemplates();
      return data;
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }, [orgId, fetchTemplates]);

  // Update a template
  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<EvolutionTemplate>
  ) => {
    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.importance !== undefined) dbUpdates.importance = updates.importance;
      if (updates.skill_impacts !== undefined) dbUpdates.skill_impacts = updates.skill_impacts as unknown as Json;
      if (updates.insignia_ids !== undefined) dbUpdates.insignia_ids = updates.insignia_ids;
      if (updates.generates_certificate !== undefined) dbUpdates.generates_certificate = updates.generates_certificate;
      if (updates.certificate_min_score !== undefined) dbUpdates.certificate_min_score = updates.certificate_min_score;
      if (updates.suggested_xp !== undefined) dbUpdates.suggested_xp = updates.suggested_xp;
      if (updates.suggested_coins !== undefined) dbUpdates.suggested_coins = updates.suggested_coins;
      if (updates.is_default !== undefined) dbUpdates.is_default = updates.is_default;

      const { error } = await supabase
        .from('evolution_templates')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }, [fetchTemplates]);

  // Delete a template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('evolution_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }, [fetchTemplates]);

  // Clone a global template as org-specific
  const cloneTemplate = useCallback(async (templateId: string, customizations?: Partial<EvolutionTemplate>) => {
    const source = templates.find(t => t.id === templateId);
    if (!source) throw new Error("Template not found");

    const { id, created_at, updated_at, is_default, ...templateData } = source;
    
    return createTemplate({
      ...templateData,
      ...customizations,
      organization_id: orgId || null,
      is_default: false,
      name: customizations?.name || `${source.name} (Personalizado)`,
    });
  }, [templates, orgId, createTemplate]);

  return {
    templates,
    isLoading,
    refetch: fetchTemplates,
    getTemplateFor,
    getTemplatesByCategory,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
  };
}
