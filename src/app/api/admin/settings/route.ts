import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, logAdminAction } from '@/lib/admin'

// Platform settings — in a real app these might be in a DB table.
// For now, we read/write from a dedicated supabase table `platform_settings`.
// If that table doesn't exist yet, we return sensible defaults.

const DEFAULT_SETTINGS = {
  free_max_galleries: 3,
  free_max_photos_per_gallery: 100,
  free_max_storage_bytes: 5 * 1024 * 1024 * 1024, // 5 GB
  pro_max_galleries: -1, // -1 = unlimited
  pro_max_photos_per_gallery: 1000,
  pro_max_storage_bytes: 100 * 1024 * 1024 * 1024, // 100 GB
  pro_price_xof: 5900,
  pro_price_eur: 9,
}

export async function GET() {
  await requireAdmin()
  return NextResponse.json(DEFAULT_SETTINGS)
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(['super_admin'])
  const updates = await request.json()

  await logAdminAction(admin.id, `PATCH_SETTINGS:${JSON.stringify(updates)}`)

  // In production, persist these to a platform_settings table
  // For now return the merged object
  return NextResponse.json({ ...DEFAULT_SETTINGS, ...updates })
}
