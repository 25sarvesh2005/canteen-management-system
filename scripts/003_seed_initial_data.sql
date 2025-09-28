-- Insert sample categories
INSERT INTO categories (id, name, description, image_url, is_active) VALUES
  (gen_random_uuid(), 'Main Course', 'Hearty meals and entrees', '/placeholder.svg?height=200&width=200', true),
  (gen_random_uuid(), 'Snacks', 'Quick bites and light snacks', '/placeholder.svg?height=200&width=200', true),
  (gen_random_uuid(), 'Beverages', 'Drinks and refreshments', '/placeholder.svg?height=200&width=200', true),
  (gen_random_uuid(), 'Desserts', 'Sweet treats and desserts', '/placeholder.svg?height=200&width=200', true)
ON CONFLICT (id) DO NOTHING;

-- Get category IDs for menu items
DO $$
DECLARE
  main_course_id uuid;
  snacks_id uuid;
  beverages_id uuid;
  desserts_id uuid;
BEGIN
  SELECT id INTO main_course_id FROM categories WHERE name = 'Main Course' LIMIT 1;
  SELECT id INTO snacks_id FROM categories WHERE name = 'Snacks' LIMIT 1;
  SELECT id INTO beverages_id FROM categories WHERE name = 'Beverages' LIMIT 1;
  SELECT id INTO desserts_id FROM categories WHERE name = 'Desserts' LIMIT 1;

  -- Insert sample menu items
  INSERT INTO menu_items (id, name, description, price, category_id, is_available, preparation_time, image_url, ingredients, allergens) VALUES
    (gen_random_uuid(), 'Chicken Biryani', 'Aromatic basmati rice with tender chicken and spices', 12.99, main_course_id, true, 25, '/placeholder.svg?height=300&width=300', ARRAY['Basmati Rice', 'Chicken', 'Onions', 'Spices'], ARRAY['Dairy']),
    (gen_random_uuid(), 'Vegetable Curry', 'Mixed vegetables in rich curry sauce', 9.99, main_course_id, true, 20, '/placeholder.svg?height=300&width=300', ARRAY['Mixed Vegetables', 'Curry Sauce', 'Rice'], ARRAY['Dairy']),
    (gen_random_uuid(), 'Grilled Sandwich', 'Toasted sandwich with cheese and vegetables', 6.99, snacks_id, true, 10, '/placeholder.svg?height=300&width=300', ARRAY['Bread', 'Cheese', 'Vegetables'], ARRAY['Gluten', 'Dairy']),
    (gen_random_uuid(), 'Samosa', 'Crispy pastry filled with spiced potatoes', 3.99, snacks_id, true, 5, '/placeholder.svg?height=300&width=300', ARRAY['Pastry', 'Potatoes', 'Spices'], ARRAY['Gluten']),
    (gen_random_uuid(), 'Mango Lassi', 'Refreshing yogurt drink with mango', 4.99, beverages_id, true, 3, '/placeholder.svg?height=300&width=300', ARRAY['Yogurt', 'Mango', 'Sugar'], ARRAY['Dairy']),
    (gen_random_uuid(), 'Masala Chai', 'Spiced tea with milk and aromatic spices', 2.99, beverages_id, true, 5, '/placeholder.svg?height=300&width=300', ARRAY['Tea', 'Milk', 'Spices'], ARRAY['Dairy']),
    (gen_random_uuid(), 'Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 5.99, desserts_id, true, 2, '/placeholder.svg?height=300&width=300', ARRAY['Milk Powder', 'Sugar Syrup', 'Cardamom'], ARRAY['Dairy'])
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert sample inventory items
INSERT INTO inventory (id, item_name, current_stock, minimum_stock, maximum_stock, unit, cost_per_unit, supplier, expiry_date) VALUES
  (gen_random_uuid(), 'Basmati Rice', 50, 10, 100, 'kg', 3.50, 'Local Supplier', '2025-12-31'),
  (gen_random_uuid(), 'Chicken Breast', 25, 5, 50, 'kg', 8.99, 'Fresh Meat Co', '2025-01-15'),
  (gen_random_uuid(), 'Mixed Vegetables', 30, 10, 60, 'kg', 4.25, 'Farm Fresh', '2025-01-10'),
  (gen_random_uuid(), 'Bread Loaves', 20, 5, 40, 'pieces', 2.50, 'Bakery Plus', '2025-01-05'),
  (gen_random_uuid(), 'Cheese Slices', 15, 5, 30, 'packs', 6.75, 'Dairy Best', '2025-01-20'),
  (gen_random_uuid(), 'Yogurt', 40, 10, 80, 'liters', 3.25, 'Dairy Best', '2025-01-12'),
  (gen_random_uuid(), 'Tea Leaves', 10, 2, 20, 'kg', 12.50, 'Tea Garden', '2025-06-30')
ON CONFLICT (id) DO NOTHING;
