-- =============================================
-- FASE 1: CORREÇÃO RLS E SISTEMA DE EQUIPES
-- =============================================

-- 1.1 Função para verificar se é membro ou owner (evita recursão)
CREATE OR REPLACE FUNCTION public.is_org_member_or_owner(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = _org_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = _org_id AND owner_id = auth.uid()
  )
$$;

-- 1.2 Função para verificar role específico na org
CREATE OR REPLACE FUNCTION public.get_org_role(_user_id uuid, _org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT org_role::text FROM organization_members 
     WHERE organization_id = _org_id AND user_id = _user_id),
    CASE WHEN EXISTS (SELECT 1 FROM organizations WHERE id = _org_id AND owner_id = _user_id) 
         THEN 'owner' ELSE NULL END
  )
$$;

-- 1.3 Criar tabela de equipes/times
CREATE TABLE IF NOT EXISTS public.organization_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  parent_team_id uuid REFERENCES organization_teams(id) ON DELETE SET NULL,
  color text DEFAULT '#6366f1',
  icon text DEFAULT '👥',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 1.4 Adicionar team_id aos membros (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_members' AND column_name = 'team_id') THEN
    ALTER TABLE organization_members ADD COLUMN team_id uuid REFERENCES organization_teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 1.5 Habilitar RLS em organization_teams
ALTER TABLE organization_teams ENABLE ROW LEVEL SECURITY;

-- 1.6 Dropar política recursiva antiga de organization_members
DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;

-- 1.7 Nova política não-recursiva para organization_members
CREATE POLICY "View org members via function" ON organization_members
  FOR SELECT USING (public.is_org_member_or_owner(organization_id));

-- 1.8 Políticas para organization_teams
CREATE POLICY "Members can view org teams" ON organization_teams
  FOR SELECT USING (public.is_org_member_or_owner(organization_id));

CREATE POLICY "Admins can manage teams" ON organization_teams
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id));

-- 1.9 Função para verificar se pode ver dados de outro usuário (hierarquia)
CREATE OR REPLACE FUNCTION public.can_view_user_data(_target_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Owner/Admin vê tudo
    public.get_org_role(auth.uid(), _org_id) IN ('owner', 'admin')
    OR
    -- Manager vê seu time
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organization_teams t ON om.team_id = t.id
      WHERE om.user_id = _target_user_id 
      AND om.organization_id = _org_id
      AND t.manager_id = auth.uid()
    )
    OR
    -- Usuário vê a si mesmo
    _target_user_id = auth.uid()
$$;

-- 1.10 Trigger para updated_at em organization_teams
CREATE OR REPLACE TRIGGER update_organization_teams_updated_at
  BEFORE UPDATE ON organization_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();