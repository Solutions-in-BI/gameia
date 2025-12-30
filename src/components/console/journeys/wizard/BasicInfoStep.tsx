/**
 * BasicInfoStep - Informações básicas da jornada
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JOURNEY_CATEGORIES, JOURNEY_LEVELS, JOURNEY_IMPORTANCE } from "@/hooks/useTrainingJourneys";
import type { JourneyFormData } from "../JourneyWizard";

interface BasicInfoStepProps {
  formData: JourneyFormData;
  updateFormData: (updates: Partial<JourneyFormData>) => void;
  isEditing: boolean;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#3b82f6", // blue
];

export function BasicInfoStep({ formData, updateFormData, isEditing }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Nome e Key */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Jornada *</Label>
          <Input
            id="name"
            placeholder="Ex: Vendas Iniciante"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="journey_key">Identificador (key) *</Label>
          <Input
            id="journey_key"
            placeholder="vendas_iniciante"
            value={formData.journey_key}
            onChange={(e) => updateFormData({ journey_key: e.target.value })}
            disabled={isEditing}
            className={isEditing ? "opacity-60" : ""}
          />
          <p className="text-xs text-muted-foreground">
            {isEditing ? "Não pode ser alterado após criação" : "Será gerado automaticamente a partir do nome"}
          </p>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva o objetivo e benefícios desta jornada de desenvolvimento..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Categoria e Nível */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select value={formData.category} onValueChange={(v) => updateFormData({ category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {JOURNEY_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nível *</Label>
          <Select value={formData.level} onValueChange={(v) => updateFormData({ level: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {JOURNEY_LEVELS.map(lvl => (
                <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Importância */}
      <div className="space-y-3">
        <Label>Importância</Label>
        <RadioGroup
          value={formData.importance}
          onValueChange={(v) => updateFormData({ importance: v })}
          className="flex flex-wrap gap-4"
        >
          {JOURNEY_IMPORTANCE.map(imp => (
            <div key={imp.value} className="flex items-center space-x-2">
              <RadioGroupItem value={imp.value} id={`importance-${imp.value}`} />
              <Label htmlFor={`importance-${imp.value}`} className="font-normal cursor-pointer">
                {imp.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Cor */}
      <div className="space-y-3">
        <Label>Cor do Tema</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => updateFormData({ color })}
              className="w-8 h-8 rounded-lg transition-all hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow: formData.color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Tipo de Ordem */}
      <div className="space-y-3">
        <Label>Ordem dos Treinamentos</Label>
        <RadioGroup
          value={formData.order_type}
          onValueChange={(v) => updateFormData({ order_type: v as 'sequential' | 'flexible' })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <label
            htmlFor="order-sequential"
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              formData.order_type === 'sequential' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="sequential" id="order-sequential" className="mt-1" />
            <div>
              <p className="font-medium">Sequencial</p>
              <p className="text-sm text-muted-foreground">
                Treinamentos devem ser concluídos na ordem definida
              </p>
            </div>
          </label>
          <label
            htmlFor="order-flexible"
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              formData.order_type === 'flexible' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value="flexible" id="order-flexible" className="mt-1" />
            <div>
              <p className="font-medium">Flexível</p>
              <p className="text-sm text-muted-foreground">
                Usuário pode fazer os treinamentos em qualquer ordem
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}
