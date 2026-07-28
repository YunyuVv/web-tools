/**
 * 这个组件的作用：为工具页提供统一的标题区、说明区和操作区布局骨架，移植自参考项目 ToolPageShell.vue。
 */

import { type ReactNode } from 'react'

interface Props {
  /** 工具名称，用于页面标题 */
  title: string
  /** 工具说明，显示在标题下方 */
  description?: string
  /** 眉批文字，显示在标题上方 */
  eyebrow?: string
  /** 右侧操作区内容，如工具栏按钮组 */
  actions?: ReactNode
  /** 页面主体内容 */
  children: ReactNode
}

/**
 * 这个组件的作用：渲染工具页标题栏（标题 + 说明 + 操作按钮），并在下方提供内容插槽。
 */
export function ToolPageShell({ title, description, eyebrow, actions, children }: Props) {
  return (
    <div className="tool-page-shell mx-auto w-full max-w-[1400px]">
      {/* 标题区 */}
      <header className="flex items-start justify-between gap-4 px-1 py-2 pb-5 border-b border-border/60">
        <div className="max-w-[820px]">
          {eyebrow && (
            <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="m-0 text-[clamp(22px,3vw,30px)] font-bold leading-[1.12] text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-[760px] text-sm leading-[1.7] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center justify-end gap-2.5 flex-wrap">
            {actions}
          </div>
        )}
      </header>

      {/* 内容区 */}
      <section className="flex flex-col gap-[18px] mt-5">
        {children}
      </section>
    </div>
  )
}
