import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
  columns?: { key: string; header: string; width?: number }[];
}

export interface ExcelExportOptions {
  filename: string;
  sheets: ExcelSheet[];
  includeTimestamp?: boolean;
}

/**
 * Exporta dados para Excel com múltiplas abas
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const { filename, sheets, includeTimestamp = true } = options;
  
  // Criar workbook
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach((sheet) => {
    const { name, data, columns } = sheet;
    
    // Se tiver colunas definidas, reordenar e renomear
    let processedData = data;
    if (columns && columns.length > 0) {
      processedData = data.map((row) => {
        const newRow: Record<string, unknown> = {};
        columns.forEach((col) => {
          newRow[col.header] = row[col.key] ?? '';
        });
        return newRow;
      });
    }
    
    // Criar worksheet
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    
    // Definir largura das colunas
    if (columns && columns.length > 0) {
      worksheet['!cols'] = columns.map((col) => ({
        wch: col.width || 15,
      }));
    }
    
    // Adicionar ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31)); // Max 31 chars
  });
  
  // Gerar nome do arquivo
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}` 
    : '';
  const finalFilename = `${filename}${timestamp}.xlsx`;
  
  // Download
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Exporta relatório individual para Excel
 */
export function exportMemberReportToExcel(
  memberData: Record<string, unknown>,
  memberName: string
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Perfil
  if (memberData.profile) {
    sheets.push({
      name: 'Perfil',
      data: [memberData.profile as Record<string, unknown>],
      columns: [
        { key: 'nickname', header: 'Nome', width: 20 },
        { key: 'job_title', header: 'Cargo', width: 20 },
        { key: 'department', header: 'Departamento', width: 20 },
        { key: 'team_name', header: 'Equipe', width: 20 },
        { key: 'joined_at', header: 'Entrou em', width: 15 },
      ],
    });
  }
  
  // Aba: XP
  const xpData = memberData.xp as Record<string, unknown> | undefined;
  if (xpData?.by_source) {
    sheets.push({
      name: 'XP por Fonte',
      data: xpData.by_source as Record<string, unknown>[],
      columns: [
        { key: 'source', header: 'Fonte', width: 25 },
        { key: 'total', header: 'XP Total', width: 15 },
        { key: 'count', header: 'Ocorrências', width: 15 },
      ],
    });
  }
  
  // Aba: Atividades
  const activitiesData = memberData.activities as Record<string, unknown> | undefined;
  if (activitiesData?.by_type) {
    sheets.push({
      name: 'Atividades',
      data: activitiesData.by_type as Record<string, unknown>[],
      columns: [
        { key: 'activity_type', header: 'Tipo', width: 25 },
        { key: 'count', header: 'Quantidade', width: 15 },
      ],
    });
  }
  
  // Aba: Jogos
  if (Array.isArray(memberData.games) && memberData.games.length > 0) {
    sheets.push({
      name: 'Jogos',
      data: memberData.games,
      columns: [
        { key: 'game_type', header: 'Jogo', width: 20 },
        { key: 'games_played', header: 'Partidas', width: 12 },
        { key: 'best_score', header: 'Melhor Score', width: 15 },
        { key: 'avg_score', header: 'Média', width: 12 },
        { key: 'total_xp_earned', header: 'XP Total', width: 12 },
      ],
    });
  }
  
  // Aba: Treinamentos
  if (Array.isArray(memberData.trainings) && memberData.trainings.length > 0) {
    sheets.push({
      name: 'Treinamentos',
      data: memberData.trainings,
      columns: [
        { key: 'name', header: 'Treinamento', width: 30 },
        { key: 'status', header: 'Status', width: 15 },
        { key: 'progress_percent', header: 'Progresso %', width: 12 },
        { key: 'started_at', header: 'Iniciado', width: 15 },
        { key: 'completed_at', header: 'Concluído', width: 15 },
      ],
    });
  }
  
  // Aba: Competências
  if (Array.isArray(memberData.competencies) && memberData.competencies.length > 0) {
    sheets.push({
      name: 'Competências',
      data: memberData.competencies,
      columns: [
        { key: 'skill_name', header: 'Competência', width: 25 },
        { key: 'current_score', header: 'Score Atual', width: 15 },
        { key: 'trend', header: 'Tendência', width: 12 },
        { key: 'assessments_count', header: 'Avaliações', width: 12 },
      ],
    });
  }
  
  if (sheets.length === 0) {
    sheets.push({
      name: 'Resumo',
      data: [{ mensagem: 'Nenhum dado disponível' }],
    });
  }
  
  exportToExcel({
    filename: `relatorio_${memberName.replace(/\s+/g, '_')}`,
    sheets,
  });
}

/**
 * Exporta relatório de equipe para Excel
 */
