'use client'

/**
 * 首页 Hero 外壳
 * - 外层 section: fixed inset-0 全屏铺满（背景层不受约束）
 * - background: 放在 section 层级，覆盖整个视口（DotField 等）
 * - 内容层「水平偏移」完全由 globals.css 的 [data-sidebar] 属性驱动（而非 React 内联样式）：
 *   · 侧栏展开 → 居中于「侧栏右侧剩余区域」（避免靠侧栏太近、右侧大片空白）
 *   · 侧栏收起 → 接近全局视口居中
 *   React 不再根据 isCollapsed 输出不同内联样式，故服务端预渲染 HTML 与客户端首帧完全一致，
 *   彻底消除 hydration mismatch（这是上次控制台报错的根因）；偏移值切换仍由 CSS transition 平滑过渡。
 * - 侧栏本身是 fixed 浮动面板，自然盖在 Hero 背景上方。
 */

import type { ReactNode } from 'react'

interface Props {
  /** 背景层节点（DotField 等），渲染在全屏 section 层级 */
  background?: ReactNode
  /** 内容层节点（标题/搜索框等），渲染在视口内的容器内 */
  children: ReactNode
}

export function HeroShell({ background, children }: Props) {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 bg-background overflow-auto">
      {/* 背景层：全屏覆盖 */}
      {background}

      {/* 内容层：水平偏移由 .hero-content + [data-sidebar] 的 CSS 规则决定 */}
      <div className="hero-content relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {children}
      </div>
    </section>
  )
}
