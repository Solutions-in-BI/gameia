/**
 * useJourneyProgress - Hook para gerenciar progresso do usuário em jornadas
 * Otimizado com queries paralelas e validação robusta
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JourneyTrainingProgress {
  trainingId: string;
  trainingName: string;
  orderIndex: number;
  modulesCount: number;
  completedModules: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
}

export interface JourneyProgressData {
  journeyId: string;
  journeyName: string;
  totalTrainings: number;
  completedTrainings: number;
  progressPercent: number;
  isStarted: boolean;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  trainings: JourneyTrainingProgress[];
  currentTrainingId: string | null;
  currentModuleId: string | null;
}

export function useJourneyProgress(journeyId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<JourneyProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!journeyId || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Queries paralelas para máxima performance
      const [journeyResult, journeyTrainingsResult, userProgressResult] = await Promise.all([
        supabase
          .from("training_journeys")
          .select("*")
          .eq("id", journeyId)
          .maybeSingle(),

        supabase
          .from("journey_trainings")
          .select(`
            id,
            training_id,
            order_index,
            is_required,
            trainings (
              id,
              name
            )
          `)
          .eq("journey_id", journeyId)
          .order("order_index"),

        supabase
          .from("user_journey_progress")
          .select("*")
          .eq("journey_id", journeyId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (journeyResult.error) throw journeyResult.error;
      if (journeyTrainingsResult.error) throw journeyTrainingsResult.error;
      if (userProgressResult.error) throw userProgressResult.error;

      if (!journeyResult.data) {
        setError("Jornada não encontrada");
        setIsLoading(false);
        return;
      }

      const journey = journeyResult.data;
      const journeyTrainings = journeyTrainingsResult.data || [];
      const userProgress = userProgressResult.data;

      const trainingIds = journeyTrainings.map((jt) => jt.training_id);

      let trainingProgress: any[] = [];
      const modulesCountByTraining: Record<string, number> = {};

      if (trainingIds.length > 0) {
        const [tpRes, modulesRes] = await Promise.all([
          supabase
            .from("user_training_progress")
            .select("*")
            .eq("user_id", user.id)
            .in("training_id", trainingIds),
          supabase
            .from("training_modules")
            .select("id, training_id")
            .in("training_id", trainingIds),
        ]);

        if (tpRes.error) throw tpRes.error;
        if (modulesRes.error) throw modulesRes.error;

        trainingProgress = tpRes.data || [];
        (modulesRes.data || []).forEach((m: any) => {
          modulesCountByTraining[m.training_id] = (modulesCountByTraining[m.training_id] || 0) + 1;
        });
      }

      const trainingsProgress: JourneyTrainingProgress[] = journeyTrainings.map((jt, index) => {
        const training = jt.trainings as any;
        const tProgress = trainingProgress.find((tp: any) => tp.training_id === jt.training_id);

        const prevCompleted =
          index === 0 ||
          trainingProgress.find(
            (tp: any) =>
              tp.training_id === journeyTrainings[index - 1]?.training_id && tp.progress_percent === 100
          );

        const isCompleted = tProgress?.progress_percent === 100;
        const isLocked = !prevCompleted;

        return {
          trainingId: jt.training_id,
          trainingName: training?.name || "Treinamento",
          orderIndex: jt.order_index,
          modulesCount: modulesCountByTraining[jt.training_id] || 0,
          completedModules: tProgress?.current_module_index || 0,
          isCompleted,
          isLocked: isLocked && !isCompleted,
          isCurrent: !isCompleted && !isLocked,
        };
      });

      const completedTrainings = trainingsProgress.filter((t) => t.isCompleted).length;
      const totalTrainings = trainingsProgress.length;
      const progressPercent = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;
      const currentTraining = trainingsProgress.find((t) => t.isCurrent);

      setProgress({
        journeyId,
        journeyName: journey.name,
        totalTrainings,
        completedTrainings,
        progressPercent,
        isStarted: !!userProgress?.started_at,
        isCompleted: progressPercent === 100,
        startedAt: userProgress?.started_at || null,
        completedAt: userProgress?.completed_at || null,
        trainings: trainingsProgress,
        currentTrainingId: currentTraining?.trainingId || null,
        currentModuleId: null,
      });
    } catch (err) {
      console.error("Error fetching journey progress:", err);
      setError("Erro ao carregar progresso da jornada");
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const startJourney = useCallback(async (): Promise<boolean> => {
    if (!journeyId || journeyId.trim() === "") {
      console.error("startJourney: journeyId is missing or empty");
      toast.error("Erro: ID da jornada inválido");
      return false;
    }

    if (!user?.id || user.id.trim() === "") {
      console.error("startJourney: user is not authenticated");
      toast.error("Erro: Faça login para iniciar a jornada");
      return false;
    }

    try {
      const { error } = await supabase
        .from("user_journey_progress")
        .upsert(
          {
            journey_id: journeyId,
            user_id: user.id,
            started_at: new Date().toISOString(),
            trainings_completed: 0,
          },
          { onConflict: "journey_id,user_id" }
        );

      if (error) {
        console.error("startJourney upsert error:", error);
        throw error;
      }

      await fetchProgress();
      toast.success("Jornada iniciada!");
      return true;
    } catch (err) {
      console.error("Error starting journey:", err);
      toast.error("Erro ao iniciar jornada. Tente novamente.");
      return false;
    }
  }, [journeyId, user, fetchProgress]);

  const completeTraining = useCallback(
    async (trainingId: string) => {
      if (!journeyId || !user || !progress) return;

      try {
        const { error: tpError } = await supabase.from("user_training_progress").upsert({
          training_id: trainingId,
          user_id: user.id,
          progress_percent: 100,
          completed_at: new Date().toISOString(),
        });

        if (tpError) throw tpError;

        const newCompletedTrainings = progress.completedTrainings + 1;
        const newProgressPercent = Math.round((newCompletedTrainings / progress.totalTrainings) * 100);
        const isNowComplete = newProgressPercent === 100;

        const { error: jpError } = await supabase
          .from("user_journey_progress")
          .update({
            trainings_completed: newCompletedTrainings,
            completed_at: isNowComplete ? new Date().toISOString() : null,
          })
          .eq("journey_id", journeyId)
          .eq("user_id", user.id);

        if (jpError) throw jpError;

        await fetchProgress();

        if (isNowComplete) {
          toast.success("🎉 Jornada concluída! Parabéns!");
        } else {
          toast.success("Treinamento concluído!");
        }
      } catch (err) {
        console.error("Error completing training:", err);
        toast.error("Erro ao completar treinamento");
      }
    },
    [journeyId, user, progress, fetchProgress]
  );

  const canAccessTraining = useCallback(
    (trainingId: string) => {
      if (!progress) return false;
      const training = progress.trainings.find((t) => t.trainingId === trainingId);
      return !!training && !training.isLocked;
    },
    [progress]
  );

  const getNextTraining = useCallback(() => {
    if (!progress) return null;
    return progress.trainings.find((t) => !t.isCompleted && !t.isLocked);
  }, [progress]);

  return {
    progress,
    isLoading,
    error,
    startJourney,
    completeTraining,
    canAccessTraining,
    getNextTraining,
    refresh: fetchProgress,
  };
}
