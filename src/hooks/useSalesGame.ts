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
  quality: 'optimal' | 'good' | 'neutral' | 'poor';
  rapport_impact: number;
  score_value: number;
  feedback: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'player';
  text: string;
  feedback?: string;
  isOptimal?: boolean;
}

export interface SkillScore {
  rapport: number;
  discovery: number;
  presentation: number;
  objection: number;
  closing: number;
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
  rapport: 50,
  discovery: 50,
  presentation: 50,
  objection: 50,
  closing: 50,
};

const STAGE_ORDER = ['opening', 'discovery', 'presentation', 'objection', 'closing'];

export function useSalesGame() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  
  // Game data
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [personas, setPersonas] = useState<SalesPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game state
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [selectedPersona, setSelectedPersona] = useState<SalesPersona | null>(null);
  const [currentStageKey, setCurrentStageKey] = useState<string>('opening');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responseOptions, setResponseOptions] = useState<ResponseOption[]>([]);
  const [rapport, setRapport] = useState(50);
  const [score, setScore] = useState(0);
  const [skills, setSkills] = useState<SkillScore>(INITIAL_SKILLS);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [stagePerformance, setStagePerformance] = useState<Record<string, { score: number; time: number }>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ text: string; isOptimal: boolean } | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch game data from database
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      try {
        // Fetch stages - global stages have organization_id = null
        const { data: stagesData, error: stagesError } = await supabase
          .from('sales_conversation_stages')
          .select('*')
          .order('stage_order');
        
        if (stagesError) {
          console.error('Error fetching stages:', stagesError);
          throw stagesError;
        }
        
        console.log('Fetched stages:', stagesData?.length || 0);
        setStages(stagesData || []);

        // Fetch personas - global personas have organization_id = null
        const { data: personasData, error: personasError } = await supabase
          .from('sales_client_personas')
          .select('*')
          .eq('is_active', true);
        
        if (personasError) {
          console.error('Error fetching personas:', personasError);
          throw personasError;
        }
        
        console.log('Fetched personas:', personasData?.length || 0);
        setPersonas(personasData || []);

        if (!stagesData?.length || !personasData?.length) {
          console.warn('No game data found - stages:', stagesData?.length, 'personas:', personasData?.length);
        }
      } catch (error) {
        console.error('Error fetching sales game data:', error);
        toast.error('Erro ao carregar dados do jogo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

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

  // Generate AI response
  const generateAIResponse = useCallback(async (
    persona: SalesPersona,
    stage: SalesStage,
    conversationHistory: ChatMessage[],
    playerResponse?: string
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sales-response', {
        body: {
          persona: {
            name: persona.name,
            personality: persona.personality,
            role: persona.role,
            company_name: persona.company_name,
            company_type: persona.company_type,
            pain_points: persona.pain_points,
            decision_factors: persona.decision_factors,
          },
          stage: {
            stage_key: stage.stage_key,
            stage_label: stage.stage_label,
            description: stage.description,
            tips: stage.tips,
          },
          conversation_history: conversationHistory.map(m => ({
            sender: m.sender,
            text: m.text
          })),
          player_response: playerResponse,
          rapport,
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to basic response
      return {
        client_response: playerResponse 
          ? "Interessante... Continue me contando mais sobre isso."
          : "Olá! Estou ouvindo. O que você tem para me apresentar?",
        response_options: [
          { text: "Posso apresentar nossa solução?", quality: "good", rapport_impact: 5, score_value: 50, feedback: "Boa abordagem consultiva" },
          { text: "Quais são seus maiores desafios hoje?", quality: "optimal", rapport_impact: 10, score_value: 80, feedback: "Excelente! Descoberta de necessidades" },
          { text: "Temos os melhores preços do mercado!", quality: "poor", rapport_impact: -5, score_value: 20, feedback: "Evite focar em preço logo de início" },
        ]
      };
    } finally {
      setIsGenerating(false);
    }
  }, [rapport]);

  // Start game with selected persona
  const startGame = useCallback(async (persona: SalesPersona) => {
    setSelectedPersona(persona);
    setGameState('playing');
    setCurrentStageKey('opening');
    setRapport(50);
    setScore(0);
    setSkills(INITIAL_SKILLS);
    setTimeLeft(300);
    setStageStartTime(Date.now());
    setStagePerformance({});
    setMessages([]);
    setShowFeedback(null);
    setResponseOptions([]);

    // Get first AI message
    const openingStage = stages.find(s => s.stage_key === 'opening');
    if (openingStage) {
      setCurrentHint(openingStage.tips);
      
      const aiResponse = await generateAIResponse(persona, openingStage, []);
      
      const clientMessage: ChatMessage = {
        id: `client-${Date.now()}`,
        sender: 'client',
        text: aiResponse.client_response
      };
      
      setMessages([clientMessage]);
      setResponseOptions(aiResponse.response_options || []);
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
  }, [user, currentOrg, stages, generateAIResponse]);

  // Handle player response
  const handleResponse = useCallback(async (option: ResponseOption) => {
    if (!selectedPersona || !currentStage) return;

    // Add player message
    const playerMessage: ChatMessage = {
      id: `player-${Date.now()}`,
      sender: 'player',
      text: option.text,
      feedback: option.feedback,
      isOptimal: option.quality === 'optimal'
    };
    
    const updatedMessages = [...messages, playerMessage];
    setMessages(updatedMessages);

    // Update rapport
    const newRapport = Math.min(100, Math.max(0, rapport + option.rapport_impact));
    setRapport(newRapport);

    // Update score
    setScore(prev => prev + option.score_value);

    // Show feedback
    setShowFeedback({ 
      text: option.feedback, 
      isOptimal: option.quality === 'optimal' || option.quality === 'good' 
    });

    // Generate AI response after delay
    setTimeout(async () => {
      setShowFeedback(null);

      // Check for game end conditions
      if (newRapport <= 0) {
        endGame(false);
        return;
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(
        selectedPersona,
        currentStage,
        updatedMessages,
        option.text
      );

      // Check if we should advance stage
      const shouldAdvance = aiResponse.should_advance_stage;
      
      if (shouldAdvance) {
        // Record stage performance
        const stageDuration = Math.round((Date.now() - stageStartTime) / 1000);
        setStagePerformance(prev => ({
          ...prev,
          [currentStageKey]: { score: option.score_value, time: stageDuration }
        }));

        // Move to next stage
        const nextStageIndex = currentStageIndex + 1;
        if (nextStageIndex >= STAGE_ORDER.length) {
          endGame(newRapport >= 50);
          return;
        }

        const nextStageKey = STAGE_ORDER[nextStageIndex];
        setCurrentStageKey(nextStageKey);
        setStageStartTime(Date.now());

        const nextStage = stages.find(s => s.stage_key === nextStageKey);
        if (nextStage) {
          setCurrentHint(nextStage.tips);
        }
      }

      // Update skills
      if (aiResponse.skills_impact) {
        setSkills(prev => {
          const newSkills = { ...prev };
          Object.entries(aiResponse.skills_impact).forEach(([key, value]) => {
            if (key in newSkills) {
              const typedKey = key as keyof SkillScore;
              newSkills[typedKey] = Math.min(100, Math.max(0, prev[typedKey] + (value as number)));
            }
          });
          return newSkills;
        });
      }

      // Add client response
      const clientMessage: ChatMessage = {
        id: `client-${Date.now()}`,
        sender: 'client',
        text: aiResponse.client_response
      };
      setMessages(prev => [...prev, clientMessage]);

      // Set new response options
      if (aiResponse.response_options) {
        setResponseOptions(aiResponse.response_options);
      } else {
        // Generate new options if not provided
        const newAiResponse = await generateAIResponse(
          selectedPersona,
          stages.find(s => s.stage_key === (shouldAdvance ? STAGE_ORDER[currentStageIndex + 1] : currentStageKey)) || currentStage,
          [...updatedMessages, clientMessage]
        );
        setResponseOptions(newAiResponse.response_options || []);
      }
    }, 1500);
  }, [
    selectedPersona,
    currentStage,
    messages,
    rapport,
    stageStartTime,
    currentStageKey,
    currentStageIndex,
    stages,
    generateAIResponse
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
    setMessages([]);
    setResponseOptions([]);
    setRapport(50);
    setScore(0);
    setSkills(INITIAL_SKILLS);
    setTimeLeft(300);
    setStagePerformance({});
    setSessionId(null);
    setShowFeedback(null);
    setCurrentHint(null);
    setIsGenerating(false);
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
    isGenerating,
    
    // Game state
    gameState,
    setGameState,
    selectedPersona,
    currentStage,
    currentStageIndex,
    messages,
    responseOptions,
    rapport,
    score,
    skills,
    timeLeft: formatTime(timeLeft),
    timeLeftSeconds: timeLeft,
    showFeedback,
    currentHint,
    
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
