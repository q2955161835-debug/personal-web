export const dnaVertexShader = /* glsl */ `
uniform float uTime;
uniform vec3 uMouseWorld;
uniform float uMouseActive;
uniform float uScrollProgress;
uniform float uHoveredStation;
uniform float uZoomedStation;
uniform float uZoomProgress;
uniform float uScatterRadius;
uniform float uScatterStrength;

attribute vec3 aColor;
attribute float aSize;
attribute float aBasePairIndex;
attribute float aParticleType;
attribute float aRandomSeed;

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
  vColor = aColor;
  vAlpha = 1.0;
  vGlow = 0.0;

  vec3 pos = position;

  // --- Global slow Y-axis rotation (0.08 rad/s) ---
  float globalAngle = uTime * 0.08;
  float cosA = cos(globalAngle);
  float sinA = sin(globalAngle);
  pos = vec3(
    pos.x * cosA - pos.z * sinA,
    pos.y,
    pos.x * sinA + pos.z * cosA
  );

  // --- Organic noise displacement ---
  float noiseT = uTime * 0.3;
  float noiseAmp = 0.08;
  pos.x += sin(pos.y * 1.5 + noiseT + aRandomSeed * 6.2831) * noiseAmp;
  pos.y += cos(pos.x * 1.2 + noiseT * 0.8 + aRandomSeed * 3.1415) * noiseAmp * 0.6;
  pos.z += sin(pos.z * 1.3 + noiseT * 1.1 + aRandomSeed * 4.7123) * noiseAmp * 0.8;

  // --- Mouse scatter (world-space repulsion) ---
  if (uMouseActive > 0.5) {
    vec3 toParticle = pos - uMouseWorld;
    float distToMouse = length(toParticle);
    float falloff = 1.0 - smoothstep(0.0, uScatterRadius, distToMouse);
    if (falloff > 0.01) {
      vec3 repelDir = normalize(toParticle);
      // Spring oscillation effect
      float spring = sin(uTime * 4.0 + aRandomSeed * 6.2831) * 0.3 + 1.0;
      pos += repelDir * falloff * uScatterStrength * spring;
    }
  }

  // --- Base pair highlight ---
  // aBasePairIndex is -1 for non-station, 0-5 for station particles
  bool isHoveredMatch = aBasePairIndex >= 0.0 && abs(aBasePairIndex - uHoveredStation) < 0.5;
  bool isZoomedMatch = aBasePairIndex >= 0.0 && abs(aBasePairIndex - uZoomedStation) < 0.5;

  if (isHoveredMatch) {
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    vGlow += pulse * 0.8;
    vAlpha = 1.0;
  }

  if (isZoomedMatch) {
    float pulse = sin(uTime * 2.5 + 1.0) * 0.5 + 0.5;
    vGlow += pulse * 1.0;
    vAlpha = 1.0;
  }

  // --- Zoom scatter ---
  // When zooming into a station, non-zoomed particles expand outward and fade
  if (uZoomProgress > 0.01) {
    bool isZoomedTarget = aBasePairIndex >= 0.0 && abs(aBasePairIndex - uZoomedStation) < 0.5;
    if (!isZoomedTarget) {
      // Expand outward from center
      vec3 outwardDir = normalize(pos);
      float expandFactor = uZoomProgress * 2.0;
      pos += outwardDir * expandFactor;
      // Fade non-target particles
      vAlpha *= (1.0 - uZoomProgress * 0.85);
    }
  }

  // --- Scroll-based vertical offset ---
  pos.y -= uScrollProgress * 2.0;

  // --- Compute gl_PointSize based on distance from camera ---
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float distCam = -mvPosition.z;

  float baseSize = aSize * (150.0 / max(distCam, 0.1));

  // Particle type size modifiers
  if (aParticleType > 1.5 && aParticleType < 2.5) {
    // Decoration particles: larger
    baseSize *= 1.8;
  } else if (aParticleType > 2.5) {
    // Ambient particles: smaller
    baseSize *= 0.5;
  }

  gl_PointSize = clamp(baseSize, 0.5, 48.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;
