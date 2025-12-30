/**
 * useTrainingJourneys - Hook para gerenciar Jornadas de Treinamentos
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JourneyTraining {
  id: string;
  journey_id: string;
  training_id: string;
  order_index: number;
  is_required: boolean;
  prerequisite_training_id: string | null;
  training?: {
    id: string;
    name: string;
    description: string | null;
    estimated_hours: number;
    xp_reward: number;
    coins_reward: number;
    skill_ids: string[] | null;
    thumbnail_url: string | null;
    status: string;
  };
}

export interface TrainingJourney {
  id: string;
  organization_id: string | null;
  journey_key: string;
  name: string;
  description: string | null;
  category: string;
  level: string;
  importance: string;
  icon: string;
  color: string;
  thumbnail_url: string | null;
  order_type: 'sequential' | 'flexible';
  is_active: boolean;
  display_order: number;
  bonus_xp: number;
  bonus_coins: number;
  bonus_insignia_id: string | null;
  bonus_item_ids: string[];
  generates_certificate: boolean;
  certificate_name: string | null;
  evolution_template_id: string | null;
  total_estimated_hours: number;
  total_trainings: number;
  total_xp: number;
  total_coins: number;
  aggregated_skills: string[];
  created_at: string;
  updated_at: string;
  trainings?: JourneyTraining[];
}

export interface UserJourneyProgress {
  id: string;
  user_id: string;
  journey_id: string;
  organization_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  trainings_completed: number;
  total_xp_earned: number;
  total_coins_earned: number;
  bonus_claimed: boolean;
  certificate_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJourneyData {
  journey_key: string;
  name: string;
  description?: string;
  category: string;
  level: string;
  importance?: string;
  icon?: string;
  color?: string;
  thumbnail_url?: string;
  order_type?: 'sequential' | 'flexible';
  bonus_xp?: number;
  bonus_coins?: number;
  bonus_insignia_id?: string;
  bonus_item_ids?: string[];
  generates_certificate?: boolean;
  certificate_name?: string;
  evolution_template_id?: string;
  trainings?: { training_id: string; order_index: number; is_required: boolean; prerequisite_training_id?: string }[];
}

export const JOURNEY_CATEGORIES = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'lideranca', label: 'Liderança' },
  { value: 'soft_skills', label: 'Soft Skills' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'geral', label: 'Geral' },
] as const;

export const JOURNEY_LEVELS = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'especialista', label: 'Especialista' },
] as const;

export const JOURNEY_IMPORTANCE = [
  { value: 'essencial', label: 'Essencial' },
  { value: 'estrategico', label: 'Estratégico' },
  { value: 'complementar', label: 'Complementar' },
] as const;

export function useTrainingJourneys(orgId?: string) {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<TrainingJourney[]>([]);
  const [userProgress, setUserProgress] = useState<UserJourneyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse journey from DB row
  const parseJourney = (row: Record<string, unknown>): TrainingJourney => ({
    id: String(row.id),
    organization_id: row.organization_id as string | null,
    journey_key: String(row.journey_key),
    name: String(row.name),
    description: row.description as string | null,
    category: String(row.category),
    level: String(row.level),
    importance: String(row.importance || 'estrategico'),
    icon: String(row.icon || 'Route'),
    color: String(row.color || '#6366f1'),
    thumbnail_url: row.thumbnail_url as string | null,
    order_type: (row.order_type as 'sequential' | 'flexible') || 'sequential',
    is_active: Boolean(row.is_active),
    display_order: Number(row.display_order || 0),
    bonus_xp: Number(row.bonus_xp || 0),
    bonus_coins: Number(row.bonus_coins || 0),
    bonus_insignia_id: row.bonus_insignia_id as string | null,
    bonus_item_ids: Array.isArray(row.bonus_item_ids) ? row.bonus_item_ids : [],
    generates_certificate: Boolean(row.generates_certificate),
    certificate_name: row.certificate_name as string | null,
    evolution_template_id: row.evolution_template_id as string | null,
    total_estimated_hours: Number(row.total_estimated_hours || 0),
    total_trainings: Number(row.total_trainings || 0),
    total_xp: Number(row.total_xp || 0),
    total_coins: Number(row.total_coins || 0),
    aggregated_skills: Array.isArray(row.aggregated_skills) ? row.aggregated_skills : [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  });

  // Fetch all journeys
  const fetchJourneys = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('training_journeys')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const parsed = (data || []).map(row => parseJourney(row as Record<string, unknown>));
      setJourneys(parsed);
    } catch (error) {
      console.error("Error fetching journeys:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  // Fetch journey trainings
  const fetchJourneyTrainings = useCallback(async (journeyId: string): Promise<JourneyTraining[]> => {
    try {
      const { data, error } = await supabase
        .from('journey_trainings')
        .select(`
          *,
          training:trainings(id, name, description, estimated_hours, xp_reward, coins_reward, skill_ids, thumbnail_url, status)
        `)
        .eq('journey_id', journeyId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        journey_id: row.journey_id,
        training_id: row.training_id,
        order_index: row.order_index,
        is_required: row.is_required,
        prerequisite_training_id: row.prerequisite_training_id,
        training: row.training as JourneyTraining['training'],
      }));
    } catch (error) {
      console.error("Error fetching journey trainings:", error);
      return [];
    }
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserProgress((data || []).map(row => ({
        id: row.id,
        user_id: row.user_id,
        journey_id: row.journey_id,
        organization_id: row.organization_id,
        status: row.status as 'not_started' | 'in_progress' | 'completed',
        started_at: row.started_at,
        completed_at: row.completed_at,
        trainings_completed: row.trainings_completed,
        total_xp_earned: row.total_xp_earned,
        total_coins_earned: row.total_coins_earned,
        bonus_claimed: row.bonus_claimed,
        certificate_issued_at: row.certificate_issued_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })));
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchJourneys();
    fetchUserProgress();
  }, [fetchJourneys, fetchUserProgress]);

  // Get progress for a specific journey
  const getJourneyProgress = useCallback((journeyId: string): UserJourneyProgress | undefined => {
    return userProgress.find(p => p.journey_id === journeyId);
  }, [userProgress]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback((journeyId: string): number => {
    const journey = journeys.find(j => j.id === journeyId);
    const progress = getJourneyProgress(journeyId);
    
    if (!journey || journey.total_trainings === 0) return 0;
    if (!progress) return 0;
    
    return Math.round((progress.trainings_completed / journey.total_trainings) * 100);
  }, [journeys, getJourneyProgress]);

  // Create a new journey
  const createJourney = useCallback(async (data: CreateJourneyData) => {
    try {
      const { trainings, ...journeyData } = data;

      const { data: newJourney, error } = await supabase
        .from('training_journeys')
        .insert({
          ...journeyData,
          organization_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add trainings if provided
      if (trainings && trainings.length > 0 && newJourney) {
        const { error: trainingsError } = await supabase
          .from('journey_trainings')
          .insert(trainings.map(t => ({
            journey_id: newJourney.id,
            training_id: t.training_id,
            order_index: t.order_index,
            is_required: t.is_required,
            prerequisite_training_id: t.prerequisite_training_id,
          })));

        if (trainingsError) throw trainingsError;
      }

      toast.success("Jornada criada com sucesso!");
      await fetchJourneys();
      return newJourney;
    } catch (error) {
      console.error("Error creating journey:", error);
      toast.error("Erro ao criar jornada");
      throw error;
    }
  }, [orgId, fetchJourneys]);

  // Update journey
  const updateJourney = useCallback(async (
    journeyId: string,
    data: Partial<CreateJourneyData>
  ) => {
    try {
      const { trainings, ...journeyData } = data;

      const { error } = await supabase
        .from('training_journeys')
        .update(journeyData)
        .eq('id', journeyId);

      if (error) throw error;

      // Update trainings if provided
      if (trainings !== undefined) {
        // Remove existing
        await supabase
          .from('journey_trainings')
          .delete()
          .eq('journey_id', journeyId);

        // Add new
        if (trainings.length > 0) {
          const { error: trainingsError } = await supabase
            .from('journey_trainings')
            .insert(trainings.map(t => ({
              journey_id: journeyId,
              training_id: t.training_id,
              order_index: t.order_index,
              is_required: t.is_required,
              prerequisite_training_id: t.prerequisite_training_id,
            })));

          if (trainingsError) throw trainingsError;
        }
      }

      toast.success("Jornada atualizada!");
      await fetchJourneys();
    } catch (error) {
      console.error("Error updating journey:", error);
      toast.error("Erro ao atualizar jornada");
      throw error;
    }
  }, [fetchJourneys]);

  // Delete journey
  const deleteJourney = useCallback(async (journeyId: string) => {
    try {
      const { error } = await supabase
        .from('training_journeys')
        .delete()
        .eq('id', journeyId);

      if (error) throw error;

      toast.success("Jornada excluída!");
      await fetchJourneys();
    } catch (error) {
      console.error("Error deleting journey:", error);
      toast.error("Erro ao excluir jornada");
      throw error;
    }
  }, [fetchJourneys]);

  // Toggle active status
  const toggleActive = useCallback(async (journeyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('training_journeys')
        .update({ is_active: isActive })
        .eq('id', journeyId);

      if (error) throw error;
      await fetchJourneys();
    } catch (error) {
      console.error("Error toggling journey status:", error);
      throw error;
    }
  }, [fetchJourneys]);

  // Start journey for user
  const startJourney = useCallback(async (journeyId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_journey_progress')
        .upsert({
          user_id: user.id,
          journey_id: journeyId,
          organization_id: orgId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Jornada iniciada!");
      await fetchUserProgress();
    } catch (error) {
      console.error("Error starting journey:", error);
      toast.error("Erro ao iniciar jornada");
      throw error;
    }
  }, [user?.id, orgId, fetchUserProgress]);

  // Get active journeys
  const getActiveJourneys = useCallback(() => {
    return journeys.filter(j => j.is_active);
  }, [journeys]);

  // Get journeys by category
  const getJourneysByCategory = useCallback((category: string) => {
    return journeys.filter(j => j.category === category);
  }, [journeys]);

  // Get journeys by level
  const getJourneysByLevel = useCallback((level: string) => {
    return journeys.filter(j => j.level === level);
  }, [journeys]);

  return {
    journeys,
    userProgress,
    isLoading,
    refetch: fetchJourneys,
    fetchJourneyTrainings,
    getJourneyProgress,
    getCompletionPercentage,
    createJourney,
    updateJourney,
    deleteJourney,
    toggleActive,
    startJourney,
    getActiveJourneys,
    getJourneysByCategory,
    getJourneysByLevel,
  };
}
