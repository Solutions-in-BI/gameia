/**
 * JourneyCatalogSection - Catálogo de Jornadas de Treinamentos
 */

import { useState } from "react";
import { Plus, Search, Filter, Route, Clock, Users, Award, MoreVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTrainingJourneys, JOURNEY_CATEGORIES, JOURNEY_LEVELS, TrainingJourney } from "@/hooks/useTrainingJourneys";
import { useOrganization } from "@/hooks/useOrganization";
import { JourneyWizard } from "./JourneyWizard";

export function JourneyCatalogSection() {
  const { currentOrg } = useOrganization();
  const { journeys, isLoading, deleteJourney, toggleActive, refetch } = useTrainingJourneys(currentOrg?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [editingJourney, setEditingJourney] = useState<TrainingJourney | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TrainingJourney | null>(null);

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || journey.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || journey.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteJourney(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (journey: TrainingJourney) => {
    await toggleActive(journey.id, !journey.is_active);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jornadas de Treinamentos</h1>
          <p className="text-muted-foreground">Organize treinamentos em trilhas estratégicas de desenvolvimento</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Jornada
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar jornadas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {JOURNEY_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos níveis</SelectItem>
            {JOURNEY_LEVELS.map(lvl => (
              <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJourneys.length === 0 ? (
        <Card className="p-12 text-center">
          <Route className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery || categoryFilter !== "all" || levelFilter !== "all"
              ? "Nenhuma jornada encontrada"
              : "Nenhuma jornada criada"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== "all" || levelFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Crie sua primeira jornada para organizar treinamentos em trilhas estratégicas"}
          </p>
          {!searchQuery && categoryFilter === "all" && levelFilter === "all" && (
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Jornada
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJourneys.map(journey => (
            <Card key={journey.id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${journey.color}20` }}
                    >
                      <Route className="h-5 w-5" style={{ color: journey.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{journey.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{journey.category}</Badge>
                        <Badge variant="outline" className="text-xs">{journey.level}</Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingJourney(journey)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(journey)}>
                        {journey.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteConfirm(journey)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {journey.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {journey.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {journey.total_trainings} treinos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {journey.total_estimated_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {journey.total_xp} XP
                  </span>
                </div>
                {!journey.is_active && (
                  <Badge variant="secondary" className="mt-2 text-xs">Inativo</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      {(showWizard || editingJourney) && (
        <JourneyWizard
          journey={editingJourney}
          onClose={() => {
            setShowWizard(false);
            setEditingJourney(null);
          }}
          onSuccess={() => {
            setShowWizard(false);
            setEditingJourney(null);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Jornada</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a jornada "{deleteConfirm?.name}"? 
              Esta ação não pode ser desfeita e o progresso dos usuários será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
