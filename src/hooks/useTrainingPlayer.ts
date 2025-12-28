/**
 * Hook para gerenciamento do player de módulos
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Training, TrainingModule, UserModuleProgress, UserTrainingProgress } from "./useTrainings";

interface UseTrainingPlayerProps {
  trainingId: string;
  moduleId?: string;
}

export function useTrainingPlayer({ trainingId, moduleId }: UseTrainingPlayerProps) {
  const { user } = useAuth();
  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<UserTrainingProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, UserModuleProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const fetchData = useCallback(async () => {
    if (!trainingId) return;
    
    setIsLoading(true);
    try {
      // Fetch training
      const { data: trainingData, error: trainingError } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", trainingId)
        .single();
      if (trainingError) throw trainingError;
      setTraining(trainingData as Training);

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("training_modules")
        .select("*")
        .eq("training_id", trainingId)
        .order("order_index");
      if (modulesError) throw modulesError;
      setModules((modulesData || []) as TrainingModule[]);

      // Set current module
      if (moduleId) {
        const current = modulesData?.find((m) => m.id === moduleId);
        setCurrentModule(current as TrainingModule || null);
      } else if (modulesData && modulesData.length > 0) {
        setCurrentModule(modulesData[0] as TrainingModule);
      }

      // Fetch user progress
      if (user) {
        const { data: progressData } = await supabase
          .from("user_training_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("training_id", trainingId)
          .single();
        setTrainingProgress(progressData as UserTrainingProgress | null);

        const { data: moduleProgressData } = await supabase
          .from("user_module_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("module_id", modulesData?.map((m) => m.id) || []);

        const progressMap: Record<string, UserModuleProgress> = {};
        (moduleProgressData || []).forEach((p) => {
          progressMap[(p as UserModuleProgress).module_id] = p as UserModuleProgress;
        });
        setModuleProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching training data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [trainingId, moduleId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startModule = async (moduleId: string) => {
    if (!user) return;

    const existing = moduleProgress[moduleId];
    if (existing) return;

    const { data, error } = await supabase
      .from("user_module_progress")
      .insert({
        user_id: user.id,
        module_id: moduleId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setModuleProgress((prev) => ({
        ...prev,
        [moduleId]: data as UserModuleProgress,
      }));
    }

    // Start training progress if not exists
    if (!trainingProgress) {
      const { data: progressData } = await supabase
        .from("user_training_progress")
        .insert({
          user_id: user.id,
          training_id: trainingId,
          started_at: new Date().toISOString(),
          progress_percent: 0,
        })
        .select()
        .single();
      if (progressData) {
        setTrainingProgress(progressData as UserTrainingProgress);
      }
    }
  };

  const completeModule = async (moduleId: string) => {
    if (!user) return;

    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    // Update module progress
    const { error } = await supabase
      .from("user_module_progress")
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error completing module:", error);
      return;
    }

    // Award XP and coins
    if (module.xp_reward > 0 || module.coins_reward > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Log reward transaction
        await supabase.from("reward_transactions").insert({
          user_id: user.id,
          transaction_type: "training_module",
          source_type: "training_module",
          source_id: moduleId,
          amount: module.xp_reward,
          metadata: { coins: module.coins_reward, module_name: module.name },
        });
      }

      toast.success(`+${module.xp_reward} XP e +${module.coins_reward} moedas!`);
    }

    // Calculate new training progress
    const completedModules = Object.values(moduleProgress).filter((p) => p.completed_at).length + 1;
    const totalModules = modules.length;
    const newProgress = Math.round((completedModules / totalModules) * 100);

    // Update training progress
    const isCompleted = completedModules === totalModules;
    const { data: updatedProgress } = await supabase
      .from("user_training_progress")
      .upsert({
        user_id: user.id,
        training_id: trainingId,
        progress_percent: newProgress,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (updatedProgress) {
      setTrainingProgress(updatedProgress as UserTrainingProgress);
    }

    // Update local state
    setModuleProgress((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        completed_at: new Date().toISOString(),
      } as UserModuleProgress,
    }));

    await fetchData();

    return isCompleted;
  };

  const updateVideoProgress = async (moduleId: string, progress: number, timeSpent: number) => {
    if (!user) return;

    setVideoProgress(progress);

    // Save progress periodically
    await supabase
      .from("user_module_progress")
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        time_spent_seconds: timeSpent,
      });
  };

  const goToNextModule = () => {
    if (!currentModule) return null;
    const currentIndex = modules.findIndex((m) => m.id === currentModule.id);
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      setCurrentModule(nextModule);
      return nextModule;
    }
    return null;
  };

  const goToPrevModule = () => {
    if (!currentModule) return null;
    const currentIndex = modules.findIndex((m) => m.id === currentModule.id);
    if (currentIndex > 0) {
      const prevModule = modules[currentIndex - 1];
      setCurrentModule(prevModule);
      return prevModule;
    }
    return null;
  };

  const isModuleCompleted = (moduleId: string) => {
    return !!moduleProgress[moduleId]?.completed_at;
  };

  const isModuleLocked = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return true;
    if (module.is_preview) return false;
    
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === 0) return false;

    // Check if previous module is completed
    const prevModule = modules[moduleIndex - 1];
    return prevModule && prevModule.requires_completion && !isModuleCompleted(prevModule.id);
  };

  const getNextIncompleteModule = () => {
    return modules.find((m) => !isModuleCompleted(m.id) && !isModuleLocked(m.id));
  };

  return {
    training,
    modules,
    currentModule,
    trainingProgress,
    moduleProgress,
    isLoading,
    videoProgress,
    startModule,
    completeModule,
    updateVideoProgress,
    goToNextModule,
    goToPrevModule,
    setCurrentModule,
    isModuleCompleted,
    isModuleLocked,
    getNextIncompleteModule,
    refetch: fetchData,
  };
}
