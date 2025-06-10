import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { provider, paymentData } = await req.json()

    // Verify the webhook signature (implement based on your payment provider)
    // This is crucial for security - verify the webhook is actually from PayPal/Creem.io
    
    if (provider === 'paypal') {
      // Handle PayPal IPN/Webhook
      const { payment_status, custom, mc_gross, txn_id } = paymentData
      
      if (payment_status === 'Completed') {
        // Extract user ID and amount from custom field
        const { userId, amount } = JSON.parse(custom)
        const credits = Math.floor(amount) // 1 credit = $1
        
        // Add credits to user account
        const { error } = await supabaseClient.rpc('add_credits_to_user', {
          p_user_id: userId,
          p_credits: credits,
          p_amount: amount,
          p_description: `Credit purchase via PayPal`,
          p_payment_method: 'PayPal',
          p_payment_id: txn_id
        })

        if (error) {
          console.error('Error adding credits:', error)
          return new Response('Error processing payment', { status: 500, headers: corsHeaders })
        }

        // Optionally send notification to user
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Credits Added!',
            message: `${credits} credits have been added to your account.`,
            type: 'success'
          })
      }
    } else if (provider === 'creem') {
      // Handle Creem.io webhook
      const { status, metadata, amount, transaction_id } = paymentData
      
      if (status === 'completed') {
        const { userId } = metadata
        const credits = Math.floor(amount) // 1 credit = $1
        
        // Add credits to user account
        const { error } = await supabaseClient.rpc('add_credits_to_user', {
          p_user_id: userId,
          p_credits: credits,
          p_amount: amount,
          p_description: `Credit purchase via Creem.io`,
          p_payment_method: 'Creem.io',
          p_payment_id: transaction_id
        })

        if (error) {
          console.error('Error adding credits:', error)
          return new Response('Error processing payment', { status: 500, headers: corsHeaders })
        }

        // Optionally send notification to user
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Credits Added!',
            message: `${credits} credits have been added to your account.`,
            type: 'success'
          })
      }
    }

    return new Response('Webhook processed successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', {
      headers: corsHeaders,
      status: 500,
    })
  }
})