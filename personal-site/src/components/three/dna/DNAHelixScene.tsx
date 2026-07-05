"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { projects } from "@/data/projects";
import { FluidGlassButton } from "@/components/ui/FluidGlassPanel";
import { useProjectScene } from "../SceneContext";
import { generateDNAHelixBuffers, HELIX_PARAMS } from "./dnaGeometry";
import { dnaFragmentShader } from "./shaders/dna-helix.frag";
import { dnaVertexShader } from "./shaders/dna-helix.vert";

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
  "#ffca7a",
  "#7dd3fc",
  "#f0abfc",
  "#86efac",
];

const PROJECT_INTRO_PROGRESS = 0.16;
const FIXED_CAMERA_POSITION = new THREE.Vector3(0, 0, HELIX_PARAMS.cameraRadius);
const FIXED_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

function normalizeProjectProgress(progress: number) {
  return THREE.MathUtils.clamp((progress - PROJECT_INTRO_PROGRESS) / (1 - PROJECT_INTRO_PROGRESS), 0, 1);
}

function useViewportPointer() {
  const pointerRef = useRef(new THREE.Vector2(10, 10));
  const activeRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent | PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      activeRef.current = 1;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        activeRef.current = 0;
      }, 420);
    };
    const handlePointerLeave = () => {
      activeRef.current = 0;
      pointerRef.current.set(10, 10);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return { pointerRef, activeRef };
}

function getStationY(index: number) {
  return getVirtualSlotY(index + 1);
}

function getVirtualSlotY(slot: number) {
  const halfHeight = HELIX_PARAMS.height / 2;
  const boundedSlot = THREE.MathUtils.clamp(slot, 0, HELIX_PARAMS.stationSlots - 1);
  const t = (boundedSlot + 0.5) / HELIX_PARAMS.stationSlots;
  return halfHeight - t * HELIX_PARAMS.height;
}

function getFocusY(progress: number) {
  const clamped = THREE.MathUtils.clamp(progress, 0, 1);
  const maxVirtualSlot = HELIX_PARAMS.stationCount + 1;
  const scaled = clamped * maxVirtualSlot;
  const lowerSlot = Math.min(maxVirtualSlot, Math.floor(scaled));
  const upperSlot = Math.min(maxVirtualSlot, lowerSlot + 1);
  const mix = scaled - lowerSlot;
  return THREE.MathUtils.lerp(getVirtualSlotY(lowerSlot), getVirtualSlotY(upperSlot), mix);
}

function getScrollAngle(progress: number, time = 0) {
  return progress * 7.1 + time * 0.045;
}

function DNAHelixParticles({
  visible,
  hoveredStationRef,
  zoomedStation,
  pointerRef,
  pointerActiveRef,
  dissolveProgress,
}: {
  visible: boolean;
  hoveredStationRef: MutableRefObject<number>;
  zoomedStation: number | null;
  pointerRef: MutableRefObject<THREE.Vector2>;
  pointerActiveRef: MutableRefObject<number>;
  dissolveProgress: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const sceneOpacityRef = useRef(0);
  const zoomProgressRef = useRef(0);
  const { carouselActiveIndex, projectProgress } = useProjectScene();

  const { geometry, material } = useMemo(() => {
    const buffers = generateDNAHelixBuffers();
    const geo = new THREE.BufferGeometry();

    geo.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3));
    geo.setAttribute("aInitialPosition", new THREE.BufferAttribute(buffers.initialPositions, 3));
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
        uPointer: { value: new THREE.Vector2() },
        uMouseActive: { value: 0 },
        uScrollProgress: { value: 0 },
        uStationProgress: { value: 0 },
        uDissolveProgress: { value: 1 },
        uFocusY: { value: 0 },
        uActiveStation: { value: 0 },
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

  useFrame((state, delta) => {
    const targetSceneOpacity = visible ? 1 : 0;
    const targetZoomProgress = zoomedStation !== null ? 1 : 0;
    const rawProgress = THREE.MathUtils.clamp(projectProgress, 0, 1);
    const stationProgress = normalizeProjectProgress(rawProgress);

    sceneOpacityRef.current = THREE.MathUtils.lerp(
      sceneOpacityRef.current,
      targetSceneOpacity,
      1 - Math.exp(-delta * 4.5)
    );
    zoomProgressRef.current = THREE.MathUtils.lerp(
      zoomProgressRef.current,
      targetZoomProgress,
      1 - Math.exp(-delta * 5)
    );

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPointer.value.copy(pointerRef.current);
    material.uniforms.uMouseActive.value = visible ? pointerActiveRef.current : 0;
    material.uniforms.uScrollProgress.value = rawProgress;
    material.uniforms.uStationProgress.value = stationProgress;
    material.uniforms.uDissolveProgress.value = THREE.MathUtils.clamp(dissolveProgress, 0, 1);
    material.uniforms.uFocusY.value = getFocusY(stationProgress);
    material.uniforms.uActiveStation.value = Math.min(HELIX_PARAMS.stationCount - 1, carouselActiveIndex);
    material.uniforms.uHoveredStation.value = hoveredStationRef.current;
    material.uniforms.uZoomedStation.value = zoomedStation ?? -1;
    material.uniforms.uZoomProgress.value = zoomProgressRef.current;
    material.uniforms.uSceneOpacity.value = sceneOpacityRef.current;

    if (pointsRef.current) {
      pointsRef.current.visible = sceneOpacityRef.current > 0.01;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}

function DNAHelixCamera({ visible }: { visible: boolean }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!visible) return;

    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    if (perspectiveCamera.isPerspectiveCamera && Math.abs(perspectiveCamera.fov - 58) > 0.1) {
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, 58, 1 - Math.exp(-delta * 3));
      perspectiveCamera.updateProjectionMatrix();
    }

    camera.position.lerp(FIXED_CAMERA_POSITION, 1 - Math.exp(-delta * 4.2));
    camera.lookAt(FIXED_CAMERA_TARGET);
  });

  return null;
}

