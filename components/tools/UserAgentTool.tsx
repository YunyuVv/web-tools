'use client'

/**
 * UserAgentTool — User Agent 解析器。
 * 自动读取当前浏览器 UA，解析出浏览器、版本、操作系统、设备类型与内核；
 * 支持手动粘贴任意 UA 字符串重新解析。
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
import { useI18n } from '@/components/layout/I18nProvider'

interface UaInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: string
  engine: string
}

/** 解析 UA 字符串（基于正则的轻量实现） */
function parseUA(ua: string): UaInfo {
  const info: UaInfo = {
    browser: 'unknown',
    browserVersion: '',
    os: 'unknown',
    osVersion: '',
    deviceType: 'desktop',
    engine: 'unknown',
  }

  // 操作系统
  if (/Windows NT 10/.test(ua)) { info.os = 'Windows'; info.osVersion = '10 / 11' }
  else if (/Windows NT 6\.3/.test(ua)) { info.os = 'Windows'; info.osVersion = '8.1' }
  else if (/Windows NT 6\.2/.test(ua)) { info.os = 'Windows'; info.osVersion = '8' }
  else if (/Windows NT 6\.1/.test(ua)) { info.os = 'Windows'; info.osVersion = '7' }
  else if (/Windows/.test(ua)) info.os = 'Windows'
  else if (/Mac OS X ([0-9_]+)/.test(ua)) { info.os = 'macOS'; info.osVersion = ua.match(/Mac OS X ([0-9_]+)/)![1].replace(/_/g, '.') }
  else if (/Android ([0-9.]+)/.test(ua)) { info.os = 'Android'; info.osVersion = ua.match(/Android ([0-9.]+)/)![1] }
  else if (/(iPhone|iPad|iPod)/.test(ua)) {
    info.os = 'iOS'
    const m = ua.match(/OS ([0-9_]+)/)
    if (m) info.osVersion = m[1].replace(/_/g, '.')
  }
  else if (/CrOS/.test(ua)) info.os = 'ChromeOS'
  else if (/Linux/.test(ua)) info.os = 'Linux'

  // 内核
  if (/Firefox/.test(ua)) info.engine = 'Gecko'
  else if (/AppleWebKit/.test(ua) && /Safari/.test(ua)) info.engine = 'WebKit'
  else if (/Trident\//.test(ua)) info.engine = 'Trident'
  else if (/Edg\/|Chrome\//.test(ua)) info.engine = 'Blink'

  // 浏览器
  if (/Edg\/([0-9.]+)/.test(ua)) { info.browser = 'Edge'; info.browserVersion = ua.match(/Edg\/([0-9.]+)/)![1] }
  else if (/OPR\/([0-9.]+)/.test(ua)) { info.browser = 'Opera'; info.browserVersion = ua.match(/OPR\/([0-9.]+)/)![1] }
  else if (/Firefox\/([0-9.]+)/.test(ua)) { info.browser = 'Firefox'; info.browserVersion = ua.match(/Firefox\/([0-9.]+)/)![1] }
  else if (/Chrome\/([0-9.]+)/.test(ua)) { info.browser = 'Chrome'; info.browserVersion = ua.match(/Chrome\/([0-9.]+)/)![1] }
  else if (/Safari\/([0-9.]+)/.test(ua)) {
    info.browser = 'Safari'
    const m = ua.match(/Version\/([0-9.]+)/)
    if (m) info.browserVersion = m[1]
  }
  else if (/Trident\//.test(ua)) info.browser = 'Internet Explorer'

  // 设备类型
  if (/iPad/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) info.deviceType = 'tablet'
  else if (/Mobile|Android|iPhone|iPod/.test(ua)) info.deviceType = 'mobile'
  else info.deviceType = 'desktop'

  return info
}

const FIELDS: { key: keyof UaInfo; i18nKey: string }[] = [
  { key: 'browser', i18nKey: 'tools.user-agent.field_browser' },
  { key: 'browserVersion', i18nKey: 'tools.user-agent.field_browser_version' },
  { key: 'os', i18nKey: 'tools.user-agent.field_os' },
  { key: 'osVersion', i18nKey: 'tools.user-agent.field_os_version' },
  { key: 'deviceType', i18nKey: 'tools.user-agent.field_device_type' },
  { key: 'engine', i18nKey: 'tools.user-agent.field_engine' },
]

export function UserAgentTool() {
  const { t } = useI18n()
  const [ua, setUa] = useState('')
  const [copied, setCopied] = useState(false)

  /** 把解析出的原始值翻译为面向用户的文案（品牌/OS/内核名保持英文） */
  const translateValue = (key: keyof UaInfo, val: string): string => {
    if (key === 'deviceType') {
      if (val === 'desktop') return t('tools.user-agent.device_desktop')
      if (val === 'tablet') return t('tools.user-agent.device_tablet')
      if (val === 'mobile') return t('tools.user-agent.device_mobile')
      return val
    }
    if (val === 'unknown') return t('tools.user-agent.unknown')
    return val
  }

  // 读取当前浏览器 UA
  useEffect(() => {
    if (typeof navigator !== 'undefined') setUa(navigator.userAgent)
  }, [])

  const info = useMemo(() => parseUA(ua), [ua])

  const handleCopy = useCallback(async () => {
    if (!ua) return
    try {
      await navigator.clipboard.writeText(ua)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* 静默失败 */
    }
  }, [ua])

  return (
    <div className="flex flex-col gap-5">
      {/* ── 顶部工具栏 ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">{t('tools.user-agent.title')}</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!ua}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>

      {/* ── UA 输入 ── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground">
          {t('tools.user-agent.input_label')}
        </div>
        <textarea
          value={ua}
          onChange={e => setUa(e.target.value)}
          placeholder={t('tools.user-agent.input_placeholder')}
          spellCheck={false}
          className="w-full resize-none border-0 bg-transparent px-5 py-4 font-mono text-sm leading-7 focus:outline-none placeholder:text-muted-foreground/60 min-h-[90px]"
        />
      </div>

      {/* ── 解析结果 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(f => (
          <div key={f.key} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
            <span className="text-sm text-muted-foreground">{t(f.i18nKey)}</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {translateValue(f.key, info[f.key]) || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
