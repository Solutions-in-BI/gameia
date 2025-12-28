import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export type ReportPeriod = '7d' | '30d' | '90d' | '1y';
export type ReportGranularity = 'hour' | 'day' | 'week' | 'month';

export interface ReportFilters {
  period: ReportPeriod;
  teamId?: string;
  memberId?: string;
  granularity?: ReportGranularity;
}

export function useReports(filters: ReportFilters = { period: '30d' }) {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  // Relatório Individual
  const memberReport = useQuery({
    queryKey: ['member-report', filters.memberId, orgId, filters.period],
    queryFn: async () => {
      if (!filters.memberId || !orgId) return null;
      
      const { data, error } = await supabase.rpc('get_member_full_report', {
        _user_id: filters.memberId,
        _org_id: orgId,
        _period: filters.period,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!filters.memberId && !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Relatório de Equipe
  const teamReport = useQuery({
    queryKey: ['team-report', filters.teamId, orgId, filters.period],
    queryFn: async () => {
      if (!filters.teamId || !orgId) return null;
      
      const { data, error } = await supabase.rpc('get_team_report', {
        _team_id: filters.teamId,
        _org_id: orgId,
        _period: filters.period,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!filters.teamId && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Comparativo de Equipes
  const teamsComparison = useQuery({
    queryKey: ['teams-comparison', orgId, filters.period],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase.rpc('get_teams_comparison', {
        _org_id: orgId,
        _period: filters.period,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Relatório de Jogos
  const gamesReport = useQuery({
    queryKey: ['games-report', orgId, filters.period],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase.rpc('get_games_report', {
        _org_id: orgId,
        _period: filters.period,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Relatório de Treinamentos
  const trainingsReport = useQuery({
    queryKey: ['trainings-report', orgId, filters.period],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase.rpc('get_trainings_report', {
        _org_id: orgId,
        _period: filters.period,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Evolução Temporal
  const temporalEvolution = useQuery({
    queryKey: ['temporal-evolution', orgId, filters.period, filters.granularity],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase.rpc('get_temporal_evolution', {
        _org_id: orgId,
        _period: filters.period,
        _granularity: filters.granularity || 'day',
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Ranking de Membros
  const membersRanking = useQuery({
    queryKey: ['members-ranking', orgId, filters.period],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase.rpc('get_members_ranking', {
        _org_id: orgId,
        _period: filters.period,
        _limit: 50,
      });
      
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Relatórios individuais
    memberReport: {
      data: memberReport.data,
      isLoading: memberReport.isLoading,
      error: memberReport.error,
      refetch: memberReport.refetch,
    },
    
    // Relatórios de equipe
    teamReport: {
      data: teamReport.data,
      isLoading: teamReport.isLoading,
      error: teamReport.error,
      refetch: teamReport.refetch,
    },
    
    // Comparativo de equipes
    teamsComparison: {
      data: teamsComparison.data,
      isLoading: teamsComparison.isLoading,
      error: teamsComparison.error,
      refetch: teamsComparison.refetch,
    },
    
    // Jogos
    gamesReport: {
      data: gamesReport.data,
      isLoading: gamesReport.isLoading,
      error: gamesReport.error,
      refetch: gamesReport.refetch,
    },
    
    // Treinamentos
    trainingsReport: {
      data: trainingsReport.data,
      isLoading: trainingsReport.isLoading,
      error: trainingsReport.error,
      refetch: trainingsReport.refetch,
    },
    
    // Evolução temporal
    temporalEvolution: {
      data: temporalEvolution.data,
      isLoading: temporalEvolution.isLoading,
      error: temporalEvolution.error,
      refetch: temporalEvolution.refetch,
    },
    
    // Ranking
    membersRanking: {
      data: membersRanking.data,
      isLoading: membersRanking.isLoading,
      error: membersRanking.error,
      refetch: membersRanking.refetch,
    },
    
    // Estado geral
    isAnyLoading: 
      memberReport.isLoading || 
      teamReport.isLoading || 
      teamsComparison.isLoading ||
      gamesReport.isLoading ||
      trainingsReport.isLoading ||
      temporalEvolution.isLoading ||
      membersRanking.isLoading,
  };
}

// Hook para buscar lista de membros para seleção
export function useReportMembers() {
  const { currentOrg } = useOrganization();
  
  return useQuery({
    queryKey: ['report-members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            nickname,
            avatar_url
          )
        `)
        .eq('organization_id', currentOrg.id);
      
      if (error) throw error;
      
      return data?.map(m => ({
        id: m.user_id,
        nickname: (m.profiles as { nickname?: string })?.nickname || 'Sem nome',
        avatar_url: (m.profiles as { avatar_url?: string })?.avatar_url,
      })) || [];
    },
    enabled: !!currentOrg?.id,
  });
}

// Hook para buscar lista de equipes para seleção
export function useReportTeams() {
  const { currentOrg } = useOrganization();
  
  return useQuery({
    queryKey: ['report-teams', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_teams')
        .select('id, name, color, icon')
        .eq('organization_id', currentOrg.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg?.id,
  });
}
