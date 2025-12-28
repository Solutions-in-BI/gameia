-- Adicionar campos em marketplace_items para suporte multi-org e mais funcionalidades
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS stock integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_limited_edition boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by uuid;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_org ON marketplace_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_featured ON marketplace_items(is_featured) WHERE is_featured = true;

-- Criar tabela de categorias personalizáveis
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  slug text NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  description text,
  section text NOT NULL DEFAULT 'gamification',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Histórico de transações do marketplace
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES marketplace_items(id),
  type text NOT NULL CHECK (type IN ('purchase', 'gift_sent', 'gift_received', 'refund')),
  coins_amount integer NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_user ON marketplace_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_item ON marketplace_transactions(item_id);

-- Enable RLS
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para marketplace_categories
CREATE POLICY "Anyone can view active categories" ON marketplace_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON marketplace_categories
FOR ALL USING (
  organization_id IS NULL OR
  public.is_org_admin(auth.uid(), organization_id)
);

-- Políticas RLS para marketplace_transactions
CREATE POLICY "Users can view own transactions" ON marketplace_transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON marketplace_transactions
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política para admins gerenciarem itens do marketplace
CREATE POLICY "Admins can manage marketplace items" ON marketplace_items
FOR ALL USING (
  organization_id IS NULL OR
  public.is_org_admin(auth.uid(), organization_id)
);

-- Inserir categorias padrão
INSERT INTO marketplace_categories (name, slug, icon, section, sort_order) VALUES
('Avatares', 'avatar', '👤', 'gamification', 1),
('Molduras', 'frame', '🖼️', 'gamification', 2),
('Títulos', 'title', '🏷️', 'gamification', 3),
('Pets', 'pet', '🐾', 'gamification', 4),
('Banners', 'banner', '🎨', 'gamification', 5),
('Temas Snake', 'snake_theme', '🐍', 'recreation', 10),
('Temas Memory', 'memory_theme', '🧠', 'recreation', 11),
('Temas Dino', 'dino_skin', '🦖', 'recreation', 12),
('Músicas', 'music', '🎵', 'recreation', 13)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Função de compra atômica
CREATE OR REPLACE FUNCTION purchase_marketplace_item(p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item marketplace_items;
  v_user_coins integer;
  v_inventory_id uuid;
BEGIN
  -- Verificar autenticação
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Buscar item
  SELECT * INTO v_item FROM marketplace_items WHERE id = p_item_id AND is_active = true;
  IF v_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_found');
  END IF;

  -- Verificar estoque (se limitado)
  IF v_item.stock IS NOT NULL AND v_item.stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'out_of_stock');
  END IF;

  -- Verificar se já possui
  IF EXISTS (SELECT 1 FROM user_inventory WHERE user_id = v_user_id AND item_id = p_item_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_owned');
  END IF;

  -- Buscar moedas do usuário
  SELECT coins INTO v_user_coins FROM user_stats WHERE user_id = v_user_id;
  IF v_user_coins IS NULL OR v_user_coins < v_item.price THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_coins', 'required', v_item.price, 'current', COALESCE(v_user_coins, 0));
  END IF;

  -- Deduzir moedas
  UPDATE user_stats SET coins = coins - v_item.price WHERE user_id = v_user_id;

  -- Reduzir estoque se limitado
  IF v_item.stock IS NOT NULL THEN
    UPDATE marketplace_items SET stock = stock - 1 WHERE id = p_item_id;
  END IF;

  -- Adicionar ao inventário
  INSERT INTO user_inventory (user_id, item_id) 
  VALUES (v_user_id, p_item_id)
  RETURNING id INTO v_inventory_id;

  -- Registrar transação
  INSERT INTO marketplace_transactions (user_id, item_id, type, coins_amount, metadata)
  VALUES (v_user_id, p_item_id, 'purchase', v_item.price, jsonb_build_object('item_name', v_item.name, 'rarity', v_item.rarity));

  RETURN jsonb_build_object(
    'success', true, 
    'inventory_id', v_inventory_id,
    'item_name', v_item.name,
    'coins_spent', v_item.price
  );
END;
$$;