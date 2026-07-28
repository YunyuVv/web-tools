'use client'

/**
 * SpotlightCard - 鼠标跟踪光晕卡片
 * 移植自 react-bits，用 CSS 变量实现鼠标跟踪光晕效果
 * 适配明暗模式：通过 spotlightColor prop 控制颜色
 */

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
  /** 光晕颜色，默认在暗色模式下可见 */
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(255,255,255,0.12)',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn('spotlight-card', className)}
    >
      {children}
    </div>
  )
}
