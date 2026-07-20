import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { defaultPaymentProvider } from '@/lib/payment-provider'

/**
 * Djomy Webhook Handler — Production-ready
 *
 * Sécurité :
 *  - Validation de signature HMAC (X-Webhook-Signature: v1:<hex>)
 *  - Vérification serveur du statut de paiement (ne jamais faire confiance au webhook seul)
 *  - Idempotence : chaque eventId est enregistré dans webhook_events
 *  - Guard contre re-traitement d'un abonnement déjà actif
 *
 * Événements traités :
 *  - payment.success / payment.completed / payment.captured → activer abonnement
 *  - payment.failed / payment.cancelled → marquer comme failed
 *  - Tous les autres → 200 silencieux
 */

const SUCCESS_EVENTS = new Set(['payment.success', 'payment.completed', 'payment.captured'])
const FAILURE_EVENTS = new Set(['payment.failed', 'payment.cancelled'])

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // En-tête de signature Djomy
  const signatureHeader =
    request.headers.get('x-webhook-signature') ||
    request.headers.get('X-Webhook-Signature') ||
    ''

  console.log('[Djomy Webhook] Received event')

  // ── 1. Validation de la configuration ───────────────────────────────────
  const webhookSecret =
    process.env.DJOMY_WEBHOOK_SECRET ||
    process.env.DJOMY_CLIENT_SECRET ||
    ''

  if (!webhookSecret) {
    console.error('[Djomy Webhook] CRITICAL: No webhook secret configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (!signatureHeader) {
    console.warn('[Djomy Webhook] Missing X-Webhook-Signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // ── 2. Vérification signature ────────────────────────────────────────────
  const isValid = defaultPaymentProvider.verifyWebhookSignature(rawBody, signatureHeader)
  if (!isValid) {
    console.error('[Djomy Webhook] Invalid signature:', signatureHeader.substring(0, 20))
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── 3. Parse du payload ──────────────────────────────────────────────────
  let payload: {
    eventType?: string
    eventId?: string
    message?: string
    data?: {
      transactionId?: string
      status?: string
      merchantPaymentReference?: string
      paidAmount?: number
      receivedAmount?: number
      currency?: string
    }
    metadata?: Record<string, unknown>
    paymentLinkReference?: string
    timestamp?: string
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[Djomy Webhook] Invalid JSON payload')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType     = payload.eventType || ''
  const eventId       = payload.eventId   || ''
  const data          = payload.data      || {}
  const transactionId = data.transactionId || ''
  const reference     = data.merchantPaymentReference || payload.paymentLinkReference || ''

  console.log('[Djomy Webhook] Event:', { eventType, eventId, transactionId, reference })

  // ── 4. Ignorer les événements non-paiement ───────────────────────────────
  const isSuccessEvent = SUCCESS_EVENTS.has(eventType)
  const isFailureEvent = FAILURE_EVENTS.has(eventType)

  if (!isSuccessEvent && !isFailureEvent) {
    console.log('[Djomy Webhook] Ignored event type:', eventType)
    return NextResponse.json({ received: true })
  }

  // ── 5. Filtre : uniquement les références abonnement (SUB_) ─────────────
  if (!reference.startsWith('SUB_')) {
    console.log('[Djomy Webhook] Non-subscription reference, ignored:', reference)
    return NextResponse.json({ received: true })
  }

  if (!transactionId) {
    console.error('[Djomy Webhook] Missing transactionId')
    return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── 6. Idempotence — vérifier si l'eventId a déjà été traité ────────────
  if (eventId) {
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('provider', 'djomy')
      .eq('event_id', eventId)
      .maybeSingle()

    if (existingEvent) {
      console.log('[Djomy Webhook] Duplicate eventId, already processed:', eventId)
      return NextResponse.json({ received: true, already_processed: true })
    }

    // Enregistrer l'eventId pour éviter le rejeu
    await supabase.from('webhook_events').insert({
      provider: 'djomy',
      event_id: eventId,
      event_type: eventType,
      payload,
    }).then(({ error }) => {
      if (error) console.warn('[Djomy Webhook] webhook_events insert error:', error.message)
    })
  }

  try {
    // ── 7. Vérification serveur via l'API Djomy ──────────────────────────
    const verified = await defaultPaymentProvider.verifyPayment(transactionId)
    const isSuccess = verified.status === 'success'

    console.log('[Djomy Webhook] Server verification:', { status: verified.status, isSuccess })

    // ── 8. Trouver l'abonnement ──────────────────────────────────────────
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status')
      .eq('provider_reference', reference)
      .single()

    if (subError || !sub) {
      console.error('[Djomy Webhook] Subscription not found for reference:', reference)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Guard idempotence abonnement
    if (sub.status === 'active' && isSuccess) {
      console.log('[Djomy Webhook] Subscription already active, ignoring duplicate')
      return NextResponse.json({ received: true, already_processed: true })
    }

    const finalStatus = isSuccess ? 'active' : 'failed'
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    // ── 9. Enregistrer le paiement ───────────────────────────────────────
    const { error: payErr } = await supabase.from('payments').insert({
      user_id:             sub.user_id,
      subscription_id:     sub.id,
      amount:              verified.paidAmount,
      currency:            verified.currency || 'GNF',
      provider:            'djomy',
      provider_reference:  reference,
      provider_payment_id: transactionId,
      status:              isSuccess ? 'success' : 'failed',
    })

    if (payErr) {
      console.error('[Djomy Webhook] payments insert error:', payErr.message)
      // Non-bloquant : on continue pour mettre à jour l'abonnement
    }

    // ── 10. Mettre à jour l'abonnement ───────────────────────────────────
    const { error: subUpdateErr } = await supabase
      .from('subscriptions')
      .update({
        status:              finalStatus,
        provider_payment_id: transactionId,
        started_at:          isSuccess ? now.toISOString() : null,
        expires_at:          isSuccess ? expiresAt.toISOString() : null,
        updated_at:          now.toISOString(),
      })
      .eq('id', sub.id)

    if (subUpdateErr) throw subUpdateErr

    // ── 11. Mettre à jour le profil utilisateur ──────────────────────────
    const finalPlan = isSuccess ? 'pro' : 'free'
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ plan: finalPlan, updated_at: now.toISOString() })
      .eq('id', sub.user_id)

    if (profileErr) throw profileErr

    console.log(
      `[Djomy Webhook] ✅ Sub ${finalStatus} — plan ${finalPlan} — user: ${sub.user_id}`
    )

    // ── 12. Email de confirmation si succès ──────────────────────────────
    if (isSuccess) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', sub.user_id)
        .single()

      if (userProfile?.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'payment-success',
            to: userProfile.email,
            userId: sub.user_id,
            data: {
              userName: userProfile.display_name || userProfile.email.split('@')[0],
              plan: finalPlan,
              amount: verified.paidAmount,
              currency: verified.currency || 'GNF',
              expiresAt: expiresAt.toISOString(),
            },
          },
        }).catch(err => console.error('[Djomy Webhook] Email send failed:', err))
      }
    }

    return NextResponse.json({ success: true, status: finalStatus })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[Djomy Webhook Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
