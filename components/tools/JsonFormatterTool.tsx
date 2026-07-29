'use client'

/**
 * 这个组件的作用：JSON 格式化与预览工作台，支持实时语法高亮、单栏/双栏布局、格式化/压缩/校验等操作。
 * 移植自参考项目 ideaflow-web-tool/app/components/Tools/json/JsonFormatterWorkbench.vue。
 * 支持独立使用（内置工具栏）和嵌入 JsonWorkbench（外部工具栏接管）两种模式。
 * 采用 textarea + pre 叠加技术实现可编辑区域的实时语法高亮。
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  AlignLeft, Minimize2, ShieldCheck, Copy, FileCode2,
  Columns2, Square, Layers,
} from 'lucide-react'
import {
  parseOrderedJson,
  formatOrderedJson,
  renderJsonHtml,
  flattenJsonNodes,
  createJsonSample,
  OrderedJsonParseError,
  type OrderedJsonValue,
} from '@/lib/json-tools'

type LayoutMode = 'single' | 'split'
type StatusTone = 'success' | 'error' | 'info' | null

interface StatusState {
  tone: StatusTone
  message: string
  line?: number
  col?: number
}

// ─── 工具栏子组件 ────────────────────────────────────────────────────

/**
 * 这个组件的作用：分段控件中的单个选项按钮（用于布局模式切换）。
 */
