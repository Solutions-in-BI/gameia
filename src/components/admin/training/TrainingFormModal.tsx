/**
 * TrainingFormModal - Modal para criar/editar treinamentos
 * COM seções de Certificação, Skills Impactadas e Insígnias
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Upload, 
  X, 
  Award, 
  Sparkles, 
  Shield,
  Plus,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/hooks/useTrainings";

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training | null;
  onSave: (data: Partial<Training>) => Promise<void>;
}

interface SkillImpact {
  skill_id: string;
  skill_name: string;
  skill_icon: string;
  impact_weight: 'low' | 'medium' | 'high';
}

interface InsigniaRelation {
  insignia_id: string;
  insignia_name: string;
  insignia_icon: string;
  relation_type: 'grants' | 'partial_criteria';
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
const IMPACT_WEIGHTS = [
  { value: "low", label: "Baixo", xp: "+25 XP" },
  { value: "medium", label: "Médio", xp: "+50 XP" },
  { value: "high", label: "Alto", xp: "+100 XP" },
];
const VALIDITY_OPTIONS = [
  { value: "0", label: "Permanente" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "1 ano" },
  { value: "24", label: "2 anos" },
];

export function TrainingFormModal({
  isOpen,
  onClose,
  training,
  onSave,
}: TrainingFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [availableInsignias, setAvailableInsignias] = useState<{ id: string; name: string; icon: string }[]>([]);
  
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
    // Certificate config
    certificate_name: "",
    certificate_type: "internal",
    certificate_validity_months: 0,
    certificate_min_score: 70,
    certificate_require_checkpoints: true,
  });

  const [skillImpacts, setSkillImpacts] = useState<SkillImpact[]>([]);
  const [insigniaRelations, setInsigniaRelations] = useState<InsigniaRelation[]>([]);

  // Fetch available skills and insignias
  useEffect(() => {
    async function fetchOptions() {
      // Use explicit any to avoid deep type instantiation issues with new tables
      const client = supabase as unknown as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: unknown) => Promise<{ data: unknown[] | null }>;
          };
        };
      };
      
      const skillsRes = await client.from("skill_configurations").select("id, name, icon").eq("is_active", true);
      const insigniasRes = await client.from("insignias").select("id, name, icon").eq("is_active", true);
      
      if (skillsRes.data) setAvailableSkills(skillsRes.data as Array<{id: string; name: string; icon: string}>);
      if (insigniasRes.data) setAvailableInsignias(insigniasRes.data as Array<{id: string; name: string; icon: string}>);
    }
    if (isOpen) fetchOptions();
  }, [isOpen]);

  // Load existing relations when editing
  useEffect(() => {
    async function loadRelations() {
      if (!training?.id) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const [skillImpactsRes, insigniaRelsRes] = await Promise.all([
        db.from("training_skill_impact")
          .select("skill_id, impact_weight, skill:skill_configurations(name, icon)")
          .eq("training_id", training.id),
        db.from("training_insignia_relation")
          .select("insignia_id, relation_type, insignia:insignias(name, icon)")
          .eq("training_id", training.id)
      ]);

      if (skillImpactsRes.data) {
        setSkillImpacts(skillImpactsRes.data.map((item: any) => ({
          skill_id: item.skill_id,
          skill_name: item.skill?.name || "",
          skill_icon: item.skill?.icon || "⚡",
          impact_weight: item.impact_weight as 'low' | 'medium' | 'high',
        })));
      }

      if (insigniaRelsRes.data) {
        setInsigniaRelations(insigniaRelsRes.data.map((item: any) => ({
          insignia_id: item.insignia_id,
          insignia_name: item.insignia?.name || "",
          insignia_icon: item.insignia?.icon || "🏅",
          relation_type: item.relation_type as 'grants' | 'partial_criteria',
        })));
      }
    }

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
        certificate_name: (training as any).certificate_name || "",
        certificate_type: (training as any).certificate_type || "internal",
        certificate_validity_months: (training as any).certificate_validity_months || 0,
        certificate_min_score: (training as any).certificate_min_score || 70,
        certificate_require_checkpoints: (training as any).certificate_require_checkpoints ?? true,
      });
      loadRelations();
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
        certificate_name: "",
        certificate_type: "internal",
        certificate_validity_months: 0,
        certificate_min_score: 70,
        certificate_require_checkpoints: true,
      });
      setSkillImpacts([]);
      setInsigniaRelations([]);
    }
  }, [training]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: Partial<Training> = {
        ...formData,
        training_key: formData.training_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
        certificate_validity_months: formData.certificate_validity_months || null,
      } as any;
      
      await onSave(data);

      // Save skill impacts and insignia relations
      if (training?.id) {
        // Delete existing and insert new
        await supabase.from("training_skill_impact").delete().eq("training_id", training.id);
        await supabase.from("training_insignia_relation").delete().eq("training_id", training.id);

        if (skillImpacts.length > 0) {
          await supabase.from("training_skill_impact").insert(
            skillImpacts.map(s => ({
              training_id: training.id,
              skill_id: s.skill_id,
              impact_weight: s.impact_weight,
            }))
          );
        }

        if (insigniaRelations.length > 0) {
          await supabase.from("training_insignia_relation").insert(
            insigniaRelations.map(i => ({
              training_id: training.id,
              insignia_id: i.insignia_id,
              relation_type: i.relation_type,
            }))
          );
        }
      }
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

  const addSkillImpact = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    if (!skill || skillImpacts.length >= 3 || skillImpacts.find(s => s.skill_id === skillId)) return;
    
    setSkillImpacts([...skillImpacts, {
      skill_id: skill.id,
      skill_name: skill.name,
      skill_icon: skill.icon,
      impact_weight: 'medium',
    }]);
  };

  const removeSkillImpact = (skillId: string) => {
    setSkillImpacts(skillImpacts.filter(s => s.skill_id !== skillId));
  };

  const updateSkillWeight = (skillId: string, weight: 'low' | 'medium' | 'high') => {
    setSkillImpacts(skillImpacts.map(s => 
      s.skill_id === skillId ? { ...s, impact_weight: weight } : s
    ));
  };

  const addInsigniaRelation = (insigniaId: string) => {
    const insignia = availableInsignias.find(i => i.id === insigniaId);
    if (!insignia || insigniaRelations.find(i => i.insignia_id === insigniaId)) return;
    
    setInsigniaRelations([...insigniaRelations, {
      insignia_id: insignia.id,
      insignia_name: insignia.name,
      insignia_icon: insignia.icon,
      relation_type: 'grants',
    }]);
  };

  const removeInsigniaRelation = (insigniaId: string) => {
    setInsigniaRelations(insigniaRelations.filter(i => i.insignia_id !== insigniaId));
  };

  const updateInsigniaType = (insigniaId: string, type: 'grants' | 'partial_criteria') => {
    setInsigniaRelations(insigniaRelations.map(i => 
      i.insignia_id === insigniaId ? { ...i, relation_type: type } : i
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
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

            <Separator />

            {/* CERTIFICATE CONFIGURATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Certificação do Treinamento</h3>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label>Gerar Certificado ao Concluir</Label>
                  <p className="text-xs text-muted-foreground">
                    Emite certificado automático após conclusão
                  </p>
                </div>
                <Switch
                  checked={formData.certificate_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, certificate_enabled: checked }))
                  }
                />
              </div>

              {formData.certificate_enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label>Nome do Certificado</Label>
                    <Input
                      value={formData.certificate_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, certificate_name: e.target.value }))}
                      placeholder={formData.name || "Nome do treinamento"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para usar o nome do treinamento
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={formData.certificate_type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, certificate_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Interno</SelectItem>
                          <SelectItem value="external">Externo (compartilhável)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <Select
                        value={String(formData.certificate_validity_months)}
                        onValueChange={(value) => setFormData((prev) => ({ 
                          ...prev, 
                          certificate_validity_months: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VALIDITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Score Mínimo para Certificação: {formData.certificate_min_score}%</Label>
                    <Slider
                      value={[formData.certificate_min_score]}
                      onValueChange={([value]) => setFormData((prev) => ({ 
                        ...prev, 
                        certificate_min_score: value 
                      }))}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir Checkpoints Obrigatórios</Label>
                      <p className="text-xs text-muted-foreground">
                        Todos os módulos marcados como checkpoint devem ser aprovados
                      </p>
                    </div>
                    <Switch
                      checked={formData.certificate_require_checkpoints}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, certificate_require_checkpoints: checked }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* SKILLS IMPACTED */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Skills Impactadas</h3>
                <Badge variant="secondary" className="ml-auto">
                  {skillImpacts.length}/3
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione até 3 skills que serão desenvolvidas com este treinamento
              </p>

              {/* Selected skills */}
              {skillImpacts.length > 0 && (
                <div className="space-y-2">
                  {skillImpacts.map((skill) => (
                    <div key={skill.skill_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-xl">{skill.skill_icon}</span>
                      <span className="font-medium flex-1">{skill.skill_name}</span>
                      <Select
                        value={skill.impact_weight}
                        onValueChange={(value) => updateSkillWeight(skill.skill_id, value as any)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPACT_WEIGHTS.map((w) => (
                            <SelectItem key={w.value} value={w.value}>
                              {w.label} ({w.xp})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkillImpact(skill.skill_id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add skill */}
              {skillImpacts.length < 3 && (
                <Select onValueChange={addSkillImpact}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Plus className="w-4 h-4" />
                      Adicionar skill
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills
                      .filter(s => !skillImpacts.find(si => si.skill_id === s.id))
                      .map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          <span className="mr-2">{skill.icon}</span>
                          {skill.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Separator />

            {/* INSIGNIAS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Insígnias Relacionadas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Associe insígnias que serão concedidas ou usadas como critério
              </p>

              {/* Selected insignias */}
              {insigniaRelations.length > 0 && (
                <div className="space-y-2">
                  {insigniaRelations.map((insignia) => (
                    <div key={insignia.insignia_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-xl">{insignia.insignia_icon}</span>
                      <span className="font-medium flex-1">{insignia.insignia_name}</span>
                      <Select
                        value={insignia.relation_type}
                        onValueChange={(value) => updateInsigniaType(insignia.insignia_id, value as any)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grants">Concede diretamente</SelectItem>
                          <SelectItem value="partial_criteria">Conta como critério</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInsigniaRelation(insignia.insignia_id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add insignia */}
              <Select onValueChange={addInsigniaRelation}>
                <SelectTrigger>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Plus className="w-4 h-4" />
                    Adicionar insígnia
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableInsignias
                    .filter(i => !insigniaRelations.find(ir => ir.insignia_id === i.id))
                    .map((insignia) => (
                      <SelectItem key={insignia.id} value={insignia.id}>
                        <span className="mr-2">{insignia.icon}</span>
                        {insignia.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-4">
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
