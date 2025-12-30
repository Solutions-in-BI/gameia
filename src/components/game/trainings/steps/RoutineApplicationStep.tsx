import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, Upload, Link2, FileText, CheckCircle2, 
  AlertCircle, Calendar, Zap, Brain, ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StepResult } from '@/types/training';
import { toast } from 'sonner';
import { differenceInDays, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RoutineApplicationConfig {
  action_description?: string;
  deadline_days?: number;
  evidence_type?: 'checkin' | 'text' | 'file' | 'link';
  can_generate_daily_mission?: boolean;
  can_generate_challenge?: boolean;
  pdi_goal_id?: string;
  pdi_goal_name?: string;
  expected_impact?: string;
  skill_name?: string;
}

interface RoutineApplicationStepProps {
  module: {
    id: string;
    name: string;
    description?: string | null;
    step_config?: RoutineApplicationConfig;
    xp_reward?: number;
  };
  onComplete: (result: StepResult) => void;
}

export const RoutineApplicationStep: React.FC<RoutineApplicationStepProps> = ({
  module,
  onComplete,
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [evidenceType, setEvidenceType] = useState<string>('');
  const [evidenceContent, setEvidenceContent] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  const config = module.step_config || {};
  const deadlineDays = config.deadline_days || 7;
  const deadline = addDays(new Date(), deadlineDays);
  const defaultEvidenceType = config.evidence_type || 'text';

  // Load existing application
  useEffect(() => {
    if (user) {
      loadExistingApplication();
    }
  }, [user, module.id]);

  const loadExistingApplication = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('routine_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', module.id)
      .single();

    if (data) {
      setExistingApplication(data);
      setStatus(data.status as any);
      setEvidenceType(data.evidence_type || '');
      setEvidenceContent(data.evidence_content || '');
      setEvidenceUrl(data.evidence_url || '');
    }
  };

  const handleStartApplication = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      await supabase.from('routine_applications').upsert({
        user_id: user.id,
        module_id: module.id,
        status: 'in_progress',
        evidence_type: defaultEvidenceType,
      });

      setStatus('in_progress');
      toast.success('Aplicação iniciada! Você tem ' + deadlineDays + ' dias para completar.');
    } catch (error) {
      console.error('Error starting application:', error);
      toast.error('Erro ao iniciar aplicação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!user) return;
    if (!evidenceContent && !evidenceUrl) {
      toast.error('Por favor, forneça a evidência da aplicação');
      return;
    }

    setIsSubmitting(true);

    try {
      await supabase.from('routine_applications').upsert({
        user_id: user.id,
        module_id: module.id,
        status: 'completed',
        evidence_type: evidenceType || defaultEvidenceType,
        evidence_content: evidenceContent,
        evidence_url: evidenceUrl,
        submitted_at: new Date().toISOString(),
      });

      setStatus('completed');
      toast.success('Evidência enviada com sucesso!');

      // Complete the step
      onComplete({
        completed: true,
        passed: true,
        metadata: {
          evidenceType: evidenceType || defaultEvidenceType,
          hasEvidence: true,
        },
      });
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error('Erro ao enviar evidência');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'checkin': return CheckCircle2;
      case 'text': return FileText;
      case 'file': return Upload;
      case 'link': return Link2;
      default: return FileText;
    }
  };

  const getEvidenceLabel = (type: string) => {
    switch (type) {
      case 'checkin': return 'Check-in';
      case 'text': return 'Texto';
      case 'file': return 'Arquivo';
      case 'link': return 'Link';
      default: return 'Evidência';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1 bg-orange-100 text-orange-700">
                  Aplicação Prática
                </Badge>
                <CardTitle className="text-xl">{module.name}</CardTitle>
              </div>
            </div>
            <Badge 
              variant={status === 'completed' ? 'default' : 'outline'}
              className={
                status === 'completed' 
                  ? 'bg-green-500' 
                  : status === 'in_progress' 
                    ? 'border-orange-500 text-orange-500' 
                    : ''
              }
            >
              {status === 'completed' ? 'Completo' : status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Action description */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">O que você deve fazer:</h4>
                <p className="text-muted-foreground">
                  {config.action_description || module.description || 'Aplique o conhecimento adquirido na sua rotina de trabalho.'}
                </p>
              </div>
            </div>

            {config.expected_impact && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Impacto esperado:</h4>
                  <p className="text-sm text-muted-foreground">{config.expected_impact}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deadline and connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="font-medium">
                  {format(deadline, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deadlineDays} dias restantes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(config.pdi_goal_name || config.skill_name) && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Conectado a</p>
                  {config.pdi_goal_name && (
                    <p className="font-medium text-sm">PDI: {config.pdi_goal_name}</p>
                  )}
                  {config.skill_name && (
                    <p className="text-xs text-muted-foreground">Skill: {config.skill_name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evidence submission */}
      {status === 'pending' && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pronto para aplicar?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Inicie a aplicação prática e comprove que você colocou o conhecimento em ação.
            </p>
            <Button onClick={handleStartApplication} disabled={isSubmitting} className="gap-2">
              Iniciar Aplicação
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'in_progress' && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-medium mb-4">Como você quer comprovar sua aplicação?</h4>
              <RadioGroup
                value={evidenceType || defaultEvidenceType}
                onValueChange={setEvidenceType}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {['checkin', 'text', 'file', 'link'].map((type) => {
                  const Icon = getEvidenceIcon(type);
                  return (
                    <div key={type}>
                      <RadioGroupItem
                        value={type}
                        id={type}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                      >
                        <Icon className="w-5 h-5 mb-2" />
                        <span className="text-sm">{getEvidenceLabel(type)}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Evidence input based on type */}
            {(evidenceType === 'text' || evidenceType === 'checkin' || !evidenceType) && (
              <div className="space-y-2">
                <Label>Descreva sua aplicação</Label>
                <Textarea
                  value={evidenceContent}
                  onChange={(e) => setEvidenceContent(e.target.value)}
                  placeholder="Conte como você aplicou o conhecimento na prática..."
                  className="min-h-[120px]"
                />
              </div>
            )}

            {evidenceType === 'link' && (
              <div className="space-y-2">
                <Label>Link da evidência</Label>
                <Input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Textarea
                  value={evidenceContent}
                  onChange={(e) => setEvidenceContent(e.target.value)}
                  placeholder="Descrição adicional (opcional)..."
                  className="min-h-[80px]"
                />
              </div>
            )}

            {evidenceType === 'file' && (
              <div className="space-y-2">
                <Label>Upload de arquivo</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Funcionalidade em desenvolvimento)
                  </p>
                </div>
                <Textarea
                  value={evidenceContent}
                  onChange={(e) => setEvidenceContent(e.target.value)}
                  placeholder="Descrição do arquivo (opcional)..."
                  className="min-h-[80px]"
                />
              </div>
            )}

            <Button 
              onClick={handleSubmitEvidence} 
              disabled={isSubmitting || (!evidenceContent && !evidenceUrl)}
              className="w-full gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enviar Evidência
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'completed' && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aplicação Concluída!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sua evidência foi registrada. O gestor pode verificar sua aplicação.
            </p>
            {existingApplication?.manager_feedback && (
              <div className="bg-white dark:bg-card rounded-lg p-4 border text-left">
                <p className="text-sm font-medium mb-1">Feedback do gestor:</p>
                <p className="text-sm text-muted-foreground">
                  {existingApplication.manager_feedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* XP reward */}
      {module.xp_reward && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            +{module.xp_reward} XP ao completar a aplicação
          </span>
        </div>
      )}
    </motion.div>
  );
};
