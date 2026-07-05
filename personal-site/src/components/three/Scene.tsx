"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import ParticleField from "./ParticleField";
import PostProcessing from "./PostProcessing";
import ProjectScene from "./ProjectScene";
import ProjectCarousel from "./ProjectCarousel";
import { useProjectScene } from "./SceneContext";

interface SceneProps {
  className?: string;
}

/** Inner component that reads window scroll and updates a shared scroll ref */
function ScrollTracker({
  onScroll,
}: {
  onScroll: (progress: number) => void;
}) {
  useFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    onScroll(Math.min(Math.max(progress, 0), 1));
  });

  return null;
}

/** Inner component that tracks the R3F viewport size for canvas resize */
function CanvasResizer() {
  const { gl } = useThree();

  useFrame(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  return null;
}

/**
 * Wrapper that fades ParticleField in/out based on activeSection.
 * When "projects" section is active, the hero particles fade to make
 * room for the carousel particle sphere.
 */
function FadeableParticleField({
  mouse,
  scrollProgress,
}: {
  mouse: THREE.Vector2;
  scrollProgress: number;
}) {
  const { activeSection } = useProjectScene();
  const isProjectsActive = activeSection === "projects";

  return (
    <ParticleField
      mouse={mouse}
      scrollProgress={isProjectsActive ? 1.0 : scrollProgress}
    />
  );
}

export default function Scene({ className }: SceneProps) {
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const [scrollProgress, setScrollProgress] = useState(0);
  const { activeProjectScene } = useProjectScene();

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      mouseRef.current.set(e.clientX, e.clientY);
    },
    []
  );

  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5], fov: 75 }}
      dpr={[1, 2]}
      frameloop="always"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        zIndex: 0,
      }}
      onPointerMove={handlePointerMove}
    >
      <CanvasResizer />
      <ScrollTracker onScroll={setScrollProgress} />
      <FadeableParticleField mouse={mouseRef.current} scrollProgress={scrollProgress} />
      <ProjectScene activeScene={activeProjectScene} visible={activeProjectScene != null} />
      <ProjectCarousel />
      <PostProcessing />
    </Canvas>
  );
}
