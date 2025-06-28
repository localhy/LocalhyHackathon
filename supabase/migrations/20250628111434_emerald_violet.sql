/*
  # Add Like and Comment Functionality for Referral Jobs

  1. New Tables
    - `referral_job_likes`
      - `id` (uuid, primary key)
      - `referral_job_id` (uuid, foreign key to referral_jobs)
      - `user_id` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)

  2. Table Modifications
    - Add `likes` column to `referral_jobs` table
    - Modify `comments` table to be generic (support ideas, referral jobs, tools)
    - Rename `idea_id` to `content_id` in comments table
    - Add `content_type` column to comments table

  3. Security
    - Enable RLS on `referral_job_likes` table
    - Add policies for reading and managing referral job likes
    - Update comment policies to work with generic content

  4. Functions
    - Create functions to increment/decrement referral job likes
*/

-- Add likes column to referral_jobs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'likes'
  ) THEN
    ALTER TABLE public.referral_jobs ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create referral_job_likes table
CREATE TABLE IF NOT EXISTS public.referral_job_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_job_id UUID NOT NULL REFERENCES public.referral_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referral_job_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_job_likes_referral_job_id ON public.referral_job_likes(referral_job_id);
CREATE INDEX IF NOT EXISTS idx_referral_job_likes_user_id ON public.referral_job_likes(user_id);

-- Enable RLS on referral_job_likes
ALTER TABLE public.referral_job_likes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for referral_job_likes
CREATE POLICY "Anyone can read referral job likes" 
  ON public.referral_job_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own referral job likes" 
  ON public.referral_job_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Modify comments table to be generic
-- First, add content_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN content_type TEXT;
  END IF;
END $$;

-- Update existing comments to have 'idea' as content_type
UPDATE public.comments
SET content_type = 'idea'
WHERE content_type IS NULL;

-- Rename idea_id to content_id if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'idea_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'content_id'
  ) THEN
    ALTER TABLE public.comments RENAME COLUMN idea_id TO content_id;
  END IF;
END $$;

-- Make content_type NOT NULL after migration
ALTER TABLE public.comments
ALTER COLUMN content_type SET NOT NULL;

-- Drop existing check constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_content_type_check'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments DROP CONSTRAINT comments_content_type_check;
  END IF;
END $$;

-- Add check constraint for content_type
ALTER TABLE public.comments
ADD CONSTRAINT comments_content_type_check
CHECK (content_type = ANY (ARRAY['idea'::text, 'referral_job'::text, 'tool'::text]));

-- Update or create indexes
DROP INDEX IF EXISTS idx_comments_idea_id;
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_type ON public.comments(content_type);

-- Drop existing foreign key constraint on idea_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_idea_id_fkey'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments DROP CONSTRAINT comments_idea_id_fkey;
  END IF;
END $$;

-- We cannot add a generic foreign key constraint since content_id can reference different tables
-- Instead, we'll rely on application-level validation

-- Create function to increment referral job likes
CREATE OR REPLACE FUNCTION increment_referral_job_likes(p_referral_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.referral_jobs
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = p_referral_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement referral job likes
CREATE OR REPLACE FUNCTION decrement_referral_job_likes(p_referral_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.referral_jobs
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = p_referral_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_referral_job_likes TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_referral_job_likes TO authenticated;