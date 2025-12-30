/**
 * PreviewStep - Preview das métricas calculadas da jornada
 */

import { Clock, BookOpen, Sparkles, Coins, Target, Award, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTrainings } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { JOURNEY_CATEGORIES, JOURNEY_LEVELS, JOURNEY_IMPORTANCE } from "@/hooks/useTrainingJourneys";
import type { JourneyFormData } from "../JourneyWizard";

interface PreviewStepProps {
  formData: JourneyFormData;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  const { currentOrg } = useOrganization();
  const { trainings } = useTrainings(currentOrg?.id);

  // Calculate totals from selected trainings
  const selectedTrainings = formData.trainings.map(jt => {
    return trainings.find(t => t.id === jt.training_id);
  }).filter(Boolean);

  const totalHours = selectedTrainings.reduce((sum, t) => sum + (t?.estimated_hours || 0), 0);
  const totalXp = selectedTrainings.reduce((sum, t) => sum + (t?.xp_reward || 0), 0);
  const totalCoins = selectedTrainings.reduce((sum, t) => sum + (t?.coins_reward || 0), 0);

  // Aggregate categories
  const categories = [...new Set(selectedTrainings.map(t => t?.category).filter(Boolean))];

  const categoryLabel = JOURNEY_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category;
  const levelLabel = JOURNEY_LEVELS.find(l => l.value === formData.level)?.label || formData.level;
  const importanceLabel = JOURNEY_IMPORTANCE.find(i => i.value === formData.importance)?.label || formData.importance;

  const grandTotalXp = totalXp + formData.bonus_xp;
  const grandTotalCoins = totalCoins + formData.bonus_coins;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${formData.color}20` }}
        >
          <Route className="h-6 w-6" style={{ color: formData.color }} />
        </div>
        <h2 className="text-xl font-bold">{formData.name || "Nova Jornada"}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline">{categoryLabel}</Badge>
          <Badge variant="outline">{levelLabel}</Badge>
          <Badge variant="outline">{importanceLabel}</Badge>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{formData.trainings.length}</p>
            <p className="text-xs text-muted-foreground">Treinamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{totalHours}h</p>
            <p className="text-xs text-muted-foreground">Duração Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{grandTotalXp}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{grandTotalCoins}</p>
            <p className="text-xs text-muted-foreground">Moedas Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribuição de Recompensas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP dos Treinamentos</span>
              <span className="font-medium">{totalXp}</span>
            </div>
            <Progress value={(totalXp / grandTotalXp) * 100} className="h-2" />
          </div>
          {formData.bonus_xp > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">XP Bônus da Jornada</span>
                <span className="font-medium text-primary">+{formData.bonus_xp}</span>
              </div>
              <Progress value={(formData.bonus_xp / grandTotalXp) * 100} className="h-2 bg-primary/20 [&>div]:bg-primary" />
            </div>
          )}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de XP</span>
              <span className="text-lg font-bold text-primary">{grandTotalXp}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Fluxo de Treinamentos
            <Badge variant="outline" className="ml-auto text-xs">
              {formData.order_type === 'sequential' ? 'Sequencial' : 'Flexível'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.trainings.map((jt, index) => {
              const training = trainings.find(t => t.id === jt.training_id);
              if (!training) return null;

              return (
                <div key={jt.training_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{training.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {training.estimated_hours || 0}h • {training.xp_reward || 0} XP
                      {!jt.is_required && " • Opcional"}
                    </p>
                  </div>
                  {formData.order_type === 'sequential' && index < formData.trainings.length - 1 && (
                    <div className="absolute left-4 mt-8 w-0.5 h-4 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Categories covered */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Categorias Abordadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
