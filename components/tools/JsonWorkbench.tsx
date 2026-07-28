'use client'

/**
 * 这个组件的作用：JSON 工具工作台，整合格式化与展示两大模块，通过顶部 Tab 切换，
 * 并共享同一份 JSON 文本。移植自参考项目 ideaflow-web-tool/app/pages/d/json/index.vue。
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Code2, Columns2, Square, Layers, AlignLeft, Minimize2,
  ShieldCheck, Copy, FileCode2, Search, Trash2, ListTree, ListOrdered,
} from 'lucide-react'
import { JsonFormatterTool } from './JsonFormatterTool'
import { JsonInspectorTool } from './JsonInspectorTool'

type JsonToolTab = 'formatter' | 'inspector'
type FormatterLayoutMode = 'single' | 'split'
type InspectorLayoutMode = 'tree' | 'formatted'

interface JsonPagePreferences {
  activeTab: JsonToolTab
  formatterLayoutMode: FormatterLayoutMode
  inspectorLayoutMode: InspectorLayoutMode
}

const PREFS_KEY = 'devtoolbox:json-page-preferences'

// ─── 顶部图标按钮 ────────────────────────────────────────────────────────────

interface TabBtnProps {
  active: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}

/**
 * 这个组件的作用：顶部工具栏的方形图标按钮，含激活态高亮。
 */
