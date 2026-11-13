'use client'

import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts from the previous value (0 at first) to `value` once visible. */
export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)
  const from = useRef(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) {
      setShown(value)
      return
    }
    let raf = 0
    const run = () => {
      const start = performance.now()
      const begin = from.current
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        setShown(Math.round(begin + (value - begin) * eased))
        if (t < 1) raf = requestAnimationFrame(tick)
        else from.current = value
      }
      raf = requestAnimationFrame(tick)
    }

    if (started.current) {
      run()
      return () => cancelAnimationFrame(raf)
    }
    setShown(0)
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      started.current = true
      io.disconnect()
      run()
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="count-up">
      {shown}
    </span>
  )
}
