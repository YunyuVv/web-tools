'use client'

/**
 * 全局页脚（AdSense 合规要求提供隐私政策入口）。
 * 使用 useI18n 取文案，需置于 I18nProvider 内（两个布局均已包裹）。
 * locale 默认 'en'（对应 (en) 路由组，无 URL 前缀）；[locale] 布局传入实际语言以拼出正确隐私页路径。
 */

import Link from 'next/link'
import { useI18n } from './I18nProvider'

export function Footer({ locale = 'en' }: { locale?: string }) {
  const { t } = useI18n()
  const privacyHref = locale === 'en' ? '/privacy' : `/${locale}/privacy`
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 mt-6 px-3 py-4 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
        <span>{t('footer.tagline')}</span>
        <nav className="flex gap-4">
          <Link
            href={privacyHref}
            className="transition-colors hover:text-foreground"
          >
            {t('footer.privacy')}
          </Link>
        </nav>
        <span>
          © {year} DevToolBox. {t('footer.rights')}
        </span>
      </div>
    </footer>
  )
}
