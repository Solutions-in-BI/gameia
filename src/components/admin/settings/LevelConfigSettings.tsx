/**
 * LevelConfigSettings - Configuração de níveis e progressão
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Save, 
  Loader2,
  Pencil,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

interface LevelConfig {
  id: string;
  level: number;
  xp_required: number;
  title: string | null;
  perks: string[] | null;
  rewards: Json | null;
  organization_id: string | null;
}

export function LevelConfigSettings() {
  const { currentOrg } = useOrganization();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState<LevelConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, [currentOrg]);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from("level_configurations")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order("level");

      if (error) throw error;
      setLevels((data || []) as LevelConfig[]);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Erro ao carregar níveis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingLevel) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("level_configurations")
        .upsert({
          ...editingLevel,
          organization_id: currentOrg?.id || null,
        });

      if (error) throw error;
      
      toast.success("Nível salvo!");
      setIsDialogOpen(false);
      setEditingLevel(null);
      fetchLevels();
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
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
      <div>
        <h3 className="font-display font-bold text-foreground">Sistema de Níveis</h3>
        <p className="text-sm text-muted-foreground">
          Configure a progressão e recompensas por nível
        </p>
      </div>

      <div className="space-y-2">
        {levels.map((level, index) => {
          const prevXP = index > 0 ? levels[index - 1].xp_required : 0;
          const xpNeeded = level.xp_required - prevXP;
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
            >
              {/* Level badge */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg",
                level.level <= 5 ? "bg-gray-500/20 text-gray-400" :
                level.level <= 10 ? "bg-green-500/20 text-green-500" :
                level.level <= 20 ? "bg-blue-500/20 text-blue-500" :
                level.level <= 30 ? "bg-purple-500/20 text-purple-500" :
                "bg-amber-500/20 text-amber-500"
              )}>
                {level.level}
              </div>

              {/* Level info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {level.title || `Nível ${level.level}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{level.xp_required.toLocaleString()} XP total</span>
                  <span>•</span>
                  <span>+{xpNeeded.toLocaleString()} para avançar</span>
                </div>
              </div>

              {/* Perks */}
              {level.perks && level.perks.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  {level.perks.slice(0, 2).map((perk, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                    >
                      {perk}
                    </span>
                  ))}
                  {level.perks.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{level.perks.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Edit button */}
              <Dialog open={isDialogOpen && editingLevel?.id === level.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingLevel(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditingLevel(level);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Editar Nível {level.level}
                    </DialogTitle>
                  </DialogHeader>
                  {editingLevel && (
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nível</Label>
                          <Input
                            type="number"
                            value={editingLevel.level}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>XP Necessário</Label>
                          <Input
                            type="number"
                            value={editingLevel.xp_required}
                            onChange={(e) => setEditingLevel({
                              ...editingLevel,
                              xp_required: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Título do Nível</Label>
                        <Input
                          value={editingLevel.title || ""}
                          placeholder={`Nível ${editingLevel.level}`}
                          onChange={(e) => setEditingLevel({
                            ...editingLevel,
                            title: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Benefícios (separados por vírgula)</Label>
                        <Input
                          value={editingLevel.perks?.join(", ") || ""}
                          placeholder="Ex: Acesso VIP, Multiplicador 2x"
                          onChange={(e) => setEditingLevel({
                            ...editingLevel,
                            perks: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                          })}
                        />
                      </div>

                      <Button 
                        onClick={handleSave} 
                        className="w-full"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar Nível
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
