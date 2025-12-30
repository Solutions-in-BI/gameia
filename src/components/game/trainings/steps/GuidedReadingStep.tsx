import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, Lightbulb, ChevronRight, Zap, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepResult } from '@/types/training';

interface GuidedReadingConfig {
  chapter_title?: string;
  excerpt_text?: string;
  summary?: string;
  learning_objective?: string;
  context_why_matters?: string;
  skill_impacted_id?: string;
  skill_name?: string;
  pdi_goal_id?: string;
  pdi_goal_name?: string;
  estimated_reading_minutes?: number;
}

interface GuidedReadingStepProps {
  module: {
    id: string;
    name: string;
    description?: string | null;
    step_config?: GuidedReadingConfig;
    xp_reward?: number;
    time_minutes?: number;
  };
  onComplete: (result: StepResult) => void;
}

export const GuidedReadingStep: React.FC<GuidedReadingStepProps> = ({
  module,
  onComplete,
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [isReady, setIsReady] = useState(false);

  const config = module.step_config || {};
  const estimatedMinutes = config.estimated_reading_minutes || module.time_minutes || 5;

  // Simulate reading progress based on time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const progress = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100);
      setReadingProgress(progress);
      
      // Allow completion after at least 30% of estimated time
      if (progress >= 30 && !isReady) {
        setIsReady(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, estimatedMinutes, isReady]);

  const handleComplete = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onComplete({
      completed: true,
      timeSpent,
      metadata: {
        readingProgress,
        chapterTitle: config.chapter_title,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with book info */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  Leitura Guiada
                </Badge>
                <CardTitle className="text-xl">
                  {config.chapter_title || module.name}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{estimatedMinutes} min</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Reading progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso de leitura</span>
              <span className="font-medium">{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Learning objective */}
      {config.learning_objective && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Objetivo de Aprendizado
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {config.learning_objective}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {config.excerpt_text ? (
                <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {config.excerpt_text}
                </div>
              ) : config.summary ? (
                <div>
                  <Badge variant="outline" className="mb-3">
                    Resumo Guiado
                  </Badge>
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {config.summary}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {module.description || 'Conteúdo do capítulo não disponível.'}
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Why this matters */}
      {config.context_why_matters && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Por que isso importa?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {config.context_why_matters}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill and PDI connection */}
      {(config.skill_name || config.pdi_goal_name) && (
        <div className="flex flex-wrap gap-3">
          {config.skill_name && (
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Zap className="w-3.5 h-3.5" />
              Skill: {config.skill_name}
            </Badge>
          )}
          {config.pdi_goal_name && (
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Brain className="w-3.5 h-3.5" />
              PDI: {config.pdi_goal_name}
            </Badge>
          )}
        </div>
      )}

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0.5 }}
        className="flex justify-end"
      >
        <Button
          size="lg"
          onClick={handleComplete}
          disabled={!isReady}
          className="gap-2"
        >
          {isReady ? (
            <>
              Li e estou pronto para refletir
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 animate-pulse" />
              Continue lendo...
            </>
          )}
        </Button>
      </motion.div>

      {/* XP reward preview */}
      {module.xp_reward && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            +{module.xp_reward} XP ao completar o módulo
          </span>
        </div>
      )}
    </motion.div>
  );
};
