import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export interface OneOnOneTemplate {
  id: string;
  organization_id: string;
  name: string;
  questions: { id: string; question: string; section: string }[];
  is_default: boolean;
  created_by: string | null;
  created_at: string;
}

export interface OneOnOneMeeting {
  id: string;
  organization_id: string;
  manager_id: string;
  employee_id: string;
  template_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location: string | null;
  recurrence: string | null;
  created_at: string;
}

export interface OneOnOneNote {
  id: string;
  meeting_id: string;
  author_id: string;
  section: string;
  content: string;
  is_private: boolean;
  related_goal_id: string | null;
  created_at: string;
}

export interface OneOnOneActionItem {
  id: string;
  meeting_id: string;
  assigned_to: string;
  title: string;
  due_date: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export function useOneOnOne() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["one-on-one-templates", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from("one_on_one_templates")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as OneOnOneTemplate[];
    },
    enabled: !!currentOrg?.id,
  });

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["one-on-one-meetings", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from("one_on_one_meetings")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data as OneOnOneMeeting[];
    },
    enabled: !!currentOrg?.id,
  });

  const { data: myMeetings = [], isLoading: myMeetingsLoading } = useQuery({
    queryKey: ["my-one-on-one-meetings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("one_on_one_meetings")
        .select("*")
        .or(`manager_id.eq.${user.id},employee_id.eq.${user.id}`)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as OneOnOneMeeting[];
    },
    enabled: !!user?.id,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<OneOnOneTemplate>) => {
      const { data, error } = await supabase
        .from("one_on_one_templates")
        .insert({
          name: template.name!,
          questions: template.questions as never,
          organization_id: currentOrg?.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-templates"] });
      toast.success("Template criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar template");
    },
  });

  const scheduleMeeting = useMutation({
    mutationFn: async (meeting: Partial<OneOnOneMeeting>) => {
      const { data, error } = await supabase
        .from("one_on_one_meetings")
        .insert({
          manager_id: meeting.manager_id!,
          employee_id: meeting.employee_id!,
          scheduled_at: meeting.scheduled_at!,
          organization_id: currentOrg?.id,
          template_id: meeting.template_id,
          duration_minutes: meeting.duration_minutes,
          location: meeting.location,
          recurrence: meeting.recurrence,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["my-one-on-one-meetings"] });
      toast.success("Reunião agendada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao agendar reunião");
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OneOnOneMeeting> & { id: string }) => {
      const { data, error } = await supabase
        .from("one_on_one_meetings")
        .update({
          scheduled_at: updates.scheduled_at,
          status: updates.status,
          duration_minutes: updates.duration_minutes,
          location: updates.location,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["my-one-on-one-meetings"] });
      toast.success("Reunião atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar reunião");
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: Partial<OneOnOneNote>) => {
      const { data, error } = await supabase
        .from("one_on_one_notes")
        .insert({
          meeting_id: note.meeting_id,
          author_id: user?.id!,
          section: note.section!,
          content: note.content!,
          is_private: note.is_private,
          related_goal_id: note.related_goal_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-notes"] });
      toast.success("Nota adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar nota");
    },
  });

  const addActionItem = useMutation({
    mutationFn: async (actionItem: Partial<OneOnOneActionItem>) => {
      const { data, error } = await supabase
        .from("one_on_one_action_items")
        .insert({
          meeting_id: actionItem.meeting_id,
          assigned_to: actionItem.assigned_to!,
          title: actionItem.title!,
          due_date: actionItem.due_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-action-items"] });
      toast.success("Ação adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar ação");
    },
  });

  const completeActionItem = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("one_on_one_action_items")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-action-items"] });
      toast.success("Ação concluída!");
    },
    onError: () => {
      toast.error("Erro ao concluir ação");
    },
  });

  return {
    templates,
    templatesLoading,
    meetings,
    meetingsLoading,
    myMeetings,
    myMeetingsLoading,
    createTemplate,
    scheduleMeeting,
    updateMeeting,
    addNote,
    addActionItem,
    completeActionItem,
  };
}
