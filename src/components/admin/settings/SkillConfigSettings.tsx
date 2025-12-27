/**
 * SkillConfigSettings - Configuração de competências/skills
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Save, 
  Loader2,
  Pencil,
  Palette
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

interface SkillConfig {
  id: string;
  skill_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  max_level: number;
  related_games: string[] | null;
  organization_id: string | null;
}

const SKILL_CATEGORIES = [
  { value: "cognitive", label: "Cognitivo", color: "text-blue-500" },
  { value: "technical", label: "Técnico", color: "text-green-500" },
  { value: "soft", label: "Interpessoal", color: "text-purple-500" },
  { value: "leadership", label: "Liderança", color: "text-amber-500" },
  { value: "sales", label: "Vendas", color: "text-rose-500" },
];

export function SkillConfigSettings() {
  const { currentOrg } = useOrganization();
  const [skills, setSkills] = useState<SkillConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<SkillConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchSkills();
  }, [currentOrg]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skill_configurations")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order("category, name");

      if (error) throw error;
      setSkills((data || []) as SkillConfig[]);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Erro ao carregar competências");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSkill) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("skill_configurations")
        .upsert({
          ...editingSkill,
          organization_id: currentOrg?.id || null,
        });

      if (error) throw error;
      
      toast.success("Competência salva!");
      setIsDialogOpen(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkills = selectedCategory === "all" 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, SkillConfig[]>);

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
          <h3 className="font-display font-bold text-foreground">Competências & Skills</h3>
          <p className="text-sm text-muted-foreground">
            Configure as competências desenvolvidas pelos jogos
          </p>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {SKILL_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          Todas ({skills.length})
        </button>
        {SKILL_CATEGORIES.map(cat => {
          const count = skills.filter(s => s.category === cat.value).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value === selectedCategory ? "all" : cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Skills grid by category */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => {
        const catInfo = SKILL_CATEGORIES.find(c => c.value === category);
        
        return (
          <div key={category} className="space-y-3">
            {selectedCategory === "all" && (
              <h4 className={cn("font-medium", catInfo?.color || "text-muted-foreground")}>
                {catInfo?.label || "Outros"}
              </h4>
            )}
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${skill.color}20` || 'hsl(var(--muted))' }}
                      >
                        {skill.icon || "🎯"}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Max: Nível {skill.max_level}
                        </div>
                      </div>
                    </div>

                    <Dialog open={isDialogOpen && editingSkill?.id === skill.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setEditingSkill(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setEditingSkill(skill);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Editar {skill.name}
                          </DialogTitle>
                        </DialogHeader>
                        {editingSkill && (
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                  value={editingSkill.name}
                                  onChange={(e) => setEditingSkill({
                                    ...editingSkill,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ícone (emoji)</Label>
                                <Input
                                  value={editingSkill.icon || ""}
                                  onChange={(e) => setEditingSkill({
                                    ...editingSkill,
                                    icon: e.target.value
                                  })}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Textarea
                                value={editingSkill.description || ""}
                                onChange={(e) => setEditingSkill({
                                  ...editingSkill,
                                  description: e.target.value
                                })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select 
                                  value={editingSkill.category || ""}
                                  onValueChange={(value) => setEditingSkill({
                                    ...editingSkill,
                                    category: value
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SKILL_CATEGORIES.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Nível Máximo</Label>
                                <Input
                                  type="number"
                                  value={editingSkill.max_level}
                                  onChange={(e) => setEditingSkill({
                                    ...editingSkill,
                                    max_level: parseInt(e.target.value) || 10
                                  })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Cor (hex)
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  value={editingSkill.color || "#6366f1"}
                                  onChange={(e) => setEditingSkill({
                                    ...editingSkill,
                                    color: e.target.value
                                  })}
                                />
                                <div 
                                  className="w-10 h-10 rounded-lg border"
                                  style={{ backgroundColor: editingSkill.color || "#6366f1" }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Jogos Relacionados (separados por vírgula)</Label>
                              <Input
                                value={editingSkill.related_games?.join(", ") || ""}
                                placeholder="Ex: quiz, memory, decision"
                                onChange={(e) => setEditingSkill({
                                  ...editingSkill,
                                  related_games: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
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
                              Salvar Competência
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {skill.description}
                    </p>
                  )}

                  {skill.related_games && skill.related_games.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skill.related_games.map((game, i) => (
                        <span 
                          key={i}
                          className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
