-- Fix search_path security warning
CREATE OR REPLACE FUNCTION calculate_module_numbering()
RETURNS TRIGGER AS $$
DECLARE
  parent_numbering TEXT;
  sibling_count INTEGER;
BEGIN
  IF NEW.parent_module_id IS NULL THEN
    SELECT COUNT(*) + 1 INTO sibling_count
    FROM public.training_modules
    WHERE training_id = NEW.training_id
      AND parent_module_id IS NULL
      AND id != NEW.id
      AND order_index < NEW.order_index;
    
    NEW.numbering := sibling_count::TEXT;
    NEW.level := 0;
  ELSE
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
$$ LANGUAGE plpgsql SET search_path = public;