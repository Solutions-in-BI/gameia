import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OutreachChannel } from '@/components/game/sales/cold/ColdOutreachModeSelector';

export interface ColdOutreachStage {
  id: string;
  stage_key: string;
  stage_label: string;
  stage_order: number;
  description: string | null;
  icon: string | null;
  tips: string | null;
  channel: string | null;
}

export interface ColdOutreachPersona {
  id: string;
  name: string;
  personality: string;
  role: string | null;
  company_name: string | null;
  company_type: string | null;
  pain_points: string[] | null;
  decision_factors: string[] | null;
  difficulty: string | null;
  channel: string | null;
  track_key: string | null;
}

export interface OpeningScript {
  id: string;
  name: string;
  script_template: string;
  context_tags: string[];
  effectiveness_score: number;
  channel: string;
}

interface ResponseOption {
  text: string;
  quality: 'poor' | 'good' | 'optimal';
  rapport_impact: number;
  score_value: number;
  feedback: string;
  skill?: string;
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'player';
  text: string;
  timestamp: Date;
}

interface SkillScore {
  skill: string;
  score: number;
  maxScore: number;
}

interface StagePerformance {
  stageKey: string;
  score: number;
  rapportGained: number;
}

const COLD_OUTREACH_SKILLS = [
  'first_impression',
  'hook_crafting',
  'elevator_pitch',
  'brushoff_handling',
  'micro_commitment',
];

