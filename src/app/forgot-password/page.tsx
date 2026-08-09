'use client'
/* eslint-disable @next/next/no-img-element */
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { FieldError } from '@/components/ui'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = (): boolean => {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError('Veuillez entrer votre adresse email.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Adresse email invalide. Exemple : nom@exemple.com')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!validateEmail()) return
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setSent(true)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(translateAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: '48px', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const inputErrorStyle: React.CSSProperties = { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#A09890', display: 'block', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }} className="auth-page">
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="Fotia Logo" width={110} style={{ objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div className="auth-card" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 24px 20px', width: '100%', boxSizing: 'border-box' }}>
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                </div>
              </div>
              {/* div stylé comme un h1 : un seul <h1> par page (SEO) — le H1 est "Mot de passe oublié ?" */}
              <div role="status" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Email envoyé ✉️
              </div>
              <p style={{ color: '#A09890', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Si un compte existe avec <strong style={{ color: '#F2EDE4' }}>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <p style={{ color: '#A09890', fontSize: 13, marginBottom: 24 }}>
                Pensez à vérifier vos spams si vous ne le trouvez pas.
              </p>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                <ArrowLeft size={16} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={28} color="#C8482E" />
                </div>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4, textAlign: 'center' }}>
                Mot de passe oublié ? 🔐
              </h1>
              <p style={{ color: '#A09890', fontSize: 13.5, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {/* Error message */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#EF4444', fontSize: 13 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError('') }}
                    onBlur={() => { if (email) validateEmail() }}
                    placeholder="vous@exemple.com"
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? 'forgot-email-error' : undefined}
                    style={emailError ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
                    autoFocus
                  />
                  <FieldError id="forgot-email-error" message={emailError} />
                </div>

                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: '48px' }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer le lien'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: '#A09890' }}>
                Vous vous souvenez ?{' '}
                <Link href="/login" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .auth-page { padding-top: 56px; padding-right: 12px; padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important; padding-left: 12px; }
          .auth-card { padding: 20px 18px 16px !important; }
        }
        @media (max-width: 380px) {
          .auth-page { padding-top: 40px; padding-right: 10px; padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important; padding-left: 10px; }
          .auth-card { padding: 16px 12px 12px !important; }
        }
      `}</style>
    </div>
  )
}
