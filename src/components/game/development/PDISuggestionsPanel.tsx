/**
 * PDISuggestionsPanel - Painel de sugestões de metas PDI
 * Exibe sugestões automáticas baseadas em eventos de avaliação, jogos e testes
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  GamepadIcon,
  Lightbulb,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePDI } from "@/hooks/usePDI";
import { toast } from "sonner";

interface PDISuggestion {
  suggestion_type: string;
  skill_id: string;
  skill_name: string;
  reason: string;
  priority: string;
  source_type: string;
  source_id: string | null;
  suggested_title: string;
  xp_reward: number;
}

// Configuração visual por tipo de sugestão
const SUGGESTION_CONFIG: Record<string, { label: string; icon: typeof Brain; color: string; bgColor: string }> = {
  low_cognitive_score: {
    label: "Teste Cognitivo",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  low_feedback_score: {
    label: "Feedback 360°",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  low_game_performance: {
    label: "Performance em Jogos",
    icon: GamepadIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "Alta", color: "text-red-500 bg-red-500/10" },
  medium: { label: "Média", color: "text-amber-500 bg-amber-500/10" },
  low: { label: "Baixa", color: "text-green-500 bg-green-500/10" },
};

export function PDISuggestionsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PDISuggestion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const {
    pdiSuggestions,
    suggestionsLoading,
    refetchSuggestions,
    myPlans,
    createGoalFromSuggestion,
    hasPendingSuggestions,
  } = usePDI();

  const suggestions = pdiSuggestions as PDISuggestion[];
  const activePlan = myPlans.find(p => p.status === "active");

  const handleCreateGoal = async () => {
    if (!selectedSuggestion || !activePlan) {
      toast.error("Plano ativo não encontrado");
      return;
    }

    setIsCreating(true);
    try {
      await createGoalFromSuggestion.mutateAsync({
        planId: activePlan.id,
        skillId: selectedSuggestion.skill_id,
        title: customTitle || selectedSuggestion.suggested_title,
        description: customDescription || selectedSuggestion.reason,
        priority: selectedSuggestion.priority,
        xpReward: selectedSuggestion.xp_reward,
        originAssessmentId: selectedSuggestion.source_id || undefined,
      });
      setSelectedSuggestion(null);
      setCustomTitle("");
      setCustomDescription("");
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateDialog = (suggestion: PDISuggestion) => {
    setSelectedSuggestion(suggestion);
    setCustomTitle(suggestion.suggested_title);
    setCustomDescription(suggestion.reason);
  };

  // Não exibir se não houver sugestões
  if (!suggestionsLoading && suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardHeader
            className="cursor-pointer py-3"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Sugestões de Metas PDI
                    {hasPendingSuggestions && (
                      <Badge variant="default" className="bg-green-600 animate-pulse">
                        {suggestions.length} nova{suggestions.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Metas sugeridas baseadas na sua performance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetchSuggestions();
                  }}
                  disabled={suggestionsLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${suggestionsLoading ? "animate-spin" : ""}`} />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pt-0">
                  {suggestionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px] pr-2">
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => {
                          const config = SUGGESTION_CONFIG[suggestion.suggestion_type] || {
                            label: "Sugestão",
                            icon: Target,
                            color: "text-gray-600",
                            bgColor: "bg-gray-500/10",
                          };
                          const priorityConfig = PRIORITY_CONFIG[suggestion.priority] || PRIORITY_CONFIG.medium;
                          const Icon = config.icon;

                          return (
                            <motion.div
                              key={`${suggestion.skill_id}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                  <Icon className={`w-4 h-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">
                                      {suggestion.skill_name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {config.label}
                                    </Badge>
                                    <Badge className={`text-xs ${priorityConfig.color}`}>
                                      {priorityConfig.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {suggestion.reason}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      +{suggestion.xp_reward} XP
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => openCreateDialog(suggestion)}
                                  className="shrink-0"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Criar Meta
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Dialog para criar meta */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Criar Meta de Desenvolvimento
            </DialogTitle>
            <DialogDescription>
              Crie uma meta PDI baseada na sugestão para a skill "{selectedSuggestion?.skill_name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Meta</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Desenvolver comunicação assertiva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Descreva o objetivo e como você pretende alcançá-lo"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>+{selectedSuggestion?.xp_reward} XP ao concluir</span>
              </div>
              <Badge className={PRIORITY_CONFIG[selectedSuggestion?.priority || "medium"]?.color}>
                Prioridade {PRIORITY_CONFIG[selectedSuggestion?.priority || "medium"]?.label}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSuggestion(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCreateGoal} disabled={isCreating || !customTitle.trim()}>
              <Check className="w-4 h-4 mr-2" />
              {isCreating ? "Criando..." : "Criar Meta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
