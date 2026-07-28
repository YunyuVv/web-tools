/**
 * 英文首页（URL: /）
 * 使用共享 ToolsHomePage 组件，无语言前缀
 */

import { getMessages } from '@/lib/i18n'
import { ToolsHomePage } from '@/components/home/ToolsHomePage'

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
