/**
 * RewardsStep - Recompensas bônus da jornada
 */

import { useState, useEffect } from "react";
import { Sparkles, Award, Coins, Gift, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInsignias } from "@/hooks/useInsignias";
import { useOrganization } from "@/hooks/useOrganization";
import { useEvolutionTemplates } from "@/hooks/useEvolutionTemplates";
import type { JourneyFormData } from "../JourneyWizard";

interface RewardsStepProps {
  formData: JourneyFormData;
  updateFormData: (updates: Partial<JourneyFormData>) => void;
}

export function RewardsStep({ formData, updateFormData }: RewardsStepProps) {
  const { currentOrg } = useOrganization();
  const { insignias } = useInsignias();
  const { templates } = useEvolutionTemplates(currentOrg?.id);
  
  const [useTemplate, setUseTemplate] = useState(!!formData.evolution_template_id);

  const selectedTemplate = templates.find(t => t.id === formData.evolution_template_id);

  // When template is selected, auto-fill suggested rewards
  useEffect(() => {
    if (selectedTemplate && useTemplate) {
      updateFormData({
        bonus_xp: selectedTemplate.suggested_xp,
        bonus_coins: selectedTemplate.suggested_coins,
      });
    }
  }, [selectedTemplate?.id, useTemplate]);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      updateFormData({ evolution_template_id: null });
      setUseTemplate(false);
    } else {
      updateFormData({ evolution_template_id: templateId });
      setUseTemplate(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Gift className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold">Recompensas Bônus da Jornada</h2>
        <p className="text-sm text-muted-foreground">
          Configure recompensas adicionais para quando o usuário completar toda a jornada
        </p>
      </div>

      {/* Evolution Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Template de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Usar Template (opcional)</Label>
            <Select 
              value={formData.evolution_template_id || "none"} 
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.suggested_xp} XP, {template.suggested_coins} moedas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Templates definem automaticamente XP e moedas sugeridas
            </p>
          </div>

          {selectedTemplate && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">{selectedTemplate.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedTemplate.category} • {selectedTemplate.level} • {selectedTemplate.importance}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* XP and Coins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              XP Bônus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min={0}
              value={formData.bonus_xp}
              onChange={(e) => updateFormData({ bonus_xp: parseInt(e.target.value) || 0 })}
              className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Ganho adicional ao completar a jornada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Moedas Bônus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min={0}
              value={formData.bonus_coins}
              onChange={(e) => updateFormData({ bonus_coins: parseInt(e.target.value) || 0 })}
              className="text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Moedas adicionais ao completar a jornada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insignia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Insígnia Exclusiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Insígnia de Conclusão</Label>
            <Select 
              value={formData.bonus_insignia_id || "none"} 
              onValueChange={(v) => updateFormData({ bonus_insignia_id: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma insígnia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma insígnia</SelectItem>
                {insignias.map(insignia => (
                  <SelectItem key={insignia.id} value={insignia.id}>
                    {insignia.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Insígnia especial concedida ao completar toda a jornada
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Certificate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-500" />
            Certificado de Jornada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Gerar Certificado</Label>
              <p className="text-xs text-muted-foreground">
                Emitir certificado ao completar a jornada
              </p>
            </div>
            <Switch
              checked={formData.generates_certificate}
              onCheckedChange={(v) => updateFormData({ generates_certificate: v })}
            />
          </div>

          {formData.generates_certificate && (
            <div className="space-y-2">
              <Label htmlFor="certificate_name">Nome do Certificado</Label>
              <Input
                id="certificate_name"
                placeholder="Ex: Certificado de Vendas Iniciante"
                value={formData.certificate_name}
                onChange={(e) => updateFormData({ certificate_name: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <Card className="bg-gradient-to-br from-primary/5 to-amber-500/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-center mb-3">Resumo das Recompensas Bônus</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formData.bonus_xp}</p>
              <p className="text-xs text-muted-foreground">XP Bônus</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{formData.bonus_coins}</p>
              <p className="text-xs text-muted-foreground">Moedas</p>
            </div>
            {formData.bonus_insignia_id && (
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto text-amber-500" />
                <p className="text-xs text-muted-foreground">Insígnia</p>
              </div>
            )}
            {formData.generates_certificate && (
              <div className="text-center">
                <FileCheck className="h-8 w-8 mx-auto text-emerald-500" />
                <p className="text-xs text-muted-foreground">Certificado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
