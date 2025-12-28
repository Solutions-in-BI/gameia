/**
 * TrainingModulesBuilder - Interface para gerenciar módulos de treinamento
 */

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  FileIcon,
  Link,
  Play,
  Clock,
  Award,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrainings, TrainingModule, Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { ModuleFormModal } from "./ModuleFormModal";

interface TrainingModulesBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training;
}

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  pdf: FileIcon,
  link: Link,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  text: "Texto",
  quiz: "Quiz",
  pdf: "PDF",
  link: "Link Externo",
};

export function TrainingModulesBuilder({
  isOpen,
  onClose,
  training,
}: TrainingModulesBuilderProps) {
  const { currentOrg } = useOrganization();
  const { modules: allModules, createModule, updateModule, deleteModule, reorderModules, refetch } =
    useTrainings(currentOrg?.id);

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [hasReordered, setHasReordered] = useState(false);

  useEffect(() => {
    const trainingModules = allModules
      .filter((m) => m.training_id === training.id)
      .sort((a, b) => a.order_index - b.order_index);
    setModules(trainingModules);
  }, [allModules, training.id]);

  const handleReorder = (newOrder: TrainingModule[]) => {
    setModules(newOrder);
    setHasReordered(true);
  };

  const handleSaveOrder = async () => {
    try {
      await reorderModules(modules.map((m) => m.id));
      setHasReordered(false);
      toast.success("Ordem salva!");
    } catch (error) {
      toast.error("Erro ao salvar ordem");
    }
  };

  const handleAddModule = () => {
    setSelectedModule(null);
    setIsModuleFormOpen(true);
  };

  const handleEditModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setIsModuleFormOpen(true);
  };

  const handleDeleteModule = async (module: TrainingModule) => {
    if (!confirm(`Deseja excluir o módulo "${module.name}"?`)) return;
    try {
      await deleteModule(module.id);
      toast.success("Módulo excluído!");
    } catch (error) {
      toast.error("Erro ao excluir módulo");
    }
  };

  const handleModuleSave = async (data: Partial<TrainingModule>) => {
    try {
      if (selectedModule) {
        await updateModule(selectedModule.id, data);
        toast.success("Módulo atualizado!");
      } else {
        await createModule({
          ...data,
          training_id: training.id,
          order_index: modules.length,
        });
        toast.success("Módulo criado!");
      }
      setIsModuleFormOpen(false);
      await refetch();
    } catch (error) {
      toast.error("Erro ao salvar módulo");
    }
  };

  const totalTime = modules.reduce((acc, m) => acc + m.time_minutes, 0);
  const totalXP = modules.reduce((acc, m) => acc + m.xp_reward, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${training.color}20` }}
            >
              {training.icon}
            </div>
            <div>
              <div>{training.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Gerenciar Módulos
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-foreground">{modules.length}</span> módulos
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-foreground">{totalTime}</span> min
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="w-4 h-4" />
              <span className="font-medium text-foreground">{totalXP}</span> XP
            </div>
          </div>
          <div className="flex gap-2">
            {hasReordered && (
              <Button variant="outline" size="sm" onClick={handleSaveOrder}>
                Salvar Ordem
              </Button>
            )}
            <Button size="sm" onClick={handleAddModule}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Módulo
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] pr-4">
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Nenhum módulo ainda
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione vídeos, textos, quizzes e outros conteúdos
              </p>
              <Button onClick={handleAddModule}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Módulo
              </Button>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={modules}
              onReorder={handleReorder}
              className="space-y-2 py-2"
            >
              {modules.map((module, index) => {
                const Icon = CONTENT_TYPE_ICONS[module.content_type] || FileText;

                return (
                  <Reorder.Item
                    key={module.id}
                    value={module}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      layout
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border bg-card",
                        "hover:border-primary/50 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground truncate">
                            {module.name}
                          </h4>
                          {module.is_preview && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Eye className="w-3 h-3" />
                              Preview
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5" />
                            {CONTENT_TYPE_LABELS[module.content_type]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {module.time_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {module.xp_reward} XP
                          </span>
                          {module.coins_reward > 0 && (
                            <span>🪙 {module.coins_reward}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModule(module);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}
        </ScrollArea>

        <ModuleFormModal
          isOpen={isModuleFormOpen}
          onClose={() => setIsModuleFormOpen(false)}
          module={selectedModule}
          onSave={handleModuleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
