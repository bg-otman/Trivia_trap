"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function AnswerCard({ position, rotation, accent, width = 2.25 }: { position: [number, number, number]; rotation: [number, number, number]; accent: string; width?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 1.18, 0.14]} />
        <meshStandardMaterial color="#1c1c22" roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[-width / 2 + 0.38, 0, 0.09]}>
        <boxGeometry args={[0.42, 0.42, 0.055]} />
        <meshStandardMaterial color={accent} roughness={0.32} />
      </mesh>
      <mesh position={[0.28, 0.17, 0.09]}>
        <boxGeometry args={[width * 0.47, 0.095, 0.04]} />
        <meshStandardMaterial color="#f8f8f2" />
      </mesh>
      <mesh position={[0.05, -0.15, 0.09]}>
        <boxGeometry args={[width * 0.3, 0.065, 0.04]} />
        <meshStandardMaterial color="#a6a6ae" />
      </mesh>
    </group>
  );
}

function TrapComposition({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }, delta) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.scale.setScalar(1);
      return;
    }
    const time = clock.getElapsedTime();
    const entrance = THREE.MathUtils.clamp(time / 1.35, 0, 1);
    const easedEntrance = 1 - Math.pow(1 - entrance, 4);
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.72, 1, easedEntrance));
    group.current.position.y = Math.sin(time * 0.5) * 0.08 + (1 - easedEntrance) * 0.65;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(time * 0.26) * 0.08 + pointer.x * 0.12, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -0.04 + pointer.y * 0.07, 4, delta);
    group.current.rotation.z = (1 - easedEntrance) * -0.12;
  });

  return (
    <group ref={group}>
      <AnswerCard position={[0, 0.25, 0.45]} rotation={[0.02, -0.05, -0.035]} accent="#ff6b35" width={2.55} />
      <AnswerCard position={[-1.25, -0.75, -0.4]} rotation={[-0.1, 0.34, -0.14]} accent="#5b5fef" />
      <AnswerCard position={[1.25, -0.68, -0.5]} rotation={[0.08, -0.34, 0.13]} accent="#f7c948" />
      <mesh position={[-0.9, 1.1, -0.25]} rotation={[0.35, 0.5, 0.35]} castShadow>
        <octahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#5b5fef" roughness={0.3} metalness={0.35} />
      </mesh>
      <mesh position={[1.38, 0.95, -0.15]} rotation={[0.3, 0.25, 0.2]} castShadow>
        <icosahedronGeometry args={[0.25]} />
        <meshStandardMaterial color="#ff6b35" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.1, -1.25, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.075, 12, 32]} />
        <meshStandardMaterial color="#f7c948" roughness={0.3} metalness={0.42} />
      </mesh>
      {[[-1.8, 0.35, -0.7], [1.85, 0.15, -0.8], [-0.25, 1.55, -0.9]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <sphereGeometry args={[0.035 + index * 0.012, 12, 12]} />
          <meshBasicMaterial color={index === 1 ? "#ff6b35" : "#c0c1ff"} />
        </mesh>
      ))}
    </group>
  );
}

export function Hero3DFallback() {
  return (
    <div className="relative flex h-full min-h-[360px] items-center justify-center" aria-hidden="true">
      <div className="absolute size-72 rounded-full bg-[#5b5fef]/15 blur-[70px]" />
      <div className="relative w-[min(82%,390px)] -rotate-3 rounded-2xl border border-[#494047] bg-[#1c1c22] p-5 shadow-[0_30px_70px_#0009]">
        <div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-xl bg-[#ff6b35] font-black text-[#5f1900]">?</span><div className="flex-1"><div className="h-3 rounded bg-white/80" /><div className="mt-3 h-2 w-2/3 rounded bg-white/20" /></div></div>
        <div className="mt-5 grid gap-2"><div className="h-11 rounded-lg bg-[#5b5fef]/35" /><div className="h-11 rounded-lg bg-[#f7c948]/25" /></div>
      </div>
    </div>
  );
}

export default function Hero3DScene() {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  });
  if (!webgl) return <Hero3DFallback />;
  return (
    <div className="h-full min-h-[360px] w-full" aria-label="Floating Trivia Trap question and answer cards">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.05, 5.2], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} shadows>
        <ambientLight intensity={1.7} />
        <directionalLight position={[4, 5, 5]} intensity={4} color="#fff2e7" castShadow />
        <pointLight position={[-3, 0, 3]} intensity={12} color="#5b5fef" distance={7} />
        <pointLight position={[3, 1, 2]} intensity={10} color="#ff6b35" distance={6} />
        <TrapComposition reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
