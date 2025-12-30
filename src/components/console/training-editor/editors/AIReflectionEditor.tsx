import React from 'react';
import { Brain, MessageCircle, Zap, Target, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { TrainingModule } from '@/hooks/useTrainingEditor';

interface AIReflectionEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function AIReflectionEditor({ module, onChange }: AIReflectionEditorProps) {
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
            <Brain className="w-4 h-4" />
            Contexto para a IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Título do Capítulo/Conteúdo</Label>
            <Input
              id="chapter-title"
              value={config.chapter_title || ''}
              onChange={(e) => updateConfig({ chapter_title: e.target.value })}
              placeholder="Ex: Capítulo 3 - A Arte de Ouvir"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter-content">Conteúdo Base (para contexto da IA)</Label>
            <Textarea
              id="chapter-content"
              value={config.chapter_content || ''}
              onChange={(e) => updateConfig({ chapter_content: e.target.value })}
              placeholder="Resumo ou pontos-chave do conteúdo que a IA deve usar como referência..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-objective">Objetivo de Aprendizado</Label>
            <Input
              id="learning-objective"
              value={config.learning_objective || ''}
              onChange={(e) => updateConfig({ learning_objective: e.target.value })}
              placeholder="O que o usuário deve demonstrar que entendeu?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context-why-matters">Por que isso importa?</Label>
            <Textarea
              id="context-why-matters"
              value={config.context_why_matters || ''}
              onChange={(e) => updateConfig({ context_why_matters: e.target.value })}
              placeholder="Conexão prática com o trabalho..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Prompts de Reflexão (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Perguntas Iniciais</Label>
            <Textarea
              value={(config.reflection_prompts || []).join('\n')}
              onChange={(e) => updateConfig({ 
                reflection_prompts: e.target.value.split('\n').filter(p => p.trim()) 
              })}
              placeholder="Uma pergunta por linha. A IA usará estas como base.&#10;Ex: Como esse conceito aparece no seu trabalho?&#10;O que você faria diferente a partir disso?"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Se vazio, a IA gerará perguntas automaticamente baseadas no conteúdo
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações de Validação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Caracteres mínimos por resposta: {config.min_response_characters || 50}</Label>
            <Slider
              value={[config.min_response_characters || 50]}
              onValueChange={([value]) => updateConfig({ min_response_characters: value })}
              min={20}
              max={500}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <Label>Score mínimo de compreensão: {config.comprehension_threshold || 60}%</Label>
            <Slider
              value={[config.comprehension_threshold || 60]}
              onValueChange={([value]) => updateConfig({ comprehension_threshold: value })}
              min={40}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Usuários precisam atingir este score para avançar
            </p>
          </div>

          <div className="space-y-2">
            <Label>Máximo de perguntas da IA: {config.max_ai_questions || 5}</Label>
            <Slider
              value={[config.max_ai_questions || 5]}
              onValueChange={([value]) => updateConfig({ max_ai_questions: value })}
              min={3}
              max={10}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Exigir exemplo prático</Label>
              <p className="text-xs text-muted-foreground">
                A IA pedirá exemplos do dia a dia
              </p>
            </div>
            <Switch
              checked={config.require_practical_example !== false}
              onCheckedChange={(checked) => updateConfig({ require_practical_example: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Conexões (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Skill Impactada
            </Label>
            <Input
              id="skill-name"
              value={config.skill_name || ''}
              onChange={(e) => updateConfig({ skill_name: e.target.value })}
              placeholder="Ex: Comunicação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdi-goal-context">Contexto da Meta do PDI</Label>
            <Input
              id="pdi-goal-context"
              value={config.pdi_goal_context || ''}
              onChange={(e) => updateConfig({ pdi_goal_context: e.target.value })}
              placeholder="Ex: Melhorar habilidades de negociação"
            />
            <p className="text-xs text-muted-foreground">
              A IA usará isso para conectar reflexões com metas do usuário
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
