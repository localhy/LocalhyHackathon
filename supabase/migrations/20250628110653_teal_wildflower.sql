/*
  # Add like and comment functionality for referral jobs

  1. New Tables
    - `referral_job_likes`
      - `id` (uuid, primary key)
      - `referral_job_id` (uuid, foreign key to referral_jobs)
      - `user_id` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)
  
  2. Changes
    - Add `likes` column to `referral_jobs` table
    - Modify `comments` table to be generic (support ideas, referral jobs, tools)
    - Add database functions for incrementing/decrementing likes
    - Add RLS policies for security
*/

-- Add likes column to referral_jobs if it doesn't exist
ALTER TABLE public.referral_jobs
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create referral_job_likes table
CREATE TABLE IF NOT EXISTS public.referral_job_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_job_id UUID NOT NULL REFERENCES public.referral_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to prevent duplicate likes
ALTER TABLE public.referral_job_likes
ADD CONSTRAINT referral_job_likes_referral_job_id_user_id_key UNIQUE (referral_job_id, user_id);

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
  USING (uid() = user_id);

-- Modify comments table to be generic
-- First, add content_type column
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS content_type TEXT;

-- Update existing comments to have 'idea' as content_type
UPDATE public.comments
SET content_type = 'idea'
WHERE content_type IS NULL;

-- Rename idea_id to content_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'idea_id'
  ) THEN
    ALTER TABLE public.comments RENAME COLUMN idea_id TO content_id;
  END IF;
END $$;

-- Make content_type NOT NULL after migration
ALTER TABLE public.comments
ALTER COLUMN content_type SET NOT NULL;

-- Add check constraint for content_type
ALTER TABLE public.comments
ADD CONSTRAINT comments_content_type_check
CHECK (content_type = ANY (ARRAY['idea'::text, 'referral_job'::text, 'tool'::text]));

-- Update or create indexes
DROP INDEX IF EXISTS idx_comments_idea_id;
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_type ON public.comments(content_type);

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