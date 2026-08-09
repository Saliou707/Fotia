'use client'

export default function Skeleton({ h = 80, radius = 12 }: { h?: number; radius?: number }) {
  return <div style={{ height: h, borderRadius: radius, background: 'rgba(255,255,255,0.05)', animation: 'statPulse 1.5s ease-in-out infinite' }} />
}
