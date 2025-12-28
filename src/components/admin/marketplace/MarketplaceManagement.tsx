import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Package, Tag, Star, StarOff, 
  Eye, EyeOff, Pencil, Trash2, Layers, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useMarketplaceAdmin, MarketplaceItemAdmin, MarketplaceCategory } from "@/hooks/useMarketplaceAdmin";
import { MarketplaceItemForm } from "./MarketplaceItemForm";
import { CategoryManagement } from "./CategoryManagement";

const RARITY_COLORS: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export function MarketplaceManagement() {
  const { items, categories, isLoading, toggleItemActive, toggleItemFeatured, deleteItem } = useMarketplaceAdmin();
  
  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItemAdmin | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MarketplaceItemAdmin | null>(null);

  // Filtrar itens
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estatísticas
  const stats = {
    total: items.length,
    active: items.filter(i => i.is_active).length,
    featured: items.filter(i => i.is_featured).length,
    limited: items.filter(i => i.is_limited_edition).length,
  };

  const handleEdit = (item: MarketplaceItemAdmin) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteItem(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Loja Virtual
          </h2>
          <p className="text-muted-foreground">Gerencie os itens disponíveis na loja do app</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" /> {stats.total} itens
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-green-500" /> {stats.active} ativos
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" /> {stats.featured} destaque
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Itens
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar itens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          </div>

          {/* Grid de itens */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={`relative overflow-hidden transition-all ${!item.is_active ? "opacity-60" : ""}`}>
                    {item.is_featured && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-bl">
                        ⭐ Destaque
                      </div>
                    )}
                    
                    {item.is_limited_edition && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br">
                        Limitado
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{item.icon}</span>
                          <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={RARITY_COLORS[item.rarity]}>
                                {RARITY_LABELS[item.rarity] || item.rarity}
                              </Badge>
                              <span className="text-sm text-amber-500 font-medium">
                                🪙 {item.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || "Sem descrição"}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {categories.find(c => c.slug === item.category)?.name || item.category}
                        </span>
                        {item.stock !== null && (
                          <span className="text-muted-foreground">
                            Estoque: {item.stock}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_active}
                              onCheckedChange={(checked) => toggleItemActive(item.id, checked)}
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleItemFeatured(item.id, !item.is_featured)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            title={item.is_featured ? "Remover destaque" : "Destacar"}
                          >
                            {item.is_featured ? (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item encontrado</p>
              <Button variant="link" onClick={() => setIsFormOpen(true)}>
                Criar primeiro item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManagement />
        </TabsContent>
      </Tabs>

      {/* Modal de formulário */}
      <MarketplaceItemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editItem={editingItem}
        categories={categories}
      />

      {/* Confirmação de delete */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{deleteConfirm?.name}"? 
              Esta ação não pode ser desfeita e afetará usuários que já possuem este item.
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
