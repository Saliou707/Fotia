'use client'

import { useState, useEffect } from 'react'
import { fmtNumber } from '@/lib/api'

export default function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = 0
    const end = value
    if (start === end) return
    const dur = 900
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(ts => step(ts, startTime))
    }
    requestAnimationFrame(ts => step(ts, ts))
  }, [value])
  return <>{fmtNumber(display)}</>
}
