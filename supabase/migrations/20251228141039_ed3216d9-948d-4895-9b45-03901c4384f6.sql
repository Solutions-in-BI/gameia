-- =====================================================
-- FASE 1: Unificação do Módulo de Skills (CORRIGIDO)
-- =====================================================

-- 1.1 Adicionar colunas de hierarquia em skill_configurations
ALTER TABLE public.skill_configurations 
ADD COLUMN IF NOT EXISTS parent_skill_id UUID REFERENCES public.skill_configurations(id),
ADD COLUMN IF NOT EXISTS xp_per_level INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_unlocked_by_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 1.2 Adicionar TODAS as colunas faltantes em user_skill_levels
ALTER TABLE public.user_skill_levels 
ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mastery_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 1.3 Adicionar colunas de rewards em user_activity_log
ALTER TABLE public.user_activity_log 
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES public.skill_configurations(id);

-- 1.4 Criar tabela de log de eventos de skills
CREATE TABLE IF NOT EXISTS public.skill_events_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skill_configurations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  source_type TEXT,
  source_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_events_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill_events_log
CREATE POLICY "Users can view their own skill events"
  ON public.skill_events_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert skill events"
  ON public.skill_events_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 1.5 Criar view unificada de progresso de skills do usuário
CREATE OR REPLACE VIEW public.vw_user_skill_progress AS
SELECT 
  usl.id,
  usl.user_id,
  usl.skill_id,
  sc.skill_key,
  sc.name as skill_name,
  sc.description,
  sc.icon,
  sc.color,
  sc.category,
  sc.max_level,
  sc.xp_per_level,
  sc.parent_skill_id,
  sc.related_games,
  sc.organization_id,
  usl.current_level,
  usl.current_xp,
  usl.total_xp,
  usl.is_unlocked,
  usl.mastery_level,
  usl.last_practiced,
  usl.unlocked_at,
  CASE 
    WHEN sc.xp_per_level > 0 THEN 
      ROUND((usl.current_xp::NUMERIC / sc.xp_per_level) * 100, 1)
    ELSE 0 
  END as progress_percent,
  CASE 
    WHEN sc.max_level IS NOT NULL AND usl.current_level >= sc.max_level THEN true
    ELSE false 
  END as is_maxed
FROM public.user_skill_levels usl
JOIN public.skill_configurations sc ON sc.id = usl.skill_id;

-- 1.6 Criar view de métricas de skills para organização
CREATE OR REPLACE VIEW public.vw_org_skill_metrics AS
SELECT 
  sc.organization_id,
  sc.id as skill_id,
  sc.skill_key,
  sc.name as skill_name,
  sc.category,
  COUNT(DISTINCT usl.user_id) as total_users,
  COALESCE(AVG(usl.current_level), 0) as avg_level,
  COALESCE(AVG(usl.total_xp), 0) as avg_total_xp,
  COUNT(CASE WHEN usl.is_unlocked THEN 1 END) as unlocked_count,
  COUNT(CASE WHEN usl.mastery_level >= 5 THEN 1 END) as mastery_count
FROM public.skill_configurations sc
LEFT JOIN public.user_skill_levels usl ON usl.skill_id = sc.id
GROUP BY sc.organization_id, sc.id, sc.skill_key, sc.name, sc.category;

