import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyDjomyWebhookSignature, verifyDjomyPayment } from '@/lib/djomy'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Header Djomy : X-Webhook-Signature: v1:<hex>
  const signatureHeader =
    request.headers.get('x-webhook-signature') ||
    request.headers.get('X-Webhook-Signature') ||
    ''

  console.log('[Djomy Webhook] Received')

  // 1. Vérification de la signature (format v1:<hex>)
  const webhookSecret =
    process.env.DJOMY_WEBHOOK_SECRET ||
    process.env.DJOMY_CLIENT_SECRET ||
    ''

  if (webhookSecret) {
    if (!signatureHeader) {
      console.error('[Djomy Webhook] Missing X-Webhook-Signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const valid = verifyDjomyWebhookSignature(rawBody, signatureHeader)
    if (!valid) {
      console.error('[Djomy Webhook] Signature invalide:', signatureHeader)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.warn('[Djomy Webhook] Aucun secret configuré — vérification de signature désactivée')
  }

  // 2. Parse du payload
  let payload: {
    eventType?: string
    eventId?: string
    message?: string
    data?: {
      transactionId?: string
      status?: string
      merchantPaymentReference?: string
      paidAmount?: number
      currency?: string
    }
    metadata?: Record<string, unknown>
    paymentLinkReference?: string
    timestamp?: string
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[Djomy Webhook] Payload JSON invalide')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType      = payload.eventType || ''
  const data           = payload.data || {}
  const transactionId  = data.transactionId || ''
  const reference      = data.merchantPaymentReference || payload.paymentLinkReference || ''

  console.log('[Djomy Webhook] Event:', { eventType, transactionId, reference })

  // 3. On ne traite que payment.success — retourner 200 pour tous les autres
  if (eventType !== 'payment.success') {
    console.log('[Djomy Webhook] Événement ignoré (non-success):', eventType)
    return NextResponse.json({ received: true })
  }

  if (!reference.startsWith('SUB_')) {
    console.log('[Djomy Webhook] Référence non-abonnement. Ignoré.')
    return NextResponse.json({ received: true })
  }

  if (!transactionId) {
    console.error('[Djomy Webhook] transactionId manquant')
    return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    // 4. Vérification côté serveur via verify_payment (ne jamais faire confiance au webhook seul)
    const verified = await verifyDjomyPayment(transactionId)
    const isSuccess = verified.status === 'SUCCESS'

    console.log('[Djomy Webhook] Verification result:', { status: verified.status, isSuccess })

    // 5. Trouver l'abonnement en attente
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status')
      .eq('provider_reference', reference)
      .single()

    if (subError || !sub) {
      console.error('[Djomy Webhook] Abonnement introuvable pour la référence:', reference)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const finalStatus = isSuccess ? 'active' : 'failed'

    // 6. Enregistrer le paiement dans l'historique
    const { error: payErr } = await supabase.from('payments').insert({
      user_id:             sub.user_id,
      subscription_id:     sub.id,
      amount:              verified.receivedAmount || verified.paidAmount,
      currency:            'GNF',
      provider:            'djomy',
      provider_reference:  reference,
      provider_payment_id: transactionId,
      status:              isSuccess ? 'success' : 'failed',
    })

    if (payErr) {
      console.error('[Djomy Webhook] Erreur insertion paiement:', payErr)
    }

    // 7. Mettre à jour l'abonnement
    const now       = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

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

    // 8. Mettre à jour le plan utilisateur
    const finalPlan = isSuccess ? 'pro' : 'free'
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ plan: finalPlan, updated_at: now.toISOString() })
      .eq('id', sub.user_id)

    if (profileErr) throw profileErr

    console.log(
      `[Djomy Webhook] ✅ Abonnement ${finalStatus}, plan ${finalPlan} pour user ${sub.user_id}`
    )

    return NextResponse.json({ success: true, status: finalStatus })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[Djomy Webhook Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
