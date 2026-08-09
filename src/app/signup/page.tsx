'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { FieldError } from '@/components/ui'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10, minHeight: '44px',
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
  color: '#F2EDE4', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
const inputErrorStyle: React.CSSProperties = { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' }

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; pwd?: string }>({})

  const pwdStrong = pwd.length >= 8

  const validate = (): boolean => {
    const errs: { email?: string; pwd?: string } = {}
    const trimmed = email.trim()
    if (!trimmed) {
      errs.email = 'Veuillez entrer votre adresse email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errs.email = 'Adresse email invalide. Exemple : nom@exemple.com'
    }
    if (!pwd) {
      errs.pwd = 'Veuillez choisir un mot de passe.'
    } else if (pwd.length < 8) {
      errs.pwd = 'Le mot de passe doit contenir au moins 8 caractères.'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        router.push('/dashboard')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
      })
      if (error) throw error
      
      if (data.session) {
        router.push('/dashboard')
      } else {
        setSuccess('Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(translateAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        router.push('/dashboard')
        return
      }
      const appUrl = (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')).replace(/\/+$/, '')
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${appUrl}/auth/callback` },
      })
    } catch (err) {
      setError('Erreur lors de la connexion Google')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <img src="/logo.png" alt="Fotia Logo" width={110} style={{ objectFit: 'contain' }} />
        </div>

        <div className="auth-card" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 24px 20px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4, textAlign: 'center' }}>Créer un compte</h1>
          <p style={{ color: '#A09890', fontSize: 13.5, textAlign: 'center', marginBottom: 12 }}>Rejoignez des centaines de photographes</p>

          {/* Success message */}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20, color: '#22c55e', fontSize: 13 }}>
              <Check size={16} /> {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#EF4444', fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, fontSize: 15, marginBottom: 14, cursor: 'pointer', width: '100%', minHeight: '44px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continuer avec Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#A09890' }}>ou avec votre email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#A09890', display: 'block', marginBottom: 6 }}>Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(f => ({ ...f, email: undefined })) }}
                  onBlur={() => { if (email) validate() }}
                  placeholder="vous@exemple.com"
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                  style={fieldErrors.email ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
                />
                <FieldError id="signup-email-error" message={fieldErrors.email} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#A09890', display: 'block', marginBottom: 6 }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwd}
                    onChange={e => { setPwd(e.target.value); if (fieldErrors.pwd) setFieldErrors(f => ({ ...f, pwd: undefined })) }}
                    onBlur={() => { if (pwd) validate() }}
                    placeholder="Min. 8 caractères"
                    aria-invalid={fieldErrors.pwd ? true : undefined}
                    aria-describedby={fieldErrors.pwd ? 'signup-pwd-error' : undefined}
                    style={fieldErrors.pwd ? { ...inputStyle, paddingRight: 44, ...inputErrorStyle } : { ...inputStyle, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A09890', cursor: 'pointer', display: 'flex' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwd.length > 0 && !fieldErrors.pwd && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: pwdStrong ? '#22c55e' : '#A09890' }}>
                    {pwdStrong ? <Check size={12} color="#22c55e" /> : <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />}
                    {pwdStrong ? 'Mot de passe fort' : `${8 - pwd.length} caractères manquants`}
                  </div>
                )}
                <FieldError id="signup-pwd-error" message={fieldErrors.pwd} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, marginTop: 16, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Créer mon compte gratuit'} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Benefits */}
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['3 galeries gratuites pour démarrer', 'Partage WhatsApp instantané', 'Aucune carte bancaire requise'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A09890' }}>
                <Check size={13} color="#22c55e" /> {b}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 14, color: '#A09890' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#A09890' }}>
          En continuant, vous acceptez nos <Link href="/terms" style={{ color: '#C8482E', textDecoration: 'none' }}>Conditions</Link> et notre <Link href="/privacy" style={{ color: '#C8482E', textDecoration: 'none' }}>Politique de confidentialité</Link>
        </p>
      </motion.div>

      <style>{`        @media (max-width: 640px) {
          .auth-page { padding-top: 32px; padding-right: 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important; padding-left: 12px; }
          .auth-card { padding: 18px 18px 14px !important; }
        }
        @media (max-width: 380px) {
          .auth-page { padding-top: 12px; padding-right: 10px; padding-bottom: calc(6px + env(safe-area-inset-bottom)) !important; padding-left: 10px; }
          .auth-card { padding: 12px 12px 6px !important; }
        }
      `}</style>
    </div>
  )
}