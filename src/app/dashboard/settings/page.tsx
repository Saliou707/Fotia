'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Shield, CreditCard, Globe, Check, ChevronRight,
  Loader2, Sparkles, Zap, Camera, ExternalLink,
  Phone, Lock, AlertTriangle, X, ChevronLeft,
  Star, HardDrive
} from 'lucide-react'
import { fadeUp as fade, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'
import LangSwitcher from '@/components/LangSwitcher'

// ─── Shared styles ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)',
  color: '#F2EDE4', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.2s',
}

// ─── Sub-components (design uniquement, logique identique) ──────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
      style={{
        width: 46, height: 26, borderRadius: 99,
        background: on ? '#C8482E' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.25s', flexShrink: 0,
        boxShadow: on ? '0 0 12px rgba(200,72,46,0.4)' : 'none',
      }}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: 3, left: 0,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

function SettingRow({
  label, hint, children, last = false
}: {
  label: string; hint?: string; children: React.ReactNode; last?: boolean
}) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 14, color: '#E5DDD6', fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: '#787068', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flex: '0 0 auto', maxWidth: 280, width: '100%' }}>{children}</div>
    </div>
  )
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(17,17,17,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.02)',
    }}>
      <Icon size={14} color="#C8482E" />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#787068' }}>
        {label}
      </span>
    </div>
  )
}

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',  label: 'Profil',        icon: User },
  { id: 'notifs',   label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité',      icon: Shield },
  { id: 'billing',  label: 'Abonnement',    icon: CreditCard },
  { id: 'language', label: 'Langue',        icon: Globe },
] as const
type TabId = typeof TABS[number]['id']

