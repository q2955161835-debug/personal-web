"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

import type { TimelineEntry } from "@/types";

interface SolarTimelineSceneProps {
  entries: TimelineEntry[];
  activeIndex: number;
  scrollProgress: number;
  onSelect: (index: number) => void;
}

const PLANET_COLORS = [
  ["#49c5b6", "#e6fffb"],
  ["#ff9398", "#ffe0e2"],
  ["#8b5cf6", "#d8c8ff"],
  ["#ffca7a", "#fff0c2"],
  ["#00d4ff", "#def7ff"],
] as const;

function getPlanetOrbitPosition(index: number, time: number, target = new THREE.Vector3()) {
  const orbitRadius = 7.2 + index * 4.6;
  const initialAngle = -0.8 + index * 0.88;
  const angle = initialAngle + time * (0.035 + index * 0.008);

  return target.set(
    Math.cos(angle) * orbitRadius * (1 + index * 0.018),
    Math.sin(time * 0.52 + index) * 0.18,
    Math.sin(angle) * orbitRadius * 0.68
  );
}

function createOrbitPoints(radius: number, eccentricity: number) {
  return Array.from({ length: 385 }, (_, index) => {
    const angle = (index / 384) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius * (1 + eccentricity * 0.52),
      0,
      Math.sin(angle) * radius * 0.68
    );
  });
}

