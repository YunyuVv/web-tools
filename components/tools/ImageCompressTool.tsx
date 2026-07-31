'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/components/layout/I18nProvider'
import { Upload, Download, Image as ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCw, RotateCcw, RefreshCw } from 'lucide-react'
import { SpotlightCard } from '@/components/reactbits/SpotlightCard'
import { DotField } from '@/components/reactbits/DotField'

// Worker 是 public/workers/image-compress.worker.js（纯静态 JS，不经打包器），
// 这里本地定义与它对应的消息类型。
type CompressFormat = 'jpeg' | 'webp' | 'png' | 'avif'

interface CompressRequest {
  type: 'compress'
  id: number
  imageData: ImageData
  width: number
  height: number
  format: CompressFormat
  options: {
    quality?: number
    lossless?: boolean
    level?: number
  }
}

type WorkerOutbound =
  | { type: 'progress'; id: number; stage: string }
  | { type: 'done'; id: number; buffer: ArrayBuffer; mime: string; format: CompressFormat }
  | { type: 'error'; id: number; message: string }

const FORMATS: { key: CompressFormat; label: string; ext: string }[] = [
  { key: 'jpeg', label: 'JPEG', ext: 'jpg' },
  { key: 'webp', label: 'WebP', ext: 'webp' },
  { key: 'png', label: 'PNG', ext: 'png' },
  { key: 'avif', label: 'AVIF', ext: 'avif' },
]

const SPOTLIGHT = 'rgba(244,63,94,0.18)'

