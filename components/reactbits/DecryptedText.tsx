'use client'

import { Fragment, useEffect, useRef, useState, type ElementType } from 'react'

interface DecryptedTextProps {
  text: string
  className?: string
  /** 乱码（未解密）字符的样式 */
  encryptedClassName?: string
  /** 渲染的标签，默认 span */
  as?: ElementType
  /** 每步间隔（ms），越小越快 */
  speed?: number
  /** 每个字符的最大乱码迭代次数 */
  maxIterations?: number
  /** 乱码字符集 */
  characters?: string
  /** 仅在 hover 时播放 */
  decryptOnHover?: boolean
  /** 从左到右顺序解密 */
  sequential?: boolean
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>/'

/**
 * DecryptedText - 解密文字动画
 * 移植自 react-bits（DecryptedText），纯 JS setInterval/rAF，零依赖。
 * 初始显示真实文字（SSR 安全），挂载后播放「乱码 → 清晰」的解密过程。
 */
export function DecryptedText({
  text,
  className = '',
  encryptedClassName = 'text-primary/70',
  as: Tag = 'span',
  speed = 38,
  maxIterations = 14,
  characters = DEFAULT_CHARS,
  decryptOnHover = false,
  sequential = false,
}: DecryptedTextProps) {
  const [chars, setChars] = useState<string[]>(() => text.split(''))
  const [active, setActive] = useState(!decryptOnHover)
  const frame = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const original = text.split('')
    const queue = original.map((char, i) => {
      if (char === ' ' || char === '\n') return { char, start: 0, end: 0 }
      const start = sequential ? i * 2 : Math.floor(Math.random() * maxIterations)
      const end = start + Math.floor(Math.random() * maxIterations) + 4
      return { char, start, end }
    })
    const maxEnd = Math.max(...queue.map((q) => q.end))

    const tick = () => {
      frame.current += 1
      const out = queue.map((item) => {
        if (item.end === 0) return item.char
        if (frame.current >= item.end) return item.char
        if (frame.current >= item.start) {
          return characters[Math.floor(Math.random() * characters.length)]
        }
        return ''
      })
      setChars(out)
      if (frame.current <= maxEnd) {
        timerRef.current = window.setTimeout(() => {
          timerRef.current = requestAnimationFrame(tick)
        }, speed)
      } else {
        setChars(original)
      }
    }
    tick()

    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
        cancelAnimationFrame(timerRef.current)
      }
    }
  }, [active, text, speed, maxIterations, characters, sequential])

  const handleEnter = () => {
    if (decryptOnHover) {
      frame.current = 0
      setActive(true)
    }
  }

  return (
    <Tag className={className} aria-label={text} onMouseEnter={handleEnter}>
      {chars.map((c, i) => {
        const isEncrypted = c !== '' && c !== text[i]
        return (
          <Fragment key={i}>
            <span className={isEncrypted ? encryptedClassName : undefined}>
              {c === '' ? ' ' : c}
            </span>
          </Fragment>
        )
      })}
    </Tag>
  )
}
