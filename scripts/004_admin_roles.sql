-- Add admin role support to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff'));

-- Create admin user (you can update this with real admin credentials)
-- This is just for demo purposes
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@dvrentals.gh',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create admin profile
INSERT INTO public.users (id, full_name, phone_number, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'DV Rentals Admin',
  '+233 XX XXX XXXX',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update RLS policies to allow admin access
-- Admin can view all cars
CREATE POLICY "Admins can manage all cars" ON public.cars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Admin can view all bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Admin can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u2
      WHERE u2.id = auth.uid() 
      AND u2.role IN ('admin', 'staff')
    )
  );
