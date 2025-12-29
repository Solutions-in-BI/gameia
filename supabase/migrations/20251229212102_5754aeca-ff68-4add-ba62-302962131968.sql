-- Add behavior_type column to marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS behavior_type TEXT DEFAULT 'consumable';

-- Add comment for clarity
COMMENT ON COLUMN public.marketplace_items.behavior_type IS 'Item behavior: equippable, consumable, redeemable, permanent';

-- Update behavior_type based on category for existing items
UPDATE public.marketplace_items SET behavior_type = 'equippable' 
WHERE category IN ('avatar', 'frame', 'banner', 'title', 'pet', 'mascot');

UPDATE public.marketplace_items SET behavior_type = 'consumable' 
WHERE category IN ('boost', 'effect');

UPDATE public.marketplace_items SET behavior_type = 'redeemable' 
WHERE category IN ('experience', 'benefit', 'reward', 'gift');

UPDATE public.marketplace_items SET behavior_type = 'permanent' 
WHERE category IN ('learning');

-- Update item_type to correct functional types
UPDATE public.marketplace_items SET item_type = 'boost' 
WHERE category = 'boost';

UPDATE public.marketplace_items SET item_type = 'experience' 
WHERE category IN ('experience', 'benefit', 'reward', 'gift', 'learning');

UPDATE public.marketplace_items SET item_type = 'functional' 
WHERE category = 'effect';

-- Ensure cosmetic items are correctly typed
UPDATE public.marketplace_items SET item_type = 'cosmetic' 
WHERE category IN ('avatar', 'frame', 'banner', 'title', 'pet', 'mascot');

-- Set requires_approval for real benefits
UPDATE public.marketplace_items SET requires_approval = true 
WHERE category IN ('experience', 'benefit', 'reward', 'gift');