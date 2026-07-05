"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { dnaVertexShader } from "./shaders/dna-helix.vert";
import { dnaFragmentShader } from "./shaders/dna-helix.frag";
import { generateDNAHelixBuffers, HELIX_PARAMS } from "./dnaGeometry";
import { useProjectScene } from "../SceneContext";
import { projects } from "@/data/projects";

interface DNAHelixSceneProps {
  visible: boolean;
}

const STATION_HEX_COLORS = [
  "#49c5b6",
  "#ff9398",
  "#8b5cf6",
  "#00d4ff",
  "#ff6b6b",
  "#a78bfa",
];

// ═══════════════════════════════════════════════════════════════════
// DNA Helix Particles
// ═══════════════════════════════════════════════════════════════════

function DNAHelixParticles({
  visible,
  mouseActive,
  mouseWorld,
  hoveredStationRef,
  zoomedStation,
}: {
  visible: boolean;
  mouseActive: React.MutableRefObject<boolean>;
  mouseWorld: React.MutableRefObject<THREE.Vector3>;
  hoveredStationRef: React.MutableRefObject<number>;
  zoomedStation: number | null;
}) {
  const meshRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const buffers = generateDNAHelixBuffers();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(buffers.colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(buffers.sizes, 1));
    geo.setAttribute("aBasePairIndex", new THREE.BufferAttribute(buffers.basePairIndices, 1));
    geo.setAttribute("aParticleType", new THREE.BufferAttribute(buffers.particleTypes, 1));
    geo.setAttribute("aRandomSeed", new THREE.BufferAttribute(buffers.randomSeeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: dnaVertexShader,
      fragmentShader: dnaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouseWorld: { value: new THREE.Vector3() },
        uMouseActive: { value: 0 },
        uScrollProgress: { value: 0 },
        uHoveredStation: { value: -1 },
        uZoomedStation: { value: -1 },
        uZoomProgress: { value: 0 },
        uScatterRadius: { value: HELIX_PARAMS.scatterRadius },
        uScatterStrength: { value: HELIX_PARAMS.scatterStrength },
        uSceneOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  // Track zoom progress state locally
  const zoomProgressRef = useRef(0);
  const sceneOpacityRef = useRef(0);

  useFrame((state, delta) => {
    const { clock } = state;
    const uniforms = material.uniforms;
    const targetSceneOpacity = visible ? 1 : 0;
    const targetZoomProgress = zoomedStation !== null ? 1 : 0;

    sceneOpacityRef.current = THREE.MathUtils.lerp(
      sceneOpacityRef.current,
      targetSceneOpacity,
      1 - Math.exp(-delta * 5)
    );
    zoomProgressRef.current = THREE.MathUtils.lerp(
      zoomProgressRef.current,
      targetZoomProgress,
      1 - Math.exp(-delta * 5)
    );

    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMouseWorld.value.copy(mouseWorld.current);
    uniforms.uMouseActive.value = mouseActive.current ? 1.0 : 0.0;
    uniforms.uHoveredStation.value = hoveredStationRef.current;
    uniforms.uZoomedStation.value = zoomedStation ?? -1;
    uniforms.uZoomProgress.value = zoomProgressRef.current;
    uniforms.uSceneOpacity.value = sceneOpacityRef.current;

    if (meshRef.current) {
      meshRef.current.visible = sceneOpacityRef.current > 0.01;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}

// ═══════════════════════════════════════════════════════════════════
// DNA Helix Camera
// ═══════════════════════════════════════════════════════════════════

function DNAHelixCamera({ visible }: { visible: boolean }) {
  const { camera } = useThree();
  const { projectProgress, helixZoomedStation } = useProjectScene();

  // Zoom progress tracked locally for smooth lerp
  const zoomProgressRef = useRef(0);
  const currentYRef = useRef(HELIX_PARAMS.height / 2 + 2);

  useFrame((state, delta) => {
    if (!visible) return;

    const { pointer } = state;
    const halfHeight = HELIX_PARAMS.height / 2;
    const R = HELIX_PARAMS.cameraRadius;
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;

    // Compute helix path position
    const t = THREE.MathUtils.clamp(projectProgress, 0, 1);
    const yStart = halfHeight + 2;
    const yEnd = -(halfHeight + 2);

    const targetY = yStart - (yStart - yEnd) * t;
    const targetPos = new THREE.Vector3(
      R * Math.cos(omega * t - Math.PI / 2),
      targetY,
      R * Math.sin(omega * t - Math.PI / 2)
    );
    let targetLookAtY = targetY;

    // Smooth zoom progress
    const targetZoomProgress = helixZoomedStation !== null ? 1.0 : 0.0;
    zoomProgressRef.current = THREE.MathUtils.lerp(
      zoomProgressRef.current,
      targetZoomProgress,
      Math.min(delta * 3, 0.12)
    );

    // If zoomed, override camera position to fly toward station
    if (helixZoomedStation !== null && zoomProgressRef.current > 0.01) {
      const zoomT = helixZoomedStation / (HELIX_PARAMS.stationCount - 1);
      const zoomY = yStart - (yStart - yEnd) * zoomT;
      const zoomAngle = omega * zoomT - Math.PI / 2;
      const zoomPos = new THREE.Vector3(
        R * 0.4 * Math.cos(zoomAngle),
        zoomY,
        R * 0.4 * Math.sin(zoomAngle)
      );

      // Lerp toward zoom position
      const zoomLerpFactor = zoomProgressRef.current;
      targetPos.lerp(zoomPos, zoomLerpFactor);
      targetLookAtY = zoomY;
    }

    // Smooth Y interpolation for lookAt
    currentYRef.current = THREE.MathUtils.lerp(
      currentYRef.current,
      targetLookAtY,
      Math.min(delta * 4, 0.12)
    );

    // Smooth lerp camera position
    camera.position.lerp(targetPos, 1 - Math.exp(-delta * 4));

    // Mouse parallax offset
    const parallaxX = pointer.x * 0.3;
    const parallaxY = pointer.y * 0.15;
    camera.position.x += parallaxX;
    camera.position.y += parallaxY;

    camera.lookAt(0, currentYRef.current, 0);
  });

  return null;
}

function DNAStationLabels({ visible }: { visible: boolean }) {
  const labelsRef = useRef<THREE.Group>(null);
  const { carouselActiveIndex } = useProjectScene();

  const stationPositions = useMemo(() => {
    const halfHeight = HELIX_PARAMS.height / 2;
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;

    return projects.slice(0, HELIX_PARAMS.stationCount).map((_, index) => {
      const stationT = (index + 0.5) / HELIX_PARAMS.stationCount;
      const stationY = halfHeight - stationT * HELIX_PARAMS.height + 0.9;
      const stationAngle = stationT * omega + 0.32;
      const labelRadius = HELIX_PARAMS.radius + 1.45;

      return new THREE.Vector3(
        labelRadius * Math.cos(stationAngle),
        stationY,
        labelRadius * Math.sin(stationAngle)
      );
    });
  }, []);

  useFrame((state) => {
    if (!labelsRef.current) return;
    labelsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group ref={labelsRef}>
      {projects.slice(0, HELIX_PARAMS.stationCount).map((project, index) => {
        const isActive = carouselActiveIndex === index;
        const color = STATION_HEX_COLORS[index % STATION_HEX_COLORS.length];
        const opacity = visible ? (isActive ? 1 : 0.36) : 0;
        const position = stationPositions[index];

        return (
          <Html
            key={project.id}
            position={position}
            center
            zIndexRange={[30, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                opacity,
                transform: isActive ? "translateY(-6px) scale(1)" : "scale(0.82)",
                transition:
                  "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.25, 1, 0.5, 1)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(5, 12, 22, 0.86), rgba(5, 12, 22, 0.48))"
                  : "rgba(5, 12, 22, 0.58)",
                border: `1px solid ${color}${isActive ? "cc" : "55"}`,
                color,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: isActive ? `0 18px 60px ${color}24, 0 0 24px ${color}35` : "none",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main DNA Helix Scene
// ═══════════════════════════════════════════════════════════════════

export default function DNAHelixScene({ visible }: DNAHelixSceneProps) {
  const { camera, pointer, gl } = useThree();
  const { helixZoomedStation, setHelixZoomedStation } = useProjectScene();

  // Mouse tracking refs
  const mouseActive = useRef(false);
  const mouseWorld = useRef(new THREE.Vector3(0, 100, 0));
  const hoveredStationRef = useRef(-1);
  const zoomProgressRef = useRef(0);
  const pointerNDCRef = useRef(new THREE.Vector2(0, 0));

  // Compute station Y positions for hover detection
  const stationYPositions = useMemo(() => {
    const halfHeight = HELIX_PARAMS.height / 2;
    const positions: number[] = [];
    for (let i = 0; i < HELIX_PARAMS.stationCount; i++) {
      const t = (i + 0.5) / HELIX_PARAMS.stationCount;
      positions.push(halfHeight - t * HELIX_PARAMS.height);
    }
    return positions;
  }, []);

  // Pointer enter/leave tracking
  const onPointerOver = useCallback(() => {
    if (!visible) return;
    mouseActive.current = true;
  }, [visible]);

  const onPointerLeave = useCallback(() => {
    mouseActive.current = false;
    hoveredStationRef.current = -1;
  }, []);

  // Pointer click handler for station selection
  const onPointerClick = useCallback(() => {
    if (!visible) return;
    if (hoveredStationRef.current >= 0) {
      setHelixZoomedStation(hoveredStationRef.current);
    }
  }, [visible, setHelixZoomedStation]);

  // Each frame: compute mouse world position and hovered station
  useFrame(() => {
    if (!visible) {
      mouseActive.current = false;
      hoveredStationRef.current = -1;
      return;
    }

    // Track pointer NDC
    pointerNDCRef.current.set(pointer.x, pointer.y);

    // Compute mouse world position by intersecting ray with Y plane
    if (mouseActive.current) {
      const cam = camera as THREE.PerspectiveCamera;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);

      // Compute ray direction from NDC offset
      const ndcX = pointer.x;
      const ndcY = pointer.y;
      const fovRad = (cam.fov * Math.PI) / 180;
      const aspect = cam.aspect || gl.domElement.width / gl.domElement.height;

      // Offset ray direction by NDC
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      right.crossVectors(dir, cam.up).normalize();
      up.crossVectors(right, dir).normalize();

      const tanHalfFov = Math.tan(fovRad / 2);
      const rayDir = dir.clone()
        .add(right.clone().multiplyScalar(ndcX * tanHalfFov * aspect))
        .add(up.clone().multiplyScalar(ndcY * tanHalfFov))
        .normalize();

      // Intersect with Y plane at camera lookAt Y
      const currentY = cam.position.y; // approximate
      const rayOrigin = cam.position.clone();
      if (Math.abs(rayDir.y) > 0.001) {
        const tParam = (currentY - rayOrigin.y) / rayDir.y;
        if (tParam > 0) {
          const hitX = rayOrigin.x + rayDir.x * tParam;
          const hitZ = rayOrigin.z + rayDir.z * tParam;
          mouseWorld.current.set(hitX, currentY, hitZ);
        }
      }
    }

    // Compute hovered station by projecting station positions to screen
    const minDist = { value: Infinity };
    let closestStation = -1;

    for (let i = 0; i < HELIX_PARAMS.stationCount; i++) {
      const stationPos = new THREE.Vector3(0, stationYPositions[i], 0);
      stationPos.project(camera);

      const screenX = stationPos.x; // NDC -1..1
      const screenY = stationPos.y; // NDC -1..1
      const dx = screenX - pointer.x;
      const dy = screenY - pointer.y;
      const dist = dx * dx + dy * dy;

      if (dist < minDist.value) {
        minDist.value = dist;
        closestStation = i;
      }
    }

    // Only consider hovered if within reasonable screen distance and mouse is active
    if (mouseActive.current && minDist.value < 0.15) {
      hoveredStationRef.current = closestStation;
    } else {
      hoveredStationRef.current = -1;
    }

    // Zoom progress lerp
    const targetZoomProgress = helixZoomedStation !== null ? 1.0 : 0.0;
    zoomProgressRef.current = THREE.MathUtils.lerp(
      zoomProgressRef.current,
      targetZoomProgress,
      0.08
    );
  });

  return (
    <group
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
      onClick={onPointerClick}
    >
      <DNAHelixParticles
        visible={visible}
        mouseActive={mouseActive}
        mouseWorld={mouseWorld}
        hoveredStationRef={hoveredStationRef}
        zoomedStation={helixZoomedStation}
      />
      <DNAStationLabels visible={visible} />
      <DNAHelixCamera visible={visible} />
    </group>
  );
}
