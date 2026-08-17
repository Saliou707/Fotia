import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { verifyOrigin } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

// Route utilitaire (admin uniquement) : inspecter puis nettoyer les abonnements
// 'pending' (paiements Djomy abandonnés ou tests interrompus). La suppression
// ne touche QUE le statut 'pending' — jamais les abonnements actifs.
// Rate-limiting : couvert par le middleware racine (niveau 'moderate' sur /api).

// GET — lister les abonnements en attente (inspection avant nettoyage)
export async function GET() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan, status, provider, provider_reference, provider_payment_id, created_at, updated_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ totalCount: data?.length ?? 0, data })
}

// DELETE — supprimer tous les abonnements en attente
export async function DELETE(request: NextRequest) {
  const csrfError = verifyOrigin(request)
  if (csrfError) return csrfError

  const admin = await requireAdmin()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('status', 'pending')
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const deletedCount = data?.length ?? 0
  await logAdminAction(admin.id, `TEMP_CLEAN_PENDING:${deletedCount}`)

  return NextResponse.json({ success: true, deletedCount })
}
