/**
 * 多语言首页（URL: /zh-CN/ 或 /zh-TW/）
 * 使用共享 ToolsHomePage 组件
 */

import type { Metadata } from 'next'
import { getMessages, PREFIXED_LOCALES, type Locale } from '@/lib/i18n'
import { localizedAlternates } from '@/lib/site'
import { ToolsHomePage } from '@/components/home/ToolsHomePage'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DevToolBox - 免费在线开发者工具',
    description:
      '一套快速、免费、注重隐私的开发者工具，全部在浏览器本地运行。无需登录、无后端、数据不出本机。',
    alternates: localizedAlternates(''),
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return PREFIXED_LOCALES.map(locale => ({ locale }))
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const messages = await getMessages(locale as Locale)
  return (
    <ToolsHomePage
      locale={locale as Locale}
      messages={messages as any}
      basePath={`/${locale}`}
    />
  )
}
