"use client";

import { useMemo, useRef } from "react";
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
];

const FIXED_CAMERA_POSITION = new THREE.Vector3(0, 0, HELIX_PARAMS.cameraRadius);
const FIXED_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

function getStationY(index: number) {
  const halfHeight = HELIX_PARAMS.height / 2;
  const t = (index + 0.5) / HELIX_PARAMS.stationCount;
  return halfHeight - t * HELIX_PARAMS.height;
}

function getFocusY(progress: number) {
  const clamped = THREE.MathUtils.clamp(progress, 0, 1);
  const scaled = clamped * (HELIX_PARAMS.stationCount - 1);
  const lowerIndex = Math.floor(scaled);
  const upperIndex = Math.min(HELIX_PARAMS.stationCount - 1, lowerIndex + 1);
  const mix = scaled - lowerIndex;
  return THREE.MathUtils.lerp(getStationY(lowerIndex), getStationY(upperIndex), mix);
}

function getScrollAngle(progress: number, time = 0) {
  return progress * 5.6 + time * 0.045;
}

function DNAHelixParticles({
  visible,
  hoveredStationRef,
  zoomedStation,
}: {
  visible: boolean;
  hoveredStationRef: MutableRefObject<number>;
  zoomedStation: number | null;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const sceneOpacityRef = useRef(0);
  const zoomProgressRef = useRef(0);
  const { projectProgress } = useProjectScene();

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
    material.uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);
    material.uniforms.uMouseActive.value = visible ? 1 : 0;
    material.uniforms.uScrollProgress.value = THREE.MathUtils.clamp(projectProgress, 0, 1);
    material.uniforms.uFocusY.value = getFocusY(projectProgress);
    material.uniforms.uActiveStation.value = projectProgress * (HELIX_PARAMS.stationCount - 1);
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
    carouselActiveIndex,
    projectProgress,
    setCarouselActiveIndex,
    setHelixZoomedStation,
  } = useProjectScene();

  const stationPositions = useMemo(() => {
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;

    return projects.slice(0, HELIX_PARAMS.stationCount).map((_, index) => {
      const stationT = (index + 0.5) / HELIX_PARAMS.stationCount;
      const stationY = getStationY(index);
      const stationAngle = stationT * omega;
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

    group.visible = visible;
    group.rotation.y = getScrollAngle(projectProgress, state.clock.elapsedTime);
    group.position.y = -getFocusY(projectProgress) + (0.5 - projectProgress) * 1.2;
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
              aria-label={`Open project ${project.name}`}
              onClick={(event) => {
                event.stopPropagation();
                setCarouselActiveIndex(index);
                setHelixZoomedStation(index);
                window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: index }));
              }}
              color={color}
              variant="chip"
              intensity={18}
              className={`outline-none transition-all duration-300 ${
                isActive
                  ? "w-[min(17rem,66vw)] px-4 py-3 text-left"
                  : "flex h-9 w-9 items-center justify-center rounded-full text-center"
              }`}
              style={{
                opacity,
                transition: "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                color,
              }}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/52">
                {String(index + 1).padStart(2, "0")} / {String(HELIX_PARAMS.stationCount).padStart(2, "0")}
              </span>
              {isActive && (
                <>
                  <span className="mt-2 block text-base font-bold leading-tight text-white">
                    {project.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-white/58">
                    {project.subtitle}
                  </span>
                </>
              )}
            </FluidGlassButton>
          </Html>
        );
      })}
    </group>
  );
}

export default function DNAHelixScene({ visible }: DNAHelixSceneProps) {
  const { camera, pointer } = useThree();
  const { helixZoomedStation, projectProgress } = useProjectScene();
  const hoveredStationRef = useRef(-1);

  const stationPositions = useMemo(() => {
    const omega = HELIX_PARAMS.turns * 2 * Math.PI;
    return Array.from({ length: HELIX_PARAMS.stationCount }, (_, index) => {
      const stationT = (index + 0.5) / HELIX_PARAMS.stationCount;
      const stationAngle = stationT * omega;
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

    const angle = getScrollAngle(projectProgress, state.clock.elapsedTime);
    const focusY = getFocusY(projectProgress);
    let closestStation = -1;
    let closestDistance = Infinity;

    for (let index = 0; index < stationPositions.length; index += 1) {
      const projected = stationPositions[index].clone();
      const rotatedX = projected.x * Math.cos(angle) - projected.z * Math.sin(angle);
      const rotatedZ = projected.x * Math.sin(angle) + projected.z * Math.cos(angle);
      projected.set(rotatedX, projected.y - focusY + (0.5 - projectProgress) * 1.2, rotatedZ);
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
      />
      <DNAStationLabels visible={visible} />
      <DNAHelixCamera visible={visible} />
    </group>
  );
}
