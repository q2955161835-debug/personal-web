export const carouselVertexShader = /* glsl */ `
uniform float uTime;
uniform float uExpandRadius;
uniform float uOpacity;

attribute vec3 aColor;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;

  // --- Current position (Fibonacci-sphere points, radius ~2) ---
  vec3 pos = position;

  // Expand radius when detail view is active
  float currentRadius = length(pos);
  float targetRadius = uExpandRadius;
  pos = normalize(pos) * mix(currentRadius, targetRadius, uExpandRadius > 2.1 ? 1.0 : 0.0);

  // --- Slow global rotation ---
  float rotAngle = uTime * 0.1;
  float cosR = cos(rotAngle);
  float sinR = sin(rotAngle);
  vec3 rotated = vec3(
    pos.x * cosR - pos.z * sinR,
    pos.y,
    pos.x * sinR + pos.z * cosR
  );
  pos = rotated;

  // --- Noise-like displacement using layered sine waves ---
  float noise = sin(pos.x * 3.0 + uTime * 0.5) * cos(pos.y * 2.5 + uTime * 0.3) * sin(pos.z * 2.8 + uTime * 0.4);
  pos += normalize(pos) * noise * 0.15;

  // --- Compute gl_PointSize ---
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float distFromCamera = -mvPosition.z;
  gl_PointSize = aSize * (120.0 / max(distFromCamera, 0.1));
  gl_PointSize = clamp(gl_PointSize, 0.5, 24.0);

  // --- Opacity reduces when expanded ---
  vAlpha = uOpacity;

  gl_Position = projectionMatrix * mvPosition;
}
`;
