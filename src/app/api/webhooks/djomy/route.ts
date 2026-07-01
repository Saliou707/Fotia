import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') || request.headers.get('X-Webhook-Signature')
  const webhookSecret = process.env.DJOMY_WEBHOOK_SECRET || ''

  console.log('[Djomy Webhook] Received webhook call')

  // 1. Signature Verification
  if (webhookSecret && !signature) {
    console.error('[Djomy Webhook] Missing signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (webhookSecret && signature) {
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (computedSignature !== signature) {
      console.error('[Djomy Webhook] Signature mismatch. Received:', signature, 'Computed:', computedSignature)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.log('[Djomy Webhook] Skipping signature check (secret not configured)')
  }

  // 2. Parse Webhook Payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[Djomy Webhook] Failed to parse raw body JSON:', err)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Support both nested structure (data.status, etc.) and flat structure
  const event = payload.event || (payload.data?.event) || 'payment.success'
  const data = payload.data || payload

  const status = (data.status || '').toUpperCase()
  const reference = data.reference || data.paymentLinkReference
  const transactionId = data.transactionId || data.id || 'N/A'
  const amount = Number(data.amount || 0)
  const currency = data.currency || 'XOF'

  console.log('[Djomy Webhook] Details:', { event, status, reference, transactionId, amount, currency })

  if (!reference) {
    console.error('[Djomy Webhook] Missing reference in payload')
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  // We only process subscription-related references
  if (!reference.startsWith('SUB_')) {
    console.log('[Djomy Webhook] Reference does not match subscription prefix. Skipping.')
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
      console.error('[Djomy Webhook] Subscription not found for reference:', reference, subError)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const isSuccess = status === 'SUCCESS' || event === 'payment.success'
    const finalStatus = isSuccess ? 'active' : 'failed'

    // 4. Record payment in payments history
    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        amount: amount,
        currency: currency,
        provider: 'djomy',
        provider_reference: reference,
        provider_payment_id: transactionId,
        status: isSuccess ? 'success' : 'failed'
      })

    if (payErr) {
      console.error('[Djomy Webhook] Failed to insert payment record:', payErr)
    }

    // 5. Update subscription record
    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month subscription cycle

    const { error: updateSubErr } = await supabase
      .from('subscriptions')
      .update({
        status: finalStatus,
        provider_payment_id: transactionId,
        started_at: isSuccess ? now.toISOString() : null,
        expires_at: isSuccess ? expiresAt.toISOString() : null,
        updated_at: now.toISOString()
      })
      .eq('id', sub.id)

    if (updateSubErr) {
      console.error('[Djomy Webhook] Failed to update subscription status:', updateSubErr)
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
      console.error('[Djomy Webhook] Failed to update profile plan:', updateProfileErr)
      throw updateProfileErr
    }

    console.log(`[Djomy Webhook] Successfully updated subscription to ${finalStatus} and plan to ${finalPlan} for user ${sub.user_id}`)

    return NextResponse.json({ success: true, status: finalStatus })

  } catch (err: any) {
    console.error('[Djomy Webhook Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
