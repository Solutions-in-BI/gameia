import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, CheckCircle2, XCircle, Trophy, 
  RotateCcw, Target, Zap, Brain, Gamepad2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { StepResult } from '@/types/training';

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

interface ValidationConfig {
  validation_type?: 'quiz' | 'simulation' | 'scenario' | 'game' | 'self_assessment' | 'manager_feedback';
  min_passing_score?: number;
  allow_retry?: boolean;
  max_attempts?: number;
  quiz_questions?: QuizQuestion[];
  scenario_title?: string;
  scenario_context?: string;
  scenario_options?: ScenarioOption[];
  self_assessment_criteria?: string[];
  game_type?: string;
}

interface ValidationStepProps {
  module: {
    id: string;
    name: string;
    description?: string | null;
    step_config?: ValidationConfig;
    xp_reward?: number;
  };
  onComplete: (result: StepResult) => void;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({
  module,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number | null>(null);
  const [selfAssessmentScores, setSelfAssessmentScores] = useState<Record<number, number>>({});
  const [selfAssessmentNotes, setSelfAssessmentNotes] = useState('');
  const [attempts, setAttempts] = useState(0);

  const config = module.step_config || {};
  const validationType = config.validation_type || 'quiz';
  const passingScore = config.min_passing_score || 70;
  const allowRetry = config.allow_retry !== false;
  const maxAttempts = config.max_attempts || 3;

  // Quiz logic
  const questions = config.quiz_questions || [];
  const totalQuestions = questions.length;

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_index) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
    setAttempts(prev => prev + 1);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedScenarioOption(null);
    setSelfAssessmentScores({});
  };

  const handleComplete = (score: number) => {
    const passed = score >= passingScore;
    onComplete({
      completed: true,
      score,
      passed,
      metadata: {
        validationType,
        attempts: attempts + 1,
        answers: validationType === 'quiz' ? answers : undefined,
      },
    });
  };

  // Scenario logic
  const handleScenarioSelect = (optionIndex: number) => {
    setSelectedScenarioOption(optionIndex);
    setShowResults(true);
    setAttempts(prev => prev + 1);
  };

  const getScenarioScore = () => {
    if (selectedScenarioOption === null) return 0;
    return config.scenario_options?.[selectedScenarioOption]?.score || 0;
  };

  // Self-assessment logic
  const calculateSelfAssessmentScore = () => {
    const criteria = config.self_assessment_criteria || [];
    if (criteria.length === 0) return 100;
    const total = Object.values(selfAssessmentScores).reduce((a, b) => a + b, 0);
    return Math.round((total / (criteria.length * 100)) * 100);
  };

  const handleSelfAssessmentSubmit = () => {
    setShowResults(true);
    setAttempts(prev => prev + 1);
  };

