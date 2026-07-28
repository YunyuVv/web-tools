'use client'

/**
 * 语言切换组件
 * 用户手动选择语言后写入 localStorage，下次访问直接使用，不再走自动检测
 */

import { useRouter, usePathname } from 'next/navigation'
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, PREFIXED_LOCALES, type Locale } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 只匹配有前缀的语言路径（/zh-CN/... 或 /zh-TW/...）
const LOCALE_RE = new RegExp(`^/(${PREFIXED_LOCALES.join('|')})(\/|$)`)

interface Props {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (locale: Locale) => {
    localStorage.setItem('NEXT_LOCALE', locale)
    const newPath = pathname.replace(LOCALE_RE, '/') || '/'
    router.push(locale === DEFAULT_LOCALE ? newPath : `/${locale}${newPath}`)
  }

  return (
    <Select value={currentLocale} onValueChange={v => switchLocale(v as Locale)}>
      <SelectTrigger className="w-36 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map(locale => (
          <SelectItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