function SegBtn({
  active, onClick, title, children,
}: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={[
        'inline-flex items-center justify-center h-7 w-7 rounded-lg text-[13px] transition-all duration-150 cursor-pointer',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * 这个组件的作用：工具栏操作按钮，图标 + 文字标签，让用户一眼看懂每个按钮的功能。
 */
function ActionBtn({
  onClick, label, icon: Icon, title,
}: { onClick: () => void; label: string; icon: React.ElementType; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border border-border/60 text-muted-foreground bg-background/50 hover:border-primary/50 hover:text-foreground hover:bg-muted/50 transition-all duration-150 cursor-pointer"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────

interface Messages {
  common?: Record<string, string>
  tools?: Record<string, Record<string, string>>
}

/** 外部工具栏接管时，父组件通过此 ref 调用格式化工作台内的方法 */
export interface FormatterActionRef {
  insertSample: () => void
  formatJson: () => void
  minifyJson: () => void
  validateJson: () => void
  copyContent: () => void
}

/** 解析统计信息，供父级在全局工具栏展示 */
export interface FormatterStats {
  nodes: number
  depth: number
  size: number
}

interface Props {
  messages?: Messages
  /** 外部共享 JSON 文本（受控） */
  sharedValue?: string
  onSharedValueChange?: (v: string) => void
  /** 外部控制布局模式 */
  layoutMode?: LayoutMode
  onLayoutModeChange?: (m: LayoutMode) => void
  /** 是否隐藏内置工具栏（由父级 JsonWorkbench 接管时为 true） */
  hideToolbar?: boolean
  /** 父组件通过此 ref 调用内部方法 */
  actionRef?: React.MutableRefObject<FormatterActionRef | null>
  /** 由父级提供外壳时设为 true，跳过自身的 json-tool-shell 包裹层 */
  noShell?: boolean
  /** 统计信息变化时回调（父级在全局工具栏展示时使用） */
  onStatsChange?: (stats: FormatterStats | null) => void
}

/**
 * 这个组件的作用：JSON 格式化工作台，包含工具栏、状态栏和编辑/预览双栏区域。
 */
export function JsonFormatterTool({
  messages,
  sharedValue,
  onSharedValueChange,
  layoutMode: layoutModeProp,
  onLayoutModeChange,
  hideToolbar = false,
  actionRef,
  noShell = false,
  onStatsChange,
}: Props) {
  // ── 核心状态 ──
  const [text, setText]           = useState(sharedValue ?? '')
  const [outputText, setOutput]   = useState('')
  const [parsedValue, setParsed]  = useState<OrderedJsonValue | null>(null)
  const [layoutMode, setLayout]   = useState<LayoutMode>(layoutModeProp ?? 'single')
  const [status, setStatus]       = useState<StatusState>({ tone: null, message: '' })

  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  // ── 同步外部 sharedValue ──
  useEffect(() => {
    if (sharedValue !== undefined && sharedValue !== text) {
      setText(sharedValue)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedValue])

  // ── 同步外部 layoutMode ──
  useEffect(() => {
    if (layoutModeProp !== undefined && layoutModeProp !== layoutMode) {
      setLayout(layoutModeProp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutModeProp])

  // ── 同步滚动：让高亮层与 textarea 保持一致 ──
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop  = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  // ── 实时预览（防抖 180ms）──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!text.trim()) {
        setOutput('')
        setParsed(null)
        return
      }
      try {
        const ordered = parseOrderedJson(text)
        setParsed(ordered)
        setOutput(formatOrderedJson(text, true))
      } catch {
        setParsed(null)
        setOutput(text)
      }
    }, 180)
    return () => clearTimeout(timer)
  }, [text])

  // ── 错误状态处理 ──
  const setError = useCallback((e: unknown) => {
    if (e instanceof OrderedJsonParseError) {
      setStatus({ tone: 'error', message: e.message, line: e.issue.line, col: e.issue.column })
    } else {
      setStatus({ tone: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }, [])

  // ── 内部 text 变化时通知父级 ──
  const updateText = useCallback((newText: string) => {
    setText(newText)
    onSharedValueChange?.(newText)
  }, [onSharedValueChange])

  // ── 工具栏动作 ──

  /** 格式化：单栏模式回写输入区，双栏模式写到输出区 */
  const handleFormat = useCallback(() => {
    try {
      const formatted = formatOrderedJson(text, true)
      setParsed(parseOrderedJson(formatted))
      if (layoutMode === 'single') updateText(formatted)
      setOutput(formatted)
      setStatus({ tone: 'success', message: '已格式化' })
    } catch (e) { setError(e) }
  }, [text, layoutMode, updateText, setError])

  /** 压缩：同上 */
  const handleMinify = useCallback(() => {
    try {
      const minified = formatOrderedJson(text, false)
      setParsed(parseOrderedJson(minified))
      if (layoutMode === 'single') updateText(minified)
      setOutput(minified)
      setStatus({ tone: 'success', message: '已压缩' })
    } catch (e) { setError(e) }
  }, [text, layoutMode, updateText, setError])

  /** 校验：仅检查合法性，不修改内容 */
  const handleValidate = useCallback(() => {
    try {
      parseOrderedJson(text)
      setStatus({ tone: 'success', message: 'JSON 校验通过 ✓' })
    } catch (e) { setError(e) }
  }, [text, setError])

  /** 填充示例 */
  const handleSample = useCallback(() => {
    updateText(createJsonSample())
    setStatus({ tone: 'info', message: '已填充示例 JSON' })
  }, [updateText])

  /** 复制：单栏复制当前输入，双栏优先复制输出 */
  const handleCopy = useCallback(async () => {
    const content = layoutMode === 'single' ? text : (outputText || text)
    if (!content.trim()) return
    try {
      await navigator.clipboard.writeText(content)
      setStatus({ tone: 'success', message: '已复制到剪贴板' })
    } catch { setStatus({ tone: 'error', message: '复制失败，请手动复制' }) }
  }, [text, outputText, layoutMode])

  // ── 暴露方法给父组件 ──
  useEffect(() => {
    if (actionRef) {
      actionRef.current = {
        insertSample: handleSample,
        formatJson: handleFormat,
        minifyJson: handleMinify,
        validateJson: handleValidate,
        copyContent: handleCopy,
      }
    }
  }, [actionRef, handleSample, handleFormat, handleMinify, handleValidate, handleCopy])

  // ── 布局模式变化时通知父级 ──
  const handleSetLayout = useCallback((m: LayoutMode) => {
    setLayout(m)
    onLayoutModeChange?.(m)
  }, [onLayoutModeChange])

  // ── 统计信息 ──
  const stats = useMemo(() => {
    if (!parsedValue) return { nodes: 0, depth: 0, size: text.length }
    const getDepth = (v: OrderedJsonValue, d = 0): number => {
      if (v.kind === 'object') return v.value.reduce((m, p) => Math.max(m, getDepth(p.value, d + 1)), d)
      if (v.kind === 'array') return v.value.reduce((m, p) => Math.max(m, getDepth(p, d + 1)), d)
      return d
    }
    return {
      nodes: flattenJsonNodes(parsedValue).length,
      depth: getDepth(parsedValue),
      size: text.length,
    }
  }, [parsedValue, text])

  // ── 向父级同步统计信息（供全局工具栏展示）──
  useEffect(() => {
    onStatsChange?.(parsedValue ? stats : null)
  }, [stats, parsedValue, onStatsChange])

  // ── 语法高亮 HTML ──
  const editableHtml = useMemo(() => renderJsonHtml(text || ' '), [text])
  const outputHtml   = useMemo(() => renderJsonHtml(outputText || ' '), [outputText])

  return (
    <div className="json-formatter-workbench">
      {/* ── 内置工具栏（外部接管时隐藏）── */}
      {!hideToolbar && (
        <div className="flex flex-col gap-3 pb-4 border-b border-border/60 mb-4">
          {/* 第一行：布局切换 + 操作按钮 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* 布局切换：分段控件 */}
            <div className="flex items-center gap-0.5 rounded-xl bg-muted/50 p-0.5">
              <SegBtn active={layoutMode === 'single'} title="单栏模式" onClick={() => handleSetLayout('single')}>
                <Square className="h-3.5 w-3.5" />
              </SegBtn>
              <SegBtn active={layoutMode === 'split'} title="双栏对照" onClick={() => handleSetLayout('split')}>
                <Columns2 className="h-3.5 w-3.5" />
              </SegBtn>
            </div>

            {/* 操作按钮：图标 + 标签 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <ActionBtn onClick={handleSample}   label="示例"   icon={FileCode2} />
              <ActionBtn onClick={handleFormat}   label="格式化" icon={AlignLeft} />
              <ActionBtn onClick={handleMinify}   label="压缩"   icon={Minimize2} />
              <ActionBtn onClick={handleValidate} label="校验"   icon={ShieldCheck} />
              <ActionBtn
                onClick={handleCopy}
                label="复制"
                icon={Copy}
                title={layoutMode === 'single' ? '复制内容' : '复制输出'}
              />
            </div>
          </div>

          {/* 第二行：统计信息（平滑淡入） */}
          <div className={[
            'flex items-center gap-4 text-xs text-muted-foreground overflow-hidden transition-all duration-300 ease-out',
            parsedValue ? 'max-h-8 opacity-100 mt-1' : 'max-h-0 opacity-0',
          ].join(' ')}>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span className="font-mono">{stats.nodes}</span>
              <span>节点</span>
            </span>
            <span className="text-border">·</span>
            <span className="font-mono">{stats.depth}</span>
            <span className="-ml-3">层</span>
            <span className="text-border">·</span>
            <span className="font-mono">{stats.size}</span>
            <span className="-ml-3">字符</span>
          </div>
        </div>
      )}

      {/* ── 状态栏 ── */}
      {status.tone === 'error' && status.message && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive font-mono">
          {status.message}
          {status.line !== undefined && (
            <span className="ml-2 opacity-70">行 {status.line}：{status.col}</span>
          )}
        </div>
      )}
      {status.tone === 'success' && status.message && (
        <div className="mb-3 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-600 dark:text-green-400">
          {status.message}
        </div>
      )}

      {/* 外部接管工具栏时统计信息移入 shell 内部，此处不再显示 */}

      {/* ── 工作区 ── */}
      <div className={noShell ? 'relative' : 'json-formatter-shell json-tool-shell relative overflow-hidden rounded-[14px]'}>
        {/* 顶部光晕（仅自身提供外壳时渲染）*/}
        {!noShell && (
          <div className="json-tool-glow pointer-events-none absolute inset-x-0 top-0 h-16 opacity-70" />
        )}
        {/* 布局网格 */}
        <div
          className={`relative grid items-stretch ${
            layoutMode === 'split'
              ? 'lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]'
              : 'grid-cols-1'
          }`}
        >
          {/* 左侧输入面板（带实时高亮叠加）*/}
          <div className="json-tool-pane flex flex-col min-w-0 min-h-[560px] overflow-hidden">            <div className="relative flex-1 min-h-[520px]">
              {/* 高亮层 (pre) - 绝对定位在后，不可交互 */}
              <pre
                ref={highlightRef}
                className="json-highlight-layer pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words px-5 py-4 font-mono text-sm leading-[1.85]"
                dangerouslySetInnerHTML={{ __html: editableHtml }}
                aria-hidden
              />
              {/* 编辑层 (textarea) - 透明文字，仅光标可见 */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => updateText(e.target.value)}
                onScroll={syncScroll}
                className="json-editor-textarea relative z-10 h-full min-h-[520px] w-full resize-none overflow-auto border-0 bg-transparent px-5 py-4 font-mono text-sm leading-[1.85] focus:outline-none caret-slate-800 dark:caret-slate-100 placeholder:text-slate-400/90 dark:placeholder:text-slate-500"
                placeholder='在此粘贴或输入 JSON，例如 {"name":"devtoolbox"}'
                spellCheck={false}
              />
            </div>
          </div>

          {/* 中间分隔线（双栏模式）*/}
          {layoutMode === 'split' && (
            <div className="json-tool-divider hidden h-auto w-px lg:block opacity-90" />
          )}

          {/* 右侧输出面板（双栏模式）*/}
          {layoutMode === 'split' && (
            <div className="json-tool-pane flex flex-col min-w-0 min-h-[560px] overflow-hidden">
              <div className="relative flex-1 overflow-auto px-5 py-4">
                <pre
                  className="json-highlight-layer relative min-h-[520px] whitespace-pre-wrap break-words font-mono text-sm leading-[1.85]"
                  dangerouslySetInnerHTML={{ __html: outputHtml }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
