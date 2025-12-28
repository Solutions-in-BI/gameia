-- Corrigir search_path nas funções restantes

CREATE OR REPLACE FUNCTION public.update_sales_scripts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, now());
  RETURN NEW;
END;
$function$;