'use client'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'

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

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

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
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: '48px' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', paddingTop: '80px', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <Link href="/login" style={{ position: 'absolute', top: 24, left: 24, display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A1A1AA', textDecoration: 'none', fontWeight: 500, fontSize: 14, zIndex: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }} className="hover:bg-white/10 transition">
        <ArrowLeft size={16} /> Retour à la connexion
      </Link>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="Fotia Logo" width={120} style={{ objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>
          {success ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                </div>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Mot de passe mis à jour ✅
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
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
              <p style={{ color: '#A1A1AA', fontSize: 14 }}>Vérification du lien de réinitialisation...</p>
            </div>
          ) : !sessionReady ? (
            /* Invalid/expired link state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={32} color="#ef4444" />
                </div>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Lien invalide ou expiré
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
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
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6, textAlign: 'center' }}>
                Nouveau mot de passe 🔑
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>

              {/* Error message */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ ...inputStyle, paddingRight: 44 }}
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex' }}>
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ ...inputStyle, paddingRight: 44 }}
                        required
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex' }}>
                        {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
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
    </div>
  )
}
