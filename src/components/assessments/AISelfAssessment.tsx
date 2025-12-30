/**
 * AISelfAssessment - Autoavaliação Guiada por IA
 * Conversa reflexiva com máximo 5 perguntas
 * Score evolutivo individual (nunca comparativo)
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssessmentSummary {
  strengths: string[];
  developmentAreas: string[];
  evolutionScore: number;
  reflectionDepth: 'profunda' | 'moderada' | 'superficial';
  actionSuggestion: string;
  insights: string[];
}

interface AISelfAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId?: string;
  skillName?: string;
  skillDescription?: string;
  onComplete?: (summary: AssessmentSummary) => void;
}

export function AISelfAssessment({
  open,
  onOpenChange,
  skillId,
  skillName = "suas competências",
  skillDescription,
  onComplete,
}: AISelfAssessmentProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Start conversation when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      startConversation();
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && inputRef.current && !isComplete) {
      inputRef.current.focus();
    }
  }, [isLoading, isComplete]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-self-assessment', {
        body: {
          action: 'start',
          skillName,
          skillDescription,
        },
      });

      if (error) throw error;

      setMessages([{ role: 'assistant', content: data.message }]);
      setQuestionNumber(1);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erro ao iniciar avaliação. Tente novamente.');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-self-assessment', {
        body: {
          action: 'continue',
          messages: newMessages,
          skillName,
          skillDescription,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Limite de requisições. Aguarde alguns segundos.');
          return;
        }
        if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes.');
          return;
        }
        throw error;
      }

      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      setQuestionNumber(data.questionNumber);

      if (data.isComplete && data.summary) {
        setIsComplete(true);
        setSummary(data.summary);
        
        // Save the assessment result
        await saveAssessmentResult(data.summary);
        
        onComplete?.(data.summary);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAssessmentResult = async (summary: AssessmentSummary) => {
    if (!user?.id) return;

    try {
      // Save as contextual assessment response
      const { data: insertedResponse, error: insertError } = await supabase
        .from('contextual_assessment_responses')
        .insert({
          user_id: user.id,
          context_type: 'self_assessment',
          context_id: skillId || null,
          responses: JSON.parse(JSON.stringify({ messages, summary })),
          total_score: summary.evolutionScore,
          skills_impacted: skillId ? [skillId] : null,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting assessment:', insertError);
        return;
      }

      // Generate consequences
      await supabase.rpc('generate_assessment_consequences', {
        p_user_id: user.id,
        p_assessment_type: 'self',
        p_assessment_id: insertedResponse.id,
        p_responses: JSON.parse(JSON.stringify({ summary })),
        p_skill_ids: skillId ? [skillId] : null,
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInput("");
    setIsComplete(false);
    setSummary(null);
    setQuestionNumber(0);
    onOpenChange(false);
  };

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'profunda': return 'text-emerald-600 bg-emerald-500/10';
      case 'moderada': return 'text-amber-600 bg-amber-500/10';
      case 'superficial': return 'text-rose-600 bg-rose-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Autoavaliação: {skillName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Reflexão guiada por IA • ~5 min
                </p>
              </div>
            </div>
            {!isComplete && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {questionNumber}/5
              </Badge>
            )}
          </div>
          {!isComplete && questionNumber > 0 && (
            <Progress value={(questionNumber / 5) * 100} className="h-1 mt-3" />
          )}
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="py-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}

            {/* Summary Card */}
            {isComplete && summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 space-y-6">
                    {/* Score */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Score Evolutivo
                      </p>
                      <div className={cn(
                        "text-5xl font-bold",
                        getScoreColor(summary.evolutionScore)
                      )}>
                        {summary.evolutionScore}
                      </div>
                      <Badge className={cn("mt-2", getDepthColor(summary.reflectionDepth))}>
                        Reflexão {summary.reflectionDepth}
                      </Badge>
                    </div>

                    {/* Strengths */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">Pontos Fortes</span>
                      </div>
                      <ul className="space-y-1">
                        {summary.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-1 text-emerald-600 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Development Areas */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">Áreas de Desenvolvimento</span>
                      </div>
                      <ul className="space-y-1">
                        {summary.developmentAreas.map((area, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-amber-600 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Insights */}
                    {summary.insights?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Insights</span>
                        </div>
                        <ul className="space-y-1">
                          {summary.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Suggestion */}
                    <div className="bg-background/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Próximo Passo Sugerido</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {summary.actionSuggestion}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-6 py-4 border-t flex-shrink-0">
          {isComplete ? (
            <Button onClick={handleClose} className="w-full gap-2">
              Concluir
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua reflexão..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
