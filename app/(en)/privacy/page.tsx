/**
 * 英文隐私政策页（URL: /privacy，无语言前缀，默认语言）
 * i18n 由父布局 (en) 的 I18nProvider 注入，本页直接渲染 PrivacyContent。
 */

import { PrivacyContent } from '@/components/privacy/PrivacyContent'

export default function EnPrivacyPage() {
  return <PrivacyContent />
}
