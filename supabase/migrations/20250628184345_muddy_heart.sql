/*
  # Credit System Improvements

  1. New Columns
    - `purchased_credits` column to `user_profiles` table to track credits that were purchased and cannot be withdrawn

  2. Function Updates
    - Update `purchase_content` function to prioritize purchased credits over earned credits
    - Update `transfer_credits_to_fiat_balance` function to only allow conversion of earned credits
    - Update `process_withdrawal_with_paypal` function to enforce $50 minimum withdrawal
*/

-- Add purchased_credits column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS purchased_credits INTEGER DEFAULT 0;

-- Create index for purchased_credits for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_purchased_credits 
ON public.user_profiles (purchased_credits);

-- Drop existing functions to avoid signature conflicts
DROP FUNCTION IF EXISTS purchase_content(UUID, UUID, UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS transfer_credits_to_fiat_balance(UUID, INTEGER);
DROP FUNCTION IF EXISTS process_withdrawal_with_paypal(UUID, NUMERIC, TEXT);

-- Update purchase_content function to prioritize purchased credits over earned credits
CREATE OR REPLACE FUNCTION purchase_content(
  p_buyer_user_id UUID,
  p_creator_user_id UUID,
  p_content_id UUID,
  p_content_type TEXT,
  p_price_in_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_buyer_purchased_credits INTEGER;
  v_buyer_earned_credits INTEGER;
  v_purchased_credits_used INTEGER := 0;
  v_earned_credits_used INTEGER := 0;
  v_purchase_id UUID;
BEGIN
  -- Check if buyer has already purchased this content
  IF EXISTS (
    SELECT 1 FROM purchased_content
    WHERE user_id = p_buyer_user_id
    AND content_id = p_content_id
    AND content_type = p_content_type
  ) THEN
    RETURN TRUE; -- Already purchased, no need to charge again
  END IF;

  -- Get buyer's credit balances
  SELECT purchased_credits, credits INTO v_buyer_purchased_credits, v_buyer_earned_credits
  FROM user_profiles
  WHERE id = p_buyer_user_id;

  -- Check if buyer has enough total credits
  IF (v_buyer_purchased_credits + v_buyer_earned_credits) < p_price_in_credits THEN
    RAISE EXCEPTION 'Insufficient credits to purchase content. You need % credits but only have % total credits.',
      p_price_in_credits, (v_buyer_purchased_credits + v_buyer_earned_credits);
  END IF;

  -- Calculate how many purchased and earned credits to use
  IF v_buyer_purchased_credits >= p_price_in_credits THEN
    -- Use only purchased credits
    v_purchased_credits_used := p_price_in_credits;
  ELSE
    -- Use all available purchased credits and some earned credits
    v_purchased_credits_used := v_buyer_purchased_credits;
    v_earned_credits_used := p_price_in_credits - v_purchased_credits_used;
  END IF;

  -- Update buyer's credits
  UPDATE user_profiles
  SET 
    purchased_credits = purchased_credits - v_purchased_credits_used,
    credits = credits - v_earned_credits_used
  WHERE id = p_buyer_user_id;

  -- Create purchase record
  INSERT INTO purchased_content (
    user_id,
    content_id,
    content_type,
    price_paid
  ) VALUES (
    p_buyer_user_id,
    p_content_id,
    p_content_type,
    p_price_in_credits
  ) RETURNING id INTO v_purchase_id;

  -- Create transaction record for buyer
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    currency,
    description,
    status,
    metadata
  ) VALUES (
    p_buyer_user_id,
    'credit_usage',
    0,
    -p_price_in_credits,
    'USD',
    'Purchased ' || p_content_type || ': ' || p_content_id,
    'completed',
    jsonb_build_object(
      'content_id', p_content_id,
      'content_type', p_content_type,
      'purchased_credits_used', v_purchased_credits_used,
      'earned_credits_used', v_earned_credits_used,
      'purchase_id', v_purchase_id
    )
  );

  -- Add credits to creator (all as earned credits)
  UPDATE user_profiles
  SET credits = COALESCE(credits, 0) + p_price_in_credits
  WHERE id = p_creator_user_id;

  -- Create transaction record for creator
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    currency,
    description,
    status,
    metadata
  ) VALUES (
    p_creator_user_id,
    'credit_earning',
    0,
    p_price_in_credits,
    'USD',
    'Earned from ' || p_content_type || ' purchase',
    'completed',
    jsonb_build_object(
      'content_id', p_content_id,
      'content_type', p_content_type,
      'buyer_id', p_buyer_user_id,
      'purchase_id', v_purchase_id
    )
  );

  -- Create notification for creator
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read
  ) VALUES (
    p_creator_user_id,
    'Content Purchased!',
    'Someone purchased your ' || p_content_type || ' for ' || p_price_in_credits || ' credits.',
    'success',
    false
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update transfer_credits_to_fiat_balance function to only allow conversion of earned credits
CREATE OR REPLACE FUNCTION transfer_credits_to_fiat_balance(
  p_user_id UUID,
  p_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_earned_credits INTEGER;
  v_fiat_amount NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Check if credits amount is valid
  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be greater than zero';
  END IF;

  -- Get user's earned credits
  SELECT credits INTO v_user_earned_credits
  FROM user_profiles
  WHERE id = p_user_id;

  -- Check if user has enough earned credits
  IF v_user_earned_credits IS NULL OR v_user_earned_credits < p_credits THEN
    RAISE EXCEPTION 'Insufficient earned credits for conversion. You have % earned credits but requested to convert %.', 
      v_user_earned_credits, p_credits;
  END IF;

  -- Convert credits to fiat (1 credit = $1)
  v_fiat_amount := p_credits;

  -- Update user profile
  UPDATE user_profiles
  SET 
    credits = credits - p_credits,
    fiat_balance = COALESCE(fiat_balance, 0) + v_fiat_amount
  WHERE id = p_user_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    currency,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    'credit_to_fiat_conversion',
    v_fiat_amount,
    -p_credits,
    'USD',
    'Converted ' || p_credits || ' credits to $' || v_fiat_amount || ' cash balance',
    'completed',
    jsonb_build_object(
      'conversion_rate', 1,
      'earned_credits_used', p_credits
    )
  )
  RETURNING id INTO v_transaction_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read
  ) VALUES (
    p_user_id,
    'Credits Converted to Cash',
    'You have successfully converted ' || p_credits || ' credits to $' || v_fiat_amount || ' in your cash balance.',
    'success',
    false
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_withdrawal_with_paypal function to enforce $50 minimum withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal_with_paypal(
  p_user_id UUID,
  p_amount NUMERIC,
  p_paypal_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance NUMERIC;
  v_fee_amount NUMERIC;
  v_net_amount NUMERIC;
  v_min_withdrawal_amount NUMERIC := 50.0; -- Minimum withdrawal amount
BEGIN
  -- Check if withdrawal amount meets minimum requirement
  IF p_amount < v_min_withdrawal_amount THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $%. Your requested amount is $%.', 
      v_min_withdrawal_amount, p_amount;
  END IF;

  -- Get current fiat balance
  SELECT fiat_balance INTO v_current_balance
  FROM user_profiles
  WHERE id = p_user_id;

  -- Check if user has sufficient balance
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance for withdrawal. Your balance is $% but you requested $%.', 
      v_current_balance, p_amount;
  END IF;

  -- Calculate fee (15%)
  v_fee_amount := p_amount * 0.15;
  v_net_amount := p_amount - v_fee_amount;

  -- Update user's fiat balance
  UPDATE user_profiles
  SET fiat_balance = fiat_balance - p_amount
  WHERE id = p_user_id;

  -- Create withdrawal transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    credits,
    currency,
    description,
    status,
    withdrawal_method,
    withdrawal_details,
    metadata
  ) VALUES (
    p_user_id,
    'withdrawal',
    p_amount,
    0,
    'USD',
    'Withdrawal request for $' || p_amount::TEXT || ' (net: $' || v_net_amount::TEXT || ' after 15% fee)',
    'pending',
    'paypal',
    jsonb_build_object('paypal_email', p_paypal_email),
    jsonb_build_object(
      'gross_amount', p_amount,
      'fee_amount', v_fee_amount,
      'net_amount', v_net_amount
    )
  );

  -- Create notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read
  ) VALUES (
    p_user_id,
    'Withdrawal Requested',
    'Your withdrawal request for $' || p_amount || ' has been submitted. You will receive $' || v_net_amount || ' after fees.',
    'info',
    false
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION purchase_content(UUID, UUID, UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION transfer_credits_to_fiat_balance(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION process_withdrawal_with_paypal(UUID, NUMERIC, TEXT) TO authenticated;