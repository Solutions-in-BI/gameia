/**
 * PDI Section - Individual Development Plan
 * Shows user's development plans with goals and progress tracking
 * Enhanced with goal types, entity linking, and automatic progress
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { usePDI, DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";
import { useAuth } from "@/hooks/useAuth";
import { PDISuggestionsPanel } from "./PDISuggestionsPanel";
import { PDIInsightsPanel } from "./PDIInsightsPanel";
import { 
  GoalTypeSelector, 
  LinkedEntitiesSelect, 
  GoalLinksManager,
  GoalProgressHistory,
  getGoalTypeInfo,
  type GoalType 
} from "@/components/pdi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Target,
  Plus,
  Calendar,
  Trophy,
  ArrowRight,
  TrendingUp,
  Flag,
  MessageSquare,
  History,
  ChevronDown,
  Zap,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PDISectionProps {
  onBack?: () => void;
}

export function PDISection({ onBack }: PDISectionProps) {
  const { user } = useAuth();
  const { myPlans, myPlansLoading, createPlan, getGoalsForPlan, createGoal, addCheckIn } = usePDI();
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null);
  const [planGoals, setPlanGoals] = useState<DevelopmentGoal[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "medium",
    goal_type: "behavioral" as GoalType,
    linked_training_ids: [] as string[],
    linked_challenge_ids: [] as string[],
    linked_cognitive_test_ids: [] as string[],
    related_games: [] as string[],
    weight: 1,
  });
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
      goal_type: newGoal.goal_type,
      linked_training_ids: newGoal.linked_training_ids,
      linked_challenge_ids: newGoal.linked_challenge_ids,
      linked_cognitive_test_ids: newGoal.linked_cognitive_test_ids,
      related_games: newGoal.related_games,
      weight: newGoal.weight,
    });
    const goals = await getGoalsForPlan(selectedPlan.id);
    setPlanGoals(goals);
    setNewGoal({
      title: "",
      description: "",
      priority: "medium",
      goal_type: "behavioral",
      linked_training_ids: [],
      linked_challenge_ids: [],
      linked_cognitive_test_ids: [],
      related_games: [],
      weight: 1,
    });
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

  const hasLinkedEntities = (goal: DevelopmentGoal) => {
    return (
      (goal.linked_training_ids?.length || 0) > 0 ||
      (goal.linked_challenge_ids?.length || 0) > 0 ||
      (goal.linked_cognitive_test_ids?.length || 0) > 0 ||
      (goal.related_games?.length || 0) > 0
    );
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações</TabsTrigger>
                  <TabsTrigger value="links">Vincular Atividades</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label>Tipo de Meta</Label>
                    <div className="mt-2">
                      <GoalTypeSelector
                        value={newGoal.goal_type}
                        onChange={(v) => setNewGoal({ ...newGoal, goal_type: v })}
                      />
                    </div>
                  </div>
                  
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div>
                      <Label>Peso no PDI: {newGoal.weight}x</Label>
                      <Slider
                        value={[newGoal.weight]}
                        onValueChange={([v]) => setNewGoal({ ...newGoal, weight: v })}
                        min={1}
                        max={5}
                        step={1}
                        className="mt-3"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="links" className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 text-sm text-primary mb-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Progresso Automático</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vincule atividades para que o progresso seja atualizado automaticamente quando você completá-las.
                    </p>
                  </div>
                  
                  <LinkedEntitiesSelect
                    entityType="training"
                    selectedIds={newGoal.linked_training_ids}
                    onChange={(ids) => setNewGoal({ ...newGoal, linked_training_ids: ids })}
                    placeholder="Vincular treinamentos..."
                  />
                  
                  <LinkedEntitiesSelect
                    entityType="challenge"
                    selectedIds={newGoal.linked_challenge_ids}
                    onChange={(ids) => setNewGoal({ ...newGoal, linked_challenge_ids: ids })}
                    placeholder="Vincular desafios..."
                  />
                  
                  <LinkedEntitiesSelect
                    entityType="game"
                    selectedIds={newGoal.related_games}
                    onChange={(ids) => setNewGoal({ ...newGoal, related_games: ids })}
                    placeholder="Vincular jogos..."
                  />
                  
                  <LinkedEntitiesSelect
                    entityType="cognitive_test"
                    selectedIds={newGoal.linked_cognitive_test_ids}
                    onChange={(ids) => setNewGoal({ ...newGoal, linked_cognitive_test_ids: ids })}
                    placeholder="Vincular testes cognitivos..."
                  />
                </TabsContent>
              </Tabs>
              
              <Button onClick={handleCreateGoal} className="w-full mt-4">
                Criar Meta
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Painel de Insights */}
        <PDIInsightsPanel plan={selectedPlan} goals={planGoals} />

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
            planGoals.map((goal) => {
              const goalTypeInfo = getGoalTypeInfo((goal.goal_type as GoalType) || "behavioral");
              const GoalTypeIcon = goalTypeInfo.icon;
              const isExpanded = expandedGoal === goal.id;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={cn("p-1.5 rounded", goalTypeInfo.bgColor)}>
                                <GoalTypeIcon className={cn("h-3.5 w-3.5", goalTypeInfo.color)} />
                              </div>
                              <Flag className={`h-4 w-4 ${getPriorityColor(goal.priority)}`} />
                              <h4 className="font-semibold">{goal.title}</h4>
                              <Badge variant={goal.status === "completed" ? "default" : "outline"}>
                                {goal.status === "completed" ? "Concluído" : "Em Progresso"}
                              </Badge>
                              {goal.auto_progress_enabled !== false && hasLinkedEntities(goal) && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
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
                          <div className="flex items-center gap-2">
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
                        </div>

                        {/* Collapsible para vínculos e histórico */}
                        {hasLinkedEntities(goal) && (
                          <Collapsible open={isExpanded} onOpenChange={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <LinkIcon className="h-4 w-4" />
                                  Atividades vinculadas & Histórico
                                </span>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 pt-4">
                              {user && (
                                <GoalLinksManager 
                                  goal={goal} 
                                  userId={user.id}
                                />
                              )}
                              
                              <div className="pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                  <History className="h-4 w-4" />
                                  <span>Histórico de Progresso</span>
                                </div>
                                <GoalProgressHistory goalId={goal.id} maxHeight="200px" />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
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
      {/* Painel de sugestões */}
      <PDISuggestionsPanel />

      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
              ← Voltar
            </Button>
          )}
          <h2 className="text-2xl font-bold">Trilha de Desenvolvimento</h2>
          <p className="text-muted-foreground">Seus planos de evolução gamificados</p>
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
