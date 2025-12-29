/**
 * SalesTracksManager - Gerenciamento de Trilhas de Vendas
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  Route,
  Clock,
  Star,
  Coins,
  GripVertical,
  ToggleLeft,
  ToggleRight,
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

interface SalesTrack {
  id: string;
  track_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  time_limit_seconds: number | null;
  xp_reward: number | null;
  coins_reward: number | null;
  is_active: boolean | null;
  organization_id: string | null;
}

const DEFAULT_TRACK: Partial<SalesTrack> = {
  name: "",
  track_key: "",
  description: "",
  icon: "Route",
  color: "#6366f1",
  time_limit_seconds: 300,
  xp_reward: 100,
  coins_reward: 50,
  is_active: true,
};

const ICON_OPTIONS = [
  "Route", "Phone", "Mail", "MessageSquare", "Target", "TrendingUp", 
  "Handshake", "Users", "Building", "Briefcase"
];

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6"
];

export function SalesTracksManager() {
  const { currentOrg } = useOrganization();
  const [tracks, setTracks] = useState<SalesTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingTrack, setEditingTrack] = useState<Partial<SalesTrack> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, [currentOrg]);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_tracks")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order("name");

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast.error("Erro ao carregar trilhas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTrack?.name || !editingTrack?.track_key) {
      toast.error("Nome e chave são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTrack.id) {
        const { error } = await supabase
          .from("sales_tracks")
          .update({
            name: editingTrack.name,
            track_key: editingTrack.track_key,
            description: editingTrack.description,
            icon: editingTrack.icon,
            color: editingTrack.color,
            time_limit_seconds: editingTrack.time_limit_seconds,
            xp_reward: editingTrack.xp_reward,
            coins_reward: editingTrack.coins_reward,
            is_active: editingTrack.is_active,
          })
          .eq("id", editingTrack.id);
        if (error) throw error;
        toast.success("Trilha atualizada!");
      } else {
        const { error } = await supabase
          .from("sales_tracks")
          .insert([{
            name: editingTrack.name || "Nova Trilha",
            track_key: editingTrack.track_key || `track_${Date.now()}`,
            description: editingTrack.description,
            icon: editingTrack.icon,
            color: editingTrack.color,
            time_limit_seconds: editingTrack.time_limit_seconds,
            xp_reward: editingTrack.xp_reward,
            coins_reward: editingTrack.coins_reward,
            is_active: editingTrack.is_active,
            organization_id: currentOrg?.id || null,
          }]);
        if (error) throw error;
        toast.success("Trilha criada!");
      }

      setIsDialogOpen(false);
      setEditingTrack(null);
      fetchTracks();
    } catch (error) {
      console.error("Error saving track:", error);
      toast.error("Erro ao salvar trilha");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sales_tracks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Trilha excluída");
      setDeleteConfirm(null);
      fetchTracks();
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error("Erro ao excluir trilha");
    }
  };

  const handleToggleActive = async (track: SalesTrack) => {
    try {
      const { error } = await supabase
        .from("sales_tracks")
        .update({ is_active: !track.is_active })
        .eq("id", track.id);

      if (error) throw error;
      
      setTracks(prev => prev.map(t =>
        t.id === track.id ? { ...t, is_active: !t.is_active } : t
      ));
      toast.success(track.is_active ? "Trilha desativada" : "Trilha ativada");
    } catch (error) {
      console.error("Error toggling track:", error);
    }
  };

  const openCreateDialog = () => {
    setEditingTrack({ ...DEFAULT_TRACK });
    setIsDialogOpen(true);
  };

  const openEditDialog = (track: SalesTrack) => {
    setEditingTrack({ ...track });
    setIsDialogOpen(true);
  };

  const isOrgTrack = (track: SalesTrack) => track.organization_id === currentOrg?.id;

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
          <h3 className="font-display font-bold text-foreground">Trilhas de Vendas</h3>
          <p className="text-sm text-muted-foreground">
            Configure as diferentes jornadas de vendas disponíveis
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {tracks.map((track) => (
            <motion.div
              key={track.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                track.is_active
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30 opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: track.color ? `${track.color}20` : undefined }}
                  >
                    <Route 
                      className="w-6 h-6" 
                      style={{ color: track.color || undefined }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {track.name}
                      </span>
                      {!isOrgTrack(track) && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Global
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {track.track_key}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{Math.floor((track.time_limit_seconds || 300) / 60)}min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{track.xp_reward || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{track.coins_reward || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={track.is_active ?? true}
                    onCheckedChange={() => handleToggleActive(track)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(track)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {isOrgTrack(track) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(track.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              {track.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {track.description}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {tracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma trilha configurada</p>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTrack?.id ? "Editar Trilha" : "Nova Trilha"}
            </DialogTitle>
          </DialogHeader>

          {editingTrack && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={editingTrack.name || ""}
                    onChange={(e) => setEditingTrack({
                      ...editingTrack,
                      name: e.target.value,
                      track_key: editingTrack.id ? editingTrack.track_key : e.target.value.toLowerCase().replace(/\s+/g, '_')
                    })}
                    placeholder="Ex: Closer B2B"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave *</Label>
                  <Input
                    value={editingTrack.track_key || ""}
                    onChange={(e) => setEditingTrack({
                      ...editingTrack,
                      track_key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                    })}
                    placeholder="Ex: closer_b2b"
                    disabled={!!editingTrack.id}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingTrack.description || ""}
                  onChange={(e) => setEditingTrack({
                    ...editingTrack,
                    description: e.target.value
                  })}
                  placeholder="Descreva o objetivo desta trilha..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all",
                        editingTrack.color === color && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingTrack({ ...editingTrack, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tempo (min)</Label>
                  <Input
                    type="number"
                    value={Math.floor((editingTrack.time_limit_seconds || 300) / 60)}
                    onChange={(e) => setEditingTrack({
                      ...editingTrack,
                      time_limit_seconds: parseInt(e.target.value) * 60 || 300
                    })}
                    min={1}
                    max={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    value={editingTrack.xp_reward || 0}
                    onChange={(e) => setEditingTrack({
                      ...editingTrack,
                      xp_reward: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coins Reward</Label>
                  <Input
                    type="number"
                    value={editingTrack.coins_reward || 0}
                    onChange={(e) => setEditingTrack({
                      ...editingTrack,
                      coins_reward: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label>Ativo</Label>
                <Switch
                  checked={editingTrack.is_active ?? true}
                  onCheckedChange={(checked) => setEditingTrack({
                    ...editingTrack,
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
            <AlertDialogTitle>Excluir Trilha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta trilha? Esta ação não pode ser desfeita.
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
