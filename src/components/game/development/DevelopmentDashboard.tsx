/**
 * Dashboard de Desenvolvimento - Visão geral unificada
 * Hub central para todas as atividades de desenvolvimento do colaborador
 */

import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Radar, 
  Calendar, 
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { useAssessment360 } from "@/hooks/useAssessment360";
import { usePDI } from "@/hooks/usePDI";
import { useOneOnOne } from "@/hooks/useOneOnOne";

export type DevelopmentTab = "overview" | "cognitive" | "assessments" | "pdi" | "one-on-one";

interface DevelopmentDashboardProps {
  onTabChange: (tab: DevelopmentTab) => void;
}

export function DevelopmentDashboard({ onTabChange }: DevelopmentDashboardProps) {
  const { tests, myProfile, mySessions, testsLoading } = useCognitiveTests();
  const { myAssessments, cycles } = useAssessment360();
  const { myPlans } = usePDI();
  const { myMeetings } = useOneOnOne();

  // Calculate stats
  const pendingAssessments = myAssessments?.filter(a => a.status === 'pending').length || 0;
  const completedTests = mySessions?.filter(s => s.status === 'completed').length || 0;
  const activePlans = myPlans?.filter(p => p.status === 'active').length || 0;
  const upcomingMeetings = myMeetings?.filter(m => new Date(m.scheduled_at) > new Date()).length || 0;

  const cognitiveScore = myProfile?.overall_score || 0;

  const quickActions = [
    {
      id: "cognitive",
      title: "Testes Cognitivos",
      description: `${tests?.length || 0} testes disponíveis`,
      icon: Brain,
      color: "from-violet-500 to-purple-600",
      badge: completedTests > 0 ? `${completedTests} realizados` : null,
      onClick: () => onTabChange("cognitive"),
    },
    {
      id: "assessments",
      title: "Avaliação 360°",
      description: "Feedback multidirecional",
      icon: Radar,
      color: "from-blue-500 to-cyan-600",
      badge: pendingAssessments > 0 ? `${pendingAssessments} pendentes` : null,
      urgent: pendingAssessments > 0,
      onClick: () => onTabChange("assessments"),
    },
    {
      id: "pdi",
      title: "Plano de Desenvolvimento",
      description: "Metas e objetivos",
      icon: Target,
      color: "from-emerald-500 to-green-600",
      badge: activePlans > 0 ? `${activePlans} ativo${activePlans > 1 ? 's' : ''}` : null,
      onClick: () => onTabChange("pdi"),
    },
    {
      id: "one-on-one",
      title: "Reuniões 1:1",
      description: "Conversas com seu gestor",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      badge: upcomingMeetings > 0 ? `${upcomingMeetings} agendada${upcomingMeetings > 1 ? 's' : ''}` : null,
      onClick: () => onTabChange("one-on-one"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Desenvolvimento
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu crescimento profissional
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Brain className="w-8 h-8 text-violet-500" />
                <span className="text-2xl font-bold text-foreground">{cognitiveScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Score Cognitivo</p>
              <Progress value={cognitiveScore} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Radar className="w-8 h-8 text-blue-500" />
                <Badge variant={pendingAssessments > 0 ? "destructive" : "secondary"}>
                  {pendingAssessments}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Avaliações Pendentes</p>
              {pendingAssessments > 0 && (
                <p className="text-xs text-amber-500 mt-1">Ação necessária</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Target className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl font-bold text-foreground">{activePlans}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">PDIs Ativos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8 text-amber-500" />
                <span className="text-2xl font-bold text-foreground">{upcomingMeetings}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Próximas 1:1</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              onClick={action.onClick}
            >
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className={`w-20 h-20 flex items-center justify-center bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <Badge variant={action.urgent ? "destructive" : "secondary"} className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground mr-4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mySessions && mySessions.length > 0 ? (
            <div className="space-y-3">
              {mySessions.slice(0, 5).map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    session.status === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {session.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Teste Cognitivo {session.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.started_at).toLocaleDateString('pt-BR')}
                      {session.score && ` • Score: ${session.score}%`}
                    </p>
                  </div>
                  {session.score && (
                    <Badge variant="outline" className="font-mono">
                      +{Math.round(session.score * 2)} XP
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Comece um teste cognitivo para ver seu progresso aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
