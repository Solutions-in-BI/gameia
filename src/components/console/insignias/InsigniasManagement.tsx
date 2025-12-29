/**
 * InsigniasManagement - Console de Configuração de Insígnias V2
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Save,
  Loader2,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Search,
  Filter,
  Star,
  Target,
  Heart,
  Zap,
  Crown,
  Sparkles,
  Check,
  X,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { INSIGNIA_TYPE_CONFIG, INSIGNIA_LEVEL_CONFIG, InsigniaType } from "@/types/insignias";

interface InsigniaCriterion {
  id: string;
  insignia_id: string;
  criterion_type: string;
  criterion_key: string;
  operator: string;
  target_value: number;
  weight: number;
  metadata: Record<string, unknown> | null;
}

interface Insignia {
  id: string;
  insignia_key: string;
  name: string;
  description: string | null;
  icon: string;
  insignia_type: InsigniaType;
  category: string | null;
  star_level: number;
  xp_reward: number;
  coins_reward: number;
  unlocks_title_id: string | null;
  unlocks_item_id: string | null;
  is_active: boolean;
  is_secret: boolean;
  organization_id: string | null;
  criteria?: InsigniaCriterion[];
  _unlocked_count?: number;
}

const TYPE_ICONS: Record<InsigniaType, typeof Award> = {
  skill: Target,
  behavior: Heart,
  impact: Zap,
  leadership: Crown,
  special: Sparkles,
};

const STAR_COLORS = [
  "text-amber-400",
  "text-amber-500",
  "text-amber-600",
];

export function InsigniasManagement() {
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<InsigniaType | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [editingInsignia, setEditingInsignia] = useState<Insignia | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("catalog");

  // Fetch insignias with criteria and unlock counts
  const { data: insignias = [], isLoading } = useQuery({
    queryKey: ["admin-insignias", currentOrg?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insignias")
        .select(`
          *,
          criteria:insignia_criteria(*)
        `)
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || "00000000-0000-0000-0000-000000000000"}`)
        .order("insignia_type")
        .order("star_level")
        .order("name");

      if (error) throw error;

      const rawData = data as unknown as Insignia[];

      // Get unlock counts
      const { data: unlockCounts } = await supabase
        .from("user_insignias")
        .select("insignia_id")
        .in("insignia_id", rawData.map(i => i.id));

      const countMap = (unlockCounts || []).reduce((acc, u) => {
        acc[u.insignia_id] = (acc[u.insignia_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return rawData.map(i => ({
        ...i,
        _unlocked_count: countMap[i.id] || 0,
      })) as Insignia[];
    },
  });

  // Statistics
  const stats = useMemo(() => {
    const total = insignias.length;
    const active = insignias.filter(i => i.is_active).length;
    const byType = Object.keys(INSIGNIA_TYPE_CONFIG).reduce((acc, type) => {
      acc[type as InsigniaType] = insignias.filter(i => i.insignia_type === type).length;
      return acc;
    }, {} as Record<InsigniaType, number>);
    const totalUnlocks = insignias.reduce((sum, i) => sum + (i._unlocked_count || 0), 0);
    return { total, active, byType, totalUnlocks };
  }, [insignias]);

  // Filter insignias
  const filteredInsignias = useMemo(() => {
    return insignias.filter(i => {
      const matchesSearch = !searchTerm || 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || i.insignia_type === selectedType;
      const matchesLevel = selectedLevel === "all" || i.star_level === selectedLevel;
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [insignias, searchTerm, selectedType, selectedLevel]);

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("insignias")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insignias"] });
    },
  });

  // Save insignia mutation
  const saveMutation = useMutation({
    mutationFn: async (insignia: Partial<Insignia>) => {
      const { criteria, _unlocked_count, ...insigniaData } = insignia as Insignia;
      const { error } = await supabase
        .from("insignias")
        .upsert({
          ...insigniaData,
          organization_id: currentOrg?.id || null,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insignias"] });
      toast.success("Insígnia salva!");
      setIsDialogOpen(false);
      setEditingInsignia(null);
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(s => (
          <Star
            key={s}
            className={cn(
              "w-4 h-4",
              s <= level ? STAR_COLORS[level - 1] : "text-muted-foreground/30"
            )}
            fill={s <= level ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Insígnias V2
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema avançado de reconhecimento profissional
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total de Insígnias</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Ativas</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-2xl font-bold text-primary">{stats.totalUnlocks}</div>
          <div className="text-xs text-muted-foreground">Desbloqueios</div>
        </div>
        {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => {
          const Icon = TYPE_ICONS[type as InsigniaType];
          const config = INSIGNIA_TYPE_CONFIG[type as InsigniaType];
          return (
            <div key={type} className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insígnias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as InsigniaType | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(INSIGNIA_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedLevel)} onValueChange={(v) => setSelectedLevel(v === "all" ? "all" : parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos níveis</SelectItem>
                <SelectItem value="1">⭐ Nível 1</SelectItem>
                <SelectItem value="2">⭐⭐ Nível 2</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Nível 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Insígnia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-center">Critérios</TableHead>
                  <TableHead className="text-center">Desbloqueios</TableHead>
                  <TableHead className="text-center">Recompensas</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsignias.map((insignia) => {
                  const TypeIcon = TYPE_ICONS[insignia.insignia_type];
                  const typeConfig = INSIGNIA_TYPE_CONFIG[insignia.insignia_type];
                  const isExpanded = expandedRows.has(insignia.id);

                  return (
                    <Collapsible key={insignia.id} open={isExpanded} asChild>
                      <>
                        <TableRow
                          className={cn(
                            "cursor-pointer transition-colors",
                            !insignia.is_active && "opacity-50"
                          )}
                          onClick={() => toggleRowExpansion(insignia.id)}
                        >
                          <TableCell>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{insignia.icon}</span>
                              <div>
                                <div className="font-medium text-foreground flex items-center gap-2">
                                  {insignia.name}
                                  {insignia.is_secret && (
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {insignia.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="gap-1"
                              style={{ 
                                backgroundColor: `${typeConfig.color}20`,
                                color: typeConfig.color,
                              }}
                            >
                              <TypeIcon className="w-3 h-3" />
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{renderStars(insignia.star_level)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {insignia.criteria?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium text-foreground">
                              {insignia._unlocked_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2 text-xs">
                              <span className="text-primary">+{insignia.xp_reward} XP</span>
                              <span className="text-amber-500">+{insignia.coins_reward} 🪙</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={insignia.is_active}
                              onCheckedChange={(checked) => {
                                toggleActiveMutation.mutate({ id: insignia.id, is_active: checked });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingInsignia(insignia);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={9} className="p-4">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Critérios de Desbloqueio</h4>
                                {insignia.criteria && insignia.criteria.length > 0 ? (
                                  <div className="grid gap-2">
                                    {insignia.criteria.map((c) => (
                                      <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Badge variant="outline" className="text-xs">
                                            {c.criterion_type}
                                          </Badge>
                                          <span className="text-sm text-foreground">
                                            {c.criterion_key}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">
                                            {c.operator}
                                          </span>
                                          <Badge>{c.target_value}</Badge>
                                          <span className="text-xs text-muted-foreground">
                                            peso: {c.weight}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum critério definido
                                  </p>
                                )}

                                {/* Additional info */}
                                <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
                                  {insignia.unlocks_title_id && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <Crown className="w-3 h-3 text-amber-500" />
                                      <span className="text-muted-foreground">
                                        Desbloqueia título
                                      </span>
                                    </div>
                                  )}
                                  {insignia.unlocks_item_id && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <Sparkles className="w-3 h-3 text-purple-500" />
                                      <span className="text-muted-foreground">
                                        Desbloqueia item da loja
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Key:</span>
                                    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                                      {insignia.insignia_key}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })}
              </TableBody>
            </Table>

            {filteredInsignias.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma insígnia encontrada
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* By Type Distribution */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Distribuição por Tipo
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const config = INSIGNIA_TYPE_CONFIG[type as InsigniaType];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{config.label}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Unlocked */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Mais Conquistadas
              </h3>
              <div className="space-y-3">
                {insignias
                  .sort((a, b) => (b._unlocked_count || 0) - (a._unlocked_count || 0))
                  .slice(0, 5)
                  .map((insignia, index) => (
                    <div key={insignia.id} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="text-xl">{insignia.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {insignia.name}
                        </div>
                      </div>
                      <Badge variant="secondary">{insignia._unlocked_count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingInsignia && <span className="text-2xl">{editingInsignia.icon}</span>}
              Editar Insígnia
            </DialogTitle>
          </DialogHeader>
          {editingInsignia && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingInsignia.name}
                    onChange={(e) =>
                      setEditingInsignia({ ...editingInsignia, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ícone (emoji)</Label>
                  <Input
                    value={editingInsignia.icon}
                    onChange={(e) =>
                      setEditingInsignia({ ...editingInsignia, icon: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingInsignia.description || ""}
                  onChange={(e) =>
                    setEditingInsignia({ ...editingInsignia, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={editingInsignia.insignia_type}
                    onValueChange={(v) =>
                      setEditingInsignia({ ...editingInsignia, insignia_type: v as InsigniaType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INSIGNIA_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nível (estrelas)</Label>
                  <Select
                    value={String(editingInsignia.star_level)}
                    onValueChange={(v) =>
                      setEditingInsignia({ ...editingInsignia, star_level: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ Nível 1</SelectItem>
                      <SelectItem value="2">⭐⭐ Nível 2</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Nível 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>XP Recompensa</Label>
                  <Input
                    type="number"
                    value={editingInsignia.xp_reward}
                    onChange={(e) =>
                      setEditingInsignia({
                        ...editingInsignia,
                        xp_reward: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moedas</Label>
                  <Input
                    type="number"
                    value={editingInsignia.coins_reward}
                    onChange={(e) =>
                      setEditingInsignia({
                        ...editingInsignia,
                        coins_reward: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Insígnia Secreta</span>
                </div>
                <Switch
                  checked={editingInsignia.is_secret ?? false}
                  onCheckedChange={(checked) =>
                    setEditingInsignia({ ...editingInsignia, is_secret: checked })
                  }
                />
              </div>

              <Button
                onClick={() => saveMutation.mutate(editingInsignia)}
                className="w-full"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Insígnia
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
