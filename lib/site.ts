/**
 * 站点级全局常量与 JSON-LD 工厂
 * JSON-LD 需要绝对 URL，因此必须有一个站点规范域名。
 * 部署域名见 memory：生产自定义域 tools.ideaflow.top（Cloudflare Pages）。
 */

/** 站点规范域名（不含末尾斜杠）。改域名时只动这一处。 */
export const SITE_URL = 'https://tools.ideaflow.top'

/** 站点/品牌名，用于结构化数据 */
export const SITE_NAME = 'DevToolBox'

/**
 * 工具页绝对 URL（带 trailingSlash，与站点配置一致）
 * 无前缀语言（en）走 /tools/{slug}/，带前缀语言走 /{locale}/tools/{slug}/
 */
export function toolPageUrl(locale: string, slug: string): string {
  const base = locale && locale !== 'en' ? `${SITE_URL}/${locale}` : SITE_URL
  return `${base}/tools/${slug}/`
}

/**
 * 生成工具页的 JSON-LD（SoftwareApplication 类型）
 * 让搜索引擎在结果中展示更丰富的信息（名称、描述、应用类别、语言、URL）。
 * 返回可序列化对象，由调用方用 <script type="application/ld+json"> 注入。
 */
export function buildToolJsonLd(params: {
  locale: string
  slug: string
  title: string
  description: string
}) {
  const { locale, slug, title, description } = params
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description,
    url: toolPageUrl(locale, slug),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    inLanguage: locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
