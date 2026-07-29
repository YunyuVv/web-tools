/**
 * 首页主体组件（搜索优先布局）
 * 全屏 Hero + 居中搜索框 + 实时过滤结果
 * 英文版和多语言版共用此组件
 */

import { type Locale } from '@/lib/i18n'
import { ShinyText } from '@/components/reactbits/ShinyText'
import { SplitText } from '@/components/reactbits/SplitText'
import { DotField } from '@/components/reactbits/DotField'
import { HomeSearch } from './HomeSearch'
import { HeroShell } from '@/components/layout/HeroShell'

interface Messages {
  home: {
    title: string
    subtitle: string
    search_placeholder?: string
    search_hint?: string
    search_results_count?: string
    search_empty_title?: string
    search_empty_hint?: string
  }
  tools?: Record<string, { title?: string; description?: string }>
  sidebar?: { soon?: string }
}

interface Props {
  locale: Locale
  messages: Messages
  basePath: string
}

/** 首页主组件 */
export function ToolsHomePage({ locale, messages, basePath }: Props) {
  const home = messages.home

  return (
    <HeroShell background={<DotField className="absolute inset-0" />}>
      {/* 主标题（✨ 与文字共用渐变一起扫光） */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5">
          <ShinyText text={`✨ ${home.title}`} speed={3} />
        </h1>

        {/* 副标题 */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed mb-10">
          <SplitText text={home.subtitle} splitType="words" delay={25} duration={600} />
        </p>

        {/* 搜索框 + 结果列表 */}
        <HomeSearch
          locale={locale}
          basePath={basePath}
          tools={messages.tools}
          home={messages.home}
          sidebar={messages.sidebar}
        />
    </HeroShell>
  )
}
