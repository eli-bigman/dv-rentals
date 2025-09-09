# Car Image Upload Setup Instructions

## Database Schema Update

If your cars table uses a column named `images` but your code refers to `image_url`, you'll need to rename the column:

```sql
ALTER TABLE public.cars RENAME COLUMN images TO image_url;
```

## Storage Bucket Setup

1. In the Supabase dashboard, navigate to the Storage section
2. Create a new bucket named `vehicles` with public access enabled
3. Set up the following Storage policies:

### Policy 1: Public viewing access
- Name: "Public can view car images"
- For operation: SELECT
- Using expression: `bucket_id = 'vehicles'`

### Policy 2: Upload access for authenticated users
- Name: "Authenticated users can upload car images"
- For operation: INSERT
- Using expression: `bucket_id = 'vehicles' AND auth.role() = 'authenticated'`

### Policy 3: Admin management access
- Name: "Admins can manage all car images"
- For operation: ALL
- Using expression: `bucket_id = 'vehicles' AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'staff'))`

## Accessing the Admin Interface

1. Log in using admin credentials (email: admin@dvrentals.gh, password: admin123)
2. Navigate to `/admin/cars` to view the car management interface
3. Click "Edit" on any car to update its details and images
4. Use the "Add Car" button to create a new vehicle with images

## Troubleshooting

If you encounter permission errors when uploading images:
1. Double-check the storage policies in your Supabase dashboard
2. Ensure the user has admin or staff role
3. Verify the RLS policies are enabled and correctly configured
