'use client'

/**
 * 这个组件的作用：JSON 展示工作台，支持树视图与格式化行视图切换，
 * 左侧结构浏览 + 右侧节点详情联动，并提供搜索过滤能力。
 * 移植自参考项目 ideaflow-web-tool/app/components/Tools/json/JsonInspectorWorkbench.vue。
 */

import { useState, useEffect, useRef, useMemo, useCallback, type ChangeEvent } from 'react'
import { useTheme } from 'next-themes'
import { Search, ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react'
import {
  parseOrderedJson,
  flattenJsonNodes,
  buildJsonTreeRows,
  buildFormattedLines,
  detectJsonDetail,
  renderJsonHtml,
  writeOrderedJson,
  type JsonInspectorNode,
  type JsonTreeItem,
  type JsonFormattedLine,
} from '@/lib/json-tools'

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  /** 当前 JSON 文本（受控） */
  value?: string
  onChange?: (v: string) => void
  /** 展示模式：树视图 或 格式化行 */
  layoutMode?: 'tree' | 'formatted'
  onLayoutModeChange?: (m: 'tree' | 'formatted') => void
  /** 搜索词 */
  searchText?: string
  onSearchTextChange?: (s: string) => void
  /** 是否隐藏内部工具栏（外部页面级工具栏接管时使用） */
  hideToolbar?: boolean
  /** 外部调用：清空内容 */
  onClearRef?: React.MutableRefObject<(() => void) | null>
}

// ─── 内部帮助组件 ─────────────────────────────────────────────────────────────

/**
 * 这个组件的作用：节点类型小徽章。
 */
function TypeChip({ label }: { label: string }) {
  return (
    <span className="json-inspector-chip px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">
      {label}
    </span>
  )
}

/**
 * 这个组件的作用：详情区的 section 标题行。
 */
function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────────────

/**
 * 这个组件的作用：JSON 展示工作台，包含 JSON 输入、结构浏览和节点详情三大区域。
 */
