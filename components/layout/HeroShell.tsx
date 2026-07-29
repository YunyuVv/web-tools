'use client'

/**
 * 首页 Hero 外壳
 * - 外层 section: fixed inset-0 全屏铺满（背景层不受约束）
 * - background: 放在 section 层级，覆盖整个视口（DotField 等）
 * - 内层内容容器: 动态 left 偏移，让文字/搜索框在「侧栏右侧剩余区域」内居中
 * 侧栏本身是 fixed 浮动，自然盖在 Hero 背景上方。
 */

import type { ReactNode } from 'react'
import { useSidebar } from './SidebarContext'

/** 侧栏展开/收起的实际像素宽度（与 Sidebar.tsx 对齐） */
const SIDEBAR_WIDTH_EXPANDED = 268
const SIDEBAR_WIDTH_COLLAPSED = 72

interface Props {
  /** 背景层节点（DotField 等），渲染在全屏 section 层级 */
  background?: ReactNode
  /** 内容层节点（标题/搜索框等），渲染在动态偏移的居中容器内 */
  children: ReactNode
}

export function HeroShell({ background, children }: Props) {
  const { isCollapsed } = useSidebar()
  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED

  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 bg-background overflow-auto">
      {/* 背景层：全屏覆盖 */}
      {background}

      {/* 内容层：动态偏移，剩余区域内居中 */}
      <div
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center"
        style={{
          left: `${sidebarWidth / 2}px`,
          transition: 'left 240ms cubic-bezier(0.2, 0.9, 0.24, 1)',
        }}
      >
        {children}
      </div>
    </section>
  )
}
