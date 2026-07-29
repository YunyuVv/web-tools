'use client'

/**
 * MarkdownPreviewTool — Markdown 实时预览工具。
 * 左侧编辑 Markdown，右侧实时渲染（使用内置的安全渲染器，已做 HTML 转义与链接白名单，防 XSS）。
 */

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

const SAMPLE = `# 标题示例

支持 **加粗**、*斜体*、\`行内代码\` 与 [链接](https://example.com)。

## 列表

- 第一项
- 第二项
  - 嵌套项

1. 有序一
2. 有序二

> 这是一段引用文字。

\`\`\`
code block
const a = 1
\`\`\`

---

结束。`

/** HTML 转义（防 XSS） */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** 仅允许安全协议的链接 */
function sanitizeUrl(url: string): string | null {
  const u = url.trim()
  if (/^(https?:|mailto:)/i.test(u)) return u
  if (/^\//.test(u)) return u
  return null
}

/** 行内样式解析 */
function inline(text: string): string {
  let t = text
  t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  t = t.replace(/_([^_]+)_/g, '<em>$1</em>')
  t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
    const safe = sanitizeUrl(url)
    return safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${txt}</a>` : txt
  })
  return t
}

/** 块级 Markdown → 安全 HTML */
function mdToHtml(src: string): string {
  const lines = escapeHtml(src).split('\n')
  const out: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let listBuf: string[] = []
  let quoteBuf: string[] = []
  let codeBuf: string[] | null = null

  const flushList = () => {
    if (listType) {
      out.push(`<${listType}>${listBuf.join('')}</${listType}>`)
      listType = null
      listBuf = []
    }
  }
  const flushQuote = () => {
    if (quoteBuf.length) {
      out.push(`<blockquote>${quoteBuf.map(q => inline(q)).join('<br/>')}</blockquote>`)
      quoteBuf = []
    }
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line)) {
      flushList()
      flushQuote()
      if (codeBuf === null) {
        codeBuf = []
      } else {
        out.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`)
        codeBuf = null
      }
      i++
      continue
    }
    if (codeBuf !== null) {
      codeBuf.push(line)
      i++
      continue
    }
    if (line.trim() === '') {
      flushList()
      flushQuote()
      i++
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushList()
      flushQuote()
      const lvl = h[1].length
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`)
      i++
      continue
    }
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushList()
      flushQuote()
      out.push('<hr/>')
      i++
      continue
    }
    if (/^>\s?/.test(line)) {
      flushList()
      quoteBuf.push(line.replace(/^>\s?/, ''))
      i++
      continue
    } else {
      flushQuote()
    }

    const ul = line.match(/^[-*]\s+(.*)$/)
    if (ul) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listBuf.push(`<li>${inline(ul[1])}</li>`)
      i++
      continue
    }
    const ol = line.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listBuf.push(`<li>${inline(ol[1])}</li>`)
      i++
      continue
    }

    // 段落：合并连续普通行
    flushList()
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^(\*\*\*|---|___)$/.test(lines[i].trim())
    ) {
      para.push(lines[i])
      i++
    }
    out.push(`<p>${inline(para.join(' '))}</p>`)
  }
  if (codeBuf !== null) out.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`)
  flushList()
  flushQuote()
  return out.join('\n')
}

export function MarkdownPreviewTool() {
  const [text, setText] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  const html = useMemo(() => mdToHtml(text), [text])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [text])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">Markdown 预览</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* ── 双栏 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
            Markdown
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="在此输入 Markdown…"
            spellCheck={false}
            className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[420px]"
          />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
            预览
          </div>
          <div
            className="md-preview min-h-[420px] px-5 py-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
