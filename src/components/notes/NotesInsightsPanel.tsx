import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, Sparkles, RefreshCw, Lightbulb, 
  Target, TrendingUp, AlertCircle, ChevronDown,
  ChevronUp, BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNotesAnalysis, type NotesAnalysis } from "@/hooks/useNotesAnalysis";

export function NotesInsightsPanel() {
  const { analyzeNotes, analysis, isAnalyzing, error } = useNotesAnalysis();
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    await analyzeNotes('full');
    setHasAnalyzed(true);
  };

  if (!hasAnalyzed && !analysis) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Insights de Aprendizado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use IA para analisar suas anotações e descobrir padrões, 
                sugestões de revisão e recomendações personalizadas.
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar Anotações
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Analisando suas anotações...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-primary" />
                Insights de Aprendizado
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyze();
                  }}
                >
                  <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 rounded-lg bg-background/50 border">
                <p className="text-sm text-foreground/90">{analysis.summary}</p>
              </div>
            )}

            {/* Motivational Message */}
            {analysis.motivationalMessage && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  {analysis.motivationalMessage}
                </p>
              </div>
            )}

            {/* Patterns */}
            {analysis.patterns && analysis.patterns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Padrões Identificados
                </h4>
                <div className="space-y-2">
                  {analysis.patterns.slice(0, 3).map((pattern, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {pattern.pattern}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pattern.insight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Suggestions */}
            {analysis.reviewSuggestions && analysis.reviewSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-500" />
                  Sugestões de Revisão
                </h4>
                <div className="space-y-2">
                  {analysis.reviewSuggestions.slice(0, 3).map((suggestion, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                    >
                      <span className="text-sm text-foreground/90">{suggestion.reason}</span>
                      <Badge 
                        variant={suggestion.priority === 'alta' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                {analysis.reviewTip && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {analysis.reviewTip}
                  </p>
                )}
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                  Recomendações
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations.slice(0, 3).map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {rec.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {rec.type}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysis.nextSteps && analysis.nextSteps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Próximos Passos
                </h4>
                <ul className="space-y-1">
                  {analysis.nextSteps.map((step, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Topics */}
            {analysis.keyTopics && analysis.keyTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                {analysis.keyTopics.map((topic, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
