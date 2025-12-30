-- Add training_type to trainings table
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS training_type text DEFAULT 'traditional';
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS book_metadata jsonb DEFAULT NULL;

-- Create table for AI comprehension scores
CREATE TABLE IF NOT EXISTS module_comprehension_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  ai_feedback text,
  response_depth text CHECK (response_depth IN ('superficial', 'moderate', 'deep')),
  insights_extracted jsonb DEFAULT '[]'::jsonb,
  conversation_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create table for routine applications
CREATE TABLE IF NOT EXISTS routine_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
  evidence_type text CHECK (evidence_type IN ('checkin', 'text', 'file', 'link')),
  evidence_content text,
  evidence_url text,
  submitted_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  manager_feedback text,
  xp_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on new tables
ALTER TABLE module_comprehension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for module_comprehension_scores
CREATE POLICY "Users can view their own comprehension scores"
ON module_comprehension_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comprehension scores"
ON module_comprehension_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comprehension scores"
ON module_comprehension_scores FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for routine_applications
CREATE POLICY "Users can view their own routine applications"
ON routine_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routine applications"
ON routine_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine applications"
ON routine_applications FOR UPDATE
USING (auth.uid() = user_id);

-- Managers can view applications of their team (optional - using org membership)
CREATE POLICY "Managers can view team routine applications"
ON routine_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('admin', 'manager')
    AND om.organization_id IN (
      SELECT organization_id FROM profiles WHERE id = routine_applications.user_id
    )
  )
);

-- Managers can update applications for verification
CREATE POLICY "Managers can verify routine applications"
ON routine_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('admin', 'manager')
  )
);

-- Create updated_at trigger for comprehension scores
CREATE TRIGGER update_module_comprehension_scores_updated_at
BEFORE UPDATE ON module_comprehension_scores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();