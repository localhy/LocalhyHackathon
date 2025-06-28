/*
  # Business Profiles Schema

  1. New Tables
    - `business_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `business_name` (text, required)
      - `category` (text, required)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `description` (text, required)
      - `address` (text)
      - `operating_hours` (jsonb)
      - `thumbnail_url` (text, required)
      - `cover_photo_url` (text)
      - `gallery_urls` (text[])
      - `youtube_video_url` (text)
      - `referral_reward_amount` (numeric)
      - `referral_reward_type` (text)
      - `referral_cta_link` (text)
      - `promo_tagline` (text)
      - `email` (text, required)
      - `phone` (text)
      - `website` (text)
      - `linkedin` (text)
      - `twitter` (text)
      - `facebook` (text)
      - `instagram` (text)
      - `years_in_business` (integer)
      - `certifications_urls` (text[])
      - `customer_reviews` (jsonb)
      - `enable_referrals` (boolean)
      - `display_earnings_publicly` (boolean)
      - `enable_questions_comments` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `business_profiles` table
    - Add policies for authenticated users to manage their own business profiles
    - Add policy for authenticated users to read active business profiles
*/

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  description TEXT NOT NULL,
  address TEXT,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  thumbnail_url TEXT NOT NULL,
  cover_photo_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}'::text[],
  youtube_video_url TEXT,
  referral_reward_amount NUMERIC(10,2),
  referral_reward_type TEXT CHECK (referral_reward_type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  referral_cta_link TEXT,
  promo_tagline TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  facebook TEXT,
  instagram TEXT,
  years_in_business INTEGER,
  certifications_urls TEXT[] DEFAULT '{}'::text[],
  customer_reviews JSONB DEFAULT '[]'::jsonb,
  enable_referrals BOOLEAN DEFAULT TRUE,
  display_earnings_publicly BOOLEAN DEFAULT FALSE,
  enable_questions_comments BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.business_profiles
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON public.business_profiles(status);
CREATE INDEX idx_business_profiles_category ON public.business_profiles(category);
CREATE INDEX idx_business_profiles_location ON public.business_profiles(city, state, country);

-- Enable Row Level Security
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own business profiles"
ON public.business_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profiles"
ON public.business_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profiles"
ON public.business_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can read active business profiles"
ON public.business_profiles
FOR SELECT
TO authenticated
USING (status = 'active' OR auth.uid() = user_id);

-- Create a function to check if a user has a business profile
CREATE OR REPLACE FUNCTION user_has_business_profile(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE user_id = p_user_id
  ) INTO profile_exists;
  
  RETURN profile_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_has_business_profile TO authenticated;