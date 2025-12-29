-- =====================================================
-- FASE 1: Sistema de Certificados Gameia
-- Expansão do modelo de dados
-- =====================================================

-- 1. Expandir tabela trainings com configuração de certificação
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS certificate_name TEXT,
ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'internal' CHECK (certificate_type IN ('internal', 'external')),
ADD COLUMN IF NOT EXISTS certificate_validity_months INTEGER,
ADD COLUMN IF NOT EXISTS certificate_min_score INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS certificate_require_checkpoints BOOLEAN DEFAULT true;

-- 2. Expandir tabela training_certificates
ALTER TABLE public.training_certificates 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
ADD COLUMN IF NOT EXISTS skills_validated UUID[],
ADD COLUMN IF NOT EXISTS final_score INTEGER,
ADD COLUMN IF NOT EXISTS verification_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS insignia_id UUID REFERENCES public.insignias(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_training_certificates_verification_code 
ON public.training_certificates(verification_code) WHERE verification_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_training_certificates_status 
ON public.training_certificates(status);

-- 3. Criar tabela training_skill_impact (relação N:N)
CREATE TABLE IF NOT EXISTS public.training_skill_impact (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skill_configurations(id) ON DELETE CASCADE,
    impact_weight TEXT NOT NULL DEFAULT 'medium' CHECK (impact_weight IN ('low', 'medium', 'high')),
    xp_multiplier DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(training_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_training_skill_impact_training ON public.training_skill_impact(training_id);
CREATE INDEX IF NOT EXISTS idx_training_skill_impact_skill ON public.training_skill_impact(skill_id);

-- RLS para training_skill_impact
ALTER TABLE public.training_skill_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training skill impacts"
ON public.training_skill_impact FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage training skill impacts"
ON public.training_skill_impact FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trainings t
        JOIN public.user_roles ur ON ur.organization_id = t.organization_id
        WHERE t.id = training_skill_impact.training_id
        AND ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin', 'owner')
    )
);

-- 4. Criar tabela training_insignia_relation
CREATE TABLE IF NOT EXISTS public.training_insignia_relation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    insignia_id UUID NOT NULL REFERENCES public.insignias(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL DEFAULT 'grants' CHECK (relation_type IN ('grants', 'partial_criteria')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(training_id, insignia_id)
);

CREATE INDEX IF NOT EXISTS idx_training_insignia_relation_training ON public.training_insignia_relation(training_id);

ALTER TABLE public.training_insignia_relation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training insignia relations"
ON public.training_insignia_relation FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage training insignia relations"
ON public.training_insignia_relation FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trainings t
        JOIN public.user_roles ur ON ur.organization_id = t.organization_id
        WHERE t.id = training_insignia_relation.training_id
        AND ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'super_admin', 'owner')
    )
);

-- 5. Função para gerar código de verificação único
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN substr(result, 1, 4) || '-' || substr(result, 5, 4) || '-' || substr(result, 9, 4);
END;
$$;

-- 6. Função para verificar elegibilidade de certificação
CREATE OR REPLACE FUNCTION public.check_certificate_eligibility(
    p_user_id UUID,
    p_training_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_training RECORD;
    v_progress RECORD;
    v_eligible BOOLEAN := true;
    v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
    SELECT * INTO v_training FROM trainings WHERE id = p_training_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reasons', ARRAY['Treinamento não encontrado']);
    END IF;
    
    IF NOT COALESCE(v_training.certificate_enabled, false) THEN
        RETURN jsonb_build_object('eligible', false, 'reasons', ARRAY['Certificação não habilitada']);
    END IF;
    
    SELECT * INTO v_progress FROM user_training_progress WHERE user_id = p_user_id AND training_id = p_training_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reasons', ARRAY['Usuário não iniciou o treinamento']);
    END IF;
    
    IF COALESCE(v_progress.progress, 0) < 100 THEN
        v_eligible := false;
        v_reasons := array_append(v_reasons, 'Treinamento não concluído (' || COALESCE(v_progress.progress, 0) || '%)');
    END IF;
    
    IF v_training.certificate_min_score IS NOT NULL AND COALESCE(v_progress.average_score, 0) < v_training.certificate_min_score THEN
        v_eligible := false;
        v_reasons := array_append(v_reasons, 'Score mínimo não atingido');
    END IF;
    
    IF COALESCE(v_training.certificate_require_checkpoints, true) THEN
        IF EXISTS (
            SELECT 1 FROM training_modules tm
            LEFT JOIN user_module_progress ump ON ump.module_id = tm.id AND ump.user_id = p_user_id
            WHERE tm.training_id = p_training_id AND tm.is_required = true
            AND (ump.is_completed IS NULL OR ump.is_completed = false)
        ) THEN
            v_eligible := false;
            v_reasons := array_append(v_reasons, 'Módulos obrigatórios pendentes');
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM training_certificates WHERE user_id = p_user_id AND training_id = p_training_id AND status = 'active') THEN
        RETURN jsonb_build_object('eligible', false, 'reasons', ARRAY['Certificado já emitido'], 'already_certified', true);
    END IF;
    
    RETURN jsonb_build_object(
        'eligible', v_eligible,
        'reasons', v_reasons,
        'training_name', v_training.name,
        'certificate_name', COALESCE(v_training.certificate_name, v_training.name),
        'certificate_type', COALESCE(v_training.certificate_type, 'internal'),
        'validity_months', v_training.certificate_validity_months,
        'final_score', COALESCE(v_progress.average_score, 0)
    );
