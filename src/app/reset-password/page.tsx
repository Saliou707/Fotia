'use client'
/* eslint-disable @next/next/no-img-element */
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { FieldError } from '@/components/ui'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{ pwd?: string; confirm?: string }>({})

  // Supabase sets the session from the URL hash automatically
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setSessionReady(true)
        setCheckingSession(false)
        return
      }

      // Listen for auth state changes (Supabase processes the hash)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true)
          setCheckingSession(false)
        }
      })

      // Also check current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
        setCheckingSession(false)
      }

      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        setCheckingSession(false)
      }, 5000)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const errs: { pwd?: string; confirm?: string } = {}
    if (!password) {
      errs.pwd = 'Veuillez choisir un mot de passe.'
    } else if (password.length < 6) {
      errs.pwd = 'Le mot de passe doit contenir au moins 6 caractères.'
    }
    if (!confirmPassword) {
      errs.confirm = 'Veuillez confirmer le mot de passe.'
    } else if (password !== confirmPassword) {
      errs.confirm = 'Les mots de passe ne correspondent pas.'
    }
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        setSuccess(true)
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
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
    <div className="auth-page" style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,84,56,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="Fotia Logo" width={110} style={{ objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div className="auth-card" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 24px 20px', width: '100%', boxSizing: 'border-box' }}>
          {success ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                </div>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Mot de passe mis à jour ✅
              </h1>
              <p style={{ color: '#A09890', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button onClick={() => router.push('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: '#C8482E', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', minHeight: '48px' }}>
                Se connecter
              </button>
            </div>
          ) : checkingSession ? (
            /* Loading session state */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#C8482E' }} />
              <p style={{ color: '#A09890', fontSize: 14 }}>Vérification du lien de réinitialisation...</p>
            </div>
          ) : !sessionReady ? (
            /* Invalid/expired link state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={32} color="#EF4444" />
                </div>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Lien invalide ou expiré
              </h1>
              <p style={{ color: '#A09890', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                Ce lien de réinitialisation n&apos;est plus valide. Veuillez en demander un nouveau.
              </p>
              <Link href="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={28} color="#C8482E" />
                </div>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4, textAlign: 'center' }}>
                Nouveau mot de passe 🔑
              </h1>
              <p style={{ color: '#A09890', fontSize: 13.5, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>

              {/* Error message */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#EF4444', fontSize: 13 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (fieldErrors.pwd) setFieldErrors(f => ({ ...f, pwd: undefined })) }}
                        placeholder="••••••••"
                        aria-invalid={fieldErrors.pwd ? true : undefined}
                        aria-describedby={fieldErrors.pwd ? 'reset-pwd-error' : undefined}
                        style={fieldErrors.pwd ? { ...inputStyle, paddingRight: 44, ...inputErrorStyle } : { ...inputStyle, paddingRight: 44 }}
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A09890', cursor: 'pointer', display: 'flex' }}>
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <FieldError id="reset-pwd-error" message={fieldErrors.pwd} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); if (fieldErrors.confirm) setFieldErrors(f => ({ ...f, confirm: undefined })) }}
                        placeholder="••••••••"
                        aria-invalid={fieldErrors.confirm ? true : undefined}
                        aria-describedby={fieldErrors.confirm ? 'reset-confirm-error' : undefined}
                        style={fieldErrors.confirm ? { ...inputStyle, paddingRight: 44, ...inputErrorStyle } : { ...inputStyle, paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A09890', cursor: 'pointer', display: 'flex' }}>
                        {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <FieldError id="reset-confirm-error" message={fieldErrors.confirm} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#C8482E', color: '#fff', fontWeight: 700, fontSize: 16, marginTop: 24, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: '48px' }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Réinitialiser le mot de passe'}
                </button>
              </form>
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
