export const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uScrollProgress;

attribute vec3 aColor;
attribute float aSize;

varying vec3 vColor;

void main() {
  vColor = aColor;

  vec3 pos = position;

  // --- Time-based sine/cosine displacement ---
  float waveX = sin(pos.x * 1.2 + uTime * 0.4) * cos(pos.z * 0.8 + uTime * 0.3) * 0.25;
  float waveY = cos(pos.y * 1.0 + uTime * 0.35) * sin(pos.x * 0.9 + uTime * 0.25) * 0.2;
  float waveZ = sin(pos.z * 1.1 + uTime * 0.45) * cos(pos.y * 0.7 + uTime * 0.2) * 0.15;

  pos.x += waveX;
  pos.y += waveY;
  pos.z += waveZ;

  // --- Mouse attraction / repulsion ---
  vec2 mouseNDC = (uMouse / uResolution) * 2.0 - 1.0;
  mouseNDC.y = -mouseNDC.y; // flip Y to match NDC

  // Project particle position to approximate screen space for comparison
  vec4 projected = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vec2 screenPos = projected.xy / projected.w;

  vec2 toMouse = mouseNDC - screenPos;
  float mouseDist = length(toMouse);

  // Inverse-distance attraction: closer particles move more
  float influence = smoothstep(1.2, 0.0, mouseDist) * 0.8;

  // Push particles toward the mouse in world-space approximation
  pos.x += toMouse.x * influence * 0.6;
  pos.y += toMouse.y * influence * 0.6;

  // --- Scroll progress: spread particles apart as user scrolls ---
  float spreadFactor = 1.0 + uScrollProgress * 1.5;
  pos.xy *= spreadFactor;
  // Move particles slightly backward (into the screen) as user scrolls deeper
  pos.z -= uScrollProgress * 2.0;

  // --- Compute gl_PointSize based on distance from camera ---
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float distFromCamera = -mvPosition.z;
  gl_PointSize = aSize * (150.0 / max(distFromCamera, 0.1));
  gl_PointSize = clamp(gl_PointSize, 0.5, 32.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;
