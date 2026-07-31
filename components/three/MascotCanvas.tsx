'use client'

/**
 * Client 包装层：承载 next/dynamic(ssr:false) 懒加载、WebGL 检测、reduced-motion 检测、
 * 无 WebGL 静态降级、以及 i18n aria-label。
 *
 * 关键点：ssr:false 的 dynamic 只能在 Client Component 里调用，故本文件必须 'use client'，
 * 再由 demo 页（或未来首页）的组件引入它。
 */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useI18n } from '@/components/layout/I18nProvider'

const Mascot = dynamic(() => import('./Mascot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Loading 3D…
    </div>
  ),
})

export function MascotCanvas() {
  const { t } = useI18n()
  const [webglOk, setWebglOk] = useState<boolean | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      setWebglOk(!!(c.getContext('webgl') || c.getContext('experimental-webgl')))
    } catch {
      setWebglOk(false)
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 无 WebGL：静态降级（不渲染 Canvas，避免报错）
  if (webglOk === false) {
    return (
      <div
        role="img"
        aria-label={t('home.mascot.aria')}
        className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground"
      >
        {t('home.mascot.no_webgl')}
      </div>
    )
  }

  return (
    <div role="img" aria-label={t('home.mascot.aria')} className="h-full w-full">
      <Mascot reducedMotion={reducedMotion} />
    </div>
  )
}
