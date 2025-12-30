/**
 * TrainingCatalogSection - Gerenciamento de catálogo de treinamentos
 * Foca em criação de conteúdo, sem configurações de distribuição/recompensas
 */

import { useState } from "react";
import { 
  Plus, 
  Search, 
  GraduationCap,
  BookOpen,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { TrainingWizard } from "@/components/admin/training/TrainingWizard";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  vendas: 'Vendas',
  lideranca: 'Liderança',
  soft_skills: 'Soft Skills',
  produtividade: 'Produtividade',
  estrategia: 'Estratégia',
  onboarding: 'Onboarding',
  compliance: 'Compliance',
  tecnico: 'Técnico',
  general: 'Geral',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export function TrainingCatalogSection() {
  const { organization } = useOrganization();
  const { trainings, modules, isLoading, createTraining, updateTraining, deleteTraining, refetch } = useTrainings(organization?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  const filteredTrainings = trainings.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveTraining = async (data: Partial<Training>) => {
    try {
      if (selectedTraining) {
        await updateTraining(selectedTraining.id, data);
        toast.success("Treinamento atualizado");
      } else {
        await createTraining({ ...data, organization_id: organization?.id } as Training);
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
      const { id, created_at, ...data } = training;
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

  const getModuleCount = (trainingId: string) => {
    return modules.filter(m => m.training_id === trainingId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Treinamentos</h1>
          <p className="text-muted-foreground">Crie e gerencie o conteúdo dos treinamentos</p>
        </div>
        <Button onClick={() => { setSelectedTraining(null); setWizardOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamentos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Training List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum treinamento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "Tente ajustar sua busca" : "Comece criando seu primeiro treinamento"}
          </p>
          {!searchQuery && (
            <Button onClick={() => { setSelectedTraining(null); setWizardOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Treinamento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTrainings.map((training) => (
            <div
              key={training.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${training.color}20` }}
                >
                  {training.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{training.name}</h3>
                    {!training.is_active && (
                      <Badge variant="outline" className="text-xs">Inativo</Badge>
                    )}
                    {training.is_onboarding && (
                      <Badge className="bg-blue-500/10 text-blue-500 text-xs">Onboarding</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {training.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {getModuleCount(training.id)} módulos
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[training.category] || training.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {DIFFICULTY_LABELS[training.difficulty] || training.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedTraining(training); setWizardOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/app/trainings/${training.id}`, '_blank')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTraining(training)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTraining(training)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
