import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMarketplaceAdmin, MarketplaceCategory, CreateCategoryInput } from "@/hooks/useMarketplaceAdmin";

const SECTION_OPTIONS = [
  { value: "gamification", label: "Gamificação", description: "Itens relacionados a avatar, perfil e progressão" },
  { value: "recreation", label: "Recreação", description: "Temas e customizações para minigames" },
];

const EMOJI_SUGGESTIONS = [
  "👤", "🖼️", "🏷️", "🐾", "🎨", "🐍", "🧠", "🦖", "🎵", "🎮",
  "💎", "⭐", "🌟", "✨", "🔥", "❄️", "🌈", "👑", "💰", "🎁",
];

interface CategoryFormState {
  name: string;
  slug: string;
  icon: string;
  description: string;
  section: string;
  sort_order: number;
}

const initialFormState: CategoryFormState = {
  name: "",
  slug: "",
  icon: "📦",
  description: "",
  section: "gamification",
  sort_order: 0,
};

export function CategoryManagement() {
  const { categories, createCategory, updateCategory, deleteCategory } = useMarketplaceAdmin();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MarketplaceCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gamificationCategories = categories.filter(c => c.section === "gamification");
  const recreationCategories = categories.filter(c => c.section === "recreation");

  const handleEdit = (category: MarketplaceCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description || "",
      section: category.section,
      sort_order: category.sort_order,
    });
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      ...initialFormState,
      sort_order: Math.max(...categories.map(c => c.sort_order), 0) + 1,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const input: CreateCategoryInput = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "_"),
      icon: formData.icon,
      description: formData.description || undefined,
      section: formData.section,
      sort_order: formData.sort_order,
    };

    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, input);
    } else {
      result = await createCategory(input);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsFormOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (category: MarketplaceCategory) => {
    await updateCategory(category.id, { is_active: !category.is_active });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const renderCategoryCard = (category: MarketplaceCategory) => (
    <motion.div
      key={category.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className={`transition-opacity ${!category.is_active ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="cursor-move text-muted-foreground">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <span className="text-3xl">{category.icon}</span>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline" className="text-xs">
                  {category.slug}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={category.is_active}
                onCheckedChange={() => handleToggleActive(category)}
              />
              <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(category)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Categorias</h3>
          <p className="text-sm text-muted-foreground">
            Organize os itens da loja em categorias personalizadas
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Seção Gamificação */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          🎮 Gamificação
        </h4>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {gamificationCategories.map(renderCategoryCard)}
          </AnimatePresence>
        </div>
      </div>

      {/* Seção Recreação */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          🕹️ Recreação
        </h4>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {recreationCategories.map(renderCategoryCard)}
          </AnimatePresence>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma categoria criada</p>
          <Button variant="link" onClick={handleCreate}>
            Criar primeira categoria
          </Button>
        </div>
      )}

      {/* Modal de formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? "Atualize as informações da categoria" : "Configure uma nova categoria de itens"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Ícone */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_SUGGESTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`text-2xl p-2 rounded-lg transition-all hover:bg-muted ${
                      formData.icon === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome e Slug */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: editingCategory ? formData.slug : generateSlug(name),
                    });
                  }}
                  placeholder="Ex: Avatares Premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Identificador (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: avatar_premium"
                  disabled={!!editingCategory}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a categoria..."
              />
            </div>

            {/* Seção */}
            <div className="space-y-2">
              <Label>Seção</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {SECTION_OPTIONS.map((section) => (
                  <button
                    key={section.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, section: section.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.section === section.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-medium">{section.label}</span>
                    <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ordem */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem de exibição</Label>
              <Input
                id="sort_order"
                type="number"
                min={0}
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.slug}>
              {isSubmitting ? "Salvando..." : editingCategory ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de delete */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{deleteConfirm?.name}"?
              Itens desta categoria precisarão ser reclassificados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
