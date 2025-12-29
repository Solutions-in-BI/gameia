/**
 * Assessment 360 Section
 * Shows pending assessments and results for the user
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useAssessment360, Assessment360, AssessmentCycle } from "@/hooks/useAssessment360";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const SAMPLE_QUESTIONS = [
  { id: "q1", category: "Comunicação", question: "Comunica ideias de forma clara e objetiva" },
  { id: "q2", category: "Comunicação", question: "Escuta ativamente e considera diferentes pontos de vista" },
  { id: "q3", category: "Liderança", question: "Inspira e motiva a equipe" },
  { id: "q4", category: "Liderança", question: "Toma decisões assertivas quando necessário" },
  { id: "q5", category: "Colaboração", question: "Trabalha bem em equipe e contribui para o grupo" },
  { id: "q6", category: "Colaboração", question: "Oferece ajuda proativamente aos colegas" },
  { id: "q7", category: "Entregas", question: "Cumpre prazos consistentemente" },
  { id: "q8", category: "Entregas", question: "Entrega trabalho de alta qualidade" },
];

interface Assessment360SectionProps {
  onBack?: () => void;
}

export function Assessment360Section({ onBack }: Assessment360SectionProps) {
  const { myAssessments, assessmentsLoading, cycles, submitAssessment } = useAssessment360();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment360 | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");

  const pendingAssessments = myAssessments.filter((a) => a.status === "pending");
  const completedAssessments = myAssessments.filter((a) => a.status === "completed");

  const handleStartAssessment = (assessment: Assessment360) => {
    setSelectedAssessment(assessment);
    setResponses({});
    setComments("");
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;
    await submitAssessment.mutateAsync({
      id: selectedAssessment.id,
      responses: { ratings: responses, comments },
    });
    setSelectedAssessment(null);
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      self: "Autoavaliação",
      manager: "Gestor",
      peer: "Par",
      direct_report: "Liderado",
      external: "Externo",
    };
    return labels[relationship] || relationship;
  };

  const getCycle = (cycleId: string) => cycles.find((c) => c.id === cycleId);

  const allQuestionsAnswered = SAMPLE_QUESTIONS.every((q) => responses[q.id] !== undefined);

  if (assessmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (selectedAssessment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedAssessment(null)}>
              ← Voltar
            </Button>
            <h2 className="text-2xl font-bold mt-2">Avaliação 360°</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{getRelationshipLabel(selectedAssessment.relationship)}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progresso</p>
            <p className="text-2xl font-bold">
              {Object.keys(responses).length}/{SAMPLE_QUESTIONS.length}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Avalie cada competência de 1 a 5, onde 1 significa "Precisa desenvolver" e 5 significa "Excelente".
              Seja honesto e construtivo em suas avaliações.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {SAMPLE_QUESTIONS.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={responses[q.id] !== undefined ? "border-primary/50" : ""}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{q.category}</Badge>
                      <span className="text-sm text-muted-foreground">Questão {index + 1}</span>
                    </div>
                    <p className="font-medium">{q.question}</p>
                    <RadioGroup
                      value={responses[q.id]?.toString()}
                      onValueChange={(v) => setResponses({ ...responses, [q.id]: parseInt(v) })}
                      className="flex gap-4"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-1">
                          <RadioGroupItem value={value.toString()} id={`${q.id}-${value}`} />
                          <Label htmlFor={`${q.id}-${value}`} className="text-xs">
                            {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precisa desenvolver</span>
                      <span>Excelente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentários Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Compartilhe feedbacks adicionais, sugestões de desenvolvimento ou reconhecimentos..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || submitAssessment.isPending}
            className="w-full"
            size="lg"
          >
            {submitAssessment.isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
            ← Voltar
          </Button>
        )}
        <h2 className="text-2xl font-bold">Feedback Contextual</h2>
        <p className="text-muted-foreground">Feedbacks vinculados a desafios e jogos</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluídas ({completedAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Meus Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingAssessments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">Tudo em dia!</h3>
                <p className="text-muted-foreground">Você não tem avaliações pendentes.</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssessments.map((assessment) => {
              const cycle = getCycle(assessment.cycle_id);
              const daysLeft = cycle ? differenceInDays(new Date(cycle.end_date), new Date()) : 0;

              return (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{cycle?.name || "Avaliação 360°"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{getRelationshipLabel(assessment.relationship)}</Badge>
                          {daysLeft <= 3 && daysLeft >= 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {daysLeft} dias restantes
                            </Badge>
                          )}
                        </div>
                        {cycle && (
                          <p className="text-sm text-muted-foreground">
                            Prazo: {format(new Date(cycle.end_date), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <Button onClick={() => handleStartAssessment(assessment)}>
                        Iniciar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedAssessments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação concluída ainda.</p>
              </CardContent>
            </Card>
          ) : (
            completedAssessments.map((assessment) => {
              const cycle = getCycle(assessment.cycle_id);
              return (
                <Card key={assessment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">{cycle?.name || "Avaliação 360°"}</span>
                        </div>
                        <Badge variant="secondary">{getRelationshipLabel(assessment.relationship)}</Badge>
                        <p className="text-sm text-muted-foreground">
                          Enviada em{" "}
                          {assessment.submitted_at &&
                            format(new Date(assessment.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Concluída
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resultados em Breve</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Quando o ciclo de avaliação for concluído, você poderá visualizar seus resultados consolidados aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
