'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { inputStyle } from './ui'

interface PasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function PasswordModal({ open, onClose }: PasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleClose = () => {
    onClose()
    setSent(false)
    setEmail('')
    setError('')
  }

  const handleSend = async () => {
    if (!email.trim()) { setError('Veuillez entrer votre adresse email.'); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="settings-modal-card"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, position: 'relative' }}
          >
            <button onClick={handleClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890' }}>
              <X size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={16} color="#C8482E" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Changer le mot de passe</h3>
            </div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={26} color="#22c55e" />
                  </div>
                </div>
                <p style={{ color: '#A09890', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                  Si un compte existe avec <strong style={{ color: '#F2EDE4' }}>{email}</strong>, vous recevrez un lien de réinitialisation.
                </p>
                <button
                  onClick={handleClose}
                  style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, cursor: 'pointer' }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: '#A09890', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                  Vous recevrez un lien par email pour réinitialiser votre mot de passe en toute sécurité.
                </p>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 14, color: '#EF4444', fontSize: 12 }}>
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                <input
                  type="email" placeholder="Votre email actuel"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  style={{ ...inputStyle, marginBottom: 16 }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(200,72,46,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleClose}
                    style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{ flex: 1, padding: '12px', borderRadius: 10, background: loading ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #DF5438, #C8482E)', color: loading ? '#888' : '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(200,72,46,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Envoi...</> : 'Envoyer'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
