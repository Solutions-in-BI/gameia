import { AnimatePresence } from "framer-motion";
import { useSalesGame } from "@/hooks/useSalesGame";
import { SalesIntro } from "./SalesIntro";
import { SalesChat } from "./SalesChat";
import { SalesResults } from "./SalesResults";
import { Loader2 } from "lucide-react";

interface SalesGameProps {
  onBack: () => void;
}

export function SalesGame({ onBack }: SalesGameProps) {
  const {
    stages,
    personas,
    isLoading,
    gameState,
    selectedPersona,
    currentStage,
    currentStageIndex,
    messages,
    rapport,
    score,
    skills,
    timeLeft,
    showFeedback,
    currentHint,
    currentTemplate,
    startGame,
    handleResponse,
    resetGame,
    totalStages,
    stagePerformance,
  } = useSalesGame();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-muted-foreground">Carregando cenários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <SalesIntro 
            personas={personas}
            stages={stages}
            onStart={startGame}
            onBack={onBack}
          />
        )}

        {gameState === 'playing' && selectedPersona && currentTemplate && (
          <SalesChat
            persona={selectedPersona}
            stages={stages}
            currentStageIndex={currentStageIndex}
            messages={messages}
            responseOptions={currentTemplate.response_options}
            rapport={rapport}
            score={score}
            timeLeft={timeLeft}
            hint={currentHint}
            feedback={showFeedback}
            onResponse={handleResponse}
            onExit={() => resetGame()}
          />
        )}

        {gameState === 'results' && (
          <SalesResults
            score={score}
            rapport={rapport}
            skills={skills}
            stagePerformance={stagePerformance}
            stages={stages}
            saleClosed={rapport >= 50}
            onRestart={resetGame}
            onBack={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
