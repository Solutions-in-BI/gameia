/**
 * CertificationStep - Step 3: Configuração de certificado
 */

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
import { 
  Award,
  Calendar,
  Target,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import type { TrainingFormData } from "../TrainingWizard";

interface CertificationStepProps {
  formData: TrainingFormData;
  setFormData: React.Dispatch<React.SetStateAction<TrainingFormData>>;
}

const CERTIFICATE_TYPES = [
  { value: "internal", label: "Interno", description: "Certificado da empresa" },
  { value: "external", label: "Externo", description: "Certificado de parceiro" },
  { value: "compliance", label: "Compliance", description: "Certificação obrigatória" },
];

const VALIDITY_OPTIONS = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "1 ano" },
  { value: 24, label: "2 anos" },
  { value: 36, label: "3 anos" },
  { value: 0, label: "Sem validade" },
];

export function CertificationStep({ formData, setFormData }: CertificationStepProps) {
  const hasCertificate = formData.certificate_name !== "";

  return (
    <div className="space-y-6">
      {/* Enable Certificate */}
      <Card className={hasCertificate ? "border-primary/50" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-primary" />
              Gerar Certificado
            </CardTitle>
            <Switch
              checked={hasCertificate}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFormData(prev => ({ 
                    ...prev, 
                    certificate_name: prev.name ? `Certificado - ${prev.name}` : "Certificado" 
                  }));
                } else {
                  setFormData(prev => ({ ...prev, certificate_name: "" }));
                }
              }}
            />
          </div>
        </CardHeader>
        {hasCertificate && (
          <CardContent className="space-y-4">
            {/* Certificate Name */}
            <div className="space-y-2">
              <Label htmlFor="certificate_name">Nome do Certificado</Label>
              <Input
                id="certificate_name"
                value={formData.certificate_name}
                onChange={(e) => setFormData(prev => ({ ...prev, certificate_name: e.target.value }))}
                placeholder="Ex: Certificado de Vendas Avançado"
              />
            </div>

            {/* Certificate Type */}
            <div className="space-y-2">
              <Label>Tipo de Certificado</Label>
              <div className="grid grid-cols-3 gap-3">
                {CERTIFICATE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, certificate_type: type.value }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.certificate_type === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Validade
                </Label>
                <Select 
                  value={String(formData.certificate_validity_months)} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    certificate_validity_months: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Score Mínimo (%)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.min_score_for_certificate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    min_score_for_certificate: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            {/* Requires Checkpoint */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>Requer Checkpoint</Label>
                  <p className="text-xs text-muted-foreground">
                    Avaliação final obrigatória para certificar
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.requires_checkpoint}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  requires_checkpoint: checked 
                }))}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Info Card */}
      {!hasCertificate && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">
              Certificados são opcionais
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ative esta opção se deseja gerar um certificado de conclusão 
              para os colaboradores que finalizarem o treinamento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
