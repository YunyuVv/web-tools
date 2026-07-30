'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/components/layout/I18nProvider'
import { Upload, Download, RotateCcw, ImagePlus, MousePointerClick } from 'lucide-react'

const STAGE = 360
const R = STAGE / 2 - 16
const CENTER = STAGE / 2
const PREVIEW = 200
const EXPORT = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 4

export function AvatarTool() {
  const { t } = useI18n()
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [pasteHint, setPasteHint] = useState(false)
  const [dragging, setDragging] = useState(false)

  const stageRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number }; rectW: number } | null>(null)
  const pasteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // keep latest values available to native (non-passive) wheel listener
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const posRef = useRef(pos)
  posRef.current = pos

  const baseScale = useMemo(
    () => (imgEl ? Math.max(STAGE / imgEl.naturalWidth, STAGE / imgEl.naturalHeight) : 1),
    [imgEl],
  )

  const clampPos = useCallback(
    (p: { x: number; y: number }, z: number) => {
      if (!imgEl) return { x: 0, y: 0 }
      const eff = baseScale * z
      const dw = imgEl.naturalWidth * eff
      const dh = imgEl.naturalHeight * eff
      const minX = R - dw / 2
      const maxX = dw / 2 - R
      const minY = R - dh / 2
      const maxY = dh / 2 - R
      return {
        x: Math.min(maxX, Math.max(minX, p.x)),
        y: Math.min(maxY, Math.max(minY, p.y)),
      }
    },
    [imgEl, baseScale],
  )

  // load the image element whenever the source data URL changes
  useEffect(() => {
    if (!imageSrc) {
      setImgEl(null)
      return
    }
    const img = new Image()
    img.onload = () => {
      setImgEl(img)
      setZoom(1)
      setPos({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [imageSrc])

  const drawStage = useCallback(() => {
    const cvs = stageRef.current
    if (!cvs || !imgEl) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, STAGE, STAGE)
    const eff = baseScale * zoom
    const dw = imgEl.naturalWidth * eff
    const dh = imgEl.naturalHeight * eff
    const dx = (STAGE - dw) / 2 + pos.x
    const dy = (STAGE - dh) / 2 + pos.y
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(imgEl, dx, dy, dw, dh)
  }, [imgEl, baseScale, zoom, pos])

  // draw the cropped circle into a target canvas (preview or export)
  const drawCircle = useCallback(
    (cvs: HTMLCanvasElement, out: number) => {
      const ctx = cvs.getContext('2d')
      if (!ctx || !imgEl) return
      ctx.clearRect(0, 0, out, out)
      ctx.save()
      ctx.beginPath()
      ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
      ctx.clip()
      const eff = baseScale * zoom
      const dw = imgEl.naturalWidth * eff
      const dh = imgEl.naturalHeight * eff
      const dx = (STAGE - dw) / 2 + pos.x
      const dy = (STAGE - dh) / 2 + pos.y
      const scaleOut = out / (2 * R)
      const outX = (dx - (CENTER - R)) * scaleOut
      const outY = (dy - (CENTER - R)) * scaleOut
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(imgEl, outX, outY, dw * scaleOut, dh * scaleOut)
      ctx.restore()
    },
    [imgEl, baseScale, zoom, pos],
  )

  useEffect(() => {
    drawStage()
    if (previewRef.current) drawCircle(previewRef.current, PREVIEW)
  }, [drawStage, drawCircle])

  // native non-passive wheel listener so we can preventDefault page scroll
  useEffect(() => {
    const cvs = stageRef.current
    if (!cvs) return
    const onWheel = (e: WheelEvent) => {
      if (!imgEl) return
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * factor))
      setZoom(nz)
      setPos(clampPos(posRef.current, nz))
    }
    cvs.addEventListener('wheel', onWheel, { passive: false })
    return () => cvs.removeEventListener('wheel', onWheel)
  }, [imgEl, clampPos])

  // paste image from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            setImageSrc(ev.target?.result as string)
            setPasteHint(true)
            if (pasteTimer.current) clearTimeout(pasteTimer.current)
            pasteTimer.current = setTimeout(() => setPasteHint(false), 5000)
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
      if (pasteTimer.current) clearTimeout(pasteTimer.current)
    }
  }, [])

  const handleFile = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const selectFile = () => fileInputRef.current?.click()

  const resetView = () => {
    setZoom(1)
    setPos({ x: 0, y: 0 })
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgEl) return
    const rect = e.currentTarget.getBoundingClientRect()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: pos, rectW: rect.width }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current
    if (!d) return
    const scale = STAGE / d.rectW
    const nx = d.startPos.x + (e.clientX - d.startX) * scale
    const ny = d.startPos.y + (e.clientY - d.startY) * scale
    setPos(clampPos({ x: nx, y: ny }, zoom))
  }
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const downloadAvatar = () => {
    if (!imgEl) return
    const c = document.createElement('canvas')
    c.width = EXPORT
    c.height = EXPORT
    drawCircle(c, EXPORT)
    c.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'avatar.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const circlePercent = ((2 * R) / STAGE) * 100

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* 裁剪面板 */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImagePlus className="h-4 w-4" />
          <span>{t('tools.avatar.panel_edit')}</span>
        </div>

        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {!imgEl ? (
            <button
              type="button"
              onClick={selectFile}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ImagePlus className="h-10 w-10" />
              <span className="text-sm font-medium">{t('tools.avatar.empty_title')}</span>
              <span className="px-8 text-center text-xs">{t('tools.avatar.empty_desc')}</span>
            </button>
          ) : (
            <>
              <canvas
                ref={stageRef}
                width={STAGE}
                height={STAGE}
                className={`absolute inset-0 h-full w-full select-none touch-none ${
                  dragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div
                  className="rounded-full ring-2 ring-white/70"
                  style={{
                    width: `${circlePercent}%`,
                    height: `${circlePercent}%`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={selectFile}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            {t('tools.avatar.upload')}
          </button>
          <button
            type="button"
            onClick={resetView}
            disabled={!imgEl}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {t('tools.avatar.reset')}
          </button>
          <div className="flex min-w-[160px] flex-1 items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('tools.avatar.zoom')}</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!imgEl}
              onChange={(e) => {
                const nz = Number(e.target.value)
                setZoom(nz)
                setPos((p) => clampPos(p, nz))
              }}
              className="h-1.5 flex-1 cursor-pointer accent-[var(--primary)]"
              aria-label={t('tools.avatar.zoom')}
            />
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t('tools.avatar.upload_hint')}</p>
        {pasteHint && (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            {t('tools.avatar.paste_success')}
          </p>
        )}
      </section>

      {/* 预览面板 */}
      <section className="flex flex-col rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MousePointerClick className="h-4 w-4" />
          <span>{t('tools.avatar.panel_preview')}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="relative">
            <canvas
              ref={previewRef}
              width={PREVIEW}
              height={PREVIEW}
              className="h-[180px] w-[180px] rounded-full bg-muted/40 shadow-xl ring-1 ring-border"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('tools.avatar.format_note')}</p>
        </div>

        <button
          type="button"
          onClick={downloadAvatar}
          disabled={!imgEl}
          title={imgEl ? t('tools.avatar.download_title') : t('tools.avatar.no_image')}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {t('tools.avatar.download')}
        </button>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
