/**
 * BookApplicationInsights - Resumos por IA para o gestor
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, TrendingUp, AlertCircle, Lightbulb, 
  RefreshCw, BookOpen, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookApplications } from "@/hooks/useBookApplications";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

interface BookApplicationInsightsProps {
  trainingId?: string;
  moduleId?: string;
}

interface Insight {
  type: 'theme' | 'challenge' | 'success' | 'recommendation';
  title: string;
  description: string;
  count?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export function BookApplicationInsights({ trainingId, moduleId }: BookApplicationInsightsProps) {
  const { currentOrg } = useOrganization();
  const { generateInsights, stats, fetchApplications, summary } = useBookApplications();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Fetch applications on mount
  useEffect(() => {
    if (currentOrg?.id) {
      fetchApplications(currentOrg.id, trainingId);
    }
  }, [currentOrg?.id, trainingId, fetchApplications]);

  const handleGenerateInsights = async () => {
    if (!currentOrg?.id) return;
    
    setIsGenerating(true);
    try {
      const result = await generateInsights(currentOrg.id, trainingId);
      
      if (result) {
        setAiSummary(result.aiSummary);
        // Convert keyInsights to Insight format
        const formattedInsights: Insight[] = (result.keyInsights || []).map((item) => ({
          type: 'theme' as const,
          title: item.theme,
          description: `Mencionado ${item.count} vezes (${item.percentage}% das aplicações)`,
          count: item.count,
        }));
        setInsights(formattedInsights);
        setHasGenerated(true);
        toast.success('Insights gerados com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao gerar insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'theme': return Lightbulb;
      case 'challenge': return AlertCircle;
      case 'success': return TrendingUp;
      case 'recommendation': return Target;
      default: return Sparkles;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'theme': return 'text-purple-500 bg-purple-500/10';
      case 'challenge': return 'text-orange-500 bg-orange-500/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'recommendation': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Aplicações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{Math.round(stats.onTimeRate)}%</div>
              <p className="text-xs text-muted-foreground">No Prazo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.completedLate}</div>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Insights por IA
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isGenerating || stats.totalApplications === 0}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {hasGenerated ? 'Atualizar' : 'Gerar Insights'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isGenerating ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : hasGenerated && aiSummary ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Resumo Executivo</h4>
                    <p className="text-sm text-muted-foreground">{aiSummary}</p>
                  </div>
                </div>
              </div>

              {/* Insights Grid */}
              {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);
                    const colorClasses = getInsightColor(insight.type);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-border/50 bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-sm">{insight.title}</h5>
                              {insight.count && (
                                <Badge variant="secondary" className="text-xs">
                                  {insight.count}x
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h4 className="font-medium mb-1">Análise Inteligente</h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                {stats.totalApplications === 0 
                  ? 'Aguardando aplicações para gerar insights'
                  : 'Clique em "Gerar Insights" para analisar as aplicações práticas com IA'}
              </p>
              {stats.totalApplications > 0 && (
                <Button onClick={handleGenerateInsights} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gerar Insights
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
