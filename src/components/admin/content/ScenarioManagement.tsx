/**
 * ScenarioManagement - CRUD para cenários de decisão
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DecisionOption {
  id: string;
  option_text: string;
  feedback: string;
  is_optimal: boolean;
  impact_score: number;
  cost_score: number;
  risk_score: number;
}

interface DecisionScenario {
  id: string;
  title: string;
  context: string;
  difficulty: string;
  xp_reward: number;
  options?: DecisionOption[];
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-500/20 text-green-500",
  medium: "bg-amber-500/20 text-amber-500",
  hard: "bg-red-500/20 text-red-500",
};

export function ScenarioManagement() {
  const [scenarios, setScenarios] = useState<DecisionScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<DecisionScenario | null>(null);
  const [deletingScenario, setDeletingScenario] = useState<DecisionScenario | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    context: "",
    difficulty: "medium",
    xp_reward: 100,
    options: [
      { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
      { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
      { option_text: "", feedback: "", is_optimal: true, impact_score: 80, cost_score: 30, risk_score: 20 },
      { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
    ],
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    setIsLoading(true);
    try {
      const { data: scenariosData, error: scenariosError } = await supabase
        .from("decision_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (scenariosError) throw scenariosError;

      // Fetch options for each scenario
      const scenariosWithOptions = await Promise.all(
        (scenariosData || []).map(async (scenario) => {
          const { data: optionsData } = await supabase
            .from("decision_options")
            .select("*")
            .eq("scenario_id", scenario.id);
          return { ...scenario, options: optionsData || [] };
        })
      );

      setScenarios(scenariosWithOptions);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      toast.error("Erro ao carregar cenários");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingScenario(null);
    setFormData({
      title: "",
      context: "",
      difficulty: "medium",
      xp_reward: 100,
      options: [
        { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
        { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
        { option_text: "", feedback: "", is_optimal: true, impact_score: 80, cost_score: 30, risk_score: 20 },
        { option_text: "", feedback: "", is_optimal: false, impact_score: 50, cost_score: 50, risk_score: 50 },
      ],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (scenario: DecisionScenario) => {
    setEditingScenario(scenario);
    setFormData({
      title: scenario.title,
      context: scenario.context,
      difficulty: scenario.difficulty,
      xp_reward: scenario.xp_reward || 100,
      options: scenario.options?.map((opt) => ({
        option_text: opt.option_text,
        feedback: opt.feedback,
        is_optimal: opt.is_optimal,
        impact_score: opt.impact_score,
        cost_score: opt.cost_score,
        risk_score: opt.risk_score,
      })) || [],
    });
    setIsFormOpen(true);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-scenario", {
        body: { difficulty: formData.difficulty },
      });

      if (error) throw error;

      setFormData({
        title: data.title,
        context: data.context,
        difficulty: data.difficulty || formData.difficulty,
        xp_reward: data.xp_reward || 100,
        options: data.options.map((opt: any) => ({
          option_text: opt.option_text,
          feedback: opt.feedback,
          is_optimal: opt.is_optimal,
          impact_score: opt.impact_score || 50,
          cost_score: opt.cost_score || 50,
          risk_score: opt.risk_score || 50,
        })),
      });

      toast.success("Cenário gerado com IA!");
    } catch (error) {
      console.error("Error generating scenario:", error);
      toast.error("Erro ao gerar cenário com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.context.trim()) {
      toast.error("Preencha título e contexto");
      return;
    }
    if (formData.options.some((opt) => !opt.option_text.trim() || !opt.feedback.trim())) {
      toast.error("Preencha todas as opções e feedbacks");
      return;
    }
    if (!formData.options.some((opt) => opt.is_optimal)) {
      toast.error("Marque pelo menos uma opção como ótima");
      return;
    }

    setIsSaving(true);
    try {
      if (editingScenario) {
        // Update scenario
        const { error: scenarioError } = await supabase
          .from("decision_scenarios")
          .update({
            title: formData.title,
            context: formData.context,
            difficulty: formData.difficulty,
            xp_reward: formData.xp_reward,
          })
          .eq("id", editingScenario.id);

        if (scenarioError) throw scenarioError;

        // Delete old options and insert new ones
        await supabase.from("decision_options").delete().eq("scenario_id", editingScenario.id);

        const { error: optionsError } = await supabase.from("decision_options").insert(
          formData.options.map((opt) => ({
            scenario_id: editingScenario.id,
            option_text: opt.option_text,
            feedback: opt.feedback,
            is_optimal: opt.is_optimal,
            impact_score: opt.impact_score,
            cost_score: opt.cost_score,
            risk_score: opt.risk_score,
          }))
        );

        if (optionsError) throw optionsError;
        toast.success("Cenário atualizado!");
      } else {
        // Create new scenario
        const { data: newScenario, error: scenarioError } = await supabase
          .from("decision_scenarios")
          .insert({
            title: formData.title,
            context: formData.context,
            difficulty: formData.difficulty,
            xp_reward: formData.xp_reward,
          })
          .select()
          .single();

        if (scenarioError) throw scenarioError;

        // Insert options
        const { error: optionsError } = await supabase.from("decision_options").insert(
          formData.options.map((opt) => ({
            scenario_id: newScenario.id,
            option_text: opt.option_text,
            feedback: opt.feedback,
            is_optimal: opt.is_optimal,
            impact_score: opt.impact_score,
            cost_score: opt.cost_score,
            risk_score: opt.risk_score,
          }))
        );

        if (optionsError) throw optionsError;
        toast.success("Cenário criado!");
      }

      setIsFormOpen(false);
      fetchScenarios();
    } catch (error) {
      console.error("Error saving scenario:", error);
      toast.error("Erro ao salvar cenário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingScenario) return;

    try {
      // Options will be deleted by CASCADE
      const { error } = await supabase
        .from("decision_scenarios")
        .delete()
        .eq("id", deletingScenario.id);

      if (error) throw error;
      toast.success("Cenário excluído!");
      setIsDeleteOpen(false);
      setDeletingScenario(null);
      fetchScenarios();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error("Erro ao excluir cenário");
    }
  };

  const filteredScenarios = scenarios.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.context.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === "all" || s.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cenários de Decisão</h2>
          <p className="text-sm text-muted-foreground">
            {scenarios.length} cenários cadastrados
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cenário
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cenários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="easy">Fácil</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="hard">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scenarios List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredScenarios.map((scenario) => (
            <motion.div
              key={scenario.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() =>
                  setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className={DIFFICULTY_COLORS[scenario.difficulty]}>
                        {DIFFICULTY_LABELS[scenario.difficulty] || scenario.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scenario.xp_reward} XP • {scenario.options?.length || 0} opções
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {scenario.context}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(scenario);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingScenario(scenario);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedScenario === scenario.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedScenario === scenario.id && scenario.options && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-2">
                      {scenario.options.map((opt, idx) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "p-3 rounded-lg text-sm",
                            opt.is_optimal
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {idx + 1}. {opt.option_text}
                            </span>
                            {opt.is_optimal && (
                              <Badge variant="default" className="text-xs">Ótima</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">{opt.feedback}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Impacto: {opt.impact_score}</span>
                            <span>Custo: {opt.cost_score}</span>
                            <span>Risco: {opt.risk_score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum cenário encontrado</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingScenario ? "Editar Cenário" : "Novo Cenário"}</span>
              {!editingScenario && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Gerar com IA
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do cenário..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Contexto</label>
              <Textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Descreva a situação..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Dificuldade</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">XP Reward</label>
                <Input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) =>
                    setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Opções de Decisão</label>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opção {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Ótima</span>
                      <Switch
                        checked={opt.is_optimal}
                        onCheckedChange={(checked) => {
                          const newOptions = formData.options.map((o, i) => ({
                            ...o,
                            is_optimal: i === idx ? checked : false,
                          }));
                          setFormData({ ...formData, options: newOptions });
                        }}
                      />
                    </div>
                  </div>
                  <Input
                    value={opt.option_text}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].option_text = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder="Texto da opção..."
                  />
                  <Textarea
                    value={opt.feedback}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].feedback = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder="Feedback/consequências..."
                    rows={2}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Impacto</label>
                      <Input
                        type="number"
                        min={-100}
                        max={100}
                        value={opt.impact_score}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx].impact_score = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, options: newOptions });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Custo</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={opt.cost_score}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx].cost_score = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, options: newOptions });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Risco</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={opt.risk_score}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx].risk_score = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, options: newOptions });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingScenario ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cenário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cenário e suas opções serão permanentemente
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
