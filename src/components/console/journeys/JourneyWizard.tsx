/**
 * JourneyWizard - Wizard para criar/editar Jornadas de Treinamentos
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTrainingJourneys, TrainingJourney, CreateJourneyData } from "@/hooks/useTrainingJourneys";
import { useOrganization } from "@/hooks/useOrganization";
import { BasicInfoStep } from "./wizard/BasicInfoStep";
import { TrainingSelectionStep } from "./wizard/TrainingSelectionStep";
import { RewardsStep } from "./wizard/RewardsStep";
import { PreviewStep } from "./wizard/PreviewStep";
import { ReviewStep } from "./wizard/ReviewStep";
import { cn } from "@/lib/utils";

interface JourneyWizardProps {
  journey?: TrainingJourney | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface JourneyFormData {
  journey_key: string;
  name: string;
  description: string;
  category: string;
  level: string;
  importance: string;
  icon: string;
  color: string;
  order_type: 'sequential' | 'flexible';
  bonus_xp: number;
  bonus_coins: number;
  bonus_insignia_id: string | null;
  bonus_item_ids: string[];
  generates_certificate: boolean;
  certificate_name: string;
  evolution_template_id: string | null;
  trainings: {
    training_id: string;
    order_index: number;
    is_required: boolean;
    prerequisite_training_id?: string;
  }[];
}

const STEPS = [
  { id: 1, title: "Informações", description: "Dados básicos" },
  { id: 2, title: "Treinamentos", description: "Selecionar e ordenar" },
  { id: 3, title: "Recompensas", description: "Bônus da jornada" },
  { id: 4, title: "Preview", description: "Métricas calculadas" },
  { id: 5, title: "Revisão", description: "Confirmar criação" },
];

const generateKey = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 50);
};

export function JourneyWizard({ journey, onClose, onSuccess }: JourneyWizardProps) {
  const { currentOrg } = useOrganization();
  const { createJourney, updateJourney, fetchJourneyTrainings } = useTrainingJourneys(currentOrg?.id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JourneyFormData>({
    journey_key: journey?.journey_key || "",
    name: journey?.name || "",
    description: journey?.description || "",
    category: journey?.category || "geral",
    level: journey?.level || "iniciante",
    importance: journey?.importance || "estrategico",
    icon: journey?.icon || "Route",
    color: journey?.color || "#6366f1",
    order_type: journey?.order_type || "sequential",
    bonus_xp: journey?.bonus_xp || 0,
    bonus_coins: journey?.bonus_coins || 0,
    bonus_insignia_id: journey?.bonus_insignia_id || null,
    bonus_item_ids: journey?.bonus_item_ids || [],
    generates_certificate: journey?.generates_certificate || false,
    certificate_name: journey?.certificate_name || "",
    evolution_template_id: journey?.evolution_template_id || null,
    trainings: [],
  });

  // Load existing trainings for editing
  useEffect(() => {
    if (journey?.id) {
      fetchJourneyTrainings(journey.id).then(trainings => {
        setFormData(prev => ({
          ...prev,
          trainings: trainings.map(t => ({
            training_id: t.training_id,
            order_index: t.order_index,
            is_required: t.is_required,
            prerequisite_training_id: t.prerequisite_training_id || undefined,
          })),
        }));
      });
    }
  }, [journey?.id, fetchJourneyTrainings]);

  // Auto-generate key from name
  useEffect(() => {
    if (!journey && formData.name && !formData.journey_key) {
      setFormData(prev => ({ ...prev, journey_key: generateKey(prev.name) }));
    }
  }, [formData.name, journey]);

  const updateFormData = (updates: Partial<JourneyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0 && formData.journey_key.trim().length > 0;
      case 2:
        return formData.trainings.length > 0;
      case 3:
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data: CreateJourneyData = {
        journey_key: formData.journey_key,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        level: formData.level,
        importance: formData.importance,
        icon: formData.icon,
        color: formData.color,
        order_type: formData.order_type,
        bonus_xp: formData.bonus_xp,
        bonus_coins: formData.bonus_coins,
        bonus_insignia_id: formData.bonus_insignia_id || undefined,
        bonus_item_ids: formData.bonus_item_ids,
        generates_certificate: formData.generates_certificate,
        certificate_name: formData.certificate_name || undefined,
        evolution_template_id: formData.evolution_template_id || undefined,
        trainings: formData.trainings,
      };

      if (journey) {
        await updateJourney(journey.id, data);
      } else {
        await createJourney(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving journey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} isEditing={!!journey} />;
      case 2:
        return <TrainingSelectionStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <RewardsStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PreviewStep formData={formData} />;
      case 5:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">
                {journey ? "Editar Jornada" : "Nova Jornada de Treinamentos"}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    step.id === currentStep && "bg-primary/10",
                    step.id < currentStep && "cursor-pointer hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    step.id === currentStep && "bg-primary text-primary-foreground",
                    step.id < currentStep && "bg-primary/20 text-primary",
                    step.id > currentStep && "bg-muted text-muted-foreground"
                  )}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={cn(
                      "text-sm font-medium",
                      step.id === currentStep ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    step.id < currentStep ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Passo {currentStep} de {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : journey ? "Salvar Alterações" : "Criar Jornada"}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
