'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { fetchProfile } from '@/lib/api'

type VerifyState = 'checking' | 'active' | 'pending' | 'error'

// Étoiles décoratives générées une seule fois (hors rendu)
const DECOR_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
}))

export default function BillingSuccessClient() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  const [userName, setUserName] = useState<string>('')
  const [verifyState, setVerifyState] = useState<VerifyState>('checking')
  const [verifyMessage, setVerifyMessage] = useState<string>('')

  const verifySubscription = useCallback(async function verifySubscription(reference: string) {
    setVerifyState('checking')
    try {
      const res = await fetch('/api/billing/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: reference }),
      })
      const data = await res.json()

      if (data.success || data.already_active) {
        setVerifyState('active')
        setVerifyMessage('')
      } else if (data.status === 'pending') {
        // Paiement encore en attente — on réessaie après 3 secondes
        setVerifyState('pending')
        setVerifyMessage('Le paiement est en cours de confirmation par Djomy...')
        setTimeout(() => verifySubscription(reference), 3000)
      } else {
        setVerifyState('error')
        setVerifyMessage(data.message || data.error || 'Erreur lors de la vérification.')
      }
    } catch {
      setVerifyState('error')
      setVerifyMessage('Impossible de vérifier le paiement. Veuillez réessayer.')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const profile = await fetchProfile()
      if (profile) {
        const name = profile.display_name || profile.email.split('@')[0] || ''
        setUserName(name)

        // Si le profil est déjà pro, pas besoin de vérifier
        if (profile.plan === 'pro') {
          setVerifyState('active')
          return
        }
      }

      // Vérifier l'abonnement via l'API si on a une référence
      if (ref) {
        verifySubscription(ref)
      } else {
        // Pas de ref → on vérifie quand même si l'utilisateur est déjà pro
        setVerifyState('active')
      }
    }
    init()
  }, [ref, verifySubscription])

  const isActive = verifyState === 'active'
  const isLoading = verifyState === 'checking' || verifyState === 'pending'
  const isError = verifyState === 'error'

  const title = isActive
    ? 'Paiement réussi!'
    : isLoading
    ? 'Vérification du paiement...'
    : 'Paiement en attente'

  const description = isActive
    ? (userName
      ? `Félicitations ${userName} ! Votre compte a été mis à jour vers le plan Premium Pro. Vous disposez désormais de galeries illimitées et de toutes les fonctionnalités avancées.`
      : `Votre compte a été mis à jour vers le plan Premium Pro. Vous disposez désormais de galeries illimitées et de toutes les fonctionnalités avancées.`)
    : isLoading
    ? 'Nous vérifions votre paiement auprès de Djomy. Cela peut prendre quelques instants...'
    : verifyMessage || 'Votre paiement est en cours de traitement. Vous serez notifié dès que votre compte sera activé.'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#F5F0EB',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,72,46,0.15) 0%, transparent 70%)',
        top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 1
      }} />

      {/* Decorative stars */}
      {DECOR_DOTS.map(d => (
        <div key={d.id} style={{
          position: 'absolute',
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: 'rgba(200,72,46,0.3)',
          top: `${d.y}%`, left: `${d.x}%`,
          pointerEvents: 'none'
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="billing-card"
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(17,17,17,0.85)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(200,72,46,0.25)',
          borderRadius: 24, padding: '48px 36px', textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 80px rgba(200,72,46,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          zIndex: 2, position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute', top: '15%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,72,46,0.2) 0%, transparent 70%)',
          filter: 'blur(15px)', pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(200,72,46,0.1)', border: '2px solid #C8482E',
            color: '#C8482E', marginBottom: 28,
            boxShadow: '0 0 30px rgba(200,72,46,0.25)'
          }}
        >
          <CheckCircle size={36} strokeWidth={2.2} />
        </motion.div>

        {userName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 14, color: '#A09890', marginBottom: 8 }}
          >
            👋 {userName}
          </motion.p>
        )}

        <h1 style={{
          fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
          marginBottom: 16, color: '#F7F7F5', lineHeight: 1.1
        }}>
          Paiement réussi<span style={{ color: '#C8482E' }}>!</span>
        </h1>

        {/* Icône dynamique selon l'état */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%',
            background: isActive ? 'rgba(200,72,46,0.1)' : isError ? 'rgba(239,68,68,0.1)' : 'rgba(200,200,200,0.06)',
            border: `2px solid ${isActive ? '#C8482E' : isError ? '#EF4444' : 'rgba(255,255,255,0.15)'}`,
            color: isActive ? '#C8482E' : isError ? '#EF4444' : '#A09890',
            marginBottom: 28,
            boxShadow: isActive ? '0 0 30px rgba(200,72,46,0.25)' : 'none'
          }}
        >
          {isActive && <CheckCircle size={36} strokeWidth={2.2} />}
          {isLoading && <Loader2 size={36} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />}
          {isError && <AlertCircle size={36} strokeWidth={2.2} />}
        </motion.div>

        {userName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 14, color: '#A09890', marginBottom: 8 }}
          >
            👋 {userName}
          </motion.p>
        )}

        <h1 style={{
          fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
          marginBottom: 16, color: '#F7F7F5', lineHeight: 1.1
        }}>
          {title}<span style={{ color: isActive ? '#C8482E' : '#A09890' }}>{isActive ? '!' : ''}</span>
        </h1>

        {isActive && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 99,
            background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.15)',
            marginBottom: 24, fontSize: 12, color: '#DF5D43',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>
            <Sparkles size={12} /> Plan Premium Pro activé
          </div>
        )}

        <p style={{ fontSize: 16, color: '#A09890', lineHeight: 1.6, marginBottom: 36 }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isActive && (
            <Link
              href="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px 24px', borderRadius: 14, textDecoration: 'none',
                fontWeight: 700, fontSize: 16,
                background: 'linear-gradient(135deg, #DF5D43 0%, #C8482E 100%)',
                color: '#fff', boxShadow: '0 8px 24px rgba(200,72,46,0.3)', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 30px rgba(200,72,46,0.45)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(200,72,46,0.3)'
              }}
            >
              Aller au Dashboard <ArrowRight size={18} />
            </Link>
          )}

          {isError && (
            <button
              onClick={() => ref && verifySubscription(ref)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px 24px', borderRadius: 14, border: 'none',
                fontWeight: 700, fontSize: 16, cursor: 'pointer',
                background: 'linear-gradient(135deg, #DF5D43 0%, #C8482E 100%)',
                color: '#fff', boxShadow: '0 8px 24px rgba(200,72,46,0.3)', transition: 'all 0.2s ease'
              }}
            >
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Réessayer la vérification
            </button>
          )}

          <Link
            href="/dashboard/settings"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 24px', borderRadius: 14, textDecoration: 'none',
              fontWeight: 600, fontSize: 15,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)', color: '#A09890', transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#F7F7F5'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.02)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#A09890'
            }}
          >
            {isActive ? 'Voir mes paramètres' : 'Retour aux paramètres'}
          </Link>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 12, color: '#5A5550',
          marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16
        }}>
          {isActive
            ? "Merci d'avoir rejoint Fotia Pro. Votre compte est maintenant actif."
            : isLoading
            ? 'Patientez pendant que nous activons votre compte...'
            : 'En cas de problème, contactez le support.'}
        </p>
      </motion.div>

      <style>{`
        @media (max-width: 480px) {
          .billing-card { padding: 32px 20px !important; }
          .billing-card h1 { font-size: 26px !important; }
        }
        @media (max-width: 380px) {
          .billing-card { padding: 24px 14px !important; }
          .billing-card h1 { font-size: 22px !important; }
        }
      `}</style>
    </div>
  )
}
