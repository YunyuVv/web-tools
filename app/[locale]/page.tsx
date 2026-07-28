/**
 * 多语言首页（URL: /zh-CN/ 或 /zh-TW/）
 * 使用共享 ToolsHomePage 组件
 */

import { getMessages, PREFIXED_LOCALES, type Locale } from '@/lib/i18n'
import { ToolsHomePage } from '@/components/home/ToolsHomePage'

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
