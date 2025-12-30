/**
 * Hook para gerenciar Próximos Passos do usuário
 * Agrega dados de múltiplas fontes: aplicações práticas, missões, ações de 1:1, PDI
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type StepType = 'book_application' | 'daily_mission' | '1on1_action' | 'pdi_goal' | 'training_module' | 'commitment';
export type StepPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface NextStep {
  id: string;
  stepType: StepType;
  sourceId: string;
  sourceTable: string;
  title: string;
  description: string | null;
  deadlineAt: Date | null;
  priority: StepPriority;
  sourceContext: Record<string, unknown>;
  daysRemaining: number | null;
  isOverdue: boolean;
  createdAt?: Date;
}

export interface UseNextStepsResult {
  steps: NextStep[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeStep: (stepId: string) => Promise<void>;
  getStepsByType: (type: StepType) => NextStep[];
  urgentCount: number;
  overdueCount: number;
}

export function useNextSteps(): UseNextStepsResult {
  const { user } = useAuth();
  const [steps, setSteps] = useState<NextStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNextSteps = useCallback(async () => {
    if (!user) {
      setSteps([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_next_steps', { p_user_id: user.id });

      if (!rpcError && rpcData) {
        const formattedSteps: NextStep[] = rpcData.map((step: any) => ({
          id: step.id,
          stepType: step.step_type as StepType,
          sourceId: step.source_id,
          sourceTable: step.source_table,
          title: step.title,
          description: step.description,
          deadlineAt: step.deadline_at ? new Date(step.deadline_at) : null,
          priority: step.priority as StepPriority,
          sourceContext: step.source_context || {},
          daysRemaining: step.days_remaining,
          isOverdue: step.is_overdue || false,
        }));
        setSteps(formattedSteps);
        return;
      }

      // Fallback: Direct query
      const { data: directData, error: directError } = await supabase
        .from('user_next_steps')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('deadline_at', { ascending: true, nullsFirst: false });

      if (directError) throw directError;

      const formattedSteps: NextStep[] = (directData || []).map((step: any) => {
        const deadlineAt = step.deadline_at ? new Date(step.deadline_at) : null;
        const now = new Date();
        const daysRemaining = deadlineAt 
          ? Math.ceil((deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: step.id,
          stepType: step.step_type as StepType,
          sourceId: step.source_id,
          sourceTable: step.source_table,
          title: step.title,
          description: step.description,
          deadlineAt,
          priority: step.priority as StepPriority,
          sourceContext: step.source_context || {},
          daysRemaining,
          isOverdue: deadlineAt ? deadlineAt < now : false,
          createdAt: step.created_at ? new Date(step.created_at) : undefined,
        };
      });

      // Sort by priority and deadline
      formattedSteps.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.deadlineAt && b.deadlineAt) {
          return a.deadlineAt.getTime() - b.deadlineAt.getTime();
        }
        return a.deadlineAt ? -1 : 1;
      });

      setSteps(formattedSteps);
    } catch (err) {
      console.error('Error fetching next steps:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar próximos passos');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const completeStep = useCallback(async (stepId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_next_steps')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .eq('user_id', user.id);

      // Remove from local state
      setSteps(prev => prev.filter(s => s.id !== stepId));
    } catch (err) {
      console.error('Error completing step:', err);
      throw err;
    }
  }, [user]);

  const getStepsByType = useCallback((type: StepType) => {
    return steps.filter(s => s.stepType === type);
  }, [steps]);

  const urgentCount = useMemo(() => {
    return steps.filter(s => s.priority === 'urgent' || s.isOverdue).length;
  }, [steps]);

  const overdueCount = useMemo(() => {
    return steps.filter(s => s.isOverdue).length;
  }, [steps]);

  useEffect(() => {
    fetchNextSteps();
  }, [fetchNextSteps]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('next-steps-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_next_steps',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNextSteps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNextSteps]);

  return {
    steps,
    isLoading,
    error,
    refetch: fetchNextSteps,
    completeStep,
    getStepsByType,
    urgentCount,
    overdueCount,
  };
}
