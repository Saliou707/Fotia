import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateId } from '@/lib/utils'
import { createDjomyGatewayPayment, type DjomyPaymentMethod } from '@/lib/djomy'

// Prix en GNF
const PLAN_PRICE_GNF = 90000

// Map des méthodes de paiement supportées par Djomy
const DJOMY_METHODS: Record<string, DjomyPaymentMethod> = {
  orange_money: 'OM',
  mtn_momo:     'MOMO',
  om:           'OM',
  momo:         'MOMO',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { plan, phone, country, provider } = body

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

  // Résoudre le code pays Djomy (ISO alpha-2)
  const countryCode = (country || 'GN').toUpperCase()

  // Résoudre la méthode de paiement Djomy si fournie
  const djomyMethod = provider ? DJOMY_METHODS[provider.toLowerCase()] : undefined
  const allowedMethods: DjomyPaymentMethod[] | undefined = djomyMethod ? [djomyMethod] : undefined

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
    const djomyData = await createDjomyGatewayPayment({
      amount: PLAN_PRICE_GNF,
      countryCode,
      payerNumber: phone,
      ...(allowedMethods && { allowedPaymentMethods: allowedMethods }),
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

    // 4. Retourner checkout_url et transaction_id
    const checkout_url = djomyData.redirectUrl || djomyData.paymentUrl
    if (!checkout_url) {
      throw new Error('Djomy n\'a pas retourné d\'URL de redirection')
    }

    return NextResponse.json({
      checkout_url,
      transaction_id: djomyData.transactionId,
      // On retourne aussi ces champs pour rétro-compatibilité UI
      type: 'redirect',
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[Billing Mobile Money Djomy Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
