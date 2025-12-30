/**
 * QuickContextualAssessment - Avaliação Contextual Rápida
 * Modal/Drawer com 2-5 perguntas rápidas após experiências
 * Tempo máximo: 2 minutos
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Star, 
  Clock, 
  Sparkles,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { 
  useQuickAssessment, 
  ContextType, 
  QuestionResponse 
} from "@/hooks/useQuickAssessment";
import { cn } from "@/lib/utils";

interface QuickContextualAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextType: ContextType;
  contextId?: string;
  contextEventId?: string;
  contextTitle?: string;
  skillIds?: string[];
  onComplete?: (responses: QuestionResponse[], totalScore: number) => void;
}

export function QuickContextualAssessment({
  open,
  onOpenChange,
  contextType,
  contextId,
  contextEventId,
  contextTitle,
  skillIds,
  onComplete,
}: QuickContextualAssessmentProps) {
  const { questions, questionsLoading, submitAssessment } = useQuickAssessment(contextType);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setResponses([]);
      setShowComment(false);
      setComment("");
      setIsComplete(false);
      startTimeRef.current = Date.now();
    }
  }, [open]);

  const currentQuestion = questions?.[currentIndex];
  const totalQuestions = questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleScaleSelect = (value: number) => {
    if (!currentQuestion) return;

    const newResponse: QuestionResponse = {
      question_id: currentQuestion.id,
      value,
      skill_id: currentQuestion.skill_id,
      comment: comment || undefined,
    };

    setResponses(prev => {
      const existing = prev.findIndex(r => r.question_id === currentQuestion.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResponse;
        return updated;
      }
      return [...prev, newResponse];
    });

    // Auto-advance after selection (with small delay for visual feedback)
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowComment(false);
        setComment("");
      } else {
        handleComplete([...responses.filter(r => r.question_id !== currentQuestion.id), newResponse]);
      }
    }, 300);
  };

  const handleComplete = async (finalResponses: QuestionResponse[]) => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    // Calculate average score
    const scaleResponses = finalResponses.filter(r => typeof r.value === 'number');
    const totalScore = scaleResponses.length > 0
      ? (scaleResponses.reduce((acc, r) => acc + (r.value as number), 0) / scaleResponses.length) * 20
      : 0;

    try {
      await submitAssessment.mutateAsync({
        contextType,
        contextId,
        contextEventId,
        responses: finalResponses,
        timeSpentSeconds: timeSpent,
        skillIds,
      });

      setIsComplete(true);
      onComplete?.(finalResponses, totalScore);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const getContextLabel = (type: ContextType) => {
    const labels: Record<ContextType, string> = {
      training: 'Treinamento',
      game: 'Simulação',
      challenge: 'Desafio',
      simulation: 'Simulação',
      application: 'Aplicação Prática',
    };
    return labels[type] || type;
  };

  const getCurrentResponse = () => {
    if (!currentQuestion) return null;
    return responses.find(r => r.question_id === currentQuestion.id);
  };

  if (questionsLoading || !questions || questions.length === 0) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {getContextLabel(contextType)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              ~2 min
            </Badge>
          </div>
          <DrawerTitle className="text-lg">
            {isComplete ? "Avaliação Concluída!" : "Como foi sua experiência?"}
          </DrawerTitle>
          {contextTitle && !isComplete && (
            <DrawerDescription className="text-sm text-muted-foreground">
              {contextTitle}
            </DrawerDescription>
          )}
        </DrawerHeader>

        <div className="px-4 pb-4">
          {!isComplete && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Pergunta {currentIndex + 1} de {totalQuestions}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="text-lg font-medium mb-2">Obrigado pelo feedback!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Suas respostas ajudam a personalizar sua jornada de evolução.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>Ações sugeridas foram geradas no seu PDI</span>
                </div>
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-center font-medium text-foreground">
                  {currentQuestion.question_text}
                </p>

                {currentQuestion.question_type === 'scale' && (
                  <div className="space-y-3">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: currentQuestion.scale_max - currentQuestion.scale_min + 1 }).map((_, i) => {
                        const value = currentQuestion.scale_min + i;
                        const isSelected = getCurrentResponse()?.value === value;
                        const labels = currentQuestion.scale_labels as Record<string, string> | null;
                        
                        return (
                          <motion.button
                            key={value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleScaleSelect(value)}
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all",
                              "border-2",
                              isSelected 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/50 hover:bg-muted"
                            )}
                          >
                            {value}
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {currentQuestion.scale_labels && (
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>{(currentQuestion.scale_labels as Record<string, string>)["1"]}</span>
                        <span>{(currentQuestion.scale_labels as Record<string, string>)["5"]}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional comment toggle */}
                {!showComment ? (
                  <button
                    onClick={() => setShowComment(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Adicionar comentário (opcional)
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Compartilhe mais detalhes..."
                      className="h-20 resize-none text-sm"
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <DrawerFooter className="pt-0">
          {isComplete ? (
            <Button onClick={() => onOpenChange(false)} className="w-full gap-2">
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Pular
              </Button>
              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                >
                  Voltar
                </Button>
              )}
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
