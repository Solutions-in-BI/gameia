import React from 'react';
import { BookOpen, Clock, Target, Lightbulb, Zap, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { TrainingModule } from '@/hooks/useTrainingEditor';

interface GuidedReadingEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function GuidedReadingEditor({ module, onChange }: GuidedReadingEditorProps) {
  const config = (module.step_config as Record<string, any>) || {};

  const updateConfig = (updates: Record<string, any>) => {
    onChange({
      step_config: { ...config, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Informações do Capítulo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Título do Capítulo/Trecho</Label>
            <Input
              id="chapter-title"
              value={config.chapter_title || ''}
              onChange={(e) => updateConfig({ chapter_title: e.target.value })}
              placeholder="Ex: Capítulo 3 - A Arte de Ouvir"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt-text">Texto do Trecho</Label>
            <Textarea
              id="excerpt-text"
              value={config.excerpt_text || ''}
              onChange={(e) => updateConfig({ excerpt_text: e.target.value })}
              placeholder="Cole aqui o trecho do livro..."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Ou use o campo abaixo para um resumo guiado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Resumo Guiado (alternativa ao trecho)</Label>
            <Textarea
              id="summary"
              value={config.summary || ''}
              onChange={(e) => updateConfig({ summary: e.target.value })}
              placeholder="Resumo contextualizado do conteúdo..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objetivo de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="learning-objective">O que o leitor deve aprender?</Label>
            <Textarea
              id="learning-objective"
              value={config.learning_objective || ''}
              onChange={(e) => updateConfig({ learning_objective: e.target.value })}
              placeholder="Ex: Compreender a importância da escuta ativa em negociações..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context-why-matters" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Por que isso importa?
            </Label>
            <Textarea
              id="context-why-matters"
              value={config.context_why_matters || ''}
              onChange={(e) => updateConfig({ context_why_matters: e.target.value })}
              placeholder="Conexão prática com o dia a dia do trabalho..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-reading">Tempo estimado (minutos)</Label>
              <Input
                id="estimated-reading"
                type="number"
                min={1}
                value={config.estimated_reading_minutes || 5}
                onChange={(e) => updateConfig({ estimated_reading_minutes: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-name" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Skill Impactada (nome)
            </Label>
            <Input
              id="skill-name"
              value={config.skill_name || ''}
              onChange={(e) => updateConfig({ skill_name: e.target.value })}
              placeholder="Ex: Comunicação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdi-goal-name" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Meta do PDI Relacionada (nome)
            </Label>
            <Input
              id="pdi-goal-name"
              value={config.pdi_goal_name || ''}
              onChange={(e) => updateConfig({ pdi_goal_name: e.target.value })}
              placeholder="Ex: Melhorar habilidades de negociação"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
