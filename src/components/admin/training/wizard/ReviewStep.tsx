/**
 * ReviewStep - Step 3: Revisão final
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Gift,
  Award,
  Clock,
  Sparkles,
  Coins,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import type { TrainingFormData, SkillImpact, InsigniaRelation } from "../TrainingWizard";

interface ReviewStepProps {
  formData: TrainingFormData;
  skillImpacts: SkillImpact[];
  insigniaRelations: InsigniaRelation[];
  availableSkills: Array<{id: string; name: string; icon: string}>;
  availableInsignias: Array<{id: string; name: string; icon: string}>;
}

const CATEGORIES: Record<string, string> = {
  general: "Geral",
  sales: "Vendas",
  leadership: "Liderança",
  technical: "Técnico",
  compliance: "Compliance",
  onboarding: "Onboarding",
  soft_skills: "Soft Skills",
};

const DIFFICULTIES: Record<string, { label: string; color: string }> = {
  beginner: { label: "Iniciante", color: "bg-emerald-500/10 text-emerald-500" },
  intermediate: { label: "Intermediário", color: "bg-amber-500/10 text-amber-500" },
  advanced: { label: "Avançado", color: "bg-orange-500/10 text-orange-500" },
  expert: { label: "Expert", color: "bg-red-500/10 text-red-500" },
};

const RELATION_TYPES: Record<string, string> = {
  unlocks: "Desbloqueia",
  required: "Requerido",
  recommended: "Recomendado",
};

export function ReviewStep({ 
  formData, 
  skillImpacts, 
  insigniaRelations,
  availableSkills,
  availableInsignias,
}: ReviewStepProps) {
  const difficulty = DIFFICULTIES[formData.difficulty];

  return (
    <div className="space-y-6">
      {/* Header Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {formData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {formData.name || "Nome do Treinamento"}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {formData.description || "Sem descrição"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{CATEGORIES[formData.category] || formData.category}</Badge>
                <Badge className={difficulty?.color}>{difficulty?.label}</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {formData.estimated_hours}h
                </Badge>
                {formData.is_onboarding && (
                  <Badge variant="secondary">Onboarding</Badge>
                )}
                {formData.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <XCircle className="w-3 h-3" />
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-lg font-bold">{formData.xp_reward}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Coins className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-lg font-bold">{formData.coins_reward}</div>
                <div className="text-xs text-muted-foreground">Moedas</div>
              </div>
            </div>
          </div>

          {skillImpacts.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Skills Impactadas
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillImpacts.map((impact) => {
                    const skill = availableSkills.find(s => s.id === impact.skillId);
                    return (
                      <Badge key={impact.skillId} variant="outline" className="gap-1">
                        <span>{skill?.icon}</span>
                        <span>{skill?.name}</span>
                        <span className="text-primary">({impact.weight}%)</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {insigniaRelations.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Insígnias Relacionadas
                </div>
                <div className="flex flex-wrap gap-2">
                  {insigniaRelations.map((relation) => {
                    const insignia = availableInsignias.find(i => i.id === relation.insigniaId);
                    return (
                      <Badge key={relation.insigniaId} variant="outline" className="gap-1">
                        <span>{insignia?.icon}</span>
                        <span>{insignia?.name}</span>
                        <span className="text-muted-foreground">
                          ({RELATION_TYPES[relation.relationType]})
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ready Message */}
      <div className="text-center py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">Tudo pronto!</h3>
        <p className="text-sm text-muted-foreground">
          Revise as informações acima e clique em salvar.
        </p>
      </div>
    </div>
  );
}
