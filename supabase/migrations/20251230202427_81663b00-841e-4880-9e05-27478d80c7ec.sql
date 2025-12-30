-- =============================================
-- FASE 1: ESTRUTURA DE DADOS EXPANDIDA PARA CERTIFICADOS (CORRIGIDO)
-- =============================================

-- 1.1 Expandir tabela training_certificates com novos campos
ALTER TABLE training_certificates 
ADD COLUMN IF NOT EXISTS certificate_type text DEFAULT 'training',
ADD COLUMN IF NOT EXISTS source_type text,
ADD COLUMN IF NOT EXISTS source_id uuid,
ADD COLUMN IF NOT EXISTS criteria_met jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS level_achieved text,
ADD COLUMN IF NOT EXISTS requires_manager_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS manager_notes text,
ADD COLUMN IF NOT EXISTS unlocks jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS pdi_impact jsonb,
ADD COLUMN IF NOT EXISTS evolution_event_id uuid,
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- 1.2 Adicionar constraint de check para certificate_type
ALTER TABLE training_certificates 
DROP CONSTRAINT IF EXISTS check_certificate_type;

ALTER TABLE training_certificates 
ADD CONSTRAINT check_certificate_type 
CHECK (certificate_type IN ('training', 'journey', 'skill', 'level', 'behavioral'));

-- 1.3 Criar tabela de configurações de critérios por tipo de certificado
CREATE TABLE IF NOT EXISTS certificate_criteria_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    certificate_type text NOT NULL CHECK (certificate_type IN ('training', 'journey', 'skill', 'level', 'behavioral')),
    target_id uuid,
    name text NOT NULL,
    description text,
    
    -- Critérios
    min_completion_rate integer DEFAULT 100,
    min_score integer DEFAULT 70,
    min_games_participated integer DEFAULT 0,
    min_challenges_completed integer DEFAULT 0,
    min_feedback_score integer,
    require_360_assessment boolean DEFAULT false,
    required_training_ids uuid[] DEFAULT '{}',
    required_journey_ids uuid[] DEFAULT '{}',
    
    -- Aprovação
    requires_manager_approval boolean DEFAULT false,
    
    -- Validade
    validity_months integer,
    
    -- Recompensas
    xp_reward integer DEFAULT 0,
    coins_reward integer DEFAULT 0,
    insignia_id uuid,
    
    -- Desbloqueios
    unlocks jsonb DEFAULT '[]',
    
    -- Visual
    icon text DEFAULT '🏆',
    color text DEFAULT '#3b82f6',
    
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(organization_id, certificate_type, target_id)
);

-- 1.4 Criar tabela de regras de desbloqueio baseadas em certificados
CREATE TABLE IF NOT EXISTS certificate_unlock_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    
    required_certificate_type text NOT NULL CHECK (required_certificate_type IN ('training', 'journey', 'skill', 'level', 'behavioral')),
    required_source_id uuid,
    
    unlocks_type text NOT NULL CHECK (unlocks_type IN ('training', 'journey', 'challenge', 'level', 'insignia', 'item')),
    unlocks_id uuid NOT NULL,
    
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 1.5 Criar tabela de progresso para certificados
CREATE TABLE IF NOT EXISTS certificate_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    certificate_type text NOT NULL CHECK (certificate_type IN ('training', 'journey', 'skill', 'level', 'behavioral')),
    target_id uuid,
    config_id uuid REFERENCES certificate_criteria_configs(id) ON DELETE CASCADE,
    
    completion_rate integer DEFAULT 0,
    current_score integer DEFAULT 0,
    games_participated integer DEFAULT 0,
    challenges_completed integer DEFAULT 0,
    feedback_score integer,
    has_360_assessment boolean DEFAULT false,
    trainings_completed uuid[] DEFAULT '{}',
    journeys_completed uuid[] DEFAULT '{}',
    
    is_eligible boolean DEFAULT false,
    eligibility_checked_at timestamptz,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, certificate_type, target_id)
);

