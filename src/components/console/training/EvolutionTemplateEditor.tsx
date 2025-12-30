/**
 * EvolutionTemplateEditor - Modal para criar/editar templates de evolução
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Check, Sparkles } from "lucide-react";
import { 
  EvolutionTemplate, 
  CATEGORY_LABELS, 
  LEVEL_LABELS, 
  IMPORTANCE_LABELS,
  TemplateCategory,
  TemplateLevel,
  TemplateImportance,
} from "@/hooks/useEvolutionTemplates";

interface EvolutionTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template: EvolutionTemplate | null;
  onSave: (data: Partial<EvolutionTemplate>) => Promise<void>;
}

export function EvolutionTemplateEditor({
  isOpen,
  onClose,
  template,
  onSave,
}: EvolutionTemplateEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "vendas" as TemplateCategory,
    level: "basico" as TemplateLevel,
    importance: "complementar" as TemplateImportance,
    generates_certificate: false,
    certificate_min_score: 80,
    suggested_xp: 100,
    suggested_coins: 50,
    skill_impacts: [] as { skill_id: string; weight: number }[],
    insignia_ids: [] as string[],
  });

  const isReadOnly = template?.is_default ?? false;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category as TemplateCategory,
        level: template.level as TemplateLevel,
        importance: template.importance as TemplateImportance,
        generates_certificate: template.generates_certificate,
        certificate_min_score: template.certificate_min_score,
        suggested_xp: template.suggested_xp,
        suggested_coins: template.suggested_coins,
        skill_impacts: template.skill_impacts || [],
        insignia_ids: template.insignia_ids || [],
      });
    } else {
      setFormData({
        name: "",
        category: "vendas",
        level: "basico",
        importance: "complementar",
        generates_certificate: false,
        certificate_min_score: 80,
        suggested_xp: 100,
        suggested_coins: 50,
        skill_impacts: [],
        insignia_ids: [],
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate name when category/level changes
  useEffect(() => {
    if (!template && formData.category && formData.level) {
      const categoryLabel = CATEGORY_LABELS[formData.category];
      const levelLabel = LEVEL_LABELS[formData.level];
      setFormData(prev => ({
        ...prev,
        name: `${categoryLabel} ${levelLabel}`,
      }));
    }
  }, [formData.category, formData.level, template]);

  // Auto-adjust suggested rewards based on level and importance
  useEffect(() => {
    if (!template) {
      const levelMultiplier = {
        basico: 1,
        intermediario: 1.5,
        avancado: 2.5,
        especialista: 4,
      }[formData.level] || 1;

      const importanceMultiplier = {
        complementar: 1,
        estrategico: 1.5,
        essencial: 2,
      }[formData.importance] || 1;

      const baseXp = 50;
      const baseCoins = 25;

      setFormData(prev => ({
        ...prev,
        suggested_xp: Math.round(baseXp * levelMultiplier * importanceMultiplier),
        suggested_coins: Math.round(baseCoins * levelMultiplier * importanceMultiplier),
        generates_certificate: formData.level !== 'basico' || formData.importance === 'essencial',
      }));
    }
  }, [formData.level, formData.importance, template]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {template ? (isReadOnly ? "Detalhes do Template" : "Editar Template") : "Novo Template"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly 
              ? "Este é um template padrão do sistema" 
              : "Configure as regras de evolução automática"
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Vendas Avançado"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as TemplateCategory }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nível</Label>
                <Select
                  value={formData.level}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, level: v as TemplateLevel }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Importância</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, importance: v as TemplateImportance }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(IMPORTANCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Certificate Settings */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gera Certificado</Label>
                  <p className="text-sm text-muted-foreground">
                    Treinamentos com este template emitirão certificado ao concluir
                  </p>
                </div>
                <Switch
                  checked={formData.generates_certificate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, generates_certificate: checked }))}
                  disabled={isReadOnly}
                />
              </div>

              {formData.generates_certificate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Pontuação mínima para certificado</Label>
                    <span className="text-sm font-medium">{formData.certificate_min_score}%</span>
                  </div>
                  <Slider
                    value={[formData.certificate_min_score]}
                    onValueChange={([v]) => setFormData(prev => ({ ...prev, certificate_min_score: v }))}
                    min={50}
                    max={100}
                    step={5}
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </div>

            {/* Rewards */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Recompensas Sugeridas</h3>
              <p className="text-sm text-muted-foreground -mt-2">
                Valores base que serão aplicados automaticamente aos treinamentos
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>XP Base</Label>
                    <span className="text-sm font-medium text-primary">{formData.suggested_xp} XP</span>
                  </div>
                  <Slider
                    value={[formData.suggested_xp]}
                    onValueChange={([v]) => setFormData(prev => ({ ...prev, suggested_xp: v }))}
                    min={10}
                    max={500}
                    step={10}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Moedas Base</Label>
                    <span className="text-sm font-medium text-amber-500">{formData.suggested_coins} 🪙</span>
                  </div>
                  <Slider
                    value={[formData.suggested_coins]}
                    onValueChange={([v]) => setFormData(prev => ({ ...prev, suggested_coins: v }))}
                    min={5}
                    max={250}
                    step={5}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Skills and Insignias - Placeholder for future enhancement */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <h3 className="font-medium text-foreground mb-2">Skills e Insígnias</h3>
              <p className="text-sm text-muted-foreground">
                A configuração de skills impactadas e insígnias concedidas estará disponível em breve. 
                Por enquanto, estas serão definidas manualmente em cada treinamento.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <Button variant="ghost" onClick={onClose}>
            {isReadOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {template ? "Salvar" : "Criar Template"}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
