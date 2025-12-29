-- ==========================================
-- FASE 1: EXPANSÃO DO MODELO DE TREINAMENTOS
-- ==========================================

-- 1. ALTERAR TABELA trainings
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS skill_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS required_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS training_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{"min_modules_completed": 100, "require_all_checkpoints": true}',
ADD COLUMN IF NOT EXISTS bonus_rules JSONB DEFAULT '{"type": "fixed", "base_xp": 100, "base_coins": 50, "tiers": []}',
ADD COLUMN IF NOT EXISTS insignia_reward_id UUID REFERENCES public.insignias(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS allow_retry BOOLEAN DEFAULT true;

-- Migrar dados de is_active para training_status
UPDATE public.trainings 
SET training_status = CASE WHEN is_active = true THEN 'active' ELSE 'draft' END
WHERE training_status IS NULL OR training_status = 'draft';

-- 2. ALTERAR TABELA training_modules
ALTER TABLE public.training_modules
ADD COLUMN IF NOT EXISTS step_type TEXT DEFAULT 'content',
ADD COLUMN IF NOT EXISTS step_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS validation_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_checkpoint BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skill_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 5;

-- Migrar content_type para step_type
UPDATE public.training_modules 
SET step_type = CASE 
  WHEN content_type = 'video' THEN 'content'
  WHEN content_type = 'text' THEN 'content'
  WHEN content_type = 'quiz' THEN 'quiz'
  WHEN content_type = 'pdf' THEN 'content'
  WHEN content_type = 'link' THEN 'content'
  ELSE 'content'
END
WHERE step_type = 'content' OR step_type IS NULL;

-- 3. CRIAR TABELA org_training_config
CREATE TABLE IF NOT EXISTS public.org_training_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  requirement_type TEXT DEFAULT 'optional',
  xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
  coins_multiplier DECIMAL(3,2) DEFAULT 1.00,
  team_ids UUID[] DEFAULT '{}',
  role_ids UUID[] DEFAULT '{}',
  deadline_days INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, training_id)
);

-- RLS para org_training_config
ALTER TABLE public.org_training_config ENABLE ROW LEVEL SECURITY;

-- Policy usando user_roles para admins
CREATE POLICY "Org admins can manage training config" 
  ON public.org_training_config 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT ur.organization_id FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin')
      AND ur.is_active = true
    )
  );

-- Policy para membros verem config da org
CREATE POLICY "Members can view their org training config" 
  ON public.org_training_config 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT om.organization_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- 4. ALTERAR TABELA user_training_progress
ALTER TABLE public.user_training_progress
ADD COLUMN IF NOT EXISTS assigned_by UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS average_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bonus_xp_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- 5. ALTERAR TABELA user_module_progress
ALTER TABLE public.user_module_progress
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS passed_validation BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 6. CRIAR TABELA training_analytics
CREATE TABLE IF NOT EXISTS public.training_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  score INTEGER DEFAULT NULL,
  time_spent_seconds INTEGER DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para training_analytics
ALTER TABLE public.training_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics" 
  ON public.training_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" 
  ON public.training_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Org admins can view org analytics" 
  ON public.training_analytics 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT ur.organization_id FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin', 'manager')
      AND ur.is_active = true
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_training_analytics_training ON public.training_analytics(training_id);
CREATE INDEX IF NOT EXISTS idx_training_analytics_user ON public.training_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_training_analytics_org ON public.training_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_analytics_event ON public.training_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_training_analytics_created ON public.training_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_training_config_org ON public.org_training_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_training_config_training ON public.org_training_config(training_id);

