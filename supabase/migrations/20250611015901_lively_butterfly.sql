/*
  # Promotions System for Featured Ads

  1. New Tables
    - `promotions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `content_id` (uuid, the promoted content)
      - `content_type` (text: 'idea', 'referral_job', 'tool')
      - `promotion_type` (text: promotion category)
      - `cost_credits` (integer, credits paid)
      - `start_date` (timestamptz, when promotion begins)
      - `end_date` (timestamptz, when promotion ends)
      - `status` (text: 'active', 'expired', 'pending', 'cancelled')
      - `views_gained` (integer, additional views from promotion)
      - `clicks_gained` (integer, additional clicks from promotion)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `promotions` table
    - Add policies for users to manage their own promotions
    - Add policy for system to update promotion stats

  3. Indexes
    - Performance indexes for common queries
    - Index for active promotions lookup
    - Index for content promotion status
</parameter>

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('idea', 'referral_job', 'tool')),
  promotion_type text NOT NULL CHECK (promotion_type IN ('featured_homepage', 'boosted_search', 'category_spotlight', 'premium_placement')),
  cost_credits integer NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
  views_gained integer DEFAULT 0,
  clicks_gained integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own promotions"
  ON promotions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promotions"
  ON promotions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promotions"
  ON promotions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update promotion stats"
  ON promotions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotions_user_id 
  ON promotions(user_id);

CREATE INDEX IF NOT EXISTS idx_promotions_content 
  ON promotions(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_promotions_active 
  ON promotions(status, end_date) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_promotions_type 
  ON promotions(promotion_type, status);

CREATE INDEX IF NOT EXISTS idx_promotions_dates 
  ON promotions(start_date, end_date);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON promotions 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Function to automatically expire promotions
CREATE OR REPLACE FUNCTION expire_promotions()
RETURNS void AS $$
BEGIN
  UPDATE promotions 
  SET status = 'expired'
  WHERE status = 'active' 
    AND end_date < now();
END;
$$ LANGUAGE plpgsql;

-- Function to create a promotion and deduct credits
CREATE OR REPLACE FUNCTION create_promotion(
  p_user_id uuid,
  p_content_id uuid,
  p_content_type text,
  p_promotion_type text,
  p_duration_days integer,
  p_cost_credits integer
) RETURNS uuid AS $$
DECLARE
  promotion_id uuid;
  user_credits integer;
BEGIN
  -- Check if user has enough credits
  SELECT credits INTO user_credits 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF user_credits < p_cost_credits THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_cost_credits, user_credits;
  END IF;
  
  -- Create the promotion
  INSERT INTO promotions (
    user_id,
    content_id,
    content_type,
    promotion_type,
    cost_credits,
    end_date
  ) VALUES (
    p_user_id,
    p_content_id,
    p_content_type,
    p_promotion_type,
    p_cost_credits,
    now() + (p_duration_days || ' days')::interval
  ) RETURNING id INTO promotion_id;
  
  -- Deduct credits from user
  UPDATE user_profiles 
  SET credits = credits - p_cost_credits 
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    description,
    status
  ) VALUES (
    p_user_id,
    'credit_usage',
    p_cost_credits,
    -p_cost_credits,
    'Promotion: ' || p_promotion_type || ' for ' || p_duration_days || ' days',
    'completed'
  );
  
  RETURN promotion_id;
END;
$$ LANGUAGE plpgsql;