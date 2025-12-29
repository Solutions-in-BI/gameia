/**
 * CognitiveTestStep - Launches cognitive tests within training
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Play,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

interface CognitiveTestStepProps {
  module: EnhancedTrainingModule;
  onComplete: (result: StepResult) => void;
  onCancel: () => void;
}

interface CognitiveTest {
  id: string;
  name: string;
  description: string | null;
  test_type: string;
  time_limit_minutes: number | null;
  questions_count: number | null;
  difficulty: string | null;
}

export function CognitiveTestStep({ module, onComplete, onCancel }: CognitiveTestStepProps) {
  const [test, setTest] = useState<CognitiveTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testResult, setTestResult] = useState<StepResult | null>(null);
  const [startTime] = useState(Date.now());

  const testId = module.step_config?.test_id;
  const minScore = module.min_score || 0;

  useEffect(() => {
    async function fetchTest() {
      if (!testId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cognitive_tests")
          .select("*")
          .eq("id", testId)
          .single();

        if (!error && data) {
          setTest(data as CognitiveTest);
        }
      } catch (err) {
        console.error("Error fetching test:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTest();
  }, [testId]);

  const handleTestComplete = (score: number, metadata?: Record<string, unknown>) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const passed = score >= minScore;

    const result: StepResult = {
      completed: true,
      score,
      passed,
      timeSpent,
      metadata: {
        ...metadata,
        test_id: testId,
        test_type: test?.test_type,
      },
    };

    setTestResult(result);
    setIsPlaying(false);
  };

  const handleConfirmResult = () => {
    if (testResult) {
      onComplete(testResult);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando teste...</p>
        </CardContent>
      </Card>
    );
  }

  if (!test && !testId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Teste não configurado</h3>
          <p className="text-muted-foreground mb-6">
            Este módulo não possui um teste cognitivo configurado.
          </p>
          <Button variant="outline" onClick={onCancel}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show result
  if (testResult) {
    const passed = testResult.passed;

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              passed ? 'bg-primary/10' : 'bg-destructive/10'
            }`}
          >
            {passed ? (
              <CheckCircle className="w-10 h-10 text-primary" />
            ) : (
              <AlertCircle className="w-10 h-10 text-destructive" />
            )}
          </motion.div>

          <h3 className="text-2xl font-bold text-foreground mb-2">
            {passed ? 'Excelente!' : 'Continue praticando!'}
          </h3>

          <p className="text-muted-foreground mb-6">
            {passed
              ? 'Você completou o teste cognitivo com sucesso!'
              : `Score mínimo necessário: ${minScore}%`}
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {testResult.score}%
              </div>
              <div className="text-sm text-muted-foreground">Seu Score</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {!passed && (
              <Button variant="outline" onClick={() => {
                setTestResult(null);
                setIsPlaying(true);
              }}>
                Tentar Novamente
              </Button>
            )}
            <Button onClick={handleConfirmResult}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Playing the test
  if (isPlaying && test) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="sm" onClick={() => setIsPlaying(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
        {/* Placeholder - CognitiveTestPlayer integration will be done separately */}
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Teste em Andamento</h3>
            <p className="text-muted-foreground mb-6">
              O teste cognitivo será iniciado aqui.
            </p>
            <Button onClick={() => handleTestComplete(85)}>
              Simular Conclusão (85%)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary" />
        </div>

        <Badge className="mb-4">Teste Cognitivo</Badge>

        <h3 className="text-2xl font-bold text-foreground mb-2">
          {test?.name || module.name}
        </h3>

        {(test?.description || module.description) && (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {test?.description || module.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-6 mb-6 text-sm">
          {test?.time_limit_minutes && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{test.time_limit_minutes} min</span>
            </div>
          )}
          {test?.questions_count && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>{test.questions_count} questões</span>
            </div>
          )}
        </div>

        {module.is_checkpoint && minScore > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Checkpoint</span>
            </div>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              Score mínimo para aprovação: {minScore}%
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Voltar
          </Button>
          <Button onClick={() => setIsPlaying(true)} size="lg">
            <Play className="w-5 h-5 mr-2" />
            Iniciar Teste
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
