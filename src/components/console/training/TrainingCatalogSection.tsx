/**
 * TrainingCatalogSection - Gerenciamento de catálogo de treinamentos
 * Grid de cards estratégicos com filtros e visualização de impacto
 */

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  GraduationCap,
  LayoutGrid,
  List,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { useEvolutionTemplates, EvolutionTemplate } from "@/hooks/useEvolutionTemplates";
import { TrainingWizard } from "@/components/admin/training/TrainingWizard";
import { TrainingCard } from "./TrainingCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas Categorias' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'lideranca', label: 'Liderança' },
  { value: 'soft_skills', label: 'Soft Skills' },
  { value: 'produtividade', label: 'Produtividade' },
  { value: 'estrategia', label: 'Estratégia' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'general', label: 'Geral' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Todos Níveis' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos Status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

type ViewMode = 'grid' | 'list';

export function TrainingCatalogSection() {
  const { currentOrg } = useOrganization();
  const { trainings, modules, isLoading, createTraining, updateTraining, deleteTraining } = useTrainings(currentOrg?.id);
  const { templates } = useEvolutionTemplates(currentOrg?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  const hasActiveFilters = categoryFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setStatusFilter('all');
  };

  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      
      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'all' || t.difficulty === difficultyFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && t.is_active) ||
        (statusFilter === 'inactive' && !t.is_active);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [trainings, searchQuery, categoryFilter, difficultyFilter, statusFilter]);

  const getModuleCount = (trainingId: string) => {
    return modules.filter(m => m.training_id === trainingId).length;
  };

  const getEvolutionInfo = (training: Training) => {
    // Try to get from snapshot first
    const snapshot = training.evolution_snapshot as any;
    if (snapshot) {
      return {
        category: snapshot.category,
        level: snapshot.level,
        importance: snapshot.importance,
        skillCount: snapshot.skill_impacts?.length || 0,
        hasInsignia: (snapshot.insignia_ids?.length || 0) > 0,
        hasCertificate: snapshot.generates_certificate || false,
      };
    }

    // Fallback to template if linked
    const templateId = training.evolution_template_id;
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        return {
          category: template.category,
          level: template.level,
          importance: template.importance,
          skillCount: template.skill_impacts.length,
          hasInsignia: template.insignia_ids.length > 0,
          hasCertificate: template.generates_certificate,
        };
      }
    }

    // Check training's own fields
    return {
      category: undefined,
      level: undefined,
      importance: undefined,
      skillCount: 0,
      hasInsignia: !!training.insignia_reward_id,
      hasCertificate: training.certificate_enabled,
    };
  };

  const handleSaveTraining = async (data: Partial<Training>) => {
    try {
      if (selectedTraining) {
        await updateTraining(selectedTraining.id, data);
        toast.success("Treinamento atualizado");
      } else {
        await createTraining({ ...data, organization_id: currentOrg?.id } as Training);
        toast.success("Treinamento criado");
      }
      setWizardOpen(false);
      setSelectedTraining(null);
    } catch (error) {
      toast.error("Erro ao salvar treinamento");
    }
  };

  const handleDeleteTraining = async (training: Training) => {
    if (!confirm(`Deseja excluir o treinamento "${training.name}"?`)) return;
    try {
      await deleteTraining(training.id);
      toast.success("Treinamento excluído");
    } catch (error) {
      toast.error("Erro ao excluir treinamento");
    }
  };

  const handleDuplicateTraining = async (training: Training) => {
    try {
      const { id, ...data } = training;
      await createTraining({
        ...data,
        name: `${training.name} (Cópia)`,
        training_key: `${training.training_key}_copy_${Date.now()}`,
        is_active: false,
      } as Training);
      toast.success("Treinamento duplicado");
    } catch (error) {
      toast.error("Erro ao duplicar treinamento");
    }
  };

  const handleToggleActive = async (training: Training, active: boolean) => {
    try {
      await updateTraining(training.id, { is_active: active });
      toast.success(active ? "Treinamento ativado" : "Treinamento desativado");
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const activeCount = trainings.filter(t => t.is_active).length;
  const inactiveCount = trainings.filter(t => !t.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Treinamentos</h1>
          <p className="text-muted-foreground">
            {trainings.length} treinamento{trainings.length !== 1 ? 's' : ''} • {activeCount} ativo{activeCount !== 1 ? 's' : ''} • {inactiveCount} inativo{inactiveCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setSelectedTraining(null); setWizardOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}

          <div className="hidden sm:block h-6 w-px bg-border mx-1" />

          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="grid" aria-label="Grid view" className="px-2">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="px-2">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || hasActiveFilters) && (
        <div className="text-sm text-muted-foreground">
          {filteredTrainings.length} resultado{filteredTrainings.length !== 1 ? 's' : ''} encontrado{filteredTrainings.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Training Grid/List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum treinamento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || hasActiveFilters 
              ? "Tente ajustar seus filtros ou busca" 
              : "Comece criando seu primeiro treinamento"}
          </p>
          {!searchQuery && !hasActiveFilters && (
            <Button onClick={() => { setSelectedTraining(null); setWizardOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Treinamento
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid gap-3"
        )}>
          {filteredTrainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              moduleCount={getModuleCount(training.id)}
              evolutionInfo={getEvolutionInfo(training)}
              onEdit={() => { setSelectedTraining(training); setWizardOpen(true); }}
              onDelete={() => handleDeleteTraining(training)}
              onDuplicate={() => handleDuplicateTraining(training)}
              onToggleActive={(active) => handleToggleActive(training, active)}
            />
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      <TrainingWizard
        isOpen={wizardOpen}
        onClose={() => { setWizardOpen(false); setSelectedTraining(null); }}
        training={selectedTraining}
        onSave={handleSaveTraining}
      />
    </div>
  );
}
