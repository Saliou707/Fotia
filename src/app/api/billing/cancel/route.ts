import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, provider_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) throw subError

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found to cancel' }, { status: 400 })
    }

    // Call Djomy API if provider_subscription_id exists and we need to notify them
    // For now we will update locally to 'canceled' and set user back to 'free' plan.
    const now = new Date().toISOString()
    
    const { error: updateSubErr } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: now
      })
      .eq('id', subscription.id)

    if (updateSubErr) throw updateSubErr

    const { error: updateProfileErr } = await supabase
      .from('profiles')
      .update({
        plan: 'free',
        updated_at: now
      })
      .eq('id', user.id)

    if (updateProfileErr) throw updateProfileErr

    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' })
  } catch (err: any) {
    console.error('[Subscription Cancel Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
