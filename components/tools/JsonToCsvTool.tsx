'use client'

/**
 * JsonToCsvTool — JSON 转 CSV 工具。
 * 支持 JSON 数组对象、数组的数组，自动合并对象键为表头；
 * 左侧输入 JSON，右侧实时输出 CSV，并提供复制与示例。
 */

import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, Trash2, Sparkles, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

/** 示例 JSON（对象数组） */
const SAMPLE = `[
  { "name": "Alice", "age": 30, "city": "Beijing" },
  { "name": "Bob", "age": 25, "city": "Shanghai" },
  { "name": "Carol", "age": 28, "city": "Shenzhen" }
]`

/** 转义单个 CSV 字段（含逗号/引号/换行则加双引号包裹并转义内部引号） */
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

/** 将解析后的 JSON 转为 CSV 文本 */
function convert(json: unknown): string {
  let data: unknown = json
  if (!Array.isArray(data)) {
    if (data && typeof data === 'object') data = [data]
    else return ''
  }
  const rows = data as unknown[]
  if (rows.length === 0) return ''

  // 数组的数组：直接逐行输出
  if (Array.isArray(rows[0])) {
    return rows
      .map((r) => (Array.isArray(r) ? r : [r]).map(escapeCsv).join(','))
      .join('\n')
  }

  // 对象数组：合并所有键为表头
  const headers: string[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const k of Object.keys(row as object)) {
        if (!seen.has(k)) {
          seen.add(k)
          headers.push(k)
        }
      }
    }
  }
  const lines = [headers.map(escapeCsv).join(',')]
  for (const row of rows) {
    if (Array.isArray(row)) {
      lines.push((row as unknown[]).map(escapeCsv).join(','))
      continue
    }
    const obj = (row ?? {}) as Record<string, unknown>
    lines.push(headers.map(h => escapeCsv(obj[h])).join(','))
  }
  return lines.join('\n')
}

/**
 * JsonToCsvTool — 主组件。
 */
export function JsonToCsvTool() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setOutput(convert(parsed))
      setError(null)
    } catch {
      setOutput('')
      setError(t('tools.json-to-csv.error_invalid'))
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  const handleSample = useCallback(() => {
    setInput(SAMPLE)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [output])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">{t('tools.json-to-csv.title')}</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSample}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t('common.sample')}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          {t('common.clear')}
        </button>
      </div>

      {/* ── 错误提示 ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 双栏 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">{t('tools.json-to-csv.input_label')}</span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums">{input.length} {t('common.chars')}</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('tools.json-to-csv.input_placeholder')}
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[340px]"
          />
        </div>

        <div className={`rounded-2xl border bg-card overflow-hidden shadow-sm ${error ? 'border-destructive/40' : 'border-border/60'}`}>
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">{t('tools.json-to-csv.output_label')}</span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copied ? t('common.copied') : t('common.copy')}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.json-to-csv.output_placeholder')}
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[340px] cursor-default select-all"
          />
        </div>
      </div>
    </div>
  )
}
