/**
 * 支持的语言列表及相关配置
 */

export const LOCALES = ['en', 'zh-CN', 'zh-TW'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
/** 有 URL 前缀的语言（英文默认无前缀）*/
export const PREFIXED_LOCALES = ['zh-CN', 'zh-TW'] as const
export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

/** 从翻译 JSON 中获取嵌套 key 的值，支持 'tools.json-formatter.title' 格式 */
export function t(messages: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let current: unknown = messages
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : key
}

/** 服务端：根据 locale 加载对应翻译文件 */
export async function getMessages(locale: Locale): Promise<Record<string, unknown>> {
  try {
    const messages = await import(`./${locale}.json`)
    return messages.default
  } catch {
    const fallback = await import('./en.json')
    return fallback.default
  }
}
