/**
 * Gerenciamento de Skills no Admin Center
 * Fase 3: Admin - CRUD completo de skills
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Pencil, Trash2, Search, Filter, 
  ChevronDown, ChevronRight, AlertCircle, CheckCircle2,
  Save, X, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface SkillConfig {
  id: string;
  skill_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  max_level: number | null;
  xp_per_level: number;
  category: string | null;
  related_games: string[] | null;
  parent_skill_id: string | null;
  is_unlocked_by_default: boolean;
  display_order: number;
  organization_id: string | null;
}

interface HealthResult {
  healthy: boolean;
  orphan_skills: number;
  users_without_skills: number;
  invalid_levels: number;
  duplicate_entries: number;
}

const CATEGORIES = [
  { value: "comunicacao", label: "Comunicação" },
  { value: "lideranca", label: "Liderança" },
  { value: "tecnico", label: "Técnico" },
  { value: "vendas", label: "Vendas" },
  { value: "analise", label: "Análise" },
  { value: "gestao", label: "Gestão" },
];

const GAMES = [
  { value: "quiz", label: "Quiz" },
  { value: "sales", label: "Simulador de Vendas" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "decisions", label: "Decisões" },
  { value: "memory", label: "Memória" },
  { value: "snake", label: "Snake" },
  { value: "dino", label: "Dino" },
  { value: "tetris", label: "Tetris" },
];

export function SkillManagement() {
  const { currentOrg } = useOrganization();
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingSkill, setEditingSkill] = useState<SkillConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<SkillConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    fetchSkills();
    checkHealth();
  }, [currentOrg]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("skill_configurations")
        .select("*")
        .order("display_order", { ascending: true });

      if (currentOrg?.id) {
        query = query.or(`organization_id.eq.${currentOrg.id},organization_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSkills((data || []) as SkillConfig[]);
    } catch (err) {
      console.error("Erro ao buscar skills:", err);
      toast({ title: "Erro ao carregar skills", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const { data, error } = await supabase.rpc("check_skills_health");
      if (error) throw error;
      setHealth(data as unknown as HealthResult);
    } catch (err) {
      console.error("Erro ao verificar saúde:", err);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSave = async () => {
    if (!editingSkill) return;
    setSaving(true);

    try {
      const skillData = {
        ...editingSkill,
        organization_id: currentOrg?.id || null,
      };

      if (editingSkill.id && !editingSkill.id.startsWith("new-")) {
        const { error } = await supabase
          .from("skill_configurations")
          .update(skillData)
          .eq("id", editingSkill.id);
        if (error) throw error;
        toast({ title: "Skill atualizada com sucesso!" });
      } else {
        const { id, ...insertData } = skillData;
        const { error } = await supabase.from("skill_configurations").insert(insertData);
        if (error) throw error;
        toast({ title: "Skill criada com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (err: any) {
      console.error("Erro ao salvar skill:", err);
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!skillToDelete) return;

    try {
      const { error } = await supabase
        .from("skill_configurations")
        .delete()
        .eq("id", skillToDelete.id);
      
      if (error) throw error;
      
      toast({ title: "Skill excluída com sucesso!" });
      setIsDeleteDialogOpen(false);
      setSkillToDelete(null);
      fetchSkills();
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const openNewSkillDialog = () => {
    setEditingSkill({
      id: `new-${Date.now()}`,
      skill_key: "",
      name: "",
      description: "",
      icon: "🎯",
      color: "#6366f1",
      max_level: 10,
      xp_per_level: 100,
      category: null,
      related_games: [],
      parent_skill_id: null,
      is_unlocked_by_default: false,
      display_order: skills.length,
      organization_id: null,
    });
    setIsDialogOpen(true);
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.skill_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const cat = skill.category || "sem_categoria";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, SkillConfig[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Skills</h2>
          <p className="text-sm text-muted-foreground">Configure as habilidades da organização</p>
        </div>
        <Button onClick={openNewSkillDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Skill
        </Button>
      </div>

      {/* Health Status */}
      <Card className={cn(
        "border",
        health?.healthy ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {health?.healthy ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">
                  {health?.healthy ? "Sistema saudável" : "Atenção necessária"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {health?.orphan_skills || 0} skills órfãs | {health?.invalid_levels || 0} níveis inválidos | {health?.duplicate_entries || 0} duplicatas
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={checkHealth} disabled={checkingHealth}>
              <RefreshCw className={cn("w-4 h-4", checkingHealth && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills List */}
      <ScrollArea className="h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                  {CATEGORIES.find((c) => c.value === category)?.label || category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categorySkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onEdit={() => {
                        setEditingSkill(skill);
                        setIsDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSkillToDelete(skill);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSkill?.id?.startsWith("new-") ? "Nova Skill" : "Editar Skill"}
            </DialogTitle>
          </DialogHeader>

          {editingSkill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chave</label>
                  <Input
                    value={editingSkill.skill_key}
                    onChange={(e) => setEditingSkill({ ...editingSkill, skill_key: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={editingSkill.description || ""}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Ícone</label>
                  <Input
                    value={editingSkill.icon || ""}
                    onChange={(e) => setEditingSkill({ ...editingSkill, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cor</label>
                  <Input
                    type="color"
                    value={editingSkill.color || "#6366f1"}
                    onChange={(e) => setEditingSkill({ ...editingSkill, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={editingSkill.category || ""}
                    onValueChange={(v) => setEditingSkill({ ...editingSkill, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nível Máximo</label>
                  <Input
                    type="number"
                    value={editingSkill.max_level || 10}
                    onChange={(e) => setEditingSkill({ ...editingSkill, max_level: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">XP por Nível</label>
                  <Input
                    type="number"
                    value={editingSkill.xp_per_level}
                    onChange={(e) => setEditingSkill({ ...editingSkill, xp_per_level: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Jogos Relacionados</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GAMES.map((game) => (
                    <Badge
                      key={game.value}
                      variant={editingSkill.related_games?.includes(game.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = editingSkill.related_games || [];
                        const updated = current.includes(game.value)
                          ? current.filter((g) => g !== game.value)
                          : [...current, game.value];
                        setEditingSkill({ ...editingSkill, related_games: updated });
                      }}
                    >
                      {game.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{skillToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
  onDelete,
}: {
  skill: SkillConfig;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{skill.icon || "🎯"}</span>
          <div>
            <h4 className="font-medium">{skill.name}</h4>
            <p className="text-xs text-muted-foreground">{skill.skill_key}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {skill.related_games?.slice(0, 3).map((game) => (
          <Badge key={game} variant="secondary" className="text-xs">
            {game}
          </Badge>
        ))}
        {skill.related_games && skill.related_games.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{skill.related_games.length - 3}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
