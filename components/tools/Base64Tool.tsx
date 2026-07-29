'use client'

/**
 * Base64 编码/解码工具组件。
 * 提供左右双栏布局：左侧可编辑输入区，右侧只读输出区（含复制按钮）。
 * 顶部工具栏支持编码/解码模式切换、左右内容互换、一键清空。
 * 输入内容变化时实时转换；解码模式下输入非法 Base64 时显示错误提示。
 */

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeftRight, Trash2, Copy, Check, Lock, Unlock } from 'lucide-react'

/** 工具运行模式：encode 表示编码，decode 表示解码 */
type Mode = 'encode' | 'decode'

// ─── Base64 工具函数 ─────────────────────────────────────────────────────────

/**
 * 将普通字符串编码为 Base64（支持 Unicode）。
 * 使用 TextEncoder 将字符串转换为 UTF-8 字节序列，再进行 Base64 编码。
 */
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binStr)
}

/**
 * 将 Base64 字符串解码为普通字符串（支持 Unicode）。
 * 解码失败时抛出错误。
 */
function decodeBase64(b64: string): string {
  // atob 只接受合法 Base64，否则抛出 DOMException
  const binStr = atob(b64)
  const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// ─── 子组件 ──────────────────────────────────────────────────────────────────

interface ModeBtnProps {
  /** 按钮显示文字 */
  label: string
  /** 是否为当前激活态 */
  active: boolean
  /** 点击回调 */
  onClick: () => void
}

/**
 * 模式切换按钮：激活态显示主色背景，非激活态显示次要样式。
 */
function ModeBtn({ label, active, onClick }: ModeBtnProps) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer'
          : 'inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer'
      }
    >
      {label}
    </button>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

/**
 * Base64 编码/解码工具。
 * 左侧输入框实时将内容按当前模式（编码/解码）转换后展示在右侧只读区。
 * 解码模式下输入非法 Base64 时，右侧显示错误提示并以红色边框标注。
 */
export function Base64Tool() {
  /** 当前工具模式：编码或解码 */
  const [mode, setMode] = useState<Mode>('encode')
  /** 左侧输入内容 */
  const [input, setInput] = useState('')
  /** 右侧转换结果 */
  const [output, setOutput] = useState('')
  /** 解码失败时的错误信息 */
  const [error, setError] = useState<string | null>(null)
  /** 复制成功的短暂反馈标志 */
  const [copied, setCopied] = useState(false)

  // ── 实时转换：input 或 mode 变化时重新计算 ──
  useEffect(() => {
    if (!input) {
      setOutput('')
      setError(null)
      return
    }

    if (mode === 'encode') {
      try {
        setOutput(encodeBase64(input))
        setError(null)
      } catch {
        setOutput('')
        setError('编码失败，请检查输入内容')
      }
    } else {
      // 解码前过滤首尾空白，以减少误报
      const trimmed = input.trim()
      try {
        setOutput(decodeBase64(trimmed))
        setError(null)
      } catch {
        setOutput('')
        setError('无效的 Base64 字符串，请检查输入格式')
      }
    }
  }, [input, mode])

  /** 切换模式并重置内容 */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  /** 将输出内容与输入内容互换，并切换到反向模式 */
  const handleSwap = useCallback(() => {
    if (!output) return
    setInput(output)
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'))
    setError(null)
  }, [output])

  /** 清空输入与输出 */
  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  /** 复制输出内容到剪贴板，并短暂显示已复制状态 */
  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 静默失败，不做任何处理
    }
  }, [output])

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">

      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 gap-3 flex-wrap">
        {/* 左侧：模式切换 */}
        <div className="flex items-center gap-2">
          <ModeBtn
            label="编码"
            active={mode === 'encode'}
            onClick={() => handleModeChange('encode')}
          />
          <ModeBtn
            label="解码"
            active={mode === 'decode'}
            onClick={() => handleModeChange('decode')}
          />
        </div>

        {/* 右侧：交换 + 清空 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwap}
            title="将输出内容填入输入区并切换模式"
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            交换
          </button>
          <button
            onClick={handleClear}
            title="清空所有内容"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        </div>
      </div>

      {/* ── 错误提示栏 ── */}
      {error && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <span className="shrink-0 font-medium">错误：</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── 双栏工作区 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40">

        {/* 左侧：输入区 */}
        <div className="flex flex-col min-h-[360px]">
          {/* 面板标题 */}
          <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
            {mode === 'encode'
              ? <Unlock className="h-3 w-3" />
              : <Lock className="h-3 w-3" />
            }
            <span>{mode === 'encode' ? '原始文本' : 'Base64 字符串'}</span>
          </div>
          {/* 输入框 */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '在此输入要编码的文本…'
                : '在此粘贴 Base64 字符串进行解码…'
            }
            spellCheck={false}
            className={[
              'w-full flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60 min-h-[316px]',
              error ? 'text-destructive/80' : '',
            ].join(' ')}
          />
        </div>

        {/* 右侧：输出区 */}
        <div className="flex flex-col min-h-[360px]">
          {/* 面板标题 + 复制按钮 */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {mode === 'encode'
                ? <Lock className="h-3 w-3" />
                : <Unlock className="h-3 w-3" />
              }
              <span>{mode === 'encode' ? 'Base64 结果' : '解码结果'}</span>
            </div>
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              disabled={!output}
              title="复制结果"
              className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied
                ? <Check className="h-3 w-3 text-green-500" />
                : <Copy className="h-3 w-3" />
              }
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          {/* 只读输出 */}
          <textarea
            value={output}
            readOnly
            placeholder={error ? '' : '转换结果将显示在此处…'}
            spellCheck={false}
            className="w-full flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60 min-h-[316px] cursor-default select-all"
          />
        </div>
      </div>

      {/* ── 底部状态栏 ── */}
      <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <span>
          模式：
          <span className="font-medium text-foreground/70 ml-1">
            {mode === 'encode' ? '文本 → Base64' : 'Base64 → 文本'}
          </span>
        </span>
        <div className="flex items-center gap-4">
          {input && (
            <span>
              输入：
              <span className="font-mono ml-1">{input.length}</span>
              {' '}字符
            </span>
          )}
          {output && !error && (
            <span>
              输出：
              <span className="font-mono ml-1">{output.length}</span>
              {' '}字符
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
