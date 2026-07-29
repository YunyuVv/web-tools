'use client'

/**
 * CssGradientTool — CSS 渐变可视化构建器。
 * 支持线性（可调角度）与径向渐变、多个色标（颜色 + 位置），
 * 实时预览并输出可复制的 CSS。
 */

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, Plus, X } from 'lucide-react'

interface Stop {
  id: number
  color: string
  pos: number
}

type GradientType = 'linear' | 'radial'

const newStop = (id: number, color: string, pos: number): Stop => ({ id, color, pos })

export function CssGradientTool() {
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<Stop[]>([
    newStop(1, '#6366F1', 0),
    newStop(2, '#EC4899', 100),
  ])
  const [copied, setCopied] = useState(false)
  const nextId = useMemo(() => Math.max(0, ...stops.map(s => s.id)) + 1, [stops])

  /** 生成 CSS */
  const css = useMemo(() => {
    const list = [...stops]
      .sort((a, b) => a.pos - b.pos)
      .map(s => `${s.color} ${Math.round(s.pos)}%`)
      .join(', ')
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${list})`
      : `radial-gradient(circle, ${list})`
  }, [type, angle, stops])

  const handleColor = (id: number, color: string) =>
    setStops(prev => prev.map(s => (s.id === id ? { ...s, color } : s)))
  const handlePos = (id: number, pos: number) =>
    setStops(prev => prev.map(s => (s.id === id ? { ...s, pos } : s)))
  const addStop = () =>
    setStops(prev => [...prev, newStop(nextId, '#22C55E', 50)])
  const removeStop = (id: number) =>
    setStops(prev => (prev.length <= 2 ? prev : prev.filter(s => s.id !== id)))

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`background: ${css};`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [css])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">CSS 渐变</span>
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

      {/* ── 类型 + 角度 ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-xl border border-border/60 bg-card p-1">
          {(['linear', 'radial'] as GradientType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition cursor-pointer ${
                type === t ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'linear' ? '线性' : '径向'}
            </button>
          ))}
        </div>
        {type === 'linear' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">角度</span>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="w-40 accent-primary cursor-pointer"
            />
            <span className="w-12 font-mono text-sm tabular-nums text-foreground">{angle}°</span>
          </div>
        )}
        <button
          type="button"
          onClick={addStop}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> 添加色标
        </button>
      </div>

      {/* ── 色标列表 ── */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        {stops.map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <input
              type="color"
              value={s.color}
              onChange={e => handleColor(s.id, e.target.value.toUpperCase())}
              className="h-9 w-9 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
              aria-label="色标颜色"
            />
            <input
              value={s.color}
              onChange={e => handleColor(s.id, e.target.value.toUpperCase())}
              spellCheck={false}
              className="w-24 border-0 bg-transparent font-mono text-sm focus:outline-none"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={s.pos}
              onChange={e => handlePos(s.id, Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <span className="w-12 text-right font-mono text-sm tabular-nums text-muted-foreground">{Math.round(s.pos)}%</span>
            <button
              type="button"
              onClick={() => removeStop(s.id)}
              disabled={stops.length <= 2}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="删除色标"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── 预览 ── */}
      <div
        className="h-44 rounded-2xl border border-border/60 shadow-sm"
        style={{ background: css }}
      />

      {/* ── CSS 输出 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
          CSS
        </div>
        <pre className="overflow-x-auto px-5 py-4 font-mono text-sm text-foreground">
          <code>background: {css};</code>
        </pre>
      </div>
    </div>
  )
}
