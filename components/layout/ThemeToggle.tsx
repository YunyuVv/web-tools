'use client'

/**
 * ThemeToggle 的 Client-only 包装
 * next-themes 读取 localStorage，不应参与 SSR，用 dynamic ssr:false 跳过服务端渲染
 */

import dynamic from 'next/dynamic'

export const ThemeToggle = dynamic(
  () => import('./ThemeToggleInner').then(m => ({ default: m.ThemeToggleInner })),
  { ssr: false }
)
