/**
 * BookTrainingProgress - Dashboard do gestor para treinamentos guiados por livro
 * Mostra: quem leu, refletiu, aplicou e cumpriu prazo
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Eye, Brain, Target, CheckCircle2, Clock, 
  AlertCircle, Users, TrendingUp, Filter, Search,
  ArrowUpDown, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookApplications, BookApplication } from "@/hooks/useBookApplications";
import { useOrganization } from "@/hooks/useOrganization";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookTrainingProgressProps {
  trainingId?: string;
  trainingName?: string;
  onViewEvidence?: (application: BookApplication) => void;
}

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'late';

export function BookTrainingProgress({ 
  trainingId, 
  trainingName,
  onViewEvidence 
}: BookTrainingProgressProps) {
  const { currentOrg } = useOrganization();
  const { applications, isLoading, stats, fetchApplications } = useBookApplications();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'deadline' | 'status'>('deadline');

  // Fetch applications when org or training changes
  useEffect(() => {
    if (currentOrg?.id) {
      fetchApplications(currentOrg.id, trainingId);
    }
  }, [currentOrg?.id, trainingId, fetchApplications]);

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'late') {
          return app.isLate;
        }
        return app.status === statusFilter;
      }
      return true;
    })
    .filter(app => {
      if (!searchQuery) return true;
      const userName = app.userName || '';
      return userName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.userName || '').localeCompare(b.userName || '');
        case 'deadline':
          if (!a.deadlineAt && !b.deadlineAt) return 0;
          if (!a.deadlineAt) return 1;
          if (!b.deadlineAt) return -1;
          return a.deadlineAt.getTime() - b.deadlineAt.getTime();
        case 'status':
          const statusOrder = { 'pending': 0, 'in_progress': 1, 'completed': 2 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                 (statusOrder[b.status as keyof typeof statusOrder] || 0);
        default:
          return 0;
      }
    });

  const getStatusBadge = (app: BookApplication) => {
    if (app.isLate) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    
    switch (app.status) {
      case 'completed':
        return <Badge className="bg-green-500">Concluído</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Em Progresso</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedLate}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.onTimeRate)}%</p>
                <p className="text-xs text-muted-foreground">No Prazo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Progresso das Aplicações
              {trainingName && (
                <Badge variant="outline" className="ml-2">{trainingName}</Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaborador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="late">Atrasados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Por Prazo</SelectItem>
                  <SelectItem value="name">Por Nome</SelectItem>
                  <SelectItem value="status">Por Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.applicationId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={app.userAvatar || undefined} />
                    <AvatarFallback>
                      {(app.userName || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {app.userName || 'Usuário'}
                      </p>
                      {getStatusBadge(app)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {app.deadlineAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Prazo: {format(app.deadlineAt, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {app.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          Enviado: {format(app.completedAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress indicators */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        app.status !== 'pending' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Eye className="w-3 h-3" />
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        app.status === 'in_progress' || app.status === 'completed' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Brain className="w-3 h-3" />
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        app.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Target className="w-3 h-3" />
                      </div>
                    </div>

                    {app.status === 'completed' && onViewEvidence && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewEvidence(app)}
                        className="gap-1"
                      >
                        Ver evidência
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma aplicação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
