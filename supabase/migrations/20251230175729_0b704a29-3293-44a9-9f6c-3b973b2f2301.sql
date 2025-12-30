-- Desativar itens cosméticos (avatar, pet, boost, effect, frame, banner)
UPDATE marketplace_items 
SET is_active = false 
WHERE category IN ('avatar', 'pet', 'boost', 'effect', 'frame', 'banner');

-- Inserir itens de benefícios reais
INSERT INTO marketplace_items (name, description, category, item_type, price, rarity, icon, behavior_type, is_active)
VALUES 
  ('Vale iFood R$25', 'Vale presente iFood para pedir delivery', 'giftcard', 'experience', 2500, 'rare', '🍔', 'redeemable', true),
  ('Vale iFood R$50', 'Vale presente iFood para pedir delivery', 'giftcard', 'experience', 5000, 'epic', '🍔', 'redeemable', true),
  ('Vale Uber R$30', 'Créditos Uber para transporte', 'giftcard', 'experience', 3000, 'rare', '🚗', 'redeemable', true),
  ('Netflix 1 mês', 'Assinatura Netflix por 1 mês', 'giftcard', 'experience', 4500, 'epic', '📺', 'redeemable', true),
  ('Spotify Premium 1 mês', 'Assinatura Spotify Premium', 'giftcard', 'experience', 2500, 'rare', '🎵', 'redeemable', true),
  ('Ingresso Cinema 2D', 'Ingresso para qualquer filme em sala tradicional', 'cinema', 'experience', 2500, 'rare', '🎬', 'redeemable', true),
  ('Combo Cinema VIP', 'Ingresso sala VIP + pipoca + bebida', 'cinema', 'experience', 6000, 'epic', '🍿', 'redeemable', true),
  ('Cashback R$10', 'Resgate R$10 direto na sua conta via PIX', 'cashback', 'experience', 1000, 'common', '💰', 'redeemable', true),
  ('Cashback R$25', 'Resgate R$25 direto na sua conta via PIX', 'cashback', 'experience', 2500, 'rare', '💰', 'redeemable', true),
  ('Cashback R$50', 'Resgate R$50 direto na sua conta via PIX', 'cashback', 'experience', 5000, 'epic', '💰', 'redeemable', true);