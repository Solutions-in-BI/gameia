import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Loader2, Sparkles, CheckCircle2, MessageCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StepResult } from '@/types/training';
import { toast } from 'sonner';

interface AIReflectionConfig {
  chapter_title?: string;
  chapter_content?: string;
  learning_objective?: string;
  context_why_matters?: string;
  reflection_prompts?: string[];
  min_response_characters?: number;
  require_practical_example?: boolean;
  comprehension_threshold?: number;
  max_ai_questions?: number;
  skill_name?: string;
  pdi_goal_context?: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AIReflectionStepProps {
  module: {
    id: string;
    name: string;
    description?: string | null;
    step_config?: AIReflectionConfig;
    xp_reward?: number;
  };
  onComplete: (result: StepResult) => void;
}

export const AIReflectionStep: React.FC<AIReflectionStepProps> = ({
  module,
  onComplete,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [comprehensionScore, setComprehensionScore] = useState<number | null>(null);
  const [responseDepth, setResponseDepth] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const config = module.step_config || {};
  const minCharacters = config.min_response_characters || 50;
  const threshold = config.comprehension_threshold || 60;

  // Start conversation on mount
  useEffect(() => {
    if (messages.length === 0) {
      initiateConversation();
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initiateConversation = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('ai-guided-reflection', {
        body: {
          moduleId: module.id,
          chapterTitle: config.chapter_title || module.name,
          chapterContent: config.chapter_content || module.description || '',
          learningObjective: config.learning_objective || '',
          contextWhyMatters: config.context_why_matters || '',
          userResponse: '',
          conversationHistory: [],
          pdiGoalContext: config.pdi_goal_context,
          skillName: config.skill_name,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setMessages([{ role: 'assistant', content: data.aiMessage }]);
    } catch (error) {
      console.error('Error initiating conversation:', error);
      // Fallback to default prompt
      const defaultPrompt = config.reflection_prompts?.[0] || 
        `Olá! Vamos refletir sobre "${config.chapter_title || module.name}". O que você entendeu como a principal lição deste conteúdo?`;
      setMessages([{ role: 'assistant', content: defaultPrompt }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || inputValue.length < minCharacters) {
      toast.error(`Sua resposta precisa ter pelo menos ${minCharacters} caracteres`);
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-guided-reflection', {
        body: {
          moduleId: module.id,
          chapterTitle: config.chapter_title || module.name,
          chapterContent: config.chapter_content || module.description || '',
          learningObjective: config.learning_objective || '',
          contextWhyMatters: config.context_why_matters || '',
          userResponse: userMessage,
          conversationHistory: messages,
          pdiGoalContext: config.pdi_goal_context,
          skillName: config.skill_name,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setMessages(prev => [...prev, { role: 'assistant', content: data.aiMessage }]);

      if (data.isComplete) {
        setIsComplete(true);
        setComprehensionScore(data.comprehensionScore);
        setResponseDepth(data.responseDepth);
        setInsights(data.insights || []);

        // Save comprehension score to database
        if (user) {
          await supabase.from('module_comprehension_scores').upsert({
            user_id: user.id,
            module_id: module.id,
            score: data.comprehensionScore,
            ai_feedback: data.feedback,
            response_depth: data.responseDepth,
            insights_extracted: data.insights || [],
            conversation_history: [...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: data.aiMessage }],
          });
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || error?.error || 'Erro desconhecido';
      
      if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        toast.error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
      } else if (errorMessage.includes('402') || errorMessage.includes('Payment')) {
        toast.error('Créditos insuficientes. Entre em contato com o administrador.');
      } else {
        toast.error('Erro ao processar sua resposta. Tente novamente.');
      }
      
      // Add error message to chat so user knows what happened
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua resposta. Por favor, tente enviar novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const passed = (comprehensionScore || 0) >= threshold;

    onComplete({
      completed: true,
      score: comprehensionScore || 0,
      passed,
      timeSpent,
      metadata: {
        responseDepth,
        insights,
        messageCount: messages.length,
      },
    });
  };

  const getDepthColor = (depth: string | null) => {
    switch (depth) {
      case 'deep': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'superficial': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getDepthLabel = (depth: string | null) => {
    switch (depth) {
      case 'deep': return 'Profunda';
      case 'moderate': return 'Moderada';
      case 'superficial': return 'Superficial';
      default: return 'Avaliando...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1 bg-purple-100 text-purple-700">
                  Reflexão com IA
                </Badge>
                <CardTitle className="text-xl">
                  {config.chapter_title || module.name}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {messages.filter(m => m.role === 'user').length} respostas
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat area */}
      <Card className="overflow-hidden">
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-medium">Facilitador IA</span>
                      </div>
                    )}
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
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Analisando...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        {!isComplete && (
          <div className="border-t p-4 bg-muted/30">
            <div className="flex gap-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva sua reflexão aqui..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || inputValue.length < minCharacters}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>
                {inputValue.length}/{minCharacters} caracteres mínimos
              </span>
              <span>Ctrl+Enter para enviar</span>
            </div>
          </div>
        )}
      </Card>

      {/* Completion state */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Score card */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Reflexão Concluída!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sua compreensão foi avaliada pela IA
                  </p>
                </div>

                {/* Score display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {comprehensionScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compreensão</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <Badge className={getDepthColor(responseDepth)}>
                        {getDepthLabel(responseDepth)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Profundidade</p>
                    </div>
                  </div>

                  <Progress value={comprehensionScore || 0} className="h-2" />
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <div className="text-left bg-white dark:bg-card rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Seus insights salvos:</span>
                    </div>
                    <ul className="space-y-1">
                      {insights.map((insight, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Complete button */}
          <Button
            size="lg"
            onClick={handleComplete}
            className="w-full gap-2"
            disabled={(comprehensionScore || 0) < threshold}
          >
            <CheckCircle2 className="w-4 h-4" />
            {(comprehensionScore || 0) >= threshold 
              ? 'Continuar para próximo passo'
              : `Score mínimo: ${threshold}%`
            }
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
