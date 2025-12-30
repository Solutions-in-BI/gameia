/**
 * Hook para buscar progresso de certificados do usuário
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CertificateProgress {
  id: string;
  certificate_type: string;
  target_id: string | null;
  config_id: string | null;
  completion_rate: number;
  current_score: number;
  games_participated: number;
  challenges_completed: number;
  is_eligible: boolean;
  config?: {
    name: string;
    icon: string;
    min_completion_rate: number;
    min_score: number;
    min_games_participated: number;
    min_challenges_completed: number;
  };
}

export interface UpcomingCertificate {
  id: string;
  name: string;
  type: string;
  progress: number;
  remainingCriteria: string[];
  actionLabel: string;
  actionPath: string;
  icon?: string;
}

export function useCertificateProgress() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['certificate-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return { progress: [], upcoming: [] };

      // Fetch certificate progress with config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: progressData, error } = await db
        .from('certificate_progress')
        .select(`
          *,
          config:certificate_criteria_configs(
            name, icon, min_completion_rate, min_score, 
            min_games_participated, min_challenges_completed
          )
        `)
        .eq('user_id', user.id)
        .eq('is_eligible', false)
        .order('completion_rate', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching certificate progress:', error);
        return { progress: [], upcoming: [] };
      }

      // Transform to upcoming certificates format
      const upcoming: UpcomingCertificate[] = (progressData || [])
        .filter((p: CertificateProgress) => p.completion_rate > 0 && p.completion_rate < 100)
        .map((p: CertificateProgress) => {
          const config = p.config;
          const remainingCriteria: string[] = [];

          // Check what's missing
          if (config) {
            if (p.completion_rate < config.min_completion_rate) {
              remainingCriteria.push(`Conclusão: ${p.completion_rate}% de ${config.min_completion_rate}%`);
            }
            if (p.current_score < config.min_score) {
              remainingCriteria.push(`Nota: ${p.current_score}% de ${config.min_score}%`);
            }
            if (config.min_games_participated > 0 && p.games_participated < config.min_games_participated) {
              remainingCriteria.push(`Jogos: ${p.games_participated} de ${config.min_games_participated}`);
            }
            if (config.min_challenges_completed > 0 && p.challenges_completed < config.min_challenges_completed) {
              remainingCriteria.push(`Desafios: ${p.challenges_completed} de ${config.min_challenges_completed}`);
            }
          }

          // Determine action based on type
          let actionLabel = "Continuar";
          let actionPath = "/app";

          switch (p.certificate_type) {
            case 'training':
              actionLabel = "Ver treinamento";
              actionPath = p.target_id ? `/app/development?tab=trainings&training=${p.target_id}` : "/app/development?tab=trainings";
              break;
            case 'journey':
              actionLabel = "Continuar jornada";
              actionPath = p.target_id ? `/app/development?tab=journeys&journey=${p.target_id}` : "/app/development?tab=journeys";
              break;
            case 'skill':
              actionLabel = "Desenvolver skill";
              actionPath = "/app/development?tab=trainings";
              break;
            case 'level':
              actionLabel = "Ver evolução";
              actionPath = "/app/evolution";
              break;
            case 'behavioral':
              actionLabel = "Ver avaliações";
              actionPath = "/app/development?tab=trainings";
              break;
          }

          return {
            id: p.id,
            name: config?.name || `Certificado de ${p.certificate_type}`,
            type: p.certificate_type,
            progress: p.completion_rate,
            remainingCriteria: remainingCriteria.length > 0 ? remainingCriteria : ['Complete mais atividades'],
            actionLabel,
            actionPath,
            icon: config?.icon,
          };
        });

      return {
        progress: progressData || [],
        upcoming,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  return {
    progress: data?.progress || [],
    upcomingCertificates: data?.upcoming || [],
    isLoading,
  };
}
