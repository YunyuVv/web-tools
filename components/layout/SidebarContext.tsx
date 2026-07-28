'use client'

/**
 * 这个文件的作用：提供全局侧边栏展开/收起状态的 React 上下文，并将状态持久化到 localStorage。
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
  collapse: () => {},
  expand: () => {},
})

const STORAGE_KEY = 'devtoolbox:sidebar-collapsed'

/**
 * 这个组件的作用：为子树提供侧边栏状态，并在挂载时从 localStorage 恢复上次状态。
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  /** 从 localStorage 恢复持久化状态 */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') setIsCollapsed(true)
    } catch {}
  }, [])

  /** 切换侧边栏并写入 localStorage */
  const toggle = () => {
    setIsCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }

  const collapse = () => {
    setIsCollapsed(true)
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
  }

  const expand = () => {
    setIsCollapsed(false)
    try { localStorage.setItem(STORAGE_KEY, 'false') } catch {}
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, collapse, expand }}>
      {children}
    </SidebarContext.Provider>
  )
}

/** 在客户端组件中读取侧边栏状态 */
export const useSidebar = () => useContext(SidebarContext)
