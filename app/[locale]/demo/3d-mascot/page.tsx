'use client'

/**
 * 3D 吉祥物 Demo（独立测试沙盒，不碰首页源码）
 * 路由：/zh-CN/demo/3d-mascot · /zh-TW/demo/3d-mascot
 *
 * 用途：在隔离页验证 3D 管线（R3F + 拖拽旋转 + idle 自转 + 点击挥手 + 主题换色 +
 * WebGL/reduced-motion 降级 + 静态导出构建）。当前模型为「程序化占位」，最终由
 * Blender 导出的 GLB 替换（见 docs/09 第十步）。
 */

import { MascotCanvas } from '@/components/three/MascotCanvas'
import { useI18n } from '@/components/layout/I18nProvider'

export default function MascotDemoPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('home.mascot.title')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('home.mascot.subtitle')}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10">
          <MascotCanvas />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary ring-1 ring-inset ring-primary/20">
            {t('home.mascot.hint')}
          </span>
          <span>{t('home.mascot.theme_note')}</span>
        </div>

        <p className="text-xs text-muted-foreground">{t('home.mascot.reduced_motion_note')}</p>
      </section>

      <footer className="border-t border-border/40 pt-4 text-xs text-muted-foreground">
        组件目录：
        <code className="font-mono"> components/three/MascotCanvas.tsx</code> ·{' '}
        <code className="font-mono">Mascot.tsx</code> ·{' '}
        <code className="font-mono">MascotModel.tsx</code>
        <br />
        说明：当前为「程序化占位模型」，仅用于验证 3D 管线与交互；最终造型由 Blender 导出的
        GLB 替换（详见 <code className="font-mono">docs/09-3D吉祥物设计.md</code> 第十步）。
      </footer>
    </div>
  )
}
