'use client'

/**
 * IpLookupTool — IP 地理信息查询工具。
 * 浏览器端调用免费无密钥 API（ipapi.co）查询本机或指定 IP 的地理位置信息；
 * 网络不可用时优雅降级给出提示。纯客户端实现，无需服务端密钥。
 */

import { useState, useCallback, useEffect } from 'react'
import { Globe, Copy, Check, Search, AlertTriangle } from 'lucide-react'

interface IpInfo {
  ip: string
  city?: string
  region?: string
  country_name?: string
  country_code?: string
  org?: string
  timezone?: string
  latitude?: number
  longitude?: number
}

export function IpLookupTool() {
  const [input, setInput] = useState('')
  const [info, setInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const lookup = useCallback(async (ip?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = ip && ip.trim() ? `https://ipapi.co/${ip.trim()}/json/` : 'https://ipapi.co/json/'
      const res = await fetch(url)
      if (!res.ok) throw new Error('bad status')
      const data = (await res.json()) as IpInfo & { error?: boolean; reason?: string }
      if (data.error) {
        setError(data.reason || '查询失败，请稍后重试')
        setInfo(null)
        return
      }
      setInfo(data)
    } catch {
      setError('网络请求失败，请检查网络连接或稍后重试')
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // 进入页面时查询本机 IP
  useEffect(() => {
    lookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = useCallback(() => lookup(input), [input, lookup])

  const handleCopy = useCallback(async () => {
    if (!info?.ip) return
    try {
      await navigator.clipboard.writeText(info.ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [info])

  const rows: { label: string; value?: string }[] = info
    ? [
        { label: 'IP 地址', value: info.ip },
        { label: '城市', value: info.city },
        { label: '地区', value: info.region },
        { label: '国家', value: info.country_name },
        { label: '组织 / 运营商', value: info.org },
        { label: '时区', value: info.timezone },
        info.latitude !== undefined && info.longitude !== undefined
          ? { label: '经纬度', value: `${info.latitude}, ${info.longitude}` }
          : { label: '经纬度', value: undefined },
      ]
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Globe className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-foreground">IP 查询</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => lookup()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer"
        >
          查询本机
        </button>
      </div>

      {/* ── 输入 ── */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-sm focus-within:border-primary/40">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="输入 IP 地址查询（留空查本机）"
            spellCheck={false}
            className="w-full border-0 bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? '查询中…' : '查询'}
        </button>
      </div>

      {/* ── 错误 ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 结果 ── */}
      {info && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
              <span className="text-sm text-muted-foreground">{r.label}</span>
              {r.label === 'IP 地址' ? (
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-foreground">{r.value || '—'}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center text-muted-foreground transition hover:text-foreground cursor-pointer"
                    title="复制"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </span>
              ) : (
                <span className="font-mono text-sm font-medium text-foreground">{r.value || '—'}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!info && !error && !loading && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground/50">
          <Globe className="h-8 w-8" />
          <span className="text-sm">正在查询本机 IP…</span>
        </div>
      )}
    </div>
  )
}
