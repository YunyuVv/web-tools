/**
 * 带语言前缀的隐私政策页（URL: /{locale}/privacy，locale ∈ zh-CN | zh-TW）
 * i18n 由父布局 [locale] 的 I18nProvider 注入，本页直接渲染 PrivacyContent。
 */

import { notFound } from 'next/navigation'
import { PREFIXED_LOCALES } from '@/lib/i18n'
import { PrivacyContent } from '@/components/privacy/PrivacyContent'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LocalePrivacyPage({ params }: Props) {
  const { locale } = await params
  if (!PREFIXED_LOCALES.includes(locale as typeof PREFIXED_LOCALES[number])) {
    notFound()
  }
  return <PrivacyContent />
}
