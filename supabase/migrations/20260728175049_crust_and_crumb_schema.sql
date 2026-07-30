/*
# Crust & Crumb Bakery — Full Schema

## Overview
Creates the complete data layer for the Crust & Crumb bakery website: a public
menu of products, customer orders with line items, customer reviews, and an
atomic order-placement function that decrements inventory in one shot.

## New Tables

1. **products** — the bakery menu (breads, pastries, cakes, cookies)
   - `id` uuid PK
   - `name` text, not null
   - `description` text
   - `price` numeric(10,2), not null — in PHP
   - `category` text, not null — one of: Bread, Pastry, Cake, Cookies
   - `image_url` text — Pexels stock photo URL
   - `stock` integer, not null, default 0 — live inventory count
   - `featured` boolean, default false — shown on home page
   - `created_at` timestamptz, default now()

2. **orders** — customer orders placed from the storefront
   - `id` uuid PK
   - `order_number` integer, GENERATED ALWAYS AS IDENTITY — short readable number for tracking (e.g. #42)
   - `customer_name` text, not null
   - `customer_phone` text, not null
   - `customer_email` text
   - `status` text, not null, default 'received' — received / preparing / ready / completed / cancelled
   - `total` numeric(10,2), not null, default 0
   - `notes` text — delivery/pickup notes from customer
   - `created_at` timestamptz, default now()
   - `completed_at` timestamptz — set when status becomes 'completed'

3. **order_items** — line items belonging to an order
   - `id` uuid PK
   - `order_id` uuid FK → orders(id) ON DELETE CASCADE
   - `product_id` uuid FK → products(id)
   - `product_name` text, not null — snapshot of name at order time
   - `quantity` integer, not null
   - `unit_price` numeric(10,2), not null — snapshot of price at order time
   - `created_at` timestamptz, default now()

4. **reviews** — public customer reviews
   - `id` uuid PK
   - `customer_name` text, not null
   - `rating` integer, 1–5, not null
   - `comment` text
   - `created_at` timestamptz, default now()

## RPC Function

- **place_order(p_order json)** → uuid — SECURITY DEFINER
  Atomically inserts an order + all its line items, validates and decrements
  product stock, and returns the new order id. Called by anon customers at
  checkout so a single round-trip places the whole order safely.

## Security (RLS)

- **products**: public SELECT (anon + authenticated); write (INSERT/UPDATE/DELETE)
  restricted to authenticated (the admin who has signed in).
- **orders**: public SELECT (anon + authenticated — customers track orders by
  number without logging in); UPDATE restricted to authenticated (admin updates
  status). INSERT is handled exclusively through the place_order RPC.
- **order_items**: public SELECT; INSERT handled through place_order RPC.
- **reviews**: public SELECT and INSERT (anon + authenticated — anyone can leave
  a review); no UPDATE/DELETE (reviews are immutable once posted).
- **place_order**: EXECUTE granted to anon + authenticated.

## Notes

1. Prices are in Philippine Pesos (₱) — the bakery is in Calapan City, Oriental Mindoro.
2. The `order_number` identity column gives customers a short, memorable tracking
   number instead of the raw UUID.
3. `completed_at` is maintained by the admin UI (set when status → completed).
4. Product stock is decremented atomically inside place_order; if any item is
   out of stock the entire order is rejected (RAISE EXCEPTION) so no partial
   orders are ever created.
*/

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  stock integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
ON products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products"
ON products FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products"
ON products FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products"
ON products FOR DELETE
TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer GENERATED ALWAYS AS IDENTITY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'received',
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders"
ON orders FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders"
ON orders FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items"
ON order_items FOR SELECT
TO anon, authenticated USING (true);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews"
ON reviews FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews"
ON reviews FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- place_order RPC — atomic order + stock decrement
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_order(p_order json)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item json;
  v_product_name text;
  v_product_price numeric(10,2);
  v_product_stock integer;
  v_qty integer;
  v_product_id uuid;
