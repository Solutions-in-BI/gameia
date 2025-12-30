/**
 * ModuleFormModal - Modal melhorado para criar/editar módulos
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  Upload, 
  X, 
  Video, 
  FileText, 
  HelpCircle, 
  FileIcon, 
  Link,
  Clock,
  Award,
  Coins,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TrainingModule } from "@/hooks/useTrainings";

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: TrainingModule | null;
  onSave: (data: Partial<TrainingModule>) => Promise<void>;
}

const CONTENT_TYPES = [
  { 
    value: "video", 
    label: "Vídeo", 
    icon: Video,
    description: "Aulas em vídeo, tutoriais",
    color: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-500"
  },
  { 
    value: "text", 
    label: "Texto", 
    icon: FileText,
    description: "Artigos, textos formatados",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500"
  },
  { 
    value: "quiz", 
    label: "Quiz", 
    icon: HelpCircle,
    description: "Perguntas e respostas",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500"
  },
  { 
    value: "pdf", 
    label: "PDF", 
    icon: FileIcon,
    description: "Documentos e materiais",
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-500"
  },
  { 
    value: "link", 
    label: "Link", 
    icon: Link,
    description: "Recursos externos",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500"
  },
];

const TEMPLATES = [
  { name: "Aula Introdutória", time: 15, xp: 30, coins: 15, type: "video" },
  { name: "Leitura Rápida", time: 5, xp: 15, coins: 5, type: "text" },
  { name: "Avaliação", time: 10, xp: 50, coins: 25, type: "quiz" },
  { name: "Material de Apoio", time: 20, xp: 20, coins: 10, type: "pdf" },
];

export function ModuleFormModal({
  isOpen,
  onClose,
  module,
  onSave,
}: ModuleFormModalProps) {
  const [step, setStep] = useState(1);
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
      setStep(2); // Go to content step when editing
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
      setStep(1);
    }
  }, [module, isOpen]);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const data: Partial<TrainingModule> = {
        ...formData,
        module_key: formData.module_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
      };
      await onSave(data);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      content_type: template.type,
      time_minutes: template.time,
      xp_reward: template.xp,
      coins_reward: template.coins,
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const fileName = `videos/${Date.now()}_${file.name}`;
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

  const canProceed = step === 1 
    ? formData.content_type !== "" 
    : formData.name.trim() !== "";

  const selectedType = CONTENT_TYPES.find(t => t.value === formData.content_type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {selectedType && (
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", selectedType.color)}>
                    <selectedType.icon className={cn("w-5 h-5", selectedType.iconColor)} />
                  </div>
                )}
                {module ? "Editar Módulo" : "Novo Módulo"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === 1 ? "Escolha o tipo de conteúdo" : "Configure o módulo"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>
                1
              </span>
              <div className="w-8 h-0.5 bg-muted" />
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>
                2
              </span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Choose Content Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Templates */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Templates Rápidos
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          className="h-auto py-3 px-4 justify-start"
                          onClick={() => {
                            applyTemplate(template);
                            setStep(2);
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {template.time}min • {template.xp}XP • {template.coins}🪙
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content Types */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">
                      Ou escolha o tipo
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {CONTENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.content_type === type.value;
                        
                        return (
                          <Card
                            key={type.value}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              isSelected && "ring-2 ring-primary"
                            )}
                            onClick={() => setFormData(prev => ({ ...prev, content_type: type.value }))}
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className={cn("p-3 rounded-xl bg-gradient-to-br", type.color)}>
                                <Icon className={cn("w-6 h-6", type.iconColor)} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Configure Module */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Módulo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Introdução ao Produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Breve descrição do conteúdo"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Content Type Specific Fields */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2">
                      {selectedType && <selectedType.icon className={cn("w-4 h-4", selectedType.iconColor)} />}
                      <Label className="font-medium">Conteúdo - {selectedType?.label}</Label>
                    </div>

                    {/* Video */}
                    {formData.content_type === "video" && (
                      <>
                        {formData.video_url ? (
                          <div className="space-y-2">
                            <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                              <video src={formData.video_url} controls className="w-full h-full" />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, video_url: "" }))}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remover vídeo
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Upload de vídeo</span>
                              <span className="text-xs text-muted-foreground mt-1">MP4, WebM</span>
                              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                            </label>
                            {uploadProgress > 0 && <Progress value={uploadProgress} className="h-2" />}
                            <div className="text-center text-xs text-muted-foreground">ou</div>
                            <Input
                              placeholder="Cole a URL do vídeo (YouTube, Vimeo, etc.)"
                              value={formData.video_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Text */}
                    {formData.content_type === "text" && (
                      <Textarea
                        value={(formData.content_data.text_content as string) || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          content_data: { ...prev.content_data, text_content: e.target.value },
                        }))}
                        placeholder="Digite ou cole o conteúdo. Suporta Markdown."
                        rows={8}
                      />
                    )}

                    {/* PDF */}
                    {formData.content_type === "pdf" && (
                      <>
                        {(formData.content_data.pdf_url as string) ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                            <FileIcon className="w-8 h-8 text-amber-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">PDF carregado</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                content_data: { ...prev.content_data, pdf_url: "" },
                              }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Upload de PDF</span>
                            <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                          </label>
                        )}
                      </>
                    )}

                    {/* Link */}
                    {formData.content_type === "link" && (
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/recurso"
                        value={(formData.content_data.external_url as string) || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          content_data: { ...prev.content_data, external_url: e.target.value },
                        }))}
                      />
                    )}

                    {/* Quiz */}
                    {formData.content_type === "quiz" && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        O quiz será configurado automaticamente com base nas configurações do jogo.
                      </div>
                    )}
                  </div>

                  {/* Rewards */}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">
                      Duração e Recompensas
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Duração</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={formData.time_minutes}
                            onChange={(e) => setFormData(prev => ({ ...prev, time_minutes: parseInt(e.target.value) || 0 }))}
                            className="h-8 text-center"
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span className="text-xs">XP</span>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={formData.xp_reward}
                          onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                          className="h-8 text-center"
                        />
                      </div>

                      <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="text-xs">Moedas</span>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={formData.coins_reward}
                          onChange={(e) => setFormData(prev => ({ ...prev, coins_reward: parseInt(e.target.value) || 0 }))}
                          className="h-8 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Preview Liberado</Label>
                        <p className="text-xs text-muted-foreground">Visível antes de iniciar</p>
                      </div>
                      <Switch
                        checked={formData.is_preview}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_preview: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Requer Conclusão</Label>
                        <p className="text-xs text-muted-foreground">Precisa concluir para avançar</p>
                      </div>
                      <Switch
                        checked={formData.requires_completion}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_completion: checked }))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)} disabled={!canProceed}>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !canProceed}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {module ? "Salvar Alterações" : "Criar Módulo"}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
