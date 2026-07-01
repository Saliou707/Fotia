'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
  color: '#F2EDE4', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const pwdStrong = pwd.length >= 8

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        router.push('/dashboard')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: { data: { full_name: name } },
      })
      if (error) throw error
      
      if (data.session) {
        router.push('/dashboard')
      } else {
        setSuccess('Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
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

  return (
    <div style={{ minHeight: '100vh', background: '#15171A', color: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', overflow: 'hidden' }}>
      <Link href="/" style={{ position: 'absolute', top: 24, left: 24, display: 'inline-flex', alignItems: 'center', gap: 8, color: '#A1A1AA', textDecoration: 'none', fontWeight: 500, fontSize: 14, zIndex: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="Fotia Logo" width={120} style={{ objectFit: 'contain' }} />
        </div>

        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6, textAlign: 'center' }}>Créer un compte</h1>
          <p style={{ color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>Rejoignez 500+ photographes sur Fotia</p>

          {/* Success message */}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20, color: '#22c55e', fontSize: 13 }}>
              <Check size={16} /> {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#F2EDE4', textDecoration: 'none', fontWeight: 500, fontSize: 15, marginBottom: 20, cursor: 'pointer', width: '100%' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continuer avec Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#A1A1AA' }}>ou avec votre email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: 8 }}>Nom complet</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ibrahima Diallo" style={inputStyle} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: 8 }}>Adresse email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" style={inputStyle} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', display: 'block', marginBottom: 8 }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Min. 8 caractères" style={{ ...inputStyle, paddingRight: 44 }} required minLength={8} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwd.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: pwdStrong ? '#22c55e' : '#A1A1AA' }}>
                    {pwdStrong ? <Check size={12} color="#22c55e" /> : <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />}
                    {pwdStrong ? 'Mot de passe fort' : `${8 - pwd.length} caractères manquants`}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, marginTop: 24, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Créer mon compte gratuit'} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Benefits */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['3 galeries gratuites pour démarrer', 'Partage WhatsApp instantané', 'Aucune carte bancaire requise'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A1A1AA' }}>
                <Check size={13} color="#22c55e" /> {b}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#A1A1AA' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#A1A1AA' }}>
          En continuant, vous acceptez nos <Link href="/terms" style={{ color: '#C8482E', textDecoration: 'none' }}>Conditions</Link> et notre <Link href="/privacy" style={{ color: '#C8482E', textDecoration: 'none' }}>Politique de confidentialité</Link>
        </p>
      </motion.div>
    </div>
  )
}