'use client'

/**
 * 3D 场景：Canvas + 灯光 + 相机 + OrbitControls（拖拽旋转 / 松手 idle 自转）+ 点击挥手。
 * 主题色由 next-themes 的 resolvedTheme 决定；reduced-motion 由外层传入，关闭自转。
 *
 * 本文件只负责「渲染与交互」，不依赖具体造型——换 GLB 时只改 MascotModel.tsx。
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { MascotModel } from './MascotModel'

interface Props {
  reducedMotion: boolean
}

export default function Mascot({ reducedMotion }: Props) {
  const { resolvedTheme } = useTheme()
  const [waving, setWaving] = useState(false)
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const accent = resolvedTheme === 'dark' ? '#5eead4' : '#14b8a6'

  const triggerWave = () => {
    setWaving(true)
    if (waveTimer.current) clearTimeout(waveTimer.current)
    waveTimer.current = setTimeout(() => setWaving(false), 900)
  }

  useEffect(
    () => () => {
      if (waveTimer.current) clearTimeout(waveTimer.current)
    },
    [],
  )

  return (
    <Canvas
      camera={{ fov: 35, position: [0, 0, 5] }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={resolvedTheme === 'dark' ? 0.5 : 0.7} />
      <directionalLight position={[3, 5, 4]} intensity={resolvedTheme === 'dark' ? 1.0 : 1.3} />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} />

      <group
        onClick={(e) => {
          e.stopPropagation()
          triggerWave()
        }}
      >
        <MascotModel accent={accent} reducedMotion={reducedMotion} waving={waving} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={1.2}
        enableDamping
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.6}
        rotateSpeed={0.6}
      />
    </Canvas>
  )
}
