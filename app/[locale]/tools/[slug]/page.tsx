/**
 * 工具详情页（带 locale 前缀：/{locale}/tools/[slug]）
 * 使用 ToolPageShell 作为内容布局容器，页头（标题/眉批）不再渲染。
 * 工具渲染统一走 components/tools/ToolContent，与无前缀路由共享同一份映射。
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PREFIXED_LOCALES, getMessages, type Locale } from '@/lib/i18n'
import { TOOLS } from '@/lib/tools-registry'
import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { ToolContent } from '@/components/tools/ToolContent'
import { ToolJsonLd } from '@/components/seo/ToolJsonLd'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

/** 静态生成所有 locale × tool 组合（仅含前缀语言）*/
export async function generateStaticParams() {
  const enabledTools = TOOLS.filter(t => t.enabled)
  return PREFIXED_LOCALES.flatMap(locale =>
    enabledTools.map(tool => ({ locale, slug: tool.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const messages = await getMessages(locale as Locale)
  const tm = (messages as any).tools?.[slug] ?? {}
  return {
    title: `${tm.title ?? slug} - DevToolBox`,
    description: tm.seo_description ?? tm.description ?? '',
  }
}

export default async function ToolPage({ params }: Props) {
  const { locale, slug } = await params
  const tool = TOOLS.find(t => t.slug === slug && t.enabled)
  if (!tool) notFound()

  const messages = await getMessages(locale as Locale)
  const tm = (messages as any).tools?.[slug] ?? {}

  return (
    <ToolPageShell>
      <ToolJsonLd
        locale={locale}
        slug={slug}
        title={`${tm.title ?? slug} - DevToolBox`}
        description={tm.seo_description ?? tm.description ?? ''}
      />
      <ToolContent slug={slug} />
    </ToolPageShell>
  )
}
