'use client'

/**
 * PasswordGeneratorTool — 高强度随机密码生成器。
 * 支持长度调节、字符集选项（大小写/数字/符号）、排除易混淆字符，
 * 使用 crypto.getRandomValues 进行密码学安全随机，并实时估算熵值强度。
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

/** 各类可选字符集 */
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?'
/** 易混淆字符（如 1/l/I、0/O） */
const AMBIGUOUS = new Set('il1Lo0O'.split(''))

type CharsetKey = 'lowercase' | 'uppercase' | 'numbers' | 'symbols'

/** 无偏随机选取 n 个字符（拒绝采样消除取模偏差） */
function securePick(pool: string, n: number): string {
  if (!pool) return ''
  const out = new Array<string>(n)
  const max = Math.floor(0xffffffff / pool.length) * pool.length
  const buf = new Uint32Array(1)
  for (let i = 0; i < n; i++) {
    let v: number
    do {
      crypto.getRandomValues(buf)
      v = buf[0]
    } while (v >= max)
    out[i] = pool[v % pool.length]
  }
  return out.join('')
}

/**
 * PasswordGeneratorTool — 主组件。
 * 顶部提供长度滑块与字符集开关；中部实时展示生成的密码与强度条；
 * 支持一键复制与重新生成。
 */
export function PasswordGeneratorTool() {
  /** 密码长度 */
  const [length, setLength] = useState(16)
  /** 各字符集开关 */
  const [opts, setOpts] = useState<Record<CharsetKey, boolean>>({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  })
  /** 是否排除易混淆字符 */
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  /** 当前生成的密码 */
  const [password, setPassword] = useState('')
  /** 复制成功反馈 */
  const [copied, setCopied] = useState(false)

  /** 根据开关计算可用字符池 */
  const pool = useMemo(() => {
    let p = ''
    if (opts.lowercase) p += LOWER
    if (opts.uppercase) p += UPPER
    if (opts.numbers) p += DIGITS
    if (opts.symbols) p += SYMBOLS
    if (excludeAmbiguous) p = p.split('').filter(c => !AMBIGUOUS.has(c)).join('')
    return p
  }, [opts, excludeAmbiguous])

  /** 生成密码 */
  const generate = useCallback(() => {
    if (!pool) {
      setPassword('')
      return
    }
    setPassword(securePick(pool, length))
  }, [pool, length])

  // 任意选项或长度变化时重新生成
  useEffect(() => {
    generate()
  }, [generate])

  /** 密码熵（比特） */
  const entropy = pool ? length * Math.log2(pool.length) : 0

  /** 强度分级 */
  const strength = !pool
    ? { label: '请至少选择一种字符', pct: 0, bar: 'bg-muted' }
    : entropy < 40
      ? { label: '弱', pct: 25, bar: 'bg-red-500' }
      : entropy < 60
        ? { label: '中', pct: 50, bar: 'bg-amber-500' }
        : entropy < 80
          ? { label: '强', pct: 75, bar: 'bg-lime-500' }
          : { label: '极强', pct: 100, bar: 'bg-green-500' }

  /** 切换字符集 */
  const toggle = (k: CharsetKey) => setOpts(prev => ({ ...prev, [k]: !prev[k] }))

  /** 复制密码 */
  const handleCopy = useCallback(async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [password])

  const charsets: { key: CharsetKey; label: string; sample: string }[] = [
    { key: 'lowercase', label: '小写字母', sample: 'a-z' },
    { key: 'uppercase', label: '大写字母', sample: 'A-Z' },
    { key: 'numbers', label: '数字', sample: '0-9' },
    { key: 'symbols', label: '符号', sample: '!@#$%' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">密码生成器</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          重新生成
        </button>
      </div>

      {/* ── 密码展示 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>生成的密码</span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            title="复制密码"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="break-all font-mono text-lg leading-8 text-foreground select-all">
            {password || '— 请至少选择一种字符集 —'}
          </p>
        </div>
      </div>

      {/* ── 强度条 ── */}
      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-xs text-muted-foreground">强度</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} style={{ width: `${strength.pct}%` }} />
        </div>
        <span className="w-12 shrink-0 text-right text-xs font-medium text-foreground">{strength.label}</span>
      </div>
      <p className="text-xs text-muted-foreground/70">
        估算熵值约 {entropy.toFixed(1)} bit{pool ? `（字符池 ${pool.length} 个）` : ''}
      </p>

      {/* ── 选项区 ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* 长度 */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">长度</span>
            <span className="rounded-md bg-muted/40 px-2 py-0.5 font-mono text-sm tabular-nums text-foreground">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground/60">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* 字符集 */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <span className="mb-3 block text-sm font-medium text-foreground">字符集</span>
          <div className="grid grid-cols-2 gap-2">
            {charsets.map(c => (
              <label
                key={c.key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm transition hover:border-primary/40"
              >
                <input
                  type="checkbox"
                  checked={opts[c.key]}
                  onChange={() => toggle(c.key)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="text-foreground">{c.label}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground/60">{c.sample}</span>
              </label>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={() => setExcludeAmbiguous(v => !v)}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            排除易混淆字符（1 l I 0 O）
          </label>
        </div>
      </div>
    </div>
  )
}
