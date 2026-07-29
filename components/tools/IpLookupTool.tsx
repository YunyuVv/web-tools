'use client'

/**
 * IpLookupTool — IP 地理信息查询工具。
 *
 * 纯浏览器端直连多个免费无密钥 API，按顺序容灾：
 *   1. ipinfo.io  （主，国内实测可达、响应快、支持 CORS）
 *   2. ipwho.is   （备，字段更全、支持指定 IP 查询）
 *   3. ipapi.co   （历史兜底，当前常被 Cloudflare 拦截，放最后）
 *
 * 任一源返回有效 IP 即采用，全部失败才提示用户。无服务端密钥依赖。
 */

import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, Search, AlertTriangle, Globe } from 'lucide-react'

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
  source?: string
}

// ── 多源容灾：顺序尝试，归一化到统一结构 ──
interface Provider {
  name: string
  /** 生成本机 / 指定 IP 的查询 URL */
  url: (ip?: string) => string
  /** 把各源的响应归一化为 IpInfo */
  normalize: (d: Record<string, unknown>) => Partial<IpInfo>
}

const PROVIDERS: Provider[] = [
  {
    name: 'ipinfo.io',
    url: ip => (ip ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json'),
    normalize: d => {
      const loc = typeof d.loc === 'string' ? (d.loc as string).split(',').map(Number) : []
      return {
        ip: d.ip as string,
        city: d.city as string | undefined,
        region: d.region as string | undefined,
        country_name: d.country as string | undefined,
        country_code: d.country as string | undefined,
        org: d.org as string | undefined,
        timezone: d.timezone as string | undefined,
        latitude: loc[0],
        longitude: loc[1],
      }
    },
  },
  {
    name: 'ipwho.is',
    url: ip => (ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/'),
    normalize: d => {
      const conn = (d.connection as Record<string, unknown>) || {}
      const tz = d.timezone
      return {
        ip: d.ip as string,
        city: d.city as string | undefined,
        region: d.region as string | undefined,
        country_name: d.country as string | undefined,
        country_code: d.country_code as string | undefined,
        org: (d.org as string) || (conn.isp as string) || (conn.org as string) || undefined,
        timezone: typeof tz === 'string' ? tz : ((tz as Record<string, unknown>)?.id as string | undefined),
        latitude: typeof d.latitude === 'number' ? d.latitude : undefined,
        longitude: typeof d.longitude === 'number' ? d.longitude : undefined,
      }
    },
  },
  {
    name: 'ipapi.co',
    url: ip => (ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'),
    normalize: d => ({
      ip: d.ip as string,
      city: d.city as string | undefined,
      region: d.region as string | undefined,
      country_name: d.country_name as string | undefined,
      country_code: d.country_code as string | undefined,
      org: d.org as string | undefined,
      timezone: d.timezone as string | undefined,
      latitude: d.latitude as number | undefined,
      longitude: d.longitude as number | undefined,
    }),
  },
]

export function IpLookupTool() {
  const [input, setInput] = useState('')
  const [info, setInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const lookup = useCallback(async (ip?: string) => {
    setLoading(true)
    setError(null)

    let lastReason = '网络请求失败'
    for (const p of PROVIDERS) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      try {
        const res = await fetch(p.url(ip), { signal: ctrl.signal })
        if (!res.ok) {
          lastReason = `服务返回 ${res.status}`
          continue
        }
        const data = (await res.json()) as Record<string, unknown>
        const normalized = p.normalize(data)
        if (!normalized.ip) {
          lastReason = '响应缺少 IP 字段'
          continue
        }
        setInfo({ ...(normalized as IpInfo), source: p.name })
        setLoading(false)
        return
      } catch (e) {
        lastReason = e instanceof DOMException && e.name === 'AbortError' ? '请求超时' : '网络请求失败'
        // 尝试下一个源
      } finally {
        clearTimeout(timer)
      }
    }

    setError(`所有 IP 查询服务暂不可用（${lastReason}），请稍后重试`)
    setInfo(null)
    setLoading(false)
  }, [])

  // 进入页面时查询本机 IP
  useEffect(() => {
    lookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = useCallback(() => lookup(input.trim() || undefined), [input, lookup])

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
          <div className="col-span-full text-xs text-muted-foreground/60">
            数据来源：{info.source}
          </div>
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
