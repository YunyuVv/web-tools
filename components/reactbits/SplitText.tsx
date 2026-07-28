'use client'

/**
 * SplitText - 文字逐字/逐词入场动画
 * 纯 CSS transition + IntersectionObserver，无需 GSAP 等外部依赖
 * 进入视口时触发，只播放一次
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
  /** 每个字符之间的间隔（ms） */
  delay?: number
  /** 单个字符动画时长（ms） */
  duration?: number
  /** 拆分粒度：chars（字符）| words（词） */
  splitType?: 'chars' | 'words'
  tag?: keyof React.JSX.IntrinsicElements
}

export function SplitText({
  text,
  className,
  delay = 30,
  duration = 700,
  splitType = 'chars',
  tag: Tag = 'span',
}: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const units = splitType === 'words' ? text.split(' ') : text.split('')

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn('inline', className)}
      aria-label={text}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(0.6em)',
            transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {unit === ' ' ? ' ' : unit}
          {splitType === 'words' && i < units.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
