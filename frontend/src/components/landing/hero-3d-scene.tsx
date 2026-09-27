"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Vec3 = [number, number, number];
const C = { ink: "#1c1c22", raised: "#282831", orange: "#ff6b35", purple: "#5b5fef", yellow: "#f7c948", text: "#f8f8f2" };

function roundedShape(width: number, height: number, radius: number) {
  const x = -width / 2, y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function RoundedSlab({ width, height, depth, radius = 0.14, color, position = [0, 0, 0], roughness = 0.52, metalness = 0.08 }: { width: number; height: number; depth: number; radius?: number; color: string; position?: Vec3; roughness?: number; metalness?: number }) {
  const geometry = useMemo(() => {
    const value = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: Math.min(radius * 0.34, 0.045), bevelThickness: 0.035, curveSegments: 8 });
    value.center();
    return value;
  }, [depth, height, radius, width]);
  return <mesh geometry={geometry} position={position} castShadow receiveShadow><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>;
}

function Label({ text, position, width = 1.5, height = 0.28, color = C.text, fontSize = 58, align = "left" }: { text: string; position: Vec3; width?: number; height?: number; color?: string; fontSize?: number; align?: "left" | "center" }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 192;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = "800 " + fontSize + "px Arial, sans-serif";
      ctx.textAlign = align; ctx.textBaseline = "middle";
      ctx.fillText(text, align === "center" ? canvas.width / 2 : 28, canvas.height / 2, canvas.width - 56);
    }
    const value = new THREE.CanvasTexture(canvas);
    value.colorSpace = THREE.SRGBColorSpace;
    value.anisotropy = 4;
    return value;
  }, [align, color, fontSize, text]);
  return <mesh position={position}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} /></mesh>;
}

function TrapToken3D({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    const enter = THREE.MathUtils.smootherstep(time, 0.62, 1.45);
    ref.current.scale.setScalar(enter * (1 + Math.sin(time * 1.8) * 0.018));
    ref.current.rotation.z = (1 - enter) * -0.7 + Math.sin(time * 0.72) * 0.035;
  });
  return (
    <group ref={ref} position={[1.43, 1.04, 0.3]} scale={reducedMotion ? 1 : 0} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.46, 0.46, 0.18, 48]} /><meshStandardMaterial color={C.orange} roughness={0.32} metalness={0.24} /></mesh>
      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.34, 40]} /><meshStandardMaterial color="#6b210b" roughness={0.46} /></mesh>
      <group rotation={[-Math.PI / 2, 0, 0]}><Label text="?" position={[0, 0, 0.112]} width={0.43} height={0.43} fontSize={128} align="center" color={C.yellow} /></group>
    </group>
  );
}

function QuestionBoard3D({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (reducedMotion) { ref.current.position.y = 0; ref.current.scale.setScalar(1); return; }
    const time = clock.getElapsedTime();
    const enter = THREE.MathUtils.smootherstep(time, 0, 1.35);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.76, 1, enter));
    ref.current.position.y = (1 - enter) * -0.62 + Math.sin(time * 0.72) * 0.035;
  });
  const answers = [["A", "HANGING GARDENS"], ["B", "GOLDEN TEMPLE"], ["C", "SUNKEN OBELISK"]];
  return (
    <group ref={ref}>
      <RoundedSlab width={3.55} height={2.5} depth={0.28} radius={0.22} color="#141419" roughness={0.38} metalness={0.18} />
      <RoundedSlab width={3.32} height={2.25} depth={0.08} radius={0.17} color={C.ink} position={[0, 0, 0.19]} roughness={0.62} />
      <RoundedSlab width={0.15} height={1.84} depth={0.08} radius={0.06} color={C.orange} position={[-1.43, -0.04, 0.26]} />
      <RoundedSlab width={1.03} height={0.28} depth={0.08} radius={0.08} color="#39262a" position={[-0.86, 0.86, 0.27]} />
      <Label text="QUESTION" position={[-0.86, 0.86, 0.32]} width={0.86} height={0.16} fontSize={72} align="center" color="#ffb59d" />
      <Label text="WHICH ANCIENT WONDER" position={[-0.03, 0.45, 0.325]} width={2.55} height={0.24} fontSize={58} align="center" />
      <Label text="WAS LOCATED IN BABYLON?" position={[-0.03, 0.16, 0.325]} width={2.55} height={0.24} fontSize={58} align="center" />
      {answers.map(([letter, answer], index) => {
        const y = -0.25 - index * 0.43, active = index === 1;
        return <group key={letter}>
          <RoundedSlab width={2.72} height={0.33} depth={0.06} radius={0.08} color={active ? "#302e68" : C.raised} position={[0.1, y, 0.27]} />
          <RoundedSlab width={0.32} height={0.28} depth={0.055} radius={0.07} color={active ? C.purple : "#3b3b44"} position={[-1.02, y, 0.32]} />
          <Label text={letter} position={[-1.02, y, 0.36]} width={0.17} height={0.15} fontSize={80} align="center" />
          <Label text={answer} position={[0.25, y, 0.36]} width={1.9} height={0.15} fontSize={54} />
        </group>;
      })}
      <TrapToken3D reducedMotion={reducedMotion} />
      {[-1, 1].flatMap((x) => [-1, 1].map((y) => <mesh key={x + "-" + y} position={[x * 1.55, y * 1.02, 0.27]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.035, 16]} /><meshStandardMaterial color={C.yellow} roughness={0.35} metalness={0.45} /></mesh>))}
    </group>
  );
}

