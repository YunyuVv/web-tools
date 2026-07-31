// 把 jSquash 四个编解码器的 wasm 拷贝到 public/wasm/（自托管，零 CDN 依赖）。
// 注意：只拷「单线程 / 单文件」版，避免多线程 wasm 触发跨源隔离要求。
import { existsSync, mkdirSync, copyFileSync, rmSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const NODE_MODULES = path.join(root, 'node_modules')
const OUT_DIR = path.join(root, 'public/wasm')

// 每个条目：从 node_modules 的某个文件拷到 public/wasm/<name>
// avif 用 avif_enc.wasm（单线程 factory 引用），不带 _mt；
// oxipng 用 pkg/ 下的单线程版（与 pkg-parallel 同名，但单线程才不需要跨源隔离）。
const WASM_MAP = [
  { pkg: '@jsquash/jpeg/codec/enc', file: 'mozjpeg_enc.wasm' },
  { pkg: '@jsquash/webp/codec/enc', file: 'webp_enc.wasm' },
  { pkg: '@jsquash/avif/codec/enc', file: 'avif_enc.wasm' },
  { pkg: '@jsquash/oxipng/codec/pkg', file: 'squoosh_oxipng_bg.wasm' },
]

function main() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const copied = []
  for (const item of WASM_MAP) {
    const from = path.join(NODE_MODULES, item.pkg, item.file)
    if (!existsSync(from)) {
      throw new Error(`[copy-wasm] 未找到 wasm: ${from}（请先 npm install @jsquash 系列包）`)
    }
    const to = path.join(OUT_DIR, item.file)
    copyFileSync(from, to)
    const sizeKB = (statSync(to).size / 1024).toFixed(1)
    copied.push(`${item.file} (${sizeKB} KB)`)
  }

  console.log(`[copy-wasm] ✓ 已拷贝 ${copied.length} 个 wasm 到 public/wasm/:`)
  copied.forEach((c) => console.log(`  - ${c}`))
}

main()
