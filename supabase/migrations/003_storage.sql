-- =============================================
-- Truss App - Storage Buckets and Policies
-- =============================================
-- Note: Run this in Supabase Dashboard SQL Editor
-- or use Supabase CLI

-- =============================================
-- Create Storage Buckets
-- =============================================

-- Student ID Images (Private - for verification)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-id-images',
  'student-id-images',
  FALSE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Event Images (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Gallery Photos (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- User Avatars (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  TRUE,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies - Student ID Images (Private)
-- =============================================

-- Users can upload their own student ID
CREATE POLICY "Users can upload own student ID"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-id-images' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);

-- Users can view their own student ID
CREATE POLICY "Users can view own student ID"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-id-images' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);

-- Admins can view all student IDs
CREATE POLICY "Admins can view all student IDs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-id-images' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  )
);

-- Admins can delete student IDs (after approval)
CREATE POLICY "Admins can delete student IDs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-id-images' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  )
);

-- Users can update their own student ID (for re-upload)
CREATE POLICY "Users can update own student ID"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-id-images' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);

-- =============================================
-- Storage Policies - Event Images (Public read, Admin write)
-- =============================================

-- Anyone can view event images
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Only admins can upload event images
CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  )
);

-- Only admins can update event images
CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  )
);

-- Only admins can delete event images
CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  )
);

-- =============================================
-- Storage Policies - Gallery Photos (Public read, Authenticated write)
-- =============================================

-- Anyone can view approved gallery photos
CREATE POLICY "Anyone can view gallery photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-photos');

-- Approved users can upload gallery photos
CREATE POLICY "Approved users can upload gallery photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-photos' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND approved = TRUE
  )
);

-- Users can delete their own gallery photos
CREATE POLICY "Users can delete own gallery photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-photos' AND
  (
    -- User's own photos (folder structure: event_id/user_id-timestamp.ext)
    (storage.foldername(name))[1] IN (
      SELECT gp.event_id::text FROM public.gallery_photos gp
      JOIN public.users u ON gp.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
    OR
    -- Admins can delete any
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  )
);

-- =============================================
-- Storage Policies - User Avatars (Public read, Own write)
-- =============================================

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.users 
    WHERE auth_id = auth.uid()
  )
);
