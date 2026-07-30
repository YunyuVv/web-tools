/**
 * 生成 sitemap.xml + robots.txt（纯静态，postbuild 运行）
 *
 * 为什么不用 next-sitemap：本项目 output:'export' + App Router，路由含
 * 「无前缀默认语言(en)」与「带前缀(zh-CN/zh-TW)」两套，next-sitemap 对
 * App Router 静态导出 + 自定义路由组的处理脆弱。这里直接扫描 out/ 已生成的
 * 静态 HTML，覆盖 build 真实产出的每一页，最稳妥、零外部依赖。
 *
 * 用法：在 package.json 的 build 后执行
 *   "build": "next build && node scripts/generate-sitemap.mjs"
 */

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const OUT_DIR = join(__dirname, '..', 'out')

// 站点规范域名：按构建环境自动判定（静态导出无运行时，构建时定死）。
//   dev（NODE_ENV=development）→ localhost；生产构建/CF 部署 → 线上域名。
// 仍可用环境变量 SITE_URL 显式覆盖（方便将来换域名）。
const DEV_SITE_URL = 'http://localhost:3000'
const PROD_SITE_URL = 'https://tools.ideaflow.top'
const SITE_URL =
  process.env.SITE_URL ||
  (process.env.NODE_ENV === 'development' ? DEV_SITE_URL : PROD_SITE_URL)

/** 递归收集 out/ 下所有 index.html 的相对路径（不含前导斜杠） */
function collectIndexHtml(dir, base = '') {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name === '404.html' || name === '404') continue
    const abs = join(dir, name)
    const rel = base ? `${base}/${name}` : name
    const st = statSync(abs)
    if (st.isDirectory()) {
      out.push(...collectIndexHtml(abs, rel))
    } else if (name === 'index.html') {
      out.push(rel)
    }
  }
  return out
}

/** index.html 相对路径 → sitemap <url> 条目 */
function toUrlEntry(relHtml) {
  // relHtml 形如 "tools/json-formatter/index.html" 或 "zh-CN/tools/x/index.html" 或 "index.html"
  const pathOnly = relHtml.replace(/index\.html$/, '').replace(/\\/g, '/')
  // 根 index.html 的 pathOnly 为 '' → 站点根 '/'
  // 其余目录页（trailingSlash 已在 next.config 开启）以 '/' 结尾
  const loc = pathOnly === '' ? '/' : `${pathOnly}/`
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${loc === '/' ? '1.0' : '0.8'}</priority>
  </url>`
}

function main() {
  if (!existsSync(OUT_DIR)) {
    console.error('[sitemap] out/ 不存在，请先运行 next build')
    process.exit(1)
  }

  const htmlFiles = collectIndexHtml(OUT_DIR)
  const entries = htmlFiles
    .map(toUrlEntry)
    .sort((a, b) => a.localeCompare(b))

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

  writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf8')
  writeFileSync(join(OUT_DIR, 'robots.txt'), robots, 'utf8')

  console.log(
    `[sitemap] 生成完成：${entries.length} 个 URL → out/sitemap.xml, out/robots.txt (SITE_URL=${SITE_URL})`
  )
}

main()
