/**
 * PracticalChallengeStep - Practical challenge/task within training
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  ArrowLeft,
  Send,
  CheckCircle,
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

interface PracticalChallengeStepProps {
  module: EnhancedTrainingModule;
  onComplete: (result: StepResult) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PracticalChallengeStep({ 
  module, 
  onComplete, 
  onCancel, 
  isSubmitting 
}: PracticalChallengeStepProps) {
  const [submissionType, setSubmissionType] = useState<'text' | 'link'>('text');
  const [textSubmission, setTextSubmission] = useState("");
  const [linkSubmission, setLinkSubmission] = useState("");
  const [startTime] = useState(Date.now());

  const challengeDescription = module.step_config?.challenge_description || 
    module.description || "Complete o desafio prático abaixo.";
  
  const configuredType = module.step_config?.submission_type || 'text';

  const isValid = submissionType === 'text' 
    ? textSubmission.trim().length >= 20
    : linkSubmission.trim().length > 0 && isValidUrl(linkSubmission);

  const handleSubmit = () => {
    if (!isValid) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    onComplete({
      completed: true,
      score: 100, // Practical challenges are pass/fail
      passed: true,
      timeSpent,
      metadata: {
        submission_type: submissionType,
        submission: submissionType === 'text' ? textSubmission.trim() : linkSubmission.trim(),
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <Badge variant="outline" className="text-xs">Desafio Prático</Badge>
              {module.is_checkpoint && (
                <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Checkpoint
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-foreground">{module.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Challenge Description */}
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Seu Desafio</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {challengeDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Type Tabs */}
          {configuredType === 'text' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sua Resposta
              </label>
              <Textarea
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                placeholder="Descreva como você completou o desafio..."
                className="min-h-[200px] resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 20 caracteres ({textSubmission.trim().length} / 20)
              </p>
            </div>
          ) : configuredType === 'link' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Link da Evidência
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={linkSubmission}
                  onChange={(e) => setLinkSubmission(e.target.value)}
                  placeholder="https://..."
                  className="pl-9"
                  disabled={isSubmitting}
                />
              </div>
              {linkSubmission && !isValidUrl(linkSubmission) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  URL inválida
                </p>
              )}
            </div>
          ) : (
            <Tabs value={submissionType} onValueChange={(v) => setSubmissionType(v as 'text' | 'link')}>
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="link" className="flex-1">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-4">
                <Textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Descreva como você completou o desafio..."
                  className="min-h-[150px] resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Mínimo de 20 caracteres
                </p>
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="url"
                    value={linkSubmission}
                    onChange={(e) => setLinkSubmission(e.target.value)}
                    placeholder="https://..."
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-foreground mb-2">
              Dicas para completar o desafio:
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seja específico sobre o que você fez</li>
              <li>• Mencione os resultados alcançados</li>
              <li>• Inclua evidências quando possível</li>
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
                Enviar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
