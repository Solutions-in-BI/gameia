/**
 * useJourneyProgress - Hook para gerenciar progresso do usuário em jornadas
 * Busca progresso, calcula % concluída e gerencia estados de módulos
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JourneyTrainingProgress {
  trainingId: string;
  trainingName: string;
  sortOrder: number;
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

      // Buscar jornada
      const { data: journey, error: journeyError } = await supabase
        .from("training_journeys")
        .select("*")
        .eq("id", journeyId)
        .single();

      if (journeyError) throw journeyError;

      // Buscar treinamentos da jornada
      const { data: journeyTrainings, error: jtError } = await supabase
        .from("journey_trainings")
        .select(`
          id,
          training_id,
          sort_order,
          is_required,
          trainings (
            id,
            name,
            modules_count
          )
        `)
        .eq("journey_id", journeyId)
        .order("sort_order");

      if (jtError) throw jtError;

      // Buscar progresso do usuário na jornada
      const { data: userProgress, error: upError } = await supabase
        .from("user_journey_progress")
        .select("*")
        .eq("journey_id", journeyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (upError) throw upError;

      // Buscar progresso do usuário em cada treinamento
      const trainingIds = journeyTrainings?.map(jt => jt.training_id) || [];
      
      const { data: trainingProgress, error: tpError } = await supabase
        .from("user_training_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("training_id", trainingIds);

      if (tpError) throw tpError;

      // Montar estrutura de progresso
      const trainingsProgress: JourneyTrainingProgress[] = (journeyTrainings || []).map((jt, index) => {
        const training = jt.trainings as { id: string; name: string; modules_count: number } | null;
        const progress = trainingProgress?.find(tp => tp.training_id === jt.training_id);
        
        // Verifica se o anterior está completo para determinar se está bloqueado
        const prevCompleted = index === 0 || 
          trainingProgress?.find(tp => 
            tp.training_id === journeyTrainings[index - 1]?.training_id && 
            tp.progress_percent === 100
          );

        const isCompleted = progress?.progress_percent === 100;
        const isLocked = !prevCompleted;

        return {
          trainingId: jt.training_id,
          trainingName: training?.name || "Treinamento",
          sortOrder: jt.sort_order,
          modulesCount: training?.modules_count || 0,
          completedModules: progress?.completed_modules || 0,
          isCompleted,
          isLocked: isLocked && !isCompleted,
          isCurrent: !isCompleted && !isLocked,
        };
      });

      const completedTrainings = trainingsProgress.filter(t => t.isCompleted).length;
      const totalTrainings = trainingsProgress.length;
      const progressPercent = totalTrainings > 0 
        ? Math.round((completedTrainings / totalTrainings) * 100) 
        : 0;

      const currentTraining = trainingsProgress.find(t => t.isCurrent);

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
        currentModuleId: null, // Será preenchido quando entrar no treinamento
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

  // Iniciar jornada
  const startJourney = useCallback(async () => {
    if (!journeyId || !user) return;

    try {
      const { error } = await supabase
        .from("user_journey_progress")
        .upsert({
          journey_id: journeyId,
          user_id: user.id,
          started_at: new Date().toISOString(),
          progress_percent: 0,
        });

      if (error) throw error;
      
      await fetchProgress();
      toast.success("Jornada iniciada!");
    } catch (err) {
      console.error("Error starting journey:", err);
      toast.error("Erro ao iniciar jornada");
    }
  }, [journeyId, user, fetchProgress]);

  // Completar treinamento dentro da jornada
  const completeTraining = useCallback(async (trainingId: string) => {
    if (!journeyId || !user || !progress) return;

    try {
      // Atualizar progresso do treinamento
      const { error: tpError } = await supabase
        .from("user_training_progress")
        .upsert({
          training_id: trainingId,
          user_id: user.id,
          progress_percent: 100,
          completed_at: new Date().toISOString(),
        });

      if (tpError) throw tpError;

      // Recalcular progresso da jornada
      const newCompletedTrainings = progress.completedTrainings + 1;
      const newProgressPercent = Math.round((newCompletedTrainings / progress.totalTrainings) * 100);
      const isNowComplete = newProgressPercent === 100;

      const { error: jpError } = await supabase
        .from("user_journey_progress")
        .update({
          progress_percent: newProgressPercent,
          current_training_index: newCompletedTrainings,
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
  }, [journeyId, user, progress, fetchProgress]);

  // Verificar se pode acessar um treinamento específico
  const canAccessTraining = useCallback((trainingId: string) => {
    if (!progress) return false;
    const training = progress.trainings.find(t => t.trainingId === trainingId);
    return training && !training.isLocked;
  }, [progress]);

  // Obter próximo treinamento disponível
  const getNextTraining = useCallback(() => {
    if (!progress) return null;
    return progress.trainings.find(t => !t.isCompleted && !t.isLocked);
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
