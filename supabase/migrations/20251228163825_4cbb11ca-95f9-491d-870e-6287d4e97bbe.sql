-- ============================================
-- RLS Policies para Trainings e Training Modules (apenas faltantes)
-- ============================================

-- Políticas para trainings (admins podem gerenciar)
CREATE POLICY "Admins can insert trainings" ON public.trainings
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
    AND (om.organization_id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
  OR
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.owner_id = auth.uid()
    AND (o.id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
);

CREATE POLICY "Admins can update trainings" ON public.trainings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
    AND (om.organization_id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
  OR
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.owner_id = auth.uid()
    AND (o.id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
);

CREATE POLICY "Admins can delete trainings" ON public.trainings
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
    AND (om.organization_id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
  OR
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.owner_id = auth.uid()
    AND (o.id = trainings.organization_id OR trainings.organization_id IS NULL)
  )
);

-- Políticas para training_modules (admins podem gerenciar)
CREATE POLICY "Admins can insert training modules" ON public.training_modules
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organization_members om ON om.organization_id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organizations o ON o.id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND o.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.id = training_modules.training_id
    AND t.organization_id IS NULL
  )
);

CREATE POLICY "Admins can update training modules" ON public.training_modules
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organization_members om ON om.organization_id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organizations o ON o.id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND o.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.id = training_modules.training_id
    AND t.organization_id IS NULL
  )
);

CREATE POLICY "Admins can delete training modules" ON public.training_modules
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organization_members om ON om.organization_id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    JOIN organizations o ON o.id = t.organization_id
    WHERE t.id = training_modules.training_id
    AND o.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.id = training_modules.training_id
    AND t.organization_id IS NULL
  )
);

-- Storage bucket para training-media (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-media',
  'training-media',
  true,
  524288000,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para training-media (com IF NOT EXISTS simulado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view training media' AND tablename = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view training media" ON storage.objects FOR SELECT USING (bucket_id = ''training-media'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload training media' AND tablename = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can upload training media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''training-media'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete training media' AND tablename = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete training media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''training-media'')';
  END IF;
END $$;