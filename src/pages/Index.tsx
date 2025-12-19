import { useState } from "react";
import { GameType } from "@/types/game";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { GameMenu } from "@/components/game/menu/GameMenu";

/**
 * ===========================================
 * PÁGINA: Index
 * ===========================================
 * 
 * Página principal que gerencia qual jogo está ativo.
 * Usa um padrão simples de state machine.
 */

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");

  const handleSelectGame = (game: Exclude<GameType, "menu">) => {
    setCurrentGame(game);
  };

  const handleBackToMenu = () => {
    setCurrentGame("menu");
  };

  // Renderiza o componente baseado no estado atual
  switch (currentGame) {
    case "memory":
      return <MemoryGame onBack={handleBackToMenu} />;
    case "snake":
      return <SnakeGame onBack={handleBackToMenu} />;
    default:
      return <GameMenu onSelectGame={handleSelectGame} />;
  }
};

export default Index;
