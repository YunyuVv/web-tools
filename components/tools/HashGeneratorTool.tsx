'use client'

/**
 * HashGeneratorTool 组件：哈希生成工具。
 * 支持实时计算输入文本的 SHA-1、SHA-256、SHA-512 哈希值。
 * 使用 Web Crypto API（window.crypto.subtle）进行哈希计算，无需任何外部依赖。
 * 提供每种哈希算法对应的一键复制按钮，输入为空时显示占位符提示。
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Hash, Copy, Check, AlertCircle } from 'lucide-react'

/** 哈希算法类型 */
type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

/** 单条哈希结果的数据结构 */
interface HashResult {
  algorithm: HashAlgorithm
  label: string
  value: string
  copying: boolean
}

/**
 * 将 ArrayBuffer 转换为十六进制字符串
 * @param buffer - 原始字节数据
 * @returns 十六进制字符串
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 使用 Web Crypto API 计算文本的哈希值
 * @param text - 待哈希的文本
 * @param algorithm - 哈希算法名称
 * @returns 哈希十六进制字符串
 */
async function computeHash(text: string, algorithm: HashAlgorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data)
  return bufferToHex(hashBuffer)
}

/** 默认哈希结果列表（用于初始化状态） */
const INITIAL_RESULTS: HashResult[] = [
  { algorithm: 'SHA-1',   label: 'SHA-1',   value: '', copying: false },
  { algorithm: 'SHA-256', label: 'SHA-256', value: '', copying: false },
  { algorithm: 'SHA-512', label: 'SHA-512', value: '', copying: false },
]

/**
 * HashGeneratorTool：哈希值生成工具主组件。
 * 包含顶部文本输入区和下方三种哈希值展示区，每种哈希有独立的复制按钮。
 */
export function HashGeneratorTool() {
  /** 用户输入的文本 */
  const [input, setInput] = useState('')
  /** 三种哈希算法的计算结果 */
  const [results, setResults] = useState<HashResult[]>(INITIAL_RESULTS)
  /** 是否正在计算中 */
  const [computing, setComputing] = useState(false)
  /** 是否出现计算错误 */
  const [error, setError] = useState(false)
  /** 防止组件卸载后更新状态的 ref */
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /** 监听输入变化，实时计算哈希值 */
  useEffect(() => {
    if (!input.trim()) {
      setResults(INITIAL_RESULTS.map(r => ({ ...r, value: '', copying: false })))
      setError(false)
      setComputing(false)
      return
    }

    setComputing(true)
    setError(false)

    const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-512']

    Promise.all(algorithms.map(algo => computeHash(input, algo)))
      .then(hashes => {
        if (!mountedRef.current) return
        setResults(prev =>
          prev.map((r, i) => ({ ...r, value: hashes[i], copying: false }))
        )
        setComputing(false)
      })
      .catch(() => {
        if (!mountedRef.current) return
        setError(true)
        setComputing(false)
      })
  }, [input])

  /**
   * 复制指定算法的哈希值到剪贴板
   * @param algorithm - 要复制的哈希算法
   */
  const handleCopy = useCallback(async (algorithm: HashAlgorithm) => {
    const result = results.find(r => r.algorithm === algorithm)
    if (!result?.value) return

    try {
      await navigator.clipboard.writeText(result.value)
      setResults(prev =>
        prev.map(r => ({ ...r, copying: r.algorithm === algorithm }))
      )
      setTimeout(() => {
        if (!mountedRef.current) return
        setResults(prev =>
          prev.map(r => ({ ...r, copying: false }))
        )
      }, 1500)
    } catch {
      // 复制失败时静默处理
    }
  }, [results])

  return (
    <div className="flex flex-col gap-4">
      {/* 顶部输入区 */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            <span>输入文本</span>
          </div>
          {computing && (
            <span className="text-primary/70 animate-pulse">计算中…</span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              计算失败
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={5}
          spellCheck={false}
          className="w-full resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60"
          placeholder="在此输入或粘贴文本，将自动计算各哈希值…"
        />
      </div>

      {/* 哈希结果展示区 */}
      <div className="flex flex-col gap-3">
        {results.map(result => (
          <HashRow
            key={result.algorithm}
            result={result}
            empty={!input.trim()}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  )
}

/** HashRow 子组件的 Props */
interface HashRowProps {
  result: HashResult
  empty: boolean
  onCopy: (algorithm: HashAlgorithm) => void
}

/**
 * HashRow：单条哈希结果展示行组件。
 * 展示算法名称、哈希值（或占位符），以及复制按钮。
 */
function HashRow({ result, empty, onCopy }: HashRowProps) {
  const hasValue = !empty && result.value

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* 行头 */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-semibold font-mono text-foreground/70">{result.label}</span>
        <button
          onClick={() => onCopy(result.algorithm)}
          disabled={!hasValue}
          title={hasValue ? `复制 ${result.label} 哈希值` : '暂无内容可复制'}
          className={[
            'inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer',
            !hasValue ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          ].join(' ')}
        >
          {result.copying ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-500">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 哈希值内容区 */}
      <div className="px-4 py-3 min-h-[3rem] flex items-center">
        {hasValue ? (
          <span className="font-mono text-xs break-all leading-relaxed text-foreground/85 select-all">
            {result.value}
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground/40 italic">
            {empty ? '等待输入…' : '计算中…'}
          </span>
        )}
      </div>
    </div>
  )
}