export function useColdOutreach() {
  const { user } = useAuth();
  
  // Data state
  const [stages, setStages] = useState<ColdOutreachStage[]>([]);
  const [personas, setPersonas] = useState<ColdOutreachPersona[]>([]);
  const [scripts, setScripts] = useState<OpeningScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Channel state
  const [selectedChannel, setSelectedChannel] = useState<OutreachChannel | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<'channel_select' | 'persona_select' | 'playing' | 'results'>('channel_select');
  const [selectedPersona, setSelectedPersona] = useState<ColdOutreachPersona | null>(null);
  const [selectedScript, setSelectedScript] = useState<OpeningScript | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responseOptions, setResponseOptions] = useState<ResponseOption[]>([]);
  const [rapport, setRapport] = useState(20); // Start low for cold outreach
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [timeSpent, setTimeSpent] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ text: string; isOptimal: boolean } | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [gotCommitment, setGotCommitment] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Skills tracking
  const [skills, setSkills] = useState<SkillScore[]>(
    COLD_OUTREACH_SKILLS.map(skill => ({ skill, score: 0, maxScore: 100 }))
  );
  const [stagePerformance, setStagePerformance] = useState<StagePerformance[]>([]);

  // Fetch cold outreach data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('sales_conversation_stages')
          .select('*')
          .eq('track_key', 'cold_outreach')
          .order('stage_order');
        
        if (stagesError) throw stagesError;
        setStages(stagesData || []);

        // Fetch personas
        const { data: personasData, error: personasError } = await supabase
          .from('sales_client_personas')
          .select('*')
          .eq('track_key', 'cold_outreach')
          .eq('is_active', true);
        
        if (personasError) throw personasError;
        setPersonas(personasData || []);

        // Fetch scripts
        const { data: scriptsData, error: scriptsError } = await supabase
          .from('sales_opening_scripts')
          .select('*')
          .eq('track_key', 'cold_outreach')
          .eq('is_active', true);
        
        if (scriptsError) throw scriptsError;
        setScripts((scriptsData || []).map(s => ({
          ...s,
          context_tags: s.context_tags || [],
          effectiveness_score: Number(s.effectiveness_score) || 0,
        })));
      } catch (error) {
        console.error('Error fetching cold outreach data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Generate AI response
  const generateAIResponse = useCallback(async (
    conversationHistory: ChatMessage[],
    playerResponse?: string
  ) => {
    if (!selectedPersona || !selectedChannel) return;
    
    setIsGenerating(true);
    const currentStage = stages[currentStageIndex];

    try {
      const { data, error } = await supabase.functions.invoke('generate-sales-response', {
        body: {
          persona: {
            name: selectedPersona.name,
            personality: selectedPersona.personality,
            role: selectedPersona.role,
            company: selectedPersona.company_name,
            painPoints: selectedPersona.pain_points,
            decisionFactors: selectedPersona.decision_factors,
            difficulty: selectedPersona.difficulty,
          },
          stage: {
            key: currentStage?.stage_key,
            label: currentStage?.stage_label,
            description: currentStage?.description,
            tips: currentStage?.tips,
          },
          track_key: 'cold_outreach',
          channel: selectedChannel,
          conversation_history: conversationHistory.map(m => ({
            sender: m.sender,
            text: m.text
          })),
          player_response: playerResponse,
          rapport,
          is_cold_outreach: true,
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Cold outreach specific fallbacks
      const fallbackOptions = [
        { text: "Bom dia! Estou ligando da LegalTrade sobre uma oportunidade...", quality: "good" as const, rapport_impact: 5, score_value: 50, feedback: "Abertura direta", skill: "first_impression" },
        { text: "Vi que você tem precatórios aguardando pagamento. Posso ajudar?", quality: "optimal" as const, rapport_impact: 10, score_value: 80, feedback: "Hook específico", skill: "hook_crafting" },
        { text: "Oi! Tudo bem? Queria falar sobre precatórios!", quality: "poor" as const, rapport_impact: -5, score_value: 20, feedback: "Muito genérico", skill: "first_impression" },
      ];
      
      return {
        client_response: playerResponse 
          ? "Hmm... me fala mais sobre isso. Estou ocupado."
          : "Alô? Quem é?",
        response_options: fallbackOptions,
        hint: "Em cold outreach, você tem segundos para captar atenção. Seja específico!"
      };
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPersona, selectedChannel, stages, currentStageIndex, rapport]);

  // Select channel
  const selectChannel = useCallback((channel: OutreachChannel) => {
    setSelectedChannel(channel);
    setGameState('persona_select');
  }, []);

  // Start game
  const startGame = useCallback(async (persona: ColdOutreachPersona, script: OpeningScript | null) => {
    setSelectedPersona(persona);
    setSelectedScript(script);
    setGameState('playing');
    setCurrentStageIndex(0);
    setMessages([]);
    setRapport(20); // Low initial rapport for cold outreach
    setScore(0);
    setTimeLeft(180);
    setTimeSpent(0);
    setGotCommitment(false);
    setSkills(COLD_OUTREACH_SKILLS.map(skill => ({ skill, score: 0, maxScore: 100 })));
    setStagePerformance([]);

    // Create session
    if (user) {
      try {
        const { data: session, error } = await supabase
          .from('sales_game_sessions')
          .insert({
            user_id: user.id,
            persona_id: persona.id,
            track_key: 'cold_outreach',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && session) {
          setSessionId(session.id);
        }
      } catch (err) {
        console.error('Error creating session:', err);
      }
    }

    // Generate initial client response (the prospect answering the phone/message)
    const aiResponse = await generateAIResponse([]);
    
    if (aiResponse) {
      const clientMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'client',
        text: aiResponse.client_response,
        timestamp: new Date(),
      };
      setMessages([clientMessage]);
      setResponseOptions(aiResponse.response_options || []);
      setCurrentHint(aiResponse.hint || stages[0]?.tips || null);
    }
  }, [user, generateAIResponse, stages]);

  // Handle response
  const handleResponse = useCallback(async (option: ResponseOption) => {
    if (isGenerating) return;

    // Add player message
    const playerMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'player',
      text: option.text,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, playerMessage];
    setMessages(newMessages);

    // Update rapport and score
    const newRapport = Math.max(0, Math.min(100, rapport + option.rapport_impact));
    setRapport(newRapport);
    setScore(prev => prev + option.score_value);

    // Update skill if specified
    if (option.skill) {
      setSkills(prev => prev.map(s => 
        s.skill === option.skill 
          ? { ...s, score: Math.min(s.maxScore, s.score + option.score_value) }
          : s
      ));
    }

    // Track stage performance
    const currentStage = stages[currentStageIndex];
    if (currentStage) {
      setStagePerformance(prev => [
        ...prev,
        {
          stageKey: currentStage.stage_key,
          score: option.score_value,
          rapportGained: option.rapport_impact,
        }
      ]);
    }

    // Show feedback
    setShowFeedback({
      text: option.feedback,
      isOptimal: option.quality === 'optimal',
    });
    setTimeout(() => setShowFeedback(null), 2500);

    // Check if got commitment (last stage with good rapport)
    if (currentStageIndex >= stages.length - 1 && newRapport >= 50 && option.quality !== 'poor') {
      setGotCommitment(true);
    }

    // Progress or end
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      
      // Generate next AI response
      const aiResponse = await generateAIResponse(newMessages, option.text);
      
      if (aiResponse) {
        const clientMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'client',
          text: aiResponse.client_response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, clientMessage]);
        setResponseOptions(aiResponse.response_options || []);
        setCurrentHint(aiResponse.hint || stages[currentStageIndex + 1]?.tips || null);
      }
    } else {
      // End game
      endGame();
    }
  }, [isGenerating, messages, rapport, stages, currentStageIndex, generateAIResponse]);

  // End game
  const endGame = useCallback(async () => {
    setGameState('results');

    // Update session
    if (sessionId) {
      try {
        await supabase
          .from('sales_game_sessions')
          .update({
            completed_at: new Date().toISOString(),
            total_score: score,
            final_rapport: rapport,
            sale_closed: gotCommitment,
            time_spent_seconds: timeSpent,
            skills_measured: JSON.parse(JSON.stringify(skills)),
            stage_performance: JSON.parse(JSON.stringify(stagePerformance)),
            conversation_history: JSON.parse(JSON.stringify(messages.map(m => ({
              ...m,
              timestamp: m.timestamp.toISOString()
            })))),
          })
          .eq('id', sessionId);
      } catch (err) {
        console.error('Error updating session:', err);
      }
    }
  }, [sessionId, score, rapport, gotCommitment, timeSpent, skills, stagePerformance, messages]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('channel_select');
    setSelectedChannel(null);
    setSelectedPersona(null);
    setSelectedScript(null);
    setCurrentStageIndex(0);
    setMessages([]);
    setResponseOptions([]);
    setRapport(20);
    setScore(0);
    setTimeLeft(180);
    setTimeSpent(0);
    setGotCommitment(false);
    setShowFeedback(null);
    setCurrentHint(null);
    setSessionId(null);
    setSkills(COLD_OUTREACH_SKILLS.map(skill => ({ skill, score: 0, maxScore: 100 })));
    setStagePerformance([]);
  }, []);

  // Back to channel select
  const backToChannelSelect = useCallback(() => {
    setGameState('channel_select');
    setSelectedChannel(null);
  }, []);

  return {
    // Data
    stages,
    personas,
    scripts,
    isLoading,
    isGenerating,
    
    // Channel
    selectedChannel,
    selectChannel,
    
    // Game state
    gameState,
    selectedPersona,
    selectedScript,
    currentStageIndex,
    messages,
    responseOptions,
    rapport,
    score,
    timeLeft,
    timeSpent,
    showFeedback,
    currentHint,
    gotCommitment,
    
    // Skills
    skills,
    stagePerformance,
    
    // Actions
    startGame,
    handleResponse,
    resetGame,
    backToChannelSelect,
    endGame,
  };
}
