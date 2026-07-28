'use client'

/**
 * 明暗模式切换按钮（实现体）
 * 三态循环：light → dark → system → light
 * 由 ThemeToggle.tsx 通过 dynamic ssr:false 加载，不参与服务端渲染
 */

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

const CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeToggleInner() {
  const { theme, setTheme } = useTheme()

  const current = (theme as 'light' | 'dark' | 'system') ?? 'system'
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]
  const Icon = ICONS[current]

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${current}`}
    >
      <Icon className="h-4 w-4 transition-all" />
    </Button>
  )
}
