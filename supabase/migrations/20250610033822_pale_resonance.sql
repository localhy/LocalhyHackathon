/*
  # Add cover images and enhanced fields to ideas

  1. New Columns
    - `cover_image_url` (text) - URL for idea cover images
    - `problem_summary` (text) - Brief problem description
    - `solution_overview` (text) - Solution summary
    - `tags` (text[]) - Array of tags for categorization

  2. Storage Buckets
    - Create buckets for idea covers, business logos, and tools
    - Set up appropriate RLS policies for file access

  3. Security
    - RLS policies for authenticated file uploads
    - Public read access for images
    - User-specific update/delete permissions
*/

-- Add new columns to ideas table
DO $$
BEGIN
  -- Add cover_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE ideas ADD COLUMN cover_image_url text;
  END IF;

  -- Add problem_summary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'problem_summary'
  ) THEN
    ALTER TABLE ideas ADD COLUMN problem_summary text;
  END IF;

  -- Add solution_overview column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'solution_overview'
  ) THEN
    ALTER TABLE ideas ADD COLUMN solution_overview text;
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'tags'
  ) THEN
    ALTER TABLE ideas ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('idea-covers', 'idea-covers', true),
  ('business-logos', 'business-logos', true),
  ('tools', 'tools', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop existing policies for idea-covers bucket
  DROP POLICY IF EXISTS "Authenticated users can upload idea covers" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view idea covers" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own idea covers" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own idea covers" ON storage.objects;

  -- Drop existing policies for business-logos bucket
  DROP POLICY IF EXISTS "Authenticated users can upload business logos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view business logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own business logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own business logos" ON storage.objects;

  -- Drop existing policies for tools bucket
  DROP POLICY IF EXISTS "Authenticated users can upload tools" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view tools" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own tools" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own tools" ON storage.objects;
END $$;

-- Create RLS policies for idea-covers bucket
CREATE POLICY "Authenticated users can upload idea covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'idea-covers');

CREATE POLICY "Anyone can view idea covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'idea-covers');

CREATE POLICY "Users can update their own idea covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'idea-covers');

CREATE POLICY "Users can delete their own idea covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'idea-covers');

-- Create RLS policies for business-logos bucket
CREATE POLICY "Authenticated users can upload business logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Anyone can view business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

CREATE POLICY "Users can update their own business logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-logos');

CREATE POLICY "Users can delete their own business logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-logos');

-- Create RLS policies for tools bucket
CREATE POLICY "Authenticated users can upload tools"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tools');

CREATE POLICY "Anyone can view tools"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tools');

CREATE POLICY "Users can update their own tools"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tools');

CREATE POLICY "Users can delete their own tools"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tools');