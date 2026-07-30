/**
 * 站点级全局常量与 JSON-LD 工厂
 * JSON-LD 需要绝对 URL，因此必须有一个站点规范域名。
 *
 * 静态导出站点（output:'export'）没有运行时，每个页面在【构建时】生成，
 * 无法按访客实际域名动态决定。因此按构建环境区分：
 *   - 开发环境（next dev，NODE_ENV=development）→ http://localhost:3000
 *   - 生产构建（next build / Cloudflare 部署，NODE_ENV=production）→ 线上域名
 * 也可用环境变量 SITE_URL 显式覆盖（仍保留，方便将来换域名）。
 */

const DEV_SITE_URL = 'http://localhost:3000'
const PROD_SITE_URL = 'https://tools.ideaflow.top'

/** 站点规范域名（不含末尾斜杠）。 */
export const SITE_URL =
  process.env.SITE_URL ||
  (process.env.NODE_ENV === 'development' ? DEV_SITE_URL : PROD_SITE_URL)

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
 * 为多语言页面生成 hreflang 互标 + canonical，避免中/英/繁三版被搜索引擎
 * 判定为重复内容而只展示其中一种语言。
 *
 * path 为「不含语言前缀」的路径片段：
 *   - ''            → 首页（en 在 /，zh-CN 在 /zh-CN/，zh-TW 在 /zh-TW/）
 *   - 'tools/slug'  → 工具页（en 在 /tools/slug/，其余加前缀）
 *
 * 静态导出站点无运行时，hreflang/canonical 必须写死绝对 URL，因此这里直接用 SITE_URL。
 * 默认语言 en 同时作为 canonical 与 x-default。
 */
export function localizedAlternates(path: string): {
  canonical: string
  languages: Record<string, string>
} {
  const clean = path.replace(/^\/+|\/+$/g, '')
  const en = clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`
  const zhCN = clean ? `${SITE_URL}/zh-CN/${clean}/` : `${SITE_URL}/zh-CN/`
  const zhTW = clean ? `${SITE_URL}/zh-TW/${clean}/` : `${SITE_URL}/zh-TW/`
  return {
    canonical: en,
    languages: {
      en: en,
      'zh-CN': zhCN,
      'zh-TW': zhTW,
      'x-default': en,
    },
  }
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
