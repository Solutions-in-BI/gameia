/**
 * EvolutionTemplatesSection - Gerenciamento de templates de evolução
 * Define pacotes automáticos de skills, insígnias e certificados
 */

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Sparkles,
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  Award,
  Target,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEvolutionTemplates, CATEGORY_LABELS, LEVEL_LABELS, IMPORTANCE_LABELS, TemplateCategory, EvolutionTemplate } from "@/hooks/useEvolutionTemplates";
import { useOrganization } from "@/hooks/useOrganization";
import { EvolutionTemplateEditor } from "./EvolutionTemplateEditor";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, typeof Target> = {
  vendas: Target,
  lideranca: TrendingUp,
  soft_skills: Sparkles,
  produtividade: TrendingUp,
  estrategia: Target,
  onboarding: GraduationCap,
  compliance: Award,
  tecnico: Target,
};

export function EvolutionTemplatesSection() {
  const { organization } = useOrganization();
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, cloneTemplate } = useEvolutionTemplates(organization?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EvolutionTemplate | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const cat = template.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(template);
    return acc;
  }, {} as Record<string, EvolutionTemplate[]>);

  const handleSaveTemplate = async (data: Partial<EvolutionTemplate>) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, data);
        toast.success("Template atualizado");
      } else {
        await createTemplate(data as Omit<EvolutionTemplate, 'id' | 'created_at' | 'updated_at'>);
        toast.success("Template criado");
      }
      setEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error("Erro ao salvar template");
    }
  };

  const handleDeleteTemplate = async (template: EvolutionTemplate) => {
    if (template.is_default) {
      toast.error("Templates padrão não podem ser excluídos");
      return;
    }
    if (!confirm(`Deseja excluir o template "${template.name}"?`)) return;
    try {
      await deleteTemplate(template.id);
      toast.success("Template excluído");
    } catch (error) {
      toast.error("Erro ao excluir template");
    }
  };

  const handleCloneTemplate = async (template: EvolutionTemplate) => {
    try {
      await cloneTemplate(template.id);
      toast.success("Template duplicado");
    } catch (error) {
      toast.error("Erro ao duplicar template");
    }
  };

  const categories = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates de Evolução</h1>
          <p className="text-muted-foreground">
            Configure pacotes automáticos de skills, insígnias e certificados
          </p>
        </div>
        <Button onClick={() => { setSelectedTemplate(null); setEditorOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Como funciona</h3>
            <p className="text-sm text-muted-foreground">
              Templates definem automaticamente quais skills serão evoluídas, insígnias concedidas e se um certificado será gerado. 
              Ao criar um treinamento, o sistema sugere o template ideal baseado na categoria, nível e importância.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory | "all")}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Todos
          </TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">Nenhum template encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Tente ajustar sua busca" : "Crie um template personalizado para sua organização"}
              </p>
              {!searchQuery && (
                <Button onClick={() => { setSelectedTemplate(null); setEditorOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                const Icon = CATEGORY_ICONS[category] || Target;
                return (
                  <div key={category}>
                    <h3 className="flex items-center gap-2 font-medium text-foreground mb-3">
                      <Icon className="w-4 h-4 text-primary" />
                      {CATEGORY_LABELS[category as TemplateCategory] || category}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">{template.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {LEVEL_LABELS[template.level as keyof typeof LEVEL_LABELS]}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {IMPORTANCE_LABELS[template.importance as keyof typeof IMPORTANCE_LABELS]}
                                </Badge>
                                {template.is_default && (
                                  <Badge className="bg-primary/10 text-primary text-xs">Padrão</Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedTemplate(template); setEditorOpen(true); }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  {template.is_default ? "Ver Detalhes" : "Editar"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCloneTemplate(template)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                {!template.is_default && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteTemplate(template)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Preview Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center py-3 bg-muted/30 rounded-lg">
                            <div>
                              <div className="text-lg font-semibold text-foreground">
                                {template.skill_impacts?.length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Skills</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-foreground">
                                {template.insignia_ids?.length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Insígnias</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-foreground">
                                {template.generates_certificate ? "Sim" : "-"}
                              </div>
                              <div className="text-xs text-muted-foreground">Certificado</div>
                            </div>
                          </div>

                          {/* Rewards Preview */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm">
                            <span className="text-muted-foreground">Recompensas sugeridas:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-medium">{template.suggested_xp} XP</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-amber-500 font-medium">{template.suggested_coins} 🪙</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor Modal */}
      <EvolutionTemplateEditor
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setSelectedTemplate(null); }}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
