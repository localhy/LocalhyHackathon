/*
  # Update location handling for global support

  1. Changes
    - Add location field to ideas table if not exists
    - Add location field to referral_jobs table if not exists
    - Update any existing location constraints to support global locations
    - Add indexes for location-based queries

  2. Security
    - No changes to RLS policies needed
*/

-- Add location field to ideas table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = 'location'
  ) THEN
    ALTER TABLE ideas ADD COLUMN location text;
  END IF;
END $$;

-- Add location field to referral_jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'location'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN location text;
  END IF;
END $$;

-- Add location field to tools table if it doesn't exist (for future use)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tools' AND column_name = 'location'
  ) THEN
    ALTER TABLE tools ADD COLUMN location text;
  END IF;
END $$;

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_ideas_location ON ideas(location);
CREATE INDEX IF NOT EXISTS idx_referral_jobs_location ON referral_jobs(location);
CREATE INDEX IF NOT EXISTS idx_tools_location ON tools(location);

-- Create a function to extract country from location string
CREATE OR REPLACE FUNCTION extract_country_from_location(location_text text)
RETURNS text AS $$
BEGIN
  -- Extract the last part of the location string (assumed to be country)
  -- Example: "123 Main St, New York, NY, United States" -> "United States"
  IF location_text IS NULL OR location_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Split by comma and get the last part, trimmed
  RETURN TRIM(SPLIT_PART(location_text, ',', ARRAY_LENGTH(STRING_TO_ARRAY(location_text, ','), 1)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for country-based queries
CREATE INDEX IF NOT EXISTS idx_ideas_country ON ideas(extract_country_from_location(location));
CREATE INDEX IF NOT EXISTS idx_referral_jobs_country ON referral_jobs(extract_country_from_location(location));
CREATE INDEX IF NOT EXISTS idx_tools_country ON tools(extract_country_from_location(location));