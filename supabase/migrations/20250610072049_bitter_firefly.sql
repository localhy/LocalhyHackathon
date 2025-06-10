/*
  # Add idea engagement features

  1. New Tables
    - `idea_likes`
      - `id` (uuid, primary key)
      - `idea_id` (uuid, foreign key to ideas)
      - `user_id` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)
    
    - `idea_bookmarks`
      - `id` (uuid, primary key)
      - `idea_id` (uuid, foreign key to ideas)
      - `user_id` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add functions for like counting
*/

-- Create idea_likes table
CREATE TABLE IF NOT EXISTS idea_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Create idea_bookmarks table
CREATE TABLE IF NOT EXISTS idea_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Enable RLS
ALTER TABLE idea_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_bookmarks ENABLE ROW LEVEL SECURITY;

-- Idea likes policies
CREATE POLICY "Anyone can read idea likes"
  ON idea_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own idea likes"
  ON idea_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Idea bookmarks policies
CREATE POLICY "Anyone can read idea bookmarks"
  ON idea_bookmarks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own idea bookmarks"
  ON idea_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_idea_likes_idea_id ON idea_likes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_likes_user_id ON idea_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_bookmarks_idea_id ON idea_bookmarks(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_bookmarks_user_id ON idea_bookmarks(user_id);

-- Create functions for like counting
CREATE OR REPLACE FUNCTION increment_idea_likes(idea_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ideas SET likes = likes + 1 WHERE id = idea_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_idea_likes(idea_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ideas SET likes = GREATEST(likes - 1, 0) WHERE id = idea_id;
END;
$$ LANGUAGE plpgsql;