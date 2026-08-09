'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustedBySection from '@/components/landing/TrustedBySection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ClientExperienceSection from '@/components/landing/ClientExperienceSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import StatsSection from '@/components/landing/StatsSection'
import WhatsAppCtaSection from '@/components/landing/WhatsAppCtaSection'
import PricingSection from '@/components/landing/PricingSection'
import FaqSection from '@/components/landing/FaqSection'
import FinalCtaSection from '@/components/landing/FinalCtaSection'
import LandingFooter from '@/components/landing/LandingFooter'
import LandingJsonLd from '@/components/landing/LandingJsonLd'
import { NAV_LINKS } from '@/components/landing/landing-data'

// Modal de démo chargé à la demande — hors bundle initial (~16 Kio d'JS + images)
const DemoModal = dynamic(() => import('@/components/landing/DemoModal'), {
  ssr: false,
  loading: () => null,
})

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [demoLikes, setDemoLikes] = useState<Record<number, boolean>>({})
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsDesktop(window.innerWidth > 1024)
    }
    onResize()
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <LazyMotion features={domAnimation} strict={false}>
    <div style={{ background: '#15171A', color: '#F2EDE4', fontFamily: 'var(--font-inter, Inter, sans-serif)', overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <Navbar
        scrolled={scrolled}
        isMobile={isMobile}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navLinks={NAV_LINKS}
      />

      {/* ===== HERO ===== */}
      <HeroSection
        isMobile={isMobile}
        isDesktop={isDesktop}
        onOpenDemo={() => setShowDemoModal(true)}
      />

      {/* JSON-LD Organization/SoftwareApplication/HowTo — résultats enrichis Google (SSR) */}
      <LandingJsonLd />

      {/* ===== TRUSTED BY ===== */}
      <TrustedBySection isMobile={isMobile} />

      {/* ===== FEATURES ===== */}
      <FeaturesSection isMobile={isMobile} />

      {/* ===== CLIENT EXPERIENCE ===== */}
      <ClientExperienceSection isMobile={isMobile} />

      {/* ===== HOW IT WORKS ===== */}
      <WorkflowSection isMobile={isMobile} />

      {/* ===== STATS ===== */}
      <StatsSection isMobile={isMobile} />

      {/* ===== WHATSAPP CTA ===== */}
      <WhatsAppCtaSection isMobile={isMobile} />

      {/* ===== PRICING ===== */}
      <PricingSection isMobile={isMobile} />

      {/* ===== FAQ ===== */}
      <FaqSection isMobile={isMobile} />

      {/* ===== FINAL CTA BANNER ===== */}
      <FinalCtaSection isMobile={isMobile} />

      {/* ===== FOOTER ===== */}
      <LandingFooter isMobile={isMobile} />

      {/* ===== INTERACTIVE DEMO MODAL — lazy-loaded (chunk chargé au clic seulement) ===== */}
      <AnimatePresence>
        {showDemoModal && (
          <DemoModal
            isMobile={isMobile}
            demoLikes={demoLikes}
            onToggleLike={(i) => setDemoLikes(prev => ({ ...prev, [i]: !prev[i] }))}
            onClose={() => setShowDemoModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
    </LazyMotion>
  )
}
