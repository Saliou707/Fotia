'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Image, TrendingUp } from 'lucide-react'

// Simple Card component
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{value}</div>
      </div>
    </div>
  )
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [galleryCount, setGalleryCount] = useState(0)
  const [photoCount, setPhotoCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    // Initial fetch
    async function fetchCounts() {
      const [{ count: gCount }, { count: pCount }, { count: vCount }] = await Promise.all([
        supabase.from('galleries').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_views').select('*', { count: 'exact', head: true })
      ])
      setGalleryCount(gCount ?? 0)
      setPhotoCount(pCount ?? 0)
      setViewCount(vCount ?? 0)
      setLoading(false)
    }
    fetchCounts()

    // Real‑time subscriptions
    const gallerySub = supabase
      .channel('public:galleries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'galleries' }, payload => {
        setGalleryCount(prev => payload.eventType === 'INSERT' ? prev + 1 : payload.eventType === 'DELETE' ? Math.max(prev - 1, 0) : prev)
      })
      .subscribe()

    const photoSub = supabase
      .channel('public:gallery_images')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, payload => {
        setPhotoCount(prev => payload.eventType === 'INSERT' ? prev + 1 : payload.eventType === 'DELETE' ? Math.max(prev - 1, 0) : prev)
      })
      .subscribe()

    const viewSub = supabase
      .channel('public:gallery_views')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_views' }, payload => {
        setViewCount(prev => payload.eventType === 'INSERT' ? prev + 1 : prev)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(gallerySub)
      supabase.removeChannel(photoSub)
      supabase.removeChannel(viewSub)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard icon={TrendingUp} label="Galeries" value={galleryCount} />
      <StatCard icon={Image} label="Photos" value={photoCount} />
      <StatCard icon={TrendingUp} label="Vues" value={viewCount} />
    </div>
  )
}
