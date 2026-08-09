import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    // If there is any auth error (expired/invalid refresh token), redirect to login
    if (error) {
      logger.warn('[DashboardLayout] Auth error:', error.message)
      redirect('/login?error=session_expired')
    }

    user = data.user
  } catch (err: unknown) {
    // redirect() de Next.js lance une erreur interne dont le digest commence par
    // 'NEXT_REDIRECT'. Il faut la relancer pour que Next.js puisse la traiter
    // correctement — sinon elle est loggée comme erreur inattendue et la
    // redirection est absorbée silencieusement.
    if (
      err !== null &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }
    logger.error('[DashboardLayout] Unexpected auth error:', err)
    redirect('/login?error=session_expired')
  }

  if (!user) redirect('/login')

  // Récupérer le profil depuis la table profiles
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, plan, storage_used_bytes, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile && profile.onboarding_completed === false) {
    redirect('/onboarding')
  }

  const userName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Utilisateur'
  let plan = profile?.plan ?? 'free'
  const storageUsed = profile?.storage_used_bytes ?? 0

  // Vérifier l'abonnement actif : si le plan est pro, on vérifie aussi la subscription
  // et on downgrade en DB si l'abonnement a expiré (pas juste cosmétique)
  if (plan === 'pro') {
    try {
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const isExpired = !activeSub || (activeSub.expires_at && new Date(activeSub.expires_at) < new Date())

      if (isExpired) {
        logger.log(`[DashboardLayout] Pro subscription expired/missing for user ${user.id}, downgrading to free`)

        // Downgrade en base : profil → free (la RLS le permet : "Users can update own profile")
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ plan: 'free', updated_at: new Date().toISOString() })
          .eq('id', user.id)

        if (profileErr) {
          logger.warn('[DashboardLayout] Failed to downgrade profile:', profileErr.message)
        }

        // Meilleur effort : marquer la subscription comme expirée via admin client
        // (la RLS standard bloque l'UPDATE sur subscriptions pour les users normaux)
        try {
          const adminClient = createAdminClient()
          if (activeSub) {
            await adminClient.from('subscriptions').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('id', activeSub.id)
          }
        } catch {
          // Non-bloquant : le profil downgrade est l'essentiel
        }

        plan = 'free'
      }
    } catch (err) {
      // Non-bloquant : si la vérification d'abonnement échoue, on garde le plan tel quel
      logger.error('[DashboardLayout] Subscription check failed:', err)
    }
  }

  // Compteur de la jauge sidebar : brouillons + actives (les archivées ne comptent pas)
  const { count: galleryCount } = await supabase
    .from('galleries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['draft', 'active'])

  const adminUser = await getAdminUser()
  const isAdmin = !!adminUser

  return (
    <DashboardShell profile={{ name: userName, email: user.email ?? '', plan, storageUsed, galleryCount: galleryCount || 0 }} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  )
}