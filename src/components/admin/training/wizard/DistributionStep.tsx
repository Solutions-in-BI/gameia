/**
 * DistributionStep - Configuração de distribuição do treinamento
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Power, 
  Users, 
  Clock, 
  Rocket,
  Target,
  CalendarDays,
} from "lucide-react";
import type { OrgTeam } from "@/hooks/useOrgTeams";

interface DistributionFormData {
  is_active: boolean;
  is_onboarding: boolean;
  requirement_type: 'optional' | 'recommended' | 'mandatory';
  team_ids: string[];
  deadline_days: number | null;
}

interface DistributionStepProps {
  formData: DistributionFormData;
  setFormData: (data: DistributionFormData | ((prev: DistributionFormData) => DistributionFormData)) => void;
  teams: OrgTeam[];
}

const REQUIREMENT_TYPES = [
  { value: 'optional', label: 'Opcional', description: 'Colaboradores podem escolher fazer', color: 'bg-muted text-muted-foreground' },
  { value: 'recommended', label: 'Recomendado', description: 'Sugerido para o público-alvo', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'mandatory', label: 'Obrigatório', description: 'Deve ser concluído pelo público-alvo', color: 'bg-amber-500/10 text-amber-600' },
];

export function DistributionStep({ formData, setFormData, teams }: DistributionStepProps) {
  const handleTeamToggle = (teamId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      team_ids: checked 
        ? [...prev.team_ids, teamId]
        : prev.team_ids.filter(id => id !== teamId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Power className="w-4 h-4 text-primary" />
          Status do Treinamento
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                <Power className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <Label className="font-medium">Ativo</Label>
                <p className="text-xs text-muted-foreground">Visível para colaboradores</p>
              </div>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.is_onboarding ? 'bg-primary/10' : 'bg-muted'}`}>
                <Rocket className={`w-5 h-5 ${formData.is_onboarding ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <Label className="font-medium">Onboarding</Label>
                <p className="text-xs text-muted-foreground">Incluir na jornada inicial</p>
              </div>
            </div>
            <Switch
              checked={formData.is_onboarding}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_onboarding: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Requirement Type */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Tipo de Requisito
        </h3>

        <Select 
          value={formData.requirement_type} 
          onValueChange={(value: 'optional' | 'recommended' | 'mandatory') => 
            setFormData((prev) => ({ ...prev, requirement_type: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUIREMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={type.color}>
                    {type.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Audience */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Público-Alvo
          {formData.team_ids.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {formData.team_ids.length} equipe(s)
            </Badge>
          )}
        </h3>

        <div className="p-4 rounded-lg border border-border bg-muted/30">
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma equipe cadastrada. O treinamento estará disponível para todos.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border">
                <Checkbox
                  id="all-teams"
                  checked={formData.team_ids.length === 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData((prev) => ({ ...prev, team_ids: [] }));
                    }
                  }}
                />
                <Label htmlFor="all-teams" className="font-medium cursor-pointer">
                  Todas as equipes
                </Label>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    <Checkbox
                      id={team.id}
                      checked={formData.team_ids.includes(team.id)}
                      onCheckedChange={(checked) => handleTeamToggle(team.id, !!checked)}
                    />
                    <Label htmlFor={team.id} className="cursor-pointer flex items-center gap-2">
                      <span className="text-lg">{team.icon}</span>
                      <span>{team.name}</span>
                      {team.members_count !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {team.members_count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Prazo para Conclusão
          </h3>
          <Switch
            checked={formData.deadline_days !== null}
            onCheckedChange={(checked) => 
              setFormData((prev) => ({ ...prev, deadline_days: checked ? 30 : null }))
            }
          />
        </div>

        {formData.deadline_days !== null && (
          <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Dias após atribuição
                </span>
              </div>
              <Badge variant="secondary" className="text-lg font-semibold px-3">
                {formData.deadline_days} dias
              </Badge>
            </div>
            
            <Slider
              value={[formData.deadline_days]}
              onValueChange={([value]) => setFormData((prev) => ({ ...prev, deadline_days: value }))}
              min={7}
              max={180}
              step={7}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 semana</span>
              <span>6 meses</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
