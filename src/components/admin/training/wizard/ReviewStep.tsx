/**
 * ReviewStep - Step 5: Revisão final completa
 * Atualizado com seções de Distribuição e Certificado
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
  Users,
  Target,
  CalendarDays,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import type { 
  TrainingFormData, 
  SkillImpact, 
  InsigniaRelation,
  DistributionFormData,
  CertificateFormData,
} from "../TrainingWizard";
import type { OrgTeam } from "@/hooks/useOrgTeams";

interface ReviewStepProps {
  formData: TrainingFormData;
  distributionData: DistributionFormData;
  certificateData: CertificateFormData;
  skillImpacts: SkillImpact[];
  insigniaRelations: InsigniaRelation[];
  availableSkills: Array<{id: string; name: string; icon: string}>;
  availableInsignias: Array<{id: string; name: string; icon: string}>;
  teams: OrgTeam[];
  xpMultiplier: number;
  coinsMultiplier: number;
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

const REQUIREMENT_TYPES: Record<string, { label: string; color: string }> = {
  optional: { label: "Opcional", color: "bg-muted text-muted-foreground" },
  recommended: { label: "Recomendado", color: "bg-blue-500/10 text-blue-600" },
  mandatory: { label: "Obrigatório", color: "bg-amber-500/10 text-amber-600" },
};

export function ReviewStep({ 
  formData, 
  distributionData,
  certificateData,
  skillImpacts, 
  insigniaRelations,
  availableSkills,
  availableInsignias,
  teams,
  xpMultiplier,
  coinsMultiplier,
}: ReviewStepProps) {
  const difficulty = DIFFICULTIES[formData.difficulty];
  const requirement = REQUIREMENT_TYPES[distributionData.requirement_type];
  const selectedTeams = teams.filter(t => distributionData.team_ids.includes(t.id));
  const selectedInsignia = availableInsignias.find(i => i.id === certificateData.insignia_reward_id);

  // Calculate totals
  const estimatedXp = Math.round(formData.xp_reward * xpMultiplier);
  const estimatedCoins = Math.round(formData.coins_reward * coinsMultiplier);

  return (
    <div className="space-y-4">
      {/* Header Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {formData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground mb-1">
                {formData.name || "Nome do Treinamento"}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {formData.description || "Sem descrição"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-xs">{CATEGORIES[formData.category] || formData.category}</Badge>
                <Badge className={`text-xs ${difficulty?.color}`}>{difficulty?.label}</Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {formData.estimated_hours}h
                </Badge>
                {distributionData.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
                    <XCircle className="w-3 h-3" />
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Summary */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Requisito</span>
              </div>
              <Badge className={`${requirement?.color} text-xs`}>
                {requirement?.label}
              </Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Público</span>
              </div>
              <span className="text-sm font-medium">
                {selectedTeams.length === 0 ? "Todas as equipes" : `${selectedTeams.length} equipe(s)`}
              </span>
            </div>
          </div>

          {distributionData.is_onboarding && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Incluído no Onboarding</span>
            </div>
          )}

          {distributionData.deadline_days && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Prazo: <strong>{distributionData.deadline_days} dias</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Summary */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-base font-bold text-purple-600">{estimatedXp}</div>
                <div className="text-xs text-muted-foreground">XP ({xpMultiplier}x)</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Coins className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-base font-bold text-amber-600">{estimatedCoins}</div>
                <div className="text-xs text-muted-foreground">Moedas ({coinsMultiplier}x)</div>
              </div>
            </div>
          </div>

          {(xpMultiplier !== 1 || coinsMultiplier !== 1) && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>Base: {formData.xp_reward} XP + {formData.coins_reward} moedas</span>
            </div>
          )}

          {skillImpacts.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Skills Impactadas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillImpacts.map((impact) => {
                    const skill = availableSkills.find(s => s.id === impact.skillId);
                    return (
                      <Badge key={impact.skillId} variant="outline" className="gap-1 text-xs">
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
                <div className="text-xs font-medium mb-2 flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  Insígnias Relacionadas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {insigniaRelations.map((relation) => {
                    const insignia = availableInsignias.find(i => i.id === relation.insigniaId);
                    return (
                      <Badge key={relation.insigniaId} variant="outline" className="gap-1 text-xs">
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

      {/* Certificate Summary */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {certificateData.certificate_enabled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Certificado habilitado</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <FileCheck className="w-4 h-4 text-muted-foreground" />
                  <span>Pontuação mínima: <strong>{certificateData.certificate_min_score}%</strong></span>
                </div>
                {certificateData.require_full_completion && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span>100% conclusão</span>
                  </div>
                )}
              </div>
              {selectedInsignia && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-lg">{selectedInsignia.icon}</span>
                  <span className="text-sm">Concede: <strong>{selectedInsignia.name}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-muted-foreground">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">Sem certificado</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready Message */}
      <div className="text-center py-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h3 className="font-semibold text-foreground">Tudo pronto!</h3>
        <p className="text-sm text-muted-foreground">
          Revise as informações e clique em salvar.
        </p>
      </div>
    </div>
  );
}
