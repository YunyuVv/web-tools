/**
 * 工具页 JSON-LD 结构化数据组件（服务端组件，SSG 阶段写入静态 HTML）
 * 采用 schema.org 的 SoftwareApplication 类型，帮助搜索引擎在结果中
 * 展示更丰富的信息（名称 / 描述 / URL / 价格 / 语言），提升 SEO 点击率。
 */

import { buildToolJsonLd } from '@/lib/site'

interface Props {
  locale: string
  slug: string
  title: string
  description: string
}

export function ToolJsonLd({ locale, slug, title, description }: Props) {
  const jsonLd = buildToolJsonLd({ locale, slug, title, description })
  return (
    <script
      type="application/ld+json"
      // 内容在构建时生成，已是确定字符串，无用户可控输入，安全可注入
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
