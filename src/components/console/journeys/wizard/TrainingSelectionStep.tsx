/**
 * TrainingSelectionStep - Seleção e ordenação de treinamentos
 */

import { useState, useEffect } from "react";
import { Search, GripVertical, Plus, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrainings } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import type { JourneyFormData } from "../JourneyWizard";
import { cn } from "@/lib/utils";

interface TrainingSelectionStepProps {
  formData: JourneyFormData;
  updateFormData: (updates: Partial<JourneyFormData>) => void;
}

export function TrainingSelectionStep({ formData, updateFormData }: TrainingSelectionStepProps) {
  const { organization } = useOrganization();
  const { trainings, isLoading } = useTrainings(organization?.id);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out already selected trainings
  const availableTrainings = trainings.filter(t => 
    t.status === 'active' && 
    !formData.trainings.some(jt => jt.training_id === t.id) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get training details by ID
  const getTraining = (id: string) => trainings.find(t => t.id === id);

  const addTraining = (trainingId: string) => {
    const newTraining = {
      training_id: trainingId,
      order_index: formData.trainings.length,
      is_required: true,
    };
    updateFormData({
      trainings: [...formData.trainings, newTraining],
    });
  };

  const removeTraining = (trainingId: string) => {
    const updated = formData.trainings
      .filter(t => t.training_id !== trainingId)
      .map((t, idx) => ({ ...t, order_index: idx }));
    updateFormData({ trainings: updated });
  };

  const moveTraining = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.trainings.length) return;

    const updated = [...formData.trainings];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    updateFormData({
      trainings: updated.map((t, idx) => ({ ...t, order_index: idx })),
    });
  };

  const toggleRequired = (trainingId: string) => {
    updateFormData({
      trainings: formData.trainings.map(t =>
        t.training_id === trainingId ? { ...t, is_required: !t.is_required } : t
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Trainings */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Treinamentos Disponíveis</Label>
            <p className="text-sm text-muted-foreground">
              Selecione os treinamentos para incluir na jornada
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar treinamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] border border-border rounded-lg">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : availableTrainings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? "Nenhum treinamento encontrado" : "Nenhum treinamento disponível"}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {availableTrainings.map(training => (
                  <button
                    key={training.id}
                    onClick={() => addTraining(training.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{training.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{training.estimated_hours || 0}h</span>
                        <span>•</span>
                        <span>{training.xp_reward || 0} XP</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Selected Trainings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Treinamentos da Jornada</Label>
              <p className="text-sm text-muted-foreground">
                {formData.trainings.length} treinamento(s) selecionado(s)
              </p>
            </div>
            {formData.order_type === 'sequential' && formData.trainings.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Ordem sequencial
              </Badge>
            )}
          </div>

          <ScrollArea className="h-[400px] border border-border rounded-lg">
            {formData.trainings.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Adicione treinamentos da lista à esquerda
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {formData.trainings.map((jt, index) => {
                  const training = getTraining(jt.training_id);
                  if (!training) return null;

                  return (
                    <Card key={jt.training_id} className="group">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {/* Order Controls */}
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveTraining(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveTraining(index, 'down')}
                              disabled={index === formData.trainings.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Order Number */}
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {index + 1}
                          </div>

                          {/* Training Info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{training.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{training.estimated_hours || 0}h</span>
                              <span>•</span>
                              <span>{training.xp_reward || 0} XP</span>
                              {!jt.is_required && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs py-0">Opcional</Badge>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Required Toggle */}
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`required-${jt.training_id}`} className="text-xs text-muted-foreground">
                              Obrigatório
                            </Label>
                            <Switch
                              id={`required-${jt.training_id}`}
                              checked={jt.is_required}
                              onCheckedChange={() => toggleRequired(jt.training_id)}
                            />
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={() => removeTraining(jt.training_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Summary */}
      {formData.trainings.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{formData.trainings.length}</p>
                <p className="text-xs text-muted-foreground">Treinamentos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formData.trainings.reduce((sum, jt) => {
                    const t = getTraining(jt.training_id);
                    return sum + (t?.estimated_hours || 0);
                  }, 0)}h
                </p>
                <p className="text-xs text-muted-foreground">Duração Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formData.trainings.reduce((sum, jt) => {
                    const t = getTraining(jt.training_id);
                    return sum + (t?.xp_reward || 0);
                  }, 0)}
                </p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">
                  {formData.trainings.reduce((sum, jt) => {
                    const t = getTraining(jt.training_id);
                    return sum + (t?.coins_reward || 0);
                  }, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Moedas Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
