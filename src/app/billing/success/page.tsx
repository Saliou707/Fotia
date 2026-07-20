'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

export default function BillingSuccessPage() {
  const [dots, setDots] = useState<number[]>([])
  const [userName, setUserName] = useState<string>('')
  const { t } = useLanguage()

  useEffect(() => {
    setDots(Array.from({ length: 20 }, (_, i) => i))
    // Récupérer le nom de l'utilisateur
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, display_name')
          .eq('id', user.id)
          .single()
        const name = profile?.name || profile?.display_name || user.email?.split('@')[0] || ''
        setUserName(name)
      }
    }
    fetchUser()
  }, [])

  const description = typeof t('billing.success.description') === 'function'
    // @ts-ignore
    ? (t as any)('billing.success.description')(userName)
    : userName
      ? `Félicitations ${userName} ! Votre compte a été mis à jour vers le plan Premium Pro. Vous disposez désormais de galeries illimitées et de toutes les fonctionnalités avancées.`
      : `Votre compte a été mis à jour vers le plan Premium Pro. Vous disposez désormais de galeries illimitées et de toutes les fonctionnalités avancées.`

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
      {dots.map((d) => (
        <div key={d} style={{
          position: 'absolute',
          width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
          borderRadius: '50%',
          background: 'rgba(200,72,46,0.3)',
          top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          pointerEvents: 'none'
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

        {/* Nom personnalisé */}
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
          {t('billing.success.title').split('!')[0]}
          <span style={{ color: '#C8482E' }}>!</span>
        </h1>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 99,
          background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.15)',
          marginBottom: 24, fontSize: 12, color: '#DF5D43',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
          <Sparkles size={12} /> {t('billing.success.badge')}
        </div>

        <p style={{ fontSize: 16, color: '#A09890', lineHeight: 1.6, marginBottom: 36 }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            {t('billing.success.goToDashboard')} <ArrowRight size={18} />
          </Link>

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
            {t('billing.success.seeSettings')}
          </Link>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 12, color: '#5A5550',
          marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16
        }}>
          {t('billing.success.footer')}
        </p>
      </motion.div>
    </div>
  )
}
