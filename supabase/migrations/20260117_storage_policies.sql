-- Storage RLS Policies for business-assets bucket
-- Run this in your Supabase SQL Editor to enable avatar and logo uploads

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This should already be enabled by default in Supabase

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets' AND
  (storage.foldername(name))[1] IN ('avatars', 'logos') AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-assets' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
)
WITH CHECK (
  bucket_id = 'business-assets' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-assets' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow public read access to all files in the bucket
CREATE POLICY "Public read access for business-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-assets');


-- Profiles Table RLS Policies (if not already created)
-- These ensure users can only update their own profile

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update their own profile (including avatar_url)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for initial creation)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
