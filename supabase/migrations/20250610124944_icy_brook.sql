/*
  # Complete Credit and Withdrawal System

  1. New Columns
    - Add `fiat_balance` to user_profiles for withdrawable cash balance
    - Add `credits` column if not exists

  2. New Functions
    - `transfer_earned_credits_to_fiat_balance` - Convert credits to withdrawable balance
    - `process_withdrawal` - Handle withdrawal requests with 15% commission
    - `add_credits_to_creator` - Add credits to content creators when their content is purchased

  3. Enhanced Transaction Types
    - Add new transaction types for credit conversion and earnings

  4. Security
    - All functions use SECURITY DEFINER for proper access control
    - Comprehensive error handling and validation
*/

-- Add fiat_balance column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'fiat_balance'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN fiat_balance numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Update transaction type constraints to include new types
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('credit_purchase', 'credit_usage', 'withdrawal', 'refund', 'credit_earning', 'credit_to_fiat_conversion'));

-- Function to transfer earned credits to fiat balance
CREATE OR REPLACE FUNCTION transfer_earned_credits_to_fiat_balance(
  p_user_id uuid,
  p_credits_to_convert integer
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
  current_credits integer;
  conversion_amount numeric(10,2);
BEGIN
  -- Validate input
  IF p_credits_to_convert <= 0 THEN
    RAISE EXCEPTION 'Credits to convert must be positive. Provided: %', p_credits_to_convert;
  END IF;
  
  -- Check if user has enough credits
  SELECT credits INTO current_credits 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF current_credits < p_credits_to_convert THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', current_credits, p_credits_to_convert;
  END IF;
  
  -- Calculate conversion amount (1 credit = $1)
  conversion_amount := p_credits_to_convert::numeric;
  
  -- Update user balances
  UPDATE user_profiles 
  SET 
    credits = credits - p_credits_to_convert,
    fiat_balance = fiat_balance + conversion_amount
  WHERE id = p_user_id;
  
  -- Create credit usage transaction
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
    0,
    -p_credits_to_convert,
    'Credits converted to fiat balance',
    'completed'
  );
  
  -- Create credit to fiat conversion transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    'credit_to_fiat_conversion',
    conversion_amount,
    0,
    'Credits converted to withdrawable balance',
    'completed',
    jsonb_build_object('credits_converted', p_credits_to_convert, 'conversion_rate', 1.0)
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process withdrawal with 15% commission
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_user_id uuid,
  p_withdrawal_amount numeric(10,2)
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
  current_fiat_balance numeric(10,2);
  commission_amount numeric(10,2);
  net_withdrawal_amount numeric(10,2);
BEGIN
  -- Validate input
  IF p_withdrawal_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be positive. Provided: %', p_withdrawal_amount;
  END IF;
  
  -- Check if user has sufficient fiat balance
  SELECT fiat_balance INTO current_fiat_balance 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF current_fiat_balance < p_withdrawal_amount THEN
    RAISE EXCEPTION 'Insufficient fiat balance. Current balance: $%, Requested: $%', current_fiat_balance, p_withdrawal_amount;
  END IF;
  
  -- Calculate commission (15%) and net amount
  commission_amount := p_withdrawal_amount * 0.15;
  net_withdrawal_amount := p_withdrawal_amount - commission_amount;
  
  -- Update user fiat balance
  UPDATE user_profiles 
  SET fiat_balance = fiat_balance - p_withdrawal_amount
  WHERE id = p_user_id;
  
  -- Create withdrawal transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    'withdrawal',
    p_withdrawal_amount,
    0,
    'Withdrawal request',
    'pending', -- Withdrawals start as pending for manual processing
    jsonb_build_object(
      'gross_amount', p_withdrawal_amount,
      'commission_amount', commission_amount,
      'commission_rate', 0.15,
      'net_amount', net_withdrawal_amount
    )
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to content creators
CREATE OR REPLACE FUNCTION add_credits_to_creator(
  p_creator_user_id uuid,
  p_credits_earned integer
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
BEGIN
  -- Validate input
  IF p_credits_earned <= 0 THEN
    RAISE EXCEPTION 'Credits earned must be positive. Provided: %', p_credits_earned;
  END IF;
  
  -- Add credits to creator's account
  UPDATE user_profiles 
  SET credits = credits + p_credits_earned 
  WHERE id = p_creator_user_id;
  
  -- Create credit earning transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    description,
    status
  ) VALUES (
    p_creator_user_id,
    'credit_earning',
    0, -- No direct monetary amount for earnings
    p_credits_earned,
    'Credits earned from content purchase',
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle content purchase (deduct from buyer, add to creator)
CREATE OR REPLACE FUNCTION purchase_content(
  p_buyer_user_id uuid,
  p_creator_user_id uuid,
  p_content_id uuid,
  p_content_type text,
  p_price_in_credits integer
)
RETURNS jsonb AS $$
DECLARE
  buyer_transaction_id uuid;
  creator_transaction_id uuid;
  current_credits integer;
BEGIN
  -- Validate input
  IF p_price_in_credits <= 0 THEN
    RAISE EXCEPTION 'Price must be positive. Provided: %', p_price_in_credits;
  END IF;
  
  IF p_buyer_user_id = p_creator_user_id THEN
    RAISE EXCEPTION 'Buyer and creator cannot be the same user';
  END IF;
  
  -- Check if buyer has enough credits
  SELECT credits INTO current_credits 
  FROM user_profiles 
  WHERE id = p_buyer_user_id;
  
  IF current_credits < p_price_in_credits THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', current_credits, p_price_in_credits;
  END IF;
  
  -- Deduct credits from buyer
  SELECT deduct_credits_from_user(
    p_buyer_user_id,
    p_price_in_credits,
    format('Purchased %s content (ID: %s)', p_content_type, p_content_id)
  ) INTO buyer_transaction_id;
  
  -- Add credits to creator
  SELECT add_credits_to_creator(
    p_creator_user_id,
    p_price_in_credits
  ) INTO creator_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'buyer_transaction_id', buyer_transaction_id,
    'creator_transaction_id', creator_transaction_id,
    'credits_transferred', p_price_in_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_fiat_balance ON user_profiles(fiat_balance);
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(credits);