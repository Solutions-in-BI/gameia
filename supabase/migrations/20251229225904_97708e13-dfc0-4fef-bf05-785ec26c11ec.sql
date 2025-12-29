-- Corrigir funções sem search_path definido
-- Estas são funções existentes que precisam do SET search_path = public

-- Corrigir update_updated_at_column se existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Corrigir update_insignia_criteria_updated_at
CREATE OR REPLACE FUNCTION update_insignia_criteria_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;