-- 1.6 Índices para performance
CREATE INDEX IF NOT EXISTS idx_certificates_type ON training_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificates_source ON training_certificates(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_certificates_org ON training_certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_approval ON training_certificates(requires_manager_approval, approved_by) WHERE requires_manager_approval = true;

CREATE INDEX IF NOT EXISTS idx_cert_criteria_org ON certificate_criteria_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_cert_criteria_type ON certificate_criteria_configs(certificate_type, target_id);

CREATE INDEX IF NOT EXISTS idx_cert_progress_user ON certificate_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_progress_eligible ON certificate_progress(is_eligible) WHERE is_eligible = true;

CREATE INDEX IF NOT EXISTS idx_cert_unlock_required ON certificate_unlock_rules(required_certificate_type, required_source_id);

-- 1.7 Enable RLS
ALTER TABLE certificate_criteria_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_unlock_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_progress ENABLE ROW LEVEL SECURITY;

-- 1.8 Policies para certificate_criteria_configs (usando organization_members)
CREATE POLICY "Org members can view certificate configs"
ON certificate_criteria_configs FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Org admins can manage certificate configs"
ON certificate_criteria_configs FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
        AND om.organization_id = certificate_criteria_configs.organization_id
        AND om.is_active = true
        AND om.role IN ('admin', 'org_admin', 'super_admin')
    )
);

-- 1.9 Policies para certificate_unlock_rules
CREATE POLICY "Org members can view unlock rules"
ON certificate_unlock_rules FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Org admins can manage unlock rules"
ON certificate_unlock_rules FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
        AND om.organization_id = certificate_unlock_rules.organization_id
        AND om.is_active = true
        AND om.role IN ('admin', 'org_admin', 'super_admin')
    )
);

-- 1.10 Policies para certificate_progress
CREATE POLICY "Users can view own certificate progress"
ON certificate_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own certificate progress"
ON certificate_progress FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Managers can view team certificate progress"
ON certificate_progress FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
        AND om.organization_id = certificate_progress.organization_id
        AND om.is_active = true
        AND om.role IN ('admin', 'org_admin', 'super_admin', 'manager', 'leader')
    )
);

