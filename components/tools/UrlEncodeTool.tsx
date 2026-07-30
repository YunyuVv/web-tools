'use client'

/**
 * URL 编码/解码工具组件。
 * 左右双栏布局：左侧输入区，右侧只读输出区（支持一键复制）。
 * 顶部工具栏提供 编码/解码 模式切换、清空和交换功能。
 * 实时转换，解码失败时展示错误提示。
 */

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeftRight, Copy, Trash2, Check } from 'lucide-react'
import { SlidingSegmented } from '@/components/ui/SlidingSegmented'
import { useI18n } from '@/components/layout/I18nProvider'

/** 转换模式：encode = 编码，decode = 解码 */
type Mode = 'encode' | 'decode'

/**
 * 对输入文本执行 URL 编码或解码，并返回结果与可能的错误信息。
 */
function convert(input: string, mode: Mode, t: (key: string) => string): { output: string; error: string | null } {
  if (!input) return { output: '', error: null }
  try {
    if (mode === 'encode') {
      return { output: encodeURIComponent(input), error: null }
    } else {
      return { output: decodeURIComponent(input), error: null }
    }
  } catch (e) {
    return {
      output: '',
      error: e instanceof Error ? e.message : t('tools.url-encode.error_decode'),
    }
  }
}

/**
 * URL 编码/解码工具主组件。
 * 提供实时双栏转换界面，支持编码与解码模式切换。
 */
export function UrlEncodeTool() {
  const { t } = useI18n()
  /** 当前模式：编码或解码 */
  const [mode, setMode] = useState<Mode>('encode')
  /** 左侧输入文本 */
  const [input, setInput] = useState('')
  /** 右侧输出文本 */
  const [output, setOutput] = useState('')
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null)
  /** 复制成功的临时状态 */
  const [copied, setCopied] = useState(false)

  /** 每当 input 或 mode 变化时实时转换 */
  useEffect(() => {
    const { output: result, error: err } = convert(input, mode, t)
    setOutput(result)
    setError(err)
  }, [input, mode])

  /** 切换模式 */
  const handleModeSwitch = useCallback((newMode: Mode) => {
    setMode(newMode)
  }, [])

  /** 清空输入 */
  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  /** 交换：将输出内容放入输入框并切换模式 */
  const handleSwap = useCallback(() => {
    if (!output) return
    const swappedMode: Mode = mode === 'encode' ? 'decode' : 'encode'
    setInput(output)
    setMode(swappedMode)
  }, [output, mode])

  /** 复制输出内容到剪贴板 */
  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 复制失败时静默处理
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
          onChange={handleModeSwitch}
          options={[
            { value: 'encode', label: t('common.encode') },
            { value: 'decode', label: t('common.decode') },
          ]}
        />

        <div className="flex-1" />

        {/* 交换按钮 */}
        <button
          onClick={handleSwap}
          disabled={!output}
          title={t('common.swap_title')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>{t('common.swap')}</span>
        </button>

        {/* 清空按钮 */}
        <button
          onClick={handleClear}
          disabled={!input}
          title={t('common.clear_title')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          <span>{t('common.clear')}</span>
        </button>
      </div>

      {/* ── 错误提示 ── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive font-mono">
          {error}
        </div>
      )}

      {/* ── 双栏工作区 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* 左侧：输入区 */}
        <div className="group rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors focus-within:border-primary/40">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="font-medium text-muted-foreground">
              {mode === 'encode' ? t('tools.url-encode.input_encode') : t('tools.url-encode.input_decode')}
            </span>
            <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono tabular-nums text-muted-foreground">
              {t('tools.url-encode.char_count').replace('{n}', String(input.length))}
            </span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? t('tools.url-encode.encode_placeholder')
                : t('tools.url-encode.decode_placeholder')
            }
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[360px]"
          />
        </div>

        {/* 右侧：输出区 */}
        <div className="group rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors focus-within:border-primary/40">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3 text-xs">
            <span className="font-medium text-muted-foreground">
              {mode === 'encode' ? t('tools.url-encode.output_encode') : t('tools.url-encode.output_decode')}
            </span>
            <button
              onClick={handleCopy}
              disabled={!output}
              title={t('common.copy')}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{t('common.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>{t('common.copy')}</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={error ? t('tools.url-encode.error_placeholder') : t('tools.url-encode.output_placeholder')}
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[360px] select-all"
          />
        </div>
      </div>
    </div>
  )
}
