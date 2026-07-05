import * as THREE from "three";

export const HELIX_PARAMS = {
  height: 118, // total helix height
  turns: 12.4, // number of full helix turns
  radius: 3.05, // helix strand radius
  particleSpacing: 0.023, // distance between particles along strand
  basePairSpacing: 2.5, // vertical distance between base pairs (stations)
  stationCount: 10,
  stationSlots: 12,
  cameraRadius: 8.15, // fixed camera distance
  particlesPerBasePair: 480, // particles forming each station rung
  fineBasePairCount: 232,
  fineParticlesPerBasePair: 52,
  ambientParticleCount: 230, // floating ambient particles
  scatterRadius: 0.24, // pointer scatter radius in screen space
  scatterStrength: 1.55, // pointer scatter strength
} as const;

const STATION_COLORS = [
  new THREE.Color("#49c5b6"),
  new THREE.Color("#ff9398"),
  new THREE.Color("#8b5cf6"),
  new THREE.Color("#00d4ff"),
  new THREE.Color("#ff6b6b"),
  new THREE.Color("#a78bfa"),
  new THREE.Color("#ffca7a"),
  new THREE.Color("#7dd3fc"),
  new THREE.Color("#f0abfc"),
  new THREE.Color("#86efac"),
];

function localDensity(t: number, salt: number) {
  const broad = Math.sin(t * 32.7 + salt) * 0.5 + 0.5;
  const fine = Math.sin(t * 91.3 + salt * 1.7) * 0.5 + 0.5;
  const pocket = Math.sin(t * 19.3 + salt * 2.1) * Math.sin(t * 47.5 + salt * 0.73);
  return THREE.MathUtils.clamp(0.69 + broad * 0.13 + fine * 0.06 - Math.max(0, pocket) * 0.15, 0.58, 0.9);
}

interface DNABuffers {
  positions: Float32Array;
  initialPositions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  basePairIndices: Float32Array;
  particleTypes: Float32Array; // 0 = backbone, 1 = station rung, 2 = decoration, 3 = ambient, 4 = fine rung
  randomSeeds: Float32Array;
}

/**
 * Generate all buffer data for the DNA helix particle system.
 */
