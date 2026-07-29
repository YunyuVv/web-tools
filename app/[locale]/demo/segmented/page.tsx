'use client'

/**
 * 分段控件组件对比 Demo
 * 并排演示「白卡激活」(CardSegmented) 与「滑动玻璃」(SlidingSegmented) 两种风格。
 * 路由：/zh-CN/demo/segmented/
 */

import { useState } from 'react'
import { CardSegmented } from '@/components/ui/CardSegmented'
import {
  SlidingSegmented,
  type SegmentOption,
} from '@/components/ui/SlidingSegmented'

type Mode = 'encode' | 'decode'
const modeOptions: SegmentOption<Mode>[] = [
  { value: 'encode', label: '编码' },
  { value: 'decode', label: '解码' },
]

type Size = 'sm' | 'md' | 'lg'
// 故意用不同长度标签，演示滑动控件的滑块跨宽度对齐
const sizeOptions: SegmentOption<Size>[] = [
  { value: 'sm', label: '紧凑' },
  { value: 'md', label: '中等宽度' },
  { value: 'lg', label: '这是一个很长的选项' },
]

function DemoSection({
  title,
  badge,
  badgeTone,
  desc,
  control,
  value,
}: {
  title: string
  badge: string
  badgeTone: 'old' | 'new'
  desc: string
  control: React.ReactNode
  value: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span
          className={[
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            badgeTone === 'old'
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
          ].join(' ')}
        >
          {badge}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/20 py-6">
        {control}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>当前值</span>
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-foreground ring-1 ring-inset ring-border/50">
            {value}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SegmentedDemoPage() {
  const [cardMode, setCardMode] = useState<Mode>('encode')
  const [slideMode, setSlideMode] = useState<Mode>('encode')
  const [cardSize, setCardSize] = useState<Size>('md')
  const [slideSize, setSlideSize] = useState<Size>('md')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          分段控件组件对比 Demo
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          同一套 props 接口（<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">value / onChange / options</code>），
          两种视觉与交互风格。右侧滑块可<b className="font-medium text-foreground">按住鼠标拖动</b>，
          松手自动吸附到最近项；也可用键盘左右方向键切换。
        </p>
      </header>

      {/* 基础：两态示例（编码 / 解码） */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          基础 · 两态切换
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DemoSection
            title="白卡激活"
            badge="旧"
            badgeTone="old"
            desc="激活项直接变为白卡浮起，瞬时切换。点击即可，无滑动、无拖拽。"
            control={
              <CardSegmented
                ariaLabel="白卡激活 - 模式"
                value={cardMode}
                onChange={setCardMode}
                options={modeOptions}
              />
            }
            value={cardMode}
          />

          <DemoSection
            title="滑动玻璃"
            badge="新"
            badgeTone="new"
            desc="半透明玻璃滑块在激活项下方滑动；支持拖拽跟手与松手吸附。"
            control={
              <SlidingSegmented
                ariaLabel="滑动玻璃 - 模式"
                value={slideMode}
                onChange={setSlideMode}
                options={modeOptions}
              />
            }
            value={slideMode}
          />
        </div>
      </section>

      {/* 进阶：变宽标签（演示滑块跨宽度对齐） */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          进阶 · 不等宽标签
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DemoSection
            title="白卡激活"
            badge="旧"
            badgeTone="old"
            desc="白卡宽度随激活项宽度变化，仅做尺寸过渡（无位移）。"
            control={
              <CardSegmented
                ariaLabel="白卡激活 - 尺寸"
                value={cardSize}
                onChange={setCardSize}
                options={sizeOptions}
              />
            }
            value={cardSize}
          />

          <DemoSection
            title="滑动玻璃"
            badge="新"
            badgeTone="new"
            desc="滑块在长短不一的选项间平滑滑动，位移与宽度同时过渡。"
            control={
              <SlidingSegmented
                ariaLabel="滑动玻璃 - 尺寸"
                value={slideSize}
                onChange={setSlideSize}
                options={sizeOptions}
              />
            }
            value={slideSize}
          />
        </div>
      </section>

      <footer className="border-t border-border/40 pt-4 text-xs text-muted-foreground">
        组件目录：<code className="font-mono">components/ui/CardSegmented.tsx</code> ·{' '}
        <code className="font-mono">components/ui/SlidingSegmented.tsx</code>
      </footer>
    </div>
  )
}
