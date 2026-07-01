import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'
import { createDjomyGatewayPayment } from '@/lib/djomy'

// Prix en GNF (Francs Guinéens)
// Ajustez selon votre tarification
const PLAN_PRICE_GNF = 90000 // ~9€ en GNF

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { plan, phone } = body

  if (plan !== 'pro') {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  if (!phone) {
    return NextResponse.json(
      { error: 'Numéro de téléphone requis (format international, ex: 00224623707722)' },
      { status: 400 }
    )
  }

  // Vérifier que l'utilisateur n'est pas déjà Pro
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'pro') {
    return NextResponse.json({ error: 'Vous êtes déjà sur le plan Premium Pro.' }, { status: 400 })
  }

  const reference = `SUB_${generateId(16)}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl = `${appUrl}/billing/success`
  const cancelUrl  = `${appUrl}/billing/failed`

  try {
    // 1. Créer un abonnement en attente dans Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: 'pro',
        status: 'pending',
        provider: 'djomy',
        provider_reference: reference,
        billing_cycle: 'monthly',
      })
      .select('id')
      .single()

    if (subError) throw subError

    // 2. Initier le paiement via Djomy Gateway (sandbox)
    // → Djomy gère la sélection du moyen de paiement et le flux OTP sur son portail
    const djomyData = await createDjomyGatewayPayment({
      amount: PLAN_PRICE_GNF,
      countryCode: 'GN',
      payerNumber: phone,
      description: `Abonnement mensuel Fotia Premium Pro — ${user.email}`,
      merchantPaymentReference: reference,
      returnUrl,
      cancelUrl,
      metadata: {
        subscription_id: subscription.id,
        user_id: user.id,
      },
    })

    // 3. Stocker le transactionId Djomy dans l'abonnement
    await supabase
      .from('subscriptions')
      .update({ provider_payment_id: djomyData.transactionId })
      .eq('id', subscription.id)

    // 4. Retourner l'URL de redirection Djomy
    const checkout_url = djomyData.redirectUrl || djomyData.paymentUrl
    if (!checkout_url) {
      throw new Error('Djomy n\'a pas retourné d\'URL de redirection')
    }

    return NextResponse.json({ checkout_url, transaction_id: djomyData.transactionId })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[Billing Checkout Djomy Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
