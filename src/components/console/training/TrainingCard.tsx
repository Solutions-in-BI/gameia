/**
 * TrainingCard - Card estratégico para exibição de treinamentos no catálogo
 * Mostra identidade, impacto de evolução, estado e ações rápidas
 */

import { 
  BookOpen,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Copy,
  Play,
  Pause,
  Send,
  Award,
  FileCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Training } from "@/hooks/useTrainings";
import { cn } from "@/lib/utils";

interface TrainingCardProps {
  training: Training;
  moduleCount: number;
  evolutionInfo?: {
    category?: string;
    level?: string;
    importance?: string;
    skillCount: number;
    hasInsignia: boolean;
    hasCertificate: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: (active: boolean) => void;
  onDistribute?: () => void;
}

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

const LEVEL_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  especialista: 'Especialista',
};

const IMPORTANCE_LABELS: Record<string, string> = {
  essencial: 'Essencial',
  estrategico: 'Estratégico',
  complementar: 'Complementar',
};

const STATUS_CONFIG = {
  active: { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-border' },
  draft: { label: 'Rascunho', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export function TrainingCard({
  training,
  moduleCount,
  evolutionInfo,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onDistribute,
}: TrainingCardProps) {
  const status = training.is_active ? 'active' : 'inactive';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className={cn(
      "group bg-card border rounded-xl overflow-hidden transition-all duration-200",
      "hover:shadow-lg hover:border-primary/30",
      !training.is_active && "opacity-75"
    )}>
      {/* Header com cor do treinamento */}
      <div 
        className="h-2"
        style={{ backgroundColor: training.color || 'hsl(var(--primary))' }}
      />

      <div className="p-4 space-y-4">
        {/* Identidade */}
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
            style={{ backgroundColor: `${training.color}15` }}
          >
            {training.icon || '📚'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate leading-tight">
              {training.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {training.description || "Sem descrição"}
            </p>
          </div>
        </div>

        {/* Pills de categoria e nível */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs font-medium">
            {CATEGORY_LABELS[training.category] || training.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {DIFFICULTY_LABELS[training.difficulty] || training.difficulty}
          </Badge>
          {training.is_onboarding && (
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
              Onboarding
            </Badge>
          )}
        </div>

        {/* Impacto de Evolução */}
        {evolutionInfo && (evolutionInfo.skillCount > 0 || evolutionInfo.hasInsignia || evolutionInfo.hasCertificate) && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {evolutionInfo.category && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Pacote:</span>{' '}
                {CATEGORY_LABELS[evolutionInfo.category] || evolutionInfo.category}
                {evolutionInfo.level && ` · ${LEVEL_LABELS[evolutionInfo.level] || evolutionInfo.level}`}
                {evolutionInfo.importance && ` · ${IMPORTANCE_LABELS[evolutionInfo.importance] || evolutionInfo.importance}`}
              </div>
            )}
            <div className="flex items-center gap-3">
              <TooltipProvider>
                {evolutionInfo.skillCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{evolutionInfo.skillCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {evolutionInfo.skillCount} skill{evolutionInfo.skillCount > 1 ? 's' : ''} impactada{evolutionInfo.skillCount > 1 ? 's' : ''}
                    </TooltipContent>
                  </Tooltip>
                )}
                {evolutionInfo.hasInsignia && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-amber-500">
                        <Award className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Concede insígnia</TooltipContent>
                  </Tooltip>
                )}
                {evolutionInfo.hasCertificate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-emerald-500">
                        <FileCheck className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Gera certificado</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Métricas rápidas */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {moduleCount} módulo{moduleCount !== 1 ? 's' : ''}
            </span>
            {training.estimated_hours > 0 && (
              <span>{training.estimated_hours}h</span>
            )}
          </div>
          <Badge variant="outline" className={cn("text-xs border", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={training.is_active}
                    onCheckedChange={onToggleActive}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {training.is_active ? 'Desativar' : 'Ativar'} treinamento
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="text-xs"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>

          {onDistribute && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDistribute}
              className="text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Distribuir
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/app/trainings/${training.id}`, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
