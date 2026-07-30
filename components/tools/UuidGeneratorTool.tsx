'use client'

/**
 * UUID v4 生成器工具组件。
 * 功能：中央大号 UUID 展示区（monospace 字体），支持生成、复制单个 UUID；
 * 批量生成（1/5/10/20 条）；下方历史列表（最近 20 条），每条可单独复制。
 * 使用浏览器原生 crypto.randomUUID() 生成 UUID v4，无需外部依赖。
 */

import { useState, useCallback } from 'react'
import { Copy, RefreshCw, CheckCheck, Clock, Trash2 } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

/** 批量生成的数量选项 */
const BATCH_OPTIONS = [1, 5, 10, 20] as const
type BatchCount = typeof BATCH_OPTIONS[number]

/** 历史记录最大保留条数 */
const MAX_HISTORY = 20

/**
 * 复制按钮子组件，点击后短暂显示已复制状态。
 */
function CopyButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  /** 复制文本到剪贴板，并短暂切换为已复制状态 */
  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 剪贴板不可用时静默失败
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      title={copied ? t('common.copied') : t('common.copy')}
      aria-label={copied ? t('common.copied') : t('common.copy')}
      className={className}
    >
      {copied ? (
        <CheckCheck size={14} className="text-green-500" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  )
}

/**
 * UUID v4 生成器主组件。
 * 包含：当前 UUID 展示区、操作按钮区、批量数量选择、历史列表。
 */
export function UuidGeneratorTool() {
  const { t } = useI18n()

  /** 当前展示的 UUID */
  const [current, setCurrent] = useState<string>(() => crypto.randomUUID())

  /** 历史 UUID 列表（最多 MAX_HISTORY 条） */
  const [history, setHistory] = useState<string[]>([])

  /** 批量生成数量 */
  const [batchCount, setBatchCount] = useState<BatchCount>(1)

  /**
   * 生成新 UUID 并推入历史列表。
   * 当 batchCount > 1 时批量生成，并将所有新 UUID 推入历史。
   */
  const handleGenerate = useCallback(() => {
    const newUuids = Array.from({ length: batchCount }, () => crypto.randomUUID())
    const latest = newUuids[0]
    setCurrent(latest)
    setHistory(prev => {
      const combined = [...newUuids, ...prev]
      return combined.slice(0, MAX_HISTORY)
    })
  }, [batchCount])

  /** 清空历史列表 */
  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* 当前 UUID 展示卡片 */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 卡片头部 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>{t('tools.uuid-generator.current_label')}</span>
          <span className="opacity-60">v4 · crypto.randomUUID()</span>
        </div>

        {/* UUID 展示区 */}
        <div className="flex items-center justify-between gap-4 px-6 py-8">
          <span className="flex-1 break-all font-mono text-2xl font-semibold tracking-widest text-foreground select-all text-center">
            {current}
          </span>
        </div>

        {/* 操作区 */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border/40 bg-muted/20 px-4 py-3">
          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} />
            {t('common.generate')}
          </button>

          {/* 复制当前 UUID 按钮 */}
          <CopyButton
            text={current}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
          />

          {/* 分隔 */}
          <div className="h-5 w-px bg-border/60" />

          {/* 批量数量选择 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t('tools.uuid-generator.batch')}</span>
            <div className="flex gap-1">
              {BATCH_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setBatchCount(n)}
                  className={[
                    'h-8 min-w-[2rem] rounded-lg border px-2 text-xs font-medium transition cursor-pointer',
                    batchCount === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  ].join(' ')}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{t('tools.uuid-generator.count_unit')}</span>
          </div>
        </div>
      </div>

      {/* 历史列表卡片 */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        {/* 卡片头部 */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{t('tools.uuid-generator.history')}</span>
            {history.length > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {history.length}
              </span>
            )}
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:text-destructive cursor-pointer"
              title={t('tools.uuid-generator.clear_history_title')}
            >
              <Trash2 size={11} />
              {t('common.clear')}
            </button>
          )}
        </div>

        {/* 历史列表内容 */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground/60">
            <Clock size={28} strokeWidth={1.2} />
            <span className="text-sm">{t('tools.uuid-generator.history_empty')}</span>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {history.map((uuid, index) => (
              <li
                key={`${uuid}-${index}`}
                className="group flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-muted/30"
              >
                {/* 序号 */}
                <span className="w-6 shrink-0 text-center text-xs text-muted-foreground/50">
                  {index + 1}
                </span>

                {/* UUID 文本 */}
                <span className="flex-1 select-all font-mono text-sm text-foreground/90 tracking-wide">
                  {uuid}
                </span>

                {/* 复制按钮（hover 显示） */}
                <CopyButton
                  text={uuid}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100 cursor-pointer"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
