'use client'

/**
 * HtmlEntitiesTool — HTML 实体编码 / 解码工具。
 * 编码：将 & < > " ' 转义为命名实体；解码：利用 DOM 还原命名与数字实体。
 * 顶部用滑动分段控件切换编码 / 解码模式，左右双栏实时转换。
 */

import { useState, useCallback, useEffect } from 'react'
import { Code2, Copy, Check, Trash2, ArrowLeftRight, Sparkles } from 'lucide-react'
import { SlidingSegmented } from '@/components/ui/SlidingSegmented'

type Mode = 'encode' | 'decode'

/** 编码：转义特殊字符为命名实体 */
function encodeEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 解码：利用 textarea 还原实体（客户端安全） */
function decodeEntities(text: string): string {
  if (typeof document === 'undefined') return text
  const ta = document.createElement('textarea')
  ta.innerHTML = text
  return ta.value
}

export function HtmlEntitiesTool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }
    setOutput(mode === 'encode' ? encodeEntities(input) : decodeEntities(input))
  }, [input, mode])

  const SAMPLE_ENCODE = '<div class="box">Hello & "World" © 2024</div>'
  const SAMPLE_DECODE = '&lt;div&gt;Hello &amp; &quot;World&quot; &copy; 2024&lt;/div&gt;'

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m)
    setInput('')
    setOutput('')
  }, [])

  const handleSwap = useCallback(() => {
    if (!output) return
    setInput(output)
    setMode(prev => (prev === 'encode' ? 'decode' : 'encode'))
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  const handleSample = useCallback(() => {
    setInput(mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE)
  }, [mode])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [output])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Code2 className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <SlidingSegmented
          ariaLabel="编码或解码模式"
          value={mode}
          onChange={handleModeChange}
          options={[
            { value: 'encode', label: '编码' },
            { value: 'decode', label: '解码' },
          ]}
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSample}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          示例
        </button>
        <button
          type="button"
          onClick={handleSwap}
          disabled={!output}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight className="h-4 w-4" />
          交换
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          清空
        </button>
      </div>

      {/* ── 双栏 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">{mode === 'encode' ? '原始文本' : 'HTML 实体'}</span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '在此输入要编码的文本…' : '在此粘贴 HTML 实体进行解码…'}
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[340px]"
          />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">{mode === 'encode' ? 'HTML 实体' : '解码结果'}</span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在此处…"
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[340px] cursor-default select-all"
          />
        </div>
      </div>
    </div>
  )
}
