/**
 * PDI Section - Individual Development Plan
 * Redesigned with improved UX: new header, goal cards, filters, and quick check-in
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePDI, DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";
import { useAuth } from "@/hooks/useAuth";
import { PDISuggestionsPanel } from "./PDISuggestionsPanel";
import { 
  GoalTypeSelector, 
  LinkedEntitiesSelect, 
  GoalLinksManager,
  GoalProgressHistory,
  PDIHeader,
  GoalCard,
  PDIFilters,
  QuickCheckIn,
  CompactInsights,
  type GoalType,
  type GoalTypeFilter,
  type GoalStatusFilter,
  type GoalSortBy,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Target,
  Plus,
  Calendar,
  Trophy,
  ArrowRight,
  Zap,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [checkInGoal, setCheckInGoal] = useState<DevelopmentGoal | null>(null);
  const [historyGoal, setHistoryGoal] = useState<DevelopmentGoal | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<GoalTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<GoalStatusFilter>("all");
  const [sortBy, setSortBy] = useState<GoalSortBy>("priority");
  
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

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let goals = [...planGoals];
    
    // Filter by type
    if (typeFilter !== "all") {
      goals = goals.filter(g => g.goal_type === typeFilter);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      goals = goals.filter(g => {
        if (statusFilter === "completed") return g.status === "completed";
        if (statusFilter === "in_progress") return g.status === "in_progress" && !g.stagnant_since;
        if (statusFilter === "stagnant") return !!g.stagnant_since && g.status !== "completed";
        if (statusFilter === "overdue") {
          return g.target_date && isPast(new Date(g.target_date)) && g.status !== "completed";
        }
        return true;
      });
    }
    
    // Sort
    goals.sort((a, b) => {
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority as keyof typeof order] || 1) - (order[b.priority as keyof typeof order] || 1);
      }
      if (sortBy === "deadline") {
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
      }
      if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      return 0;
    });
    
    return goals;
  }, [planGoals, typeFilter, statusFilter, sortBy]);

  // Calculate counts for filters
  const filterCounts = useMemo(() => {
    return {
      all: planGoals.length,
      behavioral: planGoals.filter(g => g.goal_type === "behavioral").length,
      technical: planGoals.filter(g => g.goal_type === "technical").length,
      cognitive: planGoals.filter(g => g.goal_type === "cognitive").length,
      performance: planGoals.filter(g => g.goal_type === "performance").length,
      in_progress: planGoals.filter(g => g.status === "in_progress" && !g.stagnant_since).length,
      stagnant: planGoals.filter(g => g.stagnant_since && g.status !== "completed").length,
      overdue: planGoals.filter(g => g.target_date && isPast(new Date(g.target_date)) && g.status !== "completed").length,
      completed: planGoals.filter(g => g.status === "completed").length,
    };
  }, [planGoals]);

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

  const handleCheckIn = async (progress: number, notes: string) => {
    if (!checkInGoal) return;
    await addCheckIn.mutateAsync({
      goal_id: checkInGoal.id,
      progress_update: notes,
      blockers: "",
      new_progress: progress,
    });
    if (selectedPlan) {
      const goals = await getGoalsForPlan(selectedPlan.id);
      setPlanGoals(goals);
    }
    setCheckInGoal(null);
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

  if (myPlansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // ============= PLAN DETAIL VIEW =============
  if (selectedPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* New Header */}
        <PDIHeader
          plan={selectedPlan}
          goals={planGoals}
          onBack={() => setSelectedPlan(null)}
          onNewGoal={() => setIsCreatingGoal(true)}
        />

        {/* Compact Insights */}
        <CompactInsights
          plan={selectedPlan}
          goals={planGoals}
          onGoalClick={(goalId) => {
            const goal = planGoals.find(g => g.id === goalId);
            if (goal) setCheckInGoal(goal);
          }}
        />

        {/* Filters */}
        <PDIFilters
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onTypeFilterChange={setTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onSortByChange={setSortBy}
          counts={filterCounts}
        />

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {planGoals.length === 0 ? (
                    <>
                      Nenhuma meta criada ainda.
                      <br />
                      Clique em "Nova Meta" para começar.
                    </>
                  ) : (
                    "Nenhuma meta corresponde aos filtros selecionados."
                  )}
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredGoals.map((goal) => (
                <div key={goal.id}>
                  <GoalCard
                    goal={goal}
                    onCheckIn={(g) => setCheckInGoal(g)}
                    onViewHistory={(g) => setHistoryGoal(g)}
                    onEdit={(g) => {
                      // TODO: implement edit
                      console.log("Edit goal", g.id);
                    }}
                  />
                  
                  {/* Inline Quick Check-in */}
                  <AnimatePresence>
                    {checkInGoal?.id === goal.id && (
                      <div className="mt-2">
                        <QuickCheckIn
                          goal={goal}
                          onSubmit={handleCheckIn}
                          onClose={() => setCheckInGoal(null)}
                          isLoading={addCheckIn.isPending}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={isCreatingGoal} onOpenChange={setIsCreatingGoal}>
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

        {/* History Sheet */}
        <Sheet open={!!historyGoal} onOpenChange={(open) => !open && setHistoryGoal(null)}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Histórico: {historyGoal?.title}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {historyGoal && user && (
                <>
                  <GoalLinksManager goal={historyGoal} userId={user.id} />
                  <div className="pt-4 border-t">
                    <GoalProgressHistory goalId={historyGoal.id} maxHeight="400px" />
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    );
  }

  // ============= PLANS LIST VIEW =============
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleViewPlan(plan)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{plan.title}</CardTitle>
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

                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
