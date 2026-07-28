'use client'

/**
 * 主题提供者组件
 * 封装 next-themes，注入到根 layout 中，支持 light / dark / system 三种模式
 * attribute="class" 对应 globals.css 中的 .dark 选择器
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface Props {
  children: React.ReactNode
}

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
