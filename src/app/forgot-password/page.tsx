'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
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
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                </div>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
                Email envoyé ✉️
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Si un compte existe avec <strong style={{ color: '#F2EDE4' }}>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <p style={{ color: '#71717A', fontSize: 13, marginBottom: 24 }}>
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
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6, textAlign: 'center' }}>
                Mot de passe oublié ? 🔐
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
                Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {/* Error message */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    style={inputStyle}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#C8482E', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: '48px' }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer le lien'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#A1A1AA' }}>
                Vous vous souvenez ?{' '}
                <Link href="/login" style={{ color: '#C8482E', textDecoration: 'none', fontWeight: 600 }}>
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