function createPlanetTexture(primary: string, secondary: string, seed: number) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, secondary);
  gradient.addColorStop(0.48, primary);
  gradient.addColorStop(1, "#050914");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let band = 0; band < 18; band += 1) {
    const y = (band / 18) * size + Math.sin(seed + band * 1.7) * 18;
    ctx.globalAlpha = 0.08 + (band % 5) * 0.032;
    ctx.fillStyle = band % 2 === 0 ? secondary : primary;
    ctx.beginPath();
    ctx.ellipse(size / 2, y, size * (0.46 + (band % 4) * 0.08), 8 + (band % 5) * 7, Math.sin(seed + band) * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let crater = 0; crater < 46; crater += 1) {
    const x = normalizedNoise(seed, crater, 0.37) * size;
    const y = normalizedNoise(seed, crater, 0.79) * size;
    const radius = 4 + normalizedNoise(seed, crater, 1.12) * 26;
    const halo = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    halo.addColorStop(0, "rgba(255,255,255,0.16)");
    halo.addColorStop(0.55, "rgba(0,0,0,0.08)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.2 + normalizedNoise(seed, crater, 1.8) * 0.28;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const image = ctx.getImageData(0, 0, size, size);
  const pixels = image.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const noise = (Math.sin(i * 0.017 + seed) * 0.5 + 0.5) * 24;
    pixels[i] = Math.min(255, pixels[i] + noise);
    pixels[i + 1] = Math.min(255, pixels[i + 1] + noise);
    pixels[i + 2] = Math.min(255, pixels[i + 2] + noise);
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function normalizedNoise(seed: number, index: number, salt: number) {
  return Math.abs(Math.sin(seed * 19.17 + index * 47.31 + salt * 89.41) * 43758.5453) % 1;
}

function StarField() {
  const geometry = useMemo(() => {
    const count = 1900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const radius = 34 + Math.random() * 92;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.55;
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      color.setHSL(0.52 + Math.random() * 0.16, 0.34, 0.62 + Math.random() * 0.32);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return buffer;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.82} depthWrite={false} />
    </points>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group>
      <pointLight intensity={680} distance={90} decay={1.2} color="#ffc47d" />
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.35, 96, 96]} />
        <meshBasicMaterial color="#ffb15c" />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.1, 96, 96]} />
        <meshBasicMaterial color="#ff7a1f" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Planet({
  entry,
  index,
  active,
  onSelect,
}: {
  entry: TimelineEntry;
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Object3D>(null);
  const orbitTargetRef = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const [primary, secondary] = PLANET_COLORS[index % PLANET_COLORS.length];
  const texture = useMemo(() => createPlanetTexture(primary, secondary, index + 1), [primary, secondary, index]);
  const orbitRadius = 7.2 + index * 4.6;
  const planetRadius = 0.58 + (index % 3) * 0.18;
  const orbitPoints = useMemo(() => createOrbitPoints(orbitRadius, 0.08 + index * 0.02), [orbitRadius, index]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const target = getPlanetOrbitPosition(index, time, orbitTargetRef.current);
    if (groupRef.current) {
      groupRef.current.position.lerp(target, 1 - Math.exp(-delta * 5.5));
      groupRef.current.scale.lerp(new THREE.Vector3(active ? 1.22 : 1, active ? 1.22 : 1, active ? 1.22 : 1), 1 - Math.exp(-delta * 6));
    }
    if (meshRef.current) meshRef.current.rotation.y += delta * (0.42 + index * 0.07);
    if (labelRef.current) labelRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <>
      <Line points={orbitPoints} color={active ? primary : "#356b92"} transparent opacity={active ? 0.46 : 0.22} lineWidth={1} />
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onPointerOver={(event) => {
            event.stopPropagation();
            onSelect(index);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(index);
          }}
        >
          <sphereGeometry args={[planetRadius, 72, 72]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            roughness={0.58}
            metalness={0.02}
            emissive={primary}
            emissiveIntensity={active ? 0.18 : 0.04}
          />
        </mesh>
        {index % 3 === 2 && (
          <mesh rotation={[Math.PI * 0.52, 0, -0.24]}>
            <torusGeometry args={[planetRadius * 1.55, 0.025, 10, 128]} />
            <meshBasicMaterial color={secondary} transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
        {active && (
          <mesh>
            <sphereGeometry args={[planetRadius * 1.36, 72, 72]} />
            <meshBasicMaterial color={primary} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
        <Text
          ref={labelRef}
          position={[planetRadius + 0.55, planetRadius + 0.32, 0]}
          fontSize={0.32}
          color="#ffffff"
          fillOpacity={active ? 1 : 0.48}
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000000"
        >
          {String(entry.year)}
        </Text>
      </group>
    </>
  );
}

function CameraFlight({
  activeIndex,
  scrollProgress,
}: {
  activeIndex: number;
  scrollProgress: number;
}) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const focusRef = useRef(new THREE.Vector3());
  const smoothTravelRef = useRef(scrollProgress);

  useFrame((state, delta) => {
    smoothTravelRef.current = THREE.MathUtils.lerp(smoothTravelRef.current, scrollProgress, 1 - Math.exp(-delta * 2.6));

    const travel = THREE.MathUtils.clamp(smoothTravelRef.current, 0, 1);
    const focus = getPlanetOrbitPosition(activeIndex, state.clock.elapsedTime, focusRef.current);
    targetRef.current.lerp(focus, 1 - Math.exp(-delta * 4.2));

    const cameraPath = new THREE.Vector3(
      15 - travel * 5.2 + Math.sin(travel * Math.PI * 0.9) * 1.1,
      7.4 + Math.sin(travel * Math.PI) * 1.1,
      29 - travel * 7.5
    );
    camera.position.lerp(cameraPath, 1 - Math.exp(-delta * 1.9));
    camera.lookAt(targetRef.current);
  });

  return (
    <>
      <ambientLight intensity={0.16} color="#91a7c8" />
      <directionalLight position={[-18, 18, 20]} intensity={0.56} color="#91dcff" />
    </>
  );
}

function SolarSceneContent({ entries, activeIndex, scrollProgress, onSelect }: SolarTimelineSceneProps) {
  return (
    <>
      <fog attach="fog" args={["#02050b", 26, 126]} />
      <StarField />
      <Sun />
      {entries.map((entry, index) => (
        <Planet
          key={entry.id}
          entry={entry}
          index={index}
          active={activeIndex === index}
          onSelect={onSelect}
        />
      ))}
      <CameraFlight activeIndex={activeIndex} scrollProgress={scrollProgress} />
    </>
  );
}

export default function SolarTimelineScene(props: SolarTimelineSceneProps) {
  return (
    <Canvas
      camera={{ position: [13, 8, 28], fov: 44, near: 0.1, far: 180 }}
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <SolarSceneContent {...props} />
    </Canvas>
  );
}
