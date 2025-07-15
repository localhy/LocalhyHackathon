/*
  # Credit System Update with Free Credits and Transfers

  1. Schema Changes
    - Add `free_credits` column to `user_profiles` table
    - Update transaction types to support credit transfers
    - Create functions for credit transfers and improved referral job posting

  2. New Features
    - Free credits system (separate from cash credits)
    - Credit transfer functionality between users
    - Updated referral job posting to use free credits first
    - Bonus free credits for 100 credit package

  3. Security
    - All functions use SECURITY DEFINER for proper access control
    - Validation for credit transfers and sufficient balances
*/

-- Add free_credits column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS free_credits INTEGER DEFAULT 0;

-- Check if transaction_type enum exists and get current values
DO $$ 
DECLARE
    enum_exists BOOLEAN;
    has_transfer_sent BOOLEAN := FALSE;
    has_transfer_received BOOLEAN := FALSE;
BEGIN
    -- Check if the enum type exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'transaction_type' 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) INTO enum_exists;
    
    IF enum_exists THEN
        -- Check if the new values already exist
        SELECT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid FROM pg_type 
                WHERE typname = 'transaction_type' 
                AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            )
            AND enumlabel = 'credit_transfer_sent'
        ) INTO has_transfer_sent;
        
        SELECT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid FROM pg_type 
                WHERE typname = 'transaction_type' 
                AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            )
            AND enumlabel = 'credit_transfer_received'
        ) INTO has_transfer_received;
        
        -- Add new enum values if they don't exist
        IF NOT has_transfer_sent THEN
            ALTER TYPE public.transaction_type ADD VALUE 'credit_transfer_sent';
        END IF;
        
        IF NOT has_transfer_received THEN
            ALTER TYPE public.transaction_type ADD VALUE 'credit_transfer_received';
        END IF;
    ELSE
        -- If enum doesn't exist, we need to check the transactions table constraint
        -- and update it to include the new values
        
        -- First, let's see if there's a check constraint on the type column
        -- If so, we'll need to drop and recreate it
        
        -- Check if transactions table exists and has a type column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'type' 
            AND table_schema = 'public'
        ) THEN
            -- Drop existing check constraint if it exists
            ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
            
            -- Add new check constraint with all transaction types
            ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check 
            CHECK (type = ANY (ARRAY[
                'credit_purchase'::text, 
                'credit_usage'::text, 
                'withdrawal'::text, 
                'refund'::text, 
                'credit_earning'::text, 
                'credit_to_fiat_conversion'::text,
                'credit_transfer_sent'::text,
                'credit_transfer_received'::text
            ]));
        END IF;
    END IF;
END $$;

