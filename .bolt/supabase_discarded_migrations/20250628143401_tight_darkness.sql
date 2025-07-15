-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  location TEXT,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_likes ON public.community_posts(likes DESC);
CREATE INDEX idx_community_posts_location ON public.community_posts(location) WHERE location IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own community posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create community_post_likes table
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_community_post_likes_community_post_id ON public.community_post_likes(community_post_id);
CREATE INDEX idx_community_post_likes_user_id ON public.community_post_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read community post likes"
ON public.community_post_likes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their own community post likes"
ON public.community_post_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Update comments table to support community posts
-- First check if content_type column exists and has the right constraint
DO $$
BEGIN
  -- Add 'community_post' to content_type check constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_content_type_check'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments DROP CONSTRAINT comments_content_type_check;
    
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_content_type_check
    CHECK (content_type = ANY (ARRAY['idea'::text, 'referral_job'::text, 'tool'::text, 'business'::text, 'community_post'::text]));
  END IF;
END $$;

-- Create functions to increment/decrement community post likes
CREATE OR REPLACE FUNCTION increment_community_post_likes(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_community_post_likes(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment/decrement community post comments count
CREATE OR REPLACE FUNCTION increment_community_post_comments(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_community_post_comments(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_community_post_likes TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_community_post_likes TO authenticated;
GRANT EXECUTE ON FUNCTION increment_community_post_comments TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_community_post_comments TO authenticated;