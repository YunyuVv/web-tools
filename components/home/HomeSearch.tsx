'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import type { Tool } from '@/lib/tools-registry'
import { TOOLS, CATEGORY_CONFIG } from '@/lib/tools-registry'
import { CategoryIcon } from './CategoryIcon'
import { useI18n } from '@/components/layout/I18nProvider'

interface HomeSearchProps {
  locale: string
  basePath: string
  tools?: Record<string, { title?: string; description?: string }>
  home?: {
    search_placeholder?: string
    search_hint?: string
    search_results_count?: string
    search_empty_title?: string
    search_empty_hint?: string
  }
  sidebar?: { soon?: string }
}

/** 搜索结果中的单个工具行 */
function SearchResultRow({
  tool,
  title,
  href,
  soonLabel,
}: {
  tool: Tool
  title: string
  href: string | null
  soonLabel: string
}) {
  const config = CATEGORY_CONFIG[tool.category]

  if (tool.enabled && href) {
    return (
      <Link href={href} className="group flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-muted/60 active:bg-muted/80 transition-colors duration-150">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `color-mix(in oklch, ${config.colorVar} 12%, transparent)` }}
        >
          <CategoryIcon name={tool.icon} className="h-[17px] w-[17px]" style={{ color: config.colorVar }} />
        </div>
        <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">{title}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:opacity-100 opacity-0 transition-all flex-shrink-0" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl opacity-40 pointer-events-none">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
        <CategoryIcon name={tool.icon} className="h-[17px] w-[17px] text-muted-foreground" />
      </div>
      <span className="flex-1 text-sm font-medium text-muted-foreground truncate">{title}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 flex-shrink-0">{soonLabel}</span>
    </div>
  )
}

export function HomeSearch({ locale, basePath, tools, home, sidebar }: HomeSearchProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    const matched: Tool[] = []
    for (const tool of TOOLS) {
      const t = tools?.[tool.i18nKey]?.title ?? tool.slug
      const d = tools?.[tool.i18nKey]?.description ?? ''
      const c = CATEGORY_CONFIG[tool.category].label
      if (t.toLowerCase().includes(q) || d.toLowerCase().includes(q) || tool.slug.toLowerCase().includes(q) || c.toLowerCase().includes(q)) {
        matched.push(tool)
      }
    }
    matched.sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1))
    return matched
  }, [query, tools])

  const hasQuery = query.trim().length > 0
  const liveCount = results.filter(r => r.enabled).length

  // i18n fallbacks（优先用页面字典传入的文案，缺失时回退到 useI18n 取键，避免硬编码）
  const placeholder = home?.search_placeholder ?? t('home.search_placeholder')
  const hint = home?.search_hint ?? t('home.search_hint')
  const resultsCountTpl = home?.search_results_count ?? t('home.search_results_count')
  const emptyTitle = home?.search_empty_title ?? t('home.search_empty_title')
  const emptyHint = home?.search_empty_hint ?? t('home.search_empty_hint')
  const soonLabel = sidebar?.soon ?? t('sidebar.soon')

  const resultsText = resultsCountTpl.replace('{count}', String(liveCount))

  return (
    <div className="w-full max-w-xl mx-auto relative">
      {/* 搜索框 */}
      <div className="relative w-full group/search">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/50 group-focus-within/search:text-primary transition-colors duration-200 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[52px] pl-12 pr-5 rounded-2xl border border-border/60 bg-background/90 backdrop-blur-md text-[15px]
            placeholder:text-muted-foreground/40
            focus:outline-none focus:border-primary/50 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_8%,transparent)]
            shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus:shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_0_3px_color-mix(in_oklch,var(--primary)_8%,transparent)]
            transition-all duration-200"
          autoFocus
        />
      </div>

      {/* 提示（始终占位，搜索时透明） */}
      <p className={`mt-3.5 text-center text-xs leading-relaxed transition-opacity duration-150 ${hasQuery ? 'opacity-0' : 'text-muted-foreground/45'}`}>
        {hint}
      </p>

      {/* 搜索结果（绝对定位浮层） */}
      {hasQuery && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-muted/60 flex items-center justify-center">
                <Search className="h-5 w-5 text-muted-foreground/35" />
              </div>
              <p className="text-sm font-medium text-foreground/70">{emptyTitle}</p>
              <p className="text-xs mt-1 text-muted-foreground/50">{emptyHint}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted-foreground/60 border-b border-border/40 bg-muted/20">
                {resultsText}
              </div>
              <div className="max-h-[340px] overflow-y-auto py-1 divide-y divide-border/30">
                {results.map(tool => {
                  const tm = tools?.[tool.i18nKey]
                  const t = tm?.title ?? tool.slug
                  const href = tool.enabled ? `${basePath}/tools/${tool.slug}/` : null
                  return <SearchResultRow key={tool.slug} tool={tool} title={t} href={href} soonLabel={soonLabel} />
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
