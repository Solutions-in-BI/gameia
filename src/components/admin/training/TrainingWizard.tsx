/**
 * TrainingWizard - Wizard multi-step para criar/editar treinamentos
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Info,
  Gift,
  Eye,
} from "lucide-react";
import type { Training } from "@/hooks/useTrainings";

import { BasicInfoStep } from "./wizard/BasicInfoStep";
import { RewardsStep } from "./wizard/RewardsStep";
import { ReviewStep } from "./wizard/ReviewStep";

interface TrainingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training | null;
  onSave: (data: Partial<Training>) => Promise<void>;
}

export interface TrainingFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  difficulty: string;
  estimated_hours: number;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  is_onboarding: boolean;
  thumbnail_url: string;
  training_key: string;
}

export interface SkillImpact {
  skillId: string;
  weight: number;
}

export interface InsigniaRelation {
  insigniaId: string;
  relationType: string;
}

const STEPS = [
  { id: 1, title: "Informações", icon: Info },
  { id: 2, title: "Recompensas", icon: Gift },
  { id: 3, title: "Revisão", icon: Eye },
];

export function TrainingWizard({
  isOpen,
  onClose,
  training,
  onSave,
}: TrainingWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillImpacts, setSkillImpacts] = useState<SkillImpact[]>([]);
  const [insigniaRelations, setInsigniaRelations] = useState<InsigniaRelation[]>([]);
  
  const [formData, setFormData] = useState<TrainingFormData>({
    name: "",
    description: "",
    icon: "📚",
    color: "#6366f1",
    category: "general",
    difficulty: "beginner",
    estimated_hours: 2,
    xp_reward: 100,
    coins_reward: 50,
    is_active: true,
    is_onboarding: false,
    thumbnail_url: "",
    training_key: "",
  });

  useEffect(() => {
    if (training) {
      setFormData({
        name: training.name,
        description: training.description || "",
        icon: training.icon,
        color: training.color || "#6366f1",
        category: training.category,
        difficulty: training.difficulty,
        estimated_hours: training.estimated_hours,
        xp_reward: training.xp_reward,
        coins_reward: training.coins_reward,
        is_active: training.is_active,
        is_onboarding: training.is_onboarding,
        thumbnail_url: training.thumbnail_url || "",
        training_key: training.training_key,
      });
    } else {
      resetForm();
    }
  }, [training, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "📚",
      color: "#6366f1",
      category: "general",
      difficulty: "beginner",
      estimated_hours: 2,
      xp_reward: 100,
      coins_reward: 50,
      is_active: true,
      is_onboarding: false,
      thumbnail_url: "",
      training_key: "",
    });
    setSkillImpacts([]);
    setInsigniaRelations([]);
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const trainingData: Partial<Training> = {
        ...formData,
        training_key: formData.training_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
      };
      await onSave(trainingData);
      handleClose();
    } catch (error) {
      console.error("Error saving training:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "" && formData.category !== "";
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep formData={formData} setFormData={setFormData} />;
      case 2:
        return (
          <RewardsStep 
            formData={formData} 
            setFormData={setFormData}
            skillImpacts={skillImpacts}
            setSkillImpacts={setSkillImpacts}
            insigniaRelations={insigniaRelations}
            setInsigniaRelations={setInsigniaRelations}
            availableSkills={[]}
            availableInsignias={[]}
          />
        );
      case 3:
        return (
          <ReviewStep 
            formData={formData} 
            skillImpacts={skillImpacts}
            insigniaRelations={insigniaRelations}
            availableSkills={[]}
            availableInsignias={[]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {formData.icon}
            </div>
            {training ? "Editar Treinamento" : "Novo Treinamento"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure as informações do treinamento
          </DialogDescription>

          <div className="flex items-center justify-between mt-4">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => isCompleted && setStep(s.id)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                      isActive && "bg-primary/10 text-primary",
                      isCompleted && "text-primary cursor-pointer hover:bg-primary/5",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn("w-8 h-0.5 mx-2", step > s.id ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-250px)]">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          <Button variant="ghost" onClick={step === 1 ? handleClose : () => setStep(step - 1)}>
            {step === 1 ? "Cancelar" : (<><ArrowLeft className="w-4 h-4 mr-2" />Voltar</>)}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continuar<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>) : (<><Check className="w-4 h-4 mr-2" />{training ? "Salvar" : "Criar"}</>)}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "" && formData.category !== "";
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep formData={formData} setFormData={setFormData} />;
      case 2:
        return (
          <RewardsStep 
            formData={formData} 
            setFormData={setFormData}
            skillImpacts={skillImpacts}
            setSkillImpacts={setSkillImpacts}
            insigniaRelations={insigniaRelations}
            setInsigniaRelations={setInsigniaRelations}
            availableSkills={availableSkills}
            availableInsignias={availableInsignias}
          />
        );
      case 3:
        return <CertificationStep formData={formData} setFormData={setFormData} />;
      case 4:
        return (
          <ReviewStep 
            formData={formData} 
            skillImpacts={skillImpacts}
            insigniaRelations={insigniaRelations}
            availableSkills={availableSkills}
            availableInsignias={availableInsignias}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with Steps */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {formData.icon}
            </div>
            {training ? "Editar Treinamento" : "Novo Treinamento"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure as informações do treinamento
          </DialogDescription>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => isCompleted && setStep(s.id)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                      isActive && "bg-primary/10 text-primary",
                      isCompleted && "text-primary cursor-pointer hover:bg-primary/5",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-2",
                      step > s.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-250px)]">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          <Button
            variant="ghost"
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
          >
            {step === 1 ? "Cancelar" : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {training ? "Salvar Alterações" : "Criar Treinamento"}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
