/**
 * Gestão de Avaliações 360° - Admin
 */

import { useState } from "react";
import {
  Radar,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Filter,
  Eye,
  Edit2,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAssessment360 } from "@/hooks/useAssessment360";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Assessment360Management() {
  const { cycles, cyclesLoading, createCycle, updateCycle } = useAssessment360();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newCycle, setNewCycle] = useState({
    name: "",
    description: "",
    cycle_type: "360",
    start_date: "",
    end_date: "",
  });

  const handleCreateCycle = async () => {
    if (!newCycle.name || !newCycle.start_date || !newCycle.end_date) return;
    
    await createCycle.mutateAsync({
      name: newCycle.name,
      description: newCycle.description,
      cycle_type: newCycle.cycle_type,
      start_date: newCycle.start_date,
      end_date: newCycle.end_date,
      status: "draft",
    });
    
    setNewCycle({ name: "", description: "", cycle_type: "360", start_date: "", end_date: "" });
    setIsCreateOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateCycle.mutateAsync({ id, status: newStatus });
  };

  const filteredCycles = cycles.filter((cycle) => {
    const matchesSearch = cycle.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cycle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Rascunho" },
      active: { variant: "default", label: "Ativo" },
      closed: { variant: "outline", label: "Encerrado" },
      archived: { variant: "destructive", label: "Arquivado" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCycleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "360": "Avaliação 360°",
      "180": "Avaliação 180°",
      self: "Autoavaliação",
      manager: "Avaliação do Gestor",
    };
    return types[type] || type;
  };

  const stats = {
    total: cycles.length,
    active: cycles.filter((c) => c.status === "active").length,
    draft: cycles.filter((c) => c.status === "draft").length,
    closed: cycles.filter((c) => c.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            Avaliação 360°
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie ciclos de avaliação e acompanhe o feedback dos colaboradores
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Ciclo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Ciclo de Avaliação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do Ciclo</Label>
                <Input
                  placeholder="Ex: Avaliação Q4 2024"
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o objetivo deste ciclo..."
                  value={newCycle.description}
                  onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Avaliação</Label>
                <Select
                  value={newCycle.cycle_type}
                  onValueChange={(value) => setNewCycle({ ...newCycle, cycle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="360">Avaliação 360°</SelectItem>
                    <SelectItem value="180">Avaliação 180°</SelectItem>
                    <SelectItem value="self">Autoavaliação</SelectItem>
                    <SelectItem value="manager">Avaliação do Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={newCycle.start_date}
                    onChange={(e) => setNewCycle({ ...newCycle, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={newCycle.end_date}
                    onChange={(e) => setNewCycle({ ...newCycle, end_date: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateCycle} 
                className="w-full"
                disabled={createCycle.isPending}
              >
                {createCycle.isPending ? "Criando..." : "Criar Ciclo"}
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
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Play className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.closed}</p>
              <p className="text-xs text-muted-foreground">Encerrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ciclos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="closed">Encerrado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cycles List */}
      <div className="space-y-4">
        {cyclesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-2">Carregando ciclos...</p>
          </div>
        ) : filteredCycles.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Radar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum ciclo de avaliação encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)} className="mt-2">
              Criar primeiro ciclo
            </Button>
          </div>
        ) : (
          filteredCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{cycle.name}</h3>
                    {getStatusBadge(cycle.status)}
                    <Badge variant="outline" className="text-xs">
                      {getCycleTypeLabel(cycle.cycle_type)}
                    </Badge>
                  </div>
                  {cycle.description && (
                    <p className="text-sm text-muted-foreground mb-2">{cycle.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(cycle.start_date), "dd MMM", { locale: ptBR })} - {format(new Date(cycle.end_date), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      0 avaliações
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {cycle.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(cycle.id, "active")}
                      className="gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Iniciar
                    </Button>
                  )}
                  {cycle.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(cycle.id, "closed")}
                      className="gap-1"
                    >
                      <Pause className="h-3 w-3" />
                      Encerrar
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
