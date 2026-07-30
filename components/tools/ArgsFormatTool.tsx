'use client'

/**
 * URL 查询参数格式化工具。
 * 把 URL / 路径+参数 / 纯查询串解析成可编辑参数列表，支持：
 *  - 逐行编辑 key / value、增删行
 *  - 逐行启用控制（含全选 + indeterminate 半选）
 *  - 按 key / value 搜索过滤、按 key 排序
 *  - 三种输出格式：查询字符串 / JSON 对象 / 键值列表
 *  - 输出长度接近上限时给出警告、一键复制
 * 布局沿用本项目工具页风格：rounded-2xl 面板 + SlidingSegmented 切换格式 + 所有可见文案走 t()。
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Copy, Check, Trash2, Search, Plus, Wand2, ChevronDown } from 'lucide-react'
import { SlidingSegmented } from '@/components/ui/SlidingSegmented'
import { useI18n } from '@/components/layout/I18nProvider'

/** 单个 URL 参数 */
interface UrlParam {
  id: string
  key: string
  value: string
  enabled: boolean
}

/** 输出格式 */
type OutputFormat = 'query' | 'object' | 'list'

/** 生成参数唯一标识（会话内自增，避免 SSR/Math.random 不稳定） */
let idCounter = 0
const nextId = () => `p${++idCounter}`

