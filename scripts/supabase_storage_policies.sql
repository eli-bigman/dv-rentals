/*
This SQL code provides policies for Supabase storage to allow access to car images.
Run this in your Supabase SQL Editor to set up proper access controls.
*/

-- Create storage bucket for car images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access for viewing car images
CREATE POLICY "Public Read Access for Vehicle Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicles');

-- Allow authenticated users to upload car images
CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'vehicles' AND
    auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicles' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'vehicles');

-- Allow admins to manage all images
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
