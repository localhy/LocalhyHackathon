/*
  # Add thumbnail support to ideas table

  1. Changes
    - Add `thumbnail_url` column to ideas table for YouTube-style thumbnails
    - Cover images remain for detail pages, thumbnails for card grids
    - Update existing ideas to have null thumbnails initially

  2. Notes
    - Thumbnails will be used in card grids (like YouTube thumbnails)
    - Cover images will be used in detail pages (like YouTube cover photos)
    - Both are optional but recommended for better user experience
*/

-- Add thumbnail_url column to ideas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE ideas ADD COLUMN thumbnail_url text;
  END IF;
END $$;