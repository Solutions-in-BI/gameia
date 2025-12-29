-- Primeiro, vamos tornar insignia_key opcional para novas insígnias (será gerada automaticamente)
ALTER TABLE insignias ALTER COLUMN insignia_key DROP NOT NULL;

-- Criar função para gerar insignia_key automaticamente
CREATE OR REPLACE FUNCTION generate_insignia_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.insignia_key IS NULL OR NEW.insignia_key = '' THEN
    NEW.insignia_key := lower(regexp_replace(unaccent(NEW.name), '[^a-zA-Z0-9]+', '_', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_generate_insignia_key ON insignias;
CREATE TRIGGER trg_generate_insignia_key
  BEFORE INSERT ON insignias
  FOR EACH ROW
  EXECUTE FUNCTION generate_insignia_key();