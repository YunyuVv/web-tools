'use client'

/**
 * Md5Tool 组件：MD5 哈希工具。
 * 使用纯 TypeScript 实现的 MD5 算法（零依赖），实时计算输入文本的 MD5 值。
 * 支持大小写切换和一键复制，输入为空时显示占位符提示。
 *
 * MD5 算法实现参考 RFC 1321。
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Hash, Copy, Check } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

/* ─── 纯 TypeScript MD5 实现 ──────────────────────────────── */

/** MD5 每轮左旋转位数 */
const S: number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

/** MD5 常量 T[i] = floor(2^32 * |sin(i+1)|) */
const K: number[] = (() => {
  const k: number[] = []
  for (let i = 0; i < 64; i++) {
    k[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) >>> 0
  }
  return k
})()

/**
 * 32 位循环左移
 * @param x - 要移位的值
 * @param c - 移动位数
 * @returns 移位后的值
 */
function leftRotate(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0
}

/**
 * 计算单字节字符串的 MD5 哈希
 * @param input - 输入字符串
 * @returns 十六进制 MD5 哈希值（小写）
 */
function md5(input: string): string {
  // 1. 转换为 UTF-8 字节
  const bytes = new TextEncoder().encode(input)
  const len = bytes.length

  // 2. 填充消息：在末尾追加 0x80，然后补零直到长度 ≡ 448 (mod 512)
  const paddedLen = (((len + 8) >>> 6) + 1) << 6
  const padded = new Uint8Array(paddedLen)
  padded.set(bytes)
  padded[len] = 0x80

  // 3. 在最后 8 字节写入原始长度（bit，little-endian 64 位，但只支持 < 2^53）
  const bitsLen = len * 8
  // 低 32 位
  padded[paddedLen - 8] = bitsLen & 0xff
  padded[paddedLen - 7] = (bitsLen >>> 8) & 0xff
  padded[paddedLen - 6] = (bitsLen >>> 16) & 0xff
  padded[paddedLen - 5] = (bitsLen >>> 24) & 0xff
  // 高 32 位（对 JS 安全范围始终为 0）

  // 4. 初始化 A, B, C, D
  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  // 5. 逐 512-bit 块处理
  for (let i = 0; i < paddedLen; i += 64) {
    // 将 64 字节转换为 16 个 32-bit 小端字
    const M = new Array<number>(16)
    for (let j = 0; j < 16; j++) {
      const off = i + j * 4
      M[j] = (padded[off])
        | (padded[off + 1] << 8)
        | (padded[off + 2] << 16)
        | (padded[off + 3] << 24)
    }

    let A = a0, B = b0, C = c0, D = d0

    for (let j = 0; j < 64; j++) {
      let F: number, g: number
      if (j < 16) {
        F = (B & C) | (~B & D)
        g = j
      } else if (j < 32) {
        F = (D & B) | (~D & C)
        g = (5 * j + 1) % 16
      } else if (j < 48) {
        F = B ^ C ^ D
        g = (3 * j + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * j) % 16
      }

      const temp = D
      D = C
      C = B
      B = leftRotate((A + F + K[j] + M[g]) >>> 0, S[j]) + B >>> 0
      A = temp
    }

    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  // 6. 输出为十六进制字符串（little-endian）
  const toHex = (v: number): string => {
    const hex = v >>> 0
    const parts: string[] = []
    for (let i = 0; i < 4; i++) {
      const b = (hex >>> (i * 8)) & 0xff
      parts.push(b.toString(16).padStart(2, '0'))
    }
    return parts.join('')
  }

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0)
}

/* ─── 组件 ──────────────────────────────────────────────── */

export function Md5Tool() {
  const [input, setInput] = useState('')
  const [hash, setHash] = useState('')
  const [upperCase, setUpperCase] = useState(false)
  const [copying, setCopying] = useState(false)
  const mountedRef = useRef(true)

  const { t } = useI18n()

  /** 组件卸载保护 */
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  /** 实时计算 MD5（始终存小写，大小写仅在显示/复制时转换） */
  useEffect(() => {
    if (!input.trim()) {
      setHash('')
      return
    }
    try {
      const result = md5(input)
      if (mountedRef.current) {
        setHash(result)
      }
    } catch {
      if (mountedRef.current) setHash('')
    }
  }, [input])

  /** 大小写切换 */
  const toggleCase = useCallback(() => {
    setUpperCase(prev => !prev)
  }, [])

  /** 当前显示的哈希值 */
  const displayHash = useMemo(() => {
    if (!hash) return ''
    return upperCase ? hash.toUpperCase() : hash
  }, [hash, upperCase])

  /** 复制到剪贴板 */
  const handleCopy = useCallback(async () => {
    if (!hash) return
    const value = upperCase ? hash.toUpperCase() : hash
    try {
      await navigator.clipboard.writeText(value)
      setCopying(true)
      setTimeout(() => {
        if (mountedRef.current) setCopying(false)
      }, 1500)
    } catch {
      // 静默处理复制失败
    }
  }, [hash, upperCase])

  const hasValue = input.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* 输入区 */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            <span>{t('tools.md5.input_label')}</span>
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full resize-none border-0 bg-transparent px-4 py-3 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60"
          placeholder={t('tools.md5.input_placeholder')}
        />
      </div>

      {/* 结果展示区 */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5">
          <span className="text-xs text-muted-foreground font-medium">MD5</span>
          <div className="flex items-center gap-1.5">
            {/* 大小写切换 */}
            <button
              onClick={toggleCase}
              title={upperCase ? t('tools.md5.to_lowercase') : t('tools.md5.to_uppercase')}
              className="inline-flex items-center gap-1 rounded-xl border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
            >
              <span>{upperCase ? t('tools.md5.case_upper') : t('tools.md5.case_lower')}</span>
            </button>
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              disabled={!hasValue}
              title={hasValue ? t('tools.md5.copy_title') : t('tools.md5.copy_empty')}
              className={[
                'inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer',
                !hasValue ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
              ].join(' ')}
            >
              {copying ? (
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
        </div>

        {/* 哈希值内容 */}
        <div className="px-4 py-3 min-h-[4rem] flex items-center">
          {hasValue ? (
            <span className="font-mono text-sm break-all leading-relaxed text-foreground/85 select-all">
              {displayHash}
            </span>
          ) : (
            <span className="font-mono text-xs text-muted-foreground/40 italic">
              {t('tools.md5.waiting')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
