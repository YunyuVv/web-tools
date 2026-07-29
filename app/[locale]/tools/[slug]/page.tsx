/**
 * 工具详情页（带 locale 前缀）
 * 使用 ToolPageShell 提供统一工具页标题和说明布局。
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PREFIXED_LOCALES, getMessages, type Locale } from '@/lib/i18n'
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
    <ToolPageShell
      eyebrow={(messages as any).home?.title ?? 'DevToolBox'}
      title={tm.title ?? slug}
      description={tm.description ?? ''}
    >
      {slug === 'json-formatter'  && <JsonFormatterTool />}
      {slug === 'json-inspector'  && <JsonInspectorTool />}
      {slug === 'base64'          && <Base64Tool />}
      {slug === 'url-encode'      && <UrlEncodeTool />}
      {slug === 'uuid-generator'  && <UuidGeneratorTool />}
      {slug === 'hash-generator'  && <HashGeneratorTool />}
      {slug === 'timestamp'       && <TimestampTool />}
      {slug === 'word-counter'    && <WordCounterTool />}

      {/* SEO 说明区 */}
      {tm.seo_description && (
        <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground">
          <p>{tm.seo_description}</p>
        </div>
      )}
    </ToolPageShell>
  )
}
