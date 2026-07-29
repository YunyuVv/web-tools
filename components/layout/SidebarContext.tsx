'use client'

/**
 * 这个文件的作用：提供全局侧边栏展开/收起状态的 React 上下文，并将状态持久化到 localStorage。
 *
 * 防闪动核心：侧栏的“显示状态”完全由 <html data-sidebar> 这个 DOM 属性 + CSS 决定，
 * 而非 React 类名（见 globals.css）。两路写入该属性：
 *   1) app/layout.tsx 的 beforeInteractive 脚本（导出构建里是绘制前执行的裸 <script>），
 *      让导出构建首帧即正确；
 *   2) 本组件的挂载副作用把 localStorage 真值镜像到 data-sidebar，覆盖 dev 下脚本被延迟到注水后
 *      才执行的情况，从而 dev / 导出构建两种时机都不会出现“展开→收起”错误态闪动。
 * 懒初始化直接读 localStorage（不可变源，注水时同步可用），dev 与导出构建行为一致；
 * 且 Sidebar 组件不依据 isCollapsed 输出不同 DOM，故不存在注水不一致。
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
  /** 首帧是否已渲染完；首帧为 false 时禁用过渡，避免进入页面时“展开→收起”闪动 */
  ready: boolean
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
  collapse: () => {},
  expand: () => {},
  ready: false,
})

const STORAGE_KEY = 'devtoolbox:sidebar-collapsed'

export function SidebarProvider({ children }: { children: ReactNode }) {
  /**
   * 懒初始化：客户端从 <html data-sidebar> 读取（脚本已在绘制前写入）。
   * 服务端返回 false；由于显示状态由 CSS 属性驱动、React 不再输出 expanded/collapsed 类名，
   * 客户端首帧与 SSR 输出的类名完全一致，无注水不一致。
   */
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    // 直接读 localStorage（不可变源，注水时同步可用），dev 与导出构建行为一致，
    // 不依赖绘制前脚本的写入时机
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  // 首帧前是否已渲染完；用于首帧禁用过渡，之后用户手动收起/展开才有平滑效果
  const [ready, setReady] = useState(false)

  // 注水完成后：把状态镜像到 <html data-sidebar>（驱动 CSS 显示），并开启过渡
  useEffect(() => {
    try {
      document.documentElement.dataset.sidebar = isCollapsed ? 'collapsed' : 'expanded'
    } catch {}
    setReady(true)
  }, [])

  /** 切换侧边栏并写入 localStorage + 同步 <html data-sidebar> */
  const toggle = () => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
        document.documentElement.dataset.sidebar = next ? 'collapsed' : 'expanded'
      } catch {}
      return next
    })
  }

  const collapse = () => {
    setIsCollapsed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
      document.documentElement.dataset.sidebar = 'collapsed'
    } catch {}
  }

  const expand = () => {
    setIsCollapsed(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'false')
      document.documentElement.dataset.sidebar = 'expanded'
    } catch {}
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, collapse, expand, ready }}>
      {children}
    </SidebarContext.Provider>
  )
}

/** 在客户端组件中读取侧边栏状态 */
export const useSidebar = () => useContext(SidebarContext)
