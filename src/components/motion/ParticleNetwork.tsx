'use client'

import { useEffect, useRef } from 'react'

/**
 * Background "constellation": drifting dots linked by thin lines when they
 * are close, and drawn towards the mouse, which links to nearby dots like a
 * spider web. Sits behind the page content on every page.
 */

type Dot = { x: number; y: number; vx: number; vy: number; r: number; c: string }

const COLORS = ['163, 64, 29', '227, 169, 59', '47, 74, 59'] // latérite, ocre, baobab
const LINE = '42, 31, 23' // brun nuit
const LINK_DISTANCE = 130
const MOUSE_DISTANCE = 190

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: -9999, y: -9999, active: false }
    let dots: Dot[] = []
    let width = 0
    let height = 0
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.min(110, Math.max(35, Math.round((width * height) / 13000)))
      while (dots.length < target) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.4 + Math.random() * 2.4,
          c: COLORS[dots.length % COLORS.length],
        })
      }
      dots = dots.slice(0, target)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue
          const alpha = (1 - Math.sqrt(d2) / LINK_DISTANCE) * 0.16
          ctx.strokeStyle = `rgba(${LINE}, ${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Web towards the mouse
      if (mouse.active) {
        for (const p of dots) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MOUSE_DISTANCE) continue
          const alpha = (1 - d / MOUSE_DISTANCE) * 0.45
          ctx.strokeStyle = `rgba(163, 64, 29, ${alpha})`
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      // Dots
      for (const p of dots) {
        ctx.fillStyle = `rgba(${p.c}, 0.55)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = () => {
      for (const p of dots) {
        // Gentle pull towards the cursor
        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MOUSE_DISTANCE && d > 30) {
            p.vx += (dx / d) * 0.012
            p.vy += (dy / d) * 0.012
          }
        }
        // Keep speeds calm
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 0.6) {
          p.vx *= 0.6 / speed
          p.vy *= 0.6 / speed
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    resize()
    window.addEventListener('resize', resize)
    if (reduced) {
      draw()
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-network" aria-hidden />
}