BEGIN
  INSERT INTO orders (customer_name, customer_phone, customer_email, total, notes, status)
  VALUES (
    p_order->>'customer_name',
    p_order->>'customer_phone',
    p_order->>'customer_email',
    (p_order->>'total')::numeric,
    p_order->>'notes',
    'received'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT json_array_elements(p_order->'items')
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    SELECT name, price, stock INTO v_product_name, v_product_price, v_product_stock
    FROM products WHERE id = v_product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;

    IF v_product_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "%" — requested %, available %',
        v_product_name, v_qty, v_product_stock;
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
    VALUES (v_order_id, v_product_id, v_product_name, v_qty, v_product_price);

    UPDATE products SET stock = stock - v_qty WHERE id = v_product_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION place_order(json) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed data — products
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, description, price, category, image_url, stock, featured) VALUES
    (
      'Rustic Sourdough Loaf',
      'A 48-hour fermented wild-yeast sourdough with a deep amber crust and an open, custardy crumb. Baked daily in our wood-fired deck oven.',
      185.00, 'Bread',
      'https://images.pexels.com/photos/7541727/pexels-photo-7541727.jpeg?auto=compress&cs=tinysrgb&w=800',
      24, true
    ),
    (
      'Country Baguette',
      'A classic French baguette with a crackling thin crust and a airy, flavorful interior. Best enjoyed the same day.',
      120.00, 'Bread',
      'https://images.pexels.com/photos/30567743/pexels-photo-30567743.jpeg?auto=compress&cs=tinysrgb&w=800',
      30, false
    ),
    (
      'Whole Wheat Farmhouse',
      'A hearty loaf made with 100% stone-milled whole wheat, a touch of honey, and a long cold ferment for depth and digestibility.',
      155.00, 'Bread',
      'https://images.pexels.com/photos/4055108/pexels-photo-4055108.jpeg?auto=compress&cs=tinysrgb&w=800',
      18, false
    ),
    (
      'Butter Croissant',
      'Twenty-seven layers of laminated European-style butter folded into a crescent that shatters at the touch and melts into air.',
      85.00, 'Pastry',
      'https://images.pexels.com/photos/9176854/pexels-photo-9176854.jpeg?auto=compress&cs=tinysrgb&w=800',
      40, true
    ),
    (
      'Chocolate Croissant',
      'The same buttery laminated dough wrapped around a baton of dark Belgian chocolate and baked until glossy and golden.',
      95.00, 'Pastry',
      'https://images.pexels.com/photos/965741/pexels-photo-965741.jpeg?auto=compress&cs=tinysrgb&w=800',
      35, false
    ),
    (
      'Cinnamon Roll',
      'A soft, pillowy spiral of brioche dough swirled with brown sugar and Ceylon cinnamon, topped with a vanilla glaze.',
      90.00, 'Pastry',
      'https://images.pexels.com/photos/4055109/pexels-photo-4055109.jpeg?auto=compress&cs=tinysrgb&w=800',
      28, true
    ),
    (
      'Maple Pecan Danish',
      'Flaky Danish pastry layered with toasted pecans and a swirl of pure maple syrup, finished with a sugar glaze.',
      115.00, 'Pastry',
      'https://images.pexels.com/photos/32361592/pexels-photo-32361592.jpeg?auto=compress&cs=tinysrgb&w=800',
      20, false
    ),
    (
      'Belgian Chocolate Cake',
      'A dense, fudgy single-origin chocolate cake layered with dark chocolate ganache. Sold by the slice.',
      165.00, 'Cake',
      'https://images.pexels.com/photos/29538419/pexels-photo-29538419.jpeg?auto=compress&cs=tinysrgb&w=800',
      12, true
    ),
    (
      'Classic Cheesecake',
      'A New York–style cheesecake on a buttered graham crust, baked low and slow for a silk-smooth, dense custard texture.',
      180.00, 'Cake',
      'https://images.pexels.com/photos/20031868/pexels-photo-20031868.jpeg?auto=compress&cs=tinysrgb&w=800',
      10, false
    ),
    (
      'Salted Caramel Cookie',
      'A thick, chewy brown-butter cookie studded with dark chocolate chunks and drizzled with flaky sea-salt caramel.',
      65.00, 'Cookies',
      'https://images.pexels.com/photos/34364451/pexels-photo-34364451.jpeg?auto=compress&cs=tinysrgb&w=800',
      50, false
    ),
    (
      'Almond Biscotti',
      'A twice-baked Italian biscotti loaded with toasted almonds and a hint of orange zest. Perfect for dunking in coffee.',
      70.00, 'Cookies',
      'https://images.pexels.com/photos/4055108/pexels-photo-4055108.jpeg?auto=compress&cs=tinysrgb&w=800',
      45, false
    ),
    (
      'Glazed Donut',
      'A light, airy yeast-raised donut fried to golden perfection and dipped in a classic vanilla sugar glaze.',
      55.00, 'Cookies',
      'https://images.pexels.com/photos/34364451/pexels-photo-34364451.jpeg?auto=compress&cs=tinysrgb&w=800',
      38, false
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Seed data — reviews
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM reviews LIMIT 1) THEN
    INSERT INTO reviews (customer_name, rating, comment) VALUES
    ('Maria Santos', 5, 'The sourdough here is the best I have had in Mindoro. The crust crackles when you tear it and the inside is so soft. Worth every peso.'),
    ('Javier Cruz', 5, 'I drive from Naujan just for the croissants. They are buttery, flaky, and still warm in the morning. The chocolate one is dangerous.'),
    ('Ana Reyes', 4, 'Beautiful little bakery with a warm atmosphere. The cinnamon rolls are incredible. I just wish they were open later in the afternoon.'),
    ('Diego Mendoza', 5, 'Ordered a whole cheesecake for my wifes birthday and it was a hit. Smooth, rich, not too sweet. The team was so accommodating with the order.'),
    ('Liza Fernandez', 5, 'Everything looks like it belongs in a magazine. The salted caramel cookie is my guilty pleasure — I buy two every time I pass by.');
  END IF;
END $$;
