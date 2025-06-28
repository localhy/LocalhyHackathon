/*
  # Add PayPal withdrawal support

  1. New Columns
    - Add `paypal_email` to `user_profiles` table for storing PayPal email addresses
    - Add `withdrawal_method` and `withdrawal_details` to `transactions` table for withdrawal tracking

  2. Security
    - Maintain existing RLS policies
    - PayPal email is private and only accessible by the user

  3. Changes
    - Users can store their PayPal email for withdrawals
    - Withdrawal transactions include method and details
    - Manual status updates can be made by admins in Supabase
*/

-- Add PayPal email to user profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Add withdrawal tracking to transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS withdrawal_method TEXT,
ADD COLUMN IF NOT EXISTS withdrawal_details JSONB DEFAULT '{}';

-- Create index for withdrawal queries
CREATE INDEX IF NOT EXISTS idx_transactions_withdrawal_method 
ON public.transactions (withdrawal_method) 
WHERE withdrawal_method IS NOT NULL;

-- Update the processWithdrawal function to include PayPal details
CREATE OR REPLACE FUNCTION process_withdrawal_with_paypal(
  p_user_id UUID,
  p_amount NUMERIC,
  p_paypal_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance NUMERIC;
  v_fee_amount NUMERIC;
  v_net_amount NUMERIC;
BEGIN
  -- Get current fiat balance
  SELECT fiat_balance INTO v_current_balance
  FROM user_profiles
  WHERE id = p_user_id;

  -- Check if user has sufficient balance
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance for withdrawal';
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

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;