function AnswerCard3D({ letter, answer, trap, position, rotation, delay, phase, reducedMotion }: { letter: string; answer: string; trap?: boolean; position: Vec3; rotation: Vec3; delay: number; phase: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (reducedMotion) { ref.current.position.set(...position); ref.current.rotation.set(...rotation); return; }
    const time = clock.getElapsedTime();
    const enter = THREE.MathUtils.smootherstep(time, delay, delay + 0.95);
    ref.current.position.set(position[0] * enter, position[1] - (1 - enter) * 0.8 + Math.sin(time * 0.68 + phase) * 0.035, position[2] - (1 - enter) * 0.5);
    ref.current.rotation.set(rotation[0] + Math.sin(time * 0.43 + phase) * 0.014, rotation[1], rotation[2] + (1 - enter) * 0.32 + Math.cos(time * 0.5 + phase) * 0.012);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.7, 1, enter));
  });
  return <group ref={ref} position={position} rotation={rotation}>
    <RoundedSlab width={1.72} height={0.68} depth={0.18} radius={0.13} color="#17171c" roughness={0.48} metalness={0.12} />
    <RoundedSlab width={0.42} height={0.48} depth={0.06} radius={0.09} color={trap ? C.orange : C.purple} position={[-0.57, 0, 0.13]} />
    <Label text={letter} position={[-0.57, 0.02, 0.175]} width={0.22} height={0.22} fontSize={92} align="center" color={trap ? "#571b08" : C.text} />
    <Label text={answer} position={[0.25, 0.04, 0.175]} width={0.95} height={0.16} fontSize={53} align="center" />
    {trap && <><RoundedSlab width={0.52} height={0.16} depth={0.04} radius={0.05} color="#5a2718" position={[0.34, -0.2, 0.15]} /><Label text="TRAP" position={[0.34, -0.2, 0.185]} width={0.36} height={0.09} fontSize={65} align="center" color="#ffb59d" /></>}
  </group>;
}

function TriviaTrapCore({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();
  const compact = size.width < 620;
  useFrame(({ clock, pointer }, delta) => {
    if (!ref.current || reducedMotion) return;
    const time = clock.getElapsedTime();
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, pointer.x * 0.085 + Math.sin(time * 0.2) * 0.018, 3.5, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -pointer.y * 0.055 - 0.025, 3.5, delta);
  });
  return <group ref={ref} scale={compact ? 0.9 : 1.12} rotation={[-0.025, -0.08, -0.025]}>
    <QuestionBoard3D reducedMotion={reducedMotion} />
    <AnswerCard3D letter="A" answer="GARDENS" position={[-1.45, -1.38, 0.65]} rotation={[-0.1, 0.22, 0.1]} delay={0.22} phase={0.4} reducedMotion={reducedMotion} />
    <AnswerCard3D letter="B" answer="TEMPLE" trap position={[1.6, 0.58, -0.72]} rotation={[0.06, -0.3, -0.09]} delay={0.42} phase={1.7} reducedMotion={reducedMotion} />
    {!compact && <AnswerCard3D letter="C" answer="OBELISK" position={[1.22, -1.34, -0.34]} rotation={[-0.08, -0.2, -0.13]} delay={0.58} phase={3.1} reducedMotion={reducedMotion} />}
  </group>;
}

export function Hero3DFallback() {
  return <div className="relative flex h-full min-h-[360px] items-center justify-center px-8" aria-hidden="true">
    <div className="absolute size-72 rounded-full bg-[#5b5fef]/15 blur-[70px]" />
    <div className="relative w-[min(88%,430px)] -rotate-2 rounded-[26px] border border-white/10 bg-[#141419] p-3 shadow-[0_35px_80px_#000a]">
      <div className="rounded-[19px] border border-white/10 bg-[#1c1c22] p-5">
        <div className="mb-4 flex items-center justify-between"><span className="rounded-md bg-[#39262a] px-3 py-1 text-[9px] font-black text-[#ffb59d]">QUESTION</span><span className="grid size-12 place-items-center rounded-full border-4 border-[#ff6b35] bg-[#6b210b] text-2xl font-black text-[#f7c948]">?</span></div>
        <p className="max-w-[280px] text-lg font-black leading-tight">WHICH ANCIENT WONDER WAS LOCATED IN BABYLON?</p>
        <div className="mt-5 space-y-2 text-xs font-bold"><div className="rounded-lg bg-[#292932] p-3"><b className="mr-3 text-[#c0c1ff]">A</b> HANGING GARDENS</div><div className="rounded-lg bg-[#302e68] p-3"><b className="mr-3 text-[#c0c1ff]">B</b> GOLDEN TEMPLE</div></div>
      </div>
      <span className="absolute -bottom-7 -left-7 rotate-6 rounded-xl border border-white/10 bg-[#18181d] px-4 py-3 text-xs font-black shadow-xl"><b className="mr-2 text-[#5b5fef]">C</b> OBELISK</span>
      <span className="absolute -right-6 bottom-5 -rotate-6 rounded-lg bg-[#ff6b35] px-3 py-2 text-[10px] font-black text-[#571b08] shadow-xl">TRAP</span>
    </div>
  </div>;
}

export default function Hero3DScene() {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(() => { try { const canvas = document.createElement("canvas"); return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")); } catch { return false; } });
  if (!webgl) return <Hero3DFallback />;
  return <div className="h-full min-h-[360px] w-full" aria-label="A floating three-dimensional Trivia Trap question board with answer tokens">
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.05, 5.75], fov: 39 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} shadows>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 5, 6]} intensity={3.1} color="#fff1e8" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3.5, 1.5, 3]} intensity={7} color={C.purple} distance={7} decay={2} />
      <pointLight position={[3.2, -0.2, 3]} intensity={6} color={C.orange} distance={6} decay={2} />
      <TriviaTrapCore reducedMotion={reducedMotion} />
    </Canvas>
  </div>;
}
