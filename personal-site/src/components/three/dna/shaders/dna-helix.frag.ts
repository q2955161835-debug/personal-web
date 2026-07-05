export const dnaFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // Circular soft particles with smooth falloff
  float alpha = 1.0 - smoothstep(0.25, 0.5, dist);
  float finalAlpha = alpha * vAlpha;

  if (finalAlpha < 0.01) {
    discard;
  }

  // Glow effect (stronger for highlighted particles)
  float glow = exp(-dist * 5.0) * (0.3 + vGlow * 0.7);
  vec3 finalColor = vColor + glow;

  gl_FragColor = vec4(finalColor * finalAlpha, finalAlpha);
}
`;
