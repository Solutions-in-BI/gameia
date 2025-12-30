import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Video,
  HelpCircle,
  Gamepad2,
  Brain,
  Target,
  Handshake,
  MessageSquare,
  MousePointerClick,
  BookOpen,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import type { TrainingModule } from "@/hooks/useTrainingEditor";
import { ContentEditor } from "./editors/ContentEditor";
import { QuizEditor } from "./editors/QuizEditor";
import { GameEditor } from "./editors/GameEditor";
import { GuidedReadingEditor } from "./editors/GuidedReadingEditor";
import { AIReflectionEditor } from "./editors/AIReflectionEditor";
import { RoutineApplicationEditor } from "./editors/RoutineApplicationEditor";
import { ValidationEditor } from "./editors/ValidationEditor";

const STEP_TYPES = [
  { value: "content", label: "Conteúdo", icon: FileText, description: "Texto, vídeo, PDF ou link" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, description: "Perguntas e respostas" },
  { value: "arena_game", label: "Jogo", icon: Gamepad2, description: "Jogo da Arena" },
  { value: "cognitive_test", label: "Teste Cognitivo", icon: Brain, description: "Avaliação cognitiva" },
  { value: "simulation", label: "Simulação", icon: Target, description: "Simulação prática" },
  { value: "practical_challenge", label: "Desafio", icon: Target, description: "Desafio prático" },
  { value: "commitment", label: "Compromisso", icon: Handshake, description: "Compromisso pessoal" },
  { value: "reflection", label: "Reflexão", icon: MessageSquare, description: "Checkpoint de reflexão" },
  // New book-guided types
  { value: "guided_reading", label: "Leitura Guiada", icon: BookOpen, description: "Leitura com contexto" },
  { value: "ai_reflection", label: "Reflexão IA", icon: Sparkles, description: "Reflexão guiada por IA" },
  { value: "routine_application", label: "Aplicação Prática", icon: Target, description: "Aplicação na rotina" },
  { value: "validation", label: "Validação", icon: ClipboardCheck, description: "Validação de aprendizado" },
];

interface StepEditorProps {
  module: TrainingModule | null;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function StepEditor({ module, onChange }: StepEditorProps) {
  if (!module) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <MousePointerClick className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Selecione um módulo</p>
          <p className="text-sm">Clique em um módulo na árvore para editar</p>
        </div>
      </div>
    );
  }

  const currentType = STEP_TYPES.find(t => t.value === module.step_type) || STEP_TYPES[0];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Type Selector */}
      <div className="p-4 border-b space-y-4">
        <div className="space-y-2">
          <Label htmlFor="module-name">Nome do Módulo</Label>
          <Input
            id="module-name"
            value={module.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex: Introdução às Vendas"
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="module-description">Descrição</Label>
          <Textarea
            id="module-description"
            value={module.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Descreva o objetivo deste módulo..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Etapa</Label>
          <Select
            value={module.step_type || "content"}
            onValueChange={(value) => onChange({ step_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STEP_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic Editor based on Type */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderEditor(module, onChange)}
        </div>
      </ScrollArea>
    </div>
  );
}

function renderEditor(module: TrainingModule, onChange: (data: Partial<TrainingModule>) => void) {
  switch (module.step_type) {
    case "content":
      return <ContentEditor module={module} onChange={onChange} />;
    case "quiz":
      return <QuizEditor module={module} onChange={onChange} />;
    case "arena_game":
      return <GameEditor module={module} onChange={onChange} />;
    case "cognitive_test":
      return <CognitiveTestPlaceholder />;
    case "simulation":
      return <SimulationPlaceholder />;
    case "practical_challenge":
      return <ChallengePlaceholder />;
    case "commitment":
      return <CommitmentPlaceholder />;
    case "reflection":
      return <ReflectionPlaceholder />;
    // New book-guided types
    case "guided_reading":
      return <GuidedReadingEditor module={module} onChange={onChange} />;
    case "ai_reflection":
      return <AIReflectionEditor module={module} onChange={onChange} />;
    case "routine_application":
      return <RoutineApplicationEditor module={module} onChange={onChange} />;
    case "validation":
      return <ValidationEditor module={module} onChange={onChange} />;
    default:
      return <ContentEditor module={module} onChange={onChange} />;
  }
}

function CognitiveTestPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Teste Cognitivo</p>
        <p className="text-sm">Selecione um teste cognitivo existente para incluir nesta etapa.</p>
        <p className="text-xs mt-2">Em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}

function SimulationPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Simulação</p>
        <p className="text-sm">Configure uma simulação prática para esta etapa.</p>
        <p className="text-xs mt-2">Em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}

function ChallengePlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Desafio Prático</p>
        <p className="text-sm">Defina um desafio prático com critérios de avaliação.</p>
        <p className="text-xs mt-2">Em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}

function CommitmentPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        <Handshake className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Compromisso</p>
        <p className="text-sm">Configure um compromisso pessoal para o participante.</p>
        <p className="text-xs mt-2">Em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}

function ReflectionPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Reflexão</p>
        <p className="text-sm">Adicione um checkpoint de reflexão para consolidar o aprendizado.</p>
        <p className="text-xs mt-2">Em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}
