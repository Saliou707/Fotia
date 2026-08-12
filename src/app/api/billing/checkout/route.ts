import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'
import { defaultPaymentProvider } from '@/lib/payment-provider'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

// Prix en GNF (Francs Guinéens) — Mode Test Production
const PLAN_PRICE_GNF: Record<string, number> = {
  pro: 1000,
}

export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: { plan?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { plan, phone } = body

  if (!plan || !PLAN_PRICE_GNF[plan]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return NextResponse.json(
      { error: 'Numéro de téléphone requis (format international, ex: 00224623707722)' },
      { status: 400 }
    )
  }

  // Le renouvellement anticipé est autorisé : un utilisateur déjà Pro peut
  // relancer un paiement avant expiration. La nouvelle échéance prolongera
  // la période en cours (computeExpiryDate — voir webhook / verify-subscription).

  // Idempotence : vérifier qu'un paiement pending n'existe pas déjà
  const { data: existingPending } = await supabase
    .from('subscriptions')
    .select('id, provider_payment_id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .eq('provider', 'djomy')
    .maybeSingle()

  if (existingPending) {
    logger.log('[Checkout] Pending subscription found, returning existing reference')
    // Retourner une URL de paiement existante si disponible
    if (existingPending.provider_payment_id) {
      return NextResponse.json({
        message: 'Un paiement est déjà en attente.',
        transaction_id: existingPending.provider_payment_id,
      })
    }
  }

  const amount = PLAN_PRICE_GNF[plan]
  const reference = `SUB_${generateId(16)}`
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  const returnUrl = `${appUrl}/billing/success?ref=${reference}`
  const cancelUrl  = `${appUrl}/billing/failed`

  logger.log(`[Checkout] Initiating payment — user: ${user.id}, plan: ${plan}, amount: ${amount} GNF`)

  try {
    // 1. Créer un abonnement en attente dans Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan,
        status: 'pending',
        provider: 'djomy',
        provider_reference: reference,
        billing_cycle: 'monthly',
      })
      .select('id')
      .single()

    if (subError) {
      logger.error('[Checkout] Subscription insert error:', subError.message)
      throw subError
    }

    // Clean phone number for Djomy (remove +224 / 00224 and spaces)
    let cleanPhone = phone.trim().replace(/\s+/g, '')
    if (cleanPhone.startsWith('+224')) cleanPhone = cleanPhone.slice(4)
    if (cleanPhone.startsWith('00224')) cleanPhone = cleanPhone.slice(5)

    // 2. Initier le paiement via le payment provider (Djomy)
    const { checkoutUrl, providerTransactionId } = await defaultPaymentProvider.createCheckout({
      amount,
      currency: 'GNF',
      countryCode: 'GN',
      payerPhone: cleanPhone,
      description: `Abonnement mensuel Fotia Premium ${plan}`,
      merchantReference: reference,
      returnUrl,
      cancelUrl,
      metadata: {
        subscription_id: subscription.id,
        user_id: user.id,
        plan,
      },
    })

    // 3. Stocker le transactionId dans l'abonnement
    await supabase
      .from('subscriptions')
      .update({ provider_payment_id: providerTransactionId })
      .eq('id', subscription.id)

    logger.log(`[Checkout] ✅ Payment initiated — txId: ${providerTransactionId.slice(0, 8)}…, ref: ${reference.slice(0, 12)}…`)

    return NextResponse.json({
      checkout_url: checkoutUrl,
      transaction_id: providerTransactionId,
      reference,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    logger.error('[Checkout] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
