-- Fix search_path for security
ALTER FUNCTION public.recalculate_journey_totals(UUID) SET search_path = public;
ALTER FUNCTION public.journey_trainings_change_trigger() SET search_path = public;