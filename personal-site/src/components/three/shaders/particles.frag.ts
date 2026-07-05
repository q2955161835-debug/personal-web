export const fragmentShader = /* glsl */ `
uniform float uOpacity;

varying vec3 vColor;

void main() {
  // --- Circular soft particles: discard corners with smoothstep ---
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // Smooth circular falloff
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Discard fully transparent fragments for performance
  float finalAlpha = alpha * uOpacity;

  if (finalAlpha < 0.01) {
    discard;
  }

  // --- Subtle glow effect ---
  float glow = exp(-dist * 6.0) * 0.4;
  vec3 finalColor = vColor + glow;

  // --- Premultiplied alpha for bloom compatibility ---
  gl_FragColor = vec4(finalColor * finalAlpha, finalAlpha);
}
`;
