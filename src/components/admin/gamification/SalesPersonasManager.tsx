/**
 * SalesPersonasManager - Gerenciamento de Personas de Clientes
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  User,
  Building,
  Brain,
  AlertTriangle,
  Target,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SalesPersona {
  id: string;
  name: string;
  role: string | null;
  company_name: string | null;
  company_type: string | null;
  personality: string;
  pain_points: string[] | null;
  decision_factors: string[] | null;
  avatar: string | null;
  difficulty: string | null;
  track_key: string | null;
  channel: string | null;
  is_active: boolean | null;
  organization_id: string | null;
}

interface SalesTrack {
  id: string;
  track_key: string;
  name: string;
}

const DEFAULT_PERSONA: Partial<SalesPersona> = {
  name: "",
  role: "",
  company_name: "",
  company_type: "B2B",
  personality: "analytical",
  pain_points: [],
  decision_factors: [],
  avatar: "",
  difficulty: "medium",
  track_key: "",
  channel: "call",
  is_active: true,
};

const PERSONALITY_OPTIONS = [
  { value: "friendly", label: "Amigável", description: "Receptivo e colaborativo" },
  { value: "analytical", label: "Analítico", description: "Foca em dados e fatos" },
  { value: "busy", label: "Ocupado", description: "Pouco tempo, direto ao ponto" },
  { value: "skeptical", label: "Cético", description: "Questiona tudo" },
  { value: "indecisive", label: "Indeciso", description: "Dificuldade em decidir" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Fácil", color: "text-green-500" },
  { value: "medium", label: "Médio", color: "text-yellow-500" },
  { value: "hard", label: "Difícil", color: "text-red-500" },
];

const CHANNEL_OPTIONS = [
  { value: "call", label: "Ligação" },
  { value: "email", label: "E-mail" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meeting", label: "Reunião" },
];

const COMPANY_TYPE_OPTIONS = [
  "B2B", "B2C", "Startup", "Enterprise", "PME", "Governo", "ONG"
];

export function SalesPersonasManager() {
  const { currentOrg } = useOrganization();
  const [personas, setPersonas] = useState<SalesPersona[]>([]);
  const [tracks, setTracks] = useState<SalesTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingPersona, setEditingPersona] = useState<Partial<SalesPersona> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newDecisionFactor, setNewDecisionFactor] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [personasRes, tracksRes] = await Promise.all([
        supabase
          .from("sales_client_personas")
          .select("*")
          .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
          .order("name"),
        supabase
          .from("sales_tracks")
          .select("id, track_key, name")
          .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
          .eq("is_active", true)
      ]);

      if (personasRes.error) throw personasRes.error;
      if (tracksRes.error) throw tracksRes.error;

      setPersonas(personasRes.data || []);
      setTracks(tracksRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPersona?.name || !editingPersona?.personality) {
      toast.error("Nome e personalidade são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const personaData = {
        ...editingPersona,
        organization_id: currentOrg?.id || null,
      };

      if (editingPersona.id) {
        const { error } = await supabase
          .from("sales_client_personas")
          .update(personaData)
          .eq("id", editingPersona.id);
        if (error) throw error;
        toast.success("Persona atualizada!");
      } else {
        const { error } = await supabase
          .from("sales_client_personas")
          .insert([personaData]);
        if (error) throw error;
        toast.success("Persona criada!");
      }

      setIsDialogOpen(false);
      setEditingPersona(null);
      fetchData();
    } catch (error) {
      console.error("Error saving persona:", error);
      toast.error("Erro ao salvar persona");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sales_client_personas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Persona excluída");
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Erro ao excluir persona");
    }
  };

  const handleToggleActive = async (persona: SalesPersona) => {
    try {
      const { error } = await supabase
        .from("sales_client_personas")
        .update({ is_active: !persona.is_active })
        .eq("id", persona.id);

      if (error) throw error;
      
      setPersonas(prev => prev.map(p =>
        p.id === persona.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success(persona.is_active ? "Persona desativada" : "Persona ativada");
    } catch (error) {
      console.error("Error toggling persona:", error);
    }
  };

  const addPainPoint = () => {
    if (!newPainPoint.trim()) return;
    setEditingPersona({
      ...editingPersona,
      pain_points: [...(editingPersona?.pain_points || []), newPainPoint.trim()]
    });
    setNewPainPoint("");
  };

  const removePainPoint = (index: number) => {
    setEditingPersona({
      ...editingPersona,
      pain_points: (editingPersona?.pain_points || []).filter((_, i) => i !== index)
    });
  };

  const addDecisionFactor = () => {
    if (!newDecisionFactor.trim()) return;
    setEditingPersona({
      ...editingPersona,
      decision_factors: [...(editingPersona?.decision_factors || []), newDecisionFactor.trim()]
    });
    setNewDecisionFactor("");
  };

  const removeDecisionFactor = (index: number) => {
    setEditingPersona({
      ...editingPersona,
      decision_factors: (editingPersona?.decision_factors || []).filter((_, i) => i !== index)
    });
  };

  const openCreateDialog = () => {
    setEditingPersona({ ...DEFAULT_PERSONA });
    setIsDialogOpen(true);
  };

  const openEditDialog = (persona: SalesPersona) => {
    setEditingPersona({ ...persona });
    setIsDialogOpen(true);
  };

  const isOrgPersona = (persona: SalesPersona) => persona.organization_id === currentOrg?.id;

  const getDifficultyColor = (difficulty: string | null) => {
    return DIFFICULTY_OPTIONS.find(d => d.value === difficulty)?.color || "text-muted-foreground";
  };

  const getPersonalityLabel = (personality: string) => {
    return PERSONALITY_OPTIONS.find(p => p.value === personality)?.label || personality;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground">Personas de Clientes</h3>
          <p className="text-sm text-muted-foreground">
            Configure os perfis de clientes virtuais para simulações
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Persona
        </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {personas.map((persona) => (
            <motion.div
              key={persona.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                persona.is_active
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30 opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {persona.name}
                      </span>
                      {persona.role && (
                        <span className="text-xs text-muted-foreground">
                          • {persona.role}
                        </span>
                      )}
                      {!isOrgPersona(persona) && (
                        <Badge variant="secondary" className="text-xs">
                          Global
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {persona.company_name && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {persona.company_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {getPersonalityLabel(persona.personality)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", getDifficultyColor(persona.difficulty))}
                  >
                    {persona.difficulty || "medium"}
                  </Badge>
                  {persona.track_key && (
                    <Badge variant="secondary">
                      {tracks.find(t => t.track_key === persona.track_key)?.name || persona.track_key}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={persona.is_active ?? true}
                    onCheckedChange={() => handleToggleActive(persona)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(persona)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {isOrgPersona(persona) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(persona.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              {(persona.pain_points?.length || 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {persona.pain_points?.slice(0, 3).map((point, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {point}
                    </Badge>
                  ))}
                  {(persona.pain_points?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(persona.pain_points?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {personas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma persona configurada</p>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPersona?.id ? "Editar Persona" : "Nova Persona"}
            </DialogTitle>
          </DialogHeader>

          {editingPersona && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={editingPersona.name || ""}
                    onChange={(e) => setEditingPersona({
                      ...editingPersona,
                      name: e.target.value
                    })}
                    placeholder="Ex: Carlos Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input
                    value={editingPersona.role || ""}
                    onChange={(e) => setEditingPersona({
                      ...editingPersona,
                      role: e.target.value
                    })}
                    placeholder="Ex: Diretor de TI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={editingPersona.company_name || ""}
                    onChange={(e) => setEditingPersona({
                      ...editingPersona,
                      company_name: e.target.value
                    })}
                    placeholder="Ex: Tech Solutions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Empresa</Label>
                  <Select
                    value={editingPersona.company_type || "B2B"}
                    onValueChange={(value) => setEditingPersona({
                      ...editingPersona,
                      company_type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Personality & Difficulty */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Personalidade *</Label>
                  <Select
                    value={editingPersona.personality || "analytical"}
                    onValueChange={(value) => setEditingPersona({
                      ...editingPersona,
                      personality: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <div>{opt.label}</div>
                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select
                    value={editingPersona.difficulty || "medium"}
                    onValueChange={(value) => setEditingPersona({
                      ...editingPersona,
                      difficulty: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select
                    value={editingPersona.channel || "call"}
                    onValueChange={(value) => setEditingPersona({
                      ...editingPersona,
                      channel: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Track */}
              <div className="space-y-2">
                <Label>Trilha Associada</Label>
                <Select
                  value={editingPersona.track_key || "none"}
                  onValueChange={(value) => setEditingPersona({
                    ...editingPersona,
                    track_key: value === "none" ? null : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as trilhas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todas as trilhas</SelectItem>
                    {tracks.map((track) => (
                      <SelectItem key={track.track_key} value={track.track_key}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pain Points */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Dores (Pain Points)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newPainPoint}
                    onChange={(e) => setNewPainPoint(e.target.value)}
                    placeholder="Ex: Custos altos com TI"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
                  />
                  <Button type="button" variant="outline" onClick={addPainPoint}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingPersona.pain_points?.map((point, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {point}
                      <button
                        type="button"
                        onClick={() => removePainPoint(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Decision Factors */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Fatores de Decisão
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newDecisionFactor}
                    onChange={(e) => setNewDecisionFactor(e.target.value)}
                    placeholder="Ex: ROI comprovado"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDecisionFactor())}
                  />
                  <Button type="button" variant="outline" onClick={addDecisionFactor}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingPersona.decision_factors?.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {factor}
                      <button
                        type="button"
                        onClick={() => removeDecisionFactor(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label>Ativo</Label>
                <Switch
                  checked={editingPersona.is_active ?? true}
                  onCheckedChange={(checked) => setEditingPersona({
                    ...editingPersona,
                    is_active: checked
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Persona</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta persona? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
