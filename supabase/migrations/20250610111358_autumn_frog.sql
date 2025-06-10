/*
  # Wallet System Implementation

  1. New Columns
    - Add `credits` column to user_profiles table for credit balance
    
  2. New Tables
    - `transactions` table for logging all credit-related activities
    - Includes purchase, usage, withdrawal tracking
    
  3. Security
    - Enable RLS on transactions table
    - Add policies for user access control
    - Add indexes for performance
*/

-- Add credits column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'credits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credits integer DEFAULT 0;
  END IF;
END $$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit_purchase', 'credit_usage', 'withdrawal', 'refund')),
  amount numeric(10,2) NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  description text NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method text,
  payment_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);

-- Add updated_at trigger for transactions
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to add credits to user account
CREATE OR REPLACE FUNCTION add_credits_to_user(
  p_user_id uuid,
  p_credits integer,
  p_amount numeric,
  p_description text,
  p_payment_method text DEFAULT NULL,
  p_payment_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Update user credits
  UPDATE user_profiles 
  SET credits = credits + p_credits 
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    description,
    payment_method,
    payment_id,
    status
  ) VALUES (
    p_user_id,
    'credit_purchase',
    p_amount,
    p_credits,
    p_description,
    p_payment_method,
    p_payment_id,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits from user account
CREATE OR REPLACE FUNCTION deduct_credits_from_user(
  p_user_id uuid,
  p_credits integer,
  p_description text
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
  current_credits integer;
BEGIN
  -- Check if user has enough credits
  SELECT credits INTO current_credits 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF current_credits < p_credits THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', current_credits, p_credits;
  END IF;
  
  -- Update user credits
  UPDATE user_profiles 
  SET credits = credits - p_credits 
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
    0, -- No monetary amount for usage
    -p_credits, -- Negative to indicate deduction
    p_description,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;