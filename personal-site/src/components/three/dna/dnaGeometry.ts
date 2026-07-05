import * as THREE from "three";

export const HELIX_PARAMS = {
  height: 30, // total helix height
  turns: 3, // number of full helix turns
  radius: 1.5, // helix strand radius
  particleSpacing: 0.15, // distance between particles along strand
  basePairSpacing: 2.5, // vertical distance between base pairs (stations)
  stationCount: 6,
  cameraRadius: 8, // camera orbit radius
  particlesPerBasePair: 32, // particles forming each rung
  ambientParticleCount: 650, // floating ambient particles
  scatterRadius: 2.5, // mouse scatter radius
  scatterStrength: 0.28, // mouse scatter strength
} as const;

const STATION_COLORS = [
  new THREE.Color("#49c5b6"),
  new THREE.Color("#ff9398"),
  new THREE.Color("#8b5cf6"),
  new THREE.Color("#00d4ff"),
  new THREE.Color("#ff6b6b"),
  new THREE.Color("#a78bfa"),
];

interface DNABuffers {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  basePairIndices: Float32Array;
  particleTypes: Float32Array; // 0 = backbone, 1 = base-pair rung, 2 = decoration, 3 = ambient
  randomSeeds: Float32Array;
}

/**
 * Generate all buffer data for the DNA helix particle system.
 */
export function generateDNAHelixBuffers(): DNABuffers {
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const basePairIndices: number[] = [];
  const particleTypes: number[] = [];
  const randomSeeds: number[] = [];

  const halfHeight = HELIX_PARAMS.height / 2;
  const omega = HELIX_PARAMS.turns * 2 * Math.PI;
  const step = HELIX_PARAMS.particleSpacing;
  const totalSteps = Math.floor(HELIX_PARAMS.height / step);

  // ─── Backbone particles (type 0) ────────────────────────────────
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps; // 0..1
    const y = halfHeight - t * HELIX_PARAMS.height;
    const angle = t * omega;

    for (let strand = 0; strand < 2; strand++) {
      const strandAngle = angle + strand * Math.PI;
      const x = HELIX_PARAMS.radius * Math.cos(strandAngle);
      const z = HELIX_PARAMS.radius * Math.sin(strandAngle);

      positions.push(x, y, z);

      // Color gradient: teal at top, coral at bottom
      const colorT = 1 - t;
      const c = new THREE.Color().lerpColors(
        new THREE.Color("#ff9398"),
        new THREE.Color("#49c5b6"),
        colorT
      );
      colors.push(c.r, c.g, c.b);

      sizes.push(0.6 + Math.random() * 0.8);
      basePairIndices.push(-1);
      particleTypes.push(0);
      randomSeeds.push(Math.random());
    }
  }

  // ─── Base pair rung particles (type 1) ────────────────────────
  for (let s = 0; s < HELIX_PARAMS.stationCount; s++) {
    const stationY = halfHeight - (s + 0.5) * (HELIX_PARAMS.height / HELIX_PARAMS.stationCount);
    const stationT = (s + 0.5) / HELIX_PARAMS.stationCount;
    const stationAngle = stationT * omega;
    const stationColor = STATION_COLORS[s % STATION_COLORS.length];

    // Two backbone points at this Y
    for (let strand = 0; strand < 2; strand++) {
      const strandAngle = stationAngle + strand * Math.PI;
      const bx = HELIX_PARAMS.radius * Math.cos(strandAngle);
      const bz = HELIX_PARAMS.radius * Math.sin(strandAngle);

      // Fill rung between the two backbone positions
      const otherStrandAngle = stationAngle + (1 - strand) * Math.PI;
      const ox = HELIX_PARAMS.radius * Math.cos(otherStrandAngle);
      const oz = HELIX_PARAMS.radius * Math.sin(otherStrandAngle);

      for (let p = 0; p < HELIX_PARAMS.particlesPerBasePair; p++) {
        const pT = p / HELIX_PARAMS.particlesPerBasePair;
        const px = bx + (ox - bx) * pT;
        const pz = bz + (oz - bz) * pT;
        const py = stationY + (Math.random() - 0.5) * 0.2;

        positions.push(px, py, pz);

        // Blend between strand color and station color
        const rungColor = new THREE.Color().lerpColors(
          new THREE.Color("#ffffff"),
          stationColor,
          0.6
        );
        colors.push(rungColor.r, rungColor.g, rungColor.b);

        sizes.push(0.4 + Math.random() * 0.6);
        basePairIndices.push(s);
        particleTypes.push(1);
        randomSeeds.push(Math.random());
      }
    }

    // ─── Decoration particles orbiting station (type 2) ─────────
    const decorCount = 36;
    for (let d = 0; d < decorCount; d++) {
      const dAngle = Math.random() * Math.PI * 2;
      const dRadius = 0.3 + Math.random() * 0.8;
      const dx = dRadius * Math.cos(dAngle);
      const dz = dRadius * Math.sin(dAngle);
      const dy = stationY + (Math.random() - 0.5) * 1.0;

      positions.push(dx, dy, dz);

      const decorColor = stationColor.clone().multiplyScalar(1.3);
      colors.push(decorColor.r, decorColor.g, decorColor.b);

      sizes.push(0.3 + Math.random() * 0.5);
      basePairIndices.push(s);
      particleTypes.push(2);
      randomSeeds.push(Math.random());
    }
  }

  // ─── Ambient floating particles (type 3) ──────────────────────
  for (let a = 0; a < HELIX_PARAMS.ambientParticleCount; a++) {
    const ax = (Math.random() - 0.5) * 13;
    const ay = (Math.random() - 0.5) * (HELIX_PARAMS.height + 6);
    const az = (Math.random() - 0.5) * 13;

    positions.push(ax, ay, az);

    const ambT = (ay + HELIX_PARAMS.height / 2) / HELIX_PARAMS.height;
    const ambColor = new THREE.Color().lerpColors(
      new THREE.Color("#1a1a3e"),
      new THREE.Color("#2d1b69"),
      Math.abs(ambT)
    );
    colors.push(ambColor.r, ambColor.g, ambColor.b);

    sizes.push(0.12 + Math.random() * 0.18);
    basePairIndices.push(-1);
    particleTypes.push(3);
    randomSeeds.push(Math.random());
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    sizes: new Float32Array(sizes),
    basePairIndices: new Float32Array(basePairIndices),
    particleTypes: new Float32Array(particleTypes),
    randomSeeds: new Float32Array(randomSeeds),
  };
}
