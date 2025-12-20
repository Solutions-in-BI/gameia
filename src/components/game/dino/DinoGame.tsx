import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { DinoCanvas } from "./DinoCanvas";
import { AchievementToast } from "../common/AchievementToast";
import { SubmitScoreModal } from "../common/SubmitScoreModal";
import { useDinoGame } from "@/hooks/useDinoGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";

/**
 * ===========================================
 * COMPONENTE: DinoGame
 * ===========================================
 * 
 * Jogo do dinossauro estilo Chrome offline.
 * Pule os obstáculos e sobreviva o máximo possível!
 */

interface DinoGameProps {
  onBack: () => void;
}

export function DinoGame({ onBack }: DinoGameProps) {
  const {
    isPlaying,
    isGameOver,
    score,
    bestScore,
    dinoY,
    isJumping,
    obstacles,
    jump,
    resetGame,
  } = useDinoGame();

  const { checkAndUnlock } = useAchievements();
  const { addScore } = useLeaderboard("dino");

  // Estado para toasts e modais
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  // Verifica conquistas quando game over
  useEffect(() => {
    if (isGameOver && score > 0 && !hasCheckedAchievements) {
      const unlocked = checkAndUnlock({
        game: "dino",
        score,
      });

      if (unlocked.length > 0) {
        setUnlockedAchievement(unlocked[0]);
      }

      setHasCheckedAchievements(true);

      // Mostra modal de score se fez pontos significativos
      if (score >= 50) {
        setTimeout(() => setShowScoreModal(true), 1500);
      }
    }
  }, [isGameOver, score, checkAndUnlock, hasCheckedAchievements]);

  // Reset do estado quando reinicia
  const handleReset = () => {
    setHasCheckedAchievements(false);
    setShowScoreModal(false);
    resetGame();
  };

  // Submete score ao ranking
  const handleSubmitScore = async (playerName: string) => {
    setIsSubmitting(true);
    await addScore({
      player_name: playerName,
      game_type: "dino",
      score,
    });
    setIsSubmitting(false);
    setShowScoreModal(false);
  };

  return (
    <GameLayout 
      title="Dino Runner" 
      subtitle="Pressione ESPAÇO ou clique para pular"
      maxWidth="4xl"
    >
      {/* Estatísticas */}
      <div className="flex justify-center gap-4 mb-6">
        <StatCard 
          icon={Zap} 
          label="Pontos" 
          value={score} 
          iconColor="text-primary" 
        />
        <StatCard 
          icon={Trophy} 
          label="Recorde" 
          value={bestScore} 
          iconColor="text-secondary" 
        />
      </div>

      {/* Área do Jogo */}
      <div 
        className="relative mx-auto mb-6 cursor-pointer"
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        <DinoCanvas
          dinoY={dinoY}
          isJumping={isJumping}
          obstacles={obstacles}
          isPlaying={isPlaying}
          isGameOver={isGameOver}
        />

        {/* Overlay de início */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
            <div className="text-center">
              <p className="text-4xl mb-4">🦖</p>
              <p className="text-xl font-display text-foreground animate-pulse-glow">
                Clique ou pressione ESPAÇO para começar
              </p>
            </div>
          </div>
        )}

        {/* Overlay de game over */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-xl animate-fade-in">
            <p className="text-3xl font-display font-bold text-destructive mb-2">
              Game Over!
            </p>
            <p className="text-xl text-foreground mb-4">
              Pontuação: {score}
            </p>
            {score >= bestScore && score > 0 && (
              <p className="text-lg text-primary mb-4 animate-pulse">
                🎉 Novo Recorde!
              </p>
            )}
            <GameButton variant="primary" onClick={handleReset}>
              Jogar Novamente
            </GameButton>
          </div>
        )}
      </div>

      {/* Instruções */}
      <p className="text-center text-muted-foreground text-sm mb-6">
        Use ESPAÇO, ↑ ou W para pular • Toque na tela em dispositivos móveis
      </p>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <GameButton variant="secondary" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
        <GameButton variant="muted" onClick={onBack}>
          Voltar ao Menu
        </GameButton>
      </div>

      {/* Toast de Conquista */}
      <AchievementToast
        achievementId={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />

      {/* Modal de Envio de Score */}
      <SubmitScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        onSubmit={handleSubmitScore}
        score={score}
        gameType="dino"
        isSubmitting={isSubmitting}
      />
    </GameLayout>
  );
}

export default DinoGame;
