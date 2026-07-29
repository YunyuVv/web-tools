'use client'

/**
 * LoremIpsumTool — 占位文本（Lorem Ipsum）生成器。
 * 支持按段落 / 单词 / 句子生成，可指定数量，并可选择以经典开头起始。
 */

import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

/** 词库 */
const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit',
  'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
  'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum',
]

/** 经典开头 */
const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

/** 无偏随机整数 [0, n) */
function randInt(n: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % n
}

/** 生成一句（句首大写、句尾句号） */
function makeSentence(): string {
  const len = randInt(15) + 5
  const parts: string[] = []
  for (let i = 0; i < len; i++) parts.push(WORDS[randInt(WORDS.length)])
  parts[0] = parts[0][0].toUpperCase() + parts[0].slice(1)
  return parts.join(' ') + '.'
}

/** 生成一段 */
function makeParagraph(): string {
  const n = randInt(4) + 4
  const arr: string[] = []
  for (let i = 0; i < n; i++) arr.push(makeSentence())
  return arr.join(' ')
}

type Unit = 'paragraphs' | 'words' | 'sentences'

/**
 * LoremIpsumTool — 主组件。
 * 顶部提供数量输入、单位切换、经典开头开关与重新生成；
 * 下方展示生成的占位文本并支持复制。
 */
export function LoremIpsumTool() {
  /** 数量 */
  const [count, setCount] = useState(3)
  /** 生成单位 */
  const [unit, setUnit] = useState<Unit>('paragraphs')
  /** 是否以经典开头起始 */
  const [classic, setClassic] = useState(true)
  /** 生成结果 */
  const [text, setText] = useState('')
  /** 复制反馈 */
  const [copied, setCopied] = useState(false)

  /** 生成文本 */
  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(100, count || 1))
    let result = ''
    if (unit === 'paragraphs') {
      const paras: string[] = []
      for (let i = 0; i < n; i++) paras.push(makeParagraph())
      if (classic && paras[0]) paras[0] = CLASSIC_OPENING + ' ' + paras[0][0].toLowerCase() + paras[0].slice(1)
      result = paras.join('\n\n')
    } else if (unit === 'sentences') {
      const arr: string[] = []
      if (classic) arr.push(CLASSIC_OPENING + '.')
      while (arr.length < n) arr.push(makeSentence())
      result = arr.join(' ')
    } else {
      const arr: string[] = []
      let i = 0
      if (classic) {
        CLASSIC_OPENING.split(' ').forEach(w => arr.push(w))
        i = arr.length
      }
      while (arr.length < n) arr.push(WORDS[randInt(WORDS.length)])
      result = arr.join(' ')
    }
    setText(result)
  }, [count, unit, classic])

  // 任意选项变化即重新生成
  useEffect(() => {
    generate()
  }, [generate])

  /** 复制 */
  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [text])

  const unitOptions: { value: Unit; label: string }[] = [
    { value: 'paragraphs', label: '段落' },
    { value: 'words', label: '单词' },
    { value: 'sentences', label: '句子' },
  ]

  // 重新生成（按钮）
  const handleRegenerate = useCallback(() => generate(), [generate])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">Lorem Ipsum 生成器</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleRegenerate}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          重新生成
        </button>
      </div>

      {/* ── 选项区 ── */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">数量</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={e => { const v = Number(e.target.value); setCount(v); }}
            className="w-24 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">单位</span>
          <div className="flex rounded-xl border border-border/60 bg-card p-1">
            {unitOptions.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setUnit(o.value)}
                className={`rounded-lg px-3 py-1.5 text-sm transition cursor-pointer ${
                  unit === o.value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={classic}
            onChange={() => setClassic(v => !v)}
            className="h-4 w-4 accent-primary cursor-pointer"
          />
          以经典开头起始
        </label>
      </div>

      {/* ── 结果区 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>占位文本</span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <textarea
          value={text}
          readOnly
          placeholder="生成的占位文本将显示在此处…"
          spellCheck={false}
          className="w-full resize-none border-0 bg-transparent px-5 py-4 text-sm leading-7 text-foreground focus:outline-none min-h-[280px] cursor-default select-all"
        />
      </div>
    </div>
  )
}
