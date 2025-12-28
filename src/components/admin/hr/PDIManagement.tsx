/**
 * Gestão de PDI (Plano de Desenvolvimento Individual) - Admin
 */

import { useState } from "react";
import {
  Target,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { usePDI } from "@/hooks/usePDI";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PDIManagement() {
  const { plans, plansLoading, createPlan } = usePDI();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newPlan, setNewPlan] = useState({
    title: "",
    period_start: "",
    period_end: "",
  });

  const handleCreatePlan = async () => {
    if (!newPlan.title) return;
    
    await createPlan.mutateAsync({
      title: newPlan.title,
      period_start: newPlan.period_start || undefined,
      period_end: newPlan.period_end || undefined,
      status: "draft",
    });
    
    setNewPlan({ title: "", period_start: "", period_end: "" });
    setIsCreateOpen(false);
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      draft: { variant: "secondary", label: "Rascunho", icon: <Clock className="h-3 w-3" /> },
      active: { variant: "default", label: "Em Andamento", icon: <TrendingUp className="h-3 w-3" /> },
      completed: { variant: "outline", label: "Concluído", icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelled: { variant: "destructive", label: "Cancelado", icon: <AlertCircle className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.draft;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
    avgProgress: plans.length > 0 
      ? Math.round(plans.reduce((acc, p) => acc + p.overall_progress, 0) / plans.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            PDI - Plano de Desenvolvimento
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe os planos de desenvolvimento individual dos colaboradores
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo PDI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Plano de Desenvolvimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Título do PDI</Label>
                <Input
                  placeholder="Ex: Desenvolvimento de Liderança 2024"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início do Período</Label>
                  <Input
                    type="date"
                    value={newPlan.period_start}
                    onChange={(e) => setNewPlan({ ...newPlan, period_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim do Período</Label>
                  <Input
                    type="date"
                    value={newPlan.period_end}
                    onChange={(e) => setNewPlan({ ...newPlan, period_end: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreatePlan} 
                className="w-full"
                disabled={createPlan.isPending}
              >
                {createPlan.isPending ? "Criando..." : "Criar PDI"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total PDIs</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgProgress}%</p>
              <p className="text-xs text-muted-foreground">Progresso Médio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar PDIs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plansLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-2">Carregando PDIs...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum PDI encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)} className="mt-2">
              Criar primeiro PDI
            </Button>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{plan.title}</h3>
                    {getStatusBadge(plan.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Colaborador
                    </span>
                    {plan.period_start && plan.period_end && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(plan.period_start), "dd MMM", { locale: ptBR })} - {format(new Date(plan.period_end), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress value={plan.overall_progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground min-w-[45px]">
                      {plan.overall_progress}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Adicionar Meta</DropdownMenuItem>
                      <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                      <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
