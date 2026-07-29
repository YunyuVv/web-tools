'use client'

/**
 * ContrastCheckerTool — WCAG 颜色对比度检测工具。
 * 选择前景色与背景色，计算对比度比例并判定 AA / AAA（普通文本与大字文本）是否达标。
 */

import { useState, useMemo, useCallback } from 'react'
import { Check, X } from 'lucide-react'

type RGB = { r: number; g: number; b: number }

/** 解析 #rrggbb 或 #rgb */
function parseHex(hex: string): RGB | null {
  const s = hex.trim().toLowerCase()
  const m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}
function toHex({ r, g, b }: RGB): string {
  const h = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}
/** 相对亮度（WCAG） */
function relLum({ r, g, b }: RGB): number {
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

/** 单条判定行 */
function PassRow({ label, required, passed }: { label: string; required: string; passed: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">≥ {required}</span>
        {passed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" /> 通过
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
            <X className="h-3 w-3" /> 未达
          </span>
        )}
      </div>
    </div>
  )
}

export function ContrastCheckerTool() {
  const [fg, setFg] = useState('#FFFFFF')
  const [bg, setBg] = useState('#6366F1')

  const fgRgb = useMemo(() => parseHex(fg), [fg])
  const bgRgb = useMemo(() => parseHex(bg), [bg])

  const ratio = useMemo(() => {
    if (!fgRgb || !bgRgb) return null
    const l1 = relLum(fgRgb)
    const l2 = relLum(bgRgb)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }, [fgRgb, bgRgb])

  const swap = useCallback(() => {
    setFg(bg)
    setBg(fg)
  }, [fg, bg])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">对比度检测</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={swap}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          交换前景/背景
        </button>
      </div>

      {/* ── 取色区 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([
          { label: '前景色', value: fg, set: setFg },
          { label: '背景色', value: bg, set: setBg },
        ] as const).map(c => (
          <div key={c.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <input
              type="color"
              value={parseHex(c.value) ? toHex(parseHex(c.value)!) : '#000000'}
              onChange={e => c.set(e.target.value.toUpperCase())}
              className="h-10 w-10 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
              aria-label={c.label}
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <input
                value={c.value}
                onChange={e => c.set(e.target.value.toUpperCase())}
                spellCheck={false}
                className="w-28 border-0 bg-transparent font-mono text-sm focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── 预览 ── */}
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl py-10"
          style={{ backgroundColor: bgRgb ? toHex(bgRgb) : '#000', color: fgRgb ? toHex(fgRgb) : '#fff' }}
        >
          <span className="text-4xl font-bold">Aa</span>
          <span className="text-sm">示例文本预览</span>
        </div>
      </div>

      {/* ── 结果 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-6 shadow-sm">
          <span className="text-xs text-muted-foreground">对比度比例</span>
          <span className="font-mono text-3xl font-bold text-foreground">
            {ratio ? ratio.toFixed(2) : '—'}
          </span>
          <span className="text-xs text-muted-foreground">: 1</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <PassRow label="普通文本 AA" required="4.5" passed={!!ratio && ratio >= 4.5} />
          <PassRow label="普通文本 AAA" required="7.0" passed={!!ratio && ratio >= 7} />
          <PassRow label="大字文本 AA" required="3.0" passed={!!ratio && ratio >= 3} />
          <PassRow label="大字文本 AAA" required="4.5" passed={!!ratio && ratio >= 4.5} />
        </div>
      </div>
    </div>
  )
}
