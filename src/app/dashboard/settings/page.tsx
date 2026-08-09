'use client'
import { useState, useEffect, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProfile, updateProfile } from '@/lib/api'
import { translateAuthError } from '@/lib/auth-errors'
import { toast } from '@/components/ui'
import { Card } from './ui'
import { TABS, type TabId } from './tabs'
import ProfileSection from './ProfileSection'
import NotificationsSection from './NotificationsSection'
import SecuritySection from './SecuritySection'
import BillingSection from './BillingSection'
import HeroCard from './HeroCard'
import PasswordModal from './PasswordModal'
import ProCheckoutModal from './ProCheckoutModal'
import type { ProfileForm, BillingData, NotifKey, Plan } from './types'

const initialForm: ProfileForm = {
  name: '', phone: '', instagram: '', facebook: '', tiktok: '', website: '', bio: '', avatarUrl: '',
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [form, setForm] = useState<ProfileForm>(initialForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const [billing, setBilling] = useState<BillingData>({ plan: 'free', storageUsedBytes: 0, galleryCount: 0, subscription: null })
  const [billingLoading, setBillingLoading] = useState(false)

  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    newFav: true,
    galleryView: false,
    download: true,
    weekly: true,
  })

  const [pwdModal, setPwdModal] = useState(false)
  const [proModal, setProModal] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const profile = await fetchProfile()
      if (profile) {
        setForm({
          name: profile.display_name || '',
          phone: profile.phone || '',
          instagram: profile.instagram || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          website: profile.website || '',
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || '',
        })
        setBilling(b => ({
          ...b,
          plan: (profile.plan as Plan) || 'free',
          storageUsedBytes: Number(profile.storage_used_bytes || 0),
          galleryCount: profile.gallery_count || 0,
        }))
      }

      try {
        const subRes = await fetch('/api/billing/subscription')
        if (subRes.ok) {
          const { subscription: subData } = await subRes.json()
          setBilling(b => ({ ...b, subscription: subData }))
        }
      } catch (e) {
        console.error('Failed to fetch subscription', e)
      }
      setLoadingData(false)
    }
    loadProfile()
  }, [])

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const { key } = await res.json()

      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
      setForm(f => ({ ...f, avatarUrl: `${publicUrl}/${key}` }))
    } catch (err) {
      console.error('Avatar upload failed', err)
      toast.error("Photo impossible à charger", "Vérifiez le format et la taille du fichier, puis réessayez.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Djomy Gateway — redirect vers le portail Djomy
  const handleCheckoutGateway = async (phone: string) => {
    if (!phone.trim()) {
      toast.error('Numéro requis', 'Veuillez entrer votre numéro de téléphone pour continuer.')
      return
    }
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement')
      // Redirection vers le portail Djomy — Djomy gère OTP/opérateur
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      console.error('[Djomy Checkout]', err)
      toast.error('Paiement impossible', translateAuthError(err instanceof Error ? err.message : "Erreur lors de l'initiation du paiement."))
      setBillingLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    const ok = await updateProfile({
      display_name: form.name,
      phone: form.phone,
      instagram: form.instagram,
      facebook: form.facebook,
      tiktok: form.tiktok,
      website: form.website,
      bio: form.bio,
      avatar_url: form.avatarUrl,
    })
    if (!ok) {
      toast.error('Sauvegarde impossible', 'Erreur lors de la sauvegarde du profil. Réessayez.')
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      {/* ── Background subtle gradient ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse at 20% 0%, rgba(200,72,46,0.04) 0%, transparent 60%)' }} />

      <div className="settings-page-inner" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Paramètres</h1>
            <p style={{ color: '#A09890', fontSize: 14, marginTop: 4 }}>Gérez votre compte et personnalisez votre expérience</p>
          </div>
        </motion.div>

        {/* ── Avatar Hero Card ── */}
        {!loadingData && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
            <HeroCard
              form={form}
              billing={billing}
              uploadingAvatar={uploadingAvatar}
              onAvatarUpload={handleAvatarUpload}
            />
          </motion.div>
        )}

        {/* ── Tab layout ── */}
        <div className="settings-tab-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Sidebar tabs ── */}
          <motion.div className="settings-tab-sidebar" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: 200, flexShrink: 0 }}>
            <Card style={{ padding: '8px 0' }}>
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={active ? 'settings-tab-btn active' : 'settings-tab-btn'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '11px 16px',
                      background: active ? 'rgba(200,72,46,0.1)' : 'transparent',
                      border: 'none',
                      borderLeft: active ? '2px solid #C8482E' : '2px solid transparent',
                      cursor: 'pointer', textAlign: 'left',
                      color: active ? '#F2EDE4' : '#A09890',
                      fontSize: 14, fontWeight: active ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon size={15} color={active ? '#C8482E' : '#555'} />
                    {label}
                  </button>
                )
              })}
            </Card>
          </motion.div>

          {/* ── Tab content ── */}
          <motion.div
            className="settings-tab-content"
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{ flex: 1, minWidth: 280 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'profile' && (
                  <ProfileSection
                    form={form}
                    loading={loadingData}
                    saving={saving}
                    saved={saved}
                    onChange={patch => setForm(f => ({ ...f, ...patch }))}
                    onSave={save}
                  />
                )}
                {activeTab === 'notifs' && (
                  <NotificationsSection
                    notifs={notifs}
                    onToggle={key => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                  />
                )}
                {activeTab === 'security' && (
                  <SecuritySection onOpenPassword={() => setPwdModal(true)} />
                )}
                {activeTab === 'billing' && (
                  <BillingSection
                    billing={billing}
                    billingLoading={billingLoading}
                    onUpgrade={() => setProModal(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ══ Modals ══ */}
      <PasswordModal open={pwdModal} onClose={() => setPwdModal(false)} />
      <ProCheckoutModal
        open={proModal}
        billingLoading={billingLoading}
        onClose={() => setProModal(false)}
        onCheckout={handleCheckoutGateway}
      />

      <style>{`
        /* ── Tablette ── */
        @media (max-width: 768px) {
          .settings-tab-layout { flex-direction: column !important; align-items: stretch !important; }
          .settings-tab-sidebar { width: 100% !important; }
          .settings-tab-sidebar > div { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; padding: 6px !important; }
          .settings-tab-sidebar button { flex: 1 1 calc(50% - 6px) !important; text-align: center !important; justify-content: center !important; border-radius: 10px !important; padding: 10px !important; white-space: nowrap !important; border: 1px solid rgba(255,255,255,0.05) !important; font-size: 13px !important; }
          .settings-tab-sidebar button.active { background: rgba(200,72,46,0.1) !important; border-color: rgba(200,72,46,0.3) !important; color: #F2EDE4 !important; }
          .settings-tab-sidebar button.active svg { color: #C8482E !important; }
          .settings-tab-sidebar button svg { display: none !important; }
          .settings-tab-content { width: 100% !important; min-width: 0 !important; overflow: visible !important; }
          .settings-hero-card { flex-direction: column !important; text-align: center !important; align-items: center !important; padding: 20px !important; }
          .settings-hero-storage { min-width: 100% !important; max-width: 100% !important; }
          .settings-row-control { max-width: 100% !important; }
          .settings-billing-plan-row { flex-direction: column !important; align-items: stretch !important; }
          .settings-billing-plan-row > button { width: 100% !important; justify-content: center !important; }
          .settings-billing-header { padding: 16px !important; }
          .settings-feature-grid { grid-template-columns: 1fr !important; }
          .settings-save-row { justify-content: stretch !important; }
          .settings-save-row button { width: 100% !important; justify-content: center !important; }
          .settings-danger-content { padding: 14px !important; }
          .settings-danger-content button { width: 100% !important; }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .settings-page-inner { padding: 16px 10px 60px !important; }
          .settings-page-inner h1 { font-size: 22px !important; }
          .settings-page-inner > div > p { font-size: 13px !important; }
          .settings-modal-card { padding: 20px !important; margin: 0 8px !important; }
          .settings-modal-card h3 { font-size: 16px !important; }
          .settings-hero-card { gap: 14px !important; padding: 16px !important; }
          .settings-hero-card > div:first-child > div:first-child { width: 64px !important; height: 64px !important; font-size: 22px !important; }
          .settings-hero-card span[style*="font-size:20"] { font-size: 17px !important; }
          .settings-pro-price { font-size: 26px !important; }
          .settings-tab-sidebar button { padding: 8px 12px !important; font-size: 12px !important; }
          .settings-tab-layout { gap: 10px !important; }
        }

        /* ── Très petit écran ── */
        @media (max-width: 380px) {
          .settings-page-inner { padding: 12px 6px 60px !important; }
          .settings-modal-card { padding: 16px !important; border-radius: 16px !important; }
          .settings-hero-card { padding: 14px !important; }
          .settings-hero-card > div:first-child > div:first-child { width: 56px !important; height: 56px !important; }
        }
      `}</style>
    </div>
  )
}
