/**
 * 工具注册表
 * 所有工具的元数据集中在此定义，包括分类、路由、SEO 信息、图标、颜色
 */

export type ToolCategory =
  | 'json'
  | 'encoding'
  | 'crypto'
  | 'datetime'
  | 'css'
  | 'color'
  | 'text'
  | 'network'

export interface Tool {
  slug: string
  category: ToolCategory
  /** i18n key，对应 lib/i18n/*.json 中的 tools.{slug} */
  i18nKey: string
  /** 是否上线，false 则显示为"敬请期待" */
  enabled: boolean
  /** Lucide 图标名称 */
  icon: string
}

/**
 * 分类配置：图标（Lucide）、颜色（Tailwind 前缀）、标签、渐变
 * iconGradient 用于卡片图标背景实色渐变
 */
export const CATEGORY_CONFIG: Record<
  ToolCategory,
  { label: string; icon: string; colorVar: string; bgClass: string; textClass: string; iconGradient: string }
> = {
  json:     { label: 'JSON',        icon: 'FileCode2',          colorVar: '#6366f1', bgClass: 'bg-indigo-500/10',  textClass: 'text-indigo-500',  iconGradient: 'linear-gradient(135deg,#6366f1,#7c3aed)' },
  encoding: { label: 'Encoding',    icon: 'Binary',             colorVar: '#8b5cf6', bgClass: 'bg-violet-500/10',  textClass: 'text-violet-500',  iconGradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  crypto:   { label: 'Crypto',      icon: 'Lock',               colorVar: '#f59e0b', bgClass: 'bg-amber-500/10',   textClass: 'text-amber-500',   iconGradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  datetime: { label: 'Date & Time', icon: 'Clock',              colorVar: '#06b6d4', bgClass: 'bg-cyan-500/10',    textClass: 'text-cyan-500',    iconGradient: 'linear-gradient(135deg,#06b6d4,#0284c7)' },
  css:      { label: 'CSS',         icon: 'Paintbrush',         colorVar: '#ec4899', bgClass: 'bg-pink-500/10',    textClass: 'text-pink-500',    iconGradient: 'linear-gradient(135deg,#ec4899,#db2777)' },
  color:    { label: 'Color',       icon: 'Palette',            colorVar: '#f97316', bgClass: 'bg-orange-500/10',  textClass: 'text-orange-500',  iconGradient: 'linear-gradient(135deg,#f97316,#ea580c)' },
  text:     { label: 'Text',        icon: 'Type',               colorVar: '#22c55e', bgClass: 'bg-green-500/10',   textClass: 'text-green-500',   iconGradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  network:  { label: 'Network',     icon: 'Globe',              colorVar: '#0ea5e9', bgClass: 'bg-sky-500/10',     textClass: 'text-sky-500',     iconGradient: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
}

/** 向后兼容的纯标签映射 */
export const CATEGORY_LABELS: Record<ToolCategory, string> = Object.fromEntries(
  Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.label])
) as Record<ToolCategory, string>

export const TOOLS: Tool[] = [
  { slug: 'json-formatter',     category: 'json',     i18nKey: 'json-formatter',     enabled: true,  icon: 'FileCode2'    },
  { slug: 'json-to-csv',        category: 'json',     i18nKey: 'json-to-csv',        enabled: false, icon: 'Table2'       },
  { slug: 'base64',             category: 'encoding', i18nKey: 'base64',             enabled: true,  icon: 'FileText'     },
  { slug: 'url-encode',         category: 'encoding', i18nKey: 'url-encode',         enabled: true,  icon: 'Link'         },
  { slug: 'html-entities',      category: 'encoding', i18nKey: 'html-entities',      enabled: false, icon: 'Code2'        },
  { slug: 'hash-generator',     category: 'crypto',   i18nKey: 'hash-generator',     enabled: true,  icon: 'Hash'         },
  { slug: 'uuid-generator',     category: 'crypto',   i18nKey: 'uuid-generator',     enabled: true,  icon: 'Fingerprint'  },
  { slug: 'password-generator', category: 'crypto',   i18nKey: 'password-generator', enabled: false, icon: 'Lock'         },
  { slug: 'regex-tester',       category: 'text',     i18nKey: 'regex-tester',       enabled: false, icon: 'Search'       },
  { slug: 'timestamp',          category: 'datetime', i18nKey: 'timestamp',          enabled: true,  icon: 'Clock'        },
  { slug: 'cron-parser',        category: 'datetime', i18nKey: 'cron-parser',        enabled: false, icon: 'CalendarDays' },
  { slug: 'css-gradient',       category: 'css',      i18nKey: 'css-gradient',       enabled: false, icon: 'Paintbrush'   },
  { slug: 'box-shadow',         category: 'css',      i18nKey: 'box-shadow',         enabled: false, icon: 'Square'       },
  { slug: 'color-converter',    category: 'color',    i18nKey: 'color-converter',    enabled: false, icon: 'Pipette'      },
  { slug: 'contrast-checker',   category: 'color',    i18nKey: 'contrast-checker',   enabled: false, icon: 'SlidersHorizontal' },
  { slug: 'lorem-ipsum',        category: 'text',     i18nKey: 'lorem-ipsum',        enabled: false, icon: 'AlignLeft'    },
  { slug: 'word-counter',       category: 'text',     i18nKey: 'word-counter',       enabled: true,  icon: 'AlignJustify' },
  { slug: 'markdown-preview',   category: 'text',     i18nKey: 'markdown-preview',   enabled: false, icon: 'FileText'     },
  { slug: 'ip-lookup',          category: 'network',  i18nKey: 'ip-lookup',          enabled: false, icon: 'Globe'        },
  { slug: 'user-agent',         category: 'network',  i18nKey: 'user-agent',         enabled: false, icon: 'Monitor'      },
]

/** 获取所有已上线的工具（用于静态路由生成） */
export function getEnabledTools(): Tool[] {
  return TOOLS.filter(t => t.enabled)
}

/** 所有工具按分类分组（包含未上线，用于首页展示） */
export function getAllToolsByCategory(): Map<ToolCategory, Tool[]> {
  const map = new Map<ToolCategory, Tool[]>()
  for (const tool of TOOLS) {
    const list = map.get(tool.category) ?? []
    list.push(tool)
    map.set(tool.category, list)
  }
  return map
}

/** 已上线工具按分类分组 */
export function getToolsByCategory(): Map<ToolCategory, Tool[]> {
  const map = new Map<ToolCategory, Tool[]>()
  for (const tool of getEnabledTools()) {
    const list = map.get(tool.category) ?? []
    list.push(tool)
    map.set(tool.category, list)
  }
  return map
}
