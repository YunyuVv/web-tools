/**
 * 英文工具详情页（URL: /tools/[slug]/，无语言前缀，默认语言）
 * 使用 ToolPageShell 作为内容布局容器，页头（标题/眉批）不再渲染。
 * 工具渲染统一走 components/tools/ToolContent，与带前缀路由共享同一份映射。
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getMessages } from '@/lib/i18n'
import { localizedAlternates } from '@/lib/site'
import { TOOLS } from '@/lib/tools-registry'
import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { ToolContent } from '@/components/tools/ToolContent'
import { ToolJsonLd } from '@/components/seo/ToolJsonLd'

interface Props {
  params: Promise<{ slug: string }>
}

/** 静态生成所有英文工具页 */
export async function generateStaticParams() {
  return TOOLS.filter(t => t.enabled).map(tool => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const messages = await getMessages('en')
  const tm = (messages as any).tools?.[slug] ?? {}
  return {
    title: `${tm.title ?? slug} - DevToolBox`,
    description: tm.seo_description ?? tm.description ?? '',
    alternates: localizedAlternates(`tools/${slug}`),
  }
}

export default async function EnToolPage({ params }: Props) {
  const { slug } = await params
  const tool = TOOLS.find(t => t.slug === slug && t.enabled)
  if (!tool) notFound()

  const messages = await getMessages('en')
  const tm = (messages as any).tools?.[slug] ?? {}

  return (
    <ToolPageShell>
      <ToolJsonLd
        locale="en"
        slug={slug}
        title={`${tm.title ?? slug} - DevToolBox`}
        description={tm.seo_description ?? tm.description ?? ''}
      />
      <ToolContent slug={slug} />
    </ToolPageShell>
  )
}
