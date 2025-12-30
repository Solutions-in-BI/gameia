-- =============================================
-- TREINAMENTO GUIADO POR LIVRO - MIGRAÇÃO (CORRIGIDA)
-- =============================================

-- 1. Expandir tabela routine_applications
ALTER TABLE public.routine_applications 
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS commitment_id uuid REFERENCES public.commitments(id),
  ADD COLUMN IF NOT EXISTS pdi_goal_id uuid REFERENCES public.development_goals(id),
  ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES public.skill_configurations(id),
  ADD COLUMN IF NOT EXISTS training_id uuid REFERENCES public.trainings(id),
  ADD COLUMN IF NOT EXISTS is_late boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS manager_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reflection_summary text,
  ADD COLUMN IF NOT EXISTS ai_feedback text,
  ADD COLUMN IF NOT EXISTS consistency_score numeric DEFAULT 0;

-- 2. Criar tabela para alertas de aplicação prática
CREATE TABLE IF NOT EXISTS public.book_application_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  application_id uuid REFERENCES public.routine_applications(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('reminder_start', 'reminder_1d', 'reminder_3d', 'overdue', 'completed', 'manager_review')),
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  notification_id uuid REFERENCES public.notifications(id),
  created_at timestamptz DEFAULT now()
);

-- 3. Criar tabela para resumos por IA
CREATE TABLE IF NOT EXISTS public.book_application_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  training_id uuid REFERENCES public.trainings(id),
  module_id uuid,
  period_start date NOT NULL,
  period_end date NOT NULL,
  ai_summary text,
  key_insights jsonb DEFAULT '[]'::jsonb,
  common_themes jsonb DEFAULT '[]'::jsonb,
  common_challenges jsonb DEFAULT '[]'::jsonb,
  participation_rate numeric DEFAULT 0,
  on_time_rate numeric DEFAULT 0,
  avg_reflection_quality numeric DEFAULT 0,
  total_applications integer DEFAULT 0,
  completed_on_time integer DEFAULT 0,
  completed_late integer DEFAULT 0,
  pending integer DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Criar tabela para próximos passos unificados
CREATE TABLE IF NOT EXISTS public.user_next_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  step_type text NOT NULL CHECK (step_type IN ('book_application', 'daily_mission', '1on1_action', 'pdi_goal', 'training_module', 'commitment')),
  source_id uuid NOT NULL,
  source_table text NOT NULL,
  title text NOT NULL,
  description text,
  deadline_at timestamptz,
  priority text DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  source_context jsonb DEFAULT '{}'::jsonb,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_book_application_alerts_user ON public.book_application_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_book_application_alerts_scheduled ON public.book_application_alerts(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_book_application_summaries_org ON public.book_application_summaries(organization_id);
CREATE INDEX IF NOT EXISTS idx_book_application_summaries_training ON public.book_application_summaries(training_id);
CREATE INDEX IF NOT EXISTS idx_user_next_steps_user ON public.user_next_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_next_steps_deadline ON public.user_next_steps(deadline_at) WHERE is_completed = false;
CREATE INDEX IF NOT EXISTS idx_routine_applications_deadline ON public.routine_applications(deadline_at) WHERE status != 'completed';

-- 6. Enable RLS
ALTER TABLE public.book_application_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_application_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_next_steps ENABLE ROW LEVEL SECURITY;

-- 7. Policies para book_application_alerts
CREATE POLICY "Users can view own alerts"
  ON public.book_application_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts"
  ON public.book_application_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update alerts"
  ON public.book_application_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. Policies para book_application_summaries
CREATE POLICY "Org members can view summaries"
  ON public.book_application_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.organization_id = book_application_summaries.organization_id
    )
  );

CREATE POLICY "Managers can insert summaries"
  ON public.book_application_summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = book_application_summaries.organization_id
      AND om.role IN ('admin', 'manager', 'leader')
    )
  );

-- 9. Policies para user_next_steps
CREATE POLICY "Users can view own next steps"
  ON public.user_next_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own next steps"
  ON public.user_next_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own next steps"
  ON public.user_next_steps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own next steps"
  ON public.user_next_steps FOR DELETE
  USING (auth.uid() = user_id);

-- 10. Managers can view team next steps
CREATE POLICY "Managers can view team next steps"
  ON public.user_next_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
      AND om.organization_id = user_next_steps.organization_id
      AND om.role IN ('admin', 'manager', 'leader')
    )
  );

-- 11. Função para criar próximo passo automaticamente
CREATE OR REPLACE FUNCTION public.create_next_step_from_application()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_module_name text;
BEGIN
  -- Buscar organization_id do usuário
  SELECT om.organization_id INTO v_org_id
  FROM public.organization_members om
  WHERE om.user_id = NEW.user_id
  LIMIT 1;
  
  -- Buscar nome do módulo
  SELECT name INTO v_module_name
  FROM public.training_modules
  WHERE id = NEW.module_id;

  -- Quando uma aplicação é iniciada (status = 'in_progress'), criar próximo passo
  IF NEW.status = 'in_progress' AND (OLD IS NULL OR OLD.status != 'in_progress') THEN
    INSERT INTO public.user_next_steps (
      user_id,
      organization_id,
      step_type,
      source_id,
      source_table,
      title,
      description,
      deadline_at,
      priority,
      source_context
    )
    VALUES (
      NEW.user_id,
      v_org_id,
      'book_application',
      NEW.id,
      'routine_applications',
      COALESCE(v_module_name, 'Aplicação Prática'),
      NEW.evidence_content,
      NEW.deadline_at,
      CASE 
        WHEN NEW.deadline_at IS NOT NULL AND NEW.deadline_at < now() + interval '1 day' THEN 'urgent'
        WHEN NEW.deadline_at IS NOT NULL AND NEW.deadline_at < now() + interval '3 days' THEN 'high'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'training_id', NEW.training_id,
        'module_id', NEW.module_id,
        'evidence_type', NEW.evidence_type
      )
    );
  END IF;
  
  -- Quando completada, marcar próximo passo como concluído
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.user_next_steps
    SET is_completed = true, completed_at = now(), updated_at = now()
    WHERE source_id = NEW.id AND source_table = 'routine_applications';
    
    -- Verificar se está atrasado
    IF NEW.deadline_at IS NOT NULL AND now() > NEW.deadline_at THEN
      NEW.is_late := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger para próximos passos