-- 7. FUNÇÃO para calcular métricas de treinamento
CREATE OR REPLACE FUNCTION public.get_training_metrics(
  p_training_id UUID,
  p_org_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now() - interval '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH stats AS (
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'training_started' THEN user_id END) as starts,
      COUNT(DISTINCT CASE WHEN event_type = 'training_completed' THEN user_id END) as completions,
      COUNT(CASE WHEN event_type = 'checkpoint_passed' THEN 1 END) as checkpoints_passed,
      COUNT(CASE WHEN event_type = 'checkpoint_failed' THEN 1 END) as checkpoints_failed,
      AVG(CASE WHEN event_type = 'training_completed' THEN score END) as avg_score,
      AVG(CASE WHEN event_type = 'training_completed' THEN time_spent_seconds END) as avg_time
    FROM training_analytics
    WHERE training_id = p_training_id
      AND (p_org_id IS NULL OR organization_id = p_org_id)
      AND created_at BETWEEN p_start_date AND p_end_date
  )
  SELECT jsonb_build_object(
    'starts', COALESCE(starts, 0),
    'completions', COALESCE(completions, 0),
    'completion_rate', CASE WHEN starts > 0 THEN ROUND((completions::decimal / starts) * 100, 1) ELSE 0 END,
    'checkpoints_passed', COALESCE(checkpoints_passed, 0),
    'checkpoints_failed', COALESCE(checkpoints_failed, 0),
    'checkpoint_pass_rate', CASE WHEN (checkpoints_passed + checkpoints_failed) > 0 
      THEN ROUND((checkpoints_passed::decimal / (checkpoints_passed + checkpoints_failed)) * 100, 1) ELSE 0 END,
    'avg_score', COALESCE(ROUND(avg_score::decimal, 1), 0),
    'avg_time_minutes', COALESCE(ROUND(avg_time / 60, 1), 0)
  ) INTO result
  FROM stats;
  
  RETURN result;
END;
$$;

-- 8. FUNÇÃO para completar treinamento com recompensas
CREATE OR REPLACE FUNCTION public.complete_training_with_rewards(
  p_training_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_training trainings%ROWTYPE;
  v_progress user_training_progress%ROWTYPE;
  v_avg_score INTEGER;
  v_base_xp INTEGER;
  v_base_coins INTEGER;
  v_bonus_xp INTEGER := 0;
  v_bonus_coins INTEGER := 0;
  v_total_xp INTEGER;
  v_total_coins INTEGER;
  v_org_config org_training_config%ROWTYPE;
  v_user_org UUID;
  v_result JSONB;
BEGIN
  SELECT * INTO v_training FROM trainings WHERE id = p_training_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Training not found');
  END IF;
  
  SELECT * INTO v_progress FROM user_training_progress 
  WHERE training_id = p_training_id AND user_id = p_user_id;
  
  IF v_progress.completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Training already completed');
  END IF;
  
  SELECT COALESCE(AVG(score), 0)::INTEGER INTO v_avg_score
  FROM user_module_progress ump
  JOIN training_modules tm ON tm.id = ump.module_id
  WHERE tm.training_id = p_training_id AND ump.user_id = p_user_id AND ump.score IS NOT NULL;
  
  v_base_xp := COALESCE((v_training.bonus_rules->>'base_xp')::INTEGER, v_training.xp_reward);
  v_base_coins := COALESCE((v_training.bonus_rules->>'base_coins')::INTEGER, v_training.coins_reward);
  
  IF v_training.bonus_rules ? 'tiers' AND jsonb_array_length(v_training.bonus_rules->'tiers') > 0 THEN
    SELECT 
      COALESCE(SUM((tier->>'xp_bonus')::INTEGER), 0),
      COALESCE(SUM((tier->>'coins_bonus')::INTEGER), 0)
    INTO v_bonus_xp, v_bonus_coins
    FROM jsonb_array_elements(v_training.bonus_rules->'tiers') AS tier
    WHERE (tier->>'min_score')::INTEGER <= v_avg_score;
  END IF;
  
  SELECT om.organization_id INTO v_user_org 
  FROM organization_members om 
  WHERE om.user_id = p_user_id AND om.is_active = true 
  LIMIT 1;
  
  IF v_user_org IS NOT NULL THEN
    SELECT * INTO v_org_config 
    FROM org_training_config 
    WHERE organization_id = v_user_org AND training_id = p_training_id;
    
    IF FOUND THEN
      v_base_xp := ROUND(v_base_xp * v_org_config.xp_multiplier);
      v_base_coins := ROUND(v_base_coins * v_org_config.coins_multiplier);
    END IF;
  END IF;
  
  v_total_xp := v_base_xp + v_bonus_xp;
  v_total_coins := v_base_coins + v_bonus_coins;
  
  UPDATE user_training_progress SET
    progress_percent = 100,
    completed_at = now(),
    average_score = v_avg_score,
    bonus_xp_earned = v_bonus_xp
  WHERE training_id = p_training_id AND user_id = p_user_id;
  
  UPDATE user_gamification SET
    xp = COALESCE(xp, 0) + v_total_xp,
    coins = COALESCE(coins, 0) + v_total_coins
  WHERE user_id = p_user_id;
  
  IF v_training.skill_ids IS NOT NULL AND array_length(v_training.skill_ids, 1) > 0 THEN
    UPDATE user_skills SET
      current_xp = current_xp + (v_total_xp / array_length(v_training.skill_ids, 1)),
      updated_at = now()
    WHERE user_id = p_user_id AND skill_id = ANY(v_training.skill_ids);
  END IF;
  
  INSERT INTO training_analytics (organization_id, training_id, user_id, event_type, score, metadata)
  VALUES (v_user_org, p_training_id, p_user_id, 'training_completed', v_avg_score, 
    jsonb_build_object('xp_earned', v_total_xp, 'coins_earned', v_total_coins, 'bonus_xp', v_bonus_xp));
  
  INSERT INTO core_events (user_id, organization_id, event_type, skill_ids, xp_earned, coins_earned, score, metadata)
  VALUES (p_user_id, v_user_org, 'TREINAMENTO_CONCLUIDO', v_training.skill_ids, v_total_xp, v_total_coins, v_avg_score,
    jsonb_build_object('training_id', p_training_id, 'training_name', v_training.name, 'bonus_xp', v_bonus_xp));
  
  IF v_training.insignia_reward_id IS NOT NULL THEN
    INSERT INTO user_insignias (user_id, insignia_id, organization_id, earned_reason)
    VALUES (p_user_id, v_training.insignia_reward_id, v_user_org, 'Conclusão do treinamento: ' || v_training.name)
    ON CONFLICT (user_id, insignia_id) DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_total_xp,
    'coins_earned', v_total_coins,
    'bonus_xp', v_bonus_xp,
    'average_score', v_avg_score,
    'insignia_earned', v_training.insignia_reward_id IS NOT NULL
  );
