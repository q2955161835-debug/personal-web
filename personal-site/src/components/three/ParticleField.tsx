"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// GLSL shader sources (as TS string exports for Turbopack compatibility)
import { vertexShader } from "./shaders/particles.vert";
import { fragmentShader } from "./shaders/particles.frag";

interface ParticleFieldProps {
  mouse: THREE.Vector2;
  scrollProgress: number;
}

const PARTICLE_COUNT = 4000;

/** Color palette endpoints */
const COLOR_TEAL = new THREE.Color("#49c5b6");
const COLOR_CORAL = new THREE.Color("#ff9398");

export default function ParticleField({ mouse, scrollProgress }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // --- Ring-biased distribution: more particles at edges, hollow center ---
      const angle = Math.random() * Math.PI * 2;
      // pow < 0.5 strongly biases toward outer radius
      const r = 2.5 + Math.pow(Math.random(), 0.45) * 7; // radius 2.5~9.5, stronger outer bias
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.6; // squash Y for wider-than-tall layout
      const z = (Math.random() - 0.5) * 10;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // --- Color gradient: teal at bottom, coral at top ---
      const t = (y + 5) / 10; // 0 at bottom, 1 at top
      const color = new THREE.Color().lerpColors(COLOR_TEAL, COLOR_CORAL, t);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // --- Particle sizes: center ones slightly smaller to avoid over-bright ---
      sizes[i] = 0.4 + Math.random() * 1.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uScrollProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  // --- Update uniforms every frame ---
  useFrame((state) => {
    const uniforms = material.uniforms;

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.copy(mouse);
    // Use CSS pixel dimensions to match clientX/clientY from pointer events
    uniforms.uResolution.value.set(
      state.size.width,
      state.size.height
    );
    uniforms.uScrollProgress.value = scrollProgress;
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}
