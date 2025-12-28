-- =============================================
-- MÓDULO: AVALIAÇÃO 360°
-- =============================================

-- Ciclos de avaliação
CREATE TABLE public.assessment_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cycle_type TEXT DEFAULT '360' CHECK (cycle_type IN ('360', '180', 'self', 'manager')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  config JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Avaliações individuais
CREATE TABLE public.assessments_360 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.assessment_cycles(id) ON DELETE CASCADE,
  evaluatee_id UUID NOT NULL,
  evaluator_id UUID NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('self', 'manager', 'peer', 'subordinate', 'external')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  responses JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resultados consolidados
CREATE TABLE public.assessment_360_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.assessment_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  consolidated_scores JSONB,
  strengths TEXT[],
  development_areas TEXT[],
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MÓDULO: PDI (Plano de Desenvolvimento Individual)
-- =============================================

CREATE TABLE public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  manager_id UUID,
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  overall_progress INTEGER DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  xp_on_completion INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.development_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.development_plans(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skill_configurations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  success_criteria TEXT[],
  target_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  evidence_urls TEXT[],
  manager_notes TEXT,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.development_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress_update TEXT,
  blockers TEXT,
  new_progress INTEGER CHECK (new_progress >= 0 AND new_progress <= 100),
  checked_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MÓDULO: ONE-ON-ONE
-- =============================================

CREATE TABLE public.one_on_one_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.one_on_one_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  template_id UUID REFERENCES public.one_on_one_templates(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  location TEXT,
  recurrence TEXT CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'biweekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.one_on_one_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('wins', 'challenges', 'feedback', 'action_items', 'goals_review', 'general')),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  related_goal_id UUID REFERENCES public.development_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.one_on_one_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MÓDULO: TESTES COGNITIVOS
-- =============================================

CREATE TABLE public.cognitive_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  test_type TEXT NOT NULL CHECK (test_type IN ('logic', 'numerical', 'verbal', 'spatial', 'attention', 'memory')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit_minutes INTEGER,
  questions_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cognitive_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.cognitive_tests(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('sequence', 'pattern', 'analogy', 'syllogism', 'calculation', 'word_problem')),
  content JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  avg_time_seconds INTEGER,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cognitive_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.cognitive_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_proctored BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '[]',
  score INTEGER,
  percentile INTEGER,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE TABLE public.cognitive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  logical_reasoning INTEGER CHECK (logical_reasoning >= 0 AND logical_reasoning <= 100),
  numerical_ability INTEGER CHECK (numerical_ability >= 0 AND numerical_ability <= 100),
  verbal_reasoning INTEGER CHECK (verbal_reasoning >= 0 AND verbal_reasoning <= 100),
  spatial_reasoning INTEGER CHECK (spatial_reasoning >= 0 AND spatial_reasoning <= 100),
  attention_to_detail INTEGER CHECK (attention_to_detail >= 0 AND attention_to_detail <= 100),
  working_memory INTEGER CHECK (working_memory >= 0 AND working_memory <= 100),
  processing_speed INTEGER CHECK (processing_speed >= 0 AND processing_speed <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  assessments_count INTEGER DEFAULT 0,
  last_assessed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.assessment_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments_360 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_360_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_profiles ENABLE ROW LEVEL SECURITY;

-- Assessment Cycles - org members can view, admins can manage
CREATE POLICY "assessment_cycles_org_view" ON public.assessment_cycles
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "assessment_cycles_admin_manage" ON public.assessment_cycles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- Assessments 360 - evaluators and evaluatees can access their own
CREATE POLICY "assessments_360_own" ON public.assessments_360
  FOR ALL USING (evaluator_id = auth.uid() OR evaluatee_id = auth.uid());

CREATE POLICY "assessments_360_admin" ON public.assessments_360
  FOR SELECT USING (
    cycle_id IN (
      SELECT id FROM public.assessment_cycles WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner', 'manager')
      )
    )
  );

-- Assessment Results - users can see their own, admins can see all
CREATE POLICY "assessment_results_own" ON public.assessment_360_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "assessment_results_admin" ON public.assessment_360_results
  FOR ALL USING (
    cycle_id IN (
      SELECT id FROM public.assessment_cycles WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
      )
    )
  );

-- Development Plans - users can see their own, managers can see their team's
CREATE POLICY "development_plans_own" ON public.development_plans
  FOR ALL USING (user_id = auth.uid() OR manager_id = auth.uid());

CREATE POLICY "development_plans_admin" ON public.development_plans
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- Development Goals - through plan access
CREATE POLICY "development_goals_access" ON public.development_goals
  FOR ALL USING (
    plan_id IN (
      SELECT id FROM public.development_plans 
      WHERE user_id = auth.uid() OR manager_id = auth.uid()
      UNION
      SELECT id FROM public.development_plans WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
      )
    )
  );

-- Goal Check-ins
CREATE POLICY "goal_check_ins_access" ON public.goal_check_ins
  FOR ALL USING (
    user_id = auth.uid() OR checked_by = auth.uid() OR
    goal_id IN (
      SELECT id FROM public.development_goals WHERE plan_id IN (
        SELECT id FROM public.development_plans WHERE manager_id = auth.uid()
      )
    )
  );

-- One-on-One Templates - org access
CREATE POLICY "one_on_one_templates_org" ON public.one_on_one_templates
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "one_on_one_templates_admin" ON public.one_on_one_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- One-on-One Meetings
CREATE POLICY "one_on_one_meetings_own" ON public.one_on_one_meetings
  FOR ALL USING (manager_id = auth.uid() OR employee_id = auth.uid());

CREATE POLICY "one_on_one_meetings_admin" ON public.one_on_one_meetings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- One-on-One Notes
CREATE POLICY "one_on_one_notes_access" ON public.one_on_one_notes
  FOR ALL USING (
    author_id = auth.uid() OR
    meeting_id IN (
      SELECT id FROM public.one_on_one_meetings 
      WHERE manager_id = auth.uid() OR employee_id = auth.uid()
    )
  );

-- One-on-One Action Items
CREATE POLICY "one_on_one_action_items_access" ON public.one_on_one_action_items
  FOR ALL USING (
    assigned_to = auth.uid() OR
    meeting_id IN (
      SELECT id FROM public.one_on_one_meetings WHERE manager_id = auth.uid()
    )
  );

-- Cognitive Tests - org can view active, admins manage
CREATE POLICY "cognitive_tests_view" ON public.cognitive_tests
  FOR SELECT USING (
    is_active = true AND organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "cognitive_tests_admin" ON public.cognitive_tests
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- Cognitive Test Questions - through test access
CREATE POLICY "cognitive_test_questions_view" ON public.cognitive_test_questions
  FOR SELECT USING (
    test_id IN (
      SELECT id FROM public.cognitive_tests WHERE is_active = true AND organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "cognitive_test_questions_admin" ON public.cognitive_test_questions
  FOR ALL USING (
    test_id IN (
      SELECT id FROM public.cognitive_tests WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
      )
    )
  );

-- Cognitive Test Sessions - users see own, admins see org
CREATE POLICY "cognitive_test_sessions_own" ON public.cognitive_test_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "cognitive_test_sessions_admin" ON public.cognitive_test_sessions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- Cognitive Profiles - users see own, admins see org
CREATE POLICY "cognitive_profiles_own" ON public.cognitive_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "cognitive_profiles_admin" ON public.cognitive_profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_assessment_cycles_org ON public.assessment_cycles(organization_id);
CREATE INDEX idx_assessments_360_cycle ON public.assessments_360(cycle_id);
CREATE INDEX idx_assessments_360_evaluator ON public.assessments_360(evaluator_id);
CREATE INDEX idx_assessments_360_evaluatee ON public.assessments_360(evaluatee_id);
CREATE INDEX idx_development_plans_org ON public.development_plans(organization_id);
CREATE INDEX idx_development_plans_user ON public.development_plans(user_id);
CREATE INDEX idx_development_goals_plan ON public.development_goals(plan_id);
CREATE INDEX idx_one_on_one_meetings_org ON public.one_on_one_meetings(organization_id);
CREATE INDEX idx_one_on_one_meetings_manager ON public.one_on_one_meetings(manager_id);
CREATE INDEX idx_cognitive_tests_org ON public.cognitive_tests(organization_id);
CREATE INDEX idx_cognitive_test_sessions_user ON public.cognitive_test_sessions(user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update development_plans.updated_at
CREATE TRIGGER update_development_plans_updated_at
  BEFORE UPDATE ON public.development_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update cognitive_profiles.updated_at
CREATE TRIGGER update_cognitive_profiles_updated_at
  BEFORE UPDATE ON public.cognitive_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();