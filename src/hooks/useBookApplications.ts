/**
 * Hook para gerenciar aplicações práticas de treinamentos guiados por livro
 * Usado pela visão do gestor para acompanhar a equipe
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BookApplication {
  applicationId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  moduleId: string;
  moduleName: string | null;
  trainingId: string;
  trainingName: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  evidenceType: string | null;
  evidenceContent: string | null;
  evidenceUrl: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  deadlineAt: Date | null;
  isLate: boolean;
  managerFeedback: string | null;
  managerViewedAt: Date | null;
  reflectionSummary: string | null;
}

export interface BookApplicationSummary {
  id: string;
  organizationId: string;
  trainingId: string | null;
  moduleId: string | null;
  periodStart: Date;
  periodEnd: Date;
  aiSummary: string | null;
  keyInsights: Array<{ theme: string; count: number; percentage: number }>;
  commonThemes: Array<{ theme: string; count: number; percentage: number }>;
  participationRate: number;
  onTimeRate: number;
  totalApplications: number;
  completedOnTime: number;
  completedLate: number;
  pending: number;
  generatedAt: Date;
}

export interface TeamBookStats {
  totalApplications: number;
  completed: number;
  inProgress: number;
  completedOnTime: number;
  completedLate: number;
  onTimeRate: number;
  participationRate: number;
}

export interface UseBookApplicationsResult {
  applications: BookApplication[];
  summary: BookApplicationSummary | null;
  stats: TeamBookStats;
  isLoading: boolean;
  error: string | null;
  fetchApplications: (organizationId: string, trainingId?: string, status?: string) => Promise<void>;
  provideFeedback: (applicationId: string, feedback: string) => Promise<void>;
  markAsViewed: (applicationId: string) => Promise<void>;
  generateInsights: (organizationId: string, trainingId?: string) => Promise<BookApplicationSummary | null>;
}

export function useBookApplications(): UseBookApplicationsResult {
  const { user } = useAuth();
  const [applications, setApplications] = useState<BookApplication[]>([]);
  const [summary, setSummary] = useState<BookApplicationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (
    organizationId: string,
    trainingId?: string,
    status?: string
  ) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try RPC first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_team_book_applications', {
          p_organization_id: organizationId,
          p_training_id: trainingId || null,
          p_status: status || null
        });

      if (!rpcError && rpcData) {
        const formattedApps: BookApplication[] = rpcData.map((app: any) => ({
          applicationId: app.application_id,
          userId: app.user_id,
          userName: app.user_name || 'Usuário',
          userAvatar: app.user_avatar,
          moduleId: app.module_id,
          moduleName: app.module_name,
          trainingId: app.training_id,
          trainingName: app.training_name,
          status: app.status,
          evidenceType: app.evidence_type,
          evidenceContent: app.evidence_content,
          evidenceUrl: app.evidence_url,
          startedAt: app.started_at ? new Date(app.started_at) : null,
          completedAt: app.completed_at ? new Date(app.completed_at) : null,
          deadlineAt: app.deadline_at ? new Date(app.deadline_at) : null,
          isLate: app.is_late || false,
          managerFeedback: app.manager_feedback,
          managerViewedAt: app.manager_viewed_at ? new Date(app.manager_viewed_at) : null,
          reflectionSummary: app.reflection_summary,
        }));
        setApplications(formattedApps);
        return;
      }

      // Fallback direct query
      let query = supabase
        .from('routine_applications')
        .select(`
          id,
          user_id,
          module_id,
          training_id,
          status,
          evidence_type,
          evidence_content,
          evidence_url,
          started_at,
          completed_at,
          deadline_at,
          is_late,
          manager_feedback,
          manager_viewed_at,
          reflection_summary
        `)
        .order('started_at', { ascending: false });

      if (trainingId) {
        query = query.eq('training_id', trainingId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const formattedApps: BookApplication[] = (data || []).map((app: any) => ({
        applicationId: app.id,
        userId: app.user_id,
        userName: 'Usuário',
        userAvatar: null,
        moduleId: app.module_id,
        moduleName: null,
        trainingId: app.training_id,
        trainingName: null,
        status: app.status,
        evidenceType: app.evidence_type,
        evidenceContent: app.evidence_content,
        evidenceUrl: app.evidence_url,
        startedAt: app.started_at ? new Date(app.started_at) : null,
        completedAt: app.completed_at ? new Date(app.completed_at) : null,
        deadlineAt: app.deadline_at ? new Date(app.deadline_at) : null,
        isLate: app.is_late || false,
        managerFeedback: app.manager_feedback,
        managerViewedAt: app.manager_viewed_at ? new Date(app.manager_viewed_at) : null,
        reflectionSummary: app.reflection_summary,
      }));

      setApplications(formattedApps);
    } catch (err) {
      console.error('Error fetching book applications:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar aplicações');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const provideFeedback = useCallback(async (applicationId: string, feedback: string) => {
    if (!user) return;

    try {
      await supabase
        .from('routine_applications')
        .update({ 
          manager_feedback: feedback,
          manager_viewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.applicationId === applicationId 
            ? { ...app, managerFeedback: feedback, managerViewedAt: new Date() }
            : app
        )
      );
    } catch (err) {
      console.error('Error providing feedback:', err);
      throw err;
    }
  }, [user]);

  const markAsViewed = useCallback(async (applicationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('routine_applications')
        .update({ manager_viewed_at: new Date().toISOString() })
        .eq('id', applicationId);

      setApplications(prev => 
        prev.map(app => 
          app.applicationId === applicationId 
            ? { ...app, managerViewedAt: new Date() }
            : app
        )
      );
    } catch (err) {
      console.error('Error marking as viewed:', err);
    }
  }, [user]);

  const generateInsights = useCallback(async (
    organizationId: string,
    trainingId?: string
  ): Promise<BookApplicationSummary | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-book-insights', {
        body: { organization_id: organizationId, training_id: trainingId }
      });

      if (fnError) throw fnError;

      if (data?.summary) {
        const formattedSummary: BookApplicationSummary = {
          id: data.summary.id,
          organizationId: data.summary.organization_id,
          trainingId: data.summary.training_id,
          moduleId: data.summary.module_id,
          periodStart: new Date(data.summary.period_start),
          periodEnd: new Date(data.summary.period_end),
          aiSummary: data.summary.ai_summary,
          keyInsights: data.summary.key_insights || [],
          commonThemes: data.summary.common_themes || [],
          participationRate: data.summary.participation_rate,
          onTimeRate: data.summary.on_time_rate,
          totalApplications: data.summary.total_applications,
          completedOnTime: data.summary.completed_on_time,
          completedLate: data.summary.completed_late,
          pending: data.summary.pending,
          generatedAt: new Date(data.summary.generated_at),
        };
        setSummary(formattedSummary);
        return formattedSummary;
      }

      return null;
    } catch (err) {
      console.error('Error generating insights:', err);
      throw err;
    }
  }, []);

  // Calculate stats from applications
  const stats: TeamBookStats = {
    totalApplications: applications.length,
    completed: applications.filter(a => a.status === 'completed').length,
    inProgress: applications.filter(a => a.status === 'in_progress').length,
    completedOnTime: applications.filter(a => a.status === 'completed' && !a.isLate).length,
    completedLate: applications.filter(a => a.status === 'completed' && a.isLate).length,
    onTimeRate: applications.filter(a => a.status === 'completed').length > 0
      ? (applications.filter(a => a.status === 'completed' && !a.isLate).length / 
         applications.filter(a => a.status === 'completed').length) * 100
      : 0,
    participationRate: applications.length > 0
      ? (applications.filter(a => a.status === 'completed').length / applications.length) * 100
      : 0,
  };

  return {
    applications,
    summary,
    stats,
    isLoading,
    error,
    fetchApplications,
    provideFeedback,
    markAsViewed,
    generateInsights,
  };
}
