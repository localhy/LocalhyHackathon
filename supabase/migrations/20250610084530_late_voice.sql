/*
  # Add missing fields to referral_jobs table

  1. New Columns
    - `referral_type` (text) - Type of referral (Product, Service, Event, Store Visit, App Download, etc.)
    - `logo_url` (text) - Business logo URL
    - `website` (text) - Business website or social media
    - `cta_text` (text) - Custom call-to-action text for referrers
    - `terms` (text) - Terms and conditions for the referral job

  2. Notes
    - All new fields are optional to maintain backward compatibility
    - These fields enhance the referral job cards and forms as requested
*/

-- Add new columns to referral_jobs table
DO $$
BEGIN
  -- Add referral_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'referral_type'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN referral_type text;
  END IF;

  -- Add logo_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN logo_url text;
  END IF;

  -- Add website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'website'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN website text;
  END IF;

  -- Add cta_text column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'cta_text'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN cta_text text;
  END IF;

  -- Add terms column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_jobs' AND column_name = 'terms'
  ) THEN
    ALTER TABLE referral_jobs ADD COLUMN terms text;
  END IF;
END $$;