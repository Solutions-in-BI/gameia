/**
 * QuizManagement - CRUD para perguntas de quiz
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  HelpCircle,
  CheckCircle,
  Filter,
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
import { cn } from "@/lib/utils";

interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string | null;
  xp_reward: number;
  category_id: string;
  category?: QuizCategory;
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

export function QuizManagement() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<QuizQuestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    difficulty: "medium" as "easy" | "medium" | "hard",
    explanation: "",
    xp_reward: 10,
    category_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [questionsRes, categoriesRes] = await Promise.all([
        supabase
          .from("quiz_questions")
          .select("*, category:quiz_categories(*)")
          .order("created_at", { ascending: false }),
        supabase.from("quiz_categories").select("*").eq("is_active", true),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setQuestions(
        (questionsRes.data || []).map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? (q.options as string[]) : [],
        }))
      );
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast.error("Erro ao carregar perguntas");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      difficulty: "medium",
      explanation: "",
      xp_reward: 10,
      category_id: categories[0]?.id || "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      options: [...question.options],
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      explanation: question.explanation || "",
      xp_reward: question.xp_reward,
      category_id: question.category_id,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim()) {
      toast.error("Preencha a pergunta");
      return;
    }
    if (formData.options.some((opt) => !opt.trim())) {
      toast.error("Preencha todas as opções");
      return;
    }
    if (!formData.category_id) {
      toast.error("Selecione uma categoria");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question: formData.question,
        options: formData.options,
        correct_answer: formData.correct_answer,
        difficulty: formData.difficulty,
        explanation: formData.explanation || null,
        xp_reward: formData.xp_reward,
        category_id: formData.category_id,
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from("quiz_questions")
          .update(payload)
          .eq("id", editingQuestion.id);
        if (error) throw error;
        toast.success("Pergunta atualizada!");
      } else {
        const { error } = await supabase.from("quiz_questions").insert(payload);
        if (error) throw error;
        toast.success("Pergunta criada!");
      }

      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Erro ao salvar pergunta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuestion) return;

    try {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", deletingQuestion.id);
      if (error) throw error;
      toast.success("Pergunta excluída!");
      setIsDeleteOpen(false);
      setDeletingQuestion(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Erro ao excluir pergunta");
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || q.category_id === filterCategory;
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
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
          <h2 className="text-xl font-bold text-foreground">Perguntas de Quiz</h2>
          <p className="text-sm text-muted-foreground">
            {questions.length} perguntas cadastradas
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Pergunta
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar perguntas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Questions List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className={DIFFICULTY_COLORS[question.difficulty]}>
                      {DIFFICULTY_LABELS[question.difficulty]}
                    </Badge>
                    {question.category && (
                      <Badge variant="secondary">{question.category.name}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{question.xp_reward} XP</span>
                  </div>
                  <p className="font-medium text-foreground line-clamp-2">{question.question}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {question.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "text-xs px-2 py-1 rounded",
                          idx === question.correct_answer
                            ? "bg-green-500/20 text-green-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {idx === question.correct_answer && (
                          <CheckCircle className="inline w-3 h-3 mr-1" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditForm(question)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeletingQuestion(question);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhuma pergunta encontrada</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Editar Pergunta" : "Nova Pergunta"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Pergunta</label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Digite a pergunta..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formData.options.map((opt, idx) => (
                <div key={idx}>
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Opção {idx + 1}
                    {idx === formData.correct_answer && (
                      <Badge variant="default" className="text-xs">Correta</Badge>
                    )}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Opção ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant={idx === formData.correct_answer ? "default" : "outline"}
                      size="icon"
                      onClick={() => setFormData({ ...formData, correct_answer: idx })}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Categoria</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Dificuldade</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val) =>
                    setFormData({ ...formData, difficulty: val as "easy" | "medium" | "hard" })
                  }
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

            <div>
              <label className="text-sm font-medium text-foreground">Explicação (opcional)</label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explique a resposta correta..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingQuestion ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A pergunta será permanentemente removida.
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
