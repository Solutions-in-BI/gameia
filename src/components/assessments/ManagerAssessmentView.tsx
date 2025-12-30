/**
 * ManagerAssessmentView - Avaliação do Gestor com Dashboard de Dados
 * Mostra dados do colaborador ANTES de avaliar
 * Formulário simplificado com máximo 5 perguntas
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Target,
  Gamepad2,
  Flame,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  Loader2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useManagerAssessment, EmployeeContext, ManagerAssessmentResponse } from "@/hooks/useManagerAssessment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ManagerAssessmentViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluateeId: string;
  onComplete?: () => void;
}

// Manager assessment questions (max 5, direct and focused)
const ASSESSMENT_QUESTIONS = [
  {
    id: 'delivery',
    text: 'Como você avalia a qualidade das entregas desta pessoa?',
    category: 'Execução',
  },
  {
    id: 'growth',
    text: 'O quanto esta pessoa evoluiu nas últimas semanas?',
    category: 'Evolução',
  },
  {
    id: 'initiative',
    text: 'Como você avalia a proatividade e iniciativa?',
    category: 'Atitude',
  },
  {
    id: 'collaboration',
    text: 'Como está a colaboração com o time?',
    category: 'Relacionamento',
  },
  {
    id: 'potential',
    text: 'Qual o potencial de crescimento que você enxerga?',
    category: 'Potencial',
  },
];

export function ManagerAssessmentView({
  open,
  onOpenChange,
  evaluateeId,
  onComplete,
}: ManagerAssessmentViewProps) {
  const { employeeContext, contextLoading, submitAssessment } = useManagerAssessment(evaluateeId);
  const [step, setStep] = useState<'context' | 'assess'>('context');
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [directionNotes, setDirectionNotes] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [developmentAreas, setDevelopmentAreas] = useState<string[]>([]);

  const handleScoreSelect = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const assessmentResponses: ManagerAssessmentResponse[] = Object.entries(responses).map(
      ([questionId, value]) => ({
        questionId,
        value,
        comment: comments[questionId],
      })
    );

    await submitAssessment.mutateAsync({
      evaluateeId,
      responses: assessmentResponses,
      directionNotes,
      strengths,
      developmentAreas,
    });

    onComplete?.();
    onOpenChange(false);
  };

  const toggleStrength = (skill: string) => {
    setStrengths(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleDevelopmentArea = (skill: string) => {
    setDevelopmentAreas(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / ASSESSMENT_QUESTIONS.length) * 100;
  const canSubmit = answeredCount === ASSESSMENT_QUESTIONS.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === 'assess' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStep('context')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle className="text-base">
                {step === 'context' ? 'Contexto do Colaborador' : 'Avaliação'}
              </DialogTitle>
              {employeeContext && (
                <p className="text-xs text-muted-foreground">
                  {employeeContext.nickname}
                </p>
              )}
            </div>
            {step === 'assess' && (
              <Badge variant="secondary">
                {answeredCount}/{ASSESSMENT_QUESTIONS.length}
              </Badge>
            )}
          </div>
          {step === 'assess' && (
            <Progress value={progress} className="h-1 mt-3" />
          )}
        </DialogHeader>

        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {contextLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : step === 'context' && employeeContext ? (
              <ContextView
                context={employeeContext}
                onContinue={() => setStep('assess')}
              />
            ) : step === 'assess' ? (
              <AssessmentForm
                responses={responses}
                comments={comments}
                onScoreSelect={handleScoreSelect}
                onCommentChange={(id, text) => setComments(prev => ({ ...prev, [id]: text }))}
                directionNotes={directionNotes}
                onDirectionNotesChange={setDirectionNotes}
                strengths={strengths}
                developmentAreas={developmentAreas}
                onToggleStrength={toggleStrength}
                onToggleDevelopmentArea={toggleDevelopmentArea}
                employeeContext={employeeContext}
              />
            ) : null}
          </AnimatePresence>
        </ScrollArea>

        {step === 'assess' && (
          <div className="px-6 py-4 border-t flex-shrink-0">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitAssessment.isPending}
              className="w-full gap-2"
            >
              {submitAssessment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Avaliação
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Context View - Shows employee data before assessment
function ContextView({
  context,
  onContinue,
}: {
  context: EmployeeContext;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6"
    >
      {/* Employee Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={context.avatarUrl || undefined} />
          <AvatarFallback>{context.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{context.nickname}</h3>
          <p className="text-sm text-muted-foreground">
            {context.jobTitle || 'Colaborador'} {context.department && `• ${context.department}`}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold">{context.trainingsCompleted}</div>
            <p className="text-[10px] text-muted-foreground">Treinamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-bold">{context.challengesCompleted}</div>
            <p className="text-[10px] text-muted-foreground">Desafios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Gamepad2 className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold">{context.gamesPlayed}</div>
            <p className="text-[10px] text-muted-foreground">Simulações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Flame className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold">{context.currentStreak}</div>
            <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trainings */}
      {context.recentTrainings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Treinamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {context.recentTrainings.map((training, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{training.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {training.score}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(training.completedAt), "dd/MM")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Overview */}
      <div className="grid grid-cols-2 gap-4">
        {context.topSkills.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {context.topSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{skill.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Nv. {skill.level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {context.weakSkills.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                A Desenvolver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {context.weakSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{skill.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Nv. {skill.level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Previous Assessments */}
      {context.previousAssessments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avaliações Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {context.previousAssessments.map((assessment, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {format(new Date(assessment.date), "dd 'de' MMM", { locale: ptBR })}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    assessment.score >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                    assessment.score >= 60 ? "bg-amber-500/10 text-amber-600" :
                    "bg-rose-500/10 text-rose-600"
                  )}
                >
                  {Math.round(assessment.score)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full gap-2">
        Iniciar Avaliação
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

// Assessment Form
function AssessmentForm({
  responses,
  comments,
  onScoreSelect,
  onCommentChange,
  directionNotes,
  onDirectionNotesChange,
  strengths,
  developmentAreas,
  onToggleStrength,
  onToggleDevelopmentArea,
  employeeContext,
}: {
  responses: Record<string, number>;
  comments: Record<string, string>;
  onScoreSelect: (questionId: string, value: number) => void;
  onCommentChange: (questionId: string, text: string) => void;
  directionNotes: string;
  onDirectionNotesChange: (text: string) => void;
  strengths: string[];
  developmentAreas: string[];
  onToggleStrength: (skill: string) => void;
  onToggleDevelopmentArea: (skill: string) => void;
  employeeContext: EmployeeContext | null;
}) {
  const [showComment, setShowComment] = useState<string | null>(null);

  const allSkills = [
    ...(employeeContext?.topSkills || []),
    ...(employeeContext?.weakSkills || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 space-y-6"
    >
      {/* Questions */}
      {ASSESSMENT_QUESTIONS.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] flex-shrink-0">
                {question.category}
              </Badge>
              <p className="text-sm font-medium">{question.text}</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onScoreSelect(question.id, value)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all border-2",
                    responses[question.id] === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/50"
                  )}
                >
                  {value}
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground px-2">
              <span>Precisa melhorar</span>
              <span>Excelente</span>
            </div>

            {showComment === question.id ? (
              <Textarea
                value={comments[question.id] || ''}
                onChange={(e) => onCommentChange(question.id, e.target.value)}
                placeholder="Comentário opcional..."
                className="h-16 resize-none text-sm"
              />
            ) : (
              <button
                onClick={() => setShowComment(question.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + Adicionar comentário
              </button>
            )}
          </CardContent>
        </Card>
      ))}

      <Separator />

      {/* Strengths Selection */}
      {allSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">Pontos Fortes (selecione)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Badge
                key={`strength-${skill.id}`}
                variant={strengths.includes(skill.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onToggleStrength(skill.name)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Development Areas Selection */}
      {allSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Áreas a Desenvolver (selecione)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Badge
                key={`dev-${skill.id}`}
                variant={developmentAreas.includes(skill.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onToggleDevelopmentArea(skill.name)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Direction Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Direcionamento (opcional)</span>
        </div>
        <Textarea
          value={directionNotes}
          onChange={(e) => onDirectionNotesChange(e.target.value)}
          placeholder="Sugestões de próximos passos, feedbacks específicos..."
          className="h-24 resize-none"
        />
      </div>
    </motion.div>
  );
}
