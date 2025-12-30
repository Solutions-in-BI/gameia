import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrainingModule {
  id: string;
  training_id: string;
  name: string;
  description: string | null;
  content_type: string | null;
  content_data: Record<string, unknown> | null;
  order_index: number;
  xp_reward: number;
  coins_reward: number;
  time_minutes: number;
  is_required: boolean;
  is_optional: boolean;
  is_checkpoint: boolean;
  min_score: number | null;
  step_type: string | null;
  step_config: Record<string, unknown> | null;
  video_url: string | null;
  parent_module_id: string | null;
  level: number;
  numbering: string | null;
  unlock_condition: Record<string, unknown> | null;
  skill_impacts: unknown[] | null;
  game_config: Record<string, unknown> | null;
  is_preview_available: boolean;
  skill_ids: string[] | null;
}

export interface ModuleWithChildren extends TrainingModule {
  children: ModuleWithChildren[];
}

interface UseTrainingEditorResult {
  modules: ModuleWithChildren[];
  flatModules: TrainingModule[];
  selectedModule: TrainingModule | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  
  selectModule: (id: string | null) => void;
  
  addModule: (parentId?: string | null) => Promise<string | null>;
  updateModule: (id: string, data: Partial<TrainingModule>) => void;
  deleteModule: (id: string) => Promise<void>;
  duplicateModule: (id: string) => Promise<string | null>;
  
  reorderModules: (modules: ModuleWithChildren[]) => void;
  
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  refetch: () => Promise<void>;
}

