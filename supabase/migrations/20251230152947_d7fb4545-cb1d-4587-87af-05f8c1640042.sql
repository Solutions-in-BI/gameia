-- Add hierarchy support to training_modules
ALTER TABLE public.training_modules 
ADD COLUMN IF NOT EXISTS parent_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS numbering TEXT;

-- Index for efficient hierarchy queries
CREATE INDEX IF NOT EXISTS idx_training_modules_parent ON public.training_modules(parent_module_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_training_order ON public.training_modules(training_id, order_index);

-- Add new columns for enhanced step configuration
ALTER TABLE public.training_modules
ADD COLUMN IF NOT EXISTS unlock_condition JSONB DEFAULT '{"type": "previous_complete"}'::jsonb,
ADD COLUMN IF NOT EXISTS skill_impacts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS game_config JSONB,
ADD COLUMN IF NOT EXISTS is_preview_available BOOLEAN DEFAULT false;

-- Function to auto-calculate numbering based on order_index and hierarchy
CREATE OR REPLACE FUNCTION calculate_module_numbering()
RETURNS TRIGGER AS $$
DECLARE
  parent_numbering TEXT;
  sibling_count INTEGER;
BEGIN
  IF NEW.parent_module_id IS NULL THEN
    -- Top-level module: count previous siblings + 1
    SELECT COUNT(*) + 1 INTO sibling_count
    FROM public.training_modules
    WHERE training_id = NEW.training_id
      AND parent_module_id IS NULL
      AND id != NEW.id
      AND order_index < NEW.order_index;
    
    NEW.numbering := sibling_count::TEXT;
    NEW.level := 0;
  ELSE
    -- Sub-step: get parent numbering and count siblings
    SELECT numbering INTO parent_numbering
    FROM public.training_modules
    WHERE id = NEW.parent_module_id;
    
    SELECT COUNT(*) + 1 INTO sibling_count
    FROM public.training_modules
    WHERE parent_module_id = NEW.parent_module_id
      AND id != NEW.id
      AND order_index < NEW.order_index;
    
    NEW.numbering := COALESCE(parent_numbering, '1') || '.' || sibling_count::TEXT;
    NEW.level := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate numbering
DROP TRIGGER IF EXISTS trg_calculate_module_numbering ON public.training_modules;
CREATE TRIGGER trg_calculate_module_numbering
  BEFORE INSERT OR UPDATE OF order_index, parent_module_id
  ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION calculate_module_numbering();