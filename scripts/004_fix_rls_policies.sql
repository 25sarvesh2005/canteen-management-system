-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all user stats" ON user_stats;
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON notifications;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage menu items" ON menu_items FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage inventory" ON inventory FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all user stats" ON user_stats FOR SELECT USING (is_admin());
CREATE POLICY "Admins can create notifications for any user" ON notifications FOR INSERT WITH CHECK (is_admin());
