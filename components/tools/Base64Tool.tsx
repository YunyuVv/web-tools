'use client'

/**
 * Base64 编码/解码工具组件。
 * 提供左右双栏布局：左侧可编辑输入区，右侧只读输出区（含复制按钮）。
 * 顶部工具栏支持编码/解码模式切换（分段控制器）、输入/输出互换、示例、一键清空。
 * 输入内容变化时实时转换；解码模式下输入非法 Base64 时显示错误提示。
 */

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeftRight, Trash2, Copy, Check, Lock, Unlock, Sparkles } from 'lucide-react'
import { SlidingSegmented } from '@/components/ui/SlidingSegmented'
import { useI18n } from '@/components/layout/I18nProvider'

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

// ─── 主组件 ──────────────────────────────────────────────────────────────────

/**
 * Base64 编码/解码工具。
 * 左侧输入框实时将内容按当前模式（编码/解码）转换后展示在右侧只读区。
 * 解码模式下输入非法 Base64 时，右侧显示错误提示并以红色边框标注。
 */
export function Base64Tool() {
  const { t } = useI18n()
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
        setError(t('tools.base64.error_encode'))
      }
    } else {
      // 解码前过滤首尾空白，以减少误报
      const trimmed = input.trim()
      try {
        setOutput(decodeBase64(trimmed))
        setError(null)
      } catch {
        setOutput('')
        setError(t('tools.base64.error_invalid'))
      }
    }
  }, [input, mode])

  // 输入内容的 UTF-8 字节数（用于统计展示）
  const inputBytes = input ? new TextEncoder().encode(input).length : 0

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
    <div className="flex flex-col gap-6">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 模式切换：滑动玻璃分段控件 */}
        <SlidingSegmented
          ariaLabel={t('common.mode_aria')}
          value={mode}
          onChange={handleModeChange}
          options={[
            { value: 'encode', label: '编码' },
            { value: 'decode', label: '解码' },
          ]}
        />

        <div className="flex-1" />

        {/* 示例 */}
        <button
          type="button"
          onClick={handleSample}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t('common.sample')}
        </button>

        {/* 交换 */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={!output}
          title={t('common.swap_title')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight className="h-4 w-4" />
          {t('common.swap')}
        </button>

        {/* 清空 */}
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          {t('common.clear')}
        </button>
      </div>

      {/* ── 错误提示 ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <span className="shrink-0 font-medium">{t('common.error')}：</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── 双栏工作区 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* 左侧：输入区 */}
        <div className="group rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors focus-within:border-primary/40">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              {mode === 'encode' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {mode === 'encode' ? t('tools.base64.input_raw') : t('tools.base64.input_base64')}
            </span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums text-muted-foreground">
              {input.length} {t('tools.base64.chars')} · {inputBytes} {t('tools.base64.bytes')}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? t('tools.base64.encode_placeholder')
                : t('tools.base64.decode_placeholder')
            }
            spellCheck={false}
            className={[
              'w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[360px]',
              error ? 'text-destructive/80' : '',
            ].join(' ')}
          />
        </div>

        {/* 右侧：输出区 */}
        <div
          className={[
            'group rounded-2xl border bg-card overflow-hidden transition-colors focus-within:border-primary/40',
            error ? 'border-destructive/40 bg-destructive/[0.03]' : 'border-border/60',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              {mode === 'encode' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {mode === 'encode' ? t('tools.base64.output_base64') : t('tools.base64.output_decoded')}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              title={t('common.copy')}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copied ? t('common.copied') : t('common.copy')}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={error ? '' : t('tools.base64.output_placeholder')}
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[360px] cursor-default select-all"
          />
        </div>
      </div>
    </div>
  )
}