export function JsonInspectorTool({
  value = '',
  onChange,
  layoutMode: layoutModeProp = 'formatted',
  onLayoutModeChange,
  searchText: searchTextProp = '',
  onSearchTextChange,
  hideToolbar = false,
  onClearRef,
}: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // ── 内部状态 ──
  const [editorText, setEditorText] = useState(value)
  const [layoutMode, setLayoutMode] = useState<'tree' | 'formatted'>(layoutModeProp)
  const [searchText, setSearchText] = useState(searchTextProp)
  const [statusMessage, setStatusMessage] = useState('等待 JSON 输入')
  const [isError, setIsError] = useState(false)
  const [nodes, setNodes] = useState<JsonInspectorNode[]>([])
  const [treeRows, setTreeRows] = useState<JsonTreeItem[]>([])
  const [formattedLines, setFormattedLines] = useState<JsonFormattedLine[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedLineNumber, setSelectedLineNumber] = useState<number | null>(null)
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({ '$': true })

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editorHighlightRef = useRef<HTMLPreElement>(null)

  // ── 解析 JSON，重建数据模型 ──
  const reloadFromSource = useCallback((source: string) => {
    const trimmed = source.trim()
    if (!trimmed) {
      setNodes([])
      setTreeRows([])
      setFormattedLines([])
      setSelectedPath(null)
      setSelectedLineNumber(null)
      setStatusMessage('暂无 JSON 数据')
      setIsError(false)
      setExpandedState({ '$': true })
      return
    }
    try {
      const ordered = parseOrderedJson(source)
      const newNodes = flattenJsonNodes(ordered)
      const newTreeRows = buildJsonTreeRows(ordered)
      const newFormattedLines = buildFormattedLines(ordered)
      setNodes(newNodes)
      setTreeRows(newTreeRows)
      setFormattedLines(newFormattedLines)
      setStatusMessage(`已解析 ${newNodes.length} 个节点`)
      setIsError(false)
      setSelectedPath(prev => {
        const keepPath = prev && newNodes.some(n => n.path === prev) ? prev : (newNodes[0]?.path ?? null)
        return keepPath
      })
    } catch (err) {
      setNodes([])
      setTreeRows([])
      setFormattedLines([])
      setSelectedPath(null)
      setSelectedLineNumber(null)
      setStatusMessage(err instanceof Error ? err.message : 'JSON 解析失败')
      setIsError(true)
    }
  }, [])

  // ── 同步 textarea + pre 滚动 ──
  const syncEditorScroll = useCallback(() => {
    if (editorTextareaRef.current && editorHighlightRef.current) {
      editorHighlightRef.current.scrollTop = editorTextareaRef.current.scrollTop
      editorHighlightRef.current.scrollLeft = editorTextareaRef.current.scrollLeft
    }
  }, [])

  // ── 挂载时立即解析初始值（外部共享 JSON 已有内容时）──
  useEffect(() => {
    reloadFromSource(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 外部 value 变化时同步 ──
  useEffect(() => {
    if (value !== editorText) {
      setEditorText(value)
      reloadFromSource(value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // ── 外部 layoutMode 变化时同步 ──
  useEffect(() => {
    if (layoutModeProp !== layoutMode) setLayoutMode(layoutModeProp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutModeProp])

  // ── 外部 searchText 变化时同步 ──
  useEffect(() => {
    if (searchTextProp !== searchText) setSearchText(searchTextProp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTextProp])

  // ── 暴露清空方法给父组件 ──
  useEffect(() => {
    if (onClearRef) {
      onClearRef.current = () => {
        setEditorText('')
        setSelectedPath(null)
        setSelectedLineNumber(null)
        setExpandedState({ '$': true })
        onChange?.('')
      }
    }
  }, [onClearRef, onChange])

  // ── 输入区内容变化 ──
  const handleEditorChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setEditorText(newText)
    onChange?.(newText)
    reloadFromSource(newText)
  }, [onChange, reloadFromSource])

  // ── 树行映射（path → row）──
  const treeRowMap = useMemo(() => new Map(treeRows.map(r => [r.path, r])), [treeRows])

  // ── 展开祖先链 ──
  const expandAncestors = useCallback((path: string | null, currentTreeRowMap: Map<string, JsonTreeItem>) => {
    if (!path) return
    const next: Record<string, boolean> = { '$': true }
    let cur: string | undefined = path
    const visited = new Set<string>()
    while (cur && !visited.has(cur)) {
      visited.add(cur)
      next[cur] = true
      cur = currentTreeRowMap.get(cur)?.parentPath
    }
    setExpandedState(prev => ({ ...prev, ...next }))
  }, [])

  // ── 搜索命中的 path 集合 ──
  const visibleTreePathSet = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    const set = new Set<string>()
    if (!keyword) {
      treeRows.forEach(r => set.add(r.path))
      return set
    }
    treeRows.forEach(row => {
      const matched = [row.key, row.path, row.preview].some(f => f.toLowerCase().includes(keyword))
      if (!matched) return
      let cur: string | undefined = row.path
      const visited = new Set<string>()
      while (cur && !visited.has(cur)) {
        visited.add(cur)
        set.add(cur)
        cur = treeRowMap.get(cur)?.parentPath
      }
    })
    return set
  }, [treeRows, treeRowMap, searchText])

  // ── 可见树行 ──
  const visibleTreeRows = useMemo(() => treeRows.filter(row => {
    if (!visibleTreePathSet.has(row.path)) return false
    if (searchText.trim()) return true
    let cur = row.parentPath
    const visited = new Set<string>()
    while (cur && !visited.has(cur)) {
      visited.add(cur)
      if (!expandedState[cur]) return false
      cur = treeRowMap.get(cur)?.parentPath
    }
    return true
  }), [treeRows, visibleTreePathSet, searchText, expandedState, treeRowMap])

  // ── 过滤后的格式化行 ──
  const filteredFormattedLines = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return formattedLines
    return formattedLines.filter(line => {
      const nodePreview = nodes.find(n => n.path === line.path)?.preview ?? ''
      return [line.text, line.path ?? '', nodePreview].some(f => f.toLowerCase().includes(keyword))
    })
  }, [formattedLines, nodes, searchText])

  // ── 当前选中节点 ──
  const selectedNode = useMemo(() => nodes.find(n => n.path === selectedPath) ?? null, [nodes, selectedPath])

  // ── 选中节点详情 ──
  const selectedDetail = useMemo(() => {
    if (!selectedNode) return null
    return detectJsonDetail(selectedNode.value, selectedNode.path)
  }, [selectedNode])

  // ── 选中节点原始 JSON ──
  const selectedRawJson = useMemo(() => {
    if (!selectedNode) return ''
    return writeOrderedJson(selectedNode.value, true)
  }, [selectedNode])

  // ── 可见计数 ──
  const currentVisibleCount = layoutMode === 'tree' ? visibleTreeRows.length : filteredFormattedLines.length
  const currentTotalCount = layoutMode === 'tree' ? treeRows.length : formattedLines.length

  // ── 选中路径同步到格式化行号 ──
  useEffect(() => {
    if (!selectedPath) { setSelectedLineNumber(null); return }
    const line = formattedLines.find(l => l.path === selectedPath)
    setSelectedLineNumber(line?.number ?? null)
  }, [selectedPath, formattedLines])

  // ── 选中树行 ──
  const selectPath = useCallback((path: string | null, rowMap: Map<string, JsonTreeItem>) => {
    setSelectedPath(path)
    expandAncestors(path, rowMap)
  }, [expandAncestors])

  // ── 选中格式化行 ──
  const selectFormattedLine = useCallback((line: JsonFormattedLine) => {
    setSelectedLineNumber(line.number)
    if (line.path) {
      setSelectedPath(line.path)
      expandAncestors(line.path, treeRowMap)
    }
  }, [expandAncestors, treeRowMap])

  // ── 切换树节点折叠 ──
  const toggleExpand = useCallback((path: string) => {
    setExpandedState(prev => ({ ...prev, [path]: !prev[path] }))
  }, [])

  // ── 切换布局模式 ──
  const changeLayout = useCallback((mode: 'tree' | 'formatted') => {
    setLayoutMode(mode)
    onLayoutModeChange?.(mode)
  }, [onLayoutModeChange])

  // ── 搜索词变化 ──
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSearchText(v)
    onSearchTextChange?.(v)
  }, [onSearchTextChange])

  // ── 是否已有合法 JSON 可展示 ──
  const hasRenderableContent = editorText.trim().length > 0 && !isError && nodes.length > 0

  // ── 实时高亮 HTML ──
  const editableHtml = useMemo(() => renderJsonHtml(editorText || ' '), [editorText])

  // ── 格式化行高亮 HTML ──
  const renderLineHtml = useCallback((text: string) => renderJsonHtml(text), [])

  // ── 主题相关样式 ──
  const shellCls = isDark
    ? 'border border-slate-700/45 bg-[linear-gradient(180deg,rgba(12,19,36,0.92),rgba(4,9,20,0.98))] shadow-[0_22px_54px_-38px_rgba(0,0,0,0.84)] backdrop-blur-xl'
    : 'border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98))] shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)] backdrop-blur-xl'

  const paneCls = isDark
    ? 'bg-[linear-gradient(180deg,rgba(13,21,38,0.46),rgba(4,9,20,0.28))]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.9))]'

  const dividerCls = isDark ? 'bg-slate-700/42' : 'bg-slate-200/75'

  const glowCls = isDark
    ? 'bg-[radial-gradient(circle_at_top,rgba(125,183,240,0.1),transparent_58%)]'
    : 'bg-[radial-gradient(circle_at_top,rgba(125,183,240,0.09),transparent_52%)]'

  const formattedContainerCls = isDark
    ? 'bg-[linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.08))]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.9))]'

  const formattedRowHoverCls = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-100/85'
  const formattedSelectedCls = isDark ? 'bg-sky-400/10' : 'bg-sky-100/85'
  const formattedLineNumberCls = isDark ? 'text-slate-500' : 'text-slate-400/90'
  const formattedLineThemeCls = isDark ? 'formatted-line-dark text-slate-100' : 'formatted-line-light text-slate-800'

  const treeRowHoverCls = isDark ? 'hover:bg-slate-400/5' : 'hover:bg-slate-100/75'
  const treeRowSelectedCls = isDark
    ? 'bg-[linear-gradient(180deg,rgba(56,189,248,0.08),rgba(37,99,235,0.06))]'
    : 'bg-sky-100/80'

  const detailCodeCls = isDark
    ? 'bg-[linear-gradient(180deg,rgba(7,12,24,0.92),rgba(5,10,20,0.98))] text-slate-100 border border-slate-700/40 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]'
    : 'bg-slate-50/92 text-slate-800 border border-slate-200/80'

  const editorInputCls = isDark
    ? 'text-transparent caret-slate-100 placeholder:text-slate-500'
    : 'text-transparent caret-slate-900 placeholder:text-slate-400'

  const editorHighlightCls = isDark ? 'formatted-line-dark text-slate-100' : 'formatted-line-light text-slate-800'

  const statusCls = isError ? 'border-rose-300 text-rose-700' : 'border-border text-muted-foreground'

  return (
    <section className="json-inspector-workbench">
      {/* ── 内置工具栏（外部接管时隐藏）── */}
      {!hideToolbar && (
        <div className="json-inspector-toolbar flex flex-col gap-3 pb-3.5 border-b border-border/60 mb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* 布局切换 */}
            <div className="flex items-center gap-1.5">
              <button
                className={`h-9 w-9 grid place-items-center rounded-xl border transition-all duration-150 cursor-pointer ${
                  layoutMode === 'tree'
                    ? 'border-primary bg-primary text-white'
                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                title="树视图"
                aria-label="树视图"
                onClick={() => changeLayout('tree')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </button>
              <button
                className={`h-9 w-9 grid place-items-center rounded-xl border transition-all duration-150 cursor-pointer ${
                  layoutMode === 'formatted'
                    ? 'border-primary bg-primary text-white'
                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
                title="JSON 格式"
                aria-label="JSON 格式"
                onClick={() => changeLayout('formatted')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </button>
            </div>

            {/* 搜索框 */}
            <label className="json-inspector-search flex h-9 w-full max-w-[320px] items-center gap-2 px-3 rounded-xl border border-border/60 cursor-text">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={searchText}
                onChange={handleSearchChange}
                className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search"
              />
            </label>
          </div>

          {/* 状态行 */}
          <div className="flex items-center gap-2 text-xs">
            {isError && (
              <span className={`rounded-lg border px-2 py-1 ${statusCls}`}>{statusMessage}</span>
            )}
            <span className="font-mono text-muted-foreground">{currentVisibleCount}/{currentTotalCount}</span>
          </div>
        </div>
      )}

      {/* 仅错误时显示状态条（外部工具栏模式）*/}
      {hideToolbar && isError && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className={`rounded-lg border px-2 py-1 ${statusCls}`}>{statusMessage}</span>
        </div>
      )}

      {/* ── 主工作区 ── */}
      <div className={`json-inspector-shell relative overflow-hidden rounded-[30px] ${shellCls}`}>
        {/* 顶部光晕 */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 opacity-70 ${glowCls}`} />

        <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_1px_minmax(320px,0.92fr)]">
          {/* ── 左侧结构区 ── */}
          <div className={`min-w-0 overflow-hidden backdrop-blur-[12px] ${paneCls}`}>
            {!hasRenderableContent ? (
              /* 输入态：textarea + pre 叠加 */
              <div className="relative min-h-[620px]">
                <pre
                  ref={editorHighlightRef}
                  className={`json-highlight-layer pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm leading-[1.85] md:px-5 ${editorHighlightCls}`}
                  dangerouslySetInnerHTML={{ __html: editableHtml }}
                  aria-hidden
                />
                <textarea
                  ref={editorTextareaRef}
                  value={editorText}
                  onChange={handleEditorChange}
                  onScroll={syncEditorScroll}
                  className={`json-editor-textarea relative z-10 h-full min-h-[620px] w-full resize-none overflow-auto border-0 bg-transparent px-4 py-4 font-mono text-sm leading-[1.85] focus:outline-none md:px-5 ${editorInputCls}`}
                  placeholder='请输入合法 JSON，例如 {"name":"devtoolbox"}'
                  spellCheck={false}
                />
              </div>
            ) : (
              /* 展示态：树视图 或 格式化行 */
              <div className="flex min-h-[620px] flex-col">
                {layoutMode === 'tree' ? (
                  <div className="max-h-[620px] overflow-auto">
                    {visibleTreeRows.map(row => (
                      <div
                        key={row.path}
                        className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition border-b border-border/30 last:border-0 ${
                          selectedPath === row.path ? treeRowSelectedCls : treeRowHoverCls
                        }`}
                        onClick={() => selectPath(row.path, treeRowMap)}
                      >
                        <div
                          className="flex min-w-0 flex-1 items-start gap-3"
                          style={{ paddingLeft: `${row.depth * 16}px` }}
                        >
                          {row.hasChildren ? (
                            <button
                              className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-border/60 grid place-items-center text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                              onClick={e => { e.stopPropagation(); toggleExpand(row.path) }}
                              aria-label={expandedState[row.path] ? '折叠' : '展开'}
                            >
                              <span className="text-[10px] font-mono leading-none">
                                {expandedState[row.path] || searchText.trim() ? '−' : '+'}
                              </span>
                            </button>
                          ) : (
                            <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-transparent" />
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm text-foreground">{row.key}</span>
                              <TypeChip label={row.type} />
                            </div>
                            <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">
                              {row.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {visibleTreeRows.length === 0 && (
                      <div className="px-5 py-10 text-center text-sm text-muted-foreground">无结果</div>
                    )}
                  </div>
                ) : (
                  /* 格式化行视图 */
                  <div className={`max-h-[620px] overflow-auto py-2 ${formattedContainerCls}`}>
                    {filteredFormattedLines.map(line => (
                      <button
                        key={line.number}
                        className={`flex w-full items-start gap-3 px-3 py-1.5 text-left transition ${formattedRowHoverCls} ${
                          selectedLineNumber === line.number ? formattedSelectedCls : ''
                        }`}
                        onClick={() => selectFormattedLine(line)}
                      >
                        <span className={`w-10 shrink-0 pt-1 text-right font-mono text-xs ${formattedLineNumberCls}`}>
                          {line.number}
                        </span>
                        <span
                          className={`min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-words font-mono text-sm leading-[1.85] ${formattedLineThemeCls}`}
                          dangerouslySetInnerHTML={{ __html: renderLineHtml(line.text) }}
                        />
                      </button>
                    ))}
                    {filteredFormattedLines.length === 0 && (
                      <div className={`px-5 py-10 text-center text-sm ${formattedLineNumberCls}`}>无结果</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 中间分隔线 ── */}
          <div className={`hidden h-auto w-px lg:block opacity-90 ${dividerCls}`} />

          {/* ── 右侧详情区 ── */}
          <div className={`min-w-0 overflow-hidden backdrop-blur-[12px] ${paneCls}`}>
            {selectedNode ? (
              <div className="max-h-[620px] overflow-auto px-4 py-4 md:px-5">
                {/* Path + 类型 */}
                <div className="border-b border-border/50 pb-4">
                  <DetailLabel>Path</DetailLabel>
                  <p className="mt-2.5 break-all font-mono text-sm leading-6 text-foreground">
                    {selectedNode.path}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <TypeChip label={selectedNode.type} />
                    {selectedDetail && (
                      <TypeChip label={selectedDetail.kind} />
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="border-b border-border/50 py-4">
                  <DetailLabel>Preview</DetailLabel>
                  <p className="mt-2.5 break-words text-sm leading-6 text-foreground">
                    {selectedNode.preview}
                  </p>
                </div>

                {/* 富类型详情 */}
                {selectedDetail?.kind === 'image' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Image</DetailLabel>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDetail.url}
                      alt="JSON image preview"
                      className="mt-2.5 max-h-72 w-full rounded-[18px] border border-border/60 object-cover"
                    />
                    <a href={selectedDetail.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2.5 inline-flex text-sm text-primary hover:opacity-80">
                      打开
                    </a>
                  </div>
                )}

                {selectedDetail?.kind === 'video' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Video</DetailLabel>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={selectedDetail.url} controls
                      className="mt-2.5 max-h-72 w-full rounded-[18px] bg-slate-950" />
                    <a href={selectedDetail.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2.5 inline-flex text-sm text-primary hover:opacity-80">
                      打开
                    </a>
                  </div>
                )}

                {selectedDetail?.kind === 'audio' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Audio</DetailLabel>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio src={selectedDetail.url} controls className="mt-2.5 w-full" />
                    <a href={selectedDetail.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2.5 inline-flex text-sm text-primary hover:opacity-80">
                      打开
                    </a>
                  </div>
                )}

                {selectedDetail?.kind === 'date' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Date</DetailLabel>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {[
                        { label: '本地时间', value: selectedDetail.local },
                        { label: 'ISO 8601', value: selectedDetail.iso },
                        { label: 'Unix 秒', value: String(selectedDetail.unix) },
                        { label: 'Unix 毫秒', value: String(selectedDetail.unixMs) },
                      ].map(({ label, value }) => (
                        <div key={label} className="json-inspector-mini-card rounded-2xl border border-border/60 px-3.5 py-3">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDetail?.kind === 'color' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Color</DetailLabel>
                    <div className="mt-2.5 flex items-center gap-3.5">
                      <div
                        className="h-14 w-14 rounded-2xl border border-border/60"
                        style={{ backgroundColor: selectedDetail.hex }}
                      />
                      <div>
                        <p className="font-mono text-sm text-foreground">{selectedDetail.text}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedDetail.hex}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetail?.kind === 'url' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>URL</DetailLabel>
                    <p className="mt-2.5 break-all font-mono text-sm leading-6 text-foreground">
                      {selectedDetail.url}
                    </p>
                    <a href={selectedDetail.url} target="_blank" rel="noopener noreferrer"
                      className="mt-2.5 inline-flex text-sm text-primary hover:opacity-80">
                      打开
                    </a>
                  </div>
                )}

                {selectedDetail?.kind === 'email' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Email</DetailLabel>
                    <p className="mt-2.5 break-all font-mono text-sm leading-6 text-foreground">
                      {selectedDetail.email}
                    </p>
                    <a href={`mailto:${selectedDetail.email}`}
                      className="mt-2.5 inline-flex text-sm text-primary hover:opacity-80">
                      写邮件
                    </a>
                  </div>
                )}

                {selectedDetail?.kind === 'base64' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Base64 解码</DetailLabel>
                    <pre className={`mt-2.5 overflow-auto whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-3 font-mono text-xs leading-[1.75] backdrop-blur-[10px] ${detailCodeCls}`}>
                      {selectedDetail.decoded}
                    </pre>
                  </div>
                )}

                {selectedDetail?.kind === 'plain' && (
                  <div className="border-b border-border/50 py-4">
                    <DetailLabel>Value</DetailLabel>
                    <pre className={`mt-2.5 overflow-auto whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-3 font-mono text-xs leading-[1.75] backdrop-blur-[10px] ${detailCodeCls}`}>
                      {selectedDetail.text}
                    </pre>
                  </div>
                )}

                {/* Raw JSON */}
                <div className="pt-4">
                  <DetailLabel>Raw JSON</DetailLabel>
                  <pre className={`mt-2.5 overflow-auto whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-3 font-mono text-xs leading-[1.75] backdrop-blur-[10px] ${detailCodeCls}`}>
                    {selectedRawJson}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[620px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                暂无选中
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
