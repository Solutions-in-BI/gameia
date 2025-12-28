import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PdfSection {
  title: string;
  type: 'table' | 'summary' | 'chart-placeholder';
  data?: Record<string, unknown>[];
  columns?: { key: string; header: string }[];
  summaryItems?: { label: string; value: string | number }[];
}

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  period?: string;
  generatedBy?: string;
}

/**
 * Gera e faz download de um relatório PDF
 * Usa uma abordagem HTML-to-Print para máxima compatibilidade
 */
export function exportToPdf(options: PdfExportOptions): void {
  const { title, subtitle, sections, period, generatedBy } = options;
  
  const now = new Date();
  const formattedDate = format(now, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  
  // Criar conteúdo HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1a1a1a;
          background: white;
        }
        .header {
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .header .subtitle {
          font-size: 16px;
          color: #666;
        }
        .header .meta {
          margin-top: 15px;
          font-size: 12px;
          color: #888;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          color: #6366f1;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        .summary-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-item .value {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th {
          background: #f8fafc;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #f3f4f6;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        .chart-placeholder {
          background: #f8fafc;
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          color: #9ca3af;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
        @media print {
          body { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        <div class="meta">
          ${period ? `<span>Período: ${period}</span> | ` : ''}
          <span>Gerado em: ${formattedDate}</span>
          ${generatedBy ? ` | <span>Por: ${generatedBy}</span>` : ''}
        </div>
      </div>
      
      ${sections.map(section => generateSectionHtml(section)).join('')}
      
      <div class="footer">
        Relatório gerado automaticamente pelo SkillPath • ${format(now, 'yyyy')}
      </div>
    </body>
    </html>
  `;
  
  // Abrir em nova janela e imprimir
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

function generateSectionHtml(section: PdfSection): string {
  let content = '';
  
  switch (section.type) {
    case 'summary':
      if (section.summaryItems && section.summaryItems.length > 0) {
        content = `
          <div class="summary-grid">
            ${section.summaryItems.map(item => `
              <div class="summary-item">
                <div class="label">${item.label}</div>
                <div class="value">${item.value}</div>
              </div>
            `).join('')}
          </div>
        `;
      }
      break;
      
    case 'table':
      if (section.data && section.data.length > 0 && section.columns) {
        content = `
          <table>
            <thead>
              <tr>
                ${section.columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${section.data.slice(0, 50).map(row => `
                <tr>
                  ${section.columns!.map(col => `<td>${formatValue(row[col.key])}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${section.data.length > 50 ? `<p style="margin-top: 10px; color: #666; font-size: 12px;">Exibindo 50 de ${section.data.length} registros</p>` : ''}
        `;
      }
      break;
      
    case 'chart-placeholder':
      content = `
        <div class="chart-placeholder">
          📊 Gráfico disponível na versão interativa do relatório
        </div>
      `;
      break;
  }
  
  return `
    <div class="section">
      <h2 class="section-title">${section.title}</h2>
      ${content}
    </div>
  `;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toLocaleString('pt-BR');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value instanceof Date) return format(value, 'dd/MM/yyyy');
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    try {
      return format(new Date(value), 'dd/MM/yyyy HH:mm');
    } catch {
      return value;
    }
  }
  return String(value);
}

/**
 * Exporta relatório individual para PDF
 */
export function exportMemberReportToPdf(
  memberData: Record<string, unknown>,
  memberName: string,
  period: string
): void {
  const sections: PdfSection[] = [];
  
  // Resumo
  const xp = memberData.xp as Record<string, unknown> | undefined;
  const activities = memberData.activities as Record<string, unknown> | undefined;
  const streak = memberData.streak as Record<string, unknown> | undefined;
  const badges = memberData.badges as Record<string, unknown> | undefined;
  
  sections.push({
    title: 'Resumo do Período',
    type: 'summary',
    summaryItems: [
      { label: 'XP Conquistado', value: Number(xp?.total_period) || 0 },
      { label: 'Atividades', value: Number(activities?.total_period) || 0 },
      { label: 'Streak Atual', value: Number(streak?.current) || 0 },
      { label: 'Badges', value: Number(badges?.total) || 0 },
    ],
  });
  
  // XP por fonte
  if (xp?.by_source && Array.isArray(xp.by_source) && xp.by_source.length > 0) {
    sections.push({
      title: 'XP por Fonte',
      type: 'table',
      data: xp.by_source,
      columns: [
        { key: 'source', header: 'Fonte' },
        { key: 'total', header: 'XP Total' },
        { key: 'count', header: 'Ocorrências' },
      ],
    });
  }
  
  // Jogos
  if (Array.isArray(memberData.games) && memberData.games.length > 0) {
    sections.push({
      title: 'Performance em Jogos',
      type: 'table',
      data: memberData.games,
      columns: [
        { key: 'game_type', header: 'Jogo' },
        { key: 'games_played', header: 'Partidas' },
        { key: 'best_score', header: 'Melhor Score' },
        { key: 'total_xp_earned', header: 'XP Total' },
      ],
    });
  }
  
  // Treinamentos
  if (Array.isArray(memberData.trainings) && memberData.trainings.length > 0) {
    sections.push({
      title: 'Treinamentos',
      type: 'table',
      data: memberData.trainings,
      columns: [
        { key: 'name', header: 'Treinamento' },
        { key: 'status', header: 'Status' },
        { key: 'progress_percent', header: 'Progresso %' },
      ],
    });
  }
  
  // Competências
  if (Array.isArray(memberData.competencies) && memberData.competencies.length > 0) {
    sections.push({
      title: 'Competências',
      type: 'table',
      data: memberData.competencies,
      columns: [
        { key: 'skill_name', header: 'Competência' },
        { key: 'current_score', header: 'Score' },
        { key: 'trend', header: 'Tendência' },
      ],
    });
  }
  
  const profile = memberData.profile as Record<string, unknown> | undefined;
  
  exportToPdf({
    title: `Relatório Individual: ${memberName}`,
    subtitle: profile?.job_title ? `${profile.job_title} • ${profile.team_name || 'Sem equipe'}` : undefined,
    period: getPeriodLabel(period),
    sections,
  });
}

/**
 * Exporta relatório de equipe para PDF
 */
export function exportTeamReportToPdf(
  teamData: Record<string, unknown>,
  teamName: string,
  period: string
): void {
  const sections: PdfSection[] = [];
  const metrics = teamData.metrics as Record<string, unknown> | undefined;
  
  // Resumo
  if (metrics) {
    sections.push({
      title: 'Métricas da Equipe',
      type: 'summary',
      summaryItems: [
        { label: 'Total Membros', value: metrics.total_members as number || 0 },
        { label: 'Membros Ativos', value: metrics.active_members as number || 0 },
        { label: 'XP Total', value: metrics.total_xp as number || 0 },
        { label: 'XP Médio', value: metrics.avg_xp as number || 0 },
        { label: 'Atividades', value: metrics.total_activities as number || 0 },
        { label: 'Streak Médio', value: metrics.avg_streak as number || 0 },
      ],
    });
  }
  
  // Membros
  if (Array.isArray(teamData.members) && teamData.members.length > 0) {
    sections.push({
      title: 'Membros da Equipe',
      type: 'table',
      data: teamData.members,
      columns: [
        { key: 'nickname', header: 'Nome' },
        { key: 'job_title', header: 'Cargo' },
        { key: 'xp_period', header: 'XP' },
        { key: 'activities', header: 'Atividades' },
        { key: 'streak', header: 'Streak' },
      ],
    });
  }
  
  const team = teamData.team as Record<string, unknown> | undefined;
  
  exportToPdf({
    title: `Relatório de Equipe: ${teamName}`,
    subtitle: team?.manager ? `Gerente: ${team.manager}` : undefined,
    period: getPeriodLabel(period),
    sections,
  });
}

/**
 * Exporta comparativo de equipes para PDF
 */
export function exportTeamsComparisonToPdf(
  data: Record<string, unknown>,
  period: string
): void {
  const sections: PdfSection[] = [];
  const summary = data.summary as Record<string, unknown> | undefined;
  
  // Resumo
  if (summary) {
    sections.push({
      title: 'Resumo da Organização',
      type: 'summary',
      summaryItems: [
        { label: 'Total Equipes', value: Number(summary.total_teams) || 0 },
        { label: 'XP Total', value: Number(summary.org_total_xp) || 0 },
        { label: 'Atividades Total', value: Number(summary.org_total_activities) || 0 },
      ],
    });
  }
  
  // Comparativo
  if (Array.isArray(data.teams) && data.teams.length > 0) {
    sections.push({
      title: 'Comparativo Entre Equipes',
      type: 'table',
      data: data.teams,
      columns: [
        { key: 'name', header: 'Equipe' },
        { key: 'member_count', header: 'Membros' },
        { key: 'total_xp', header: 'XP Total' },
        { key: 'total_activities', header: 'Atividades' },
        { key: 'engagement_rate', header: 'Engajamento %' },
      ],
    });
  }
  
  exportToPdf({
    title: 'Comparativo de Equipes',
    period: getPeriodLabel(period),
    sections,
  });
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '1y': 'Último ano',
  };
  return labels[period] || period;
}
