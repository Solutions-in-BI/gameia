import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Loader2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModuleTree } from "./ModuleTree";
import { StepEditor } from "./StepEditor";
import { StepSettings } from "./StepSettings";
import { useTrainingEditor } from "@/hooks/useTrainingEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Training {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  icon: string | null;
  is_active: boolean;
  xp_reward: number;
  coins_reward: number;
  estimated_hours: number;
}

interface TrainingEditorLayoutProps {
  training: Training;
  onBack: () => void;
}

export function TrainingEditorLayout({ training, onBack }: TrainingEditorLayoutProps) {
  const {
    modules,
    flatModules,
    selectedModule,
    isLoading,
    isSaving,
    isDirty,
    selectModule,
    addModule,
    updateModule,
    deleteModule,
    duplicateModule,
    reorderModules,
    saveChanges,
    discardChanges,
  } = useTrainingEditor(training.id);

  const handleSave = async () => {
    await saveChanges();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
              {training.icon || "📚"}
            </div>
            <div>
              <h1 className="font-semibold text-lg">{training.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{flatModules.length} módulos</span>
                <span>•</span>
                <span>{training.category || "Geral"}</span>
                {isDirty && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600/30">
                      Alterações não salvas
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="ghost" size="sm" onClick={discardChanges}>
              Descartar
            </Button>
          )}
          
          <Button variant="outline" size="sm" disabled>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                Exportar treinamento
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Duplicar treinamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Module Tree */}
            <ResizablePanel defaultSize={22} minSize={18} maxSize={30}>
              <ModuleTree
                modules={modules}
                selectedId={selectedModule?.id || null}
                onSelect={selectModule}
                onAddModule={() => addModule(null)}
                onAddSubstep={(parentId) => addModule(parentId)}
                onDelete={deleteModule}
                onDuplicate={duplicateModule}
                onReorder={reorderModules}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center Panel - Step Editor */}
            <ResizablePanel defaultSize={53}>
              <StepEditor
                module={selectedModule}
                onChange={(data) => selectedModule && updateModule(selectedModule.id, data)}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Settings */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <StepSettings
                module={selectedModule}
                onChange={(data) => selectedModule && updateModule(selectedModule.id, data)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
