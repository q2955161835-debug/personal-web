"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

import { carouselVertexShader } from "./shaders/carousel-particles.vert";
import { carouselFragmentShader } from "./shaders/carousel-particles.frag";
import { useProjectScene } from "./SceneContext";
import { projects } from "@/data/projects";
import type { Project } from "@/types";

// ─── Types ────────────────────────────────────────────────────────
type CarouselProject = Project;

// ─── Color palette ───────────────────────────────────────────────
const COLOR_TEAL = new THREE.Color("#49c5b6");
const COLOR_CORAL = new THREE.Color("#ff9398");
const COLOR_PURPLE = new THREE.Color("#8b5cf6");

const STATION_COLORS = [
  COLOR_TEAL,
  COLOR_CORAL,
  COLOR_PURPLE,
  new THREE.Color("#00d4ff"),
  new THREE.Color("#ff6b6b"),
  new THREE.Color("#a78bfa"),
];

const CAROUSEL_RADIUS = 8;
const STATION_COUNT = 6;
const PARTICLE_COUNT = 10000;

// ─── Fibonacci sphere distribution ───────────────────────────────
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.sin(phi) * Math.sin(theta) * radius;
    const z = Math.cos(phi) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
}

// ═══════════════════════════════════════════════════════════════════
// Central Particle Sphere
// ═══════════════════════════════════════════════════════════════════
function ParticleSphere({
  isDetailView,
  opacity,
}: {
  isDetailView: boolean;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = fibonacciSphere(PARTICLE_COUNT, 2);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Color gradient based on vertical position
      const t = (positions[i3 + 1] + 2) / 4; // normalize from 0 to 1
      const color = new THREE.Color().lerpColors(COLOR_TEAL, COLOR_CORAL, t);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      sizes[i] = 0.3 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: carouselVertexShader,
      fragmentShader: carouselFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uExpandRadius: { value: 2.0 },
        uOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;

    // Smoothly lerp expand radius
    const targetRadius = isDetailView ? 5.0 : 2.0;
    const current = material.uniforms.uExpandRadius.value;
    material.uniforms.uExpandRadius.value = THREE.MathUtils.lerp(current, targetRadius, 0.03);

    // Smoothly lerp opacity
    const currentOpacity = material.uniforms.uOpacity.value;
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(currentOpacity, opacity, 0.05);
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Project Station (ring + label)
// ═══════════════════════════════════════════════════════════════════
function ProjectStation({
  project,
  index,
  isActive,
  themeColor,
  onStationClick,
}: {
  project: CarouselProject;
  index: number;
  isActive: boolean;
  themeColor: THREE.Color;
  onStationClick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const emissiveIntensityRef = useRef(0.1);

  // Position around the circle
  const angle = (index * Math.PI * 2) / STATION_COUNT;
  const x = CAROUSEL_RADIUS * Math.cos(angle);
  const z = CAROUSEL_RADIUS * Math.sin(angle);

  useFrame((_, delta) => {
    if (!ringRef.current) return;

    // Animate emissive intensity toward target
    const targetIntensity = isActive ? 1.5 : 0.1;
    emissiveIntensityRef.current = THREE.MathUtils.lerp(
      emissiveIntensityRef.current,
      targetIntensity,
      Math.min(delta * 4, 0.12)
    );
    const mat = ringRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = emissiveIntensityRef.current;

    // Gentle float
    ringRef.current.position.y = 0.5 + Math.sin(angle + performance.now() * 0.001) * 0.15;
  });

  return (
    <group position={[x, 0.5, z]}>
      {/* Glowing ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.04, 16, 64]} />
        <MeshDistortMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={0.1}
          speed={isActive ? 3 : 1}
          distort={isActive ? 0.2 : 0.05}
          radius={1}
          transparent
          opacity={isActive ? 1 : 0.4}
        />
      </mesh>

      {/* Second inner ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 48]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={isActive ? 1.0 : 0.05}
          transparent
          opacity={isActive ? 0.7 : 0.2}
        />
      </mesh>

      {/* Project name label via drei Html */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={onStationClick}
          className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-center transition-all duration-300"
          style={{
            background: isActive
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0.3)",
            border: `1px solid ${
              isActive
                ? themeColor.getStyle()
                : "rgba(255, 255, 255, 0.08)"
            }`,
            opacity: isActive ? 1 : 0.5,
            color: isActive ? themeColor.getStyle() : "rgba(156, 163, 175, 0.8)",
            fontSize: isActive ? "1rem" : "0.8rem",
            fontWeight: isActive ? 600 : 400,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            backdropFilter: "blur(8px)",
            boxShadow: isActive
              ? `0 0 20px ${themeColor.getStyle()}30`
              : "none",
          }}
        >
          {project.name}
        </button>
      </Html>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Camera Controller
// ═══════════════════════════════════════════════════════════════════
function CameraController({ activeIndex }: { activeIndex: number }) {
  const { camera } = useThree();
  const currentPosRef = useRef(new THREE.Vector3(0, 1.5, CAROUSEL_RADIUS));
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    // Track pointer for parallax
    mouseRef.current.set(state.pointer.x, state.pointer.y);

    // Compute target camera position based on activeIndex
    const targetAngle = activeIndex * (Math.PI * 2) / STATION_COUNT;
    const targetPos = new THREE.Vector3(
      CAROUSEL_RADIUS * Math.cos(targetAngle),
      1.5,
      CAROUSEL_RADIUS * Math.sin(targetAngle)
    );

    // Smooth lerp to target
    currentPosRef.current.lerp(targetPos, Math.min(delta * 3, 0.08));

    // Mouse parallax offset (subtle)
    const parallaxX = mouseRef.current.x * 0.3;
    const parallaxY = mouseRef.current.y * 0.15;

    camera.position.set(
      currentPosRef.current.x + parallaxX,
      currentPosRef.current.y + parallaxY,
      currentPosRef.current.z
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// Main ProjectCarousel
// ═══════════════════════════════════════════════════════════════════
export default function ProjectCarousel() {
  const {
    activeSection,
    carouselActiveIndex,
    carouselSelectedIndex,
    setCarouselSelectedIndex,
  } = useProjectScene();

  // Only show when projects section is active
  const isVisible = activeSection === "projects";

  // Opacity for particle sphere (fade in/out based on visibility)
  const sphereOpacity = isVisible ? 1.0 : 0.0;
  const isDetailView = carouselSelectedIndex !== null;

  return (
    <>
      {/* Camera controller */}
      {isVisible && <CameraController activeIndex={carouselActiveIndex} />}

      {/* Central particle sphere */}
      <ParticleSphere
        isDetailView={isDetailView}
        opacity={sphereOpacity}
      />

      {/* Project stations */}
      {projects.slice(0, STATION_COUNT).map((project, index) => (
        <ProjectStation
          key={project.id}
          project={project}
          index={index}
          isActive={carouselActiveIndex === index && isVisible}
          themeColor={STATION_COLORS[index % STATION_COLORS.length]}
          onStationClick={() => {
            setCarouselSelectedIndex(
              carouselSelectedIndex === index ? null : index
            );
          }}
        />
      ))}

      {/* Subtle ambient lights for stations */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color={COLOR_TEAL} />
    </>
  );
}
