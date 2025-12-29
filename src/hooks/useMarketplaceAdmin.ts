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
  expires_after_use?: boolean | null;
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
        name: input.name,
        description: input.description ?? null,
        icon: input.icon,
        image_url: input.image_url ?? null,
        category: input.category,
        price: input.price,
        rarity: input.rarity,
        stock: input.stock ?? null,
        is_limited_edition: input.is_limited_edition ?? false,
        is_featured: input.is_featured ?? false,
        sort_order: input.sort_order ?? 0,
        item_type: input.item_type ?? "cosmetic",
        requires_approval: input.requires_approval ?? false,
        usage_instructions: input.usage_instructions ?? null,
        max_uses: input.max_uses ?? null,
        expires_after_purchase: input.expires_after_purchase ?? null,
        expires_after_use: input.expires_after_use ?? false,
        boost_type: input.boost_type ?? null,
        boost_value: input.boost_value ?? null,
        boost_duration_hours: input.boost_duration_hours ?? null,
        organization_id: currentOrg?.id ?? null,
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
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.rarity !== undefined) updateData.rarity = updates.rarity;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.is_limited_edition !== undefined) updateData.is_limited_edition = updates.is_limited_edition;
    if (updates.is_featured !== undefined) updateData.is_featured = updates.is_featured;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order;
    if (updates.item_type !== undefined) updateData.item_type = updates.item_type;
    if (updates.requires_approval !== undefined) updateData.requires_approval = updates.requires_approval;
    if (updates.usage_instructions !== undefined) updateData.usage_instructions = updates.usage_instructions;
    if (updates.max_uses !== undefined) updateData.max_uses = updates.max_uses;
    if (updates.expires_after_purchase !== undefined) updateData.expires_after_purchase = updates.expires_after_purchase;
    if (updates.expires_after_use !== undefined) updateData.expires_after_use = updates.expires_after_use;
    if (updates.boost_type !== undefined) updateData.boost_type = updates.boost_type;
    if (updates.boost_value !== undefined) updateData.boost_value = updates.boost_value;
    if (updates.boost_duration_hours !== undefined) updateData.boost_duration_hours = updates.boost_duration_hours;

    const { error } = await supabase
      .from("marketplace_items")
      .update(updateData)
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
