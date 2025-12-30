/**
 * Hook para gerenciamento de treinamentos
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Training {
  id: string;
  training_key: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  icon: string;
  color: string;
  estimated_hours: number;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  display_order: number;
  organization_id: string | null;
  thumbnail_url: string | null;
  is_onboarding: boolean;
  certificate_enabled: boolean;
  insignia_reward_id: string | null;
  evolution_template_id: string | null;
  evolution_snapshot: Record<string, unknown> | null;
  importance: string | null;
}

export interface TrainingModule {
  id: string;
  training_id: string;
  module_key: string;
  name: string;
  description: string | null;
  content_type: string;
  step_type?: string | null;
  content_data: Record<string, unknown> | null;
  order_index: number;
  xp_reward: number;
  time_minutes: number;
  video_url: string | null;
  thumbnail_url: string | null;
  is_preview: boolean;
  requires_completion: boolean;
  coins_reward: number;
}

export interface UserTrainingProgress {
  id: string;
  user_id: string;
  training_id: string;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number;
}

export interface TrainingCertificate {
  id: string;
  user_id: string;
  training_id: string;
  issued_at: string;
  certificate_number: string;
  pdf_url: string | null;
}

export function useTrainings(orgId?: string) {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserTrainingProgress[]>([]);
  const [userModuleProgress, setUserModuleProgress] = useState<UserModuleProgress[]>([]);
  const [certificates, setCertificates] = useState<TrainingCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      let trainingsQuery = supabase
        .from("trainings")
        .select("*")
        .order("display_order");

      if (orgId) {
        trainingsQuery = trainingsQuery.or(`organization_id.eq.${orgId},organization_id.is.null`);
      }

      const { data: trainingsData, error: trainingsError } = await trainingsQuery;
      if (trainingsError) throw trainingsError;
      setTrainings((trainingsData || []) as Training[]);

      // Fetch all modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("training_modules")
        .select("*")
        .order("order_index");
      if (modulesError) throw modulesError;
      setModules((modulesData || []) as TrainingModule[]);

      // Fetch user progress if logged in
      if (user) {
        const [progressRes, moduleProgressRes, certificatesRes] = await Promise.all([
          supabase
            .from("user_training_progress")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("user_module_progress")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("training_certificates")
            .select("*")
            .eq("user_id", user.id),
        ]);

        setUserProgress((progressRes.data || []) as UserTrainingProgress[]);
        setUserModuleProgress((moduleProgressRes.data || []) as UserModuleProgress[]);
        setCertificates((certificatesRes.data || []) as TrainingCertificate[]);
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, user]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const getTrainingProgress = (trainingId: string) => {
    return userProgress.find((p) => p.training_id === trainingId);
  };

  const getTrainingModules = (trainingId: string) => {
    return modules.filter((m) => m.training_id === trainingId);
  };

  const getModuleProgress = (moduleId: string) => {
    return userModuleProgress.find((p) => p.module_id === moduleId);
  };

  const getCertificate = (trainingId: string) => {
    return certificates.find((c) => c.training_id === trainingId);
  };

  const getOnboardingTrainings = () => {
    return trainings.filter((t) => t.is_onboarding && t.is_active);
  };

  const getInProgressTrainings = () => {
    return trainings.filter((t) => {
      const progress = getTrainingProgress(t.id);
      return progress && !progress.completed_at && progress.progress_percent > 0;
    });
  };

  const getCompletedTrainings = () => {
    return trainings.filter((t) => {
      const progress = getTrainingProgress(t.id);
      return progress?.completed_at;
    });
  };

  // Admin functions
  const createTraining = async (training: Partial<Training>) => {
    const { data, error } = await supabase
      .from("trainings")
      .insert(training as any)
      .select()
      .single();
    if (error) throw error;
    await fetchTrainings();
    return data;
  };

  const updateTraining = async (id: string, training: Partial<Training>) => {
    const { data, error } = await supabase
      .from("trainings")
      .update(training as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    await fetchTrainings();
    return data;
  };

  const deleteTraining = async (id: string) => {
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await fetchTrainings();
  };

  const createModule = async (module: Partial<TrainingModule>) => {
    const { data, error } = await supabase
      .from("training_modules")
      .insert(module as any)
      .select()
      .single();
    if (error) throw error;
    await fetchTrainings();
    return data;
  };

  const updateModule = async (id: string, module: Partial<TrainingModule>) => {
    const { data, error } = await supabase
      .from("training_modules")
      .update(module as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    await fetchTrainings();
    return data;
  };

  const deleteModule = async (id: string) => {
    const { error } = await supabase
      .from("training_modules")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await fetchTrainings();
  };

  const reorderModules = async (moduleIds: string[]) => {
    const updates = moduleIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from("training_modules")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }
    await fetchTrainings();
  };

  return {
    trainings,
    modules,
    userProgress,
    userModuleProgress,
    certificates,
    isLoading,
    refetch: fetchTrainings,
    getTrainingProgress,
    getTrainingModules,
    getModuleProgress,
    getCertificate,
    getOnboardingTrainings,
    getInProgressTrainings,
    getCompletedTrainings,
    // Admin
    createTraining,
    updateTraining,
    deleteTraining,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
  };
}
