'use client'

/**
 * 零依赖的「滑动分段控件」。
 * - 半透明玻璃滑块在激活项下方滑动（backdrop-blur + 高光，轻量液体玻璃观感）。
 * - 支持鼠标/触摸拖拽跟手，松手吸附到最近项。
 * - 支持点击切换与键盘（方向键 / Home / End，radiogroup 漫游 tabindex）。
 * - 不引入 framer-motion，纯 CSS 过渡 + pointer 事件。
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
}

interface SlidingSegmentedProps<T extends string> {
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

interface PillGeom {
  left: number
  width: number
}

export function SlidingSegmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel = '分段选择',
  className = '',
}: SlidingSegmentedProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const segRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<PillGeom>({ left: 0, width: 0 })
  const [dragging, setDragging] = useState(false)
  const [ready, setReady] = useState(false)

  const activeIndex = Math.max(
    0,
    options.findIndex(o => o.value === value)
  )

  /** 计算滑块静止位置：对齐到激活分段的左/宽 */
  const measure = useCallback(() => {
    const seg = segRefs.current[activeIndex]
    if (!seg) return
    setPill({ left: seg.offsetLeft, width: seg.offsetWidth })
  }, [activeIndex])

  // 挂载 / 选中变化后对齐滑块
  useEffect(() => {
    measure()
    setReady(true)
  }, [measure])

  // 响应式：容器尺寸或字体加载完成后重新对齐
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(track)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measure).catch(() => {})
    }
    return () => ro.disconnect()
  }, [measure])

  // ── 拖拽：跟手 + 宽度同步 + 松手吸附 ──
  const dragState = useRef<{
    startX: number
    /** 各分段的 offsetLeft / offsetWidth（捕获时刻快照） */
    segs: { left: number; width: number }[]
  } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const track = trackRef.current
    if (!track) return

    // 捕获所有分段的位置与尺寸
    const segs = segRefs.current
      .map(s => (s ? { left: s.offsetLeft, width: s.offsetWidth } : null))
      .filter((x): x is NonNullable<typeof x> => x !== null)
    if (segs.length === 0) return

    dragState.current = { startX: e.clientX, segs }
    setDragging(true)

    const move = (ev: PointerEvent) => {
      const st = dragState.current
      if (!st || !track) return
      const dx = ev.clientX - st.startX
      // 当前滑块中心 X（相对于轨道）
      const currentCenterX = pill.left + pill.width / 2 + dx
      // 轨道左边界（用于把 clientX 映射到轨道内坐标）
      const trackLeft = track.getBoundingClientRect().left
      // 指针在轨道内的 X
      const ptrInTrack = ev.clientX - trackLeft

      // 找指针落在哪两个分段之间，并计算插值比例 t ∈ [0,1]
      let t = 0 // 在第 0 个分段内的比例
      let segIdx = 0
      for (let i = 0; i < st.segs.length; i++) {
        const s = st.segs[i]
        const segCenter = s.left + s.width / 2
        if (i === st.segs.length - 1 || ptrInTrack <= segCenter) {
          segIdx = i
          if (i === 0) {
            // 第一段：按指针在其左半/右半分配
            const prevCenter = s.left // 视为前一段中心（即轨道起点）
            t = Math.min(1, Math.max(0, (ptrInTrack - prevCenter) / (segCenter - prevCenter)))
          } else {
            const prevSeg = st.segs[i - 1]
            const prevCenter = prevSeg.left + prevSeg.width / 2
            t = Math.min(1, Math.max(0, (ptrInTrack - prevCenter) / (segCenter - prevCenter)))
          }
          break
        }
      }

      // 插值 left & width
      const curr = st.segs[segIdx]
      const prev = st.segs[Math.max(0, segIdx - 1)]
      const nextLeft = prev.left + (curr.left - prev.left) * t
      const nextWidth = prev.width + (curr.width - prev.width) * t
      setPill({ left: nextLeft, width: nextWidth })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      dragState.current = null
      setDragging(false)
      // 用松手时的指针位置（实时，不受闭包旧 pill 影响）找最近分段
      const ptrX = ev.clientX
      let nearest = 0
      let best = Infinity
      segRefs.current.forEach((seg, i) => {
        if (!seg) return
        const r = seg.getBoundingClientRect()
        const c = r.left + r.width / 2
        const d = Math.abs(c - ptrX)
        if (d < best) {
          best = d
          nearest = i
        }
      })
      // 显式吸附到目标分段几何：即使值与当前相同（onChange 不触发重渲染、
      // measure 不执行）也保证滑块视觉落位，不会停在拖到的中间
      const seg = segRefs.current[nearest]
      if (seg) {
        setPill({ left: seg.offsetLeft, width: seg.offsetWidth })
      }
      onChange(options[nearest].value)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ── 键盘：radiogroup 漫游 ──
  const onKeyDown = (e: React.KeyboardEvent) => {
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
  }

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={[
        'relative inline-flex touch-none select-none items-center rounded-full border border-border/60 bg-muted/40 p-1',
        className,
      ].join(' ')}
    >
      {/* 玻璃滑块 */}
      <span
        aria-hidden
        className={[
          'pointer-events-none absolute left-0 top-1 bottom-1 rounded-full',
          'bg-white/70 shadow-sm ring-1 ring-inset ring-white/60',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md',
          'dark:bg-white/10 dark:ring-white/10',
          dragging
            ? 'transition-none'
            : 'transition-[transform,width] duration-300 ease-[cubic-bezier(0.2,0.9,0.24,1)]',
        ].join(' ')}
        style={{
          width: pill.width ? `${pill.width}px` : undefined,
          transform: `translateX(${pill.left}px)`,
          opacity: ready ? 1 : 0,
        }}
      />

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
              'relative z-10 rounded-full px-5 py-2 text-sm font-medium outline-none transition-colors cursor-pointer',
              'focus-visible:ring-2 focus-visible:ring-primary/50',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
