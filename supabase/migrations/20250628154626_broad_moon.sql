/*
  # Community Post Functions

  1. New Functions
    - Functions to handle community post likes and comments
    - Functions to fetch community posts with user interactions
  
  2. Security
    - All functions are SECURITY DEFINER to ensure proper access control
    - Execute permissions granted to authenticated users
*/

-- Create function to get community posts with user interactions
CREATE OR REPLACE FUNCTION get_community_posts_with_interactions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  location TEXT,
  likes INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_name TEXT,
  user_avatar_url TEXT,
  user_type TEXT,
  liked_by_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    cp.content,
    cp.image_url,
    cp.video_url,
    cp.location,
    cp.likes,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.name AS user_name,
    up.avatar_url AS user_avatar_url,
    up.user_type AS user_type,
    EXISTS (
      SELECT 1 FROM community_post_likes cpl
      WHERE cpl.community_post_id = cp.id AND cpl.user_id = p_user_id
    ) AS liked_by_user
  FROM
    community_posts cp
    JOIN user_profiles up ON cp.user_id = up.id
  ORDER BY
    cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get community posts by location
CREATE OR REPLACE FUNCTION get_community_posts_by_location(
  p_user_id UUID,
  p_location TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  location TEXT,
  likes INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_name TEXT,
  user_avatar_url TEXT,
  user_type TEXT,
  liked_by_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    cp.content,
    cp.image_url,
    cp.video_url,
    cp.location,
    cp.likes,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.name AS user_name,
    up.avatar_url AS user_avatar_url,
    up.user_type AS user_type,
    EXISTS (
      SELECT 1 FROM community_post_likes cpl
      WHERE cpl.community_post_id = cp.id AND cpl.user_id = p_user_id
    ) AS liked_by_user
  FROM
    community_posts cp
    JOIN user_profiles up ON cp.user_id = up.id
  WHERE
    cp.location ILIKE '%' || p_location || '%'
  ORDER BY
    cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get community posts by timeframe
CREATE OR REPLACE FUNCTION get_community_posts_by_timeframe(
  p_user_id UUID,
  p_days INTEGER,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  location TEXT,
  likes INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_name TEXT,
  user_avatar_url TEXT,
  user_type TEXT,
  liked_by_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    cp.content,
    cp.image_url,
    cp.video_url,
    cp.location,
    cp.likes,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.name AS user_name,
    up.avatar_url AS user_avatar_url,
    up.user_type AS user_type,
    EXISTS (
      SELECT 1 FROM community_post_likes cpl
      WHERE cpl.community_post_id = cp.id AND cpl.user_id = p_user_id
    ) AS liked_by_user
  FROM
    community_posts cp
    JOIN user_profiles up ON cp.user_id = up.id
  WHERE
    cp.created_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY
    cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search community posts
CREATE OR REPLACE FUNCTION search_community_posts(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  location TEXT,
  likes INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_name TEXT,
  user_avatar_url TEXT,
  user_type TEXT,
  liked_by_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    cp.content,
    cp.image_url,
    cp.video_url,
    cp.location,
    cp.likes,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.name AS user_name,
    up.avatar_url AS user_avatar_url,
    up.user_type AS user_type,
    EXISTS (
      SELECT 1 FROM community_post_likes cpl
      WHERE cpl.community_post_id = cp.id AND cpl.user_id = p_user_id
    ) AS liked_by_user
  FROM
    community_posts cp
    JOIN user_profiles up ON cp.user_id = up.id
  WHERE
    cp.content ILIKE '%' || p_query || '%'
    OR cp.location ILIKE '%' || p_query || '%'
    OR up.name ILIKE '%' || p_query || '%'
  ORDER BY
    cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to like/unlike a community post
CREATE OR REPLACE FUNCTION toggle_community_post_like(
  p_user_id UUID,
  p_post_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_liked BOOLEAN;
BEGIN
  -- Check if already liked
  SELECT EXISTS (
    SELECT 1 FROM community_post_likes
    WHERE community_post_id = p_post_id AND user_id = p_user_id
  ) INTO v_already_liked;
  
  IF v_already_liked THEN
    -- Unlike
    DELETE FROM community_post_likes
    WHERE community_post_id = p_post_id AND user_id = p_user_id;
    
    -- Decrement likes count
    UPDATE community_posts
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = p_post_id;
  ELSE
    -- Like
    INSERT INTO community_post_likes (community_post_id, user_id)
    VALUES (p_post_id, p_user_id);
    
    -- Increment likes count
    UPDATE community_posts
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = p_post_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add a comment to a community post
CREATE OR REPLACE FUNCTION add_community_post_comment(
  p_user_id UUID,
  p_post_id UUID,
  p_content TEXT
)
RETURNS UUID AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Insert comment
  INSERT INTO comments (
    content_id,
    content_type,
    user_id,
    content
  ) VALUES (
    p_post_id,
    'community_post',
    p_user_id,
    p_content
  ) RETURNING id INTO v_comment_id;
  
  -- Increment comments count
  UPDATE community_posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = p_post_id;
  
  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_community_posts_with_interactions TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_posts_by_location TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_posts_by_timeframe TO authenticated;
GRANT EXECUTE ON FUNCTION search_community_posts TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_community_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION add_community_post_comment TO authenticated;