function DNAStationLabels({
  visible,
}: {
  visible: boolean;
}) {
  const labelsRef = useRef<THREE.Group>(null);
  const {
    activeSection,
    carouselActiveIndex,
    dnaDissolveProgress,
    projectProgress,
    setCarouselActiveIndex,
    setHelixZoomedStation,
  } = useProjectScene();

  const stationPositions = useMemo(() => {
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;

    return projects.slice(0, HELIX_PARAMS.stationCount).map((_, index) => {
      const stationSlotT = (index + 1.5) / HELIX_PARAMS.stationSlots;
      const stationY = getStationY(index);
      const stationAngle = stationSlotT * omega;
      const midpointOffset = 0.08;

      return new THREE.Vector3(
        midpointOffset * Math.cos(stationAngle),
        stationY + 0.64,
        midpointOffset * Math.sin(stationAngle)
      );
    });
  }, []);

  useFrame((state) => {
    const group = labelsRef.current;
    if (!group) return;

    const stationProgress = normalizeProjectProgress(projectProgress);
    group.visible =
      visible &&
      activeSection === "projects" &&
      dnaDissolveProgress < 0.04 &&
      normalizeProjectProgress(projectProgress) > 0.045;
    group.rotation.y = getScrollAngle(stationProgress, state.clock.elapsedTime);
    group.position.y = -getFocusY(stationProgress) + (0.5 - stationProgress) * 1.2;
  });

  return (
    <group ref={labelsRef}>
      {projects.slice(0, HELIX_PARAMS.stationCount).map((project, index) => {
        const isActive = carouselActiveIndex === index;
        const color = STATION_HEX_COLORS[index % STATION_HEX_COLORS.length];
        const opacity = visible ? (isActive ? 1 : 0.34) : 0;

        return (
          <Html
            key={project.id}
            position={stationPositions[index]}
            center
            zIndexRange={[30, 0]}
            style={{ pointerEvents: visible ? "auto" : "none" }}
          >
            <FluidGlassButton
              aria-label={`Focus project ${project.name}`}
              onClick={(event) => {
                event.stopPropagation();
                setCarouselActiveIndex(index);
                setHelixZoomedStation(index);
                window.dispatchEvent(new CustomEvent("portfolio:focus-project", { detail: index }));
              }}
              color={color}
              variant="chip"
              intensity={18}
              className={`outline-none transition-all duration-300 ${
                isActive
                  ? "flex h-14 w-28 items-center justify-center rounded-[22px] px-3 py-2 text-center"
                  : "flex h-9 w-9 items-center justify-center rounded-full text-center"
              }`}
              style={{
                opacity,
                transition: "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                color,
              }}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/68">
                Key {String(index + 1).padStart(2, "0")}
              </span>
            </FluidGlassButton>
          </Html>
        );
      })}
    </group>
  );
}

export default function DNAHelixScene({ visible }: DNAHelixSceneProps) {
  const { camera } = useThree();
  const { helixZoomedStation, projectProgress, dnaDissolveProgress } = useProjectScene();
  const hoveredStationRef = useRef(-1);
  const { pointerRef, activeRef: pointerActiveRef } = useViewportPointer();

  const stationPositions = useMemo(() => {
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;
    return Array.from({ length: HELIX_PARAMS.stationCount }, (_, index) => {
      const stationSlotT = (index + 1.5) / HELIX_PARAMS.stationSlots;
      const stationAngle = stationSlotT * omega;
      return new THREE.Vector3(
        HELIX_PARAMS.radius * Math.cos(stationAngle),
        getStationY(index),
        HELIX_PARAMS.radius * Math.sin(stationAngle)
      );
    });
  }, []);

  useFrame((state) => {
    if (!visible) {
      hoveredStationRef.current = -1;
      return;
    }

    if (pointerActiveRef.current < 0.5) {
      hoveredStationRef.current = -1;
      return;
    }

    const pointer = pointerRef.current;
    const stationProgress = normalizeProjectProgress(projectProgress);
    const angle = getScrollAngle(stationProgress, state.clock.elapsedTime);
    const focusY = getFocusY(stationProgress);
    let closestStation = -1;
    let closestDistance = Infinity;

    for (let index = 0; index < stationPositions.length; index += 1) {
      const projected = stationPositions[index].clone();
      const rotatedX = projected.x * Math.cos(angle) - projected.z * Math.sin(angle);
      const rotatedZ = projected.x * Math.sin(angle) + projected.z * Math.cos(angle);
      projected.set(rotatedX, projected.y - focusY + (0.5 - stationProgress) * 1.2, rotatedZ);
      projected.project(camera);

      const dx = projected.x - pointer.x;
      const dy = projected.y - pointer.y;
      const distance = dx * dx + dy * dy;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestStation = index;
      }
    }

    hoveredStationRef.current = closestDistance < 0.08 ? closestStation : -1;
  });

  return (
    <group>
      <DNAHelixParticles
        visible={visible}
        hoveredStationRef={hoveredStationRef}
        zoomedStation={helixZoomedStation}
        pointerRef={pointerRef}
        pointerActiveRef={pointerActiveRef}
        dissolveProgress={dnaDissolveProgress}
      />
      <DNAStationLabels visible={visible} />
      <DNAHelixCamera visible={visible} />
    </group>
  );
}
