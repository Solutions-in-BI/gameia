/**
 * Central de Relatórios Avançada
 * Integra Backend RPCs com exportação Excel/PDF
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Users, Trophy, Gamepad2, GraduationCap, TrendingUp,
  Download, FileSpreadsheet, FileType, User, Building2, Loader2,
  BarChart3, Calendar
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useReports, useReportMembers, useReportTeams, ReportPeriod } from '@/hooks/useReports';
import { ReportPreviewChart } from './ReportPreviewChart';
import { ReportDataTable } from './ReportDataTable';
import { 
  exportMemberReportToExcel, 
  exportTeamReportToExcel, 
  exportTeamsComparisonToExcel,
  exportGamesReportToExcel,
  exportTrainingsReportToExcel,
  exportRankingToExcel,
  exportTemporalEvolutionToExcel
} from '@/utils/exportExcel';
import {
  exportMemberReportToPdf,
  exportTeamReportToPdf,
  exportTeamsComparisonToPdf
} from '@/utils/exportPdf';

type ReportCategory = 'individual' | 'team' | 'organization' | 'games' | 'trainings';

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: ReportCategory;
}

const REPORTS: ReportDefinition[] = [
  { id: 'member-full', name: 'Perfil Completo', description: 'Relatório detalhado do membro', icon: User, category: 'individual' },
  { id: 'team-performance', name: 'Performance da Equipe', description: 'Métricas e membros da equipe', icon: Users, category: 'team' },
  { id: 'teams-comparison', name: 'Comparativo de Equipes', description: 'Benchmark entre equipes', icon: BarChart3, category: 'team' },
  { id: 'members-ranking', name: 'Ranking de Membros', description: 'Top performers da organização', icon: Trophy, category: 'organization' },
  { id: 'temporal-evolution', name: 'Evolução Temporal', description: 'Crescimento ao longo do tempo', icon: TrendingUp, category: 'organization' },
  { id: 'games-stats', name: 'Estatísticas de Jogos', description: 'Performance em gamificação', icon: Gamepad2, category: 'games' },
  { id: 'trainings-progress', name: 'Progresso de Treinamentos', description: 'Status e conclusões', icon: GraduationCap, category: 'trainings' },
];

const CATEGORY_LABELS: Record<ReportCategory, { label: string; icon: React.ElementType }> = {
  individual: { label: 'Individual', icon: User },
  team: { label: 'Equipe', icon: Users },
  organization: { label: 'Organização', icon: Building2 },
  games: { label: 'Jogos', icon: Gamepad2 },
  trainings: { label: 'Treinamentos', icon: GraduationCap },
};

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '1y': '1 ano',
};

export function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('organization');
  const [selectedReport, setSelectedReport] = useState<string>('members-ranking');
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: members = [] } = useReportMembers();
  const { data: teams = [] } = useReportTeams();

  const {
    memberReport,
    teamReport,
    teamsComparison,
    gamesReport,
    trainingsReport,
    temporalEvolution,
    membersRanking,
  } = useReports({
    period,
    memberId: selectedMemberId || undefined,
    teamId: selectedTeamId || undefined,
    granularity: period === '7d' ? 'day' : period === '30d' ? 'day' : 'week',
  });

  const filteredReports = useMemo(() => 
    REPORTS.filter(r => r.category === selectedCategory),
    [selectedCategory]
  );

  const currentReportData = useMemo(() => {
    switch (selectedReport) {
      case 'member-full': return memberReport.data;
      case 'team-performance': return teamReport.data;
      case 'teams-comparison': return teamsComparison.data;
      case 'members-ranking': return membersRanking.data;
      case 'temporal-evolution': return temporalEvolution.data;
      case 'games-stats': return gamesReport.data;
      case 'trainings-progress': return trainingsReport.data;
      default: return null;
    }
  }, [selectedReport, memberReport.data, teamReport.data, teamsComparison.data, 
      membersRanking.data, temporalEvolution.data, gamesReport.data, trainingsReport.data]);

  const isLoading = useMemo(() => {
    switch (selectedReport) {
      case 'member-full': return memberReport.isLoading;
      case 'team-performance': return teamReport.isLoading;
      case 'teams-comparison': return teamsComparison.isLoading;
      case 'members-ranking': return membersRanking.isLoading;
      case 'temporal-evolution': return temporalEvolution.isLoading;
      case 'games-stats': return gamesReport.isLoading;
      case 'trainings-progress': return trainingsReport.isLoading;
      default: return false;
    }
  }, [selectedReport, memberReport.isLoading, teamReport.isLoading, teamsComparison.isLoading,
      membersRanking.isLoading, temporalEvolution.isLoading, gamesReport.isLoading, trainingsReport.isLoading]);

  const handleCategoryChange = (category: ReportCategory) => {
    setSelectedCategory(category);
    const firstReport = REPORTS.find(r => r.category === category);
    if (firstReport) {
      setSelectedReport(firstReport.id);
    }
  };

  const handleExportExcel = async () => {
    if (!currentReportData) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    setIsExporting(true);
    try {
      switch (selectedReport) {
        case 'member-full': {
          const member = members.find(m => m.id === selectedMemberId);
          exportMemberReportToExcel(currentReportData, member?.nickname || 'membro');
          break;
        }
        case 'team-performance': {
          const team = teams.find(t => t.id === selectedTeamId);
          exportTeamReportToExcel(currentReportData, team?.name || 'equipe');
          break;
        }
        case 'teams-comparison':
          exportTeamsComparisonToExcel(currentReportData);
          break;
        case 'games-stats':
          exportGamesReportToExcel(currentReportData);
          break;
        case 'trainings-progress':
          exportTrainingsReportToExcel(currentReportData);
          break;
        case 'members-ranking':
          exportRankingToExcel(currentReportData);
          break;
        case 'temporal-evolution':
          exportTemporalEvolutionToExcel(currentReportData);
          break;
      }
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentReportData) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    setIsExporting(true);
    try {
      switch (selectedReport) {
        case 'member-full': {
          const member = members.find(m => m.id === selectedMemberId);
          exportMemberReportToPdf(currentReportData, member?.nickname || 'Membro', period);
          break;
        }
        case 'team-performance': {
          const team = teams.find(t => t.id === selectedTeamId);
          exportTeamReportToPdf(currentReportData, team?.name || 'Equipe', period);
          break;
        }
        case 'teams-comparison':
          exportTeamsComparisonToPdf(currentReportData, period);
          break;
        default:
          toast.info('PDF disponível para relatórios individuais e de equipe');
      }
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const renderReportPreview = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      );
    }

    if (!currentReportData) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p>Selecione os filtros para gerar o relatório</p>
        </div>
      );
    }

    switch (selectedReport) {
      case 'member-full':
        return <MemberReportPreview data={currentReportData} />;
      case 'team-performance':
        return <TeamReportPreview data={currentReportData} />;
      case 'teams-comparison':
        return <TeamsComparisonPreview data={currentReportData} />;
      case 'members-ranking':
        return <RankingPreview data={currentReportData} />;
      case 'temporal-evolution':
        return <TemporalEvolutionPreview data={currentReportData} />;
      case 'games-stats':
        return <GamesReportPreview data={currentReportData} />;
      case 'trainings-progress':
        return <TrainingsReportPreview data={currentReportData} />;
      default:
        return null;
    }
  };

  const needsMemberSelection = selectedReport === 'member-full';
  const needsTeamSelection = selectedReport === 'team-performance';

  return (
    <div className="space-y-6">
      {/* Header com filtros inline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Central de Relatórios</h2>
          <p className="text-muted-foreground">Gere e exporte relatórios detalhados</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Relatório */}
          <Select value={selectedReport} onValueChange={(v) => {
            setSelectedReport(v);
            const report = REPORTS.find(r => r.id === v);
            if (report) setSelectedCategory(report.category);
          }}>
            <SelectTrigger className="w-[200px]">
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Selecione o relatório" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([catKey, { label: catLabel }]) => {
                const catReports = REPORTS.filter(r => r.category === catKey);
                if (catReports.length === 0) return null;
                return (
                  <div key={catKey}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {catLabel}
                    </div>
                    {catReports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        <div className="flex items-center gap-2">
                          <report.icon className="h-4 w-4" />
                          {report.name}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                );
              })}
            </SelectContent>
          </Select>

          {/* Filtro de Período */}
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Membro (condicional) */}
          {needsMemberSelection && (
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-[180px]">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Membro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{member.nickname[0]}</AvatarFallback>
                      </Avatar>
                      {member.nickname}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Filtro de Equipe (condicional) */}
          {needsTeamSelection && (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Área de conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Exportação */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleExportExcel}
                disabled={isExporting || !currentReportData}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                )}
                Exportar Excel
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleExportPdf}
                disabled={isExporting || !currentReportData}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileType className="h-4 w-4 text-red-600" />
                )}
                Exportar PDF
              </Button>
            </CardContent>
          </Card>

          {/* Info do relatório selecionado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {(() => {
                  const report = REPORTS.find(r => r.id === selectedReport);
                  if (report) {
                    const Icon = report.icon;
                    return <Icon className="h-4 w-4" />;
                  }
                  return <FileText className="h-4 w-4" />;
                })()}
                Relatório Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-sm">
                {REPORTS.find(r => r.id === selectedReport)?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {REPORTS.find(r => r.id === selectedReport)?.description}
              </p>
              <Badge variant="secondary" className="mt-3">
                {CATEGORY_LABELS[selectedCategory]?.label}
              </Badge>
            </CardContent>
          </Card>
        </div>

          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const report = REPORTS.find(r => r.id === selectedReport);
                        if (report) {
                          const Icon = report.icon;
                          return <Icon className="h-5 w-5" />;
                        }
                        return null;
                      })()}
                      {REPORTS.find(r => r.id === selectedReport)?.name}
                    </CardTitle>
                    <CardDescription>
                      Período: {PERIOD_LABELS[period]}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {isLoading ? 'Carregando...' : currentReportData ? 'Dados atualizados' : 'Aguardando filtros'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedReport + period + selectedMemberId + selectedTeamId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderReportPreview()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Preview Components

function MemberReportPreview({ data }: { data: Record<string, unknown> }) {
  const xp = data.xp as Record<string, unknown> | undefined;
  const activities = data.activities as Record<string, unknown> | undefined;
  const streak = data.streak as Record<string, unknown> | undefined;
  const badges = data.badges as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="XP no Período" value={Number(xp?.total_period) || 0} icon={TrendingUp} />
        <StatCard label="Atividades" value={Number(activities?.total_period) || 0} icon={BarChart3} />
        <StatCard label="Streak" value={Number(streak?.current) || 0} icon={Calendar} />
        <StatCard label="Badges" value={Number(badges?.total) || 0} icon={Trophy} />
      </div>

      {Array.isArray(xp?.by_source) && xp.by_source.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">XP por Fonte</CardTitle></CardHeader>
          <CardContent>
            <ReportPreviewChart
              data={xp.by_source.map((s: Record<string, unknown>) => ({
                name: String(s.source),
                value: Number(s.total),
              }))}
              type="pie"
              height={200}
            />
          </CardContent>
        </Card>
      )}

      {Array.isArray(data.games) && data.games.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Performance em Jogos</CardTitle></CardHeader>
          <CardContent>
            <ReportDataTable
              columns={[
                { key: 'game_type', label: 'Jogo' },
                { key: 'games_played', label: 'Partidas', align: 'right' },
                { key: 'best_score', label: 'Melhor Score', align: 'right' },
                { key: 'total_xp_earned', label: 'XP Total', align: 'right' },
              ]}
              data={data.games}
              maxRows={5}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeamReportPreview({ data }: { data: Record<string, unknown> }) {
  const metrics = data.metrics as Record<string, unknown> | undefined;
  const members = data.members as Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Membros" value={Number(metrics?.total_members) || 0} icon={Users} />
        <StatCard label="Membros Ativos" value={Number(metrics?.active_members) || 0} icon={User} />
        <StatCard label="XP Total" value={Number(metrics?.total_xp) || 0} icon={TrendingUp} />
        <StatCard label="XP Médio" value={Number(metrics?.avg_xp) || 0} icon={BarChart3} />
        <StatCard label="Atividades" value={Number(metrics?.total_activities) || 0} icon={Calendar} />
        <StatCard label="Streak Médio" value={Number(metrics?.avg_streak) || 0} icon={Trophy} />
      </div>

      {members && members.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Membros da Equipe</CardTitle></CardHeader>
          <CardContent>
            <ReportDataTable
              columns={[
                { key: 'nickname', label: 'Nome' },
                { key: 'job_title', label: 'Cargo' },
                { key: 'xp_period', label: 'XP', align: 'right' },
                { key: 'activities', label: 'Atividades', align: 'right' },
                { key: 'streak', label: 'Streak', align: 'right' },
              ]}
              data={members}
              maxRows={10}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeamsComparisonPreview({ data }: { data: Record<string, unknown> }) {
  const teams = data.teams as Record<string, unknown>[] | undefined;

  if (!teams || teams.length === 0) {
    return <EmptyState message="Nenhuma equipe encontrada" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">XP por Equipe</CardTitle></CardHeader>
        <CardContent>
          <ReportPreviewChart
            data={teams.map((t) => ({ name: String(t.name), value: Number(t.total_xp) }))}
            type="bar"
            height={250}
          />
        </CardContent>
      </Card>

      <ReportDataTable
        columns={[
          { key: 'name', label: 'Equipe' },
          { key: 'member_count', label: 'Membros', align: 'right' },
          { key: 'total_xp', label: 'XP Total', align: 'right' },
          { key: 'total_activities', label: 'Atividades', align: 'right' },
          { key: 'engagement_rate', label: 'Engajamento %', align: 'right' },
        ]}
        data={teams}
        maxRows={15}
      />
    </div>
  );
}

function RankingPreview({ data }: { data: Record<string, unknown> }) {
  const ranking = data.ranking as Record<string, unknown>[] | undefined;

  if (!ranking || ranking.length === 0) {
    return <EmptyState message="Nenhum dado de ranking" />;
  }

  return (
    <ReportDataTable
      columns={[
        { key: 'rank', label: '#', align: 'center' },
        { key: 'nickname', label: 'Membro' },
        { key: 'team_name', label: 'Equipe' },
        { key: 'xp_period', label: 'XP', align: 'right' },
        { key: 'activities', label: 'Atividades', align: 'right' },
        { key: 'streak', label: 'Streak', align: 'right' },
        { key: 'badges_earned', label: 'Badges', align: 'right' },
      ]}
      data={ranking}
      maxRows={20}
    />
  );
}

function TemporalEvolutionPreview({ data }: { data: Record<string, unknown> }) {
  const xpEvolution = data.xp_evolution as Record<string, unknown>[] | undefined;
  const activityEvolution = data.activity_evolution as Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-6">
      {xpEvolution && xpEvolution.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Evolução de XP</CardTitle></CardHeader>
          <CardContent>
            <ReportPreviewChart
              data={xpEvolution.map((d) => ({
                name: new Date(String(d.period_date)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                value: Number(d.total_xp),
              }))}
              type="area"
              height={250}
            />
          </CardContent>
        </Card>
      )}

      {activityEvolution && activityEvolution.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Evolução de Atividades</CardTitle></CardHeader>
          <CardContent>
            <ReportPreviewChart
              data={activityEvolution.map((d) => ({
                name: new Date(String(d.period_date)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                value: Number(d.total_activities),
              }))}
              type="area"
              height={250}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GamesReportPreview({ data }: { data: Record<string, unknown> }) {
  const gameStats = data.game_stats as Record<string, unknown>[] | undefined;
  const topPlayers = data.top_players as Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-6">
      {gameStats && gameStats.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Partidas por Jogo</CardTitle></CardHeader>
            <CardContent>
              <ReportPreviewChart
                data={gameStats.map((g) => ({ name: String(g.game_type), value: Number(g.total_plays) }))}
                type="bar"
                height={200}
              />
            </CardContent>
          </Card>

          <ReportDataTable
            columns={[
              { key: 'game_type', label: 'Jogo' },
              { key: 'total_plays', label: 'Partidas', align: 'right' },
              { key: 'unique_players', label: 'Jogadores', align: 'right' },
              { key: 'top_score', label: 'Top Score', align: 'right' },
              { key: 'total_xp', label: 'XP Total', align: 'right' },
            ]}
            data={gameStats}
            maxRows={10}
          />
        </>
      )}

      {topPlayers && topPlayers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Top Jogadores</CardTitle></CardHeader>
          <CardContent>
            <ReportDataTable
              columns={[
                { key: 'nickname', label: 'Jogador' },
                { key: 'total_xp', label: 'XP Total', align: 'right' },
                { key: 'total_games', label: 'Partidas', align: 'right' },
                { key: 'best_score', label: 'Melhor Score', align: 'right' },
              ]}
              data={topPlayers}
              maxRows={10}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrainingsReportPreview({ data }: { data: Record<string, unknown> }) {
  const trainings = data.trainings as Record<string, unknown>[] | undefined;
  const summary = data.summary as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Treinamentos" value={Number(summary.total_trainings) || 0} icon={GraduationCap} />
          <StatCard label="Inscrições" value={Number(summary.total_enrollments) || 0} icon={Users} />
          <StatCard label="Conclusões" value={Number(summary.total_completions) || 0} icon={Trophy} />
          <StatCard label="No Período" value={Number(summary.completions_period) || 0} icon={Calendar} />
        </div>
      )}

      {trainings && trainings.length > 0 && (
        <ReportDataTable
          columns={[
            { key: 'name', label: 'Treinamento' },
            { key: 'category', label: 'Categoria' },
            { key: 'enrolled_users', label: 'Inscritos', align: 'right' },
            { key: 'completed_users', label: 'Concluídos', align: 'right' },
            { key: 'completion_rate', label: 'Taxa %', align: 'right' },
          ]}
          data={trainings}
          maxRows={15}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <FileText className="h-12 w-12 mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