END;
$$;

-- 7. Função para emitir certificado
CREATE OR REPLACE FUNCTION public.issue_certificate(p_user_id UUID, p_training_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_eligibility JSONB;
    v_training RECORD;
    v_certificate_id UUID;
    v_verification_code TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_skill_ids UUID[];
    v_org_id UUID;
BEGIN
    v_eligibility := check_certificate_eligibility(p_user_id, p_training_id);
    
    IF NOT (v_eligibility->>'eligible')::boolean THEN
        RETURN jsonb_build_object('success', false, 'error', 'Não elegível', 'details', v_eligibility);
    END IF;
    
    SELECT * INTO v_training FROM trainings WHERE id = p_training_id;
    v_org_id := v_training.organization_id;
    
    LOOP
        v_verification_code := generate_verification_code();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM training_certificates WHERE verification_code = v_verification_code);
    END LOOP;
    
    IF v_training.certificate_validity_months IS NOT NULL THEN
        v_expires_at := now() + (v_training.certificate_validity_months || ' months')::interval;
    END IF;
    
    SELECT array_agg(skill_id) INTO v_skill_ids FROM training_skill_impact WHERE training_id = p_training_id;
    
    INSERT INTO training_certificates (
        user_id, training_id, organization_id, certificate_number, issued_at, expires_at, status,
        skills_validated, final_score, verification_code, metadata
    ) VALUES (
        p_user_id, p_training_id, v_org_id, v_verification_code, now(), v_expires_at, 'active',
        v_skill_ids, (v_eligibility->>'final_score')::integer, v_verification_code,
        jsonb_build_object(
            'certificate_name', v_eligibility->>'certificate_name',
            'certificate_type', v_eligibility->>'certificate_type',
            'training_name', v_eligibility->>'training_name'
        )
    ) RETURNING id INTO v_certificate_id;
    
    -- Conceder insígnias relacionadas
    INSERT INTO user_insignias (user_id, insignia_id, organization_id, unlocked_at)
    SELECT p_user_id, tir.insignia_id, v_org_id, now()
    FROM training_insignia_relation tir
    WHERE tir.training_id = p_training_id AND tir.relation_type = 'grants'
    AND NOT EXISTS (SELECT 1 FROM user_insignias ui WHERE ui.user_id = p_user_id AND ui.insignia_id = tir.insignia_id);
    
    -- Registrar evento
    INSERT INTO core_events (user_id, organization_id, event_type, xp_earned, coins_earned, metadata)
    VALUES (p_user_id, v_org_id, 'CERTIFICADO_EMITIDO', 50, 25,
        jsonb_build_object('certificate_id', v_certificate_id, 'training_id', p_training_id, 'verification_code', v_verification_code));
    
    RETURN jsonb_build_object('success', true, 'certificate_id', v_certificate_id, 'verification_code', v_verification_code, 'expires_at', v_expires_at);
END;
$$;

-- 8. Função para validar certificado
CREATE OR REPLACE FUNCTION public.validate_certificate(p_verification_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_certificate RECORD;
    v_profile RECORD;
    v_training RECORD;
    v_skills JSONB;
BEGIN
    SELECT tc.*, o.name as org_name INTO v_certificate
    FROM training_certificates tc
    LEFT JOIN organizations o ON o.id = tc.organization_id
    WHERE tc.verification_code = p_verification_code;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Certificado não encontrado');
    END IF;
    
    IF v_certificate.status = 'expired' OR (v_certificate.expires_at IS NOT NULL AND v_certificate.expires_at < now()) THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Certificado expirado');
    END IF;
    
    IF v_certificate.status = 'revoked' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Certificado revogado');
    END IF;
    
    SELECT nickname, avatar_url INTO v_profile FROM profiles WHERE id = v_certificate.user_id;
    SELECT name, description, difficulty INTO v_training FROM trainings WHERE id = v_certificate.training_id;
    
    SELECT jsonb_agg(jsonb_build_object('id', sc.id, 'name', sc.name, 'icon', sc.icon))
    INTO v_skills FROM skill_configurations sc WHERE sc.id = ANY(v_certificate.skills_validated);
    
    RETURN jsonb_build_object(
        'valid', true,
        'certificate', jsonb_build_object(
            'id', v_certificate.id,
            'verification_code', v_certificate.verification_code,
            'certificate_name', v_certificate.metadata->>'certificate_name',
            'issued_at', v_certificate.issued_at,
            'expires_at', v_certificate.expires_at,
            'final_score', v_certificate.final_score
        ),
        'holder', jsonb_build_object('name', v_profile.nickname, 'avatar_url', v_profile.avatar_url),
        'training', jsonb_build_object('name', v_training.name, 'description', v_training.description),
        'organization', v_certificate.org_name,
        'skills_validated', COALESCE(v_skills, '[]'::jsonb)
    );
END;
$$;