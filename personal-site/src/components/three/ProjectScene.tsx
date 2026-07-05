"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Points, Line, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Color palette ───────────────────────────────────────────────
const TEAL = "#49c5b6";
const CORAL = "#ff9398";
const PURPLE = "#8b5cf6";

// ─── Types ────────────────────────────────────────────────────────
interface ProjectSceneProps {
  activeScene: string | null;
  visible: boolean;
}

interface SceneSlot {
  id: string;
  slotKey: number;
  fadingOut: boolean;
}

// ─── Shared mouse hook helper ─────────────────────────────────────
function useMouseOffset() {
  const { viewport } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));

  useFrame(({ pointer }) => {
    mouse.current.set(
      pointer.x * viewport.width * 0.3,
      pointer.y * viewport.height * 0.3
    );
  });

  return mouse;
}

// ─── Helper: set opacity on all traversable children ───────────────
function setGroupOpacity(group: THREE.Group, opacity: number) {
  group.traverse((child) => {
    if (child instanceof THREE.Points) {
      const mat = child.material as THREE.PointsMaterial;
      mat.transparent = true;
      mat.opacity = opacity;
    } else if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.Material;
      if ("opacity" in mat) {
        mat.transparent = true;
        (mat as THREE.MeshStandardMaterial).opacity = opacity;
      }
    } else if (child instanceof THREE.Line) {
      const mat = child.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = opacity;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Scene 1: Particles (Lang Drill Agent) — dense upward-flowing particles
// ═══════════════════════════════════════════════════════════════════
function ParticlesScene() {
  const ref = useRef<THREE.Points>(null);
  const mouse = useMouseOffset();

  const count = 800;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vel[i] = 0.3 + Math.random() * 0.8;
    }
    return [pos, vel] as const;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += velocities[i] * delta;
      if (arr[i * 3 + 1] > 4) {
        arr[i * 3 + 1] = -4;
        arr[i * 3] = (Math.random() - 0.5) * 8;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      arr[i * 3] += mouse.current.x * delta * 0.1;
      arr[i * 3 + 2] += mouse.current.y * delta * 0.05;
    }
    posAttr.needsUpdate = true;

    ref.current.rotation.y +=
      (mouse.current.x * 0.05 - ref.current.rotation.y) * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <pointsMaterial
        size={0.04}
        color={TEAL}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene 2: Grid (AI Gomoku) — flat glowing grid plane
// ═══════════════════════════════════════════════════════════════════
function GridScene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseOffset();
  const gridSize = 10;
  const divisions = 12;

  const lines = useMemo(() => {
    const result: [THREE.Vector3[], number][] = [];
    const half = gridSize / 2;
    const step = gridSize / divisions;
    const segs = divisions * 4;

    for (let i = 0; i <= divisions; i++) {
      const y = -half + i * step;
      const hPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= segs; j++) {
        hPoints.push(new THREE.Vector3(-half + (j / segs) * gridSize, y, 0));
      }
      result.push([hPoints, 0.4]);

      const x = -half + i * step;
      const vPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= segs; j++) {
        vPoints.push(new THREE.Vector3(x, -half + (j / segs) * gridSize, 0));
      }
      result.push([vPoints, 0.4]);
    }

    return result;
  }, []);

  const dots = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    const half = gridSize / 2;
    const step = gridSize / divisions;
    for (let r = 0; r <= divisions; r++) {
      for (let c = 0; c <= divisions; c++) {
        result.push({ x: -half + c * step, y: -half + r * step });
      }
    }
    return result;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = mouse.current.y * 0.15;
    groupRef.current.rotation.y = -mouse.current.x * 0.15;

    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 0.8) * 0.02;
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {lines.map(([points, opacity], i) => (
        <Line
          key={i}
          points={points}
          color={i % 2 === 0 ? TEAL : PURPLE}
          lineWidth={1}
          transparent
          opacity={opacity}
        />
      ))}
      {dots.map((dot, idx) => (
        <mesh key={`dot-${idx}`} position={[dot.x, dot.y, 0.01]}>
          <circleGeometry args={[0.03, 8]} />
          <meshBasicMaterial color={CORAL} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene 3: Flow (Auto Mahjong) — torus knot with distort material
// ═══════════════════════════════════════════════════════════════════
function FlowScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useMouseOffset();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.position.x +=
      (mouse.current.x * 0.5 - meshRef.current.position.x) * 0.03;
    meshRef.current.position.y +=
      (mouse.current.y * 0.3 - meshRef.current.position.y) * 0.03;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
      <MeshDistortMaterial
        color={PURPLE}
        speed={2}
        distort={0.4}
        radius={1}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene 4: Pulse (Delta Force Diagnostics) — analytical main-line chart
// ═══════════════════════════════════════════════════════════════════
function PulseScene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseOffset();

  const chart = useMemo(() => {
    const linePoints: THREE.Vector3[] = [];
    const upperBand: THREE.Vector3[] = [];
    const lowerBand: THREE.Vector3[] = [];
    const count = 34;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = -4.6 + t * 9.2;
      const y =
        Math.sin(t * Math.PI * 2.2) * 0.55 +
        Math.cos(t * Math.PI * 5.4) * 0.16 +
        (t - 0.45) * 1.2;

      linePoints.push(new THREE.Vector3(x, y, 0));
      upperBand.push(new THREE.Vector3(x, y + 0.48, -0.04));
      lowerBand.push(new THREE.Vector3(x, y - 0.48, -0.04));
    }

    return {
      linePoints,
      upperBand,
      lowerBand,
      xAxis: [new THREE.Vector3(-5, -2.1, 0), new THREE.Vector3(5, -2.1, 0)],
      yAxis: [new THREE.Vector3(-5, -2.1, 0), new THREE.Vector3(-5, 2.2, 0)],
      trend: [linePoints[2], linePoints[linePoints.length - 3]],
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y +=
      (mouse.current.x * 0.05 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x +=
      (-mouse.current.y * 0.04 - groupRef.current.rotation.x) * 0.03;
    groupRef.current.position.y = Math.sin(t * 0.75) * 0.08 - 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.4]} rotation={[-0.12, 0, 0]}>
      <Line points={chart.xAxis} color="#ffffff" lineWidth={1} transparent opacity={0.18} />
      <Line points={chart.yAxis} color="#ffffff" lineWidth={1} transparent opacity={0.18} />
      <Line points={chart.upperBand} color={PURPLE} lineWidth={1} transparent opacity={0.24} />
      <Line points={chart.lowerBand} color={PURPLE} lineWidth={1} transparent opacity={0.18} />
      <Line points={chart.trend} color={CORAL} lineWidth={2} transparent opacity={0.55} />
      <Line points={chart.linePoints} color={TEAL} lineWidth={3} transparent opacity={0.92} />

      {chart.linePoints.map((point, index) => (
        <mesh key={index} position={point}>
          <circleGeometry args={[index % 5 === 0 ? 0.075 : 0.045, 16]} />
          <meshBasicMaterial
            color={index % 5 === 0 ? CORAL : TEAL}
            transparent
            opacity={index % 5 === 0 ? 0.9 : 0.56}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene 5: Wave (Codex Video) — wave plane with vertex displacement
// ═══════════════════════════════════════════════════════════════════
function WaveScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useMouseOffset();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 64, 64);
    geo.rotateX(-Math.PI * 0.35);
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const vertexCount = posAttr.count;

    for (let i = 0; i < vertexCount; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      arr[i * 3 + 2] =
        Math.sin(x * 1.2 + t * 1.5) * 0.3 +
        Math.cos(y * 1.0 + t * 1.2) * 0.25;
    }
    posAttr.needsUpdate = true;

    meshRef.current.rotation.z +=
      (mouse.current.x * 0.1 - meshRef.current.rotation.z) * 0.03;
    meshRef.current.rotation.x +=
      (mouse.current.y * 0.05 - meshRef.current.rotation.x) * 0.03;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, -2]}>
      <meshStandardMaterial
        color={TEAL}
        wireframe
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        emissive={TEAL}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene 6: Chart (Quant Trading) — candlestick market chart
// ═══════════════════════════════════════════════════════════════════
function ChartScene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseOffset();

  const candles = useMemo(() => {
    const result: {
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      phase: number;
    }[] = [];
    const count = 24;
    const spacing = 0.38;
    const startX = -((count - 1) * spacing) / 2;
    let price = -0.35;

    for (let i = 0; i < count; i++) {
      const drift = Math.sin(i * 0.72) * 0.24 + Math.cos(i * 0.29) * 0.11;
      const open = price;
      const close = open + drift;
      const high = Math.max(open, close) + 0.22 + (i % 4) * 0.03;
      const low = Math.min(open, close) - 0.2 - (i % 3) * 0.035;

      result.push({
        x: startX + i * spacing,
        open,
        close,
        high,
        low,
        phase: i * 0.43,
      });
      price = close;
    }
    return result;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.rotation.y +=
      (mouse.current.x * 0.08 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x +=
      (-mouse.current.y * 0.05 - groupRef.current.rotation.x) * 0.03;

    groupRef.current.children.forEach((child, i) => {
      const candle = candles[Math.floor(i / 2)];
      if (!candle) return;
      child.position.z = Math.sin(t * 1.2 + candle.phase) * 0.035;
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Line
        points={candles.map((candle) => new THREE.Vector3(candle.x, candle.close, -0.08))}
        color={PURPLE}
        lineWidth={2}
        transparent
        opacity={0.42}
      />

      {candles.map((candle, i) => {
        const rising = candle.close >= candle.open;
        const color = rising ? TEAL : CORAL;
        const bodyHeight = Math.max(Math.abs(candle.close - candle.open), 0.08);
        const bodyY = (candle.open + candle.close) / 2;

        return (
          <group key={i}>
            <Line
              points={[
                new THREE.Vector3(candle.x, candle.low, 0),
                new THREE.Vector3(candle.x, candle.high, 0),
              ]}
              color={color}
              lineWidth={1}
              transparent
              opacity={0.72}
            />
            <mesh position={[candle.x, bodyY, 0.03]}>
              <boxGeometry args={[0.2, bodyHeight, 0.08]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.78}
                emissive={color}
                emissiveIntensity={0.26}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 0.35]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Scene map
// ═══════════════════════════════════════════════════════════════════
const SCENE_MAP: Record<string, React.FC> = {
  particles: ParticlesScene,
  grid: GridScene,
  flow: FlowScene,
  pulse: PulseScene,
  wave: WaveScene,
  chart: ChartScene,
};

// ═══════════════════════════════════════════════════════════════════
// Fading wrapper — interpolates opacity on a <group> via useFrame
// ═══════════════════════════════════════════════════════════════════
function FadingScene({
  sceneId,
  fadeIn,
  onFadeOutDone,
}: {
  sceneId: string;
  fadeIn: boolean;
  onFadeOutDone: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const opacityRef = useRef(fadeIn ? 0 : 1); // start at 0 if fading in, 1 if fading out
  const doneRef = useRef(false);

  const SceneComponent = SCENE_MAP[sceneId];

  useFrame((_, delta) => {
    if (!SceneComponent) return;

    const target = fadeIn ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * Math.min(delta * 5, 0.15);

    if (groupRef.current) {
      const clamped = Math.max(0, Math.min(1, opacityRef.current));
      groupRef.current.visible = clamped > 0.005;
      setGroupOpacity(groupRef.current, clamped);
    }

    // Signal when fade-out is complete
    if (!fadeIn && opacityRef.current < 0.01 && !doneRef.current) {
      doneRef.current = true;
      onFadeOutDone();
    }

    // Reset done flag if fading in again
    if (fadeIn && doneRef.current) {
      doneRef.current = false;
    }
  });

  if (!SceneComponent) return null;

  return (
    <group ref={groupRef}>
      <SceneComponent />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main ProjectScene component — manages scene switching + cross-fade
// ═══════════════════════════════════════════════════════════════════
export default function ProjectScene({ activeScene, visible }: ProjectSceneProps) {
  const keyCounter = useRef(0);
  const prevSceneRef = useRef<string | null>(null);

  // State-driven render slots so React knows when to mount/unmount
  const [slots, setSlots] = useState<SceneSlot[]>([]);

  const removeSlot = useCallback((slotKey: number) => {
    setSlots((prev) => prev.filter((s) => s.slotKey !== slotKey));
  }, []);

  useEffect(() => {
    if (!visible) {
      prevSceneRef.current = null;
      setSlots([]);
      return;
    }

    if (activeScene === prevSceneRef.current) return;

    const oldScene = prevSceneRef.current;
    const newSlots: SceneSlot[] = [];

    // If there was an old scene and it differs from the new one, keep it as fading out
    if (oldScene && oldScene !== activeScene) {
      newSlots.push({ id: oldScene, slotKey: keyCounter.current, fadingOut: true });
      keyCounter.current += 1;
    }

    // Add the new scene fading in
    if (activeScene) {
      newSlots.push({ id: activeScene, slotKey: keyCounter.current, fadingOut: false });
      keyCounter.current += 1;
    }

    setSlots(newSlots);
    prevSceneRef.current = activeScene;
  }, [activeScene, visible]);

  if (!visible || slots.length === 0) return null;

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      {slots.map((slot) => (
        <FadingScene
          key={slot.slotKey}
          sceneId={slot.id}
          fadeIn={!slot.fadingOut}
          onFadeOutDone={() => removeSlot(slot.slotKey)}
        />
      ))}
    </group>
  );
}
