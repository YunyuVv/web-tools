/**
 * 英文工具详情页（URL: /tools/[slug]/）
 * 使用 ToolPageShell 提供统一工具页标题和说明布局。
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getMessages } from '@/lib/i18n'
import { TOOLS } from '@/lib/tools-registry'
import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { JsonWorkbench } from '@/components/tools/JsonWorkbench'

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
  }
}

export default async function EnToolPage({ params }: Props) {
  const { slug } = await params
  const tool = TOOLS.find(t => t.slug === slug && t.enabled)
  if (!tool) notFound()

  const messages = await getMessages('en')
  const tm = (messages as any).tools?.[slug] ?? {}

  const homeMessages = (messages as any).home ?? {}

  return (
    <ToolPageShell
      eyebrow={homeMessages.title ?? 'DevToolBox'}
      title={tm.title ?? slug}
      description={tm.description ?? ''}
    >
      {slug === 'json-formatter' && (
        <JsonWorkbench messages={messages as any} />
      )}

      {/* SEO 说明区 */}
      {tm.seo_description && (
        <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground">
          <p>{tm.seo_description}</p>
        </div>
      )}
    </ToolPageShell>
  )
}
