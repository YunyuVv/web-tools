'use client'

/**
 * TimestampTool — Unix 时间戳转换工具。
 * 支持输入 Unix 秒/毫秒或日期字符串，自动识别格式并输出多种时间表示，
 * 每种格式均提供一键复制功能。
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Clock, Copy, Check, RefreshCw } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

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
function formatRelative(ms: number, t: (key: string) => string): string {
  const diff = Date.now() - ms
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours / 24)
  const months  = Math.floor(days / 30)
  const years   = Math.floor(days / 365)

  if (seconds < 5) return t('tools.timestamp.rel_just')

  let n: number
  let unitKey: string
  if (seconds < 60)      { n = seconds; unitKey = 'tools.timestamp.unit_sec' }
  else if (minutes < 60) { n = minutes; unitKey = 'tools.timestamp.unit_min' }
  else if (hours < 24)   { n = hours;   unitKey = 'tools.timestamp.unit_hour' }
  else if (days < 30)    { n = days;    unitKey = 'tools.timestamp.unit_day' }
  else if (months < 12)  { n = months;  unitKey = 'tools.timestamp.unit_month' }
  else                   { n = years;   unitKey = 'tools.timestamp.unit_year' }

  const template = isFuture
    ? t('tools.timestamp.rel_later')
    : t('tools.timestamp.rel_ago')
  return template.replace('{n}', String(n)).replace('{unit}', t(unitKey))
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
  const { t } = useI18n()
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
          title={t('tools.timestamp.copy_aria').replace('{label}', row.label)}
          aria-label={t('tools.timestamp.copy_aria').replace('{label}', row.label)}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {isCopied ? t('common.copied') : t('common.copy')}
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

  const { t } = useI18n()

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
        { key: 'local',   label: t('tools.timestamp.label_local'),   value: null },
        { key: 'utc',     label: t('tools.timestamp.label_utc'),     value: null },
        { key: 'iso',     label: t('tools.timestamp.label_iso'),     value: null },
        { key: 'rel',     label: t('tools.timestamp.label_relative'), value: null },
        { key: 'sec',     label: t('tools.timestamp.label_unix_sec'), value: null },
        { key: 'ms',      label: t('tools.timestamp.label_unix_ms'),  value: null },
      ]
    }
    return [
      { key: 'local',  label: t('tools.timestamp.label_local'),   value: formatLocalTime(parsedMs) },
      { key: 'utc',    label: t('tools.timestamp.label_utc'),     value: formatUtcTime(parsedMs) },
      { key: 'iso',    label: t('tools.timestamp.label_iso'),     value: new Date(parsedMs).toISOString() },
      { key: 'rel',    label: t('tools.timestamp.label_relative'), value: formatRelative(parsedMs, t) },
      { key: 'sec',    label: t('tools.timestamp.label_unix_sec'), value: String(Math.floor(parsedMs / 1000)) },
      { key: 'ms',     label: t('tools.timestamp.label_unix_ms'),  value: String(parsedMs) },
    ]
  }, [parsedMs, t])

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
            <span>{t('tools.timestamp.input_desc')}</span>
          </div>
          {/* 现在按钮 */}
          <button
            onClick={handleNow}
            title={t('tools.timestamp.now_title')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            {t('tools.timestamp.now')}
          </button>
        </div>

        {/* 输入框 */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('tools.timestamp.input_placeholder')}
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
              {t('tools.timestamp.error_format')}
            </span>
          )}
        </div>

        {/* 输入类型提示 */}
        {isValid && (
          <div className="border-t border-border/30 bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground/70 font-mono">
            {parsedMs! > 1e13
              ? t('tools.timestamp.hint_toolarge')
              : input.trim().match(/^-?\d+$/)
                ? (parseInt(input.trim(), 10) > 1e10 ? t('tools.timestamp.hint_ms') : t('tools.timestamp.hint_sec'))
                : t('tools.timestamp.hint_date')}
          </div>
        )}
      </div>

      {/* ── 格式展示区 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 面板标题栏 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>{t('tools.timestamp.result_label')}</span>
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
              {copiedKey === 'all_ms' ? t('tools.timestamp.copy_ms_done') : t('tools.timestamp.copy_ms')}
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
            <span className="text-sm">{t('tools.timestamp.empty')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