// ─── Page principale ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [plan, setPlan] = useState<'free' | 'pro' | 'studio'>('free')
  const [storageUsedBytes, setStorageUsedBytes] = useState(0)
  const [galleryCount, setGalleryCount] = useState(0)
  const [subscription, setSubscription] = useState<any>(null)
  const [billingLoading, setBillingLoading] = useState(false)

  // Djomy Gateway flow — saisie numéro uniquement
  const [checkoutStep, setCheckoutStep] = useState<'plan' | 'form'>('plan')
  const [paymentPhone, setPaymentPhone] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, phone, instagram, facebook, tiktok, website, bio, avatar_url, plan, storage_used_bytes, gallery_count')
          .eq('id', user.id)
          .single()

        if (profile) {
          setName(profile.display_name || '')
          setPhone(profile.phone || '')
          setInstagram(profile.instagram || '')
          setFacebook(profile.facebook || '')
          setTiktok(profile.tiktok || '')
          setWebsite(profile.website || '')
          setBio(profile.bio || '')
          setAvatarUrl(profile.avatar_url || '')
          setPlan((profile.plan as any) || 'free')
          setStorageUsedBytes(Number(profile.storage_used_bytes || 0))

          // Récupérer le nombre exact de galeries actives
          const { count } = await supabase
            .from('galleries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'active')

          setGalleryCount(count || 0)
        }

        try {
          const subRes = await fetch('/api/billing/subscription')
          if (subRes.ok) {
            const { subscription: subData } = await subRes.json()
            setSubscription(subData)
          }
        } catch (e) {
          console.error('Failed to fetch subscription', e)
        }
      }
      setLoadingData(false)
    }
    loadProfile()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAvatarUrl(`${publicUrl}/${key}`)
    } catch (err) {
      console.error('Avatar upload failed', err)
      alert('Erreur lors de l\'upload.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Notification toggles
  const [notifs, setNotifs] = useState({
    newFav: true,
    galleryView: false,
    download: true,
    weekly: true,
  })

  const [pwdModal, setPwdModal] = useState(false)
  const [proModal, setProModal] = useState(false)

  // Djomy Gateway — redirect vers le portail Djomy
  const handleCheckoutGateway = async () => {
    if (!paymentPhone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone.')
      return
    }
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', phone: paymentPhone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement')
      // Redirection vers le portail Djomy — Djomy gère OTP/opérateur
      window.location.href = data.checkout_url
    } catch (err: any) {
      console.error('[Djomy Checkout]', err)
      alert(err.message || 'Erreur lors de l\'initiation du paiement.')
      setBillingLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement Premium Pro ? Vous repasserez immédiatement au plan Essentiel.')) return
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST'
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to cancel subscription')
      }
      alert('Votre abonnement a été annulé avec succès.')
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erreur lors de l\'annulation de l\'abonnement.')
    } finally {
      setBillingLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          display_name: name,
          phone,
          instagram,
          facebook,
          tiktok,
          website,
          bio,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ─── Computed helpers ───────────────────────────────────────────────────
  const storageGB = (storageUsedBytes / (1024 ** 3)).toFixed(2)
  const maxStorageGB = plan === 'free' ? 5 : 100
  const storagePercent = Math.min(100, (storageUsedBytes / (maxStorageGB * 1024 ** 3)) * 100)
  const galleryMax = plan === 'free' ? 3 : Infinity
  const galleryPercent = plan === 'free' ? Math.min(100, (galleryCount / 3) * 100) : 100
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      {/* ── Background subtle gradient ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse at 20% 0%, rgba(200,72,46,0.04) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Paramètres</h1>
            <p style={{ color: '#787068', fontSize: 14, marginTop: 4 }}>Gérez votre compte et personnalisez votre expérience</p>
          </div>
          <LangSwitcher variant="compact" />
        </motion.div>

        {/* ── Avatar Hero Card ── */}
        {!loadingData && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
            <Card style={{ marginBottom: 24, padding: 28, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
              background: 'linear-gradient(135deg, rgba(200,72,46,0.08) 0%, rgba(17,17,17,0.95) 60%)',
              border: '1px solid rgba(200,72,46,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {/* Avatar with camera overlay */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #C8482E, #DF5D43)',
                  border: '3px solid rgba(200,72,46,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, color: '#fff',
                  boxShadow: '0 0 0 4px rgba(200,72,46,0.1)',
                }}>
                  {!avatarUrl && initials}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#C8482E', border: '2px solid #15171A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    opacity: uploadingAvatar ? 0.6 : 1, transition: 'opacity 0.2s',
                  }}
                >
                  {uploadingAvatar ? <Loader2 size={11} color="#fff" className="animate-spin" /> : <Camera size={11} color="#fff" />}
                </button>
              </div>

              {/* Name & plan badge */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{name || 'Votre nom'}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: plan === 'free' ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
                    border: plan === 'free' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(251,191,36,0.3)',
                    color: plan === 'free' ? '#787068' : '#FBBF24',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    {plan === 'free' ? <><Zap size={9} />Essentiel</> : <><Sparkles size={9} />Premium Pro</>}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#787068', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{phone}</span>}
                  {instagram && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{fontSize:11}}>@</span>{instagram}</span>}
                  {website && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={11} />Portfolio</span>}
                </div>
              </div>

              {/* Storage mini bar */}
              <div style={{ minWidth: 160, maxWidth: 220, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#787068', marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HardDrive size={10} />Stockage</span>
                  <span style={{ fontFamily: 'monospace' }}>{storageGB} Go / {maxStorageGB} Go</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${storagePercent}%`,
                    background: storagePercent > 85 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5D43)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Tab layout ── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Sidebar tabs ── */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: 200, flexShrink: 0 }}>
            <Card style={{ padding: '8px 0' }}>
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '11px 16px',
                      background: active ? 'rgba(200,72,46,0.1)' : 'transparent',
                      border: 'none',
                      borderLeft: active ? '2px solid #C8482E' : '2px solid transparent',
                      cursor: 'pointer', textAlign: 'left',
                      color: active ? '#F2EDE4' : '#787068',
                      fontSize: 14, fontWeight: active ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
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

                {/* ══ PROFIL ══ */}
                {activeTab === 'profile' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loadingData ? (
                      <Card style={{ padding: 40, textAlign: 'center' }}>
                        <Loader2 size={22} color="#C8482E" className="animate-spin" style={{ margin: '0 auto 12px' }} />
                        <div style={{ color: '#787068', fontSize: 14 }}>Chargement du profil...</div>
                      </Card>
                    ) : (
                      <>
                        {/* Infos de base */}
                        <Card>
                          <SectionHeader label="Informations personnelles" icon={User} />
                          <SettingRow label="Nom d'affichage" hint="Visible sur vos galeries partagées">
                            <input
                              value={name} onChange={e => setName(e.target.value)}
                              style={inputStyle} placeholder="Votre nom"
                              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'}
                            />
                          </SettingRow>
                          <SettingRow label="Téléphone / WhatsApp" hint="Pour la mise en contact client">
                            <input
                              value={phone} onChange={e => setPhone(e.target.value)}
                              style={inputStyle} placeholder="+224 6XX XXX XXX"
                              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'}
                            />
                          </SettingRow>
                          <SettingRow label="Biographie" hint="Affiché sur vos galeries publiques" last>
                            <textarea
                              value={bio} onChange={e => setBio(e.target.value)}
                              style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                              placeholder="Quelques mots sur votre univers photographique..."
                              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.10)'}
                            />
                          </SettingRow>
                        </Card>

                        {/* Réseaux sociaux */}
                        <Card>
                          <SectionHeader label="Réseaux & Portfolio" icon={ExternalLink} />
                          {[
                            { label: 'Instagram', hint: '@votre_compte', value: instagram, set: setInstagram, icon: '📸' },
                            { label: 'Facebook', hint: 'Lien vers votre page', value: facebook, set: setFacebook, icon: '📘' },
                            { label: 'TikTok', hint: '@votre_compte', value: tiktok, set: setTiktok, icon: '🎵' },
                            { label: 'Site / Portfolio', hint: 'https://...', value: website, set: setWebsite, icon: '🌐' },
                          ].map(({ label, hint, value, set, icon }, i, arr) => (
                            <SettingRow key={label} label={label} hint={hint} last={i === arr.length - 1}>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>{icon}</span>
                                <input
                                  value={value} onChange={e => set(e.target.value)}
                                  style={{ ...inputStyle, paddingLeft: 36 }}
                                  placeholder={hint}
                                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'}
                                />
                              </div>
                            </SettingRow>
                          ))}
                        </Card>

                        {/* Save */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={save} disabled={saving}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '12px 28px', borderRadius: 12,
                              background: saved ? 'rgba(34,197,94,0.9)' : saving ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #DF5D43, #C8482E)',
                              color: '#fff', border: 'none', fontWeight: 700, fontSize: 15,
                              cursor: saving ? 'not-allowed' : 'pointer',
                              boxShadow: saved ? '0 4px 16px rgba(34,197,94,0.3)' : saving ? 'none' : '0 4px 20px rgba(200,72,46,0.35)',
                              transition: 'all 0.25s',
                            }}
                          >
                            {saving
                              ? <><Loader2 size={16} className="animate-spin" /> Sauvegarde...</>
                              : saved
                              ? <><Check size={16} /> Sauvegardé !</>
                              : 'Enregistrer les modifications'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ══ NOTIFICATIONS ══ */}
                {activeTab === 'notifs' && (
                  <Card>
                    <SectionHeader label="Préférences de notification" icon={Bell} />
                    {[
                      { key: 'newFav', label: 'Nouveau favori client', hint: 'Un client ajoute une photo en favori' },
                      { key: 'galleryView', label: 'Galerie vue', hint: 'Quand quelqu\'un ouvre votre galerie' },
                      { key: 'download', label: 'Téléchargement', hint: 'Un client télécharge sa sélection' },
                      { key: 'weekly', label: 'Résumé hebdomadaire', hint: 'Bilan de vos stats chaque lundi' },
                    ].map(({ key, label, hint }, i, arr) => (
                      <SettingRow key={key} label={label} hint={hint} last={i === arr.length - 1}>
                        <Toggle
                          on={notifs[key as keyof typeof notifs]}
                          onChange={v => setNotifs(n => ({ ...n, [key]: v }))}
                        />
                      </SettingRow>
                    ))}
                  </Card>
                )}

                {/* ══ SÉCURITÉ ══ */}
                {activeTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                      <SectionHeader label="Accès & Authentification" icon={Lock} />
                      <button
                        onClick={() => setPwdModal(true)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', width: '100%',
                          background: 'none', border: 'none',
                          color: '#E5DDD6', cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>Changer le mot de passe</div>
                          <div style={{ fontSize: 12, color: '#787068', marginTop: 2 }}>Envoi d'un lien de réinitialisation par email</div>
                        </div>
                        <ChevronRight size={16} color="#555" />
                      </button>
                      <SettingRow label="Authentification 2FA" hint="Sécurisez votre compte avec un second facteur" last>
                        <Toggle on={false} onChange={() => {}} />
                      </SettingRow>
                    </Card>

                    {/* Danger zone */}
                    <Card style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                      <SectionHeader label="Zone de danger" icon={AlertTriangle} />
                      <div style={{ padding: '20px' }}>
                        <div style={{ fontSize: 13, color: '#787068', marginBottom: 16, lineHeight: 1.6 }}>
                          La suppression de votre compte est irréversible. Toutes vos galeries, photos et données seront effacées définitivement.
                        </div>
                        <button style={{
                          padding: '10px 18px', borderRadius: 10,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                          Supprimer mon compte
                        </button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* ══ ABONNEMENT ══ */}
                {activeTab === 'billing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Plan card */}
                    <Card style={{
                      background: plan === 'free'
                        ? 'rgba(17,17,17,0.9)'
                        : 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(17,17,17,0.95) 60%)',
                      border: plan === 'free' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(251,191,36,0.2)',
                    }}>
                      <div style={{ padding: '24px 24px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                              background: plan === 'free' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))',
                              border: plan === 'free' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(251,191,36,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {plan === 'free' ? <Zap size={22} color="#8E8E93" /> : <Sparkles size={22} color="#FBBF24" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 3 }}>
                                {plan === 'free' ? 'Plan Essentiel' : 'Plan Premium Pro'}
                              </div>
                              {plan !== 'free' && subscription && (
                                <div style={{ fontSize: 13, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Check size={13} /> Actif · Expire le {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                              {plan === 'free' && (
                                <div style={{ fontSize: 13, color: '#787068' }}>3 galeries · 100 photos/galerie · 5 Go</div>
                              )}
                            </div>
                          </div>

                          {plan === 'free' ? (
                            <button
                              onClick={() => setProModal(true)}
                              disabled={billingLoading}
                              style={{
                                padding: '10px 20px', borderRadius: 10,
                                background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
                                border: '1px solid rgba(251,191,36,0.3)',
                                color: '#FBBF24', fontSize: 13, fontWeight: 700,
                                cursor: billingLoading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.12))'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))'}
                            >
                              <Sparkles size={14} />
                              {billingLoading ? 'Chargement...' : 'Passer au Pro'}
                            </button>
                          ) : (
                            <button
                              onClick={handleCancelSubscription}
                              disabled={billingLoading}
                              style={{
                                padding: '10px 18px', borderRadius: 10,
                                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                                color: '#EF4444', fontSize: 13, fontWeight: 600,
                                cursor: billingLoading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {billingLoading ? 'Chargement...' : 'Annuler l\'abonnement'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upgrade banner (free) */}
                      {plan === 'free' && (
                        <div style={{
                          margin: '0 20px 20px', padding: '14px 16px', borderRadius: 12,
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.03))',
                          border: '1px solid rgba(251,191,36,0.12)',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <Sparkles size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                          <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.55 }}>
                            Passez au <strong style={{ color: '#FBBF24' }}>Plan Pro</strong> pour des galeries illimitées, 1000 photos/galerie et le téléchargement HD.
                          </div>
                        </div>
                      )}

                      {/* Pro active banner */}
                      {plan !== 'free' && (
                        <div style={{
                          margin: '0 20px 20px', padding: '14px 16px', borderRadius: 12,
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(34,197,94,0.04))',
                          border: '1px solid rgba(251,191,36,0.12)',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={16} color="#22c55e" />
                          </div>
                          <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.55 }}>
                            Votre abonnement <strong style={{ color: '#FBBF24' }}>Premium Pro</strong> est actif. Galeries illimitées, téléchargement HD et support prioritaire.
                          </div>
                        </div>
                      )}

                      {/* Usage bars */}
                      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Galeries */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#787068', marginBottom: 8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Star size={11} />Galeries Créées
                            </span>
                            <span style={{ fontFamily: 'monospace', color: '#A09890' }}>
                              {galleryCount}{plan === 'free' ? ' / 3' : ''}
                              {plan !== 'free' && <span style={{ marginLeft: 4, color: '#FBBF24' }}>∞ Illimité</span>}
                            </span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${galleryPercent}%` }}
                              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                              style={{
                                height: '100%', borderRadius: 3,
                                background: plan !== 'free' ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                  : galleryCount >= 3 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5D43)',
                              }}
                            />
                          </div>
                          {plan === 'free' && galleryCount >= 3 && (
                            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={10} />Limite atteinte — passez au Pro pour continuer
                            </div>
                          )}
                        </div>

                        {/* Stockage */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#787068', marginBottom: 8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <HardDrive size={11} />Espace Stockage
                            </span>
                            <span style={{ fontFamily: 'monospace', color: '#A09890' }}>{storageGB} Go / {maxStorageGB} Go</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${storagePercent}%` }}
                              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                              style={{
                                height: '100%', borderRadius: 3,
                                background: plan !== 'free'
                                  ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                  : storagePercent > 85 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5D43)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Pro features preview (free only) */}
                    {plan === 'free' && (
                      <Card>
                        <SectionHeader label="Fonctionnalités Pro" icon={Star} />
                        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {[
                            { icon: '∞', label: 'Galeries illimitées' },
                            { icon: '📷', label: '1000 photos/galerie' },
                            { icon: '💾', label: '100 Go de stockage' },
                            { icon: '⬇️', label: 'Téléchargement HD' },
                            { icon: '🎨', label: 'Filigrane personnalisé' },
                            { icon: '📊', label: 'Stats en temps réel' },
                          ].map(({ icon, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}>
                              <span style={{ fontSize: 16 }}>{icon}</span>
                              <span style={{ fontSize: 13, color: '#A09890' }}>{label}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '0 20px 20px' }}>
                          <button
                            onClick={() => setProModal(true)}
                            style={{
                              width: '100%', padding: '14px', borderRadius: 12,
                              background: 'linear-gradient(135deg, #DF5D43, #C8482E)',
                              color: '#fff', border: 'none', fontWeight: 700, fontSize: 15,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              boxShadow: '0 6px 20px rgba(200,72,46,0.3)',
                            }}
                          >
                            <Sparkles size={16} /> Passer au Premium Pro — 1 000 GNF/mois
                          </button>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* ══ LANGUE ══ */}
                {activeTab === 'language' && (
                  <Card>
                    <SectionHeader label="Langue & région" icon={Globe} />
                    <div style={{ padding: 24 }}>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 14, color: '#E5DDD6', fontWeight: 500, marginBottom: 6 }}>Langue de l'interface</div>
                        <div style={{ fontSize: 12, color: '#787068', marginBottom: 16 }}>Ce réglage s'applique à toutes les pages de Fotia</div>
                        <LangSwitcher variant="full" />
                      </div>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
                      <div>
                        <div style={{ fontSize: 14, color: '#E5DDD6', fontWeight: 500, marginBottom: 6 }}>Format de date</div>
                        <select style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option>JJ/MM/AAAA (Français)</option>
                          <option>MM/DD/YYYY (Anglais)</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ══ Password Modal ══ */}
      <AnimatePresence>
        {pwdModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setPwdModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, position: 'relative' }}
            >
              <button onClick={() => setPwdModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#787068' }}>
                <X size={15} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={16} color="#C8482E" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Changer le mot de passe</h3>
              </div>
              <p style={{ color: '#787068', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Vous recevrez un lien par email pour réinitialiser votre mot de passe en toute sécurité.
              </p>
              <input
                type="email" placeholder="Votre email actuel"
                style={{ ...inputStyle, marginBottom: 16 }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPwdModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, cursor: 'pointer' }}>Annuler</button>
                <button
                  onClick={() => { setPwdModal(false); alert('Email de réinitialisation envoyé !') }}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #DF5D43, #C8482E)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(200,72,46,0.3)' }}
                >
                  Envoyer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Pro Modal — Djomy Gateway ══ */}
      <AnimatePresence>
        {proModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => { setProModal(false); setCheckoutStep('plan'); setPaymentPhone('') }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 22, padding: 28, width: '100%', maxWidth: 420, position: 'relative',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
              }}
            >
              <button
                onClick={() => { setProModal(false); setCheckoutStep('plan'); setPaymentPhone('') }}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#787068' }}
              >
                <X size={15} />
              </button>

              {/* Étape 1 — présentation du plan */}
              <AnimatePresence mode="wait">
                {checkoutStep === 'plan' && (
                  <motion.div key="plan" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={18} color="#FBBF24" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Passer au Plan Pro</h3>
                      </div>
                    </div>
                    <p style={{ color: '#787068', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Profitez de toutes les fonctionnalités premium !</p>

                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(200,72,46,0.08), rgba(200,72,46,0.04))', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(200,72,46,0.15)' }}>
                      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>1 000 <span style={{ fontSize: 15, fontWeight: 500, color: '#787068' }}>GNF/mois</span></div>
                      <ul style={{ fontSize: 13, color: '#E5DDD6', margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {['Galeries illimitées', '1000 photos / galerie', 'Téléchargement HD', 'Filigrane personnalisé', 'Support prioritaire'].map(f => (
                          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Check size={13} color="#C8482E" style={{ flexShrink: 0 }} />{f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Méthodes */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                      {['Orange Money', 'MTN MoMo', 'Kulu'].map(m => (
                        <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.09)' }}>{m}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => setCheckoutStep('form')}
                      style={{ width: '100%', padding: '15px', borderRadius: 12, background: 'linear-gradient(135deg, #DF5D43, #C8482E)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,72,46,0.35)' }}
                    >
                      Payer avec Mobile Money
                    </button>
                  </motion.div>
                )}

                {/* Étape 2 — saisie numéro + redirect Djomy */}
                {checkoutStep === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <button
                        onClick={() => setCheckoutStep('plan')}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 8, padding: '5px 8px' }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Votre numéro Mobile Money</h3>
                    </div>
                    <p style={{ color: '#787068', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
                      Entrez le numéro associé à votre compte Mobile Money (Orange Money, MTN MoMo ou Kulu).
                      Vous serez redirigé vers le portail Djomy pour finaliser le paiement.
                    </p>

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ fontSize: 12, color: '#787068', marginBottom: 8, display: 'block', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Numéro de téléphone</label>
                      <input
                        type="tel"
                        placeholder="Ex: 00224623707722"
                        value={paymentPhone}
                        onChange={e => setPaymentPhone(e.target.value)}
                        style={{ ...inputStyle, fontSize: 16, letterSpacing: '0.05em' }}
                        autoFocus
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(200,72,46,0.5)'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'}
                      />
                      <p style={{ fontSize: 11, color: '#555', marginTop: 6 }}>Format international requis, ex : 00224 + votre numéro</p>
                    </div>

                    <button
                      id="djomy-pay-btn"
                      onClick={handleCheckoutGateway}
                      disabled={billingLoading || !paymentPhone.trim()}
                      style={{
                        width: '100%', padding: '15px', borderRadius: 12,
                        background: billingLoading || !paymentPhone.trim() ? 'rgba(60,60,60,0.5)' : 'linear-gradient(135deg, #DF5D43, #C8482E)',
                        color: billingLoading || !paymentPhone.trim() ? '#555' : '#fff',
                        border: 'none', fontWeight: 700, fontSize: 15,
                        cursor: billingLoading || !paymentPhone.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: billingLoading || !paymentPhone.trim() ? 'none' : '0 6px 20px rgba(200,72,46,0.35)',
                      }}
                    >
                      {billingLoading
                        ? <><Loader2 size={16} className="animate-spin" /> Redirection en cours...</>
                        : 'Payer 1 000 GNF →'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
