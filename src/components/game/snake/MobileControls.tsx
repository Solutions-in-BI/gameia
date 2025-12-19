import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Direction } from "@/types/game";

/**
 * ===========================================
 * COMPONENTE: MobileControls
 * ===========================================
 * 
 * Controles direcionais para dispositivos móveis.
 * Exibido apenas em telas pequenas (md:hidden).
 */

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
}

export function MobileControls({ onDirectionChange }: MobileControlsProps) {
  return (
    <div className="md:hidden flex flex-col items-center gap-2 mb-6">
      {/* Seta para cima */}
      <button
        onClick={() => onDirectionChange("UP")}
        className="btn-game bg-card border border-border p-4 active:scale-95"
        aria-label="Mover para cima"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
      
      {/* Setas laterais e para baixo */}
      <div className="flex gap-2">
        <button
          onClick={() => onDirectionChange("LEFT")}
          className="btn-game bg-card border border-border p-4 active:scale-95"
          aria-label="Mover para esquerda"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => onDirectionChange("DOWN")}
          className="btn-game bg-card border border-border p-4 active:scale-95"
          aria-label="Mover para baixo"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onClick={() => onDirectionChange("RIGHT")}
          className="btn-game bg-card border border-border p-4 active:scale-95"
          aria-label="Mover para direita"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
