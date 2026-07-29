'use client'

import { type CSSProperties, type ElementType } from 'react'

interface ShinyTextProps {
  text: string
  /** 动画周期（秒），默认 3 */
  speed?: number
  /** 关闭扫光动画 */
  disabled?: boolean
  className?: string
  /** 渲染标签，默认 span */
  as?: ElementType
  /** 基础文字色（CSS 颜色），默认取主题 foreground 淡化 */
  baseColor?: string
  /** 扫光色（CSS 颜色），默认主题 primary */
  shineColor?: string
}

/**
 * ShinyText - 文本扫光动画
 * 移植自 react-bits（ShinyText），纯 CSS 背景位移，零依赖。
 * SSR 安全：直接渲染真实文字，挂载后由 CSS 动画持续扫光。
 * 颜色默认随明暗主题变化（base = foreground 淡化，shine = primary）。
 */
export function ShinyText({
  text,
  speed = 3,
  disabled = false,
  className = '',
  as: Tag = 'span',
  baseColor,
  shineColor,
}: ShinyTextProps) {
  const style = {
    '--shiny-speed': `${speed}s`,
    ...(baseColor ? { '--shiny-base': baseColor } : {}),
    ...(shineColor ? { '--shiny-shine': shineColor } : {}),
  } as CSSProperties

  return (
    <Tag
      className={`shiny-text${disabled ? ' is-disabled' : ''} ${className}`}
      style={style}
      aria-label={text}
    >
      {text}
    </Tag>
  )
}
