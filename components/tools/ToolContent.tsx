/**
 * 工具内容渲染（slug → 组件 单一真相源）
 *
 * 问题背景：
 *   项目有两套工具详情路由 —— `app/(en)/tools/[slug]`（无前缀，默认语言）与
 *   `app/[locale]/tools/[slug]`（带语言前缀）。两份页面原本各自复制了一份
 *   `slug === 'x' && <X/>` 的 switch，新增工具时极易只改一处，导致无前缀路由
 *   渲染出空白（参见 2026-07-30 的 /tools/cron-parser/ 空白 bug）。
 *
 * 这里把"slug 到组件"的映射收敛到唯一出处，两个页面都引用它，从根本上杜绝脱节。
 * 新工具只需在此处追加一行即可同时生效于两套路由。
 */

import type { ComponentType } from 'react'
import { JsonFormatterTool } from './JsonFormatterTool'
import { JsonInspectorTool } from './JsonInspectorTool'
import { JsonToCsvTool } from './JsonToCsvTool'
import { Base64Tool } from './Base64Tool'
import { UrlEncodeTool } from './UrlEncodeTool'
import { ArgsFormatTool } from './ArgsFormatTool'
import { HtmlEntitiesTool } from './HtmlEntitiesTool'
import { Md5Tool } from './Md5Tool'
import { HashGeneratorTool } from './HashGeneratorTool'
import { UuidGeneratorTool } from './UuidGeneratorTool'
import { PasswordGeneratorTool } from './PasswordGeneratorTool'
import { RegexTesterTool } from './RegexTesterTool'
import { TimestampTool } from './TimestampTool'
import { CronParserTool } from './CronParserTool'
import { CssGradientTool } from './CssGradientTool'
import { BoxShadowTool } from './BoxShadowTool'
import { ColorConverterTool } from './ColorConverterTool'
import { ContrastCheckerTool } from './ContrastCheckerTool'
import { LoremIpsumTool } from './LoremIpsumTool'
import { WordCounterTool } from './WordCounterTool'
import { MarkdownPreviewTool } from './MarkdownPreviewTool'
import { IpLookupTool } from './IpLookupTool'
import { UserAgentTool } from './UserAgentTool'
import { AvatarTool } from './AvatarTool'
import { ImageCompressTool } from './ImageCompressTool'

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  'json-formatter': JsonFormatterTool,
  'json-inspector': JsonInspectorTool,
  'json-to-csv': JsonToCsvTool,
  'base64': Base64Tool,
  'url-encode': UrlEncodeTool,
  'args-format': ArgsFormatTool,
  'html-entities': HtmlEntitiesTool,
  'md5': Md5Tool,
  'hash-generator': HashGeneratorTool,
  'uuid-generator': UuidGeneratorTool,
  'password-generator': PasswordGeneratorTool,
  'regex-tester': RegexTesterTool,
  'timestamp': TimestampTool,
  'cron-parser': CronParserTool,
  'css-gradient': CssGradientTool,
  'box-shadow': BoxShadowTool,
  'color-converter': ColorConverterTool,
  'contrast-checker': ContrastCheckerTool,
  'lorem-ipsum': LoremIpsumTool,
  'word-counter': WordCounterTool,
  'markdown-preview': MarkdownPreviewTool,
  'ip-lookup': IpLookupTool,
  'user-agent': UserAgentTool,
  'avatar': AvatarTool,
  'image-compress': ImageCompressTool,
}

export function ToolContent({ slug }: { slug: string }) {
  const Cmp = TOOL_COMPONENTS[slug]
  return Cmp ? <Cmp /> : null
}

/** 该 slug 是否存在对应组件（供页面判断 notFound 之外的兜底） */
export function hasToolComponent(slug: string): boolean {
  return slug in TOOL_COMPONENTS
}
