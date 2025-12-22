import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { DinoCanvas } from "./DinoCanvas";
import { AchievementToast } from "../common/AchievementToast";
import { CoinAnimation } from "../common/CoinAnimation";
import { useDinoGame } from "@/hooks/useDinoGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMarketplace } from "@/hooks/useMarketplace";

interface DinoGameProps {
  onBack: () => void;
}

export function DinoGame({ onBack }: DinoGameProps) {
  const { isPlaying, isGameOver, score, bestScore, dinoY, isJumping, isDucking, obstacles, jump, duck, resetGame } = useDinoGame();
  const { checkAndUnlock } = useAchievements();
  const { addScore } = useLeaderboard("dino");
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addCoins } = useMarketplace();

  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  useEffect(() => {
    if (isGameOver && score > 0 && !hasCheckedAchievements) {
      setHasCheckedAchievements(true);
      
      checkAndUnlock({ game: "dino", score }).then((unlocked) => {
        if (unlocked.length > 0) setUnlockedAchievement(unlocked[0]);
      });

      // Adiciona moedas baseado na pontuação
      const earnedCoins = Math.floor(score / 10);
      if (earnedCoins > 0 && isAuthenticated) {
        setCoinsEarned(earnedCoins);
        setShowCoinAnimation(true);
        addCoins(earnedCoins);
      }

      if (isAuthenticated && profile && score >= 50) {
        addScore({
          player_name: profile.nickname,
          user_id: profile.id,
          game_type: "dino",
          score,
        }).then((result) => {
          if (result.success) {
            toast({ title: "Score salvo!", description: `${score} pontos salvos no ranking.` });
          }
        });
      } else if (score >= 50 && !isAuthenticated) {
        toast({ title: "Faça login para salvar", description: "Crie uma conta para competir no ranking!" });
      }
    }
  }, [isGameOver, score, checkAndUnlock, hasCheckedAchievements, isAuthenticated, profile, addScore, toast]);

  const handleReset = () => {
    setHasCheckedAchievements(false);
    setShowCoinAnimation(false);
    setCoinsEarned(0);
    resetGame();
  };

  return (
    <GameLayout 
      title="Dino Runner" 
      subtitle="Pressione ESPAÇO ou clique para pular"
      maxWidth="4xl"
      onBack={onBack}
    >
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-w-sm mx-auto">
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
        className="relative mx-auto mb-4 cursor-pointer"
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      >
        <DinoCanvas
          dinoY={dinoY}
          isJumping={isJumping}
          isDucking={isDucking}
          obstacles={obstacles}
          isPlaying={isPlaying}
          isGameOver={isGameOver}
        />

        {/* Overlay de início */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-5xl mb-4">🦖</p>
              <p className="text-lg font-display text-foreground animate-pulse-glow">
                Clique ou pressione ESPAÇO para começar
              </p>
            </div>
          </div>
        )}

        {/* Overlay de game over */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-xl animate-fade-in backdrop-blur-sm">
            <p className="text-3xl font-display font-bold text-destructive mb-2">
              Game Over!
            </p>
            <p className="text-xl text-foreground mb-2">
              Pontuação: <span className="font-bold text-primary">{score}</span>
            </p>
            {score >= bestScore && score > 0 && (
              <p className="text-lg text-primary mb-4 animate-pulse">
                🎉 Novo Recorde!
              </p>
            )}
            <GameButton variant="primary" onClick={handleReset}>
              🔄 Jogar Novamente
            </GameButton>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4 max-w-lg mx-auto">
        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          ESPAÇO / ↑ / W para pular • ↓ / S para abaixar
        </p>
        <p className="text-center text-muted-foreground text-xs mt-1">
          🐦 Após 100 pts: pássaros! Pule os baixos, abaixe para os altos.
        </p>
      </div>

      {/* Barra de Ações */}
      <div className="flex justify-center gap-3">
        <GameButton variant="muted" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
      </div>

      <AchievementToast achievementId={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
      
      <CoinAnimation
        amount={coinsEarned}
        trigger={showCoinAnimation}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </GameLayout>
  );
}

export default DinoGame;
