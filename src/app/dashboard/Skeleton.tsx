'use client'

export default function Skeleton({ h = 16, radius = 8, w = '100%' }: { h?: number; radius?: number; w?: string }) {
  return <div className="skeleton" style={{ height: h, borderRadius: radius, width: w }} />
}