export function exportTeamReportToExcel(
  teamData: Record<string, unknown>,
  teamName: string
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Resumo da Equipe
  const team = teamData.team as Record<string, unknown> | undefined;
  const metrics = teamData.metrics as Record<string, unknown> | undefined;
  if (team && metrics) {
    sheets.push({
      name: 'Resumo',
      data: [{
        nome: team.name,
        descricao: team.description,
        gerente: team.manager,
        total_membros: metrics.total_members,
        membros_ativos: metrics.active_members,
        xp_total: metrics.total_xp,
        xp_medio: metrics.avg_xp,
        atividades_total: metrics.total_activities,
        streak_medio: metrics.avg_streak,
      }],
    });
  }
  
  // Aba: Membros
  if (Array.isArray(teamData.members) && teamData.members.length > 0) {
    sheets.push({
      name: 'Membros',
      data: teamData.members,
      columns: [
        { key: 'nickname', header: 'Nome', width: 20 },
        { key: 'job_title', header: 'Cargo', width: 20 },
        { key: 'xp_period', header: 'XP Período', width: 15 },
        { key: 'activities', header: 'Atividades', width: 12 },
        { key: 'streak', header: 'Streak', width: 10 },
      ],
    });
  }
  
  // Aba: Estatísticas de Jogos
  if (Array.isArray(teamData.games_stats) && teamData.games_stats.length > 0) {
    sheets.push({
      name: 'Jogos',
      data: teamData.games_stats,
      columns: [
        { key: 'game_type', header: 'Jogo', width: 20 },
        { key: 'total_games', header: 'Total Partidas', width: 15 },
        { key: 'top_score', header: 'Maior Score', width: 15 },
        { key: 'total_xp', header: 'XP Total', width: 12 },
      ],
    });
  }
  
  exportToExcel({
    filename: `relatorio_equipe_${teamName.replace(/\s+/g, '_')}`,
    sheets,
  });
}

/**
 * Exporta comparativo de equipes para Excel
 */
export function exportTeamsComparisonToExcel(
  data: Record<string, unknown>
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Comparativo
  if (Array.isArray(data.teams) && data.teams.length > 0) {
    sheets.push({
      name: 'Comparativo',
      data: data.teams,
      columns: [
        { key: 'name', header: 'Equipe', width: 25 },
        { key: 'member_count', header: 'Membros', width: 12 },
        { key: 'total_xp', header: 'XP Total', width: 15 },
        { key: 'total_activities', header: 'Atividades', width: 15 },
        { key: 'avg_streak', header: 'Streak Médio', width: 15 },
        { key: 'engagement_rate', header: 'Engajamento %', width: 15 },
      ],
    });
  }
  
  // Aba: Resumo Org
  const summary = data.summary as Record<string, unknown> | undefined;
  if (summary) {
    sheets.push({
      name: 'Resumo Organização',
      data: [{
        total_equipes: summary.total_teams,
        xp_total_org: summary.org_total_xp,
        atividades_total_org: summary.org_total_activities,
      }],
    });
  }
  
  exportToExcel({
    filename: 'comparativo_equipes',
    sheets,
  });
}

/**
 * Exporta relatório de jogos para Excel
 */
export function exportGamesReportToExcel(
  data: Record<string, unknown>
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Estatísticas por Jogo
  if (Array.isArray(data.game_stats) && data.game_stats.length > 0) {
    sheets.push({
      name: 'Estatísticas',
      data: data.game_stats,
      columns: [
        { key: 'game_type', header: 'Jogo', width: 20 },
        { key: 'total_plays', header: 'Total Partidas', width: 15 },
        { key: 'unique_players', header: 'Jogadores Únicos', width: 18 },
        { key: 'top_score', header: 'Maior Score', width: 15 },
        { key: 'avg_score', header: 'Score Médio', width: 15 },
        { key: 'total_xp', header: 'XP Total', width: 12 },
      ],
    });
  }
  
  // Aba: Top Players
  if (Array.isArray(data.top_players) && data.top_players.length > 0) {
    sheets.push({
      name: 'Top Jogadores',
      data: data.top_players,
      columns: [
        { key: 'nickname', header: 'Jogador', width: 20 },
        { key: 'total_xp', header: 'XP Total', width: 12 },
        { key: 'total_games', header: 'Total Partidas', width: 15 },
        { key: 'best_score', header: 'Melhor Score', width: 15 },
      ],
    });
  }
  
  // Aba: Badges
  if (Array.isArray(data.badges_earned) && data.badges_earned.length > 0) {
    sheets.push({
      name: 'Badges Conquistados',
      data: data.badges_earned,
      columns: [
        { key: 'name', header: 'Badge', width: 25 },
        { key: 'rarity', header: 'Raridade', width: 15 },
        { key: 'times_earned', header: 'Vezes Conquistado', width: 18 },
      ],
    });
  }
  
  exportToExcel({
    filename: 'relatorio_jogos',
    sheets,
  });
}

