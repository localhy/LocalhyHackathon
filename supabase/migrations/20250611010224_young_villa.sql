/*
  # Create purchased_content table for paywall implementation

  1. New Tables
    - `purchased_content`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `content_id` (uuid, foreign key to ideas/referral_jobs/tools)
      - `content_type` (text, e.g., 'idea', 'referral_job', 'tool')
      - `purchase_date` (timestamp with time zone)
      - `price_paid` (numeric)

  2. Security
    - Enable RLS on `purchased_content` table
    - Add policy for users to read their own purchases
    - Add policy for system to insert purchase records

  3. Indexes
    - Index on user_id for fast user purchase lookups
    - Index on content_id and content_type for fast content access checks
    - Composite index on user_id, content_id, content_type for purchase verification
*/

CREATE TABLE IF NOT EXISTS purchased_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('idea', 'referral_job', 'tool')),
  purchase_date timestamptz DEFAULT now(),
  price_paid numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchased_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own purchases"
  ON purchased_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchase records"
  ON purchased_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchased_content_user_id 
  ON purchased_content(user_id);

CREATE INDEX IF NOT EXISTS idx_purchased_content_content 
  ON purchased_content(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_purchased_content_lookup 
  ON purchased_content(user_id, content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_purchased_content_date 
  ON purchased_content(purchase_date DESC);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON purchased_content 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();