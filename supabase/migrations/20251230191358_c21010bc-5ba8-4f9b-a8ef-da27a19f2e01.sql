-- Fase 1: Expandir estrutura do PDI

-- 1.1 Adicionar novos campos em development_goals
ALTER TABLE public.development_goals 
ADD COLUMN IF NOT EXISTS goal_type text DEFAULT 'behavioral',
ADD COLUMN IF NOT EXISTS linked_training_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linked_challenge_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linked_cognitive_test_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linked_insignia_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_progress_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_auto_update timestamp with time zone,
ADD COLUMN IF NOT EXISTS stagnant_since timestamp with time zone,
ADD COLUMN IF NOT EXISTS weight integer DEFAULT 1;

-- 1.2 Criar tabela goal_progress_events para histórico de progresso automático
CREATE TABLE IF NOT EXISTS public.goal_progress_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.development_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  source_type text NOT NULL,
  source_id uuid,
  source_name text,
  progress_before integer NOT NULL DEFAULT 0,
  progress_after integer NOT NULL DEFAULT 0,
  progress_delta integer NOT NULL DEFAULT 0,
  xp_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 1.3 Criar tabela pdi_linked_actions para ações sugeridas
CREATE TABLE IF NOT EXISTS public.pdi_linked_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.development_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  action_type text NOT NULL,
  action_id uuid,
  action_name text NOT NULL,
  priority integer DEFAULT 1,
  expected_progress_impact integer DEFAULT 10,
  suggested_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  dismissed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_goal_progress_events_goal_id ON public.goal_progress_events(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_events_user_id ON public.goal_progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_events_created_at ON public.goal_progress_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdi_linked_actions_goal_id ON public.pdi_linked_actions(goal_id);
CREATE INDEX IF NOT EXISTS idx_pdi_linked_actions_user_id ON public.pdi_linked_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdi_linked_actions_pending ON public.pdi_linked_actions(user_id) WHERE completed_at IS NULL AND dismissed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_development_goals_linked_trainings ON public.development_goals USING GIN(linked_training_ids);
CREATE INDEX IF NOT EXISTS idx_development_goals_stagnant ON public.development_goals(stagnant_since) WHERE stagnant_since IS NOT NULL;

-- Enable RLS
ALTER TABLE public.goal_progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_linked_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies para goal_progress_events
CREATE POLICY "Users can view own progress events"
ON public.goal_progress_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress events"
ON public.goal_progress_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view team progress events"
ON public.goal_progress_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.current_organization_id = goal_progress_events.organization_id
  )
);

-- RLS Policies para pdi_linked_actions
CREATE POLICY "Users can view own linked actions"
ON public.pdi_linked_actions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own linked actions"
ON public.pdi_linked_actions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view team linked actions"
ON public.pdi_linked_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.current_organization_id = pdi_linked_actions.organization_id
  )
);

-- Função para calcular progresso geral do PDI baseado nas metas
CREATE OR REPLACE FUNCTION public.recalculate_pdi_progress(plan_id_param uuid)
RETURNS void AS $$
DECLARE
  total_weighted_progress numeric;
  total_weight numeric;
  new_overall_progress integer;
BEGIN
  SELECT 
    COALESCE(SUM(progress * COALESCE(weight, 1)), 0),
    COALESCE(SUM(COALESCE(weight, 1)), 1)
  INTO total_weighted_progress, total_weight
  FROM public.development_goals
  WHERE plan_id = plan_id_param
  AND status != 'cancelled';
  
  new_overall_progress := ROUND(total_weighted_progress / total_weight);
  
  UPDATE public.development_plans
  SET 
    overall_progress = new_overall_progress,
    updated_at = now(),
    status = CASE 
      WHEN new_overall_progress >= 100 THEN 'completed'
      ELSE status
    END
  WHERE id = plan_id_param;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para recalcular progresso do PDI quando meta é atualizada
CREATE OR REPLACE FUNCTION public.trigger_recalculate_pdi_progress()
RETURNS trigger AS $$
BEGIN
  IF NEW.plan_id IS NOT NULL THEN
    PERFORM public.recalculate_pdi_progress(NEW.plan_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_goal_progress_update ON public.development_goals;
CREATE TRIGGER trigger_goal_progress_update
  AFTER UPDATE OF progress ON public.development_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_pdi_progress();