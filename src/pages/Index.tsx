import { useState } from "react";
import { GameType } from "@/types/game";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { GameMenu } from "@/components/game/menu/GameMenu";
import { ProfilePage } from "@/components/game/profile/ProfilePage";

/**
 * ===========================================
 * PÁGINA: Index
 * ===========================================
 * 
 * Página principal que gerencia qual jogo está ativo.
 */

type PageType = GameType | "profile";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("menu");

  const handleSelectGame = (game: Exclude<GameType, "menu">) => {
    setCurrentPage(game);
  };

  const handleBackToMenu = () => {
    setCurrentPage("menu");
  };

  switch (currentPage) {
    case "memory":
      return <MemoryGame onBack={handleBackToMenu} />;
    case "snake":
      return <SnakeGame onBack={handleBackToMenu} />;
    case "dino":
      return <DinoGame onBack={handleBackToMenu} />;
    case "profile":
      return <ProfilePage onBack={handleBackToMenu} />;
    default:
      return (
        <GameMenu 
          onSelectGame={handleSelectGame} 
          onOpenProfile={() => setCurrentPage("profile")} 
        />
      );
  }
};

export default Index;
