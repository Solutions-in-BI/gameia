import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useSalesGame } from "@/hooks/useSalesGame";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { SalesGameModeSelector, SalesTrack } from "./SalesGameModeSelector";
import { SalesTrackIntro } from "./SalesTrackIntro";
import { SalesChat } from "./SalesChat";
import { SalesResults } from "./SalesResults";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SalesGameProps {
  onBack: () => void;
}

export function SalesGame({ onBack }: SalesGameProps) {
  const [tracks, setTracks] = useState<SalesTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SalesTrack | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);

  const { hasMinimumPlan, isLoading: planLoading } = usePlanLimits();

  const {
    stages,
    personas,
    isLoading,
    isGenerating,
    gameState,
    selectedPersona,
    currentStageIndex,
    messages,
    responseOptions,
    rapport,
    score,
    skills,
    timeLeft,
    showFeedback,
    currentHint,
    startGame,
    handleResponse,
    resetGame,
    stagePerformance,
    setTrackKey,
  } = useSalesGame();

  // Fetch available tracks
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoadingTracks(true);
      try {
        const { data, error } = await supabase
          .from('sales_tracks')
          .select('*')
          .eq('is_active', true)
          .order('track_key');
        
        if (error) throw error;
        setTracks(data || []);
      } catch (err) {
        console.error('Error fetching tracks:', err);
      } finally {
        setIsLoadingTracks(false);
      }
    };
    fetchTracks();
  }, []);

  // Filter personas and stages by selected track
  const filteredPersonas = selectedTrack 
    ? personas.filter(p => !p.track_key || p.track_key === selectedTrack.track_key)
    : personas;
  
  const filteredStages = selectedTrack
    ? stages.filter(s => !s.track_key || s.track_key === selectedTrack.track_key)
    : stages;

  const handleSelectTrack = (track: SalesTrack) => {
    setSelectedTrack(track);
    setTrackKey?.(track.track_key);
  };

  const handleBackToTracks = () => {
    setSelectedTrack(null);
    resetGame();
  };

  if (isLoadingTracks || isLoading || planLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-muted-foreground">Carregando cenários...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to sales simulator (Starter+)
  if (!hasMinimumPlan('starter')) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <UpgradePrompt
            feature="Simulador de Vendas"
            requiredPlan="Starter"
            onClose={onBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <AnimatePresence mode="wait">
        {/* Track Selection */}
        {gameState === 'intro' && !selectedTrack && (
          <SalesGameModeSelector 
            tracks={tracks}
            onSelectTrack={handleSelectTrack}
            onBack={onBack}
          />
        )}

        {/* Persona Selection within Track */}
        {gameState === 'intro' && selectedTrack && (
          <SalesTrackIntro 
            track={selectedTrack}
            personas={filteredPersonas}
            stages={filteredStages}
            onStart={startGame}
            onBack={handleBackToTracks}
          />
        )}

        {gameState === 'playing' && selectedPersona && (
          <SalesChat
            persona={selectedPersona}
            stages={filteredStages}
            currentStageIndex={currentStageIndex}
            messages={messages}
            responseOptions={responseOptions}
            rapport={rapport}
            score={score}
            timeLeft={timeLeft}
            hint={currentHint}
            feedback={showFeedback}
            isGenerating={isGenerating}
            onResponse={handleResponse}
            onExit={handleBackToTracks}
          />
        )}

        {gameState === 'results' && (
          <SalesResults
            score={score}
            rapport={rapport}
            skills={skills}
            stagePerformance={stagePerformance}
            stages={filteredStages}
            saleClosed={rapport >= 50}
            onRestart={handleBackToTracks}
            onBack={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
