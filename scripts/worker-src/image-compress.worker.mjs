// 自托管图片压缩 Worker（构建期由 scripts/build-worker.mjs 用 esbuild 打包成单文件）。
// 所有 jSquash 编解码逻辑在打包时内联进本文件，wasm 二进制从 /wasm/ 拉取。
// 运行时零第三方 CDN 依赖。

const WASM_BASE = '/wasm/'
const WASM_FILES = {
  jpeg: 'mozjpeg_enc.wasm',
  webp: 'webp_enc.wasm',
  avif: 'avif_enc.wasm',
  png: 'squoosh_oxipng_bg.wasm',
}

// 调试：把 Worker 内部未捕获错误暴露给主线程，便于定位卡死点
self.addEventListener('error', (e) =>
  self.postMessage({ type: 'error', id: -1, message: 'Worker error: ' + (e.message || e.error || 'unknown') }),
)
self.addEventListener('unhandledrejection', (e) =>
  self.postMessage({ type: 'error', id: -1, message: 'Unhandled rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)) }),
)

const moduleCache = {}

async function loadWasmModule(name) {
  if (moduleCache[name]) return moduleCache[name]
  const res = await fetch(WASM_BASE + WASM_FILES[name])
  if (!res.ok) throw new Error(`Failed to fetch ${WASM_FILES[name]} (HTTP ${res.status})`)
  const buf = await res.arrayBuffer()
  const mod = await WebAssembly.compile(buf)
  moduleCache[name] = mod
  return mod
}

const codecCache = {}

async function getModule(format) {
  if (codecCache[format]) return codecCache[format]

  if (format === 'jpeg') {
    const wm = await loadWasmModule('jpeg')
    // encode 是 default 导出，init 是命名导出
    const { default: encode, init } = await import('@jsquash/jpeg/encode')
    await init(wm) // wm 是 WebAssembly.Module → 直接实例化，不 fetch
    return (codecCache.jpeg = { encode })
  }

  if (format === 'webp') {
    const wm = await loadWasmModule('webp')
    const { default: encode, init } = await import('@jsquash/webp/encode')
    await init(wm)
    return (codecCache.webp = { encode })
  }

  if (format === 'avif') {
    const res = await fetch(WASM_BASE + WASM_FILES.avif)
    if (!res.ok) throw new Error(`Failed to fetch ${WASM_FILES.avif} (HTTP ${res.status})`)
    const buf = await res.arrayBuffer()
    // 直接 import 单线程 factory，绕开 encode.js 的 MT 自动选择（MT 需跨源隔离）
    const { default: avifEnc } = await import('@jsquash/avif/codec/enc/avif_enc.js')
    const mod = await avifEnc({ wasmBinary: buf })
    return (codecCache.avif = { mod })
  }

  // png (oxipng) —— 直接 import 单线程 pkg，避免 MT（COOP/COEP）
  const res = await fetch(WASM_BASE + WASM_FILES.png)
  if (!res.ok) throw new Error(`Failed to fetch ${WASM_FILES.png} (HTTP ${res.status})`)
  const buf = await res.arrayBuffer()
  const { default: init, optimise } = await import('@jsquash/oxipng/codec/pkg/squoosh_oxipng.js')
  await init(buf) // ST pkg 的 init 接受 ArrayBuffer
  return (codecCache.png = { optimise })
}

function mimeFor(format) {
  if (format === 'jpeg') return 'image/jpeg'
  if (format === 'webp') return 'image/webp'
  if (format === 'avif') return 'image/avif'
  if (format === 'png') return 'image/png'
  return 'application/octet-stream'
}

// avif 裸 factory 的 encode 需要完整 options（缺字段会报 "Missing field"）
const AVIF_DEFAULTS = {
  quality: 50,
  qualityAlpha: -1,
  denoiseLevel: 0,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 6,
  subsample: 1,
  chromaDeltaQ: false,
  sharpness: 0,
  tune: 0,
  enableSharpYUV: false,
  bitDepth: 8,
  lossless: false,
}

async function compress(req) {
  const { format, imageData, options } = req
  const opts = options || {}

  self.postMessage({ type: 'progress', id: req.id, stage: 'loading' })
  const codec = await getModule(format)

  self.postMessage({ type: 'progress', id: req.id, stage: 'encoding' })
  let out
  if (format === 'jpeg') {
    out = await codec.encode(imageData, { quality: opts.quality != null ? opts.quality : 75 })
  } else if (format === 'webp') {
    out = await codec.encode(imageData, {
      quality: opts.quality != null ? opts.quality : 75,
      lossless: Boolean(opts.lossless),
    })
  } else if (format === 'avif') {
    out = await codec.mod.encode(
      new Uint8Array(imageData.data.buffer),
      imageData.width,
      imageData.height,
      { ...AVIF_DEFAULTS, quality: opts.quality != null ? opts.quality : 50 },
    )
  } else {
    // oxipng 优化的是「PNG 字节」，不是原始像素。
    // 先用 OffscreenCanvas 把 ImageData 编码成 PNG，再交给 oxipng 无损优化。
    const canvas = new OffscreenCanvas(imageData.width, imageData.height)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0)
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    const pngBytes = await blob.arrayBuffer()
    // oxipng ST pkg: optimise(Uint8Array, level, interlace, optimizeAlpha)
    // 注意必须传 Uint8Array（wasm-bindgen 用 .length），不能传 ArrayBuffer
    out = await codec.optimise(new Uint8Array(pngBytes), opts.level != null ? opts.level : 2, false, false)
  }
  // jSquash 返回 ArrayBuffer 或带 .buffer 的视图
  return out && out.buffer ? out.buffer : out
}

self.onmessage = async (e) => {
  const req = e.data
  if (!req || req.type !== 'compress') return
  try {
    const buffer = await compress(req)
    self.postMessage(
      { type: 'done', id: req.id, buffer, mime: mimeFor(req.format), format: req.format },
      [buffer],
    )
  } catch (err) {
    self.postMessage({
      type: 'error',
      id: req.id,
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
