'use client'

/**
 * Base64 编码/解码工具组件。
 * 提供左右双栏布局：左侧可编辑输入区，右侧只读输出区（含复制按钮）。
 * 顶部工具栏支持编码/解码模式切换（分段控制器）、输入/输出互换、示例、一键清空。
 * 输入内容变化时实时转换；解码模式下输入非法 Base64 时显示错误提示。
 */

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeftRight, Trash2, Copy, Check, Lock, Unlock, Binary, Sparkles } from 'lucide-react'

/** 工具运行模式：encode 表示编码，decode 表示解码 */
type Mode = 'encode' | 'decode'

/** 编码模式下的示例（明文） */
const SAMPLE_PLAIN = 'Hello, 世界！Base64 编码示例 🚀'

/** 解码模式下的示例（有效的 Base64 编码结果） */
const SAMPLE_B64 = 'SGVsbG8sIOS4lueVjO+8gUJhc2U2NCDnvJbnoIHnpLrkvosg8J+agA=='

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

// ─── 图标工具栏按钮 ─────────────────────────────────────────────────────────

interface IconBtnProps {
  /** 无障碍标签 / 提示文字 */
  label: string
  /** 点击回调 */
  onClick: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只在移动端显示（桌面端由浮动交换按钮接管） */
  className?: string
  children: React.ReactNode
}

function IconBtn({ label, onClick, disabled, className = '', children }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition',
        'hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95 cursor-pointer',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      ].join(' ')}
    >
      {children}
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

  // 输入内容的 UTF-8 字节数（用于统计展示）
  const inputBytes = input ? new TextEncoder().encode(input).length : 0
  const outputBytes = output && !error ? new TextEncoder().encode(output).length : 0

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

  /** 填入示例文本（根据当前模式选择对应内容） */
  const handleSample = useCallback(() => {
    setInput(mode === 'encode' ? SAMPLE_PLAIN : SAMPLE_B64)
    setOutput('')
    setError(null)
  }, [mode])

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
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* 顶部极淡主色光晕（随明暗主题自适应） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />

      {/* ── 顶部工具栏 ── */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        {/* 左：徽标 + 分段控制器 */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Binary className="h-5 w-5" strokeWidth={2.2} />
          </div>

          {/* 分段控制器：编码 / 解码 */}
          <div className="relative inline-flex rounded-xl border border-border/60 bg-muted/40 p-1">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-primary shadow-sm transition-transform duration-300 ease-out"
              style={{ transform: mode === 'encode' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              type="button"
              onClick={() => handleModeChange('encode')}
              className={[
                'relative z-10 w-[88px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'encode' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              编码
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('decode')}
              className={[
                'relative z-10 w-[88px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'decode' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              解码
            </button>
          </div>
        </div>

        {/* 右：示例 / 交换 / 清空 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSample}
            title="填入示例文本"
            aria-label="填入示例"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            示例
          </button>
          {/* 桌面端由中间浮动按钮接管，故此处仅移动端显示 */}
          <IconBtn label="将输出内容填入输入区并切换模式" onClick={handleSwap} disabled={!output} className="lg:hidden">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            交换
          </IconBtn>
          <IconBtn label="清空所有内容" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </IconBtn>
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
      <div className="relative grid grid-cols-1 divide-y divide-border/40 lg:grid-cols-2 lg:divide-y-0 lg:divide-x">

        {/* 左侧：输入区 */}
        <div className="flex min-h-[360px] flex-col">
          <div className="flex h-9 items-center justify-between border-b border-border/40 bg-muted/20 px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {mode === 'encode'
                ? <Unlock className="h-3 w-3" />
                : <Lock className="h-3 w-3" />
              }
              <span>{mode === 'encode' ? '原始文本' : 'Base64 字符串'}</span>
            </div>
            {/* 占位：与右侧「复制」按钮等宽，保持左右标题行对齐 */}
            <span className="invisible">复制</span>
          </div>
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
              'w-full flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/60 min-h-[316px]',
              error ? 'text-destructive/80' : '',
            ].join(' ')}
          />
        </div>

        {/* 右侧：输出区 */}
        <div
          className={[
            'flex min-h-[360px] flex-col transition-colors',
            error ? 'bg-destructive/[0.03] ring-1 ring-inset ring-destructive/30' : '',
          ].join(' ')}
        >
          <div className="flex h-9 items-center justify-between border-b border-border/40 bg-muted/20 px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {mode === 'encode'
                ? <Lock className="h-3 w-3" />
                : <Unlock className="h-3 w-3" />
              }
              <span>{mode === 'encode' ? 'Base64 结果' : '解码结果'}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              title="复制结果"
              aria-label="复制结果"
              className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {copied
                ? <Check className="h-3 w-3 text-green-500" />
                : <Copy className="h-3 w-3" />
              }
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={error ? '' : '转换结果将显示在此处…'}
            spellCheck={false}
            className="w-full flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/60 min-h-[316px] cursor-default select-all"
          />
        </div>

        {/* 桌面端中间浮动交换按钮 */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={!output}
          title="交换输入与输出"
          aria-label="交换输入与输出"
          className="absolute left-1/2 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition hover:border-primary/40 hover:text-primary active:scale-90 disabled:opacity-40 disabled:pointer-events-none lg:flex"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── 底部状态栏 ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium text-foreground/70">
            {mode === 'encode' ? '文本 → Base64' : 'Base64 → 文本'}
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {input && (
            <span>
              输入：<span className="font-mono text-foreground/70">{input.length}</span> 字符
              <span className="text-muted-foreground/50"> · {inputBytes} 字节</span>
            </span>
          )}
          {output && !error && (
            <span>
              输出：<span className="font-mono text-foreground/70">{output.length}</span> 字符
              <span className="text-muted-foreground/50"> · {outputBytes} 字节</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
