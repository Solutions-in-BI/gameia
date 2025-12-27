import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface SalesStage {
  id: string;
  stage_order: number;
  stage_key: string;
  stage_label: string;
  description: string | null;
  tips: string | null;
  icon: string | null;
}

export interface SalesPersona {
  id: string;
  name: string;
  role: string | null;
  company_name: string | null;
  company_type: string | null;
  personality: string;
  pain_points: string[] | null;
  decision_factors: string[] | null;
  avatar: string | null;
  difficulty: string | null;
}

export interface ResponseOption {
  text: string;
  rapport_change: number;
  skill_tags: string[];
  feedback: string;
  is_optimal: boolean;
  leads_to_next_stage: boolean;
}

export interface MessageTemplate {
  id: string;
  stage_key: string;
  persona_personality: string | null;
  sequence_order: number;
  client_message: string;
  response_options: ResponseOption[];
  context_hint: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'player';
  text: string;
  feedback?: string;
  isOptimal?: boolean;
}

export interface SkillScore {
  rapport_building: number;
  needs_analysis: number;
  product_knowledge: number;
  value_proposition: number;
  objection_handling: number;
  closing_technique: number;
  time_management: number;
}

interface GameSession {
  id: string;
  started_at: string;
  rapport: number;
  score: number;
  sale_closed: boolean;
  skills: SkillScore;
  stage_performance: Record<string, { score: number; time: number }>;
  conversation_history: ChatMessage[];
}

const INITIAL_SKILLS: SkillScore = {
  rapport_building: 50,
  needs_analysis: 50,
  product_knowledge: 50,
  value_proposition: 50,
  objection_handling: 50,
  closing_technique: 50,
  time_management: 50,
};

const STAGE_ORDER = ['opening', 'discovery', 'presentation', 'objection', 'closing'];