export function ArgsFormatTool() {
  const { t } = useI18n()

  /** 待解析的原始 URL 或查询字符串 */
  const [inputUrl, setInputUrl] = useState('')
  /** 当前参数列表 */
  const [params, setParams] = useState<UrlParam[]>([])
  /** 输出格式 */
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('query')
  /** 是否按 key 排序 */
  const [sortByKey, setSortByKey] = useState(false)
  /** 搜索关键字 */
  const [search, setSearch] = useState('')
  /** 使用说明折叠 */
  const [showUsage, setShowUsage] = useState(false)
  /** 复制成功临时态 */
  const [copied, setCopied] = useState(false)

  /** 全选复选框 ref，用于同步 indeterminate 半选态 */
  const selectAllRef = useRef<HTMLInputElement>(null)

  /** 已启用参数数量 */
  const enabledCount = params.filter(p => p.enabled).length

  /** 展示列表：先按搜索过滤，再按需按 key 排序 */
  const displayedParams = (() => {
    const kw = search.trim().toLowerCase()
    let list = params.filter(
      p =>
        kw === '' ||
        p.key.toLowerCase().includes(kw) ||
        p.value.toLowerCase().includes(kw)
    )
    if (sortByKey) list = [...list].sort((a, b) => a.key.localeCompare(b.key))
    return list
  })()

  /** 是否全部启用 */
  const isAllSelected = params.length > 0 && params.every(p => p.enabled)
  /** 是否半选 */
  const isIndeterminate = params.some(p => p.enabled) && !isAllSelected

  /** 同步全选复选框半选态 */
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  /** 格式化结果：仅启用参数参与，必要时按 key 排序 */
  const formattedOutput = (() => {
    let list = params.filter(p => p.enabled)
    if (sortByKey) list = [...list].sort((a, b) => a.key.localeCompare(b.key))
    switch (outputFormat) {
      case 'query': {
        const sp = new URLSearchParams()
        list.forEach(p => sp.append(p.key, p.value))
        try {
          return decodeURIComponent(sp.toString())
        } catch {
          return sp.toString()
        }
      }
      case 'object': {
        const obj: Record<string, string> = {}
        list.forEach(p => {
          obj[p.key] = p.value
        })
        return JSON.stringify(obj, null, 2)
      }
      case 'list':
        return list.map(p => `${p.key}: ${p.value}`).join('\n')
      default:
        return ''
    }
  })()

  /** 输出长度 */
  const urlLength = formattedOutput.length
  /** 接近浏览器 URL 长度上限 */
  const isNearLimit = urlLength > 1800

  /** 解析输入为参数列表 */
  const parseUrl = useCallback(() => {
    if (!inputUrl.trim()) {
      setParams([])
      return
    }
    try {
      let searchParams: URLSearchParams
      if (inputUrl.includes('?')) {
        const [, query] = inputUrl.split('?')
        searchParams = new URL(`http://example.com?${query ?? ''}`).searchParams
      } else {
        searchParams = new URL(`http://example.com?${inputUrl}`).searchParams
      }
      setParams(
        Array.from(searchParams.entries()).map(([key, value]) => ({
          id: nextId(),
          key,
          value,
          enabled: true,
        }))
      )
    } catch {
      setParams([])
    }
  }, [inputUrl])

  /** 顶部新增一行（空参数，默认启用） */
  const addRow = useCallback(() => {
    setParams(prev => [{ id: nextId(), key: '', value: '', enabled: true }, ...prev])
  }, [])

  /** 删除指定行 */
  const removeRow = useCallback((id: string) => {
    setParams(prev => prev.filter(p => p.id !== id))
  }, [])

  /** 修改某行 key / value */
  const editRow = useCallback((id: string, field: 'key' | 'value', val: string) => {
    setParams(prev => prev.map(p => (p.id === id ? { ...p, [field]: val } : p)))
  }, [])

  /** 切换某行启用态 */
  const toggleRow = useCallback((id: string) => {
    setParams(prev => prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }, [])

  /** 全选 / 全不选 */
  const toggleSelectAll = useCallback((checked: boolean) => {
    setParams(prev => prev.map(p => ({ ...p, enabled: checked })))
  }, [])

  /** 清空输入与列表（保留格式/排序偏好） */
  const clearAll = useCallback(() => {
    setParams([])
    setInputUrl('')
    setSearch('')
  }, [])

  /** 复制结果 */
  const handleCopy = useCallback(async () => {
    if (!formattedOutput) return
    try {
      await navigator.clipboard.writeText(formattedOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 复制失败静默处理
    }
  }, [formattedOutput])

  const formatName =
    outputFormat === 'query' ? t('tools.args-format.fmt_query')
    : outputFormat === 'object' ? t('tools.args-format.fmt_object')
    : t('tools.args-format.fmt_list')

  return (
    <div className="flex flex-col gap-6">
      {/* ── 顶部操作栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={parseUrl}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 cursor-pointer"
        >
          <Wand2 className="h-4 w-4" />
          <span>{t('tools.args-format.parse')}</span>
        </button>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('tools.args-format.add_row')}</span>
        </button>
        <button
          onClick={clearAll}
          disabled={!inputUrl && params.length === 0}
          title={t('common.clear')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          <span>{t('common.clear')}</span>
        </button>
      </div>

      {/* ── 双栏工作区 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* 左：输入与参数编辑 */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="font-medium text-muted-foreground">{t('tools.args-format.panel_input')}</span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums text-muted-foreground">
              {t('tools.args-format.params_count').replace('{n}', String(params.length))}
              {enabledCount !== params.length && params.length > 0
                ? ` · ${t('tools.args-format.enabled_count').replace('{n}', String(enabledCount))}`
                : ''}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <textarea
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder={t('tools.args-format.input_placeholder')}
              spellCheck={false}
              className="w-full resize-y border-0 bg-transparent px-1 py-2 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[120px]"
            />

            {/* 搜索 + 排序 */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('tools.args-format.search_placeholder')}
                  className="w-full rounded-full border border-border/60 bg-transparent py-2 pl-9 pr-3 text-sm focus:border-primary/40 focus:outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={sortByKey}
                  onChange={e => setSortByKey(e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span>{t('tools.args-format.sort_by_key')}</span>
              </label>
            </div>

            {/* 参数表 */}
            <div className="overflow-hidden rounded-xl border border-border/60">
              <div className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 border-b border-border/40 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="flex justify-center">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    aria-label={t('tools.args-format.select_all')}
                    checked={isAllSelected}
                    onChange={e => toggleSelectAll(e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                </div>
                <span>{t('tools.args-format.col_key')}</span>
                <span>{t('tools.args-format.col_value')}</span>
                <span className="text-center">{t('tools.args-format.col_action')}</span>
              </div>

              {displayedParams.length ? (
                <div className="max-h-[420px] overflow-auto">
                  {displayedParams.map(p => (
                    <div
                      key={p.id}
                      className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 border-t border-border/40 px-3 py-2 first:border-t-0"
                    >
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          aria-label={t('tools.args-format.delete')}
                          checked={p.enabled}
                          onChange={() => toggleRow(p.id)}
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                      </div>
                      <input
                        value={p.key}
                        onChange={e => editRow(p.id, 'key', e.target.value)}
                        placeholder={t('tools.args-format.param_key_placeholder')}
                        spellCheck={false}
                        className="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 font-mono text-sm focus:border-primary/40 focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <input
                        value={p.value}
                        onChange={e => editRow(p.id, 'value', e.target.value)}
                        placeholder={t('tools.args-format.param_value_placeholder')}
                        spellCheck={false}
                        className="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 font-mono text-sm focus:border-primary/40 focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <button
                        onClick={() => removeRow(p.id)}
                        title={t('tools.args-format.delete')}
                        aria-label={t('tools.args-format.delete')}
                        className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {params.length ? t('tools.args-format.empty_no_match') : t('tools.args-format.empty_waiting')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {params.length ? t('tools.args-format.empty_no_match_desc') : t('tools.args-format.empty_waiting_desc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右：输出结果 */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="font-medium text-muted-foreground">{t('tools.args-format.panel_output')}</span>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {/* 输出格式切换 */}
            <SlidingSegmented
              ariaLabel={t('tools.args-format.format_label')}
              value={outputFormat}
              onChange={setOutputFormat}
              options={[
                { value: 'query', label: t('tools.args-format.fmt_query') },
                { value: 'object', label: t('tools.args-format.fmt_object') },
                { value: 'list', label: t('tools.args-format.fmt_list') },
              ]}
            />

            {/* 状态条 */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
              <div>
                <span className="block text-xs text-muted-foreground">{t('tools.args-format.format_label')}</span>
                <p className="mt-0.5 text-sm font-medium">{formatName}</p>
              </div>
              <div className="text-right">
                <span className="block text-xs text-muted-foreground">{t('tools.args-format.length_label')}</span>
                <p className="mt-0.5 text-sm font-medium tabular-nums">{urlLength} 字符</p>
              </div>
            </div>

            {/* 接近上限警告 */}
            {isNearLimit && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400">
                {t('tools.args-format.length_warning')}
              </div>
            )}

            {/* 结果头 + 复制 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('tools.args-format.format_label')}</span>
              <button
                onClick={handleCopy}
                disabled={!formattedOutput}
                title={t('common.copy')}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{t('common.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>{t('common.copy')}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="min-h-[360px] max-h-[460px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border/60 bg-muted/20 p-4 font-mono text-xs leading-7">
              {formattedOutput || t('tools.args-format.result_placeholder')}
            </pre>
          </div>
        </div>
      </div>

      {/* ── 使用说明（折叠） ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <button
          onClick={() => setShowUsage(v => !v)}
          aria-expanded={showUsage}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition hover:text-primary cursor-pointer"
        >
          <span>{t('tools.args-format.usage_title')}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showUsage ? 'rotate-180' : ''}`} />
        </button>
        {showUsage && (
          <div className="flex flex-col gap-2 border-t border-border/40 px-5 py-4 text-xs leading-7 text-muted-foreground">
            <p>{t('tools.args-format.usage_1')}</p>
            <p>{t('tools.args-format.usage_2')}</p>
            <p>{t('tools.args-format.usage_3')}</p>
            <p>{t('tools.args-format.usage_4')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
