/*
  # Add contact and social media fields to user profiles

  1. New Columns
    - `phone` (text) - User's phone number
    - `website` (text) - User's website URL
    - `linkedin` (text) - LinkedIn profile URL
    - `twitter` (text) - Twitter profile URL
    - `facebook` (text) - Facebook profile URL
    - `instagram` (text) - Instagram profile URL

  2. Changes
    - Add six new optional text columns to store contact and social media information
    - These fields will allow users to share their contact details and social media profiles
*/

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT;