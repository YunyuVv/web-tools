'use client'

/**
 * TimestampTool — Unix 时间戳转换工具。
 * 支持输入 Unix 秒/毫秒或日期字符串，自动识别格式并输出多种时间表示，
 * 每种格式均提供一键复制功能。
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Clock, Copy, Check, RefreshCw } from 'lucide-react'

// ─── 类型定义 ────────────────────────────────────────────────────────────────

/** 每行格式条目的数据结构 */
interface FormatRow {
  /** 条目唯一标识，用于复制状态追踪 */
  key: string
  /** 显示标签（中文） */
  label: string
  /** 格式化后的值字符串，null 表示解析失败 */
  value: string | null
}

// ─── 工具函数 ────────────────────────────────────────────────────────────────

/**
 * 将用户输入解析为毫秒级时间戳。
 * - 纯数字且 > 1e10：视为毫秒
 * - 纯数字且 <= 1e10：视为秒，乘以 1000
 * - 其他字符串：尝试 Date.parse
 * @param raw 原始输入字符串
 * @returns 毫秒时间戳，解析失败返回 null
 */
function parseToMs(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    const ms = num > 1e10 ? num : num * 1000
    return isNaN(ms) ? null : ms
  }

  const parsed = Date.parse(trimmed)
  return isNaN(parsed) ? null : parsed
}

/**
 * 将毫秒时间戳格式化为相对时间描述（如"3 分钟前"）。
 * @param ms 目标时间毫秒戳
 * @returns 相对时间字符串
 */
function formatRelative(ms: number): string {
  const diff = Date.now() - ms
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours / 24)
  const months  = Math.floor(days / 30)
  const years   = Math.floor(days / 365)

  let label: string
  if (seconds < 5)        label = '刚刚'
  else if (seconds < 60)  label = `${seconds} 秒${isFuture ? '后' : '前'}`
  else if (minutes < 60)  label = `${minutes} 分钟${isFuture ? '后' : '前'}`
  else if (hours < 24)    label = `${hours} 小时${isFuture ? '后' : '前'}`
  else if (days < 30)     label = `${days} 天${isFuture ? '后' : '前'}`
  else if (months < 12)   label = `${months} 个月${isFuture ? '后' : '前'}`
  else                    label = `${years} 年${isFuture ? '后' : '前'}`

  return label
}

/**
 * 将毫秒时间戳格式化为本地时间字符串（不依赖 locale API 的补全格式）。
 * @param ms 毫秒时间戳
 * @returns 格式化后的本地时间字符串
 */
function formatLocalTime(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

/**
 * 将毫秒时间戳格式化为 UTC 时间字符串。
 * @param ms 毫秒时间戳
 * @returns 格式化后的 UTC 时间字符串
 */
function formatUtcTime(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
  )
}

// ─── 子组件：单行格式展示 ─────────────────────────────────────────────────────

interface FormatRowProps {
  row: FormatRow
  isCopied: boolean
  onCopy: (value: string, key: string) => void
}

/**
 * FormatRowItem — 展示单条格式化结果，右侧附带复制按钮。
 */
function FormatRowItem({ row, isCopied, onCopy }: FormatRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 group hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* 标签 */}
        <span className="shrink-0 w-24 text-xs text-muted-foreground">{row.label}</span>
        {/* 值 */}
        {row.value !== null ? (
          <span className="font-mono text-sm text-foreground truncate">{row.value}</span>
        ) : (
          <span className="text-sm text-muted-foreground/50 italic">—</span>
        )}
      </div>
      {/* 复制按钮 */}
      {row.value !== null && (
        <button
          onClick={() => onCopy(row.value!, row.key)}
          title="复制"
          aria-label={`复制${row.label}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {isCopied ? '已复制' : '复制'}
        </button>
      )}
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

/**
 * TimestampTool — 主入口组件。
 * 顶部提供时间戳/日期字符串输入框及"现在"快捷按钮，
 * 下方列表展示本地时间、UTC、ISO 8601、相对时间、Unix 秒、Unix 毫秒等格式，
 * 每格附带一键复制功能。
 */
export function TimestampTool() {
  /** 用户输入的原始字符串 */
  const [input, setInput] = useState<string>('')
  /** 当前被复制的格式 key */
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  /** 复制状态清除计时器 */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 解析当前输入，得到毫秒时间戳（解析失败为 null）
   */
  const parsedMs = useMemo(() => parseToMs(input), [input])

  /**
   * 根据解析后的毫秒戳，生成所有格式化行数据
   */
  const rows = useMemo<FormatRow[]>(() => {
    if (parsedMs === null) {
      return [
        { key: 'local',   label: '本地时间',   value: null },
        { key: 'utc',     label: 'UTC',        value: null },
        { key: 'iso',     label: 'ISO 8601',   value: null },
        { key: 'rel',     label: '相对时间',   value: null },
        { key: 'sec',     label: 'Unix 秒',    value: null },
        { key: 'ms',      label: 'Unix 毫秒',  value: null },
      ]
    }
    return [
      { key: 'local',  label: '本地时间',  value: formatLocalTime(parsedMs) },
      { key: 'utc',    label: 'UTC',       value: formatUtcTime(parsedMs) },
      { key: 'iso',    label: 'ISO 8601',  value: new Date(parsedMs).toISOString() },
      { key: 'rel',    label: '相对时间',  value: formatRelative(parsedMs) },
      { key: 'sec',    label: 'Unix 秒',   value: String(Math.floor(parsedMs / 1000)) },
      { key: 'ms',     label: 'Unix 毫秒', value: String(parsedMs) },
    ]
  }, [parsedMs])

  /** 输入是否合法 */
  const isValid = parsedMs !== null
  /** 输入非空但解析失败，展示错误提示 */
  const hasError = input.trim().length > 0 && !isValid

  /**
   * 点击"现在"按钮：将当前 Unix 毫秒戳填入输入框
   */
  const handleNow = useCallback(() => {
    setInput(String(Date.now()))
  }, [])

  /**
   * 复制指定文本并高亮对应行一段时间
   * @param value 要复制的内容
   * @param key 对应格式的 key
   */
  const handleCopy = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      setCopiedKey(key)
      copyTimerRef.current = setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      // 复制失败时静默处理
    }
  }, [])

  /** 清理计时器 */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 输入区 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 面板标题栏 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>输入时间戳或日期字符串</span>
          </div>
          {/* 现在按钮 */}
          <button
            onClick={handleNow}
            title="填入当前时间戳"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            现在
          </button>
        </div>

        {/* 输入框 */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="例如：1700000000、1700000000000、2024-01-01T00:00:00Z"
            className={[
              'w-full border-0 bg-transparent px-4 py-3.5 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/50',
              hasError ? 'text-destructive' : 'text-foreground',
            ].join(' ')}
            spellCheck={false}
            autoComplete="off"
          />
          {/* 解析错误提示 */}
          {hasError && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-destructive/80">
              无法识别的格式
            </span>
          )}
        </div>

        {/* 输入类型提示 */}
        {isValid && (
          <div className="border-t border-border/30 bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground/70 font-mono">
            {parsedMs! > 1e13
              ? '⚠ 数值过大，已作为毫秒解析'
              : input.trim().match(/^-?\d+$/)
                ? (parseInt(input.trim(), 10) > 1e10 ? '已识别为 Unix 毫秒戳' : '已识别为 Unix 秒戳')
                : '已识别为日期字符串'}
          </div>
        )}
      </div>

      {/* ── 格式展示区 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 面板标题栏 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>转换结果</span>
          {isValid && (
            <button
              onClick={() => handleCopy(String(parsedMs), 'all_ms')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer"
            >
              {copiedKey === 'all_ms' ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedKey === 'all_ms' ? '已复制毫秒戳' : '复制毫秒戳'}
            </button>
          )}
        </div>

        {/* 格式列表 */}
        <div>
          {rows.map(row => (
            <FormatRowItem
              key={row.key}
              row={row}
              isCopied={copiedKey === row.key}
              onCopy={handleCopy}
            />
          ))}
        </div>

        {/* 空状态提示 */}
        {!isValid && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/50">
            <Clock className="h-8 w-8" />
            <span className="text-sm">输入时间戳后查看转换结果</span>
          </div>
        )}
      </div>
    </div>
  )
}
