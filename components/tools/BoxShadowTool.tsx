'use client'

/**
 * BoxShadowTool — CSS 阴影（box-shadow）可视化构建器。
 * 支持偏移 X / Y、模糊、扩散、颜色与 inset，实时预览并输出可复制的 CSS。
 */

import { useState, useMemo, useCallback } from 'react'
import { Square, Copy, Check } from 'lucide-react'

export function BoxShadowTool() {
  const [x, setX] = useState(8)
  const [y, setY] = useState(8)
  const [blur, setBlur] = useState(24)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#0F172A')
  const [alpha, setAlpha] = useState(20)
  const [inset, setInset] = useState(false)
  const [copied, setCopied] = useState(false)

  /** 实际颜色（带透明度） */
  const rgba = useMemo(() => {
    const s = color.trim().toLowerCase()
    const m = s.match(/^#?([0-9a-f]{6})$/)
    const hex = m ? m[1] : '0f172a'
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`
  }, [color, alpha])

  const css = useMemo(() => {
    const parts = [
      inset ? 'inset' : null,
      `${x}px`,
      `${y}px`,
      `${blur}px`,
      spread !== 0 ? `${spread}px` : null,
      rgba,
    ].filter(Boolean)
    return `box-shadow: ${parts.join(' ')};`
  }, [inset, x, y, blur, spread, rgba])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [css])

  /** 单个数值滑块行 */
  const slider = (label: string, value: number, set: (n: number) => void, min: number, max: number) => (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => set(Number(e.target.value))}
        className="flex-1 accent-primary cursor-pointer"
      />
      <span className="w-14 text-right font-mono text-sm tabular-nums text-foreground">{value}px</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Square className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-foreground">Box Shadow</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* ── 参数 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          {slider('偏移 X', x, setX, -50, 50)}
          {slider('偏移 Y', y, setY, -50, 50)}
          {slider('模糊', blur, setBlur, 0, 100)}
          {slider('扩散', spread, setSpread, -50, 50)}
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">颜色</span>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value.toUpperCase())}
              className="h-9 w-9 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
              aria-label="阴影颜色"
            />
            <input
              value={color}
              onChange={e => setColor(e.target.value.toUpperCase())}
              spellCheck={false}
              className="w-24 border-0 bg-transparent font-mono text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">不透明度</span>
            <input
              type="range"
              min={0}
              max={100}
              value={alpha}
              onChange={e => setAlpha(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <span className="w-14 text-right font-mono text-sm tabular-nums text-foreground">{alpha}%</span>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={inset}
              onChange={() => setInset(v => !v)}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            内阴影（inset）
          </label>
          <div className="mt-1 rounded-lg bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
            {rgba}
          </div>
        </div>
      </div>

      {/* ── 预览 ── */}
      <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card py-14 shadow-sm">
        <div
          className="h-28 w-28 rounded-2xl bg-background"
          style={{ boxShadow: css.replace('box-shadow: ', '').replace(';', '') }}
        />
      </div>

      {/* ── CSS 输出 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
          CSS
        </div>
        <pre className="overflow-x-auto px-5 py-4 font-mono text-sm text-foreground">
          <code>{css}</code>
        </pre>
      </div>
    </div>
  )
}
