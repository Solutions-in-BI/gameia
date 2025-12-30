import React from 'react';
import { Target, Clock, FileText, Link2, Upload, CheckCircle2, Zap, Brain, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { TrainingModule } from '@/hooks/useTrainingEditor';

interface RoutineApplicationEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function RoutineApplicationEditor({ module, onChange }: RoutineApplicationEditorProps) {
  const config = (module.step_config as Record<string, any>) || {};

  const updateConfig = (updates: Record<string, any>) => {
    onChange({
      step_config: { ...config, ...updates }
    });
  };

  const evidenceTypes = [
    { value: 'checkin', label: 'Check-in', icon: CheckCircle2, description: 'Confirmação simples' },
    { value: 'text', label: 'Texto', icon: FileText, description: 'Descrição da aplicação' },
    { value: 'file', label: 'Arquivo', icon: Upload, description: 'Upload de evidência' },
    { value: 'link', label: 'Link', icon: Link2, description: 'URL de comprovação' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Ação Prática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action-description">Descrição da Ação</Label>
            <Textarea
              id="action-description"
              value={config.action_description || ''}
              onChange={(e) => updateConfig({ action_description: e.target.value })}
              placeholder="O que o usuário deve fazer na prática? Ex: Aplicar a técnica de escuta ativa em uma reunião com cliente..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected-impact">Impacto Esperado</Label>
            <Textarea
              id="expected-impact"
              value={config.expected_impact || ''}
              onChange={(e) => updateConfig({ expected_impact: e.target.value })}
              placeholder="Qual resultado a aplicação deve gerar? Ex: Melhor compreensão das necessidades do cliente..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Prazo e Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deadline-days">Prazo (dias)</Label>
            <Input
              id="deadline-days"
              type="number"
              min={1}
              max={30}
              value={config.deadline_days || 7}
              onChange={(e) => updateConfig({ deadline_days: parseInt(e.target.value) || 7 })}
            />
            <p className="text-xs text-muted-foreground">
              Dias que o usuário terá para completar a aplicação
            </p>
          </div>

          <div className="space-y-3">
            <Label>Tipo de Evidência</Label>
            <RadioGroup
              value={config.evidence_type || 'text'}
              onValueChange={(value) => updateConfig({ evidence_type: value })}
              className="grid grid-cols-2 gap-3"
            >
              {evidenceTypes.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={`evidence-${type.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`evidence-${type.value}`}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <type.icon className="w-5 h-5 mb-2" />
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {type.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Compromisso Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Criar como Compromisso Real</Label>
              <p className="text-xs text-muted-foreground">
                Prazo vira responsabilidade com alertas automáticos
              </p>
            </div>
            <Switch
              checked={config.is_real_commitment !== false}
              onCheckedChange={(checked) => updateConfig({ is_real_commitment: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembretes Automáticos</Label>
              <p className="text-xs text-muted-foreground">
                Enviar alertas antes do prazo e em caso de atraso
              </p>
            </div>
            <Switch
              checked={config.auto_reminders !== false}
              onCheckedChange={(checked) => updateConfig({ auto_reminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificar Gestor</Label>
              <p className="text-xs text-muted-foreground">
                Gestor recebe notificação de conclusão e atrasos
              </p>
            </div>
            <Switch
              checked={config.notify_manager === true}
              onCheckedChange={(checked) => updateConfig({ notify_manager: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gerar Missão Diária</Label>
              <p className="text-xs text-muted-foreground">
                Cria uma missão automática para o usuário
              </p>
            </div>
            <Switch
              checked={config.can_generate_daily_mission === true}
              onCheckedChange={(checked) => updateConfig({ can_generate_daily_mission: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gerar Desafio</Label>
              <p className="text-xs text-muted-foreground">
                Transforma em desafio individual ou de equipe
              </p>
            </div>
            <Switch
              checked={config.can_generate_challenge === true}
              onCheckedChange={(checked) => updateConfig({ can_generate_challenge: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Conexões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Skill Impactada</Label>
            <Input
              id="skill-name"
              value={config.skill_name || ''}
              onChange={(e) => updateConfig({ skill_name: e.target.value })}
              placeholder="Ex: Comunicação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdi-goal-name">Meta do PDI</Label>
            <Input
              id="pdi-goal-name"
              value={config.pdi_goal_name || ''}
              onChange={(e) => updateConfig({ pdi_goal_name: e.target.value })}
              placeholder="Ex: Melhorar habilidades de negociação"
            />
            <p className="text-xs text-muted-foreground">
              Conclusão da aplicação pode atualizar progresso do PDI
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
