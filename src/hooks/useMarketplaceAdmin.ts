import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import { useToast } from "./use-toast";

export interface MarketplaceCategory {
  id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  section: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MarketplaceItemAdmin {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  image_url: string | null;
  category: string;
  price: number;
  rarity: string;
  is_active: boolean;
  organization_id: string | null;
  stock: number | null;
  is_limited_edition: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  created_by: string | null;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  icon: string;
  image_url?: string;
  category: string;
  price: number;
  rarity: string;
  stock?: number | null;
  is_limited_edition?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  // New fields
  item_type?: string;
  requires_approval?: boolean;
  usage_instructions?: string | null;
  max_uses?: number | null;
  expires_after_purchase?: number | null;
  expires_after_use?: number | null;
  boost_type?: string | null;
  boost_value?: number | null;
  boost_duration_hours?: number | null;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  section: string;
  sort_order?: number;
}

export function useMarketplaceAdmin() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { toast } = useToast();

  const [items, setItems] = useState<MarketplaceItemAdmin[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar itens do marketplace (globais + organização)
  const fetchItems = useCallback(async () => {
    const query = supabase
      .from("marketplace_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    // Filtrar por organização ou globais
    if (currentOrg?.id) {
      query.or(`organization_id.eq.${currentOrg.id},organization_id.is.null`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar itens:", error);
      return;
    }

    setItems((data || []) as MarketplaceItemAdmin[]);
  }, [currentOrg?.id]);

  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return;
    }

    setCategories(data || []);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchItems(), fetchCategories()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchItems, fetchCategories]);

  // Criar item
  const createItem = async (input: CreateItemInput) => {
    if (!user) return { success: false, error: "Não autenticado" };

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert({
        ...input,
        organization_id: currentOrg?.id || null,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar item", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchItems();
    toast({ title: "Item criado!", description: `${input.name} foi adicionado à loja.` });
    return { success: true, item: data };
  };

  // Atualizar item
  const updateItem = async (id: string, updates: Partial<CreateItemInput & { is_active: boolean }>) => {
    const { error } = await supabase
      .from("marketplace_items")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar item", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchItems();
    toast({ title: "Item atualizado!" });
    return { success: true };
  };

  // Deletar item
  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao deletar item", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchItems();
    toast({ title: "Item removido!" });
    return { success: true };
  };

  // Toggle ativo
  const toggleItemActive = async (id: string, isActive: boolean) => {
    return updateItem(id, { is_active: isActive });
  };

  // Toggle destaque
  const toggleItemFeatured = async (id: string, isFeatured: boolean) => {
    return updateItem(id, { is_featured: isFeatured });
  };

  // Criar categoria
  const createCategory = async (input: CreateCategoryInput) => {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .insert({
        ...input,
        organization_id: currentOrg?.id || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar categoria", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchCategories();
    toast({ title: "Categoria criada!", description: `${input.name} foi adicionada.` });
    return { success: true, category: data };
  };

  // Atualizar categoria
  const updateCategory = async (id: string, updates: Partial<CreateCategoryInput & { is_active: boolean }>) => {
    const { error } = await supabase
      .from("marketplace_categories")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar categoria", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchCategories();
    toast({ title: "Categoria atualizada!" });
    return { success: true };
  };

  // Deletar categoria
  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("marketplace_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao deletar categoria", description: error.message, variant: "destructive" });
      return { success: false, error: error.message };
    }

    await fetchCategories();
    toast({ title: "Categoria removida!" });
    return { success: true };
  };

  // Estatísticas
  const getStats = useCallback(async () => {
    const totalItems = items.length;
    const activeItems = items.filter(i => i.is_active).length;
    const featuredItems = items.filter(i => i.is_featured).length;
    const limitedItems = items.filter(i => i.is_limited_edition).length;

    return {
      totalItems,
      activeItems,
      featuredItems,
      limitedItems,
      totalCategories: categories.length,
    };
  }, [items, categories]);

  return {
    items,
    categories,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    toggleItemActive,
    toggleItemFeatured,
    createCategory,
    updateCategory,
    deleteCategory,
    getStats,
    refresh: () => Promise.all([fetchItems(), fetchCategories()]),
  };
}
