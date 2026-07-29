'use client'

/**
 * 这个组件的作用：作为客户端 i18n Context Provider，将服务端加载的翻译对象注入 React 树，
 * 供所有子客户端组件（如 Sidebar、工具组件）通过 useI18n() 读取翻译字符串。
 */

import { createContext, useContext } from 'react'

/** 翻译对象类型（任意嵌套 JSON 结构） */
type Messages = Record<string, unknown>

const I18nContext = createContext<Messages>({})

interface Props {
  messages: Messages
  children: React.ReactNode
}

/**
 * 将服务端加载的翻译 messages 注入 React 树。
 * 需要包裹在 layout 服务端组件中使用。
 */
export function I18nProvider({ messages, children }: Props) {
  return (
    <I18nContext.Provider value={messages}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * 在客户端组件中读取翻译对象，支持点号路径（如 'tools.json-formatter.title'）。
 * 路径不存在时返回 fallback（默认返回 key 本身）。
 */
export function useI18n() {
  const messages = useContext(I18nContext)

  /** 按点号路径取值，取不到时返回 fallback */
  function t(key: string, fallback?: string): string {
    const parts = key.split('.')
    let current: unknown = messages
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return fallback ?? key
      current = (current as Record<string, unknown>)[part]
    }
    return typeof current === 'string' ? current : (fallback ?? key)
  }

  return { t, messages }
}
