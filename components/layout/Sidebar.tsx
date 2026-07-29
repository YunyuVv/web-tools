'use client'

/**
 * 这个组件的作用：渲染 macOS 风格的浮动侧边栏，包含工具导航菜单、主题切换和展开/收起动画。
 * 移植自参考项目 ideaflow-web-tool/app/components/Tools/Sidebar.vue。
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { ChevronRight, ChevronLeft, Menu, Sun, Moon, Monitor } from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { useI18n } from './I18nProvider'
import { CategoryIcon } from '@/components/home/CategoryIcon'
import { CATEGORY_CONFIG, TOOLS, getAllToolsByCategory, type ToolCategory } from '@/lib/tools-registry'
import { PREFIXED_LOCALES, type Locale } from '@/lib/i18n'

/**
 * 这个组件的作用：品牌 Logo 内联 SVG（Notion 风格 tools 图标）。
 * 透明背景，描边与文字使用 currentColor（由外层 text-primary 控制，随明暗主题取品牌青绿）。
 */
function DevToolBoxLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 文档轮廓（currentColor）+ tools 文字（currentColor），无白底 */}
      <path fill="currentColor" d="M12.32 1.437c1.17-.1 1.47-.032 2.205.501l3.039 2.136c.5.367.668.467.668.867v11.715c0 .734-.267 1.168-1.202 1.234l-11.055.667c-.702.034-1.036-.066-1.404-.533L2.333 15.12c-.4-.534-.567-.934-.567-1.401V3.306c0-.6.267-1.101 1.035-1.168zM16.561 5.308l-10.854.634c-.4.034-.534.235-.534.668v9.945c0 .535.267.735.868.702l10.388-.601c.6-.033.668-.401.668-.835V5.942c0-.433-.167-.667-.536-.634zM12.722 2.372l-9.153.668c-.333.033-.4.2-.267.333l1.303 1.035c.534.433.735.4 1.737.333l9.452-.567c.2 0 .034-.2-.033-.233l-1.57-1.136c-.301-.233-.702-.5-1.47-.433z" />
      <text x="11.1" y="12.1" fontSize="3.2" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" textAnchor="middle" fill="currentColor" transform="rotate(-3 11.1 12.1)">tools</text>
    </svg>
  )
}

/**
 * 这个函数的作用：根据当前 URL 路径推断语言前缀，用于拼接工具页 URL。
 */
function getBasePath(pathname: string): string {
  if (pathname.startsWith('/zh-CN')) return '/zh-CN'
  if (pathname.startsWith('/zh-TW')) return '/zh-TW'
  return ''
}

/**
 * 这个函数的作用：根据当前路径和 basePath 推断激活的工具分类 key。
 */
function getActiveCategoryFromPath(pathname: string, basePath: string): ToolCategory | null {
  const toolsPath = `${basePath}/tools/`
  if (!pathname.startsWith(toolsPath)) return null
  const slug = pathname.slice(toolsPath.length).replace(/\/$/, '')
  const tool = TOOLS.find(t => t.slug === slug)
  return tool?.category ?? null
}

// ─── 子组件：单个工具条目 ────────────────────────────────────────────

interface NavItemProps {
  title: string
  href?: string
  isActive: boolean
  soonLabel: string
}

/**
 * 这个组件的作用：渲染侧边栏中单个工具的导航条目，区分已上线（可点击）和开发中（不可点击）两种状态。
 */
