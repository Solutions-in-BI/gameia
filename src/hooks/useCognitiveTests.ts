import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useCoreEvents } from "@/hooks/useCoreEvents";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface CognitiveTest {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  test_type: string;
  difficulty: string;
  time_limit_minutes: number | null;
  questions_count: number;
  config: Json;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface CognitiveTestQuestion {
  id: string;
  test_id: string;
  question_type: string;
  content: {
    question: string;
    options: string[];
    explanation?: string;
    image_url?: string;
  };
  correct_answer: string;
  difficulty: number;
  avg_time_seconds: number | null;
  sort_order: number | null;
  created_at: string;
}

export interface CognitiveTestSession {
  id: string;
  test_id: string;
  user_id: string;
  organization_id: string;
  started_at: string;
  completed_at: string | null;
  is_proctored: boolean;
  answers: { question_id: string; answer: string; time_seconds: number }[];
  score: number | null;
  percentile: number | null;
  status: string;
}

export interface CognitiveProfile {
  id: string;
  user_id: string;
  organization_id: string;
  logical_reasoning: number | null;
  numerical_ability: number | null;
  verbal_reasoning: number | null;
  spatial_reasoning: number | null;
  attention_to_detail: number | null;
  working_memory: number | null;
  processing_speed: number | null;
  overall_score: number | null;
  assessments_count: number;
  last_assessed_at: string | null;
  updated_at: string;
}

export function useCognitiveTests() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { recordTestCompleted } = useCoreEvents();
  const queryClient = useQueryClient();

  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["cognitive-tests", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from("cognitive_tests")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CognitiveTest[];
    },
    enabled: !!currentOrg?.id,
  });

  const { data: myProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-cognitive-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("cognitive_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CognitiveProfile | null;
    },
    enabled: !!user?.id,
  });

  const { data: mySessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["my-cognitive-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("cognitive_test_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as unknown as CognitiveTestSession[];
    },
    enabled: !!user?.id,
  });

  const getQuestionsForTest = async (testId: string): Promise<CognitiveTestQuestion[]> => {
    const { data, error } = await supabase
      .from("cognitive_test_questions")
      .select("*")
      .eq("test_id", testId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data as unknown as CognitiveTestQuestion[];
  };

  const createTest = useMutation({
    mutationFn: async (test: Partial<CognitiveTest>) => {
      const { data, error } = await supabase
        .from("cognitive_tests")
        .insert({
          name: test.name!,
          test_type: test.test_type!,
          organization_id: currentOrg?.id,
          description: test.description,
          difficulty: test.difficulty,
          time_limit_minutes: test.time_limit_minutes,
          xp_reward: test.xp_reward,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cognitive-tests"] });
      toast.success("Teste criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar teste");
    },
  });

  const updateTest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CognitiveTest> & { id: string }) => {
      const { data, error } = await supabase
        .from("cognitive_tests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cognitive-tests"] });
      toast.success("Teste atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar teste");
    },
  });

  const addQuestion = useMutation({
    mutationFn: async (question: Partial<CognitiveTestQuestion>) => {
      const { data, error } = await supabase
        .from("cognitive_test_questions")
        .insert({
          test_id: question.test_id,
          question_type: question.question_type!,
          content: question.content as never,
          correct_answer: question.correct_answer!,
          difficulty: question.difficulty,
          sort_order: question.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cognitive-test-questions"] });
      queryClient.invalidateQueries({ queryKey: ["cognitive-tests"] });
      toast.success("Questão adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar questão");
    },
  });

  const startSession = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase
        .from("cognitive_test_sessions")
        .insert({
          test_id: testId,
          user_id: user?.id!,
          organization_id: currentOrg?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cognitive-sessions"] });
    },
    onError: () => {
      toast.error("Erro ao iniciar teste");
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({
      sessionId,
      answers,
      score,
      testId,
      targetScore = 70,
      xpReward = 0,
      relatedSkills = [],
    }: {
      sessionId: string;
      answers: { question_id: string; answer: string; time_seconds: number }[];
      score: number;
      testId: string;
      targetScore?: number;
      xpReward?: number;
      relatedSkills?: string[];
    }) => {
      const { data, error } = await supabase
        .from("cognitive_test_sessions")
        .update({
          answers,
          score,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;

      // Registrar evento no motor de eventos
      await recordTestCompleted(
        testId,
        score,
        targetScore,
        xpReward,
        relatedSkills
      );

      return { ...data, score };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-cognitive-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["my-cognitive-profile"] });
      queryClient.invalidateQueries({ queryKey: ["assessment-suggestions"] });
      toast.success(`Teste concluído! Score: ${data.score}%`);
    },
    onError: () => {
      toast.error("Erro ao finalizar teste");
    },
  });

  return {
    tests,
    testsLoading,
    myProfile,
    profileLoading,
    mySessions,
    sessionsLoading,
    getQuestionsForTest,
    createTest,
    updateTest,
    addQuestion,
    startSession,
    completeSession,
  };
}
