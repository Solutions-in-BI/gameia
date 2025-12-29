-- Corrigir última função sem search_path
CREATE OR REPLACE FUNCTION update_org_game_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;