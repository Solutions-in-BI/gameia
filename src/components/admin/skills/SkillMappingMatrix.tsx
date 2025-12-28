/**
 * Matriz visual de mapeamento Skill ↔ Jogo
 * Fase 3: Admin
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillConfig {
  id: string;
  skill_key: string;
  name: string;
  icon: string | null;
  category: string | null;
  related_games: string[] | null;
}

interface GameMapping {
  id: string;
  game_type: string;
  skill_id: string;
  is_primary: boolean;
  xp_multiplier: number;
}

const GAMES = [
  { type: "quiz", label: "Quiz", icon: "❓" },
  { type: "sales", label: "Vendas", icon: "💼" },
  { type: "cold_outreach", label: "Cold Outreach", icon: "📞" },
  { type: "decisions", label: "Decisões", icon: "🎯" },
  { type: "memory", label: "Memória", icon: "🧠" },
  { type: "snake", label: "Snake", icon: "🐍" },
  { type: "dino", label: "Dino", icon: "🦕" },
  { type: "tetris", label: "Tetris", icon: "🧱" },
];

export function SkillMappingMatrix() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillConfig[]>([]);
  const [mappings, setMappings] = useState<GameMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, { checked: boolean; multiplier: number }>>(new Map());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skillsRes, mappingsRes] = await Promise.all([
        supabase.from("skill_configurations").select("id, skill_key, name, icon, category, related_games").order("name"),
        supabase.from("game_skill_mapping").select("*"),
      ]);

      if (skillsRes.error) throw skillsRes.error;
      if (mappingsRes.error) throw mappingsRes.error;

      setSkills((skillsRes.data || []) as SkillConfig[]);
      setMappings((mappingsRes.data || []) as GameMapping[]);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getKey = (skillId: string, gameType: string) => `${skillId}:${gameType}`;

  const isChecked = (skillId: string, gameType: string) => {
    const key = getKey(skillId, gameType);
    if (changes.has(key)) {
      return changes.get(key)!.checked;
    }
    return mappings.some((m) => m.skill_id === skillId && m.game_type === gameType);
  };

  const getMultiplier = (skillId: string, gameType: string) => {
    const key = getKey(skillId, gameType);
    if (changes.has(key)) {
      return changes.get(key)!.multiplier;
    }
    const mapping = mappings.find((m) => m.skill_id === skillId && m.game_type === gameType);
    return mapping?.xp_multiplier || 1;
  };

  const toggleMapping = (skillId: string, gameType: string) => {
    const key = getKey(skillId, gameType);
    const current = isChecked(skillId, gameType);
    const multiplier = getMultiplier(skillId, gameType);
    setChanges(new Map(changes).set(key, { checked: !current, multiplier }));
  };

  const updateMultiplier = (skillId: string, gameType: string, value: number) => {
    const key = getKey(skillId, gameType);
    const checked = isChecked(skillId, gameType);
    setChanges(new Map(changes).set(key, { checked, multiplier: value }));
  };

  const saveChanges = async () => {
    if (changes.size === 0) return;
    setSaving(true);

    try {
      const toInsert: { game_type: string; skill_id: string; xp_multiplier: number }[] = [];
      const toDelete: { skill_id: string; game_type: string }[] = [];

      for (const [key, value] of changes) {
        const [skillId, gameType] = key.split(":");
        const existingMapping = mappings.find((m) => m.skill_id === skillId && m.game_type === gameType);

        if (value.checked) {
          if (!existingMapping) {
            toInsert.push({ game_type: gameType, skill_id: skillId, xp_multiplier: value.multiplier });
          } else if (existingMapping.xp_multiplier !== value.multiplier) {
            // Update
            await supabase
              .from("game_skill_mapping")
              .update({ xp_multiplier: value.multiplier })
              .eq("id", existingMapping.id);
          }
        } else if (existingMapping) {
          toDelete.push({ skill_id: skillId, game_type: gameType });
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from("game_skill_mapping").insert(toInsert);
        if (error) throw error;
      }

      for (const del of toDelete) {
        await supabase
          .from("game_skill_mapping")
          .delete()
          .eq("skill_id", del.skill_id)
          .eq("game_type", del.game_type);
      }

      toast({ title: "Mapeamentos salvos com sucesso!" });
      setChanges(new Map());
      fetchData();
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mapeamento Skill ↔ Jogo</CardTitle>
            <CardDescription>Configure quais skills são desenvolvidas em cada jogo</CardDescription>
          </div>
          <Button onClick={saveChanges} disabled={saving || changes.size === 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar ({changes.size})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium sticky left-0 bg-background">Skill</th>
                  {GAMES.map((game) => (
                    <th key={game.type} className="p-3 text-center font-medium min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{game.icon}</span>
                        <span className="text-xs">{game.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 sticky left-0 bg-background">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{skill.icon || "🎯"}</span>
                        <div>
                          <p className="font-medium text-sm">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                    </td>
                    {GAMES.map((game) => (
                      <td key={game.type} className="p-3 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Checkbox
                            checked={isChecked(skill.id, game.type)}
                            onCheckedChange={() => toggleMapping(skill.id, game.type)}
                          />
                          {isChecked(skill.id, game.type) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    max="5"
                                    value={getMultiplier(skill.id, game.type)}
                                    onChange={(e) => updateMultiplier(skill.id, game.type, parseFloat(e.target.value))}
                                    className="w-16 h-7 text-xs text-center"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Multiplicador de XP</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
