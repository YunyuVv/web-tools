/**
 * 英文工具详情页（URL: /tools/[slug]/）
 * 使用 ToolPageShell 作为内容布局容器，页头（标题/眉批）不再渲染。
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getMessages } from '@/lib/i18n'
import { TOOLS } from '@/lib/tools-registry'
import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { JsonFormatterTool } from '@/components/tools/JsonFormatterTool'
import { JsonInspectorTool } from '@/components/tools/JsonInspectorTool'
import { Base64Tool } from '@/components/tools/Base64Tool'
import { UrlEncodeTool } from '@/components/tools/UrlEncodeTool'
import { UuidGeneratorTool } from '@/components/tools/UuidGeneratorTool'
import { HashGeneratorTool } from '@/components/tools/HashGeneratorTool'
import { TimestampTool } from '@/components/tools/TimestampTool'
import { WordCounterTool } from '@/components/tools/WordCounterTool'

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

  return (
    <ToolPageShell>
      {slug === 'json-formatter'  && <JsonFormatterTool />}
      {slug === 'json-inspector'  && <JsonInspectorTool />}
      {slug === 'base64'          && <Base64Tool />}
      {slug === 'url-encode'      && <UrlEncodeTool />}
      {slug === 'uuid-generator'  && <UuidGeneratorTool />}
      {slug === 'hash-generator'  && <HashGeneratorTool />}
      {slug === 'timestamp'       && <TimestampTool />}
      {slug === 'word-counter'    && <WordCounterTool />}
    </ToolPageShell>
  )
}
