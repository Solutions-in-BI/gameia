/**
 * Modal para criar meta de desenvolvimento a partir de um alerta
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Calendar } from "lucide-react";
import { usePDI } from "@/hooks/usePDI";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  context?: string;
  suggestedSkillId?: string;
  onSuccess?: () => void;
}

export function CreateGoalModal({
  open,
  onClose,
  targetUserId,
  targetUserName,
  context,
  suggestedSkillId,
  onSuccess,
}: CreateGoalModalProps) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { plans, createPlan, createGoal } = usePDI();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(context || "");
  const [priority, setPriority] = useState("medium");
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar PDI ativo do usuário alvo
  const userActivePlan = plans.find(
    (p) => p.user_id === targetUserId && p.status === "active"
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Informe o título da meta");
      return;
    }

    setIsSubmitting(true);
    try {
      let planId = userActivePlan?.id;

      // Se não há PDI ativo, criar um novo
      if (!planId) {
        const result = await createPlan.mutateAsync({
          title: `PDI ${new Date().getFullYear()} - ${targetUserName}`,
          user_id: targetUserId,
          manager_id: user?.id,
          status: "active",
          period_start: new Date().toISOString(),
          period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        });
        planId = result.id;
      }

      // Criar a meta
      await createGoal.mutateAsync({
        plan_id: planId,
        title,
        description,
        priority,
        target_date: targetDate,
        skill_id: suggestedSkillId || null,
      });

      toast.success("Meta criada com sucesso!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Erro ao criar meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Criar Meta para {targetUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {context && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Contexto:</strong> {context}
            </div>
          )}

          {!userActivePlan && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
              Um novo PDI será criado automaticamente para este colaborador.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              placeholder="Ex: Melhorar engajamento diário"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a meta e critérios de sucesso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Alvo
              </Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Meta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
