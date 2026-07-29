/**
 * 首页主体组件（搜索优先布局）
 * 全屏 Hero + 居中搜索框 + 实时过滤结果
 * 英文版和多语言版共用此组件
 */

import { type Locale } from '@/lib/i18n'
import { DecryptedText } from '@/components/reactbits/DecryptedText'
import { SplitText } from '@/components/reactbits/SplitText'
import { DotField } from '@/components/reactbits/DotField'
import { HomeSearch } from './HomeSearch'
import { HeroShell } from '@/components/layout/HeroShell'

interface Messages {
  home: { title: string; subtitle: string; search_placeholder?: string }
  tools?: Record<string, { title?: string; description?: string }>
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
    <HeroShell>
      {/* 彩色光晕背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%),' +
            'radial-gradient(ellipse 50% 40% at 85% 70%, color-mix(in oklch, oklch(0.65 0.18 200) 12%, transparent), transparent 70%)',
        }}
      />
      {/* 交互式点阵背景 */}
      <DotField className="absolute inset-0" />

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
        {/* 主标题（解密动画） */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 text-gradient">
          <DecryptedText text={home.title} speed={32} />
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
        />
      </div>
    </HeroShell>
  )
}