export function useSalesGame() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  
  // Game data
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [personas, setPersonas] = useState<SalesPersona[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game state
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [selectedPersona, setSelectedPersona] = useState<SalesPersona | null>(null);
  const [currentStageKey, setCurrentStageKey] = useState<string>('opening');
  const [currentSequence, setCurrentSequence] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rapport, setRapport] = useState(50);
  const [score, setScore] = useState(0);
  const [skills, setSkills] = useState<SkillScore>(INITIAL_SKILLS);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [stagePerformance, setStagePerformance] = useState<Record<string, { score: number; time: number }>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ text: string; isOptimal: boolean } | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Fetch game data from database
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      try {
        // Fetch stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('sales_conversation_stages')
          .select('*')
          .order('stage_order');
        
        if (stagesError) throw stagesError;
        setStages(stagesData || []);

        // Fetch personas
        const { data: personasData, error: personasError } = await supabase
          .from('sales_client_personas')
          .select('*')
          .eq('is_active', true);
        
        if (personasError) throw personasError;
        setPersonas(personasData || []);

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('sales_message_templates')
          .select('*')
          .eq('is_active', true)
          .order('sequence_order');
        
        if (templatesError) throw templatesError;
        
        // Parse response_options from JSON
        const parsedTemplates = (templatesData || []).map(t => ({
          ...t,
          response_options: typeof t.response_options === 'string' 
            ? JSON.parse(t.response_options) 
            : t.response_options
        })) as MessageTemplate[];
        
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error fetching sales game data:', error);
        toast.error('Erro ao carregar dados do jogo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [currentOrg?.id]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Get current stage info
  const currentStage = stages.find(s => s.stage_key === currentStageKey);
  const currentStageIndex = STAGE_ORDER.indexOf(currentStageKey);

  // Get available templates for current stage and persona
  const getAvailableTemplates = useCallback(() => {
    if (!selectedPersona) return [];
    
    return templates.filter(t => 
      t.stage_key === currentStageKey && 
      (t.persona_personality === null || t.persona_personality === selectedPersona.personality)
    ).sort((a, b) => a.sequence_order - b.sequence_order);
  }, [templates, currentStageKey, selectedPersona]);

  // Get current template
  const getCurrentTemplate = useCallback(() => {
    const available = getAvailableTemplates();
    return available.find(t => t.sequence_order === currentSequence) || available[0];
  }, [getAvailableTemplates, currentSequence]);

  // Start game with selected persona
  const startGame = useCallback(async (persona: SalesPersona) => {
    setSelectedPersona(persona);
    setGameState('playing');
    setCurrentStageKey('opening');
    setCurrentSequence(1);
    setRapport(50);
    setScore(0);
    setSkills(INITIAL_SKILLS);
    setTimeLeft(300);
    setStageStartTime(Date.now());
    setStagePerformance({});
    setMessages([]);
    setShowFeedback(null);

    // Get first template for opening stage
    const openingTemplates = templates.filter(t => 
      t.stage_key === 'opening' && 
      (t.persona_personality === null || t.persona_personality === persona.personality)
    ).sort((a, b) => a.sequence_order - b.sequence_order);

    const firstTemplate = openingTemplates[0];
    if (firstTemplate) {
      setMessages([{
        id: `client-${Date.now()}`,
        sender: 'client',
        text: firstTemplate.client_message
      }]);
      setCurrentHint(firstTemplate.context_hint);
    }

    // Create session in database
    if (user) {
      try {
        const { data, error } = await supabase
          .from('sales_game_sessions')
          .insert({
            user_id: user.id,
            organization_id: currentOrg?.id || null,
            persona_id: persona.id,
            final_rapport: 50,
            sale_closed: false,
            total_score: 0,
            skills_measured: INITIAL_SKILLS as unknown as Json,
            stage_performance: {} as Json,
            conversation_history: [] as Json
          })
          .select()
          .single();

        if (!error && data) {
          setSessionId(data.id);
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
  }, [user, currentOrg, templates]);

  // Handle player response
  const handleResponse = useCallback((option: ResponseOption) => {
    // Add player message
    const playerMessage: ChatMessage = {
      id: `player-${Date.now()}`,
      sender: 'player',
      text: option.text,
      feedback: option.feedback,
      isOptimal: option.is_optimal
    };
    setMessages(prev => [...prev, playerMessage]);

    // Update rapport
    const newRapport = Math.min(100, Math.max(0, rapport + option.rapport_change));
    setRapport(newRapport);

    // Update score
    const points = option.is_optimal ? 20 : option.rapport_change > 0 ? 10 : 0;
    setScore(prev => prev + points);

    // Update skills
    if (option.skill_tags && option.skill_tags.length > 0) {
      setSkills(prev => {
        const newSkills = { ...prev };
        option.skill_tags.forEach(tag => {
          const key = tag as keyof SkillScore;
          if (key in newSkills) {
            const change = option.is_optimal ? 10 : option.rapport_change > 0 ? 5 : -5;
            newSkills[key] = Math.min(100, Math.max(0, newSkills[key] + change));
          }
        });
        return newSkills;
      });
    }

    // Show feedback
    setShowFeedback({ text: option.feedback, isOptimal: option.is_optimal });
    
    // Determine next action after delay
    setTimeout(() => {
      setShowFeedback(null);

      // Check for game end conditions
      if (newRapport <= 0) {
        endGame(false);
        return;
      }

      if (option.leads_to_next_stage) {
        // Record stage performance
        const stageDuration = Math.round((Date.now() - stageStartTime) / 1000);
        setStagePerformance(prev => ({
          ...prev,
          [currentStageKey]: { score: points, time: stageDuration }
        }));

        // Move to next stage
        const nextStageIndex = currentStageIndex + 1;
        if (nextStageIndex >= STAGE_ORDER.length) {
          // Game completed successfully
          endGame(newRapport >= 50);
        } else {
          const nextStageKey = STAGE_ORDER[nextStageIndex];
          setCurrentStageKey(nextStageKey);
          setCurrentSequence(1);
          setStageStartTime(Date.now());

          // Get first template for next stage
          const nextTemplates = templates.filter(t => 
            t.stage_key === nextStageKey && 
            (t.persona_personality === null || 
              (selectedPersona && t.persona_personality === selectedPersona.personality))
          ).sort((a, b) => a.sequence_order - b.sequence_order);

          const nextTemplate = nextTemplates[0];
          if (nextTemplate) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: `client-${Date.now()}`,
                sender: 'client',
                text: nextTemplate.client_message
              }]);
              setCurrentHint(nextTemplate.context_hint);
            }, 500);
          }
        }
      } else {
        // Stay in same stage, next sequence
        const availableTemplates = getAvailableTemplates();
        const nextSequence = currentSequence + 1;
        const nextTemplate = availableTemplates.find(t => t.sequence_order === nextSequence);

        if (nextTemplate) {
          setCurrentSequence(nextSequence);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: `client-${Date.now()}`,
              sender: 'client',
              text: nextTemplate.client_message
            }]);
            setCurrentHint(nextTemplate.context_hint);
          }, 500);
        } else {
          // No more templates in this stage, force move to next
          const nextStageIndex = currentStageIndex + 1;
          if (nextStageIndex >= STAGE_ORDER.length) {
            endGame(newRapport >= 50);
          } else {
            const nextStageKey = STAGE_ORDER[nextStageIndex];
            setCurrentStageKey(nextStageKey);
            setCurrentSequence(1);
            setStageStartTime(Date.now());

            const nextTemplates = templates.filter(t => 
              t.stage_key === nextStageKey && 
              (t.persona_personality === null || 
                (selectedPersona && t.persona_personality === selectedPersona.personality))
            ).sort((a, b) => a.sequence_order - b.sequence_order);

            const nextTemplate = nextTemplates[0];
            if (nextTemplate) {
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  id: `client-${Date.now()}`,
                  sender: 'client',
                  text: nextTemplate.client_message
                }]);
                setCurrentHint(nextTemplate.context_hint);
              }, 500);
            }
          }
        }
      }
    }, 1500);
  }, [
    rapport, 
    stageStartTime, 
    currentStageKey, 
    currentStageIndex, 
    currentSequence, 
    templates, 
    selectedPersona, 
    getAvailableTemplates
  ]);

  // End game
  const endGame = useCallback(async (saleClosed: boolean) => {
    setGameState('results');

    // Update session in database
    if (sessionId && user) {
      try {
        const timeSpent = 300 - timeLeft;
        await supabase
          .from('sales_game_sessions')
          .update({
            completed_at: new Date().toISOString(),
            final_rapport: rapport,
            sale_closed: saleClosed,
            total_score: score,
            time_spent_seconds: timeSpent,
            skills_measured: skills as unknown as Json,
            stage_performance: stagePerformance as unknown as Json,
            conversation_history: messages as unknown as Json
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  }, [sessionId, user, timeLeft, rapport, score, skills, stagePerformance, messages]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('intro');
    setSelectedPersona(null);
    setCurrentStageKey('opening');
    setCurrentSequence(1);
    setMessages([]);
    setRapport(50);
    setScore(0);
    setSkills(INITIAL_SKILLS);
    setTimeLeft(300);
    setStagePerformance({});
    setSessionId(null);
    setShowFeedback(null);
    setCurrentHint(null);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // Data
    stages,
    personas,
    isLoading,
    
    // Game state
    gameState,
    setGameState,
    selectedPersona,
    currentStage,
    currentStageIndex,
    messages,
    rapport,
    score,
    skills,
    timeLeft: formatTime(timeLeft),
    timeLeftSeconds: timeLeft,
    showFeedback,
    currentHint,
    
    // Current template
    currentTemplate: getCurrentTemplate(),
    
    // Actions
    startGame,
    handleResponse,
    resetGame,
    endGame,
    
    // Computed
    totalStages: STAGE_ORDER.length,
    stagePerformance,
  };
}
