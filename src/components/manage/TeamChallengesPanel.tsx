/**
 * TeamChallengesPanel - Visão do gestor para desafios do time
 * Permite visualizar, filtrar e acompanhar desafios de todos os membros
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  BarChart3,
  Gem,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CHALLENGE_TYPE_CONFIG,
  CHALLENGE_ORIGIN_CONFIG,
  getDeadlineClasses,
  getDeadlinePriority,
  type ChallengeType,
  type ChallengeOrigin,
} from "@/constants/challengeTypes";
import type { Challenge } from "@/hooks/useChallenges";

interface TeamMember {
  id: string;
  nickname: string;
  avatar_url?: string;
  challenges: Challenge[];
}

interface TeamChallengesPanelProps {
  challenges: Challenge[];
  teamMembers?: TeamMember[];
  isLoading?: boolean;
  onChallengeClick?: (challenge: Challenge) => void;
  onCreateChallenge?: () => void;
}

type StatusFilter = "all" | "active" | "completed" | "overdue" | "cancelled";
type TypeFilter = ChallengeType | "all";
type OriginFilter = ChallengeOrigin | "all";

export function TeamChallengesPanel({
  challenges,
  teamMembers = [],
  isLoading = false,
  onChallengeClick,
  onCreateChallenge,
}: TeamChallengesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "progress" | "participants">("deadline");

  // Calculate metrics
  const metrics = useMemo(() => {
    const active = challenges.filter(c => c.status === "active").length;
    const completed = challenges.filter(c => c.status === "completed").length;
    const overdue = challenges.filter(c => c.is_overdue || (c.status === "active" && isPast(new Date(c.ends_at)))).length;
    const total = challenges.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalXp = challenges.filter(c => c.status === "completed").reduce((sum, c) => sum + c.xp_reward, 0);
    const totalCoins = challenges.filter(c => c.status === "completed").reduce((sum, c) => sum + c.coins_reward, 0);
    const totalDiamonds = challenges.filter(c => c.status === "completed").reduce((sum, c) => sum + (c.diamonds_reward || 0), 0);

    return { active, completed, overdue, total, completionRate, totalXp, totalCoins, totalDiamonds };
  }, [challenges]);

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    let result = [...challenges];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "overdue") {
        result = result.filter(c => c.is_overdue || (c.status === "active" && isPast(new Date(c.ends_at))));
      } else {
        result = result.filter(c => c.status === statusFilter);
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(c => c.challenge_type === typeFilter);
    }

    // Origin filter
    if (originFilter !== "all") {
      result = result.filter(c => c.origin_source === originFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime();
        case "progress":
          const progressA = a.target_value > 0 ? a.current_value / a.target_value : 0;
          const progressB = b.target_value > 0 ? b.current_value / b.target_value : 0;
          return progressB - progressA;
        case "participants":
          return (b.participants_count || 0) - (a.participants_count || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [challenges, searchQuery, statusFilter, typeFilter, originFilter, sortBy]);

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color,
    subValue 
  }: { 
    icon: any; 
    label: string; 
    value: number | string; 
    color: string;
    subValue?: string;
  }) => (
    <Card className="bg-muted/20 border-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ChallengeRow = ({ challenge }: { challenge: Challenge }) => {
    const progress = challenge.target_value > 0
      ? Math.round((challenge.current_value / challenge.target_value) * 100)
      : 0;
    
    const typeConfig = CHALLENGE_TYPE_CONFIG[challenge.challenge_type as ChallengeType] || CHALLENGE_TYPE_CONFIG.practical;
    const originConfig = CHALLENGE_ORIGIN_CONFIG[challenge.origin_source as ChallengeOrigin];
    const deadlinePriority = getDeadlinePriority(challenge.ends_at);
    const deadlineClasses = getDeadlineClasses(deadlinePriority);
    const daysLeft = differenceInDays(new Date(challenge.ends_at), new Date());
    const isOverdue = challenge.is_overdue || (challenge.status === "active" && isPast(new Date(challenge.ends_at)));

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => onChallengeClick?.(challenge)}
        className={cn(
          "p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors",
          isOverdue && "border-destructive/50 bg-destructive/5"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            `bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`
          )}>
            <span className="text-lg">{typeConfig.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-medium truncate">{challenge.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                  {originConfig && (
                    <span className="text-xs text-muted-foreground">
                      De: {originConfig.label}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status badge */}
              {challenge.status === "completed" ? (
                <Badge className="bg-green-500/20 text-green-400 shrink-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Concluído
                </Badge>
              ) : isOverdue ? (
                <Badge variant="destructive" className="shrink-0">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Atrasado
                </Badge>
              ) : (
                <Badge variant="outline" className={cn("shrink-0", deadlineClasses)}>
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft} dias
                </Badge>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {challenge.current_value} / {challenge.target_value}
                </span>
                <span className={cn(
                  "font-medium",
                  progress >= 100 ? "text-green-400" : progress >= 50 ? "text-amber-400" : "text-muted-foreground"
                )}>
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {challenge.participants_count || 0}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Coins className="w-3 h-3" />
                {challenge.coins_reward}
              </span>
              {(challenge.diamonds_reward || 0) > 0 && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <Gem className="w-3 h-3" />
                  {challenge.diamonds_reward}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Desafios do Time
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie os desafios da sua equipe
          </p>
        </div>
        {onCreateChallenge && (
          <Button onClick={onCreateChallenge}>
            <Target className="w-4 h-4 mr-2" />
            Criar Desafio
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          label="Ativos"
          value={metrics.active}
          color="bg-blue-500/20 text-blue-400"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Concluídos"
          value={metrics.completed}
          color="bg-green-500/20 text-green-400"
          subValue={`${metrics.completionRate}% taxa`}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Atrasados"
          value={metrics.overdue}
          color="bg-destructive/20 text-destructive"
        />
        <MetricCard
          icon={TrendingUp}
          label="XP Gerado"
          value={metrics.totalXp.toLocaleString()}
          color="bg-primary/20 text-primary"
          subValue={`${metrics.totalCoins} moedas`}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar desafios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(CHALLENGE_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.emoji} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Origin filter */}
            <Select value={originFilter} onValueChange={(v) => setOriginFilter(v as OriginFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                {Object.entries(CHALLENGE_ORIGIN_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ordenar
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Por prazo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("progress")}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Por progresso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("participants")}>
                  <Users className="w-4 h-4 mr-2" />
                  Por participantes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Challenges list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Desafios ({filteredChallenges.length})</span>
            {filteredChallenges.length !== challenges.length && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
                setOriginFilter("all");
              }}>
                Limpar filtros
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <AnimatePresence mode="popLayout">
              {filteredChallenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhum desafio encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeRow key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
