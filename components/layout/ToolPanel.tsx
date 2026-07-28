/**
 * 这个组件的作用：为工具页提供统一的轻量内容面板容器，移植自参考项目 ToolPanel.vue，具有圆角、毛玻璃背景和阴影效果。
 */

import { type ReactNode } from 'react'

interface Props {
  /** 面板标题 */
  title?: string
  /** 面板说明 */
  description?: string
  /** 紧凑模式，减小内边距 */
  compact?: boolean
  /** 右侧操作区内容 */
  actions?: ReactNode
  /** 面板主体内容 */
  children: ReactNode
  /** 额外 CSS 类名 */
  className?: string
}

/**
 * 这个组件的作用：渲染带圆角和毛玻璃效果的工具面板容器，支持标题、说明和操作区。
 */
export function ToolPanel({ title, description, compact, actions, children, className = '' }: Props) {
  return (
    <section
      className={[
        'tool-panel',
        compact ? 'tool-panel--compact' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {(title || description) && (
        <header className="flex items-start justify-between gap-3.5 mb-[18px]">
          <div>
            {title && (
              <h2 className="m-0 text-[16px] font-bold leading-[1.2] text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-[13px] leading-[1.65] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className="flex flex-col gap-4 text-[13px] leading-[1.7]">
        {children}
      </div>
    </section>
  )
}
