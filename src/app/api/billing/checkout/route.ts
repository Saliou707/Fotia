import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'
import { defaultPaymentProvider } from '@/lib/payment-provider'
import { verifyOrigin } from '@/lib/csrf'
import { logger } from '@/lib/logger'

// Prix en GNF (Francs Guinéens)
const PLAN_PRICE_GNF_BETA = 20000
const PLAN_PRICE_GNF_REGULAR = 150000

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

  if (!plan || plan !== 'pro') {
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

  // Déterminer si l'utilisateur a déjà bénéficié de l'offre Bêta
  const { count: pastPaymentsCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'success')
    .limit(1)

  const hasUsedBeta = (pastPaymentsCount ?? 0) > 0
  const amount = hasUsedBeta ? PLAN_PRICE_GNF_REGULAR : PLAN_PRICE_GNF_BETA
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

    // Normaliser le numéro au format international attendu par Djomy (00224XXXXXXXXX).
    // Ex: "+224 620 00 00 00", "00224620000000" ou "620000000" → "00224620000000"
    let cleanPhone = phone.trim().replace(/[\s.\-()]/g, '')
    // Strip leading + or 00
    if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1)
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.slice(2)
    // Strip country code 224 if present
    if (cleanPhone.startsWith('224')) cleanPhone = cleanPhone.slice(3)
    // Now cleanPhone should be the local number (8-9 digits)
    // Reconstruct with 00224 prefix as required by Djomy
    cleanPhone = `00224${cleanPhone}`

    logger.log(`[Checkout] Phone normalized: ****${cleanPhone.slice(-4)}`)

    // Minimal sanity check: must be 00224 + 8 or 9 digits
    if (!/^00224\d{8,9}$/.test(cleanPhone)) {
      logger.warn(`[Checkout] Phone format rejected: ${cleanPhone}`)
      try {
        await supabase.from('subscriptions').delete().eq('id', subscription.id)
      } catch (cleanupErr) {
        logger.warn('[Checkout] Failed to clean pending subscription:', cleanupErr instanceof Error ? cleanupErr.message : cleanupErr)
      }
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Format attendu : +224 ou 00224 suivi du numéro (ex: +224620000000).' },
        { status: 400 }
      )
    }

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

    // Garde-fou : Djomy doit toujours renvoyer un transactionId
    if (!providerTransactionId) {
      throw new Error('[Djomy] Djomy did not return a transactionId')
    }

    // 3. Stocker le transactionId dans l'abonnement
    await supabase
      .from('subscriptions')
      .update({ provider_payment_id: providerTransactionId })
      .eq('id', subscription.id)

    logger.log(`[Checkout] ✅ Payment initiated — txId: ${providerTransactionId.slice(0, 8)}…, ref: ${reference.slice(0, 12)}…, phone: ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-2)}`)

    return NextResponse.json({
      checkout_url: checkoutUrl,
      transaction_id: providerTransactionId,
      reference,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    const stack = err instanceof Error ? err.stack : undefined
    // Toujours logger les erreurs en production pour pouvoir les diagnostiquer
    console.error('[Checkout] Error in production:', message, stack)
    logger.error('[Checkout] Error:', message)
    // En production, ne pas exposer les détails techniques au client
    const clientMessage = process.env.NODE_ENV === 'production'
      ? 'Erreur de paiement. Veuillez réessayer ou contacter le support.'
      : message
    return NextResponse.json({ error: clientMessage }, { status: 500 })
  }
}
