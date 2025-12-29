/**
 * SalesStagesManager - Gerenciamento de Estágios de Conversa
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  MessageSquare,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface SalesStage {
  id: string;
  stage_key: string;
  stage_label: string;
  stage_order: number;
  description: string | null;
  tips: string | null;
  icon: string | null;
  track_key: string | null;
  channel: string | null;
  organization_id: string | null;
}

interface SalesTrack {
  id: string;
  track_key: string;
  name: string;
}

const DEFAULT_STAGE: Partial<SalesStage> = {
  stage_key: "",
  stage_label: "",
  stage_order: 0,
  description: "",
  tips: "",
  icon: "MessageSquare",
  track_key: "",
  channel: "",
};

const ICON_OPTIONS = [
  { value: "MessageSquare", label: "Chat" },
  { value: "Phone", label: "Telefone" },
  { value: "Mail", label: "Email" },
  { value: "Search", label: "Descoberta" },
  { value: "Presentation", label: "Apresentação" },
  { value: "Shield", label: "Objeção" },
  { value: "Handshake", label: "Fechamento" },
  { value: "Target", label: "Objetivo" },
  { value: "Users", label: "Conexão" },
  { value: "CheckCircle", label: "Conclusão" },
];

export function SalesStagesManager() {
  const { currentOrg } = useOrganization();
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [tracks, setTracks] = useState<SalesTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [editingStage, setEditingStage] = useState<Partial<SalesStage> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stagesRes, tracksRes] = await Promise.all([
        supabase
          .from("sales_conversation_stages")
          .select("*")
          .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
          .order("track_key")
          .order("stage_order"),
        supabase
          .from("sales_tracks")
          .select("id, track_key, name")
          .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
          .eq("is_active", true)
      ]);

      if (stagesRes.error) throw stagesRes.error;
      if (tracksRes.error) throw tracksRes.error;

      setStages(stagesRes.data || []);
      setTracks(tracksRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStages = selectedTrack === "all"
    ? stages
    : stages.filter(s => s.track_key === selectedTrack || !s.track_key);

  const handleSave = async () => {
    if (!editingStage?.stage_key || !editingStage?.stage_label) {
      toast.error("Chave e label são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const stageOrder = editingStage.stage_order ?? filteredStages.length;

      if (editingStage.id) {
        const { error } = await supabase
          .from("sales_conversation_stages")
          .update({
            stage_key: editingStage.stage_key,
            stage_label: editingStage.stage_label,
            stage_order: stageOrder,
            description: editingStage.description,
            tips: editingStage.tips,
            icon: editingStage.icon,
            track_key: editingStage.track_key,
            channel: editingStage.channel,
          })
          .eq("id", editingStage.id);
        if (error) throw error;
        toast.success("Estágio atualizado!");
      } else {
        const { error } = await supabase
          .from("sales_conversation_stages")
          .insert([{
            stage_key: editingStage.stage_key || `stage_${Date.now()}`,
            stage_label: editingStage.stage_label || "Novo Estágio",
            stage_order: stageOrder,
            description: editingStage.description,
            tips: editingStage.tips,
            icon: editingStage.icon,
            track_key: editingStage.track_key,
            channel: editingStage.channel,
            organization_id: currentOrg?.id || null,
          }]);
        if (error) throw error;
        toast.success("Estágio criado!");
      }

      setIsDialogOpen(false);
      setEditingStage(null);
      fetchData();
    } catch (error) {
      console.error("Error saving stage:", error);
      toast.error("Erro ao salvar estágio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sales_conversation_stages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Estágio excluído");
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("Erro ao excluir estágio");
    }
  };

  const handleReorder = async (newOrder: SalesStage[]) => {
    setStages(prev => {
      const otherStages = prev.filter(s => 
        selectedTrack !== "all" ? s.track_key !== selectedTrack && s.track_key : true
      );
      return [...otherStages, ...newOrder];
    });

    // Update order in database
    try {
      const updates = newOrder.map((stage, index) => ({
        id: stage.id,
        stage_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("sales_conversation_stages")
          .update({ stage_order: update.stage_order })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error reordering stages:", error);
      toast.error("Erro ao reordenar");
      fetchData();
    }
  };

  const openCreateDialog = () => {
    setEditingStage({ 
      ...DEFAULT_STAGE, 
      track_key: selectedTrack === "all" ? "" : selectedTrack,
      stage_order: filteredStages.length
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (stage: SalesStage) => {
    setEditingStage({ ...stage });
    setIsDialogOpen(true);
  };

  const isOrgStage = (stage: SalesStage) => stage.organization_id === currentOrg?.id;

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
          <h3 className="font-display font-bold text-foreground">Estágios de Conversa</h3>
          <p className="text-sm text-muted-foreground">
            Configure o fluxo de estágios do funil de vendas
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Estágio
        </Button>
      </div>

      {/* Track Filter */}
      <div className="flex items-center gap-4">
        <Label>Filtrar por Trilha:</Label>
        <Select value={selectedTrack} onValueChange={setSelectedTrack}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as trilhas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as trilhas</SelectItem>
            {tracks.map((track) => (
              <SelectItem key={track.track_key} value={track.track_key}>
                {track.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Visualization */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filteredStages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <div 
              className={cn(
                "px-4 py-2 rounded-lg border text-sm whitespace-nowrap",
                "bg-primary/10 border-primary/30 text-primary font-medium"
              )}
            >
              {stage.stage_label}
            </div>
            {index < filteredStages.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
        {filteredStages.length === 0 && (
          <div className="text-muted-foreground text-sm">
            Nenhum estágio configurado para esta trilha
          </div>
        )}
      </div>

      {/* Stages List */}
      <Reorder.Group
        axis="y"
        values={filteredStages}
        onReorder={handleReorder}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredStages.map((stage) => (
            <Reorder.Item
              key={stage.id}
              value={stage}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing",
                "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {stage.stage_order + 1}
                    </Badge>
                    <span className="font-medium text-foreground">
                      {stage.stage_label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.stage_key})
                    </span>
                    {!isOrgStage(stage) && (
                      <Badge variant="secondary" className="text-xs">
                        Global
                      </Badge>
                    )}
                  </div>
                  
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {stage.description}
                    </p>
                  )}
                  
                  {stage.tips && (
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{stage.tips}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(stage)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {isOrgStage(stage) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(stage.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {filteredStages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum estágio configurado</p>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStage?.id ? "Editar Estágio" : "Novo Estágio"}
            </DialogTitle>
          </DialogHeader>

          {editingStage && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={editingStage.stage_label || ""}
                    onChange={(e) => setEditingStage({
                      ...editingStage,
                      stage_label: e.target.value,
                      stage_key: editingStage.id ? editingStage.stage_key : e.target.value.toLowerCase().replace(/\s+/g, '_')
                    })}
                    placeholder="Ex: Abertura"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave *</Label>
                  <Input
                    value={editingStage.stage_key || ""}
                    onChange={(e) => setEditingStage({
                      ...editingStage,
                      stage_key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                    })}
                    placeholder="Ex: opening"
                    disabled={!!editingStage.id}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trilha</Label>
                  <Select
                    value={editingStage.track_key || "none"}
                    onValueChange={(value) => setEditingStage({
                      ...editingStage,
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
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={editingStage.stage_order || 0}
                    onChange={(e) => setEditingStage({
                      ...editingStage,
                      stage_order: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingStage.description || ""}
                  onChange={(e) => setEditingStage({
                    ...editingStage,
                    description: e.target.value
                  })}
                  placeholder="Descreva o objetivo deste estágio..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Dicas para o Jogador
                </Label>
                <Textarea
                  value={editingStage.tips || ""}
                  onChange={(e) => setEditingStage({
                    ...editingStage,
                    tips: e.target.value
                  })}
                  placeholder="Ex: Faça perguntas abertas para entender as necessidades do cliente..."
                  rows={3}
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
            <AlertDialogTitle>Excluir Estágio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este estágio? Esta ação não pode ser desfeita.
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
