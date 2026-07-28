/**
 * 首页主体组件（服务端 + 客户端混合）
 * 包含：Hero 区域、分类快捷导航、工具卡片网格
 * 英文版和多语言版共用此组件
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { type Locale } from '@/lib/i18n'
import { TOOLS, CATEGORY_CONFIG, getAllToolsByCategory, type ToolCategory } from '@/lib/tools-registry'
import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/reactbits/SplitText'
import { CategoryIcon } from './CategoryIcon'

interface Messages {
  home: { title: string; subtitle: string; search_placeholder?: string }
  tools?: Record<string, { title?: string; description?: string }>
}

interface Props {
  locale: Locale
  messages: Messages
  basePath: string
}

const TOTAL_TOOLS = TOOLS.length
const LIVE_TOOLS  = TOOLS.filter(t => t.enabled).length
const CATEGORY_COUNT = Object.keys(CATEGORY_CONFIG).length

/** 单个工具卡片 — 实色渐变图标，Live/Soon 各自独立样式 */
function ToolCard({
  tool,
  toolMessages,
  href,
}: {
  tool: (typeof TOOLS)[0]
  toolMessages?: { title?: string; description?: string }
  href: string | null
}) {
  const config = CATEGORY_CONFIG[tool.category]
  const title  = toolMessages?.title ?? tool.slug
  const desc   = toolMessages?.description ?? ''

  /* ─── 已上线卡片 ─── */
  if (tool.enabled && href) {
    return (
      <Link href={href} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        <div className="h-full rounded-xl border bg-card shadow-sm flex flex-col p-5 gap-4
          hover:shadow-md hover:border-primary/40 transition-all duration-200">

          {/* 图标 + LIVE 徽章 */}
          <div className="flex items-start justify-between">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ background: config.iconGradient }}
            >
              <CategoryIcon name={tool.icon} className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-wide
              bg-green-500/10 text-green-600 dark:text-green-400
              ring-1 ring-green-500/25 px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>

          {/* 文字 */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-snug
              group-hover:text-primary transition-colors">
              {title}
            </div>
            {desc && (
              <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {desc}
              </div>
            )}
          </div>

          {/* 底部 CTA */}
          <div className={`flex items-center gap-1 text-xs font-semibold ${config.textClass}`}>
            Open tool
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }

  /* ─── 即将上线卡片 ─── */
  return (
    <div className="h-full rounded-xl border border-dashed bg-muted/30 flex flex-col p-5 gap-4">

      {/* 图标 + SOON 徽章 */}
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-muted flex-shrink-0">
          <CategoryIcon name={tool.icon} className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground
          bg-muted ring-1 ring-border px-2 py-0.5 rounded-full">
          SOON
        </span>
      </div>

      {/* 文字 */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-snug text-muted-foreground">
          {title}
        </div>
        {desc && (
          <div className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-2 leading-relaxed">
            {desc}
          </div>
        )}
      </div>

      {/* 底部占位 */}
      <div className="text-xs text-muted-foreground/50">In development</div>
    </div>
  )
}

/** 分类快捷 Pill */
function CategoryPill({
  category,
  config,
}: {
  category: ToolCategory
  config: typeof CATEGORY_CONFIG[ToolCategory]
}) {
  return (
    <a
      href={`#cat-${category}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-150 cursor-pointer
        ${config.bgClass} ${config.textClass} border-current/20 hover:border-current/50 hover:scale-105`}
    >
      <CategoryIcon name={config.icon} className="h-3 w-3" />
      {config.label}
    </a>
  )
}

/** 统计数字项 */
function StatItem({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/** 首页主组件 */
export function ToolsHomePage({ locale, messages, basePath }: Props) {
  const home = messages.home
  const allByCategory = getAllToolsByCategory()

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-bg flex flex-col items-center justify-center text-center px-4 py-24">
        {/* 顶部徽章 */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
          border bg-background/70 backdrop-blur-sm text-xs font-medium text-muted-foreground shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {LIVE_TOOLS} Live · {TOTAL_TOOLS} Total Tools
        </div>

        {/* 主标题 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-gradient">
          <SplitText text={home.title} splitType="words" delay={80} duration={700} />
        </h1>

        {/* 副标题 */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed mb-10">
          <SplitText text={home.subtitle} splitType="words" delay={25} duration={600} />
        </p>

        {/* 统计行 */}
        <div className="flex items-center gap-10">
          <StatItem value={TOTAL_TOOLS}      label="Tools"      />
          <div className="w-px h-8 bg-border" />
          <StatItem value={CATEGORY_COUNT}   label="Categories" />
          <div className="w-px h-8 bg-border" />
          <StatItem value="100%"             label="Free"       />
        </div>
      </section>

      {/* ── 分类快捷导航 ── */}
      <section className="sticky top-14 z-40 border-y bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CATEGORY_CONFIG) as [ToolCategory, typeof CATEGORY_CONFIG[ToolCategory]][]).map(
              ([cat, cfg]) => (
                <CategoryPill key={cat} category={cat} config={cfg} />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── 工具分类网格 ── */}
      <div className="max-w-7xl mx-auto px-4 py-14 space-y-14">
        {(Object.entries(CATEGORY_CONFIG) as [ToolCategory, typeof CATEGORY_CONFIG[ToolCategory]][]).map(
          ([category, cfg]) => {
            const tools = allByCategory.get(category) ?? []
            if (tools.length === 0) return null
            const liveCount = tools.filter(t => t.enabled).length

            return (
              <section key={category} id={`cat-${category}`} className="scroll-mt-28">
                {/* 分类标题行 */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: cfg.iconGradient }}
                  >
                    <CategoryIcon name={cfg.icon} className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">{cfg.label}</h2>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {liveCount}/{tools.length}
                  </Badge>
                </div>

                {/* 3 列网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map(tool => {
                    const tm   = messages.tools?.[tool.i18nKey]
                    const href = tool.enabled ? `${basePath}/tools/${tool.slug}/` : null
                    return (
                      <ToolCard
                        key={tool.slug}
                        tool={tool}
                        toolMessages={tm}
                        href={href}
                      />
                    )
                  })}
                </div>
              </section>
            )
          }
        )}
      </div>
    </div>
  )
}
