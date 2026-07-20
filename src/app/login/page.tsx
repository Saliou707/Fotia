'use client'
import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'
import LangSwitcher from '@/components/LangSwitcher'

// Separated into its own component because useSearchParams requires Suspense
function SessionExpiredBanner({ onExpired }: { onExpired: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams?.get('error') === 'session_expired') {
      onExpired()
    }
  }, [searchParams, onExpired])
  return null
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const { translations: tr } = useLanguage()
  const a = tr.auth

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        // Mode demo - allow login
        router.push('/dashboard')
        return
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: pwd,
        })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: {
            data: { full_name: name },
          },
        })
        if (error) throw error
        if (data.session) {
          router.push('/dashboard')
        } else {
          setSuccess('Inscription réussie ! Vérifiez votre boîte mail.')
          setMode('login')
        }
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      // Map Supabase error messages to user-friendly French messages
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email ou mot de passe incorrect. Si vous avez utilisé Google pour vous inscrire, cliquez sur « Continuer avec Google ».',
        'Email not confirmed': 'Veuillez confirmer votre adresse email avant de vous connecter.',
        'User already registered': 'Un compte existe déjà avec cette adresse email.',
        'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
      }
      setError(errorMap[rawMessage] ?? rawMessage)
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
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    } catch (err) {
      setError('Erreur lors de la connexion Google')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: '48px' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', paddingTop: '80px', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <Link href="/" style={{ position: 'absolute', top: 24, left: 24, display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A1A1AA', textDecoration: 'none', fontWeight: 500, fontSize: 14, zIndex: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }} className="hover:bg-white/10 transition">
        <ArrowLeft size={16} /> {a.backHome}
      </Link>
      {/* Language switcher */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <LangSwitcher variant="compact" />
      </div>
      
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Detect session expiry from URL params */}
        <Suspense fallback={null}>
          <SessionExpiredBanner onExpired={() => setSessionExpired(true)} />
        </Suspense>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <Image src="/logo.png" alt="Fotia Logo" width={120} height={40} priority style={{ width: 'auto', height: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6, textAlign: 'center' }}>
            {mode === 'login' ? `Bon retour 👋` : a.signupTitle}
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
            {mode === 'login' ? 'Connectez-vous à votre espace photographe' : 'Rejoignez des centaines de photographes'}
          </p>

          {/* Session expired message */}
          {sessionExpired && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', marginBottom: 20, color: '#fbbf24', fontSize: 13, lineHeight: 1.5 }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{a.sessionExpired}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20, color: '#22c55e', fontSize: 13 }}>
              <AlertCircle size={16} /> {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Google button */}
          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, fontSize: 15, marginBottom: 20, transition: 'background 0.2s', cursor: 'pointer', width: '100%', minHeight: '48px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continuer avec Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#A1A1AA' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'signup' && (
                <div>
                  <label style={labelStyle}>{a.nameLabel}</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={a.namePlaceholder} style={inputStyle} required={mode === 'signup'} />
                </div>
              )}
              <div>
                <label style={labelStyle}>{a.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={a.emailPlaceholder} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>{a.passwordLabel}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} required minLength={6} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Link href="/forgot-password" style={{ fontSize: 13, color: '#A1A1AA', textDecoration: 'none' }}>{a.forgotPassword}</Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, marginTop: 24, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: '48px' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? a.loginBtn : a.signupBtn)} {loading ? '' : <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#A1A1AA' }}>
            {mode === 'login' ? `${a.noAccount} ` : `${a.alreadyAccount} `}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: '#C8482E', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px' }}>
              {mode === 'login' ? a.signupLink : a.loginLink}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#A1A1AA' }}>
          En continuant, vous acceptez nos <Link href="/terms" style={{ color: '#C8482E', textDecoration: 'none' }}>Conditions</Link> et notre <Link href="/privacy" style={{ color: '#C8482E', textDecoration: 'none' }}>Politique de confidentialité</Link>
        </p>
      </motion.div>
    </div>
  )
}
