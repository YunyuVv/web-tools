'use client'

/**
 * 顶部导航栏
 * 包含：品牌 Logo（渐变方块 + 名称）、主导航、主题切换、语言切换
 * Glass 模糊背景，底部渐变分割线
 */

import Link from 'next/link'
import { type Locale } from '@/lib/i18n'
import { useI18n } from '@/components/layout/I18nProvider'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  locale: Locale
}

export function Header({ locale }: Props) {
  const { t } = useI18n()
  const basePath = locale === 'en' ? '' : `/${locale}`

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      {/* 底部渐变分割线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={`${basePath}/`} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-primary/40 transition-shadow">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 4.5L5.5 8 2 11.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 11H12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-base tracking-tight">
            DevToolBox
          </span>
        </Link>

        {/* 主导航 */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            href={`${basePath}/`}
            className="px-3 py-1.5 rounded-md hover:bg-accent hover:text-foreground transition-colors"
          >
            {t('nav.tools')}
          </Link>
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  )
}
