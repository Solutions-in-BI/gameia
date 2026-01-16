/**
 * BasicInfoStep - Step 1: Informações básicas do treinamento
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Palette,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TrainingFormData } from "../TrainingWizard";
import { getDifficultyColors, SELECTABLE_COLORS } from "@/constants/colors";

interface BasicInfoStepProps {
  formData: TrainingFormData;
  setFormData: React.Dispatch<React.SetStateAction<TrainingFormData>>;
}

const CATEGORIES = [
  { value: "general", label: "Geral" },
  { value: "sales", label: "Vendas" },
  { value: "leadership", label: "Liderança" },
  { value: "technical", label: "Técnico" },
  { value: "compliance", label: "Compliance" },
  { value: "onboarding", label: "Onboarding" },
  { value: "soft_skills", label: "Soft Skills" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "expert", label: "Expert" },
];

const EMOJIS = [
  "📚", "🎯", "🚀", "💡", "🎓", "📊", "💼", "🏆", 
  "⭐", "🔥", "💪", "🎨", "🔧", "📱", "💻", "🌟"
];

export function BasicInfoStep({ formData, setFormData }: BasicInfoStepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `training-thumbnails/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("training-media")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("training-media")
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Type */}
      <div className="space-y-2">
        <Label>Tipo de Treinamento *</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, training_type: 'traditional' }))}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.training_type !== 'book_guided'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">Tradicional</div>
            <p className="text-xs text-muted-foreground">
              Vídeos, textos, quizzes e jogos
            </p>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, training_type: 'book_guided' }))}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.training_type === 'book_guided'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-2">📖</div>
            <div className="font-medium">Guiado por Livro</div>
            <p className="text-xs text-muted-foreground">
              Leitura + reflexão IA + aplicação prática
            </p>
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Treinamento *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Fundamentos de Vendas"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva o conteúdo e objetivos do treinamento"
          rows={3}
        />
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ícone</Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-muted/30">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                  formData.icon === emoji 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "hover:bg-muted"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Cor
          </Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-muted/30">
            {SELECTABLE_COLORS.map((colorObj) => (
              <button
                key={colorObj.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: colorObj.value }))}
                className={`w-8 h-8 rounded-lg transition-all ${colorObj.preview} ${
                  formData.color === colorObj.value ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category & Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Dificuldade</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((diff) => {
                const diffColors = getDifficultyColors(diff.value);
                return (
                  <SelectItem key={diff.value} value={diff.value}>
                    <span className={diffColors.text}>{diff.label}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-2">
        <Label htmlFor="estimated_hours">Duração Estimada (horas)</Label>
        <Input
          id="estimated_hours"
          type="number"
          min="0.5"
          step="0.5"
          value={formData.estimated_hours}
          onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Thumbnail (opcional)</Label>
        {formData.thumbnail_url ? (
          <div className="relative inline-block">
            <img
              src={formData.thumbnail_url}
              alt="Thumbnail"
              className="w-48 h-28 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6"
              onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-48 h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">
                {isUploading ? "Enviando..." : "Upload"}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <Label>Treinamento Ativo</Label>
            <p className="text-xs text-muted-foreground">Visível para os colaboradores</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Treinamento de Onboarding</Label>
            <p className="text-xs text-muted-foreground">Exibido para novos colaboradores</p>
          </div>
          <Switch
            checked={formData.is_onboarding}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_onboarding: checked }))}
          />
        </div>
      </div>
    </div>
  );
}
