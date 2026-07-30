/**
 * 构建后把 sitemap 里的 URL 推送给 IndexNow（Bing/Yandex/Naver/Seznam 统一入口）
 *
 * 原理：
 *   1) 读 out/sitemap.xml，提取全部 <loc> URL
 *   2) 从 public/ 找到 IndexNow key 验证文件（文件名 = {key}.txt，内容即 key）
 *   3) POST https://api.indexnow.org/indexnow 通知搜索引擎优先抓取
 *
 * 安全闸门：仅在「生产部署」时真正发送，避免本地/预览构建频繁 ping。
 *   触发条件：环境变量 CF_PAGES==='true'（Cloudflare Pages 构建自动注入）
 *             或显式 SUBMIT_INDEXNOW==='true'（其它平台手动开启）。
 *   key 也可经环境变量 INDEXNOW_KEY 覆盖（优先级高于 public/ 文件）。
 *
 * 用法：挂在 package.json build 之后
 *   "build": "next build && node scripts/generate-sitemap.mjs && node scripts/submit-indexnow.mjs"
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'out')
const PUBLIC_DIR = join(ROOT, 'public')

const SITE_URL =
  process.env.SITE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://tools.ideaflow.top')

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** 从 public/ 找 IndexNow key 验证文件（文件名 = 32 位十六进制，内容即 key） */
function resolveKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim()
  const KEY_RE = /^[a-f0-9]{32}$/i
  for (const name of readdirSync(PUBLIC_DIR)) {
    if (!name.endsWith('.txt')) continue
    const base = name.slice(0, -4)
    if (KEY_RE.test(base)) {
      return readFileSync(join(PUBLIC_DIR, name), 'utf8').trim()
    }
  }
  return null
}

/** 从 sitemap.xml 提取全部 <loc> URL */
function extractUrls(sitemapXml) {
  const urls = []
  const re = /<loc>([^<]+)<\/loc>/g
  let m
  while ((m = re.exec(sitemapXml))) urls.push(m[1].trim())
  return urls
}

/** 是否在生产部署环境（决定是否真正发送通知） */
function shouldSubmit() {
  return process.env.CF_PAGES === 'true' || process.env.SUBMIT_INDEXNOW === 'true'
}

async function main() {
  // 安全闸门：本地 / 预览构建不 ping IndexNow
  if (!shouldSubmit()) {
    console.log(
      '[indexnow] 跳过：未在生产部署环境（CF_PAGES / SUBMIT_INDEXNOW 未置位），本地构建不发送通知。'
    )
    return
  }

  if (!existsSync(OUT_DIR)) {
    console.error('[indexnow] out/ 不存在，请先运行 next build')
    process.exit(1)
  }

  const key = resolveKey()
  if (!key) {
    console.error(
      '[indexnow] 未找到 IndexNow key：请在 public/ 放 {key}.txt，或设置 INDEXNOW_KEY 环境变量。'
    )
    process.exit(1)
  }

  const sitemapXml = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8')
  const urlList = extractUrls(sitemapXml)
  if (urlList.length === 0) {
    console.error('[indexnow] sitemap.xml 中未解析到任何 <loc> URL。')
    process.exit(1)
  }

  const host = new URL(SITE_URL).host
  const keyLocation = `https://${host}/${key}.txt`

  const payload = { host, key, keyLocation, urlList }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      console.log(
        `[indexnow] 提交成功：${urlList.length} 个 URL 已通知（host=${host}，keyLocation=${keyLocation}）`
      )
    } else {
      // 2xx 之外（400/429/503 等）记录但不阻断构建
      const text = await res.text()
      console.warn(
        `[indexnow] 响应异常 HTTP ${res.status}：${text || '(空)'}（不阻断构建）`
      )
    }
  } catch (err) {
    console.warn(`[indexnow] 请求失败：${err.message}（不阻断构建）`)
  }
}

main()
