'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Eye, Heart, Zap, ArrowRight, Trash2, MoonStar, Sun, Hand, Building2 } from 'lucide-react'
import { fetchGalleries, fetchProfile, createGallery, type Gallery } from '@/lib/api'
import { PLAN_LIMITS } from '@/lib/limits'
import { toast, ConfirmDialog } from '@/components/ui'
import { translateAuthError } from '@/lib/auth-errors'
import DashboardHero, { type DashboardKpi } from './DashboardHero'
import DashboardQuickActions from './DashboardQuickActions'
import DashboardRecentSection from './DashboardRecentSection'
import CreateGalleryModal from '@/components/modals/CreateGalleryModal'

export default function DashboardPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [stats, setStats] = useState<{ totalGalleries: number; totalViews: number; totalFavorites: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Gallery | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'studio'>('free')
  const [hasUsedBeta, setHasUsedBeta] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  // ⚠️ L'heure locale n'est connue qu'après hydratation : calculer le greeting
  // avec new Date() pendant le rendu provoque des erreurs d'hydratation React
  // (#418) quand le fuseau horaire du serveur (UTC sur Vercel) diffère de celui
  // du client (ex: Guinée UTC+0, France UTC+2). On initialise à null et on
  // remplit l'heure après montage — rendu SSR et hydratation toujours identiques.
  const [hour, setHour] = useState<number | null>(null)
  useEffect(() => { setHour(new Date().getHours()) }, [])
  const greeting = hour === null ? 'Bienvenue' : hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const greetingIcon = hour === null ? Hand : hour < 5 ? MoonStar : hour < 12 ? Sun : hour < 18 ? Hand : Building2
  const greetingAccent = hour === null ? '#C8482E' : hour < 5 ? '#8B5CF6' : hour < 12 ? '#E8B33D' : hour < 18 ? '#C8482E' : '#8B5CF6'
  const isPro = userPlan === 'pro' || userPlan === 'studio'

  useEffect(() => {
    Promise.all([fetchGalleries(), fetchProfile()]).then(([g, profile]) => {
      setGalleries(g)
      if (profile) {
        setUserPlan((profile.plan as 'free' | 'pro' | 'studio') || 'free')
        setHasUsedBeta(!!profile.has_used_beta)
      }
      setStats({
        totalGalleries: g.length,
        totalViews: g.reduce((s, x) => s + (x.view_count ?? 0), 0),
        totalFavorites: g.reduce((s, x) => s + (x.favorite_count ?? 0), 0),
      })
      setLoading(false)
    })

    // Fetch subscription for Pro banner
    fetch('/api/billing/subscription')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.subscription?.expires_at) {
          setDaysLeft(Math.max(0, Math.ceil((new Date(data.subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))))
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  const handleCreate = async (title: string, clientName: string) => {
    if (!title.trim() || creating) return
    setCreating(true)
    const fullTitle = clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()
    try {
      const g = await createGallery(fullTitle)
      if (g) router.push(`/dashboard/gallery/${g.id}`)
      toast.success('Galerie créée', `« ${fullTitle} » est prête, importez vos photos.`)
    } catch (e: unknown) {
      setCreating(false)
      const err = e as Error & { cause?: { requiresUpgrade?: boolean } }
      if (err.cause?.requiresUpgrade) {
        toast.info('Limite atteinte', `Vous avez atteint la limite de ${PLAN_LIMITS.free.maxGalleries} galeries du plan gratuit. Passez au Premium Pro pour des galeries illimitées.`)
        router.push('/dashboard/settings')
      } else {
        toast.error('Impossible de créer la galerie', translateAuthError(err.message) || 'Une erreur est survenue. Réessayez.')
      }
    }
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    const g = confirmDelete
    setConfirmDelete(null)
    setDeletingId(g.id)
    const { deleteGallery: del } = await import('@/lib/api')
    const ok = await del(g.id)
    if (ok) {
      setGalleries(prev => prev.filter(x => x.id !== g.id))
      setStats(prev => prev ? { ...prev, totalGalleries: Math.max(0, prev.totalGalleries - 1) } : prev)
      toast.success('Galerie supprimée', `« ${g.title} » a été supprimée.`)
    } else {
      toast.error('Suppression impossible', 'Une erreur est survenue. Réessayez.')
    }
    setDeletingId(null)
  }

  const kpis: DashboardKpi[] = [
    {
      icon: ImageIcon, label: 'Galeries actives', val: stats?.totalGalleries ?? 0,
      accent: '#C8482E', bg: 'rgba(200,72,46,0.08)', border: 'rgba(200,72,46,0.18)',
      sub: `${galleries.filter(g => g.status === 'active').length} en ligne`,
    },
    {
      icon: Eye, label: 'Vues totales', val: stats?.totalViews ?? 0,
      accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)',
      sub: 'Toutes galeries confondues',
    },
    {
      icon: Heart, label: 'Favoris clients', val: stats?.totalFavorites ?? 0,
      accent: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.18)',
      sub: stats && stats.totalViews > 0 ? `${Math.round((stats.totalFavorites / stats.totalViews) * 100)}% taux d'engagement` : 'Sélections de vos clients',
    },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 58px)', background: '#15171A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════ */}
      <DashboardHero
        greeting={greeting}
        greetingIcon={greetingIcon}
        greetingAccent={greetingAccent}
        loading={loading}
        isPro={isPro}
        hasUsedBeta={hasUsedBeta}
        daysLeft={daysLeft}
        kpis={kpis}
        onOpenCreate={() => setShowCreate(true)}
      />

      {/* ══ QUICK ACTIONS STRIP ══════════════════════════════════════════════ */}
      <DashboardQuickActions />

      {/* ══ GALERIES RÉCENTES ════════════════════════════════════════════════ */}
      <DashboardRecentSection
        loading={loading}
        galleries={galleries}
        onOpenCreate={() => setShowCreate(true)}
        onDelete={(id) => setConfirmDelete(galleries.find(g => g.id === id) ?? null)}
        deletingId={deletingId}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmAndDelete}
        loading={!!deletingId}
        danger
        title="Supprimer cette galerie ?"
        description={`« ${confirmDelete?.title ?? ''} » sera définitivement supprimée, ainsi que toutes ses photos. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        icon={<Trash2 size={19} />}
      />

      {/* ══ MODAL CRÉATION ═══════════════════════════════════════════════════ */}
      <CreateGalleryModal
        open={showCreate}
        creating={creating}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        icon={Zap}
        title="Créer une galerie"
        titlePlaceholder="ex: Mariage Yasmine & Oumar"
        submitLabel="Continuer vers l'import"
        submitIcon={ArrowRight}
        previewIcon={ImageIcon}
        previewColor="#C8482E"
        spinnerKeyframe="dashSpin"
        maxWidth={480}
        padding={36}
      />

      <style>{`
        @keyframes dashSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        .kpi-grid { grid-template-columns: repeat(3, 1fr); }

        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .kpi-card:last-child { grid-column: 1 / -1 !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .dash-hero { padding: 24px 16px 0 !important; }
          .dash-greet-icon { width: 40px !important; height: 40px !important; border-radius: 11px !important; }
          .dash-greet-icon svg { width: 18px !important; height: 18px !important; }
          .dash-actions { padding: 16px 16px !important; gap: 8px !important; flex-wrap: wrap !important; }
          .dash-actions a { flex: 1 1 auto !important; min-width: 0 !important; }
          .dash-galleries { padding: 0 16px 32px !important; }
          .create-modal-padding { padding: 24px 20px !important; }

          /* Bannière Premium Pro compacte */
          .dash-pro-banner { padding: 12px 14px !important; gap: 10px !important; margin-bottom: 20px !important; border-radius: 14px !important; }
          .dash-pro-icon { width: 34px !important; height: 34px !important; border-radius: 10px !important; }
          .dash-pro-icon svg { width: 16px !important; height: 16px !important; }
          .dash-pro-info { min-width: 0 !important; flex: 1 1 60% !important; }
          .dash-pro-title { font-size: 13.5px !important; }
          .dash-pro-features { font-size: 11.5px !important; gap: 8px !important; }
          .dash-pro-cta { padding: 6px 12px !important; font-size: 11.5px !important; }

          /* Cartes KPI compactes 2 colonnes */
          .kpi-card { padding: 14px 14px !important; border-radius: 14px !important; }
          .kpi-card-header { margin-bottom: 10px !important; }
          .kpi-icon-box { width: 34px !important; height: 34px !important; border-radius: 10px !important; }
          .kpi-icon-box svg { width: 15px !important; height: 15px !important; }
          .kpi-live { font-size: 9px !important; padding: 2px 7px !important; gap: 3px !important; }
          .kpi-value { font-size: 26px !important; margin-bottom: 4px !important; }
          .kpi-label { font-size: 10px !important; margin-bottom: 2px !important; }
          .kpi-sub { font-size: 10px !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
          /* 3e carte pleine largeur : contenu centré pour équilibrer */
          .kpi-card:last-child { text-align: center !important; }
          .kpi-card:last-child .kpi-card-header { justify-content: center !important; gap: 10px !important; }
          .kpi-card:last-child .kpi-sub { display: inline-block; max-width: 90%; }
        }
        @media (max-width: 380px) {
          .dash-hero { padding: 18px 10px 0 !important; }
          .dash-hero h1 { font-size: 22px !important; }
          .dash-actions { padding: 12px 8px !important; }
          .dash-pro-banner { padding: 10px 12px !important; }
          .kpi-card { padding: 12px 10px !important; }
          .kpi-value { font-size: 22px !important; }
          .kpi-label { font-size: 9px !important; }
          .kpi-sub { font-size: 9px !important; }
        }
      `}</style>
    </div>
  )
}
