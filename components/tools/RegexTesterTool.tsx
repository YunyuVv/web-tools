'use client'

/**
 * RegexTesterTool — 正则表达式实时测试器。
 * 顶部输入正则与开关 flags；中部输入测试文本；
 * 下方高亮所有匹配，并列出每次匹配的索引与捕获组，非法正则时给出错误提示。
 */

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, AlertTriangle, Sparkles } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

interface MatchInfo {
  index: number
  value: string
  groups: (string | undefined)[]
  named: Record<string, string>
}

interface Segment {
  text: string
  match: boolean
}

/** 受支持的 flags */
const FLAG_DEFS: { key: keyof Flags; label: string; i18nKey: string }[] = [
  { key: 'g', label: 'g', i18nKey: 'tools.regex-tester.flag_g' },
  { key: 'i', label: 'i', i18nKey: 'tools.regex-tester.flag_i' },
  { key: 'm', label: 'm', i18nKey: 'tools.regex-tester.flag_m' },
  { key: 's', label: 's', i18nKey: 'tools.regex-tester.flag_s' },
]

type Flags = { g: boolean; i: boolean; m: boolean; s: boolean }

const SAMPLE_PATTERN = '\\b(\\w+@\\w+\\.\\w+)\\b'

export function RegexTesterTool() {
  const { t } = useI18n()

  const SAMPLE_TEXT = t('tools.regex-tester.sample_text')

  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<Flags>({ g: true, i: false, m: false, s: false })
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const flagStr = useMemo(
    () => (Object.keys(flags) as (keyof Flags)[]).filter(k => flags[k]).map(k => k).join(''),
    [flags],
  )

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null }
    try {
      return { regex: new RegExp(pattern, flagStr), error: null }
    } catch (e) {
      return { regex: null, error: (e as Error).message }
    }
  }, [pattern, flagStr])

  const matches = useMemo<MatchInfo[]>(() => {
    if (!regex || !text) return []
    const out: MatchInfo[] = []
    if (flagStr.includes('g')) {
      let m: RegExpExecArray | null
      let guard = 0
      while ((m = regex.exec(text)) !== null) {
        out.push({
          index: m.index,
          value: m[0],
          groups: m.slice(1),
          named: m.groups ? Object.fromEntries(Object.entries(m.groups).map(([k, v]) => [k, String(v)])) : {},
        })
        if (m.index === regex.lastIndex) regex.lastIndex++
        if (++guard > 10000) break
      }
    } else {
      const m = regex.exec(text)
      if (m)
        out.push({
          index: m.index,
          value: m[0],
          groups: m.slice(1),
          named: m.groups ? Object.fromEntries(Object.entries(m.groups).map(([k, v]) => [k, String(v)])) : {},
        })
    }
    return out
  }, [regex, text, flagStr])

  /** 高亮分段 */
  const segments = useMemo<Segment[]>(() => {
    if (!text) return []
    if (!matches.length) return [{ text, match: false }]
    const segs: Segment[] = []
    let cursor = 0
    for (const mt of matches) {
      if (mt.index < cursor) continue
      if (mt.index > cursor) segs.push({ text: text.slice(cursor, mt.index), match: false })
      segs.push({ text: mt.value, match: true })
      cursor = mt.index + mt.value.length
    }
    if (cursor < text.length) segs.push({ text: text.slice(cursor), match: false })
    return segs
  }, [text, matches])

  const toggleFlag = (k: keyof Flags) => setFlags(prev => ({ ...prev, [k]: !prev[k] }))

  const handleSample = useCallback(() => {
    setPattern(SAMPLE_PATTERN)
    setText(SAMPLE_TEXT)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!pattern) return
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flagStr}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [pattern, flagStr])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">{t('tools.regex-tester.title')}</span>
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
          onClick={handleCopy}
          disabled={!pattern}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>

      {/* ── 正则输入 + flags ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 font-mono text-sm">
            <span className="text-muted-foreground">/</span>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder={t('tools.regex-tester.input_placeholder')}
              spellCheck={false}
              className="w-full border-0 bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60"
            />
            <span className="text-muted-foreground">/{flagStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {FLAG_DEFS.map(f => (
              <button
                key={f.key}
                type="button"
                title={t(f.i18nKey)}
                onClick={() => toggleFlag(f.key)}
                className={`h-7 w-7 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  flags[f.key]
                    ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 border-t border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t('tools.regex-tester.error_prefix').replace('{error}', error)}</span>
          </div>
        )}
      </div>

      {/* ── 测试文本 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">{t('tools.regex-tester.test_label')}</span>
          <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums">
            {t('tools.regex-tester.match_count').replace('{count}', String(matches.length))}
          </span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('tools.regex-tester.text_placeholder')}
          spellCheck={false}
          className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[160px]"
        />
      </div>

      {/* ── 高亮预览 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
          {t('tools.regex-tester.highlight_label')}
        </div>
        <div className="whitespace-pre-wrap break-words px-5 py-4 font-mono text-sm leading-7">
          {segments.length === 0 ? (
            <span className="text-muted-foreground/50">{t('tools.regex-tester.highlight_placeholder')}</span>
          ) : (
            segments.map((s, i) =>
              s.match ? (
                <mark key={i} className="rounded bg-primary/20 px-0.5 text-primary">
                  {s.text}
                </mark>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )
          )}
        </div>
      </div>

      {/* ── 匹配详情 ── */}
      {matches.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
            {t('tools.regex-tester.detail_label')}
          </div>
          <div className="divide-y divide-border/30">
            {matches.slice(0, 50).map((m, i) => (
              <div key={i} className="px-5 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">#{i + 1}</span>
                  <span className="text-muted-foreground">{t('tools.regex-tester.position').replace('{i}', String(m.index))}</span>
                  <code className="truncate font-mono text-foreground">{m.value || t('tools.regex-tester.empty')}</code>
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.groups.map((g, gi) => (
                      <span key={gi} className="rounded-md bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
                        {t('tools.regex-tester.group').replace('{n}', String(gi + 1))}: {g === undefined ? '—' : g || t('tools.regex-tester.empty')}
                      </span>
                    ))}
                  </div>
                )}
                {Object.keys(m.named).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(m.named).map(([k, v]) => (
                      <span key={k} className="rounded-md bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
                        {t('tools.regex-tester.named_group').replace('{k}', k)}: {v || t('tools.regex-tester.empty')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
