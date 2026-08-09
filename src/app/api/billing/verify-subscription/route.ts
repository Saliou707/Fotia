import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { defaultPaymentProvider } from '@/lib/payment-provider'
import { verifyOrigin } from '@/lib/csrf'
import { computeExpiryDate, expireSupersededSubscriptions, fetchActiveSubscriptionExpiry } from '@/lib/subscription'
import { logger } from '@/lib/logger'

/**
 * Vérification et activation d'abonnement côté succès (fallback webhook).
 *
 * Appelée par la page /billing/success?ref=SUB_xxxx après redirection Djomy.
 * Vérifie le statut du paiement auprès de Djomy et active l'abonnement si succès.
 * Idempotent : peut être appelée plusieurs fois sans effet de bord.
 */
export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: { ref?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { ref } = body

  if (!ref || typeof ref !== 'string' || !ref.startsWith('SUB_')) {
    return NextResponse.json({ error: 'Référence invalide' }, { status: 400 })
  }

  logger.log(`[VerifySubscription] Checking ref: ${ref.slice(0, 12)}… for user: ${user.id}`)

  try {
    // 1. Trouver l'abonnement
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, expires_at, provider_payment_id')
      .eq('provider_reference', ref)
      .maybeSingle()

    if (subError || !sub) {
      logger.error('[VerifySubscription] Subscription not found:', ref.slice(0, 12))
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }

    // Vérifier que l'abonnement appartient bien à l'utilisateur connecté
    if (sub.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // 2. Si déjà actif, retourner succès immédiatement (idempotence)
    if (sub.status === 'active') {
      logger.log('[VerifySubscription] Subscription already active')
      return NextResponse.json({ success: true, status: 'active', already_active: true })
    }

    // 3. Si pas de transactionId, on ne peut pas vérifier
    if (!sub.provider_payment_id) {
      logger.error('[VerifySubscription] No provider_payment_id for subscription:', sub.id)
      return NextResponse.json({ error: 'Aucune transaction associée' }, { status: 400 })
    }

    // 4. Vérifier le statut du paiement auprès de Djomy
    const verified = await defaultPaymentProvider.verifyPayment(sub.provider_payment_id)
    const isSuccess = verified.status === 'success'

    logger.log('[VerifySubscription] Djomy verification:', {
      status: verified.status,
      isSuccess,
      txId: sub.provider_payment_id?.slice(0, 8),
    })

    if (!isSuccess) {
      return NextResponse.json({
        success: false,
        status: verified.status,
        message: 'Le paiement n\'a pas encore été confirmé par Djomy.',
      })
    }

    // 5. Activer l'abonnement
    const now = new Date()

    // Nouvelle échéance : prolonge depuis la période active en cours
    // (renouvellement sans perte de jours), sinon départ à aujourd'hui.
    const activeExpiry = await fetchActiveSubscriptionExpiry(supabase, user.id, sub.id)
    const expiresAt = computeExpiryDate(activeExpiry ?? sub.expires_at, now)

    // NB : la RLS ne permet pas à un utilisateur de mettre à jour sa propre
    // subscription → on utilise le client admin (service_role), comme le
    // webhook. La propriété a déjà été vérifiée plus haut (sub.user_id === user.id).
    const supabaseAdmin = createAdminClient()

    const { error: subUpdateErr } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', sub.id)

    if (subUpdateErr) throw subUpdateErr

    // 6. Mettre à jour le profil utilisateur
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ plan: 'pro', updated_at: now.toISOString() })
      .eq('id', user.id)

    if (profileErr) throw profileErr

    // 6b. Un seul abonnement actif : expirer les précédents (renouvellement)
    await expireSupersededSubscriptions(supabaseAdmin, user.id, sub.id)

    // 7. Enregistrer le paiement (si pas déjà fait par le webhook)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_payment_id', sub.provider_payment_id)
      .maybeSingle()

    if (!existingPayment) {
      // NB : la RLS ne permet pas aux utilisateurs d'insérer dans payments
      // (policy SELECT uniquement) → insertion via le client admin.
      await supabaseAdmin.from('payments').insert({
        user_id: user.id,
        subscription_id: sub.id,
        amount: verified.paidAmount,
        currency: verified.currency || 'GNF',
        provider: 'djomy',
        provider_reference: ref,
        provider_payment_id: sub.provider_payment_id,
        status: 'success',
      }).then(({ error }) => {
        if (error) logger.warn('[VerifySubscription] payments insert error:', error.message)
      })
    }

    logger.log(`[VerifySubscription] ✅ Activated — user: ${user.id}, plan: pro`)

    // 8. Envoyer l'email de confirmation (meilleur effort, non-bloquant)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .single()

    if (userProfile?.email) {
      supabase.functions.invoke('send-email', {
        body: {
          type: 'payment-success',
          to: userProfile.email,
          userId: user.id,
          data: {
            userName: userProfile.display_name || userProfile.email.split('@')[0],
            plan: 'pro',
            amount: verified.paidAmount,
            currency: verified.currency || 'GNF',
            expiresAt: expiresAt.toISOString(),
          },
        },
      }).catch(err => logger.error('[VerifySubscription] Email send failed:', err))
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      plan: 'pro',
      expires_at: expiresAt.toISOString(),
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    logger.error('[VerifySubscription] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
