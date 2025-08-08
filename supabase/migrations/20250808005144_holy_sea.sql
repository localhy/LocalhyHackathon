/*
  # Add thumbnail and cover photo fields to groups table

  1. New Columns
    - `thumbnail_url` (text) - URL for group thumbnail image displayed in group cards
    - `cover_photo_url` (text) - URL for group cover photo displayed in group detail page

  2. Changes
    - Add thumbnail_url column to groups table for group card display
    - Add cover_photo_url column to groups table for group detail page header
    - Both columns are optional (nullable) to maintain compatibility with existing groups
*/

-- Add thumbnail and cover photo columns to groups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE public.groups ADD COLUMN thumbnail_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'cover_photo_url'
  ) THEN
    ALTER TABLE public.groups ADD COLUMN cover_photo_url TEXT;
  END IF;
END $$;