export function generateDNAHelixBuffers(): DNABuffers {
  const positions: number[] = [];
  const initialPositions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const basePairIndices: number[] = [];
  const particleTypes: number[] = [];
  const randomSeeds: number[] = [];

  const halfHeight = HELIX_PARAMS.height / 2;
  const omega = HELIX_PARAMS.turns * 2 * Math.PI;
  const step = HELIX_PARAMS.particleSpacing;
  const totalSteps = Math.floor(HELIX_PARAMS.height / step);

  const pushParticle = (
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
    size: number,
    basePairIndex: number,
    particleType: number
  ) => {
    const seed = Math.random();
    const cloudAngle = seed * Math.PI * 2;
    const cloudRadius = 2.2 + Math.random() * 7.8;
    const cloudHeight = (Math.random() - 0.5) * 19;
    const cloudDepth = (Math.random() - 0.5) * 6.4;

    positions.push(x, y, z);
    initialPositions.push(
      Math.cos(cloudAngle) * cloudRadius,
      cloudHeight,
      Math.sin(cloudAngle) * cloudRadius + cloudDepth
    );
    colors.push(color.r, color.g, color.b);
    sizes.push(size);
    basePairIndices.push(basePairIndex);
    particleTypes.push(particleType);
    randomSeeds.push(seed);
  };

  // ─── Backbone particles (type 0) ────────────────────────────────
  const tubeOffsets = [-0.105, -0.035, 0.035, 0.105];
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps; // 0..1
    const y = halfHeight - t * HELIX_PARAMS.height;
    const angle = t * omega;

    for (let strand = 0; strand < 2; strand++) {
      const strandAngle = angle + strand * Math.PI;

      for (const offset of tubeOffsets) {
        if (Math.random() > localDensity(t, strand * 2.3 + offset * 19.7)) continue;

        const radius = HELIX_PARAMS.radius + offset;
        const jitter = (Math.random() - 0.5) * 0.045;
        const x = radius * Math.cos(strandAngle) + Math.cos(strandAngle + Math.PI / 2) * jitter;
        const z = radius * Math.sin(strandAngle) + Math.sin(strandAngle + Math.PI / 2) * jitter;

        // Color gradient: teal at top, coral at bottom
        const colorT = 1 - t;
        const c = new THREE.Color().lerpColors(
          new THREE.Color("#ff9398"),
          new THREE.Color("#49c5b6"),
          colorT
        );
        pushParticle(x, y + (Math.random() - 0.5) * 0.04, z, c, 0.2 + Math.random() * 0.34, -1, 0);
      }
    }
  }

  // ─── Fine filler base pair rungs (type 4) ─────────────────────
  for (let r = 0; r < HELIX_PARAMS.fineBasePairCount; r++) {
    const fineT = (r + 0.5 + (Math.random() - 0.5) * 0.32) / HELIX_PARAMS.fineBasePairCount;
    const rungDensity = localDensity(fineT, 5.9);
    const y = halfHeight - fineT * HELIX_PARAMS.height;
    const angle = fineT * omega;
    const x1 = HELIX_PARAMS.radius * Math.cos(angle);
    const z1 = HELIX_PARAMS.radius * Math.sin(angle);
    const x2 = HELIX_PARAMS.radius * Math.cos(angle + Math.PI);
    const z2 = HELIX_PARAMS.radius * Math.sin(angle + Math.PI);
    const stationBlend = new THREE.Color().lerpColors(
      new THREE.Color("#bffbf5"),
      new THREE.Color("#ffd4d6"),
      fineT
    );

    for (let p = 0; p < HELIX_PARAMS.fineParticlesPerBasePair; p++) {
      if (Math.random() > rungDensity) continue;

      const pT = p / Math.max(1, HELIX_PARAMS.fineParticlesPerBasePair - 1);
      const widthJitter = (Math.random() - 0.5) * 0.065;
      const px = x1 + (x2 - x1) * pT + Math.cos(angle + Math.PI / 2) * widthJitter;
      const pz = z1 + (z2 - z1) * pT + Math.sin(angle + Math.PI / 2) * widthJitter;
      const py = y + (Math.random() - 0.5) * 0.12;

      pushParticle(px, py, pz, stationBlend, 0.44 + Math.random() * 0.34, -1, 4);
    }
  }

  // ─── Station base pair rung particles (type 1) ─────────────────
  for (let s = 0; s < HELIX_PARAMS.stationCount; s++) {
    const stationY = halfHeight - (s + 1.5) * (HELIX_PARAMS.height / HELIX_PARAMS.stationSlots);
    const stationT = (s + 1.5) / HELIX_PARAMS.stationSlots;
    const stationAngle = stationT * omega;
    const stationColor = STATION_COLORS[s % STATION_COLORS.length];

    const bx = HELIX_PARAMS.radius * Math.cos(stationAngle);
    const bz = HELIX_PARAMS.radius * Math.sin(stationAngle);
    const ox = HELIX_PARAMS.radius * Math.cos(stationAngle + Math.PI);
    const oz = HELIX_PARAMS.radius * Math.sin(stationAngle + Math.PI);

    for (let p = 0; p < HELIX_PARAMS.particlesPerBasePair; p++) {
      const pT = p / Math.max(1, HELIX_PARAMS.particlesPerBasePair - 1);
      const widthJitter = (Math.random() - 0.5) * 0.24;
      const px = bx + (ox - bx) * pT + Math.cos(stationAngle + Math.PI / 2) * widthJitter;
      const pz = bz + (oz - bz) * pT + Math.sin(stationAngle + Math.PI / 2) * widthJitter;
      const py = stationY + (Math.random() - 0.5) * 0.26;

      // Blend between strand color and station color
      const rungColor = new THREE.Color().lerpColors(
        stationColor,
        new THREE.Color("#ffffff"),
        0.18
      );
      pushParticle(px, py, pz, rungColor, 0.22 + Math.random() * 0.3, s, 1);
    }

    // ─── Decoration particles orbiting station (type 2) ─────────
    const decorCount = 140;
    for (let d = 0; d < decorCount; d++) {
      const dAngle = Math.random() * Math.PI * 2;
      const dRadius = 0.3 + Math.random() * 0.8;
      const dx = dRadius * Math.cos(dAngle);
      const dz = dRadius * Math.sin(dAngle);
      const dy = stationY + (Math.random() - 0.5) * 1.0;

      const decorColor = stationColor.clone().multiplyScalar(1.3);
      pushParticle(dx, dy, dz, decorColor, 0.22 + Math.random() * 0.32, s, 2);
    }
  }

  // ─── Ambient floating particles (type 3) ──────────────────────
  for (let a = 0; a < HELIX_PARAMS.ambientParticleCount; a++) {
    const ax = (Math.random() - 0.5) * 13;
    const ay = (Math.random() - 0.5) * (HELIX_PARAMS.height + 6);
    const az = (Math.random() - 0.5) * 13;

    const ambT = (ay + HELIX_PARAMS.height / 2) / HELIX_PARAMS.height;
    const ambColor = new THREE.Color().lerpColors(
      new THREE.Color("#1a1a3e"),
      new THREE.Color("#2d1b69"),
      Math.abs(ambT)
    );
    pushParticle(ax, ay, az, ambColor, 0.12 + Math.random() * 0.18, -1, 3);
  }

  return {
    positions: new Float32Array(positions),
    initialPositions: new Float32Array(initialPositions),
    colors: new Float32Array(colors),
    sizes: new Float32Array(sizes),
    basePairIndices: new Float32Array(basePairIndices),
    particleTypes: new Float32Array(particleTypes),
    randomSeeds: new Float32Array(randomSeeds),
  };
}
