/**
 * 英文首页（URL: /）
 * 使用共享 ToolsHomePage 组件，无语言前缀
 */

import type { Metadata } from 'next'
import { getMessages } from '@/lib/i18n'
import { localizedAlternates } from '@/lib/site'
import { ToolsHomePage } from '@/components/home/ToolsHomePage'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DevToolBox - Free Online Developer Tools',
    description:
      'A collection of fast, free, privacy-first developer tools that run entirely in your browser. No login, no server, and no data ever leaves your device.',
    alternates: localizedAlternates(''),
  }
}

export default async function EnHomePage() {
  const messages = await getMessages('en')
  return (
    <ToolsHomePage
      locale="en"
      messages={messages as any}
      basePath=""
    />
  )
}