function NavItem({ title, href, isActive, soonLabel }: NavItemProps) {
  if (!href) {
    return (
      <div className="flex h-7 items-center gap-2 rounded-lg px-2.5 text-[13px] text-muted-foreground/40 cursor-default select-none">
        <span className="truncate">{title}</span>
        <span className="ml-auto text-[10px] font-medium tracking-wide opacity-60">{soonLabel}</span>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={[
        'flex h-7 items-center gap-2 rounded-lg px-2.5 text-[13px] transition-colors duration-150',
        isActive
          ? 'nav-active-item'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      ].join(' ')}
    >
      <span className="truncate">{title}</span>
    </Link>
  )
}

// ─── 子组件：分类分组 ───────────────────────────────────────────────

interface NavGroupProps {
  category: ToolCategory
  defaultExpanded?: boolean
  activeToolSlug?: string
  basePath: string
  t: (key: string, fallback?: string) => string
  isActiveCategory?: boolean
}

/**
 * 这个组件的作用：渲染侧边栏中一个工具分类的可折叠导航组，包含分类图标、标签和子工具列表。
 */
function NavGroup({ category, defaultExpanded = false, activeToolSlug, basePath, t, isActiveCategory = false }: NavGroupProps) {
  const config = CATEGORY_CONFIG[category]
  const allByCategory = getAllToolsByCategory()
  const tools = allByCategory.get(category) ?? []
  const [expanded, setExpanded] = useState(defaultExpanded)

  const categoryLabel = t(`categories.${category}`, config.label)
  const soonLabel = t('sidebar.soon', 'SOON')

  return (
    <div className="select-none">
      {/* 分类标题行 */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className={[
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors cursor-pointer',
          isActiveCategory
            ? 'nav-active-item'
            : 'font-medium text-foreground hover:bg-muted/40',
        ].join(' ')}
      >
        <CategoryIcon
          name={config.icon}
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActiveCategory ? 'text-primary' : config.textClass}`}
        />
        <span className={isActiveCategory ? '' : 'text-foreground'}>{categoryLabel}</span>
        <ChevronRight
          className={`ml-auto h-3 w-3 text-muted-foreground/60 transition-transform duration-200 ${expanded ? 'rotate-90' : 'rotate-0'}`}
        />
      </button>

      {/* 工具列表 */}
      {expanded && (
        <div className="mt-1 ml-3 pl-3 border-l border-border/70 space-y-1">
          {tools.map(tool => {
            const href = tool.enabled ? `${basePath}/tools/${tool.slug}/` : undefined
            const toolTitle = t(`tools.${tool.slug}.title`, tool.slug)
            return (
              <NavItem
                key={tool.slug}
                title={toolTitle}
                href={href}
                isActive={tool.slug === activeToolSlug}
                soonLabel={soonLabel}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── 子组件：主题切换 ───────────────────────────────────────────────

/**
 * 这个组件的作用：在侧边栏底部渲染亮色/暗色/跟随系统三态主题切换按钮组。
 */
function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const options = [
    { key: 'light', icon: Sun,     label: 'Light'  },
    { key: 'system', icon: Monitor, label: 'System' },
    { key: 'dark',  icon: Moon,    label: 'Dark'   },
  ]

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          title={label}
          onClick={() => setTheme(key)}
          className={[
            'flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 cursor-pointer',
            theme === key
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          aria-label={label}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  )
}

// ─── 子组件：语言切换 ───────────────────────────────────────────────

const LOCALE_RE = new RegExp(`^/(${PREFIXED_LOCALES.join('|')})(\/|$)`)

const LANG_OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'en',    label: 'EN' },
  { locale: 'zh-CN', label: '简' },
  { locale: 'zh-TW', label: '繁' },
]

/**
 * 这个组件的作用：在侧边栏底部渲染紧凑语言切换按钮组，点击后跳转到对应语言路径。
 */
function LangSwitch() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  /** 从当前 pathname 推断激活语言 */
  const currentLocale: Locale = pathname.startsWith('/zh-TW')
    ? 'zh-TW'
    : pathname.startsWith('/zh-CN')
      ? 'zh-CN'
      : 'en'

  const switchLocale = (locale: Locale) => {
    if (locale === currentLocale) return
    localStorage.setItem('NEXT_LOCALE', locale)
    const cleanPath = pathname.replace(LOCALE_RE, '/') || '/'
    router.push(locale === 'en' ? cleanPath : `/${locale}${cleanPath}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
      {LANG_OPTIONS.map(({ locale, label }) => (
        <button
          key={locale}
          title={locale}
          onClick={() => switchLocale(locale)}
          className={[
            'flex h-6 min-w-[1.5rem] px-1 items-center justify-center rounded-md text-[11px] font-medium tracking-wide transition-all duration-150 cursor-pointer',
            currentLocale === locale
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          aria-label={locale}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────

/**
 * 这个组件的作用：浮动侧边栏主体，包含品牌标题、工具导航菜单和主题切换，支持展开/收起过渡动画和移动端遮罩。
 */
export function Sidebar() {
  const { toggle, ready } = useSidebar()
  const { t } = useI18n()
  const pathname = usePathname()
  const basePath = getBasePath(pathname)
  const activeCategory = getActiveCategoryFromPath(pathname, basePath)
  const activeSlug = (() => {
    const toolsPath = `${basePath}/tools/`
    if (pathname.startsWith(toolsPath)) {
      return pathname.slice(toolsPath.length).replace(/\/$/, '')
    }
    return ''
  })()

  const categories = Object.keys(CATEGORY_CONFIG) as ToolCategory[]

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className={[
          'sidebar-overlay',
          'fixed inset-0 z-40 bg-black/8 backdrop-blur-[1px] lg:hidden',
          'transition-opacity duration-200 ease-out',
        ].join(' ')}
        onClick={toggle}
        aria-hidden
      />

      {/* 侧边栏主体 */}
      <aside
        className={[
          'sidebar-shell',
          'fixed left-3 top-3 bottom-3 z-50',
          'w-[calc(82%-0.75rem)] max-w-[304px] lg:w-[268px]',
          'rounded-[26px]',
          'bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/62',
          // 显示状态完全由 <html data-sidebar> 属性 + CSS 驱动（见 globals.css），避免首帧类名不一致闪动
          // 首帧（恢复持久化状态那一刻）禁用过渡，避免“展开→收起”闪动
          ready ? '' : 'sidebar-shell--no-anim',
        ].join(' ')}
        aria-label={t('sidebar.nav_label', '工具导航')}
      >
        {/* 顶部标题区 */}
        <div className="sidebar-divider sidebar-divider--bottom flex h-14 items-center justify-between px-4">
          <Link href={`${basePath}/`} className="inline-flex items-center gap-2.5 text-foreground">
            <DevToolBoxLogo className="w-[22px] h-[22px] shrink-0 text-primary" />
            <span className="text-sm font-semibold tracking-wide text-foreground/90">
              DevToolBox
            </span>
          </Link>
          <button
            onClick={toggle}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label={t('sidebar.collapse', '收起侧边栏')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* 导航内容区 */}
        <nav
          className="sidebar-scroll-area h-[calc(100%-6.5rem)] overflow-y-auto px-3 pb-3 pt-2 space-y-1"
          aria-label={t('sidebar.tool_list', '工具列表')}
        >
          {categories.map(category => (
            <NavGroup
              key={category}
              category={category}
              defaultExpanded={category === activeCategory}
              isActiveCategory={category === activeCategory}
              activeToolSlug={activeSlug}
              basePath={basePath}
              t={t}
            />
          ))}
        </nav>

        {/* 底部工具区 */}
        <div className="sidebar-divider sidebar-divider--top flex h-12 items-center justify-between px-3">
          <LangSwitch />
          <ThemeSwitch />
        </div>
      </aside>

      {/* 收起状态下的展开按钮 */}
      <button
        onClick={toggle}
        className={[
          'fixed left-3 top-3 z-50',
          'grid h-9 w-9 place-items-center rounded-xl',
          'border border-border/80 bg-background/92 text-foreground',
          'shadow-[0_6px_14px_oklch(0.56_0.21_262_/_0.08)]',
          'backdrop-blur-md transition-all duration-200 ease-out',
          'hover:bg-muted cursor-pointer',
          'sidebar-expand-btn',
        ].join(' ')}
        aria-label={t('sidebar.expand', '展开侧边栏')}
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>
    </>
  )
}
