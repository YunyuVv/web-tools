'use client'

/**
 * 隐私政策正文（客户端组件，走 useI18n 取三语文案）。
 * 两个隐私页（(en) 与 [locale]）共用本组件；文案由父布局的 I18nProvider 注入。
 * 内容覆盖 AdSense 合规要点：信息收集、广告（Google AdSense）、Cookie、用户选择、联系方式。
 */

import { useI18n } from '@/components/layout/I18nProvider'

export function PrivacyContent() {
  const { t } = useI18n()

  const sections: { title: string; body: string }[] = [
    { title: t('privacy.info_title'), body: t('privacy.info_body') },
    { title: t('privacy.ads_title'), body: t('privacy.ads_body') },
    { title: t('privacy.cookies_title'), body: t('privacy.cookies_body') },
    { title: t('privacy.choices_title'), body: t('privacy.choices_body') },
    { title: t('privacy.contact_title'), body: t('privacy.contact_body') },
  ]

  return (
    <div className="mx-auto w-full max-w-[800px] px-3 py-6">
      <h1 className="mb-2 text-2xl font-semibold">{t('privacy.title')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t('privacy.updated')}</p>
      <p className="mb-6 leading-relaxed">{t('privacy.intro')}</p>

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-medium">{s.title}</h2>
            <p className="text-sm leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        <a
          className="underline hover:text-foreground"
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('privacy.link_ads_settings')}
        </a>
        {' · '}
        <a
          className="underline hover:text-foreground"
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('privacy.link_about_ads')}
        </a>
      </p>
    </div>
  )
}
