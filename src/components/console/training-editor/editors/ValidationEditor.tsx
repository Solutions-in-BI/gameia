import React, { useState } from 'react';
import { 
  ClipboardCheck, Target, Brain, Gamepad2, Settings, 
  Plus, Trash2, GripVertical, CheckCircle2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TrainingModule } from '@/hooks/useTrainingEditor';

interface ValidationEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface ScenarioOption {
  text: string;
  is_optimal: boolean;
  feedback: string;
  score: number;
}

export function ValidationEditor({ module, onChange }: ValidationEditorProps) {
  const config = (module.step_config as Record<string, any>) || {};
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const updateConfig = (updates: Record<string, any>) => {
    onChange({
      step_config: { ...config, ...updates }
    });
  };

  const validationTypes = [
    { value: 'quiz', label: 'Quiz', icon: ClipboardCheck, description: 'Perguntas e respostas' },
    { value: 'scenario', label: 'Cenário', icon: Target, description: 'Decisão contextual' },
    { value: 'self_assessment', label: 'Autoavaliação', icon: CheckCircle2, description: 'Avaliação própria' },
    { value: 'game', label: 'Jogo', icon: Gamepad2, description: 'Jogo cognitivo' },
  ];

  // Quiz management
  const questions: QuizQuestion[] = config.quiz_questions || [];

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
    };
    updateConfig({ quiz_questions: [...questions, newQuestion] });
    setActiveQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    updateConfig({ quiz_questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    updateConfig({ quiz_questions: updated });
    if (activeQuestionIndex >= updated.length) {
      setActiveQuestionIndex(Math.max(0, updated.length - 1));
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    updateConfig({ quiz_questions: updated });
  };

  // Scenario management
  const scenarioOptions: ScenarioOption[] = config.scenario_options || [];

  const addScenarioOption = () => {
    const newOption: ScenarioOption = {
      text: '',
      is_optimal: false,
      feedback: '',
      score: 50,
    };
    updateConfig({ scenario_options: [...scenarioOptions, newOption] });
  };

  const updateScenarioOption = (index: number, updates: Partial<ScenarioOption>) => {
    const updated = [...scenarioOptions];
    updated[index] = { ...updated[index], ...updates };
    updateConfig({ scenario_options: updated });
  };

  const removeScenarioOption = (index: number) => {
    updateConfig({ scenario_options: scenarioOptions.filter((_, i) => i !== index) });
  };

  // Self-assessment management
  const selfCriteria: string[] = config.self_assessment_criteria || [];

  const addCriterion = () => {
    updateConfig({ self_assessment_criteria: [...selfCriteria, ''] });
  };

  const updateCriterion = (index: number, value: string) => {
    const updated = [...selfCriteria];
    updated[index] = value;
    updateConfig({ self_assessment_criteria: updated });
  };

  const removeCriterion = (index: number) => {
    updateConfig({ self_assessment_criteria: selfCriteria.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Tipo de Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={config.validation_type || 'quiz'}
            onValueChange={(value) => updateConfig({ validation_type: value })}
            className="grid grid-cols-2 gap-3"
          >
            {validationTypes.map((type) => (
              <div key={type.value}>
                <RadioGroupItem
                  value={type.value}
                  id={`validation-${type.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`validation-${type.value}`}
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
        </CardContent>
      </Card>

      {/* Quiz Editor */}
      {config.validation_type === 'quiz' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Questões do Quiz</CardTitle>
              <Button size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma questão adicionada. Clique em "Adicionar" para começar.
              </p>
            ) : (
              <>
                <div className="flex gap-2 flex-wrap">
                  {questions.map((q, i) => (
                    <Button
                      key={q.id}
                      variant={activeQuestionIndex === i ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveQuestionIndex(i)}
                    >
                      Q{i + 1}
                    </Button>
                  ))}
                </div>

                {questions[activeQuestionIndex] && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Badge>Questão {activeQuestionIndex + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(activeQuestionIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Pergunta</Label>
                      <Textarea
                        value={questions[activeQuestionIndex].question}
                        onChange={(e) => updateQuestion(activeQuestionIndex, { question: e.target.value })}
                        placeholder="Digite a pergunta..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Opções (selecione a correta)</Label>
                      {questions[activeQuestionIndex].options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${activeQuestionIndex}`}
                            checked={questions[activeQuestionIndex].correct_index === optIndex}
                            onChange={() => updateQuestion(activeQuestionIndex, { correct_index: optIndex })}
                            className="w-4 h-4"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(activeQuestionIndex, optIndex, e.target.value)}
                            placeholder={`Opção ${optIndex + 1}`}
                            className={questions[activeQuestionIndex].correct_index === optIndex 
                              ? 'border-green-500' 
                              : ''
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Explicação (opcional)</Label>
                      <Textarea
                        value={questions[activeQuestionIndex].explanation || ''}
                        onChange={(e) => updateQuestion(activeQuestionIndex, { explanation: e.target.value })}
                        placeholder="Explique por que esta é a resposta correta..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scenario Editor */}
      {config.validation_type === 'scenario' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuração do Cenário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Cenário</Label>
              <Input
                value={config.scenario_title || ''}
                onChange={(e) => updateConfig({ scenario_title: e.target.value })}
                placeholder="Ex: Reunião com Cliente Difícil"
              />
            </div>

            <div className="space-y-2">
              <Label>Contexto</Label>
              <Textarea
                value={config.scenario_context || ''}
                onChange={(e) => updateConfig({ scenario_context: e.target.value })}
                placeholder="Descreva o cenário em que o usuário está..."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Opções de Decisão</Label>
                <Button size="sm" variant="outline" onClick={addScenarioOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {scenarioOptions.map((option, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={option.is_optimal ? 'default' : 'outline'}>
                        {option.is_optimal ? 'Ótima' : 'Opção ' + (index + 1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {option.score}%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScenarioOption(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <Input
                    value={option.text}
                    onChange={(e) => updateScenarioOption(index, { text: e.target.value })}
                    placeholder="Texto da opção..."
                  />

                  <Textarea
                    value={option.feedback}
                    onChange={(e) => updateScenarioOption(index, { feedback: e.target.value })}
                    placeholder="Feedback para esta escolha..."
                    rows={2}
                  />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.is_optimal}
                        onCheckedChange={(checked) => updateScenarioOption(index, { is_optimal: checked })}
                      />
                      <Label className="text-sm">Decisão ótima</Label>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Slider
                        value={[option.score]}
                        onValueChange={([value]) => updateScenarioOption(index, { score: value })}
                        min={0}
                        max={100}
                        step={10}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Self-Assessment Editor */}
      {config.validation_type === 'self_assessment' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Critérios de Autoavaliação</CardTitle>
              <Button size="sm" variant="outline" onClick={addCriterion}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selfCriteria.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Adicione critérios para o usuário se autoavaliar
              </p>
            ) : (
              selfCriteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={criterion}
                    onChange={(e) => updateCriterion(index, e.target.value)}
                    placeholder={`Critério ${index + 1}...`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Editor */}
      {config.validation_type === 'game' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuração do Jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Jogo</Label>
              <RadioGroup
                value={config.game_type || 'memory'}
                onValueChange={(value) => updateConfig({ game_type: value })}
                className="grid grid-cols-3 gap-2"
              >
                {['memory', 'quiz', 'decision'].map((type) => (
                  <div key={type}>
                    <RadioGroupItem value={type} id={`game-${type}`} className="peer sr-only" />
                    <Label
                      htmlFor={`game-${type}`}
                      className="flex items-center justify-center rounded-lg border-2 border-muted p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      {type === 'memory' && 'Memória'}
                      {type === 'quiz' && 'Quiz'}
                      {type === 'decision' && 'Decisão'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <p className="text-xs text-muted-foreground">
              Integração com Arena em desenvolvimento
            </p>
          </CardContent>
        </Card>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Score mínimo para passar: {config.min_passing_score || 70}%</Label>
            <Slider
              value={[config.min_passing_score || 70]}
              onValueChange={([value]) => updateConfig({ min_passing_score: value })}
              min={40}
              max={100}
              step={5}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permitir Retry</Label>
              <p className="text-xs text-muted-foreground">
                Usuário pode tentar novamente se não passar
              </p>
            </div>
            <Switch
              checked={config.allow_retry !== false}
              onCheckedChange={(checked) => updateConfig({ allow_retry: checked })}
            />
          </div>

          {config.allow_retry !== false && (
            <div className="space-y-2">
              <Label>Máximo de tentativas: {config.max_attempts || 3}</Label>
              <Slider
                value={[config.max_attempts || 3]}
                onValueChange={([value]) => updateConfig({ max_attempts: value })}
                min={1}
                max={10}
                step={1}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
