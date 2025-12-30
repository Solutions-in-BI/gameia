/**
 * TrainingWizard - Wizard multi-step para criar/editar treinamentos
 * Atualizado com 5 abas: Informações, Distribuição, Recompensas, Certificado, Revisão
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
  Users,
  Award,
} from "lucide-react";
import type { Training } from "@/hooks/useTrainings";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { useInsignias } from "@/hooks/useInsignias";
import { useOrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useSkillProgress } from "@/hooks/useSkillProgress";

import { BasicInfoStep } from "./wizard/BasicInfoStep";
import { DistributionStep } from "./wizard/DistributionStep";
import { RewardsStep } from "./wizard/RewardsStep";
import { CertificateStep } from "./wizard/CertificateStep";
import { ReviewStep } from "./wizard/ReviewStep";

interface TrainingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training | null;
  onSave: (data: Partial<Training>, configData?: ConfigData) => Promise<void>;
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
  certificate_enabled: boolean;
  insignia_reward_id: string | null;
}

export interface DistributionFormData {
  is_active: boolean;
  is_onboarding: boolean;
  requirement_type: 'optional' | 'recommended' | 'mandatory';
  team_ids: string[];
  deadline_days: number | null;
}

export interface CertificateFormData {
  certificate_enabled: boolean;
  certificate_min_score: number;
  require_full_completion: boolean;
  insignia_reward_id: string | null;
}

export interface ConfigData {
  requirement_type: 'optional' | 'recommended' | 'mandatory';
  team_ids: string[];
  deadline_days: number | null;
  xp_multiplier: number;
  coins_multiplier: number;
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
  { id: 2, title: "Distribuição", icon: Users },
  { id: 3, title: "Recompensas", icon: Gift },
  { id: 4, title: "Certificado", icon: Award },
  { id: 5, title: "Revisão", icon: Eye },
];

export function TrainingWizard({
  isOpen,
  onClose,
  training,
  onSave,
}: TrainingWizardProps) {
  const { currentOrg } = useOrganization();
  const { teams } = useOrgTeams(currentOrg?.id);
  const { insignias } = useInsignias();
  const { getTrainingConfig } = useOrgTrainingConfig(currentOrg?.id);
  const { skills: allSkills } = useSkillProgress();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillImpacts, setSkillImpacts] = useState<SkillImpact[]>([]);
  const [insigniaRelations, setInsigniaRelations] = useState<InsigniaRelation[]>([]);
  const [rewardItems, setRewardItems] = useState<Array<{item_id?: string; category?: string; unlock_mode: 'auto_unlock' | 'enable_purchase'}>>([]);
  const [evolutionTemplateId, setEvolutionTemplateId] = useState<string | null>(null);
  
  // Multipliers state
  const [xpMultiplier, setXpMultiplier] = useState(1);
  const [coinsMultiplier, setCoinsMultiplier] = useState(1);
  
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
    certificate_enabled: false,
    insignia_reward_id: null,
  });

  const [distributionData, setDistributionData] = useState<DistributionFormData>({
    is_active: true,
    is_onboarding: false,
    requirement_type: 'optional',
    team_ids: [],
    deadline_days: null,
  });

  const [certificateData, setCertificateData] = useState<CertificateFormData>({
    certificate_enabled: false,
    certificate_min_score: 70,
    require_full_completion: true,
    insignia_reward_id: null,
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
        certificate_enabled: training.certificate_enabled,
        insignia_reward_id: training.insignia_reward_id || null,
      });

      // Load distribution data from config if editing
      const config = getTrainingConfig(training.id);
      if (config) {
        setDistributionData({
          is_active: training.is_active,
          is_onboarding: training.is_onboarding,
          requirement_type: config.requirement_type === 'required' ? 'mandatory' : 
                           config.requirement_type === 'suggested' ? 'recommended' : 'optional',
          team_ids: config.team_ids || [],
          deadline_days: config.deadline_days,
        });
        setXpMultiplier(config.xp_multiplier);
        setCoinsMultiplier(config.coins_multiplier);
      } else {
        setDistributionData({
          is_active: training.is_active,
          is_onboarding: training.is_onboarding,
          requirement_type: 'optional',
          team_ids: [],
          deadline_days: null,
        });
      }

      setCertificateData({
        certificate_enabled: training.certificate_enabled,
        certificate_min_score: 70,
        require_full_completion: true,
        insignia_reward_id: training.insignia_reward_id || null,
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
      certificate_enabled: false,
      insignia_reward_id: null,
    });
    setDistributionData({
      is_active: true,
      is_onboarding: false,
      requirement_type: 'optional',
      team_ids: [],
      deadline_days: null,
    });
    setCertificateData({
      certificate_enabled: false,
      certificate_min_score: 70,
      require_full_completion: true,
      insignia_reward_id: null,
    });
    setSkillImpacts([]);
    setInsigniaRelations([]);
    setXpMultiplier(1);
    setCoinsMultiplier(1);
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
        is_active: distributionData.is_active,
        is_onboarding: distributionData.is_onboarding,
        certificate_enabled: certificateData.certificate_enabled,
        insignia_reward_id: certificateData.insignia_reward_id,
        training_key: formData.training_key || formData.name.toLowerCase().replace(/\s+/g, "_"),
      };
      
      const configData: ConfigData = {
        requirement_type: distributionData.requirement_type,
        team_ids: distributionData.team_ids,
        deadline_days: distributionData.deadline_days,
        xp_multiplier: xpMultiplier,
        coins_multiplier: coinsMultiplier,
      };

      await onSave(trainingData, configData);
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

  // Convert insignias and skills for select components
  const availableInsignias = insignias.map(i => ({
    id: i.id,
    name: i.name,
    icon: i.icon,
  }));

  const availableSkills = allSkills.map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon || '🎯',
  }));

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep formData={formData} setFormData={setFormData} />;
      case 2:
        return (
          <DistributionStep 
            formData={distributionData} 
            setFormData={setDistributionData}
            teams={teams}
          />
        );
      case 3:
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
            xpMultiplier={xpMultiplier}
            setXpMultiplier={setXpMultiplier}
            coinsMultiplier={coinsMultiplier}
            setCoinsMultiplier={setCoinsMultiplier}
            rewardItems={rewardItems}
            setRewardItems={setRewardItems}
            evolutionTemplateId={evolutionTemplateId}
            setEvolutionTemplateId={setEvolutionTemplateId}
          />
        );
      case 4:
        return (
          <CertificateStep 
            formData={certificateData} 
            setFormData={setCertificateData}
            availableInsignias={availableInsignias}
          />
        );
      case 5:
        return (
          <ReviewStep 
            formData={formData}
            distributionData={distributionData}
            certificateData={certificateData}
            skillImpacts={skillImpacts}
            insigniaRelations={insigniaRelations}
            availableSkills={availableSkills}
            availableInsignias={availableInsignias}
            teams={teams}
            xpMultiplier={xpMultiplier}
            coinsMultiplier={coinsMultiplier}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = STEPS.length;

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

          <div className="flex items-center justify-between mt-4 overflow-x-auto pb-1">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => isCompleted && setStep(s.id)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all",
                      isActive && "bg-primary/10 text-primary",
                      isCompleted && "text-primary cursor-pointer hover:bg-primary/5",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <span className="hidden md:inline text-xs font-medium">{s.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn("w-4 lg:w-6 h-0.5 mx-1", step > s.id ? "bg-primary" : "bg-muted")} />
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

          {step < totalSteps ? (
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