-- Create function to transfer credits between users
CREATE OR REPLACE FUNCTION transfer_user_credits(
  p_sender_id UUID,
  p_recipient_identifier TEXT, -- Email or user ID
  p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_credits INTEGER;
  v_transaction_id UUID;
  v_recipient_email TEXT;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than zero';
  END IF;

  -- Find recipient by email or ID
  BEGIN
    -- Try as UUID first
    v_recipient_id := p_recipient_identifier::UUID;
    
    -- Get recipient email for notification
    SELECT email INTO v_recipient_email
    FROM auth.users
    WHERE id = v_recipient_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- If not a valid UUID, try as email
    SELECT id, email INTO v_recipient_id, v_recipient_email
    FROM auth.users
    WHERE email = p_recipient_identifier;
  END;

  -- Check if recipient exists
  IF v_recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  -- Prevent self-transfers
  IF p_sender_id = v_recipient_id THEN
    RAISE EXCEPTION 'Cannot transfer credits to yourself';
  END IF;

  -- Check if sender has enough cash credits (only cash credits can be transferred)
  SELECT credits INTO v_sender_credits
  FROM user_profiles
  WHERE id = p_sender_id;

  IF v_sender_credits IS NULL OR v_sender_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient cash credits for transfer';
  END IF;

  -- Update sender's credits
  UPDATE user_profiles
  SET credits = credits - p_amount
  WHERE id = p_sender_id;

  -- Update recipient's credits
  UPDATE user_profiles
  SET credits = COALESCE(credits, 0) + p_amount
  WHERE id = v_recipient_id;

  -- Create transaction record for sender
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
    p_sender_id,
    'credit_transfer_sent',
    0,
    -p_amount,
    'USD',
    'Credit transfer sent to ' || COALESCE(v_recipient_email, 'user'),
    'completed',
    jsonb_build_object('recipient_id', v_recipient_id, 'recipient_email', v_recipient_email)
  )
  RETURNING id INTO v_transaction_id;

  -- Create transaction record for recipient
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
    v_recipient_id,
    'credit_transfer_received',
    0,
    p_amount,
    'USD',
    'Credit transfer received',
    'completed',
    jsonb_build_object('sender_id', p_sender_id, 'related_transaction_id', v_transaction_id)
  );

  -- Create notification for recipient
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read
  ) VALUES (
    v_recipient_id,
    'Credits Received!',
    'You have received ' || p_amount || ' credits from another user.',
    'success',
    false
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_referral_job_with_payment to use free_credits first
CREATE OR REPLACE FUNCTION create_referral_job_with_payment(
  p_user_id UUID,
  p_title TEXT,
  p_business_name TEXT,
  p_description TEXT,
  p_commission NUMERIC,
  p_commission_type TEXT,
  p_location TEXT,
  p_category TEXT,
  p_urgency TEXT DEFAULT 'medium',
  p_requirements TEXT DEFAULT NULL,
  p_referral_type TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_cta_text TEXT DEFAULT NULL,
  p_terms TEXT DEFAULT NULL,
  p_cost_credits INTEGER DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
  v_job_id UUID;
  v_free_credits INTEGER;
  v_cash_credits INTEGER;
  v_free_credits_used INTEGER := 0;
  v_cash_credits_used INTEGER := 0;
BEGIN
  -- Get user's credits
  SELECT COALESCE(free_credits, 0), COALESCE(credits, 0) 
  INTO v_free_credits, v_cash_credits
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough total credits
  IF (v_free_credits + v_cash_credits) < p_cost_credits THEN
    RAISE EXCEPTION 'Insufficient credits to post referral job. You need % credits but only have % total credits.', 
      p_cost_credits, (v_free_credits + v_cash_credits);
  END IF;
  
  -- Calculate how many free and cash credits to use
  IF v_free_credits >= p_cost_credits THEN
    -- Use only free credits
    v_free_credits_used := p_cost_credits;
  ELSE
    -- Use all available free credits and some cash credits
    v_free_credits_used := v_free_credits;
    v_cash_credits_used := p_cost_credits - v_free_credits_used;
  END IF;
  
  -- Create the referral job
  INSERT INTO referral_jobs (
    user_id,
    title,
    business_name,
    description,
    commission,
    commission_type,
    location,
    category,
    urgency,
    requirements,
    referral_type,
    logo_url,
    website,
    cta_text,
    terms
  ) VALUES (
    p_user_id,
    p_title,
    p_business_name,
    p_description,
    p_commission,
    p_commission_type,
    p_location,
    p_category,
    p_urgency,
    p_requirements,
    p_referral_type,
    p_logo_url,
    p_website,
    p_cta_text,
    p_terms
  ) RETURNING id INTO v_job_id;
  
  -- Update user's credits
  UPDATE user_profiles
  SET 
    free_credits = free_credits - v_free_credits_used,
    credits = credits - v_cash_credits_used
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
    'credit_usage',
    0,
    -p_cost_credits,
    'USD',
    'Posted referral job: ' || p_title,
    'completed',
    jsonb_build_object(
      'job_id', v_job_id,
      'free_credits_used', v_free_credits_used,
      'cash_credits_used', v_cash_credits_used
    )
  );
  
  RETURN jsonb_build_object(
    'id', v_job_id,
    'title', p_title,
    'business_name', p_business_name,
    'free_credits_used', v_free_credits_used,
    'cash_credits_used', v_cash_credits_used
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update add_credits_to_user to handle free credits for bonus
CREATE OR REPLACE FUNCTION add_credits_to_user(
  p_user_id UUID,
  p_credits INTEGER,
  p_amount NUMERIC,
  p_description TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_payment_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_free_credits INTEGER := 0;
  v_cash_credits INTEGER := p_credits;
  v_metadata JSONB;
BEGIN
  -- Check if this is the 100 credit package with 200 free credits
  IF p_credits = 100 THEN
    v_free_credits := 200;
    v_metadata := jsonb_build_object(
      'cash_credits', v_cash_credits,
      'free_credits', v_free_credits,
      'payment_id', p_payment_id,
      'bonus_applied', true
    );
  ELSE
    v_metadata := jsonb_build_object(
      'cash_credits', v_cash_credits,
      'payment_id', p_payment_id,
      'bonus_applied', false
    );
  END IF;

  -- Update user's credits
  UPDATE user_profiles
  SET 
    credits = COALESCE(credits, 0) + v_cash_credits,
    free_credits = COALESCE(free_credits, 0) + v_free_credits
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
    payment_method,
    payment_id,
    metadata
  ) VALUES (
    p_user_id,
    'credit_purchase',
    p_amount,
    p_credits,
    'USD',
    p_description,
    'completed',
    p_payment_method,
    p_payment_id,
    v_metadata
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
    'Credits Added!',
    CASE 
      WHEN v_free_credits > 0 THEN 
        p_credits || ' credits and ' || v_free_credits || ' free credits have been added to your account.'
      ELSE 
        p_credits || ' credits have been added to your account.'
    END,
    'success',
    false
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index on free_credits for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_free_credits 
ON public.user_profiles (free_credits);