import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Plus,
  GripVertical,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Video,
  HelpCircle,
  Gamepad2,
  Brain,
  Target,
  Handshake,
  MessageSquare,
  Trash2,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ModuleWithChildren } from "@/hooks/useTrainingEditor";

const STEP_TYPE_ICONS: Record<string, React.ElementType> = {
  content: FileText,
  video: Video,
  quiz: HelpCircle,
  arena_game: Gamepad2,
  cognitive_test: Brain,
  simulation: Target,
  practical_challenge: Target,
  commitment: Handshake,
  reflection: MessageSquare,
};

interface ModuleTreeProps {
  modules: ModuleWithChildren[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddModule: () => void;
  onAddSubstep: (parentId: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (modules: ModuleWithChildren[]) => void;
}

export function ModuleTree({
  modules,
  selectedId,
  onSelect,
  onAddModule,
  onAddSubstep,
  onDelete,
  onDuplicate,
  onReorder,
}: ModuleTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(modules.map(m => m.id)));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-3 border-b">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Estrutura
        </h2>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Nenhum módulo ainda</p>
              <p className="text-xs mt-1">Clique abaixo para adicionar</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={modules} onReorder={onReorder} className="space-y-1">
              {modules.map((module) => (
                <ModuleTreeItem
                  key={module.id}
                  module={module}
                  isSelected={selectedId === module.id}
                  isExpanded={expandedIds.has(module.id)}
                  onSelect={onSelect}
                  onToggleExpand={toggleExpand}
                  onAddSubstep={onAddSubstep}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  selectedId={selectedId}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </ScrollArea>

      {/* Add Module Button */}
      <div className="p-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={onAddModule}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>
    </div>
  );
}

interface ModuleTreeItemProps {
  module: ModuleWithChildren;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
  onAddSubstep: (parentId: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  selectedId: string | null;
  level?: number;
}

function ModuleTreeItem({
  module,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onAddSubstep,
  onDelete,
  onDuplicate,
  selectedId,
  level = 0,
}: ModuleTreeItemProps) {
  const hasChildren = module.children.length > 0;
  const Icon = STEP_TYPE_ICONS[module.step_type || "content"] || FileText;

  return (
    <Reorder.Item value={module} id={module.id}>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
          isSelected
            ? "bg-primary/10 border border-primary/30"
            : "hover:bg-muted/50",
          level > 0 && "ml-5"
        )}
        onClick={() => onSelect(module.id)}
      >
        {/* Drag Handle */}
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />

        {/* Expand/Collapse (only for parent modules) */}
        {level === 0 && (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(module.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )
            ) : (
              <div className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Numbering */}
        <span className="font-mono text-xs text-muted-foreground min-w-[24px]">
          {module.numbering || (module.order_index + 1)}
        </span>

        {/* Icon */}
        <Icon className="w-4 h-4 text-muted-foreground" />

        {/* Name */}
        <span className="flex-1 text-sm truncate">{module.name}</span>

        {/* Badges */}
        {module.is_checkpoint && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-yellow-500/50 text-yellow-600">
            CP
          </Badge>
        )}
        {module.is_optional && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            Opt
          </Badge>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {level === 0 && (
              <DropdownMenuItem onClick={() => onAddSubstep(module.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(module.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(module.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {module.children.map((child) => (
            <ModuleTreeItem
              key={child.id}
              module={child}
              isSelected={selectedId === child.id}
              isExpanded={false}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddSubstep={onAddSubstep}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              selectedId={selectedId}
              level={1}
            />
          ))}
        </div>
      )}
    </Reorder.Item>
  );
}
