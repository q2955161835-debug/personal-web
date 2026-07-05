export const dnaVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uMouseActive;
uniform float uScrollProgress;
uniform float uFocusY;
uniform float uActiveStation;
uniform float uHoveredStation;
uniform float uZoomedStation;
uniform float uZoomProgress;
uniform float uScatterRadius;
uniform float uScatterStrength;
uniform float uSceneOpacity;

attribute vec3 aInitialPosition;
attribute vec3 aColor;
attribute float aSize;
attribute float aBasePairIndex;
attribute float aParticleType;
attribute float aRandomSeed;

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vColor = aColor;
  vAlpha = 1.0;
  vGlow = 0.0;

  vec3 dnaPos = position;

  float stationMask = step(0.0, aBasePairIndex);
  float activeDistance = abs(aBasePairIndex - uActiveStation);
  float activeWeight = stationMask * (1.0 - smoothstep(0.0, 1.0, activeDistance));
  float hoveredWeight = stationMask * (1.0 - smoothstep(0.0, 0.7, abs(aBasePairIndex - uHoveredStation)));
  float zoomWeight = stationMask * (1.0 - smoothstep(0.0, 0.55, abs(aBasePairIndex - uZoomedStation))) * uZoomProgress;
  float keyWeight = max(activeWeight, max(hoveredWeight, zoomWeight));

  // Scale the active DNA key itself. Camera angle stays fixed.
  float keyScale = 1.0 + activeWeight * 0.55 + hoveredWeight * 0.45 + zoomWeight * 2.45;
  if (aParticleType > 0.5 && aParticleType < 2.5) {
    dnaPos.xz *= keyScale;
    dnaPos.y += zoomWeight * 0.18 * sin(aRandomSeed * 6.2831);
  }

  // Scroll drives object rotation and a vertical journey through the DNA.
  float scrollAngle = uScrollProgress * 4.8 + uTime * 0.045;
  dnaPos.xz = rotate2d(scrollAngle) * dnaPos.xz;
  dnaPos.y -= uFocusY;
  dnaPos.y += (0.5 - uScrollProgress) * 1.2;

  // Small breathing motion once the helix is formed.
  float noiseT = uTime * 0.32;
  float noiseAmp = 0.045 + keyWeight * 0.035;
  dnaPos.x += sin(dnaPos.y * 1.2 + noiseT + aRandomSeed * 6.2831) * noiseAmp;
  dnaPos.z += cos(dnaPos.y * 1.4 + noiseT * 1.2 + aRandomSeed * 4.7123) * noiseAmp;

  // Scene opacity drives formation so the first project key is already on the DNA.
  float gather = smoothstep(0.0, 0.86, uSceneOpacity);
  vec3 pos = mix(aInitialPosition, dnaPos, gather);

  vec4 probeMv = modelViewMatrix * vec4(pos, 1.0);
  vec4 probeClip = projectionMatrix * probeMv;
  vec2 screenPos = probeClip.xy / max(probeClip.w, 0.0001);

  // Pointer scatter uses screen-space distance so it works with a fixed camera.
  if (uMouseActive > 0.5 && gather > 0.2) {
    float pointerDist = distance(screenPos, uPointer);
    float falloff = 1.0 - smoothstep(0.0, uScatterRadius, pointerDist);
    if (falloff > 0.001) {
      vec3 scatterDir = normalize(vec3(
        sin(aRandomSeed * 17.31),
        cos(aRandomSeed * 23.17),
        sin(aRandomSeed * 31.11)
      ));
      float spring = 0.86 + 0.18 * sin(uTime * 6.0 + aRandomSeed * 6.2831);
      pos += scatterDir * falloff * uScatterStrength * spring;
      vGlow += falloff * 0.55;
    }
  }

  if (keyWeight > 0.01) {
    float pulse = sin(uTime * 3.0 + aRandomSeed * 2.0) * 0.5 + 0.5;
    vGlow += keyWeight * (0.2 + pulse * 0.16);
  }

  if (uZoomProgress > 0.01) {
    bool isZoomTarget = stationMask > 0.5 && abs(aBasePairIndex - uZoomedStation) < 0.55;
    if (!isZoomTarget) {
      vec3 outwardDir = normalize(vec3(pos.x, pos.y * 0.25, pos.z));
      pos += outwardDir * uZoomProgress * 1.75;
      vAlpha *= 1.0 - uZoomProgress * 0.78;
    }
  }

  if (aParticleType > 0.5 && aParticleType < 1.5) {
    vAlpha *= 0.62;
  } else if (aParticleType > 1.5 && aParticleType < 2.5) {
    vAlpha *= 0.76;
  } else if (aParticleType > 2.5) {
    vAlpha *= 0.14;
  }

  vAlpha *= uSceneOpacity;
  vAlpha *= 0.12 + gather * 0.88;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float distCam = -mvPosition.z;
  float baseSize = aSize * (150.0 / max(distCam, 0.1));

  if (aParticleType > 0.5 && aParticleType < 1.5) {
    baseSize *= 0.92 + keyWeight * 1.1;
  } else if (aParticleType > 1.5 && aParticleType < 2.5) {
    baseSize *= 1.25 + keyWeight * 0.95;
  } else if (aParticleType > 2.5) {
    baseSize *= 0.36;
  }

  gl_PointSize = clamp(baseSize, 0.35, 42.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;
