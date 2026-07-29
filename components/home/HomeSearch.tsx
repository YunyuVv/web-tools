'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import type { Tool } from '@/lib/tools-registry'
import { TOOLS, CATEGORY_CONFIG } from '@/lib/tools-registry'
import { CategoryIcon } from './CategoryIcon'

interface HomeSearchProps {
  locale: string
  basePath: string
  tools?: Record<string, { title?: string; description?: string }>
}

/** 搜索结果中的单个工具行（极简） */
function SearchResultRow({
  tool,
  title,
  href,
}: {
  tool: Tool
  title: string
  href: string | null
}) {
  const config = CATEGORY_CONFIG[tool.category]

  if (tool.enabled && href) {
    return (
      <Link href={href} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl
        border border-transparent hover:border-border/60 hover:bg-muted/50 transition-all duration-150">
        <CategoryIcon name={tool.icon} className="h-4 w-4 flex-shrink-0" style={{ color: config.colorVar }} />
        <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
          {title}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    )
  }

  // SOON 状态
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-50">
      <CategoryIcon name={tool.icon} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="flex-1 text-sm font-medium text-muted-foreground truncate">{title}</span>
      <span className="text-[10px] text-muted-foreground flex-shrink-0">SOON</span>
    </div>
  )
}

export function HomeSearch({ locale, basePath, tools }: HomeSearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase().trim()
    return TOOLS.filter(tool => {
      const title = tools?.[tool.i18nKey]?.title ?? tool.slug
      const desc = tools?.[tool.i18nKey]?.description ?? ''
      const catLabel = CATEGORY_CONFIG[tool.category].label
      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        catLabel.toLowerCase().includes(q)
      )
    }).sort((a, b) => {
      // 已上线工具优先
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
      return 0
    })
  }, [query, tools])

  const hasQuery = query.trim().length > 0
  const liveCount = results.filter(r => r.enabled).length

  return (
    <div className="w-full max-w-xl mx-auto relative">
      {/* ── 搜索框（居中，位置固定）── */}
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索工具…"
          className="w-full h-14 pl-12 pr-4 rounded-2xl border bg-background/80 backdrop-blur-md text-base
            placeholder:text-muted-foreground/60
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50
            shadow-lg shadow-black/5 transition-all duration-200"
          autoFocus
        />
        {/* 底部发光线 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent
          group-focus-within:w-3/4 transition-all duration-500" />
      </div>

      {/* ── 提示（无搜索时，不占位）── */}
      {!hasQuery && (
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          输入关键词查找 JSON、Base64、URL 编码、时间戳等工具
        </p>
      )}

      {/* ── 搜索结果（绝对定位，不影响搜索框位置）── */}
      {hasQuery && (
        <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 z-20">
          {results.length === 0 ? (
            <div className="rounded-2xl border bg-background/95 backdrop-blur-md p-8 text-center text-muted-foreground shadow-lg">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-25" />
              <p className="text-sm">没有找到匹配的工具</p>
              <p className="text-xs mt-1 opacity-70">试试其他关键词？</p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-background/95 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30">
                找到 <span className="font-medium text-foreground">{liveCount}</span> 个匹配工具
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1 space-y-0.5">
                {results.map(tool => {
                  const tm = tools?.[tool.i18nKey]
                  const title = tm?.title ?? tool.slug
                  const href = tool.enabled ? `${basePath}/tools/${tool.slug}/` : null
                  return (
                    <SearchResultRow
                      key={tool.slug}
                      tool={tool}
                      title={title}
                      href={href}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