/**
 * Exporta relatório de treinamentos para Excel
 */
export function exportTrainingsReportToExcel(
  data: Record<string, unknown>
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Treinamentos
  if (Array.isArray(data.trainings) && data.trainings.length > 0) {
    sheets.push({
      name: 'Treinamentos',
      data: data.trainings,
      columns: [
        { key: 'name', header: 'Treinamento', width: 30 },
        { key: 'category', header: 'Categoria', width: 15 },
        { key: 'difficulty', header: 'Dificuldade', width: 12 },
        { key: 'enrolled_users', header: 'Inscritos', width: 12 },
        { key: 'completed_users', header: 'Concluíram', width: 12 },
        { key: 'avg_progress', header: 'Progresso Médio %', width: 18 },
        { key: 'completion_rate', header: 'Taxa Conclusão %', width: 18 },
      ],
    });
  }
  
  // Aba: Conclusões Recentes
  if (Array.isArray(data.recent_completions) && data.recent_completions.length > 0) {
    sheets.push({
      name: 'Conclusões Recentes',
      data: data.recent_completions,
      columns: [
        { key: 'nickname', header: 'Membro', width: 20 },
        { key: 'training_name', header: 'Treinamento', width: 30 },
        { key: 'completed_at', header: 'Concluído em', width: 18 },
      ],
    });
  }
  
  // Aba: Resumo
  const summary = data.summary as Record<string, unknown> | undefined;
  if (summary) {
    sheets.push({
      name: 'Resumo',
      data: [{
        total_treinamentos: summary.total_trainings,
        total_inscricoes: summary.total_enrollments,
        total_conclusoes: summary.total_completions,
        conclusoes_periodo: summary.completions_period,
      }],
    });
  }
  
  exportToExcel({
    filename: 'relatorio_treinamentos',
    sheets,
  });
}

/**
 * Exporta ranking de membros para Excel
 */
export function exportRankingToExcel(
  data: Record<string, unknown>
): void {
  if (!Array.isArray(data.ranking) || data.ranking.length === 0) return;
  
  exportToExcel({
    filename: 'ranking_membros',
    sheets: [{
      name: 'Ranking',
      data: data.ranking,
      columns: [
        { key: 'rank', header: 'Posição', width: 10 },
        { key: 'nickname', header: 'Membro', width: 20 },
        { key: 'team_name', header: 'Equipe', width: 20 },
        { key: 'job_title', header: 'Cargo', width: 20 },
        { key: 'xp_period', header: 'XP Período', width: 15 },
        { key: 'activities', header: 'Atividades', width: 12 },
        { key: 'streak', header: 'Streak', width: 10 },
        { key: 'badges_earned', header: 'Badges', width: 10 },
      ],
    }],
  });
}

/**
 * Exporta evolução temporal para Excel
 */
export function exportTemporalEvolutionToExcel(
  data: Record<string, unknown>
): void {
  const sheets: ExcelSheet[] = [];
  
  // Aba: Evolução XP
  if (Array.isArray(data.xp_evolution) && data.xp_evolution.length > 0) {
    sheets.push({
      name: 'Evolução XP',
      data: data.xp_evolution,
      columns: [
        { key: 'period_date', header: 'Data', width: 20 },
        { key: 'total_xp', header: 'XP Total', width: 15 },
        { key: 'active_users', header: 'Usuários Ativos', width: 18 },
      ],
    });
  }
  
  // Aba: Evolução Atividades
  if (Array.isArray(data.activity_evolution) && data.activity_evolution.length > 0) {
    sheets.push({
      name: 'Evolução Atividades',
      data: data.activity_evolution,
      columns: [
        { key: 'period_date', header: 'Data', width: 20 },
        { key: 'total_activities', header: 'Total Atividades', width: 18 },
        { key: 'active_users', header: 'Usuários Ativos', width: 18 },
      ],
    });
  }
  
  // Aba: Novos Membros
  if (Array.isArray(data.members_evolution) && data.members_evolution.length > 0) {
    sheets.push({
      name: 'Novos Membros',
      data: data.members_evolution,
      columns: [
        { key: 'period_date', header: 'Data', width: 20 },
        { key: 'new_members', header: 'Novos Membros', width: 18 },
      ],
    });
  }
  
  // Aba: Badges
  if (Array.isArray(data.badges_evolution) && data.badges_evolution.length > 0) {
    sheets.push({
      name: 'Evolução Badges',
      data: data.badges_evolution,
      columns: [
        { key: 'period_date', header: 'Data', width: 20 },
        { key: 'badges_earned', header: 'Badges Conquistados', width: 20 },
      ],
    });
  }
  
  if (sheets.length > 0) {
    exportToExcel({
      filename: 'evolucao_temporal',
      sheets,
    });
  }
}