-- 1.7 Função para adicionar XP a uma skill com logging
CREATE OR REPLACE FUNCTION public.add_skill_xp(
  p_user_id UUID,
  p_skill_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT DEFAULT 'game',
  p_source_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill_config RECORD;
  v_user_skill RECORD;
  v_new_level INTEGER;
  v_new_xp INTEGER;
  v_new_total_xp INTEGER;
  v_leveled_up BOOLEAN := false;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  SELECT * INTO v_skill_config FROM skill_configurations WHERE id = p_skill_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Skill not found');
  END IF;

  SELECT * INTO v_user_skill FROM user_skill_levels WHERE user_id = p_user_id AND skill_id = p_skill_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_skill_levels (user_id, skill_id, current_level, current_xp, total_xp, is_unlocked, mastery_level, last_practiced)
    VALUES (p_user_id, p_skill_id, 1, 0, 0, true, 0, now())
    RETURNING * INTO v_user_skill;
  END IF;

  v_old_values := jsonb_build_object(
    'level', v_user_skill.current_level,
    'xp', v_user_skill.current_xp,
    'total_xp', v_user_skill.total_xp,
    'mastery_level', v_user_skill.mastery_level
  );

  v_new_total_xp := COALESCE(v_user_skill.total_xp, 0) + p_xp_amount;
  v_new_xp := COALESCE(v_user_skill.current_xp, 0) + p_xp_amount;
  v_new_level := COALESCE(v_user_skill.current_level, 1);

  WHILE v_new_xp >= v_skill_config.xp_per_level AND (v_skill_config.max_level IS NULL OR v_new_level < v_skill_config.max_level) LOOP
    v_new_xp := v_new_xp - v_skill_config.xp_per_level;
    v_new_level := v_new_level + 1;
    v_leveled_up := true;
  END LOOP;

  UPDATE user_skill_levels
  SET 
    current_level = v_new_level,
    current_xp = v_new_xp,
    total_xp = v_new_total_xp,
    mastery_level = CASE 
      WHEN v_skill_config.max_level IS NOT NULL AND v_new_level >= v_skill_config.max_level THEN 5
      WHEN v_new_level >= 10 THEN 4
      WHEN v_new_level >= 7 THEN 3
      WHEN v_new_level >= 4 THEN 2
      WHEN v_new_level >= 2 THEN 1
      ELSE 0
    END,
    last_practiced = now(),
    updated_at = now()
  WHERE user_id = p_user_id AND skill_id = p_skill_id;

  v_new_values := jsonb_build_object(
    'level', v_new_level,
    'xp', v_new_xp,
    'total_xp', v_new_total_xp,
    'xp_earned', p_xp_amount,
    'leveled_up', v_leveled_up
  );

  INSERT INTO skill_events_log (user_id, skill_id, event_type, old_value, new_value, source_type, source_id)
  VALUES (
    p_user_id, 
    p_skill_id, 
    CASE WHEN v_leveled_up THEN 'level_up' ELSE 'xp_earned' END,
    v_old_values,
    v_new_values,
    p_source_type,
    p_source_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'total_xp', v_new_total_xp,
    'leveled_up', v_leveled_up,
    'skill_name', v_skill_config.name
  );
END;
$$;

-- 1.8 Função para verificar saúde do módulo de skills
CREATE OR REPLACE FUNCTION public.check_skills_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_orphan_skills INTEGER;
  v_users_without_skills INTEGER;
  v_invalid_levels INTEGER;
  v_duplicate_entries INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_orphan_skills
  FROM skill_configurations sc
  WHERE sc.parent_skill_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM skill_configurations p WHERE p.id = sc.parent_skill_id);

  SELECT COUNT(*) INTO v_users_without_skills
  FROM profiles p
  WHERE NOT EXISTS (SELECT 1 FROM user_skill_levels usl WHERE usl.user_id = p.id);

  SELECT COUNT(*) INTO v_invalid_levels
  FROM user_skill_levels usl
  JOIN skill_configurations sc ON sc.id = usl.skill_id
  WHERE sc.max_level IS NOT NULL AND usl.current_level > sc.max_level;

  SELECT COUNT(*) - COUNT(DISTINCT (user_id, skill_id)) INTO v_duplicate_entries
  FROM user_skill_levels;

  v_result := jsonb_build_object(
    'healthy', (v_orphan_skills = 0 AND v_invalid_levels = 0 AND v_duplicate_entries = 0),
    'orphan_skills', v_orphan_skills,
    'users_without_skills', v_users_without_skills,
    'invalid_levels', v_invalid_levels,
    'duplicate_entries', v_duplicate_entries,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$;

-- 1.9 Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_skill_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_skill_levels_updated_at ON public.user_skill_levels;
CREATE TRIGGER update_user_skill_levels_updated_at
  BEFORE UPDATE ON public.user_skill_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_skill_levels_updated_at();

-- 1.10 Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_skill_configs_category ON public.skill_configurations(category);
CREATE INDEX IF NOT EXISTS idx_skill_configs_parent ON public.skill_configurations(parent_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_configs_org ON public.skill_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_levels_user ON public.user_skill_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_levels_skill ON public.user_skill_levels(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_events_user ON public.skill_events_log(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_events_skill ON public.skill_events_log(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_events_type ON public.skill_events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_skill ON public.user_activity_log(skill_id);