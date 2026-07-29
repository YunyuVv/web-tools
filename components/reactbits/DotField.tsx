'use client'

import { useEffect, useRef } from 'react'

interface DotFieldProps {
  className?: string
  /** 点间距（px） */
  dotSpacing?: number
  /** 点半径（px） */
  dotRadius?: number
  /** 鼠标影响半径（px） */
  cursorRadius?: number
  /** 凸起强度（px） */
  bulge?: number
  /** 点的颜色 */
  color?: string
  /** 鼠标光晕颜色 */
  glow?: string
  /** 光晕半径（px） */
  glowRadius?: number
}

/**
 * DotField - 交互式点阵背景
 * 移植自 react-bits（DotField），纯 SVG + 直接 DOM 操作，零依赖。
 * 鼠标附近的点会向远离光标方向凸起并发光，离开后复位。
 */
export function DotField({
  className = '',
  dotSpacing = 26,
  dotRadius = 1.6,
  cursorRadius = 150,
  bulge = 16,
  color = 'rgba(129, 140, 248, 0.55)',
  glow = 'rgba(99, 102, 241, 0.22)',
  glowRadius = 130,
}: DotFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<SVGCircleElement[]>([])
  const mouse = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const svg = el.querySelector('svg') as SVGSVGElement
    const glowEl = glowRef.current

    const build = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const cols = Math.ceil(w / dotSpacing) + 1
      const rows = Math.ceil(h / dotSpacing) + 1
      let markup = ''
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing
          const y = r * dotSpacing
          markup += `<circle data-x="${x}" data-y="${y}" cx="${x}" cy="${y}" r="${dotRadius}" fill="${color}" opacity="0.22"/>`
        }
      }
      svg.innerHTML = markup
      dotsRef.current = Array.from(svg.querySelectorAll('circle'))
    }

    const tick = () => {
      rafRef.current = null
      const m = mouse.current
      for (const c of dotsRef.current) {
        const x = +c.dataset.x!
        const y = +c.dataset.y!
        const dx = m.x - x
        const dy = m.y - y
        const d = Math.hypot(dx, dy)
        if (d < cursorRadius) {
          const f = 1 - d / cursorRadius
          c.setAttribute('cx', String(x - (dx / (d || 1)) * bulge * f))
          c.setAttribute('cy', String(y - (dy / (d || 1)) * bulge * f))
          c.setAttribute('r', String(dotRadius + 2.4 * f))
          c.setAttribute('opacity', String(0.22 + 0.6 * f))
        } else {
          c.setAttribute('cx', String(x))
          c.setAttribute('cy', String(y))
          c.setAttribute('r', String(dotRadius))
          c.setAttribute('opacity', '0.22')
        }
      }
      if (glowEl) {
        glowEl.style.transform = `translate(${m.x - glowRadius}px, ${m.y - glowRadius}px)`
        glowEl.style.opacity = m.x < -1000 ? '0' : '1'
      }
    }

    const schedule = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      schedule()
    }
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 }
      schedule()
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(el)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [dotSpacing, dotRadius, cursorRadius, bulge, color, glow, glowRadius])

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" />
      <div
        ref={glowRef}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: glowRadius * 2,
          height: glowRadius * 2,
          background: `radial-gradient(circle, ${glow}, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
