/**
 * useEvolutionTemplates - Hook para gerenciar Evolution Templates
 * Templates que definem automaticamente skills, insígnias e recompensas
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Parse skill_impacts from JSON
      const parsed = (data || []).map(t => ({
        ...t,
        skill_impacts: Array.isArray(t.skill_impacts) ? t.skill_impacts : [],
        insignia_ids: t.insignia_ids || [],
      })) as EvolutionTemplate[];
      
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
      const { data, error } = await supabase
        .from('evolution_templates')
        .insert({
          ...template,
          organization_id: orgId,
          skill_impacts: template.skill_impacts,
        })
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
      const { error } = await supabase
        .from('evolution_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
