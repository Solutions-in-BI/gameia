/**
 * ReviewStep - Revisão final antes de criar/salvar a jornada
 */

import { Check, Route, BookOpen, Clock, Sparkles, Coins, Award, FileCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTrainings } from "@/hooks/useTrainings";
import { useInsignias } from "@/hooks/useInsignias";
import { useEvolutionTemplates } from "@/hooks/useEvolutionTemplates";
import { useOrganization } from "@/hooks/useOrganization";
import { JOURNEY_CATEGORIES, JOURNEY_LEVELS, JOURNEY_IMPORTANCE } from "@/hooks/useTrainingJourneys";
import type { JourneyFormData } from "../JourneyWizard";

interface ReviewStepProps {
  formData: JourneyFormData;
}

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function ReviewItem({ label, value, icon }: ReviewItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const { currentOrg } = useOrganization();
  const { trainings } = useTrainings(currentOrg?.id);
  const { insignias } = useInsignias();
  const { templates } = useEvolutionTemplates(currentOrg?.id);

  const categoryLabel = JOURNEY_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category;
  const levelLabel = JOURNEY_LEVELS.find(l => l.value === formData.level)?.label || formData.level;
  const importanceLabel = JOURNEY_IMPORTANCE.find(i => i.value === formData.importance)?.label || formData.importance;

  const selectedTrainings = formData.trainings.map(jt => {
    return trainings.find(t => t.id === jt.training_id);
  }).filter(Boolean);

  const totalHours = selectedTrainings.reduce((sum, t) => sum + (t?.estimated_hours || 0), 0);
  const totalXp = selectedTrainings.reduce((sum, t) => sum + (t?.xp_reward || 0), 0);
  const totalCoins = selectedTrainings.reduce((sum, t) => sum + (t?.coins_reward || 0), 0);

  const selectedInsignia = insignias.find(i => i.id === formData.bonus_insignia_id);
  const selectedTemplate = templates.find(t => t.id === formData.evolution_template_id);

  const requiredCount = formData.trainings.filter(t => t.is_required).length;
  const optionalCount = formData.trainings.length - requiredCount;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold">Revisão Final</h2>
        <p className="text-sm text-muted-foreground">
          Confira as informações antes de criar a jornada
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="h-4 w-4" style={{ color: formData.color }} />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ReviewItem label="Nome" value={formData.name} />
          <ReviewItem label="Identificador" value={<code className="text-xs bg-muted px-2 py-1 rounded">{formData.journey_key}</code>} />
          {formData.description && (
            <ReviewItem label="Descrição" value={formData.description} />
          )}
          <ReviewItem 
            label="Classificação" 
            value={
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{categoryLabel}</Badge>
                <Badge variant="outline">{levelLabel}</Badge>
                <Badge variant="outline">{importanceLabel}</Badge>
              </div>
            } 
          />
          <ReviewItem 
            label="Ordem" 
            value={formData.order_type === 'sequential' ? 'Sequencial (em ordem)' : 'Flexível (qualquer ordem)'} 
          />
        </CardContent>
      </Card>

      {/* Trainings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Treinamentos ({formData.trainings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {selectedTrainings.slice(0, 5).map((training, idx) => (
              <div key={training?.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </span>
                <span className="truncate">{training?.name}</span>
                {!formData.trainings[idx]?.is_required && (
                  <Badge variant="outline" className="text-xs shrink-0">Opcional</Badge>
                )}
              </div>
            ))}
            {selectedTrainings.length > 5 && (
              <p className="text-sm text-muted-foreground pl-7">
                +{selectedTrainings.length - 5} treinamento(s) adicional(is)
              </p>
            )}
          </div>
          
          <Separator className="my-3" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{requiredCount}</p>
              <p className="text-xs text-muted-foreground">Obrigatórios</p>
            </div>
            <div>
              <p className="text-lg font-bold">{optionalCount}</p>
              <p className="text-xs text-muted-foreground">Opcionais</p>
            </div>
            <div>
              <p className="text-lg font-bold">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recompensas Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-primary/5 rounded-lg">
              <Sparkles className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-primary">{totalXp + formData.bonus_xp}</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
              {formData.bonus_xp > 0 && (
                <p className="text-xs text-primary/70">+{formData.bonus_xp} bônus</p>
              )}
            </div>
            <div className="p-3 bg-amber-500/5 rounded-lg">
              <Coins className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold text-amber-500">{totalCoins + formData.bonus_coins}</p>
              <p className="text-xs text-muted-foreground">Moedas Total</p>
              {formData.bonus_coins > 0 && (
                <p className="text-xs text-amber-500/70">+{formData.bonus_coins} bônus</p>
              )}
            </div>
            {selectedInsignia && (
              <div className="p-3 bg-amber-500/5 rounded-lg">
                <Award className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                <p className="text-sm font-medium truncate">{selectedInsignia.name}</p>
                <p className="text-xs text-muted-foreground">Insígnia</p>
              </div>
            )}
            {formData.generates_certificate && (
              <div className="p-3 bg-emerald-500/5 rounded-lg">
                <FileCheck className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-sm font-medium">Certificado</p>
                <p className="text-xs text-muted-foreground truncate">{formData.certificate_name || "Jornada"}</p>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Template de Evolução</p>
              <p className="font-medium">{selectedTemplate.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      {formData.trainings.length === 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-600">Nenhum treinamento selecionado</p>
              <p className="text-sm text-muted-foreground">
                Volte ao passo 2 para adicionar treinamentos à jornada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
