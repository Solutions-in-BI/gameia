/**
 * GameConfigSettings - Configuração de jogos da organização
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Save, 
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Coins,
  Star,
  Zap
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
import { cn } from "@/lib/utils";

interface GameConfig {
  id: string;
  game_type: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  xp_base_reward: number;
  xp_multiplier: number;
  coins_base_reward: number;
  coins_multiplier: number;
  skill_categories: string[] | null;
  organization_id: string | null;
}

export function GameConfigSettings() {
  const { currentOrg } = useOrganization();
  const [games, setGames] = useState<GameConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<GameConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [currentOrg]);

  const fetchGames = async () => {
    try {
      // Busca configs globais e da organização
      const { data, error } = await supabase
        .from("game_configurations")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order("display_name");

      if (error) throw error;
      setGames((data || []) as GameConfig[]);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingGame) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("game_configurations")
        .upsert({
          ...editingGame,
          organization_id: currentOrg?.id || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success("Configuração salva!");
      setIsDialogOpen(false);
      setEditingGame(null);
      fetchGames();
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (game: GameConfig) => {
    try {
      const { error } = await supabase
        .from("game_configurations")
        .update({ is_active: !game.is_active })
        .eq("id", game.id);

      if (error) throw error;
      
      setGames(prev => prev.map(g => 
        g.id === game.id ? { ...g, is_active: !g.is_active } : g
      ));
      toast.success(game.is_active ? "Jogo desativado" : "Jogo ativado");
    } catch (error) {
      console.error("Error toggling game:", error);
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground">Configuração de Jogos</h3>
          <p className="text-sm text-muted-foreground">
            Configure recompensas e multiplicadores para cada jogo
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border transition-all",
              game.is_active 
                ? "border-primary/30 bg-primary/5" 
                : "border-border bg-muted/30 opacity-60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  game.is_active ? "bg-primary/20" : "bg-muted"
                )}>
                  <Gamepad2 className={cn(
                    "w-6 h-6",
                    game.is_active ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{game.display_name}</div>
                  <div className="text-xs text-muted-foreground">{game.game_type}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{game.xp_base_reward}</span>
                    <span className="text-muted-foreground">XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">{game.coins_base_reward}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{game.xp_multiplier}x</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={game.is_active ?? true}
                    onCheckedChange={() => handleToggleActive(game)}
                  />
                  <Dialog open={isDialogOpen && editingGame?.id === game.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingGame(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingGame(game);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar {game.display_name}</DialogTitle>
                      </DialogHeader>
                      {editingGame && (
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Nome de Exibição</Label>
                            <Input
                              value={editingGame.display_name}
                              onChange={(e) => setEditingGame({
                                ...editingGame,
                                display_name: e.target.value
                              })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                              value={editingGame.description || ""}
                              onChange={(e) => setEditingGame({
                                ...editingGame,
                                description: e.target.value
                              })}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>XP Base</Label>
                              <Input
                                type="number"
                                value={editingGame.xp_base_reward}
                                onChange={(e) => setEditingGame({
                                  ...editingGame,
                                  xp_base_reward: parseInt(e.target.value) || 0
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>XP Multiplier</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={editingGame.xp_multiplier}
                                onChange={(e) => setEditingGame({
                                  ...editingGame,
                                  xp_multiplier: parseFloat(e.target.value) || 1
                                })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Moedas Base</Label>
                              <Input
                                type="number"
                                value={editingGame.coins_base_reward}
                                onChange={(e) => setEditingGame({
                                  ...editingGame,
                                  coins_base_reward: parseInt(e.target.value) || 0
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Moedas Multiplier</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={editingGame.coins_multiplier}
                                onChange={(e) => setEditingGame({
                                  ...editingGame,
                                  coins_multiplier: parseFloat(e.target.value) || 1
                                })}
                              />
                            </div>
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
                            Salvar Configurações
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
