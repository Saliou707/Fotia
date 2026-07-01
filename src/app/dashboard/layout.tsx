import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { getAdminUser } from '@/lib/admin'

export const dynamic = 'force-dynamic'


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    // If there is any auth error (expired/invalid refresh token), redirect to login
    if (error) {
      console.warn('[DashboardLayout] Auth error:', error.message)
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
    console.error('[DashboardLayout] Unexpected auth error:', err)
    redirect('/login?error=session_expired')
  }

  if (!user) redirect('/login')

  // Récupérer le profil depuis la table profiles
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan, storage_used_bytes, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile && profile.onboarding_completed === false) {
    redirect('/onboarding')
  }

  const userName = profile?.name ?? user.email?.split('@')[0] ?? 'Utilisateur'
  const plan = profile?.plan ?? 'free'
  const storageUsed = profile?.storage_used_bytes ?? 0

  const { count: galleryCount } = await supabase
    .from('galleries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const adminUser = await getAdminUser()
  const isAdmin = !!adminUser

  return (
    <DashboardShell profile={{ name: userName, email: user.email ?? '', plan, storageUsed, galleryCount: galleryCount || 0 }} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  )
}