'use client'

/**
 * 这个组件的作用：作为页面主内容区域容器，左侧内边距由 <html data-sidebar> 属性 + CSS 驱动
 * （见 globals.css），与侧边栏展开/收起过渡动画同步。首帧即正确，无闪动。
 */

import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SidebarContentArea({ children }: Props) {
  return (
    <div
      className={[
        'sidebar-content-area',
        'relative z-0 min-h-screen',
        'transition-[padding-left] duration-[240ms] ease-[cubic-bezier(0.2,0.9,0.24,1)]',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
