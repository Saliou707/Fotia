'use client'

import { User, ExternalLink, Loader2, Check } from 'lucide-react'
import { Card, SectionHeader, SettingRow, inputStyle } from './ui'
import type { ProfileForm } from './types'

interface ProfileSectionProps {
  form: ProfileForm
  loading: boolean
  saving: boolean
  saved: boolean
  onChange: (patch: Partial<ProfileForm>) => void
  onSave: () => void
}

export default function ProfileSection({ form, loading, saving, saved, onChange, onSave }: ProfileSectionProps) {
  const { name, phone, bio, instagram, facebook, tiktok, website } = form

  const focusStyle = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = 'rgba(200,72,46,0.5)'),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {loading ? (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <Loader2 size={22} color="#C8482E" className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div style={{ color: '#A09890', fontSize: 14 }}>Chargement du profil...</div>
        </Card>
      ) : (
        <>
          {/* Infos de base */}
          <Card>
            <SectionHeader label="Informations personnelles" icon={User} />
            <SettingRow label="Nom d'affichage" hint="Visible sur vos galeries partagées">
              <input
                value={name} onChange={e => onChange({ name: e.target.value })}
                style={inputStyle} placeholder="Votre nom"
                {...focusStyle}
              />
            </SettingRow>
            <SettingRow label="Téléphone / WhatsApp" hint="Pour la mise en contact client">
              <input
                value={phone} onChange={e => onChange({ phone: e.target.value })}
                style={inputStyle} placeholder="+224 6XX XXX XXX"
                {...focusStyle}
              />
            </SettingRow>
            <SettingRow label="Biographie" hint="Affiché sur vos galeries publiques" last>
              <textarea
                value={bio} onChange={e => onChange({ bio: e.target.value })}
                style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                placeholder="Quelques mots sur votre univers photographique..."
                {...focusStyle}
              />
            </SettingRow>
          </Card>

          {/* Réseaux sociaux */}
          <Card>
            <SectionHeader label="Réseaux & Portfolio" icon={ExternalLink} />
            {[
              { label: 'Instagram', hint: '@votre_compte', value: instagram, key: 'instagram' as const, icon: '📸' },
              { label: 'Facebook', hint: 'Lien vers votre page', value: facebook, key: 'facebook' as const, icon: '📘' },
              { label: 'TikTok', hint: '@votre_compte', value: tiktok, key: 'tiktok' as const, icon: '🎵' },
              { label: 'Site / Portfolio', hint: 'https://...', value: website, key: 'website' as const, icon: '🌐' },
            ].map(({ label, hint, value, key, icon }, i, arr) => (
              <SettingRow key={label} label={label} hint={hint} last={i === arr.length - 1}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>{icon}</span>
                  <input
                    value={value} onChange={e => onChange({ [key]: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    placeholder={hint}
                    {...focusStyle}
                  />
                </div>
              </SettingRow>
            ))}
          </Card>

          {/* Save */}
          <div className="settings-save-row" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onSave} disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 12,
                background: saved ? 'rgba(34,197,94,0.9)' : saving ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #DF5438, #C8482E)',
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
  )
}
