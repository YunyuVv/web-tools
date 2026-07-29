/**
 * [locale] 路由 layout
 * 使用浮动侧边栏替换顶部 Header，移植自参考项目布局风格。
 * 所有前缀语言版本页面共用此布局。
 */

import { notFound } from 'next/navigation'
import { PREFIXED_LOCALES, getMessages, type Locale } from '@/lib/i18n'
import { I18nProvider } from '@/components/layout/I18nProvider'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarContentArea } from '@/components/layout/SidebarContentArea'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return PREFIXED_LOCALES.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!PREFIXED_LOCALES.includes(locale as typeof PREFIXED_LOCALES[number])) notFound()

  const messages = await getMessages(locale as Locale)

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
