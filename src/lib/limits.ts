import { SupabaseClient } from '@supabase/supabase-js'

export type PlanType = 'free' | 'pro' | 'studio'

export const PLAN_LIMITS = {
  free: {
    maxGalleries: 3,
    maxPhotosPerGallery: 100,
    maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5GB
  },
  pro: {
    maxGalleries: 999999, // Unlimited
    maxPhotosPerGallery: 1000,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100GB
  },
  studio: {
    maxGalleries: 999999, // Unlimited
    maxPhotosPerGallery: 10000,
    maxStorageBytes: 1000 * 1024 * 1024 * 1024, // 1TB
  }
}

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<PlanType> {
  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()
    
  return (data?.plan as PlanType) || 'free'
}

export async function checkCanCreateGallery(supabase: SupabaseClient, userId: string) {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]

  const { count } = await supabase
    .from('galleries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  if ((count ?? 0) >= limits.maxGalleries) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limits.maxGalleries} galeries actives pour le plan ${plan.toUpperCase()}.`,
      requiresUpgrade: true
    }
  }

  return { allowed: true }
}

export async function checkCanUploadPhoto(supabase: SupabaseClient, userId: string, galleryId: string, fileSizeAddBytes: number = 0) {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]

  // Check gallery photo count
  const { count: photoCount } = await supabase
    .from('gallery_images')
    .select('id', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)

  if ((photoCount ?? 0) >= limits.maxPhotosPerGallery) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limits.maxPhotosPerGallery} photos par galerie pour le plan ${plan.toUpperCase()}.`,
      requiresUpgrade: true
    }
  }

  // Check storage limit
  if (fileSizeAddBytes > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('id', userId)
      .single()
      
    const currentStorage = Number(profile?.storage_used_bytes ?? 0)
    if (currentStorage + fileSizeAddBytes > limits.maxStorageBytes) {
      return {
        allowed: false,
        reason: `Vous avez atteint la limite de stockage (${(limits.maxStorageBytes / 1e9).toFixed(1)}GB) pour le plan ${plan.toUpperCase()}.`,
        requiresUpgrade: true
      }
    }
  }

  return { allowed: true }
}