-- 1.11 Função para verificar elegibilidade de certificado
CREATE OR REPLACE FUNCTION check_certificate_eligibility(
    p_user_id uuid,
    p_certificate_type text,
    p_target_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_config certificate_criteria_configs%ROWTYPE;
    v_progress certificate_progress%ROWTYPE;
    v_is_eligible boolean := true;
    v_missing_criteria jsonb := '[]'::jsonb;
BEGIN
    -- Buscar configuração
    SELECT * INTO v_config
    FROM certificate_criteria_configs
    WHERE certificate_type = p_certificate_type
    AND (target_id = p_target_id OR (target_id IS NULL AND p_target_id IS NULL))
    AND is_active = true
    LIMIT 1;
    
    IF v_config.id IS NULL THEN
        RETURN jsonb_build_object(
            'eligible', true,
            'no_config', true,
            'message', 'Sem configuração específica - elegível por padrão'
        );
    END IF;
    
    -- Buscar progresso
    SELECT * INTO v_progress
    FROM certificate_progress
    WHERE user_id = p_user_id
    AND certificate_type = p_certificate_type
    AND (target_id = p_target_id OR (target_id IS NULL AND p_target_id IS NULL));
    
    -- Verificar critérios
    IF COALESCE(v_progress.completion_rate, 0) < v_config.min_completion_rate THEN
        v_is_eligible := false;
        v_missing_criteria := v_missing_criteria || jsonb_build_object(
            'criterion', 'completion_rate',
            'required', v_config.min_completion_rate,
            'current', COALESCE(v_progress.completion_rate, 0)
        );
    END IF;
    
    IF COALESCE(v_progress.current_score, 0) < v_config.min_score THEN
        v_is_eligible := false;
        v_missing_criteria := v_missing_criteria || jsonb_build_object(
            'criterion', 'min_score',
            'required', v_config.min_score,
            'current', COALESCE(v_progress.current_score, 0)
        );
    END IF;
    
    IF v_config.min_games_participated > 0 AND COALESCE(v_progress.games_participated, 0) < v_config.min_games_participated THEN
        v_is_eligible := false;
        v_missing_criteria := v_missing_criteria || jsonb_build_object(
            'criterion', 'games_participated',
            'required', v_config.min_games_participated,
            'current', COALESCE(v_progress.games_participated, 0)
        );
    END IF;
    
    IF v_config.min_challenges_completed > 0 AND COALESCE(v_progress.challenges_completed, 0) < v_config.min_challenges_completed THEN
        v_is_eligible := false;
        v_missing_criteria := v_missing_criteria || jsonb_build_object(
            'criterion', 'challenges_completed',
            'required', v_config.min_challenges_completed,
            'current', COALESCE(v_progress.challenges_completed, 0)
        );
    END IF;
    
    IF v_config.require_360_assessment AND NOT COALESCE(v_progress.has_360_assessment, false) THEN
        v_is_eligible := false;
        v_missing_criteria := v_missing_criteria || jsonb_build_object(
            'criterion', '360_assessment',
            'required', true,
            'current', false
        );
    END IF;
    
    -- Atualizar progresso com elegibilidade
    IF v_progress.id IS NOT NULL THEN
        UPDATE certificate_progress
        SET is_eligible = v_is_eligible,
            eligibility_checked_at = now(),
            updated_at = now()
        WHERE id = v_progress.id;
    END IF;
    
    RETURN jsonb_build_object(
        'eligible', v_is_eligible,
        'config', jsonb_build_object(
            'id', v_config.id,
            'name', v_config.name,
            'requires_manager_approval', v_config.requires_manager_approval
        ),
        'progress', jsonb_build_object(
            'completion_rate', COALESCE(v_progress.completion_rate, 0),
            'current_score', COALESCE(v_progress.current_score, 0),
            'games_participated', COALESCE(v_progress.games_participated, 0),
            'challenges_completed', COALESCE(v_progress.challenges_completed, 0)
        ),
        'missing_criteria', v_missing_criteria
    );
END;
$$;

-- 1.12 Função para emitir certificado v2
CREATE OR REPLACE FUNCTION issue_certificate_v2(
    p_user_id uuid,
    p_certificate_type text,
    p_source_id uuid DEFAULT NULL,
    p_training_id uuid DEFAULT NULL,
    p_final_score integer DEFAULT NULL,
    p_skip_eligibility_check boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
    v_certificate_id uuid;
    v_verification_code text;
    v_config certificate_criteria_configs%ROWTYPE;
    v_eligibility jsonb;
    v_skills_validated uuid[];
    v_certificate_name text;
    v_training trainings%ROWTYPE;
    v_journey training_journeys%ROWTYPE;
    v_skill skill_configurations%ROWTYPE;
BEGIN
    -- Buscar organização do usuário
    SELECT organization_id INTO v_org_id 
    FROM organization_members 
    WHERE user_id = p_user_id AND is_active = true
    LIMIT 1;
    
    -- Verificar elegibilidade (se não for skip)
    IF NOT p_skip_eligibility_check THEN
        v_eligibility := check_certificate_eligibility(p_user_id, p_certificate_type, COALESCE(p_source_id, p_training_id));
        
        IF NOT (v_eligibility->>'eligible')::boolean AND NOT (v_eligibility->>'no_config')::boolean THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Usuário não elegível para este certificado',
                'details', v_eligibility
            );
        END IF;
    END IF;
    
    -- Gerar código de verificação único
    v_verification_code := encode(gen_random_bytes(16), 'hex');
    
    -- Determinar nome e skills baseado no tipo
    CASE p_certificate_type
        WHEN 'training' THEN
            SELECT * INTO v_training FROM trainings WHERE id = COALESCE(p_training_id, p_source_id);
            v_certificate_name := COALESCE(v_training.certificate_name, v_training.name);
            v_skills_validated := v_training.skill_ids;
            
        WHEN 'journey' THEN
            SELECT * INTO v_journey FROM training_journeys WHERE id = p_source_id;
            v_certificate_name := COALESCE(v_journey.certificate_name, v_journey.name);
            v_skills_validated := v_journey.target_skills;
            
        WHEN 'skill' THEN
            SELECT * INTO v_skill FROM skill_configurations WHERE id = p_source_id;
            v_certificate_name := 'Certificado de ' || v_skill.name;
            v_skills_validated := ARRAY[p_source_id];
            
        WHEN 'level' THEN
            v_certificate_name := 'Certificado de Nível';
            v_skills_validated := '{}';
            
        WHEN 'behavioral' THEN
            v_certificate_name := 'Certificado Comportamental';
            v_skills_validated := '{}';
            
        ELSE
            v_certificate_name := 'Certificado';
            v_skills_validated := '{}';
    END CASE;
    
    -- Buscar configuração para recompensas
    SELECT * INTO v_config
    FROM certificate_criteria_configs
    WHERE certificate_type = p_certificate_type
    AND (target_id = COALESCE(p_source_id, p_training_id) OR target_id IS NULL)
    AND (organization_id = v_org_id OR organization_id IS NULL)
    AND is_active = true
    LIMIT 1;
    
    -- Inserir certificado
    INSERT INTO training_certificates (
        user_id,
        training_id,
        certificate_type,
        source_type,
        source_id,
        organization_id,
        status,
        skills_validated,
        final_score,
        verification_code,
        requires_manager_approval,
        criteria_met,
        unlocks,
        metadata
    ) VALUES (
        p_user_id,
        p_training_id,
        p_certificate_type,
        p_certificate_type,
        COALESCE(p_source_id, p_training_id),
        v_org_id,
        CASE WHEN COALESCE(v_config.requires_manager_approval, false) THEN 'pending_approval' ELSE 'active' END,
        v_skills_validated,
        p_final_score,
        v_verification_code,
        COALESCE(v_config.requires_manager_approval, false),
        jsonb_build_object(
            'completion_rate', 100,
            'score', p_final_score,
            'issued_automatically', true
        ),
        COALESCE(v_config.unlocks, '[]'::jsonb),
        jsonb_build_object(
            'certificate_name', v_certificate_name,
            'xp_reward', COALESCE(v_config.xp_reward, 0),
            'coins_reward', COALESCE(v_config.coins_reward, 0)
        )
    )
    RETURNING id INTO v_certificate_id;
    
    -- Atribuir recompensas se não requer aprovação
    IF NOT COALESCE(v_config.requires_manager_approval, false) THEN
        -- Atualizar saldo do usuário
        IF COALESCE(v_config.xp_reward, 0) > 0 OR COALESCE(v_config.coins_reward, 0) > 0 THEN
            INSERT INTO user_balances (user_id, organization_id, xp, coins)
            VALUES (p_user_id, v_org_id, COALESCE(v_config.xp_reward, 0), COALESCE(v_config.coins_reward, 0))
            ON CONFLICT (user_id, organization_id)
            DO UPDATE SET
                xp = user_balances.xp + COALESCE(v_config.xp_reward, 0),
                coins = user_balances.coins + COALESCE(v_config.coins_reward, 0),
                updated_at = now();
        END IF;
        
        -- Criar evento de evolução
        INSERT INTO core_events (
            user_id,
            organization_id,
            event_type,
            xp_earned,
            coins_earned,
            skill_ids,
            metadata
        ) VALUES (
            p_user_id,
            v_org_id,
            'CERTIFICADO_EMITIDO',
            COALESCE(v_config.xp_reward, 0),
            COALESCE(v_config.coins_reward, 0),
            v_skills_validated,
            jsonb_build_object(
                'certificate_id', v_certificate_id,
                'certificate_type', p_certificate_type,
                'certificate_name', v_certificate_name
            )
        );
        
        -- Criar notificação
        INSERT INTO notifications (
            user_id,
            organization_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            p_user_id,
            v_org_id,
            'certificate',
            'Novo Certificado!',
            'Você conquistou o certificado: ' || v_certificate_name,
            jsonb_build_object(
                'certificate_id', v_certificate_id,
                'certificate_type', p_certificate_type
            )
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'certificate_id', v_certificate_id,
        'verification_code', v_verification_code,
        'status', CASE WHEN COALESCE(v_config.requires_manager_approval, false) THEN 'pending_approval' ELSE 'active' END,
        'rewards', jsonb_build_object(
            'xp', COALESCE(v_config.xp_reward, 0),
            'coins', COALESCE(v_config.coins_reward, 0)
        )
    );
END;
$$;

-- 1.13 Função para aprovar certificado (gestor)
CREATE OR REPLACE FUNCTION approve_certificate(
    p_certificate_id uuid,
    p_approved boolean,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cert training_certificates%ROWTYPE;
    v_approver_id uuid := auth.uid();
    v_config certificate_criteria_configs%ROWTYPE;
    v_cert_name text;
BEGIN
    -- Buscar certificado
    SELECT * INTO v_cert FROM training_certificates WHERE id = p_certificate_id;
    
    IF v_cert.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Certificado não encontrado');
    END IF;
    
    IF v_cert.status != 'pending_approval' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Certificado não está pendente de aprovação');
    END IF;
    
    -- Verificar se o usuário é gestor
    IF NOT EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = v_approver_id
        AND om.organization_id = v_cert.organization_id
        AND om.is_active = true
        AND om.role IN ('admin', 'org_admin', 'super_admin', 'manager', 'leader')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para aprovar certificados');
    END IF;
    
    -- Obter nome do certificado
    v_cert_name := COALESCE(v_cert.metadata->>'certificate_name', 'Certificado');
    
    -- Atualizar certificado
    UPDATE training_certificates
    SET 
        status = CASE WHEN p_approved THEN 'active' ELSE 'rejected' END,
        approved_by = v_approver_id,
        approved_at = now(),
        manager_notes = p_notes
    WHERE id = p_certificate_id;
    
    -- Se aprovado, dar recompensas
    IF p_approved THEN
        -- Buscar config
        SELECT * INTO v_config
        FROM certificate_criteria_configs
        WHERE certificate_type = v_cert.certificate_type
        AND (target_id = v_cert.source_id OR target_id IS NULL)
        AND (organization_id = v_cert.organization_id OR organization_id IS NULL)
        LIMIT 1;
        
        -- Atualizar saldo
        IF COALESCE(v_config.xp_reward, 0) > 0 OR COALESCE(v_config.coins_reward, 0) > 0 THEN
            INSERT INTO user_balances (user_id, organization_id, xp, coins)
            VALUES (v_cert.user_id, v_cert.organization_id, COALESCE(v_config.xp_reward, 0), COALESCE(v_config.coins_reward, 0))
            ON CONFLICT (user_id, organization_id)
            DO UPDATE SET
                xp = user_balances.xp + COALESCE(v_config.xp_reward, 0),
                coins = user_balances.coins + COALESCE(v_config.coins_reward, 0),
                updated_at = now();
        END IF;
        
        -- Criar evento
        INSERT INTO core_events (
            user_id,
            organization_id,
            event_type,
            xp_earned,
            coins_earned,
            skill_ids,
            metadata
        ) VALUES (
            v_cert.user_id,
            v_cert.organization_id,
            'CERTIFICADO_EMITIDO',
            COALESCE(v_config.xp_reward, 0),
            COALESCE(v_config.coins_reward, 0),
            v_cert.skills_validated,
            jsonb_build_object(
                'certificate_id', v_cert.id,
                'certificate_type', v_cert.certificate_type,
                'approved_by', v_approver_id
            )
        );
        
        -- Notificar usuário
        INSERT INTO notifications (
            user_id,
            organization_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            v_cert.user_id,
            v_cert.organization_id,
            'certificate',
            'Certificado Aprovado!',
            'Seu certificado "' || v_cert_name || '" foi aprovado pelo gestor',
            jsonb_build_object(
                'certificate_id', v_cert.id
            )
        );
    ELSE
        -- Notificar rejeição
        INSERT INTO notifications (
            user_id,
            organization_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            v_cert.user_id,
            v_cert.organization_id,
            'certificate',
            'Certificado Não Aprovado',
            COALESCE(p_notes, 'Seu certificado não foi aprovado. Entre em contato com seu gestor.'),
            jsonb_build_object(
                'certificate_id', v_cert.id
            )
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'status', CASE WHEN p_approved THEN 'active' ELSE 'rejected' END
    );
END;
$$;