/**
 * TrainingFormModal - Modal para criar/editar treinamentos
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/hooks/useTrainings";

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training | null;
  onSave: (data: Partial<Training>) => Promise<void>;
}

const ICONS = ["📚", "🎓", "💼", "🚀", "💡", "🎯", "⚡", "🔥", "🏆", "📈", "🛡️", "⚙️", "🤝", "💬", "📱", "🖥️"];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const CATEGORIES = ["Onboarding", "Vendas", "Liderança", "Técnico", "Soft Skills", "Compliance", "Produto"];
const DIFFICULTIES = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "expert", label: "Expert" },
];

export function TrainingFormModal({
  isOpen,
  onClose,
  training,
  onSave,
}: TrainingFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    training_key: "",
    name: "",
    description: "",
    category: "Onboarding",
    difficulty: "beginner",
    icon: "📚",
    color: "#3b82f6",
    estimated_hours: 1,
    xp_reward: 100,
    coins_reward: 50,
    is_active: true,
    is_onboarding: false,
    certificate_enabled: true,
    thumbnail_url: "",
  });

  useEffect(() => {
    if (training) {
      setFormData({
        training_key: training.training_key,
        name: training.name,
        description: training.description || "",
        category: training.category,
        difficulty: training.difficulty,
        icon: training.icon,
        color: training.color,
        estimated_hours: training.estimated_hours,
        xp_reward: training.xp_reward,
        coins_reward: training.coins_reward,
        is_active: training.is_active,
        is_onboarding: training.is_onboarding,
        certificate_enabled: training.certificate_enabled,
        thumbnail_url: training.thumbnail_url || "",
      });
    } else {
      setFormData({
        training_key: "",
        name: "",
        description: "",
        category: "Onboarding",
        difficulty: "beginner",
        icon: "📚",
        color: "#3b82f6",
        estimated_hours: 1,
        xp_reward: 100,
        coins_reward: 50,
        is_active: true,
        is_onboarding: false,
        certificate_enabled: true,
        thumbnail_url: "",
      });
    }
  }, [training]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: Partial<Training> = {
        ...formData,
        training_key: formData.training_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
      };
      await onSave(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileName = `thumbnails/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("training-media")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("training-media")
        .getPublicUrl(data.path);

      setFormData((prev) => ({ ...prev, thumbnail_url: urlData.publicUrl }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {training ? "Editar Treinamento" : "Novo Treinamento"}
          </DialogTitle>
          <DialogDescription>
            {training ? "Atualize os dados do treinamento" : "Preencha os dados para criar um novo treinamento"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                {formData.thumbnail_url ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Treinamento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Onboarding de Vendas"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo e objetivos do treinamento"
                rows={3}
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                        formData.icon === icon
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-primary"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, estimated_hours: parseFloat(e.target.value) }))
                }
              />
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xp_reward">XP ao Concluir</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  min="0"
                  value={formData.xp_reward}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, xp_reward: parseInt(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coins_reward">Moedas ao Concluir</Label>
                <Input
                  id="coins_reward"
                  type="number"
                  min="0"
                  value={formData.coins_reward}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coins_reward: parseInt(e.target.value) }))
                  }
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Treinamento visível para os colaboradores
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Treinamento de Onboarding</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibido para novos colaboradores
                  </p>
                </div>
                <Switch
                  checked={formData.is_onboarding}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_onboarding: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Certificado ao Concluir</Label>
                  <p className="text-xs text-muted-foreground">
                    Gera certificado automático
                  </p>
                </div>
                <Switch
                  checked={formData.certificate_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, certificate_enabled: checked }))
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {training ? "Salvar Alterações" : "Criar Treinamento"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
