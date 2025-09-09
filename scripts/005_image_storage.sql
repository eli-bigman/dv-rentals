-- Check if we need to rename the column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cars'
        AND column_name = 'images'
    ) THEN
        ALTER TABLE public.cars RENAME COLUMN images TO image_url;
    END IF;
END$$;

-- Note: The storage bucket and policies below are Supabase-specific and should be executed
-- through the Supabase SQL editor or dashboard

/*
-- Create a bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access for reading car images
CREATE POLICY "Public can view car images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vehicles');

-- Allow authenticated users to upload car images
CREATE POLICY "Authenticated users can upload car images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'vehicles' AND 
    auth.role() = 'authenticated'
);

-- Allow admins to manage all car images
CREATE POLICY "Admins can manage all car images" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'vehicles' AND
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'staff')
    )
);
*/
