-- Fix: Restrict profiles table access to own profile and organization members
-- This addresses the PUBLIC_DATA_EXPOSURE security finding

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Qualquer um pode ver perfis" ON public.profiles;

-- Create a secure policy that allows users to see:
-- 1. Their own profile
-- 2. Profiles of users in the same organization(s)
CREATE POLICY "Users can view own and org members profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR
  id IN (
    SELECT om.user_id 
    FROM public.organization_members om
    WHERE om.organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    ) AND om.is_active = true
  )
);