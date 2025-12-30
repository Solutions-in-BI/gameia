import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Reorder } from "framer-motion";
import type { TrainingModule } from "@/hooks/useTrainingEditor";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
}

interface QuizEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function QuizEditor({ module, onChange }: QuizEditorProps) {
  const stepConfig = (module.step_config || {}) as { questions?: Question[]; shuffleQuestions?: boolean; showFeedback?: boolean };
  const questions = stepConfig.questions || [];

  const updateQuestions = (newQuestions: Question[]) => {
    onChange({
      step_config: {
        ...stepConfig,
        questions: newQuestions,
      },
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      points: 10,
    };
    updateQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    updateQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    updateQuestions(questions.filter((q) => q.id !== id));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    updateQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Quiz Settings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Configurações do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Embaralhar Perguntas</Label>
              <p className="text-xs text-muted-foreground">
                Ordem aleatória a cada tentativa
              </p>
            </div>
            <Switch
              checked={stepConfig.shuffleQuestions || false}
              onCheckedChange={(checked) =>
                onChange({
                  step_config: { ...stepConfig, shuffleQuestions: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar Feedback</Label>
              <p className="text-xs text-muted-foreground">
                Exibir se a resposta está correta
              </p>
            </div>
            <Switch
              checked={stepConfig.showFeedback !== false}
              onCheckedChange={(checked) =>
                onChange({
                  step_config: { ...stepConfig, showFeedback: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Perguntas ({questions.length})</Label>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Nenhuma pergunta ainda</p>
              <p className="text-sm">Clique em "Adicionar" para criar perguntas</p>
            </CardContent>
          </Card>
        ) : (
          <Reorder.Group axis="y" values={questions} onReorder={updateQuestions}>
            {questions.map((question, qIndex) => (
              <Reorder.Item key={question.id} value={question}>
                <Card className="mb-3">
                  <CardHeader className="py-3 flex flex-row items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="font-mono text-sm text-muted-foreground">
                      {qIndex + 1}.
                    </span>
                    <Input
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(question.id, { question: e.target.value })
                      }
                      placeholder="Digite a pergunta..."
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          points: parseInt(e.target.value) || 10,
                        })
                      }
                      className="w-16"
                      min={1}
                    />
                    <span className="text-xs text-muted-foreground">pts</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            question.correctIndex === oIndex
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-muted-foreground/30 hover:border-green-500/50"
                          }`}
                          onClick={() =>
                            updateQuestion(question.id, { correctIndex: oIndex })
                          }
                          title="Marcar como resposta correta"
                        >
                          {question.correctIndex === oIndex && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, oIndex, e.target.value)
                          }
                          placeholder={`Opção ${oIndex + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique no círculo para marcar a resposta correta
                    </p>
                  </CardContent>
                </Card>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
