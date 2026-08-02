import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { defaultPaymentProvider } from '@/lib/payment-provider'

/**
 * Vérification et activation d'abonnement côté succès (fallback webhook).
 *
 * Appelée par la page /billing/success?ref=SUB_xxxx après redirection Djomy.
 * Vérifie le statut du paiement auprès de Djomy et active l'abonnement si succès.
 * Idempotent : peut être appelée plusieurs fois sans effet de bord.
 */
export async function POST(request: NextRequest) {
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

  console.log(`[VerifySubscription] Checking ref: ${ref} for user: ${user.id}`)

  try {
    // 1. Trouver l'abonnement
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, provider_payment_id')
      .eq('provider_reference', ref)
      .maybeSingle()

    if (subError || !sub) {
      console.error('[VerifySubscription] Subscription not found:', ref)
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }

    // Vérifier que l'abonnement appartient bien à l'utilisateur connecté
    if (sub.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // 2. Si déjà actif, retourner succès immédiatement (idempotence)
    if (sub.status === 'active') {
      console.log('[VerifySubscription] Subscription already active')
      return NextResponse.json({ success: true, status: 'active', already_active: true })
    }

    // 3. Si pas de transactionId, on ne peut pas vérifier
    if (!sub.provider_payment_id) {
      console.error('[VerifySubscription] No provider_payment_id for subscription:', sub.id)
      return NextResponse.json({ error: 'Aucune transaction associée' }, { status: 400 })
    }

    // 4. Vérifier le statut du paiement auprès de Djomy
    const verified = await defaultPaymentProvider.verifyPayment(sub.provider_payment_id)
    const isSuccess = verified.status === 'success'

    console.log('[VerifySubscription] Djomy verification:', {
      status: verified.status,
      isSuccess,
      txId: sub.provider_payment_id,
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
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subUpdateErr } = await supabase
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

    // 7. Enregistrer le paiement (si pas déjà fait par le webhook)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_payment_id', sub.provider_payment_id)
      .maybeSingle()

    if (!existingPayment) {
      await supabase.from('payments').insert({
        user_id: user.id,
        subscription_id: sub.id,
        amount: verified.paidAmount,
        currency: verified.currency || 'GNF',
        provider: 'djomy',
        provider_reference: ref,
        provider_payment_id: sub.provider_payment_id,
        status: 'success',
      }).then(({ error }) => {
        if (error) console.warn('[VerifySubscription] payments insert error:', error.message)
      })
    }

    console.log(`[VerifySubscription] ✅ Activated — user: ${user.id}, plan: pro`)

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
      }).catch(err => console.error('[VerifySubscription] Email send failed:', err))
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      plan: 'pro',
      expires_at: expiresAt.toISOString(),
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[VerifySubscription] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
