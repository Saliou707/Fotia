import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'

const PAYLIV_API_URL = 'https://ivnvckgzkxxhowusxczt.supabase.co/functions/v1/api-payments-mobile-money'
const PAYLIV_SECRET_KEY = process.env.PAYLIV_SECRET_KEY || ''

const PLAN_PRICE_XOF = 5900 // 9€ equivalent in CFA

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan, phone, country, provider } = await request.json()

  if (plan !== 'pro') {
    return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
  }
  
  if (!phone || !country || !provider) {
    return NextResponse.json({ error: 'Phone, country and provider are required for direct payment' }, { status: 400 })
  }

  // Verify current plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'pro') {
    return NextResponse.json({ error: 'You are already on the Premium Pro plan.' }, { status: 400 })
  }

  const reference = `SUB_${generateId(16)}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const successUrl = `${appUrl}/billing/success`
  const cancelUrl = `${appUrl}/billing/failed`
  // Webhook URL — will be the ngrok URL in dev or the production URL
  const webhookUrl = `${appUrl}/api/webhooks/payliv`

  try {
    // 1. Create a pending subscription in Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: 'pro',
        status: 'pending',
        provider: 'payliv',
        provider_reference: reference,
        billing_cycle: 'monthly'
      })
      .select('id')
      .single()

    if (subError) throw subError

    // 2. Call Payliv API to initiate direct mobile money payment
    const paylivResponse = await fetch(PAYLIV_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYLIV_SECRET_KEY
      },
      body: JSON.stringify({
        amount: PLAN_PRICE_XOF,
        currency: 'XOF',
        phone: phone,
        country: country,
        provider: provider,
        fee_bearer: 'client',
        title: 'Abonnement Fotia Premium Pro',
        description: `Souscription mensuelle Premium Pro pour ${user.email}`,
        customer_name: user.user_metadata?.full_name || user.email,
        customer_email: user.email,
        success_url: successUrl,
        cancel_url: cancelUrl,
        webhook_url: webhookUrl,
        metadata: {
          subscription_id: subscription.id,
          user_id: user.id,
          reference: reference
        }
      })
    })

    if (!paylivResponse.ok) {
      const errText = await paylivResponse.text()
      console.error('[Payliv Direct] Failed to create payment:', errText)
      throw new Error('Failed to initiate direct payment with gateway')
    }

    const paylivData = await paylivResponse.json()
    console.log('[Payliv Direct] Payment initiated:', paylivData)

    // Update subscription with Payliv payment ID
    if (paylivData.id || paylivData.short_code) {
      await supabase
        .from('subscriptions')
        .update({
          provider_payment_id: paylivData.id || paylivData.short_code
        })
        .eq('id', subscription.id)
    }

    // Return the payliv response containing instructions, type, ussd_code, etc.
    return NextResponse.json(paylivData)

  } catch (err: any) {
    console.error('[Billing Checkout Direct Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
