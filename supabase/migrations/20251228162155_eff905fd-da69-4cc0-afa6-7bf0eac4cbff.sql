-- Adicionar campos à tabela training_modules
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS requires_completion BOOLEAN DEFAULT true;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 0;

-- Adicionar campos à tabela trainings
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS is_onboarding BOOLEAN DEFAULT false;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT true;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS insignia_reward_id UUID REFERENCES insignias(id);

-- Nova tabela para pré-requisitos de módulos
CREATE TABLE IF NOT EXISTS training_module_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  prerequisite_module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, prerequisite_module_id)
);

-- Enable RLS
ALTER TABLE training_module_prerequisites ENABLE ROW LEVEL SECURITY;

-- RLS policy - Allow read for authenticated users
CREATE POLICY "Users can view module prerequisites"
ON training_module_prerequisites
FOR SELECT
USING (true);

-- RLS policy - Allow admin insert/update/delete
CREATE POLICY "Admins can manage module prerequisites"
ON training_module_prerequisites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
);

-- Nova tabela para certificados
CREATE TABLE IF NOT EXISTS training_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  certificate_number TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  UNIQUE(user_id, training_id)
);

-- Enable RLS
ALTER TABLE training_certificates ENABLE ROW LEVEL SECURITY;

-- RLS policy - Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON training_certificates
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy - System can insert certificates (via trigger/function)
CREATE POLICY "System can insert certificates"
ON training_certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Storage bucket para mídias de treinamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-media', 'training-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for training-media bucket
CREATE POLICY "Anyone can view training media"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-media');

CREATE POLICY "Authenticated users can upload training media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'training-media' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update training media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'training-media' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete training media"
ON storage.objects FOR DELETE
USING (bucket_id = 'training-media' AND auth.role() = 'authenticated');