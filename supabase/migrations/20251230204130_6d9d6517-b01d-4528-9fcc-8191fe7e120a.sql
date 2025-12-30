-- Corrigir search_path das funções criadas
ALTER FUNCTION public.create_next_step_from_application() SET search_path = public;
ALTER FUNCTION public.create_application_alerts() SET search_path = public;
ALTER FUNCTION public.get_user_next_steps(uuid) SET search_path = public;
ALTER FUNCTION public.get_team_book_applications(uuid, uuid, text) SET search_path = public;