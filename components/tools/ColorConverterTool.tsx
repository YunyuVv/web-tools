'use client'

/**
 * ColorConverterTool — 颜色格式转换工具。
 * 支持 HEX / RGB / HSL / OKLCH 互转，并提供原生取色器；
 * 解析任意格式输入，实时输出其余三种表示，每种均可一键复制。
 * OKLCH 采用 Björn Ottosson 的 sRGB↔OKLab 算法。
 */

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

type RGB = { r: number; g: number; b: number }

// ─── sRGB ↔ 线性 ────────────────────────────────────────────────────────────
function srgbToLinear(c: number): number {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

// ─── 线性 sRGB ↔ OKLab ──────────────────────────────────────────────────────
function linearSrgbToOklab(r: number, g: number, b: number) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  }
}
function oklabToLinearSrgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  }
}

// ─── 格式转换 ──────────────────────────────────────────────────────────────
function rgbToHex({ r, g, b }: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}
function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}
function rgbToOklch({ r, g, b }: RGB) {
  const { L, a, b: bb } = linearSrgbToOklab(r, g, b)
  const C = Math.sqrt(a * a + bb * bb)
  let H = (Math.atan2(bb, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L: +L.toFixed(3), C: +C.toFixed(3), H: Math.round(H) }
}
function oklchToRgb(L: number, C: number, H: number): RGB {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const bb = C * Math.sin(hRad)
  const lin = oklabToLinearSrgb(L, a, bb)
  return {
    r: linearToSrgb(lin.r),
    g: linearToSrgb(lin.g),
    b: linearToSrgb(lin.b),
  }
}

// ─── 解析 ──────────────────────────────────────────────────────────────────
function parseColor(raw: string): RGB | null {
  const s = raw.trim().toLowerCase()
  // HEX
  let m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/)
  if (m) {
    let hex = m[1]
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(c => c + c).join('')
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }
  // RGB / RGBA
  m = s.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean)
    if (parts.length >= 3) {
      return { r: clamp255(parts[0]), g: clamp255(parts[1]), b: clamp255(parts[2]) }
    }
  }
  // HSL / HSLA
  m = s.match(/^hsla?\(([^)]+)\)$/)
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean)
    if (parts.length >= 3) {
      const h = parseFloat(parts[0])
      const sv = parseFloat(parts[1])
      const lv = parseFloat(parts[2])
      return hslToRgb(h, sv, lv)
    }
  }
  // OKLCH
  m = s.match(/^oklch\(([^)]+)\)$/)
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean)
    if (parts.length >= 3) {
      const L = parseFloat(parts[0]) * (parts[0].includes('%') ? 1 : 1)
      const C = parseFloat(parts[1])
      const H = parseFloat(parts[2])
      return oklchToRgb(L, C, H)
    }
  }
  return null
}
function clamp255(v: string): number {
  const n = parseFloat(v)
  if (isNaN(n)) return 0
  return Math.min(255, Math.max(0, Math.round(n)))
}

/** 单行只读展示 + 复制 */
function ReadoutRow({ label, value, copiedKey, copied, onCopy }: {
  label: string
  value: string
  copiedKey: string
  copied: string | null
  onCopy: (v: string, k: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="w-14 shrink-0 text-xs text-muted-foreground">{label}</span>
        <code className="truncate font-mono text-sm text-foreground">{value}</code>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, copiedKey)}
        title="复制"
        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
      >
        {copied === copiedKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

export function ColorConverterTool() {
  const [raw, setRaw] = useState('#6366F1')
  const [copied, setCopied] = useState<string | null>(null)
  const copyTimer = useCallback((k: string) => {
    setCopied(k)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const rgb = useMemo(() => parseColor(raw), [raw])
  const valid = rgb !== null

  const hex = rgb ? rgbToHex(rgb) : ''
  const hsl = rgb ? rgbToHsl(rgb) : null
  const oklch = rgb ? rgbToOklch(rgb) : null
  const previewColor = hex || '#000000'

  const handleCopy = useCallback(async (value: string, k: string) => {
    try {
      await navigator.clipboard.writeText(value)
      copyTimer(k)
    } catch {
      /* 静默失败 */
    }
  }, [copyTimer])

  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value.toUpperCase())
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">颜色转换</span>
        <input
          type="color"
          value={hex || '#000000'}
          onChange={handlePicker}
          className="ml-1 h-9 w-9 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
          aria-label="取色器"
        />
        <div className="flex-1" />
      </div>

      {/* ── 输入 + 预览 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/40 bg-muted/30 px-5 py-3">
          <span className="text-xs font-medium text-muted-foreground">输入任意格式</span>
          <span
            className="h-5 w-5 shrink-0 rounded-md border border-border/40"
            style={{ backgroundColor: previewColor }}
          />
        </div>
        <input
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="如 #6366F1、rgb(99 102 241)、hsl(243 75% 67%)、oklch(0.6 0.15 264)"
          spellCheck={false}
          className={`w-full border-0 bg-transparent px-5 py-4 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60 ${
            valid ? 'text-foreground' : 'text-destructive'
          }`}
        />
        {!valid && raw.trim() && (
          <div className="px-5 pb-3 text-xs text-destructive">无法识别的颜色格式</div>
        )}
      </div>

      {/* ── 各格式输出 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadoutRow label="HEX" value={hex || '—'} copiedKey="hex" copied={copied} onCopy={handleCopy} />
        <ReadoutRow
          label="RGB"
          value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '—'}
          copiedKey="rgb"
          copied={copied}
          onCopy={handleCopy}
        />
        <ReadoutRow
          label="HSL"
          value={hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '—'}
          copiedKey="hsl"
          copied={copied}
          onCopy={handleCopy}
        />
        <ReadoutRow
          label="OKLCH"
          value={oklch ? `oklch(${oklch.L} ${oklch.C} ${oklch.H})` : '—'}
          copiedKey="oklch"
          copied={copied}
          onCopy={handleCopy}
        />
      </div>
    </div>
  )
}
