'use client'

/**
 * 首页 Hero 外壳
 * 用 fixed 定位让 Hero 完全脱离 layout 层级（main 外边距 / SidebarContentArea 左内边距 / 外层背景），
 * 占满整个视口；侧栏本身是 fixed 浮动，自然盖在 Hero 上方。
 */

import type { ReactNode } from 'react'

export function HeroShell({ children }: { children: ReactNode }) {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 bg-background overflow-auto">
      {children}
    </section>
  )
}
