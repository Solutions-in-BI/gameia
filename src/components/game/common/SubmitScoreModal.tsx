import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GameButton } from "./GameButton";

/**
 * ===========================================
 * COMPONENTE: SubmitScoreModal
 * ===========================================
 * 
 * Modal para o jogador inserir seu nome e salvar no ranking.
 */

interface SubmitScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => Promise<void>;
  score: number;
  gameType: "memory" | "snake" | "dino";
  isSubmitting?: boolean;
}

export function SubmitScoreModal({
  isOpen,
  onClose,
  onSubmit,
  score,
  gameType,
  isSubmitting = false,
}: SubmitScoreModalProps) {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    await onSubmit(playerName.trim());
    setPlayerName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            🏆 Novo Recorde!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {gameType === "memory" 
              ? `Você completou em ${score} movimentos!`
              : `Você fez ${score} pontos!`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Digite seu nome para o ranking:
            </label>
            <Input
              placeholder="Seu nome..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-center text-lg"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex gap-2">
            <GameButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Pular
            </GameButton>
            <GameButton
              onClick={handleSubmit}
              disabled={!playerName.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </GameButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
