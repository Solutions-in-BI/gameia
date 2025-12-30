import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type NoteStatus = "draft" | "applied" | "reviewed";
export type NoteContentType = "video" | "text" | "quiz" | "game" | "pdf" | "link" | "reflection";

export interface TrainingNote {
  id: string;
  user_id: string;
  organization_id: string | null;
  training_id: string;
  module_id: string;
  content_type: NoteContentType;
  timestamp_seconds: number | null;
  text_selection: string | null;
  quiz_question_index: number | null;
  game_context: Record<string, unknown> | null;
  title: string | null;
  content: string;
  skill_ids: string[] | null;
  status: NoteStatus;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  training?: {
    id: string;
    name: string;
    thumbnail_url?: string;
  };
  module?: {
    id: string;
    name: string;
  };
}

export interface CreateNoteInput {
  training_id: string;
  module_id: string;
  content_type: NoteContentType;
  content: string;
  title?: string;
  timestamp_seconds?: number;
  text_selection?: string;
  quiz_question_index?: number;
  game_context?: Record<string, unknown>;
  skill_ids?: string[];
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  status?: NoteStatus;
  tags?: string[];
  is_favorite?: boolean;
}

export interface NotesFilters {
  training_id?: string;
  skill_id?: string;
  status?: NoteStatus;
  is_favorite?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export function useTrainingNotes(filters?: NotesFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notes with optional filters
  const {
    data: notes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["training-notes", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("training_notes")
        .select(`
          *,
          training:trainings(id, name, thumbnail_url),
          module:training_modules(id, name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.training_id) {
        query = query.eq("training_id", filters.training_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.is_favorite !== undefined) {
        query = query.eq("is_favorite", filters.is_favorite);
      }
      if (filters?.skill_id) {
        query = query.contains("skill_ids", [filters.skill_id]);
      }
      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TrainingNote[];
    },
    enabled: !!user?.id,
  });

  // Get user's organization
  const getOrganizationId = useCallback(async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.organization_id || null;
  }, [user?.id]);

  // Create note
  const createNoteMutation = useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const organization_id = await getOrganizationId();

      const insertData = {
        user_id: user.id,
        organization_id,
        training_id: input.training_id,
        module_id: input.module_id,
        content_type: input.content_type,
        content: input.content,
        title: input.title || null,
        timestamp_seconds: input.timestamp_seconds ?? null,
        text_selection: input.text_selection || null,
        quiz_question_index: input.quiz_question_index ?? null,
        game_context: (input.game_context as Json) || null,
        skill_ids: input.skill_ids || null,
        tags: input.tags || null,
      };

      const { data, error } = await supabase
        .from("training_notes")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-notes"] });
      toast.success("Anotação salva com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      toast.error("Erro ao salvar anotação");
    },
  });

  // Update note
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...input }: UpdateNoteInput & { id: string }) => {
      const { data, error } = await supabase
        .from("training_notes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-notes"] });
      toast.success("Anotação atualizada!");
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      toast.error("Erro ao atualizar anotação");
    },
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("training_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-notes"] });
      toast.success("Anotação excluída!");
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast.error("Erro ao excluir anotação");
    },
  });

  // Toggle favorite
  const toggleFavorite = useCallback(async (note: TrainingNote) => {
    await updateNoteMutation.mutateAsync({
      id: note.id,
      is_favorite: !note.is_favorite,
    });
  }, [updateNoteMutation]);

  // Update status
  const updateStatus = useCallback(async (id: string, status: NoteStatus) => {
    await updateNoteMutation.mutateAsync({ id, status });
  }, [updateNoteMutation]);

  // Get notes stats
  const stats = {
    total: notes.length,
    draft: notes.filter(n => n.status === "draft").length,
    applied: notes.filter(n => n.status === "applied").length,
    reviewed: notes.filter(n => n.status === "reviewed").length,
    favorites: notes.filter(n => n.is_favorite).length,
  };

  return {
    notes,
    isLoading,
    error,
    refetch,
    stats,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    toggleFavorite,
    updateStatus,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
}

// Hook to get notes for a specific module
export function useModuleNotes(trainingId: string, moduleId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["module-notes", trainingId, moduleId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("training_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("training_id", trainingId)
        .eq("module_id", moduleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrainingNote[];
    },
    enabled: !!user?.id && !!trainingId && !!moduleId,
  });
}
