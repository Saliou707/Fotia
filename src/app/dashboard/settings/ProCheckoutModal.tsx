'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Check, ChevronLeft, Loader2 } from 'lucide-react'
import { inputStyle } from './ui'

interface ProCheckoutModalProps {
  open: boolean
  billingLoading: boolean
  onClose: () => void
  onCheckout: (phone: string) => void
}

const PRO_PERKS = ['Galeries illimitées', '1000 photos / galerie', 'Téléchargement HD', 'Filigrane personnalisé', 'Support prioritaire']
const PAYMENT_METHODS = ['Orange Money', 'MTN MoMo', 'Kulu']

export default function ProCheckoutModal({ open, billingLoading, onClose, onCheckout }: ProCheckoutModalProps) {
  const [step, setStep] = useState<'plan' | 'form'>('plan')
  const [phone, setPhone] = useState('')

  const handleClose = () => {
    setStep('plan')
    setPhone('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="settings-modal-card"
            style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 22, padding: 28, width: '100%', maxWidth: 420, position: 'relative',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            <button
              onClick={handleClose}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890' }}
            >
              <X size={15} />
            </button>

            {/* Étape 1 — présentation du plan */}
            <AnimatePresence mode="wait">
              {step === 'plan' && (
                <motion.div key="plan" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={18} color="#E8B33D" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Passer au Plan Pro</h3>
                    </div>
                  </div>
                  <p style={{ color: '#A09890', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Profitez de toutes les fonctionnalités premium !</p>

                  <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(200,72,46,0.08), rgba(200,72,46,0.04))', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(200,72,46,0.15)' }}>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(200, 72, 46, 0.15)', color: '#DF5438', borderRadius: '12px', fontSize: '11px', fontWeight: 800, marginBottom: '12px', border: '1px solid rgba(200, 72, 46, 0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🎉 Offre Spéciale Bêta (1er mois)
                    </div>
                    <div className="settings-pro-price" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
                      1 000 <span style={{ fontSize: 15, fontWeight: 500, color: '#A09890' }}>GNF/mois</span>
                      <span style={{ fontSize: 14, color: '#555', fontWeight: 600, textDecoration: 'line-through', marginLeft: 12 }}>15 €</span>
                    </div>
                    <ul style={{ fontSize: 13, color: '#E5DDD6', margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {PRO_PERKS.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Check size={13} color="#C8482E" style={{ flexShrink: 0 }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Méthodes */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                    {PAYMENT_METHODS.map(m => (
                      <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#A09890', border: '1px solid rgba(255,255,255,0.09)' }}>{m}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('form')}
                    style={{ width: '100%', padding: '15px', borderRadius: 12, background: 'linear-gradient(135deg, #DF5438, #C8482E)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,72,46,0.35)' }}
                  >
                    Payer avec Mobile Money
                  </button>
                </motion.div>
              )}

              {/* Étape 2 — saisie numéro + redirect Djomy */}
              {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <button
                      onClick={() => setStep('plan')}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#A09890', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: 8, padding: '5px 8px' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Votre numéro Mobile Money</h3>
                  </div>
                  <p style={{ color: '#A09890', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
                    Entrez le numéro associé à votre compte Mobile Money (Orange Money, MTN MoMo ou Kulu).
                    Vous serez redirigé vers le portail Djomy pour finaliser le paiement.
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, color: '#A09890', marginBottom: 8, display: 'block', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Numéro de téléphone</label>
                    <input
                      type="tel"
                      placeholder="Ex: 00224623707722"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ ...inputStyle, fontSize: 16, letterSpacing: '0.05em' }}
                      autoFocus
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(200,72,46,0.5)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                    />
                    <p style={{ fontSize: 11, color: '#555', marginTop: 6 }}>Format international requis, ex : 00224 + votre numéro</p>
                  </div>

                  <button
                    id="djomy-pay-btn"
                    onClick={() => onCheckout(phone)}
                    disabled={billingLoading || !phone.trim()}
                    style={{
                      width: '100%', padding: '15px', borderRadius: 12,
                      background: billingLoading || !phone.trim() ? 'rgba(60,60,60,0.5)' : 'linear-gradient(135deg, #DF5438, #C8482E)',
                      color: billingLoading || !phone.trim() ? '#555' : '#fff',
                      border: 'none', fontWeight: 700, fontSize: 15,
                      cursor: billingLoading || !phone.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                      boxShadow: billingLoading || !phone.trim() ? 'none' : '0 6px 20px rgba(200,72,46,0.35)',
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
  )
}
