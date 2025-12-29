/**
 * Modal para atribuir treinamento a partir de um alerta
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Star } from "lucide-react";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignTrainingModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  context?: string;
  suggestedSkillId?: string;
  onSuccess?: () => void;
}

export function AssignTrainingModal({
  open,
  onClose,
  targetUserId,
  targetUserName,
  context,
  suggestedSkillId,
  onSuccess,
}: AssignTrainingModalProps) {
  const { currentOrg } = useOrganization();
  const { trainings, isLoading } = useTrainings(currentOrg?.id);
  
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTrainings = trainings.filter((t) => t.is_active);

  const handleSubmit = async () => {
    if (!selectedTrainingId) {
      toast.error("Selecione um treinamento");
      return;
    }

    setIsSubmitting(true);
    try {
      // Criar notificação para o usuário
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "training_assigned",
        title: "Novo treinamento atribuído",
        message: `Você recebeu um novo treinamento para completar.${message ? ` Mensagem: ${message}` : ""}`,
        data: {
          training_id: selectedTrainingId,
          assigned_by: currentOrg?.id,
          context,
        },
        is_read: false,
      });

      // Criar registro de progresso (se não existir)
      const { error } = await supabase
        .from("user_training_progress")
        .upsert({
          user_id: targetUserId,
          training_id: selectedTrainingId,
          progress_percent: 0,
        }, {
          onConflict: "user_id,training_id",
          ignoreDuplicates: true,
        });

      if (error) throw error;

      toast.success("Treinamento atribuído com sucesso!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error assigning training:", error);
      toast.error("Erro ao atribuir treinamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-500";
      case "intermediate": return "bg-yellow-500/20 text-yellow-500";
      case "advanced": return "bg-red-500/20 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Atribuir Treinamento para {targetUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {context && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Contexto:</strong> {context}
            </div>
          )}

          <div className="space-y-2">
            <Label>Selecione o Treinamento</Label>
            <ScrollArea className="h-64 border rounded-lg p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Carregando treinamentos...
                </div>
              ) : activeTrainings.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum treinamento disponível
                </div>
              ) : (
                <RadioGroup value={selectedTrainingId || ""} onValueChange={setSelectedTrainingId}>
                  <div className="space-y-2">
                    {activeTrainings.map((training) => (
                      <TrainingOption
                        key={training.id}
                        training={training}
                        isSelected={selectedTrainingId === training.id}
                        getDifficultyColor={getDifficultyColor}
                      />
                    ))}
                  </div>
                </RadioGroup>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem para o colaborador..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedTrainingId}>
            {isSubmitting ? "Atribuindo..." : "Atribuir Treinamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TrainingOption({
  training,
  isSelected,
  getDifficultyColor,
}: {
  training: Training;
  isSelected: boolean;
  getDifficultyColor: (d: string) => string;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
      }`}
    >
      <RadioGroupItem value={training.id} className="mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{training.name}</span>
          <Badge variant="outline" className={getDifficultyColor(training.difficulty)}>
            {training.difficulty}
          </Badge>
        </div>
        {training.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {training.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {training.estimated_hours}h
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {training.xp_reward} XP
          </span>
        </div>
      </div>
    </label>
  );
}
