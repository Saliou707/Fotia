'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Bell, Shield, CreditCard, Globe, Check, ChevronRight, Loader2 } from 'lucide-react'
import { fadeUp as fade, stagger } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
  color: '#F2EDE4', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div variants={fade} style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon size={16} color="#C8482E" />
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        {children}
      </div>
    </motion.div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <label style={{ fontSize: 13, color: '#A1A1AA', flexShrink: 0, minWidth: 120 }}>{label}</label>
      <div style={{ flex: 1, maxWidth: 340 }}>{children}</div>
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (val: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 99, background: on ? '#C8482E' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <motion.div animate={{ x: on ? 22 : 2 }} transition={{ duration: 0.2, type: 'spring', stiffness: 500 }}
        style={{ position: 'absolute', top: 2, left: 0, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
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

  // Direct Payment states
  const [checkoutStep, setCheckoutStep] = useState<'plan' | 'form' | 'waiting' | 'success'>('plan')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [paymentCountry, setPaymentCountry] = useState('CI')
  const [paymentProvider, setPaymentProvider] = useState('orange')
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null)
  
  const COUNTRIES = [
    { code: 'CI', name: "Côte d'Ivoire", providers: ['orange', 'mtn', 'moov', 'wave'] },
    { code: 'SN', name: "Sénégal", providers: ['orange', 'free', 'wave'] },
    { code: 'ML', name: "Mali", providers: ['orange', 'moov'] },
    { code: 'GN', name: "Guinée", providers: ['orange', 'mtn'] },
    { code: 'CM', name: "Cameroun", providers: ['orange', 'mtn'] }
  ]

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

  const handleCheckoutDirect = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/checkout-mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'pro',
          phone: paymentPhone,
          country: paymentCountry,
          provider: paymentProvider
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to initiate direct payment')
      }
      const data = await res.json()
      
      setPaymentInstructions(data)
      setCheckoutStep('waiting')
      
      // Start polling for status
      startPolling(data.id || data.short_code)

    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erreur lors de l\'initiation du paiement.')
    } finally {
      setBillingLoading(false)
    }
  }

  const startPolling = (paymentId: string) => {
    if ((window as any).paymentPollingInterval) {
      clearInterval((window as any).paymentPollingInterval)
    }
    
    const interval = setInterval(async () => {
      try {
        const pubKey = process.env.NEXT_PUBLIC_PAYLIV_PUBLIC_KEY || ''
        const res = await fetch(`https://ivnvckgzkxxhowusxczt.supabase.co/functions/v1/api-payments-status?payment_id=${paymentId}`, {
          headers: { 'X-API-Key': pubKey }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success' || data.status === 'completed' || data.status === 'paid') {
            clearInterval(interval)
            setCheckoutStep('success')
            setTimeout(() => window.location.reload(), 2000)
          } else if (data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(interval)
            alert('Le paiement a échoué ou a été annulé.')
            setCheckoutStep('form')
          }
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 4000)
    
    ;(window as any).paymentPollingInterval = interval
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if ((window as any).paymentPollingInterval) {
        clearInterval((window as any).paymentPollingInterval)
      }
    }
  }, [])

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

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 680 }}>
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fade} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Paramètres</h1>
          <p style={{ color: '#A1A1AA', fontSize: 14 }}>Gérez votre compte et vos préférences</p>
        </motion.div>

        {/* Profil */}
        <Section title="Profil" icon={User}>
          {loadingData ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#A1A1AA' }}>Chargement...</div>
          ) : (
            <>
              <Row label="Photo de profil">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #C8482E, #DF5D43)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {!avatarUrl && name.charAt(0)}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#F2EDE4', fontSize: 13, fontWeight: 600, cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}>
                    {uploadingAvatar ? 'Envoi...' : 'Changer la photo'}
                  </button>
                </div>
              </Row>
              <Row label="Nom d'affichage">
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Votre nom" />
              </Row>
              <Row label="Téléphone / WhatsApp">
                <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+33 6 12 34 56 78" />
              </Row>
              <Row label="Instagram">
                <input value={instagram} onChange={e => setInstagram(e.target.value)} style={inputStyle} placeholder="@votre_compte" />
              </Row>
              <Row label="Facebook">
                <input value={facebook} onChange={e => setFacebook(e.target.value)} style={inputStyle} placeholder="Lien vers la page" />
              </Row>
              <Row label="TikTok">
                <input value={tiktok} onChange={e => setTiktok(e.target.value)} style={inputStyle} placeholder="@votre_compte" />
              </Row>
              <Row label="Site web / Portfolio">
                <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://votre-site.com" />
              </Row>
              <Row label="Biographie">
                <textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} 
                  placeholder="Quelques mots sur vous..." 
                />
              </Row>
            </>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <Row label="Nouveau favori client">
            <Toggle on={notifs.newFav} onChange={v => setNotifs(n => ({ ...n, newFav: v }))} />
          </Row>
          <Row label="Galerie vue">
            <Toggle on={notifs.galleryView} onChange={v => setNotifs(n => ({ ...n, galleryView: v }))} />
          </Row>
          <Row label="Téléchargement">
            <Toggle on={notifs.download} onChange={v => setNotifs(n => ({ ...n, download: v }))} />
          </Row>
          <Row label="Résumé hebdomadaire">
            <Toggle on={notifs.weekly} onChange={v => setNotifs(n => ({ ...n, weekly: v }))} />
          </Row>
        </Section>

        {/* Sécurité */}
        <Section title="Sécurité" icon={Shield}>
          <button onClick={() => setPwdModal(true)} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: '#F2EDE4', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 14 }}>Changer le mot de passe</span>
            <ChevronRight size={16} color="#A1A1AA" />
          </button>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14 }}>Authentification à deux facteurs</span>
            <Toggle on={false} onChange={() => {}} />
          </div>
        </Section>

        {/* Plan */}
        <Section title="Abonnement" icon={CreditCard}>
          <div style={{ padding: '18px 18px' }}>
            {plan === 'free' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 2 }}>Plan Essentiel (Gratuit)</div>
                    <div style={{ fontSize: 13, color: '#A1A1AA' }}>3 galeries max · 100 photos/galerie max</div>
                  </div>
                  <button 
                    onClick={() => setProModal(true)} 
                    disabled={billingLoading}
                    style={{ 
                      padding: '9px 18px', 
                      borderRadius: 9, 
                      background: 'linear-gradient(135deg, #DF5D43 0%, #C8482E 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      fontSize: 13, 
                      fontWeight: 600, 
                      cursor: billingLoading ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {billingLoading ? 'Chargement...' : 'Passer au Pro'}
                  </button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A1A1AA', marginBottom: 4 }}>
                    <span>Galeries Créées</span>
                    <span>{galleryCount} / 3</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (galleryCount / 3) * 100)}%`, background: '#C8482E', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A1A1AA', marginBottom: 4 }}>
                    <span>Espace Stockage</span>
                    <span>{(storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2)} Go / 5.0 Go</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (storageUsedBytes / (5 * 1024 * 1024 * 1024)) * 100)}%`, background: '#C8482E', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 650, fontSize: 15 }}>Plan Premium Pro</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(200,72,46,0.15)', color: '#DF5D43', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actif</span>
                    </div>
                    {subscription && (
                      <div style={{ fontSize: 13, color: '#A1A1AA' }}>
                        Expire le {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleCancelSubscription} 
                    disabled={billingLoading}
                    style={{ 
                      padding: '9px 18px', 
                      borderRadius: 9, 
                      background: 'rgba(239,68,68,0.1)', 
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444', 
                      fontSize: 13, 
                      fontWeight: 600, 
                      cursor: billingLoading ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {billingLoading ? 'Chargement...' : 'Annuler'}
                  </button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A1A1AA', marginBottom: 4 }}>
                    <span>Galeries Créées</span>
                    <span>{galleryCount} (Illimité)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: '100%', background: '#C8482E', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A1A1AA', marginBottom: 4 }}>
                    <span>Espace Stockage</span>
                    <span>{(storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2)} Go / 100 Go</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (storageUsedBytes / (100 * 1024 * 1024 * 1024)) * 100)}%`, background: '#C8482E', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Langue */}
        <Section title="Langue & région" icon={Globe}>
          <div style={{ padding: '14px 18px' }}>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>Français</option>
              <option>English</option>
            </select>
          </div>
        </Section>

        {/* Save button */}
        <motion.div variants={fade}>
          <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: saved ? '#22c55e' : saving ? '#666' : '#C8482E', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 0.2s' }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Enregistrer les modifications'}
          </button>
        </motion.div>
      </motion.div>

      {/* Password Modal */}
      {pwdModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setPwdModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Changer le mot de passe</h3>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 20 }}>Vous recevrez un lien par email pour réinitialiser votre mot de passe.</p>
            <input type="email" placeholder="Votre email actuel" style={{ ...inputStyle, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPwdModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#F2EDE4', border: 'none', fontSize: 14, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { setPwdModal(false); alert('Email de réinitialisation envoyé !') }} style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#C8482E', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Envoyer</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pro Modal */}
      {proModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setProModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, position: 'relative' }}>
            
            {checkoutStep === 'plan' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CreditCard size={20} color="#C8482E" />
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Passer au Plan Pro</h3>
                </div>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 20 }}>Profitez de toutes les fonctionnalités premium !</p>
                <div style={{ padding: '16px', background: 'rgba(200,72,46,0.08)', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>5900<span style={{ fontSize: 14, fontWeight: 400, color: '#A1A1AA' }}> XOF /mois</span></div>
                  <ul style={{ fontSize: 13, color: '#F2EDE4', margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
                    <li>Galeries illimitées</li>
                    <li>1000 photos / galerie</li>
                    <li>Téléchargement HD</li>
                    <li>Filigrane personnalisé</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setCheckoutStep('form')}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: 12, 
                    background: '#C8482E', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: 700, 
                    fontSize: 15, 
                    cursor: 'pointer' 
                  }}
                >
                  Continuer avec Mobile Money
                </button>
              </>
            )}

            {checkoutStep === 'form' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <button onClick={() => setCheckoutStep('plan')} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Paiement Direct</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Pays</label>
                    <select 
                      value={paymentCountry} 
                      onChange={e => {
                        setPaymentCountry(e.target.value)
                        const c = COUNTRIES.find(x => x.code === e.target.value)
                        if (c) setPaymentProvider(c.providers[0])
                      }} 
                      style={inputStyle}
                    >
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Opérateur</label>
                    <select 
                      value={paymentProvider} 
                      onChange={e => setPaymentProvider(e.target.value)} 
                      style={inputStyle}
                    >
                      {COUNTRIES.find(c => c.code === paymentCountry)?.providers.map(p => (
                        <option key={p} value={p}>{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Numéro de téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: 07070707" 
                      value={paymentPhone} 
                      onChange={e => setPaymentPhone(e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCheckoutDirect} 
                  disabled={billingLoading || !paymentPhone}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: 12, 
                    background: billingLoading || !paymentPhone ? '#666' : '#C8482E', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: 700, 
                    fontSize: 15, 
                    cursor: billingLoading || !paymentPhone ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {billingLoading ? 'Initiation...' : 'Payer 5900 XOF'}
                </button>
              </>
            )}

            {checkoutStep === 'waiting' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Loader2 size={36} color="#C8482E" className="animate-spin" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>En attente de paiement</h3>
                
                {paymentInstructions?.type === 'ussd' && paymentInstructions?.ussd_code ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 8 }}>Veuillez composer ce code sur votre téléphone :</p>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#F2EDE4', letterSpacing: '2px' }}>{paymentInstructions.ussd_code}</div>
                  </div>
                ) : paymentInstructions?.type === 'redirect' && paymentInstructions?.payment_url ? (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 12 }}>Veuillez finaliser le paiement sur la page de votre opérateur.</p>
                    <a href={paymentInstructions.payment_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#C8482E', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                      Ouvrir la page de paiement
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 20 }}>
                    Veuillez valider le paiement (notification push ou message USSD) qui vient d&apos;être envoyé sur votre téléphone.
                  </p>
                )}
                
                <p style={{ fontSize: 11, color: '#666' }}>Ne fermez pas cette fenêtre. La validation est automatique.</p>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={30} color="#22c55e" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#F2EDE4' }}>Paiement Réussi !</h3>
                <p style={{ fontSize: 14, color: '#A1A1AA' }}>Bienvenue dans Fotia Premium Pro. Votre compte est maintenant activé.</p>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </div>
  )
}
