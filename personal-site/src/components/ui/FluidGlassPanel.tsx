"use client";

import type { CSSProperties, MouseEventHandler, PointerEvent, ReactNode } from "react";
import { memo, useCallback, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";

type FluidGlassVariant = "panel" | "bar" | "chip" | "detail";

interface FluidGlassBaseProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: string;
  variant?: FluidGlassVariant;
  intensity?: number;
}

interface FluidGlassButtonProps extends FluidGlassBaseProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  disabled?: boolean;
}

const FLOATING_ORBS = Array.from({ length: 9 }, (_, index) => ({
  x: ((index * 37) % 100) / 50 - 1,
  y: ((index * 53) % 100) / 50 - 1,
  z: -0.45 - (index % 4) * 0.08,
  scale: 0.1 + (index % 5) * 0.035,
  phase: index * 0.74,
}));

function applyFluidTilt(element: HTMLElement | null, event: { clientX: number; clientY: number }, intensity: number) {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const nx = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  const falloff = Math.min(1, Math.sqrt(nx * nx + ny * ny));

  element.style.setProperty("--fluid-tilt-x", `${(-ny * intensity * 0.32).toFixed(3)}deg`);
  element.style.setProperty("--fluid-tilt-y", `${(nx * intensity * 0.38).toFixed(3)}deg`);
  element.style.setProperty("--fluid-glare-x", `${((nx + 1) * 50).toFixed(2)}%`);
  element.style.setProperty("--fluid-glare-y", `${((ny + 1) * 50).toFixed(2)}%`);
  element.style.setProperty("--fluid-falloff", falloff.toFixed(3));
}

function resetFluidTilt(element: HTMLElement | null) {
  if (!element) return;

  element.style.setProperty("--fluid-tilt-x", "0deg");
  element.style.setProperty("--fluid-tilt-y", "0deg");
  element.style.setProperty("--fluid-glare-x", "50%");
  element.style.setProperty("--fluid-glare-y", "50%");
  element.style.setProperty("--fluid-falloff", "0");
}

function hexToThreeColor(hex: string) {
  return new THREE.Color(hex);
}

function getVariantSize(variant: FluidGlassVariant) {
  if (variant === "bar") return [1.0, 4.9, 0.18] as [number, number, number];
  if (variant === "chip") return [2.4, 0.8, 0.12] as [number, number, number];
  if (variant === "detail") return [5.8, 3.3, 0.2] as [number, number, number];
  return [5.2, 1.72, 0.16] as [number, number, number];
}

const FluidGlassScene = memo(function FluidGlassScene({
  color,
  variant,
  intensity,
}: {
  color: string;
  variant: FluidGlassVariant;
  intensity: number;
}) {
  const glassRef = useRef<THREE.Mesh>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const accent = useMemo(() => hexToThreeColor(color), [color]);
  const size = getVariantSize(variant);

  useFrame((state, delta) => {
    const glass = glassRef.current;
    const field = fieldRef.current;
    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -1, 1);

    if (glass) {
      glass.rotation.x = THREE.MathUtils.lerp(glass.rotation.x, -pointerY * intensity * 0.018, 1 - Math.exp(-delta * 7));
      glass.rotation.y = THREE.MathUtils.lerp(glass.rotation.y, pointerX * intensity * 0.022, 1 - Math.exp(-delta * 7));
      glass.rotation.z = THREE.MathUtils.lerp(glass.rotation.z, pointerX * pointerY * 0.025, 1 - Math.exp(-delta * 5));
      easing.damp3(glass.position, [pointerX * 0.05, pointerY * 0.035, 0.04], 0.18, delta);
    }

    if (field) {
      field.rotation.z += delta * 0.04;
      field.position.x = THREE.MathUtils.lerp(field.position.x, -pointerX * 0.14, 1 - Math.exp(-delta * 3.6));
      field.position.y = THREE.MathUtils.lerp(field.position.y, -pointerY * 0.1, 1 - Math.exp(-delta * 3.6));
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <group ref={fieldRef} position={[0, 0, -0.55]}>
        <mesh position={[0, 0, -0.22]}>
          <planeGeometry args={[7, 5]} />
          <meshBasicMaterial
            transparent
            opacity={0.42}
            color={accent}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {FLOATING_ORBS.map((orb, index) => (
          <mesh
            key={index}
            position={[
              orb.x * (variant === "bar" ? 0.34 : 2.3),
              orb.y * (variant === "bar" ? 2.0 : 0.86),
              orb.z,
            ]}
            scale={orb.scale * (variant === "bar" ? 1.4 : 1)}
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial
              transparent
              opacity={0.22}
              color={index % 2 === 0 ? accent : new THREE.Color("#ffffff")}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <RoundedBox ref={glassRef} args={size} radius={variant === "bar" ? 0.12 : 0.16} smoothness={12}>
        <MeshTransmissionMaterial
          transmission={1}
          roughness={0.04}
          thickness={variant === "bar" ? 1.2 : 2.4}
          ior={1.18}
          chromaticAberration={0.08}
          anisotropy={0.12}
          distortion={0.16}
          distortionScale={0.18}
          temporalDistortion={0.06}
          color="#ffffff"
          attenuationColor={color}
          attenuationDistance={variant === "bar" ? 0.62 : 0.44}
          samples={8}
          resolution={512}
        />
      </RoundedBox>
    </>
  );
});

function FluidGlassCanvas({
  color,
  variant,
  intensity,
}: {
  color: string;
  variant: FluidGlassVariant;
  intensity: number;
}) {
  if (variant === "bar" || variant === "chip") {
    return (
      <span className="fluid-glass-canvas fluid-glass-css-field" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    );
  }

  return (
    <span className="fluid-glass-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 23 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <FluidGlassScene color={color} variant={variant} intensity={intensity} />
      </Canvas>
    </span>
  );
}

export function FluidGlassPanel({
  children,
  className = "",
  style,
  color = "#49c5b6",
  variant = "panel",
  intensity = 16,
}: FluidGlassBaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => applyFluidTilt(panelRef.current, event, intensity),
    [intensity]
  );
  const handlePointerLeave = useCallback(() => resetFluidTilt(panelRef.current), []);

  return (
    <div
      ref={panelRef}
      className={`fluid-glass-shell cursor-target ${className}`}
      data-fluid-variant={variant}
      style={{ "--fluid-glass-color": color, ...style } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <FluidGlassCanvas color={color} variant={variant} intensity={intensity} />
      <div className="fluid-glass-content">{children}</div>
    </div>
  );
}

export function FluidGlassButton({
  children,
  className = "",
  style,
  color = "#49c5b6",
  variant = "panel",
  intensity = 16,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
}: FluidGlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => applyFluidTilt(buttonRef.current, event, intensity),
    [intensity]
  );
  const handlePointerLeave = useCallback(() => resetFluidTilt(buttonRef.current), []);

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`fluid-glass-shell cursor-target disabled:pointer-events-none disabled:opacity-45 ${className}`}
      data-fluid-variant={variant}
      style={{ "--fluid-glass-color": color, ...style } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <FluidGlassCanvas color={color} variant={variant} intensity={intensity} />
      <span className="fluid-glass-content">{children}</span>
    </button>
  );
}
