'use client'

/**
 * 分类图标组件
 * 将 CATEGORY_CONFIG 中的 Lucide 图标名映射为实际 SVG 组件
 * 全部使用 Lucide React，不引入额外图标库
 */

import {
  FileCode2, Table2, FileText, Link as LinkIcon, Code2,
  Hash, Fingerprint, Lock, Search, Clock, CalendarDays,
  Paintbrush, Square, Pipette, SlidersHorizontal,
  AlignLeft, AlignJustify, Globe, Monitor,
  Binary, Palette, Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** Lucide 图标名 → 组件映射 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  FileCode2, Table2, FileText, Link: LinkIcon, Code2,
  Hash, Fingerprint, Lock, Search, Clock, CalendarDays,
  Paintbrush, Square, Pipette, SlidersHorizontal,
  AlignLeft, AlignJustify, Globe, Monitor,
  Binary, Palette, Type,
}

interface Props {
  name: string
  className?: string
  style?: React.CSSProperties
}

/**
 * 通过名称字符串渲染对应 Lucide 图标
 */
export function CategoryIcon({ name, className, style }: Props) {
  const Icon = ICON_MAP[name] ?? FileCode2
  return <Icon className={cn('h-4 w-4', className)} style={style} />
}
