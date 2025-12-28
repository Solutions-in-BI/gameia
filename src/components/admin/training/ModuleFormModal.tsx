/**
 * ModuleFormModal - Modal para criar/editar módulos
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Upload, X, Video, FileText, HelpCircle, FileIcon, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TrainingModule } from "@/hooks/useTrainings";
import { Progress } from "@/components/ui/progress";

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: TrainingModule | null;
  onSave: (data: Partial<TrainingModule>) => Promise<void>;
}

const CONTENT_TYPES = [
  { value: "video", label: "Vídeo", icon: Video },
  { value: "text", label: "Texto/Artigo", icon: FileText },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "pdf", label: "PDF", icon: FileIcon },
  { value: "link", label: "Link Externo", icon: Link },
];

export function ModuleFormModal({
  isOpen,
  onClose,
  module,
  onSave,
}: ModuleFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    module_key: "",
    name: "",
    description: "",
    content_type: "video",
    video_url: "",
    thumbnail_url: "",
    content_data: {} as Record<string, unknown>,
    time_minutes: 10,
    xp_reward: 25,
    coins_reward: 10,
    is_preview: false,
    requires_completion: true,
  });

  useEffect(() => {
    if (module) {
      setFormData({
        module_key: module.module_key,
        name: module.name,
        description: module.description || "",
        content_type: module.content_type,
        video_url: module.video_url || "",
        thumbnail_url: module.thumbnail_url || "",
        content_data: module.content_data || {},
        time_minutes: module.time_minutes,
        xp_reward: module.xp_reward,
        coins_reward: module.coins_reward,
        is_preview: module.is_preview,
        requires_completion: module.requires_completion,
      });
    } else {
      setFormData({
        module_key: "",
        name: "",
        description: "",
        content_type: "video",
        video_url: "",
        thumbnail_url: "",
        content_data: {},
        time_minutes: 10,
        xp_reward: 25,
        coins_reward: 10,
        is_preview: false,
        requires_completion: true,
      });
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: Partial<TrainingModule> = {
        ...formData,
        module_key: formData.module_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
      };
      await onSave(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const fileName = `videos/${Date.now()}_${file.name}`;
      
      // Simulate progress (actual tracking requires different approach)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.storage
        .from("training-media")
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("training-media")
        .getPublicUrl(data.path);

      setFormData((prev) => ({ ...prev, video_url: urlData.publicUrl }));
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileName = `module-thumbnails/${Date.now()}_${file.name}`;
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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileName = `pdfs/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("training-media")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("training-media")
        .getPublicUrl(data.path);

      setFormData((prev) => ({
        ...prev,
        content_data: { ...prev.content_data, pdf_url: urlData.publicUrl },
      }));
    } catch (error) {
      console.error("Error uploading PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {module ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Módulo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Introdução ao Produto"
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
                placeholder="Breve descrição do conteúdo"
                rows={2}
              />
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label>Tipo de Conteúdo</Label>
              <div className="grid grid-cols-5 gap-2">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, content_type: type.value }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        formData.content_type === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Upload */}
            {formData.content_type === "video" && (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <Label>Vídeo</Label>
                {formData.video_url ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                      <video
                        src={formData.video_url}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, video_url: "" }))}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover vídeo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Clique para fazer upload ou arraste o vídeo
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        MP4, WebM até 500MB
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadProgress > 0 && (
                      <Progress value={uploadProgress} className="h-2" />
                    )}
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">ou</span>
                    </div>
                    <Input
                      placeholder="Cole a URL do vídeo (YouTube, Vimeo, etc.)"
                      value={formData.video_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Text Content */}
            {formData.content_type === "text" && (
              <div className="space-y-2">
                <Label>Conteúdo do Artigo</Label>
                <Textarea
                  value={(formData.content_data.text_content as string) || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_data: { ...prev.content_data, text_content: e.target.value },
                    }))
                  }
                  placeholder="Digite ou cole o conteúdo do artigo. Suporta Markdown."
                  rows={10}
                />
              </div>
            )}

            {/* PDF Upload */}
            {formData.content_type === "pdf" && (
              <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                {(formData.content_data.pdf_url as string) ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <FileIcon className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">PDF carregado</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formData.content_data.pdf_url as string}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          content_data: { ...prev.content_data, pdf_url: "" },
                        }))
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para fazer upload do PDF
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* External Link */}
            {formData.content_type === "link" && (
              <div className="space-y-2">
                <Label>URL Externa</Label>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/recurso"
                  value={(formData.content_data.external_url as string) || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_data: { ...prev.content_data, external_url: e.target.value },
                    }))
                  }
                />
              </div>
            )}

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail (opcional)</Label>
              <div className="flex items-center gap-4">
                {formData.thumbnail_url ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail"
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
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

            {/* Time & Rewards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_minutes">Duração (min)</Label>
                <Input
                  id="time_minutes"
                  type="number"
                  min="1"
                  value={formData.time_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time_minutes: parseInt(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xp_reward">XP</Label>
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
                <Label htmlFor="coins_reward">Moedas</Label>
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
                  <Label>Preview Liberado</Label>
                  <p className="text-xs text-muted-foreground">
                    Permite visualizar sem seguir a ordem
                  </p>
                </div>
                <Switch
                  checked={formData.is_preview}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_preview: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Requer Conclusão</Label>
                  <p className="text-xs text-muted-foreground">
                    Precisa completar para avançar
                  </p>
                </div>
                <Switch
                  checked={formData.requires_completion}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, requires_completion: checked }))
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
                {module ? "Salvar Alterações" : "Criar Módulo"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
