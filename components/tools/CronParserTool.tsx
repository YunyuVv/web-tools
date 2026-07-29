'use client'

/**
 * CronParserTool — Cron 表达式解析器。
 * 解析标准 5 段 cron（分 时 日 月 周），计算未来若干次执行时间，
 * 并给出中文描述与各字段解析结果。支持星号、步长、范围、列表与月份/星期英文名。
 */

import { useState, useMemo, useCallback } from 'react'
import { CalendarDays, Copy, Check, AlertTriangle, Sparkles } from 'lucide-react'

const MONTH_NAMES: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
const DOW_NAMES: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const DOW_CN = ['日', '一', '二', '三', '四', '五', '六']

interface Field {
  set: Set<number>
  star: boolean
}

function resolve(tok: string, names?: Record<string, number>): number {
  if (names && names[tok.toLowerCase()] !== undefined) return names[tok.toLowerCase()]
  return parseInt(tok, 10)
}

function parseField(field: string, min: number, max: number, names?: Record<string, number>): Field {
  const set = new Set<number>()
  let star = false
  if (field.trim() === '*') {
    star = true
    for (let i = min; i <= max; i++) set.add(i)
    return { set, star }
  }
  for (const part of field.split(',')) {
    const p = part.trim()
    if (!p) continue
    const [range, stepStr] = p.split('/')
    const step = stepStr ? parseInt(stepStr, 10) : 1
    let lo: number, hi: number
    if (range === '*') {
      lo = min
      hi = max
      star = true
    } else if (range.includes('-')) {
      const [a, b] = range.split('-')
      lo = resolve(a, names)
      hi = resolve(b, names)
    } else {
      lo = hi = resolve(range, names)
    }
    if (isNaN(lo) || isNaN(hi)) continue
    for (let v = lo; v <= hi; v += step) {
      if (v >= min && v <= max) set.add(v)
    }
  }
  return { set, star }
}

interface Cron {
  min: Field
  hour: Field
  dom: Field
  month: Field
  dow: Field
}

function parseCron(expr: string): { cron: Cron | null; error: string | null } {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return { cron: null, error: '需要 5 个字段：分 时 日 月 周' }
  const [m, h, dom, mon, dow] = parts
  const cm = parseField(m, 0, 59)
  const ch = parseField(h, 0, 23)
  const cdom = parseField(dom, 1, 31)
  const cmon = parseField(mon, 1, 12, MONTH_NAMES)
  const cdow = parseField(dow, 0, 7, DOW_NAMES)
  if (cdow.set.has(7)) cdow.set.add(0)
  if (cm.set.size === 0 || ch.set.size === 0 || cdom.set.size === 0 || cmon.set.size === 0 || cdow.set.size === 0) {
    return { cron: null, error: '存在无法解析的字段' }
  }
  return { cron: { min: cm, hour: ch, dom: cdom, month: cmon, dow: cdow }, error: null }
}

function matches(c: Cron, d: Date): boolean {
  const minute = d.getMinutes()
  const hour = d.getHours()
  const dom = d.getDate()
  const month = d.getMonth() + 1
  const dow = d.getDay()
  const domOk = c.dom.star ? true : c.dom.set.has(dom)
  const dowOk = c.dow.star ? true : c.dow.set.has(dow)
  const domMatch = c.dom.star || c.dow.star ? domOk && dowOk : domOk || dowOk
  return c.min.set.has(minute) && c.hour.set.has(hour) && c.month.set.has(month) && domMatch
}

function nextOccurrences(c: Cron, count: number, from: Date): Date[] {
  const out: Date[] = []
  const d = new Date(from.getTime())
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  const maxIter = 5 * 366 * 24 * 60
  let iter = 0
  while (out.length < count && iter < maxIter) {
    if (matches(c, d)) out.push(new Date(d))
    d.setMinutes(d.getMinutes() + 1)
    iter++
  }
  return out
}

function fmt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function describe(c: Cron): string {
  const parts: string[] = []
  if (!c.min.star) parts.push(`第 ${[...c.min.set].sort((a, b) => a - b).join('/')} 分`)
  if (!c.hour.star) parts.push(`${[...c.hour.set].sort((a, b) => a - b).join('/')} 时`)
  if (!c.dom.star && c.dow.star) parts.push(`每月 ${[...c.dom.set].sort((a, b) => a - b).join('/')} 日`)
  if (!c.dow.star && c.dom.star) parts.push(`每周${[...c.dow.set].sort((a, b) => a - b).map(x => DOW_CN[x]).join('/')}`)
  if (!c.month.star) parts.push(`${[...c.month.set].sort((a, b) => a - b).join('/')} 月`)
  let base = '自定义计划'
  if (c.min.star && c.hour.star && c.dom.star && c.month.star && c.dow.star) base = '每分钟执行'
  else if (!c.min.star && c.hour.star && c.dom.star && c.month.star && c.dow.star) base = '每小时执行'
  else if (!c.min.star && !c.hour.star && c.dom.star && c.month.star && c.dow.star) base = '每天执行'
  return parts.length ? `${base}（${parts.join('，')}）` : base
}

const SAMPLE = '0 9 * * 1-5'

export function CronParserTool() {
  const [expr, setExpr] = useState('')
  const [count, setCount] = useState(5)
  const [copied, setCopied] = useState(false)

  const { cron, error } = useMemo(() => parseCron(expr), [expr])
  const occurrences = useMemo(() => (cron ? nextOccurrences(cron, count, new Date()) : []), [cron, count])

  const handleSample = useCallback(() => setExpr(SAMPLE), [])
  const handleCopy = useCallback(async () => {
    if (!expr) return
    try {
      await navigator.clipboard.writeText(expr)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [expr])

  const fields = cron
    ? [
        { label: '分', value: cron.min.star ? '*' : [...cron.min.set].sort((a, b) => a - b).join(', ') },
        { label: '时', value: cron.hour.star ? '*' : [...cron.hour.set].sort((a, b) => a - b).join(', ') },
        { label: '日', value: cron.dom.star ? '*' : [...cron.dom.set].sort((a, b) => a - b).join(', ') },
        { label: '月', value: cron.month.star ? '*' : [...cron.month.set].sort((a, b) => a - b).join(', ') },
        { label: '周', value: cron.dow.star ? '*' : [...cron.dow.set].sort((a, b) => a - b).join(', ') },
      ]
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-foreground">Cron 解析器</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSample}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          示例
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!expr}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* ── 表达式输入 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <input
            value={expr}
            onChange={e => setExpr(e.target.value)}
            placeholder="输入 Cron 表达式，如 0 9 * * 1-5"
            spellCheck={false}
            className="w-full border-0 bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60"
          />
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span>次数</span>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className="w-16 rounded-lg border border-border/60 bg-card px-2 py-1 font-mono text-sm focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 border-t border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── 描述 ── */}
      {cron && (
        <div className="rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-foreground shadow-sm">
          <span className="text-muted-foreground">含义：</span>
          {describe(cron)}
        </div>
      )}

      {/* ── 字段解析 ── */}
      {cron && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {fields.map(f => (
            <div key={f.label} className="rounded-2xl border border-border/60 bg-card px-3 py-3 text-center shadow-sm">
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="mt-1 font-mono text-sm text-foreground">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── 下次执行时间 ── */}
      {cron && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
            未来 {occurrences.length} 次执行时间
          </div>
          <div className="divide-y divide-border/30">
            {occurrences.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">#{i + 1}</span>
                <span className="font-mono text-foreground">{fmt(d)}</span>
                <span className="text-xs text-muted-foreground">
                  {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
