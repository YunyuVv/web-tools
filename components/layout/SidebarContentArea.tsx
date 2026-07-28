'use client'

/**
 * 这个组件的作用：作为页面主内容区域容器，响应侧边栏展开/收起状态自动调整左侧内边距，实现平滑的侧边栏联动过渡。
 */

import { type ReactNode } from 'react'
import { useSidebar } from './SidebarContext'

interface Props {
  children: ReactNode
}

/**
 * 这个组件的作用：通过读取 SidebarContext 状态动态设置 padding-left，配合侧边栏展开/收起过渡动画同步调整内容区位置。
 */
export function SidebarContentArea({ children }: Props) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={[
        'relative z-0 min-h-screen',
        'transition-[padding-left] duration-[240ms] ease-[cubic-bezier(0.2,0.9,0.24,1)]',
        isCollapsed ? 'lg:pl-0' : 'lg:pl-[292px]',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
