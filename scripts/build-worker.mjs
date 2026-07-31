// 用 esbuild 把 Worker 源码打包成单文件自包含 JS（内联所有 jSquash 编解码逻辑）。
// 产物：public/workers/image-compress.worker.js（纯静态资源，不经 Next/Turbopack 打包）。
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

await build({
  entryPoints: [path.join(root, 'scripts/worker-src/image-compress.worker.mjs')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  outfile: path.join(root, 'public/workers/image-compress.worker.js'),
  sourcemap: false,
  logLevel: 'info',
})

console.log('[build-worker] ✓ worker bundled -> public/workers/image-compress.worker.js')
