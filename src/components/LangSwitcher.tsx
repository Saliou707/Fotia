'use client'
/**
 * LangSwitcher — Bouton de changement de langue FR/EN
 * Compact, animé, à placer dans la topbar ou la sidebar
 */
import { useLanguage, type Lang } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Globe } from 'lucide-react'

const FLAGS: Record<Lang, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
}

const LABELS: Record<Lang, string> = {
  fr: 'FR',
  en: 'EN',
}

interface LangSwitcherProps {
  variant?: 'compact' | 'full'
}

export default function LangSwitcher({ variant = 'compact' }: LangSwitcherProps) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  const otherLang: Lang = lang === 'fr' ? 'en' : 'fr'

  if (variant === 'compact') {
    // Simple toggle sans dropdown
    return (
      <button
        onClick={() => setLang(otherLang)}
        title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          color: '#A09890',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#F2EDE4'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#A09890'
        }}
      >
        <Globe size={13} />
        <span>{FLAGS[lang]}</span>
        <span>{LABELS[lang]}</span>
      </button>
    )
  }

  // Full dropdown variant
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          background: open ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          color: '#A09890',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Globe size={14} />
        <span>{FLAGS[lang]} {LABELS[lang]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: 130,
              borderRadius: 10,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {(['fr', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  width: '100%',
                  background: l === lang ? 'rgba(200,72,46,0.08)' : 'transparent',
                  border: 'none',
                  color: l === lang ? '#C8482E' : '#A09890',
                  fontSize: 13,
                  fontWeight: l === lang ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (l !== lang) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  if (l !== lang) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: 18 }}>{FLAGS[l]}</span>
                <span>{l === 'fr' ? 'Français' : 'English'}</span>
                {l === lang && (
                  <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
