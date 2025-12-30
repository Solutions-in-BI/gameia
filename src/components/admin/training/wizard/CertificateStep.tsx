/**
 * CertificateStep - Configuração de certificado do treinamento
 */

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
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  CheckCircle2, 
  Target,
  Medal,
  FileCheck,
  Percent,
} from "lucide-react";

interface Insignia {
  id: string;
  name: string;
  icon: string;
}

interface CertificateFormData {
  certificate_enabled: boolean;
  certificate_min_score: number;
  require_full_completion: boolean;
  insignia_reward_id: string | null;
}

interface CertificateStepProps {
  formData: CertificateFormData;
  setFormData: (data: CertificateFormData | ((prev: CertificateFormData) => CertificateFormData)) => void;
  availableInsignias: Insignia[];
}

export function CertificateStep({ formData, setFormData, availableInsignias }: CertificateStepProps) {
  const selectedInsignia = availableInsignias.find(i => i.id === formData.insignia_reward_id);

  return (
    <div className="space-y-6">
      {/* Certificate Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.certificate_enabled ? 'bg-primary/10' : 'bg-muted'}`}>
            <Award className={`w-6 h-6 ${formData.certificate_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <Label className="font-semibold text-base">Gerar Certificado</Label>
            <p className="text-sm text-muted-foreground">
              Emitir certificado de conclusão para aprovados
            </p>
          </div>
        </div>
        <Switch
          checked={formData.certificate_enabled}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, certificate_enabled: checked }))}
        />
      </div>

      {formData.certificate_enabled && (
        <>
          {/* Approval Criteria */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Critérios de Aprovação
            </h3>

            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-6">
              {/* Minimum Score */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-medium">Pontuação Mínima</Label>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold px-3">
                    {formData.certificate_min_score}%
                  </Badge>
                </div>
                
                <Slider
                  value={[formData.certificate_min_score]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, certificate_min_score: value }))}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50% (Mínimo)</span>
                  <span>100% (Perfeito)</span>
                </div>
              </div>

              {/* Full Completion Required */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Conclusão Total Obrigatória</Label>
                    <p className="text-xs text-muted-foreground">
                      Todos os módulos devem ser concluídos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.require_full_completion}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, require_full_completion: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Insignia Reward */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Medal className="w-4 h-4 text-primary" />
              Insígnia de Conclusão
              <Badge variant="outline" className="ml-1 text-xs">Opcional</Badge>
            </h3>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <Select 
                value={formData.insignia_reward_id || "none"} 
                onValueChange={(value) => 
                  setFormData((prev) => ({ 
                    ...prev, 
                    insignia_reward_id: value === "none" ? null : value 
                  }))
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Selecione uma insígnia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">Nenhuma insígnia</span>
                  </SelectItem>
                  {availableInsignias.map((insignia) => (
                    <SelectItem key={insignia.id} value={insignia.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{insignia.icon}</span>
                        <span>{insignia.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedInsignia && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {selectedInsignia.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedInsignia.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Será concedida ao concluir com sucesso
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Resumo dos Critérios
            </h3>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Pontuação mínima de <strong>{formData.certificate_min_score}%</strong></span>
                </div>
                {formData.require_full_completion && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Conclusão de <strong>100%</strong> dos módulos</span>
                  </div>
                )}
                {selectedInsignia && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Recebe insígnia <strong>{selectedInsignia.icon} {selectedInsignia.name}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!formData.certificate_enabled && (
        <div className="p-8 rounded-lg border border-dashed border-muted-foreground/30 text-center">
          <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Este treinamento não emitirá certificado de conclusão.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ative a opção acima para configurar os critérios.
          </p>
        </div>
      )}
    </div>
  );
}