function ToolbarBtn({ active, title, onClick, children }: TabBtnProps) {
  return (
    <button
      className={[
        'h-9 w-9 grid place-items-center rounded-xl border transition-all duration-150 cursor-pointer',
        active
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
      ].join(' ')}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────────────

interface Messages {
  common?: Record<string, string>
  tools?: Record<string, Record<string, string>>
}

interface Props {
  messages?: Messages
}

/**
 * 这个组件的作用：JSON 工具工作台外壳，持久化布局偏好并向两个子工作台分发事件。
 */
export function JsonWorkbench({ messages }: Props) {
  const [sharedJson, setSharedJson] = useState('')
  const [activeTab, setActiveTab] = useState<JsonToolTab>('formatter')
  const [formatterLayoutMode, setFormatterLayoutMode] = useState<FormatterLayoutMode>('single')
  const [inspectorLayoutMode, setInspectorLayoutMode] = useState<InspectorLayoutMode>('formatted')
  const [inspectorSearchText, setInspectorSearchText] = useState('')

  // 格式化工作台内部操作通过 ref 触发
  const formatterActionRef = useRef<{
    insertSample: () => void
    formatJson: () => void
    minifyJson: () => void
    validateJson: () => void
    copyContent: () => void
  } | null>(null)

  // 展示工作台清空操作
  const inspectorClearRef = useRef<(() => void) | null>(null)

  // ── 恢复本地偏好 ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<JsonPagePreferences>
      if (parsed.activeTab === 'formatter' || parsed.activeTab === 'inspector') {
        setActiveTab(parsed.activeTab)
      }
      if (parsed.formatterLayoutMode === 'single' || parsed.formatterLayoutMode === 'split') {
        setFormatterLayoutMode(parsed.formatterLayoutMode)
      }
      if (parsed.inspectorLayoutMode === 'tree' || parsed.inspectorLayoutMode === 'formatted') {
        setInspectorLayoutMode(parsed.inspectorLayoutMode)
      }
    } catch { /* ignore */ }
  }, [])

  // ── 持久化偏好 ──
  useEffect(() => {
    try {
      const payload: JsonPagePreferences = {
        activeTab,
        formatterLayoutMode,
        inspectorLayoutMode,
      }
      localStorage.setItem(PREFS_KEY, JSON.stringify(payload))
    } catch { /* ignore */ }
  }, [activeTab, formatterLayoutMode, inspectorLayoutMode])

  return (
    <div className="json-workbench">
      {/* ── 整体外壳：工具栏 header + 编辑内容一体化 ── */}
      <div className="json-tool-shell relative overflow-hidden rounded-[14px]">
        {/* 顶部光晕 */}
        <div className="json-tool-glow pointer-events-none absolute inset-x-0 top-0 h-20 opacity-75" />

        {/* ── Header 工具栏 ── */}
        <div className="json-tool-header relative z-10 grid items-center gap-3 px-4 py-2.5 lg:grid-cols-[auto_1fr_auto]">
          {/* 左：Tab 切换 */}
          <div className="flex items-center gap-1.5">
            <ToolbarBtn active={activeTab === 'formatter'} title="JSON 格式化" onClick={() => setActiveTab('formatter')}>
              <Code2 className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn active={activeTab === 'inspector'} title="JSON 展示" onClick={() => setActiveTab('inspector')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
              </svg>
            </ToolbarBtn>
          </div>

          {/* 中：当前 Tab 的布局切换 */}
          <div className="flex items-center justify-start gap-1.5 lg:justify-center">
            {activeTab === 'formatter' ? (
              <>
                <ToolbarBtn
                  active={formatterLayoutMode === 'single'}
                  title="单栏模式"
                  onClick={() => setFormatterLayoutMode('single')}
                >
                  <Square className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={formatterLayoutMode === 'split'}
                  title="双栏对照"
                  onClick={() => setFormatterLayoutMode('split')}
                >
                  <Columns2 className="h-4 w-4" />
                </ToolbarBtn>
              </>
            ) : (
              <>
                <ToolbarBtn
                  active={inspectorLayoutMode === 'tree'}
                  title="树视图"
                  onClick={() => setInspectorLayoutMode('tree')}
                >
                  <ListTree className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={inspectorLayoutMode === 'formatted'}
                  title="JSON 格式"
                  onClick={() => setInspectorLayoutMode('formatted')}
                >
                  <ListOrdered className="h-4 w-4" />
                </ToolbarBtn>
              </>
            )}
          </div>

          {/* 右：功能按钮 */}
          <div className="flex items-center justify-start gap-1.5 lg:justify-end">
            {activeTab === 'inspector' && (
              <ToolbarBtn
                active={false}
                title="清空并重新输入"
                onClick={() => inspectorClearRef.current?.()}
              >
                <Trash2 className="h-4 w-4" />
              </ToolbarBtn>
            )}

            {activeTab === 'formatter' && (
              <>
                <ToolbarBtn active={false} title="加载示例" onClick={() => formatterActionRef.current?.insertSample()}>
                  <FileCode2 className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn active={false} title="格式化" onClick={() => formatterActionRef.current?.formatJson()}>
                  <AlignLeft className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn active={false} title="压缩" onClick={() => formatterActionRef.current?.minifyJson()}>
                  <Minimize2 className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn active={false} title="校验" onClick={() => formatterActionRef.current?.validateJson()}>
                  <ShieldCheck className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={false}
                  title={formatterLayoutMode === 'single' ? '复制内容' : '复制输出'}
                  onClick={() => formatterActionRef.current?.copyContent()}
                >
                  <Copy className="h-4 w-4" />
                </ToolbarBtn>
              </>
            )}

            {activeTab === 'inspector' && (
              <label className="flex h-9 w-full max-w-[260px] items-center gap-2 rounded-xl border border-border/60 px-3 cursor-text">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={inspectorSearchText}
                  onChange={e => setInspectorSearchText(e.target.value)}
                  className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Search"
                />
              </label>
            )}
          </div>
        </div>

        {/* ── 工具内容区（noShell=true 让子组件不再重复渲染外壳）── */}
        <div>
          {activeTab === 'formatter' ? (
            <JsonFormatterTool
              messages={messages as any}
              sharedValue={sharedJson}
              onSharedValueChange={setSharedJson}
              layoutMode={formatterLayoutMode}
              onLayoutModeChange={setFormatterLayoutMode}
              hideToolbar
              noShell
              actionRef={formatterActionRef}
            />
          ) : (
            <JsonInspectorTool
              value={sharedJson}
              onChange={setSharedJson}
              layoutMode={inspectorLayoutMode}
              onLayoutModeChange={setInspectorLayoutMode}
              searchText={inspectorSearchText}
              onSearchTextChange={setInspectorSearchText}
              hideToolbar
              noShell
              onClearRef={inspectorClearRef}
            />
          )}
        </div>
      </div>
    </div>
  )
}