  // Render different validation types
  const renderQuiz = () => {
    if (showResults) {
      const score = calculateQuizScore();
      const passed = score >= passingScore;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className={`${passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <CardContent className="pt-6 text-center">
              {passed ? (
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-2xl font-bold mb-2">{score}%</h3>
              <p className="text-muted-foreground mb-4">
                {passed 
                  ? 'Parabéns! Você demonstrou compreensão do conteúdo.'
                  : `Você precisa de ${passingScore}% para passar.`
                }
              </p>
              <Progress value={score} className="h-3 mb-4" />
              
              {/* Show answers */}
              <div className="text-left space-y-3 mt-6">
                {questions.map((q, index) => {
                  const isCorrect = answers[index] === q.correct_index;
                  return (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{q.question}</p>
                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Resposta correta: {q.options[q.correct_index]}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {!passed && allowRetry && attempts < maxAttempts && (
              <Button variant="outline" onClick={handleRetry} className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Tentar Novamente ({maxAttempts - attempts} restantes)
              </Button>
            )}
            {passed && (
              <Button onClick={() => handleComplete(score)} className="flex-1 gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Continuar
              </Button>
            )}
          </div>
        </motion.div>
      );
    }

    const question = questions[currentQuestion];
    if (!question) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhuma questão configurada.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            Questão {currentQuestion + 1} de {totalQuestions}
          </Badge>
          <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="w-32 h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-6">{question.question}</h3>
            
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleQuizAnswer(currentQuestion, parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          
          {currentQuestion < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={answers[currentQuestion] === undefined}
            >
              Próxima
            </Button>
          ) : (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(answers).length < totalQuestions}
            >
              Finalizar Quiz
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderScenario = () => {
    if (showResults && selectedScenarioOption !== null) {
      const selectedOption = config.scenario_options?.[selectedScenarioOption];
      const score = selectedOption?.score || 0;
      const passed = score >= passingScore;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className={`${passed ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
            <CardContent className="pt-6 text-center">
              {selectedOption?.is_optimal ? (
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              ) : (
                <Target className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-bold mb-2">
                {selectedOption?.is_optimal ? 'Decisão Ótima!' : 'Decisão Válida'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedOption?.feedback}
              </p>
              <Badge variant={passed ? 'default' : 'secondary'}>
                Score: {score}%
              </Badge>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {!passed && allowRetry && attempts < maxAttempts && (
              <Button variant="outline" onClick={handleRetry} className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Tentar Novamente
              </Button>
            )}
            <Button onClick={() => handleComplete(score)} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Continuar
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{config.scenario_title || 'Cenário de Decisão'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{config.scenario_context}</p>

          <div className="space-y-3">
            <Label className="text-base font-medium">O que você faria?</Label>
            {config.scenario_options?.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 px-4"
                onClick={() => handleScenarioSelect(index)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSelfAssessment = () => {
    const criteria = config.self_assessment_criteria || [];

    if (showResults) {
      const score = calculateSelfAssessmentScore();
      const passed = score >= passingScore;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center">
              <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Autoavaliação Registrada</h3>
              <p className="text-muted-foreground mb-4">
                Sua autoavaliação indica {score}% de confiança na aplicação.
              </p>
              <Progress value={score} className="h-3" />
            </CardContent>
          </Card>

          <Button onClick={() => handleComplete(score)} className="w-full gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Continuar
          </Button>
        </motion.div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Autoavaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Avalie seu nível de confiança em cada critério:
          </p>

          {criteria.map((criterion, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Label>{criterion}</Label>
                <span className="text-sm text-muted-foreground">
                  {selfAssessmentScores[index] || 0}%
                </span>
              </div>
              <Slider
                value={[selfAssessmentScores[index] || 50]}
                onValueChange={([value]) => 
                  setSelfAssessmentScores(prev => ({ ...prev, [index]: value }))
                }
                max={100}
                step={10}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={selfAssessmentNotes}
              onChange={(e) => setSelfAssessmentNotes(e.target.value)}
              placeholder="Reflexões sobre sua aplicação..."
            />
          </div>

          <Button 
            onClick={handleSelfAssessmentSubmit} 
            className="w-full"
            disabled={Object.keys(selfAssessmentScores).length < criteria.length}
          >
            Enviar Autoavaliação
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderGame = () => {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Jogo Cognitivo</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Complete o jogo para validar seu aprendizado.
          </p>
          <Badge variant="outline">Tipo: {config.game_type || 'memory'}</Badge>
          <p className="text-xs text-muted-foreground mt-4">
            (Integração com Arena em desenvolvimento)
          </p>
          <Button 
            className="mt-6" 
            onClick={() => handleComplete(100)}
          >
            Simular Conclusão
          </Button>
        </CardContent>
      </Card>
    );
  };

  const getValidationIcon = () => {
    switch (validationType) {
      case 'quiz': return ClipboardCheck;
      case 'scenario': return Target;
      case 'simulation': return Brain;
      case 'game': return Gamepad2;
      case 'self_assessment': return CheckCircle2;
      default: return ClipboardCheck;
    }
  };

  const getValidationLabel = () => {
    switch (validationType) {
      case 'quiz': return 'Quiz Conceitual';
      case 'scenario': return 'Cenário de Decisão';
      case 'simulation': return 'Simulação';
      case 'game': return 'Jogo Cognitivo';
      case 'self_assessment': return 'Autoavaliação';
      case 'manager_feedback': return 'Feedback do Gestor';
      default: return 'Validação';
    }
  };

  const Icon = getValidationIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Icon className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1 bg-emerald-100 text-emerald-700">
                  {getValidationLabel()}
                </Badge>
                <CardTitle className="text-xl">{module.name}</CardTitle>
              </div>
            </div>
            <Badge variant="outline">
              Mínimo: {passingScore}%
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Validation content based on type */}
      <AnimatePresence mode="wait">
        {validationType === 'quiz' && renderQuiz()}
        {validationType === 'scenario' && renderScenario()}
        {validationType === 'self_assessment' && renderSelfAssessment()}
        {validationType === 'game' && renderGame()}
        {validationType === 'simulation' && renderScenario()}
      </AnimatePresence>

      {/* XP reward */}
      {module.xp_reward && !showResults && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            +{module.xp_reward} XP ao passar na validação
          </span>
        </div>
      )}
    </motion.div>
  );
};