// 画质对比视图（Squoosh 式全屏编辑器核心）：
// - 底层放压缩图，顶层放原图并用 clip-path inset 仅显示左侧 split%，实现同位置像素级对比
// - 中间竖线手柄可横向拖动对比（role=slider，键盘 Arrow/Home/End 微调）
// - 在图片任意处按住拖动 = 平移（pan）整张图（原图与压缩图一起平移，保持对齐）
// - 容器铺满父级（h-full w-full），由外层全屏布局决定实际尺寸
function CompareSlider({
  original,
  compressed,
  originalLabel,
  compressedLabel,
  hint,
}: {
  original: string
  compressed: string
  originalLabel: string
  compressedLabel: string
  hint: string
}) {
  const [split, setSplit] = useState(50)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<'pan' | 'compare' | null>(null)
  const startRef = useRef({ x: 0, y: 0, split: 50, ox: 0, oy: 0 })

  const ZOOM_MIN = 0.2
  const ZOOM_MAX = 8
  const zoomBy = (factor: number) => {
    setScale((s) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s * factor)))
  }
  const resetView = () => {
    setScale(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }
  // 鼠标滚轮缩放：滚动向上放大、向下缩小（触控板双指捏合通常也以 wheel+ctrl 触发，一并处理）
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    zoomBy(factor)
  }

  const onContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    modeRef.current = 'pan'
    startRef.current = { x: e.clientX, y: e.clientY, split, ox: offset.x, oy: offset.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  // 手柄的 pointerdown 阻止冒泡，避免触发容器的 pan，从而进入「对比」模式
  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    modeRef.current = 'compare'
    startRef.current = { x: e.clientX, y: 0, split, ox: 0, oy: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modeRef.current === 'pan') {
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      setOffset({ x: startRef.current.ox + dx, y: startRef.current.oy + dy })
    } else if (modeRef.current === 'compare') {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplit(Math.max(0, Math.min(100, pct)))
    }
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    modeRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setSplit((s) => Math.max(0, s - 2))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setSplit((s) => Math.min(100, s + 2))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setSplit(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setSplit(100)
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onContainerPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
      className="group relative h-full w-full cursor-grab touch-none select-none overflow-hidden bg-muted/30 active:cursor-grabbing"
    >
      {/* 平移 / 缩放 / 旋转层：原图与压缩图一起变换，保持像素对齐 */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`, transformOrigin: 'center center' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={compressed} alt={compressedLabel} draggable={false} className="block h-full w-full object-contain" />
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={original}
            alt={originalLabel}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          />
        </div>
      </div>

      {/* 中缝对比滑块（Squoosh 风格：渐变发光线 + 立体手柄 + 拖拽反馈） */}
      <div
        role="slider"
        aria-label={hint}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onHandlePointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="group/slider absolute inset-y-0 z-20 flex w-10 -translate-x-1/2 cursor-ew-resize items-center justify-center"
        style={{ left: `${split}%` }}
      >
        {/* 渐变发光中缝线 */}
        <div className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/0 via-white to-white/0 shadow-[0_0_12px_rgba(255,255,255,0.5),0_0_24px_rgba(255,255,255,0.2)]" />

        {/* 立体手柄：白底 + 渐变边框 + 双箭头 SVG + hover 放大 + 拖拽缩放 */}
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] ring-1 ring-black/8 transition-transform duration-150 group-hover/slider:scale-110 group-active/slider:scale-95">
          {/* 内圈微渐变装饰 */}
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-gray-50 to-white" />
          {/* 左右箭头 SVG */}
          <svg className="relative h-4 w-4 text-gray-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3L2 7.5L6 12M10 3l4 4.5L10 12" />
          </svg>
        </div>
      </div>

      {/* 角标 */}
      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
        {originalLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
        {compressedLabel}
      </span>

      {/* 底部中央操作栏：缩放 / 旋转 / 复位（pointerdown 阻止冒泡，避免触发容器平移） */}
      <div
        className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-lg backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.25)}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs font-medium tabular-nums text-foreground/90">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-border/60" />
        <button
          type="button"
          onClick={() => setRotation((r) => r - 90)}
          aria-label="Rotate left"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setRotation((r) => r + 90)}
          aria-label="Rotate right"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-border/60" />
        <button
          type="button"
          onClick={resetView}
          aria-label="Reset view"
          disabled={scale === 1 && rotation === 0 && offset.x === 0 && offset.y === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function ImageCompressTool() {
  const { t } = useI18n()

  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  const [format, setFormat] = useState<CompressFormat>('webp')
  const [quality, setQuality] = useState(75) // 0-100，png 时映射到 level 1-6
  const [lossless, setLossless] = useState(false)

  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState<string>('')
  const [result, setResult] = useState<{ url: string; size: number; mime: string; ext: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 压缩结果缓存：键 = 格式 + 质量(PNG 映射为 level) + 无损开关。
  // 切换格式/质量后再切回，命中缓存直接复用，不再重压 Worker（AVIF 尤其重）。
  // 缓存的 objectURL 只在「换图 / LRU 淘汰 / 卸载」时回收，绝不在格式切换时回收。
  const resultCacheRef = useRef<Map<string, { url: string; size: number; mime: string; ext: string }>>(new Map())
  // 同一张图的解码结果（ImageData）也缓存，避免来回切格式反复解码。
  const imageDataRef = useRef<{ file: File; data: ImageData } | null>(null)
  // 结果缓存上限：避免不同「格式+质量」组合无限累积 objectURL（每个约一张图大小）
  const CACHE_CAP = 12

  // 懒初始化 Worker（仅首次压缩时创建，不用不加载）。
  // Worker 文件放 public/ 下做纯静态资源，不经 Turbopack 打包；
  // 用 origin 拼接 URL 避免构建期被静态解析打包。
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        const workerUrl = new URL('/workers/image-compress.worker.js', window.location.origin).href
        console.log('[image-compress] Creating module worker:', workerUrl)
        const w = new Worker(workerUrl, { type: 'module' })

        // 捕获 Worker 级别的致命错误（如模块加载失败、esm.sh 不可达等）
        w.onerror = (ev: Event | string) => {
          const msg = typeof ev === 'string' ? ev : (ev as ErrorEvent).message || 'Worker fatal error'
          console.error('[image-compress] Worker error:', msg)
          setError(`Worker: ${msg}`)
          setBusy(false)
        }
        w.onmessageerror = () => {
          console.error('[image-compress] Worker message deserialization error')
          setError('Worker: failed to transfer compressed data')
          setBusy(false)
        }
        workerRef.current = w
      } catch (err) {
        console.error('[image-compress] Failed to create Worker:', err)
        throw new Error(`Cannot create Web Worker: ${err instanceof Error ? err.message : String(err)}. Your browser may not support module Workers.`)
      }
    }
    return workerRef.current
  }, [])

  // ⚠️ 关键修复：Worker 只在「组件卸载」时销毁。
  // 之前把 workerRef.current?.terminate() 放在依赖 [objectUrl, result] 的清理里，
  // 每次压缩完成 setResult 都会触发清理 → 单例 Worker 被立刻杀掉。
  // 下次切换格式时 getWorker() 返回的是「已 terminate 但非 null」的 Worker，
  // postMessage 静默失效 → 永久卡在「Compressing…」。
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      // 卸载时回收所有缓存的结果 objectURL
      resultCacheRef.current.forEach((r) => URL.revokeObjectURL(r.url))
      resultCacheRef.current.clear()
    }
  }, [])

  // 预览图（原始文件）objectURL 回收：仅随 objectUrl 变化回收，不碰结果缓存。
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const loadFile = useCallback(
    (f: File | null) => {
      if (!f) return
      if (!f.type.startsWith('image/')) {
        setError(t('tools.image-compress.error_not_image', 'Please choose an image file'))
        return
      }
      // 换图：旧图的全部压缩结果缓存与解码结果失效，回收其 objectURL 释放内存
      resultCacheRef.current.forEach((r) => URL.revokeObjectURL(r.url))
      resultCacheRef.current.clear()
      imageDataRef.current = null
      setError(null)
      setResult(null)
      setFile(f)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      const url = URL.createObjectURL(f)
      setObjectUrl(url)
      const img = new Image()
      img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight })
      img.src = url
    },
    [objectUrl, t],
  )

  // 粘贴图片
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === 'file' && i.type.startsWith('image/'))
      if (item) {
        e.preventDefault()
        loadFile(item.getAsFile())
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [loadFile])

  const compress = useCallback(async () => {
    if (!file) return
    const myId = ++reqIdRef.current
    console.log('[image-compress] compress() called', { fileSize: file.size, format, quality, myId })

    // 先查结果缓存：命中则直接复用，不重压 Worker（AVIF 尤其重）
    const cacheKey =
      format +
      ':' +
      (format === 'png' ? Math.max(1, Math.min(4, Math.round((quality / 100) * 4))) : quality) +
      ':' +
      (lossless ? 1 : 0)
    const cached = resultCacheRef.current.get(cacheKey)
    if (cached && myId === reqIdRef.current) {
      console.log('[image-compress] cache HIT', cacheKey)
      setError(null)
      setResult(cached)
      setBusy(false)
      return
    }

    setError(null)
    // ⚠️ 不要 setResult(null)：保留上一次对比视图（旧压缩图）作为重新压缩期间的底图，
    // 避免切换格式/质量时画面「啪」地跳回原图并叠全屏遮罩，体验割裂。
    // 新结果就绪后原地 setResult 替换即可，CompareSlider 的拖拽/滑块位置也会保留。
    setBusy(true)
    setStage(t('tools.image-compress.stage_decoding', 'Preparing'))

    try {
      // 主线程解码 + 取 ImageData（避免 Worker 内 canvas 兼容问题）。
      // 同一张图的解码结果缓存，避免来回切格式反复解码。
      let imageData: ImageData
      if (imageDataRef.current && imageDataRef.current.file === file) {
        imageData = imageDataRef.current.data
        console.log('[image-compress] Step 1: reuse cached ImageData')
      } else {
        console.log('[image-compress] Step 1: createImageBitmap')
        const bitmap = await createImageBitmap(file)
        console.log('[image-compress] Step 2: canvas getImageData', bitmap.width, 'x', bitmap.height)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.drawImage(bitmap, 0, 0)
        imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
        bitmap.close()
        imageDataRef.current = { file, data: imageData }
      }
      console.log('[image-compress] Step 3: ImageData ready, buffer=', imageData.data.buffer.byteLength)

      const worker = getWorker()
      console.log('[image-compress] Step 4: posting to worker, id=', myId)

      const options =
        format === 'png'
          ? { level: Math.max(1, Math.min(4, Math.round((quality / 100) * 4))) }
          : format === 'webp'
            ? { quality, lossless }
            : { quality }

      const req: CompressRequest = {
        type: 'compress',
        id: myId,
        imageData,
        width: imageData.width,
        height: imageData.height,
        format,
        options,
      }

      const done = await new Promise<{ buffer: ArrayBuffer; mime: string }>((resolve, reject) => {
        // 超时保护：Worker 无响应时不会永远卡死
        const timer = setTimeout(() => {
          worker.removeEventListener('message', handler)
          reject(new Error('Compress timeout (120s) — the codec may be loading or the image is too large'))
        }, 120_000)

        const handler = (e: MessageEvent<WorkerOutbound>) => {
          const msg = e.data
          if (msg.id !== myId) return
          if (msg.type === 'progress') setStage(msg.stage)
          else if (msg.type === 'done') {
            clearTimeout(timer)
            worker.removeEventListener('message', handler)
            resolve({ buffer: msg.buffer, mime: msg.mime })
          } else if (msg.type === 'error') {
            clearTimeout(timer)
            worker.removeEventListener('message', handler)
            reject(new Error(msg.message))
          }
        }
        worker.addEventListener('message', handler)
        // 注意：不要传 transfer list [imageData.data.buffer]。
        // 转移会让主线程的 buffer 被 detach，而与 req.imageData 的结构化克隆冲突，
        // 导致 Worker 收到 neuter/未定义 buffer 而静默死锁（120s 超时）。
        // 直接结构化克隆即可，~2.5MB 的拷贝开销可忽略。
        worker.postMessage(req)
        console.log('[image-compress] Step 4b: postMessage sent, waiting for worker response...')
      })

      console.log('[image-compress] Step 5: Worker responded! buffer=', done.buffer.byteLength)
      const blob = new Blob([done.buffer], { type: done.mime })
      const ext = FORMATS.find((f) => f.key === format)!.ext
      const url = URL.createObjectURL(blob)
      const result = { url, size: blob.size, mime: done.mime, ext }
      // 写入结果缓存（LRU：超过上限时回收最旧条目的 objectURL，避免内存泄漏）
      if (resultCacheRef.current.size >= CACHE_CAP) {
        const iter = resultCacheRef.current.keys().next()
        if (!iter.done) {
          const oldestKey = iter.value
          const oldest = resultCacheRef.current.get(oldestKey)
          if (oldest) URL.revokeObjectURL(oldest.url)
          resultCacheRef.current.delete(oldestKey)
        }
      }
      resultCacheRef.current.set(cacheKey, result)
      // 仅当本次请求仍是最新时才更新结果（避免过期响应覆盖）
      if (myId === reqIdRef.current) {
        setResult(result)
      }
    } catch (err) {
      console.error('[image-compress] ERROR:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      console.log('[image-compress] Done (finally)')
      // 仅当本次请求仍是最新时才结束 busy（避免被过期请求复位）
      if (myId === reqIdRef.current) setBusy(false)
    }
  }, [file, format, quality, lossless, getWorker, t])

  // 用 ref 持有最新的 compress，避免其身份变化（依赖 t/getWorker 每次渲染可能变）
  // 触发本 effect 无限重跑。
  const compressRef = useRef(compress)
  useEffect(() => {
    compressRef.current = compress
  }, [compress])

  // 自动压缩：文件选择或格式/质量变化时自动触发（250ms 防抖）。
  // 依赖只放「输入参数」，不放 busy / compress，避免压缩完成后翻转状态再次触发本 effect 形成死循环。
  useEffect(() => {
    if (!file) return
    const timer = setTimeout(() => compressRef.current?.(), 250)
    return () => clearTimeout(timer)
  }, [file, format, quality, lossless])

  const savingPercent = useMemo(() => {
    if (!file || !result) return 0
    return Math.max(0, Math.round((1 - result.size / file.size) * 100))
  }, [file, result])

  const qualityLabel =
    format === 'png'
      ? t('tools.image-compress.level', 'Compression level')
      : t('tools.image-compress.quality', 'Quality')

  return (
    <div className="relative">
      {/* 全屏点阵背景：上传页与全屏编辑器共用「整体全屏」观感 */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <DotField dotSpacing={30} color="rgba(244,63,94,0.45)" glow="rgba(244,63,94,0.16)" />
      </div>

      {/* 未选图：应用外壳圆角卡片（含顶栏 + 拖拽区）。backdrop-blur 仅挂在此外壳上，
          全屏编辑器不在此外壳内——避免 backdrop-filter 为 fixed 后代创建「包含块」，
          否则 fixed inset-0 会相对外壳而非视口、外壳因内容塌缩、舞台被压成空白。 */}
      {!file ? (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-xl shadow-black/5 backdrop-blur">
          {/* 顶栏：应用标识 */}
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-semibold tracking-tight">{t('tools.image-compress.title', 'Image Compressor')}</h1>
                <p className="text-xs text-muted-foreground">{t('tools.image-compress.badge', 'Powered by WebAssembly · 100% local')}</p>
              </div>
            </div>
          </header>

          {/* 拖拽上传区：
             点击/拖拽事件挂在外层 div 上，而不是内部 absolute 覆盖按钮——
             因为 .spotlight-card > * 会把直接子元素强制 position:relative，
             覆盖掉按钮的 absolute inset-0，导致点不到。外层 div 不受该规则影响。 */}
          <div
            role="button"
            tabIndex={0}
            aria-label={t('tools.image-compress.choose', 'Choose an image')}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragging(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              loadFile(e.dataTransfer.files?.[0] ?? null)
            }}
            className={`m-4 block cursor-pointer rounded-3xl transition-colors sm:m-5 ${
              dragging ? 'ring-2 ring-rose-400/70' : ''
            }`}
          >
            <SpotlightCard
              className={`flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-card/60 p-14 text-center backdrop-blur transition-colors hover:border-rose-400/60 ${
                dragging ? 'border-rose-400/70' : 'border-border/80'
              }`}
              spotlightColor={SPOTLIGHT}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-500 dark:text-rose-300">
                <Upload className="h-9 w-9" />
              </div>
              <div>
                <p className="text-lg font-semibold">{t('tools.image-compress.drop_title', 'Drop an image here')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('tools.image-compress.drop_desc', 'or click to browse · paste with Ctrl/Cmd+V')}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {FORMATS.map((f) => (
                  <span key={f.key} className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {f.label}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      ) : (
        /* 全屏对比编辑器：整个视口即画布（直接挂在 relative 根，无 backdrop/transform 祖先，
           fixed 才真正相对视口）；背景点阵全屏；图片可拖拽平移，中间滑块对比；
           左右浮层分别显示原图/压缩信息。*/
        <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-background">
          {/* 全屏点阵背景 */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
            <DotField dotSpacing={30} color="rgba(244,63,94,0.4)" glow="rgba(244,63,94,0.14)" />
          </div>

          {/* 顶栏（半透明浮层）：标识 + 换图 / 格式 / 质量 / 下载 */}
          <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-background/70 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-semibold tracking-tight">{t('tools.image-compress.title', 'Image Compressor')}</h1>
                <p className="text-xs text-muted-foreground">{t('tools.image-compress.badge', 'Powered by WebAssembly · 100% local')}</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium transition-colors hover:border-rose-400/50"
              >
                <Upload className="h-4 w-4" />
                {t('tools.image-compress.change', 'Change')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* 格式选择 */}
              <div className="flex gap-1.5">
                {FORMATS.map((f) => {
                  const active = format === f.key
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFormat(f.key)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                          : 'border border-border/60 text-muted-foreground hover:border-rose-400/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>

              {/* 质量 / 等级 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{qualityLabel}</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={busy}
                  className="h-2 w-28 cursor-pointer appearance-none rounded-full bg-gradient-to-r from-rose-500/30 to-orange-500/30 accent-rose-500"
                  aria-label={qualityLabel}
                />
                <span className="w-7 text-right text-xs font-semibold tabular-nums text-foreground/90">
                  {format === 'png' ? Math.max(1, Math.min(4, Math.round((quality / 100) * 4))) : quality}
                </span>
              </div>

              {format === 'webp' && (
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={lossless}
                    onChange={(e) => setLossless(e.target.checked)}
                    disabled={busy}
                    className="h-4 w-4 accent-rose-500"
                  />
                  {t('tools.image-compress.lossless', 'Lossless')}
                </label>
              )}

              {result && !busy && (
                <a
                  href={result.url}
                  download={`compressed.${result.ext}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-transform hover:scale-[1.03]"
                >
                  <Download className="h-4 w-4" />
                  {t('tools.image-compress.download', 'Download')}
                </a>
              )}
            </div>
          </div>

          {/* 舞台（铺满顶栏之下）+ 左右信息浮层 */}
          <div className="relative z-10 flex-1">
            {/* 始终渲染图片区域：未压缩时显示原图预览，压缩完成后显示对比滑块 */}
            <div className="relative h-full w-full overflow-hidden bg-muted/30">
              {result ? (
                <CompareSlider
                  original={objectUrl ?? ''}
                  compressed={result.url}
                  originalLabel={t('tools.image-compress.original', 'Original')}
                  compressedLabel={t('tools.image-compress.compressed', 'Compressed')}
                  hint={t('tools.image-compress.compare_hint', 'Drag to compare')}
                />
              ) : (
                /* 原图预览：上传后立即显示，不等压缩完成 */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={objectUrl ?? ''}
                  alt={t('tools.image-compress.original', 'Original')}
                  draggable={false}
                  className="block h-full w-full object-contain"
                />
              )}

              {/* 压缩中指示：轻量顶部胶囊，不遮挡底图（保留上一次的对比视图），
                  避免重压时画面撕裂；pointer-events-none 不挡拖拽平移 */}
              {busy && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4">
                  <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg ring-1 ring-border/50 backdrop-blur">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    <span>{t('tools.image-compress.compressing', 'Compressing…')}</span>
                    {stage && <span className="text-muted-foreground/70">· {stage}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* 左侧浮层：原图信息 */}
            <div className="pointer-events-none absolute left-4 top-1/2 z-20 w-44 -translate-y-1/2 rounded-2xl border border-border/50 bg-background/70 p-4 backdrop-blur">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('tools.image-compress.original', 'Original')}</p>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('tools.image-compress.dimensions', 'Dimensions')}</dt>
                  <dd className="font-medium tabular-nums">{dims ? `${dims.w}×${dims.h}` : '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('tools.image-compress.original_size', 'Original size')}</dt>
                  <dd className="font-medium tabular-nums">{file ? formatBytes(file.size) : '—'}</dd>
                </div>
              </dl>
            </div>

            {/* 右侧浮层：压缩信息 */}
            <div className="pointer-events-none absolute right-4 top-1/2 z-20 w-44 -translate-y-1/2 rounded-2xl border border-border/50 bg-background/70 p-4 backdrop-blur">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('tools.image-compress.compressed', 'Compressed')}</p>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('tools.image-compress.format_label', 'Format')}</dt>
                  <dd className="font-medium">{FORMATS.find((f) => f.key === format)?.label}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('tools.image-compress.output_size', 'Output size')}</dt>
                  <dd className="font-medium tabular-nums">{result ? formatBytes(result.size) : '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('tools.image-compress.saved_label', 'Saved')}</dt>
                  <dd className={`font-semibold tabular-nums ${savingPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {result ? `${savingPercent}%` : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 底部提示（上移，避免与 CompareSlider 底部操作栏重叠） */}
            <p className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {t('tools.image-compress.fullscreen_hint', 'Scroll to zoom · drag to pan · drag the middle slider to compare')}
            </p>

            {error && (
              <p className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 rounded-md bg-red-500/90 px-3 py-1 text-xs text-white">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => loadFile(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
