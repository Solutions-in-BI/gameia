/**
 * EvolutionTemplateSection - Seção para selecionar template de evolução como recompensa
 * Usado em CreateChallengeModal e TrainingWizard
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  Sparkles,
  Award,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useEvolutionTemplates,
  CATEGORY_LABELS,
  LEVEL_LABELS,
  IMPORTANCE_LABELS,
  type EvolutionTemplate,
} from "@/hooks/useEvolutionTemplates";
import { useOrganization } from "@/hooks/useOrganization";

interface EvolutionTemplateSectionProps {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

export function EvolutionTemplateSection({
  selectedTemplateId,
  setSelectedTemplateId,
}: EvolutionTemplateSectionProps) {
  const { currentOrg } = useOrganization();
  const { templates, isLoading } = useEvolutionTemplates(currentOrg?.id);
  const [selectedTemplate, setSelectedTemplate] = useState<EvolutionTemplate | null>(null);

  // Atualizar template selecionado quando ID mudar
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const handleTemplateChange = (value: string) => {
    if (value === "none") {
      setSelectedTemplateId(null);
    } else {
      setSelectedTemplateId(value);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basico": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediario": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "avancado": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "especialista": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "essencial": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "estrategico": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "complementar": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Layers className="w-3 h-3" />
          Template de Evolução
        </Label>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Selecione um Template</Label>
            <Select
              value={selectedTemplateId || "none"}
              onValueChange={handleTemplateChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum template selecionado" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="none">
                  <span className="text-muted-foreground">Nenhum template</span>
                </SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{template.name}</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        {CATEGORY_LABELS[template.category as keyof typeof CATEGORY_LABELS] || template.category}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Templates definem automaticamente skills impactadas, recompensas sugeridas e configurações
            </p>
          </div>

          {/* Preview do template selecionado */}
          {selectedTemplate && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {selectedTemplate.name}
                </h4>
                <div className="flex gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getLevelColor(selectedTemplate.level))}
                  >
                    {LEVEL_LABELS[selectedTemplate.level as keyof typeof LEVEL_LABELS] || selectedTemplate.level}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getImportanceColor(selectedTemplate.importance))}
                  >
                    {IMPORTANCE_LABELS[selectedTemplate.importance as keyof typeof IMPORTANCE_LABELS] || selectedTemplate.importance}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground">XP Sugerido:</span>
                  <span className="font-medium">{selectedTemplate.suggested_xp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">Moedas:</span>
                  <span className="font-medium">{selectedTemplate.suggested_coins}</span>
                </div>
              </div>

              {selectedTemplate.skill_impacts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Skills Impactadas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.skill_impacts.map((impact, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {impact.weight * 100}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTemplate.generates_certificate && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Award className="w-3 h-3" />
                  Gera certificado (mín. {selectedTemplate.certificate_min_score}%)
                </div>
              )}

              {selectedTemplate.insignia_ids.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {selectedTemplate.insignia_ids.length} insígnia(s) vinculada(s)
                </div>
              )}
            </div>
          )}

          {!selectedTemplate && (
            <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border text-center">
              <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Selecione um template para aplicar configurações predefinidas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
