'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Check, Star, HardDrive, AlertTriangle } from 'lucide-react'
import { Card, SectionHeader } from './ui'
import { computeUsage } from './usage'
import type { BillingData } from './types'

interface BillingSectionProps {
  billing: BillingData
  billingLoading: boolean
  onUpgrade: () => void
}

const PRO_FEATURES = [
  { icon: '∞', label: 'Galeries illimitées' },
  { icon: '📷', label: '1000 photos/galerie' },
  { icon: '💾', label: '100 Go de stockage' },
  { icon: '⬇️', label: 'Téléchargement HD' },
  { icon: '🎨', label: 'Filigrane personnalisé' },
  { icon: '📊', label: 'Stats en temps réel' },
]

export default function BillingSection({ billing, billingLoading, onUpgrade }: BillingSectionProps) {
  const { plan, storageUsedBytes, galleryCount, subscription } = billing

  const { storageGB, maxStorageGB, storagePercent } = computeUsage(plan, storageUsedBytes)
  const galleryPercent = plan === 'free' ? Math.min(100, (galleryCount / 3) * 100) : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Plan card */}
      <Card style={{
        background: plan === 'free'
          ? 'rgba(17,17,17,0.9)'
          : 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(17,17,17,0.95) 60%)',
        border: plan === 'free' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(251,191,36,0.2)',
      }}>
        <div className="settings-billing-header" style={{ padding: '24px 24px 20px' }}>
          <div className="settings-billing-plan-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: plan === 'free' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))',
                border: plan === 'free' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(251,191,36,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {plan === 'free' ? <Zap size={22} color="#A09890" /> : <Sparkles size={22} color="#E8B33D" />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 3 }}>
                  {plan === 'free' ? 'Plan Essentiel' : 'Plan Premium Pro'}
                </div>
                {plan !== 'free' && subscription && (
                  <div style={{ fontSize: 13, color: '#E8B33D', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Check size={13} /> Actif · Expire le {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {plan === 'free' && (
                  <div style={{ fontSize: 13, color: '#A09890' }}>3 galeries · 100 photos/galerie · 5 Go</div>
                )}
              </div>
            </div>

            {plan === 'free' ? (
              <button
                onClick={onUpgrade}
                disabled={billingLoading}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
                  border: '1px solid rgba(251,191,36,0.3)',
                  color: '#E8B33D', fontSize: 13, fontWeight: 700,
                  cursor: billingLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(245,158,11,0.12))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))')}
              >
                <Sparkles size={14} />
                {billingLoading ? 'Chargement...' : 'Passer au Pro'}
              </button>
            ) : null}
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
            <Sparkles size={18} color="#E8B33D" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#A09890', lineHeight: 1.55 }}>
              Passez au <strong style={{ color: '#E8B33D' }}>Plan Pro</strong> pour des galeries illimitées, 1000 photos/galerie et le téléchargement HD.
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
            <div style={{ fontSize: 13, color: '#A09890', lineHeight: 1.55 }}>
              Votre abonnement <strong style={{ color: '#E8B33D' }}>Premium Pro</strong> est actif. Galeries illimitées, téléchargement HD et support prioritaire.
            </div>
          </div>
        )}

        {/* Usage bars */}
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Galeries */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A09890', marginBottom: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={11} />Galeries Créées
              </span>
              <span style={{ fontFamily: 'monospace', color: '#A09890' }}>
                {galleryCount}{plan === 'free' ? ' / 3' : ''}
                {plan !== 'free' && <span style={{ marginLeft: 4, color: '#E8B33D' }}>∞ Illimité</span>}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${galleryPercent}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: plan !== 'free' ? 'linear-gradient(90deg, #E8B33D, #F59E0B)'
                    : galleryCount >= 3 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5438)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A09890', marginBottom: 8 }}>
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
                    ? 'linear-gradient(90deg, #E8B33D, #F59E0B)'
                    : storagePercent > 85 ? '#EF4444' : 'linear-gradient(90deg, #C8482E, #DF5438)',
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
          <div className="settings-feature-grid" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PRO_FEATURES.map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: '#A09890' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <button
              onClick={onUpgrade}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: 'linear-gradient(135deg, #DF5438, #C8482E)',
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
  )
}
