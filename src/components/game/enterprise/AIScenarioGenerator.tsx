/**
 * Componente para gerar cenários de decisão com IA - Game IA
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface GeneratedScenario {
  title: string;
  context: string;
  difficulty: string;
  xp_reward: number;
  options: {
    option_text: string;
    feedback: string;
    is_optimal: boolean;
    impact_score: number;
    cost_score: number;
    risk_score: number;
  }[];
}

interface AIScenarioGeneratorProps {
  onScenarioGenerated: () => void;
}

const THEME_SUGGESTIONS = [
  { label: "Gestão de Crise", icon: "🚨" },
  { label: "Liderança", icon: "👑" },
  { label: "Inovação", icon: "💡" },
  { label: "Negociação", icon: "🤝" },
  { label: "Transformação Digital", icon: "🔄" },
  { label: "Sustentabilidade", icon: "🌱" },
];

export function AIScenarioGenerator({ onScenarioGenerated }: AIScenarioGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [generatedScenario, setGeneratedScenario] = useState<GeneratedScenario | null>(null);

  const generateScenario = async () => {
    setIsGenerating(true);
    setGeneratedScenario(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-scenario", {
        body: { theme: theme || undefined, difficulty },
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedScenario(data);
      toast({
        title: "✨ Cenário Gerado!",
        description: `"${data.title}" criado com sucesso pela IA`,
      });
    } catch (error) {
      console.error("Erro ao gerar cenário:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o cenário",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveScenario = async () => {
    if (!generatedScenario || !user) return;

    setIsSaving(true);

    try {
      // Insert scenario
      const { data: scenarioData, error: scenarioError } = await supabase
        .from("decision_scenarios")
        .insert({
          title: generatedScenario.title,
          context: generatedScenario.context,
          difficulty: generatedScenario.difficulty,
          xp_reward: generatedScenario.xp_reward,
        })
        .select()
        .single();

      if (scenarioError) throw scenarioError;

      // Insert options
      const optionsToInsert = generatedScenario.options.map((opt) => ({
        scenario_id: scenarioData.id,
        option_text: opt.option_text,
        feedback: opt.feedback,
        is_optimal: opt.is_optimal,
        impact_score: opt.impact_score,
        cost_score: opt.cost_score,
        risk_score: opt.risk_score,
      }));

      const { error: optionsError } = await supabase
        .from("decision_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      toast({
        title: "🎮 Cenário Salvo!",
        description: "O cenário foi adicionado ao simulador",
      });

      setGeneratedScenario(null);
      setTheme("");
      onScenarioGenerated();
    } catch (error) {
      console.error("Erro ao salvar cenário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cenário",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/5 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Game IA
            </h2>
            <p className="text-sm text-muted-foreground">
              Cenários gerados por Inteligência Artificial
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          A IA cria cenários únicos e desafiadores baseados em situações empresariais reais.
          Cada cenário é personalizado para maximizar seu aprendizado.
        </p>
      </div>

      {/* Generator Form */}
      {!generatedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Theme Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tema (opcional)</label>
            <Input
              placeholder="Ex: Gestão de crise em startup de tecnologia"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isGenerating}
              className="bg-background/50"
            />
          </div>

          {/* Theme Suggestions */}
          <div className="flex flex-wrap gap-2">
            {THEME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => setTheme(suggestion.label)}
                disabled={isGenerating}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  theme === suggestion.label
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-card/50 border-border hover:border-purple-500/30"
                )}
              >
                {suggestion.icon} {suggestion.label}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dificuldade</label>
            <div className="grid grid-cols-3 gap-3">
              {(["easy", "medium", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  disabled={isGenerating}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    difficulty === diff
                      ? diff === "easy"
                        ? "border-green-500 bg-green-500/10"
                        : diff === "medium"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-red-500 bg-red-500/10"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className={cn(
                      "text-lg font-bold",
                      diff === "easy"
                        ? "text-green-500"
                        : diff === "medium"
                        ? "text-yellow-500"
                        : "text-red-500"
                    )}
                  >
                    {diff === "easy" ? "Fácil" : diff === "medium" ? "Médio" : "Difícil"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    +{diff === "easy" ? 75 : diff === "medium" ? 100 : 150} XP
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateScenario}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando com IA...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Gerar Cenário
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Generated Scenario Preview */}
      <AnimatePresence mode="wait">
        {generatedScenario && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Scenario Card */}
            <div className="p-6 bg-gradient-to-br from-card/80 to-card/40 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    generatedScenario.difficulty === "easy"
                      ? "bg-green-500/20 text-green-500"
                      : generatedScenario.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  )}
                >
                  {generatedScenario.difficulty === "easy"
                    ? "Fácil"
                    : generatedScenario.difficulty === "medium"
                    ? "Médio"
                    : "Difícil"}
                </span>
                <span className="text-sm text-primary">
                  +{generatedScenario.xp_reward} XP
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2">{generatedScenario.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {generatedScenario.context}
              </p>

              {/* Options Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Opções de decisão:</h4>
                {generatedScenario.options.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      option.is_optimal
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-card/50 border-border"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option.option_text}</span>
                      {option.is_optimal && (
                        <Zap className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedScenario(null);
                  generateScenario();
                }}
                disabled={isGenerating || isSaving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar Outro
              </Button>
              <Button
                onClick={saveScenario}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-emerald-500"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Salvar Cenário
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
