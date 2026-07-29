'use client'

/**
 * WordCounterTool 组件
 * 文字统计工具，实时统计用户输入文本的字数、字符数（含/不含空格）、
 * 句子数、段落数及预计阅读时间，所有指标在输入时同步更新。
 */

import { useState, useMemo } from 'react'
import {
  AlignLeft,
  Hash,
  MessageSquare,
  FileText,
  Clock,
  Trash2,
  Type,
  Space,
} from 'lucide-react'

// ─── 统计卡片子组件 ─────────────────────────────────────────────────────────

interface StatCardProps {
  /** Lucide 图标节点 */
  icon: React.ReactNode
  /** 指标中文标签 */
  label: string
  /** 指标数值或格式化字符串 */
  value: string | number
  /** 卡片底部辅助说明 */
  description?: string
}

/**
 * StatCard 组件：单项统计指标的展示卡片，包含图标、标签、数值和说明。
 */
function StatCard({ icon, label, value, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0">{icon}</span>
        <span className="truncate leading-tight">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight leading-none">
        {value}
      </div>
      {description && (
        <div className="text-[11px] text-muted-foreground/70 leading-tight">
          {description}
        </div>
      )}
    </div>
  )
}

// ─── 统计计算函数 ────────────────────────────────────────────────────────────

interface TextStats {
  /** 字数（按空白字符分词） */
  wordCount: number
  /** 总字符数（含空格） */
  charCount: number
  /** 字符数（不含任何空白字符） */
  charNoSpaceCount: number
  /** 句子数（按 . ! ? 。！？ 计） */
  sentenceCount: number
  /** 段落数（按空行分隔） */
  paragraphCount: number
  /** 格式化后的预计阅读时间 */
  readingTime: string
}

/**
 * computeStats 函数：对给定文本计算各项文字统计指标。
 * @param text 原始输入文本
 * @returns TextStats 统计结果对象
 */
function computeStats(text: string): TextStats {
  const trimmed = text.trim()

  // 字数：按空白字符（含换行）分词，过滤空字符串
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length

  // 字符数：包含所有字符（含空格、换行）
  const charCount = text.length

  // 字符数（不含空格）：去掉所有空白字符
  const charNoSpaceCount = text.replace(/\s/g, '').length

  // 句子数：匹配中英文句末标点符号
  const sentenceCount = trimmed
    ? (text.match(/[.!?。！？]+/g) || []).length
    : 0

  // 段落数：按空行分隔（一个或多个连续空行视为分段），不含空段落
  let paragraphCount = 0
  if (trimmed) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    paragraphCount = paragraphs.length || 1
  }

  // 预计阅读时间：按 200 字/分钟计算
  let readingTime = '0 秒'
  if (wordCount > 0) {
    const totalSeconds = Math.ceil((wordCount / 200) * 60)
    if (totalSeconds < 60) {
      readingTime = `${totalSeconds} 秒`
    } else {
      const mins = Math.floor(totalSeconds / 60)
      const secs = totalSeconds % 60
      readingTime = secs > 0 ? `${mins} 分 ${secs} 秒` : `${mins} 分钟`
    }
  }

  return {
    wordCount,
    charCount,
    charNoSpaceCount,
    sentenceCount,
    paragraphCount,
    readingTime,
  }
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

/**
 * WordCounterTool 组件：文字统计工具主体。
 * 上方提供大号输入文本框，下方以卡片网格实时展示六项统计指标。
 */
export function WordCounterTool() {
  /** 用户输入的原始文本 */
  const [text, setText] = useState('')

  /** 实时计算统计结果，仅在 text 变化时重新执行 */
  const stats = useMemo(() => computeStats(text), [text])

  /** 清空输入框 */
  const handleClear = () => {
    setText('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── 文本输入区 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 面板头部 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <AlignLeft className="h-3.5 w-3.5" />
            <span>输入文本</span>
          </div>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        </div>

        {/* 文本域 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60 min-h-[260px]"
          placeholder="在此输入或粘贴文本，统计数据将实时更新…"
          spellCheck={false}
        />
      </div>

      {/* ── 统计卡片网格 ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<Type className="h-3.5 w-3.5" />}
          label="字数"
          value={stats.wordCount.toLocaleString()}
          description="按空格分词"
        />
        <StatCard
          icon={<Hash className="h-3.5 w-3.5" />}
          label="字符数"
          value={stats.charCount.toLocaleString()}
          description="含空格与换行"
        />
        <StatCard
          icon={<Space className="h-3.5 w-3.5" />}
          label="字符数（无空格）"
          value={stats.charNoSpaceCount.toLocaleString()}
          description="去除所有空白字符"
        />
        <StatCard
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="句子数"
          value={stats.sentenceCount.toLocaleString()}
          description="按 . ! ? 。！？ 计"
        />
        <StatCard
          icon={<FileText className="h-3.5 w-3.5" />}
          label="段落数"
          value={stats.paragraphCount.toLocaleString()}
          description="按空行分隔"
        />
        <StatCard
          icon={<Clock className="h-3.5 w-3.5" />}
          label="预计阅读时间"
          value={stats.readingTime}
          description="约 200 字 / 分钟"
        />
      </div>
    </div>
  )
}
