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
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  iniciante: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediario: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  avancado: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  especialista: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const IMPORTANCE_COLORS: Record<string, string> = {
  essencial: "bg-red-500/10 text-red-500 border-red-500/20",
  estrategico: "bg-primary/10 text-primary border-primary/20",
  complementar: "bg-muted text-muted-foreground border-border",
};

interface JourneyCardProps {
  journey: TrainingJourney;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function JourneyCard({ journey, onEdit, onDelete, onToggleActive }: JourneyCardProps) {
  const levelLabel = JOURNEY_LEVELS.find(l => l.value === journey.level)?.label || journey.level;
  const categoryLabel = JOURNEY_CATEGORIES.find(c => c.value === journey.category)?.label || journey.category;

  return (
    <Card className={cn(
      "group hover:border-primary/30 transition-all",
      !journey.is_active && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${journey.color}20` }}
            >
              <Route className="h-5 w-5" style={{ color: journey.color }} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{journey.name}</CardTitle>
              <p className="text-xs text-muted-foreground truncate">{categoryLabel}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
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
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {journey.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{journey.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={LEVEL_COLORS[journey.level]}>
            {levelLabel}
          </Badge>
          <Badge variant="outline" className={IMPORTANCE_COLORS[journey.importance]}>
            {journey.importance}
          </Badge>
          {!journey.is_active && (
            <Badge variant="outline" className="bg-muted">Inativo</Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{journey.total_trainings}</p>
            <p className="text-xs text-muted-foreground">Treinamentos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{journey.total_estimated_hours}h</p>
            <p className="text-xs text-muted-foreground">Duração</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-primary">{journey.total_xp + journey.bonus_xp}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
        </div>

        {journey.generates_certificate && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Gera certificado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function JourneyCatalogSection() {
  const { organization } = useOrganization();
  const { journeys, isLoading, deleteJourney, toggleActive } = useTrainingJourneys(organization?.id);
  
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
            <JourneyCard
              key={journey.id}
              journey={journey}
              onEdit={() => setEditingJourney(journey)}
              onDelete={() => setDeleteConfirm(journey)}
              onToggleActive={() => handleToggleActive(journey)}
            />
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
