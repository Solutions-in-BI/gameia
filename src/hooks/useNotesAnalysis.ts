import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotesAnalysis {
  summary?: string;
  keyTopics?: string[];
  strengthAreas?: string[];
  developmentAreas?: string[];
  patterns?: Array<{
    pattern: string;
    insight: string;
    frequency?: string;
  }>;
  reviewSuggestions?: Array<{
    noteId?: string;
    reason: string;
    priority: string;
  }>;
  recommendations?: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
  focusAreas?: string[];
  blindSpots?: string[];
  nextSteps?: string[];
  motivationalMessage?: string;
  reviewTip?: string;
}

type AnalysisAction = 'summary' | 'patterns' | 'review' | 'recommendations' | 'full';

export function useNotesAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NotesAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeNotes = useCallback(async (action: AnalysisAction = 'full') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await supabase.functions.invoke('analyze-notes', {
        body: { action },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao analisar anotações');
      }

      setAnalysis(response.data.data);
      return response.data.data;
    } catch (err: any) {
      console.error('Error analyzing notes:', err);
      setError(err.message);
      toast.error('Erro ao analisar anotações');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analyzeNotes,
    clearAnalysis,
    analysis,
    isAnalyzing,
    error,
  };
}
