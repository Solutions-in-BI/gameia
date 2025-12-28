/**
 * TrainingManagement - Gerenciamento completo de treinamentos
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  BookOpen,
  Clock,
  Users,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { TrainingFormModal } from "./TrainingFormModal";
import { TrainingModulesBuilder } from "./TrainingModulesBuilder";

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Iniciante", color: "bg-emerald-500/10 text-emerald-500" },
  intermediate: { label: "Intermediário", color: "bg-amber-500/10 text-amber-500" },
  advanced: { label: "Avançado", color: "bg-orange-500/10 text-orange-500" },
  expert: { label: "Expert", color: "bg-red-500/10 text-red-500" },
};

export function TrainingManagement() {
  const { currentOrg } = useOrganization();
  const {
    trainings,
    modules,
    isLoading,
    createTraining,
    updateTraining,
    deleteTraining,
    getTrainingModules,
  } = useTrainings(currentOrg?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTraining, setBuilderTraining] = useState<Training | null>(null);

  const categories = Array.from(new Set(trainings.map((t) => t.category)));

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || training.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    setSelectedTraining(null);
    setIsFormOpen(true);
  };

  const handleEdit = (training: Training) => {
    setSelectedTraining(training);
    setIsFormOpen(true);
  };

  const handleEditModules = (training: Training) => {
    setBuilderTraining(training);
    setIsBuilderOpen(true);
  };

  const handleDuplicate = async (training: Training) => {
    try {
      await createTraining({
        ...training,
        id: undefined,
        training_key: `${training.training_key}_copy`,
        name: `${training.name} (Cópia)`,
        is_active: false,
      } as Partial<Training>);
      toast.success("Treinamento duplicado!");
    } catch (error) {
      toast.error("Erro ao duplicar treinamento");
    }
  };

  const handleToggleActive = async (training: Training) => {
    try {
      await updateTraining(training.id, { is_active: !training.is_active });
      toast.success(training.is_active ? "Treinamento desativado" : "Treinamento ativado");
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const handleDelete = async (training: Training) => {
    if (!confirm(`Deseja excluir o treinamento "${training.name}"?`)) return;
    try {
      await deleteTraining(training.id);
      toast.success("Treinamento excluído!");
    } catch (error) {
      toast.error("Erro ao excluir treinamento");
    }
  };

  const handleFormSave = async (data: Partial<Training>) => {
    try {
      if (selectedTraining) {
        await updateTraining(selectedTraining.id, data);
        toast.success("Treinamento atualizado!");
      } else {
        await createTraining({
          ...data,
          organization_id: currentOrg?.id,
        });
        toast.success("Treinamento criado!");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar treinamento");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Treinamentos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os treinamentos e cursos da organização
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Treinamento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trainings Grid */}
      {filteredTrainings.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card/50">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum treinamento encontrado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {searchQuery || categoryFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece criando seu primeiro treinamento"}
          </p>
          {!searchQuery && categoryFilter === "all" && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Treinamento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTrainings.map((training) => {
            const trainingModules = getTrainingModules(training.id);

            return (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative flex flex-col p-5 rounded-2xl border bg-card transition-all",
                  !training.is_active && "opacity-60"
                )}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {training.is_onboarding && (
                    <Badge variant="secondary" className="text-xs">
                      Onboarding
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(training)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditModules(training)}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Módulos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(training)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(training)}>
                        {training.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(training)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-3 pr-16">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${training.color}20` }}
                  >
                    {training.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">{training.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", DIFFICULTY_LABELS[training.difficulty]?.color)}
                      >
                        {DIFFICULTY_LABELS[training.difficulty]?.label || training.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {training.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs border-t border-border pt-4">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="font-semibold text-foreground">
                        {trainingModules.length}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">módulos</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-semibold text-foreground">
                        {training.estimated_hours}h
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">duração</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Award className="w-3.5 h-3.5" />
                      <span className="font-semibold text-foreground">
                        {training.xp_reward}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">XP</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditModules(training)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Módulos
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(training)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <TrainingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        training={selectedTraining}
        onSave={handleFormSave}
      />

      {/* Modules Builder */}
      {builderTraining && (
        <TrainingModulesBuilder
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setBuilderTraining(null);
          }}
          training={builderTraining}
        />
      )}
    </div>
  );
}
