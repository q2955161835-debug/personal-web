"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import ParticleField from "./ParticleField";
import PostProcessing from "./PostProcessing";

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

export default function Scene({ className }: SceneProps) {
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const [scrollProgress, setScrollProgress] = useState(0);

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
      <ParticleField mouse={mouseRef.current} scrollProgress={scrollProgress} />
      <PostProcessing />
    </Canvas>
  );
}
