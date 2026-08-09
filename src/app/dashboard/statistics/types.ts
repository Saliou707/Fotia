export interface Gallery {
  id: string
  title: string
  view_count: number
  favorite_count: number
  download_count: number
  photo_count: number
  created_at: string
  cover_image_url?: string
}

export interface Totals {
  views: number
  favorites: number
  downloads: number
  photos: number
}

export interface RecentEvent {
  gallery_id: string
  created_at: string
  galleries: { title: string } | null
}

export interface AnalyticsData {
  galleries: Gallery[]
  totals: Totals
  recentViews: RecentEvent[]
  recentFavorites: RecentEvent[]
}

export interface TimelineEvent {
  id: string
  type: 'view' | 'favorite'
  gallery_title: string
  created_at: string
}
