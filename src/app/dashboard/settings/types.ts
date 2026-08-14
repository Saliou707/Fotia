export interface ProfileForm {
  name: string
  phone: string
  instagram: string
  facebook: string
  tiktok: string
  website: string
  bio: string
  avatarUrl: string
}

export type Plan = 'free' | 'pro' | 'studio'

export interface Subscription {
  expires_at: string
}

export interface BillingData {
  plan: Plan
  storageUsedBytes: number
  galleryCount: number
  subscription: Subscription | null
  hasUsedBeta?: boolean
}

export type NotifKey = 'newFav' | 'galleryView' | 'download' | 'weekly'