DROP TRIGGER IF EXISTS trigger_create_next_step_from_application ON public.routine_applications;
CREATE TRIGGER trigger_create_next_step_from_application
  BEFORE INSERT OR UPDATE ON public.routine_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_next_step_from_application();

-- 13. Função para criar alertas automaticamente
CREATE OR REPLACE FUNCTION public.create_application_alerts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' AND NEW.deadline_at IS NOT NULL THEN
    -- Alerta 3 dias antes (se aplicável)
    IF NEW.deadline_at > now() + interval '3 days' THEN
      INSERT INTO public.book_application_alerts (user_id, application_id, alert_type, scheduled_for)
      VALUES (NEW.user_id, NEW.id, 'reminder_3d', NEW.deadline_at - interval '3 days');
    END IF;
    
    -- Alerta 1 dia antes
    IF NEW.deadline_at > now() + interval '1 day' THEN
      INSERT INTO public.book_application_alerts (user_id, application_id, alert_type, scheduled_for)
      VALUES (NEW.user_id, NEW.id, 'reminder_1d', NEW.deadline_at - interval '1 day');
    END IF;
    
    -- Alerta de vencimento
    INSERT INTO public.book_application_alerts (user_id, application_id, alert_type, scheduled_for)
    VALUES (NEW.user_id, NEW.id, 'overdue', NEW.deadline_at);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Trigger para alertas
DROP TRIGGER IF EXISTS trigger_create_application_alerts ON public.routine_applications;
CREATE TRIGGER trigger_create_application_alerts
  AFTER INSERT OR UPDATE ON public.routine_applications
  FOR EACH ROW
  WHEN (NEW.status = 'in_progress' AND NEW.deadline_at IS NOT NULL)
  EXECUTE FUNCTION public.create_application_alerts();

-- 15. Função RPC para buscar próximos passos
CREATE OR REPLACE FUNCTION public.get_user_next_steps(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  step_type text,
  source_id uuid,
  source_table text,
  title text,
  description text,
  deadline_at timestamptz,
  priority text,
  source_context jsonb,
  days_remaining integer,
  is_overdue boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ns.id,
    ns.step_type,
    ns.source_id,
    ns.source_table,
    ns.title,
    ns.description,
    ns.deadline_at,
    ns.priority,
    ns.source_context,
    CASE 
      WHEN ns.deadline_at IS NULL THEN NULL
      ELSE EXTRACT(DAY FROM ns.deadline_at - now())::integer
    END as days_remaining,
    CASE 
      WHEN ns.deadline_at IS NULL THEN false
      ELSE ns.deadline_at < now()
    END as is_overdue
  FROM public.user_next_steps ns
  WHERE ns.user_id = p_user_id
    AND ns.is_completed = false
  ORDER BY 
    CASE ns.priority 
      WHEN 'urgent' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'normal' THEN 3 
      ELSE 4 
    END,
    ns.deadline_at NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Função RPC para manager ver aplicações da equipe
CREATE OR REPLACE FUNCTION public.get_team_book_applications(
  p_organization_id uuid,
  p_training_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  application_id uuid,
  user_id uuid,
  user_name text,
  user_avatar text,
  module_id uuid,
  module_name text,
  training_id uuid,
  training_name text,
  status text,
  evidence_type text,
  evidence_content text,
  evidence_url text,
  started_at timestamptz,
  completed_at timestamptz,
  deadline_at timestamptz,
  is_late boolean,
  manager_feedback text,
  manager_viewed_at timestamptz,
  reflection_summary text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ra.id as application_id,
    ra.user_id,
    u.nickname as user_name,
    u.avatar_url as user_avatar,
    ra.module_id,
    tm.name as module_name,
    ra.training_id,
    t.name as training_name,
    ra.status,
    ra.evidence_type,
    ra.evidence_content,
    ra.evidence_url,
    ra.started_at,
    ra.completed_at,
    ra.deadline_at,
    ra.is_late,
    ra.manager_feedback,
    ra.manager_viewed_at,
    ra.reflection_summary
  FROM public.routine_applications ra
  JOIN public.organization_members om ON om.user_id = ra.user_id AND om.organization_id = p_organization_id
  LEFT JOIN public.profiles u ON u.id = ra.user_id
  LEFT JOIN public.training_modules tm ON tm.id = ra.module_id
  LEFT JOIN public.trainings t ON t.id = ra.training_id
  WHERE (p_training_id IS NULL OR ra.training_id = p_training_id)
    AND (p_status IS NULL OR ra.status = p_status)
  ORDER BY 
    CASE WHEN ra.status = 'in_progress' AND ra.deadline_at < now() THEN 0 ELSE 1 END,
    ra.deadline_at NULLS LAST,
    ra.started_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_next_steps TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_book_applications TO authenticated;