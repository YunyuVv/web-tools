/**
 * 英文路由组布局
 * 使用浮动侧边栏替换顶部 Header，移植自参考项目布局风格。
 * 英文页面无 URL 前缀，通过 route group (en) 实现与 [locale] 路由共用根路径。
 */

import { getMessages } from '@/lib/i18n'
import { I18nProvider } from '@/components/layout/I18nProvider'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarContentArea } from '@/components/layout/SidebarContentArea'

interface Props {
  children: React.ReactNode
}

export default async function EnLayout({ children }: Props) {
  const messages = await getMessages('en')
  return (
    <I18nProvider messages={messages}>
      <SidebarProvider>
        <div className="min-h-screen bg-muted/20">
          <Sidebar />
          <SidebarContentArea>
            <main className="px-2 py-2 md:px-3 md:py-3 min-h-screen">
              {children}
            </main>
          </SidebarContentArea>
        </div>
      </SidebarProvider>
    </I18nProvider>
  )
}
