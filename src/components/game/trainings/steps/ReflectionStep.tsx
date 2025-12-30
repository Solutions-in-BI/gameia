/**
 * ReflectionStep - Reflection checkpoint for training
 */

import { useState } from "react";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NoteButton } from "@/components/notes/NoteButton";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

interface ReflectionStepProps {
  module: EnhancedTrainingModule;
  onComplete: (result: StepResult) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ReflectionStep({ 
  module, 
  onComplete, 
  onCancel, 
  isSubmitting 
}: ReflectionStepProps) {
  const [reflection, setReflection] = useState("");
  const [startTime] = useState(Date.now());

  const minCharacters = module.step_config?.min_characters || 50;
  const reflectionPrompt = module.step_config?.reflection_prompt || module.description || 
    "Reflita sobre o que você aprendeu até agora neste treinamento.";

  const isValid = reflection.trim().length >= minCharacters;
  const charactersRemaining = minCharacters - reflection.trim().length;

  const handleSubmit = () => {
    if (!isValid) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    onComplete({
      completed: true,
      score: 100,
      passed: true,
      timeSpent,
      metadata: {
        reflection_text: reflection.trim(),
        characters: reflection.trim().length,
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="text-xs">Reflexão</Badge>
                {module.is_checkpoint && (
                  <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Checkpoint
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground">{module.name}</h3>
            </div>
          </div>
          
          {/* Note Button */}
          <NoteButton
            trainingId={module.training_id}
            moduleId={module.id}
            contentType="reflection"
            variant="inline"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prompt */}
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Momento de Reflexão</h4>
                <p className="text-muted-foreground">{reflectionPrompt}</p>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Escreva sua reflexão aqui..."
              className="min-h-[200px] resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={charactersRemaining > 0 ? "text-amber-600" : "text-primary"}>
                {charactersRemaining > 0 
                  ? `Faltam ${charactersRemaining} caracteres`
                  : `${reflection.trim().length} caracteres`
                }
              </span>
              {isValid && (
                <span className="text-primary flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Pronto para enviar
                </span>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-foreground mb-2">Dicas para sua reflexão:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• O que mais chamou sua atenção?</li>
              <li>• Como você pode aplicar isso no seu dia a dia?</li>
              <li>• Quais são seus próximos passos?</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Reflexão
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
