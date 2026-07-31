'use client'

/**
 * 占位程序化吉祥物（验证用，非最终造型）。
 * 用 three.js 基础几何体拼一个极简角色：圆角身体 + 大眼 + 两只手 + 天线。
 * 最终由 Blender 导出的 GLB 替换（见 docs/09 第十步），交互层不依赖此文件内部造型。
 *
 * 暴露的微动（与造型解耦，GLB 时代码可继续复用）：
 *  - 呼吸：整体轻微上下浮动（reduced-motion 时关闭）
 *  - 眨眼：眼睛组周期性压扁
 *  - 挥手：waving=true 时左手抬起到位并摆动
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group } from 'three'

interface Props {
  /** 身体主色（品牌青绿，深浅主题不同） */
  accent: string
  reducedMotion: boolean
  waving: boolean
}

export function MascotModel({ accent, reducedMotion, waving }: Props) {
  const root = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const leftHand = useRef<Group>(null)
  const blink = useRef(0)
  const nextBlink = useRef(2 + Math.random() * 2)
  const waveT = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // 呼吸浮动
    if (root.current && !reducedMotion) {
      root.current.position.y = Math.sin(t * 1.5) * 0.04
    }

    // 眨眼
    if (eyes.current && !reducedMotion) {
      blink.current -= delta
      nextBlink.current -= delta
      if (nextBlink.current <= 0) {
        blink.current = 0.12
        nextBlink.current = 2.5 + Math.random() * 2.5
      }
      const target = blink.current > 0 ? 0.12 : 1
      eyes.current.scale.y += (target - eyes.current.scale.y) * 0.5
    }

    // 挥手
    if (leftHand.current) {
      if (waving) waveT.current = Math.min(waveT.current + delta, 1)
      else waveT.current = Math.max(waveT.current - delta * 2, 0)
      const p = waveT.current
      const raise = Math.sin(p * Math.PI) // 0 → 1 → 0
      leftHand.current.rotation.z = -raise * 1.4
      leftHand.current.position.y = -0.1 + raise * 0.5
    }
  })

  return (
    <group ref={root}>
      {/* 身体 */}
      <RoundedBox args={[1.4, 1.6, 1.2]} radius={0.28} smoothness={4}>
        <meshStandardMaterial color={accent} roughness={0.45} metalness={0.05} />
      </RoundedBox>

      {/* 腹部高光 */}
      <mesh position={[0, -0.15, 0.61]}>
        <circleGeometry args={[0.45, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>

      {/* 眼睛（可整体压扁做眨眼） */}
      <group ref={eyes} position={[0, 0.35, 0.6]}>
        {[-0.32, 0.32].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <sphereGeometry args={[0.1, 20, 20]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 左手（挥手） */}
      <group ref={leftHand} position={[-0.85, -0.1, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>

      {/* 右手（固定） */}
      <group position={[0.85, -0.1, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>

      {/* 天线 */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 12]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
