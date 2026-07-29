/**
 * 这个组件的作用：为工具页提供统一的内容布局骨架，移植自参考项目 ToolPageShell.vue。
 * 注意：不再渲染页头（眉批 / 标题 / 操作区），让工具功能直接呈现。
 */

import { type ReactNode } from 'react'

interface Props {
  /** 页面主体内容 */
  children: ReactNode
}

/**
 * 这个组件的作用：渲染工具页内容插槽。
 */
export function ToolPageShell({ children }: Props) {
  return (
    <div className="tool-page-shell mx-auto w-full max-w-[1400px]">
      {/* 内容区 */}
      <section className="flex flex-col gap-[18px] mt-5">
        {children}
      </section>
    </div>
  )
}