END;
$$;

-- 9. FUNÇÃO para validar conclusão de módulo
CREATE OR REPLACE FUNCTION public.validate_module_completion(
  p_module_id UUID,
  p_user_id UUID,
  p_score INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module training_modules%ROWTYPE;
  v_passed BOOLEAN := true;
  v_user_org UUID;
BEGIN
  SELECT * INTO v_module FROM training_modules WHERE id = p_module_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Module not found');
  END IF;
  
  IF v_module.is_checkpoint AND v_module.min_score IS NOT NULL THEN
    v_passed := COALESCE(p_score, 0) >= v_module.min_score;
  END IF;
  
  INSERT INTO user_module_progress (user_id, module_id, score, passed_validation, is_completed, completed_at)
  VALUES (p_user_id, p_module_id, p_score, v_passed, v_passed, CASE WHEN v_passed THEN now() ELSE NULL END)
  ON CONFLICT (user_id, module_id) DO UPDATE SET
    score = COALESCE(p_score, user_module_progress.score),
    passed_validation = v_passed,
    is_completed = v_passed,
    completed_at = CASE WHEN v_passed THEN now() ELSE user_module_progress.completed_at END,
    attempts = user_module_progress.attempts + 1;
  
  SELECT om.organization_id INTO v_user_org 
  FROM organization_members om 
  WHERE om.user_id = p_user_id AND om.is_active = true 
  LIMIT 1;
  
  IF v_module.is_checkpoint THEN
    INSERT INTO training_analytics (
      organization_id, training_id, module_id, user_id, event_type, score
    )
    VALUES (
      v_user_org, v_module.training_id, p_module_id, p_user_id,
      CASE WHEN v_passed THEN 'checkpoint_passed' ELSE 'checkpoint_failed' END,
      p_score
    );
  END IF;
  
  IF v_passed THEN
    UPDATE user_gamification SET
      xp = COALESCE(xp, 0) + COALESCE(v_module.xp_reward, 10),
      coins = COALESCE(coins, 0) + COALESCE(v_module.coins_reward, 5)
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'passed', v_passed,
    'is_checkpoint', v_module.is_checkpoint,
    'min_score', v_module.min_score,
    'score', p_score,
    'xp_earned', CASE WHEN v_passed THEN v_module.xp_reward ELSE 0 END,
    'coins_earned', CASE WHEN v_passed THEN v_module.coins_reward ELSE 0 END
  );
END;
$$;

-- Habilitar realtime para training_analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_analytics;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_org_training_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_org_training_config_updated_at ON public.org_training_config;
CREATE TRIGGER update_org_training_config_updated_at
  BEFORE UPDATE ON public.org_training_config
  FOR EACH ROW
  EXECUTE FUNCTION update_org_training_config_updated_at();