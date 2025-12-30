/**
 * Hook para Avaliações do Gestor
 * Gerencia dados do avaliado e avaliações do gestor
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export interface EmployeeContext {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  department: string | null;
  jobTitle: string | null;
  // Activity stats
  trainingsCompleted: number;
  challengesCompleted: number;
  gamesPlayed: number;
  currentStreak: number;
  totalXp: number;
  // Recent activities
  recentTrainings: { id: string; name: string; completedAt: string; score: number }[];
  recentChallenges: { id: string; name: string; completedAt: string; status: string }[];
  // Skills
  topSkills: { id: string; name: string; level: number }[];
  weakSkills: { id: string; name: string; level: number }[];
  // Previous assessments
  previousAssessments: { date: string; score: number; type: string }[];
}

export interface ManagerAssessmentResponse {
  questionId: string;
  value: number;
  comment?: string;
}

export interface ManagerAssessmentData {
  evaluateeId: string;
  responses: ManagerAssessmentResponse[];
  directionNotes?: string;
  strengths: string[];
  developmentAreas: string[];
}

export function useManagerAssessment(evaluateeId?: string) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const organizationId = currentOrg?.id;

  // Fetch team members for manager
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['manager-team', user?.id, organizationId],
    queryFn: async () => {
      if (!user?.id || !organizationId) return [];

      // Get team members from organization
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, department, job_title')
        .eq('current_organization_id', organizationId)
        .neq('id', user.id)
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!organizationId,
  });

  // Fetch employee context for assessment
  const { data: employeeContext, isLoading: contextLoading } = useQuery({
    queryKey: ['employee-context', evaluateeId],
    queryFn: async (): Promise<EmployeeContext | null> => {
      if (!evaluateeId) return null;

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, department, job_title')
        .eq('id', evaluateeId)
        .single();

      if (profileError) throw profileError;

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, total_active_days')
        .eq('user_id', evaluateeId)
        .single();

      // Count completed trainings from core_events
      const { count: trainingsCount } = await supabase
        .from('core_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', evaluateeId)
        .eq('event_type', 'TREINAMENTO_CONCLUIDO');

      // Count completed challenges from core_events
      const { count: challengesCount } = await supabase
        .from('core_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', evaluateeId)
        .eq('event_type', 'DESAFIO_CONCLUIDO');

      // Count games from core_events
      const { count: gamesCount } = await supabase
        .from('core_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', evaluateeId)
        .eq('event_type', 'JOGO_CONCLUIDO');

      // Get total XP from user_xp_history
      const { data: xpData } = await supabase
        .from('user_xp_history')
        .select('xp_earned')
        .eq('user_id', evaluateeId);

      const totalXp = (xpData || []).reduce((sum, x) => sum + (x.xp_earned || 0), 0);

      // Fetch recent module progress as training proxy
      const { data: recentModules } = await supabase
        .from('user_module_progress')
        .select('module_id, completed_at, score')
        .eq('user_id', evaluateeId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);

      // Fetch recent challenges from commitment_participants
      const { data: recentChallenges } = await supabase
        .from('commitment_participants')
        .select('commitment_id, joined_at, contributed')
        .eq('user_id', evaluateeId)
        .order('joined_at', { ascending: false })
        .limit(5);

      // Fetch skill levels
      const { data: skillLevels } = await supabase
        .from('user_skill_levels')
        .select('skill_id, current_level')
        .eq('user_id', evaluateeId)
        .order('current_level', { ascending: false })
        .limit(10);

      // Fetch skill names separately
      const skillIds = (skillLevels || []).map(s => s.skill_id);
      const { data: skillNames } = skillIds.length > 0 
        ? await supabase
            .from('skill_configurations')
            .select('id, name')
            .in('id', skillIds)
        : { data: [] };

      const skillNameMap = (skillNames || []).reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
      }, {} as Record<string, string>);

      // Fetch previous manager assessments
      const { data: previousAssessments } = await supabase
        .from('manager_assessments')
        .select('created_at, total_score, assessment_type')
        .eq('evaluatee_id', evaluateeId)
        .order('created_at', { ascending: false })
        .limit(5);

      const topSkills = (skillLevels || []).slice(0, 3).map(s => ({
        id: s.skill_id,
        name: skillNameMap[s.skill_id] || 'Skill',
        level: s.current_level,
      }));

      const weakSkills = (skillLevels || [])
        .slice(-3)
        .reverse()
        .map(s => ({
          id: s.skill_id,
          name: skillNameMap[s.skill_id] || 'Skill',
          level: s.current_level,
        }));

      return {
        userId: profile.id,
        nickname: profile.nickname || 'Usuário',
        avatarUrl: profile.avatar_url,
        department: profile.department,
        jobTitle: profile.job_title,
        trainingsCompleted: trainingsCount || 0,
        challengesCompleted: challengesCount || 0,
        gamesPlayed: gamesCount || 0,
        currentStreak: streakData?.current_streak || 0,
        totalXp,
        recentTrainings: (recentModules || []).map(m => ({
          id: m.module_id,
          name: 'Módulo',
          completedAt: m.completed_at || '',
          score: m.score || 0,
        })),
        recentChallenges: (recentChallenges || []).map(c => ({
          id: c.commitment_id,
          name: 'Desafio',
          completedAt: c.joined_at,
          status: c.contributed ? 'completed' : 'pending',
        })),
        topSkills,
        weakSkills,
        previousAssessments: (previousAssessments || []).map(a => ({
          date: a.created_at,
          score: a.total_score || 0,
          type: a.assessment_type || 'periodic',
        })),
      };
    },
    enabled: !!evaluateeId,
  });

  // Submit manager assessment
  const submitAssessment = useMutation({
    mutationFn: async (data: ManagerAssessmentData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const totalScore = data.responses.length > 0
        ? (data.responses.reduce((acc, r) => acc + r.value, 0) / data.responses.length) * 20
        : 0;

      const { data: assessment, error } = await supabase
        .from('manager_assessments')
        .insert({
          manager_id: user.id,
          evaluatee_id: data.evaluateeId,
          organization_id: organizationId,
          responses: JSON.parse(JSON.stringify(data.responses)),
          direction_notes: data.directionNotes,
          strengths: data.strengths,
          development_areas: data.developmentAreas,
          total_score: totalScore,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate consequences for the evaluatee
      await supabase.rpc('generate_assessment_consequences', {
        p_user_id: data.evaluateeId,
        p_assessment_type: 'manager',
        p_assessment_id: assessment.id,
        p_responses: JSON.parse(JSON.stringify({ responses: data.responses, strengths: data.strengths, developmentAreas: data.developmentAreas })),
        p_skill_ids: null,
      });

      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-consequences'] });
      toast.success('Avaliação enviada com sucesso!');
    },
    onError: (error) => {
      console.error('Error submitting assessment:', error);
      toast.error('Erro ao enviar avaliação');
    },
  });

  // Fetch manager's submitted assessments
  const { data: myAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['manager-assessments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('manager_assessments')
        .select(`
          id,
          evaluatee_id,
          total_score,
          created_at,
          assessment_type
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    teamMembers,
    teamLoading,
    employeeContext,
    contextLoading,
    submitAssessment,
    myAssessments,
    assessmentsLoading,
  };
}
