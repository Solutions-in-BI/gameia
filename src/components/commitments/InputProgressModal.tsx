/**
 * InputProgressModal - Modal para input de progresso de compromissos externos
 * Permite gestores atualizarem o valor manualmente
 */

import { useState } from "react";
import { 
  X, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Commitment } from "@/hooks/useCommitments";

interface InputProgressModalProps {
  commitment: Commitment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (commitmentId: string, newValue: number, note?: string) => Promise<boolean>;
}

export function InputProgressModal({
  commitment,
  open,
  onOpenChange,
  onSubmit,
}: InputProgressModalProps) {
  const [newValue, setNewValue] = useState<number>(commitment?.current_value || 0);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when commitment changes
  useState(() => {
    if (commitment) {
      setNewValue(commitment.current_value);
      setNote("");
    }
  });

  if (!commitment) return null;

  const currentProgress = commitment.target_value > 0 
    ? Math.min((commitment.current_value / commitment.target_value) * 100, 100) 
    : 0;

  const newProgress = commitment.target_value > 0 
    ? Math.min((newValue / commitment.target_value) * 100, 100) 
    : 0;

  const change = newValue - commitment.current_value;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(commitment.id, newValue, note || undefined);
      if (success) {
        onOpenChange(false);
        setNote("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Atualizar Progresso
          </DialogTitle>
          <DialogDescription>
            {commitment.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Progress */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso Atual</span>
              <span className="font-medium text-foreground">
                {commitment.current_value.toLocaleString()} / {commitment.target_value.toLocaleString()}
              </span>
            </div>
            <Progress value={currentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(currentProgress)}% concluído
            </p>
          </div>

          {/* New Value Input */}
          <div>
            <Label htmlFor="new_value">Novo Valor</Label>
            <Input
              id="new_value"
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(Number(e.target.value))}
              min={0}
              max={commitment.target_value * 2} // Allow going over target
              className="mt-1.5 text-lg font-medium"
            />
            
            {change !== 0 && (
              <p className={`text-sm mt-2 ${change > 0 ? "text-gameia-success" : "text-destructive"}`}>
                {change > 0 ? "+" : ""}{change.toLocaleString()} ({Math.round(newProgress)}%)
              </p>
            )}
          </div>

          {/* New Progress Preview */}
          {change !== 0 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Novo Progresso</span>
                <span className="font-medium text-foreground">
                  {newValue.toLocaleString()} / {commitment.target_value.toLocaleString()}
                </span>
              </div>
              <Progress value={newProgress} className="h-2" />
            </div>
          )}

          {/* Note */}
          <div>
            <Label htmlFor="note">Observação (opcional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adicione uma nota sobre esta atualização..."
              className="mt-1.5"
              rows={3}
            />
          </div>

          {/* Warning for large changes */}
          {Math.abs(change) > commitment.target_value * 0.5 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-gameia-warning/10 border border-gameia-warning/20">
              <AlertCircle className="w-4 h-4 text-gameia-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Esta é uma alteração significativa. Certifique-se de que o valor está correto.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || change === 0}
          >
            {isSubmitting ? "Salvando..." : "Salvar Progresso"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
