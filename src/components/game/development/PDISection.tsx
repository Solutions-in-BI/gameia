/**
 * PDI Section - Individual Development Plan
 * Shows user's development plans with goals and progress tracking
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { usePDI, DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Target,
  Plus,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Flag,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PDISection() {
  const { user } = useAuth();
  const { myPlans, myPlansLoading, createPlan, getGoalsForPlan, createGoal, addCheckIn } = usePDI();
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null);
  const [planGoals, setPlanGoals] = useState<DevelopmentGoal[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newGoal, setNewGoal] = useState({ title: "", description: "", priority: "medium" });
  const [checkInData, setCheckInData] = useState({ progress: 0, update: "", blockers: "" });

  const handleViewPlan = async (plan: DevelopmentPlan) => {
    setSelectedPlan(plan);
    const goals = await getGoalsForPlan(plan.id);
    setPlanGoals(goals);
  };

  const handleCreatePlan = async () => {
    if (!newPlanTitle.trim()) return;
    await createPlan.mutateAsync({ title: newPlanTitle });
    setNewPlanTitle("");
    setIsCreatingPlan(false);
  };

  const handleCreateGoal = async () => {
    if (!selectedPlan || !newGoal.title.trim()) return;
    await createGoal.mutateAsync({
      plan_id: selectedPlan.id,
      title: newGoal.title,
      description: newGoal.description,
      priority: newGoal.priority,
    });
    const goals = await getGoalsForPlan(selectedPlan.id);
    setPlanGoals(goals);
    setNewGoal({ title: "", description: "", priority: "medium" });
    setIsCreatingGoal(false);
  };

  const handleCheckIn = async (goalId: string) => {
    await addCheckIn.mutateAsync({
      goal_id: goalId,
      progress_update: checkInData.update,
      blockers: checkInData.blockers,
      new_progress: checkInData.progress,
    });
    if (selectedPlan) {
      const goals = await getGoalsForPlan(selectedPlan.id);
      setPlanGoals(goals);
    }
    setCheckInData({ progress: 0, update: "", blockers: "" });
    setIsCheckingIn(null);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      active: { label: "Ativo", variant: "default" },
      completed: { label: "Concluído", variant: "secondary" },
      draft: { label: "Rascunho", variant: "outline" },
    };
    const s = statusMap[status] || statusMap.draft;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "text-red-500",
      medium: "text-yellow-500",
      low: "text-green-500",
    };
    return colors[priority] || colors.medium;
  };

  if (myPlansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedPlan(null)} className="mb-2">
              ← Voltar
            </Button>
            <h2 className="text-2xl font-bold">{selectedPlan.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              {getStatusBadge(selectedPlan.status)}
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-primary" />
                {selectedPlan.xp_on_completion} XP ao concluir
              </span>
            </div>
          </div>
          <Dialog open={isCreatingGoal} onOpenChange={setIsCreatingGoal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ex: Desenvolver habilidades de liderança"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Descreva os detalhes da meta..."
                  />
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Criar Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={selectedPlan.overall_progress} className="flex-1" />
              <span className="text-2xl font-bold">{selectedPlan.overall_progress}%</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Metas de Desenvolvimento</h3>
          {planGoals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma meta criada ainda.
                  <br />
                  Clique em "Nova Meta" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            planGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-4 w-4 ${getPriorityColor(goal.priority)}`} />
                          <h4 className="font-semibold">{goal.title}</h4>
                          <Badge variant={goal.status === "completed" ? "default" : "outline"}>
                            {goal.status === "completed" ? "Concluído" : "Em Progresso"}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <Progress value={goal.progress} className="flex-1 max-w-xs" />
                          <span className="text-sm font-medium">{goal.progress}%</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {goal.xp_reward} XP
                          </span>
                        </div>
                      </div>
                      <Dialog
                        open={isCheckingIn === goal.id}
                        onOpenChange={(open) => setIsCheckingIn(open ? goal.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Check-in
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Check-in</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Novo Progresso: {checkInData.progress}%</Label>
                              <Slider
                                value={[checkInData.progress]}
                                onValueChange={([v]) => setCheckInData({ ...checkInData, progress: v })}
                                max={100}
                                step={5}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>O que você realizou?</Label>
                              <Textarea
                                value={checkInData.update}
                                onChange={(e) => setCheckInData({ ...checkInData, update: e.target.value })}
                                placeholder="Descreva suas realizações..."
                              />
                            </div>
                            <div>
                              <Label>Bloqueios ou Desafios</Label>
                              <Textarea
                                value={checkInData.blockers}
                                onChange={(e) => setCheckInData({ ...checkInData, blockers: e.target.value })}
                                placeholder="Algum impedimento?"
                              />
                            </div>
                            <Button onClick={() => handleCheckIn(goal.id)} className="w-full">
                              Registrar Check-in
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meu PDI</h2>
          <p className="text-muted-foreground">Planos de Desenvolvimento Individual</p>
        </div>
        <Dialog open={isCreatingPlan} onOpenChange={setIsCreatingPlan}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo PDI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo PDI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título do PDI</Label>
                <Input
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="Ex: PDI 2024 - Desenvolvimento de Liderança"
                />
              </div>
              <Button onClick={handleCreatePlan} className="w-full">
                Criar PDI
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum PDI encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Crie seu primeiro Plano de Desenvolvimento Individual para acompanhar suas metas de crescimento profissional.
            </p>
            <Button onClick={() => setIsCreatingPlan(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro PDI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewPlan(plan)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    {getStatusBadge(plan.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Progress value={plan.overall_progress} className="flex-1" />
                    <span className="font-bold">{plan.overall_progress}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {plan.created_at ? format(new Date(plan.created_at), "dd MMM yyyy", { locale: ptBR }) : "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      {plan.xp_on_completion} XP
                    </span>
                  </div>

                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
