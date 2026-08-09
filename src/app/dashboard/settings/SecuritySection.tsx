'use client'

import { Lock, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card, SectionHeader, SettingRow, Toggle } from './ui'

interface SecuritySectionProps {
  onOpenPassword: () => void
}

export default function SecuritySection({ onOpenPassword }: SecuritySectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionHeader label="Accès & Authentification" icon={Lock} />
        <button
          onClick={onOpenPassword}
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', width: '100%',
            background: 'none', border: 'none',
            color: '#E5DDD6', cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Changer le mot de passe</div>
            <div style={{ fontSize: 12, color: '#A09890', marginTop: 2 }}>Envoi d&apos;un lien de réinitialisation par email</div>
          </div>
          <ChevronRight size={16} color="#555" />
        </button>
        <SettingRow label="Authentification 2FA" hint="Sécurisez votre compte avec un second facteur" last>
          <Toggle on={false} onChange={() => {}} />
        </SettingRow>
      </Card>

      {/* Danger zone */}
      <Card className="settings-danger-zone" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
        <SectionHeader label="Zone de danger" icon={AlertTriangle} />
        <div className="settings-danger-content" style={{ padding: '20px' }}>
          <div style={{ fontSize: 13, color: '#A09890', marginBottom: 16, lineHeight: 1.6 }}>
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
  )
}
