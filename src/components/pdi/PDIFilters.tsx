import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Brain, 
  Zap, 
  Users,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type GoalTypeFilter = "all" | "behavioral" | "technical" | "cognitive" | "performance";
export type GoalStatusFilter = "all" | "in_progress" | "stagnant" | "overdue" | "completed";
export type GoalSortBy = "priority" | "deadline" | "progress";

interface PDIFiltersProps {
  typeFilter: GoalTypeFilter;
  statusFilter: GoalStatusFilter;
  sortBy: GoalSortBy;
  onTypeFilterChange: (filter: GoalTypeFilter) => void;
  onStatusFilterChange: (filter: GoalStatusFilter) => void;
  onSortByChange: (sort: GoalSortBy) => void;
  counts: {
    all: number;
    behavioral: number;
    technical: number;
    cognitive: number;
    performance: number;
    in_progress: number;
    stagnant: number;
    overdue: number;
    completed: number;
  };
}

export const PDIFilters: React.FC<PDIFiltersProps> = ({
  typeFilter,
  statusFilter,
  sortBy,
  onTypeFilterChange,
  onStatusFilterChange,
  onSortByChange,
  counts,
}) => {
  const typeOptions = [
    { value: "all", label: "Todas", icon: Target, count: counts.all },
    { value: "behavioral", label: "Comportamental", icon: Users, count: counts.behavioral },
    { value: "technical", label: "Técnica", icon: Zap, count: counts.technical },
    { value: "cognitive", label: "Cognitiva", icon: Brain, count: counts.cognitive },
    { value: "performance", label: "Performance", icon: Target, count: counts.performance },
  ];

  const statusOptions = [
    { value: "all", label: "Todos", icon: Target },
    { value: "in_progress", label: "Em progresso", icon: TrendingUp, count: counts.in_progress },
    { value: "stagnant", label: "Estagnadas", icon: Clock, count: counts.stagnant },
    { value: "overdue", label: "Atrasadas", icon: AlertTriangle, count: counts.overdue },
    { value: "completed", label: "Concluídas", icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="space-y-3">
      {/* Type Tabs */}
      <Tabs value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as GoalTypeFilter)}>
        <TabsList className="w-full h-auto flex-wrap bg-muted/50 p-1">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="flex-1 min-w-fit gap-1.5 data-[state=active]:bg-background"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{option.label}</span>
                {option.count > 0 && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 justify-center text-xs">
                    {option.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Status and Sort Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status:</span>
              <span className="capitalize">
                {statusFilter === "all" ? "Todos" : 
                 statusFilter === "in_progress" ? "Em progresso" :
                 statusFilter === "stagnant" ? "Estagnadas" :
                 statusFilter === "overdue" ? "Atrasadas" : "Concluídas"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as GoalStatusFilter)}>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {option.label}
                    {option.count !== undefined && option.count > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Ordenar:</span>
              <span className="capitalize">
                {sortBy === "priority" ? "Prioridade" :
                 sortBy === "deadline" ? "Prazo" : "Progresso"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortByChange(v as GoalSortBy)}>
              <DropdownMenuRadioItem value="priority">Prioridade</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="deadline">Prazo</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="progress">Progresso</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PDIFilters;
