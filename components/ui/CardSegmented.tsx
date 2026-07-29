'use client'

/**
 * 「白卡激活」分段控件（早期视觉风格，已沉淀为可复用组件）。
 * - 激活项直接变为白卡浮起（瞬时切换，无滑动 / 无拖拽）。
 * - 支持点击切换与键盘（方向键 / Home / End，radiogroup 漫游 tabindex）。
 * - 与 SlidingSegmented 保持同一 props 接口，便于在 demo 中并排对比。
 */

import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
}

interface CardSegmentedProps<T extends string> {
  /** 当前选中值 */
  value: T
  /** 选中变化回调 */
  onChange: (value: T) => void
  /** 分段选项（顺序即显示顺序） */
  options: readonly SegmentOption<T>[]
  /** 无障碍标签 */
  ariaLabel?: string
  /** 额外类名 */
  className?: string
}

export function CardSegmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel = '分段选择',
  className = '',
}: CardSegmentedProps<T>) {
  const segRefs = useRef<(HTMLButtonElement | null)[]>([])

  const activeIndex = Math.max(
    0,
    options.findIndex(o => o.value === value)
  )

  // ── 键盘：radiogroup 漫游 ──
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let next = activeIndex
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (activeIndex + 1) % options.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (activeIndex - 1 + options.length) % options.length
      } else if (e.key === 'Home') {
        next = 0
      } else if (e.key === 'End') {
        next = options.length - 1
      } else {
        return
      }
      e.preventDefault()
      onChange(options[next].value)
      segRefs.current[next]?.focus()
    },
    [activeIndex, onChange, options]
  )

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={[
        'inline-flex items-center rounded-full border border-border/60 bg-muted/40 p-1',
        className,
      ].join(' ')}
    >
      {options.map((opt, i) => {
        const active = i === activeIndex
        return (
          <button
            key={opt.value}
            ref={el => {
              segRefs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-full px-5 py-2 text-sm font-medium outline-none transition-all cursor-pointer',
              'focus-visible:ring-2 focus-visible:ring-primary/50',
              active
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
