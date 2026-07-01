import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

const PAYLIV_WEBHOOK_SECRET = process.env.PAYLIV_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  console.log('[Payliv Webhook] Received webhook call')

  // 1. Signature Verification (if webhook secret is configured)
  if (PAYLIV_WEBHOOK_SECRET) {
    const receivedSignature = request.headers.get('x-webhook-signature') || ''

    const computedSignature = crypto
      .createHmac('sha256', PAYLIV_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

    if (receivedSignature && computedSignature !== receivedSignature) {
      console.error('[Payliv Webhook] Signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  // 2. Parse Webhook Payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[Payliv Webhook] Failed to parse JSON:', err)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Payliv webhook structure:
  // event: "payment.success" | "payment.pending" | "payment.failed"
  // payment_id, short_code, amount, currency, net_amount, fees, status, is_paid
  // customer: { name, phone, email, country }
  // metadata: { subscription_id, user_id, reference }
  const event = payload.event || ''
  const paymentId = payload.payment_id || payload.short_code || ''
  const shortCode = payload.short_code || ''
  const amount = Number(payload.amount || 0)
  const netAmount = Number(payload.net_amount || 0)
  const fees = Number(payload.fees || 0)
  const currency = payload.currency || 'XOF'
  const isPaid = payload.is_paid === true
  const paymentStatus = payload.status || ''
  const metadata = payload.metadata || {}
  const reference = metadata.reference || ''

  console.log('[Payliv Webhook] Details:', { event, paymentId, shortCode, amount, currency, isPaid, reference })

  // Only process subscription-related references
  if (!reference || !reference.startsWith('SUB_')) {
    console.log('[Payliv Webhook] Reference does not match subscription prefix. Skipping.')
    return NextResponse.json({ received: true })
  }

  // Skip pending events — only process success/failed
  if (event === 'payment.pending') {
    console.log('[Payliv Webhook] Payment pending, acknowledging.')
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  try {
    // 3. Find the pending subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status')
      .eq('provider_reference', reference)
      .single()

    if (subError || !sub) {
      console.error('[Payliv Webhook] Subscription not found for reference:', reference, subError)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Avoid re-processing already completed subscriptions
    if (sub.status === 'active' && event === 'payment.success') {
      console.log('[Payliv Webhook] Subscription already active, ignoring duplicate.')
      return NextResponse.json({ received: true, already_processed: true })
    }

    const isSuccess = event === 'payment.success' || (isPaid && paymentStatus === 'completed')
    const finalStatus = isSuccess ? 'active' : 'failed'

    // 4. Record payment in payments history
    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        amount: amount,
        currency: currency,
        provider: 'payliv',
        provider_reference: reference,
        provider_payment_id: paymentId,
        status: isSuccess ? 'success' : 'failed'
      })

    if (payErr) {
      console.error('[Payliv Webhook] Failed to insert payment record:', payErr)
    }

    // 5. Update subscription record
    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month subscription cycle

    const { error: updateSubErr } = await supabase
      .from('subscriptions')
      .update({
        status: finalStatus,
        provider_payment_id: paymentId,
        started_at: isSuccess ? now.toISOString() : null,
        expires_at: isSuccess ? expiresAt.toISOString() : null,
        updated_at: now.toISOString()
      })
      .eq('id', sub.id)

    if (updateSubErr) {
      console.error('[Payliv Webhook] Failed to update subscription status:', updateSubErr)
      throw updateSubErr
    }

    // 6. Update user's profile plan
    const finalPlan = isSuccess ? 'pro' : 'free'
    const { error: updateProfileErr } = await supabase
      .from('profiles')
      .update({
        plan: finalPlan,
        updated_at: now.toISOString()
      })
      .eq('id', sub.user_id)

    if (updateProfileErr) {
      console.error('[Payliv Webhook] Failed to update profile plan:', updateProfileErr)
      throw updateProfileErr
    }

    console.log(`[Payliv Webhook] ✅ Subscription updated to "${finalStatus}", plan set to "${finalPlan}" for user ${sub.user_id}`)

    return NextResponse.json({ success: true, status: finalStatus })

  } catch (err: any) {
    console.error('[Payliv Webhook Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