export function useTrainingEditor(trainingId: string): UseTrainingEditorResult {
  const [flatModules, setFlatModules] = useState<TrainingModule[]>([]);
  const [originalModules, setOriginalModules] = useState<TrainingModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("training_modules")
      .select("*")
      .eq("training_id", trainingId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching modules:", error);
      toast.error("Erro ao carregar módulos");
      setIsLoading(false);
      return;
    }

    const modules = (data || []).map(m => ({
      ...m,
      content_data: m.content_data as Record<string, unknown> | null,
      step_config: m.step_config as Record<string, unknown> | null,
      unlock_condition: m.unlock_condition as Record<string, unknown> | null,
      skill_impacts: m.skill_impacts as unknown[] | null,
      game_config: m.game_config as Record<string, unknown> | null,
    }));

    setFlatModules(modules);
    setOriginalModules(JSON.parse(JSON.stringify(modules)));
    setIsLoading(false);
  }, [trainingId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Build tree structure from flat modules
  const buildTree = useCallback((modules: TrainingModule[]): ModuleWithChildren[] => {
    const moduleMap = new Map<string, ModuleWithChildren>();
    const roots: ModuleWithChildren[] = [];

    // Create all nodes
    modules.forEach(m => {
      moduleMap.set(m.id, { ...m, children: [] });
    });

    // Build tree
    modules.forEach(m => {
      const node = moduleMap.get(m.id)!;
      if (m.parent_module_id && moduleMap.has(m.parent_module_id)) {
        moduleMap.get(m.parent_module_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by order_index
    const sortChildren = (nodes: ModuleWithChildren[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index);
      nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);

    return roots;
  }, []);

  const modules = buildTree(flatModules);

  const selectedModule = flatModules.find(m => m.id === selectedModuleId) || null;

  const isDirty = JSON.stringify(flatModules) !== JSON.stringify(originalModules);

  const selectModule = (id: string | null) => {
    setSelectedModuleId(id);
  };

  const addModule = async (parentId?: string | null): Promise<string | null> => {
    // Calculate next order_index
    const siblings = flatModules.filter(m => 
      parentId ? m.parent_module_id === parentId : !m.parent_module_id
    );
    const maxOrder = siblings.reduce((max, m) => Math.max(max, m.order_index), -1);

    const newModule = {
      training_id: trainingId,
      name: parentId ? "Nova Etapa" : "Novo Módulo",
      description: null as string | null,
      content_type: "text",
      step_type: "content",
      order_index: maxOrder + 1,
      xp_reward: 10,
      coins_reward: 5,
      time_minutes: 5,
      is_required: true,
      is_optional: false,
      is_checkpoint: false,
      parent_module_id: parentId || null,
      level: parentId ? 1 : 0,
      is_preview_available: false,
    };

    const { data, error } = await supabase
      .from("training_modules")
      .insert(newModule)
      .select()
      .single();

    if (error) {
      console.error("Error creating module:", error);
      toast.error("Erro ao criar módulo");
      return null;
    }

    await fetchModules();
    setSelectedModuleId(data.id);
    toast.success(parentId ? "Etapa criada" : "Módulo criado");
    return data.id;
  };

  const updateModule = (id: string, data: Partial<TrainingModule>) => {
    setFlatModules(prev => 
      prev.map(m => m.id === id ? { ...m, ...data } : m)
    );
  };

  const deleteModule = async (id: string) => {
    const { error } = await supabase
      .from("training_modules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting module:", error);
      toast.error("Erro ao excluir módulo");
      return;
    }

    if (selectedModuleId === id) {
      setSelectedModuleId(null);
    }

    await fetchModules();
    toast.success("Módulo excluído");
  };

  const duplicateModule = async (id: string): Promise<string | null> => {
    const original = flatModules.find(m => m.id === id);
    if (!original) return null;

    const siblings = flatModules.filter(m => 
      original.parent_module_id 
        ? m.parent_module_id === original.parent_module_id 
        : !m.parent_module_id
    );
    const maxOrder = siblings.reduce((max, m) => Math.max(max, m.order_index), -1);

    const { id: _id, numbering: _numbering, ...rest } = original;

    const insertData = {
      training_id: rest.training_id,
      name: `${original.name} (cópia)`,
      description: rest.description,
      content_type: rest.content_type,
      order_index: maxOrder + 1,
      xp_reward: rest.xp_reward,
      coins_reward: rest.coins_reward,
      time_minutes: rest.time_minutes,
      is_required: rest.is_required,
      is_optional: rest.is_optional,
      is_checkpoint: rest.is_checkpoint,
      step_type: rest.step_type,
      parent_module_id: rest.parent_module_id,
      level: rest.level,
      is_preview_available: rest.is_preview_available,
    };

    const { data, error } = await supabase
      .from("training_modules")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error duplicating module:", error);
      toast.error("Erro ao duplicar módulo");
      return null;
    }

    await fetchModules();
    toast.success("Módulo duplicado");
    return data.id;
  };

  const reorderModules = (newTree: ModuleWithChildren[]) => {
    // Flatten tree back with updated order_index and parent_module_id
    const flatten = (nodes: ModuleWithChildren[], parentId: string | null = null): TrainingModule[] => {
      const result: TrainingModule[] = [];
      nodes.forEach((node, index) => {
        const { children, ...module } = node;
        result.push({
          ...module,
          parent_module_id: parentId,
          order_index: index,
          level: parentId ? 1 : 0,
        });
        result.push(...flatten(children, node.id));
      });
      return result;
    };

    setFlatModules(flatten(newTree));
  };

  const saveChanges = async () => {
    setIsSaving(true);

    try {
      // Update all modules that have changed
      const updates = flatModules.filter((m, i) => {
        const original = originalModules.find(o => o.id === m.id);
        return !original || JSON.stringify(m) !== JSON.stringify(original);
      });

      for (const module of updates) {
        const { id, numbering, ...data } = module;
        const { error } = await supabase
          .from("training_modules")
          .update(data)
          .eq("id", id);

        if (error) throw error;
      }

      setOriginalModules(JSON.parse(JSON.stringify(flatModules)));
      toast.success("Alterações salvas");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setFlatModules(JSON.parse(JSON.stringify(originalModules)));
    toast.info("Alterações descartadas");
  };

  return {
    modules,
    flatModules,
    selectedModule,
    isLoading,
    isSaving,
    isDirty,
    selectModule,
    addModule,
    updateModule,
    deleteModule,
    duplicateModule,
    reorderModules,
    saveChanges,
    discardChanges,
    refetch: fetchModules,
  };
}
