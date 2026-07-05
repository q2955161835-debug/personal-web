"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import ParticleField from "./ParticleField";
import PostProcessing from "./PostProcessing";
import DNAHelixScene from "./dna/DNAHelixScene";
import { useProjectScene } from "./SceneContext";

interface SceneProps {
  className?: string;
}

const CAMERA_HOME_POSITION = new THREE.Vector3(0, 0, 5);
const CAMERA_HOME_TARGET = new THREE.Vector3(0, 0, 0);

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

function CameraHomeController({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!enabled) return;
    const lerpFactor = 1 - Math.exp(-delta * 3);
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    if (perspectiveCamera.isPerspectiveCamera && Math.abs(perspectiveCamera.fov - 75) > 0.1) {
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, 75, lerpFactor);
      perspectiveCamera.updateProjectionMatrix();
    }
    camera.position.lerp(CAMERA_HOME_POSITION, lerpFactor);
    camera.lookAt(CAMERA_HOME_TARGET);
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
  const isPastProjectIntro = scrollProgress > 0.38;
  const upperContentFade = THREE.MathUtils.clamp(scrollProgress / 0.08, 0, 1);
  const readableUpperOpacity = THREE.MathUtils.lerp(1, 0.28, upperContentFade);

  return (
    <ParticleField
      mouse={mouse}
      scrollProgress={scrollProgress}
      opacity={isProjectsActive || isPastProjectIntro ? 0 : readableUpperOpacity}
    />
  );
}

export default function Scene({ className }: SceneProps) {
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const [scrollProgress, setScrollProgress] = useState(0);
  const { activeSection } = useProjectScene();
  const isProjectsActive = activeSection === "projects";

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
      <CameraHomeController enabled={!isProjectsActive} />
      <FadeableParticleField mouse={mouseRef.current} scrollProgress={scrollProgress} />
      <DNAHelixScene visible={isProjectsActive} />
      <PostProcessing />
    </Canvas>
  );
}
