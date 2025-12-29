-- Atualizar função is_org_member_or_owner para incluir super_admin global
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
  ) OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'::app_role
    AND is_active = true
  )
$$;

-- Atualizar política de visualização de experience_requests
DROP POLICY IF EXISTS "Managers can view org experience requests" ON experience_requests;

CREATE POLICY "Managers can view org experience requests"
ON experience_requests FOR SELECT
TO authenticated
USING (
  -- Usuário é o próprio solicitante
  auth.uid() = user_id
  OR
  -- Usuário tem papel de gestão na organização via user_roles
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND (
      ur.organization_id = experience_requests.organization_id
      OR ur.organization_id IS NULL
    )
    AND ur.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role, 'super_admin'::app_role])
  )
  OR
  -- Usuário é owner/admin da organização via organization_members
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = experience_requests.organization_id
    AND om.role IN ('owner', 'admin')
  )
);

-- Atualizar política de atualização de experience_requests
DROP POLICY IF EXISTS "Managers can update org experience requests" ON experience_requests;

CREATE POLICY "Managers can update org experience requests"
ON experience_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND (
      ur.organization_id = experience_requests.organization_id
      OR ur.organization_id IS NULL
    )
    AND ur.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role, 'super_admin'::app_role])
  )
  OR
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = experience_requests.organization_id
    AND om.role IN ('owner', 'admin')
  )
);