/*
  # Add Referral Job Posting Fee System

  1. Changes
    - Add function to deduct credits when posting a referral job
    - Ensure credits are refunded if job creation fails
    - Track credit usage in transactions table

  2. Security
    - Function is accessible to authenticated users
*/

-- Function to deduct credits from user
CREATE OR REPLACE FUNCTION deduct_credits_from_user(
  p_user_id uuid,
  p_credits integer,
  p_description text
) RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
  user_credits integer;
BEGIN
  -- Check if user has enough credits
  SELECT credits INTO user_credits 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF user_credits < p_credits THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_credits, user_credits;
  END IF;
  
  -- Deduct credits from user
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
    p_credits,
    -p_credits,
    p_description,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits to user (for refunds or earnings)
CREATE OR REPLACE FUNCTION add_credits_to_user(
  p_user_id uuid,
  p_credits integer,
  p_amount numeric,
  p_description text,
  p_payment_method text DEFAULT NULL,
  p_payment_id text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Add credits to user
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
    CASE 
      WHEN p_description LIKE 'Refund%' THEN 'refund'
      ELSE 'credit_purchase'
    END,
    p_amount,
    p_credits,
    p_description,
    p_payment_method,
    p_payment_id,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;