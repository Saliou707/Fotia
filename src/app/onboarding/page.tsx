'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, ArrowRight, Loader2, Link as LinkIcon, Phone } from 'lucide-react'

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
  color: '#F7F7F5', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s'
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    website: '',
    bio: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

      // Set public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
      setAvatarUrl(`${publicUrl}/${key}`)
    } catch (err) {
      console.error('Avatar upload failed', err)
      alert('Erreur lors de l\'upload de la photo.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      await supabase.from('profiles').update({
        display_name: formData.displayName,
        phone: formData.phone,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
        website: formData.website,
        bio: formData.bio,
        avatar_url: avatarUrl || null,
        onboarding_completed: true
      }).eq('id', user.id)

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde du profil.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 520, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Complétez votre profil 📸</h1>
          <p style={{ color: '#A1A1AA', fontSize: 15, lineHeight: 1.5 }}>
            Ces informations apparaîtront sur vos galeries clientes. Aucun champ n'est obligatoire, mais un profil complet donne plus confiance !
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 96, height: 96, borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            >
              {!avatarUrl && !uploadingAvatar && <Camera size={32} color="#A1A1AA" />}
              {uploadingAvatar && <Loader2 size={32} color="#C8482E" className="animate-spin" />}
              
              {/* Overlay on hover */}
              {avatarUrl && !uploadingAvatar && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="hover-overlay">
                  <Camera size={24} color="#FFF" />
                </div>
              )}
            </div>
            <span style={{ fontSize: 13, color: '#A1A1AA', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? 'Changer la photo' : 'Ajouter une photo de profil'}
            </span>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7' }}>Nom d'affichage ou du Studio</label>
            <input placeholder="Ex: Studio Photography" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7' }}>Biographie courte</label>
            <textarea placeholder="Photographe spécialisé en..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> WhatsApp</label>
              <input placeholder="+33 6..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6 }}><Instagram size={14} /> Instagram</label>
              <input placeholder="@votrecompte" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6 }}><Facebook size={14} /> Facebook</label>
              <input placeholder="Lien vers votre page" value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                TikTok
              </label>
              <input placeholder="@votrecompte" value={formData.tiktok} onChange={e => setFormData({ ...formData, tiktok: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', display: 'flex', alignItems: 'center', gap: 6 }}><LinkIcon size={14} /> Site Web</label>
            <input placeholder="https://votresite.com" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} style={inputStyle} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: 12, width: '100%', padding: '16px', borderRadius: 14, background: '#C8482E', color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Continuer vers le tableau de bord <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <style>{`
          .hover-overlay:hover {
            opacity: 1 !important;
          }
          input:focus, textarea:focus {
            border-color: #C8482E !important;
            background: rgba(200,72,46,0.05) !important;
          }
        `}</style>
      </motion.div>
    </div>
  )
}

