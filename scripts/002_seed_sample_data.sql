-- Sample data for DV Rentals
-- Insert sample cars for testing

INSERT INTO public.cars (
  make, model, year, color, license_plate, fuel_type, transmission, seats, 
  daily_rate, weekly_rate, monthly_rate, location, features, description
) VALUES 
(
  'Toyota', 'Corolla', 2022, 'White', 'GR-2345-22', 'petrol', 'automatic', 5,
  150.00, 900.00, 3500.00, 'Accra', 
  ARRAY['AC', 'Bluetooth', 'USB Charging', 'Backup Camera'],
  'Reliable and fuel-efficient sedan perfect for city driving and business trips.'
),
(
  'Honda', 'Civic', 2023, 'Silver', 'GR-5678-23', 'petrol', 'automatic', 5,
  180.00, 1080.00, 4200.00, 'Accra',
  ARRAY['AC', 'GPS Navigation', 'Bluetooth', 'Sunroof', 'Leather Seats'],
  'Modern sedan with premium features for comfortable long-distance travel.'
),
(
  'Nissan', 'Sentra', 2021, 'Blue', 'GR-9012-21', 'petrol', 'manual', 5,
  120.00, 720.00, 2800.00, 'Kumasi',
  ARRAY['AC', 'Radio', 'USB Charging'],
  'Economical choice for budget-conscious travelers exploring the Ashanti region.'
),
(
  'Hyundai', 'Elantra', 2023, 'Black', 'GR-3456-23', 'petrol', 'automatic', 5,
  170.00, 1020.00, 3900.00, 'Accra',
  ARRAY['AC', 'Bluetooth', 'Cruise Control', 'Keyless Entry'],
  'Stylish and comfortable sedan ideal for business and leisure travel.'
),
(
  'Toyota', 'RAV4', 2022, 'Red', 'GR-7890-22', 'petrol', 'automatic', 7,
  250.00, 1500.00, 5800.00, 'Accra',
  ARRAY['AC', 'GPS Navigation', 'Bluetooth', '4WD', 'Roof Rack'],
  'Spacious SUV perfect for family trips and adventures outside the city.'
),
(
  'Honda', 'CR-V', 2023, 'White', 'GR-1234-23', 'petrol', 'automatic', 7,
  280.00, 1680.00, 6500.00, 'Kumasi',
  ARRAY['AC', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Sunroof'],
  'Premium SUV with advanced safety features for comfortable family travel.'
);

-- Update car status and add some maintenance records
UPDATE public.cars SET status = 'maintenance' WHERE license_plate = 'GR-9012-21';
UPDATE public.cars SET status = 'rented' WHERE license_plate = 'GR-7890-22';
