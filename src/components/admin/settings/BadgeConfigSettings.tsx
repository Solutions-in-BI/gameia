/**
 * BadgeConfigSettings - Configuração de badges/insígnias da organização
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Award, 
  Save, 
  Loader2,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BadgeCategory {
  id: string;
  name: string;
  category_key: string;
  color: string | null;
  icon: string | null;
}

interface Badge {
  id: string;
  badge_key: string;
  name: string;
  description: string | null;
  icon: string;
  rarity: string;
  category_id: string | null;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  is_secret: boolean;
  organization_id: string | null;
  category?: BadgeCategory;
}

const RARITY_COLORS: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-400",
  uncommon: "bg-green-500/20 text-green-500",
  rare: "bg-blue-500/20 text-blue-500",
  epic: "bg-purple-500/20 text-purple-500",
  legendary: "bg-amber-500/20 text-amber-500",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export function BadgeConfigSettings() {
  const { currentOrg } = useOrganization();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    try {
      const [badgesRes, categoriesRes] = await Promise.all([
        supabase
          .from("badges")
          .select("*, category:badge_categories(*)")
          .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
          .order("name"),
        supabase
          .from("badge_categories")
          .select("*")
          .order("display_order")
      ]);

      if (badgesRes.error) throw badgesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setBadges((badgesRes.data || []) as Badge[]);
      setCategories((categoriesRes.data || []) as BadgeCategory[]);
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast.error("Erro ao carregar badges");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingBadge) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("badges")
        .upsert({
          ...editingBadge,
          organization_id: currentOrg?.id || null,
        });

      if (error) throw error;
      
      toast.success("Badge salva!");
      setIsDialogOpen(false);
      setEditingBadge(null);
      fetchData();
    } catch (error) {
      console.error("Error saving badge:", error);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (badge: Badge) => {
    try {
      const { error } = await supabase
        .from("badges")
        .update({ is_active: !badge.is_active })
        .eq("id", badge.id);

      if (error) throw error;
      
      setBadges(prev => prev.map(b => 
        b.id === badge.id ? { ...b, is_active: !b.is_active } : b
      ));
    } catch (error) {
      console.error("Error toggling badge:", error);
    }
  };

  const filteredBadges = selectedCategory === "all" 
    ? badges 
    : badges.filter(b => b.category_id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display font-bold text-foreground">Badges & Insígnias</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as conquistas e recompensas dos colaboradores
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories summary */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => {
          const count = badges.filter(b => b.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? "all" : cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-4 rounded-xl border transition-all",
              badge.is_active 
                ? "border-border bg-card" 
                : "border-border bg-muted/30 opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {badge.name}
                    {badge.is_secret && <Eye className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    RARITY_COLORS[badge.rarity || "common"]
                  )}>
                    {RARITY_LABELS[badge.rarity || "common"]}
                  </span>
                </div>
              </div>
              
              <Switch
                checked={badge.is_active ?? true}
                onCheckedChange={() => handleToggleActive(badge)}
              />
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {badge.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>+{badge.xp_reward} XP</span>
                <span>+{badge.coins_reward} 🪙</span>
              </div>

              <Dialog open={isDialogOpen && editingBadge?.id === badge.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingBadge(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingBadge(badge);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      Editar {badge.name}
                    </DialogTitle>
                  </DialogHeader>
                  {editingBadge && (
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={editingBadge.name}
                            onChange={(e) => setEditingBadge({
                              ...editingBadge,
                              name: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ícone (emoji)</Label>
                          <Input
                            value={editingBadge.icon}
                            onChange={(e) => setEditingBadge({
                              ...editingBadge,
                              icon: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={editingBadge.description || ""}
                          onChange={(e) => setEditingBadge({
                            ...editingBadge,
                            description: e.target.value
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Raridade</Label>
                          <Select 
                            value={editingBadge.rarity || "common"}
                            onValueChange={(value) => setEditingBadge({
                              ...editingBadge,
                              rarity: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="common">Comum</SelectItem>
                              <SelectItem value="uncommon">Incomum</SelectItem>
                              <SelectItem value="rare">Raro</SelectItem>
                              <SelectItem value="epic">Épico</SelectItem>
                              <SelectItem value="legendary">Lendário</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select 
                            value={editingBadge.category_id || ""}
                            onValueChange={(value) => setEditingBadge({
                              ...editingBadge,
                              category_id: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>XP Recompensa</Label>
                          <Input
                            type="number"
                            value={editingBadge.xp_reward}
                            onChange={(e) => setEditingBadge({
                              ...editingBadge,
                              xp_reward: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Moedas Recompensa</Label>
                          <Input
                            type="number"
                            value={editingBadge.coins_reward}
                            onChange={(e) => setEditingBadge({
                              ...editingBadge,
                              coins_reward: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Badge Secreta</span>
                        </div>
                        <Switch
                          checked={editingBadge.is_secret ?? false}
                          onCheckedChange={(checked) => setEditingBadge({
                            ...editingBadge,
                            is_secret: checked
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
                        Salvar Badge
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
