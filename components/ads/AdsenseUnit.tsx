'use client'

/**
 * Google AdSense 广告位组件（手动广告单元）。
 *
 * - 仅当 NEXT_PUBLIC_ADSENSE_CLIENT_ID 与 slot（props 或 NEXT_PUBLIC_ADSENSE_SLOT）都存在时才渲染，
 *   本地 / 预览构建（未配置）自动返回 null，避免误展示真实广告或报错。
 * - adsbygoogle.js 由根布局以 afterInteractive 注入；本组件在挂载后调用
 *   (window.adsbygoogle || []).push({}) 触发该广告位渲染，与官方手动广告单元用法一致。
 * - 静态导出（output:'export'）下无法用 framer-motion；此处纯客户端、零依赖。
 */

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function AdsenseUnit({
  slot,
  format = 'auto',
  className,
}: {
  /** 广告单元 ID（AdSense 后台「广告单元」给出）。缺省取 NEXT_PUBLIC_ADSENSE_SLOT */
  slot?: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}) {
  const ref = useRef<HTMLModElement>(null)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const resolvedSlot = slot ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT

  useEffect(() => {
    if (!clientId || !resolvedSlot) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* 脚本未就绪时静默忽略 */
    }
  }, [clientId, resolvedSlot])

  if (!clientId || !resolvedSlot) return null

  return (
    <div className={`adsense-unit my-5 flex justify-center ${className ?? ''}`}>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
