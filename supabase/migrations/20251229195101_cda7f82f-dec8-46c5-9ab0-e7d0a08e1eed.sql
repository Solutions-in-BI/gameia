-- Corrigir warnings de segurança: Views e Functions

-- 1. Recriar views sem SECURITY DEFINER (usar SECURITY INVOKER que é o padrão seguro)
DROP VIEW IF EXISTS public.vw_active_boosts;
CREATE VIEW public.vw_active_boosts 
WITH (security_invoker = on) AS
SELECT 
  ui.id as inventory_id,
  ui.user_id,
  mi.name as item_name,
  mi.icon as item_icon,
  mi.boost_type,
  mi.boost_value,
  ui.boost_active_until,
  EXTRACT(EPOCH FROM (ui.boost_active_until - NOW())) / 3600 as hours_remaining
FROM public.user_inventory ui
JOIN public.marketplace_items mi ON mi.id = ui.item_id
WHERE ui.boost_active_until > NOW()
  AND mi.item_type = 'boost';

DROP VIEW IF EXISTS public.vw_expiring_items;
CREATE VIEW public.vw_expiring_items 
WITH (security_invoker = on) AS
SELECT 
  ui.id as inventory_id,
  ui.user_id,
  mi.name as item_name,
  mi.icon as item_icon,
  mi.item_type,
  ui.expires_at,
  EXTRACT(EPOCH FROM (ui.expires_at - NOW())) / 86400 as days_remaining
FROM public.user_inventory ui
JOIN public.marketplace_items mi ON mi.id = ui.item_id
WHERE ui.expires_at IS NOT NULL
  AND ui.expires_at > NOW()
  AND ui.expires_at < NOW() + INTERVAL '7 days'
  AND ui.status = 'active';

-- 2. Recriar funções com search_path definido
CREATE OR REPLACE FUNCTION public.set_inventory_expiration()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
BEGIN
  SELECT expires_after_purchase, max_uses 
  INTO item_record
  FROM public.marketplace_items 
  WHERE id = NEW.item_id;
  
  IF item_record.expires_after_purchase IS NOT NULL THEN
    NEW.expires_at := NOW() + (item_record.expires_after_purchase || ' days')::INTERVAL;
  END IF;
  
  IF item_record.max_uses IS NOT NULL THEN
    NEW.uses_remaining := item_record.max_uses;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.activate_boost(p_inventory_id UUID)
RETURNS JSONB AS $$
DECLARE
  inv_record RECORD;
  item_record RECORD;
BEGIN
  SELECT * INTO inv_record 
  FROM public.user_inventory 
  WHERE id = p_inventory_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_found');
  END IF;
  
  IF inv_record.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_active');
  END IF;
  
  IF inv_record.boost_active_until IS NOT NULL AND inv_record.boost_active_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'boost_already_active');
  END IF;
  
  SELECT * INTO item_record 
  FROM public.marketplace_items 
  WHERE id = inv_record.item_id;
  
  IF item_record.item_type != 'boost' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_a_boost');
  END IF;
  
  UPDATE public.user_inventory
  SET 
    boost_active_until = NOW() + (item_record.boost_duration_hours || ' hours')::INTERVAL,
    used_at = COALESCE(used_at, NOW()),
    uses_remaining = CASE 
      WHEN uses_remaining IS NOT NULL THEN uses_remaining - 1 
      ELSE NULL 
    END,
    status = CASE 
      WHEN item_record.expires_after_use THEN 'used'
      WHEN uses_remaining = 1 THEN 'used'
      ELSE 'active'
    END
  WHERE id = p_inventory_id;
  
  INSERT INTO public.item_usage_log (user_id, inventory_id, action, details)
  VALUES (
    auth.uid(), 
    p_inventory_id, 
    'boost_activated',
    jsonb_build_object(
      'boost_type', item_record.boost_type,
      'boost_value', item_record.boost_value,
      'duration_hours', item_record.boost_duration_hours
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'boost_type', item_record.boost_type,
    'boost_value', item_record.boost_value,
    'active_until', NOW() + (item_record.boost_duration_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;